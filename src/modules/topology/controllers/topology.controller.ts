import { Controller, Get, Sse, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TopologyService } from '../services/topology.service';
import {
  TopologyEventsService,
  TopologyChange,
} from '../services/topology-events.service';
import { TopologyResponseDto } from '../dto/topology.dto';

interface SseMessage {
  type: string;
  data: unknown;
}

@ApiTags('Topology')
@ApiBearerAuth()
@Controller('topology')
export class TopologyController {
  constructor(
    private readonly topologyService: TopologyService,
    private readonly eventsService: TopologyEventsService,
  ) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('topology:full')
  @CacheTTL(10_000)
  @ApiOperation({
    summary: 'Full topology snapshot (clusters → servers → apps)',
    description:
      'Powers the dashboard universe map. Cached server-side for 10s. ' +
      'Each app exposes a stable id, slug, category, status and primaryServerId so the ' +
      'frontend can render planets/stars/galaxies and deep-link to /applications/:id.',
  })
  @ApiResponse({ status: 200, type: TopologyResponseDto })
  getTopology(): Promise<TopologyResponseDto> {
    return this.topologyService.buildTopology();
  }

  @Sse('stream')
  @ApiOperation({
    summary: 'Live topology change stream (Server-Sent Events)',
    description:
      'Emits app.status_changed, app.scaled, app.deployed, app.removed, server.added, ' +
      'server.removed, plus a heartbeat every 15s. Frontend should connect after the ' +
      'initial /topology fetch and patch its in-memory model.',
  })
  stream(): Observable<SseMessage> {
    return this.eventsService.changes$.pipe(
      map((change: TopologyChange) => ({
        type: change.event,
        data: change.data,
      })),
    );
  }
}
