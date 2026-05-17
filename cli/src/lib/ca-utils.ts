import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const FLUI_DIR = path.join(os.homedir(), '.flui');
const CA_DIR = path.join(FLUI_DIR, 'ca');
const CA_PUBLIC_KEY_PATH = path.join(CA_DIR, 'ca-key.pub');

/**
 * Get CA public key for SSH certificate authentication
 * @returns CA public key content or null if not found
 */
export function getCAPublicKey(): string | null {
  if (!fs.existsSync(CA_PUBLIC_KEY_PATH)) {
    return null;
  }

  try {
    return fs.readFileSync(CA_PUBLIC_KEY_PATH, 'utf-8').trim();
  } catch (error) {
    console.warn(
      `Failed to read CA public key: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

/**
 * Check if CA certificate system is configured
 */
export function isCAConfigured(): boolean {
  return fs.existsSync(CA_PUBLIC_KEY_PATH);
}

/**
 * Get CA configuration path for debugging
 */
export function getCAPath(): string {
  return CA_PUBLIC_KEY_PATH;
}
