import { Injectable, Logger } from '@nestjs/common';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { CredentialType } from '../../../management/entities/credentials.entity';
import {
  IProviderBootstrapSeeder,
  ProviderBootstrapCredentials,
} from '../../core/interfaces/provider-bootstrap-seeder.interface';

/**
 * Hetzner-specific bootstrap seeder logic.
 *
 * Reads `PROVIDER_HETZNER_API_KEY` from the pod env and resolves the master
 * server's numeric ID (via Hetzner API by-name lookup) when the CLI has only
 * the placeholder name available.
 */
@Injectable()
export class HetznerBootstrapSeeder implements IProviderBootstrapSeeder {
  readonly provider = CloudProvider.HETZNER;
  private readonly logger = new Logger(HetznerBootstrapSeeder.name);

  buildCredentials(
    env: NodeJS.ProcessEnv,
  ): ProviderBootstrapCredentials | null {
    const token = env.PROVIDER_HETZNER_API_KEY;
    if (!token) return null;
    return {
      credentialType: CredentialType.API_KEY,
      token,
      label: 'Hetzner API Token (bootstrap)',
    };
  }

  async resolveProviderResourceId(args: {
    instanceId: string;
    instanceName: string;
    env: NodeJS.ProcessEnv;
  }): Promise<string> {
    const { instanceId, instanceName, env } = args;
    // Hetzner native IDs are positive integers — short-circuit when CLI already
    // gave us one.
    if (instanceId && /^\d+$/.test(instanceId)) return instanceId;

    const token = env.PROVIDER_HETZNER_API_KEY;
    if (!token || !instanceName) return instanceId;

    try {
      const res = await fetch(
        `https://api.hetzner.cloud/v1/servers?name=${encodeURIComponent(instanceName)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        this.logger.warn(
          `Hetzner lookup for ${instanceName} returned ${res.status}; keeping placeholder`,
        );
        return instanceId;
      }
      const data = (await res.json()) as { servers?: Array<{ id: number }> };
      const id = data.servers?.[0]?.id;
      if (id) {
        this.logger.log(
          `Resolved Hetzner numeric ID for ${instanceName}: ${id}`,
        );
        return String(id);
      }
      this.logger.warn(
        `Hetzner lookup for ${instanceName} returned no servers; keeping placeholder`,
      );
    } catch (err) {
      this.logger.warn(
        `Hetzner lookup failed for ${instanceName}: ${(err as Error).message}; keeping placeholder`,
      );
    }
    return instanceId;
  }
}
