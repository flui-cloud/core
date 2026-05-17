import { HealthStatusDto } from '../dto/health-status.dto';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';

export class HealthStatusMapper {
  static create(
    providerId: CloudProvider,
    status: 'healthy' | 'unhealthy' | 'warning',
    responseTime: number,
    errorMessage?: string,
    metrics?: any,
  ): HealthStatusDto {
    return {
      providerId,
      status,
      responseTime,
      lastCheck: new Date(),
      errorMessage,
      metrics: {
        apiCallsToday: 0,
        errorRate: status === 'healthy' ? 0 : 1,
        ...metrics,
      },
    };
  }
}
