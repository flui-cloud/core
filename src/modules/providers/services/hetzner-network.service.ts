import { Injectable, Logger } from '@nestjs/common';
import {
  Configuration,
  NetworksApi,
  NetworkActionsApi,
} from 'src/modules/providers/implementations/hetzner/generated';
import {
  INetworkProvider,
  CreateVNetConfig,
  VNetCreationResult,
  VNetDetails,
  VNetDeletionResult,
  AddSubnetConfig,
  AddSubnetResult,
  DeleteSubnetConfig,
  AddRouteConfig,
  DeleteRouteConfig,
  AttachServerToVNetConfig,
  DetachServerFromVNetConfig,
  ServerVNetAttachmentResult,
  ChangeIpRangeConfig,
  VNetSubnetInfo,
  VNetRouteInfo,
} from '../interfaces/network-provider.interface';
import { Label } from '../interfaces/cloud-provider.interface';

@Injectable()
export class HetznerNetworkService implements INetworkProvider {
  private readonly logger = new Logger(HetznerNetworkService.name);
  private readonly networksApi: NetworksApi;
  private readonly networkActionsApi: NetworkActionsApi;

  constructor(private readonly apiToken: string) {
    const configuration = new Configuration({
      accessToken: this.apiToken,
    });

    this.networksApi = new NetworksApi(configuration);
    this.networkActionsApi = new NetworkActionsApi(configuration);
  }

  /**
   * Convert label array to Hetzner labels object
   */
  private labelsToRecord(labels?: Label[]): Record<string, string> | undefined {
    if (!labels || labels.length === 0) {
      return undefined;
    }

    return labels.reduce(
      (acc, label) => {
        acc[label.key] = label.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  /**
   * Convert Hetzner labels object to label array
   */
  private recordToLabels(record?: Record<string, string>): Label[] {
    if (!record) {
      return [];
    }

    return Object.entries(record).map(([key, value]) => ({
      key,
      value,
    }));
  }

  /**
   * Create a new VNet (private network)
   */
  async createVNet(config: CreateVNetConfig): Promise<VNetCreationResult> {
    this.logger.log(
      `Creating VNet: ${config.name} with IP range ${config.ipRange}`,
    );

    try {
      // Filter out subnets without ipRange
      const validSubnets = config.subnets
        ?.filter((subnet) => subnet.ipRange !== undefined)
        .map((subnet) => ({
          ip_range: subnet.ipRange,
          type: 'cloud' as const,
          network_zone: subnet.networkZone || 'eu-central', // Default to eu-central if not specified
          vswitch_id: subnet.vswitchId
            ? Number.parseInt(subnet.vswitchId, 10)
            : undefined,
        }));

      // Only use subnets if they are valid (have ip_range)
      // Don't create default subnets - let Hetzner handle the VNet without subnets
      const subnetsToCreate =
        validSubnets && validSubnets.length > 0 ? validSubnets : undefined;

      if (subnetsToCreate) {
        this.logger.log(
          `Creating VNet with ${subnetsToCreate.length} subnet(s) in zone(s): ${subnetsToCreate.map((s) => s.network_zone).join(', ')}`,
        );
      } else {
        this.logger.log(
          'Creating VNet without subnets (subnets can be added later)',
        );
      }

      const response = await this.networksApi.createNetwork({
        name: config.name,
        ip_range: config.ipRange,
        labels: this.labelsToRecord(config.labels),
        subnets: subnetsToCreate,
        routes: config.routes?.map((route) => ({
          destination: route.destination,
          gateway: route.gateway,
        })),
        expose_routes_to_vswitch: config.exposeRoutesToVSwitch,
      });

      const network = response.data.network;

      const subnets: VNetSubnetInfo[] =
        network.subnets?.map((subnet) => ({
          ipRange: subnet.ip_range,
          networkZone: subnet.network_zone,
          gateway: subnet.gateway,
        })) || [];

      this.logger.log(`VNet created successfully with ID: ${network.id}`);

      return {
        vnetId: network.id.toString(),
        ipRange: network.ip_range,
        subnets,
      };
    } catch (error) {
      this.logger.error(`Failed to create VNet: ${error.message}`, error.stack);
      throw new Error(`Failed to create VNet on Hetzner: ${error.message}`);
    }
  }

  /**
   * Delete a VNet
   */
  async deleteVNet(vnetId: string): Promise<VNetDeletionResult> {
    this.logger.log(`Deleting VNet: ${vnetId}`);

    try {
      await this.networksApi.deleteNetwork(Number(vnetId));

      this.logger.log(`VNet ${vnetId} deleted successfully`);

      return {
        message: `VNet ${vnetId} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete VNet ${vnetId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to delete VNet on Hetzner: ${error.message}`);
    }
  }

  /**
   * Get VNet details
   */
  async getVNet(vnetId: string): Promise<VNetDetails | null> {
    this.logger.log(`Getting VNet details: ${vnetId}`);

    try {
      const response = await this.networksApi.getNetwork(Number(vnetId));
      const network = response.data.network;

      const subnets: VNetSubnetInfo[] =
        network.subnets?.map((subnet) => ({
          ipRange: subnet.ip_range,
          networkZone: subnet.network_zone,
          gateway: subnet.gateway,
        })) || [];

      const routes: VNetRouteInfo[] =
        network.routes?.map((route) => ({
          destination: route.destination,
          gateway: route.gateway,
        })) || [];

      const attachedServerIds =
        network.servers?.map((serverId) => serverId.toString()) || [];

      return {
        id: network.id.toString(),
        name: network.name,
        ipRange: network.ip_range,
        subnets,
        routes,
        attachedServerIds,
        labels: network.labels,
        created: network.created,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.warn(`VNet ${vnetId} not found`);
        return null;
      }

      this.logger.error(
        `Failed to get VNet ${vnetId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to get VNet from Hetzner: ${error.message}`);
    }
  }

  /**
   * List all VNets
   */
  async listVNets(): Promise<VNetDetails[]> {
    this.logger.log('Listing all VNets');

    try {
      const response = await this.networksApi.listNetworks();
      const networks = response.data.networks || [];

      return networks.map((network) => {
        const subnets: VNetSubnetInfo[] =
          network.subnets?.map((subnet) => ({
            ipRange: subnet.ip_range,
            type: subnet.type,
            networkZone: subnet.network_zone,
            gateway: subnet.gateway,
          })) || [];

        const routes: VNetRouteInfo[] =
          network.routes?.map((route) => ({
            destination: route.destination,
            gateway: route.gateway,
          })) || [];

        const attachedServerIds =
          network.servers?.map((serverId) => serverId.toString()) || [];

        return {
          id: network.id.toString(),
          name: network.name,
          ipRange: network.ip_range,
          subnets,
          routes,
          attachedServerIds,
          labels: network.labels,
          created: network.created,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to list VNets: ${error.message}`, error.stack);
      throw new Error(`Failed to list VNets from Hetzner: ${error.message}`);
    }
  }

  /**
   * Add subnet to VNet
   */
  async addSubnet(config: AddSubnetConfig): Promise<AddSubnetResult> {
    this.logger.log(`Adding subnet to VNet ${config.vnetId}`);

    const fluiManaged = await this.isFluiManagedVNet(config.vnetId);

    if (fluiManaged && config.ipRange) {
      const existing = await this.findExistingSubnet(
        config.vnetId,
        config.ipRange,
        config.networkZone,
      );
      if (existing) {
        this.logger.log(
          `Subnet ${config.ipRange} already exists on VNet ${config.vnetId} (flui-managed) — returning existing as idempotent success`,
        );
        return {
          actionId: undefined,
          subnetId: existing.id,
          ipRange: existing.ipRange,
          networkZone: existing.networkZone || config.networkZone,
          gateway: existing.gateway,
        };
      }
    }

    try {
      const response = await this.networkActionsApi.addNetworkSubnet(
        Number(config.vnetId),
        {
          ip_range: config.ipRange,
          type: 'cloud' as const,
          network_zone: config.networkZone,
          vswitch_id: config.vswitchId
            ? Number.parseInt(config.vswitchId, 10)
            : undefined,
        },
      );

      const actionId = response.data.action?.id;

      this.logger.log(
        `Subnet added to VNet ${config.vnetId}, action ID: ${actionId}`,
      );

      // Fetch updated VNet to get subnet details
      const vnetDetails = await this.getVNet(config.vnetId);
      const addedSubnet = vnetDetails?.subnets.find(
        (s) => s.ipRange === config.ipRange || !config.ipRange,
      );

      return {
        actionId,
        subnetId: addedSubnet?.id,
        ipRange: addedSubnet?.ipRange || config.ipRange || '',
        networkZone: addedSubnet?.networkZone || config.networkZone,
        gateway: addedSubnet?.gateway,
      };
    } catch (error) {
      const hetznerError = error.response?.data;
      const code = hetznerError?.error?.code;

      // Race-safe idempotency: another caller may have created the same subnet
      // between our pre-check and the API call. If the VNet is flui-managed and
      // the conflict is on the exact range we requested, treat it as success.
      if (
        code === 'invalid_input' &&
        fluiManaged &&
        config.ipRange &&
        /overlap/i.test(hetznerError?.error?.message ?? '')
      ) {
        const existing = await this.findExistingSubnet(
          config.vnetId,
          config.ipRange,
          config.networkZone,
        );
        if (existing) {
          this.logger.log(
            `Subnet ${config.ipRange} reconciled after overlap error on flui-managed VNet ${config.vnetId}`,
          );
          return {
            actionId: undefined,
            subnetId: existing.id,
            ipRange: existing.ipRange,
            networkZone: existing.networkZone || config.networkZone,
            gateway: existing.gateway,
          };
        }
      }

      this.logger.error(
        `Failed to add subnet to VNet ${config.vnetId}: ${error.message} | hetzner=${JSON.stringify(hetznerError)} | payload=${JSON.stringify({ ip_range: config.ipRange, network_zone: config.networkZone, vswitch_id: config.vswitchId })}`,
        error.stack,
      );
      const detail = hetznerError?.error?.message || code || error.message;
      throw new Error(`Failed to add subnet on Hetzner: ${detail}`);
    }
  }

  private async isFluiManagedVNet(vnetId: string): Promise<boolean> {
    try {
      const vnet = await this.getVNet(vnetId);
      return vnet?.labels?.['managed-by'] === 'flui-cloud';
    } catch {
      return false;
    }
  }

  private async findExistingSubnet(
    vnetId: string,
    ipRange: string,
    networkZone?: string,
  ): Promise<VNetSubnetInfo | undefined> {
    const vnet = await this.getVNet(vnetId);
    return vnet?.subnets.find(
      (s) =>
        s.ipRange === ipRange &&
        (!networkZone || !s.networkZone || s.networkZone === networkZone),
    );
  }

  /**
   * Delete subnet from VNet
   */
  async deleteSubnet(
    config: DeleteSubnetConfig,
  ): Promise<{ actionId?: number }> {
    this.logger.log(`Deleting subnet from VNet ${config.vnetId}`);

    try {
      const response = await this.networkActionsApi.deleteNetworkSubnet(
        Number(config.vnetId),
        {
          ip_range: config.ipRange,
        },
      );

      const actionId = response.data.action?.id;

      this.logger.log(
        `Subnet deleted from VNet ${config.vnetId}, action ID: ${actionId}`,
      );

      return { actionId };
    } catch (error) {
      this.logger.error(
        `Failed to delete subnet from VNet ${config.vnetId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to delete subnet on Hetzner: ${error.message}`);
    }
  }

  /**
   * Add route to VNet
   */
  async addRoute(config: AddRouteConfig): Promise<{ actionId?: number }> {
    this.logger.log(`Adding route to VNet ${config.vnetId}`);

    try {
      const response = await this.networkActionsApi.addNetworkRoute(
        Number(config.vnetId),
        {
          destination: config.destination,
          gateway: config.gateway,
        },
      );

      const actionId = response.data.action?.id;

      this.logger.log(
        `Route added to VNet ${config.vnetId}, action ID: ${actionId}`,
      );

      return { actionId };
    } catch (error) {
      this.logger.error(
        `Failed to add route to VNet ${config.vnetId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to add route on Hetzner: ${error.message}`);
    }
  }

  /**
   * Delete route from VNet
   */
  async deleteRoute(config: DeleteRouteConfig): Promise<{ actionId?: number }> {
    this.logger.log(`Deleting route from VNet ${config.vnetId}`);

    try {
      const response = await this.networkActionsApi.deleteNetworkRoute(
        Number(config.vnetId),
        {
          destination: config.destination,
          gateway: config.gateway,
        },
      );

      const actionId = response.data.action?.id;

      this.logger.log(
        `Route deleted from VNet ${config.vnetId}, action ID: ${actionId}`,
      );

      return { actionId };
    } catch (error) {
      this.logger.error(
        `Failed to delete route from VNet ${config.vnetId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to delete route on Hetzner: ${error.message}`);
    }
  }

  /**
   * Change IP range of VNet (can only extend, not shrink)
   */
  async changeIpRange(
    config: ChangeIpRangeConfig,
  ): Promise<{ actionId?: number }> {
    this.logger.log(
      `Changing IP range for VNet ${config.vnetId} to ${config.newIpRange}`,
    );

    try {
      const response = await this.networkActionsApi.changeNetworkIpRange(
        Number(config.vnetId),
        {
          ip_range: config.newIpRange,
        },
      );

      const actionId = response.data.action?.id;

      this.logger.log(
        `IP range changed for VNet ${config.vnetId}, action ID: ${actionId}`,
      );

      return { actionId };
    } catch (error) {
      this.logger.error(
        `Failed to change IP range for VNet ${config.vnetId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to change IP range on Hetzner: ${error.message}`);
    }
  }

  /**
   * Attach server to VNet
   * Note: This method is a placeholder - actual server attachment is done via ServerActionsApi
   * This should be implemented in HetznerProviderService which has access to ServerActionsApi
   */
  async attachServerToVNet(
    config: AttachServerToVNetConfig,
  ): Promise<ServerVNetAttachmentResult> {
    this.logger.warn(
      'attachServerToVNet should be called via HetznerProviderService with ServerActionsApi',
    );
    throw new Error(
      'Server attachment must be performed through HetznerProviderService',
    );
  }

  /**
   * Detach server from VNet
   * Note: This method is a placeholder - actual server detachment is done via ServerActionsApi
   * This should be implemented in HetznerProviderService which has access to ServerActionsApi
   */
  async detachServerFromVNet(
    config: DetachServerFromVNetConfig,
  ): Promise<{ actionId?: number }> {
    this.logger.warn(
      'detachServerFromVNet should be called via HetznerProviderService with ServerActionsApi',
    );
    throw new Error(
      'Server detachment must be performed through HetznerProviderService',
    );
  }

  /**
   * Enable deletion protection for VNet
   */
  async enableVNetProtection(vnetId: string): Promise<void> {
    this.logger.log(`Enabling protection for VNet ${vnetId}`);

    try {
      await this.networkActionsApi.changeNetworkProtection(Number(vnetId), {
        delete: true,
      });

      this.logger.log(`Protection enabled for VNet ${vnetId}`);
    } catch (error) {
      this.logger.error(
        `Failed to enable protection for VNet ${vnetId}: ${error.message}`,
        error.stack,
      );
      throw new Error(
        `Failed to enable VNet protection on Hetzner: ${error.message}`,
      );
    }
  }

  /**
   * Disable deletion protection for VNet
   */
  async disableVNetProtection(vnetId: string): Promise<void> {
    this.logger.log(`Disabling protection for VNet ${vnetId}`);

    try {
      await this.networkActionsApi.changeNetworkProtection(Number(vnetId), {
        delete: false,
      });

      this.logger.log(`Protection disabled for VNet ${vnetId}`);
    } catch (error) {
      this.logger.error(
        `Failed to disable protection for VNet ${vnetId}: ${error.message}`,
        error.stack,
      );
      throw new Error(
        `Failed to disable VNet protection on Hetzner: ${error.message}`,
      );
    }
  }
}
