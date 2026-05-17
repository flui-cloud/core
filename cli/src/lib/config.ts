import * as fs from 'node:fs';
import * as path from 'node:path';
import { Config } from '../types';
import { ProfileManager } from './profile-manager';

function getConfigDir(): string {
  return ProfileManager.getProfileDir();
}

function getConfigFile(): string {
  return path.join(getConfigDir(), 'config.json');
}

/**
 * Ensure config directory exists
 */
function ensureConfigDir(): void {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Read configuration from ~/.flui/config.json
 * @returns Configuration object
 */
export function getConfig(): Config {
  ensureConfigDir();

  const configFile = getConfigFile();
  if (!fs.existsSync(configFile)) {
    return {};
  }

  try {
    const content = fs.readFileSync(configFile, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to read config file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Write configuration to ~/.flui/config.json
 * @param key Configuration key
 * @param value Configuration value
 */
export function setConfig(key: string, value: string): void {
  ensureConfigDir();

  const config = getConfig();
  config[key as keyof Config] = value;

  try {
    fs.writeFileSync(getConfigFile(), JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error(
      `Failed to write config file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get Hetzner token from config
 * @returns Hetzner API token
 * @throws Error if token is not configured
 */
export function getToken(): string {
  const config = getConfig();

  if (!config.hetzner_token) {
    throw new Error(
      'Hetzner token not configured.\n' +
        'Please set it using:\n' +
        '  flui config set hetzner_token YOUR_TOKEN\n\n' +
        'Get your token from: https://console.hetzner.cloud/',
    );
  }

  return config.hetzner_token;
}

/**
 * Get config file path
 * @returns Path to config file
 */
export function getConfigPath(): string {
  return getConfigFile();
}
