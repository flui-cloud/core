import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Single source of truth for the in-cluster build agent master switch.
 *
 * The in-cluster build agent (buildkit + railpack running inside the
 * `flui-build` namespace of the user's cluster) is demoted in favor of the
 * managed offering. By default it is OFF: no namespace, PVC, secrets or pods
 * are allocated in the user's cluster. Flip the env var below to re-enable.
 */
@Injectable()
export class BuildAgentConfigService {
  private static readonly ENV_KEY = 'FLUI_IN_CLUSTER_BUILD_AGENT_ENABLED';
  private readonly logger = new Logger(BuildAgentConfigService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Whether the in-cluster build agent is enabled.
   * Default: `false`.
   */
  isInClusterBuildAgentEnabled(): boolean {
    const raw = this.configService.get<string | boolean | undefined>(
      BuildAgentConfigService.ENV_KEY,
    );
    if (raw === undefined || raw === null) return false;
    if (typeof raw === 'boolean') return raw;
    return String(raw).trim().toLowerCase() === 'true';
  }
}
