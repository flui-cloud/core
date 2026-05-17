import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  Configuration,
  SSHKeysApi,
  APIKeysApi,
  ScalewayIamV1alpha1SSHKey,
} from './generated/iam';
import { ICredentialProvider } from '../../interfaces/credential-provider.interface';
import { CloudProvider } from '../../enums/cloud-provider.enum';

@Injectable()
export class ScalewayIamAdapter {
  private readonly iamBaseUrl = 'https://api.scaleway.com';
  private readonly logger = new Logger(ScalewayIamAdapter.name);
  private cachedOrganizationId: string | null = null;
  private cachedProjectId: string | null = null;

  constructor(
    @Inject('ICredentialProvider')
    private readonly credentialProvider: ICredentialProvider,
  ) {}

  private async createConfiguration(): Promise<Configuration> {
    const token = await this.credentialProvider.getActiveApiToken(
      CloudProvider.SCALEWAY,
    );
    return new Configuration({
      basePath: this.iamBaseUrl,
      apiKey: token,
    });
  }

  private async createSSHKeysApi(): Promise<SSHKeysApi> {
    return new SSHKeysApi(await this.createConfiguration());
  }

  /**
   * Returns the organization ID for the configured Scaleway API key.
   * Uses getAPIKey(accessKey) which requires no additional parameters.
   * The generated TypeScript types don't include organization_id but the real API returns it.
   * Result is cached for the lifetime of the adapter instance.
   */
  async getOrganizationId(): Promise<string> {
    if (this.cachedOrganizationId) return this.cachedOrganizationId;

    const pair = await this.credentialProvider.getActiveAccessKeyPair(
      CloudProvider.SCALEWAY,
    );
    const config = await this.createConfiguration();
    const apiKeysApi = new APIKeysApi(config);
    const resp = await apiKeysApi.getAPIKey(pair.accessKey);
    const organizationId = (resp.data as any)?.organization_id as
      | string
      | undefined;

    if (!organizationId) {
      throw new Error(
        'Could not determine Scaleway organization ID — check API key permissions',
      );
    }

    this.logger.debug(`Resolved organization ID: ${organizationId}`);
    this.cachedOrganizationId = organizationId;
    return organizationId;
  }

  /**
   * Returns the default project ID for the configured Scaleway API key.
   * Uses getAPIKey(accessKey) which requires no additional parameters.
   * Used for server and security group creation (requires project_id, not organization_id).
   */
  async getDefaultProjectId(): Promise<string> {
    if (this.cachedProjectId) return this.cachedProjectId;

    const pair = await this.credentialProvider.getActiveAccessKeyPair(
      CloudProvider.SCALEWAY,
    );
    const config = await this.createConfiguration();
    const apiKeysApi = new APIKeysApi(config);
    const resp = await apiKeysApi.getAPIKey(pair.accessKey);
    const projectId = resp.data?.default_project_id;

    if (!projectId) {
      throw new Error(
        'Could not determine Scaleway default project ID — check that the API key has a default project set',
      );
    }

    this.cachedProjectId = projectId;
    return projectId;
  }

  async listSSHKeys(): Promise<ScalewayIamV1alpha1SSHKey[]> {
    const api = await this.createSSHKeysApi();
    const resp = await api.listSSHKeys();
    return resp.data.ssh_keys ?? [];
  }

  async createSSHKey(
    name: string,
    publicKey: string,
    _labels?: Record<string, string>, // Scaleway IAM SSH keys don't support tags — accepted for interface compliance
  ): Promise<{ id: string; fingerprint?: string }> {
    const api = await this.createSSHKeysApi();
    const projectId = await this.getDefaultProjectId();
    const resp = await api.createSSHKey({
      name,
      public_key: publicKey,
      project_id: projectId,
    });
    return { id: resp.data.id ?? '', fingerprint: resp.data.fingerprint };
  }

  async deleteSSHKey(id: string): Promise<void> {
    const api = await this.createSSHKeysApi();
    await api.deleteSSHKey(id);
  }

  async getSSHKey(id: string): Promise<ScalewayIamV1alpha1SSHKey> {
    const api = await this.createSSHKeysApi();
    const resp = await api.getSSHKey(id);
    return resp.data;
  }
}
