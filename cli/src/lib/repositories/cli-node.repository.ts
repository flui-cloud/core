import { Injectable, Logger } from '@nestjs/common';
import { ClusterNodeEntity } from 'src/modules/infrastructure/clusters/entities/cluster-node.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { ProfileManager } from '../profile-manager';

/**
 * File-based ClusterNode Repository for CLI
 *
 * Persists cluster node data in the active profile directory.
 * Provides TypeORM-like interface without requiring database.
 */
@Injectable()
export class CliNodeRepository {
  private readonly logger = new Logger(CliNodeRepository.name);
  private readonly dataDir: string;
  private readonly dataFile: string;

  constructor() {
    this.dataDir = ProfileManager.getProfileDir();
    this.dataFile = path.join(this.dataDir, 'nodes.json');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true, mode: 0o700 });
    }
  }

  private loadNodes(): ClusterNodeEntity[] {
    if (!fs.existsSync(this.dataFile)) {
      return [];
    }

    try {
      const data = fs.readFileSync(this.dataFile, 'utf-8');
      const nodes = JSON.parse(data);

      return nodes.map((node: any) => {
        const entity = new ClusterNodeEntity();
        Object.assign(entity, node);

        if (node.createdAt) entity.createdAt = new Date(node.createdAt);
        if (node.updatedAt) entity.updatedAt = new Date(node.updatedAt);

        return entity;
      });
    } catch (error) {
      this.logger.error(`Failed to load nodes from ${this.dataFile}:`, error);
      return [];
    }
  }

  private saveNodes(nodes: ClusterNodeEntity[]): void {
    try {
      const data = JSON.stringify(nodes, null, 2);
      fs.writeFileSync(this.dataFile, data, { encoding: 'utf-8', mode: 0o600 });
      this.logger.debug(`Saved ${nodes.length} nodes to ${this.dataFile}`);
    } catch (error) {
      this.logger.error(`Failed to save nodes to ${this.dataFile}:`, error);
      throw error;
    }
  }

  create(data: Partial<ClusterNodeEntity>): ClusterNodeEntity {
    const entity = new ClusterNodeEntity();
    Object.assign(entity, data);
    return entity;
  }

  async findOne(options?: {
    where?: Partial<ClusterNodeEntity>;
  }): Promise<ClusterNodeEntity | null> {
    const matches = await this.find(options);
    return matches[0] ?? null;
  }

  async find(options?: {
    where?: Partial<ClusterNodeEntity>;
  }): Promise<ClusterNodeEntity[]> {
    let nodes = this.loadNodes();

    if (options?.where) {
      nodes = nodes.filter((node) => {
        return Object.entries(options.where).every(([key, value]) => {
          return (node as any)[key] === value;
        });
      });
    }

    return nodes;
  }

  async save(
    node: ClusterNodeEntity | ClusterNodeEntity[],
  ): Promise<ClusterNodeEntity | ClusterNodeEntity[]> {
    const nodes = this.loadNodes();
    const nodesToSave = Array.isArray(node) ? node : [node];
    const isArray = Array.isArray(node);

    for (const n of nodesToSave) {
      if (!n.id) {
        n.id = this.generateId();
        n.createdAt = new Date();
      }

      n.updatedAt = new Date();

      const index = nodes.findIndex((existing) => existing.id === n.id);
      if (index >= 0) {
        nodes[index] = n;
        this.logger.debug(`Updated node ${n.id}`);
      } else {
        nodes.push(n);
        this.logger.debug(`Created node ${n.id}`);
      }
    }

    this.saveNodes(nodes);
    return isArray ? nodesToSave : nodesToSave[0];
  }

  async remove(node: ClusterNodeEntity): Promise<ClusterNodeEntity> {
    const nodes = this.loadNodes();
    const filtered = nodes.filter((n) => n.id !== node.id);

    if (filtered.length < nodes.length) {
      this.saveNodes(filtered);
      this.logger.debug(`Deleted node ${node.id}`);
    }

    return node;
  }

  private generateId(): string {
    return uuidv4();
  }
}
