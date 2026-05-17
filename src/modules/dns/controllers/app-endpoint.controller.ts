import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AppEndpointService } from '../services/app-endpoint.service';
import { AppEndpointReconciliationService } from '../services/app-endpoint-reconciliation.service';
import { ClusterDnsGateway } from '../gateway/cluster-dns.gateway';
import { CreateAppEndpointDto } from '../dto/create-app-endpoint.dto';
import { UpdateAppEndpointDto } from '../dto/update-app-endpoint.dto';
import { AppEndpointResponseDto } from '../dto/app-endpoint-response.dto';
import { CertificateStatus } from '../../providers/interfaces/certificate-provider.interface';

@ApiTags('App Endpoints')
@ApiBearerAuth()
@Controller()
export class AppEndpointController {
  private readonly logger = new Logger(AppEndpointController.name);

  constructor(
    private readonly appEndpointService: AppEndpointService,
    private readonly reconciliationService: AppEndpointReconciliationService,
    private readonly clusterDnsGateway: ClusterDnsGateway,
  ) {}

  private async refreshCertStatusIfNeeded(endpointId: string): Promise<void> {
    const endpoint = await this.appEndpointService.getEndpoint(endpointId);

    // Refresh when actively issuing, failed (may have recovered), or status is unknown
    const needsRefresh =
      endpoint.certificateRequired &&
      (endpoint.certificateStatus === CertificateStatus.ISSUING ||
        endpoint.certificateStatus === CertificateStatus.FAILED ||
        endpoint.certificateStatus === null);
    if (!needsRefresh) return;

    try {
      const { status, message } =
        await this.reconciliationService.getCertificateStatus(endpointId);
      if (
        status !== null &&
        (status !== endpoint.certificateStatus ||
          message !== endpoint.certificateMessage)
      ) {
        await this.appEndpointService.updateCertificateStatus(
          endpointId,
          status,
          message,
        );
        this.clusterDnsGateway.emitEndpointCertStatus(endpoint.clusterId, {
          clusterId: endpoint.clusterId,
          endpointId: endpoint.id,
          fqdn: endpoint.fqdn,
          certificateStatus: status,
          certificateMessage: message,
          tlsEnabled:
            !!endpoint.certificateRequired &&
            status === CertificateStatus.VALID,
          timestamp: new Date(),
        });
      }
    } catch (err) {
      this.logger.warn(
        `Live cert status refresh failed for ${endpointId}: ${err.message}`,
      );
    }
  }

  @Get('endpoints/check-fqdn')
  @ApiOperation({
    summary: 'Check whether a fqdn is available for a new endpoint',
    description:
      'Returns { available: false } when the fqdn is already used by another endpoint. ' +
      'Does not reveal which endpoint owns the conflicting domain.',
  })
  @ApiResponse({
    status: 200,
    description: '{ fqdn, available }',
  })
  async checkFqdn(
    @Query('fqdn') fqdn: string,
  ): Promise<{ fqdn: string; available: boolean }> {
    if (!fqdn || typeof fqdn !== 'string' || fqdn.trim().length === 0) {
      throw new BadRequestException('Query parameter "fqdn" is required');
    }
    const normalized = this.appEndpointService.normalizeFqdn(fqdn);
    const available = await this.appEndpointService.isFqdnAvailable(normalized);
    return { fqdn: normalized, available };
  }

  @Post('clusters/:clusterId/endpoints')
  @ApiOperation({
    summary: 'Create an app endpoint for a cluster',
    description:
      'Register an application endpoint with its FQDN, Kubernetes service details, and optional DNS zone. ' +
      'If fqdn is omitted, a default is generated as {serviceName}.{clusterName}.{zoneName}. ' +
      'If clusterDnsZoneId is omitted, DNS management is BYOD (user manages DNS externally).',
  })
  @ApiParam({ name: 'clusterId', description: 'Cluster ID' })
  @ApiResponse({ status: 201, type: AppEndpointResponseDto })
  @ApiResponse({ status: 404, description: 'Cluster or DNS zone not found' })
  async createEndpoint(
    @Param('clusterId') clusterId: string,
    @Body() dto: CreateAppEndpointDto,
  ): Promise<AppEndpointResponseDto> {
    const endpoint = await this.appEndpointService.createEndpoint(
      clusterId,
      dto,
    );
    const withRelations = await this.appEndpointService.getEndpoint(
      endpoint.id,
    );
    return this.appEndpointService.toResponseDto(withRelations);
  }

  @Get('clusters/:clusterId/endpoints')
  @ApiOperation({ summary: 'List all app endpoints for a cluster' })
  @ApiParam({ name: 'clusterId', description: 'Cluster ID' })
  @ApiResponse({ status: 200, type: [AppEndpointResponseDto] })
  async listEndpoints(
    @Param('clusterId') clusterId: string,
  ): Promise<AppEndpointResponseDto[]> {
    const endpoints = await this.appEndpointService.listEndpoints(clusterId);
    await Promise.all(
      endpoints
        .filter((e) => e.certificateStatus === CertificateStatus.ISSUING)
        .map((e) => this.refreshCertStatusIfNeeded(e.id)),
    );
    const refreshed = await this.appEndpointService.listEndpoints(clusterId);
    return refreshed.map((e) => this.appEndpointService.toResponseDto(e));
  }

  @Get('endpoints/:id')
  @ApiOperation({ summary: 'Get an app endpoint by ID' })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiResponse({ status: 200, type: AppEndpointResponseDto })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  async getEndpoint(@Param('id') id: string): Promise<AppEndpointResponseDto> {
    await this.refreshCertStatusIfNeeded(id);
    const endpoint = await this.appEndpointService.getEndpoint(id);
    return this.appEndpointService.toResponseDto(endpoint);
  }

  @Put('endpoints/:id')
  @ApiOperation({
    summary: 'Update an app endpoint',
    description:
      'Update FQDN, Kubernetes service details, or DNS zone assignment.',
  })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiResponse({ status: 200, type: AppEndpointResponseDto })
  @ApiResponse({ status: 404, description: 'Endpoint not found' })
  async updateEndpoint(
    @Param('id') id: string,
    @Body() dto: UpdateAppEndpointDto,
  ): Promise<AppEndpointResponseDto> {
    const endpoint = await this.appEndpointService.updateEndpoint(id, dto);
    return this.appEndpointService.toResponseDto(endpoint);
  }

  @Delete('endpoints/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove an app endpoint',
    description:
      'Remove the endpoint and clean up its DNS record, TLS certificate, and Kubernetes Ingress.',
  })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiResponse({ status: 204, description: 'Endpoint removed' })
  async deleteEndpoint(@Param('id') id: string): Promise<void> {
    await this.reconciliationService.deleteEndpointResources(id);
    await this.appEndpointService.deleteEndpoint(id);
  }

  @Post('endpoints/:id/reconcile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger reconciliation for an app endpoint',
    description:
      'Create or update the DNS record, TLS certificate, and Kubernetes Ingress for this endpoint.',
  })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiResponse({ status: 200, type: AppEndpointResponseDto })
  async reconcile(@Param('id') id: string): Promise<AppEndpointResponseDto> {
    await this.reconciliationService.reconcile(id);
    const endpoint = await this.appEndpointService.getEndpoint(id);
    return this.appEndpointService.toResponseDto(endpoint);
  }

  @Get('endpoints/:id/status')
  @ApiOperation({
    summary: 'Get reconciliation and certificate status for an endpoint',
  })
  @ApiParam({ name: 'id', description: 'Endpoint ID' })
  @ApiResponse({ status: 200, type: AppEndpointResponseDto })
  async getStatus(@Param('id') id: string): Promise<AppEndpointResponseDto> {
    return this.getEndpoint(id);
  }
}
