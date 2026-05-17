import { CrashCategory } from '../enums/crash-category.enum';
import { SuggestedActionType } from '../enums/suggested-action-type.enum';
import { DiagnosisSeverity } from '../enums/diagnosis-severity.enum';
import {
  CrashEvidence,
  SuggestedAction,
} from '../interfaces/crash-diagnosis.interface';

export interface PatternContext {
  logs: string;
  match: RegExpMatchArray;
}

export interface PatternDiagnosis {
  title: string;
  explanation: string;
  severity: DiagnosisSeverity;
  evidence: CrashEvidence;
  suggestedAction: SuggestedAction;
}

export interface CrashPattern {
  key: string;
  category: CrashCategory;
  regexes: RegExp[];
  build: (ctx: PatternContext) => PatternDiagnosis;
}

function logsSnippet(
  logs: string,
  match: RegExpMatchArray,
  radius = 200,
): string {
  const idx = match.index ?? 0;
  const start = Math.max(0, idx - radius);
  const end = Math.min(logs.length, idx + (match[0]?.length ?? 0) + radius);
  return logs.slice(start, end);
}

export const CRASH_PATTERNS: CrashPattern[] = [
  {
    key: 'env-var-missing-node',
    category: CrashCategory.CRASH_LOOP,
    regexes: [
      /(?:process\.env\.([A-Z0-9_]+)\s+is\s+(?:undefined|not\s+defined))/i,
      /Environment\s+variable\s+['"]?([A-Z0-9_]+)['"]?\s+is\s+(?:required|missing|not\s+set)/i,
    ],
    build: ({ match, logs }) => {
      const envVar = match[1];
      return {
        title: 'Missing environment variable',
        explanation: `The application requires the environment variable ${envVar} but it is not configured.`,
        severity: DiagnosisSeverity.CRITICAL,
        evidence: {
          missingEnvVar: envVar,
          logsSnippet: logsSnippet(logs, match),
        },
        suggestedAction: {
          type: SuggestedActionType.USER_INPUT,
          message: `Add the environment variable ${envVar} to the application configuration and redeploy.`,
          payload: { envVar },
        },
      };
    },
  },
  {
    key: 'env-var-missing-python',
    category: CrashCategory.CRASH_LOOP,
    regexes: [
      /KeyError:\s*['"]([A-Z0-9_]+)['"]/,
      /os\.environ\[['"]([A-Z0-9_]+)['"]\]/,
    ],
    build: ({ match, logs }) => {
      const envVar = match[1];
      return {
        title: 'Missing environment variable',
        explanation: `The Python application requires the environment variable ${envVar} but it is not configured.`,
        severity: DiagnosisSeverity.CRITICAL,
        evidence: {
          missingEnvVar: envVar,
          logsSnippet: logsSnippet(logs, match),
        },
        suggestedAction: {
          type: SuggestedActionType.USER_INPUT,
          message: `Add the environment variable ${envVar} to the application configuration and redeploy.`,
          payload: { envVar },
        },
      };
    },
  },
  {
    key: 'connection-refused',
    category: CrashCategory.CRASH_LOOP,
    regexes: [
      /ECONNREFUSED(?:\s+(\S+))?/,
      /connection\s+refused(?:\s+(?:to\s+)?(\S+))?/i,
      /dial\s+tcp\s+(\S+).*connect:\s+connection\s+refused/i,
      /no\s+route\s+to\s+host(?:\s+(\S+))?/i,
    ],
    build: ({ match, logs }) => {
      const target = match[1] || 'unknown';
      return {
        title: 'Connection to dependency refused',
        explanation: `The application cannot reach ${target}. Check that the dependency service is running and reachable.`,
        severity: DiagnosisSeverity.CRITICAL,
        evidence: {
          logsSnippet: logsSnippet(logs, match),
        },
        suggestedAction: {
          type: SuggestedActionType.MANUAL,
          message: `Verify that dependency ${target} is up and network configuration is correct.`,
          payload: { target },
        },
      };
    },
  },
  {
    key: 'module-not-found',
    category: CrashCategory.CRASH_LOOP,
    regexes: [
      /Cannot\s+find\s+module\s+['"]([^'"]+)['"]/,
      /ModuleNotFoundError:\s+No\s+module\s+named\s+['"]([^'"]+)['"]/,
      /cannot\s+find\s+package\s+['"]([^'"]+)['"]/i,
    ],
    build: ({ match, logs }) => {
      const moduleName = match[1];
      return {
        title: 'Missing module or dependency',
        explanation: `The runtime cannot find module ${moduleName}. Likely a build issue or missing installed dependencies.`,
        severity: DiagnosisSeverity.CRITICAL,
        evidence: {
          logsSnippet: logsSnippet(logs, match),
        },
        suggestedAction: {
          type: SuggestedActionType.MANUAL,
          message: `Check the dependencies manifest and rerun the application build.`,
          payload: { module: moduleName },
        },
      };
    },
  },
  {
    key: 'port-in-use',
    category: CrashCategory.CRASH_LOOP,
    regexes: [
      /EADDRINUSE(?:[^\d]+(\d+))?/,
      /(?:bind[^a-z]*)?address\s+already\s+in\s+use(?:\s*[:\s]+[^\d]*(\d+))?/i,
    ],
    build: ({ match, logs }) => {
      const port = match[1];
      return {
        title: 'Port already in use',
        explanation: port
          ? `Port ${port} is already occupied inside the container.`
          : `A port is already occupied inside the container.`,
        severity: DiagnosisSeverity.CRITICAL,
        evidence: {
          logsSnippet: logsSnippet(logs, match),
        },
        suggestedAction: {
          type: SuggestedActionType.MANUAL,
          message: `Verify the application listens on the declared port and no duplicate process is running.`,
          payload: port ? { port } : {},
        },
      };
    },
  },
  {
    key: 'permission-denied',
    category: CrashCategory.CRASH_LOOP,
    regexes: [
      /EACCES(?::\s+)?([^\n]+)?/,
      /permission\s+denied(?:\s*:\s*([^\n]+))?/i,
    ],
    build: ({ match, logs }) => {
      const path = match[1]?.trim();
      return {
        title: 'Permission denied',
        explanation: path
          ? `Access denied to ${path}. Check permissions or volume configuration.`
          : `Access denied to a resource. Check filesystem permissions or volume configuration.`,
        severity: DiagnosisSeverity.WARNING,
        evidence: {
          logsSnippet: logsSnippet(logs, match),
        },
        suggestedAction: {
          type: SuggestedActionType.MANUAL,
          message: `Verify that the image has the correct permissions on the mounted paths.`,
          payload: path ? { path } : {},
        },
      };
    },
  },
];
