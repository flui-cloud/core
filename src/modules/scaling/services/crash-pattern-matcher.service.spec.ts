import { CrashPatternMatcherService } from './crash-pattern-matcher.service';
import { CrashCategory } from '../enums/crash-category.enum';

describe('CrashPatternMatcherService', () => {
  const service = new CrashPatternMatcherService();

  it('returns null for empty logs', () => {
    expect(service.match('')).toBeNull();
  });

  it('returns null when no pattern matches', () => {
    expect(service.match('some random harmless output')).toBeNull();
  });

  it('detects Node.js missing env var', () => {
    const logs =
      'TypeError: process.env.DATABASE_URL is undefined at main.js:3';
    const result = service.match(logs);
    expect(result).not.toBeNull();
    expect(result!.pattern.key).toBe('env-var-missing-node');
    expect(result!.pattern.category).toBe(CrashCategory.CRASH_LOOP);
    expect(result!.diagnosis.evidence.missingEnvVar).toBe('DATABASE_URL');
  });

  it('detects Python KeyError as missing env var', () => {
    const logs = "Traceback (most recent call last):\n  KeyError: 'SECRET_KEY'";
    const result = service.match(logs);
    expect(result).not.toBeNull();
    expect(result!.pattern.key).toBe('env-var-missing-python');
    expect(result!.diagnosis.evidence.missingEnvVar).toBe('SECRET_KEY');
  });

  it('detects connection refused', () => {
    const logs = 'Error: connect ECONNREFUSED 127.0.0.1:5432';
    const result = service.match(logs);
    expect(result).not.toBeNull();
    expect(result!.pattern.key).toBe('connection-refused');
  });

  it('detects missing Node.js module', () => {
    const logs =
      "Error: Cannot find module 'express'\n  at Function.Module._resolveFilename";
    const result = service.match(logs);
    expect(result).not.toBeNull();
    expect(result!.pattern.key).toBe('module-not-found');
  });

  it('detects missing Python module', () => {
    const logs = "ModuleNotFoundError: No module named 'requests'";
    const result = service.match(logs);
    expect(result).not.toBeNull();
    expect(result!.pattern.key).toBe('module-not-found');
  });

  it('detects port in use', () => {
    const logs = 'Error: listen EADDRINUSE: address already in use :::3000';
    const result = service.match(logs);
    expect(result).not.toBeNull();
    expect(result!.pattern.key).toBe('port-in-use');
  });

  it('detects permission denied', () => {
    const logs = "Error: EACCES: permission denied, open '/data/config.json'";
    const result = service.match(logs);
    expect(result).not.toBeNull();
    expect(result!.pattern.key).toBe('permission-denied');
  });
});
