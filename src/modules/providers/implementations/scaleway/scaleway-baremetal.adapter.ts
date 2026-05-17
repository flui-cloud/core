import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  Configuration,
  ServersApi,
  ServerActionsApi,
  OffersApi,
  CreateServerRequest,
  InstallServerRequest,
  RebootServerRequest,
  UpdateServerRequest,
  ScalewayBaremetalV1Server,
  ScalewayBaremetalV1Offer,
  CreateServerZoneEnum,
  GetServerZoneEnum,
  DeleteServerZoneEnum,
  InstallServerZoneEnum,
  ListServersZoneEnum,
  RebootServerZoneEnum,
  StartServerZoneEnum,
  StopServerZoneEnum,
  ListOffersZoneEnum,
  UpdateServerZoneEnum,
} from './generated/baremetal';

export const BAREMETAL_ZONES: CreateServerZoneEnum[] = [
  CreateServerZoneEnum.FrPar1,
  CreateServerZoneEnum.FrPar2,
  CreateServerZoneEnum.NlAms1,
  CreateServerZoneEnum.NlAms2,
  CreateServerZoneEnum.PlWaw2,
  CreateServerZoneEnum.PlWaw3,
];

@Injectable()
export class ScalewayBareMetalAdapter {
  private readonly logger = new Logger(ScalewayBareMetalAdapter.name);
  private readonly baseUrl = 'https://api.scaleway.com';
  private readonly timeout = 30000;

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      timeout: this.timeout,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Flui-Cloud-API/1.0',
      },
      validateStatus: (status) => status >= 200 && status < 300,
    });
  }

  private createConfiguration(token: string): Configuration {
    return new Configuration({
      basePath: this.baseUrl,
      baseOptions: {
        headers: {
          'X-Auth-Token': token,
          'User-Agent': 'Flui-Cloud-API/1.0',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    });
  }

  private createServersApi(token: string): ServersApi {
    return new ServersApi(
      this.createConfiguration(token),
      this.baseUrl,
      this.createAxiosInstance(),
    );
  }

  private createServerActionsApi(token: string): ServerActionsApi {
    return new ServerActionsApi(
      this.createConfiguration(token),
      this.baseUrl,
      this.createAxiosInstance(),
    );
  }

  private createOffersApi(token: string): OffersApi {
    return new OffersApi(
      this.createConfiguration(token),
      this.baseUrl,
      this.createAxiosInstance(),
    );
  }

  async listServers(
    token: string,
    zone: CreateServerZoneEnum,
  ): Promise<ScalewayBaremetalV1Server[]> {
    const api = this.createServersApi(token);
    const allServers: ScalewayBaremetalV1Server[] = [];
    let page = 1;
    const pageSize = 50;

    while (true) {
      const response = await api.listServers(
        zone as unknown as ListServersZoneEnum,
        page,
        pageSize,
      );
      const servers = response.data.servers || [];
      allServers.push(...servers);

      const totalCount = response.data.total_count || 0;
      if (allServers.length >= totalCount || servers.length < pageSize) {
        break;
      }
      page++;
    }

    return allServers;
  }

  async getServer(
    token: string,
    zone: string,
    serverId: string,
  ): Promise<ScalewayBaremetalV1Server | null> {
    const api = this.createServersApi(token);
    const response = await api.getServer(
      zone as unknown as GetServerZoneEnum,
      serverId,
    );
    return response.data || null;
  }

  async createServer(
    token: string,
    zone: CreateServerZoneEnum,
    payload: CreateServerRequest,
  ): Promise<ScalewayBaremetalV1Server> {
    const api = this.createServersApi(token);
    const response = await api.createServer(zone, payload);
    return response.data;
  }

  async installServer(
    token: string,
    zone: string,
    serverId: string,
    payload: InstallServerRequest,
  ): Promise<ScalewayBaremetalV1Server> {
    const api = this.createServersApi(token);
    const response = await api.installServer(
      zone as unknown as InstallServerZoneEnum,
      serverId,
      payload,
    );
    return response.data;
  }

  async deleteServer(
    token: string,
    zone: string,
    serverId: string,
  ): Promise<void> {
    const api = this.createServersApi(token);
    await api.deleteServer(zone as unknown as DeleteServerZoneEnum, serverId);
  }

  async startServer(
    token: string,
    zone: string,
    serverId: string,
  ): Promise<void> {
    const api = this.createServerActionsApi(token);
    const request: RebootServerRequest = { boot_type: 'normal' };
    await api.startServer(
      zone as unknown as StartServerZoneEnum,
      serverId,
      request,
    );
  }

  async stopServer(
    token: string,
    zone: string,
    serverId: string,
  ): Promise<void> {
    const api = this.createServerActionsApi(token);
    await api.stopServer(zone as unknown as StopServerZoneEnum, serverId, {});
  }

  async rebootServer(
    token: string,
    zone: string,
    serverId: string,
  ): Promise<void> {
    const api = this.createServerActionsApi(token);
    const request: RebootServerRequest = { boot_type: 'normal' };
    await api.rebootServer(
      zone as unknown as RebootServerZoneEnum,
      serverId,
      request,
    );
  }

  async updateServerTags(
    token: string,
    zone: string,
    serverId: string,
    tags: string[],
  ): Promise<void> {
    const api = this.createServersApi(token);
    const request: UpdateServerRequest = { tags };
    await api.updateServer(
      zone as unknown as UpdateServerZoneEnum,
      serverId,
      request,
    );
  }

  async listOffers(
    token: string,
    zone: CreateServerZoneEnum,
  ): Promise<ScalewayBaremetalV1Offer[]> {
    const api = this.createOffersApi(token);
    const allOffers: ScalewayBaremetalV1Offer[] = [];
    let page = 1;
    const pageSize = 50;

    while (true) {
      const response = await api.listOffers(
        zone as unknown as ListOffersZoneEnum,
        page,
        pageSize,
      );
      const offers = response.data.offers || [];
      allOffers.push(...offers);

      const totalCount = response.data.total_count || 0;
      if (allOffers.length >= totalCount || offers.length < pageSize) {
        break;
      }
      page++;
    }

    return allOffers;
  }
}
