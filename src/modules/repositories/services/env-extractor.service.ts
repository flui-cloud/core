import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { ExtractedEnvVarDto } from '../dto/extract-env.dto';

const SECRET_KEYWORDS =
  /SECRET|PASSWORD|KEY|TOKEN|PRIVATE|CREDENTIAL|PWD|PASS|AUTH/i;

/**
 * Extracts environment variable keys from repository configuration files.
 * Only extracts keys, never values (except defaults from example files).
 */
@Injectable()
export class EnvExtractorService {
  private readonly logger = new Logger(EnvExtractorService.name);

  async extractFromRepo(
    repoPath: string,
    framework: string,
  ): Promise<ExtractedEnvVarDto[]> {
    const fw = framework.toLowerCase().replaceAll('_', '-');

    if (fw === 'spring-boot') {
      return this.extractSpringBoot(repoPath);
    }

    if (fw === 'aspnet-core') {
      return this.extractAspNet(repoPath);
    }

    if (fw === 'django' || fw === 'fastapi') {
      return this.extractPython(repoPath);
    }

    // Node-based: scan dotenv files
    return this.extractDotenv(repoPath);
  }

  // ─── Dotenv (Node + Python) ────────────────────────────────────────────────

  private async extractDotenv(repoPath: string): Promise<ExtractedEnvVarDto[]> {
    const candidates = ['.env.example', '.env.local.example', '.env'];
    const vars: ExtractedEnvVarDto[] = [];
    const seen = new Set<string>();

    for (const filename of candidates) {
      const filePath = path.join(repoPath, filename);
      const parsed = await this.parseEnvFile(filePath);
      for (const v of parsed) {
        if (!seen.has(v.key)) {
          seen.add(v.key);
          vars.push(v);
        }
      }
    }

    return vars;
  }

  async parseEnvFile(filePath: string): Promise<ExtractedEnvVarDto[]> {
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      return [];
    }

    const source = path.basename(filePath);
    const vars: ExtractedEnvVarDto[] = [];

    for (const rawLine of content.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;

      const key = line.slice(0, eqIdx).trim();
      if (!key || !/^[A-Z0-9_]+$/i.test(key)) continue;

      const rawValue = line.slice(eqIdx + 1).trim();
      const hasDefault = rawValue.length > 0;
      // Never expose real values — only defaults from example files
      const isExampleFile = source.includes('example');
      const defaultValue =
        isExampleFile && hasDefault
          ? rawValue.replaceAll(/^["']|["']$/g, '')
          : undefined;

      vars.push({
        key,
        source,
        hasDefault,
        defaultValue,
        suggestedSecret: SECRET_KEYWORDS.test(key),
      });
    }

    return vars;
  }

  // ─── Spring Boot ───────────────────────────────────────────────────────────

  private async extractSpringBoot(
    repoPath: string,
  ): Promise<ExtractedEnvVarDto[]> {
    const resourcesBase = path.join(repoPath, 'src', 'main', 'resources');
    const candidates = [
      'application.yml',
      'application.properties',
      'application-production.yml',
      'application-production.properties',
    ];

    const vars: ExtractedEnvVarDto[] = [];
    const seen = new Set<string>();

    for (const filename of candidates) {
      const filePath = path.join(resourcesBase, filename);
      let parsed: ExtractedEnvVarDto[];

      if (filename.endsWith('.yml')) {
        parsed = await this.parseApplicationYaml(filePath);
      } else {
        parsed = await this.parseApplicationProperties(filePath);
      }

      for (const v of parsed) {
        if (!seen.has(v.key)) {
          seen.add(v.key);
          vars.push(v);
        }
      }
    }

    return vars;
  }

  async parseApplicationYaml(filePath: string): Promise<ExtractedEnvVarDto[]> {
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      return [];
    }

    // Match ${ENV_VAR_NAME} or ${ENV_VAR_NAME:default_value}
    const pattern = /\$\{([A-Z0-9_]+)(?::([^}]*))?\}/g;
    const source = path.basename(filePath);
    const vars: ExtractedEnvVarDto[] = [];
    const seen = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];
      if (seen.has(key)) continue;
      seen.add(key);

      const defaultValue =
        match[2] !== undefined && match[2] !== '' ? match[2] : undefined;
      vars.push({
        key,
        source,
        hasDefault: defaultValue !== undefined,
        defaultValue,
        suggestedSecret: SECRET_KEYWORDS.test(key),
      });
    }

    return vars;
  }

  async parseApplicationProperties(
    filePath: string,
  ): Promise<ExtractedEnvVarDto[]> {
    return this.parseApplicationYaml(filePath); // Same ${VAR:default} syntax
  }

  // ─── Django / FastAPI ──────────────────────────────────────────────────────

  private async extractPython(repoPath: string): Promise<ExtractedEnvVarDto[]> {
    const vars: ExtractedEnvVarDto[] = [];
    const seen = new Set<string>();

    // First scan dotenv files
    const dotenvVars = await this.extractDotenv(repoPath);
    for (const v of dotenvVars) {
      seen.add(v.key);
      vars.push(v);
    }

    // Then scan settings.py for os.environ references
    const settingsCandidates = [
      'settings.py',
      path.join('config', 'settings.py'),
    ];
    for (const candidate of settingsCandidates) {
      const filePath = path.join(repoPath, candidate);
      const parsed = await this.parsePythonSettings(filePath);
      for (const v of parsed) {
        if (!seen.has(v.key)) {
          seen.add(v.key);
          vars.push(v);
        }
      }
    }

    return vars;
  }

  async parsePythonSettings(filePath: string): Promise<ExtractedEnvVarDto[]> {
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      return [];
    }

    const source = path.basename(filePath);
    const vars: ExtractedEnvVarDto[] = [];
    const seen = new Set<string>();

    // Match os.environ.get('NAME'), os.environ.get('NAME', 'default'),
    // os.environ['NAME'], os.getenv('NAME'), os.getenv('NAME', 'default')
    const patterns = [
      /os\.environ\.get\(\s*['"]([A-Z0-9_]+)['"]\s*(?:,\s*['"]([^'"]*)['"]\s*)?\)/g,
      /os\.environ\[\s*['"]([A-Z0-9_]+)['"]\s*\]/g,
      /os\.getenv\(\s*['"]([A-Z0-9_]+)['"]\s*(?:,\s*['"]([^'"]*)['"]\s*)?\)/g,
    ];

    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const key = match[1];
        if (seen.has(key)) continue;
        seen.add(key);

        const defaultValue =
          match[2] !== undefined && match[2] !== '' ? match[2] : undefined;
        vars.push({
          key,
          source,
          hasDefault: defaultValue !== undefined,
          defaultValue,
          suggestedSecret: SECRET_KEYWORDS.test(key),
        });
      }
    }

    return vars;
  }

  // ─── ASP.NET Core ──────────────────────────────────────────────────────────

  private async extractAspNet(repoPath: string): Promise<ExtractedEnvVarDto[]> {
    const candidates = ['appsettings.json', 'appsettings.Production.json'];
    const vars: ExtractedEnvVarDto[] = [];
    const seen = new Set<string>();

    for (const filename of candidates) {
      const filePath = path.join(repoPath, filename);
      const parsed = await this.parseAppSettings(filePath);
      for (const v of parsed) {
        if (!seen.has(v.key)) {
          seen.add(v.key);
          vars.push(v);
        }
      }
    }

    return vars;
  }

  async parseAppSettings(filePath: string): Promise<ExtractedEnvVarDto[]> {
    let content: string;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      return [];
    }

    const pattern = /\$\{([A-Z0-9_]+)\}/g;
    const source = path.basename(filePath);
    const vars: ExtractedEnvVarDto[] = [];
    const seen = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];
      if (seen.has(key)) continue;
      seen.add(key);

      vars.push({
        key,
        source,
        hasDefault: false,
        suggestedSecret: SECRET_KEYWORDS.test(key),
      });
    }

    return vars;
  }
}
