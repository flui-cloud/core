import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClusterEntity } from '../entities/cluster.entity';
import { AccessService } from 'src/modules/access/services/access.service';
import { SSHKeyEntity } from 'src/modules/access/entities/ssh-key.entity';

/**
 * Service responsible for cleaning up SSH keys associated with clusters
 * Handles deletion of both cluster-level bootstrap keys and node-level temporary keys
 */
@Injectable()
export class ClusterSshCleanupService {
  private readonly logger = new Logger(ClusterSshCleanupService.name);

  constructor(
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
    @InjectRepository(SSHKeyEntity)
    private readonly sshKeyRepository: Repository<SSHKeyEntity>,
    private readonly accessService: AccessService,
  ) {}

  /**
   * Clean up all SSH keys associated with a cluster
   * This includes:
   * 1. Cluster bootstrap key (shared across all nodes)
   * 2. Individual node bootstrap keys (temporary keys for each node)
   *
   * @param clusterId - The cluster ID
   * @param force - If true, continue cleanup even if some deletions fail
   */
  async cleanupClusterSSHKeys(
    clusterId: string,
    force: boolean = false,
  ): Promise<void> {
    this.logger.log(`Starting SSH key cleanup for cluster ${clusterId}`);

    const cluster = await this.clusterRepository.findOne({
      where: { id: clusterId },
    });

    if (!cluster) {
      this.logger.warn(`Cluster ${clusterId} not found, skipping SSH cleanup`);
      return;
    }

    let deletedCount = 0;
    let failedCount = 0;

    // 1. Delete cluster bootstrap key (if exists)
    if (cluster.bootstrapKeyId) {
      try {
        await this.deleteClusterBootstrapKey(
          cluster.bootstrapKeyId,
          cluster.name,
        );
        deletedCount++;
      } catch (error) {
        failedCount++;
        if (force) {
          this.logger.warn(
            `Failed to delete cluster bootstrap key ${cluster.bootstrapKeyId} (force mode, continuing): ${error.message}`,
          );
        } else {
          this.logger.error(
            `Failed to delete cluster bootstrap key ${cluster.bootstrapKeyId}: ${error.message}`,
          );
          throw error;
        }
      }
    } else {
      this.logger.debug(
        `No cluster bootstrap key found for cluster ${cluster.name}`,
      );
    }

    // 2. Delete all node bootstrap keys (temporary keys)
    try {
      const nodeKeysDeleted = await this.deleteNodeBootstrapKeys(
        clusterId,
        cluster.name,
        force,
      );
      deletedCount += nodeKeysDeleted;
    } catch (error) {
      failedCount++;
      if (force) {
        this.logger.warn(
          `Failed to delete some node bootstrap keys (force mode, continuing): ${error.message}`,
        );
      } else {
        throw error;
      }
    }

    this.logger.log(
      `SSH key cleanup completed for cluster ${cluster.name}: ${deletedCount} deleted, ${failedCount} failed`,
    );
  }

  /**
   * Delete the cluster-level bootstrap key
   * This key is referenced in cluster.bootstrapKeyId
   */
  private async deleteClusterBootstrapKey(
    bootstrapKeyId: string,
    clusterName: string,
  ): Promise<void> {
    this.logger.log(
      `Deleting cluster bootstrap key ${bootstrapKeyId} for cluster ${clusterName}`,
    );

    try {
      // AccessService.removeSSHKey handles both provider and database deletion
      await this.accessService.removeSSHKey('system', bootstrapKeyId);

      this.logger.log(
        `Cluster bootstrap key ${bootstrapKeyId} deleted successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete cluster bootstrap key ${bootstrapKeyId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Find and delete all node-level bootstrap keys for a cluster
   * These are temporary keys created for each node during provisioning
   *
   * IMPROVED: Uses multiple strategies to find keys:
   * 1. Tags with 'cluster-id' (new approach)
   * 2. Metadata with 'clusterId' (legacy approach)
   * 3. Name pattern matching (fallback)
   * 4. Uses providerKeyMappings for reliable provider cleanup
   */
  private async deleteNodeBootstrapKeys(
    clusterId: string,
    clusterName: string,
    force: boolean,
  ): Promise<number> {
    this.logger.log(
      `Searching for node bootstrap keys for cluster ${clusterId}`,
    );

    // Strategy 1: Find keys with tags['cluster-id'] = clusterId
    const keysByTags = await this.sshKeyRepository
      .createQueryBuilder('key')
      .where(
        `key.tags->>'cluster-id' = :clusterId AND key.tags->>'purpose' = 'bootstrap'`,
        { clusterId },
      )
      .getMany();

    this.logger.debug(`Found ${keysByTags.length} keys via tags['cluster-id']`);

    // Strategy 2: Find keys with metadata.clusterId = clusterId (legacy)
    // This catches keys created with metadata instead of tags
    const keysByMetadata = await this.sshKeyRepository
      .createQueryBuilder('key')
      .where(
        `(key.tags->>'clusterId' = :clusterId OR key.tags->>'cluster-id' = :clusterId)`,
        { clusterId },
      )
      .getMany();

    this.logger.debug(`Found ${keysByMetadata.length} keys via metadata/tags`);

    // Strategy 3: Find keys by name pattern (additional safety net)
    const keysByName = await this.sshKeyRepository
      .createQueryBuilder('key')
      .where(`key.name LIKE :pattern AND key.autoGenerated = true`, {
        pattern: `flui-bootstrap-${clusterName}%`,
      })
      .getMany();

    this.logger.debug(
      `Found ${keysByName.length} keys via name pattern 'flui-bootstrap-${clusterName}%'`,
    );

    // Combine and deduplicate keys by ID
    const allKeysMap = new Map<string, SSHKeyEntity>();

    [...keysByTags, ...keysByMetadata, ...keysByName].forEach((key) => {
      allKeysMap.set(key.id, key);
    });

    const nodeKeys = Array.from(allKeysMap.values());

    if (nodeKeys.length === 0) {
      this.logger.debug(
        `No node bootstrap keys found for cluster ${clusterName}`,
      );
      return 0;
    }

    this.logger.log(
      `Found ${nodeKeys.length} unique node bootstrap keys to delete for cluster ${clusterName}`,
    );

    let deletedCount = 0;
    const errors: string[] = [];

    for (const key of nodeKeys) {
      try {
        this.logger.debug(
          `Deleting node bootstrap key ${key.name} (${key.id})`,
        );

        // AccessService.removeSSHKey uses providerKeyMappings for provider cleanup
        await this.accessService.removeSSHKey('system', key.id);

        deletedCount++;
        this.logger.log(`Node bootstrap key ${key.name} deleted successfully`);
      } catch (error) {
        const errorMsg = `Failed to delete node bootstrap key ${key.name}: ${error.message}`;
        errors.push(errorMsg);

        if (force) {
          this.logger.warn(`${errorMsg} (force mode, continuing)`);
        } else {
          this.logger.error(errorMsg);
          throw new Error(
            `Failed to delete node bootstrap key ${key.name}: ${error.message}`,
          );
        }
      }
    }

    if (errors.length > 0 && !force) {
      throw new Error(
        `Failed to delete ${errors.length} node bootstrap keys:\n${errors.join('\n')}`,
      );
    }

    return deletedCount;
  }

  /**
   * Find orphaned SSH keys (keys with expired or missing cluster references)
   * Useful for cleanup operations and maintenance
   *
   * @returns List of orphaned SSH key IDs
   */
  async findOrphanedBootstrapKeys(): Promise<SSHKeyEntity[]> {
    this.logger.log('Searching for orphaned bootstrap keys');

    // Find all keys marked as temporary or bootstrap purpose
    const bootstrapKeys = await this.sshKeyRepository
      .createQueryBuilder('key')
      .where(
        `key.tags->>'purpose' = 'bootstrap' OR key.tags->>'auto-generated' = 'true'`,
      )
      .getMany();

    const orphaned: SSHKeyEntity[] = [];

    for (const key of bootstrapKeys) {
      // Check if the cluster still exists
      const clusterId = key.tags?.['cluster-id'] || key.tags?.['clusterId'];

      if (!clusterId) {
        // No cluster reference, consider orphaned
        orphaned.push(key);
        continue;
      }

      const cluster = await this.clusterRepository.findOne({
        where: { id: clusterId as string },
      });

      if (!cluster) {
        // Cluster doesn't exist, key is orphaned
        orphaned.push(key);
      }

      // Check if key has expired (if expiresAt is set in tags)
      if (key.tags?.['expiresAt']) {
        const expiryDate = new Date(key.tags['expiresAt'] as string);
        if (expiryDate < new Date()) {
          orphaned.push(key);
        }
      }
    }

    this.logger.log(`Found ${orphaned.length} orphaned bootstrap keys`);
    return orphaned;
  }

  /**
   * Clean up orphaned bootstrap keys
   * This can be used as a maintenance operation
   */
  async cleanupOrphanedBootstrapKeys(force: boolean = true): Promise<number> {
    this.logger.log('Starting cleanup of orphaned bootstrap keys');

    const orphanedKeys = await this.findOrphanedBootstrapKeys();

    if (orphanedKeys.length === 0) {
      this.logger.log('No orphaned bootstrap keys found');
      return 0;
    }

    let deletedCount = 0;

    for (const key of orphanedKeys) {
      try {
        await this.accessService.removeSSHKey('system', key.id);
        deletedCount++;
        this.logger.log(
          `Deleted orphaned bootstrap key ${key.name} (${key.id})`,
        );
      } catch (error) {
        if (force) {
          this.logger.warn(
            `Failed to delete orphaned key ${key.name} (force mode, continuing): ${error.message}`,
          );
        } else {
          this.logger.error(
            `Failed to delete orphaned key ${key.name}: ${error.message}`,
          );
        }
      }
    }

    this.logger.log(
      `Orphaned bootstrap key cleanup completed: ${deletedCount}/${orphanedKeys.length} deleted`,
    );
    return deletedCount;
  }
}
