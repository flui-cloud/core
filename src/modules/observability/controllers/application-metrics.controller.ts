import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApplicationMetricsService } from '../services/application-metrics.service';
import { ApplicationService } from '../../applications/services/application.service';
import {
  SingleAppMetricsResponseDto,
  ClusterAppsMetricsResponseDto,
  SingleAppMetricsHistoryResponseDto,
  ClusterAppsMetricsHistoryResponseDto,
} from '../dto/application-metrics.dto';
import { MetricsHistoryQueryDto } from '../dto/server-metrics-response.dto';

/**
 * Application Metrics Controller
 *
 * Provides metrics endpoints for Flui-managed applications.
 * Queries pre-computed flui:* recording rules from Prometheus.
 */
@ApiTags('Application Metrics')
@ApiBearerAuth()
@Controller('observability')
export class ApplicationMetricsController {
  private readonly logger = new Logger(ApplicationMetricsController.name);

  constructor(
    private readonly appMetricsService: ApplicationMetricsService,
    private readonly applicationService: ApplicationService,
  ) {}

  /**
   * Get instant metrics for a single application
   */
  @Get('applications/:appId/metrics')
  @ApiOperation({
    summary: 'Get application metrics',
    description:
      'Returns instant CPU, memory, network, replica, and pod metrics ' +
      'for a single application. Queries pre-computed flui:* recording rules from Prometheus.',
  })
  @ApiParam({ name: 'appId', description: 'Application ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Application metrics retrieved successfully',
    type: SingleAppMetricsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getAppMetrics(
    @Param('appId') appId: string,
  ): Promise<SingleAppMetricsResponseDto> {
    const app = await this.applicationService.findById(appId);

    this.logger.debug(
      `Fetching instant metrics for app "${app.slug}" in namespace "${app.k8sNamespace}"`,
    );

    const metrics = await this.appMetricsService.getAppMetricsInstant(
      app.id,
      app.slug,
      app.k8sNamespace,
    );

    return {
      app_id: app.id,
      app_name: app.slug,
      namespace: app.k8sNamespace,
      cluster_id: app.clusterId,
      metrics,
      queried_at: new Date().toISOString(),
    };
  }

  /**
   * Get metrics history for a single application
   */
  @Get('applications/:appId/metrics/history')
  @ApiOperation({
    summary: 'Get application metrics history',
    description:
      'Returns historical CPU, memory, network, and replica metrics ' +
      'for a single application over a time range.',
  })
  @ApiParam({ name: 'appId', description: 'Application ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Application metrics history retrieved successfully',
    type: SingleAppMetricsHistoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getAppMetricsHistory(
    @Param('appId') appId: string,
    @Query() query: MetricsHistoryQueryDto,
  ): Promise<SingleAppMetricsHistoryResponseDto> {
    const app = await this.applicationService.findById(appId);
    const startUnix = Math.floor(new Date(query.start).getTime() / 1000);
    const endUnix = Math.floor(new Date(query.end).getTime() / 1000);
    const step = query.step || '60s';

    this.logger.debug(
      `Fetching metrics history for app "${app.slug}": ${query.start} -> ${query.end} (step: ${step})`,
    );

    const dataPoints = await this.appMetricsService.getAppMetricsHistory(
      app.id,
      app.slug,
      app.k8sNamespace,
      startUnix,
      endUnix,
      step,
    );

    return {
      app_id: app.id,
      app_name: app.slug,
      namespace: app.k8sNamespace,
      cluster_id: app.clusterId,
      range_start: query.start,
      range_end: query.end,
      step,
      data_points: dataPoints,
      queried_at: new Date().toISOString(),
    };
  }

  /**
   * Get instant metrics for all applications in a cluster
   */
  @Get('clusters/:clusterId/applications/metrics')
  @ApiOperation({
    summary: 'Get metrics for all applications in a cluster',
    description:
      'Returns instant metrics for every application in the cluster. ' +
      'Fetches the app list from the database, then queries Prometheus for each app in parallel.',
  })
  @ApiParam({ name: 'clusterId', description: 'Cluster ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Cluster application metrics retrieved successfully',
    type: ClusterAppsMetricsResponseDto,
  })
  async getClusterAppsMetrics(
    @Param('clusterId') clusterId: string,
  ): Promise<ClusterAppsMetricsResponseDto> {
    this.logger.debug(
      `Fetching instant metrics for all apps in cluster ${clusterId}`,
    );

    const applications =
      await this.appMetricsService.getClusterAppsMetricsInstant(clusterId);

    return {
      cluster_id: clusterId,
      applications,
      queried_at: new Date().toISOString(),
    };
  }

  /**
   * Get metrics history for all applications in a cluster
   */
  @Get('clusters/:clusterId/applications/metrics/history')
  @ApiOperation({
    summary: 'Get metrics history for all applications in a cluster',
    description:
      'Returns historical metrics for every application in the cluster over a time range.',
  })
  @ApiParam({ name: 'clusterId', description: 'Cluster ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Cluster application metrics history retrieved successfully',
    type: ClusterAppsMetricsHistoryResponseDto,
  })
  async getClusterAppsMetricsHistory(
    @Param('clusterId') clusterId: string,
    @Query() query: MetricsHistoryQueryDto,
  ): Promise<ClusterAppsMetricsHistoryResponseDto> {
    const startUnix = Math.floor(new Date(query.start).getTime() / 1000);
    const endUnix = Math.floor(new Date(query.end).getTime() / 1000);
    const step = query.step || '60s';

    this.logger.debug(
      `Fetching metrics history for all apps in cluster ${clusterId}: ${query.start} -> ${query.end} (step: ${step})`,
    );

    const applications =
      await this.appMetricsService.getClusterAppsMetricsHistory(
        clusterId,
        startUnix,
        endUnix,
        step,
      );

    return {
      cluster_id: clusterId,
      range_start: query.start,
      range_end: query.end,
      step,
      applications,
      queried_at: new Date().toISOString(),
    };
  }
}
