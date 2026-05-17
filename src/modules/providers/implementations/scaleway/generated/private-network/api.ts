/* tslint:disable */
/* eslint-disable */
/**
 * Elastic Metal - Private Networks API
 * Private Networks, allow to facilitate the interconnection of resources via a dedicated, private, and flexible L2 network.  This documentation describes the usage of the Private Network feature on Elastic Metal servers.  You have the flexibility to add multiple servers to your Private Networks and can connect up to eight (8) distinct networks per server, in the form of additional network interfaces within the server (VLANs). With this feature, you can isolate services from the public internet and expose them to the rest of your infrastructure without concern about public network filtering.  Servers can be added or removed from a Private Network at any time, even while running. The network interface will be hot-plugged into the server, and software can be configured to set it up automatically as soon as it appears.  (switchcolumn) <Message type=\"important\"> This documentation refers to Private Networks for Elastic Metal servers. If you are looking for information for Private Networks on other products, refer to our [VPC API documentation](/api/vpc/). </Message> (switchcolumn) ## Concepts  Refer to our [dedicated concepts page](https://www.scaleway.com/en/docs/elastic-metal/concepts/) to find definitions of all concepts and terminology related to Elastic Metal servers.  ## Quickstart  (switchcolumn) (switchcolumn)  1. Configure your environment variables.     ```bash     export SCW_SECRET_KEY=\"<API secret key>\"     export SCW_DEFAULT_ZONE=\"<Scaleway Availability Zone>\"     export SCW_PROJECT_ID=\"<Scaleway Project ID>\"     ```     <Message type=\"tip\">     This is an optional step that seeks to simplify your usage of the Private Networks API. See [Availability Zones](#availability-zones) below for help choosing an Availability Zone. You can find your Project ID in the [Scaleway console](https://console.scaleway.com/project/settings).     </Message>  2. Create a [Private Network for your Elastic Metal server](https://www.scaleway.com/en/developers/api/vpc/).  3. Add a server to the Private Network.     ```bash     curl -s -H \"Content-Type: application/json\" \\         -H \"X-Auth-Token: $SECRET_KEY\" \\         https://api.scaleway.com/baremetal/v1/zones/$SCW_DEFAULT_ZONE/servers/$EM_SERVER_ID/private-networks \\         -d \'{\"private_network_id\": \"\'$PN_ID\'\"}\'     ```     <Message type=\"note\">     Keep the `vlan` field from the response. It is your VLAN ID, and will be used     to configure the server to handle traffic from and to the Private Network.     </Message>  4. Connect to your Elastic Metal server and use the following command to configure your Private Network interface\"     ```bash     sudo ip link add link eno1 name eno1.$VLAN type vlan id $VLAN     sudo ip link set eno1.$VLAN up     sudo ip addr add 192.168.0.10/24 dev eno1.$VLAN     ```  (switchcolumn) <Message type=\"requirement\"> To perform the following steps, you must first ensure that:     - You have a [Scaleway account](https://console.scaleway.com/)    - You have created an [API key](https://www.scaleway.com/en/docs/iam/how-to/create-api-keys/) and that the API key has sufficient [IAM permissions](https://www.scaleway.com/en/docs/iam/reference-content/permission-sets/) to perform the actions described on this page    - You have [installed `curl`](https://curl.se/download.html) </Message> (switchcolumn) ## Technical information  ### Pagination  Most listing requests receive a paginated response. Requests against paginated endpoints accept two `query` arguments:  - `page`, a positive integer to choose which page to return. - `page_size`, a positive integer lower or equal to 100 to select the number of items to return per page. The default value is `20`.  Paginated endpoints usually also accept filters to search and sort results. These filters are documented along each endpoint documentation.  ### Availability Zones  Private Networks for Elastic Metal servers can be deployed in the following Availability Zones:  | Name      | API ID                           | |-----------|----------------------------------| | Paris     | `fr-par-1` `fr-par-2`            | | Amsterdam | `nl-ams-1` `nl-ams-2`            | | Warsaw    | `pl-waw-2` `pl-waw-3`            |  ## Technical limitations  - You need to configure a VLAN manually, using the Elastic Metal server interface - The bandwidth is limited to 1Gbps inside the Private Network - You can configure up to 8 Private Networks per server - Broadcast and multicast traffic, while supported, are rate-limited  ## Going further  For more help using Private Networks on Elastic Metal servers, check out the following resources: - Our [main documentation](https://www.scaleway.com/en/docs/elastic-metal/how-to/use-private-networks/) - The #private-networks channel on our [Slack Community](https://www.scaleway.com/en/docs/tutorials/scaleway-slack-community/) - Our [support ticketing system](https://www.scaleway.com/en/docs/account/how-to/open-a-support-ticket/).
 *
 * The version of the OpenAPI document: v3
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import type { Configuration } from './configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import {
  DUMMY_BASE_URL,
  assertParamExists,
  setApiKeyToObject,
  setBasicAuthToObject,
  setBearerAuthToObject,
  setOAuthToObject,
  setSearchParams,
  serializeDataIfNeeded,
  toPathString,
  createRequestFunction,
} from './common';
import type { RequestArgs } from './base';
// @ts-ignore
import {
  BASE_PATH,
  COLLECTION_FORMATS,
  BaseAPI,
  RequiredError,
  operationServerMap,
} from './base';

/**
 *
 * @export
 * @interface AddServerPrivateNetworkRequest
 */
export interface AddServerPrivateNetworkRequest {
  /**
   * UUID of the Private Network.
   * @type {string}
   * @memberof AddServerPrivateNetworkRequest
   */
  private_network_id: string;
  /**
   * IPAM IDs of an IPs to attach to the server.
   * @type {Array<string>}
   * @memberof AddServerPrivateNetworkRequest
   */
  ipam_ip_ids?: Array<string>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV3ListServerPrivateNetworksResponse
 */
export interface ScalewayBaremetalV3ListServerPrivateNetworksResponse {
  /**
   *
   * @type {Array<ScalewayBaremetalV3ServerPrivateNetwork>}
   * @memberof ScalewayBaremetalV3ListServerPrivateNetworksResponse
   */
  server_private_networks?: Array<ScalewayBaremetalV3ServerPrivateNetwork>;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV3ListServerPrivateNetworksResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV3ServerPrivateNetwork
 */
export interface ScalewayBaremetalV3ServerPrivateNetwork {
  /**
   * UUID of the Server-to-Private Network mapping.
   * @type {string}
   * @memberof ScalewayBaremetalV3ServerPrivateNetwork
   */
  id?: string;
  /**
   * Private Network Project UUID.
   * @type {string}
   * @memberof ScalewayBaremetalV3ServerPrivateNetwork
   */
  project_id?: string;
  /**
   * Server UUID.
   * @type {string}
   * @memberof ScalewayBaremetalV3ServerPrivateNetwork
   */
  server_id?: string;
  /**
   * Private Network UUID.
   * @type {string}
   * @memberof ScalewayBaremetalV3ServerPrivateNetwork
   */
  private_network_id?: string;
  /**
   * VLAN UUID associated with the Private Network.
   * @type {number}
   * @memberof ScalewayBaremetalV3ServerPrivateNetwork
   */
  vlan?: number;
  /**
   * Configuration status of the Private Network.
   * @type {string}
   * @memberof ScalewayBaremetalV3ServerPrivateNetwork
   */
  status?: ScalewayBaremetalV3ServerPrivateNetworkStatusEnum;
  /**
   * Private Network creation date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayBaremetalV3ServerPrivateNetwork
   */
  created_at?: string;
  /**
   * Date the Private Network was last modified. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayBaremetalV3ServerPrivateNetwork
   */
  updated_at?: string;
  /**
   * IPAM IP IDs of the server, if it has any.
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV3ServerPrivateNetwork
   */
  ipam_ip_ids?: Array<string>;
}

export const ScalewayBaremetalV3ServerPrivateNetworkStatusEnum = {
  UnknownStatus: 'unknown_status',
  Attaching: 'attaching',
  Attached: 'attached',
  Error: 'error',
  Detaching: 'detaching',
  Locked: 'locked',
} as const;

export type ScalewayBaremetalV3ServerPrivateNetworkStatusEnum =
  (typeof ScalewayBaremetalV3ServerPrivateNetworkStatusEnum)[keyof typeof ScalewayBaremetalV3ServerPrivateNetworkStatusEnum];

/**
 *
 * @export
 * @interface ScalewayBaremetalV3SetServerPrivateNetworksResponse
 */
export interface ScalewayBaremetalV3SetServerPrivateNetworksResponse {
  /**
   *
   * @type {Array<ScalewayBaremetalV3ServerPrivateNetwork>}
   * @memberof ScalewayBaremetalV3SetServerPrivateNetworksResponse
   */
  server_private_networks?: Array<ScalewayBaremetalV3ServerPrivateNetwork>;
}
/**
 *
 * @export
 * @interface SetServerPrivateNetworksRequest
 */
export interface SetServerPrivateNetworksRequest {
  /**
   *
   * @type {SetServerPrivateNetworksRequestPerPrivateNetworkIpamIpIds}
   * @memberof SetServerPrivateNetworksRequest
   */
  per_private_network_ipam_ip_ids: SetServerPrivateNetworksRequestPerPrivateNetworkIpamIpIds;
}
/**
 * Object where the keys are the UUIDs of Private Networks and the values are arrays of IPAM IDs representing the IPs to assign to this Elastic Metal server on the Private Network. If the array supplied for a Private Network is empty, the next available IP from the Private Network\'s CIDR block will automatically be used for attachment.
 * @export
 * @interface SetServerPrivateNetworksRequestPerPrivateNetworkIpamIpIds
 */
export interface SetServerPrivateNetworksRequestPerPrivateNetworkIpamIpIds {
  [key: string]: any;

  /**
   * Object where the keys are the UUIDs of Private Networks and the values are arrays of IPAM IDs representing the IPs to assign to this Elastic Metal server on the Private Network. If the array supplied for a Private Network is empty, the next available IP from the Private Network\'s CIDR block will automatically be used for attachment.
   * @type {Array<string>}
   * @memberof SetServerPrivateNetworksRequestPerPrivateNetworkIpamIpIds
   */
  '&lt;per_private_network_ipam_ip_idKey&gt;'?: Array<string>;
}

/**
 * PrivateNetworksApi - axios parameter creator
 * @export
 */
export const PrivateNetworksApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Add an Elastic Metal server to a Private Network.
     * @summary Add a server to a Private Network
     * @param {AddServerPrivateNetworkZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the server.
     * @param {AddServerPrivateNetworkRequest} addServerPrivateNetworkRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addServerPrivateNetwork: async (
      zone: AddServerPrivateNetworkZoneEnum,
      serverId: string,
      addServerPrivateNetworkRequest: AddServerPrivateNetworkRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('addServerPrivateNetwork', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('addServerPrivateNetwork', 'serverId', serverId);
      // verify required parameter 'addServerPrivateNetworkRequest' is not null or undefined
      assertParamExists(
        'addServerPrivateNetwork',
        'addServerPrivateNetworkRequest',
        addServerPrivateNetworkRequest,
      );
      const localVarPath =
        `/baremetal/v3/zones/{zone}/servers/{server_id}/private-networks`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'POST',
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication scaleway required
      await setApiKeyToObject(
        localVarHeaderParameter,
        'X-Auth-Token',
        configuration,
      );

      localVarHeaderParameter['Content-Type'] = 'application/json';

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        addServerPrivateNetworkRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     *
     * @summary Delete a Private Network
     * @param {DeleteServerPrivateNetworkZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the server.
     * @param {string} privateNetworkId UUID of the Private Network.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteServerPrivateNetwork: async (
      zone: DeleteServerPrivateNetworkZoneEnum,
      serverId: string,
      privateNetworkId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteServerPrivateNetwork', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('deleteServerPrivateNetwork', 'serverId', serverId);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists(
        'deleteServerPrivateNetwork',
        'privateNetworkId',
        privateNetworkId,
      );
      const localVarPath =
        `/baremetal/v3/zones/{zone}/servers/{server_id}/private-networks/{private_network_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(
            `{${'private_network_id'}}`,
            encodeURIComponent(String(privateNetworkId)),
          );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'DELETE',
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication scaleway required
      await setApiKeyToObject(
        localVarHeaderParameter,
        'X-Auth-Token',
        configuration,
      );

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * List the Private Networks of an Elastic Metal server.
     * @summary List the Private Networks of a server
     * @param {ListServerPrivateNetworksZoneEnum} zone The zone you want to target
     * @param {ListServerPrivateNetworksOrderByEnum} [orderBy] Sort order for the returned Private Networks.
     * @param {number} [page] Page number for the returned Private Networks.
     * @param {number} [pageSize] Maximum number of Private Networks per page.
     * @param {string} [serverId] Filter Private Networks by server UUID.
     * @param {string} [privateNetworkId] Filter Private Networks by Private Network UUID.
     * @param {string} [organizationId] Filter Private Networks by organization UUID.
     * @param {string} [projectId] Filter Private Networks by project UUID.
     * @param {Array<string>} [ipamIpIds] Filter Private Networks by IPAM IP UUIDs.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServerPrivateNetworks: async (
      zone: ListServerPrivateNetworksZoneEnum,
      orderBy?: ListServerPrivateNetworksOrderByEnum,
      page?: number,
      pageSize?: number,
      serverId?: string,
      privateNetworkId?: string,
      organizationId?: string,
      projectId?: string,
      ipamIpIds?: Array<string>,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listServerPrivateNetworks', 'zone', zone);
      const localVarPath =
        `/baremetal/v3/zones/{zone}/server-private-networks`.replace(
          `{${'zone'}}`,
          encodeURIComponent(String(zone)),
        );
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'GET',
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication scaleway required
      await setApiKeyToObject(
        localVarHeaderParameter,
        'X-Auth-Token',
        configuration,
      );

      if (orderBy !== undefined) {
        localVarQueryParameter['order_by'] = orderBy;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (serverId !== undefined) {
        localVarQueryParameter['server_id'] = serverId;
      }

      if (privateNetworkId !== undefined) {
        localVarQueryParameter['private_network_id'] = privateNetworkId;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (projectId !== undefined) {
        localVarQueryParameter['project_id'] = projectId;
      }

      if (ipamIpIds) {
        localVarQueryParameter['ipam_ip_ids'] = ipamIpIds;
      }

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Configure multiple Private Networks on an Elastic Metal server.
     * @summary Set multiple Private Networks on a server
     * @param {SetServerPrivateNetworksZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the server.
     * @param {SetServerPrivateNetworksRequest} setServerPrivateNetworksRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setServerPrivateNetworks: async (
      zone: SetServerPrivateNetworksZoneEnum,
      serverId: string,
      setServerPrivateNetworksRequest: SetServerPrivateNetworksRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setServerPrivateNetworks', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('setServerPrivateNetworks', 'serverId', serverId);
      // verify required parameter 'setServerPrivateNetworksRequest' is not null or undefined
      assertParamExists(
        'setServerPrivateNetworks',
        'setServerPrivateNetworksRequest',
        setServerPrivateNetworksRequest,
      );
      const localVarPath =
        `/baremetal/v3/zones/{zone}/servers/{server_id}/private-networks`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'PUT',
        ...baseOptions,
        ...options,
      };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      // authentication scaleway required
      await setApiKeyToObject(
        localVarHeaderParameter,
        'X-Auth-Token',
        configuration,
      );

      localVarHeaderParameter['Content-Type'] = 'application/json';

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        setServerPrivateNetworksRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

/**
 * PrivateNetworksApi - functional programming interface
 * @export
 */
export const PrivateNetworksApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    PrivateNetworksApiAxiosParamCreator(configuration);
  return {
    /**
     * Add an Elastic Metal server to a Private Network.
     * @summary Add a server to a Private Network
     * @param {AddServerPrivateNetworkZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the server.
     * @param {AddServerPrivateNetworkRequest} addServerPrivateNetworkRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async addServerPrivateNetwork(
      zone: AddServerPrivateNetworkZoneEnum,
      serverId: string,
      addServerPrivateNetworkRequest: AddServerPrivateNetworkRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV3ServerPrivateNetwork>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.addServerPrivateNetwork(
          zone,
          serverId,
          addServerPrivateNetworkRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.addServerPrivateNetwork']?.[
          localVarOperationServerIndex
        ]?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     *
     * @summary Delete a Private Network
     * @param {DeleteServerPrivateNetworkZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the server.
     * @param {string} privateNetworkId UUID of the Private Network.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteServerPrivateNetwork(
      zone: DeleteServerPrivateNetworkZoneEnum,
      serverId: string,
      privateNetworkId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteServerPrivateNetwork(
          zone,
          serverId,
          privateNetworkId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.deleteServerPrivateNetwork']?.[
          localVarOperationServerIndex
        ]?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * List the Private Networks of an Elastic Metal server.
     * @summary List the Private Networks of a server
     * @param {ListServerPrivateNetworksZoneEnum} zone The zone you want to target
     * @param {ListServerPrivateNetworksOrderByEnum} [orderBy] Sort order for the returned Private Networks.
     * @param {number} [page] Page number for the returned Private Networks.
     * @param {number} [pageSize] Maximum number of Private Networks per page.
     * @param {string} [serverId] Filter Private Networks by server UUID.
     * @param {string} [privateNetworkId] Filter Private Networks by Private Network UUID.
     * @param {string} [organizationId] Filter Private Networks by organization UUID.
     * @param {string} [projectId] Filter Private Networks by project UUID.
     * @param {Array<string>} [ipamIpIds] Filter Private Networks by IPAM IP UUIDs.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listServerPrivateNetworks(
      zone: ListServerPrivateNetworksZoneEnum,
      orderBy?: ListServerPrivateNetworksOrderByEnum,
      page?: number,
      pageSize?: number,
      serverId?: string,
      privateNetworkId?: string,
      organizationId?: string,
      projectId?: string,
      ipamIpIds?: Array<string>,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV3ListServerPrivateNetworksResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listServerPrivateNetworks(
          zone,
          orderBy,
          page,
          pageSize,
          serverId,
          privateNetworkId,
          organizationId,
          projectId,
          ipamIpIds,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.listServerPrivateNetworks']?.[
          localVarOperationServerIndex
        ]?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Configure multiple Private Networks on an Elastic Metal server.
     * @summary Set multiple Private Networks on a server
     * @param {SetServerPrivateNetworksZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the server.
     * @param {SetServerPrivateNetworksRequest} setServerPrivateNetworksRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setServerPrivateNetworks(
      zone: SetServerPrivateNetworksZoneEnum,
      serverId: string,
      setServerPrivateNetworksRequest: SetServerPrivateNetworksRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV3SetServerPrivateNetworksResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.setServerPrivateNetworks(
          zone,
          serverId,
          setServerPrivateNetworksRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.setServerPrivateNetworks']?.[
          localVarOperationServerIndex
        ]?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
  };
};

/**
 * PrivateNetworksApi - factory interface
 * @export
 */
export const PrivateNetworksApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = PrivateNetworksApiFp(configuration);
  return {
    /**
     * Add an Elastic Metal server to a Private Network.
     * @summary Add a server to a Private Network
     * @param {AddServerPrivateNetworkZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the server.
     * @param {AddServerPrivateNetworkRequest} addServerPrivateNetworkRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addServerPrivateNetwork(
      zone: AddServerPrivateNetworkZoneEnum,
      serverId: string,
      addServerPrivateNetworkRequest: AddServerPrivateNetworkRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV3ServerPrivateNetwork> {
      return localVarFp
        .addServerPrivateNetwork(
          zone,
          serverId,
          addServerPrivateNetworkRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Delete a Private Network
     * @param {DeleteServerPrivateNetworkZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the server.
     * @param {string} privateNetworkId UUID of the Private Network.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteServerPrivateNetwork(
      zone: DeleteServerPrivateNetworkZoneEnum,
      serverId: string,
      privateNetworkId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteServerPrivateNetwork(zone, serverId, privateNetworkId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List the Private Networks of an Elastic Metal server.
     * @summary List the Private Networks of a server
     * @param {ListServerPrivateNetworksZoneEnum} zone The zone you want to target
     * @param {ListServerPrivateNetworksOrderByEnum} [orderBy] Sort order for the returned Private Networks.
     * @param {number} [page] Page number for the returned Private Networks.
     * @param {number} [pageSize] Maximum number of Private Networks per page.
     * @param {string} [serverId] Filter Private Networks by server UUID.
     * @param {string} [privateNetworkId] Filter Private Networks by Private Network UUID.
     * @param {string} [organizationId] Filter Private Networks by organization UUID.
     * @param {string} [projectId] Filter Private Networks by project UUID.
     * @param {Array<string>} [ipamIpIds] Filter Private Networks by IPAM IP UUIDs.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServerPrivateNetworks(
      zone: ListServerPrivateNetworksZoneEnum,
      orderBy?: ListServerPrivateNetworksOrderByEnum,
      page?: number,
      pageSize?: number,
      serverId?: string,
      privateNetworkId?: string,
      organizationId?: string,
      projectId?: string,
      ipamIpIds?: Array<string>,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV3ListServerPrivateNetworksResponse> {
      return localVarFp
        .listServerPrivateNetworks(
          zone,
          orderBy,
          page,
          pageSize,
          serverId,
          privateNetworkId,
          organizationId,
          projectId,
          ipamIpIds,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Configure multiple Private Networks on an Elastic Metal server.
     * @summary Set multiple Private Networks on a server
     * @param {SetServerPrivateNetworksZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the server.
     * @param {SetServerPrivateNetworksRequest} setServerPrivateNetworksRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setServerPrivateNetworks(
      zone: SetServerPrivateNetworksZoneEnum,
      serverId: string,
      setServerPrivateNetworksRequest: SetServerPrivateNetworksRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV3SetServerPrivateNetworksResponse> {
      return localVarFp
        .setServerPrivateNetworks(
          zone,
          serverId,
          setServerPrivateNetworksRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * PrivateNetworksApi - interface
 * @export
 * @interface PrivateNetworksApi
 */
export interface PrivateNetworksApiInterface {
  /**
   * Add an Elastic Metal server to a Private Network.
   * @summary Add a server to a Private Network
   * @param {AddServerPrivateNetworkZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the server.
   * @param {AddServerPrivateNetworkRequest} addServerPrivateNetworkRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  addServerPrivateNetwork(
    zone: AddServerPrivateNetworkZoneEnum,
    serverId: string,
    addServerPrivateNetworkRequest: AddServerPrivateNetworkRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV3ServerPrivateNetwork>;

  /**
   *
   * @summary Delete a Private Network
   * @param {DeleteServerPrivateNetworkZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the server.
   * @param {string} privateNetworkId UUID of the Private Network.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  deleteServerPrivateNetwork(
    zone: DeleteServerPrivateNetworkZoneEnum,
    serverId: string,
    privateNetworkId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * List the Private Networks of an Elastic Metal server.
   * @summary List the Private Networks of a server
   * @param {ListServerPrivateNetworksZoneEnum} zone The zone you want to target
   * @param {ListServerPrivateNetworksOrderByEnum} [orderBy] Sort order for the returned Private Networks.
   * @param {number} [page] Page number for the returned Private Networks.
   * @param {number} [pageSize] Maximum number of Private Networks per page.
   * @param {string} [serverId] Filter Private Networks by server UUID.
   * @param {string} [privateNetworkId] Filter Private Networks by Private Network UUID.
   * @param {string} [organizationId] Filter Private Networks by organization UUID.
   * @param {string} [projectId] Filter Private Networks by project UUID.
   * @param {Array<string>} [ipamIpIds] Filter Private Networks by IPAM IP UUIDs.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  listServerPrivateNetworks(
    zone: ListServerPrivateNetworksZoneEnum,
    orderBy?: ListServerPrivateNetworksOrderByEnum,
    page?: number,
    pageSize?: number,
    serverId?: string,
    privateNetworkId?: string,
    organizationId?: string,
    projectId?: string,
    ipamIpIds?: Array<string>,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV3ListServerPrivateNetworksResponse>;

  /**
   * Configure multiple Private Networks on an Elastic Metal server.
   * @summary Set multiple Private Networks on a server
   * @param {SetServerPrivateNetworksZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the server.
   * @param {SetServerPrivateNetworksRequest} setServerPrivateNetworksRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  setServerPrivateNetworks(
    zone: SetServerPrivateNetworksZoneEnum,
    serverId: string,
    setServerPrivateNetworksRequest: SetServerPrivateNetworksRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV3SetServerPrivateNetworksResponse>;
}

/**
 * PrivateNetworksApi - object-oriented interface
 * @export
 * @class PrivateNetworksApi
 * @extends {BaseAPI}
 */
export class PrivateNetworksApi
  extends BaseAPI
  implements PrivateNetworksApiInterface
{
  /**
   * Add an Elastic Metal server to a Private Network.
   * @summary Add a server to a Private Network
   * @param {AddServerPrivateNetworkZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the server.
   * @param {AddServerPrivateNetworkRequest} addServerPrivateNetworkRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public addServerPrivateNetwork(
    zone: AddServerPrivateNetworkZoneEnum,
    serverId: string,
    addServerPrivateNetworkRequest: AddServerPrivateNetworkRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .addServerPrivateNetwork(
        zone,
        serverId,
        addServerPrivateNetworkRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Delete a Private Network
   * @param {DeleteServerPrivateNetworkZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the server.
   * @param {string} privateNetworkId UUID of the Private Network.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public deleteServerPrivateNetwork(
    zone: DeleteServerPrivateNetworkZoneEnum,
    serverId: string,
    privateNetworkId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .deleteServerPrivateNetwork(zone, serverId, privateNetworkId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List the Private Networks of an Elastic Metal server.
   * @summary List the Private Networks of a server
   * @param {ListServerPrivateNetworksZoneEnum} zone The zone you want to target
   * @param {ListServerPrivateNetworksOrderByEnum} [orderBy] Sort order for the returned Private Networks.
   * @param {number} [page] Page number for the returned Private Networks.
   * @param {number} [pageSize] Maximum number of Private Networks per page.
   * @param {string} [serverId] Filter Private Networks by server UUID.
   * @param {string} [privateNetworkId] Filter Private Networks by Private Network UUID.
   * @param {string} [organizationId] Filter Private Networks by organization UUID.
   * @param {string} [projectId] Filter Private Networks by project UUID.
   * @param {Array<string>} [ipamIpIds] Filter Private Networks by IPAM IP UUIDs.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public listServerPrivateNetworks(
    zone: ListServerPrivateNetworksZoneEnum,
    orderBy?: ListServerPrivateNetworksOrderByEnum,
    page?: number,
    pageSize?: number,
    serverId?: string,
    privateNetworkId?: string,
    organizationId?: string,
    projectId?: string,
    ipamIpIds?: Array<string>,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .listServerPrivateNetworks(
        zone,
        orderBy,
        page,
        pageSize,
        serverId,
        privateNetworkId,
        organizationId,
        projectId,
        ipamIpIds,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Configure multiple Private Networks on an Elastic Metal server.
   * @summary Set multiple Private Networks on a server
   * @param {SetServerPrivateNetworksZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the server.
   * @param {SetServerPrivateNetworksRequest} setServerPrivateNetworksRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public setServerPrivateNetworks(
    zone: SetServerPrivateNetworksZoneEnum,
    serverId: string,
    setServerPrivateNetworksRequest: SetServerPrivateNetworksRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .setServerPrivateNetworks(
        zone,
        serverId,
        setServerPrivateNetworksRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const AddServerPrivateNetworkZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type AddServerPrivateNetworkZoneEnum =
  (typeof AddServerPrivateNetworkZoneEnum)[keyof typeof AddServerPrivateNetworkZoneEnum];
/**
 * @export
 */
export const DeleteServerPrivateNetworkZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type DeleteServerPrivateNetworkZoneEnum =
  (typeof DeleteServerPrivateNetworkZoneEnum)[keyof typeof DeleteServerPrivateNetworkZoneEnum];
/**
 * @export
 */
export const ListServerPrivateNetworksZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type ListServerPrivateNetworksZoneEnum =
  (typeof ListServerPrivateNetworksZoneEnum)[keyof typeof ListServerPrivateNetworksZoneEnum];
/**
 * @export
 */
export const ListServerPrivateNetworksOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  UpdatedAtAsc: 'updated_at_asc',
  UpdatedAtDesc: 'updated_at_desc',
} as const;
export type ListServerPrivateNetworksOrderByEnum =
  (typeof ListServerPrivateNetworksOrderByEnum)[keyof typeof ListServerPrivateNetworksOrderByEnum];
/**
 * @export
 */
export const SetServerPrivateNetworksZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type SetServerPrivateNetworksZoneEnum =
  (typeof SetServerPrivateNetworksZoneEnum)[keyof typeof SetServerPrivateNetworksZoneEnum];
