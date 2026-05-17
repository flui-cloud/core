import { Injectable, Logger } from '@nestjs/common';
import { InfrastructureOperationEntity } from 'src/modules/infrastructure/servers/entities/infrastructure-operations.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { ProfileManager } from '../profile-manager';

/**
 * File-based Operation Repository for CLI
 *
 * Persists infrastructure operation data in ~/.flui/operations.json
 * Provides TypeORM-like interface without requiring database
 */
@Injectable()
export class CliOperationRepository {
  private readonly logger = new Logger(CliOperationRepository.name);
  private readonly dataDir: string;
  private readonly dataFile: string;

  constructor() {
    this.dataDir = ProfileManager.getProfileDir();
    this.dataFile = path.join(this.dataDir, 'operations.json');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Load all operations from file
   */
  private loadOperations(): InfrastructureOperationEntity[] {
    if (!fs.existsSync(this.dataFile)) {
      return [];
    }

    try {
      const data = fs.readFileSync(this.dataFile, 'utf-8');
      const operations = JSON.parse(data);

      // Convert plain objects to InfrastructureOperationEntity instances
      return operations.map((op: any) => {
        const entity = new InfrastructureOperationEntity();
        Object.assign(entity, op);

        // Parse dates
        if (op.createdAt) entity.createdAt = new Date(op.createdAt);
        if (op.updatedAt) entity.updatedAt = new Date(op.updatedAt);

        return entity;
      });
    } catch (error) {
      this.logger.error(
        `Failed to load operations from ${this.dataFile}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Save all operations to file
   */
  private saveOperations(operations: InfrastructureOperationEntity[]): void {
    try {
      const data = JSON.stringify(operations, null, 2);
      fs.writeFileSync(this.dataFile, data, { encoding: 'utf-8', mode: 0o600 });
      this.logger.debug(
        `Saved ${operations.length} operations to ${this.dataFile}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to save operations to ${this.dataFile}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create a new operation entity (doesn't save to file yet)
   * This mimics TypeORM's Repository.create() method
   */
  create(
    data: Partial<InfrastructureOperationEntity>,
  ): InfrastructureOperationEntity {
    const entity = new InfrastructureOperationEntity();
    Object.assign(entity, data);
    return entity;
  }

  /**
   * Find one operation by criteria
   */
  async findOne(options: {
    where?: Partial<InfrastructureOperationEntity>;
    order?: { [key: string]: 'ASC' | 'DESC' };
  }): Promise<InfrastructureOperationEntity | null> {
    let operations = this.loadOperations();

    // Filter by where clause
    if (options.where) {
      operations = operations.filter((op) => {
        return Object.entries(options.where).every(([key, value]) => {
          return (op as any)[key] === value;
        });
      });
    }

    // Apply ordering
    if (options.order) {
      const [[orderKey, orderDir]] = Object.entries(options.order);
      operations.sort((a, b) => {
        const aVal = (a as any)[orderKey];
        const bVal = (b as any)[orderKey];
        let comparison = 0;
        if (aVal > bVal) comparison = 1;
        else if (aVal < bVal) comparison = -1;
        return orderDir === 'ASC' ? comparison : -comparison;
      });
    }

    return operations.length > 0 ? operations[0] : null;
  }

  /**
   * Find all operations matching criteria
   */
  async find(options?: {
    where?: Partial<InfrastructureOperationEntity>;
    order?: { [key: string]: 'ASC' | 'DESC' };
  }): Promise<InfrastructureOperationEntity[]> {
    let operations = this.loadOperations();

    // Filter by where clause
    if (options?.where) {
      operations = operations.filter((op) => {
        return Object.entries(options.where).every(([key, value]) => {
          return (op as any)[key] === value;
        });
      });
    }

    // Apply ordering
    if (options?.order) {
      const [[orderKey, orderDir]] = Object.entries(options.order);
      operations.sort((a, b) => {
        const aVal = (a as any)[orderKey];
        const bVal = (b as any)[orderKey];
        let comparison = 0;
        if (aVal > bVal) comparison = 1;
        else if (aVal < bVal) comparison = -1;
        return orderDir === 'ASC' ? comparison : -comparison;
      });
    }

    return operations;
  }

  /**
   * Save operation (create or update)
   */
  async save(
    operation: InfrastructureOperationEntity,
  ): Promise<InfrastructureOperationEntity> {
    const operations = this.loadOperations();

    // Generate ID if new operation
    if (!operation.id) {
      operation.id = this.generateId();
      operation.createdAt = new Date();
    }

    operation.updatedAt = new Date();

    // Find and replace existing, or add new
    const index = operations.findIndex((op) => op.id === operation.id);
    if (index >= 0) {
      operations[index] = operation;
      this.logger.debug(`Updated operation ${operation.id}`);
    } else {
      operations.push(operation);
      this.logger.debug(`Created operation ${operation.id}`);
    }

    this.saveOperations(operations);
    return operation;
  }

  /**
   * Delete operation
   */
  async remove(
    operation: InfrastructureOperationEntity,
  ): Promise<InfrastructureOperationEntity> {
    const operations = this.loadOperations();
    const filtered = operations.filter((op) => op.id !== operation.id);

    if (filtered.length < operations.length) {
      this.saveOperations(filtered);
      this.logger.debug(`Deleted operation ${operation.id}`);
    }

    return operation;
  }

  /**
   * Generate unique ID (UUID v4, compatible with PostgreSQL)
   */
  private generateId(): string {
    return uuidv4();
  }
}
