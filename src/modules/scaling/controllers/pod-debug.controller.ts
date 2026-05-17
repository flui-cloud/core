import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PodDebugService } from '../services/pod-debug.service';
import { PodDebugInfoDto } from '../dto/pod-debug.dto';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications/:applicationId/debug')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { ttl: 60_000, limit: 10 } })
export class PodDebugController {
  constructor(private readonly podDebugService: PodDebugService) {}

  @Get('pods')
  @ApiOperation({
    summary: 'Return debug info for every pod of the application',
  })
  listPods(
    @Param('applicationId') applicationId: string,
  ): Promise<PodDebugInfoDto[]> {
    return this.podDebugService.getPodsDebugInfo(applicationId);
  }

  @Get('pod/:podName')
  @ApiOperation({ summary: 'Return debug info for a specific pod' })
  getPod(
    @Param('applicationId') applicationId: string,
    @Param('podName') podName: string,
  ): Promise<PodDebugInfoDto> {
    return this.podDebugService.getPodDebugInfo(applicationId, podName);
  }
}
