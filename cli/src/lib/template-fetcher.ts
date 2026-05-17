import { ApiClient } from './api-client';

export interface TemplateInfo {
  framework: string;
  displayName: string;
  description: string;
  version: string;
  repo: string;
  repoUrl?: string;
  category: string;
  language: string;
  port: number;
  healthcheckPath: string;
  buildTool: string;
  isDefault: boolean;
  isDeprecated: boolean;
}

const TEMPLATE_ORG = 'flui-cloud';
const DEFAULT_BRANCH = 'main';

export async function listTemplates(api: ApiClient): Promise<TemplateInfo[]> {
  return api.get<TemplateInfo[]>('/templates');
}

export async function getTemplate(
  api: ApiClient,
  framework: string,
  version?: string,
): Promise<TemplateInfo> {
  const path = version
    ? `/templates/${framework}?version=${encodeURIComponent(version)}`
    : `/templates/${framework}`;
  return api.get<TemplateInfo>(path);
}

export async function listVersionsFor(
  api: ApiClient,
  framework: string,
): Promise<TemplateInfo[]> {
  const all = await listTemplates(api);
  return all
    .filter((t) => t.framework === framework)
    .sort((a, b) => Number(b.version) - Number(a.version));
}

export function pickDefault(entries: TemplateInfo[]): TemplateInfo | undefined {
  return (
    entries.find((t) => t.isDefault && !t.isDeprecated) ??
    entries.find((t) => !t.isDeprecated) ??
    entries[0]
  );
}

export async function fetchRawFile(
  repo: string,
  filename: string,
  branch: string = DEFAULT_BRANCH,
): Promise<string> {
  const url = `https://raw.githubusercontent.com/${TEMPLATE_ORG}/${repo}/${branch}/${filename}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${filename} from ${TEMPLATE_ORG}/${repo}@${branch}: HTTP ${res.status}`,
    );
  }
  return await res.text();
}

export function parseFrameworkArg(input: string): {
  framework: string;
  version?: string;
} {
  const at = input.indexOf('@');
  if (at === -1) {
    return { framework: input };
  }
  return {
    framework: input.slice(0, at),
    version: input.slice(at + 1),
  };
}
