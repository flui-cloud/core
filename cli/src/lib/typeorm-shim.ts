/**
 * TypeORM Shim for CLI
 *
 * Provides getRepositoryToken() function without requiring @nestjs/typeorm dependency.
 * This allows us to provide repository tokens for dependency injection
 * without actually loading TypeORM or connecting to a database.
 */

/**
 * Generate TypeORM repository token for an entity
 * This mimics @nestjs/typeorm's getRepositoryToken() function
 */
export function getRepositoryToken(entity: Function): string {
  return `${entity.name}Repository`;
}
