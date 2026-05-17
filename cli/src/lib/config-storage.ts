import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ProfileManager } from './profile-manager';
import { buildNipBaseDomain } from './nip-base-domain.util';

/**
 * Lightweight encrypted configuration storage for CLI
 * Uses AES-256-GCM encryption with file-based storage
 *
 * Replaces heavy TypeORM + SQLite stack for better performance
 */

interface TokenMetadata {
  encrypted: string;
  createdAt: string;
  updatedAt: string;
}

interface ConfigData {
  tokens: Record<string, TokenMetadata>; // provider -> token with metadata
  credentials: Record<string, any>; // provider -> encrypted credentials
  apiUrl?: string; // Flui API URL
  apiKey?: string; // Flui API key for CLI M2M access (encrypted)
  // Non-secret user preferences (email, paths, defaults). Plain text — never store secrets here.
  preferences?: Record<string, unknown>;
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    apiUrlUpdatedAt?: string;
  };
}

export class ConfigStorage {
  private readonly encryptionKey: Buffer;
  private readonly configDir: string;
  private readonly configFile: string;
  private readonly encryptionKeyFile: string;

  constructor(profile?: string) {
    this.configDir = ProfileManager.getProfileDir(profile);
    this.configFile = join(this.configDir, 'config.json');
    this.encryptionKeyFile = join(this.configDir, '.key');
    this.ensureConfigDir();
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  /**
   * Ensure profile directory exists
   */
  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Get or create encryption key for AES-256-GCM
   */
  private getOrCreateEncryptionKey(): Buffer {
    if (existsSync(this.encryptionKeyFile)) {
      return readFileSync(this.encryptionKeyFile);
    }

    // Generate new 32-byte key for AES-256
    const key = randomBytes(32);
    writeFileSync(this.encryptionKeyFile, key, { mode: 0o600 });
    return key;
  }

  /**
   * Encrypt string using AES-256-GCM
   */
  private encrypt(plaintext: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt string using AES-256-GCM
   */
  private decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Read config file (create if doesn't exist)
   */
  private readConfig(): ConfigData {
    if (!existsSync(this.configFile)) {
      return {
        tokens: {},
        credentials: {},
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    try {
      const content = readFileSync(this.configFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read config file: ${error.message}`);
    }
  }

  /**
   * Write config file
   */
  private writeConfig(config: ConfigData): void {
    config.metadata.updatedAt = new Date().toISOString();
    writeFileSync(this.configFile, JSON.stringify(config, null, 2), {
      mode: 0o600,
    });
  }

  /**
   * Save encrypted API token for provider
   */
  public saveToken(provider: string, token: string): void {
    const config = this.readConfig();
    const now = new Date().toISOString();
    const existing = config.tokens[provider];

    config.tokens[provider] = {
      encrypted: this.encrypt(token),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    this.writeConfig(config);
  }

  /**
   * Get decrypted API token for provider
   */
  public getToken(provider: string): string | null {
    const config = this.readConfig();
    const tokenData = config.tokens[provider];

    if (!tokenData) {
      return null;
    }

    try {
      return this.decrypt(tokenData.encrypted);
    } catch (error) {
      throw new Error(
        `Failed to decrypt token for ${provider}: ${error.message}`,
      );
    }
  }

  /**
   * Get token metadata (without decrypting)
   */
  public getTokenMetadata(
    provider: string,
  ): { createdAt: string; updatedAt: string } | null {
    const config = this.readConfig();
    const tokenData = config.tokens[provider];

    if (!tokenData) {
      return null;
    }

    return {
      createdAt: tokenData.createdAt,
      updatedAt: tokenData.updatedAt,
    };
  }

  /**
   * Remove API token for provider
   */
  public removeToken(provider: string): void {
    const config = this.readConfig();
    delete config.tokens[provider];
    this.writeConfig(config);
  }

  /**
   * Check if token exists for provider
   */
  public hasToken(provider: string): boolean {
    const config = this.readConfig();
    return provider in config.tokens;
  }

  /**
   * Save encrypted credentials for provider
   */
  public saveCredentials(provider: string, credentials: any): void {
    const config = this.readConfig();
    config.credentials[provider] = this.encrypt(JSON.stringify(credentials));
    this.writeConfig(config);
  }

  /**
   * Get decrypted credentials for provider
   */
  public getCredentials(provider: string): any | null {
    const config = this.readConfig();
    const encryptedCredentials = config.credentials[provider];

    if (!encryptedCredentials) {
      return null;
    }

    try {
      const decrypted = this.decrypt(encryptedCredentials);
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(
        `Failed to decrypt credentials for ${provider}: ${error.message}`,
      );
    }
  }

  public hasCredentials(provider: string): boolean {
    const config = this.readConfig();
    return provider in config.credentials;
  }

  public removeCredentials(provider: string): void {
    const config = this.readConfig();
    delete config.credentials[provider];
    this.writeConfig(config);
  }

  /**
   * List all configured providers
   */
  public listProviders(): string[] {
    const config = this.readConfig();
    const tokenProviders = Object.keys(config.tokens);
    const credentialProviders = Object.keys(config.credentials);
    return [...new Set([...tokenProviders, ...credentialProviders])];
  }

  /**
   * Get config file path (for debugging)
   */
  public getConfigPath(): string {
    return this.configFile;
  }

  /**
   * Save API URL
   */
  public saveApiUrl(url: string): void {
    const config = this.readConfig();
    config.apiUrl = url;
    config.metadata.apiUrlUpdatedAt = new Date().toISOString();
    this.writeConfig(config);
  }

  /**
   * Returns the ISO timestamp of the last apiUrl update, or null if never tracked.
   */
  public getApiUrlUpdatedAt(): string | null {
    const config = this.readConfig();
    return config.metadata.apiUrlUpdatedAt ?? null;
  }

  /**
   * Get API URL.
   * Resolution order:
   *   1. Saved value in this profile's config.json
   *   2. FLUI_API_URL env var
   *   3. Derived from clusters.json (master IP + nip token)
   * Returns null when no source provides a value — callers must decide whether
   * to error out (e.g. command needs API access) or just skip.
   */
  public getApiUrl(): string | null {
    const config = this.readConfig();

    if (config.apiUrl) {
      return config.apiUrl;
    }

    if (process.env.FLUI_API_URL) {
      return process.env.FLUI_API_URL;
    }

    try {
      const profileDir = ProfileManager.getProfileDir();
      const clustersPath = join(profileDir, 'clusters.json');
      if (existsSync(clustersPath)) {
        const clusters = JSON.parse(readFileSync(clustersPath, 'utf-8'));
        const cluster = Array.isArray(clusters) ? clusters[0] : null;
        if (cluster?.masterIpAddress) {
          const base = buildNipBaseDomain(
            cluster.masterIpAddress,
            cluster.nipHostnameToken,
          );
          return `https://api.${base}/api/v1`;
        }
      }
    } catch {
      // ignore read errors
    }

    return null;
  }

  /**
   * Same as getApiUrl but throws a CLI-friendly error when no URL is configured.
   * Use this from commands that cannot work without an API endpoint.
   */
  public getApiUrlOrThrow(): string {
    const url = this.getApiUrl();
    if (!url) {
      throw new Error(
        'API URL is not configured for this context.\n' +
          '  • Run `flui env create` to provision a cluster (URL is auto-derived).\n' +
          '  • Or set it manually: `flui config set api-url https://api.example.com/api/v1`.',
      );
    }
    return url;
  }

  /**
   * Remove API URL from config
   */
  public removeApiUrl(): void {
    const config = this.readConfig();
    delete config.apiUrl;
    this.writeConfig(config);
  }

  /**
   * Save encrypted API key for CLI M2M access
   */
  public setApiKey(key: string): void {
    const config = this.readConfig();
    config.apiKey = this.encrypt(key);
    this.writeConfig(config);
  }

  /**
   * Get decrypted API key for CLI M2M access
   * Falls back to FLUI_API_KEY environment variable
   */
  public getApiKey(): string | null {
    if (process.env.FLUI_API_KEY) {
      return process.env.FLUI_API_KEY;
    }

    const config = this.readConfig();
    if (!config.apiKey) return null;

    try {
      return this.decrypt(config.apiKey);
    } catch {
      return null;
    }
  }

  /**
   * Read a non-secret preference from the active profile. Returns null when unset.
   * Preferences live in a dedicated namespace so they never collide with tokens/apiKey/metadata.
   */
  public getPreference<T = unknown>(key: string): T | null {
    const config = this.readConfig();
    const value = config.preferences?.[key];
    return value === undefined ? null : (value as T);
  }

  /**
   * Persist a non-secret preference under the active profile.
   * Use null/undefined to clear via `removePreference` instead.
   */
  public setPreference(key: string, value: unknown): void {
    const config = this.readConfig();
    if (!config.preferences) config.preferences = {};
    config.preferences[key] = value;
    this.writeConfig(config);
  }

  public removePreference(key: string): void {
    const config = this.readConfig();
    if (!config.preferences) return;
    delete config.preferences[key];
    this.writeConfig(config);
  }

  public getAllPreferences(): Record<string, unknown> {
    return { ...this.readConfig().preferences };
  }

  // ACME issuance tracking (Let's Encrypt rate-limit awareness)
  // Window matches LE: 5 certs per identical domain set per 168h.

  public getAcmeIssuances(): AcmeIssuance[] {
    const all = (
      this.getPreference<AcmeIssuance[]>('acmeIssuances') ?? []
    ).filter(
      (i) => Date.now() - new Date(i.issuedAt).getTime() < 168 * 3600 * 1000,
    );
    this.setPreference('acmeIssuances', all);
    return all;
  }

  public recordAcmeIssuance(entry: Omit<AcmeIssuance, 'issuedAt'>): void {
    const all = this.getAcmeIssuances();
    all.push({ ...entry, issuedAt: new Date().toISOString() });
    this.setPreference('acmeIssuances', all);
  }

  public countAcmeIssuances(
    domains: string,
    server: 'production' | 'staging',
  ): number {
    return this.getAcmeIssuances().filter(
      (i) => i.domains === domains && i.server === server,
    ).length;
  }
}

export interface AcmeIssuance {
  domains: string;
  server: 'production' | 'staging';
  issuedAt: string;
}
