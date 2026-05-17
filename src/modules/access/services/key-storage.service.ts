import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

@Injectable()
export class KeyStorageService {
  private readonly keyBasePath: string;
  private readonly encryptionKey: Buffer;
  private readonly logger = new Logger(KeyStorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.keyBasePath = this.configService.get<string>(
      'SSH_KEYS_PATH',
      '/secure/keys',
    );

    const secretKey = this.configService.get<string>(
      'SSH_KEY_ENCRYPTION_KEY',
      // Default 32-byte hex key if not provided
      '0000111122223333444455556666777788889999aaaabbbbccccddddeeeeffff',
    );

    if (!secretKey) {
      this.logger.warn('No SSH_KEY_ENCRYPTION_KEY provided, using default key');
    }

    this.encryptionKey = Buffer.from(secretKey, 'hex');
  }

  async storePrivateKey(
    userId: string,
    keyId: string,
    privateKey: string,
  ): Promise<string> {
    const keyPath = this.getKeyPath(userId, keyId);
    await fs.mkdir(path.dirname(keyPath), { recursive: true });

    const encryptedKey = this.encryptKey(privateKey);
    await fs.writeFile(keyPath, encryptedKey);
    await fs.chmod(keyPath, 0o600);

    return keyPath;
  }

  async retrievePrivateKey(keyPath: string): Promise<string> {
    const encryptedKey = await fs.readFile(keyPath);
    return this.decryptKey(encryptedKey);
  }

  async deleteKey(keyPath: string): Promise<void> {
    try {
      await fs.unlink(keyPath);
      await this.cleanupKeyDirectory(keyPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  public encryptKeyToString(privateKey: string): string {
    const encryptedBuffer = this.encryptKey(privateKey);
    return encryptedBuffer.toString('base64');
  }

  public encryptKey(privateKey: string): Buffer {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(privateKey, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]);
  }

  public decryptKey(encryptedData: Buffer): string {
    const iv = encryptedData.subarray(0, 16);
    const authTag = encryptedData.subarray(16, 32);
    const encryptedKey = encryptedData.subarray(32);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      iv,
    );
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encryptedKey),
      decipher.final(),
    ]).toString('utf8');
  }

  public decryptKeyFromString(encryptedString: string): string {
    const encryptedBuffer = Buffer.from(encryptedString, 'base64');
    return this.decryptKey(encryptedBuffer);
  }

  private getKeyPath(userId: string, keyId: string): string {
    return path.join(this.keyBasePath, userId, keyId, 'private.key');
  }

  private async cleanupKeyDirectory(keyPath: string): Promise<void> {
    const directory = path.dirname(keyPath);
    const files = await fs.readdir(directory);

    if (files.length === 0) {
      await fs.rmdir(directory);
      await this.cleanupKeyDirectory(directory);
    }
  }
}
