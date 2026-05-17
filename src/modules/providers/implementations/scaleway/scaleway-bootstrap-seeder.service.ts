import { Injectable, Logger } from '@nestjs/common';
import { CloudProvider } from '../../enums/cloud-provider.enum';
import { CredentialType } from '../../../management/entities/credentials.entity';
import {
  IProviderBootstrapSeeder,
  ProviderBootstrapCredentials,
} from '../../core/interfaces/provider-bootstrap-seeder.interface';

@Injectable()
export class ScalewayBootstrapSeeder implements IProviderBootstrapSeeder {
  readonly provider = CloudProvider.SCALEWAY;
  private readonly logger = new Logger(ScalewayBootstrapSeeder.name);

  buildCredentials(
    env: NodeJS.ProcessEnv,
  ): ProviderBootstrapCredentials | null {
    const accessKey = env.PROVIDER_SCALEWAY_ACCESS_KEY;
    const secretKey = env.PROVIDER_SCALEWAY_SECRET_KEY;
    if (!accessKey || !secretKey) return null;
    return {
      credentialType: CredentialType.ACCESS_KEY_SECRET,
      token: secretKey,
      accessKey,
      label: 'Scaleway API Key Pair (bootstrap)',
    };
  }

  async resolveProviderResourceId(args: {
    instanceId: string;
    instanceName: string;
    env: NodeJS.ProcessEnv;
  }): Promise<string> {
    const { instanceId, instanceName, env } = args;
    if (instanceId && /^(instance|baremetal):/.test(instanceId)) {
      return instanceId;
    }

    const token = env.PROVIDER_SCALEWAY_SECRET_KEY;
    const region = env.CLUSTER_REGION || 'fr-par';
    const zone = /^[a-z]{2}-[a-z]{3}$/.test(region) ? `${region}-1` : region;
    if (!token || !instanceName) return instanceId;

    try {
      const res = await fetch(
        `https://api.scaleway.com/instance/v1/zones/${zone}/servers?name=${encodeURIComponent(instanceName)}`,
        { headers: { 'X-Auth-Token': token } },
      );
      if (!res.ok) {
        this.logger.warn(
          `Scaleway lookup for ${instanceName} returned ${res.status}; keeping placeholder`,
        );
        return instanceId;
      }
      const data = (await res.json()) as {
        servers?: Array<{ id: string; name: string }>;
      };
      const match = data.servers?.find((s) => s.name === instanceName);
      if (match?.id) {
        const canonical = `instance:${zone}:${match.id}`;
        this.logger.log(
          `Resolved Scaleway resource ID for ${instanceName}: ${canonical}`,
        );
        return canonical;
      }
      this.logger.warn(
        `Scaleway lookup for ${instanceName} in zone ${zone} returned no match; keeping placeholder`,
      );
    } catch (err) {
      this.logger.warn(
        `Scaleway lookup failed for ${instanceName}: ${(err as Error).message}; keeping placeholder`,
      );
    }
    return instanceId;
  }
}
