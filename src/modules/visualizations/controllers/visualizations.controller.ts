import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VisualizationsService } from '../services/visualizations.service';
import { SupportedRegionsResponseDto } from '../dto/supported-region.dto';
import { ClusterAppDistributionDto } from '../dto/cluster-app-distribution.dto';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

@ApiTags('Visualizations')
@ApiBearerAuth()
@Controller('visualizations')
export class VisualizationsController {
  constructor(private readonly visualizationsService: VisualizationsService) {}

  @Get('supported-regions')
  @ApiOperation({
    summary: 'List Flui-supported regions across all providers',
    description:
      'Returns regions enriched with lat/lng for the dashboard world map. ' +
      'Only regions whitelisted by Flui (with known coordinates) are included.',
  })
  @ApiResponse({ status: 200, type: SupportedRegionsResponseDto })
  async getSupportedRegions(): Promise<SupportedRegionsResponseDto> {
    const regions = await this.visualizationsService.getSupportedRegions();
    return { regions, total: regions.length };
  }

  @Get('cluster-app-distribution')
  @ApiOperation({
    summary: 'Topology of clusters → nodes → applications',
    description:
      'Aggregated view used by the dashboard distribution chart (sunburst / treemap / graph). ' +
      'Each app exposes its id so the chart can deep-link to /applications/:id.',
  })
  @ApiResponse({ status: 200, type: ClusterAppDistributionDto })
  async getClusterAppDistribution(
    @Req() req: Request,
  ): Promise<ClusterAppDistributionDto> {
    const user = req.user as AuthenticatedUser | undefined;
    return this.visualizationsService.getClusterAppDistribution(user?.userId);
  }
}
