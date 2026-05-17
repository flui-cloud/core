import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PingResponseDto } from './dto/ping-response.dto';
import { OidcReadinessDto } from './dto/oidc-readiness.dto';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  private readonly startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  @Get('ping')
  @ApiOperation({
    summary: 'Health ping endpoint',
    description:
      'Ultra-fast health check endpoint that returns server status without checking external dependencies. Ideal for load balancers and frequent monitoring.',
  })
  @ApiResponse({
    status: 200,
    description: 'Server is running',
    type: PingResponseDto,
  })
  ping(): PingResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  @Get('oidc')
  @ApiOperation({
    summary: 'OIDC provisioning readiness',
    description:
      'Returns ready=true when the API has the OIDC client_id (OIDC_AUDIENCE) injected by OidcBootstrapService. Used by the CLI to gate "Cluster is READY!" until login is functional.',
  })
  @ApiResponse({
    status: 200,
    description: 'OIDC readiness status',
    type: OidcReadinessDto,
  })
  oidcReadiness(): OidcReadinessDto {
    return { ready: !!(process.env.OIDC_AUDIENCE ?? '').trim() };
  }
}
