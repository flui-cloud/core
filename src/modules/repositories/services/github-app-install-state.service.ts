import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface PendingInstall {
  fluiUserId: string;
  cliCallbackUrl?: string;
  createdAt: number;
  expiresAt: number;
}

export interface ConsumedState {
  fluiUserId: string;
  cliCallbackUrl?: string;
}

/**
 * In-process store for OAuth install `state` tokens used to correlate the
 * "Install Flui App" click with the GitHub callback. Entries are consumed
 * on first read (single-use) and auto-evicted after TTL.
 *
 * For multi-instance deployments, swap this for a Redis-backed variant —
 * the public API (`issue` / `consume`) is the same.
 */
@Injectable()
export class GithubAppInstallStateService {
  private readonly logger = new Logger(GithubAppInstallStateService.name);
  private readonly store = new Map<string, PendingInstall>();
  private readonly ttlMs = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // Periodic sweep; cheap at expected volume.
    setInterval(() => this.evictExpired(), 60_000).unref();
  }

  issue(fluiUserId: string, cliCallbackUrl?: string): string {
    const state = randomUUID();
    const now = Date.now();
    this.store.set(state, {
      fluiUserId,
      cliCallbackUrl,
      createdAt: now,
      expiresAt: now + this.ttlMs,
    });
    return state;
  }

  /**
   * Returns the entry and removes it. `null` if the state is missing or
   * expired — caller should reject the callback in that case.
   */
  consume(state: string): ConsumedState | null {
    const entry = this.store.get(state);
    if (!entry) return null;
    this.store.delete(state);
    if (entry.expiresAt < Date.now()) return null;
    return {
      fluiUserId: entry.fluiUserId,
      cliCallbackUrl: entry.cliCallbackUrl,
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
      this.logger.debug(`Evicted ${removed} expired install state entries`);
    }
  }
}
