import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import {
  IDetectedEnvVar,
  IEnvVarCandidate,
  IEnvVarDetectionResult,
} from '../../framework-core/interfaces/env-var-detection.interface';
import {
  EnvVarSource,
  PlaceholderPattern,
} from '../../framework-core/enums/env-var-source.enum';
import { FrameworkType } from '../../framework-core/enums/framework-type.enum';

interface PlaceholderPatternConfig {
  pattern: PlaceholderPattern;
  regex: RegExp;
  extractName: (match: RegExpExecArray) => string;
}

const PLACEHOLDER_CONFIGS: PlaceholderPatternConfig[] = [
  {
    pattern: PlaceholderPattern.DOLLAR_BRACE,
    // Handles both ${VAR} and Spring Boot's ${VAR:defaultValue} syntax
    regex: /\$\{([A-Z][A-Z0-9_]*)[^}]*\}/g,
    extractName: (m) => m[1],
  },
  {
    pattern: PlaceholderPattern.HASH_BRACE,
    regex: /#\{([A-Z][A-Z0-9_]*)\}#/g,
    extractName: (m) => m[1],
  },
  {
    pattern: PlaceholderPattern.DOUBLE_UNDER,
    regex: /__([A-Z][A-Z0-9_]*)__/g,
    extractName: (m) => m[1],
  },
  {
    pattern: PlaceholderPattern.ANGLE_PERCENT,
    regex: /<%([A-Z][A-Z0-9_]*)%>/g,
    extractName: (m) => m[1],
  },
  {
    pattern: PlaceholderPattern.DOUBLE_BRACE,
    regex: /\{\{([A-Z][A-Z0-9_]*)\}\}/g,
    extractName: (m) => m[1],
  },
  {
    pattern: PlaceholderPattern.AT_SIGN,
    regex: /@([A-Z][A-Z0-9_]*)@/g,
    extractName: (m) => m[1],
  },
];

const SENSITIVE_SUFFIXES = [
  '_KEY',
  '_SECRET',
  '_PASSWORD',
  '_TOKEN',
  '_PRIVATE',
];
const NEXT_PUBLIC_PREFIX = 'NEXT_PUBLIC_';

/**
 * Central mapping of FrameworkType to ordered env file hints.
 * Used by both getEnvFileHints() detector delegates and the universal scan (Mode B).
 */
const FRAMEWORK_ENV_FILE_HINTS: Partial<Record<FrameworkType, string[]>> = {
  [FrameworkType.NEXTJS]: [
    '.env.example',
    '.env.local.example',
    '.env.template',
  ],
  [FrameworkType.NESTJS]: ['.env.example', '.env.template'],
  [FrameworkType.EXPRESS]: ['.env.example', '.env.template'],
  [FrameworkType.REACT_VITE]: ['.env.example'],
  [FrameworkType.VUE_VITE]: ['.env.example'],
  [FrameworkType.NUXT]: ['.env.example'],
  [FrameworkType.SVELTE_KIT]: ['.env.example'],
  [FrameworkType.REMIX]: ['.env.example'],
  [FrameworkType.ASTRO]: ['.env.example'],
  [FrameworkType.ANGULAR]: ['.env.example'],
  [FrameworkType.GENERIC_NODE]: ['.env.example', '.env.template'],
  [FrameworkType.FASTAPI]: ['.env.example', '.env.template'],
  [FrameworkType.DJANGO]: ['.env.example', '.env.template'],
  [FrameworkType.FLASK]: ['.env.example', '.env.template'],
  [FrameworkType.GENERIC_PYTHON]: ['.env.example', '.env.template'],
  [FrameworkType.GO]: ['.env.example', 'config.yaml', 'config.toml'],
  [FrameworkType.SPRING_BOOT]: [
    'src/main/resources/application.properties',
    'src/main/resources/application-*.properties',
    'src/main/resources/application.yml',
    'src/main/resources/application-*.yml',
    '.env.example',
  ],
  [FrameworkType.LARAVEL]: ['.env.example'],
  [FrameworkType.RAILS]: ['.env.example'],
  [FrameworkType.PHOENIX]: [
    '.env.example',
    'config/config.exs',
    'config/runtime.exs',
  ],
  [FrameworkType.ASPNET_CORE]: ['appsettings.json', '.env.example'],
  [FrameworkType.DOCKERFILE]: [],
  [FrameworkType.STATIC_HTML]: [],
  [FrameworkType.UNKNOWN]: [],
};

/** Ordered universal fallback list used when detector has no file hints (Mode B) */
const UNIVERSAL_SCAN_LIST = [
  '.env.example',
  '.env.template',
  'config.yaml',
  'config.toml',
  'config.json',
];

/**
 * Reverse-lookup: file path prefix → framework type, used for sourceFrameworkHint.
 * Only the most distinctive path segment per framework is listed.
 */
function guessFrameworkFromFile(filePath: string): FrameworkType | undefined {
  if (filePath === 'config.yaml' || filePath === 'config.toml')
    return FrameworkType.GO;
  if (filePath === '.env.local.example') return FrameworkType.NEXTJS;
  return undefined;
}

export interface DetectEnvVarsParams {
  repositoryPath: string;
  framework: FrameworkType;
  hasDockerfile: boolean;
  rootFiles: string[];
  allFiles: string[];
  envFileHints: string[];
}

@Injectable()
export class EnvVarDetectorService {
  private readonly logger = new Logger(EnvVarDetectorService.name);

  async detectEnvVars(
    params: DetectEnvVarsParams,
  ): Promise<IEnvVarDetectionResult> {
    const {
      repositoryPath,
      framework,
      hasDockerfile,
      rootFiles,
      allFiles,
      envFileHints,
    } = params;

    // Priority 1: flui.env
    const fluiEnvResult = await this.tryFluiEnv(repositoryPath, rootFiles);
    if (fluiEnvResult) {
      this.logger.log(
        'Env var detection: flui.env found (Priority 1), stopping',
      );
      return { candidates: [fluiEnvResult], isFallback: false };
    }

    // Priority 3: framework config files (all matching files returned as candidates)
    const frameworkCandidates = await this.tryFrameworkConfigFiles(
      repositoryPath,
      allFiles,
      envFileHints,
      framework,
    );
    if (frameworkCandidates.length > 0) {
      this.logger.log(
        `Env var detection: ${frameworkCandidates.length} candidate(s) from framework config files (Priority 3)`,
      );
      return { candidates: frameworkCandidates, isFallback: false };
    }

    // Priority 4a: Dockerfile ENV directives
    if (hasDockerfile) {
      const dockerfileCandidate = await this.tryDockerfileEnv(repositoryPath);
      if (dockerfileCandidate) {
        this.logger.log(
          'Env var detection: Dockerfile ENV parsed (Priority 4a)',
        );
        return { candidates: [dockerfileCandidate], isFallback: false };
      }
    }

    // Priority 4b: fallback
    this.logger.log(
      'Env var detection: no dedicated source found, running fallback (Priority 4b)',
    );
    const fallbackCandidate = await this.tryFallback(repositoryPath, allFiles);
    return {
      candidates: fallbackCandidate ? [fallbackCandidate] : [],
      isFallback: true,
    };
  }

  // ---------------------------------------------------------------------------
  // Priority 1 — flui.env
  // ---------------------------------------------------------------------------

  private async tryFluiEnv(
    repositoryPath: string,
    rootFiles: string[],
  ): Promise<IEnvVarCandidate | null> {
    if (!rootFiles.includes('flui.env')) return null;

    try {
      const content = await fs.readFile(
        path.join(repositoryPath, 'flui.env'),
        'utf-8',
      );
      const vars = this.parseFluiEnvFormat(content);
      if (vars.length === 0) return null;

      return {
        vars,
        sourceFile: 'flui.env',
      };
    } catch {
      return null;
    }
  }

  /**
   * Parses the flui.env format: standard dotenv with optional structured comments.
   * Supports # @sensitive, # @optional, # @default <value>, # @description <text>
   */
  private parseFluiEnvFormat(content: string): IDetectedEnvVar[] {
    const lines = content.split('\n');
    const vars: IDetectedEnvVar[] = [];
    let pendingSensitive = false;
    let pendingOptional = false;
    let pendingDefault: string | undefined;
    let pendingDescription: string | undefined;

    for (const raw of lines) {
      const line = raw.trimEnd();

      if (line.trim() === '') {
        // Blank line resets pending tag state
        pendingSensitive = false;
        pendingOptional = false;
        pendingDefault = undefined;
        pendingDescription = undefined;
        continue;
      }

      if (line.trim().startsWith('#')) {
        const comment = line.trim().slice(1).trim();
        if (comment.startsWith('@sensitive')) pendingSensitive = true;
        else if (comment.startsWith('@optional')) pendingOptional = true;
        else if (comment.startsWith('@default '))
          pendingDefault = comment.slice('@default '.length).trim();
        else if (comment.startsWith('@description '))
          pendingDescription = comment.slice('@description '.length).trim();
        continue;
      }

      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;

      const name = line.slice(0, eqIdx).trim();
      const rawValue = line.slice(eqIdx + 1).trim();
      const value = rawValue.replaceAll(/^["']|["']$/g, '');

      if (!name) continue;

      const { sensitive } = this.classifyVar(name, pendingSensitive);
      const optional = pendingOptional || value !== '';
      const defaultValue = value === '' ? pendingDefault : value;

      vars.push({
        name,
        defaultValue,
        sensitive,
        optional,
        description: pendingDescription,
        source: EnvVarSource.FLUI_ENV,
      });

      // Reset after consuming
      pendingSensitive = false;
      pendingOptional = false;
      pendingDefault = undefined;
      pendingDescription = undefined;
    }

    return vars;
  }

  // ---------------------------------------------------------------------------
  // Priority 3 — Framework config files
  // ---------------------------------------------------------------------------

  private async tryFrameworkConfigFiles(
    repositoryPath: string,
    allFiles: string[],
    envFileHints: string[],
    detectedFramework: FrameworkType,
  ): Promise<IEnvVarCandidate[]> {
    const hintsToUse =
      envFileHints.length > 0 ? envFileHints : UNIVERSAL_SCAN_LIST;
    const isUniversalScan = envFileHints.length === 0;

    const resolvedHints = this.expandHintGlobs(hintsToUse, allFiles);

    const candidates: IEnvVarCandidate[] = [];
    for (const hint of resolvedHints) {
      if (!allFiles.includes(hint)) continue;
      const candidate = await this.buildCandidateFromHint(
        repositoryPath,
        hint,
        isUniversalScan,
        detectedFramework,
      );
      if (candidate) candidates.push(candidate);
    }
    return candidates;
  }

  private expandHintGlobs(hints: string[], allFiles: string[]): string[] {
    const out: string[] = [];
    for (const hint of hints) {
      if (hint.includes('*')) {
        out.push(...allFiles.filter((f) => this.matchesGlob(hint, f)));
      } else {
        out.push(hint);
      }
    }
    return out;
  }

  private async buildCandidateFromHint(
    repositoryPath: string,
    hint: string,
    isUniversalScan: boolean,
    detectedFramework: FrameworkType,
  ): Promise<IEnvVarCandidate | null> {
    let content: string;
    try {
      content = await fs.readFile(path.join(repositoryPath, hint), 'utf-8');
    } catch {
      this.logger.warn(`Env var detection: failed to read ${hint}`);
      return null;
    }

    const parsed = this.parseHintContent(content, hint);
    if (parsed.vars.length === 0) return null;

    const candidate: IEnvVarCandidate = {
      vars: parsed.vars,
      sourceFile: hint,
      detectedPattern: parsed.pattern,
    };

    if (isUniversalScan) {
      const hintFramework = guessFrameworkFromFile(hint);
      if (hintFramework && hintFramework !== detectedFramework) {
        candidate.sourceFrameworkHint = hintFramework;
      }
    }
    return candidate;
  }

  private parseHintContent(
    content: string,
    hint: string,
  ): { vars: IDetectedEnvVar[]; pattern?: PlaceholderPattern } {
    const ext = path.extname(hint).toLowerCase();
    if (
      ext === '' ||
      ext === '.example' ||
      ext === '.template' ||
      hint.startsWith('.env')
    ) {
      return {
        vars: this.parseDotenvFormat(content, EnvVarSource.ENV_EXAMPLE),
      };
    }
    if (ext === '.yaml' || ext === '.yml' || ext === '.toml') {
      const result = this.parseWithPlaceholders(
        content,
        EnvVarSource.FRAMEWORK_CONFIG,
      );
      return { vars: result.vars, pattern: result.pattern };
    }
    if (ext === '.json') {
      const result = this.parseJsonWithPlaceholders(
        content,
        EnvVarSource.FRAMEWORK_CONFIG,
      );
      return { vars: result.vars, pattern: result.pattern };
    }
    if (ext === '.properties') {
      const result = this.parsePropertiesWithPlaceholders(
        content,
        EnvVarSource.FRAMEWORK_CONFIG,
      );
      return { vars: result.vars, pattern: result.pattern };
    }
    return { vars: this.parseDotenvFormat(content, EnvVarSource.ENV_EXAMPLE) };
  }

  // ---------------------------------------------------------------------------
  // Priority 4a — Dockerfile ENV
  // ---------------------------------------------------------------------------

  private async tryDockerfileEnv(
    repositoryPath: string,
  ): Promise<IEnvVarCandidate | null> {
    try {
      const content = await fs.readFile(
        path.join(repositoryPath, 'Dockerfile'),
        'utf-8',
      );
      const vars = this.parseDockerfileEnv(content);
      if (vars.length === 0) return null;

      return { vars, sourceFile: 'Dockerfile' };
    } catch {
      return null;
    }
  }

  private parseDockerfileEnv(content: string): IDetectedEnvVar[] {
    const vars: IDetectedEnvVar[] = [];
    const lines = content.split('\n');
    let inBuildStage = false;

    for (const raw of lines) {
      const line = raw.trim();

      // Track multi-stage builds — skip ENV in intermediate stages
      if (line.startsWith('FROM ')) {
        // Last FROM before CMD/ENTRYPOINT is the final stage
        inBuildStage = true;
        continue;
      }

      if (!inBuildStage) continue;

      // Match: ENV KEY=VALUE or ENV KEY VALUE (single var form)
      const envMatch = /^ENV\s+([A-Za-z_]\w*)(?:=(.*))?(?:\s+(.*))?$/.exec(
        line,
      );
      if (!envMatch) continue;

      const name = envMatch[1];
      // envMatch[2] covers KEY=VALUE, envMatch[3] covers KEY VALUE (legacy)
      const rawValue = (envMatch[2] ?? envMatch[3] ?? '').trim();
      const wasQuoted = /^["'].*["']$/.test(rawValue);
      const value = rawValue.replaceAll(/^["']|["']$/g, '').trim();

      const { sensitive } = this.classifyVar(name);

      if (value === '') {
        // ENV VAR="" — required, user must configure
        vars.push({
          name,
          sensitive,
          optional: false,
          source: EnvVarSource.DOCKERFILE,
          readOnly: false,
        });
      } else if (wasQuoted) {
        // ENV VAR="some-default" — quoted value, user can override
        vars.push({
          name,
          defaultValue: value,
          sensitive,
          optional: true,
          source: EnvVarSource.DOCKERFILE,
          readOnly: false,
        });
      } else {
        // ENV VAR=hardcoded — unquoted value, typically a system constant (production, /app, etc.)
        vars.push({
          name,
          defaultValue: value,
          sensitive,
          optional: true,
          source: EnvVarSource.DOCKERFILE,
          readOnly: true,
        });
      }
    }

    return vars;
  }

  // ---------------------------------------------------------------------------
  // Priority 4b — Fallback
  // ---------------------------------------------------------------------------

  private async tryFallback(
    repositoryPath: string,
    allFiles: string[],
  ): Promise<IEnvVarCandidate | null> {
    const fallbackFiles = [
      '.env',
      'application.properties',
      'src/main/resources/application.properties',
      'application.yml',
      'src/main/resources/application.yml',
      'appsettings.json',
      'config.yaml',
      'config.toml',
    ];

    for (const file of fallbackFiles) {
      if (!allFiles.includes(file)) continue;

      try {
        const content = await fs.readFile(
          path.join(repositoryPath, file),
          'utf-8',
        );
        const ext = path.extname(file).toLowerCase();
        let vars: IDetectedEnvVar[];

        if (ext === '' || ext === '.env') {
          // Extract keys from .env — ignore values (those are dev values)
          vars = this.parseDotenvKeys(content);
        } else if (ext === '.yaml' || ext === '.yml' || ext === '.toml') {
          const result = this.parseWithPlaceholders(
            content,
            EnvVarSource.FALLBACK,
          );
          vars = result.vars;
        } else if (ext === '.json') {
          const result = this.parseJsonWithPlaceholders(
            content,
            EnvVarSource.FALLBACK,
          );
          vars = result.vars;
        } else if (ext === '.properties') {
          const result = this.parsePropertiesWithPlaceholders(
            content,
            EnvVarSource.FALLBACK,
          );
          vars = result.vars;
        } else {
          continue;
        }

        if (vars.length === 0) continue;

        return { vars, sourceFile: file };
      } catch {
        // continue to next file
      }
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  private parseDotenvFormat(
    content: string,
    source: EnvVarSource,
  ): IDetectedEnvVar[] {
    const vars: IDetectedEnvVar[] = [];

    for (const raw of content.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;

      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;

      const name = line.slice(0, eqIdx).trim();
      const rawValue = line.slice(eqIdx + 1).trim();
      const value = rawValue.replaceAll(/^["']|["']$/g, '');

      if (!name || !/^[A-Za-z_]\w*$/.test(name)) continue;

      const { sensitive } = this.classifyVar(name);
      vars.push({
        name,
        defaultValue: value === '' ? undefined : value,
        sensitive,
        optional: value !== '',
        source,
      });
    }

    return vars;
  }

  /** Extract only keys from a .env file (used for fallback — dev values are not surfaced) */
  private parseDotenvKeys(content: string): IDetectedEnvVar[] {
    const vars: IDetectedEnvVar[] = [];

    for (const raw of content.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;

      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;

      const name = line.slice(0, eqIdx).trim();
      if (!name || !/^[A-Za-z_]\w*$/.test(name)) continue;

      const { sensitive } = this.classifyVar(name);
      vars.push({
        name,
        sensitive,
        optional: false,
        source: EnvVarSource.FALLBACK,
      });
    }

    return vars;
  }

  private parseWithPlaceholders(
    content: string,
    source: EnvVarSource,
  ): { vars: IDetectedEnvVar[]; pattern?: PlaceholderPattern } {
    const config = this.detectPlaceholderConfig(content);
    if (!config) return { vars: [] };

    const names = this.extractPlaceholderNames(content, config);
    const vars = names.map((name) => {
      const { sensitive } = this.classifyVar(name);
      return { name, sensitive, optional: false, source };
    });

    return { vars, pattern: config.pattern };
  }

  private parseJsonWithPlaceholders(
    content: string,
    source: EnvVarSource,
  ): { vars: IDetectedEnvVar[]; pattern?: PlaceholderPattern } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { vars: [] };
    }

    const config = this.detectPlaceholderConfig(content);
    if (!config) return { vars: [] };

    const names = new Set<string>();
    this.walkJsonForPlaceholders(parsed, config, names);

    const vars = Array.from(names).map((name) => {
      const { sensitive } = this.classifyVar(name);
      return { name, sensitive, optional: false, source };
    });

    return { vars, pattern: config.pattern };
  }

  private walkJsonForPlaceholders(
    node: unknown,
    config: PlaceholderPatternConfig,
    names: Set<string>,
  ): void {
    if (typeof node === 'string') {
      this.extractPlaceholderNames(node, config).forEach((n) => names.add(n));
    } else if (Array.isArray(node)) {
      node.forEach((item) => this.walkJsonForPlaceholders(item, config, names));
    } else if (node !== null && typeof node === 'object') {
      Object.values(node as Record<string, unknown>).forEach((v) =>
        this.walkJsonForPlaceholders(v, config, names),
      );
    }
  }

  private parsePropertiesWithPlaceholders(
    content: string,
    source: EnvVarSource,
  ): { vars: IDetectedEnvVar[]; pattern?: PlaceholderPattern } {
    const config = this.detectPlaceholderConfig(content);
    if (!config) return { vars: [] };

    const names = new Set<string>();
    for (const raw of content.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || line.startsWith('!')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const value = line.slice(eqIdx + 1).trim();
      this.extractPlaceholderNames(value, config).forEach((n) => names.add(n));
    }

    const vars = Array.from(names).map((name) => {
      const { sensitive } = this.classifyVar(name);
      return { name, sensitive, optional: false, source };
    });

    return { vars, pattern: config.pattern };
  }

  // ---------------------------------------------------------------------------
  // Glob helpers
  // ---------------------------------------------------------------------------

  /** Supports single `*` wildcard (not `**`). */
  private matchesGlob(pattern: string, file: string): boolean {
    const starIdx = pattern.indexOf('*');
    if (starIdx === -1) return pattern === file;
    const prefix = pattern.slice(0, starIdx);
    const suffix = pattern.slice(starIdx + 1);
    return (
      file.startsWith(prefix) &&
      file.endsWith(suffix) &&
      file.length >= prefix.length + suffix.length
    );
  }

  // ---------------------------------------------------------------------------
  // Placeholder detection helpers
  // ---------------------------------------------------------------------------

  private detectPlaceholderConfig(
    content: string,
  ): PlaceholderPatternConfig | undefined {
    let best: PlaceholderPatternConfig | undefined;
    let bestCount = 0;

    for (const config of PLACEHOLDER_CONFIGS) {
      const matches = content.match(new RegExp(config.regex.source, 'g'));
      const count = matches?.length ?? 0;
      if (count > bestCount) {
        bestCount = count;
        best = config;
      }
    }

    return bestCount > 0 ? best : undefined;
  }

  private extractPlaceholderNames(
    content: string,
    config: PlaceholderPatternConfig,
  ): string[] {
    const names: string[] = [];
    const regex = new RegExp(config.regex.source, 'g');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      names.push(config.extractName(match));
    }

    return [...new Set(names)];
  }

  // ---------------------------------------------------------------------------
  // Classification
  // ---------------------------------------------------------------------------

  classifyVar(
    name: string,
    explicitSensitive?: boolean,
  ): { sensitive: boolean } {
    if (explicitSensitive === true) return { sensitive: true };

    const upper = name.toUpperCase();
    // NEXT_PUBLIC_ is always plain (client-side Next.js vars, never secret)
    if (upper.startsWith(NEXT_PUBLIC_PREFIX)) return { sensitive: false };
    if (SENSITIVE_SUFFIXES.some((suffix) => upper.endsWith(suffix)))
      return { sensitive: true };

    return { sensitive: false };
  }

  /** Expose the central framework-to-hints map for use by detector delegates */
  static getHintsForFramework(framework: FrameworkType): string[] {
    return FRAMEWORK_ENV_FILE_HINTS[framework] ?? [];
  }
}
