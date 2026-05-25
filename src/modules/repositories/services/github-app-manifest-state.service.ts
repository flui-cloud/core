import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface PendingManifest {
  fluiUserId: string;
  callbackUrl: string;
  createdAt: number;
  expiresAt: number;
}

export interface ConsumedManifestState {
  fluiUserId: string;
  callbackUrl: string;
}

/**
 * In-process store for GitHub App manifest `state` tokens used to correlate
 * the "Create on GitHub" submission with the manifest-conversion callback.
 * Single-use, auto-evicted after TTL.
 */
@Injectable()
export class GithubAppManifestStateService {
  private readonly logger = new Logger(GithubAppManifestStateService.name);
  private readonly store = new Map<string, PendingManifest>();
  private readonly ttlMs = 10 * 60 * 1000;

  constructor() {
    setInterval(() => this.evictExpired(), 60_000).unref();
  }

  issue(fluiUserId: string, callbackUrl: string): string {
    const state = randomUUID();
    const now = Date.now();
    this.store.set(state, {
      fluiUserId,
      callbackUrl,
      createdAt: now,
      expiresAt: now + this.ttlMs,
    });
    return state;
  }

  consume(state: string): ConsumedManifestState | null {
    const entry = this.store.get(state);
    if (!entry) return null;
    this.store.delete(state);
    if (entry.expiresAt < Date.now()) return null;
    return {
      fluiUserId: entry.fluiUserId,
      callbackUrl: entry.callbackUrl,
    };
  }

  private evictExpired(): void {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      this.logger.debug(`Evicted ${removed} expired manifest state entries`);
    }
  }
}
