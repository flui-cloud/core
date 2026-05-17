import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

export type CatalogSecretFormat = 'base64url' | 'hex';

@Injectable()
export class CatalogSecretGeneratorService {
  generate(length: number, format: CatalogSecretFormat = 'base64url'): string {
    if (length < 8 || length > 256) {
      throw new Error(
        `Invalid secret length ${length}: must be between 8 and 256`,
      );
    }
    if (format === 'hex') {
      // Hex uses 2 chars per byte, so ceil(length/2) bytes are enough to
      // produce at least `length` hex chars; slice to the exact length.
      const bytes = randomBytes(Math.ceil(length / 2));
      return bytes.toString('hex').slice(0, length);
    }
    // base64url (default)
    const bytes = randomBytes(length);
    return bytes.toString('base64url').slice(0, length);
  }
}
