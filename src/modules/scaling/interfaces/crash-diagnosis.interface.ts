import { SuggestedActionType } from '../enums/suggested-action-type.enum';

export interface K8sEventSummary {
  type: string;
  reason: string;
  message: string;
  count: number;
  firstTimestamp?: string;
  lastTimestamp?: string;
}

export interface CrashEvidence {
  events?: K8sEventSummary[];
  logsSnippet?: string;
  exitCode?: number;
  lastTerminationReason?: string;
  missingResource?: { kind: 'Secret' | 'ConfigMap'; name: string };
  missingEnvVar?: string;
  metric?: { name: string; value: number };
}

export interface SuggestedAction {
  type: SuggestedActionType;
  message: string;
  payload?: Record<string, unknown>;
}
