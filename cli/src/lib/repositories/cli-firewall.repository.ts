import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'node:path';
import { ProfileManager } from '../profile-manager';

interface FirewallStorageFormat {
  firewalls: Array<{
    id: string;
    name: string;
    provider: 'HETZNER' | 'SCALEWAY';
    clusterId: string;
    rules: any[];
    appliedToServerIds: string[];
    sourceCidrs: string[];
    labels: Array<{ key: string; value: string }>;
    createdAt: string;
    updatedAt: string;
  }>;
  metadata: {
    version: string;
    lastSync: string;
  };
}

@Injectable()
export class CliFirewallRepository {
  private readonly dataFile = path.join(
    ProfileManager.getProfileDir(),
    'firewalls.json',
  );
  private readonly logger = new Logger(CliFirewallRepository.name);

  async save(firewall: any): Promise<void> {
    const data = await this.load();

    const index = data.firewalls.findIndex((f) => f.id === firewall.id);
    const now = new Date().toISOString();

    if (index >= 0) {
      data.firewalls[index] = {
        ...firewall,
        updatedAt: now,
      };
      this.logger.log(`Updated firewall ${firewall.name} in storage`);
    } else {
      data.firewalls.push({
        ...firewall,
        createdAt: now,
        updatedAt: now,
      });
      this.logger.log(`Added firewall ${firewall.name} to storage`);
    }

    data.metadata.lastSync = now;
    await this.persist(data);
  }

  async findByClusterId(clusterId: string): Promise<any | null> {
    const data = await this.load();
    const firewall = data.firewalls.find((f) => f.clusterId === clusterId);

    if (firewall) {
      this.logger.debug(
        `Found firewall for cluster ${clusterId}: ${firewall.name}`,
      );
    }

    return firewall || null;
  }

  async findById(id: string): Promise<any | null> {
    const data = await this.load();
    return data.firewalls.find((f) => f.id === id) || null;
  }

  async findByName(name: string): Promise<any | null> {
    const data = await this.load();
    return data.firewalls.find((f) => f.name === name) || null;
  }

  async findAll(): Promise<any[]> {
    const data = await this.load();
    return data.firewalls;
  }

  async findByProvider(provider: 'HETZNER' | 'SCALEWAY'): Promise<any[]> {
    const data = await this.load();
    return data.firewalls.filter((f) => f.provider === provider);
  }

  async delete(id: string): Promise<void> {
    const data = await this.load();
    const initialLength = data.firewalls.length;

    data.firewalls = data.firewalls.filter((f) => f.id !== id);

    if (data.firewalls.length < initialLength) {
      data.metadata.lastSync = new Date().toISOString();
      await this.persist(data);
      this.logger.log(`Deleted firewall ${id} from storage`);
    } else {
      this.logger.warn(`Firewall ${id} not found in storage`);
    }
  }

  private async load(): Promise<FirewallStorageFormat> {
    try {
      if (await fs.pathExists(this.dataFile)) {
        const content = await fs.readJSON(this.dataFile);
        return content;
      }
    } catch (error) {
      this.logger.warn(`Failed to load firewalls storage: ${error.message}`);
    }

    // Return default structure
    return {
      firewalls: [],
      metadata: {
        version: '1.0.0',
        lastSync: new Date().toISOString(),
      },
    };
  }

  private async persist(data: FirewallStorageFormat): Promise<void> {
    const dir = path.dirname(this.dataFile);

    // Ensure directory exists with secure permissions
    await fs.ensureDir(dir);
    await fs.chmod(dir, 0o700);

    // Write file with pretty formatting
    await fs.writeJSON(this.dataFile, data, {
      spaces: 2,
      mode: 0o600, // Read/write for owner only
    });

    this.logger.debug(
      `Persisted ${data.firewalls.length} firewalls to storage`,
    );
  }
}
