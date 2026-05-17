import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import Redis from 'ioredis';
import { execSync } from 'node:child_process';
import {
  ClusterEntity,
  ClusterStatus,
  ClusterType,
} from '../../infrastructure/clusters/entities/cluster.entity';
import { DeploymentMode } from './enums/deployment-mode.enum';
import {
  HealthCheckResult,
  StartupCheckResult,
} from './interfaces/health-check-result.interface';

@Injectable()
export class StartupHealthCheckService {
  private readonly logger = new Logger(StartupHealthCheckService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ClusterEntity)
    private readonly clusterRepository: Repository<ClusterEntity>,
  ) {}

  async performStartupChecks(): Promise<StartupCheckResult> {
    const skipChecks = this.configService.get<boolean>(
      'SKIP_STARTUP_CHECKS',
      false,
    );

    if (skipChecks) {
      this.logger.warn('⚠️  Startup health checks are DISABLED');
      return { success: true, checks: [] };
    }

    const deploymentMode = this.getDeploymentMode();
    this.logger.log(
      `🔍 Running startup health checks (mode: ${deploymentMode})`,
    );

    // Soft system check (warning-only, does not block startup).
    this.checkFileDescriptorLimit();

    const checks: HealthCheckResult[] = [];

    // Check PostgreSQL connection
    const postgresCheck = await this.checkPostgresConnection();
    checks.push(postgresCheck);

    // Check Redis connection
    const redisCheck = await this.checkRedisConnection();
    checks.push(redisCheck);

    // Check observability cluster (only in cluster mode)
    if (deploymentMode === DeploymentMode.CLUSTER) {
      const clusterCheck = await this.checkObservabilityCluster();
      checks.push(clusterCheck);
    }

    const failedChecks = checks.filter((c) => !c.success);

    if (failedChecks.length > 0) {
      const errorMessage = this.formatErrorMessage(
        failedChecks,
        deploymentMode,
      );
      return {
        success: false,
        checks,
        errorMessage,
      };
    }

    this.logger.log('✅ All startup health checks passed');
    return { success: true, checks };
  }

  /**
   * Warn (don't fail) when the OS-level file descriptor soft limit is
   * below what Nest needs in dev watch mode. macOS ships with a per-process
   * default of 256 which is nowhere near enough for webpack + chokidar on
   * a mid-size project, and surfaces as `EMFILE: too many open files, watch`
   * a few seconds after `nest start --watch` kicks in.
   *
   * Under production load the same limit can also cause sporadic connection
   * errors, so the warning fires regardless of deployment mode — the fix is
   * the same everywhere (`ulimit -n 10240`).
   */
  private checkFileDescriptorLimit(): void {
    if (process.platform === 'win32') return;
    try {
      const raw = execSync('sh -c "ulimit -n"', {
        encoding: 'utf-8',
        timeout: 2000,
      }).trim();
      const limit = Number.parseInt(raw, 10);
      if (!Number.isFinite(limit) || limit <= 0) return;
      if (limit >= 1024) return;

      this.logger.warn(
        `⚠️  File descriptor soft limit is ${limit} (macOS default is 256). ` +
          `This can trigger EMFILE: too many open files errors with the nest ` +
          `dev watcher and under load. Fix: run "ulimit -n 10240" before ` +
          `starting, or append it to ~/.zshrc to make it permanent.`,
      );
    } catch {
      // Non-critical: some sandboxed environments block execSync. Skip.
    }
  }

  private getDeploymentMode(): DeploymentMode {
    const mode = this.configService
      .get<string>('DEPLOYMENT_MODE', 'local')
      .toLowerCase();

    if (mode === 'cluster') {
      return DeploymentMode.CLUSTER;
    }

    return DeploymentMode.LOCAL;
  }

  private async checkPostgresConnection(): Promise<HealthCheckResult> {
    try {
      // TypeORM connection is already established by the time this runs
      // We just need to verify the repository is accessible
      const count = await this.clusterRepository.count();

      return {
        success: true,
        service: 'PostgreSQL',
        details: {
          host: this.configService.get('DB_HOST', 'localhost'),
          port: this.configService.get('DB_PORT', 5432),
          database: this.configService.get('DB_NAME', 'myapp_dev'),
          recordCount: count,
        },
      };
    } catch (error) {
      return {
        success: false,
        service: 'PostgreSQL',
        error: error.message,
        details: {
          host: this.configService.get('DB_HOST', 'localhost'),
          port: this.configService.get('DB_PORT', 5432),
          database: this.configService.get('DB_NAME', 'myapp_dev'),
        },
      };
    }
  }

  private async checkRedisConnection(): Promise<HealthCheckResult> {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    let redis: Redis;

    try {
      redis = new Redis({
        host,
        port,
        password,
        connectTimeout: 5000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't retry, fail fast
      });

      await redis.ping();
      await redis.quit();

      return {
        success: true,
        service: 'Redis',
        details: { host, port },
      };
    } catch (error) {
      if (redis) {
        redis.disconnect();
      }

      return {
        success: false,
        service: 'Redis',
        error: error.code || error.message,
        details: { host, port },
      };
    }
  }

  private async checkObservabilityCluster(): Promise<HealthCheckResult> {
    try {
      const cluster = await this.clusterRepository.findOne({
        where: [
          { clusterType: ClusterType.OBSERVABILITY },
          {
            metadata: Raw((alias) => `${alias} ->> 'purpose' = :purpose`, {
              purpose: 'observability',
            }),
          },
        ],
        relations: ['nodes'],
      });

      if (!cluster) {
        // Not yet registered — this is normal on first startup of the observability cluster itself.
        // The cluster record is created by the CLI after the API is already running.
        this.logger.warn(
          '⚠️  No observability cluster found in DB — first startup or not yet registered via CLI',
        );
        return {
          success: true,
          service: 'Observability Cluster',
          details: {
            message: 'Not yet registered (first startup)',
          },
        };
      }

      if (cluster.status === ClusterStatus.DELETED) {
        return {
          success: false,
          service: 'Observability Cluster',
          error: 'DELETED',
          details: {
            clusterId: cluster.id,
            message: 'Observability cluster has been deleted',
          },
        };
      }

      if (cluster.status !== ClusterStatus.READY) {
        return {
          success: false,
          service: 'Observability Cluster',
          error: 'NOT_READY',
          details: {
            clusterId: cluster.id,
            currentStatus: cluster.status,
            expectedStatus: ClusterStatus.READY,
          },
        };
      }

      return {
        success: true,
        service: 'Observability Cluster',
        details: {
          clusterId: cluster.id,
          status: cluster.status,
          nodeCount: cluster.nodes?.length || 0,
          masterIp: cluster.masterIpAddress,
        },
      };
    } catch (error) {
      return {
        success: false,
        service: 'Observability Cluster',
        error: error.message,
      };
    }
  }

  private formatErrorMessage(
    failedChecks: HealthCheckResult[],
    deploymentMode: DeploymentMode,
  ): string {
    const lines: string[] = [];

    lines.push(
      '',
      '━'.repeat(70),
      '  🚨 STARTUP FAILED: Health Checks Failed',
      '━'.repeat(70),
      '',
    );

    for (const check of failedChecks) {
      if (check.service === 'PostgreSQL') {
        lines.push(
          `❌ PostgreSQL Connection Failed`,
          '',
          `   Host: ${check.details?.host}:${check.details?.port}`,
          `   Database: ${check.details?.database}`,
          `   Error: ${check.error}`,
          '',
        );
      }

      if (check.service === 'Redis') {
        lines.push(
          `❌ Redis Connection Failed`,
          '',
          `   Host: ${check.details?.host}:${check.details?.port}`,
          `   Error: ${check.error}`,
          '',
        );
      }

      if (check.service === 'Observability Cluster') {
        if (check.error === 'NOT_FOUND') {
          lines.push(
            `❌ Observability Cluster Not Found`,
            '',
            `   Deployment Mode: ${deploymentMode}`,
            '',
          );
        } else if (check.error === 'NOT_READY') {
          lines.push(
            `❌ Observability Cluster Not Ready`,
            '',
            `   Cluster ID: ${check.details?.clusterId}`,
            `   Current Status: ${check.details?.currentStatus}`,
            `   Expected Status: ${check.details?.expectedStatus}`,
            '',
          );
        } else if (check.error === 'DELETED') {
          lines.push(
            `❌ Observability Cluster Deleted`,
            '',
            `   Cluster ID: ${check.details?.clusterId}`,
            '',
          );
        } else {
          lines.push(
            `❌ Observability Cluster Error`,
            '',
            `   Error: ${check.error}`,
            '',
          );
        }
      }
    }

    lines.push('━'.repeat(70), '');

    return lines.join('\n');
  }
}
