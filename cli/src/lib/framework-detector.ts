import * as fs from 'node:fs';
import * as path from 'node:path';

export interface DetectedVersion {
  framework: string;
  major: string;
  source: string;
}

interface NpmRule {
  kind: 'npm';
  framework: string;
  pkg: string;
}
interface PyprojectRule {
  kind: 'pyproject';
  framework: string;
  pkg: string;
}
interface RequirementsRule {
  kind: 'requirements';
  framework: string;
  pkg: string;
}
interface MavenRule {
  kind: 'maven';
  framework: string;
}
interface GradleRule {
  kind: 'gradle';
  framework: string;
}
interface CsprojRule {
  kind: 'csproj';
  framework: string;
}

type DetectionRule =
  | NpmRule
  | PyprojectRule
  | RequirementsRule
  | MavenRule
  | GradleRule
  | CsprojRule;

const RULES: DetectionRule[] = [
  { kind: 'npm', framework: 'nextjs', pkg: 'next' },
  { kind: 'npm', framework: 'nuxt', pkg: 'nuxt' },
  { kind: 'npm', framework: 'nestjs', pkg: '@nestjs/core' },
  { kind: 'npm', framework: 'angular', pkg: '@angular/core' },
  { kind: 'npm', framework: 'sveltekit', pkg: '@sveltejs/kit' },
  { kind: 'npm', framework: 'astro', pkg: 'astro' },
  { kind: 'pyproject', framework: 'fastapi', pkg: 'fastapi' },
  { kind: 'pyproject', framework: 'django', pkg: 'django' },
  { kind: 'requirements', framework: 'fastapi', pkg: 'fastapi' },
  { kind: 'requirements', framework: 'django', pkg: 'django' },
  { kind: 'maven', framework: 'spring-boot' },
  { kind: 'gradle', framework: 'spring-boot' },
  { kind: 'csproj', framework: 'aspnet-core' },
];

/**
 * Try every rule in the registry against the project and return the first
 * match. Used when the caller does not know the framework upfront (e.g.
 * `flui deploy` running post-checks on an existing manifest).
 */
export function detectFrameworkFromProject(
  cwd: string,
): DetectedVersion | undefined {
  for (const rule of RULES) {
    const result = tryRule(rule, cwd);
    if (result) return result;
  }
  return undefined;
}

export function detectFrameworkVersion(
  framework: string,
  cwd: string,
): DetectedVersion | undefined {
  for (const rule of RULES.filter((r) => r.framework === framework)) {
    const result = tryRule(rule, cwd);
    if (result) return result;
  }
  return undefined;
}

function tryRule(
  rule: DetectionRule,
  cwd: string,
): DetectedVersion | undefined {
  switch (rule.kind) {
    case 'npm':
      return detectNpm(rule.framework, rule.pkg, cwd);
    case 'pyproject':
      return detectPyproject(rule.framework, rule.pkg, cwd);
    case 'requirements':
      return detectRequirements(rule.framework, rule.pkg, cwd);
    case 'maven':
      return detectMaven(rule.framework, cwd);
    case 'gradle':
      return detectGradle(rule.framework, cwd);
    case 'csproj':
      return detectCsproj(rule.framework, cwd);
  }
}

function readIfExists(file: string): string | undefined {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
}

function extractMajor(versionSpec: string): string | undefined {
  const match = /(\d+)/.exec(versionSpec);
  return match ? match[1] : undefined;
}

function detectNpm(
  framework: string,
  pkg: string,
  cwd: string,
): DetectedVersion | undefined {
  const file = path.join(cwd, 'package.json');
  const raw = readIfExists(file);
  if (!raw) return undefined;
  let parsed: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  const spec = parsed.dependencies?.[pkg] ?? parsed.devDependencies?.[pkg];
  if (!spec) return undefined;
  const major = extractMajor(spec);
  if (!major) return undefined;
  return { framework, major, source: `package.json (${pkg}@${spec})` };
}

function detectPyproject(
  framework: string,
  pkg: string,
  cwd: string,
): DetectedVersion | undefined {
  const file = path.join(cwd, 'pyproject.toml');
  const raw = readIfExists(file);
  if (!raw) return undefined;
  const regex = new RegExp(
    String.raw`^\s*${escapeRegex(pkg)}\s*=\s*["']([^"']+)["']`,
    'mi',
  );
  const match = regex.exec(raw);
  if (!match) return undefined;
  const major = extractMajor(match[1]);
  if (!major) return undefined;
  return {
    framework,
    major,
    source: `pyproject.toml (${pkg}=${match[1]})`,
  };
}

function detectRequirements(
  framework: string,
  pkg: string,
  cwd: string,
): DetectedVersion | undefined {
  const file = path.join(cwd, 'requirements.txt');
  const raw = readIfExists(file);
  if (!raw) return undefined;
  const regex = new RegExp(
    String.raw`^\s*${escapeRegex(pkg)}\s*[~=<>!]+\s*([\d.*]+)`,
    'mi',
  );
  const match = regex.exec(raw);
  if (!match) return undefined;
  const major = extractMajor(match[1]);
  if (!major) return undefined;
  return {
    framework,
    major,
    source: `requirements.txt (${pkg} ${match[1]})`,
  };
}

function detectMaven(
  framework: string,
  cwd: string,
): DetectedVersion | undefined {
  const file = path.join(cwd, 'pom.xml');
  const raw = readIfExists(file);
  if (!raw) return undefined;
  const match =
    /spring-boot-starter-parent[\s\S]{0,500}?<version>([^<]+)<\/version>/i.exec(
      raw,
    ) ?? /<spring-boot\.version>([^<]+)<\/spring-boot\.version>/i.exec(raw);
  if (!match) return undefined;
  const major = extractMajor(match[1]);
  if (!major) return undefined;
  return {
    framework,
    major,
    source: `pom.xml (spring-boot ${match[1]})`,
  };
}

function detectGradle(
  framework: string,
  cwd: string,
): DetectedVersion | undefined {
  const file = ['build.gradle.kts', 'build.gradle']
    .map((f) => path.join(cwd, f))
    .find((f) => fs.existsSync(f));
  if (!file) return undefined;
  const raw = readIfExists(file);
  if (!raw) return undefined;
  const match =
    /org\.springframework\.boot["']?\s*\)?\s*version\s*["']([^"']+)["']/i.exec(
      raw,
    );
  if (!match) return undefined;
  const major = extractMajor(match[1]);
  if (!major) return undefined;
  return {
    framework,
    major,
    source: `${path.basename(file)} (spring-boot ${match[1]})`,
  };
}

function detectCsproj(
  framework: string,
  cwd: string,
): DetectedVersion | undefined {
  const file = fs.readdirSync(cwd).find((f) => f.endsWith('.csproj'));
  if (!file) return undefined;
  const raw = readIfExists(path.join(cwd, file));
  if (!raw) return undefined;
  const match = /<TargetFramework>net(\d+)\.\d+<\/TargetFramework>/i.exec(raw);
  if (!match) return undefined;
  return {
    framework,
    major: match[1],
    source: `${file} (net${match[1]})`,
  };
}

function escapeRegex(s: string): string {
  return s.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}
