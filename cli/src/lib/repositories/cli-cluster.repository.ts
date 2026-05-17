import { Injectable, Logger } from '@nestjs/common';
import { ClusterEntity } from 'src/modules/infrastructure/clusters/entities/cluster.entity';
import { ClusterNodeEntity } from 'src/modules/infrastructure/clusters/entities/cluster-node.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { ProfileManager } from '../profile-manager';

/**
 * File-based Cluster Repository for CLI
 *
 * Persists cluster data in ~/.flui/clusters.json
 * Provides TypeORM-like interface without requiring database
 */
@Injectable()
export class CliClusterRepository {
  private readonly logger = new Logger(CliClusterRepository.name);
  private readonly dataDir: string;
  private readonly dataFile: string;

  constructor() {
    this.dataDir = ProfileManager.getProfileDir();
    this.dataFile = path.join(this.dataDir, 'clusters.json');
    this.ensureDataDir();
  }

  /**
   * Ensure profile directory exists
   */
  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Load all clusters from file
   */
  private loadClusters(): ClusterEntity[] {
    if (!fs.existsSync(this.dataFile)) {
      return [];
    }

    try {
      const data = fs.readFileSync(this.dataFile, 'utf-8');
      const clusters = JSON.parse(data);

      // Convert plain objects to ClusterEntity instances
      return clusters.map((cluster: any) => {
        const entity = new ClusterEntity();
        Object.assign(entity, cluster);

        // Convert nodes to ClusterNodeEntity instances
        if (cluster.nodes) {
          entity.nodes = cluster.nodes.map((node: any) => {
            const nodeEntity = new ClusterNodeEntity();
            Object.assign(nodeEntity, node);
            return nodeEntity;
          });
        }

        return entity;
      });
    } catch (error) {
      this.logger.error(
        `Failed to load clusters from ${this.dataFile}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Save all clusters to file
   */
  private saveClusters(clusters: ClusterEntity[]): void {
    try {
      const data = JSON.stringify(clusters, null, 2);
      fs.writeFileSync(this.dataFile, data, { encoding: 'utf-8', mode: 0o600 });
      this.logger.debug(
        `Saved ${clusters.length} clusters to ${this.dataFile}`,
      );
    } catch (error) {
      this.logger.error(`Failed to save clusters to ${this.dataFile}:`, error);
      throw error;
    }
  }

  /**
   * Create a new cluster entity (doesn't save to file yet)
   * This mimics TypeORM's Repository.create() method
   */
  create(data: Partial<ClusterEntity>): ClusterEntity {
    const entity = new ClusterEntity();
    Object.assign(entity, data);
    return entity;
  }

  /**
   * Find one cluster by criteria
   */
  async findOne(options: {
    where?: Partial<ClusterEntity>;
    relations?: string[];
  }): Promise<ClusterEntity | null> {
    const clusters = this.loadClusters();

    if (!options.where) {
      return clusters.length > 0 ? clusters[0] : null;
    }

    const cluster = clusters.find((c) => {
      // Match all where conditions
      return Object.entries(options.where).every(([key, value]) => {
        // Handle nested metadata matching
        if (key === 'metadata' && typeof value === 'object') {
          return Object.entries(value).every(([metaKey, metaValue]) => {
            return c.metadata?.[metaKey] === metaValue;
          });
        }
        return (c as any)[key] === value;
      });
    });

    return cluster || null;
  }

  /**
   * Find all clusters matching criteria
   */
  async find(options?: {
    where?: Partial<ClusterEntity>;
    relations?: string[];
  }): Promise<ClusterEntity[]> {
    const clusters = this.loadClusters();

    if (!options?.where) {
      return clusters;
    }

    return clusters.filter((c) => {
      return Object.entries(options.where).every(([key, value]) => {
        if (key === 'metadata' && typeof value === 'object') {
          return Object.entries(value).every(([metaKey, metaValue]) => {
            return c.metadata?.[metaKey] === metaValue;
          });
        }
        return (c as any)[key] === value;
      });
    });
  }

  /**
   * Save cluster (create or update)
   */
  async save(cluster: ClusterEntity): Promise<ClusterEntity> {
    const clusters = this.loadClusters();

    // Generate ID if new cluster
    if (!cluster.id) {
      cluster.id = this.generateId();
      cluster.createdAt = new Date();
    }

    cluster.updatedAt = new Date();

    // Find and replace existing, or add new
    const index = clusters.findIndex((c) => c.id === cluster.id);
    if (index >= 0) {
      clusters[index] = cluster;
      this.logger.debug(`Updated cluster ${cluster.id}`);
    } else {
      clusters.push(cluster);
      this.logger.debug(`Created cluster ${cluster.id}`);
    }

    this.saveClusters(clusters);
    return cluster;
  }

  /**
   * Delete cluster
   */
  async remove(cluster: ClusterEntity): Promise<ClusterEntity> {
    const clusters = this.loadClusters();
    const filtered = clusters.filter((c) => c.id !== cluster.id);

    if (filtered.length < clusters.length) {
      this.saveClusters(filtered);
      this.logger.debug(`Deleted cluster ${cluster.id}`);
    }

    return cluster;
  }

  /**
   * Generate unique ID (UUID v4, compatible with PostgreSQL)
   */
  private generateId(): string {
    return uuidv4();
  }
}
