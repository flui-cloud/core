/* tslint:disable */
/* eslint-disable */
/**
 * VPC API
 * VPC allows you to build your own **V**irtual **P**rivate **C**loud on top of Scaleway’s shared public cloud.   VPC currently comprises the regional Private Networks product. Layer 2 regional Private Networks sit inside the layer 3 VPC. Private Networks allows Scaleway resources (Instances, Load Balancers, Managed Databases etc.) within a single region to be interconnected through a dedicated, private, and flexible [L2 network](https://en.wikipedia.org/wiki/Data_link_layer).  You can add as many resources to your networks as you want, and add up to eight (8) different networks per resource. This allows you to run services isolated from the public internet and expose them to the rest of your infrastructure without worrying about public network filtering.  (switchcolumn) <Message type=\"note\"> VPC v2 is now in **General Availability**.  </Message>  <Message type=\"tip\"> Check out our [IPAM API](https://www.scaleway.com/en/developers/api/ipam/) to facilitate the management of IP addresses across your different Scaleway resources. </Message> (switchcolumn)  ## Concepts  Refer to our [dedicated concepts page](https://www.scaleway.com/en/docs/vpc/concepts/) to find definitions of all concepts and terminology related to VPC.  (switchcolumn) (switchcolumn)  ## Quickstart  1. **Configure your environment variables**      <Message type=\"note\">     This is an optional step that seeks to simplify your usage of the API. See the [Technical information](#technical-information) section below for help choosing an Availability Zone and Region. You can find your Project ID in the [Scaleway console](https://console.scaleway.com/project/settings).     </Message>      ```bash     export SCW_SECRET_KEY=\"<API secret key>\"     export SCW_DEFAULT_REGION=\"<Scaleway region>\"     export SCW_DEFAULT_ZONE=\"<Scaleway Availability Zone>\"     export SCW_PROJECT_ID=\"<Scaleway Project ID>\"     ```  2. **Create a Private Network**. Run the following command to create a Private Network. You can customize the details in the payload (name, tags etc.) to your needs.      ```bash     curl -X POST \\         -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\         -H \"Content-Type: application/json\" \\         \"https://api.scaleway.com/vpc/v2/regions/$SCW_DEFAULT_REGION/private-networks\" \\         -d \'{             \"name\": \"My new Private Network\",             \"project_id\": \"\'\"$SCW_PROJECT_ID\"\'\",              \"tags\": [\"test\", \"dev\"]         }\'     ```      <Message type=\"tip\">     Keep the `id` field of the response: it is your Private Network ID, and is useable across all Scaleway products that support Private Networks. It may be useful to you to export the Private Network ID as a new environment variable `export PN_ID=\"<Your Private Network ID>`     </Message>      <Message type=\"tip\">     If you create a Private Network without specifying a VPC to create it in, the behavior depends on when you created your Scaleway Project. [Find out more](https://www.scaleway.com/en/docs/vpc/concepts/#default-vpc)     </Message>  3. **Attach a resource to your Private Network**. Each Scaleway product has its own API to interact with Private Networks. To attach an Instance, Managed Database, Elastic Metal server, Load Balancer or Public Gateway to your Private Network, see instructions in the documentation of the relevant product API. Here, we take the example of an Instance.      Use the following call to attach an Instance to your Private Network. Ensure you replace `<Instance ID>` with the ID of your Instance, and `<Private Network ID>` with the ID of your Private Network. Note that the Instance must be in an Availability Zone that is part of the region of your Private Network.      ```bash     curl -X POST \\         -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\         -H \"Content-Type: application/json\" \\         \"https://api.scaleway.com/instance/v1/zones/$SCW_DEFAULT_ZONE/servers/<Instance ID>/private_nics\" \\         -d \'{\"private_network_id\": \"<Private Network ID>\"}\'     ```      <Message type=\"tip\">     Keep the `id` field of the response: it is your Private NIC ID. It may be useful to you to export     the Private NIC ID as a new environment variable `export NIC_ID=\"<Your Private NIC ID>`.     </Message>      <Message type=\"tip\">     Keep the `mac_address` field of the response, as it will allow you to identify the Private NIC inside your Instance. If successful, a new network interface will appear inside your Instance, ready to be configured to transmit traffic to other Instances of the same network, with the MAC address returned by the API call.     </Message>  4. **Confirm that the network interface has been plugged in**. To do this, connect to your Instance and run `dmseg`. You should see an output similar to the following:      ```bash     [1579004.592869] pci 0000:00:05.0: [1af4:1000] type 00 class 0x020000     [1579004.594835] pci 0000:00:05.0: reg 0x10: [io  0x0000-0x003f]     [1579004.596715] pci 0000:00:05.0: reg 0x14: [mem 0x00000000-0x00000fff]     [1579004.598732] pci 0000:00:05.0: reg 0x20: [mem 0x00000000-0x00003fff 64bit pref]     [1579004.600765] pci 0000:00:05.0: reg 0x30: [mem 0x00000000-0x0007ffff pref]     [1579004.603819] pci 0000:00:05.0: BAR 6: assigned [mem 0xc0100000-0xc017ffff pref]     [1579004.604582] pci 0000:00:05.0: BAR 4: assigned [mem 0x100000c000-0x100000ffff 64bit pref]     [1579004.605555] pci 0000:00:05.0: BAR 1: assigned [mem 0xc0003000-0xc0003fff]     [1579004.606383] pci 0000:00:05.0: BAR 0: assigned [io  0x1000-0x103f]     [1579004.607212] virtio-pci 0000:00:05.0: enabling device (0000 -> 0003)     [1579004.625149] PCI Interrupt Link [LNKA] enabled at IRQ 11     [1579004.644930] virtio_net virtio3 ens5: renamed from eth0     ```  5. **Confirm the presence of the network interface, and confirm its name if several networks are plugged into your Instance**. To do this, run `ip -br link`. You should see an output similar to the following:      ```bash     lo               UNKNOWN        00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP>     ens2             UP             de:1c:94:44:d0:04 <BROADCAST,MULTICAST,UP,LOWER_UP>     ens5             DOWN           02:00:00:00:00:31 <BROADCAST,MULTICAST>     ens6             DOWN           02:00:00:00:01:5b <BROADCAST,MULTICAST>     ens7             DOWN           02:00:00:00:01:5e <BROADCAST,MULTICAST>     ```  6. **Configure the Instance\'s IP address**. DHCP is activated by default on new Private Networks, and automatically assigns IP addresses to resources on the network. If you have an older Private Network, [check whether DHCP is activated](https://www.scaleway.com/en/docs/vpc/reference-content/vpc-migration/) and either activate DHCP for automatic IP configuration, or [manually configure](https://www.scaleway.com/en/docs/instances/reference-content/manual-configuration-private-ips/) the network interface on your Instance if necessary.   7. **Delete your Private NIC**, which equates to unplugging your Instance from the Private Network. Use the following call. Ensure you replace `<Instance ID>` with the ID of your Instance, `<Private Network ID>` with the ID of your Private Network, and `<NIC ID>` with the ID of your Private NIC.      ```bash     curl -X DELETE \\         -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\         -H \"Content-Type: application/json\" \\         \"https://api.scaleway.com/instance/v1/zones/$SCW_DEFAULT_ZONE/servers/<Instance ID>/private_nics/<NIC ID>\"     ```      The network interface disappears from your Instance.  8. **Delete your Private Network**. Use the following call. Ensure you replace `<Private Network ID>` with the ID of your Private Network.      ```bash     curl -X DELETE \\         -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\         -H \"Content-Type: application/json\" \\         \"https://api.scaleway.com/vpc/v2/regions/$SCW_DEFAULT_REGION/private-networks/<Private Network ID>\"     ```      <Message type=\"note\">     Private Networks must be empty to be deleted. Ensure you have detached all resources and deleted all reserved IPs from your network prior to deletion.     </Message>     (switchcolumn)    <Message type=\"requirement\">     - You have a [Scaleway account](https://console.scaleway.com/)     - You have created an [API key](https://www.scaleway.com/en/docs/iam/how-to/create-api-keys/) and that the API key has sufficient [IAM permissions](https://www.scaleway.com/en/docs/iam/reference-content/permission-sets/) to perform the actions described on this page     - You have [installed `curl`](https://curl.se/download.html)     </Message>     (switchcolumn)  ## Technical information  VPC and Private Networks are available in the Paris, Amsterdam and Warsaw regions, which are represented by the following path parameters:  * `fr-par` * `nl-ams` * `pl-waw`  ## Technical limitations  The following limitations apply to Scaleway VPC:  - Up to 250 resources can be attached to a Private Network. - A resource can be attached to up to 8 Private Networks. - The following resource types can be attached to a Private Network:     - Instances     - Elastic Metal servers     - Apple silicon     - Managed Inference     - Load Balancers     - Public Gateways     - Managed Databases for PostgreSQL and MySQL     - Managed Databases for Redis (only at the time of resource creation)     - Kubernetes Kapsule (only at the time of resource creation) - The MAC address of an Instance in a Private Network cannot be changed. - Broadcast and multicast traffic, while supported, are heavily rate-limited.  ## Going further  For more help using Scaleway VPC and Private Networks, check out the following resources: - Our [main documentation](https://www.scaleway.com/en/docs/vpc/) - The #virtual-private-cloud channel on our [Slack Community](https://www.scaleway.com/en/docs/tutorials/scaleway-slack-community/) - Our [support ticketing system](https://www.scaleway.com/en/docs/account/how-to/open-a-support-ticket/).
 *
 * The version of the OpenAPI document: v2
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
 * @interface AddSubnetsRequest
 */
export interface AddSubnetsRequest {
  /**
   * Private Network subnets CIDR. (IP network)
   * @type {Array<string>}
   * @memberof AddSubnetsRequest
   */
  subnets?: Array<string>;
}
/**
 *
 * @export
 * @interface CreatePrivateNetworkRequest
 */
export interface CreatePrivateNetworkRequest {
  /**
   * Name for the Private Network.
   * @type {string}
   * @memberof CreatePrivateNetworkRequest
   */
  name: string;
  /**
   * Scaleway Project in which to create the Private Network. (UUID format)
   * @type {string}
   * @memberof CreatePrivateNetworkRequest
   */
  project_id: string;
  /**
   * Tags for the Private Network.
   * @type {Array<string>}
   * @memberof CreatePrivateNetworkRequest
   */
  tags?: Array<string>;
  /**
   * Private Network subnets CIDR. (IP network)
   * @type {Array<string>}
   * @memberof CreatePrivateNetworkRequest
   */
  subnets?: Array<string>;
  /**
   * VPC in which to create the Private Network. (UUID format)
   * @type {string}
   * @memberof CreatePrivateNetworkRequest
   */
  vpc_id?: string;
  /**
   * Defines whether default v4 and v6 routes are propagated for this Private Network.
   * @type {boolean}
   * @memberof CreatePrivateNetworkRequest
   */
  default_route_propagation_enabled?: boolean;
}
/**
 *
 * @export
 * @interface CreateRouteRequest
 */
export interface CreateRouteRequest {
  /**
   * Route description.
   * @type {string}
   * @memberof CreateRouteRequest
   */
  description?: string;
  /**
   * Tags of the Route.
   * @type {Array<string>}
   * @memberof CreateRouteRequest
   */
  tags?: Array<string>;
  /**
   * VPC the Route belongs to. (UUID format)
   * @type {string}
   * @memberof CreateRouteRequest
   */
  vpc_id?: string;
  /**
   * Destination of the Route. (IP network)
   * @type {string}
   * @memberof CreateRouteRequest
   */
  destination?: string;
  /**
   * ID of the nexthop resource. (UUID format)
   * @type {string}
   * @memberof CreateRouteRequest
   */
  nexthop_resource_id?: string;
  /**
   * ID of the nexthop private network. (UUID format)
   * @type {string}
   * @memberof CreateRouteRequest
   */
  nexthop_private_network_id?: string;
  /**
   * ID of the nexthop VPC Connector. (UUID format)
   * @type {string}
   * @memberof CreateRouteRequest
   */
  nexthop_vpc_connector_id?: string;
}
/**
 *
 * @export
 * @interface CreateVPCRequest
 */
export interface CreateVPCRequest {
  /**
   * Name for the VPC.
   * @type {string}
   * @memberof CreateVPCRequest
   */
  name: string;
  /**
   * Scaleway Project in which to create the VPC. (UUID format)
   * @type {string}
   * @memberof CreateVPCRequest
   */
  project_id: string;
  /**
   * Tags for the VPC.
   * @type {Array<string>}
   * @memberof CreateVPCRequest
   */
  tags?: Array<string>;
  /**
   * Enable routing between Private Networks in the VPC.
   * @type {boolean}
   * @memberof CreateVPCRequest
   */
  enable_routing?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayVpcV2AclRule
 */
export interface ScalewayVpcV2AclRule {
  /**
   * Protocol to which this rule applies.
   * @type {string}
   * @memberof ScalewayVpcV2AclRule
   */
  protocol: ScalewayVpcV2AclRuleProtocolEnum;
  /**
   * Source IP range to which this rule applies (CIDR notation with subnet mask). (IP network)
   * @type {string}
   * @memberof ScalewayVpcV2AclRule
   */
  source: string;
  /**
   * Starting port of the source port range to which this rule applies (inclusive).
   * @type {number}
   * @memberof ScalewayVpcV2AclRule
   */
  src_port_low: number;
  /**
   * Ending port of the source port range to which this rule applies (inclusive).
   * @type {number}
   * @memberof ScalewayVpcV2AclRule
   */
  src_port_high: number;
  /**
   * Destination IP range to which this rule applies (CIDR notation with subnet mask). (IP network)
   * @type {string}
   * @memberof ScalewayVpcV2AclRule
   */
  destination: string;
  /**
   * Starting port of the destination port range to which this rule applies (inclusive).
   * @type {number}
   * @memberof ScalewayVpcV2AclRule
   */
  dst_port_low: number;
  /**
   * Ending port of the destination port range to which this rule applies (inclusive).
   * @type {number}
   * @memberof ScalewayVpcV2AclRule
   */
  dst_port_high: number;
  /**
   * Policy to apply to the packet.
   * @type {string}
   * @memberof ScalewayVpcV2AclRule
   */
  action: ScalewayVpcV2AclRuleActionEnum;
  /**
   * Rule description.
   * @type {string}
   * @memberof ScalewayVpcV2AclRule
   */
  description: string;
}

export const ScalewayVpcV2AclRuleProtocolEnum = {
  Any: 'ANY',
  Tcp: 'TCP',
  Udp: 'UDP',
  Icmp: 'ICMP',
} as const;

export type ScalewayVpcV2AclRuleProtocolEnum =
  (typeof ScalewayVpcV2AclRuleProtocolEnum)[keyof typeof ScalewayVpcV2AclRuleProtocolEnum];
export const ScalewayVpcV2AclRuleActionEnum = {
  UnknownAction: 'unknown_action',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type ScalewayVpcV2AclRuleActionEnum =
  (typeof ScalewayVpcV2AclRuleActionEnum)[keyof typeof ScalewayVpcV2AclRuleActionEnum];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayVpcV2Action = {
  UnknownAction: 'unknown_action',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type ScalewayVpcV2Action =
  (typeof ScalewayVpcV2Action)[keyof typeof ScalewayVpcV2Action];

/**
 *
 * @export
 * @interface ScalewayVpcV2AddSubnetsResponse
 */
export interface ScalewayVpcV2AddSubnetsResponse {
  /**
   * (IP network)
   * @type {Array<string>}
   * @memberof ScalewayVpcV2AddSubnetsResponse
   */
  subnets?: Array<string>;
}
/**
 *
 * @export
 * @interface ScalewayVpcV2DeleteSubnetsResponse
 */
export interface ScalewayVpcV2DeleteSubnetsResponse {
  /**
   * (IP network)
   * @type {Array<string>}
   * @memberof ScalewayVpcV2DeleteSubnetsResponse
   */
  subnets?: Array<string>;
}
/**
 *
 * @export
 * @interface ScalewayVpcV2GetAclResponse
 */
export interface ScalewayVpcV2GetAclResponse {
  /**
   *
   * @type {Array<ScalewayVpcV2AclRule>}
   * @memberof ScalewayVpcV2GetAclResponse
   */
  rules?: Array<ScalewayVpcV2AclRule>;
  /**
   *
   * @type {ScalewayVpcV2Action}
   * @memberof ScalewayVpcV2GetAclResponse
   */
  default_policy?: ScalewayVpcV2Action;
}

/**
 *
 * @export
 * @interface ScalewayVpcV2ListPrivateNetworksResponse
 */
export interface ScalewayVpcV2ListPrivateNetworksResponse {
  /**
   *
   * @type {Array<ScalewayVpcV2PrivateNetwork>}
   * @memberof ScalewayVpcV2ListPrivateNetworksResponse
   */
  private_networks?: Array<ScalewayVpcV2PrivateNetwork>;
  /**
   *
   * @type {number}
   * @memberof ScalewayVpcV2ListPrivateNetworksResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayVpcV2ListSubnetsResponse
 */
export interface ScalewayVpcV2ListSubnetsResponse {
  /**
   *
   * @type {Array<ScalewayVpcV2Subnet>}
   * @memberof ScalewayVpcV2ListSubnetsResponse
   */
  subnets?: Array<ScalewayVpcV2Subnet>;
  /**
   *
   * @type {number}
   * @memberof ScalewayVpcV2ListSubnetsResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayVpcV2ListVPCsResponse
 */
export interface ScalewayVpcV2ListVPCsResponse {
  /**
   *
   * @type {Array<ScalewayVpcV2VPC>}
   * @memberof ScalewayVpcV2ListVPCsResponse
   */
  vpcs?: Array<ScalewayVpcV2VPC>;
  /**
   *
   * @type {number}
   * @memberof ScalewayVpcV2ListVPCsResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayVpcV2PrivateNetwork
 */
export interface ScalewayVpcV2PrivateNetwork {
  /**
   * Private Network ID. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  id?: string;
  /**
   * Private Network name.
   * @type {string}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  name?: string;
  /**
   * Scaleway Organization the Private Network belongs to. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  organization_id?: string;
  /**
   * Scaleway Project the Private Network belongs to. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  project_id?: string;
  /**
   * Region in which the Private Network is available.
   * @type {string}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  region?: string;
  /**
   * Tags of the Private Network.
   * @type {Array<string>}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  tags?: Array<string>;
  /**
   * Date the Private Network was created. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  created_at?: string;
  /**
   * Date the Private Network was last modified. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  updated_at?: string;
  /**
   * Private Network subnets.
   * @type {Array<ScalewayVpcV2Subnet>}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  subnets?: Array<ScalewayVpcV2Subnet>;
  /**
   * VPC the Private Network belongs to. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  vpc_id?: string;
  /**
   * Defines whether managed DHCP is enabled for this Private Network.
   * @type {boolean}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  dhcp_enabled?: boolean;
  /**
   * Defines whether default v4 and v6 routes are propagated for this Private Network.
   * @type {boolean}
   * @memberof ScalewayVpcV2PrivateNetwork
   */
  default_route_propagation_enabled?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayVpcV2Route
 */
export interface ScalewayVpcV2Route {
  /**
   * Route ID. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  id?: string;
  /**
   * Route description.
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  description?: string;
  /**
   * Tags of the Route.
   * @type {Array<string>}
   * @memberof ScalewayVpcV2Route
   */
  tags?: Array<string>;
  /**
   * VPC the Route belongs to. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  vpc_id?: string;
  /**
   * Destination of the Route. (IP network)
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  destination?: string;
  /**
   * ID of the nexthop resource. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  nexthop_resource_id?: string;
  /**
   * ID of the nexthop private network. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  nexthop_private_network_id?: string;
  /**
   * ID of the nexthop VPC connector. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  nexthop_vpc_connector_id?: string;
  /**
   * Date the Route was created. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  created_at?: string;
  /**
   * Date the Route was last modified. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  updated_at?: string;
  /**
   * Defines whether the route can be modified or deleted by the user.
   * @type {boolean}
   * @memberof ScalewayVpcV2Route
   */
  is_read_only?: boolean;
  /**
   * Type of the Route.
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  type?: ScalewayVpcV2RouteTypeEnum;
  /**
   * Region of the Route.
   * @type {string}
   * @memberof ScalewayVpcV2Route
   */
  region?: string;
}

export const ScalewayVpcV2RouteTypeEnum = {
  UnknownRouteType: 'unknown_route_type',
  Subnet: 'subnet',
  Default: 'default',
  Custom: 'custom',
  Interlink: 'interlink',
  S2sVpn: 's2s_vpn',
} as const;

export type ScalewayVpcV2RouteTypeEnum =
  (typeof ScalewayVpcV2RouteTypeEnum)[keyof typeof ScalewayVpcV2RouteTypeEnum];

/**
 *
 * @export
 * @interface ScalewayVpcV2SetAclResponse
 */
export interface ScalewayVpcV2SetAclResponse {
  /**
   *
   * @type {Array<ScalewayVpcV2AclRule>}
   * @memberof ScalewayVpcV2SetAclResponse
   */
  rules?: Array<ScalewayVpcV2AclRule>;
  /**
   *
   * @type {ScalewayVpcV2Action}
   * @memberof ScalewayVpcV2SetAclResponse
   */
  default_policy?: ScalewayVpcV2Action;
}

/**
 *
 * @export
 * @interface ScalewayVpcV2Subnet
 */
export interface ScalewayVpcV2Subnet {
  /**
   * ID of the subnet. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2Subnet
   */
  id?: string;
  /**
   * Subnet creation date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayVpcV2Subnet
   */
  created_at?: string;
  /**
   * Subnet last modification date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayVpcV2Subnet
   */
  updated_at?: string;
  /**
   * Subnet CIDR. (IP network)
   * @type {string}
   * @memberof ScalewayVpcV2Subnet
   */
  subnet?: string;
  /**
   * Scaleway Project the subnet belongs to. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2Subnet
   */
  project_id?: string;
  /**
   * Private Network the subnet belongs to. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2Subnet
   */
  private_network_id?: string;
  /**
   * VPC the subnet belongs to. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2Subnet
   */
  vpc_id?: string;
}
/**
 *
 * @export
 * @interface ScalewayVpcV2VPC
 */
export interface ScalewayVpcV2VPC {
  /**
   * VPC ID. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2VPC
   */
  id?: string;
  /**
   * VPC name.
   * @type {string}
   * @memberof ScalewayVpcV2VPC
   */
  name?: string;
  /**
   * Scaleway Organization the VPC belongs to. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2VPC
   */
  organization_id?: string;
  /**
   * Scaleway Project the VPC belongs to. (UUID format)
   * @type {string}
   * @memberof ScalewayVpcV2VPC
   */
  project_id?: string;
  /**
   * Region of the VPC.
   * @type {string}
   * @memberof ScalewayVpcV2VPC
   */
  region?: string;
  /**
   * Tags for the VPC.
   * @type {Array<string>}
   * @memberof ScalewayVpcV2VPC
   */
  tags?: Array<string>;
  /**
   * Defines whether the VPC is the default one for its Project.
   * @type {boolean}
   * @memberof ScalewayVpcV2VPC
   */
  is_default?: boolean;
  /**
   * Date the VPC was created. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayVpcV2VPC
   */
  created_at?: string;
  /**
   * Date the VPC was last modified. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayVpcV2VPC
   */
  updated_at?: string;
  /**
   * Number of Private Networks within this VPC.
   * @type {number}
   * @memberof ScalewayVpcV2VPC
   */
  private_network_count?: number;
  /**
   * Defines whether the VPC routes traffic between its Private Networks.
   * @type {boolean}
   * @memberof ScalewayVpcV2VPC
   */
  routing_enabled?: boolean;
  /**
   * Defines whether the VPC advertises custom routes between its Private Networks.
   * @type {boolean}
   * @memberof ScalewayVpcV2VPC
   */
  custom_routes_propagation_enabled?: boolean;
}
/**
 *
 * @export
 * @interface SetAclRequest
 */
export interface SetAclRequest {
  /**
   * List of Network ACL rules.
   * @type {Array<ScalewayVpcV2AclRule>}
   * @memberof SetAclRequest
   */
  rules: Array<ScalewayVpcV2AclRule>;
  /**
   * Defines whether this set of ACL rules is for IPv6 (false = IPv4). Each Network ACL can have rules for only one IP type.
   * @type {boolean}
   * @memberof SetAclRequest
   */
  is_ipv6: boolean;
  /**
   * Action to take for packets which do not match any rules.
   * @type {string}
   * @memberof SetAclRequest
   */
  default_policy: SetAclRequestDefaultPolicyEnum;
}

export const SetAclRequestDefaultPolicyEnum = {
  UnknownAction: 'unknown_action',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type SetAclRequestDefaultPolicyEnum =
  (typeof SetAclRequestDefaultPolicyEnum)[keyof typeof SetAclRequestDefaultPolicyEnum];

/**
 *
 * @export
 * @interface UpdatePrivateNetworkRequest
 */
export interface UpdatePrivateNetworkRequest {
  /**
   * Name for the Private Network.
   * @type {string}
   * @memberof UpdatePrivateNetworkRequest
   */
  name?: string;
  /**
   * Tags for the Private Network.
   * @type {Array<string>}
   * @memberof UpdatePrivateNetworkRequest
   */
  tags?: Array<string>;
  /**
   * Defines whether default v4 and v6 routes are propagated for this Private Network.
   * @type {boolean}
   * @memberof UpdatePrivateNetworkRequest
   */
  default_route_propagation_enabled?: boolean;
}
/**
 *
 * @export
 * @interface UpdateRouteRequest
 */
export interface UpdateRouteRequest {
  /**
   * Route description.
   * @type {string}
   * @memberof UpdateRouteRequest
   */
  description?: string;
  /**
   * Tags of the Route.
   * @type {Array<string>}
   * @memberof UpdateRouteRequest
   */
  tags?: Array<string>;
  /**
   * Destination of the Route. (IP network)
   * @type {string}
   * @memberof UpdateRouteRequest
   */
  destination?: string;
  /**
   * ID of the nexthop resource. (UUID format)
   * @type {string}
   * @memberof UpdateRouteRequest
   */
  nexthop_resource_id?: string;
  /**
   * ID of the nexthop private network. (UUID format)
   * @type {string}
   * @memberof UpdateRouteRequest
   */
  nexthop_private_network_id?: string;
  /**
   * ID of the nexthop VPC connector. (UUID format)
   * @type {string}
   * @memberof UpdateRouteRequest
   */
  nexthop_vpc_connector_id?: string;
}
/**
 *
 * @export
 * @interface UpdateVPCRequest
 */
export interface UpdateVPCRequest {
  /**
   * Name for the VPC.
   * @type {string}
   * @memberof UpdateVPCRequest
   */
  name?: string;
  /**
   * Tags for the VPC.
   * @type {Array<string>}
   * @memberof UpdateVPCRequest
   */
  tags?: Array<string>;
}

/**
 * NetworkACLsApi - axios parameter creator
 * @export
 */
export const NetworkACLsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Retrieve a list of ACL rules for a VPC, specified by its VPC ID.
     * @summary Get ACL Rules for VPC
     * @param {GetAclRegionEnum} region The region you want to target
     * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
     * @param {boolean} isIpv6 Defines whether this set of ACL rules is for IPv6 (false &#x3D; IPv4). Each Network ACL can have rules for only one IP type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getAcl: async (
      region: GetAclRegionEnum,
      vpcId: string,
      isIpv6: boolean,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('getAcl', 'region', region);
      // verify required parameter 'vpcId' is not null or undefined
      assertParamExists('getAcl', 'vpcId', vpcId);
      // verify required parameter 'isIpv6' is not null or undefined
      assertParamExists('getAcl', 'isIpv6', isIpv6);
      const localVarPath = `/vpc/v2/regions/{region}/vpcs/{vpc_id}/acl-rules`
        .replace(`{${'region'}}`, encodeURIComponent(String(region)))
        .replace(`{${'vpc_id'}}`, encodeURIComponent(String(vpcId)));
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

      if (isIpv6 !== undefined) {
        localVarQueryParameter['is_ipv6'] = isIpv6;
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
     * Set the list of ACL rules and the default routing policy for a VPC.
     * @summary Set VPC ACL rules
     * @param {SetAclRegionEnum} region The region you want to target
     * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
     * @param {SetAclRequest} setAclRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setAcl: async (
      region: SetAclRegionEnum,
      vpcId: string,
      setAclRequest: SetAclRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('setAcl', 'region', region);
      // verify required parameter 'vpcId' is not null or undefined
      assertParamExists('setAcl', 'vpcId', vpcId);
      // verify required parameter 'setAclRequest' is not null or undefined
      assertParamExists('setAcl', 'setAclRequest', setAclRequest);
      const localVarPath = `/vpc/v2/regions/{region}/vpcs/{vpc_id}/acl-rules`
        .replace(`{${'region'}}`, encodeURIComponent(String(region)))
        .replace(`{${'vpc_id'}}`, encodeURIComponent(String(vpcId)));
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
        setAclRequest,
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
 * NetworkACLsApi - functional programming interface
 * @export
 */
export const NetworkACLsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    NetworkACLsApiAxiosParamCreator(configuration);
  return {
    /**
     * Retrieve a list of ACL rules for a VPC, specified by its VPC ID.
     * @summary Get ACL Rules for VPC
     * @param {GetAclRegionEnum} region The region you want to target
     * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
     * @param {boolean} isIpv6 Defines whether this set of ACL rules is for IPv6 (false &#x3D; IPv4). Each Network ACL can have rules for only one IP type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getAcl(
      region: GetAclRegionEnum,
      vpcId: string,
      isIpv6: boolean,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2GetAclResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getAcl(
        region,
        vpcId,
        isIpv6,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['NetworkACLsApi.getAcl']?.[
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
     * Set the list of ACL rules and the default routing policy for a VPC.
     * @summary Set VPC ACL rules
     * @param {SetAclRegionEnum} region The region you want to target
     * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
     * @param {SetAclRequest} setAclRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setAcl(
      region: SetAclRegionEnum,
      vpcId: string,
      setAclRequest: SetAclRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2SetAclResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.setAcl(
        region,
        vpcId,
        setAclRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['NetworkACLsApi.setAcl']?.[
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
 * NetworkACLsApi - factory interface
 * @export
 */
export const NetworkACLsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = NetworkACLsApiFp(configuration);
  return {
    /**
     * Retrieve a list of ACL rules for a VPC, specified by its VPC ID.
     * @summary Get ACL Rules for VPC
     * @param {GetAclRegionEnum} region The region you want to target
     * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
     * @param {boolean} isIpv6 Defines whether this set of ACL rules is for IPv6 (false &#x3D; IPv4). Each Network ACL can have rules for only one IP type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getAcl(
      region: GetAclRegionEnum,
      vpcId: string,
      isIpv6: boolean,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2GetAclResponse> {
      return localVarFp
        .getAcl(region, vpcId, isIpv6, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Set the list of ACL rules and the default routing policy for a VPC.
     * @summary Set VPC ACL rules
     * @param {SetAclRegionEnum} region The region you want to target
     * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
     * @param {SetAclRequest} setAclRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setAcl(
      region: SetAclRegionEnum,
      vpcId: string,
      setAclRequest: SetAclRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2SetAclResponse> {
      return localVarFp
        .setAcl(region, vpcId, setAclRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * NetworkACLsApi - interface
 * @export
 * @interface NetworkACLsApi
 */
export interface NetworkACLsApiInterface {
  /**
   * Retrieve a list of ACL rules for a VPC, specified by its VPC ID.
   * @summary Get ACL Rules for VPC
   * @param {GetAclRegionEnum} region The region you want to target
   * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
   * @param {boolean} isIpv6 Defines whether this set of ACL rules is for IPv6 (false &#x3D; IPv4). Each Network ACL can have rules for only one IP type.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof NetworkACLsApiInterface
   */
  getAcl(
    region: GetAclRegionEnum,
    vpcId: string,
    isIpv6: boolean,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2GetAclResponse>;

  /**
   * Set the list of ACL rules and the default routing policy for a VPC.
   * @summary Set VPC ACL rules
   * @param {SetAclRegionEnum} region The region you want to target
   * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
   * @param {SetAclRequest} setAclRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof NetworkACLsApiInterface
   */
  setAcl(
    region: SetAclRegionEnum,
    vpcId: string,
    setAclRequest: SetAclRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2SetAclResponse>;
}

/**
 * NetworkACLsApi - object-oriented interface
 * @export
 * @class NetworkACLsApi
 * @extends {BaseAPI}
 */
export class NetworkACLsApi extends BaseAPI implements NetworkACLsApiInterface {
  /**
   * Retrieve a list of ACL rules for a VPC, specified by its VPC ID.
   * @summary Get ACL Rules for VPC
   * @param {GetAclRegionEnum} region The region you want to target
   * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
   * @param {boolean} isIpv6 Defines whether this set of ACL rules is for IPv6 (false &#x3D; IPv4). Each Network ACL can have rules for only one IP type.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof NetworkACLsApi
   */
  public getAcl(
    region: GetAclRegionEnum,
    vpcId: string,
    isIpv6: boolean,
    options?: RawAxiosRequestConfig,
  ) {
    return NetworkACLsApiFp(this.configuration)
      .getAcl(region, vpcId, isIpv6, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Set the list of ACL rules and the default routing policy for a VPC.
   * @summary Set VPC ACL rules
   * @param {SetAclRegionEnum} region The region you want to target
   * @param {string} vpcId ID of the Network ACL\&#39;s VPC. (UUID format)
   * @param {SetAclRequest} setAclRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof NetworkACLsApi
   */
  public setAcl(
    region: SetAclRegionEnum,
    vpcId: string,
    setAclRequest: SetAclRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return NetworkACLsApiFp(this.configuration)
      .setAcl(region, vpcId, setAclRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const GetAclRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type GetAclRegionEnum =
  (typeof GetAclRegionEnum)[keyof typeof GetAclRegionEnum];
/**
 * @export
 */
export const SetAclRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type SetAclRegionEnum =
  (typeof SetAclRegionEnum)[keyof typeof SetAclRegionEnum];

/**
 * PrivateNetworksApi - axios parameter creator
 * @export
 */
export const PrivateNetworksApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new Private Network. Once created, you can attach Scaleway resources which are in the same region.
     * @summary Create a Private Network
     * @param {CreatePrivateNetworkRegionEnum} region The region you want to target
     * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPrivateNetwork: async (
      region: CreatePrivateNetworkRegionEnum,
      createPrivateNetworkRequest: CreatePrivateNetworkRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('createPrivateNetwork', 'region', region);
      // verify required parameter 'createPrivateNetworkRequest' is not null or undefined
      assertParamExists(
        'createPrivateNetwork',
        'createPrivateNetworkRequest',
        createPrivateNetworkRequest,
      );
      const localVarPath = `/vpc/v2/regions/{region}/private-networks`.replace(
        `{${'region'}}`,
        encodeURIComponent(String(region)),
      );
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
        createPrivateNetworkRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete an existing Private Network. Note that you must first detach all resources from the network, in order to delete it.
     * @summary Delete a Private Network
     * @param {DeletePrivateNetworkRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePrivateNetwork: async (
      region: DeletePrivateNetworkRegionEnum,
      privateNetworkId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('deletePrivateNetwork', 'region', region);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists(
        'deletePrivateNetwork',
        'privateNetworkId',
        privateNetworkId,
      );
      const localVarPath =
        `/vpc/v2/regions/{region}/private-networks/{private_network_id}`
          .replace(`{${'region'}}`, encodeURIComponent(String(region)))
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
     * Enable DHCP managed on an existing Private Network. Note that you will not be able to deactivate it afterwards.
     * @summary Enable DHCP on a Private Network
     * @param {EnableDHCPRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    enableDHCP: async (
      region: EnableDHCPRegionEnum,
      privateNetworkId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('enableDHCP', 'region', region);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists('enableDHCP', 'privateNetworkId', privateNetworkId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('enableDHCP', 'body', body);
      const localVarPath =
        `/vpc/v2/regions/{region}/private-networks/{private_network_id}/enable-dhcp`
          .replace(`{${'region'}}`, encodeURIComponent(String(region)))
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
        body,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Retrieve information about an existing Private Network, specified by its Private Network ID. Its full details are returned in the response object.
     * @summary Get a Private Network
     * @param {GetPrivateNetworkRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPrivateNetwork: async (
      region: GetPrivateNetworkRegionEnum,
      privateNetworkId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('getPrivateNetwork', 'region', region);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists(
        'getPrivateNetwork',
        'privateNetworkId',
        privateNetworkId,
      );
      const localVarPath =
        `/vpc/v2/regions/{region}/private-networks/{private_network_id}`
          .replace(`{${'region'}}`, encodeURIComponent(String(region)))
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
     * List existing Private Networks in the specified region. By default, the Private Networks returned in the list are ordered by creation date in ascending order, though this can be modified via the order_by field.
     * @summary List Private Networks
     * @param {ListPrivateNetworksRegionEnum} region The region you want to target
     * @param {ListPrivateNetworksOrderByEnum} [orderBy] Sort order of the returned Private Networks.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of Private Networks to return per page.
     * @param {string} [name] Name to filter for. Only Private Networks with names containing this string will be returned.
     * @param {Array<string>} [tags] Tags to filter for. Only Private Networks with one or more matching tags will be returned.
     * @param {string} [organizationId] Organization ID to filter for. Only Private Networks belonging to this Organization will be returned. (UUID format)
     * @param {string} [projectId] Project ID to filter for. Only Private Networks belonging to this Project will be returned. (UUID format)
     * @param {Array<string>} [privateNetworkIds] Private Network IDs to filter for. Only Private Networks with one of these IDs will be returned.
     * @param {string} [vpcId] VPC ID to filter for. Only Private Networks belonging to this VPC will be returned. (UUID format)
     * @param {boolean} [dhcpEnabled] DHCP status to filter for. When true, only Private Networks with managed DHCP enabled will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPrivateNetworks: async (
      region: ListPrivateNetworksRegionEnum,
      orderBy?: ListPrivateNetworksOrderByEnum,
      page?: number,
      pageSize?: number,
      name?: string,
      tags?: Array<string>,
      organizationId?: string,
      projectId?: string,
      privateNetworkIds?: Array<string>,
      vpcId?: string,
      dhcpEnabled?: boolean,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('listPrivateNetworks', 'region', region);
      const localVarPath = `/vpc/v2/regions/{region}/private-networks`.replace(
        `{${'region'}}`,
        encodeURIComponent(String(region)),
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

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (tags) {
        localVarQueryParameter['tags'] = tags;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (projectId !== undefined) {
        localVarQueryParameter['project_id'] = projectId;
      }

      if (privateNetworkIds) {
        localVarQueryParameter['private_network_ids'] = privateNetworkIds;
      }

      if (vpcId !== undefined) {
        localVarQueryParameter['vpc_id'] = vpcId;
      }

      if (dhcpEnabled !== undefined) {
        localVarQueryParameter['dhcp_enabled'] = dhcpEnabled;
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
     * Update parameters (such as name or tags) of an existing Private Network, specified by its Private Network ID.
     * @summary Update Private Network
     * @param {UpdatePrivateNetworkRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {UpdatePrivateNetworkRequest} updatePrivateNetworkRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePrivateNetwork: async (
      region: UpdatePrivateNetworkRegionEnum,
      privateNetworkId: string,
      updatePrivateNetworkRequest: UpdatePrivateNetworkRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('updatePrivateNetwork', 'region', region);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists(
        'updatePrivateNetwork',
        'privateNetworkId',
        privateNetworkId,
      );
      // verify required parameter 'updatePrivateNetworkRequest' is not null or undefined
      assertParamExists(
        'updatePrivateNetwork',
        'updatePrivateNetworkRequest',
        updatePrivateNetworkRequest,
      );
      const localVarPath =
        `/vpc/v2/regions/{region}/private-networks/{private_network_id}`
          .replace(`{${'region'}}`, encodeURIComponent(String(region)))
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
        method: 'PATCH',
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
        updatePrivateNetworkRequest,
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
     * Create a new Private Network. Once created, you can attach Scaleway resources which are in the same region.
     * @summary Create a Private Network
     * @param {CreatePrivateNetworkRegionEnum} region The region you want to target
     * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createPrivateNetwork(
      region: CreatePrivateNetworkRegionEnum,
      createPrivateNetworkRequest: CreatePrivateNetworkRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2PrivateNetwork>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createPrivateNetwork(
          region,
          createPrivateNetworkRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.createPrivateNetwork']?.[
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
     * Delete an existing Private Network. Note that you must first detach all resources from the network, in order to delete it.
     * @summary Delete a Private Network
     * @param {DeletePrivateNetworkRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deletePrivateNetwork(
      region: DeletePrivateNetworkRegionEnum,
      privateNetworkId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deletePrivateNetwork(
          region,
          privateNetworkId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.deletePrivateNetwork']?.[
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
     * Enable DHCP managed on an existing Private Network. Note that you will not be able to deactivate it afterwards.
     * @summary Enable DHCP on a Private Network
     * @param {EnableDHCPRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async enableDHCP(
      region: EnableDHCPRegionEnum,
      privateNetworkId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2PrivateNetwork>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.enableDHCP(
        region,
        privateNetworkId,
        body,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.enableDHCP']?.[
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
     * Retrieve information about an existing Private Network, specified by its Private Network ID. Its full details are returned in the response object.
     * @summary Get a Private Network
     * @param {GetPrivateNetworkRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getPrivateNetwork(
      region: GetPrivateNetworkRegionEnum,
      privateNetworkId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2PrivateNetwork>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getPrivateNetwork(
          region,
          privateNetworkId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.getPrivateNetwork']?.[
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
     * List existing Private Networks in the specified region. By default, the Private Networks returned in the list are ordered by creation date in ascending order, though this can be modified via the order_by field.
     * @summary List Private Networks
     * @param {ListPrivateNetworksRegionEnum} region The region you want to target
     * @param {ListPrivateNetworksOrderByEnum} [orderBy] Sort order of the returned Private Networks.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of Private Networks to return per page.
     * @param {string} [name] Name to filter for. Only Private Networks with names containing this string will be returned.
     * @param {Array<string>} [tags] Tags to filter for. Only Private Networks with one or more matching tags will be returned.
     * @param {string} [organizationId] Organization ID to filter for. Only Private Networks belonging to this Organization will be returned. (UUID format)
     * @param {string} [projectId] Project ID to filter for. Only Private Networks belonging to this Project will be returned. (UUID format)
     * @param {Array<string>} [privateNetworkIds] Private Network IDs to filter for. Only Private Networks with one of these IDs will be returned.
     * @param {string} [vpcId] VPC ID to filter for. Only Private Networks belonging to this VPC will be returned. (UUID format)
     * @param {boolean} [dhcpEnabled] DHCP status to filter for. When true, only Private Networks with managed DHCP enabled will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listPrivateNetworks(
      region: ListPrivateNetworksRegionEnum,
      orderBy?: ListPrivateNetworksOrderByEnum,
      page?: number,
      pageSize?: number,
      name?: string,
      tags?: Array<string>,
      organizationId?: string,
      projectId?: string,
      privateNetworkIds?: Array<string>,
      vpcId?: string,
      dhcpEnabled?: boolean,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2ListPrivateNetworksResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listPrivateNetworks(
          region,
          orderBy,
          page,
          pageSize,
          name,
          tags,
          organizationId,
          projectId,
          privateNetworkIds,
          vpcId,
          dhcpEnabled,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.listPrivateNetworks']?.[
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
     * Update parameters (such as name or tags) of an existing Private Network, specified by its Private Network ID.
     * @summary Update Private Network
     * @param {UpdatePrivateNetworkRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {UpdatePrivateNetworkRequest} updatePrivateNetworkRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updatePrivateNetwork(
      region: UpdatePrivateNetworkRegionEnum,
      privateNetworkId: string,
      updatePrivateNetworkRequest: UpdatePrivateNetworkRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2PrivateNetwork>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updatePrivateNetwork(
          region,
          privateNetworkId,
          updatePrivateNetworkRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.updatePrivateNetwork']?.[
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
     * Create a new Private Network. Once created, you can attach Scaleway resources which are in the same region.
     * @summary Create a Private Network
     * @param {CreatePrivateNetworkRegionEnum} region The region you want to target
     * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPrivateNetwork(
      region: CreatePrivateNetworkRegionEnum,
      createPrivateNetworkRequest: CreatePrivateNetworkRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2PrivateNetwork> {
      return localVarFp
        .createPrivateNetwork(region, createPrivateNetworkRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete an existing Private Network. Note that you must first detach all resources from the network, in order to delete it.
     * @summary Delete a Private Network
     * @param {DeletePrivateNetworkRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePrivateNetwork(
      region: DeletePrivateNetworkRegionEnum,
      privateNetworkId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deletePrivateNetwork(region, privateNetworkId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Enable DHCP managed on an existing Private Network. Note that you will not be able to deactivate it afterwards.
     * @summary Enable DHCP on a Private Network
     * @param {EnableDHCPRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    enableDHCP(
      region: EnableDHCPRegionEnum,
      privateNetworkId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2PrivateNetwork> {
      return localVarFp
        .enableDHCP(region, privateNetworkId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve information about an existing Private Network, specified by its Private Network ID. Its full details are returned in the response object.
     * @summary Get a Private Network
     * @param {GetPrivateNetworkRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPrivateNetwork(
      region: GetPrivateNetworkRegionEnum,
      privateNetworkId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2PrivateNetwork> {
      return localVarFp
        .getPrivateNetwork(region, privateNetworkId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List existing Private Networks in the specified region. By default, the Private Networks returned in the list are ordered by creation date in ascending order, though this can be modified via the order_by field.
     * @summary List Private Networks
     * @param {ListPrivateNetworksRegionEnum} region The region you want to target
     * @param {ListPrivateNetworksOrderByEnum} [orderBy] Sort order of the returned Private Networks.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of Private Networks to return per page.
     * @param {string} [name] Name to filter for. Only Private Networks with names containing this string will be returned.
     * @param {Array<string>} [tags] Tags to filter for. Only Private Networks with one or more matching tags will be returned.
     * @param {string} [organizationId] Organization ID to filter for. Only Private Networks belonging to this Organization will be returned. (UUID format)
     * @param {string} [projectId] Project ID to filter for. Only Private Networks belonging to this Project will be returned. (UUID format)
     * @param {Array<string>} [privateNetworkIds] Private Network IDs to filter for. Only Private Networks with one of these IDs will be returned.
     * @param {string} [vpcId] VPC ID to filter for. Only Private Networks belonging to this VPC will be returned. (UUID format)
     * @param {boolean} [dhcpEnabled] DHCP status to filter for. When true, only Private Networks with managed DHCP enabled will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPrivateNetworks(
      region: ListPrivateNetworksRegionEnum,
      orderBy?: ListPrivateNetworksOrderByEnum,
      page?: number,
      pageSize?: number,
      name?: string,
      tags?: Array<string>,
      organizationId?: string,
      projectId?: string,
      privateNetworkIds?: Array<string>,
      vpcId?: string,
      dhcpEnabled?: boolean,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2ListPrivateNetworksResponse> {
      return localVarFp
        .listPrivateNetworks(
          region,
          orderBy,
          page,
          pageSize,
          name,
          tags,
          organizationId,
          projectId,
          privateNetworkIds,
          vpcId,
          dhcpEnabled,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update parameters (such as name or tags) of an existing Private Network, specified by its Private Network ID.
     * @summary Update Private Network
     * @param {UpdatePrivateNetworkRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {UpdatePrivateNetworkRequest} updatePrivateNetworkRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePrivateNetwork(
      region: UpdatePrivateNetworkRegionEnum,
      privateNetworkId: string,
      updatePrivateNetworkRequest: UpdatePrivateNetworkRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2PrivateNetwork> {
      return localVarFp
        .updatePrivateNetwork(
          region,
          privateNetworkId,
          updatePrivateNetworkRequest,
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
   * Create a new Private Network. Once created, you can attach Scaleway resources which are in the same region.
   * @summary Create a Private Network
   * @param {CreatePrivateNetworkRegionEnum} region The region you want to target
   * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  createPrivateNetwork(
    region: CreatePrivateNetworkRegionEnum,
    createPrivateNetworkRequest: CreatePrivateNetworkRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2PrivateNetwork>;

  /**
   * Delete an existing Private Network. Note that you must first detach all resources from the network, in order to delete it.
   * @summary Delete a Private Network
   * @param {DeletePrivateNetworkRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  deletePrivateNetwork(
    region: DeletePrivateNetworkRegionEnum,
    privateNetworkId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Enable DHCP managed on an existing Private Network. Note that you will not be able to deactivate it afterwards.
   * @summary Enable DHCP on a Private Network
   * @param {EnableDHCPRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  enableDHCP(
    region: EnableDHCPRegionEnum,
    privateNetworkId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2PrivateNetwork>;

  /**
   * Retrieve information about an existing Private Network, specified by its Private Network ID. Its full details are returned in the response object.
   * @summary Get a Private Network
   * @param {GetPrivateNetworkRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  getPrivateNetwork(
    region: GetPrivateNetworkRegionEnum,
    privateNetworkId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2PrivateNetwork>;

  /**
   * List existing Private Networks in the specified region. By default, the Private Networks returned in the list are ordered by creation date in ascending order, though this can be modified via the order_by field.
   * @summary List Private Networks
   * @param {ListPrivateNetworksRegionEnum} region The region you want to target
   * @param {ListPrivateNetworksOrderByEnum} [orderBy] Sort order of the returned Private Networks.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of Private Networks to return per page.
   * @param {string} [name] Name to filter for. Only Private Networks with names containing this string will be returned.
   * @param {Array<string>} [tags] Tags to filter for. Only Private Networks with one or more matching tags will be returned.
   * @param {string} [organizationId] Organization ID to filter for. Only Private Networks belonging to this Organization will be returned. (UUID format)
   * @param {string} [projectId] Project ID to filter for. Only Private Networks belonging to this Project will be returned. (UUID format)
   * @param {Array<string>} [privateNetworkIds] Private Network IDs to filter for. Only Private Networks with one of these IDs will be returned.
   * @param {string} [vpcId] VPC ID to filter for. Only Private Networks belonging to this VPC will be returned. (UUID format)
   * @param {boolean} [dhcpEnabled] DHCP status to filter for. When true, only Private Networks with managed DHCP enabled will be returned.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  listPrivateNetworks(
    region: ListPrivateNetworksRegionEnum,
    orderBy?: ListPrivateNetworksOrderByEnum,
    page?: number,
    pageSize?: number,
    name?: string,
    tags?: Array<string>,
    organizationId?: string,
    projectId?: string,
    privateNetworkIds?: Array<string>,
    vpcId?: string,
    dhcpEnabled?: boolean,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2ListPrivateNetworksResponse>;

  /**
   * Update parameters (such as name or tags) of an existing Private Network, specified by its Private Network ID.
   * @summary Update Private Network
   * @param {UpdatePrivateNetworkRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {UpdatePrivateNetworkRequest} updatePrivateNetworkRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  updatePrivateNetwork(
    region: UpdatePrivateNetworkRegionEnum,
    privateNetworkId: string,
    updatePrivateNetworkRequest: UpdatePrivateNetworkRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2PrivateNetwork>;
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
   * Create a new Private Network. Once created, you can attach Scaleway resources which are in the same region.
   * @summary Create a Private Network
   * @param {CreatePrivateNetworkRegionEnum} region The region you want to target
   * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public createPrivateNetwork(
    region: CreatePrivateNetworkRegionEnum,
    createPrivateNetworkRequest: CreatePrivateNetworkRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .createPrivateNetwork(region, createPrivateNetworkRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete an existing Private Network. Note that you must first detach all resources from the network, in order to delete it.
   * @summary Delete a Private Network
   * @param {DeletePrivateNetworkRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public deletePrivateNetwork(
    region: DeletePrivateNetworkRegionEnum,
    privateNetworkId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .deletePrivateNetwork(region, privateNetworkId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Enable DHCP managed on an existing Private Network. Note that you will not be able to deactivate it afterwards.
   * @summary Enable DHCP on a Private Network
   * @param {EnableDHCPRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public enableDHCP(
    region: EnableDHCPRegionEnum,
    privateNetworkId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .enableDHCP(region, privateNetworkId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve information about an existing Private Network, specified by its Private Network ID. Its full details are returned in the response object.
   * @summary Get a Private Network
   * @param {GetPrivateNetworkRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public getPrivateNetwork(
    region: GetPrivateNetworkRegionEnum,
    privateNetworkId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .getPrivateNetwork(region, privateNetworkId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List existing Private Networks in the specified region. By default, the Private Networks returned in the list are ordered by creation date in ascending order, though this can be modified via the order_by field.
   * @summary List Private Networks
   * @param {ListPrivateNetworksRegionEnum} region The region you want to target
   * @param {ListPrivateNetworksOrderByEnum} [orderBy] Sort order of the returned Private Networks.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of Private Networks to return per page.
   * @param {string} [name] Name to filter for. Only Private Networks with names containing this string will be returned.
   * @param {Array<string>} [tags] Tags to filter for. Only Private Networks with one or more matching tags will be returned.
   * @param {string} [organizationId] Organization ID to filter for. Only Private Networks belonging to this Organization will be returned. (UUID format)
   * @param {string} [projectId] Project ID to filter for. Only Private Networks belonging to this Project will be returned. (UUID format)
   * @param {Array<string>} [privateNetworkIds] Private Network IDs to filter for. Only Private Networks with one of these IDs will be returned.
   * @param {string} [vpcId] VPC ID to filter for. Only Private Networks belonging to this VPC will be returned. (UUID format)
   * @param {boolean} [dhcpEnabled] DHCP status to filter for. When true, only Private Networks with managed DHCP enabled will be returned.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public listPrivateNetworks(
    region: ListPrivateNetworksRegionEnum,
    orderBy?: ListPrivateNetworksOrderByEnum,
    page?: number,
    pageSize?: number,
    name?: string,
    tags?: Array<string>,
    organizationId?: string,
    projectId?: string,
    privateNetworkIds?: Array<string>,
    vpcId?: string,
    dhcpEnabled?: boolean,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .listPrivateNetworks(
        region,
        orderBy,
        page,
        pageSize,
        name,
        tags,
        organizationId,
        projectId,
        privateNetworkIds,
        vpcId,
        dhcpEnabled,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update parameters (such as name or tags) of an existing Private Network, specified by its Private Network ID.
   * @summary Update Private Network
   * @param {UpdatePrivateNetworkRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {UpdatePrivateNetworkRequest} updatePrivateNetworkRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public updatePrivateNetwork(
    region: UpdatePrivateNetworkRegionEnum,
    privateNetworkId: string,
    updatePrivateNetworkRequest: UpdatePrivateNetworkRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .updatePrivateNetwork(
        region,
        privateNetworkId,
        updatePrivateNetworkRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CreatePrivateNetworkRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type CreatePrivateNetworkRegionEnum =
  (typeof CreatePrivateNetworkRegionEnum)[keyof typeof CreatePrivateNetworkRegionEnum];
/**
 * @export
 */
export const DeletePrivateNetworkRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type DeletePrivateNetworkRegionEnum =
  (typeof DeletePrivateNetworkRegionEnum)[keyof typeof DeletePrivateNetworkRegionEnum];
/**
 * @export
 */
export const EnableDHCPRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type EnableDHCPRegionEnum =
  (typeof EnableDHCPRegionEnum)[keyof typeof EnableDHCPRegionEnum];
/**
 * @export
 */
export const GetPrivateNetworkRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type GetPrivateNetworkRegionEnum =
  (typeof GetPrivateNetworkRegionEnum)[keyof typeof GetPrivateNetworkRegionEnum];
/**
 * @export
 */
export const ListPrivateNetworksRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type ListPrivateNetworksRegionEnum =
  (typeof ListPrivateNetworksRegionEnum)[keyof typeof ListPrivateNetworksRegionEnum];
/**
 * @export
 */
export const ListPrivateNetworksOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  NameAsc: 'name_asc',
  NameDesc: 'name_desc',
} as const;
export type ListPrivateNetworksOrderByEnum =
  (typeof ListPrivateNetworksOrderByEnum)[keyof typeof ListPrivateNetworksOrderByEnum];
/**
 * @export
 */
export const UpdatePrivateNetworkRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type UpdatePrivateNetworkRegionEnum =
  (typeof UpdatePrivateNetworkRegionEnum)[keyof typeof UpdatePrivateNetworkRegionEnum];

/**
 * RoutesApi - axios parameter creator
 * @export
 */
export const RoutesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new custom Route.
     * @summary Create a Route
     * @param {CreateRouteRegionEnum} region The region you want to target
     * @param {CreateRouteRequest} createRouteRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createRoute: async (
      region: CreateRouteRegionEnum,
      createRouteRequest: CreateRouteRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('createRoute', 'region', region);
      // verify required parameter 'createRouteRequest' is not null or undefined
      assertParamExists(
        'createRoute',
        'createRouteRequest',
        createRouteRequest,
      );
      const localVarPath = `/vpc/v2/regions/{region}/routes`.replace(
        `{${'region'}}`,
        encodeURIComponent(String(region)),
      );
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
        createRouteRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete a Route specified by its Route ID.
     * @summary Delete a Route
     * @param {DeleteRouteRegionEnum} region The region you want to target
     * @param {string} routeId Route ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteRoute: async (
      region: DeleteRouteRegionEnum,
      routeId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('deleteRoute', 'region', region);
      // verify required parameter 'routeId' is not null or undefined
      assertParamExists('deleteRoute', 'routeId', routeId);
      const localVarPath = `/vpc/v2/regions/{region}/routes/{route_id}`
        .replace(`{${'region'}}`, encodeURIComponent(String(region)))
        .replace(`{${'route_id'}}`, encodeURIComponent(String(routeId)));
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
     * Retrieve details of an existing Route, specified by its Route ID.
     * @summary Get a Route
     * @param {GetRouteRegionEnum} region The region you want to target
     * @param {string} routeId Route ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRoute: async (
      region: GetRouteRegionEnum,
      routeId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('getRoute', 'region', region);
      // verify required parameter 'routeId' is not null or undefined
      assertParamExists('getRoute', 'routeId', routeId);
      const localVarPath = `/vpc/v2/regions/{region}/routes/{route_id}`
        .replace(`{${'region'}}`, encodeURIComponent(String(region)))
        .replace(`{${'route_id'}}`, encodeURIComponent(String(routeId)));
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
     * Update parameters of the specified Route.
     * @summary Update Route
     * @param {UpdateRouteRegionEnum} region The region you want to target
     * @param {string} routeId Route ID. (UUID format)
     * @param {UpdateRouteRequest} updateRouteRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateRoute: async (
      region: UpdateRouteRegionEnum,
      routeId: string,
      updateRouteRequest: UpdateRouteRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('updateRoute', 'region', region);
      // verify required parameter 'routeId' is not null or undefined
      assertParamExists('updateRoute', 'routeId', routeId);
      // verify required parameter 'updateRouteRequest' is not null or undefined
      assertParamExists(
        'updateRoute',
        'updateRouteRequest',
        updateRouteRequest,
      );
      const localVarPath = `/vpc/v2/regions/{region}/routes/{route_id}`
        .replace(`{${'region'}}`, encodeURIComponent(String(region)))
        .replace(`{${'route_id'}}`, encodeURIComponent(String(routeId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'PATCH',
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
        updateRouteRequest,
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
 * RoutesApi - functional programming interface
 * @export
 */
export const RoutesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = RoutesApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new custom Route.
     * @summary Create a Route
     * @param {CreateRouteRegionEnum} region The region you want to target
     * @param {CreateRouteRequest} createRouteRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createRoute(
      region: CreateRouteRegionEnum,
      createRouteRequest: CreateRouteRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2Route>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createRoute(
        region,
        createRouteRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RoutesApi.createRoute']?.[
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
     * Delete a Route specified by its Route ID.
     * @summary Delete a Route
     * @param {DeleteRouteRegionEnum} region The region you want to target
     * @param {string} routeId Route ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteRoute(
      region: DeleteRouteRegionEnum,
      routeId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteRoute(
        region,
        routeId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RoutesApi.deleteRoute']?.[
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
     * Retrieve details of an existing Route, specified by its Route ID.
     * @summary Get a Route
     * @param {GetRouteRegionEnum} region The region you want to target
     * @param {string} routeId Route ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getRoute(
      region: GetRouteRegionEnum,
      routeId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2Route>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getRoute(
        region,
        routeId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RoutesApi.getRoute']?.[localVarOperationServerIndex]
          ?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Update parameters of the specified Route.
     * @summary Update Route
     * @param {UpdateRouteRegionEnum} region The region you want to target
     * @param {string} routeId Route ID. (UUID format)
     * @param {UpdateRouteRequest} updateRouteRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateRoute(
      region: UpdateRouteRegionEnum,
      routeId: string,
      updateRouteRequest: UpdateRouteRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2Route>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateRoute(
        region,
        routeId,
        updateRouteRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RoutesApi.updateRoute']?.[
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
 * RoutesApi - factory interface
 * @export
 */
export const RoutesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = RoutesApiFp(configuration);
  return {
    /**
     * Create a new custom Route.
     * @summary Create a Route
     * @param {CreateRouteRegionEnum} region The region you want to target
     * @param {CreateRouteRequest} createRouteRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createRoute(
      region: CreateRouteRegionEnum,
      createRouteRequest: CreateRouteRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2Route> {
      return localVarFp
        .createRoute(region, createRouteRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete a Route specified by its Route ID.
     * @summary Delete a Route
     * @param {DeleteRouteRegionEnum} region The region you want to target
     * @param {string} routeId Route ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteRoute(
      region: DeleteRouteRegionEnum,
      routeId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteRoute(region, routeId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve details of an existing Route, specified by its Route ID.
     * @summary Get a Route
     * @param {GetRouteRegionEnum} region The region you want to target
     * @param {string} routeId Route ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getRoute(
      region: GetRouteRegionEnum,
      routeId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2Route> {
      return localVarFp
        .getRoute(region, routeId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update parameters of the specified Route.
     * @summary Update Route
     * @param {UpdateRouteRegionEnum} region The region you want to target
     * @param {string} routeId Route ID. (UUID format)
     * @param {UpdateRouteRequest} updateRouteRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateRoute(
      region: UpdateRouteRegionEnum,
      routeId: string,
      updateRouteRequest: UpdateRouteRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2Route> {
      return localVarFp
        .updateRoute(region, routeId, updateRouteRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * RoutesApi - interface
 * @export
 * @interface RoutesApi
 */
export interface RoutesApiInterface {
  /**
   * Create a new custom Route.
   * @summary Create a Route
   * @param {CreateRouteRegionEnum} region The region you want to target
   * @param {CreateRouteRequest} createRouteRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RoutesApiInterface
   */
  createRoute(
    region: CreateRouteRegionEnum,
    createRouteRequest: CreateRouteRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2Route>;

  /**
   * Delete a Route specified by its Route ID.
   * @summary Delete a Route
   * @param {DeleteRouteRegionEnum} region The region you want to target
   * @param {string} routeId Route ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RoutesApiInterface
   */
  deleteRoute(
    region: DeleteRouteRegionEnum,
    routeId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Retrieve details of an existing Route, specified by its Route ID.
   * @summary Get a Route
   * @param {GetRouteRegionEnum} region The region you want to target
   * @param {string} routeId Route ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RoutesApiInterface
   */
  getRoute(
    region: GetRouteRegionEnum,
    routeId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2Route>;

  /**
   * Update parameters of the specified Route.
   * @summary Update Route
   * @param {UpdateRouteRegionEnum} region The region you want to target
   * @param {string} routeId Route ID. (UUID format)
   * @param {UpdateRouteRequest} updateRouteRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RoutesApiInterface
   */
  updateRoute(
    region: UpdateRouteRegionEnum,
    routeId: string,
    updateRouteRequest: UpdateRouteRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2Route>;
}

/**
 * RoutesApi - object-oriented interface
 * @export
 * @class RoutesApi
 * @extends {BaseAPI}
 */
export class RoutesApi extends BaseAPI implements RoutesApiInterface {
  /**
   * Create a new custom Route.
   * @summary Create a Route
   * @param {CreateRouteRegionEnum} region The region you want to target
   * @param {CreateRouteRequest} createRouteRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RoutesApi
   */
  public createRoute(
    region: CreateRouteRegionEnum,
    createRouteRequest: CreateRouteRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return RoutesApiFp(this.configuration)
      .createRoute(region, createRouteRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete a Route specified by its Route ID.
   * @summary Delete a Route
   * @param {DeleteRouteRegionEnum} region The region you want to target
   * @param {string} routeId Route ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RoutesApi
   */
  public deleteRoute(
    region: DeleteRouteRegionEnum,
    routeId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RoutesApiFp(this.configuration)
      .deleteRoute(region, routeId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve details of an existing Route, specified by its Route ID.
   * @summary Get a Route
   * @param {GetRouteRegionEnum} region The region you want to target
   * @param {string} routeId Route ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RoutesApi
   */
  public getRoute(
    region: GetRouteRegionEnum,
    routeId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RoutesApiFp(this.configuration)
      .getRoute(region, routeId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update parameters of the specified Route.
   * @summary Update Route
   * @param {UpdateRouteRegionEnum} region The region you want to target
   * @param {string} routeId Route ID. (UUID format)
   * @param {UpdateRouteRequest} updateRouteRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RoutesApi
   */
  public updateRoute(
    region: UpdateRouteRegionEnum,
    routeId: string,
    updateRouteRequest: UpdateRouteRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return RoutesApiFp(this.configuration)
      .updateRoute(region, routeId, updateRouteRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CreateRouteRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type CreateRouteRegionEnum =
  (typeof CreateRouteRegionEnum)[keyof typeof CreateRouteRegionEnum];
/**
 * @export
 */
export const DeleteRouteRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type DeleteRouteRegionEnum =
  (typeof DeleteRouteRegionEnum)[keyof typeof DeleteRouteRegionEnum];
/**
 * @export
 */
export const GetRouteRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type GetRouteRegionEnum =
  (typeof GetRouteRegionEnum)[keyof typeof GetRouteRegionEnum];
/**
 * @export
 */
export const UpdateRouteRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type UpdateRouteRegionEnum =
  (typeof UpdateRouteRegionEnum)[keyof typeof UpdateRouteRegionEnum];

/**
 * SubnetsApi - axios parameter creator
 * @export
 */
export const SubnetsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Add new subnets to an existing Private Network.
     * @summary Add subnets to a Private Network
     * @param {AddSubnetsRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {AddSubnetsRequest} addSubnetsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addSubnets: async (
      region: AddSubnetsRegionEnum,
      privateNetworkId: string,
      addSubnetsRequest: AddSubnetsRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('addSubnets', 'region', region);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists('addSubnets', 'privateNetworkId', privateNetworkId);
      // verify required parameter 'addSubnetsRequest' is not null or undefined
      assertParamExists('addSubnets', 'addSubnetsRequest', addSubnetsRequest);
      const localVarPath =
        `/vpc/v2/regions/{region}/private-networks/{private_network_id}/subnets`
          .replace(`{${'region'}}`, encodeURIComponent(String(region)))
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
        addSubnetsRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete the specified subnets from a Private Network.
     * @summary Delete subnets from a Private Network
     * @param {DeleteSubnetsRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {AddSubnetsRequest} addSubnetsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSubnets: async (
      region: DeleteSubnetsRegionEnum,
      privateNetworkId: string,
      addSubnetsRequest: AddSubnetsRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('deleteSubnets', 'region', region);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists('deleteSubnets', 'privateNetworkId', privateNetworkId);
      // verify required parameter 'addSubnetsRequest' is not null or undefined
      assertParamExists(
        'deleteSubnets',
        'addSubnetsRequest',
        addSubnetsRequest,
      );
      const localVarPath =
        `/vpc/v2/regions/{region}/private-networks/{private_network_id}/subnets`
          .replace(`{${'region'}}`, encodeURIComponent(String(region)))
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
        addSubnetsRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * List any Private Network\'s subnets. See ListPrivateNetworks to list a specific Private Network\'s subnets.
     * @summary List subnets
     * @param {ListSubnetsRegionEnum} region The region you want to target
     * @param {ListSubnetsOrderByEnum} [orderBy] Sort order of the returned subnets.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of Private Networks to return per page.
     * @param {string} [organizationId] Organization ID to filter for. Only subnets belonging to this Organization will be returned. (UUID format)
     * @param {string} [projectId] Project ID to filter for. Only subnets belonging to this Project will be returned. (UUID format)
     * @param {Array<string>} [subnetIds] Subnet IDs to filter for. Only subnets matching the specified IDs will be returned.
     * @param {string} [vpcId] VPC ID to filter for. Only subnets belonging to this VPC will be returned. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSubnets: async (
      region: ListSubnetsRegionEnum,
      orderBy?: ListSubnetsOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      projectId?: string,
      subnetIds?: Array<string>,
      vpcId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('listSubnets', 'region', region);
      const localVarPath = `/vpc/v2/regions/{region}/subnets`.replace(
        `{${'region'}}`,
        encodeURIComponent(String(region)),
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

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (projectId !== undefined) {
        localVarQueryParameter['project_id'] = projectId;
      }

      if (subnetIds) {
        localVarQueryParameter['subnet_ids'] = subnetIds;
      }

      if (vpcId !== undefined) {
        localVarQueryParameter['vpc_id'] = vpcId;
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
  };
};

/**
 * SubnetsApi - functional programming interface
 * @export
 */
export const SubnetsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = SubnetsApiAxiosParamCreator(configuration);
  return {
    /**
     * Add new subnets to an existing Private Network.
     * @summary Add subnets to a Private Network
     * @param {AddSubnetsRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {AddSubnetsRequest} addSubnetsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async addSubnets(
      region: AddSubnetsRegionEnum,
      privateNetworkId: string,
      addSubnetsRequest: AddSubnetsRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2AddSubnetsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.addSubnets(
        region,
        privateNetworkId,
        addSubnetsRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SubnetsApi.addSubnets']?.[
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
     * Delete the specified subnets from a Private Network.
     * @summary Delete subnets from a Private Network
     * @param {DeleteSubnetsRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {AddSubnetsRequest} addSubnetsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSubnets(
      region: DeleteSubnetsRegionEnum,
      privateNetworkId: string,
      addSubnetsRequest: AddSubnetsRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2DeleteSubnetsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteSubnets(
        region,
        privateNetworkId,
        addSubnetsRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SubnetsApi.deleteSubnets']?.[
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
     * List any Private Network\'s subnets. See ListPrivateNetworks to list a specific Private Network\'s subnets.
     * @summary List subnets
     * @param {ListSubnetsRegionEnum} region The region you want to target
     * @param {ListSubnetsOrderByEnum} [orderBy] Sort order of the returned subnets.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of Private Networks to return per page.
     * @param {string} [organizationId] Organization ID to filter for. Only subnets belonging to this Organization will be returned. (UUID format)
     * @param {string} [projectId] Project ID to filter for. Only subnets belonging to this Project will be returned. (UUID format)
     * @param {Array<string>} [subnetIds] Subnet IDs to filter for. Only subnets matching the specified IDs will be returned.
     * @param {string} [vpcId] VPC ID to filter for. Only subnets belonging to this VPC will be returned. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listSubnets(
      region: ListSubnetsRegionEnum,
      orderBy?: ListSubnetsOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      projectId?: string,
      subnetIds?: Array<string>,
      vpcId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2ListSubnetsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listSubnets(
        region,
        orderBy,
        page,
        pageSize,
        organizationId,
        projectId,
        subnetIds,
        vpcId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SubnetsApi.listSubnets']?.[
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
 * SubnetsApi - factory interface
 * @export
 */
export const SubnetsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = SubnetsApiFp(configuration);
  return {
    /**
     * Add new subnets to an existing Private Network.
     * @summary Add subnets to a Private Network
     * @param {AddSubnetsRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {AddSubnetsRequest} addSubnetsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addSubnets(
      region: AddSubnetsRegionEnum,
      privateNetworkId: string,
      addSubnetsRequest: AddSubnetsRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2AddSubnetsResponse> {
      return localVarFp
        .addSubnets(region, privateNetworkId, addSubnetsRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete the specified subnets from a Private Network.
     * @summary Delete subnets from a Private Network
     * @param {DeleteSubnetsRegionEnum} region The region you want to target
     * @param {string} privateNetworkId Private Network ID. (UUID format)
     * @param {AddSubnetsRequest} addSubnetsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSubnets(
      region: DeleteSubnetsRegionEnum,
      privateNetworkId: string,
      addSubnetsRequest: AddSubnetsRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2DeleteSubnetsResponse> {
      return localVarFp
        .deleteSubnets(region, privateNetworkId, addSubnetsRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List any Private Network\'s subnets. See ListPrivateNetworks to list a specific Private Network\'s subnets.
     * @summary List subnets
     * @param {ListSubnetsRegionEnum} region The region you want to target
     * @param {ListSubnetsOrderByEnum} [orderBy] Sort order of the returned subnets.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of Private Networks to return per page.
     * @param {string} [organizationId] Organization ID to filter for. Only subnets belonging to this Organization will be returned. (UUID format)
     * @param {string} [projectId] Project ID to filter for. Only subnets belonging to this Project will be returned. (UUID format)
     * @param {Array<string>} [subnetIds] Subnet IDs to filter for. Only subnets matching the specified IDs will be returned.
     * @param {string} [vpcId] VPC ID to filter for. Only subnets belonging to this VPC will be returned. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSubnets(
      region: ListSubnetsRegionEnum,
      orderBy?: ListSubnetsOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      projectId?: string,
      subnetIds?: Array<string>,
      vpcId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2ListSubnetsResponse> {
      return localVarFp
        .listSubnets(
          region,
          orderBy,
          page,
          pageSize,
          organizationId,
          projectId,
          subnetIds,
          vpcId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SubnetsApi - interface
 * @export
 * @interface SubnetsApi
 */
export interface SubnetsApiInterface {
  /**
   * Add new subnets to an existing Private Network.
   * @summary Add subnets to a Private Network
   * @param {AddSubnetsRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {AddSubnetsRequest} addSubnetsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SubnetsApiInterface
   */
  addSubnets(
    region: AddSubnetsRegionEnum,
    privateNetworkId: string,
    addSubnetsRequest: AddSubnetsRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2AddSubnetsResponse>;

  /**
   * Delete the specified subnets from a Private Network.
   * @summary Delete subnets from a Private Network
   * @param {DeleteSubnetsRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {AddSubnetsRequest} addSubnetsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SubnetsApiInterface
   */
  deleteSubnets(
    region: DeleteSubnetsRegionEnum,
    privateNetworkId: string,
    addSubnetsRequest: AddSubnetsRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2DeleteSubnetsResponse>;

  /**
   * List any Private Network\'s subnets. See ListPrivateNetworks to list a specific Private Network\'s subnets.
   * @summary List subnets
   * @param {ListSubnetsRegionEnum} region The region you want to target
   * @param {ListSubnetsOrderByEnum} [orderBy] Sort order of the returned subnets.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of Private Networks to return per page.
   * @param {string} [organizationId] Organization ID to filter for. Only subnets belonging to this Organization will be returned. (UUID format)
   * @param {string} [projectId] Project ID to filter for. Only subnets belonging to this Project will be returned. (UUID format)
   * @param {Array<string>} [subnetIds] Subnet IDs to filter for. Only subnets matching the specified IDs will be returned.
   * @param {string} [vpcId] VPC ID to filter for. Only subnets belonging to this VPC will be returned. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SubnetsApiInterface
   */
  listSubnets(
    region: ListSubnetsRegionEnum,
    orderBy?: ListSubnetsOrderByEnum,
    page?: number,
    pageSize?: number,
    organizationId?: string,
    projectId?: string,
    subnetIds?: Array<string>,
    vpcId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2ListSubnetsResponse>;
}

/**
 * SubnetsApi - object-oriented interface
 * @export
 * @class SubnetsApi
 * @extends {BaseAPI}
 */
export class SubnetsApi extends BaseAPI implements SubnetsApiInterface {
  /**
   * Add new subnets to an existing Private Network.
   * @summary Add subnets to a Private Network
   * @param {AddSubnetsRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {AddSubnetsRequest} addSubnetsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SubnetsApi
   */
  public addSubnets(
    region: AddSubnetsRegionEnum,
    privateNetworkId: string,
    addSubnetsRequest: AddSubnetsRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SubnetsApiFp(this.configuration)
      .addSubnets(region, privateNetworkId, addSubnetsRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete the specified subnets from a Private Network.
   * @summary Delete subnets from a Private Network
   * @param {DeleteSubnetsRegionEnum} region The region you want to target
   * @param {string} privateNetworkId Private Network ID. (UUID format)
   * @param {AddSubnetsRequest} addSubnetsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SubnetsApi
   */
  public deleteSubnets(
    region: DeleteSubnetsRegionEnum,
    privateNetworkId: string,
    addSubnetsRequest: AddSubnetsRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SubnetsApiFp(this.configuration)
      .deleteSubnets(region, privateNetworkId, addSubnetsRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List any Private Network\'s subnets. See ListPrivateNetworks to list a specific Private Network\'s subnets.
   * @summary List subnets
   * @param {ListSubnetsRegionEnum} region The region you want to target
   * @param {ListSubnetsOrderByEnum} [orderBy] Sort order of the returned subnets.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of Private Networks to return per page.
   * @param {string} [organizationId] Organization ID to filter for. Only subnets belonging to this Organization will be returned. (UUID format)
   * @param {string} [projectId] Project ID to filter for. Only subnets belonging to this Project will be returned. (UUID format)
   * @param {Array<string>} [subnetIds] Subnet IDs to filter for. Only subnets matching the specified IDs will be returned.
   * @param {string} [vpcId] VPC ID to filter for. Only subnets belonging to this VPC will be returned. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SubnetsApi
   */
  public listSubnets(
    region: ListSubnetsRegionEnum,
    orderBy?: ListSubnetsOrderByEnum,
    page?: number,
    pageSize?: number,
    organizationId?: string,
    projectId?: string,
    subnetIds?: Array<string>,
    vpcId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SubnetsApiFp(this.configuration)
      .listSubnets(
        region,
        orderBy,
        page,
        pageSize,
        organizationId,
        projectId,
        subnetIds,
        vpcId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const AddSubnetsRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type AddSubnetsRegionEnum =
  (typeof AddSubnetsRegionEnum)[keyof typeof AddSubnetsRegionEnum];
/**
 * @export
 */
export const DeleteSubnetsRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type DeleteSubnetsRegionEnum =
  (typeof DeleteSubnetsRegionEnum)[keyof typeof DeleteSubnetsRegionEnum];
/**
 * @export
 */
export const ListSubnetsRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type ListSubnetsRegionEnum =
  (typeof ListSubnetsRegionEnum)[keyof typeof ListSubnetsRegionEnum];
/**
 * @export
 */
export const ListSubnetsOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
} as const;
export type ListSubnetsOrderByEnum =
  (typeof ListSubnetsOrderByEnum)[keyof typeof ListSubnetsOrderByEnum];

/**
 * VPCsApi - axios parameter creator
 * @export
 */
export const VPCsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new VPC in the specified region.
     * @summary Create a VPC
     * @param {CreateVPCRegionEnum} region The region you want to target
     * @param {CreateVPCRequest} createVPCRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createVPC: async (
      region: CreateVPCRegionEnum,
      createVPCRequest: CreateVPCRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('createVPC', 'region', region);
      // verify required parameter 'createVPCRequest' is not null or undefined
      assertParamExists('createVPC', 'createVPCRequest', createVPCRequest);
      const localVarPath = `/vpc/v2/regions/{region}/vpcs`.replace(
        `{${'region'}}`,
        encodeURIComponent(String(region)),
      );
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
        createVPCRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete a VPC specified by its VPC ID.
     * @summary Delete a VPC
     * @param {DeleteVPCRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteVPC: async (
      region: DeleteVPCRegionEnum,
      vpcId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('deleteVPC', 'region', region);
      // verify required parameter 'vpcId' is not null or undefined
      assertParamExists('deleteVPC', 'vpcId', vpcId);
      const localVarPath = `/vpc/v2/regions/{region}/vpcs/{vpc_id}`
        .replace(`{${'region'}}`, encodeURIComponent(String(region)))
        .replace(`{${'vpc_id'}}`, encodeURIComponent(String(vpcId)));
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
     * Enable routing on an existing VPC. Note that you will not be able to deactivate it afterwards.
     * @summary Enable routing on a VPC
     * @param {EnableRoutingRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    enableRouting: async (
      region: EnableRoutingRegionEnum,
      vpcId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('enableRouting', 'region', region);
      // verify required parameter 'vpcId' is not null or undefined
      assertParamExists('enableRouting', 'vpcId', vpcId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('enableRouting', 'body', body);
      const localVarPath =
        `/vpc/v2/regions/{region}/vpcs/{vpc_id}/enable-routing`
          .replace(`{${'region'}}`, encodeURIComponent(String(region)))
          .replace(`{${'vpc_id'}}`, encodeURIComponent(String(vpcId)));
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
        body,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Retrieve details of an existing VPC, specified by its VPC ID.
     * @summary Get a VPC
     * @param {GetVPCRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getVPC: async (
      region: GetVPCRegionEnum,
      vpcId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('getVPC', 'region', region);
      // verify required parameter 'vpcId' is not null or undefined
      assertParamExists('getVPC', 'vpcId', vpcId);
      const localVarPath = `/vpc/v2/regions/{region}/vpcs/{vpc_id}`
        .replace(`{${'region'}}`, encodeURIComponent(String(region)))
        .replace(`{${'vpc_id'}}`, encodeURIComponent(String(vpcId)));
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
     * List existing VPCs in the specified region.
     * @summary List VPCs
     * @param {ListVPCsRegionEnum} region The region you want to target
     * @param {ListVPCsOrderByEnum} [orderBy] Sort order of the returned VPCs.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of VPCs to return per page.
     * @param {string} [name] Name to filter for. Only VPCs with names containing this string will be returned.
     * @param {Array<string>} [tags] Tags to filter for. Only VPCs with one or more matching tags will be returned.
     * @param {string} [organizationId] Organization ID to filter for. Only VPCs belonging to this Organization will be returned. (UUID format)
     * @param {string} [projectId] Project ID to filter for. Only VPCs belonging to this Project will be returned. (UUID format)
     * @param {boolean} [isDefault] Defines whether to filter only for VPCs which are the default one for their Project.
     * @param {boolean} [routingEnabled] Defines whether to filter only for VPCs which route traffic between their Private Networks.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listVPCs: async (
      region: ListVPCsRegionEnum,
      orderBy?: ListVPCsOrderByEnum,
      page?: number,
      pageSize?: number,
      name?: string,
      tags?: Array<string>,
      organizationId?: string,
      projectId?: string,
      isDefault?: boolean,
      routingEnabled?: boolean,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('listVPCs', 'region', region);
      const localVarPath = `/vpc/v2/regions/{region}/vpcs`.replace(
        `{${'region'}}`,
        encodeURIComponent(String(region)),
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

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (tags) {
        localVarQueryParameter['tags'] = tags;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (projectId !== undefined) {
        localVarQueryParameter['project_id'] = projectId;
      }

      if (isDefault !== undefined) {
        localVarQueryParameter['is_default'] = isDefault;
      }

      if (routingEnabled !== undefined) {
        localVarQueryParameter['routing_enabled'] = routingEnabled;
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
     * Update parameters including name and tags of the specified VPC.
     * @summary Update VPC
     * @param {UpdateVPCRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {UpdateVPCRequest} updateVPCRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateVPC: async (
      region: UpdateVPCRegionEnum,
      vpcId: string,
      updateVPCRequest: UpdateVPCRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'region' is not null or undefined
      assertParamExists('updateVPC', 'region', region);
      // verify required parameter 'vpcId' is not null or undefined
      assertParamExists('updateVPC', 'vpcId', vpcId);
      // verify required parameter 'updateVPCRequest' is not null or undefined
      assertParamExists('updateVPC', 'updateVPCRequest', updateVPCRequest);
      const localVarPath = `/vpc/v2/regions/{region}/vpcs/{vpc_id}`
        .replace(`{${'region'}}`, encodeURIComponent(String(region)))
        .replace(`{${'vpc_id'}}`, encodeURIComponent(String(vpcId)));
      // use dummy base URL string because the URL constructor only accepts absolute URLs.
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = {
        method: 'PATCH',
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
        updateVPCRequest,
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
 * VPCsApi - functional programming interface
 * @export
 */
export const VPCsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = VPCsApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new VPC in the specified region.
     * @summary Create a VPC
     * @param {CreateVPCRegionEnum} region The region you want to target
     * @param {CreateVPCRequest} createVPCRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createVPC(
      region: CreateVPCRegionEnum,
      createVPCRequest: CreateVPCRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2VPC>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createVPC(
        region,
        createVPCRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VPCsApi.createVPC']?.[localVarOperationServerIndex]
          ?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Delete a VPC specified by its VPC ID.
     * @summary Delete a VPC
     * @param {DeleteVPCRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteVPC(
      region: DeleteVPCRegionEnum,
      vpcId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteVPC(
        region,
        vpcId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VPCsApi.deleteVPC']?.[localVarOperationServerIndex]
          ?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Enable routing on an existing VPC. Note that you will not be able to deactivate it afterwards.
     * @summary Enable routing on a VPC
     * @param {EnableRoutingRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async enableRouting(
      region: EnableRoutingRegionEnum,
      vpcId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2VPC>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.enableRouting(
        region,
        vpcId,
        body,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VPCsApi.enableRouting']?.[
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
     * Retrieve details of an existing VPC, specified by its VPC ID.
     * @summary Get a VPC
     * @param {GetVPCRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getVPC(
      region: GetVPCRegionEnum,
      vpcId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2VPC>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getVPC(
        region,
        vpcId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VPCsApi.getVPC']?.[localVarOperationServerIndex]
          ?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * List existing VPCs in the specified region.
     * @summary List VPCs
     * @param {ListVPCsRegionEnum} region The region you want to target
     * @param {ListVPCsOrderByEnum} [orderBy] Sort order of the returned VPCs.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of VPCs to return per page.
     * @param {string} [name] Name to filter for. Only VPCs with names containing this string will be returned.
     * @param {Array<string>} [tags] Tags to filter for. Only VPCs with one or more matching tags will be returned.
     * @param {string} [organizationId] Organization ID to filter for. Only VPCs belonging to this Organization will be returned. (UUID format)
     * @param {string} [projectId] Project ID to filter for. Only VPCs belonging to this Project will be returned. (UUID format)
     * @param {boolean} [isDefault] Defines whether to filter only for VPCs which are the default one for their Project.
     * @param {boolean} [routingEnabled] Defines whether to filter only for VPCs which route traffic between their Private Networks.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listVPCs(
      region: ListVPCsRegionEnum,
      orderBy?: ListVPCsOrderByEnum,
      page?: number,
      pageSize?: number,
      name?: string,
      tags?: Array<string>,
      organizationId?: string,
      projectId?: string,
      isDefault?: boolean,
      routingEnabled?: boolean,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2ListVPCsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listVPCs(
        region,
        orderBy,
        page,
        pageSize,
        name,
        tags,
        organizationId,
        projectId,
        isDefault,
        routingEnabled,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VPCsApi.listVPCs']?.[localVarOperationServerIndex]
          ?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * Update parameters including name and tags of the specified VPC.
     * @summary Update VPC
     * @param {UpdateVPCRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {UpdateVPCRequest} updateVPCRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateVPC(
      region: UpdateVPCRegionEnum,
      vpcId: string,
      updateVPCRequest: UpdateVPCRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayVpcV2VPC>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateVPC(
        region,
        vpcId,
        updateVPCRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VPCsApi.updateVPC']?.[localVarOperationServerIndex]
          ?.url;
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
 * VPCsApi - factory interface
 * @export
 */
export const VPCsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = VPCsApiFp(configuration);
  return {
    /**
     * Create a new VPC in the specified region.
     * @summary Create a VPC
     * @param {CreateVPCRegionEnum} region The region you want to target
     * @param {CreateVPCRequest} createVPCRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createVPC(
      region: CreateVPCRegionEnum,
      createVPCRequest: CreateVPCRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2VPC> {
      return localVarFp
        .createVPC(region, createVPCRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete a VPC specified by its VPC ID.
     * @summary Delete a VPC
     * @param {DeleteVPCRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteVPC(
      region: DeleteVPCRegionEnum,
      vpcId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteVPC(region, vpcId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Enable routing on an existing VPC. Note that you will not be able to deactivate it afterwards.
     * @summary Enable routing on a VPC
     * @param {EnableRoutingRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    enableRouting(
      region: EnableRoutingRegionEnum,
      vpcId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2VPC> {
      return localVarFp
        .enableRouting(region, vpcId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve details of an existing VPC, specified by its VPC ID.
     * @summary Get a VPC
     * @param {GetVPCRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getVPC(
      region: GetVPCRegionEnum,
      vpcId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2VPC> {
      return localVarFp
        .getVPC(region, vpcId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List existing VPCs in the specified region.
     * @summary List VPCs
     * @param {ListVPCsRegionEnum} region The region you want to target
     * @param {ListVPCsOrderByEnum} [orderBy] Sort order of the returned VPCs.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of VPCs to return per page.
     * @param {string} [name] Name to filter for. Only VPCs with names containing this string will be returned.
     * @param {Array<string>} [tags] Tags to filter for. Only VPCs with one or more matching tags will be returned.
     * @param {string} [organizationId] Organization ID to filter for. Only VPCs belonging to this Organization will be returned. (UUID format)
     * @param {string} [projectId] Project ID to filter for. Only VPCs belonging to this Project will be returned. (UUID format)
     * @param {boolean} [isDefault] Defines whether to filter only for VPCs which are the default one for their Project.
     * @param {boolean} [routingEnabled] Defines whether to filter only for VPCs which route traffic between their Private Networks.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listVPCs(
      region: ListVPCsRegionEnum,
      orderBy?: ListVPCsOrderByEnum,
      page?: number,
      pageSize?: number,
      name?: string,
      tags?: Array<string>,
      organizationId?: string,
      projectId?: string,
      isDefault?: boolean,
      routingEnabled?: boolean,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2ListVPCsResponse> {
      return localVarFp
        .listVPCs(
          region,
          orderBy,
          page,
          pageSize,
          name,
          tags,
          organizationId,
          projectId,
          isDefault,
          routingEnabled,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update parameters including name and tags of the specified VPC.
     * @summary Update VPC
     * @param {UpdateVPCRegionEnum} region The region you want to target
     * @param {string} vpcId VPC ID. (UUID format)
     * @param {UpdateVPCRequest} updateVPCRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateVPC(
      region: UpdateVPCRegionEnum,
      vpcId: string,
      updateVPCRequest: UpdateVPCRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayVpcV2VPC> {
      return localVarFp
        .updateVPC(region, vpcId, updateVPCRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * VPCsApi - interface
 * @export
 * @interface VPCsApi
 */
export interface VPCsApiInterface {
  /**
   * Create a new VPC in the specified region.
   * @summary Create a VPC
   * @param {CreateVPCRegionEnum} region The region you want to target
   * @param {CreateVPCRequest} createVPCRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApiInterface
   */
  createVPC(
    region: CreateVPCRegionEnum,
    createVPCRequest: CreateVPCRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2VPC>;

  /**
   * Delete a VPC specified by its VPC ID.
   * @summary Delete a VPC
   * @param {DeleteVPCRegionEnum} region The region you want to target
   * @param {string} vpcId VPC ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApiInterface
   */
  deleteVPC(
    region: DeleteVPCRegionEnum,
    vpcId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Enable routing on an existing VPC. Note that you will not be able to deactivate it afterwards.
   * @summary Enable routing on a VPC
   * @param {EnableRoutingRegionEnum} region The region you want to target
   * @param {string} vpcId VPC ID. (UUID format)
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApiInterface
   */
  enableRouting(
    region: EnableRoutingRegionEnum,
    vpcId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2VPC>;

  /**
   * Retrieve details of an existing VPC, specified by its VPC ID.
   * @summary Get a VPC
   * @param {GetVPCRegionEnum} region The region you want to target
   * @param {string} vpcId VPC ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApiInterface
   */
  getVPC(
    region: GetVPCRegionEnum,
    vpcId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2VPC>;

  /**
   * List existing VPCs in the specified region.
   * @summary List VPCs
   * @param {ListVPCsRegionEnum} region The region you want to target
   * @param {ListVPCsOrderByEnum} [orderBy] Sort order of the returned VPCs.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of VPCs to return per page.
   * @param {string} [name] Name to filter for. Only VPCs with names containing this string will be returned.
   * @param {Array<string>} [tags] Tags to filter for. Only VPCs with one or more matching tags will be returned.
   * @param {string} [organizationId] Organization ID to filter for. Only VPCs belonging to this Organization will be returned. (UUID format)
   * @param {string} [projectId] Project ID to filter for. Only VPCs belonging to this Project will be returned. (UUID format)
   * @param {boolean} [isDefault] Defines whether to filter only for VPCs which are the default one for their Project.
   * @param {boolean} [routingEnabled] Defines whether to filter only for VPCs which route traffic between their Private Networks.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApiInterface
   */
  listVPCs(
    region: ListVPCsRegionEnum,
    orderBy?: ListVPCsOrderByEnum,
    page?: number,
    pageSize?: number,
    name?: string,
    tags?: Array<string>,
    organizationId?: string,
    projectId?: string,
    isDefault?: boolean,
    routingEnabled?: boolean,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2ListVPCsResponse>;

  /**
   * Update parameters including name and tags of the specified VPC.
   * @summary Update VPC
   * @param {UpdateVPCRegionEnum} region The region you want to target
   * @param {string} vpcId VPC ID. (UUID format)
   * @param {UpdateVPCRequest} updateVPCRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApiInterface
   */
  updateVPC(
    region: UpdateVPCRegionEnum,
    vpcId: string,
    updateVPCRequest: UpdateVPCRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayVpcV2VPC>;
}

/**
 * VPCsApi - object-oriented interface
 * @export
 * @class VPCsApi
 * @extends {BaseAPI}
 */
export class VPCsApi extends BaseAPI implements VPCsApiInterface {
  /**
   * Create a new VPC in the specified region.
   * @summary Create a VPC
   * @param {CreateVPCRegionEnum} region The region you want to target
   * @param {CreateVPCRequest} createVPCRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApi
   */
  public createVPC(
    region: CreateVPCRegionEnum,
    createVPCRequest: CreateVPCRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return VPCsApiFp(this.configuration)
      .createVPC(region, createVPCRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete a VPC specified by its VPC ID.
   * @summary Delete a VPC
   * @param {DeleteVPCRegionEnum} region The region you want to target
   * @param {string} vpcId VPC ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApi
   */
  public deleteVPC(
    region: DeleteVPCRegionEnum,
    vpcId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VPCsApiFp(this.configuration)
      .deleteVPC(region, vpcId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Enable routing on an existing VPC. Note that you will not be able to deactivate it afterwards.
   * @summary Enable routing on a VPC
   * @param {EnableRoutingRegionEnum} region The region you want to target
   * @param {string} vpcId VPC ID. (UUID format)
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApi
   */
  public enableRouting(
    region: EnableRoutingRegionEnum,
    vpcId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return VPCsApiFp(this.configuration)
      .enableRouting(region, vpcId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve details of an existing VPC, specified by its VPC ID.
   * @summary Get a VPC
   * @param {GetVPCRegionEnum} region The region you want to target
   * @param {string} vpcId VPC ID. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApi
   */
  public getVPC(
    region: GetVPCRegionEnum,
    vpcId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VPCsApiFp(this.configuration)
      .getVPC(region, vpcId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List existing VPCs in the specified region.
   * @summary List VPCs
   * @param {ListVPCsRegionEnum} region The region you want to target
   * @param {ListVPCsOrderByEnum} [orderBy] Sort order of the returned VPCs.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of VPCs to return per page.
   * @param {string} [name] Name to filter for. Only VPCs with names containing this string will be returned.
   * @param {Array<string>} [tags] Tags to filter for. Only VPCs with one or more matching tags will be returned.
   * @param {string} [organizationId] Organization ID to filter for. Only VPCs belonging to this Organization will be returned. (UUID format)
   * @param {string} [projectId] Project ID to filter for. Only VPCs belonging to this Project will be returned. (UUID format)
   * @param {boolean} [isDefault] Defines whether to filter only for VPCs which are the default one for their Project.
   * @param {boolean} [routingEnabled] Defines whether to filter only for VPCs which route traffic between their Private Networks.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApi
   */
  public listVPCs(
    region: ListVPCsRegionEnum,
    orderBy?: ListVPCsOrderByEnum,
    page?: number,
    pageSize?: number,
    name?: string,
    tags?: Array<string>,
    organizationId?: string,
    projectId?: string,
    isDefault?: boolean,
    routingEnabled?: boolean,
    options?: RawAxiosRequestConfig,
  ) {
    return VPCsApiFp(this.configuration)
      .listVPCs(
        region,
        orderBy,
        page,
        pageSize,
        name,
        tags,
        organizationId,
        projectId,
        isDefault,
        routingEnabled,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update parameters including name and tags of the specified VPC.
   * @summary Update VPC
   * @param {UpdateVPCRegionEnum} region The region you want to target
   * @param {string} vpcId VPC ID. (UUID format)
   * @param {UpdateVPCRequest} updateVPCRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VPCsApi
   */
  public updateVPC(
    region: UpdateVPCRegionEnum,
    vpcId: string,
    updateVPCRequest: UpdateVPCRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return VPCsApiFp(this.configuration)
      .updateVPC(region, vpcId, updateVPCRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CreateVPCRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type CreateVPCRegionEnum =
  (typeof CreateVPCRegionEnum)[keyof typeof CreateVPCRegionEnum];
/**
 * @export
 */
export const DeleteVPCRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type DeleteVPCRegionEnum =
  (typeof DeleteVPCRegionEnum)[keyof typeof DeleteVPCRegionEnum];
/**
 * @export
 */
export const EnableRoutingRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type EnableRoutingRegionEnum =
  (typeof EnableRoutingRegionEnum)[keyof typeof EnableRoutingRegionEnum];
/**
 * @export
 */
export const GetVPCRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type GetVPCRegionEnum =
  (typeof GetVPCRegionEnum)[keyof typeof GetVPCRegionEnum];
/**
 * @export
 */
export const ListVPCsRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type ListVPCsRegionEnum =
  (typeof ListVPCsRegionEnum)[keyof typeof ListVPCsRegionEnum];
/**
 * @export
 */
export const ListVPCsOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  NameAsc: 'name_asc',
  NameDesc: 'name_desc',
} as const;
export type ListVPCsOrderByEnum =
  (typeof ListVPCsOrderByEnum)[keyof typeof ListVPCsOrderByEnum];
/**
 * @export
 */
export const UpdateVPCRegionEnum = {
  FrPar: 'fr-par',
  NlAms: 'nl-ams',
  PlWaw: 'pl-waw',
} as const;
export type UpdateVPCRegionEnum =
  (typeof UpdateVPCRegionEnum)[keyof typeof UpdateVPCRegionEnum];
