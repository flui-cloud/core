import { Injectable, Logger } from '@nestjs/common';
import { utils } from 'ssh2';
import { SSHKeyPair } from '../interfaces/ssh-key.interface';
import { createHash } from 'node:crypto';

@Injectable()
export class SSHKeyGeneratorService {
  private readonly logger = new Logger(SSHKeyGeneratorService.name);

  async generateKeyPair(
    type: 'ed25519' | 'rsa' = 'ed25519',
  ): Promise<SSHKeyPair> {
    return new Promise((resolve, reject) => {
      const options = type === 'rsa' ? { bits: 4096 } : undefined;

      utils.generateKeyPair(type, options, (err, keys) => {
        if (err) {
          reject(new Error(`Failed to generate SSH key pair: ${err.message}`));
          return;
        }

        const fingerprint = this.generateFingerprint(keys.public);
        this.logger.debug(`Generated SSH key | fingerprint: ${fingerprint}`);

        resolve({
          publicKey: keys.public,
          privateKey: keys.private,
          fingerprint: fingerprint,
        });
      });
    });
  }

  private generateFingerprint(publicKey: string): string {
    const parts = publicKey.split(' ');
    if (parts.length < 2) {
      throw new Error('Invalid public key format');
    }

    const keyData = parts[1];

    const hash = createHash('sha256')
      .update(Buffer.from(keyData, 'base64'))
      .digest('base64');

    return `SHA256:${hash}`;
  }
}
