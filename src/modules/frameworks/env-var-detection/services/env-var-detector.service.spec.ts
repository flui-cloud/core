import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  EnvVarDetectorService,
  DetectEnvVarsParams,
} from './env-var-detector.service';
import {
  EnvVarSource,
  PlaceholderPattern,
} from '../../framework-core/enums/env-var-source.enum';
import { FrameworkType } from '../../framework-core/enums/framework-type.enum';
import { IEnvVarDetectionResult } from '../../framework-core/interfaces/env-var-detection.interface';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createTmpDir(): Promise<string> {
  return fs.promises.mkdtemp(path.join(os.tmpdir(), 'flui-env-test-'));
}

async function writeFile(
  dir: string,
  name: string,
  content: string,
): Promise<void> {
  await fs.promises.writeFile(path.join(dir, name), content, 'utf-8');
}

async function cleanup(dir: string): Promise<void> {
  await fs.promises.rm(dir, { recursive: true, force: true });
}

function baseParams(
  overrides: Partial<DetectEnvVarsParams> = {},
): DetectEnvVarsParams {
  return {
    repositoryPath: '',
    framework: FrameworkType.NESTJS,
    hasDockerfile: false,
    rootFiles: [],
    allFiles: [],
    envFileHints: ['.env.example', '.env.template'],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('EnvVarDetectorService', () => {
  let service: EnvVarDetectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnvVarDetectorService],
    }).compile();

    service = module.get<EnvVarDetectorService>(EnvVarDetectorService);
  });

  // -------------------------------------------------------------------------
  // classifyVar
  // -------------------------------------------------------------------------

  describe('classifyVar()', () => {
    it('classifies _SECRET suffix as sensitive', () => {
      expect(service.classifyVar('JWT_SECRET')).toEqual({ sensitive: true });
    });

    it('classifies _PASSWORD suffix as sensitive', () => {
      expect(service.classifyVar('DB_PASSWORD')).toEqual({ sensitive: true });
    });

    it('classifies _TOKEN suffix as sensitive', () => {
      expect(service.classifyVar('API_TOKEN')).toEqual({ sensitive: true });
    });

    it('classifies _KEY suffix as sensitive', () => {
      expect(service.classifyVar('STRIPE_KEY')).toEqual({ sensitive: true });
    });

    it('classifies _PRIVATE suffix as sensitive', () => {
      expect(service.classifyVar('RSA_PRIVATE')).toEqual({ sensitive: true });
    });

    it('classifies NEXT_PUBLIC_ prefix as plain even if it ends with _KEY', () => {
      expect(service.classifyVar('NEXT_PUBLIC_API_KEY')).toEqual({
        sensitive: false,
      });
    });

    it('classifies a plain name as plain by default', () => {
      expect(service.classifyVar('LOG_LEVEL')).toEqual({ sensitive: false });
    });

    it('respects explicit sensitive=true override', () => {
      expect(service.classifyVar('LOG_LEVEL', true)).toEqual({
        sensitive: true,
      });
    });

    it('suffix check is case-insensitive', () => {
      expect(service.classifyVar('my_secret')).toEqual({ sensitive: true });
    });
  });

  // -------------------------------------------------------------------------
  // detectPlaceholderPattern — via parseWithPlaceholders exposed indirectly
  // We test it via detectEnvVars with a YAML file containing known patterns.
  // -------------------------------------------------------------------------

  describe('placeholder pattern detection', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await createTmpDir();
    });
    afterEach(async () => {
      await cleanup(tmpDir);
    });

    it('detects ${...} pattern in YAML content', async () => {
      await writeFile(
        tmpDir,
        'config.yaml',
        'db:\n  url: ${DATABASE_URL}\n  pass: ${DB_PASSWORD}\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          framework: FrameworkType.GO,
          allFiles: ['config.yaml'],
          envFileHints: ['config.yaml'],
        }),
      );
      expect(result.candidates[0].detectedPattern).toBe(
        PlaceholderPattern.DOLLAR_BRACE,
      );
      expect(result.candidates[0].vars.map((v) => v.name)).toContain(
        'DATABASE_URL',
      );
    });

    it('detects #{...}# pattern in YAML content', async () => {
      await writeFile(tmpDir, 'config.yaml', 'db:\n  url: #{DATABASE_URL}#\n');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          framework: FrameworkType.GO,
          allFiles: ['config.yaml'],
          envFileHints: ['config.yaml'],
        }),
      );
      expect(result.candidates[0].detectedPattern).toBe(
        PlaceholderPattern.HASH_BRACE,
      );
    });

    it('detects __VAR__ pattern', async () => {
      await writeFile(tmpDir, 'config.yaml', 'key: __API_SECRET__\n');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['config.yaml'],
          envFileHints: ['config.yaml'],
        }),
      );
      expect(result.candidates[0].detectedPattern).toBe(
        PlaceholderPattern.DOUBLE_UNDER,
      );
    });

    it('detects {{VAR}} pattern', async () => {
      await writeFile(tmpDir, 'config.yaml', 'key: {{REDIS_URL}}\n');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['config.yaml'],
          envFileHints: ['config.yaml'],
        }),
      );
      expect(result.candidates[0].detectedPattern).toBe(
        PlaceholderPattern.DOUBLE_BRACE,
      );
    });

    it('returns empty candidates when no placeholder found in YAML', async () => {
      await writeFile(
        tmpDir,
        'config.yaml',
        'db:\n  host: localhost\n  port: 5432\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['config.yaml'],
          envFileHints: ['config.yaml'],
        }),
      );
      // No placeholders → file yields 0 vars → falls to next priority
      expect(result.candidates.length).toBe(0);
    });

    it('picks the pattern with the highest match count when multiple are present', async () => {
      // 3 ${...} vs 1 #{...}#
      await writeFile(
        tmpDir,
        'config.yaml',
        'a: ${A}\nb: ${B}\nc: ${C}\nd: #{D}#\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['config.yaml'],
          envFileHints: ['config.yaml'],
        }),
      );
      expect(result.candidates[0].detectedPattern).toBe(
        PlaceholderPattern.DOLLAR_BRACE,
      );
    });
  });

  // -------------------------------------------------------------------------
  // parseDotenvFormat — tested via .env.example file
  // -------------------------------------------------------------------------

  describe('parseDotenvFormat()', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await createTmpDir();
    });
    afterEach(async () => {
      await cleanup(tmpDir);
    });

    it('extracts required var from KEY= (empty value)', async () => {
      await writeFile(tmpDir, '.env.example', 'DATABASE_URL=\n');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['.env.example'],
        }),
      );
      const v = result.candidates[0].vars.find(
        (x) => x.name === 'DATABASE_URL',
      );
      expect(v?.optional).toBe(false);
      expect(v?.defaultValue).toBeUndefined();
    });

    it('extracts optional var with default from KEY=value', async () => {
      await writeFile(tmpDir, '.env.example', 'LOG_LEVEL=debug\n');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['.env.example'],
        }),
      );
      const v = result.candidates[0].vars.find((x) => x.name === 'LOG_LEVEL');
      expect(v?.optional).toBe(true);
      expect(v?.defaultValue).toBe('debug');
    });

    it('skips comment lines', async () => {
      await writeFile(
        tmpDir,
        '.env.example',
        '# This is a comment\nAPP_PORT=3000\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['.env.example'],
        }),
      );
      expect(result.candidates[0].vars.every((v) => v.name !== '')).toBe(true);
      expect(result.candidates[0].vars.length).toBe(1);
    });

    it('skips blank lines', async () => {
      await writeFile(tmpDir, '.env.example', '\n\nAPP_PORT=3000\n\n');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['.env.example'],
        }),
      );
      expect(result.candidates[0].vars.length).toBe(1);
    });

    it('infers sensitive=true from _SECRET suffix when no explicit tag', async () => {
      await writeFile(tmpDir, '.env.example', 'JWT_SECRET=\n');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['.env.example'],
        }),
      );
      expect(result.candidates[0].vars[0].sensitive).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // flui.env — Priority 1 with structured comment tags
  // -------------------------------------------------------------------------

  describe('parseFluiEnvFormat() — flui.env tags', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await createTmpDir();
    });
    afterEach(async () => {
      await cleanup(tmpDir);
    });

    it('reads @sensitive tag from preceding comment', async () => {
      await writeFile(tmpDir, 'flui.env', '# @sensitive\nDB_URL=\n');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          rootFiles: ['flui.env'],
          allFiles: ['flui.env'],
        }),
      );
      expect(result.candidates[0].vars[0].sensitive).toBe(true);
    });

    it('reads @optional tag from preceding comment', async () => {
      await writeFile(tmpDir, 'flui.env', '# @optional\nFEATURE_FLAG=\n');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          rootFiles: ['flui.env'],
          allFiles: ['flui.env'],
        }),
      );
      expect(result.candidates[0].vars[0].optional).toBe(true);
    });

    it('reads @default value from preceding comment', async () => {
      await writeFile(
        tmpDir,
        'flui.env',
        '# @default https://api.example.com\nAPI_URL=\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          rootFiles: ['flui.env'],
          allFiles: ['flui.env'],
        }),
      );
      expect(result.candidates[0].vars[0].defaultValue).toBe(
        'https://api.example.com',
      );
    });

    it('reads @description from preceding comment', async () => {
      await writeFile(
        tmpDir,
        'flui.env',
        '# @description JWT signing secret, min 32 chars\n# @sensitive\nJWT_SECRET=\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          rootFiles: ['flui.env'],
          allFiles: ['flui.env'],
        }),
      );
      expect(result.candidates[0].vars[0].description).toBe(
        'JWT signing secret, min 32 chars',
      );
      expect(result.candidates[0].vars[0].sensitive).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // parseJsonWithPlaceholders
  // -------------------------------------------------------------------------

  describe('parseJsonWithPlaceholders()', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await createTmpDir();
    });
    afterEach(async () => {
      await cleanup(tmpDir);
    });

    it('extracts vars from nested JSON string values with ${VAR}', async () => {
      const json = JSON.stringify({
        db: { url: '${DATABASE_URL}' },
        port: 3000,
      });
      await writeFile(tmpDir, 'config.json', json);
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['config.json'],
          envFileHints: ['config.json'],
        }),
      );
      expect(result.candidates[0].vars.map((v) => v.name)).toContain(
        'DATABASE_URL',
      );
    });

    it('handles deeply nested JSON objects', async () => {
      const json = JSON.stringify({ a: { b: { c: { d: '${DEEP_SECRET}' } } } });
      await writeFile(tmpDir, 'config.json', json);
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['config.json'],
          envFileHints: ['config.json'],
        }),
      );
      expect(result.candidates[0].vars.map((v) => v.name)).toContain(
        'DEEP_SECRET',
      );
    });

    it('returns empty candidates for JSON with no placeholder values', async () => {
      const json = JSON.stringify({ host: 'localhost', port: 5432 });
      await writeFile(tmpDir, 'config.json', json);
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['config.json'],
          envFileHints: ['config.json'],
        }),
      );
      expect(result.candidates.length).toBe(0);
    });

    it('returns empty candidates on invalid JSON without throwing', async () => {
      await writeFile(tmpDir, 'config.json', '{ this is not json }');
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['config.json'],
          envFileHints: ['config.json'],
        }),
      );
      expect(result.candidates.length).toBe(0);
    });

    it('deduplicates vars referenced multiple times', async () => {
      const json = JSON.stringify({
        a: '${DB_URL}',
        b: '${DB_URL}',
        c: '${API_KEY}',
      });
      await writeFile(tmpDir, 'config.json', json);
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['config.json'],
          envFileHints: ['config.json'],
        }),
      );
      const names = result.candidates[0].vars.map((v) => v.name);
      expect(names.filter((n) => n === 'DB_URL').length).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Dockerfile ENV — Priority 4a
  // -------------------------------------------------------------------------

  describe('tryDockerfileEnv() via detectEnvVars()', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await createTmpDir();
    });
    afterEach(async () => {
      await cleanup(tmpDir);
    });

    it('marks ENV VAR="" as required, not readOnly', async () => {
      await writeFile(
        tmpDir,
        'Dockerfile',
        'FROM node:20-alpine\nENV DATABASE_URL=""\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          hasDockerfile: true,
          rootFiles: ['Dockerfile'],
          allFiles: ['Dockerfile'],
          envFileHints: [],
        }),
      );
      const v = result.candidates[0].vars.find(
        (x) => x.name === 'DATABASE_URL',
      );
      expect(v?.optional).toBe(false);
      expect(v?.readOnly).toBe(false);
    });

    it('marks ENV VAR="some-default" as optional with defaultValue, not readOnly', async () => {
      await writeFile(
        tmpDir,
        'Dockerfile',
        'FROM node:20-alpine\nENV LOG_LEVEL="info"\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          hasDockerfile: true,
          rootFiles: ['Dockerfile'],
          allFiles: ['Dockerfile'],
          envFileHints: [],
        }),
      );
      const v = result.candidates[0].vars.find((x) => x.name === 'LOG_LEVEL');
      expect(v?.optional).toBe(true);
      expect(v?.defaultValue).toBe('info');
      expect(v?.readOnly).toBe(false);
    });

    it('marks ENV VAR=production as readOnly (hardcoded lowercase value)', async () => {
      await writeFile(
        tmpDir,
        'Dockerfile',
        'FROM node:20-alpine\nENV NODE_ENV=production\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          hasDockerfile: true,
          rootFiles: ['Dockerfile'],
          allFiles: ['Dockerfile'],
          envFileHints: [],
        }),
      );
      const v = result.candidates[0].vars.find((x) => x.name === 'NODE_ENV');
      expect(v?.readOnly).toBe(true);
    });

    it('handles both ENV KEY=VALUE and ENV KEY VALUE syntaxes', async () => {
      await writeFile(
        tmpDir,
        'Dockerfile',
        'FROM node:20-alpine\nENV PORT=3000\nENV APP_NAME myapp\n',
      );
      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          hasDockerfile: true,
          rootFiles: ['Dockerfile'],
          allFiles: ['Dockerfile'],
          envFileHints: [],
        }),
      );
      const names = result.candidates[0].vars.map((v) => v.name);
      expect(names).toContain('PORT');
      expect(names).toContain('APP_NAME');
    });
  });

  // -------------------------------------------------------------------------
  // detectEnvVars() — full hierarchy integration
  // -------------------------------------------------------------------------

  describe('detectEnvVars() — hierarchy integration', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await createTmpDir();
    });
    afterEach(async () => {
      await cleanup(tmpDir);
    });

    it('Priority 1: returns single candidate from flui.env and stops', async () => {
      await writeFile(tmpDir, 'flui.env', 'DATABASE_URL=\nJWT_SECRET=\n');
      await writeFile(tmpDir, '.env.example', 'IGNORED_VAR=\n');

      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          rootFiles: ['flui.env', '.env.example'],
          allFiles: ['flui.env', '.env.example'],
        }),
      );

      expect(result.candidates.length).toBe(1);
      expect(result.candidates[0].sourceFile).toBe('flui.env');
      expect(result.isFallback).toBe(false);
    });

    it('Priority 1: flui.env takes precedence over .env.example', async () => {
      await writeFile(tmpDir, 'flui.env', 'ONLY_IN_FLUI=\n');
      await writeFile(tmpDir, '.env.example', 'ONLY_IN_EXAMPLE=\n');

      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          rootFiles: ['flui.env'],
          allFiles: ['flui.env', '.env.example'],
        }),
      );

      const names = result.candidates[0].vars.map((v) => v.name);
      expect(names).toContain('ONLY_IN_FLUI');
      expect(names).not.toContain('ONLY_IN_EXAMPLE');
    });

    it('Priority 3: returns multiple candidates when multiple hint files exist', async () => {
      await writeFile(tmpDir, '.env.example', 'VAR_A=\n');
      await writeFile(tmpDir, '.env.template', 'VAR_B=\n');

      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['.env.example', '.env.template'],
          envFileHints: ['.env.example', '.env.template'],
        }),
      );

      expect(result.candidates.length).toBe(2);
      expect(result.candidates[0].sourceFile).toBe('.env.example');
      expect(result.candidates[1].sourceFile).toBe('.env.template');
      expect(result.isFallback).toBe(false);
    });

    it('Priority 3 Mode B: universal scan when hints array is empty', async () => {
      await writeFile(tmpDir, '.env.example', 'DISCOVERED=value\n');

      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['.env.example'],
          envFileHints: [],
        }),
      );

      expect(result.candidates.length).toBeGreaterThan(0);
      expect(result.candidates[0].sourceFile).toBe('.env.example');
    });

    it('Priority 3 Mode B: sets sourceFrameworkHint when file belongs to different framework', async () => {
      await writeFile(tmpDir, 'config.yaml', 'db:\n  url: ${DATABASE_URL}\n');

      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          framework: FrameworkType.DOCKERFILE,
          allFiles: ['config.yaml'],
          envFileHints: [],
        }),
      );

      const candidate = result.candidates.find(
        (c) => c.sourceFile === 'config.yaml',
      );
      expect(candidate?.sourceFrameworkHint).toBe(FrameworkType.GO);
    });

    it('Priority 4a: falls through to Dockerfile when no framework files found', async () => {
      await writeFile(
        tmpDir,
        'Dockerfile',
        'FROM node:20-alpine\nENV PORT=""\n',
      );

      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          hasDockerfile: true,
          rootFiles: ['Dockerfile'],
          allFiles: ['Dockerfile'],
          envFileHints: ['.env.example'],
        }),
      );

      expect(result.candidates[0].sourceFile).toBe('Dockerfile');
    });

    it('Priority 4b: returns isFallback=true when nothing specific found', async () => {
      await writeFile(tmpDir, '.env', 'DB_HOST=localhost\nDB_PORT=5432\n');

      const result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: ['.env'],
          envFileHints: ['.env.example'],
        }),
      );

      expect(result.isFallback).toBe(true);
    });

    it('Priority 4b: returns empty candidates without throwing on a bare repo', async () => {
      let result: IEnvVarDetectionResult;
      await expect(async () => {
        result = await service.detectEnvVars(
          baseParams({
            repositoryPath: tmpDir,
            allFiles: [],
            envFileHints: [],
          }),
        );
      }).not.toThrow();

      result = await service.detectEnvVars(
        baseParams({
          repositoryPath: tmpDir,
          allFiles: [],
          envFileHints: [],
        }),
      );
      expect(result.candidates).toEqual([]);
      expect(result.isFallback).toBe(true);
    });
  });
});
