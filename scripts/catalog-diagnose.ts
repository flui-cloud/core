#!/usr/bin/env ts-node
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Diagnose a catalog install: fetches crash-diagnoses and pod-debug output
 * for every application in the install. Useful for debugging existing installs
 * that are FAILED or DEGRADED without running a full smoke test.
 *
 * Usage:
 *   pnpm run catalog:diagnose <install-id> [options]
 *
 * Options:
 *   --token <token>   API bearer token (or env FLUI_API_KEY)
 *   --base-url <url>  API base URL (or env FLUI_API_URL, default http://localhost:3000/api/v1)
 *   --json            Machine-readable JSON output on stdout; logs go to stderr
 *
 * Exit codes:
 *   0  no crash diagnoses found (clean)
 *   1  at least one crash diagnosis found
 *   2  usage / network error
 */

import { ConfigStorage } from '../cli/src/lib/config-storage';
import { ProfileManager } from '../cli/src/lib/profile-manager';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

interface InstallResponse {
  id: string;
  slug: string;
  status: string;
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
  resolvedAt: string | null;
  createdAt: string;
}

interface PodDebugInfo {
  podName: string;
  phase: string;
  message?: string;
  containers?: Array<{ name: string; state: string; message?: string; restartCount?: number }>;
}

interface DiagnoseResult {
  installId: string;
  slug: string;
  status: string;
  applicationIds: string[];
  diagnoses: CrashDiagnosis[];
  pods: PodDebugInfo[];
  clean: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function log(msg: string): void { process.stderr.write(msg + '\n'); }
function out(msg: string): void { process.stdout.write(msg + '\n'); }

function phase(label: string, msg: string): void {
  log(`${CYAN}[${label}]${RESET} ${msg}`);
}

async function apiCall<T>(
  method: string,
  path: string,
  token: string,
  baseUrl: string,
): Promise<T> {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const text = await res.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { json = { message: text }; }
  if (!res.ok) {
    const msg = (json as { message?: string })?.message ?? `HTTP ${res.status}`;
    throw new Error(`${method} ${url} → ${res.status}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
  }
  return json as T;
}

function severityColor(sev: string): string {
  if (sev === 'critical') return RED;
  if (sev === 'warning') return YELLOW;
  return CYAN;
}

function printDiagnoses(diagnoses: CrashDiagnosis[]): void {
  if (diagnoses.length === 0) {
    log(`${GREEN}  no crash diagnoses recorded${RESET}`);
    return;
  }
  for (const d of diagnoses) {
    const col = severityColor(d.severity);
    log(`  ${col}${BOLD}[${d.severity.toUpperCase()}] ${d.title}${RESET}`);
    log(`    pod: ${d.podName}${d.containerName ? ` / container: ${d.containerName}` : ''}`);
    log(`    category: ${d.category}`);
    log(`    ${d.explanation}`);
    if (d.suggestedAction?.summary) {
      log(`    ${YELLOW}→ action:${RESET} ${d.suggestedAction.summary}`);
    }
    if (d.suggestedAction?.steps?.length) {
      for (const step of d.suggestedAction.steps) {
        log(`       • ${step}`);
      }
    }
    if (d.resolvedAt) {
      log(`    ${DIM}resolved at ${d.resolvedAt}${RESET}`);
    }
    log('');
  }
}

function printPods(pods: PodDebugInfo[]): void {
  for (const pod of pods) {
    const col = pod.phase === 'Running' ? GREEN : RED;
    log(`  pod ${BOLD}${pod.podName}${RESET} → ${col}${pod.phase}${RESET}${pod.message ? ` (${pod.message})` : ''}`);
    for (const c of pod.containers ?? []) {
      const cs = c.state === 'running' ? GREEN : RED;
      const restarts = c.restartCount ? ` restarts=${c.restartCount}` : '';
      log(`    container ${c.name}: ${cs}${c.state}${RESET}${restarts}${c.message ? ` — ${c.message}` : ''}`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0].startsWith('--')) {
    log(`${YELLOW}usage:${RESET} catalog-diagnose <install-id> [--token <t>] [--base-url <url>] [--json]`);
    process.exit(2);
  }

  const installId = argv[0];
  const storage = new ConfigStorage(ProfileManager.getActiveProfile());
  let token = process.env.FLUI_API_KEY ?? storage.getApiKey() ?? '';
  let baseUrl = process.env.FLUI_API_URL ?? storage.getApiUrl();
  let jsonOutput = false;

  for (let i = 1; i < argv.length; i++) {
    switch (argv[i]) {
      case '--token':    token = argv[++i]; break;
      case '--base-url': baseUrl = argv[++i]; break;
      case '--json':     jsonOutput = true; break;
      default:
        log(`${RED}unknown option:${RESET} ${argv[i]}`);
        process.exit(2);
    }
  }

  if (!token) {
    log(`${RED}error:${RESET} no token found — pass --token, set FLUI_API_KEY, or run 'flui auth:generate-api-key'`);
    process.exit(2);
  }

  // ── Fetch install ───────────────────────────────────────────────────────
  phase('INSTALL', `fetching install ${BOLD}${installId}${RESET}`);
  let install: InstallResponse;
  try {
    install = await apiCall<InstallResponse>('GET', `/catalog/installs/${installId}`, token, baseUrl);
  } catch (e) {
    log(`${RED}error:${RESET} ${(e as Error).message}`);
    process.exit(2);
  }

  const statusCol = install.status === 'RUNNING' ? GREEN : install.status === 'FAILED' ? RED : YELLOW;
  phase('INSTALL', `slug=${BOLD}${install.slug}${RESET} status=${statusCol}${install.status}${RESET} apps=${install.applicationIds.length}`);
  if (install.errorMessage) {
    log(`  errorMessage: ${install.errorMessage}`);
  }

  // ── Diagnostics per application ─────────────────────────────────────────
  const allDiagnoses: CrashDiagnosis[] = [];
  const allPods: PodDebugInfo[] = [];

  if (install.applicationIds.length === 0) {
    log(`${YELLOW}  no applicationIds — install may not have reached CREATE_APPLICATIONS step${RESET}`);
  }

  for (const appId of install.applicationIds) {
    phase('DIAGNOSE', `application ${DIM}${appId}${RESET}`);

    try {
      const res = await apiCall<CrashDiagnosis[] | { data?: CrashDiagnosis[]; items?: CrashDiagnosis[] }>(
        'GET',
        `/applications/${appId}/crash-diagnoses?limit=50&offset=0`,
        token,
        baseUrl,
      );
      const items = Array.isArray(res) ? res : (res.data ?? res.items ?? []);
      allDiagnoses.push(...items);
      log(`  crash diagnoses: ${items.length}`);
      printDiagnoses(items);
    } catch (e) {
      log(`  ${DIM}crash-diagnoses unavailable: ${(e as Error).message}${RESET}`);
    }

    try {
      const res = await apiCall<PodDebugInfo[] | { pods?: PodDebugInfo[] }>(
        'GET',
        `/applications/${appId}/debug/pods`,
        token,
        baseUrl,
      );
      const items = Array.isArray(res) ? res : (res.pods ?? []);
      allPods.push(...items);
      if (items.length > 0) {
        phase('PODS', `${items.length} pod(s) for application ${DIM}${appId}${RESET}`);
        printPods(items);
      }
    } catch (e) {
      log(`  ${DIM}debug/pods unavailable: ${(e as Error).message}${RESET}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const clean = allDiagnoses.length === 0;
  const result: DiagnoseResult = {
    installId,
    slug: install.slug,
    status: install.status,
    applicationIds: install.applicationIds,
    diagnoses: allDiagnoses,
    pods: allPods,
    clean,
  };

  if (jsonOutput) {
    out(JSON.stringify(result, null, 2));
  }

  if (clean) {
    log(`\n${GREEN}${BOLD}✔ no crash diagnoses${RESET}`);
    process.exit(0);
  } else {
    log(`\n${RED}${BOLD}✘ ${allDiagnoses.length} crash diagnosis/diagnoses found${RESET}`);
    process.exit(1);
  }
}

main().catch((e) => {
  process.stderr.write(`${RED}fatal:${RESET} ${e instanceof Error ? e.stack : e}\n`);
  process.exit(2);
});
