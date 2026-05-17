import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execFileSync } from 'node:child_process';

const SSH_DIR = path.join(os.homedir(), '.ssh');
const FLUI_KEY_NAME = 'flui_shared_dev';
const FLUI_KEY_PATH = path.join(SSH_DIR, FLUI_KEY_NAME);

export interface SSHKeyPair {
  publicKey: string;
  privateKeyPath: string;
  fingerprint?: string;
}

/**
 * Ensure .ssh directory exists with correct permissions
 */
function ensureSSHDir(): void {
  if (!fs.existsSync(SSH_DIR)) {
    fs.mkdirSync(SSH_DIR, { mode: 0o700, recursive: true });
  }
}

/**
 * Get or generate SSH key pair for Flui CLI
 * @returns SSH key pair with public key content and private key path
 */
export function getOrCreateSSHKey(): SSHKeyPair {
  ensureSSHDir();

  const privateKeyPath = FLUI_KEY_PATH;
  const publicKeyPath = `${FLUI_KEY_PATH}.pub`;

  // Check if key already exists
  if (fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
    const publicKey = fs.readFileSync(publicKeyPath, 'utf-8').trim();
    return {
      publicKey,
      privateKeyPath,
    };
  }

  // Generate new SSH key (ed25519 for security and performance)
  try {
    execFileSync(
      'ssh-keygen',
      [
        '-t',
        'ed25519',
        '-C',
        'flui-cli@shared-dev',
        '-f',
        privateKeyPath,
        '-N',
        '',
      ],
      { stdio: 'pipe' },
    );

    // Set correct permissions
    fs.chmodSync(privateKeyPath, 0o600);
    fs.chmodSync(publicKeyPath, 0o644);

    const publicKey = fs.readFileSync(publicKeyPath, 'utf-8').trim();
    return {
      publicKey,
      privateKeyPath,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate SSH key: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get SSH key information without generating
 * @returns Key info or null if doesn't exist
 */
export function getSSHKeyInfo(): {
  exists: boolean;
  path: string;
  publicKey?: string;
} {
  const publicKeyPath = `${FLUI_KEY_PATH}.pub`;

  if (fs.existsSync(publicKeyPath)) {
    const publicKey = fs.readFileSync(publicKeyPath, 'utf-8').trim();
    return {
      exists: true,
      path: FLUI_KEY_PATH,
      publicKey,
    };
  }

  return {
    exists: false,
    path: FLUI_KEY_PATH,
  };
}

/**
 * Delete SSH key pair
 */
export function deleteSSHKey(): void {
  const privateKeyPath = FLUI_KEY_PATH;
  const publicKeyPath = `${FLUI_KEY_PATH}.pub`;

  if (fs.existsSync(privateKeyPath)) {
    fs.unlinkSync(privateKeyPath);
  }

  if (fs.existsSync(publicKeyPath)) {
    fs.unlinkSync(publicKeyPath);
  }
}
