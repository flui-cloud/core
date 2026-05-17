#!/usr/bin/env ts-node
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * End-to-end smoke-test for a .flui.yaml catalog manifest.
 *
 * Validates the manifest, upserts it in the catalog DB, installs it on a
 * real cluster, polls until RUNNING or FAILED, and on failure collects
 * crash-diagnoses + pod-debug output. Designed for both CI pipelines and
 * agentic workflows (Claude Code reads the --json output to decide whether
 * to fix the manifest and retry).
 *
 * Usage:
 *   pnpm run catalog:smoke-test <file.yaml> [options]
 *
 * Options:
 *   --cluster <id>    Target cluster UUID (or env FLUI_CLUSTER_ID)
 *   --token <token>   API bearer token (or env FLUI_API_KEY)
 *   --base-url <url>  API base URL (or env FLUI_API_URL, default http://localhost:3000/api/v1)
 *   --dry-run         Validate schema + preview only, do not install
 *   --cleanup         Uninstall after a successful smoke test (useful in CI)
 *   --timeout <ms>    Max polling duration in ms (default 900000 = 15 min)
 *   --json            Write machine-readable JSON result to stdout; logs go to stderr
 *
 * Exit codes:
 *   0  success (RUNNING reached, or dry-run passed)
 *   1  failure (FAILED status, validation error, network error)
 *   2  usage error (missing args)
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { randomBytes } from 'crypto';
import * as net from 'net';
import { spawn } from 'child_process';
import * as yaml from 'js-yaml';
import { ConfigStorage } from '../cli/src/lib/config-storage';
import { ProfileManager } from '../cli/src/lib/profile-manager';
import { CatalogSchemaValidatorService } from '../src/modules/catalog/services/catalog-schema-validator.service';
import { CatalogManifestLoaderService } from '../src/modules/catalog/services/catalog-manifest-loader.service';
import type {
  CatalogManifest,
  CatalogEnvVar,
  CatalogUserInputPrompt,
  CatalogSmokeTest,
} from '../src/modules/catalog/interfaces/catalog-manifest.interface';
import { CatalogAppType } from '../src/modules/catalog/enums/catalog-app-type.enum';

// ──────────────────────────────────────────────────────────────────────────────
// Terminal colours (mirrored from catalog-validate.ts)
// ──────────────────────────────────────────────────────────────────────────────
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface InstallResponse {
  id: string;
  slug: string;
  status: string;
  operationId?: string;
  applicationIds: string[];
  resolvedFqdn?: string;
  errorMessage?: string;
}

interface CrashDiagnosis {
  id: string;
  podName: string;
  containerName: string | null;
  category: string;
  severity: string;
  title: string;
  explanation: string;
  suggestedAction: { summary: string; steps?: string[] };
}

interface PodDebugInfo {
  podName: string;
  phase: string;
  containers?: Array<{ name: string; state: string; message?: string }>;
}

interface SmokeTestResult {
  file: string;
  slug: string;
  version: string;
  installId?: string;
  status: 'dry-run-ok' | 'RUNNING' | 'FAILED' | 'TIMEOUT' | 'ERROR' | 'SKIPPED';
  resolvedFqdn?: string;
  durationMs: number;
  smokeTestPassed?: boolean;
  smokeTestMessage?: string;
  endpointVerification?: EndpointVerifyResult[];
  diagnoses?: CrashDiagnosis[];
  pods?: PodDebugInfo[];
  error?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Arg parsing
// ──────────────────────────────────────────────────────────────────────────────

interface Args {
  file: string;
  clusterId: string;
  token: string;
  baseUrl: string;
  dryRun: boolean;
  cleanup: boolean;
  withEndpoint: boolean;
  timeoutMs: number;
  jsonOutput: boolean;
  resultsDir: string | null;
  depsMode: 'dedicated' | 'reuse-existing' | null;
  depsOverrides: Record<string, string>;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0].startsWith('--')) {
    err(`${YELLOW}usage:${RESET} catalog-smoke-test <file.yaml> [--cluster <id>] [--token <t>] [--base-url <url>] [--dry-run] [--cleanup] [--with-endpoint] [--timeout <ms>] [--json]`);
    process.exit(2);
  }

  const file = resolve(argv[0]);
  let clusterId = process.env.FLUI_CLUSTER_ID ?? '';
  const storage = new ConfigStorage(ProfileManager.getActiveProfile());
  let token = process.env.FLUI_API_KEY ?? storage.getApiKey() ?? '';
  let baseUrl = process.env.FLUI_API_URL ?? storage.getApiUrl();
  let dryRun = false;
  let cleanup = false;
  let withEndpoint = false;
  let timeoutMs = 900_000;
  let jsonOutput = false;
  let resultsDir: string | null = null;
  let depsMode: 'dedicated' | 'reuse-existing' | null = null;
  const depsOverrides: Record<string, string> = {};

  for (let i = 1; i < argv.length; i++) {
    switch (argv[i]) {
      case '--cluster':       clusterId = argv[++i]; break;
      case '--token':         token = argv[++i]; break;
      case '--base-url':      baseUrl = argv[++i]; break;
      case '--timeout':       timeoutMs = parseInt(argv[++i], 10); break;
      case '--dry-run':       dryRun = true; break;
      case '--cleanup':       cleanup = true; break;
      case '--with-endpoint': withEndpoint = true; break;
      case '--json':          jsonOutput = true; break;
      case '--results-dir':   resultsDir = argv[++i]; break;
      case '--deps-mode': {
        const v = argv[++i];
        if (v !== 'dedicated' && v !== 'reuse-existing') {
          err(`${RED}--deps-mode must be "dedicated" or "reuse-existing"${RESET}`);
          process.exit(2);
        }
        depsMode = v;
        break;
      }
      case '--deps': {
        const v = argv[++i];
        for (const pair of v.split(',')) {
          const [alias, applicationId] = pair.split('=');
          if (!alias || !applicationId) {
            err(`${RED}--deps value must be "alias=applicationId[,alias=applicationId...]"${RESET}`);
            process.exit(2);
          }
          depsOverrides[alias] = applicationId;
        }
        break;
      }
      default:
        err(`${RED}unknown option:${RESET} ${argv[i]}`);
        process.exit(2);
    }
  }

  if (!dryRun && !clusterId) {
    err(`${RED}error:${RESET} --cluster <id> required (or set FLUI_CLUSTER_ID)`);
    process.exit(2);
  }
  if (!dryRun && !token) {
    err(`${RED}error:${RESET} no token found — pass --token, set FLUI_API_KEY, or run 'flui auth:generate-api-key'`);
    process.exit(2);
  }

  return { file, clusterId, token, baseUrl, dryRun, cleanup, withEndpoint, timeoutMs, jsonOutput, resultsDir, depsMode, depsOverrides };
}

// ──────────────────────────────────────────────────────────────────────────────
// Logging helpers (always stderr so --json stdout stays clean)
// ──────────────────────────────────────────────────────────────────────────────

function log(msg: string): void {
  process.stderr.write(msg + '\n');
}

function err(msg: string): void {
  process.stderr.write(msg + '\n');
}

function phase(label: string, msg: string): void {
  log(`${CYAN}[${label}]${RESET} ${msg}`);
}

function ok(label: string, msg: string): void {
  log(`${GREEN}[${label}]${RESET} ${msg}`);
}

function fail(label: string, msg: string): void {
  log(`${RED}[${label}]${RESET} ${msg}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// HTTP helper (uses native fetch — requires Node 18+)
// ──────────────────────────────────────────────────────────────────────────────

async function apiCall<T>(
  method: string,
  path: string,
  token: string,
  baseUrl: string,
  body?: unknown,
): Promise<T> {
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text };
  }

  if (!res.ok) {
    const msg =
      (json as { message?: string })?.message ?? `HTTP ${res.status}`;
    throw new Error(`${method} ${url} → ${res.status}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
  }
  return json as T;
}

// ──────────────────────────────────────────────────────────────────────────────
// Auto-generate test values for valueFrom.userInput fields
// ──────────────────────────────────────────────────────────────────────────────

function collectUserInputVars(manifest: CatalogManifest): CatalogEnvVar[] {
  const spec = manifest.spec;
  let envVars: CatalogEnvVar[];
  if (spec.type === CatalogAppType.COMPOSED) {
    envVars = spec.components.flatMap((c) => c.env);
  } else {
    envVars = spec.env;
  }
  return envVars.filter(
    (e) => !!e.valueFrom && 'userInput' in e.valueFrom,
  );
}

function generateTestValue(name: string, prompt: CatalogUserInputPrompt): string {
  if (prompt.default !== undefined && prompt.default !== '') {
    return prompt.default;
  }

  const min = prompt.minLength ?? 0;

  if (prompt.sensitive || prompt.format === 'password') {
    const suffix = randomBytes(4).toString('hex');
    const candidate = `TestSmoke@${suffix}`;
    return candidate.length >= min ? candidate : candidate.padEnd(min, '0');
  }

  if (prompt.format === 'email') return 'smoke-test@flui.test';
  if (prompt.format === 'url') return 'https://smoke.test';

  const base = 'smoke-test';
  if (base.length >= min) return base;
  return base.padEnd(min, '0');
}

function buildAutoInputs(manifest: CatalogManifest): Record<string, string> {
  const inputs: Record<string, string> = {};
  for (const envVar of collectUserInputVars(manifest)) {
    const prompt = (envVar.valueFrom as { userInput: CatalogUserInputPrompt }).userInput;
    inputs[envVar.name] = generateTestValue(envVar.name, prompt);
  }
  return inputs;
}

// ──────────────────────────────────────────────────────────────────────────────
// Status polling
// ──────────────────────────────────────────────────────────────────────────────

const TERMINAL_STATUSES = new Set(['RUNNING', 'FAILED', 'UNINSTALLED']);
const POLL_INTERVAL_MS = 5_000;
const DIAG_INTERVAL_CYCLES = 3; // run diagnostics every 3 poll cycles (~15s)

// Pod container states that will never self-heal — fail fast after N consecutive checks
const FATAL_POD_REASONS = new Set([
  'ImagePullBackOff', 'ErrImagePull', 'InvalidImageName',
]);
const FATAL_CONSECUTIVE_THRESHOLD = 3;

// Crash diagnosis categories that are always fatal — abort immediately on first occurrence
const FATAL_DIAGNOSIS_CATEGORIES = new Set(['image_pull_error']);

async function fetchPods(
  appIds: string[],
  token: string,
  baseUrl: string,
): Promise<PodDebugInfo[]> {
  const pods: PodDebugInfo[] = [];
  for (const appId of appIds) {
    try {
      const res = await apiCall<PodDebugInfo[] | { pods?: PodDebugInfo[] }>(
        'GET', `/applications/${appId}/debug/pods`, token, baseUrl,
      );
      pods.push(...(Array.isArray(res) ? res : (res.pods ?? [])));
    } catch { /* non-fatal */ }
  }
  return pods;
}

async function fetchNewDiagnoses(
  appIds: string[],
  token: string,
  baseUrl: string,
  seenIds: Set<string>,
): Promise<CrashDiagnosis[]> {
  const fresh: CrashDiagnosis[] = [];
  for (const appId of appIds) {
    try {
      const res = await apiCall<{ data?: CrashDiagnosis[]; items?: CrashDiagnosis[] }>(
        'GET', `/applications/${appId}/crash-diagnoses?limit=20&offset=0`, token, baseUrl,
      );
      const items = res.data ?? res.items ?? (Array.isArray(res) ? (res as CrashDiagnosis[]) : []);
      for (const d of items) {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          fresh.push(d);
        }
      }
    } catch { /* non-fatal */ }
  }
  return fresh;
}

function detectFatalPodState(pods: PodDebugInfo[]): string | null {
  for (const pod of pods) {
    for (const c of pod.containers ?? []) {
      // API returns state as either a string or { waiting: { reason, message } }
      const stateRaw = c.state as unknown;
      if (typeof stateRaw === 'string') {
        if (FATAL_POD_REASONS.has(stateRaw)) return stateRaw;
      } else if (stateRaw && typeof stateRaw === 'object') {
        const waiting = (stateRaw as { waiting?: { reason?: string; message?: string } }).waiting;
        if (waiting?.reason && FATAL_POD_REASONS.has(waiting.reason)) return waiting.reason;
        if (waiting?.message) {
          for (const reason of FATAL_POD_REASONS) {
            if (waiting.message.includes(reason)) return reason;
          }
        }
      }
      if (c.message) {
        for (const reason of FATAL_POD_REASONS) {
          if (c.message.includes(reason)) return reason;
        }
      }
    }
  }
  return null;
}

async function pollInstall(
  installId: string,
  token: string,
  baseUrl: string,
  timeoutMs: number,
): Promise<InstallResponse> {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = '';
  let cycle = 0;
  let fatalConsecutive = 0;
  const seenDiagIds = new Set<string>();

  while (Date.now() < deadline) {
    const install = await apiCall<InstallResponse>(
      'GET', `/catalog/installs/${installId}`, token, baseUrl,
    );

    if (install.status !== lastStatus) {
      phase('POLLING', `status = ${BOLD}${install.status}${RESET}`);
      lastStatus = install.status;
    }

    if (TERMINAL_STATUSES.has(install.status)) {
      return install;
    }

    // Proactive diagnostics while still installing
    const appIds = install.applicationIds ?? [];
    if (appIds.length > 0) {
      // Always fetch pods every cycle
      const pods = await fetchPods(appIds, token, baseUrl);
      const fatalReason = detectFatalPodState(pods);

      if (fatalReason) {
        fatalConsecutive++;
        phase('POLLING', `${YELLOW}pod issue detected: ${fatalReason} (${fatalConsecutive}/${FATAL_CONSECUTIVE_THRESHOLD})${RESET}`);
        if (fatalConsecutive >= FATAL_CONSECUTIVE_THRESHOLD) {
          phase('POLLING', `${RED}fatal pod state "${fatalReason}" persists — aborting early${RESET}`);
          // Return the current install state so diagnostics are collected by caller
          return install;
        }
      } else {
        fatalConsecutive = 0;
      }

      // Fetch crash diagnoses every DIAG_INTERVAL_CYCLES cycles
      if (cycle % DIAG_INTERVAL_CYCLES === 0) {
        const newDiags = await fetchNewDiagnoses(appIds, token, baseUrl, seenDiagIds);
        for (const d of newDiags) {
          const col = d.severity === 'critical' ? RED : YELLOW;
          phase('DIAGNOSE', `${col}[${d.severity}] ${d.title}${RESET} — ${d.podName}`);
          if (FATAL_DIAGNOSIS_CATEGORIES.has(d.category)) {
            phase('POLLING', `${RED}fatal diagnosis "${d.category}" — aborting early${RESET}`);
            return install;
          }
        }
      }
    }

    cycle++;
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`timeout after ${timeoutMs}ms — last status: ${lastStatus}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Diagnostics
// ──────────────────────────────────────────────────────────────────────────────

async function collectDiagnoses(
  appIds: string[],
  token: string,
  baseUrl: string,
): Promise<{ diagnoses: CrashDiagnosis[]; pods: PodDebugInfo[] }> {
  const diagnoses: CrashDiagnosis[] = [];
  const pods: PodDebugInfo[] = [];

  for (const appId of appIds) {
    try {
      const res = await apiCall<{ data?: CrashDiagnosis[]; items?: CrashDiagnosis[] }>(
        'GET',
        `/applications/${appId}/crash-diagnoses?limit=20&offset=0`,
        token,
        baseUrl,
      );
      const items = res.data ?? res.items ?? (Array.isArray(res) ? (res as CrashDiagnosis[]) : []);
      diagnoses.push(...items);
    } catch (e) {
      err(`${DIM}  crash-diagnoses fetch failed for ${appId}: ${(e as Error).message}${RESET}`);
    }

    try {
      const res = await apiCall<PodDebugInfo[] | { pods?: PodDebugInfo[] }>(
        'GET',
        `/applications/${appId}/debug/pods`,
        token,
        baseUrl,
      );
      const items = Array.isArray(res) ? res : (res.pods ?? []);
      pods.push(...items);
    } catch (e) {
      err(`${DIM}  debug/pods fetch failed for ${appId}: ${(e as Error).message}${RESET}`);
    }
  }

  return { diagnoses, pods };
}

function printDiagnoses(diagnoses: CrashDiagnosis[]): void {
  if (diagnoses.length === 0) {
    fail('DIAGNOSE', 'no crash diagnoses recorded yet');
    return;
  }
  for (const d of diagnoses) {
    fail('DIAGNOSE', `${BOLD}[${d.severity}] ${d.title}${RESET}`);
    log(`  pod: ${d.podName}${d.containerName ? ` / ${d.containerName}` : ''}`);
    log(`  category: ${d.category}`);
    log(`  explanation: ${d.explanation}`);
    if (d.suggestedAction?.summary) {
      log(`  ${YELLOW}action:${RESET} ${d.suggestedAction.summary}`);
    }
    if (d.suggestedAction?.steps?.length) {
      for (const step of d.suggestedAction.steps) {
        log(`    • ${step}`);
      }
    }
  }
}

function printPods(pods: PodDebugInfo[]): void {
  if (pods.length === 0) return;
  for (const pod of pods) {
    const color = pod.phase === 'Running' ? GREEN : RED;
    log(`  pod ${BOLD}${pod.podName}${RESET} phase=${color}${pod.phase}${RESET}`);
    for (const c of pod.containers ?? []) {
      const cs = c.state === 'running' ? GREEN : RED;
      log(`    container ${c.name}: ${cs}${c.state}${RESET}${c.message ? ` — ${c.message}` : ''}`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Endpoint + certificate verification (--with-endpoint scenarios)
// ──────────────────────────────────────────────────────────────────────────────

interface EndpointStatus {
  id: string;
  fqdn: string;
  reconciliationStatus: string;
  certificateRequired: boolean;
  certificateStatus?: string;
  certificateMessage?: string;
  certificateExpiresAt?: string;
  tlsEnabled?: boolean;
}

interface EndpointVerifyResult {
  fqdn: string;
  dnsResolved: boolean;
  certStatus: string | null;
  certExpiry: string | null;
  passed: boolean;
  message: string;
}

async function verifyEndpointAndCert(
  appIds: string[],
  clusterId: string,
  token: string,
  baseUrl: string,
): Promise<EndpointVerifyResult[]> {
  const results: EndpointVerifyResult[] = [];

  // Fetch all endpoints for the cluster, filter by our app IDs
  let allEndpoints: EndpointStatus[] = [];
  try {
    const res = await apiCall<EndpointStatus[] | { data?: EndpointStatus[] }>(
      'GET', `/clusters/${clusterId}/endpoints`, token, baseUrl,
    );
    allEndpoints = Array.isArray(res) ? res : (res.data ?? []);
  } catch (e) {
    phase('ENDPOINT', `${YELLOW}could not list endpoints: ${(e as Error).message}${RESET}`);
    return results;
  }

  const appEndpoints = allEndpoints.filter((ep) =>
    appIds.some(() => ep.id),
  );

  if (appEndpoints.length === 0) {
    phase('ENDPOINT', `${YELLOW}no endpoints found for this install${RESET}`);
    return results;
  }

  for (const ep of appEndpoints) {
    phase('ENDPOINT', `checking ${BOLD}${ep.fqdn}${RESET} — reconciliation=${ep.reconciliationStatus}`);

    // DNS resolution check
    let dnsResolved = false;
    try {
      const dnsRes = await apiCall<{ resolved: boolean; ip?: string }>(
        'GET', `/dns/zones/verify?hostname=${encodeURIComponent(ep.fqdn)}`, token, baseUrl,
      );
      dnsResolved = dnsRes.resolved ?? false;
      if (dnsResolved) {
        ok('ENDPOINT', `DNS resolved → ${dnsRes.ip ?? '?'}`);
      } else {
        log(`${YELLOW}[ENDPOINT]${RESET} DNS not yet resolved for ${ep.fqdn}`);
      }
    } catch { /* non-fatal */ }

    // Certificate status
    const certStatus = ep.certificateStatus ?? null;
    const certExpiry = ep.certificateExpiresAt ?? null;

    if (ep.certificateRequired) {
      const col = certStatus === 'VALID' ? GREEN : certStatus === 'ISSUING' ? YELLOW : RED;
      log(`${col}[ENDPOINT]${RESET} cert=${BOLD}${certStatus ?? 'unknown'}${RESET}${ep.certificateMessage ? ` — ${ep.certificateMessage}` : ''}${certExpiry ? ` (expires ${certExpiry})` : ''}`);
    } else {
      log(`${DIM}[ENDPOINT]${RESET} no certificate required (TLS disabled or internal)`);
    }

    const passed = dnsResolved && (!ep.certificateRequired || certStatus === 'VALID');
    results.push({
      fqdn: ep.fqdn,
      dnsResolved,
      certStatus,
      certExpiry,
      passed,
      message: passed
        ? `DNS resolved, cert ${certStatus ?? 'n/a'}`
        : `DNS=${dnsResolved}, cert=${certStatus ?? 'n/a'}`,
    });
  }

  return results;
}

// ──────────────────────────────────────────────────────────────────────────────
// Smoke test runner (post-RUNNING functional check)
// ──────────────────────────────────────────────────────────────────────────────

interface SmokeCheckResult {
  passed: boolean;
  message: string;
}

async function runSmokeHttpCheck(
  cfg: Extract<CatalogSmokeTest, { type: 'http' }>,
  resolvedFqdn: string,
): Promise<SmokeCheckResult> {
  const path = cfg.path ?? '/';
  const url = `https://${resolvedFqdn}${path}`;
  const expectedStatus = cfg.expectedStatus ?? 0; // 0 = any 2xx/3xx
  const timeoutMs = (cfg.timeoutSeconds ?? 10) * 1000;
  const retries = cfg.retries ?? 3;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      const ok = expectedStatus
        ? res.status === expectedStatus
        : res.status < 400;

      if (ok) return { passed: true, message: `HTTP ${res.status} from ${url}` };
      if (attempt === retries) {
        return { passed: false, message: `HTTP ${res.status} from ${url} (expected ${expectedStatus || '<400'})` };
      }
    } catch (e) {
      if (attempt === retries) {
        return { passed: false, message: `fetch failed: ${(e as Error).message}` };
      }
    }
    await sleep(5_000);
  }
  return { passed: false, message: 'all retries exhausted' };
}

async function runSmokeTcpCheck(
  cfg: Extract<CatalogSmokeTest, { type: 'tcp' }>,
  resolvedFqdn: string,
  defaultPort: number,
): Promise<SmokeCheckResult> {
  const port = cfg.port ?? defaultPort;
  const timeoutMs = (cfg.timeoutSeconds ?? 10) * 1000;

  return new Promise((resolve) => {
    const socket = net.createConnection({ host: resolvedFqdn, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ passed: false, message: `TCP connect to ${resolvedFqdn}:${port} timed out` });
    }, timeoutMs);

    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ passed: true, message: `TCP connected to ${resolvedFqdn}:${port}` });
    });
    socket.on('error', (e: Error) => {
      clearTimeout(timer);
      resolve({ passed: false, message: `TCP error: ${e.message}` });
    });
  });
}

async function runSmokeScriptCheck(
  cfg: Extract<CatalogSmokeTest, { type: 'script' }>,
  env: Record<string, string>,
): Promise<SmokeCheckResult> {
  const shell = cfg.shell ?? 'sh';
  const timeoutMs = (cfg.timeoutSeconds ?? 30) * 1000;

  let scriptContent: string;
  if (cfg.inline) {
    scriptContent = cfg.inline;
  } else if (cfg.file) {
    try {
      scriptContent = readFileSync(resolve(cfg.file), 'utf-8');
    } catch (e) {
      return { passed: false, message: `cannot read script file "${cfg.file}": ${(e as Error).message}` };
    }
  } else {
    return { passed: false, message: 'smokeTest.type=script requires either inline or file' };
  }

  return new Promise((resolve) => {
    const proc = spawn(shell, ['-c', scriptContent], {
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const output: string[] = [];
    proc.stdout.on('data', (d: { toString(): string }) => output.push(d.toString()));
    proc.stderr.on('data', (d: { toString(): string }) => output.push(d.toString()));

    const timer = setTimeout(() => {
      proc.kill();
      resolve({ passed: false, message: `script timed out after ${cfg.timeoutSeconds ?? 30}s` });
    }, timeoutMs);

    proc.on('close', (code: number | null) => {
      clearTimeout(timer);
      const out = output.join('').trim();
      if (code === 0) {
        resolve({ passed: true, message: out || 'script exited 0' });
      } else {
        resolve({ passed: false, message: `script exited ${code}${out ? ': ' + out : ''}` });
      }
    });
  });
}

async function runSmokeTest(
  smokeTest: CatalogSmokeTest,
  resolvedFqdn: string | undefined,
  autoInputs: Record<string, string>,
  manifest: CatalogManifest,
): Promise<SmokeCheckResult> {
  const specAny = manifest.spec as { ports?: Array<{ internal: number }> };
  const defaultPort = specAny.ports?.[0]?.internal ?? 80;
  const scriptEnv: Record<string, string> = {
    ...autoInputs,
    ...(resolvedFqdn ? { SMOKE_APP_URL: `https://${resolvedFqdn}`, SMOKE_APP_FQDN: resolvedFqdn } : {}),
    SMOKE_APP_PORT: String(defaultPort),
  };

  switch (smokeTest.type) {
    case 'http':
      if (!resolvedFqdn) return { passed: false, message: 'no resolvedFqdn — cannot run HTTP check' };
      return runSmokeHttpCheck(smokeTest, resolvedFqdn);
    case 'tcp':
      if (!resolvedFqdn) return { passed: false, message: 'no resolvedFqdn — cannot run TCP check' };
      return runSmokeTcpCheck(smokeTest, resolvedFqdn, defaultPort);
    case 'script':
      return runSmokeScriptCheck(smokeTest, scriptEnv);
    case 'skip':
      return { passed: true, message: `skipped — ${smokeTest.reason ?? 'no reason given'}` };
    default:
      return { passed: false, message: `unknown smokeTest type` };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Utility
// ──────────────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

function resultFilePath(resultsDir: string, file: string): string {
  const slug = resolve(file).split('/').pop()?.replace('.flui.yaml', '') ?? 'unknown';
  return resolve(resultsDir, `${slug}.json`);
}

function writeResult(resultsDir: string | null, file: string, result: SmokeTestResult): void {
  if (!resultsDir) return;
  try {
    mkdirSync(resolve(resultsDir), { recursive: true });
    writeFileSync(resultFilePath(resultsDir, file), JSON.stringify(result, null, 2) + '\n', 'utf-8');
  } catch (e) {
    err(`${DIM}  could not write result file: ${(e as Error).message}${RESET}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs();
  const startMs = Date.now();
  const relFile = args.file.replace(`${process.cwd()}/`, '');

  // ── Skip if already recorded ──────────────────────────────────────────────
  if (args.resultsDir) {
    const rFile = resultFilePath(args.resultsDir, args.file);
    try {
      if (existsSync(rFile)) {
        const prev = JSON.parse(readFileSync(rFile, 'utf-8')) as SmokeTestResult;
        log(`${DIM}[SKIP]${RESET} ${BOLD}${relFile}${RESET} already recorded — status=${prev.status}, skipping`);
        if (args.jsonOutput) process.stdout.write(JSON.stringify(prev, null, 2) + '\n');
        process.exit(prev.status === 'RUNNING' || prev.status === 'dry-run-ok' ? 0 : 1);
      }
    } catch { /* ignore read errors, proceed with test */ }
  }

  // ── Step 1: Local schema validation ──────────────────────────────────────
  phase('VALIDATE', `local schema check → ${BOLD}${relFile}${RESET}`);

  let rawYaml!: string;
  try {
    rawYaml = readFileSync(args.file, 'utf-8');
  } catch (e) {
    fail('VALIDATE', `cannot read file: ${(e as Error).message}`);
    process.exit(1);
  }

  const validator = new CatalogSchemaValidatorService();
  validator.onModuleInit();
  const loader = new CatalogManifestLoaderService(validator);

  let manifest!: CatalogManifest;
  let checksum: string;
  try {
    const result = loader.load(rawYaml);
    manifest = result.manifest;
    checksum = result.checksum;
  } catch (e) {
    fail('VALIDATE', `schema error: ${(e as Error).message}`);
    const result: SmokeTestResult = {
      file: relFile,
      slug: 'unknown',
      version: 'unknown',
      status: 'ERROR',
      durationMs: Date.now() - startMs,
      error: (e as Error).message,
    };
    writeResult(args.resultsDir, args.file, result);
    if (args.jsonOutput) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(1);
  }

  ok('VALIDATE', `${BOLD}${manifest.metadata.id}@${manifest.metadata.version}${RESET} ${DIM}(checksum=${checksum.slice(0, 12)}..., type=${manifest.spec.type})${RESET}`);

  const specAnyEarly = manifest.spec as { smokeTest?: CatalogSmokeTest };
  if (specAnyEarly.smokeTest?.type === 'skip') {
    const skipReason = (specAnyEarly.smokeTest as { type: 'skip'; reason?: string }).reason ?? 'no reason given';
    log(`${YELLOW}[SMOKE]${RESET} skipping — ${skipReason}`);
    const result: SmokeTestResult = {
      file: relFile,
      slug: manifest.metadata.id,
      version: manifest.metadata.version,
      status: 'SKIPPED' as SmokeTestResult['status'],
      durationMs: Date.now() - startMs,
      diagnoses: [],
      pods: [],
    };
    writeResult(args.resultsDir, args.file, result);
    if (args.jsonOutput) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(0);
  }

  // smokeTest is local runner metadata — strip it before sending to the server
  const serverParsed = yaml.load(rawYaml) as Record<string, unknown>;
  const serverSpec = serverParsed?.spec as Record<string, unknown> | undefined;
  if (serverSpec) delete serverSpec['smokeTest'];
  const serverYaml = yaml.dump(serverParsed);

  // ── Step 2: Server-side validation (dry-run also does this) ───────────────
  if (args.token) {
    phase('VALIDATE', 'server-side preview check');
    try {
      const res = await apiCall<{ valid: boolean; errors?: string[] }>(
        'POST',
        '/catalog/validate',
        args.token,
        args.baseUrl,
        { yaml: serverYaml },
      );
      if (!res.valid) {
        log(`${YELLOW}[VALIDATE]${RESET} server schema warning (proceeding anyway): ${(res.errors ?? []).join('; ')}`);
      } else {
        ok('VALIDATE', 'server preview OK');
      }
    } catch (e) {
      err(`${DIM}  server validate skipped (API unreachable): ${(e as Error).message}${RESET}`);
    }
  }

  if (args.dryRun) {
    ok('DRY-RUN', 'schema valid, no install requested');
    const result: SmokeTestResult = {
      file: relFile,
      slug: manifest.metadata.id,
      version: manifest.metadata.version,
      status: 'dry-run-ok',
      durationMs: Date.now() - startMs,
    };
    writeResult(args.resultsDir, args.file, result);
    if (args.jsonOutput) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(0);
  }

  // ── Step 3: Auto-generate userInputs for any valueFrom.userInput fields ───
  const autoInputs = buildAutoInputs(manifest);
  const inputCount = Object.keys(autoInputs).length;
  if (inputCount > 0) {
    phase('INSTALL', `auto-generated ${inputCount} userInput value(s): ${Object.keys(autoInputs).join(', ')}`);
  }

  // ── Step 4: Install from YAML ─────────────────────────────────────────────
  phase('INSTALL', `POST /catalog/install-from-yaml → cluster ${args.clusterId}`);

  const specWithDeps = manifest.spec as { dependencies?: Array<{ ref: string; as: string; required?: boolean }> };
  const dependencyChoices: Array<{ alias: string; mode: string; existingApplicationId?: string }> = [];
  for (const dep of specWithDeps.dependencies ?? []) {
    const override = args.depsOverrides[dep.as];
    if (override) {
      dependencyChoices.push({ alias: dep.as, mode: 'REUSE_EXISTING', existingApplicationId: override });
    } else if (args.depsMode === 'reuse-existing') {
      err(`${RED}--deps-mode reuse-existing requires --deps ${dep.as}=<applicationId>${RESET}`);
      process.exit(2);
    } else {
      dependencyChoices.push({ alias: dep.as, mode: 'DEDICATED' });
    }
  }
  if (dependencyChoices.length) {
    phase('INSTALL', `dependencyChoices: ${dependencyChoices.map((c) => `${c.alias}=${c.mode}`).join(', ')}`);
  }

  let install: InstallResponse;
  try {
    install = await apiCall<InstallResponse>(
      'POST',
      '/catalog/install-from-yaml',
      args.token,
      args.baseUrl,
      {
        yaml: serverYaml,
        clusterId: args.clusterId,
        displayName: `smoke-${manifest.metadata.id}`,
        skipEndpoint: !args.withEndpoint,
        userInputs: autoInputs,
        ...(dependencyChoices.length ? { dependencyChoices } : {}),
      },
    );
  } catch (e) {
    fail('INSTALL', `install request failed: ${(e as Error).message}`);
    const result: SmokeTestResult = {
      file: relFile,
      slug: manifest.metadata.id,
      version: manifest.metadata.version,
      status: 'ERROR',
      durationMs: Date.now() - startMs,
      error: (e as Error).message,
    };
    writeResult(args.resultsDir, args.file, result);
    if (args.jsonOutput) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(1);
  }

  ok('INSTALL', `install queued — id=${BOLD}${install.id}${RESET}, operationId=${install.operationId ?? 'n/a'}`);

  // ── Step 5: Poll ──────────────────────────────────────────────────────────
  phase('POLLING', `waiting up to ${args.timeoutMs / 1000}s …`);

  let finalInstall!: InstallResponse;
  try {
    finalInstall = await pollInstall(
      install.id,
      args.token,
      args.baseUrl,
      args.timeoutMs,
    );
  } catch (e) {
    fail('POLLING', (e as Error).message);
    const result: SmokeTestResult = {
      file: relFile,
      slug: manifest.metadata.id,
      version: manifest.metadata.version,
      installId: install.id,
      status: 'TIMEOUT',
      durationMs: Date.now() - startMs,
      error: (e as Error).message,
    };
    writeResult(args.resultsDir, args.file, result);
    if (args.jsonOutput) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(1);
  }

  const durationMs = Date.now() - startMs;

  // ── Step 6a: Success ──────────────────────────────────────────────────────
  if (finalInstall.status === 'RUNNING') {
    ok('SUCCESS', `${BOLD}${manifest.metadata.id}${RESET} is RUNNING in ${(durationMs / 1000).toFixed(1)}s`);
    if (finalInstall.resolvedFqdn) {
      ok('SUCCESS', `endpoint → ${BOLD}https://${finalInstall.resolvedFqdn}${RESET}`);
    }

    // ── Step 6b: Functional smoke test (if declared in manifest) ─────────────
    let smokeTestPassed: boolean | undefined;
    let smokeTestMessage: string | undefined;
    const specAny = manifest.spec as { smokeTest?: CatalogSmokeTest };
    if (specAny.smokeTest) {
      phase('SMOKE', `running ${specAny.smokeTest.type} check…`);
      const check = await runSmokeTest(
        specAny.smokeTest,
        finalInstall.resolvedFqdn,
        autoInputs,
        manifest,
      );
      smokeTestPassed = check.passed;
      smokeTestMessage = check.message;
      if (check.passed) {
        ok('SMOKE', check.message);
      } else {
        const col = YELLOW;
        log(`${col}[SMOKE]${RESET} ${BOLD}WARN${RESET} smoke check failed (app is still RUNNING): ${check.message}`);
      }
    }

    // ── Step 6c: Endpoint + certificate verification (--with-endpoint only) ───
    let endpointVerification: EndpointVerifyResult[] | undefined;
    if (args.withEndpoint && finalInstall.applicationIds?.length > 0) {
      phase('ENDPOINT', 'verifying DNS and certificate…');
      endpointVerification = await verifyEndpointAndCert(
        finalInstall.applicationIds,
        args.clusterId,
        args.token,
        args.baseUrl,
      );
      const allPassed = endpointVerification.every((r) => r.passed);
      if (allPassed) {
        ok('ENDPOINT', 'DNS resolved and certificate valid');
      } else {
        log(`${YELLOW}[ENDPOINT]${RESET} endpoint/cert check incomplete — check details above`);
      }
    }

    const result: SmokeTestResult = {
      file: relFile,
      slug: manifest.metadata.id,
      version: manifest.metadata.version,
      installId: finalInstall.id,
      status: 'RUNNING',
      resolvedFqdn: finalInstall.resolvedFqdn,
      durationMs,
      smokeTestPassed,
      smokeTestMessage,
      endpointVerification,
    };
    writeResult(args.resultsDir, args.file, result);
    if (args.jsonOutput) process.stdout.write(JSON.stringify(result, null, 2) + '\n');

    if (args.cleanup) {
      phase('CLEANUP', 'uninstalling (--cleanup flag set)…');
      try {
        await apiCall('DELETE', `/catalog/installs/${finalInstall.id}`, args.token, args.baseUrl);
        ok('CLEANUP', 'uninstall queued');
      } catch (e) {
        err(`${YELLOW}[CLEANUP]${RESET} uninstall failed: ${(e as Error).message}`);
      }
    }

    process.exit(0);
  }

  // ── Step 6b: Failure — collect diagnostics ────────────────────────────────
  fail('FAILED', `status=${BOLD}${finalInstall.status}${RESET} after ${(durationMs / 1000).toFixed(1)}s`);
  if (finalInstall.errorMessage) {
    fail('FAILED', `errorMessage: ${finalInstall.errorMessage}`);
  }

  let diagnoses: CrashDiagnosis[] = [];
  let pods: PodDebugInfo[] = [];

  if (finalInstall.applicationIds?.length > 0) {
    phase('DIAGNOSE', `collecting diagnostics for ${finalInstall.applicationIds.length} application(s)…`);
    const diag = await collectDiagnoses(finalInstall.applicationIds, args.token, args.baseUrl);
    diagnoses = diag.diagnoses;
    pods = diag.pods;
    printDiagnoses(diagnoses);
    printPods(pods);
  } else {
    fail('DIAGNOSE', 'no applicationIds on install — job may have failed before creating the application');
  }

  if (args.cleanup && finalInstall.id) {
    phase('CLEANUP', 'uninstalling failed app (--cleanup flag set)…');
    try {
      await apiCall('DELETE', `/catalog/installs/${finalInstall.id}`, args.token, args.baseUrl);
      ok('CLEANUP', 'uninstall queued');
    } catch (e) {
      err(`${YELLOW}[CLEANUP]${RESET} uninstall failed: ${(e as Error).message}`);
    }
  }

  const result: SmokeTestResult = {
    file: relFile,
    slug: manifest.metadata.id,
    version: manifest.metadata.version,
    installId: finalInstall.id,
    status: 'FAILED',
    durationMs,
    diagnoses,
    pods,
    error: finalInstall.errorMessage,
  };
  writeResult(args.resultsDir, args.file, result);
  if (args.jsonOutput) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(1);
}

main().catch((e) => {
  err(`${RED}fatal:${RESET} ${e instanceof Error ? e.stack : e}`);
  process.exit(1);
});
