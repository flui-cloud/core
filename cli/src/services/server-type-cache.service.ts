import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { NodeSizeDto } from '../../../src/modules/providers/dto/node-size.dto';

interface ServerTypeCacheData {
  provider: string;
  timestamp: string;
  ttlHours: number;
  serverTypes: NodeSizeDto[];
}

export class ServerTypeCacheService {
  private readonly cacheDir: string;
  private readonly defaultTtlHours = 12;

  constructor() {
    const homeDir = os.homedir();
    this.cacheDir = path.join(homeDir, '.flui', 'cache');
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getCacheFilePath(provider: string): string {
    return path.join(this.cacheDir, `server-types-${provider}.json`);
  }

  /**
   * Get cached server types if available and not expired
   */
  async get(provider: string): Promise<NodeSizeDto[] | null> {
    try {
      const filePath = this.getCacheFilePath(provider);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const cacheData: ServerTypeCacheData = JSON.parse(fileContent);

      // Check if cache is expired
      if (this.isCacheExpired(cacheData)) {
        return null;
      }

      return cacheData.serverTypes;
    } catch {
      // If there's any error reading/parsing cache, treat as cache miss
      return null;
    }
  }

  /**
   * Save server types to cache
   */
  async set(provider: string, serverTypes: NodeSizeDto[]): Promise<void> {
    try {
      const cacheData: ServerTypeCacheData = {
        provider,
        timestamp: new Date().toISOString(),
        ttlHours: this.defaultTtlHours,
        serverTypes,
      };

      const filePath = this.getCacheFilePath(provider);
      fs.writeFileSync(filePath, JSON.stringify(cacheData, null, 2), 'utf-8');
    } catch (error) {
      // Silently fail - cache is not critical
      console.warn(`Failed to write server types cache: ${error.message}`);
    }
  }

  /**
   * Clear cache for a specific provider
   */
  async clear(provider: string): Promise<void> {
    try {
      const filePath = this.getCacheFilePath(provider);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`Failed to clear cache: ${error.message}`);
    }
  }

  /**
   * Clear all server type caches
   */
  async clearAll(): Promise<void> {
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.startsWith('server-types-') && file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
    } catch (error) {
      console.warn(`Failed to clear all caches: ${error.message}`);
    }
  }

  /**
   * Get cache metadata (timestamp, TTL)
   */
  async getCacheInfo(provider: string): Promise<{
    exists: boolean;
    timestamp?: Date;
    expiresAt?: Date;
    isExpired?: boolean;
  }> {
    try {
      const filePath = this.getCacheFilePath(provider);

      if (!fs.existsSync(filePath)) {
        return { exists: false };
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const cacheData: ServerTypeCacheData = JSON.parse(fileContent);
      const timestamp = new Date(cacheData.timestamp);
      const expiresAt = new Date(
        timestamp.getTime() + cacheData.ttlHours * 60 * 60 * 1000,
      );

      return {
        exists: true,
        timestamp,
        expiresAt,
        isExpired: this.isCacheExpired(cacheData),
      };
    } catch {
      return { exists: false };
    }
  }

  private isCacheExpired(cacheData: ServerTypeCacheData): boolean {
    const timestamp = new Date(cacheData.timestamp);
    const expiresAt = new Date(
      timestamp.getTime() + cacheData.ttlHours * 60 * 60 * 1000,
    );
    return new Date() > expiresAt;
  }
}
