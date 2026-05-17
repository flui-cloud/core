import { Controller, Get, Logger, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PrometheusConfigService } from '../services';
import { PrometheusTargetDto } from '../dto';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Observability')
@ApiBearerAuth()
@Controller('observability')
export class ObservabilityController {
  private readonly logger = new Logger(ObservabilityController.name);

  constructor(
    private readonly prometheusConfigService: PrometheusConfigService,
  ) {}

  @Get('prometheus/targets')
  @Public()
  @ApiOperation({
    summary: '[deprecated] Get Prometheus service discovery targets',
    description:
      'Deprecated. New clusters use push-based vmagent. Returns scrape targets for legacy Prometheus HTTP SD only.',
    deprecated: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of Prometheus targets',
    type: [PrometheusTargetDto],
  })
  async getPrometheusTargets(
    @Req() req: Request,
  ): Promise<PrometheusTargetDto[]> {
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    this.logger.log(`HTTP SD from ${clientIp} | ${userAgent}`);

    try {
      const targets = await this.prometheusConfigService.getPrometheusTargets();
      this.logger.debug(`Returning ${targets.length} targets to ${clientIp}`);
      return targets;
    } catch (error) {
      this.logger.error(
        `HTTP SD request failed for ${clientIp}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get observability statistics',
    description:
      'Returns statistics about service discovery targets and monitoring coverage',
  })
  @ApiResponse({
    status: 200,
    description: 'Service discovery statistics',
  })
  async getServiceDiscoveryStats() {
    return this.prometheusConfigService.getServiceDiscoveryStats();
  }
}
