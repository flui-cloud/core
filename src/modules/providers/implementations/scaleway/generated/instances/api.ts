/* tslint:disable */
/* eslint-disable */
/**
 * Instance API
 * Scaleway Instances are virtual machines in the cloud. Different [Instance types](https://www.scaleway.com/en/docs/instances/reference-content/choosing-instance-type/) offer different technical specifications in terms of vCPU, RAM, bandwidth and storage. Once you have created your Instance and installed your image of choice (e.g. an operating system), you can [connect to your Instance via SSH](https://www.scaleway.com/en/docs/instances/how-to/connect-to-instance/) to use it as you wish. When you are done using the Instance, you can delete it from your account.  (switchcolumn) <Message type=\"tip\"> To retrieve information about the different [images](#path-images) available to install on Scaleway Instances, check out our [Marketplace API](https://www.scaleway.com/en/developers/api/marketplace/). </Message> (switchcolumn)   ## Concepts  Refer to our [dedicated concepts page](https://www.scaleway.com/en/docs/instances/concepts/) to find definitions of all concepts and terminology related to Instances.  (switchcolumn) (switchcolumn)  ## Quickstart  1. Configure your environment variables      <Message type=\"note\">     This is an optional step that seeks to simplify your usage of the Instances API. See [Availability Zones](#availability-zones) below for help choosing an Availability Zone. You can find your Project ID in the [Scaleway console](https://console.scaleway.com/project/settings).     </Message>      ```bash     export SCW_SECRET_KEY=\"<API secret key>\"     export SCW_DEFAULT_ZONE=\"<Scaleway Availability Zone>\"     export SCW_PROJECT_ID=\"<Scaleway Project ID>\"     ```  2. **Create an Instance**: Run the following command to create an Instance. You can customize the details in the payload (name, description, type, tags etc) to your needs: use the information below to adjust the payload as necessary.      ```bash     curl -X POST \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -H \"Content-Type: application/json\" \\       \"https://api.scaleway.com/instance/v1/zones/$SCW_DEFAULT_ZONE/servers\" \\         -d \'{           \"name\": \"my-new-instance\",           \"project\": \"\'\"$SCW_PROJECT_ID\"\'\",           \"commercial_type\": \"GP1-S\",           \"image\": \"ubuntu_noble\",           \"enable_ipv6\": true,           \"volumes\": {             \"0\":{               \"size\": 300000000000,               \"volume_type\": \"l_ssd\"             }           }         }\'     ```          | Parameter       | Description                                                                                                                                              | Valid values                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |     | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |     | `name`            | A name of your choice for the Instance (string)                                                                                                          | Any string containing only alphanumeric characters, dots, spaces and dashes, e.g. `\"my-new-instance\"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |     | `project`         | The Project in which the Instance should be created (string)                                                                                             | Any valid Scaleway Project ID (see above), e.g. `\"b4bd99e0-b389-11ed-afa1-0242ac120002\"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |     | `commercial-type` | The commercial Instance type to create (string)                                                                                                          | Any valid ID of a Scaleway commercial Instance type, e.g. `\"GP1-S\"`, `\"PRO2-M\"`. Use the [List Instance Types](#path-instance-types-list-instance-types) endpoint to get a list of all valid Instance types and their IDs.                                                                                                                                                                                                                                                                               |     | `image`           | The image to install on the Instance, e.g. a particular OS (string)                                                                                      | Any Scaleway image label, e.g. `\"ubuntu_noble\"`, or any valid Scaleway image ID, e.g. `\"6fc0ade6-d6a3-4fb9-87ab-2444ac71e5c0\"` which is the ID for the `Ubuntu 24.04 Noble Numbat` image. Use the [List Instance Images](#path-images-list-instance-images) endpoint to get a list of all available images with their IDs and labels, or check out the [Scaleway Marketplace API](https://www.scaleway.com/en/developers/api/marketplace/).                                                                                                                                                                                                                                                                                                     |     | `enable_ipv6`     | Whether to enable IPv6 on the Instance (boolean)                                                                                                         | `true` or `false`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |     | `volumes`         | An object that specifies the storage volumes to attach to the Instance. For more information, see **Creating an Instance: the volumes object** in the [Technical information](#technical-information) section of this quickstart. | A (dictionary) object with a minimum of one key (`\"0\"`) whose value is another object containing the parameters `\"name\"` (a name for the volume), `\"size\"` (the size for the volume, in bytes), and `\"volume_type\"` (`\"l_ssd\"`). Additional keys for additional volumes should increment by 1 each time (the second volume would have a key of `1`.) Further parameters are available, and it is possible to attach existing volumes rather than creating a new one, or create a volume from a snapshot. |  3. **List your Instances**: run the following command to get a list of all the Instances in your account, with their details:      ```bash     curl -X GET \\       -H \"Content-Type: application/json\" \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       \"https://api.scaleway.com/instance/v1/zones/$SCW_DEFAULT_ZONE/servers/\"     ```  4. **Delete an Instance**: run the following command to delete an Instance, specified by its Instance ID:      ```bash     curl -X DELETE \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -H \"Content-Type: application/json\" \\       \"https://api.scaleway.com/instance/v1/zones/$SCW_DEFAULT_ZONE/servers/<Instance-ID>\"     ```      The expected successful response is empty.  (switchcolumn) <Message type=\"requirement\"> - You have a [Scaleway account](https://console.scaleway.com/) - You have created an [API key](https://www.scaleway.com/en/docs/iam/how-to/create-api-keys/) and that the API key has sufficient [IAM permissions](https://www.scaleway.com/en/docs/iam/reference-content/permission-sets/) to perform the actions described on this page - You have [installed `curl`](https://curl.se/download.html) </Message> (switchcolumn)  ## Technical information  ### Availability Zones  Instances can be deployed in the following Availability Zones:  | Name      | API ID                | |-----------|-----------------------| | Paris     | `fr-par-1` `fr-par-2` `fr-par-3` | | Amsterdam | `nl-ams-1` `nl-ams-2` `nl-ams-3` | | Warsaw    | `pl-waw-1` `pl-waw-2` `pl-waw-3` |  (switchcolumn) (switchcolumn)  ### Pagination  Most listing requests receive a paginated response. Requests against paginated endpoints accept two `query` arguments:  - `page`, a positive integer to choose which page to return. - `per_page`, an positive integer lower or equal to 100 to select the number of items to return per page. The default value is `50`.  Paginated endpoints usually also accept filters to search and sort results.These filters are documented along each endpoint documentation.  The `X-Total-Count` header contains the total number of items returned.  (switchcolumn) (switchcolumn)  ### Creating an Instance: the volumes object  When [creating an Instance](#path-instances-create-an-instance) using the Scaleway API, the `volumes` object is **not strictly required**. However, the defaults vary depending on certain conditions:  1. If an image label is used:    - The default will be an `sbs_volume` volume.    - The size of this volume will be the OS size (typically 10GB in most cases).  2. If an image ID from the marketplace is used:    - If the Instance supports local storage:      - The default will be an `l_ssd` volume.      - The size of this volume will be the instance\'s maximum local storage capacity.    - Else, the volume created will depend on the marketplace\'s local_image type:      - SBS volume for instance_sbs type.      - l_ssd volume for instance_local type.  If you want to customize the storage configuration or add additional volumes, you will need to include the volumes object in your API request. This object should contain at least one (dictionary) object with a minimum of one key (`\"0\"`) whose value is another object containing the parameters `\"name\"` (a name for the volume), `\"size\"` (the size for the volume, in bytes), and `\"volume_type\"` (`\"sbs_volume\"` or `\"l_ssd\"`). Additional keys for additional volumes should increment by 1 each time (the second volume would have a key of `\"1\"`.)  Note that volume `size` must respect the volume constraints of the Instance\'s `commercial_type`: for each type of Instance, a minimum amount of storage is required, and there is also a maximum that cannot be exceeded. All Instance types support Block Storage (`sbs_volume`), some also support local storage (`l_ssd`). Read more about these constraints in the [List Instance types](#path-instance-types-list-instance-types) documentation, specifically the `volume_constraints` parameter for each type listed in the response  You can use the `volumes` object in different ways. The table below shows which parameters are required for each of the following use cases:  | Use case                | Required params       | Optional params     | Notes                                  | |-------------------------|-----------------------|---------------------|----------------------------------------| | Create a volume (`l_ssd`, `sbs_volume`) from a snapshot of an image  |  | `volume_type`, `size`, `boot` | If the `size` parameter is not set, the size of the volume will equal the size of the corresponding snapshot of the image. The image snapshot type should be compatible with the `volume_type`. | | Create a volume (`l_ssd`) from a snapshot     | `base_snapshot`, `name`, `volume_type` | `boot` |  | | Create a volume of type `sbs_volume` from a snapshot     | `base_snapshot`, `name`, `volume_type` | `size`, `boot` |  | | Create an empty volume      | `name`, `volume_type`, `size` | `boot` |  | | Attach an existing volume (`l_ssd`)  | `id` | `boot` |  | | Attach an existing volume of type `sbs_volume`   | `id`, `volume_type` | `boot` |  |  (switchcolumn) <Message type=\"note\"> This information is designed to help you correctly configure the `volumes` object when using the [Create an Instance](#path-instances-create-an-instance) or [Update an Instance](#path-instances-update-an-instance) methods. </Message> (switchcolumn)  ## Going further  For more help using Scaleway Instances, check out the following resources: - Our [main documentation](https://www.scaleway.com/en/docs/instances/) - The #instance channel on our [Slack Community](https://www.scaleway.com/en/docs/tutorials/scaleway-slack-community/) - Our [support ticketing system](https://www.scaleway.com/en/docs/account/how-to/open-a-support-ticket/).
 *
 * The version of the OpenAPI document: v1
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
 * @interface ApplyBlockMigrationRequest
 */
export interface ApplyBlockMigrationRequest {
  /**
   * The volume to migrate, along with potentially other resources, according to the migration plan generated with a call to the [Get a volume or snapshot\'s migration plan](#path-volumes-get-a-volume-or-snapshots-migration-plan) endpoint.
   * @type {string}
   * @memberof ApplyBlockMigrationRequest
   */
  volume_id?: string;
  /**
   * The snapshot to migrate, along with potentially other resources, according to the migration plan generated with a call to the [Get a volume or snapshot\'s migration plan](#path-volumes-get-a-volume-or-snapshots-migration-plan) endpoint.
   * @type {string}
   * @memberof ApplyBlockMigrationRequest
   */
  snapshot_id?: string;
  /**
   * A value to be retrieved from a call to the [Get a volume or snapshot\'s migration plan](#path-volumes-get-a-volume-or-snapshots-migration-plan) endpoint, to confirm that the volume and/or snapshots specified in said plan should be migrated.
   * @type {string}
   * @memberof ApplyBlockMigrationRequest
   */
  validation_key: string;
}
/**
 *
 * @export
 * @interface AttachServerFileSystemRequest
 */
export interface AttachServerFileSystemRequest {
  /**
   *
   * @type {string}
   * @memberof AttachServerFileSystemRequest
   */
  filesystem_id?: string;
}
/**
 *
 * @export
 * @interface AttachServerVolumeRequest
 */
export interface AttachServerVolumeRequest {
  /**
   *
   * @type {string}
   * @memberof AttachServerVolumeRequest
   */
  volume_id?: string;
  /**
   *
   * @type {ScalewayInstanceV1AttachServerVolumeRequestVolumeType}
   * @memberof AttachServerVolumeRequest
   */
  volume_type?: ScalewayInstanceV1AttachServerVolumeRequestVolumeType;
  /**
   *
   * @type {boolean}
   * @memberof AttachServerVolumeRequest
   */
  boot?: boolean;
}

/**
 *
 * @export
 * @interface CheckBlockMigrationOrganizationQuotasRequest
 */
export interface CheckBlockMigrationOrganizationQuotasRequest {
  /**
   *
   * @type {string}
   * @memberof CheckBlockMigrationOrganizationQuotasRequest
   */
  organization?: string;
}
/**
 *
 * @export
 * @interface CreateImageRequest
 */
export interface CreateImageRequest {
  /**
   * Name of the image.
   * @type {string}
   * @memberof CreateImageRequest
   */
  name?: string;
  /**
   * UUID of the snapshot.
   * @type {string}
   * @memberof CreateImageRequest
   */
  root_volume: string;
  /**
   * Architecture of the image.
   * @type {string}
   * @memberof CreateImageRequest
   */
  arch: CreateImageRequestArchEnum;
  /**
   *
   * @type {CreateImageRequestExtraVolumes}
   * @memberof CreateImageRequest
   */
  extra_volumes?: CreateImageRequestExtraVolumes;
  /**
   * Organization ID of the image.
   * @type {string}
   * @memberof CreateImageRequest
   * @deprecated
   */
  organization?: string;
  /**
   * Project ID of the image.
   * @type {string}
   * @memberof CreateImageRequest
   */
  project?: string;
  /**
   * Tags of the image.
   * @type {Array<string>}
   * @memberof CreateImageRequest
   */
  tags?: Array<string>;
  /**
   * True to create a public image.
   * @type {boolean}
   * @memberof CreateImageRequest
   */
  public?: boolean;
}

export const CreateImageRequestArchEnum = {
  UnknownArch: 'unknown_arch',
  X8664: 'x86_64',
  Arm: 'arm',
  Arm64: 'arm64',
} as const;

export type CreateImageRequestArchEnum =
  (typeof CreateImageRequestArchEnum)[keyof typeof CreateImageRequestArchEnum];

/**
 * Additional volumes of the image.
 * @export
 * @interface CreateImageRequestExtraVolumes
 */
export interface CreateImageRequestExtraVolumes {
  [key: string]: any;

  /**
   *
   * @type {CreateImageRequestExtraVolumesExtraVolumeKey}
   * @memberof CreateImageRequestExtraVolumes
   */
  '&lt;extra_volumeKey&gt;'?: CreateImageRequestExtraVolumesExtraVolumeKey;
}
/**
 * Additional volumes of the image.
 * @export
 * @interface CreateImageRequestExtraVolumesExtraVolumeKey
 */
export interface CreateImageRequestExtraVolumesExtraVolumeKey {
  /**
   * UUID of the volume.
   * @type {string}
   * @memberof CreateImageRequestExtraVolumesExtraVolumeKey
   */
  id?: string;
  /**
   * Name of the volume.
   * @type {string}
   * @memberof CreateImageRequestExtraVolumesExtraVolumeKey
   */
  name?: string;
  /**
   * Disk size of the volume, must be a multiple of 512. (in bytes)
   * @type {number}
   * @memberof CreateImageRequestExtraVolumesExtraVolumeKey
   */
  size?: number;
  /**
   * Type of the volume.
   * @type {string}
   * @memberof CreateImageRequestExtraVolumesExtraVolumeKey
   */
  volume_type?: CreateImageRequestExtraVolumesExtraVolumeKeyVolumeTypeEnum;
  /**
   * Organization ID of the volume.
   * @type {string}
   * @memberof CreateImageRequestExtraVolumesExtraVolumeKey
   * @deprecated
   */
  organization?: string;
  /**
   * Project ID of the volume.
   * @type {string}
   * @memberof CreateImageRequestExtraVolumesExtraVolumeKey
   */
  project?: string;
}

export const CreateImageRequestExtraVolumesExtraVolumeKeyVolumeTypeEnum = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;

export type CreateImageRequestExtraVolumesExtraVolumeKeyVolumeTypeEnum =
  (typeof CreateImageRequestExtraVolumesExtraVolumeKeyVolumeTypeEnum)[keyof typeof CreateImageRequestExtraVolumesExtraVolumeKeyVolumeTypeEnum];

/**
 *
 * @export
 * @interface CreateIpRequest
 */
export interface CreateIpRequest {
  /**
   * Organization ID in which the IP is reserved.
   * @type {string}
   * @memberof CreateIpRequest
   * @deprecated
   */
  organization?: string;
  /**
   * Project ID in which the IP is reserved.
   * @type {string}
   * @memberof CreateIpRequest
   */
  project?: string;
  /**
   * Tags of the IP.
   * @type {Array<string>}
   * @memberof CreateIpRequest
   */
  tags?: Array<string>;
  /**
   * UUID of the Instance you want to attach the IP to.
   * @type {string}
   * @memberof CreateIpRequest
   */
  server?: string;
  /**
   * IP type to reserve (either \'routed_ipv4\' or \'routed_ipv6\').
   * @type {string}
   * @memberof CreateIpRequest
   */
  type?: CreateIpRequestTypeEnum;
}

export const CreateIpRequestTypeEnum = {
  UnknownIptype: 'unknown_iptype',
  RoutedIpv4: 'routed_ipv4',
  RoutedIpv6: 'routed_ipv6',
} as const;

export type CreateIpRequestTypeEnum =
  (typeof CreateIpRequestTypeEnum)[keyof typeof CreateIpRequestTypeEnum];

/**
 *
 * @export
 * @interface CreatePlacementGroupRequest
 */
export interface CreatePlacementGroupRequest {
  /**
   * Name of the placement group.
   * @type {string}
   * @memberof CreatePlacementGroupRequest
   */
  name?: string;
  /**
   * Organization ID of the placement group.
   * @type {string}
   * @memberof CreatePlacementGroupRequest
   * @deprecated
   */
  organization?: string;
  /**
   * Project ID of the placement group.
   * @type {string}
   * @memberof CreatePlacementGroupRequest
   */
  project?: string;
  /**
   * Tags of the placement group.
   * @type {Array<string>}
   * @memberof CreatePlacementGroupRequest
   */
  tags?: Array<string>;
  /**
   * Operating mode of the placement group.
   * @type {string}
   * @memberof CreatePlacementGroupRequest
   */
  policy_mode?: CreatePlacementGroupRequestPolicyModeEnum;
  /**
   * Policy type of the placement group.
   * @type {string}
   * @memberof CreatePlacementGroupRequest
   */
  policy_type?: CreatePlacementGroupRequestPolicyTypeEnum;
}

export const CreatePlacementGroupRequestPolicyModeEnum = {
  Optional: 'optional',
  Enforced: 'enforced',
} as const;

export type CreatePlacementGroupRequestPolicyModeEnum =
  (typeof CreatePlacementGroupRequestPolicyModeEnum)[keyof typeof CreatePlacementGroupRequestPolicyModeEnum];
export const CreatePlacementGroupRequestPolicyTypeEnum = {
  MaxAvailability: 'max_availability',
  LowLatency: 'low_latency',
} as const;

export type CreatePlacementGroupRequestPolicyTypeEnum =
  (typeof CreatePlacementGroupRequestPolicyTypeEnum)[keyof typeof CreatePlacementGroupRequestPolicyTypeEnum];

/**
 *
 * @export
 * @interface CreatePrivateNICRequest
 */
export interface CreatePrivateNICRequest {
  /**
   * UUID of the private network where the private NIC will be attached.
   * @type {string}
   * @memberof CreatePrivateNICRequest
   */
  private_network_id: string;
  /**
   * Private NIC tags.
   * @type {Array<string>}
   * @memberof CreatePrivateNICRequest
   */
  tags?: Array<string>;
  /**
   * UUID of IPAM ips, to be attached to the instance in the requested private network. (UUID format)
   * @type {Array<string>}
   * @memberof CreatePrivateNICRequest
   */
  ipam_ip_ids?: Array<string>;
}
/**
 *
 * @export
 * @interface CreateSecurityGroupRequest
 */
export interface CreateSecurityGroupRequest {
  /**
   * Name of the security group.
   * @type {string}
   * @memberof CreateSecurityGroupRequest
   */
  name: string;
  /**
   * Description of the security group.
   * @type {string}
   * @memberof CreateSecurityGroupRequest
   */
  description?: string;
  /**
   * Organization ID the security group belongs to.
   * @type {string}
   * @memberof CreateSecurityGroupRequest
   * @deprecated
   */
  organization?: string;
  /**
   * Project ID the security group belong to.
   * @type {string}
   * @memberof CreateSecurityGroupRequest
   */
  project?: string;
  /**
   * Tags of the security group.
   * @type {Array<string>}
   * @memberof CreateSecurityGroupRequest
   */
  tags?: Array<string>;
  /**
   * Defines whether this security group becomes the default security group for new Instances.
   * @type {boolean}
   * @memberof CreateSecurityGroupRequest
   * @deprecated
   */
  organization_default?: boolean;
  /**
   * Whether this security group becomes the default security group for new Instances.
   * @type {boolean}
   * @memberof CreateSecurityGroupRequest
   */
  project_default?: boolean;
  /**
   * Whether the security group is stateful or not.
   * @type {boolean}
   * @memberof CreateSecurityGroupRequest
   */
  stateful?: boolean;
  /**
   * Default policy for inbound rules.
   * @type {string}
   * @memberof CreateSecurityGroupRequest
   */
  inbound_default_policy?: CreateSecurityGroupRequestInboundDefaultPolicyEnum;
  /**
   * Default policy for outbound rules.
   * @type {string}
   * @memberof CreateSecurityGroupRequest
   */
  outbound_default_policy?: CreateSecurityGroupRequestOutboundDefaultPolicyEnum;
  /**
   * True to block SMTP on IPv4 and IPv6. This feature is read only, please open a support ticket if you need to make it configurable.
   * @type {boolean}
   * @memberof CreateSecurityGroupRequest
   */
  enable_default_security?: boolean;
}

export const CreateSecurityGroupRequestInboundDefaultPolicyEnum = {
  UnknownPolicy: 'unknown_policy',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type CreateSecurityGroupRequestInboundDefaultPolicyEnum =
  (typeof CreateSecurityGroupRequestInboundDefaultPolicyEnum)[keyof typeof CreateSecurityGroupRequestInboundDefaultPolicyEnum];
export const CreateSecurityGroupRequestOutboundDefaultPolicyEnum = {
  UnknownPolicy: 'unknown_policy',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type CreateSecurityGroupRequestOutboundDefaultPolicyEnum =
  (typeof CreateSecurityGroupRequestOutboundDefaultPolicyEnum)[keyof typeof CreateSecurityGroupRequestOutboundDefaultPolicyEnum];

/**
 *
 * @export
 * @interface CreateSecurityGroupRuleRequest
 */
export interface CreateSecurityGroupRuleRequest {
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRuleProtocol}
   * @memberof CreateSecurityGroupRuleRequest
   */
  protocol: ScalewayInstanceV1SecurityGroupRuleProtocol;
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRuleDirection}
   * @memberof CreateSecurityGroupRuleRequest
   */
  direction: ScalewayInstanceV1SecurityGroupRuleDirection;
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRuleAction}
   * @memberof CreateSecurityGroupRuleRequest
   */
  action: ScalewayInstanceV1SecurityGroupRuleAction;
  /**
   * (IP network)
   * @type {string}
   * @memberof CreateSecurityGroupRuleRequest
   */
  ip_range: string;
  /**
   * Beginning of the range of ports to apply this rule to (inclusive).
   * @type {number}
   * @memberof CreateSecurityGroupRuleRequest
   */
  dest_port_from?: number;
  /**
   * End of the range of ports to apply this rule to (inclusive).
   * @type {number}
   * @memberof CreateSecurityGroupRuleRequest
   */
  dest_port_to?: number;
  /**
   * Position of this rule in the security group rules list.
   * @type {number}
   * @memberof CreateSecurityGroupRuleRequest
   */
  position?: number;
  /**
   * Indicates if this rule is editable (will be ignored).
   * @type {boolean}
   * @memberof CreateSecurityGroupRuleRequest
   */
  editable?: boolean;
}

/**
 *
 * @export
 * @interface CreateServerRequest
 */
export interface CreateServerRequest {
  /**
   * Instance name.
   * @type {string}
   * @memberof CreateServerRequest
   */
  name: string;
  /**
   * Define if a dynamic IPv4 is required for the Instance. By default, `dynamic_ip_required` is true, a dynamic ip is attached to the instance (if no flexible ip is already attached).
   * @type {boolean}
   * @memberof CreateServerRequest
   */
  dynamic_ip_required?: boolean;
  /**
   * If true, configure the Instance so it uses the new routed IP mode.
   * @type {boolean}
   * @memberof CreateServerRequest
   * @deprecated
   */
  routed_ip_enabled?: boolean;
  /**
   * Define the Instance commercial type (i.e. GP1-S).
   * @type {string}
   * @memberof CreateServerRequest
   */
  commercial_type: string;
  /**
   * Instance image ID or label. When an image label is used, it will be converted to the latest image available on the Marketplace. By default, the selected local image will be the `instance_sbs` local image. If an `l_ssd` volume is specified in the volumes argument, an `instance_local` local image will be selected instead.
   * @type {string}
   * @memberof CreateServerRequest
   */
  image?: string;
  /**
   *
   * @type {CreateServerRequestVolumes}
   * @memberof CreateServerRequest
   */
  volumes?: CreateServerRequestVolumes;
  /**
   * True if IPv6 is enabled on the server (deprecated and always `False` when `routed_ip_enabled` is `True`).
   * @type {boolean}
   * @memberof CreateServerRequest
   * @deprecated
   */
  enable_ipv6?: boolean;
  /**
   * ID of the reserved IP to attach to the Instance.
   * @type {string}
   * @memberof CreateServerRequest
   * @deprecated
   */
  public_ip?: string;
  /**
   * A list of reserved IP IDs to attach to the Instance.
   * @type {Array<string>}
   * @memberof CreateServerRequest
   */
  public_ips?: Array<string>;
  /**
   * Boot type to use.
   * @type {string}
   * @memberof CreateServerRequest
   */
  boot_type?: CreateServerRequestBootTypeEnum;
  /**
   * Instance Organization ID.
   * @type {string}
   * @memberof CreateServerRequest
   * @deprecated
   */
  organization?: string;
  /**
   * Instance Project ID.
   * @type {string}
   * @memberof CreateServerRequest
   */
  project?: string;
  /**
   * Instance tags.
   * @type {Array<string>}
   * @memberof CreateServerRequest
   */
  tags?: Array<string>;
  /**
   * Security group ID.
   * @type {string}
   * @memberof CreateServerRequest
   */
  security_group?: string;
  /**
   * Placement group ID if Instance must be part of a placement group.
   * @type {string}
   * @memberof CreateServerRequest
   */
  placement_group?: string;
  /**
   * UUID of the SSH RSA key that will be used to encrypt the initial admin password for OS requiring it. Mandatory for Windows OS. The public_key value of this key is used to encrypt the admin password.
   * @type {string}
   * @memberof CreateServerRequest
   */
  admin_password_encryption_ssh_key_id?: string;
  /**
   * True to activate server protection option.
   * @type {boolean}
   * @memberof CreateServerRequest
   */
  protected?: boolean;
}

export const CreateServerRequestBootTypeEnum = {
  Local: 'local',
  Bootscript: 'bootscript',
  Rescue: 'rescue',
} as const;

export type CreateServerRequestBootTypeEnum =
  (typeof CreateServerRequestBootTypeEnum)[keyof typeof CreateServerRequestBootTypeEnum];

/**
 * Volumes attached to the server.
 * @export
 * @interface CreateServerRequestVolumes
 */
export interface CreateServerRequestVolumes {
  [key: string]: any;

  /**
   *
   * @type {CreateServerRequestVolumesVolumeKey}
   * @memberof CreateServerRequestVolumes
   */
  '&lt;volumeKey&gt;'?: CreateServerRequestVolumesVolumeKey;
}
/**
 * Volumes attached to the server.
 * @export
 * @interface CreateServerRequestVolumesVolumeKey
 */
export interface CreateServerRequestVolumesVolumeKey {
  /**
   * UUID of the volume.
   * @type {string}
   * @memberof CreateServerRequestVolumesVolumeKey
   */
  id?: string;
  /**
   * Force the Instance to boot on this volume.
   * @type {boolean}
   * @memberof CreateServerRequestVolumesVolumeKey
   */
  boot?: boolean;
  /**
   * Name of the volume.
   * @type {string}
   * @memberof CreateServerRequestVolumesVolumeKey
   */
  name?: string;
  /**
   * Disk size of the volume, must be a multiple of 512. (in bytes)
   * @type {number}
   * @memberof CreateServerRequestVolumesVolumeKey
   */
  size?: number;
  /**
   * Type of the volume.
   * @type {string}
   * @memberof CreateServerRequestVolumesVolumeKey
   */
  volume_type?: CreateServerRequestVolumesVolumeKeyVolumeTypeEnum;
  /**
   * ID of the snapshot on which this volume will be based.
   * @type {string}
   * @memberof CreateServerRequestVolumesVolumeKey
   */
  base_snapshot?: string;
  /**
   * Organization ID of the volume.
   * @type {string}
   * @memberof CreateServerRequestVolumesVolumeKey
   */
  organization?: string;
  /**
   * Project ID of the volume.
   * @type {string}
   * @memberof CreateServerRequestVolumesVolumeKey
   */
  project?: string;
}

export const CreateServerRequestVolumesVolumeKeyVolumeTypeEnum = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;

export type CreateServerRequestVolumesVolumeKeyVolumeTypeEnum =
  (typeof CreateServerRequestVolumesVolumeKeyVolumeTypeEnum)[keyof typeof CreateServerRequestVolumesVolumeKeyVolumeTypeEnum];

/**
 *
 * @export
 * @interface CreateSnapshotRequest
 */
export interface CreateSnapshotRequest {
  /**
   * Name of the snapshot.
   * @type {string}
   * @memberof CreateSnapshotRequest
   */
  name?: string;
  /**
   * UUID of the volume.
   * @type {string}
   * @memberof CreateSnapshotRequest
   */
  volume_id?: string;
  /**
   * Tags of the snapshot.
   * @type {Array<string>}
   * @memberof CreateSnapshotRequest
   */
  tags?: Array<string>;
  /**
   * Organization ID of the snapshot.
   * @type {string}
   * @memberof CreateSnapshotRequest
   * @deprecated
   */
  organization?: string;
  /**
   * Project ID of the snapshot.
   * @type {string}
   * @memberof CreateSnapshotRequest
   */
  project?: string;
  /**
   * Volume type of the snapshot. Overrides the volume_type of the snapshot. If omitted, the volume type of the original volume will be used.
   * @type {string}
   * @memberof CreateSnapshotRequest
   */
  volume_type?: CreateSnapshotRequestVolumeTypeEnum;
  /**
   * Bucket name for snapshot imports.
   * @type {string}
   * @memberof CreateSnapshotRequest
   */
  bucket?: string;
  /**
   * Object key for snapshot imports.
   * @type {string}
   * @memberof CreateSnapshotRequest
   */
  key?: string;
  /**
   * Imported snapshot size, must be a multiple of 512. (in bytes)
   * @type {number}
   * @memberof CreateSnapshotRequest
   */
  size?: number;
}

export const CreateSnapshotRequestVolumeTypeEnum = {
  UnknownVolumeType: 'unknown_volume_type',
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
} as const;

export type CreateSnapshotRequestVolumeTypeEnum =
  (typeof CreateSnapshotRequestVolumeTypeEnum)[keyof typeof CreateSnapshotRequestVolumeTypeEnum];

/**
 *
 * @export
 * @interface CreateVolumeRequest
 */
export interface CreateVolumeRequest {
  /**
   * Volume name.
   * @type {string}
   * @memberof CreateVolumeRequest
   */
  name?: string;
  /**
   * Volume Organization ID.
   * @type {string}
   * @memberof CreateVolumeRequest
   * @deprecated
   */
  organization?: string;
  /**
   * Volume Project ID.
   * @type {string}
   * @memberof CreateVolumeRequest
   */
  project?: string;
  /**
   * Volume tags.
   * @type {Array<string>}
   * @memberof CreateVolumeRequest
   */
  tags?: Array<string>;
  /**
   * Volume type.
   * @type {string}
   * @memberof CreateVolumeRequest
   */
  volume_type?: CreateVolumeRequestVolumeTypeEnum;
  /**
   * Volume disk size, must be a multiple of 512. (in bytes)
   * @type {number}
   * @memberof CreateVolumeRequest
   */
  size?: number;
  /**
   * ID of the snapshot on which this volume will be based.
   * @type {string}
   * @memberof CreateVolumeRequest
   */
  base_snapshot?: string;
}

export const CreateVolumeRequestVolumeTypeEnum = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;

export type CreateVolumeRequestVolumeTypeEnum =
  (typeof CreateVolumeRequestVolumeTypeEnum)[keyof typeof CreateVolumeRequestVolumeTypeEnum];

/**
 *
 * @export
 * @interface DetachServerVolumeRequest
 */
export interface DetachServerVolumeRequest {
  /**
   *
   * @type {string}
   * @memberof DetachServerVolumeRequest
   */
  volume_id?: string;
}
/**
 *
 * @export
 * @interface ExportSnapshotRequest
 */
export interface ExportSnapshotRequest {
  /**
   * Object Storage bucket name.
   * @type {string}
   * @memberof ExportSnapshotRequest
   */
  bucket?: string;
  /**
   * Object key.
   * @type {string}
   * @memberof ExportSnapshotRequest
   */
  key?: string;
}
/**
 *
 * @export
 * @interface PlanBlockMigrationRequest
 */
export interface PlanBlockMigrationRequest {
  /**
   * The volume for which the migration plan will be generated.
   * @type {string}
   * @memberof PlanBlockMigrationRequest
   */
  volume_id?: string;
  /**
   * The snapshot for which the migration plan will be generated.
   * @type {string}
   * @memberof PlanBlockMigrationRequest
   */
  snapshot_id?: string;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1Arch = {
  UnknownArch: 'unknown_arch',
  X8664: 'x86_64',
  Arm: 'arm',
  Arm64: 'arm64',
} as const;

export type ScalewayInstanceV1Arch =
  (typeof ScalewayInstanceV1Arch)[keyof typeof ScalewayInstanceV1Arch];

/**
 *
 * @export
 * @interface ScalewayInstanceV1AttachServerFileSystemResponse
 */
export interface ScalewayInstanceV1AttachServerFileSystemResponse {
  /**
   *
   * @type {ScalewayInstanceV1Server}
   * @memberof ScalewayInstanceV1AttachServerFileSystemResponse
   */
  server?: ScalewayInstanceV1Server;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1AttachServerVolumeRequestVolumeType = {
  UnknownVolumeType: 'unknown_volume_type',
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  SbsVolume: 'sbs_volume',
} as const;

export type ScalewayInstanceV1AttachServerVolumeRequestVolumeType =
  (typeof ScalewayInstanceV1AttachServerVolumeRequestVolumeType)[keyof typeof ScalewayInstanceV1AttachServerVolumeRequestVolumeType];

/**
 *
 * @export
 * @interface ScalewayInstanceV1AttachServerVolumeResponse
 */
export interface ScalewayInstanceV1AttachServerVolumeResponse {
  /**
   *
   * @type {ScalewayInstanceV1Server}
   * @memberof ScalewayInstanceV1AttachServerVolumeResponse
   */
  server?: ScalewayInstanceV1Server;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1BootType = {
  Local: 'local',
  Bootscript: 'bootscript',
  Rescue: 'rescue',
} as const;

export type ScalewayInstanceV1BootType =
  (typeof ScalewayInstanceV1BootType)[keyof typeof ScalewayInstanceV1BootType];

/**
 *
 * @export
 * @interface ScalewayInstanceV1Bootscript
 */
export interface ScalewayInstanceV1Bootscript {
  /**
   *
   * @type {ScalewayInstanceV1Arch}
   * @memberof ScalewayInstanceV1Bootscript
   */
  architecture?: ScalewayInstanceV1Arch;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Bootscript
   */
  bootcmdargs?: string;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayInstanceV1Bootscript
   */
  default?: boolean;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Bootscript
   */
  dtb?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Bootscript
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Bootscript
   */
  initrd?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Bootscript
   */
  kernel?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Bootscript
   */
  organization?: string;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayInstanceV1Bootscript
   */
  public?: boolean;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Bootscript
   */
  title?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Bootscript
   */
  project?: string;
  /**
   * The zone you want to target
   * @type {string}
   * @memberof ScalewayInstanceV1Bootscript
   */
  zone?: string;
}

/**
 *
 * @export
 * @interface ScalewayInstanceV1CreateImageResponse
 */
export interface ScalewayInstanceV1CreateImageResponse {
  /**
   *
   * @type {ScalewayInstanceV1Image}
   * @memberof ScalewayInstanceV1CreateImageResponse
   */
  image?: ScalewayInstanceV1Image;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1CreateIpResponse
 */
export interface ScalewayInstanceV1CreateIpResponse {
  /**
   *
   * @type {ScalewayInstanceV1Ip}
   * @memberof ScalewayInstanceV1CreateIpResponse
   */
  ip?: ScalewayInstanceV1Ip;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1CreatePlacementGroupResponse
 */
export interface ScalewayInstanceV1CreatePlacementGroupResponse {
  /**
   *
   * @type {ScalewayInstanceV1PlacementGroup}
   * @memberof ScalewayInstanceV1CreatePlacementGroupResponse
   */
  placement_group?: ScalewayInstanceV1PlacementGroup;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1CreatePrivateNICResponse
 */
export interface ScalewayInstanceV1CreatePrivateNICResponse {
  /**
   *
   * @type {ScalewayInstanceV1PrivateNIC}
   * @memberof ScalewayInstanceV1CreatePrivateNICResponse
   */
  private_nic?: ScalewayInstanceV1PrivateNIC;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1CreateSecurityGroupResponse
 */
export interface ScalewayInstanceV1CreateSecurityGroupResponse {
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroup}
   * @memberof ScalewayInstanceV1CreateSecurityGroupResponse
   */
  security_group?: ScalewayInstanceV1SecurityGroup;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1CreateSecurityGroupRuleResponse
 */
export interface ScalewayInstanceV1CreateSecurityGroupRuleResponse {
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRule}
   * @memberof ScalewayInstanceV1CreateSecurityGroupRuleResponse
   */
  rule?: ScalewayInstanceV1SecurityGroupRule;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1CreateServerResponse
 */
export interface ScalewayInstanceV1CreateServerResponse {
  /**
   *
   * @type {ScalewayInstanceV1Server}
   * @memberof ScalewayInstanceV1CreateServerResponse
   */
  server?: ScalewayInstanceV1Server;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1CreateSnapshotResponse
 */
export interface ScalewayInstanceV1CreateSnapshotResponse {
  /**
   *
   * @type {ScalewayInstanceV1Snapshot}
   * @memberof ScalewayInstanceV1CreateSnapshotResponse
   */
  snapshot?: ScalewayInstanceV1Snapshot;
  /**
   *
   * @type {ScalewayInstanceV1Task}
   * @memberof ScalewayInstanceV1CreateSnapshotResponse
   */
  task?: ScalewayInstanceV1Task;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1CreateVolumeResponse
 */
export interface ScalewayInstanceV1CreateVolumeResponse {
  /**
   *
   * @type {ScalewayInstanceV1Volume}
   * @memberof ScalewayInstanceV1CreateVolumeResponse
   */
  volume?: ScalewayInstanceV1Volume;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1Dashboard
 */
export interface ScalewayInstanceV1Dashboard {
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  volumes_count?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  running_servers_count?: number;
  /**
   *
   * @type {ScalewayInstanceV1DashboardServersByTypes}
   * @memberof ScalewayInstanceV1Dashboard
   */
  servers_by_types?: ScalewayInstanceV1DashboardServersByTypes;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  images_count?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  snapshots_count?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  servers_count?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  ips_count?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  security_groups_count?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  ips_unused?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  volumes_l_ssd_count?: number;
  /**
   * (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  volumes_l_ssd_total_size?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  private_nics_count?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  placement_groups_count?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   */
  volumes_scratch_count?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   * @deprecated
   */
  volumes_b_ssd_count?: number;
  /**
   * (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1Dashboard
   * @deprecated
   */
  volumes_b_ssd_total_size?: number;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1DashboardServersByTypes
 */
export interface ScalewayInstanceV1DashboardServersByTypes {
  [key: string]: any;

  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1DashboardServersByTypes
   */
  '&lt;servers_by_typeKey&gt;'?: number;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1DetachServerFileSystemResponse
 */
export interface ScalewayInstanceV1DetachServerFileSystemResponse {
  /**
   *
   * @type {ScalewayInstanceV1Server}
   * @memberof ScalewayInstanceV1DetachServerFileSystemResponse
   */
  server?: ScalewayInstanceV1Server;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1DetachServerVolumeResponse
 */
export interface ScalewayInstanceV1DetachServerVolumeResponse {
  /**
   *
   * @type {ScalewayInstanceV1Server}
   * @memberof ScalewayInstanceV1DetachServerVolumeResponse
   */
  server?: ScalewayInstanceV1Server;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ExportSnapshotResponse
 */
export interface ScalewayInstanceV1ExportSnapshotResponse {
  /**
   *
   * @type {ScalewayInstanceV1Task}
   * @memberof ScalewayInstanceV1ExportSnapshotResponse
   */
  task?: ScalewayInstanceV1Task;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetDashboardResponse
 */
export interface ScalewayInstanceV1GetDashboardResponse {
  /**
   *
   * @type {ScalewayInstanceV1Dashboard}
   * @memberof ScalewayInstanceV1GetDashboardResponse
   */
  dashboard?: ScalewayInstanceV1Dashboard;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetImageResponse
 */
export interface ScalewayInstanceV1GetImageResponse {
  /**
   *
   * @type {ScalewayInstanceV1Image}
   * @memberof ScalewayInstanceV1GetImageResponse
   */
  image?: ScalewayInstanceV1Image;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetIpResponse
 */
export interface ScalewayInstanceV1GetIpResponse {
  /**
   *
   * @type {ScalewayInstanceV1Ip}
   * @memberof ScalewayInstanceV1GetIpResponse
   */
  ip?: ScalewayInstanceV1Ip;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetPlacementGroupResponse
 */
export interface ScalewayInstanceV1GetPlacementGroupResponse {
  /**
   *
   * @type {ScalewayInstanceV1PlacementGroup}
   * @memberof ScalewayInstanceV1GetPlacementGroupResponse
   */
  placement_group?: ScalewayInstanceV1PlacementGroup;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetPlacementGroupServersResponse
 */
export interface ScalewayInstanceV1GetPlacementGroupServersResponse {
  /**
   * Instances attached to the placement group.
   * @type {Array<ScalewayInstanceV1PlacementGroupServer>}
   * @memberof ScalewayInstanceV1GetPlacementGroupServersResponse
   */
  servers?: Array<ScalewayInstanceV1PlacementGroupServer>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetPrivateNICResponse
 */
export interface ScalewayInstanceV1GetPrivateNICResponse {
  /**
   *
   * @type {ScalewayInstanceV1PrivateNIC}
   * @memberof ScalewayInstanceV1GetPrivateNICResponse
   */
  private_nic?: ScalewayInstanceV1PrivateNIC;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetSecurityGroupResponse
 */
export interface ScalewayInstanceV1GetSecurityGroupResponse {
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroup}
   * @memberof ScalewayInstanceV1GetSecurityGroupResponse
   */
  security_group?: ScalewayInstanceV1SecurityGroup;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetSecurityGroupRuleResponse
 */
export interface ScalewayInstanceV1GetSecurityGroupRuleResponse {
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRule}
   * @memberof ScalewayInstanceV1GetSecurityGroupRuleResponse
   */
  rule?: ScalewayInstanceV1SecurityGroupRule;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetServerResponse
 */
export interface ScalewayInstanceV1GetServerResponse {
  /**
   *
   * @type {ScalewayInstanceV1Server}
   * @memberof ScalewayInstanceV1GetServerResponse
   */
  server?: ScalewayInstanceV1Server;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetServerTypesAvailabilityResponse
 */
export interface ScalewayInstanceV1GetServerTypesAvailabilityResponse {
  /**
   *
   * @type {ScalewayInstanceV1GetServerTypesAvailabilityResponseServers}
   * @memberof ScalewayInstanceV1GetServerTypesAvailabilityResponse
   */
  servers?: ScalewayInstanceV1GetServerTypesAvailabilityResponseServers;
}
/**
 * Map of server types.
 * @export
 * @interface ScalewayInstanceV1GetServerTypesAvailabilityResponseServers
 */
export interface ScalewayInstanceV1GetServerTypesAvailabilityResponseServers {
  [key: string]: any;

  /**
   *
   * @type {ScalewayInstanceV1GetServerTypesAvailabilityResponseServersServerKey}
   * @memberof ScalewayInstanceV1GetServerTypesAvailabilityResponseServers
   */
  '&lt;serverKey&gt;'?: ScalewayInstanceV1GetServerTypesAvailabilityResponseServersServerKey;
}
/**
 * Map of server types.
 * @export
 * @interface ScalewayInstanceV1GetServerTypesAvailabilityResponseServersServerKey
 */
export interface ScalewayInstanceV1GetServerTypesAvailabilityResponseServersServerKey {
  /**
   *
   * @type {ScalewayInstanceV1ServerTypesAvailability}
   * @memberof ScalewayInstanceV1GetServerTypesAvailabilityResponseServersServerKey
   */
  availability?: ScalewayInstanceV1ServerTypesAvailability;
}

/**
 *
 * @export
 * @interface ScalewayInstanceV1GetSnapshotResponse
 */
export interface ScalewayInstanceV1GetSnapshotResponse {
  /**
   *
   * @type {ScalewayInstanceV1Snapshot}
   * @memberof ScalewayInstanceV1GetSnapshotResponse
   */
  snapshot?: ScalewayInstanceV1Snapshot;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1GetVolumeResponse
 */
export interface ScalewayInstanceV1GetVolumeResponse {
  /**
   *
   * @type {ScalewayInstanceV1Volume}
   * @memberof ScalewayInstanceV1GetVolumeResponse
   */
  volume?: ScalewayInstanceV1Volume;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1Image
 */
export interface ScalewayInstanceV1Image {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Image
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Image
   */
  name?: string;
  /**
   *
   * @type {ScalewayInstanceV1Arch}
   * @memberof ScalewayInstanceV1Image
   */
  arch?: ScalewayInstanceV1Arch;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Image
   */
  creation_date?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Image
   */
  modification_date?: string;
  /**
   *
   * @type {ScalewayInstanceV1Bootscript}
   * @memberof ScalewayInstanceV1Image
   * @deprecated
   */
  default_bootscript?: ScalewayInstanceV1Bootscript;
  /**
   *
   * @type {ScalewayInstanceV1ImageExtraVolumes}
   * @memberof ScalewayInstanceV1Image
   */
  extra_volumes?: ScalewayInstanceV1ImageExtraVolumes;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Image
   */
  from_server?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Image
   */
  organization?: string;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayInstanceV1Image
   */
  public?: boolean;
  /**
   *
   * @type {ScalewayInstanceV1VolumeSummary}
   * @memberof ScalewayInstanceV1Image
   */
  root_volume?: ScalewayInstanceV1VolumeSummary;
  /**
   *
   * @type {ScalewayInstanceV1ImageState}
   * @memberof ScalewayInstanceV1Image
   */
  state?: ScalewayInstanceV1ImageState;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Image
   */
  project?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1Image
   */
  tags?: Array<string>;
  /**
   * The zone you want to target
   * @type {string}
   * @memberof ScalewayInstanceV1Image
   */
  zone?: string;
}

/**
 *
 * @export
 * @interface ScalewayInstanceV1ImageExtraVolumes
 */
export interface ScalewayInstanceV1ImageExtraVolumes {
  [key: string]: any;

  /**
   *
   * @type {ScalewayInstanceV1Volume}
   * @memberof ScalewayInstanceV1ImageExtraVolumes
   */
  '&lt;extra_volumeKey&gt;'?: ScalewayInstanceV1Volume;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1ImageState = {
  Available: 'available',
  Creating: 'creating',
  Error: 'error',
} as const;

export type ScalewayInstanceV1ImageState =
  (typeof ScalewayInstanceV1ImageState)[keyof typeof ScalewayInstanceV1ImageState];

/**
 *
 * @export
 * @interface ScalewayInstanceV1Ip
 */
export interface ScalewayInstanceV1Ip {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Ip
   */
  id?: string;
  /**
   * (IP address)
   * @type {string}
   * @memberof ScalewayInstanceV1Ip
   */
  address?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Ip
   */
  reverse?: string;
  /**
   *
   * @type {ScalewayInstanceV1ServerSummary}
   * @memberof ScalewayInstanceV1Ip
   */
  server?: ScalewayInstanceV1ServerSummary;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Ip
   */
  organization?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1Ip
   */
  tags?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Ip
   */
  project?: string;
  /**
   *
   * @type {ScalewayInstanceV1IpType}
   * @memberof ScalewayInstanceV1Ip
   */
  type?: ScalewayInstanceV1IpType;
  /**
   *
   * @type {ScalewayInstanceV1IpState}
   * @memberof ScalewayInstanceV1Ip
   */
  state?: ScalewayInstanceV1IpState;
  /**
   * (IP network)
   * @type {string}
   * @memberof ScalewayInstanceV1Ip
   */
  prefix?: string;
  /**
   * (UUID format)
   * @type {string}
   * @memberof ScalewayInstanceV1Ip
   */
  ipam_id?: string;
  /**
   * The zone you want to target
   * @type {string}
   * @memberof ScalewayInstanceV1Ip
   */
  zone?: string;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1IpState = {
  UnknownState: 'unknown_state',
  Detached: 'detached',
  Attached: 'attached',
  Pending: 'pending',
  Error: 'error',
} as const;

export type ScalewayInstanceV1IpState =
  (typeof ScalewayInstanceV1IpState)[keyof typeof ScalewayInstanceV1IpState];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1IpType = {
  UnknownIptype: 'unknown_iptype',
  RoutedIpv4: 'routed_ipv4',
  RoutedIpv6: 'routed_ipv6',
} as const;

export type ScalewayInstanceV1IpType =
  (typeof ScalewayInstanceV1IpType)[keyof typeof ScalewayInstanceV1IpType];

/**
 *
 * @export
 * @interface ScalewayInstanceV1ListImagesResponse
 */
export interface ScalewayInstanceV1ListImagesResponse {
  /**
   * List of images.
   * @type {Array<ScalewayInstanceV1Image>}
   * @memberof ScalewayInstanceV1ListImagesResponse
   */
  images?: Array<ScalewayInstanceV1Image>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListIpsResponse
 */
export interface ScalewayInstanceV1ListIpsResponse {
  /**
   * List of ips.
   * @type {Array<ScalewayInstanceV1Ip>}
   * @memberof ScalewayInstanceV1ListIpsResponse
   */
  ips?: Array<ScalewayInstanceV1Ip>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListPlacementGroupsResponse
 */
export interface ScalewayInstanceV1ListPlacementGroupsResponse {
  /**
   * List of placement groups.
   * @type {Array<ScalewayInstanceV1PlacementGroup>}
   * @memberof ScalewayInstanceV1ListPlacementGroupsResponse
   */
  placement_groups?: Array<ScalewayInstanceV1PlacementGroup>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListPrivateNICsResponse
 */
export interface ScalewayInstanceV1ListPrivateNICsResponse {
  /**
   *
   * @type {Array<ScalewayInstanceV1PrivateNIC>}
   * @memberof ScalewayInstanceV1ListPrivateNICsResponse
   */
  private_nics?: Array<ScalewayInstanceV1PrivateNIC>;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1ListPrivateNICsResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListSecurityGroupRulesResponse
 */
export interface ScalewayInstanceV1ListSecurityGroupRulesResponse {
  /**
   * List of security rules.
   * @type {Array<ScalewayInstanceV1SecurityGroupRule>}
   * @memberof ScalewayInstanceV1ListSecurityGroupRulesResponse
   */
  rules?: Array<ScalewayInstanceV1SecurityGroupRule>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListSecurityGroupsResponse
 */
export interface ScalewayInstanceV1ListSecurityGroupsResponse {
  /**
   * List of security groups.
   * @type {Array<ScalewayInstanceV1SecurityGroup>}
   * @memberof ScalewayInstanceV1ListSecurityGroupsResponse
   */
  security_groups?: Array<ScalewayInstanceV1SecurityGroup>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListServerActionsResponse
 */
export interface ScalewayInstanceV1ListServerActionsResponse {
  /**
   *
   * @type {Array<ScalewayInstanceV1ServerAction>}
   * @memberof ScalewayInstanceV1ListServerActionsResponse
   */
  actions?: Array<ScalewayInstanceV1ServerAction>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListServerUserDataResponse
 */
export interface ScalewayInstanceV1ListServerUserDataResponse {
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1ListServerUserDataResponse
   */
  user_data?: Array<string>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListServersResponse
 */
export interface ScalewayInstanceV1ListServersResponse {
  /**
   * List of Instances.
   * @type {Array<ScalewayInstanceV1Server>}
   * @memberof ScalewayInstanceV1ListServersResponse
   */
  servers?: Array<ScalewayInstanceV1Server>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListServersTypesResponse
 */
export interface ScalewayInstanceV1ListServersTypesResponse {
  /**
   *
   * @type {ScalewayInstanceV1ListServersTypesResponseServers}
   * @memberof ScalewayInstanceV1ListServersTypesResponse
   */
  servers?: ScalewayInstanceV1ListServersTypesResponseServers;
}
/**
 * List of Instance types.
 * @export
 * @interface ScalewayInstanceV1ListServersTypesResponseServers
 */
export interface ScalewayInstanceV1ListServersTypesResponseServers {
  [key: string]: any;

  /**
   *
   * @type {ScalewayInstanceV1ListServersTypesResponseServersServerKey}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServers
   */
  '&lt;serverKey&gt;'?: ScalewayInstanceV1ListServersTypesResponseServersServerKey;
}
/**
 * List of Instance types.
 * @export
 * @interface ScalewayInstanceV1ListServersTypesResponseServersServerKey
 */
export interface ScalewayInstanceV1ListServersTypesResponseServersServerKey {
  /**
   * Estimated monthly price, for a 30 days month, in Euro.
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   * @deprecated
   */
  monthly_price?: number;
  /**
   * Hourly price in Euro.
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  hourly_price?: number;
  /**
   * Alternative Instance name, if any.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  alt_names?: Array<string>;
  /**
   *
   * @type {ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraint}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  per_volume_constraint?: ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraint;
  /**
   *
   * @type {ScalewayInstanceV1ListServersTypesResponseServersServerKeyVolumesConstraint}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  volumes_constraint?: ScalewayInstanceV1ListServersTypesResponseServersServerKeyVolumesConstraint;
  /**
   * Number of CPU.
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  ncpus?: number;
  /**
   * Number of GPU.
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  gpu?: number;
  /**
   * Available RAM in bytes.
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  ram?: number;
  /**
   *
   * @type {ScalewayInstanceV1ListServersTypesResponseServersServerKeyGpuInfo}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  gpu_info?: ScalewayInstanceV1ListServersTypesResponseServersServerKeyGpuInfo;
  /**
   * CPU architecture.
   * @type {string}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  arch?: ScalewayInstanceV1ListServersTypesResponseServersServerKeyArchEnum;
  /**
   *
   * @type {ScalewayInstanceV1ListServersTypesResponseServersServerKeyNetwork}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  network?: ScalewayInstanceV1ListServersTypesResponseServersServerKeyNetwork;
  /**
   *
   * @type {ScalewayInstanceV1ListServersTypesResponseServersServerKeyCapabilities}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  capabilities?: ScalewayInstanceV1ListServersTypesResponseServersServerKeyCapabilities;
  /**
   * Maximum available scratch storage. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  scratch_storage_max_size?: number;
  /**
   * Maximum supported number of scratch volumes.
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  scratch_storage_max_volumes_count?: number;
  /**
   * The maximum bandwidth allocated to block storage access (in bytes per second).
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  block_bandwidth?: number;
  /**
   * True if this Instance type has reached end of service.
   * @type {boolean}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKey
   */
  end_of_service?: boolean;
}

export const ScalewayInstanceV1ListServersTypesResponseServersServerKeyArchEnum =
  {
    UnknownArch: 'unknown_arch',
    X8664: 'x86_64',
    Arm: 'arm',
    Arm64: 'arm64',
  } as const;

export type ScalewayInstanceV1ListServersTypesResponseServersServerKeyArchEnum =
  (typeof ScalewayInstanceV1ListServersTypesResponseServersServerKeyArchEnum)[keyof typeof ScalewayInstanceV1ListServersTypesResponseServersServerKeyArchEnum];

/**
 * Capabilities.
 * @export
 * @interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyCapabilities
 */
export interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyCapabilities {
  /**
   * Defines whether the Instance supports block storage.
   * @type {boolean}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyCapabilities
   */
  block_storage?: boolean;
  /**
   * List of supported boot types.
   * @type {Array<ScalewayInstanceV1BootType>}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyCapabilities
   */
  boot_types?: Array<ScalewayInstanceV1BootType>;
  /**
   * Max number of SFS (Scaleway File Systems) that can be attached to the Instance.
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyCapabilities
   */
  max_file_systems?: number;
}
/**
 * GPU information.
 * @export
 * @interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyGpuInfo
 */
export interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyGpuInfo {
  /**
   * GPU manufacturer.
   * @type {string}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyGpuInfo
   */
  gpu_manufacturer?: string;
  /**
   * GPU model name.
   * @type {string}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyGpuInfo
   */
  gpu_name?: string;
  /**
   * RAM of a single GPU, in bytes. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyGpuInfo
   */
  gpu_memory?: number;
}
/**
 * Network available for the Instance.
 * @export
 * @interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyNetwork
 */
export interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyNetwork {
  /**
   * List of available network interfaces.
   * @type {Array<ScalewayInstanceV1ServerTypeNetworkInterface>}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyNetwork
   */
  interfaces?: Array<ScalewayInstanceV1ServerTypeNetworkInterface>;
  /**
   * Total maximum internal bandwidth in bits per seconds.
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyNetwork
   */
  sum_internal_bandwidth?: number;
  /**
   * Total maximum internet bandwidth in bits per seconds.
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyNetwork
   */
  sum_internet_bandwidth?: number;
  /**
   * True if IPv6 is enabled.
   * @type {boolean}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyNetwork
   */
  ipv6_support?: boolean;
}
/**
 * Additional volume constraints.
 * @export
 * @interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraint
 */
export interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraint {
  /**
   *
   * @type {ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraintLSsd}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraint
   */
  l_ssd?: ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraintLSsd;
}
/**
 * Local SSD volumes.
 * @export
 * @interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraintLSsd
 */
export interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraintLSsd {
  /**
   * Minimum volume size in bytes. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraintLSsd
   */
  min_size?: number;
  /**
   * Maximum volume size in bytes. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyPerVolumeConstraintLSsd
   */
  max_size?: number;
}
/**
 * Initial volume constraints.
 * @export
 * @interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyVolumesConstraint
 */
export interface ScalewayInstanceV1ListServersTypesResponseServersServerKeyVolumesConstraint {
  /**
   * Minimum volume size in bytes. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyVolumesConstraint
   */
  min_size?: number;
  /**
   * Maximum volume size in bytes. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1ListServersTypesResponseServersServerKeyVolumesConstraint
   */
  max_size?: number;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListSnapshotsResponse
 */
export interface ScalewayInstanceV1ListSnapshotsResponse {
  /**
   * List of snapshots.
   * @type {Array<ScalewayInstanceV1Snapshot>}
   * @memberof ScalewayInstanceV1ListSnapshotsResponse
   */
  snapshots?: Array<ScalewayInstanceV1Snapshot>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListVolumesResponse
 */
export interface ScalewayInstanceV1ListVolumesResponse {
  /**
   * List of volumes.
   * @type {Array<ScalewayInstanceV1Volume>}
   * @memberof ScalewayInstanceV1ListVolumesResponse
   */
  volumes?: Array<ScalewayInstanceV1Volume>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ListVolumesTypesResponse
 */
export interface ScalewayInstanceV1ListVolumesTypesResponse {
  /**
   *
   * @type {ScalewayInstanceV1ListVolumesTypesResponseVolumes}
   * @memberof ScalewayInstanceV1ListVolumesTypesResponse
   */
  volumes?: ScalewayInstanceV1ListVolumesTypesResponseVolumes;
}
/**
 * Map of volume types.
 * @export
 * @interface ScalewayInstanceV1ListVolumesTypesResponseVolumes
 */
export interface ScalewayInstanceV1ListVolumesTypesResponseVolumes {
  [key: string]: any;

  /**
   *
   * @type {ScalewayInstanceV1ListVolumesTypesResponseVolumesVolumeKey}
   * @memberof ScalewayInstanceV1ListVolumesTypesResponseVolumes
   */
  '&lt;volumeKey&gt;'?: ScalewayInstanceV1ListVolumesTypesResponseVolumesVolumeKey;
}
/**
 * Map of volume types.
 * @export
 * @interface ScalewayInstanceV1ListVolumesTypesResponseVolumesVolumeKey
 */
export interface ScalewayInstanceV1ListVolumesTypesResponseVolumesVolumeKey {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ListVolumesTypesResponseVolumesVolumeKey
   */
  display_name?: string;
  /**
   *
   * @type {ScalewayInstanceV1VolumeTypeCapabilities}
   * @memberof ScalewayInstanceV1ListVolumesTypesResponseVolumesVolumeKey
   */
  capabilities?: ScalewayInstanceV1VolumeTypeCapabilities;
  /**
   *
   * @type {ScalewayInstanceV1VolumeTypeConstraints}
   * @memberof ScalewayInstanceV1ListVolumesTypesResponseVolumesVolumeKey
   */
  constraints?: ScalewayInstanceV1VolumeTypeConstraints;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1MigrationPlan
 */
export interface ScalewayInstanceV1MigrationPlan {
  /**
   *
   * @type {ScalewayInstanceV1MigrationPlanVolume}
   * @memberof ScalewayInstanceV1MigrationPlan
   */
  volume?: ScalewayInstanceV1MigrationPlanVolume;
  /**
   * A list of snapshots which will be migrated to SBS together and with the volume, if present.
   * @type {Array<ScalewayInstanceV1Snapshot>}
   * @memberof ScalewayInstanceV1MigrationPlan
   */
  snapshots?: Array<ScalewayInstanceV1Snapshot>;
  /**
   * A value to be passed to the call to the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint, to confirm that the execution of the plan is being requested.
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlan
   */
  validation_key?: string;
}
/**
 * A volume which will be migrated to SBS together with the snapshots, if present.
 * @export
 * @interface ScalewayInstanceV1MigrationPlanVolume
 */
export interface ScalewayInstanceV1MigrationPlanVolume {
  /**
   * Volume unique ID.
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  id?: string;
  /**
   * Volume name.
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  name?: string;
  /**
   * Show the volume NBD export URI (deprecated, will always be empty).
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   * @deprecated
   */
  export_uri?: string;
  /**
   * Volume disk size. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  size?: number;
  /**
   * Volume type.
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  volume_type?: ScalewayInstanceV1MigrationPlanVolumeVolumeTypeEnum;
  /**
   * Volume creation date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  creation_date?: string;
  /**
   * Volume modification date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  modification_date?: string;
  /**
   * Volume Organization ID.
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  organization?: string;
  /**
   * Volume Project ID.
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  project?: string;
  /**
   * Volume tags.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  tags?: Array<string>;
  /**
   *
   * @type {SetVolumeRequestServer}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  server?: SetVolumeRequestServer;
  /**
   * Volume state.
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  state?: ScalewayInstanceV1MigrationPlanVolumeStateEnum;
  /**
   * Zone in which the volume is located.
   * @type {string}
   * @memberof ScalewayInstanceV1MigrationPlanVolume
   */
  zone?: string;
}

export const ScalewayInstanceV1MigrationPlanVolumeVolumeTypeEnum = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;

export type ScalewayInstanceV1MigrationPlanVolumeVolumeTypeEnum =
  (typeof ScalewayInstanceV1MigrationPlanVolumeVolumeTypeEnum)[keyof typeof ScalewayInstanceV1MigrationPlanVolumeVolumeTypeEnum];
export const ScalewayInstanceV1MigrationPlanVolumeStateEnum = {
  Available: 'available',
  Snapshotting: 'snapshotting',
  Fetching: 'fetching',
  Saving: 'saving',
  Attaching: 'attaching',
  Resizing: 'resizing',
  Hotsyncing: 'hotsyncing',
  Error: 'error',
} as const;

export type ScalewayInstanceV1MigrationPlanVolumeStateEnum =
  (typeof ScalewayInstanceV1MigrationPlanVolumeStateEnum)[keyof typeof ScalewayInstanceV1MigrationPlanVolumeStateEnum];

/**
 *
 * @export
 * @interface ScalewayInstanceV1PlacementGroup
 */
export interface ScalewayInstanceV1PlacementGroup {
  /**
   * Placement group unique ID.
   * @type {string}
   * @memberof ScalewayInstanceV1PlacementGroup
   */
  id?: string;
  /**
   * Placement group name.
   * @type {string}
   * @memberof ScalewayInstanceV1PlacementGroup
   */
  name?: string;
  /**
   * Placement group Organization ID.
   * @type {string}
   * @memberof ScalewayInstanceV1PlacementGroup
   */
  organization?: string;
  /**
   * Placement group Project ID.
   * @type {string}
   * @memberof ScalewayInstanceV1PlacementGroup
   */
  project?: string;
  /**
   * Placement group tags.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1PlacementGroup
   */
  tags?: Array<string>;
  /**
   * Select the failure mode when the placement cannot be respected, either optional or enforced.
   * @type {string}
   * @memberof ScalewayInstanceV1PlacementGroup
   */
  policy_mode?: ScalewayInstanceV1PlacementGroupPolicyModeEnum;
  /**
   * Select the behavior of the placement group, either low_latency (group) or max_availability (spread).
   * @type {string}
   * @memberof ScalewayInstanceV1PlacementGroup
   */
  policy_type?: ScalewayInstanceV1PlacementGroupPolicyTypeEnum;
  /**
   * True if the policy is respected, false otherwise. In the server endpoints the value is always false as it is deprecated. In the placement group endpoints the value is correct.
   * @type {boolean}
   * @memberof ScalewayInstanceV1PlacementGroup
   */
  policy_respected?: boolean;
  /**
   * Zone in which the placement group is located.
   * @type {string}
   * @memberof ScalewayInstanceV1PlacementGroup
   */
  zone?: string;
}

export const ScalewayInstanceV1PlacementGroupPolicyModeEnum = {
  Optional: 'optional',
  Enforced: 'enforced',
} as const;

export type ScalewayInstanceV1PlacementGroupPolicyModeEnum =
  (typeof ScalewayInstanceV1PlacementGroupPolicyModeEnum)[keyof typeof ScalewayInstanceV1PlacementGroupPolicyModeEnum];
export const ScalewayInstanceV1PlacementGroupPolicyTypeEnum = {
  MaxAvailability: 'max_availability',
  LowLatency: 'low_latency',
} as const;

export type ScalewayInstanceV1PlacementGroupPolicyTypeEnum =
  (typeof ScalewayInstanceV1PlacementGroupPolicyTypeEnum)[keyof typeof ScalewayInstanceV1PlacementGroupPolicyTypeEnum];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1PlacementGroupPolicyMode = {
  Optional: 'optional',
  Enforced: 'enforced',
} as const;

export type ScalewayInstanceV1PlacementGroupPolicyMode =
  (typeof ScalewayInstanceV1PlacementGroupPolicyMode)[keyof typeof ScalewayInstanceV1PlacementGroupPolicyMode];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1PlacementGroupPolicyType = {
  MaxAvailability: 'max_availability',
  LowLatency: 'low_latency',
} as const;

export type ScalewayInstanceV1PlacementGroupPolicyType =
  (typeof ScalewayInstanceV1PlacementGroupPolicyType)[keyof typeof ScalewayInstanceV1PlacementGroupPolicyType];

/**
 *
 * @export
 * @interface ScalewayInstanceV1PlacementGroupServer
 */
export interface ScalewayInstanceV1PlacementGroupServer {
  /**
   * Instance UUID.
   * @type {string}
   * @memberof ScalewayInstanceV1PlacementGroupServer
   */
  id?: string;
  /**
   * Instance name.
   * @type {string}
   * @memberof ScalewayInstanceV1PlacementGroupServer
   */
  name?: string;
  /**
   * Defines whether the placement group policy is respected (either 1 or 0).
   * @type {boolean}
   * @memberof ScalewayInstanceV1PlacementGroupServer
   */
  policy_respected?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1PrivateNIC
 */
export interface ScalewayInstanceV1PrivateNIC {
  /**
   * Private NIC unique ID.
   * @type {string}
   * @memberof ScalewayInstanceV1PrivateNIC
   */
  id?: string;
  /**
   * Instance to which the private NIC is attached.
   * @type {string}
   * @memberof ScalewayInstanceV1PrivateNIC
   */
  server_id?: string;
  /**
   * Private Network the private NIC is attached to.
   * @type {string}
   * @memberof ScalewayInstanceV1PrivateNIC
   */
  private_network_id?: string;
  /**
   * Private NIC MAC address.
   * @type {string}
   * @memberof ScalewayInstanceV1PrivateNIC
   */
  mac_address?: string;
  /**
   * Private NIC state.
   * @type {string}
   * @memberof ScalewayInstanceV1PrivateNIC
   */
  state?: ScalewayInstanceV1PrivateNICStateEnum;
  /**
   * Private NIC tags.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1PrivateNIC
   */
  tags?: Array<string>;
  /**
   * Private NIC creation date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1PrivateNIC
   */
  creation_date?: string;
  /**
   * The zone in which the Private NIC is located.
   * @type {string}
   * @memberof ScalewayInstanceV1PrivateNIC
   */
  zone?: string;
}

export const ScalewayInstanceV1PrivateNICStateEnum = {
  Available: 'available',
  Syncing: 'syncing',
  SyncingError: 'syncing_error',
} as const;

export type ScalewayInstanceV1PrivateNICStateEnum =
  (typeof ScalewayInstanceV1PrivateNICStateEnum)[keyof typeof ScalewayInstanceV1PrivateNICStateEnum];

/**
 *
 * @export
 * @interface ScalewayInstanceV1SecurityGroup
 */
export interface ScalewayInstanceV1SecurityGroup {
  /**
   * Security group unique ID.
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  id?: string;
  /**
   * Security group name.
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  name?: string;
  /**
   * Security group description.
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  description?: string;
  /**
   * True if SMTP is blocked on IPv4 and IPv6. This feature is read only, please open a support ticket if you need to make it configurable.
   * @type {boolean}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  enable_default_security?: boolean;
  /**
   * Default inbound policy.
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  inbound_default_policy?: ScalewayInstanceV1SecurityGroupInboundDefaultPolicyEnum;
  /**
   * Default outbound policy.
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  outbound_default_policy?: ScalewayInstanceV1SecurityGroupOutboundDefaultPolicyEnum;
  /**
   * Security group Organization ID.
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  organization?: string;
  /**
   * Security group Project ID.
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  project?: string;
  /**
   * Security group tags.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  tags?: Array<string>;
  /**
   * True if it is your default security group for this Organization ID.
   * @type {boolean}
   * @memberof ScalewayInstanceV1SecurityGroup
   * @deprecated
   */
  organization_default?: boolean;
  /**
   * True if it is your default security group for this Project ID.
   * @type {boolean}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  project_default?: boolean;
  /**
   * Security group creation date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  creation_date?: string;
  /**
   * Security group modification date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  modification_date?: string;
  /**
   * List of Instances attached to this security group.
   * @type {Array<ScalewayInstanceV1ServerSummary>}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  servers?: Array<ScalewayInstanceV1ServerSummary>;
  /**
   * Defines whether the security group is stateful.
   * @type {boolean}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  stateful?: boolean;
  /**
   * Security group state.
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  state?: ScalewayInstanceV1SecurityGroupStateEnum;
  /**
   * Zone in which the security group is located.
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroup
   */
  zone?: string;
}

export const ScalewayInstanceV1SecurityGroupInboundDefaultPolicyEnum = {
  UnknownPolicy: 'unknown_policy',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type ScalewayInstanceV1SecurityGroupInboundDefaultPolicyEnum =
  (typeof ScalewayInstanceV1SecurityGroupInboundDefaultPolicyEnum)[keyof typeof ScalewayInstanceV1SecurityGroupInboundDefaultPolicyEnum];
export const ScalewayInstanceV1SecurityGroupOutboundDefaultPolicyEnum = {
  UnknownPolicy: 'unknown_policy',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type ScalewayInstanceV1SecurityGroupOutboundDefaultPolicyEnum =
  (typeof ScalewayInstanceV1SecurityGroupOutboundDefaultPolicyEnum)[keyof typeof ScalewayInstanceV1SecurityGroupOutboundDefaultPolicyEnum];
export const ScalewayInstanceV1SecurityGroupStateEnum = {
  Available: 'available',
  Syncing: 'syncing',
  SyncingError: 'syncing_error',
} as const;

export type ScalewayInstanceV1SecurityGroupStateEnum =
  (typeof ScalewayInstanceV1SecurityGroupStateEnum)[keyof typeof ScalewayInstanceV1SecurityGroupStateEnum];

/**
 *
 * @export
 * @interface ScalewayInstanceV1SecurityGroupRule
 */
export interface ScalewayInstanceV1SecurityGroupRule {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  id?: string;
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRuleProtocol}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  protocol?: ScalewayInstanceV1SecurityGroupRuleProtocol;
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRuleDirection}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  direction?: ScalewayInstanceV1SecurityGroupRuleDirection;
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRuleAction}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  action?: ScalewayInstanceV1SecurityGroupRuleAction;
  /**
   * (IP network)
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  ip_range?: string;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  dest_port_from?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  dest_port_to?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  position?: number;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  editable?: boolean;
  /**
   * The zone you want to target
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroupRule
   */
  zone?: string;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1SecurityGroupRuleAction = {
  UnknownAction: 'unknown_action',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type ScalewayInstanceV1SecurityGroupRuleAction =
  (typeof ScalewayInstanceV1SecurityGroupRuleAction)[keyof typeof ScalewayInstanceV1SecurityGroupRuleAction];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1SecurityGroupRuleDirection = {
  UnknownDirection: 'unknown_direction',
  Inbound: 'inbound',
  Outbound: 'outbound',
} as const;

export type ScalewayInstanceV1SecurityGroupRuleDirection =
  (typeof ScalewayInstanceV1SecurityGroupRuleDirection)[keyof typeof ScalewayInstanceV1SecurityGroupRuleDirection];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1SecurityGroupRuleProtocol = {
  UnknownProtocol: 'unknown_protocol',
  Tcp: 'TCP',
  Udp: 'UDP',
  Icmp: 'ICMP',
  Any: 'ANY',
} as const;

export type ScalewayInstanceV1SecurityGroupRuleProtocol =
  (typeof ScalewayInstanceV1SecurityGroupRuleProtocol)[keyof typeof ScalewayInstanceV1SecurityGroupRuleProtocol];

/**
 *
 * @export
 * @interface ScalewayInstanceV1SecurityGroupTemplate
 */
export interface ScalewayInstanceV1SecurityGroupTemplate {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroupTemplate
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1SecurityGroupTemplate
   */
  name?: string;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1Server
 */
export interface ScalewayInstanceV1Server {
  /**
   * Instance unique ID.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  id?: string;
  /**
   * Instance name.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  name?: string;
  /**
   * Instance Organization ID.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  organization?: string;
  /**
   * Instance Project ID.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  project?: string;
  /**
   * List of allowed actions on the Instance.
   * @type {Array<ScalewayInstanceV1ServerAction>}
   * @memberof ScalewayInstanceV1Server
   */
  allowed_actions?: Array<ScalewayInstanceV1ServerAction>;
  /**
   * Tags associated with the Instance.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1Server
   */
  tags?: Array<string>;
  /**
   * Instance commercial type (eg. GP1-M).
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  commercial_type?: string;
  /**
   * Instance creation date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  creation_date?: string;
  /**
   * True if a dynamic IPv4 is required.
   * @type {boolean}
   * @memberof ScalewayInstanceV1Server
   */
  dynamic_ip_required?: boolean;
  /**
   * True to configure the instance so it uses the routed IP mode. Use of `routed_ip_enabled` as `False` is deprecated.
   * @type {boolean}
   * @memberof ScalewayInstanceV1Server
   * @deprecated
   */
  routed_ip_enabled?: boolean;
  /**
   * True if IPv6 is enabled (deprecated and always `False` when `routed_ip_enabled` is `True`).
   * @type {boolean}
   * @memberof ScalewayInstanceV1Server
   * @deprecated
   */
  enable_ipv6?: boolean;
  /**
   * Instance host name.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  hostname?: string;
  /**
   *
   * @type {ScalewayInstanceV1ServerImage}
   * @memberof ScalewayInstanceV1Server
   */
  image?: ScalewayInstanceV1ServerImage;
  /**
   * Defines whether the Instance protection option is activated.
   * @type {boolean}
   * @memberof ScalewayInstanceV1Server
   */
  protected?: boolean;
  /**
   * Private IP address of the Instance (deprecated and always `null` when `routed_ip_enabled` is `True`).
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  private_ip?: string;
  /**
   *
   * @type {ScalewayInstanceV1ServerPublicIp}
   * @memberof ScalewayInstanceV1Server
   * @deprecated
   */
  public_ip?: ScalewayInstanceV1ServerPublicIp;
  /**
   * Information about all the public IPs attached to the server.
   * @type {Array<ScalewayInstanceV1ServerIp>}
   * @memberof ScalewayInstanceV1Server
   */
  public_ips?: Array<ScalewayInstanceV1ServerIp>;
  /**
   * The server\'s MAC address.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  mac_address?: string;
  /**
   * Instance modification date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  modification_date?: string;
  /**
   * Instance state.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  state?: ScalewayInstanceV1ServerStateEnum;
  /**
   *
   * @type {ScalewayInstanceV1ServerLocation}
   * @memberof ScalewayInstanceV1Server
   */
  location?: ScalewayInstanceV1ServerLocation;
  /**
   *
   * @type {ScalewayInstanceV1ServerIpv6}
   * @memberof ScalewayInstanceV1Server
   * @deprecated
   */
  ipv6?: ScalewayInstanceV1ServerIpv6;
  /**
   * Instance boot type.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  boot_type?: ScalewayInstanceV1ServerBootTypeEnum;
  /**
   *
   * @type {ScalewayInstanceV1ServerVolumes}
   * @memberof ScalewayInstanceV1Server
   */
  volumes?: ScalewayInstanceV1ServerVolumes;
  /**
   *
   * @type {ScalewayInstanceV1ServerSecurityGroup}
   * @memberof ScalewayInstanceV1Server
   */
  security_group?: ScalewayInstanceV1ServerSecurityGroup;
  /**
   * Instance planned maintenance.
   * @type {Array<ScalewayInstanceV1ServerMaintenance>}
   * @memberof ScalewayInstanceV1Server
   */
  maintenances?: Array<ScalewayInstanceV1ServerMaintenance>;
  /**
   * Detailed information about the Instance state.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  state_detail?: string;
  /**
   * Instance architecture.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  arch?: ScalewayInstanceV1ServerArchEnum;
  /**
   *
   * @type {ScalewayInstanceV1ServerPlacementGroup}
   * @memberof ScalewayInstanceV1Server
   */
  placement_group?: ScalewayInstanceV1ServerPlacementGroup;
  /**
   * Instance private NICs.
   * @type {Array<ScalewayInstanceV1PrivateNIC>}
   * @memberof ScalewayInstanceV1Server
   */
  private_nics?: Array<ScalewayInstanceV1PrivateNIC>;
  /**
   * Zone in which the Instance is located.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  zone?: string;
  /**
   * UUID of the SSH RSA key that will be used to encrypt the initial admin password for OS requiring it. Mandatory for Windows OS. The public_key value of this key is used to encrypt the admin password. When set to an empty string, reset this value and admin_password_encrypted_value to an empty string so a new password may be generated.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  admin_password_encryption_ssh_key_id?: string;
  /**
   * A base64 encoded string containing the admin password encrypted with the public key pointed to by admin_password_encryption_ssh_key_id. This value is reset when admin_password_encryption_ssh_key_id is set to an empty string.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  admin_password_encrypted_value?: string;
  /**
   * List of attached filesystems.
   * @type {Array<ScalewayInstanceV1ServerFilesystem>}
   * @memberof ScalewayInstanceV1Server
   */
  filesystems?: Array<ScalewayInstanceV1ServerFilesystem>;
  /**
   * True if the Instance type has reached end of service.
   * @type {boolean}
   * @memberof ScalewayInstanceV1Server
   */
  end_of_service?: boolean;
  /**
   * Public DNS of the server.
   * @type {string}
   * @memberof ScalewayInstanceV1Server
   */
  dns?: string;
}

export const ScalewayInstanceV1ServerStateEnum = {
  Running: 'running',
  Stopped: 'stopped',
  StoppedInPlace: 'stopped in place',
  Starting: 'starting',
  Stopping: 'stopping',
  Locked: 'locked',
} as const;

export type ScalewayInstanceV1ServerStateEnum =
  (typeof ScalewayInstanceV1ServerStateEnum)[keyof typeof ScalewayInstanceV1ServerStateEnum];
export const ScalewayInstanceV1ServerBootTypeEnum = {
  Local: 'local',
  Bootscript: 'bootscript',
  Rescue: 'rescue',
} as const;

export type ScalewayInstanceV1ServerBootTypeEnum =
  (typeof ScalewayInstanceV1ServerBootTypeEnum)[keyof typeof ScalewayInstanceV1ServerBootTypeEnum];
export const ScalewayInstanceV1ServerArchEnum = {
  UnknownArch: 'unknown_arch',
  X8664: 'x86_64',
  Arm: 'arm',
  Arm64: 'arm64',
} as const;

export type ScalewayInstanceV1ServerArchEnum =
  (typeof ScalewayInstanceV1ServerArchEnum)[keyof typeof ScalewayInstanceV1ServerArchEnum];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1ServerAction = {
  Poweron: 'poweron',
  Backup: 'backup',
  StopInPlace: 'stop_in_place',
  Poweroff: 'poweroff',
  Terminate: 'terminate',
  Reboot: 'reboot',
  EnableRoutedIp: 'enable_routed_ip',
} as const;

export type ScalewayInstanceV1ServerAction =
  (typeof ScalewayInstanceV1ServerAction)[keyof typeof ScalewayInstanceV1ServerAction];

/**
 *
 * @export
 * @interface ScalewayInstanceV1ServerActionResponse
 */
export interface ScalewayInstanceV1ServerActionResponse {
  /**
   *
   * @type {ScalewayInstanceV1Task}
   * @memberof ScalewayInstanceV1ServerActionResponse
   */
  task?: ScalewayInstanceV1Task;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ServerCompatibleTypes
 */
export interface ScalewayInstanceV1ServerCompatibleTypes {
  /**
   * Instance compatible types.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1ServerCompatibleTypes
   */
  compatible_types?: Array<string>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ServerFilesystem
 */
export interface ScalewayInstanceV1ServerFilesystem {
  /**
   * (UUID format)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerFilesystem
   */
  filesystem_id?: string;
  /**
   *
   * @type {ScalewayInstanceV1ServerFilesystemState}
   * @memberof ScalewayInstanceV1ServerFilesystem
   */
  state?: ScalewayInstanceV1ServerFilesystemState;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1ServerFilesystemState = {
  UnknownState: 'unknown_state',
  Attaching: 'attaching',
  Available: 'available',
  Detaching: 'detaching',
} as const;

export type ScalewayInstanceV1ServerFilesystemState =
  (typeof ScalewayInstanceV1ServerFilesystemState)[keyof typeof ScalewayInstanceV1ServerFilesystemState];

/**
 * Information about the Instance image.
 * @export
 * @interface ScalewayInstanceV1ServerImage
 */
export interface ScalewayInstanceV1ServerImage {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerImage
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerImage
   */
  name?: string;
  /**
   *
   * @type {ScalewayInstanceV1Arch}
   * @memberof ScalewayInstanceV1ServerImage
   */
  arch?: ScalewayInstanceV1Arch;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerImage
   */
  creation_date?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerImage
   */
  modification_date?: string;
  /**
   *
   * @type {ScalewayInstanceV1Bootscript}
   * @memberof ScalewayInstanceV1ServerImage
   * @deprecated
   */
  default_bootscript?: ScalewayInstanceV1Bootscript;
  /**
   *
   * @type {ScalewayInstanceV1ImageExtraVolumes}
   * @memberof ScalewayInstanceV1ServerImage
   */
  extra_volumes?: ScalewayInstanceV1ImageExtraVolumes;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerImage
   */
  from_server?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerImage
   */
  organization?: string;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayInstanceV1ServerImage
   */
  public?: boolean;
  /**
   *
   * @type {ScalewayInstanceV1VolumeSummary}
   * @memberof ScalewayInstanceV1ServerImage
   */
  root_volume?: ScalewayInstanceV1VolumeSummary;
  /**
   *
   * @type {ScalewayInstanceV1ImageState}
   * @memberof ScalewayInstanceV1ServerImage
   */
  state?: ScalewayInstanceV1ImageState;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerImage
   */
  project?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1ServerImage
   */
  tags?: Array<string>;
  /**
   * The zone you want to target
   * @type {string}
   * @memberof ScalewayInstanceV1ServerImage
   */
  zone?: string;
}

/**
 *
 * @export
 * @interface ScalewayInstanceV1ServerIp
 */
export interface ScalewayInstanceV1ServerIp {
  /**
   * Unique ID of the IP address.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIp
   */
  id?: string;
  /**
   * Instance\'s public IP-Address. (IP address)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIp
   */
  address?: string;
  /**
   * Gateway\'s IP address. (IP address)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIp
   */
  gateway?: string;
  /**
   * CIDR netmask.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIp
   */
  netmask?: string;
  /**
   * IP address family (inet or inet6).
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIp
   */
  family?: ScalewayInstanceV1ServerIpFamilyEnum;
  /**
   * True if the IP address is dynamic.
   * @type {boolean}
   * @memberof ScalewayInstanceV1ServerIp
   */
  dynamic?: boolean;
  /**
   * Information about this address provisioning mode.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIp
   */
  provisioning_mode?: ScalewayInstanceV1ServerIpProvisioningModeEnum;
  /**
   * Tags associated with the IP.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1ServerIp
   */
  tags?: Array<string>;
  /**
   * The ip_id of an IPAM ip if the ip is created from IPAM, null if not. (UUID format)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIp
   */
  ipam_id?: string;
  /**
   * IP address state.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIp
   */
  state?: ScalewayInstanceV1ServerIpStateEnum;
}

export const ScalewayInstanceV1ServerIpFamilyEnum = {
  Inet: 'inet',
  Inet6: 'inet6',
} as const;

export type ScalewayInstanceV1ServerIpFamilyEnum =
  (typeof ScalewayInstanceV1ServerIpFamilyEnum)[keyof typeof ScalewayInstanceV1ServerIpFamilyEnum];
export const ScalewayInstanceV1ServerIpProvisioningModeEnum = {
  Manual: 'manual',
  Dhcp: 'dhcp',
  Slaac: 'slaac',
} as const;

export type ScalewayInstanceV1ServerIpProvisioningModeEnum =
  (typeof ScalewayInstanceV1ServerIpProvisioningModeEnum)[keyof typeof ScalewayInstanceV1ServerIpProvisioningModeEnum];
export const ScalewayInstanceV1ServerIpStateEnum = {
  UnknownState: 'unknown_state',
  Detached: 'detached',
  Attached: 'attached',
  Pending: 'pending',
  Error: 'error',
} as const;

export type ScalewayInstanceV1ServerIpStateEnum =
  (typeof ScalewayInstanceV1ServerIpStateEnum)[keyof typeof ScalewayInstanceV1ServerIpStateEnum];

/**
 * Instance IPv6 address (deprecated when `routed_ip_enabled` is `True`).
 * @export
 * @interface ScalewayInstanceV1ServerIpv6
 */
export interface ScalewayInstanceV1ServerIpv6 {
  /**
   * Instance IPv6 IP-Address. (IPv6 address)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIpv6
   */
  address?: string;
  /**
   * IPv6 IP-addresses gateway. (IPv6 address)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIpv6
   */
  gateway?: string;
  /**
   * IPv6 IP-addresses CIDR netmask.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerIpv6
   */
  netmask?: string;
}
/**
 * Instance location.
 * @export
 * @interface ScalewayInstanceV1ServerLocation
 */
export interface ScalewayInstanceV1ServerLocation {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerLocation
   */
  cluster_id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerLocation
   */
  hypervisor_id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerLocation
   */
  node_id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerLocation
   */
  platform_id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerLocation
   */
  zone_id?: string;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ServerMaintenance
 */
export interface ScalewayInstanceV1ServerMaintenance {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerMaintenance
   */
  reason?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerMaintenance
   */
  start_date?: string;
}
/**
 * Instance placement group.
 * @export
 * @interface ScalewayInstanceV1ServerPlacementGroup
 */
export interface ScalewayInstanceV1ServerPlacementGroup {
  /**
   * Placement group unique ID.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPlacementGroup
   */
  id?: string;
  /**
   * Placement group name.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPlacementGroup
   */
  name?: string;
  /**
   * Placement group Organization ID.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPlacementGroup
   */
  organization?: string;
  /**
   * Placement group Project ID.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPlacementGroup
   */
  project?: string;
  /**
   * Placement group tags.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1ServerPlacementGroup
   */
  tags?: Array<string>;
  /**
   * Select the failure mode when the placement cannot be respected, either optional or enforced.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPlacementGroup
   */
  policy_mode?: ScalewayInstanceV1ServerPlacementGroupPolicyModeEnum;
  /**
   * Select the behavior of the placement group, either low_latency (group) or max_availability (spread).
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPlacementGroup
   */
  policy_type?: ScalewayInstanceV1ServerPlacementGroupPolicyTypeEnum;
  /**
   * True if the policy is respected, false otherwise. In the server endpoints the value is always false as it is deprecated. In the placement group endpoints the value is correct.
   * @type {boolean}
   * @memberof ScalewayInstanceV1ServerPlacementGroup
   */
  policy_respected?: boolean;
  /**
   * Zone in which the placement group is located.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPlacementGroup
   */
  zone?: string;
}

export const ScalewayInstanceV1ServerPlacementGroupPolicyModeEnum = {
  Optional: 'optional',
  Enforced: 'enforced',
} as const;

export type ScalewayInstanceV1ServerPlacementGroupPolicyModeEnum =
  (typeof ScalewayInstanceV1ServerPlacementGroupPolicyModeEnum)[keyof typeof ScalewayInstanceV1ServerPlacementGroupPolicyModeEnum];
export const ScalewayInstanceV1ServerPlacementGroupPolicyTypeEnum = {
  MaxAvailability: 'max_availability',
  LowLatency: 'low_latency',
} as const;

export type ScalewayInstanceV1ServerPlacementGroupPolicyTypeEnum =
  (typeof ScalewayInstanceV1ServerPlacementGroupPolicyTypeEnum)[keyof typeof ScalewayInstanceV1ServerPlacementGroupPolicyTypeEnum];

/**
 * Information about the public IP (deprecated in favor of `public_ips`).
 * @export
 * @interface ScalewayInstanceV1ServerPublicIp
 */
export interface ScalewayInstanceV1ServerPublicIp {
  /**
   * Unique ID of the IP address.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  id?: string;
  /**
   * Instance\'s public IP-Address. (IP address)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  address?: string;
  /**
   * Gateway\'s IP address. (IP address)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  gateway?: string;
  /**
   * CIDR netmask.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  netmask?: string;
  /**
   * IP address family (inet or inet6).
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  family?: ScalewayInstanceV1ServerPublicIpFamilyEnum;
  /**
   * True if the IP address is dynamic.
   * @type {boolean}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  dynamic?: boolean;
  /**
   * Information about this address provisioning mode.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  provisioning_mode?: ScalewayInstanceV1ServerPublicIpProvisioningModeEnum;
  /**
   * Tags associated with the IP.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  tags?: Array<string>;
  /**
   * The ip_id of an IPAM ip if the ip is created from IPAM, null if not. (UUID format)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  ipam_id?: string;
  /**
   * IP address state.
   * @type {string}
   * @memberof ScalewayInstanceV1ServerPublicIp
   */
  state?: ScalewayInstanceV1ServerPublicIpStateEnum;
}

export const ScalewayInstanceV1ServerPublicIpFamilyEnum = {
  Inet: 'inet',
  Inet6: 'inet6',
} as const;

export type ScalewayInstanceV1ServerPublicIpFamilyEnum =
  (typeof ScalewayInstanceV1ServerPublicIpFamilyEnum)[keyof typeof ScalewayInstanceV1ServerPublicIpFamilyEnum];
export const ScalewayInstanceV1ServerPublicIpProvisioningModeEnum = {
  Manual: 'manual',
  Dhcp: 'dhcp',
  Slaac: 'slaac',
} as const;

export type ScalewayInstanceV1ServerPublicIpProvisioningModeEnum =
  (typeof ScalewayInstanceV1ServerPublicIpProvisioningModeEnum)[keyof typeof ScalewayInstanceV1ServerPublicIpProvisioningModeEnum];
export const ScalewayInstanceV1ServerPublicIpStateEnum = {
  UnknownState: 'unknown_state',
  Detached: 'detached',
  Attached: 'attached',
  Pending: 'pending',
  Error: 'error',
} as const;

export type ScalewayInstanceV1ServerPublicIpStateEnum =
  (typeof ScalewayInstanceV1ServerPublicIpStateEnum)[keyof typeof ScalewayInstanceV1ServerPublicIpStateEnum];

/**
 * Instance security group.
 * @export
 * @interface ScalewayInstanceV1ServerSecurityGroup
 */
export interface ScalewayInstanceV1ServerSecurityGroup {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerSecurityGroup
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerSecurityGroup
   */
  name?: string;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ServerSummary
 */
export interface ScalewayInstanceV1ServerSummary {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerSummary
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerSummary
   */
  name?: string;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1ServerTypeNetworkInterface
 */
export interface ScalewayInstanceV1ServerTypeNetworkInterface {
  /**
   * Maximum internal bandwidth in bits per seconds.
   * @type {number}
   * @memberof ScalewayInstanceV1ServerTypeNetworkInterface
   */
  internal_bandwidth?: number;
  /**
   * Maximum internet bandwidth in bits per seconds.
   * @type {number}
   * @memberof ScalewayInstanceV1ServerTypeNetworkInterface
   */
  internet_bandwidth?: number;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1ServerTypesAvailability = {
  Available: 'available',
  Scarce: 'scarce',
  Shortage: 'shortage',
} as const;

export type ScalewayInstanceV1ServerTypesAvailability =
  (typeof ScalewayInstanceV1ServerTypesAvailability)[keyof typeof ScalewayInstanceV1ServerTypesAvailability];

/**
 * Instance volumes.
 * @export
 * @interface ScalewayInstanceV1ServerVolumes
 */
export interface ScalewayInstanceV1ServerVolumes {
  [key: string]: any;

  /**
   *
   * @type {ScalewayInstanceV1ServerVolumesVolumeKey}
   * @memberof ScalewayInstanceV1ServerVolumes
   */
  '&lt;volumeKey&gt;'?: ScalewayInstanceV1ServerVolumesVolumeKey;
}
/**
 * Instance volumes.
 * @export
 * @interface ScalewayInstanceV1ServerVolumesVolumeKey
 */
export interface ScalewayInstanceV1ServerVolumesVolumeKey {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   * @deprecated
   */
  export_uri?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  organization?: string;
  /**
   *
   * @type {ScalewayInstanceV1ServerSummary}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  server?: ScalewayInstanceV1ServerSummary;
  /**
   * (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  size?: number;
  /**
   *
   * @type {ScalewayInstanceV1VolumeServerVolumeType}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  volume_type?: ScalewayInstanceV1VolumeServerVolumeType;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  creation_date?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  modification_date?: string;
  /**
   *
   * @type {ScalewayInstanceV1VolumeServerState}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  state?: ScalewayInstanceV1VolumeServerState;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  project?: string;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  boot?: boolean;
  /**
   * The zone you want to target
   * @type {string}
   * @memberof ScalewayInstanceV1ServerVolumesVolumeKey
   */
  zone?: string;
}

/**
 *
 * @export
 * @interface ScalewayInstanceV1SetImageResponse
 */
export interface ScalewayInstanceV1SetImageResponse {
  /**
   *
   * @type {ScalewayInstanceV1Image}
   * @memberof ScalewayInstanceV1SetImageResponse
   */
  image?: ScalewayInstanceV1Image;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1SetPlacementGroupResponse
 */
export interface ScalewayInstanceV1SetPlacementGroupResponse {
  /**
   *
   * @type {ScalewayInstanceV1PlacementGroup}
   * @memberof ScalewayInstanceV1SetPlacementGroupResponse
   */
  placement_group?: ScalewayInstanceV1PlacementGroup;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1SetPlacementGroupServersResponse
 */
export interface ScalewayInstanceV1SetPlacementGroupServersResponse {
  /**
   * Instances attached to the placement group.
   * @type {Array<ScalewayInstanceV1PlacementGroupServer>}
   * @memberof ScalewayInstanceV1SetPlacementGroupServersResponse
   */
  servers?: Array<ScalewayInstanceV1PlacementGroupServer>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1SetSecurityGroupResponse
 */
export interface ScalewayInstanceV1SetSecurityGroupResponse {
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroup}
   * @memberof ScalewayInstanceV1SetSecurityGroupResponse
   */
  security_group?: ScalewayInstanceV1SecurityGroup;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1SetSecurityGroupRuleResponse
 */
export interface ScalewayInstanceV1SetSecurityGroupRuleResponse {
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRule}
   * @memberof ScalewayInstanceV1SetSecurityGroupRuleResponse
   */
  rule?: ScalewayInstanceV1SecurityGroupRule;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1SetSecurityGroupRulesRequestRule
 */
export interface ScalewayInstanceV1SetSecurityGroupRulesRequestRule {
  /**
   * UUID of the security rule to update. If no value is provided, a new rule will be created.
   * @type {string}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  id?: string;
  /**
   * Action to apply when the rule matches a packet.
   * @type {string}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  action?: ScalewayInstanceV1SetSecurityGroupRulesRequestRuleActionEnum;
  /**
   * Protocol family this rule applies to.
   * @type {string}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  protocol?: ScalewayInstanceV1SetSecurityGroupRulesRequestRuleProtocolEnum;
  /**
   * Direction the rule applies to.
   * @type {string}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  direction?: ScalewayInstanceV1SetSecurityGroupRulesRequestRuleDirectionEnum;
  /**
   * Range of IP addresses these rules apply to. (IP network)
   * @type {string}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  ip_range?: string;
  /**
   * Beginning of the range of ports this rule applies to (inclusive). This value will be set to null if protocol is ICMP or ANY.
   * @type {number}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  dest_port_from?: number;
  /**
   * End of the range of ports this rule applies to (inclusive). This value will be set to null if protocol is ICMP or ANY, or if it is equal to dest_port_from.
   * @type {number}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  dest_port_to?: number;
  /**
   * Position of this rule in the security group rules list. If several rules are passed with the same position, the resulting order is undefined.
   * @type {number}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  position?: number;
  /**
   * Indicates if this rule is editable. Rules with the value false will be ignored.
   * @type {boolean}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  editable?: boolean;
  /**
   * Zone of the rule. This field is ignored.
   * @type {string}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesRequestRule
   */
  zone?: string;
}

export const ScalewayInstanceV1SetSecurityGroupRulesRequestRuleActionEnum = {
  UnknownAction: 'unknown_action',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type ScalewayInstanceV1SetSecurityGroupRulesRequestRuleActionEnum =
  (typeof ScalewayInstanceV1SetSecurityGroupRulesRequestRuleActionEnum)[keyof typeof ScalewayInstanceV1SetSecurityGroupRulesRequestRuleActionEnum];
export const ScalewayInstanceV1SetSecurityGroupRulesRequestRuleProtocolEnum = {
  UnknownProtocol: 'unknown_protocol',
  Tcp: 'TCP',
  Udp: 'UDP',
  Icmp: 'ICMP',
  Any: 'ANY',
} as const;

export type ScalewayInstanceV1SetSecurityGroupRulesRequestRuleProtocolEnum =
  (typeof ScalewayInstanceV1SetSecurityGroupRulesRequestRuleProtocolEnum)[keyof typeof ScalewayInstanceV1SetSecurityGroupRulesRequestRuleProtocolEnum];
export const ScalewayInstanceV1SetSecurityGroupRulesRequestRuleDirectionEnum = {
  UnknownDirection: 'unknown_direction',
  Inbound: 'inbound',
  Outbound: 'outbound',
} as const;

export type ScalewayInstanceV1SetSecurityGroupRulesRequestRuleDirectionEnum =
  (typeof ScalewayInstanceV1SetSecurityGroupRulesRequestRuleDirectionEnum)[keyof typeof ScalewayInstanceV1SetSecurityGroupRulesRequestRuleDirectionEnum];

/**
 *
 * @export
 * @interface ScalewayInstanceV1SetSecurityGroupRulesResponse
 */
export interface ScalewayInstanceV1SetSecurityGroupRulesResponse {
  /**
   *
   * @type {Array<ScalewayInstanceV1SecurityGroupRule>}
   * @memberof ScalewayInstanceV1SetSecurityGroupRulesResponse
   */
  rules?: Array<ScalewayInstanceV1SecurityGroupRule>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1SetSnapshotResponse
 */
export interface ScalewayInstanceV1SetSnapshotResponse {
  /**
   *
   * @type {ScalewayInstanceV1Snapshot}
   * @memberof ScalewayInstanceV1SetSnapshotResponse
   */
  snapshot?: ScalewayInstanceV1Snapshot;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1SetVolumeResponse
 */
export interface ScalewayInstanceV1SetVolumeResponse {
  /**
   *
   * @type {ScalewayInstanceV1Volume}
   * @memberof ScalewayInstanceV1SetVolumeResponse
   */
  volume?: ScalewayInstanceV1Volume;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1Snapshot
 */
export interface ScalewayInstanceV1Snapshot {
  /**
   * Snapshot ID.
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  id?: string;
  /**
   * Snapshot name.
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  name?: string;
  /**
   * Snapshot Organization ID.
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  organization?: string;
  /**
   * Snapshot Project ID.
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  project?: string;
  /**
   * Snapshot tags.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1Snapshot
   */
  tags?: Array<string>;
  /**
   * Snapshot volume type.
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  volume_type?: ScalewayInstanceV1SnapshotVolumeTypeEnum;
  /**
   * Snapshot size. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1Snapshot
   */
  size?: number;
  /**
   * Snapshot state.
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  state?: ScalewayInstanceV1SnapshotStateEnum;
  /**
   *
   * @type {ScalewayInstanceV1SnapshotBaseVolume}
   * @memberof ScalewayInstanceV1Snapshot
   */
  base_volume?: ScalewayInstanceV1SnapshotBaseVolume;
  /**
   * Snapshot creation date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  creation_date?: string;
  /**
   * Snapshot modification date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  modification_date?: string;
  /**
   * Snapshot zone.
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  zone?: string;
  /**
   * Reason for the failed snapshot import.
   * @type {string}
   * @memberof ScalewayInstanceV1Snapshot
   */
  error_reason?: string;
}

export const ScalewayInstanceV1SnapshotVolumeTypeEnum = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;

export type ScalewayInstanceV1SnapshotVolumeTypeEnum =
  (typeof ScalewayInstanceV1SnapshotVolumeTypeEnum)[keyof typeof ScalewayInstanceV1SnapshotVolumeTypeEnum];
export const ScalewayInstanceV1SnapshotStateEnum = {
  Available: 'available',
  Snapshotting: 'snapshotting',
  Error: 'error',
  InvalidData: 'invalid_data',
  Importing: 'importing',
  Exporting: 'exporting',
} as const;

export type ScalewayInstanceV1SnapshotStateEnum =
  (typeof ScalewayInstanceV1SnapshotStateEnum)[keyof typeof ScalewayInstanceV1SnapshotStateEnum];

/**
 * Volume on which the snapshot is based on.
 * @export
 * @interface ScalewayInstanceV1SnapshotBaseVolume
 */
export interface ScalewayInstanceV1SnapshotBaseVolume {
  /**
   * Volume ID on which the snapshot is based.
   * @type {string}
   * @memberof ScalewayInstanceV1SnapshotBaseVolume
   */
  id?: string;
  /**
   * Volume name on which the snapshot is based on.
   * @type {string}
   * @memberof ScalewayInstanceV1SnapshotBaseVolume
   */
  name?: string;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1SnapshotState = {
  Available: 'available',
  Snapshotting: 'snapshotting',
  Error: 'error',
  InvalidData: 'invalid_data',
  Importing: 'importing',
  Exporting: 'exporting',
} as const;

export type ScalewayInstanceV1SnapshotState =
  (typeof ScalewayInstanceV1SnapshotState)[keyof typeof ScalewayInstanceV1SnapshotState];

/**
 *
 * @export
 * @interface ScalewayInstanceV1Task
 */
export interface ScalewayInstanceV1Task {
  /**
   * Unique ID of the task.
   * @type {string}
   * @memberof ScalewayInstanceV1Task
   */
  id?: string;
  /**
   * Description of the task.
   * @type {string}
   * @memberof ScalewayInstanceV1Task
   */
  description?: string;
  /**
   * Progress of the task in percent.
   * @type {number}
   * @memberof ScalewayInstanceV1Task
   */
  progress?: number;
  /**
   * Task start date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Task
   */
  started_at?: string;
  /**
   * Task end date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Task
   */
  terminated_at?: string;
  /**
   * Task status.
   * @type {string}
   * @memberof ScalewayInstanceV1Task
   */
  status?: ScalewayInstanceV1TaskStatusEnum;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Task
   */
  href_from?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1Task
   */
  href_result?: string;
  /**
   * Zone in which the task is executed.
   * @type {string}
   * @memberof ScalewayInstanceV1Task
   */
  zone?: string;
}

export const ScalewayInstanceV1TaskStatusEnum = {
  Pending: 'pending',
  Started: 'started',
  Success: 'success',
  Failure: 'failure',
  Retry: 'retry',
} as const;

export type ScalewayInstanceV1TaskStatusEnum =
  (typeof ScalewayInstanceV1TaskStatusEnum)[keyof typeof ScalewayInstanceV1TaskStatusEnum];

/**
 *
 * @export
 * @interface ScalewayInstanceV1UpdateImageResponse
 */
export interface ScalewayInstanceV1UpdateImageResponse {
  /**
   *
   * @type {ScalewayInstanceV1Image}
   * @memberof ScalewayInstanceV1UpdateImageResponse
   */
  image?: ScalewayInstanceV1Image;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1UpdateIpResponse
 */
export interface ScalewayInstanceV1UpdateIpResponse {
  /**
   *
   * @type {ScalewayInstanceV1Ip}
   * @memberof ScalewayInstanceV1UpdateIpResponse
   */
  ip?: ScalewayInstanceV1Ip;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1UpdatePlacementGroupResponse
 */
export interface ScalewayInstanceV1UpdatePlacementGroupResponse {
  /**
   *
   * @type {ScalewayInstanceV1PlacementGroup}
   * @memberof ScalewayInstanceV1UpdatePlacementGroupResponse
   */
  placement_group?: ScalewayInstanceV1PlacementGroup;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1UpdatePlacementGroupServersResponse
 */
export interface ScalewayInstanceV1UpdatePlacementGroupServersResponse {
  /**
   * Instances attached to the placement group.
   * @type {Array<ScalewayInstanceV1PlacementGroupServer>}
   * @memberof ScalewayInstanceV1UpdatePlacementGroupServersResponse
   */
  servers?: Array<ScalewayInstanceV1PlacementGroupServer>;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1UpdateSecurityGroupResponse
 */
export interface ScalewayInstanceV1UpdateSecurityGroupResponse {
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroup}
   * @memberof ScalewayInstanceV1UpdateSecurityGroupResponse
   */
  security_group?: ScalewayInstanceV1SecurityGroup;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1UpdateSecurityGroupRuleResponse
 */
export interface ScalewayInstanceV1UpdateSecurityGroupRuleResponse {
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRule}
   * @memberof ScalewayInstanceV1UpdateSecurityGroupRuleResponse
   */
  rule?: ScalewayInstanceV1SecurityGroupRule;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1UpdateServerResponse
 */
export interface ScalewayInstanceV1UpdateServerResponse {
  /**
   *
   * @type {ScalewayInstanceV1Server}
   * @memberof ScalewayInstanceV1UpdateServerResponse
   */
  server?: ScalewayInstanceV1Server;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1UpdateSnapshotResponse
 */
export interface ScalewayInstanceV1UpdateSnapshotResponse {
  /**
   *
   * @type {ScalewayInstanceV1Snapshot}
   * @memberof ScalewayInstanceV1UpdateSnapshotResponse
   */
  snapshot?: ScalewayInstanceV1Snapshot;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1UpdateVolumeResponse
 */
export interface ScalewayInstanceV1UpdateVolumeResponse {
  /**
   *
   * @type {ScalewayInstanceV1Volume}
   * @memberof ScalewayInstanceV1UpdateVolumeResponse
   */
  volume?: ScalewayInstanceV1Volume;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1Volume
 */
export interface ScalewayInstanceV1Volume {
  /**
   * Volume unique ID.
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   */
  id?: string;
  /**
   * Volume name.
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   */
  name?: string;
  /**
   * Show the volume NBD export URI (deprecated, will always be empty).
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   * @deprecated
   */
  export_uri?: string;
  /**
   * Volume disk size. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1Volume
   */
  size?: number;
  /**
   * Volume type.
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   */
  volume_type?: ScalewayInstanceV1VolumeVolumeTypeEnum;
  /**
   * Volume creation date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   */
  creation_date?: string;
  /**
   * Volume modification date. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   */
  modification_date?: string;
  /**
   * Volume Organization ID.
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   */
  organization?: string;
  /**
   * Volume Project ID.
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   */
  project?: string;
  /**
   * Volume tags.
   * @type {Array<string>}
   * @memberof ScalewayInstanceV1Volume
   */
  tags?: Array<string>;
  /**
   *
   * @type {SetVolumeRequestServer}
   * @memberof ScalewayInstanceV1Volume
   */
  server?: SetVolumeRequestServer;
  /**
   * Volume state.
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   */
  state?: ScalewayInstanceV1VolumeStateEnum;
  /**
   * Zone in which the volume is located.
   * @type {string}
   * @memberof ScalewayInstanceV1Volume
   */
  zone?: string;
}

export const ScalewayInstanceV1VolumeVolumeTypeEnum = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;

export type ScalewayInstanceV1VolumeVolumeTypeEnum =
  (typeof ScalewayInstanceV1VolumeVolumeTypeEnum)[keyof typeof ScalewayInstanceV1VolumeVolumeTypeEnum];
export const ScalewayInstanceV1VolumeStateEnum = {
  Available: 'available',
  Snapshotting: 'snapshotting',
  Fetching: 'fetching',
  Saving: 'saving',
  Attaching: 'attaching',
  Resizing: 'resizing',
  Hotsyncing: 'hotsyncing',
  Error: 'error',
} as const;

export type ScalewayInstanceV1VolumeStateEnum =
  (typeof ScalewayInstanceV1VolumeStateEnum)[keyof typeof ScalewayInstanceV1VolumeStateEnum];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1VolumeServerState = {
  Available: 'available',
  Snapshotting: 'snapshotting',
  Resizing: 'resizing',
  Fetching: 'fetching',
  Saving: 'saving',
  Hotsyncing: 'hotsyncing',
  Attaching: 'attaching',
  Error: 'error',
} as const;

export type ScalewayInstanceV1VolumeServerState =
  (typeof ScalewayInstanceV1VolumeServerState)[keyof typeof ScalewayInstanceV1VolumeServerState];

/**
 *
 * @export
 * @interface ScalewayInstanceV1VolumeServerTemplate
 */
export interface ScalewayInstanceV1VolumeServerTemplate {
  /**
   * UUID of the volume.
   * @type {string}
   * @memberof ScalewayInstanceV1VolumeServerTemplate
   */
  id?: string;
  /**
   * Force the Instance to boot on this volume.
   * @type {boolean}
   * @memberof ScalewayInstanceV1VolumeServerTemplate
   */
  boot?: boolean;
  /**
   * Name of the volume.
   * @type {string}
   * @memberof ScalewayInstanceV1VolumeServerTemplate
   */
  name?: string;
  /**
   * Disk size of the volume, must be a multiple of 512. (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1VolumeServerTemplate
   */
  size?: number;
  /**
   * Type of the volume.
   * @type {string}
   * @memberof ScalewayInstanceV1VolumeServerTemplate
   */
  volume_type?: ScalewayInstanceV1VolumeServerTemplateVolumeTypeEnum;
  /**
   * ID of the snapshot on which this volume will be based.
   * @type {string}
   * @memberof ScalewayInstanceV1VolumeServerTemplate
   */
  base_snapshot?: string;
  /**
   * Organization ID of the volume.
   * @type {string}
   * @memberof ScalewayInstanceV1VolumeServerTemplate
   */
  organization?: string;
  /**
   * Project ID of the volume.
   * @type {string}
   * @memberof ScalewayInstanceV1VolumeServerTemplate
   */
  project?: string;
}

export const ScalewayInstanceV1VolumeServerTemplateVolumeTypeEnum = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;

export type ScalewayInstanceV1VolumeServerTemplateVolumeTypeEnum =
  (typeof ScalewayInstanceV1VolumeServerTemplateVolumeTypeEnum)[keyof typeof ScalewayInstanceV1VolumeServerTemplateVolumeTypeEnum];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1VolumeServerVolumeType = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  SbsVolume: 'sbs_volume',
  Scratch: 'scratch',
} as const;

export type ScalewayInstanceV1VolumeServerVolumeType =
  (typeof ScalewayInstanceV1VolumeServerVolumeType)[keyof typeof ScalewayInstanceV1VolumeServerVolumeType];

/**
 *
 * @export
 * @interface ScalewayInstanceV1VolumeSummary
 */
export interface ScalewayInstanceV1VolumeSummary {
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1VolumeSummary
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayInstanceV1VolumeSummary
   */
  name?: string;
  /**
   * (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1VolumeSummary
   */
  size?: number;
  /**
   *
   * @type {ScalewayInstanceV1VolumeVolumeType}
   * @memberof ScalewayInstanceV1VolumeSummary
   */
  volume_type?: ScalewayInstanceV1VolumeVolumeType;
}

/**
 *
 * @export
 * @interface ScalewayInstanceV1VolumeTypeCapabilities
 */
export interface ScalewayInstanceV1VolumeTypeCapabilities {
  /**
   *
   * @type {boolean}
   * @memberof ScalewayInstanceV1VolumeTypeCapabilities
   */
  snapshot?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayInstanceV1VolumeTypeConstraints
 */
export interface ScalewayInstanceV1VolumeTypeConstraints {
  /**
   * (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1VolumeTypeConstraints
   */
  min?: number;
  /**
   * (in bytes)
   * @type {number}
   * @memberof ScalewayInstanceV1VolumeTypeConstraints
   */
  max?: number;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayInstanceV1VolumeVolumeType = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;

export type ScalewayInstanceV1VolumeVolumeType =
  (typeof ScalewayInstanceV1VolumeVolumeType)[keyof typeof ScalewayInstanceV1VolumeVolumeType];

/**
 *
 * @export
 * @interface ScalewayStdFile
 */
export interface ScalewayStdFile {
  /**
   *
   * @type {string}
   * @memberof ScalewayStdFile
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayStdFile
   */
  content_type?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayStdFile
   */
  content?: string;
}
/**
 *
 * @export
 * @interface ServerActionRequest
 */
export interface ServerActionRequest {
  /**
   * Action to perform on the Instance.
   * @type {string}
   * @memberof ServerActionRequest
   */
  action?: ServerActionRequestActionEnum;
  /**
   * Name of the backup you want to create. Name of the backup you want to create. This field should only be specified when performing a backup action.
   * @type {string}
   * @memberof ServerActionRequest
   */
  name?: string;
  /**
   *
   * @type {ServerActionRequestVolumes}
   * @memberof ServerActionRequest
   */
  volumes?: ServerActionRequestVolumes;
  /**
   * Disable IPv6 on the Instance (true by default). Disable IPv6 on the Instance while performing migration to routed IPs. This field should only be specified when performing a enable_routed_ip action.
   * @type {boolean}
   * @memberof ServerActionRequest
   */
  disable_ipv6?: boolean;
}

export const ServerActionRequestActionEnum = {
  Poweron: 'poweron',
  Backup: 'backup',
  StopInPlace: 'stop_in_place',
  Poweroff: 'poweroff',
  Terminate: 'terminate',
  Reboot: 'reboot',
  EnableRoutedIp: 'enable_routed_ip',
} as const;

export type ServerActionRequestActionEnum =
  (typeof ServerActionRequestActionEnum)[keyof typeof ServerActionRequestActionEnum];

/**
 * For each volume UUID, the snapshot parameters of the volume. For each volume UUID, the snapshot parameters of the volume. This field should only be specified when performing a backup action.
 * @export
 * @interface ServerActionRequestVolumes
 */
export interface ServerActionRequestVolumes {
  [key: string]: any;

  /**
   *
   * @type {ServerActionRequestVolumesVolumeKey}
   * @memberof ServerActionRequestVolumes
   */
  '&lt;volumeKey&gt;'?: ServerActionRequestVolumesVolumeKey;
}
/**
 * For each volume UUID, the snapshot parameters of the volume. For each volume UUID, the snapshot parameters of the volume. This field should only be specified when performing a backup action.
 * @export
 * @interface ServerActionRequestVolumesVolumeKey
 */
export interface ServerActionRequestVolumesVolumeKey {
  /**
   * Snapshot\'s volume type. Overrides the `volume_type` of the snapshot for this volume. If omitted, the volume type of the original volume will be used.
   * @type {string}
   * @memberof ServerActionRequestVolumesVolumeKey
   */
  volume_type?: ServerActionRequestVolumesVolumeKeyVolumeTypeEnum;
}

export const ServerActionRequestVolumesVolumeKeyVolumeTypeEnum = {
  UnknownVolumeType: 'unknown_volume_type',
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
} as const;

export type ServerActionRequestVolumesVolumeKeyVolumeTypeEnum =
  (typeof ServerActionRequestVolumesVolumeKeyVolumeTypeEnum)[keyof typeof ServerActionRequestVolumesVolumeKeyVolumeTypeEnum];

/**
 *
 * @export
 * @interface SetImageRequest
 */
export interface SetImageRequest {
  /**
   *
   * @type {string}
   * @memberof SetImageRequest
   */
  name?: string;
  /**
   *
   * @type {ScalewayInstanceV1Arch}
   * @memberof SetImageRequest
   */
  arch?: ScalewayInstanceV1Arch;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof SetImageRequest
   */
  creation_date?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof SetImageRequest
   */
  modification_date?: string;
  /**
   *
   * @type {ScalewayInstanceV1Bootscript}
   * @memberof SetImageRequest
   * @deprecated
   */
  default_bootscript?: ScalewayInstanceV1Bootscript;
  /**
   *
   * @type {SetImageRequestExtraVolumes}
   * @memberof SetImageRequest
   */
  extra_volumes?: SetImageRequestExtraVolumes;
  /**
   *
   * @type {string}
   * @memberof SetImageRequest
   */
  from_server?: string;
  /**
   *
   * @type {string}
   * @memberof SetImageRequest
   */
  organization?: string;
  /**
   *
   * @type {boolean}
   * @memberof SetImageRequest
   */
  public?: boolean;
  /**
   *
   * @type {ScalewayInstanceV1VolumeSummary}
   * @memberof SetImageRequest
   */
  root_volume?: ScalewayInstanceV1VolumeSummary;
  /**
   *
   * @type {ScalewayInstanceV1ImageState}
   * @memberof SetImageRequest
   */
  state?: ScalewayInstanceV1ImageState;
  /**
   *
   * @type {string}
   * @memberof SetImageRequest
   */
  project?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof SetImageRequest
   */
  tags?: Array<string>;
}

/**
 *
 * @export
 * @interface SetImageRequestExtraVolumes
 */
export interface SetImageRequestExtraVolumes {
  [key: string]: any;

  /**
   *
   * @type {ScalewayInstanceV1Volume}
   * @memberof SetImageRequestExtraVolumes
   */
  '&lt;extra_volumeKey&gt;'?: ScalewayInstanceV1Volume;
}
/**
 *
 * @export
 * @interface SetPlacementGroupRequest
 */
export interface SetPlacementGroupRequest {
  /**
   *
   * @type {string}
   * @memberof SetPlacementGroupRequest
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof SetPlacementGroupRequest
   */
  organization?: string;
  /**
   *
   * @type {ScalewayInstanceV1PlacementGroupPolicyMode}
   * @memberof SetPlacementGroupRequest
   */
  policy_mode?: ScalewayInstanceV1PlacementGroupPolicyMode;
  /**
   *
   * @type {ScalewayInstanceV1PlacementGroupPolicyType}
   * @memberof SetPlacementGroupRequest
   */
  policy_type?: ScalewayInstanceV1PlacementGroupPolicyType;
  /**
   *
   * @type {string}
   * @memberof SetPlacementGroupRequest
   */
  project?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof SetPlacementGroupRequest
   */
  tags?: Array<string>;
}

/**
 *
 * @export
 * @interface SetPlacementGroupServersRequest
 */
export interface SetPlacementGroupServersRequest {
  /**
   * An array of the Instances\' UUIDs you want to configure.
   * @type {Array<string>}
   * @memberof SetPlacementGroupServersRequest
   */
  servers: Array<string>;
}
/**
 *
 * @export
 * @interface SetSecurityGroupRequest
 */
export interface SetSecurityGroupRequest {
  /**
   * Name of the security group.
   * @type {string}
   * @memberof SetSecurityGroupRequest
   */
  name?: string;
  /**
   * Tags of the security group.
   * @type {Array<string>}
   * @memberof SetSecurityGroupRequest
   */
  tags?: Array<string>;
  /**
   * Creation date of the security group (will be ignored). (RFC 3339 format)
   * @type {string}
   * @memberof SetSecurityGroupRequest
   */
  creation_date?: string;
  /**
   * Modification date of the security group (will be ignored). (RFC 3339 format)
   * @type {string}
   * @memberof SetSecurityGroupRequest
   */
  modification_date?: string;
  /**
   * Description of the security group.
   * @type {string}
   * @memberof SetSecurityGroupRequest
   */
  description?: string;
  /**
   * True to block SMTP on IPv4 and IPv6. This feature is read only, please open a support ticket if you need to make it configurable.
   * @type {boolean}
   * @memberof SetSecurityGroupRequest
   */
  enable_default_security?: boolean;
  /**
   * Default inbound policy.
   * @type {string}
   * @memberof SetSecurityGroupRequest
   */
  inbound_default_policy?: SetSecurityGroupRequestInboundDefaultPolicyEnum;
  /**
   * Default outbound policy.
   * @type {string}
   * @memberof SetSecurityGroupRequest
   */
  outbound_default_policy?: SetSecurityGroupRequestOutboundDefaultPolicyEnum;
  /**
   * Security groups Organization ID.
   * @type {string}
   * @memberof SetSecurityGroupRequest
   */
  organization?: string;
  /**
   * Security group Project ID.
   * @type {string}
   * @memberof SetSecurityGroupRequest
   */
  project?: string;
  /**
   * Please use project_default instead.
   * @type {boolean}
   * @memberof SetSecurityGroupRequest
   * @deprecated
   */
  organization_default?: boolean;
  /**
   * True use this security group for future Instances created in this project.
   * @type {boolean}
   * @memberof SetSecurityGroupRequest
   */
  project_default?: boolean;
  /**
   * Instances attached to this security group.
   * @type {Array<ScalewayInstanceV1ServerSummary>}
   * @memberof SetSecurityGroupRequest
   */
  servers?: Array<ScalewayInstanceV1ServerSummary>;
  /**
   * True to set the security group as stateful.
   * @type {boolean}
   * @memberof SetSecurityGroupRequest
   */
  stateful?: boolean;
}

export const SetSecurityGroupRequestInboundDefaultPolicyEnum = {
  UnknownPolicy: 'unknown_policy',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type SetSecurityGroupRequestInboundDefaultPolicyEnum =
  (typeof SetSecurityGroupRequestInboundDefaultPolicyEnum)[keyof typeof SetSecurityGroupRequestInboundDefaultPolicyEnum];
export const SetSecurityGroupRequestOutboundDefaultPolicyEnum = {
  UnknownPolicy: 'unknown_policy',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type SetSecurityGroupRequestOutboundDefaultPolicyEnum =
  (typeof SetSecurityGroupRequestOutboundDefaultPolicyEnum)[keyof typeof SetSecurityGroupRequestOutboundDefaultPolicyEnum];

/**
 *
 * @export
 * @interface SetSecurityGroupRuleRequest
 */
export interface SetSecurityGroupRuleRequest {
  /**
   *
   * @type {string}
   * @memberof SetSecurityGroupRuleRequest
   */
  id?: string;
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRuleProtocol}
   * @memberof SetSecurityGroupRuleRequest
   */
  protocol?: ScalewayInstanceV1SecurityGroupRuleProtocol;
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRuleDirection}
   * @memberof SetSecurityGroupRuleRequest
   */
  direction?: ScalewayInstanceV1SecurityGroupRuleDirection;
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupRuleAction}
   * @memberof SetSecurityGroupRuleRequest
   */
  action?: ScalewayInstanceV1SecurityGroupRuleAction;
  /**
   * (IP network)
   * @type {string}
   * @memberof SetSecurityGroupRuleRequest
   */
  ip_range?: string;
  /**
   *
   * @type {number}
   * @memberof SetSecurityGroupRuleRequest
   */
  dest_port_from?: number;
  /**
   *
   * @type {number}
   * @memberof SetSecurityGroupRuleRequest
   */
  dest_port_to?: number;
  /**
   *
   * @type {number}
   * @memberof SetSecurityGroupRuleRequest
   */
  position?: number;
  /**
   *
   * @type {boolean}
   * @memberof SetSecurityGroupRuleRequest
   */
  editable?: boolean;
}

/**
 *
 * @export
 * @interface SetSecurityGroupRulesRequest
 */
export interface SetSecurityGroupRulesRequest {
  /**
   * List of rules to update in the security group.
   * @type {Array<ScalewayInstanceV1SetSecurityGroupRulesRequestRule>}
   * @memberof SetSecurityGroupRulesRequest
   */
  rules?: Array<ScalewayInstanceV1SetSecurityGroupRulesRequestRule>;
}
/**
 *
 * @export
 * @interface SetSnapshotRequest
 */
export interface SetSnapshotRequest {
  /**
   *
   * @type {string}
   * @memberof SetSnapshotRequest
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof SetSnapshotRequest
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof SetSnapshotRequest
   */
  organization?: string;
  /**
   *
   * @type {ScalewayInstanceV1VolumeVolumeType}
   * @memberof SetSnapshotRequest
   */
  volume_type?: ScalewayInstanceV1VolumeVolumeType;
  /**
   * (in bytes)
   * @type {number}
   * @memberof SetSnapshotRequest
   */
  size?: number;
  /**
   *
   * @type {ScalewayInstanceV1SnapshotState}
   * @memberof SetSnapshotRequest
   */
  state?: ScalewayInstanceV1SnapshotState;
  /**
   *
   * @type {ScalewayInstanceV1SnapshotBaseVolume}
   * @memberof SetSnapshotRequest
   */
  base_volume?: ScalewayInstanceV1SnapshotBaseVolume;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof SetSnapshotRequest
   */
  creation_date?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof SetSnapshotRequest
   */
  modification_date?: string;
  /**
   *
   * @type {string}
   * @memberof SetSnapshotRequest
   */
  project?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof SetSnapshotRequest
   */
  tags?: Array<string>;
}

/**
 *
 * @export
 * @interface SetVolumeRequest
 */
export interface SetVolumeRequest {
  /**
   * Name of the volume.
   * @type {string}
   * @memberof SetVolumeRequest
   */
  name?: string;
  /**
   * Tags of the volume.
   * @type {Array<string>}
   * @memberof SetVolumeRequest
   */
  tags?: Array<string>;
  /**
   * NBD export URI of the Volume (deprecated, this field is ignored).
   * @type {string}
   * @memberof SetVolumeRequest
   * @deprecated
   */
  export_uri?: string;
  /**
   * Volume\'s disk size, must be a multiple of 512. (in bytes)
   * @type {number}
   * @memberof SetVolumeRequest
   */
  size?: number;
  /**
   * Volume type.
   * @type {string}
   * @memberof SetVolumeRequest
   */
  volume_type?: SetVolumeRequestVolumeTypeEnum;
  /**
   * Volume creation date. (RFC 3339 format)
   * @type {string}
   * @memberof SetVolumeRequest
   */
  creation_date?: string;
  /**
   * Volume modification date. (RFC 3339 format)
   * @type {string}
   * @memberof SetVolumeRequest
   */
  modification_date?: string;
  /**
   * Volume Organization ID.
   * @type {string}
   * @memberof SetVolumeRequest
   */
  organization?: string;
  /**
   * Volume Project ID.
   * @type {string}
   * @memberof SetVolumeRequest
   */
  project?: string;
  /**
   *
   * @type {SetVolumeRequestServer}
   * @memberof SetVolumeRequest
   */
  server?: SetVolumeRequestServer;
  /**
   * Volume state.
   * @type {string}
   * @memberof SetVolumeRequest
   */
  state?: SetVolumeRequestStateEnum;
}

export const SetVolumeRequestVolumeTypeEnum = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;

export type SetVolumeRequestVolumeTypeEnum =
  (typeof SetVolumeRequestVolumeTypeEnum)[keyof typeof SetVolumeRequestVolumeTypeEnum];
export const SetVolumeRequestStateEnum = {
  Available: 'available',
  Snapshotting: 'snapshotting',
  Fetching: 'fetching',
  Saving: 'saving',
  Attaching: 'attaching',
  Resizing: 'resizing',
  Hotsyncing: 'hotsyncing',
  Error: 'error',
} as const;

export type SetVolumeRequestStateEnum =
  (typeof SetVolumeRequestStateEnum)[keyof typeof SetVolumeRequestStateEnum];

/**
 * Instance attached to the volume.
 * @export
 * @interface SetVolumeRequestServer
 */
export interface SetVolumeRequestServer {
  /**
   *
   * @type {string}
   * @memberof SetVolumeRequestServer
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof SetVolumeRequestServer
   */
  name?: string;
}
/**
 *
 * @export
 * @interface UpdateImageRequest
 */
export interface UpdateImageRequest {
  /**
   * Name of the image.
   * @type {string}
   * @memberof UpdateImageRequest
   */
  name?: string;
  /**
   * Architecture of the image.
   * @type {string}
   * @memberof UpdateImageRequest
   */
  arch?: UpdateImageRequestArchEnum;
  /**
   *
   * @type {UpdateImageRequestExtraVolumes}
   * @memberof UpdateImageRequest
   */
  extra_volumes?: UpdateImageRequestExtraVolumes;
  /**
   * Tags of the image.
   * @type {Array<string>}
   * @memberof UpdateImageRequest
   */
  tags?: Array<string>;
  /**
   * True to set the image as public.
   * @type {boolean}
   * @memberof UpdateImageRequest
   */
  public?: boolean;
}

export const UpdateImageRequestArchEnum = {
  UnknownArch: 'unknown_arch',
  X8664: 'x86_64',
  Arm: 'arm',
  Arm64: 'arm64',
} as const;

export type UpdateImageRequestArchEnum =
  (typeof UpdateImageRequestArchEnum)[keyof typeof UpdateImageRequestArchEnum];

/**
 * Additional snapshots of the image, with extra_volumeKey being the position of the snapshot in the image.
 * @export
 * @interface UpdateImageRequestExtraVolumes
 */
export interface UpdateImageRequestExtraVolumes {
  [key: string]: any;

  /**
   *
   * @type {UpdateImageRequestExtraVolumesExtraVolumeKey}
   * @memberof UpdateImageRequestExtraVolumes
   */
  '&lt;extra_volumeKey&gt;'?: UpdateImageRequestExtraVolumesExtraVolumeKey;
}
/**
 * Additional snapshots of the image, with extra_volumeKey being the position of the snapshot in the image.
 * @export
 * @interface UpdateImageRequestExtraVolumesExtraVolumeKey
 */
export interface UpdateImageRequestExtraVolumesExtraVolumeKey {
  /**
   * UUID of the snapshot. (UUID format)
   * @type {string}
   * @memberof UpdateImageRequestExtraVolumesExtraVolumeKey
   */
  id: string;
}
/**
 *
 * @export
 * @interface UpdateIpRequest
 */
export interface UpdateIpRequest {
  /**
   * Reverse domain name.
   * @type {string}
   * @memberof UpdateIpRequest
   */
  reverse?: string;
  /**
   * Should have no effect.
   * @type {string}
   * @memberof UpdateIpRequest
   */
  type?: UpdateIpRequestTypeEnum;
  /**
   * An array of keywords you want to tag this IP with.
   * @type {Array<string>}
   * @memberof UpdateIpRequest
   */
  tags?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof UpdateIpRequest
   */
  server?: string;
}

export const UpdateIpRequestTypeEnum = {
  UnknownIptype: 'unknown_iptype',
  RoutedIpv4: 'routed_ipv4',
  RoutedIpv6: 'routed_ipv6',
} as const;

export type UpdateIpRequestTypeEnum =
  (typeof UpdateIpRequestTypeEnum)[keyof typeof UpdateIpRequestTypeEnum];

/**
 *
 * @export
 * @interface UpdatePlacementGroupRequest
 */
export interface UpdatePlacementGroupRequest {
  /**
   * Name of the placement group.
   * @type {string}
   * @memberof UpdatePlacementGroupRequest
   */
  name?: string;
  /**
   * Tags of the placement group.
   * @type {Array<string>}
   * @memberof UpdatePlacementGroupRequest
   */
  tags?: Array<string>;
  /**
   * Operating mode of the placement group.
   * @type {string}
   * @memberof UpdatePlacementGroupRequest
   */
  policy_mode?: UpdatePlacementGroupRequestPolicyModeEnum;
  /**
   * Policy type of the placement group.
   * @type {string}
   * @memberof UpdatePlacementGroupRequest
   */
  policy_type?: UpdatePlacementGroupRequestPolicyTypeEnum;
}

export const UpdatePlacementGroupRequestPolicyModeEnum = {
  Optional: 'optional',
  Enforced: 'enforced',
} as const;

export type UpdatePlacementGroupRequestPolicyModeEnum =
  (typeof UpdatePlacementGroupRequestPolicyModeEnum)[keyof typeof UpdatePlacementGroupRequestPolicyModeEnum];
export const UpdatePlacementGroupRequestPolicyTypeEnum = {
  MaxAvailability: 'max_availability',
  LowLatency: 'low_latency',
} as const;

export type UpdatePlacementGroupRequestPolicyTypeEnum =
  (typeof UpdatePlacementGroupRequestPolicyTypeEnum)[keyof typeof UpdatePlacementGroupRequestPolicyTypeEnum];

/**
 *
 * @export
 * @interface UpdatePrivateNICRequest
 */
export interface UpdatePrivateNICRequest {
  /**
   * Tags used to select private NIC/s.
   * @type {Array<string>}
   * @memberof UpdatePrivateNICRequest
   */
  tags?: Array<string>;
}
/**
 *
 * @export
 * @interface UpdateSecurityGroupRequest
 */
export interface UpdateSecurityGroupRequest {
  /**
   * Name of the security group.
   * @type {string}
   * @memberof UpdateSecurityGroupRequest
   */
  name?: string;
  /**
   * Description of the security group.
   * @type {string}
   * @memberof UpdateSecurityGroupRequest
   */
  description?: string;
  /**
   * True to block SMTP on IPv4 and IPv6. This feature is read only, please open a support ticket if you need to make it configurable.
   * @type {boolean}
   * @memberof UpdateSecurityGroupRequest
   */
  enable_default_security?: boolean;
  /**
   * Default inbound policy.
   * @type {string}
   * @memberof UpdateSecurityGroupRequest
   */
  inbound_default_policy?: UpdateSecurityGroupRequestInboundDefaultPolicyEnum;
  /**
   * Tags of the security group.
   * @type {Array<string>}
   * @memberof UpdateSecurityGroupRequest
   */
  tags?: Array<string>;
  /**
   * Please use project_default instead.
   * @type {boolean}
   * @memberof UpdateSecurityGroupRequest
   * @deprecated
   */
  organization_default?: boolean;
  /**
   * True use this security group for future Instances created in this project.
   * @type {boolean}
   * @memberof UpdateSecurityGroupRequest
   */
  project_default?: boolean;
  /**
   * Default outbound policy.
   * @type {string}
   * @memberof UpdateSecurityGroupRequest
   */
  outbound_default_policy?: UpdateSecurityGroupRequestOutboundDefaultPolicyEnum;
  /**
   * True to set the security group as stateful.
   * @type {boolean}
   * @memberof UpdateSecurityGroupRequest
   */
  stateful?: boolean;
}

export const UpdateSecurityGroupRequestInboundDefaultPolicyEnum = {
  UnknownPolicy: 'unknown_policy',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type UpdateSecurityGroupRequestInboundDefaultPolicyEnum =
  (typeof UpdateSecurityGroupRequestInboundDefaultPolicyEnum)[keyof typeof UpdateSecurityGroupRequestInboundDefaultPolicyEnum];
export const UpdateSecurityGroupRequestOutboundDefaultPolicyEnum = {
  UnknownPolicy: 'unknown_policy',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type UpdateSecurityGroupRequestOutboundDefaultPolicyEnum =
  (typeof UpdateSecurityGroupRequestOutboundDefaultPolicyEnum)[keyof typeof UpdateSecurityGroupRequestOutboundDefaultPolicyEnum];

/**
 *
 * @export
 * @interface UpdateSecurityGroupRuleRequest
 */
export interface UpdateSecurityGroupRuleRequest {
  /**
   * Protocol family this rule applies to.
   * @type {string}
   * @memberof UpdateSecurityGroupRuleRequest
   */
  protocol?: UpdateSecurityGroupRuleRequestProtocolEnum;
  /**
   * Direction the rule applies to.
   * @type {string}
   * @memberof UpdateSecurityGroupRuleRequest
   */
  direction?: UpdateSecurityGroupRuleRequestDirectionEnum;
  /**
   * Action to apply when the rule matches a packet.
   * @type {string}
   * @memberof UpdateSecurityGroupRuleRequest
   */
  action?: UpdateSecurityGroupRuleRequestActionEnum;
  /**
   * Range of IP addresses these rules apply to. (IP network)
   * @type {string}
   * @memberof UpdateSecurityGroupRuleRequest
   */
  ip_range?: string;
  /**
   * Beginning of the range of ports this rule applies to (inclusive). If 0 is provided, unset the parameter.
   * @type {number}
   * @memberof UpdateSecurityGroupRuleRequest
   */
  dest_port_from?: number;
  /**
   * End of the range of ports this rule applies to (inclusive). If 0 is provided, unset the parameter.
   * @type {number}
   * @memberof UpdateSecurityGroupRuleRequest
   */
  dest_port_to?: number;
  /**
   * Position of this rule in the security group rules list.
   * @type {number}
   * @memberof UpdateSecurityGroupRuleRequest
   */
  position?: number;
}

export const UpdateSecurityGroupRuleRequestProtocolEnum = {
  UnknownProtocol: 'unknown_protocol',
  Tcp: 'TCP',
  Udp: 'UDP',
  Icmp: 'ICMP',
  Any: 'ANY',
} as const;

export type UpdateSecurityGroupRuleRequestProtocolEnum =
  (typeof UpdateSecurityGroupRuleRequestProtocolEnum)[keyof typeof UpdateSecurityGroupRuleRequestProtocolEnum];
export const UpdateSecurityGroupRuleRequestDirectionEnum = {
  UnknownDirection: 'unknown_direction',
  Inbound: 'inbound',
  Outbound: 'outbound',
} as const;

export type UpdateSecurityGroupRuleRequestDirectionEnum =
  (typeof UpdateSecurityGroupRuleRequestDirectionEnum)[keyof typeof UpdateSecurityGroupRuleRequestDirectionEnum];
export const UpdateSecurityGroupRuleRequestActionEnum = {
  UnknownAction: 'unknown_action',
  Accept: 'accept',
  Drop: 'drop',
} as const;

export type UpdateSecurityGroupRuleRequestActionEnum =
  (typeof UpdateSecurityGroupRuleRequestActionEnum)[keyof typeof UpdateSecurityGroupRuleRequestActionEnum];

/**
 *
 * @export
 * @interface UpdateServerRequest
 */
export interface UpdateServerRequest {
  /**
   * Name of the Instance.
   * @type {string}
   * @memberof UpdateServerRequest
   */
  name?: string;
  /**
   *
   * @type {ScalewayInstanceV1BootType}
   * @memberof UpdateServerRequest
   */
  boot_type?: ScalewayInstanceV1BootType;
  /**
   * Tags of the Instance.
   * @type {Array<string>}
   * @memberof UpdateServerRequest
   */
  tags?: Array<string>;
  /**
   *
   * @type {UpdateServerRequestVolumes}
   * @memberof UpdateServerRequest
   */
  volumes?: UpdateServerRequestVolumes;
  /**
   *
   * @type {boolean}
   * @memberof UpdateServerRequest
   */
  dynamic_ip_required?: boolean;
  /**
   * True to configure the instance so it uses the new routed IP mode (once this is set to True you cannot set it back to False).
   * @type {boolean}
   * @memberof UpdateServerRequest
   * @deprecated
   */
  routed_ip_enabled?: boolean;
  /**
   * A list of reserved IP IDs to attach to the Instance.
   * @type {Array<string>}
   * @memberof UpdateServerRequest
   */
  public_ips?: Array<string>;
  /**
   *
   * @type {boolean}
   * @memberof UpdateServerRequest
   */
  enable_ipv6?: boolean;
  /**
   * True to activate server protection option.
   * @type {boolean}
   * @memberof UpdateServerRequest
   */
  protected?: boolean;
  /**
   *
   * @type {ScalewayInstanceV1SecurityGroupTemplate}
   * @memberof UpdateServerRequest
   */
  security_group?: ScalewayInstanceV1SecurityGroupTemplate;
  /**
   * Placement group ID if Instance must be part of a placement group.
   * @type {string}
   * @memberof UpdateServerRequest
   */
  placement_group?: string;
  /**
   * Instance private NICs.
   * @type {Array<string>}
   * @memberof UpdateServerRequest
   */
  private_nics?: Array<string>;
  /**
   * Set the commercial_type for this Instance. Warning: This field has some restrictions: - Cannot be changed if the Instance is not in `stopped` state. - Cannot be changed if the Instance is in a placement group. - Cannot be changed from/to a Windows offer to/from a Linux offer. - Local storage requirements of the target commercial_types must be fulfilled (i.e. if an Instance has 80GB of local storage, it can be changed into a GP1-XS, which has a maximum of 150GB, but it cannot be changed into a DEV1-S, which has only 20GB).
   * @type {string}
   * @memberof UpdateServerRequest
   */
  commercial_type?: string;
  /**
   * UUID of the SSH RSA key that will be used to encrypt the initial admin password for OS requiring it. Mandatory for Windows OS. The public_key value of this key is used to encrypt the admin password. When set to an empty string, reset this value and admin_password_encrypted_value to an empty string so a new password may be generated.
   * @type {string}
   * @memberof UpdateServerRequest
   */
  admin_password_encryption_ssh_key_id?: string;
}

/**
 *
 * @export
 * @interface UpdateServerRequestVolumes
 */
export interface UpdateServerRequestVolumes {
  [key: string]: any;

  /**
   *
   * @type {ScalewayInstanceV1VolumeServerTemplate}
   * @memberof UpdateServerRequestVolumes
   */
  '&lt;volumeKey&gt;'?: ScalewayInstanceV1VolumeServerTemplate;
}
/**
 *
 * @export
 * @interface UpdateSnapshotRequest
 */
export interface UpdateSnapshotRequest {
  /**
   * Name of the snapshot.
   * @type {string}
   * @memberof UpdateSnapshotRequest
   */
  name?: string;
  /**
   * Tags of the snapshot.
   * @type {Array<string>}
   * @memberof UpdateSnapshotRequest
   */
  tags?: Array<string>;
}
/**
 *
 * @export
 * @interface UpdateVolumeRequest
 */
export interface UpdateVolumeRequest {
  /**
   * Volume name.
   * @type {string}
   * @memberof UpdateVolumeRequest
   */
  name?: string;
  /**
   * Tags of the volume.
   * @type {Array<string>}
   * @memberof UpdateVolumeRequest
   */
  tags?: Array<string>;
  /**
   * Volume disk size, must be a multiple of 512. (in bytes)
   * @type {number}
   * @memberof UpdateVolumeRequest
   */
  size?: number;
}

/**
 * DefaultApi - axios parameter creator
 * @export
 */
export const DefaultApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     *
     * @param {CheckBlockMigrationOrganizationQuotasZoneEnum} zone The zone you want to target
     * @param {CheckBlockMigrationOrganizationQuotasRequest} checkBlockMigrationOrganizationQuotasRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    checkBlockMigrationOrganizationQuotas: async (
      zone: CheckBlockMigrationOrganizationQuotasZoneEnum,
      checkBlockMigrationOrganizationQuotasRequest: CheckBlockMigrationOrganizationQuotasRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('checkBlockMigrationOrganizationQuotas', 'zone', zone);
      // verify required parameter 'checkBlockMigrationOrganizationQuotasRequest' is not null or undefined
      assertParamExists(
        'checkBlockMigrationOrganizationQuotas',
        'checkBlockMigrationOrganizationQuotasRequest',
        checkBlockMigrationOrganizationQuotasRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/block-migration/check-organization-quotas`.replace(
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
        checkBlockMigrationOrganizationQuotasRequest,
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
     * @param {GetDashboardZoneEnum} zone The zone you want to target
     * @param {string} [organization]
     * @param {string} [project]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getDashboard: async (
      zone: GetDashboardZoneEnum,
      organization?: string,
      project?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getDashboard', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/dashboard`.replace(
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

      if (organization !== undefined) {
        localVarQueryParameter['organization'] = organization;
      }

      if (project !== undefined) {
        localVarQueryParameter['project'] = project;
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
 * DefaultApi - functional programming interface
 * @export
 */
export const DefaultApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = DefaultApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @param {CheckBlockMigrationOrganizationQuotasZoneEnum} zone The zone you want to target
     * @param {CheckBlockMigrationOrganizationQuotasRequest} checkBlockMigrationOrganizationQuotasRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async checkBlockMigrationOrganizationQuotas(
      zone: CheckBlockMigrationOrganizationQuotasZoneEnum,
      checkBlockMigrationOrganizationQuotasRequest: CheckBlockMigrationOrganizationQuotasRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.checkBlockMigrationOrganizationQuotas(
          zone,
          checkBlockMigrationOrganizationQuotasRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'DefaultApi.checkBlockMigrationOrganizationQuotas'
        ]?.[localVarOperationServerIndex]?.url;
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
     * @param {GetDashboardZoneEnum} zone The zone you want to target
     * @param {string} [organization]
     * @param {string} [project]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getDashboard(
      zone: GetDashboardZoneEnum,
      organization?: string,
      project?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetDashboardResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getDashboard(
        zone,
        organization,
        project,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DefaultApi.getDashboard']?.[
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
 * DefaultApi - factory interface
 * @export
 */
export const DefaultApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = DefaultApiFp(configuration);
  return {
    /**
     *
     * @param {CheckBlockMigrationOrganizationQuotasZoneEnum} zone The zone you want to target
     * @param {CheckBlockMigrationOrganizationQuotasRequest} checkBlockMigrationOrganizationQuotasRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    checkBlockMigrationOrganizationQuotas(
      zone: CheckBlockMigrationOrganizationQuotasZoneEnum,
      checkBlockMigrationOrganizationQuotasRequest: CheckBlockMigrationOrganizationQuotasRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .checkBlockMigrationOrganizationQuotas(
          zone,
          checkBlockMigrationOrganizationQuotasRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {GetDashboardZoneEnum} zone The zone you want to target
     * @param {string} [organization]
     * @param {string} [project]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getDashboard(
      zone: GetDashboardZoneEnum,
      organization?: string,
      project?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetDashboardResponse> {
      return localVarFp
        .getDashboard(zone, organization, project, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * DefaultApi - interface
 * @export
 * @interface DefaultApi
 */
export interface DefaultApiInterface {
  /**
   *
   * @param {CheckBlockMigrationOrganizationQuotasZoneEnum} zone The zone you want to target
   * @param {CheckBlockMigrationOrganizationQuotasRequest} checkBlockMigrationOrganizationQuotasRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  checkBlockMigrationOrganizationQuotas(
    zone: CheckBlockMigrationOrganizationQuotasZoneEnum,
    checkBlockMigrationOrganizationQuotasRequest: CheckBlockMigrationOrganizationQuotasRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   *
   * @param {GetDashboardZoneEnum} zone The zone you want to target
   * @param {string} [organization]
   * @param {string} [project]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  getDashboard(
    zone: GetDashboardZoneEnum,
    organization?: string,
    project?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetDashboardResponse>;
}

/**
 * DefaultApi - object-oriented interface
 * @export
 * @class DefaultApi
 * @extends {BaseAPI}
 */
export class DefaultApi extends BaseAPI implements DefaultApiInterface {
  /**
   *
   * @param {CheckBlockMigrationOrganizationQuotasZoneEnum} zone The zone you want to target
   * @param {CheckBlockMigrationOrganizationQuotasRequest} checkBlockMigrationOrganizationQuotasRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public checkBlockMigrationOrganizationQuotas(
    zone: CheckBlockMigrationOrganizationQuotasZoneEnum,
    checkBlockMigrationOrganizationQuotasRequest: CheckBlockMigrationOrganizationQuotasRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DefaultApiFp(this.configuration)
      .checkBlockMigrationOrganizationQuotas(
        zone,
        checkBlockMigrationOrganizationQuotasRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {GetDashboardZoneEnum} zone The zone you want to target
   * @param {string} [organization]
   * @param {string} [project]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public getDashboard(
    zone: GetDashboardZoneEnum,
    organization?: string,
    project?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return DefaultApiFp(this.configuration)
      .getDashboard(zone, organization, project, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CheckBlockMigrationOrganizationQuotasZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CheckBlockMigrationOrganizationQuotasZoneEnum =
  (typeof CheckBlockMigrationOrganizationQuotasZoneEnum)[keyof typeof CheckBlockMigrationOrganizationQuotasZoneEnum];
/**
 * @export
 */
export const GetDashboardZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetDashboardZoneEnum =
  (typeof GetDashboardZoneEnum)[keyof typeof GetDashboardZoneEnum];

/**
 * IPsApi - axios parameter creator
 * @export
 */
export const IPsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Reserve a flexible IP and attach it to the specified Instance.
     * @summary Reserve a flexible IP
     * @param {CreateIpZoneEnum} zone The zone you want to target
     * @param {CreateIpRequest} createIpRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createIp: async (
      zone: CreateIpZoneEnum,
      createIpRequest: CreateIpRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createIp', 'zone', zone);
      // verify required parameter 'createIpRequest' is not null or undefined
      assertParamExists('createIp', 'createIpRequest', createIpRequest);
      const localVarPath = `/instance/v1/zones/{zone}/ips`.replace(
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
        createIpRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete the IP with the specified ID.
     * @summary Delete a flexible IP
     * @param {DeleteIpZoneEnum} zone The zone you want to target
     * @param {string} ip ID or address of the IP to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteIp: async (
      zone: DeleteIpZoneEnum,
      ip: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteIp', 'zone', zone);
      // verify required parameter 'ip' is not null or undefined
      assertParamExists('deleteIp', 'ip', ip);
      const localVarPath = `/instance/v1/zones/{zone}/ips/{ip}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'ip'}}`, encodeURIComponent(String(ip)));
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
     * Get details of an IP with the specified ID or address.
     * @summary Get a flexible IP
     * @param {GetIpZoneEnum} zone The zone you want to target
     * @param {string} ip IP ID or address to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getIp: async (
      zone: GetIpZoneEnum,
      ip: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getIp', 'zone', zone);
      // verify required parameter 'ip' is not null or undefined
      assertParamExists('getIp', 'ip', ip);
      const localVarPath = `/instance/v1/zones/{zone}/ips/{ip}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'ip'}}`, encodeURIComponent(String(ip)));
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
     * List all flexible IPs in a specified zone.
     * @summary List all flexible IPs
     * @param {ListIpsZoneEnum} zone The zone you want to target
     * @param {string} [project] Project ID in which the IPs are reserved.
     * @param {string} [organization] Organization ID in which the IPs are reserved.
     * @param {string} [tags] Filter IPs with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [name] Filter on the IP address (Works as a LIKE operation on the IP address).
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [type] Filter on the IP Mobility IP type (whose value should be either \&#39;routed_ipv4\&#39; or \&#39;routed_ipv6\&#39;).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listIps: async (
      zone: ListIpsZoneEnum,
      project?: string,
      organization?: string,
      tags?: string,
      name?: string,
      perPage?: number,
      page?: number,
      type?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listIps', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/ips`.replace(
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

      if (project !== undefined) {
        localVarQueryParameter['project'] = project;
      }

      if (organization !== undefined) {
        localVarQueryParameter['organization'] = organization;
      }

      if (tags !== undefined) {
        localVarQueryParameter['tags'] = tags;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (type !== undefined) {
        localVarQueryParameter['type'] = type;
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
     * **The IP remains available in IPAM**, which means that it is still reserved by the Organization, and can be reattached to another resource (Instance or other product).
     * @summary Releases the reserved IP without deleting the reservation.
     * @param {ReleaseIpToIpamZoneEnum} zone The zone you want to target
     * @param {string} ipId ID of the IP you want to release from the Instance but retain in IPAM.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    releaseIpToIpam: async (
      zone: ReleaseIpToIpamZoneEnum,
      ipId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('releaseIpToIpam', 'zone', zone);
      // verify required parameter 'ipId' is not null or undefined
      assertParamExists('releaseIpToIpam', 'ipId', ipId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('releaseIpToIpam', 'body', body);
      const localVarPath =
        `/instance/v1/zones/{zone}/ips/{ip_id}/release-to-ipam`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'ip_id'}}`, encodeURIComponent(String(ipId)));
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
     * Update a flexible IP in the specified zone with the specified ID.
     * @summary Update a flexible IP
     * @param {UpdateIpZoneEnum} zone The zone you want to target
     * @param {string} ip IP ID or IP address.
     * @param {UpdateIpRequest} updateIpRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateIp: async (
      zone: UpdateIpZoneEnum,
      ip: string,
      updateIpRequest: UpdateIpRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateIp', 'zone', zone);
      // verify required parameter 'ip' is not null or undefined
      assertParamExists('updateIp', 'ip', ip);
      // verify required parameter 'updateIpRequest' is not null or undefined
      assertParamExists('updateIp', 'updateIpRequest', updateIpRequest);
      const localVarPath = `/instance/v1/zones/{zone}/ips/{ip}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'ip'}}`, encodeURIComponent(String(ip)));
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
        updateIpRequest,
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
 * IPsApi - functional programming interface
 * @export
 */
export const IPsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = IPsApiAxiosParamCreator(configuration);
  return {
    /**
     * Reserve a flexible IP and attach it to the specified Instance.
     * @summary Reserve a flexible IP
     * @param {CreateIpZoneEnum} zone The zone you want to target
     * @param {CreateIpRequest} createIpRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createIp(
      zone: CreateIpZoneEnum,
      createIpRequest: CreateIpRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1CreateIpResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createIp(
        zone,
        createIpRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['IPsApi.createIp']?.[localVarOperationServerIndex]
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
     * Delete the IP with the specified ID.
     * @summary Delete a flexible IP
     * @param {DeleteIpZoneEnum} zone The zone you want to target
     * @param {string} ip ID or address of the IP to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteIp(
      zone: DeleteIpZoneEnum,
      ip: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteIp(
        zone,
        ip,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['IPsApi.deleteIp']?.[localVarOperationServerIndex]
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
     * Get details of an IP with the specified ID or address.
     * @summary Get a flexible IP
     * @param {GetIpZoneEnum} zone The zone you want to target
     * @param {string} ip IP ID or address to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getIp(
      zone: GetIpZoneEnum,
      ip: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetIpResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getIp(
        zone,
        ip,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['IPsApi.getIp']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * List all flexible IPs in a specified zone.
     * @summary List all flexible IPs
     * @param {ListIpsZoneEnum} zone The zone you want to target
     * @param {string} [project] Project ID in which the IPs are reserved.
     * @param {string} [organization] Organization ID in which the IPs are reserved.
     * @param {string} [tags] Filter IPs with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [name] Filter on the IP address (Works as a LIKE operation on the IP address).
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [type] Filter on the IP Mobility IP type (whose value should be either \&#39;routed_ipv4\&#39; or \&#39;routed_ipv6\&#39;).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listIps(
      zone: ListIpsZoneEnum,
      project?: string,
      organization?: string,
      tags?: string,
      name?: string,
      perPage?: number,
      page?: number,
      type?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListIpsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listIps(
        zone,
        project,
        organization,
        tags,
        name,
        perPage,
        page,
        type,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['IPsApi.listIps']?.[localVarOperationServerIndex]
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
     * **The IP remains available in IPAM**, which means that it is still reserved by the Organization, and can be reattached to another resource (Instance or other product).
     * @summary Releases the reserved IP without deleting the reservation.
     * @param {ReleaseIpToIpamZoneEnum} zone The zone you want to target
     * @param {string} ipId ID of the IP you want to release from the Instance but retain in IPAM.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async releaseIpToIpam(
      zone: ReleaseIpToIpamZoneEnum,
      ipId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.releaseIpToIpam(
        zone,
        ipId,
        body,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['IPsApi.releaseIpToIpam']?.[
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
     * Update a flexible IP in the specified zone with the specified ID.
     * @summary Update a flexible IP
     * @param {UpdateIpZoneEnum} zone The zone you want to target
     * @param {string} ip IP ID or IP address.
     * @param {UpdateIpRequest} updateIpRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateIp(
      zone: UpdateIpZoneEnum,
      ip: string,
      updateIpRequest: UpdateIpRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1UpdateIpResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateIp(
        zone,
        ip,
        updateIpRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['IPsApi.updateIp']?.[localVarOperationServerIndex]
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
 * IPsApi - factory interface
 * @export
 */
export const IPsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = IPsApiFp(configuration);
  return {
    /**
     * Reserve a flexible IP and attach it to the specified Instance.
     * @summary Reserve a flexible IP
     * @param {CreateIpZoneEnum} zone The zone you want to target
     * @param {CreateIpRequest} createIpRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createIp(
      zone: CreateIpZoneEnum,
      createIpRequest: CreateIpRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1CreateIpResponse> {
      return localVarFp
        .createIp(zone, createIpRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete the IP with the specified ID.
     * @summary Delete a flexible IP
     * @param {DeleteIpZoneEnum} zone The zone you want to target
     * @param {string} ip ID or address of the IP to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteIp(
      zone: DeleteIpZoneEnum,
      ip: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteIp(zone, ip, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get details of an IP with the specified ID or address.
     * @summary Get a flexible IP
     * @param {GetIpZoneEnum} zone The zone you want to target
     * @param {string} ip IP ID or address to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getIp(
      zone: GetIpZoneEnum,
      ip: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetIpResponse> {
      return localVarFp
        .getIp(zone, ip, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all flexible IPs in a specified zone.
     * @summary List all flexible IPs
     * @param {ListIpsZoneEnum} zone The zone you want to target
     * @param {string} [project] Project ID in which the IPs are reserved.
     * @param {string} [organization] Organization ID in which the IPs are reserved.
     * @param {string} [tags] Filter IPs with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [name] Filter on the IP address (Works as a LIKE operation on the IP address).
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [type] Filter on the IP Mobility IP type (whose value should be either \&#39;routed_ipv4\&#39; or \&#39;routed_ipv6\&#39;).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listIps(
      zone: ListIpsZoneEnum,
      project?: string,
      organization?: string,
      tags?: string,
      name?: string,
      perPage?: number,
      page?: number,
      type?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListIpsResponse> {
      return localVarFp
        .listIps(
          zone,
          project,
          organization,
          tags,
          name,
          perPage,
          page,
          type,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * **The IP remains available in IPAM**, which means that it is still reserved by the Organization, and can be reattached to another resource (Instance or other product).
     * @summary Releases the reserved IP without deleting the reservation.
     * @param {ReleaseIpToIpamZoneEnum} zone The zone you want to target
     * @param {string} ipId ID of the IP you want to release from the Instance but retain in IPAM.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    releaseIpToIpam(
      zone: ReleaseIpToIpamZoneEnum,
      ipId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .releaseIpToIpam(zone, ipId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update a flexible IP in the specified zone with the specified ID.
     * @summary Update a flexible IP
     * @param {UpdateIpZoneEnum} zone The zone you want to target
     * @param {string} ip IP ID or IP address.
     * @param {UpdateIpRequest} updateIpRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateIp(
      zone: UpdateIpZoneEnum,
      ip: string,
      updateIpRequest: UpdateIpRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1UpdateIpResponse> {
      return localVarFp
        .updateIp(zone, ip, updateIpRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * IPsApi - interface
 * @export
 * @interface IPsApi
 */
export interface IPsApiInterface {
  /**
   * Reserve a flexible IP and attach it to the specified Instance.
   * @summary Reserve a flexible IP
   * @param {CreateIpZoneEnum} zone The zone you want to target
   * @param {CreateIpRequest} createIpRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApiInterface
   */
  createIp(
    zone: CreateIpZoneEnum,
    createIpRequest: CreateIpRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1CreateIpResponse>;

  /**
   * Delete the IP with the specified ID.
   * @summary Delete a flexible IP
   * @param {DeleteIpZoneEnum} zone The zone you want to target
   * @param {string} ip ID or address of the IP to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApiInterface
   */
  deleteIp(
    zone: DeleteIpZoneEnum,
    ip: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get details of an IP with the specified ID or address.
   * @summary Get a flexible IP
   * @param {GetIpZoneEnum} zone The zone you want to target
   * @param {string} ip IP ID or address to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApiInterface
   */
  getIp(
    zone: GetIpZoneEnum,
    ip: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetIpResponse>;

  /**
   * List all flexible IPs in a specified zone.
   * @summary List all flexible IPs
   * @param {ListIpsZoneEnum} zone The zone you want to target
   * @param {string} [project] Project ID in which the IPs are reserved.
   * @param {string} [organization] Organization ID in which the IPs are reserved.
   * @param {string} [tags] Filter IPs with these exact tags (to filter with several tags, use commas to separate them).
   * @param {string} [name] Filter on the IP address (Works as a LIKE operation on the IP address).
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {string} [type] Filter on the IP Mobility IP type (whose value should be either \&#39;routed_ipv4\&#39; or \&#39;routed_ipv6\&#39;).
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApiInterface
   */
  listIps(
    zone: ListIpsZoneEnum,
    project?: string,
    organization?: string,
    tags?: string,
    name?: string,
    perPage?: number,
    page?: number,
    type?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListIpsResponse>;

  /**
   * **The IP remains available in IPAM**, which means that it is still reserved by the Organization, and can be reattached to another resource (Instance or other product).
   * @summary Releases the reserved IP without deleting the reservation.
   * @param {ReleaseIpToIpamZoneEnum} zone The zone you want to target
   * @param {string} ipId ID of the IP you want to release from the Instance but retain in IPAM.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApiInterface
   */
  releaseIpToIpam(
    zone: ReleaseIpToIpamZoneEnum,
    ipId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Update a flexible IP in the specified zone with the specified ID.
   * @summary Update a flexible IP
   * @param {UpdateIpZoneEnum} zone The zone you want to target
   * @param {string} ip IP ID or IP address.
   * @param {UpdateIpRequest} updateIpRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApiInterface
   */
  updateIp(
    zone: UpdateIpZoneEnum,
    ip: string,
    updateIpRequest: UpdateIpRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1UpdateIpResponse>;
}

/**
 * IPsApi - object-oriented interface
 * @export
 * @class IPsApi
 * @extends {BaseAPI}
 */
export class IPsApi extends BaseAPI implements IPsApiInterface {
  /**
   * Reserve a flexible IP and attach it to the specified Instance.
   * @summary Reserve a flexible IP
   * @param {CreateIpZoneEnum} zone The zone you want to target
   * @param {CreateIpRequest} createIpRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApi
   */
  public createIp(
    zone: CreateIpZoneEnum,
    createIpRequest: CreateIpRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return IPsApiFp(this.configuration)
      .createIp(zone, createIpRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete the IP with the specified ID.
   * @summary Delete a flexible IP
   * @param {DeleteIpZoneEnum} zone The zone you want to target
   * @param {string} ip ID or address of the IP to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApi
   */
  public deleteIp(
    zone: DeleteIpZoneEnum,
    ip: string,
    options?: RawAxiosRequestConfig,
  ) {
    return IPsApiFp(this.configuration)
      .deleteIp(zone, ip, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get details of an IP with the specified ID or address.
   * @summary Get a flexible IP
   * @param {GetIpZoneEnum} zone The zone you want to target
   * @param {string} ip IP ID or address to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApi
   */
  public getIp(
    zone: GetIpZoneEnum,
    ip: string,
    options?: RawAxiosRequestConfig,
  ) {
    return IPsApiFp(this.configuration)
      .getIp(zone, ip, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all flexible IPs in a specified zone.
   * @summary List all flexible IPs
   * @param {ListIpsZoneEnum} zone The zone you want to target
   * @param {string} [project] Project ID in which the IPs are reserved.
   * @param {string} [organization] Organization ID in which the IPs are reserved.
   * @param {string} [tags] Filter IPs with these exact tags (to filter with several tags, use commas to separate them).
   * @param {string} [name] Filter on the IP address (Works as a LIKE operation on the IP address).
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {string} [type] Filter on the IP Mobility IP type (whose value should be either \&#39;routed_ipv4\&#39; or \&#39;routed_ipv6\&#39;).
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApi
   */
  public listIps(
    zone: ListIpsZoneEnum,
    project?: string,
    organization?: string,
    tags?: string,
    name?: string,
    perPage?: number,
    page?: number,
    type?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return IPsApiFp(this.configuration)
      .listIps(
        zone,
        project,
        organization,
        tags,
        name,
        perPage,
        page,
        type,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * **The IP remains available in IPAM**, which means that it is still reserved by the Organization, and can be reattached to another resource (Instance or other product).
   * @summary Releases the reserved IP without deleting the reservation.
   * @param {ReleaseIpToIpamZoneEnum} zone The zone you want to target
   * @param {string} ipId ID of the IP you want to release from the Instance but retain in IPAM.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApi
   */
  public releaseIpToIpam(
    zone: ReleaseIpToIpamZoneEnum,
    ipId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return IPsApiFp(this.configuration)
      .releaseIpToIpam(zone, ipId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update a flexible IP in the specified zone with the specified ID.
   * @summary Update a flexible IP
   * @param {UpdateIpZoneEnum} zone The zone you want to target
   * @param {string} ip IP ID or IP address.
   * @param {UpdateIpRequest} updateIpRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof IPsApi
   */
  public updateIp(
    zone: UpdateIpZoneEnum,
    ip: string,
    updateIpRequest: UpdateIpRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return IPsApiFp(this.configuration)
      .updateIp(zone, ip, updateIpRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CreateIpZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CreateIpZoneEnum =
  (typeof CreateIpZoneEnum)[keyof typeof CreateIpZoneEnum];
/**
 * @export
 */
export const DeleteIpZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeleteIpZoneEnum =
  (typeof DeleteIpZoneEnum)[keyof typeof DeleteIpZoneEnum];
/**
 * @export
 */
export const GetIpZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetIpZoneEnum = (typeof GetIpZoneEnum)[keyof typeof GetIpZoneEnum];
/**
 * @export
 */
export const ListIpsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListIpsZoneEnum =
  (typeof ListIpsZoneEnum)[keyof typeof ListIpsZoneEnum];
/**
 * @export
 */
export const ReleaseIpToIpamZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ReleaseIpToIpamZoneEnum =
  (typeof ReleaseIpToIpamZoneEnum)[keyof typeof ReleaseIpToIpamZoneEnum];
/**
 * @export
 */
export const UpdateIpZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdateIpZoneEnum =
  (typeof UpdateIpZoneEnum)[keyof typeof UpdateIpZoneEnum];

/**
 * ImagesApi - axios parameter creator
 * @export
 */
export const ImagesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create an Instance image from the specified snapshot ID.
     * @summary Create an Instance image
     * @param {CreateImageZoneEnum} zone The zone you want to target
     * @param {CreateImageRequest} createImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createImage: async (
      zone: CreateImageZoneEnum,
      createImageRequest: CreateImageRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createImage', 'zone', zone);
      // verify required parameter 'createImageRequest' is not null or undefined
      assertParamExists(
        'createImage',
        'createImageRequest',
        createImageRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/images`.replace(
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
        createImageRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete the image with the specified ID.
     * @summary Delete an Instance image
     * @param {DeleteImageZoneEnum} zone The zone you want to target
     * @param {string} imageId UUID of the image you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteImage: async (
      zone: DeleteImageZoneEnum,
      imageId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteImage', 'zone', zone);
      // verify required parameter 'imageId' is not null or undefined
      assertParamExists('deleteImage', 'imageId', imageId);
      const localVarPath = `/instance/v1/zones/{zone}/images/{image_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'image_id'}}`, encodeURIComponent(String(imageId)));
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
     * Get details of an image with the specified ID.
     * @summary Get an Instance image
     * @param {GetImageZoneEnum} zone The zone you want to target
     * @param {string} imageId UUID of the image you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getImage: async (
      zone: GetImageZoneEnum,
      imageId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getImage', 'zone', zone);
      // verify required parameter 'imageId' is not null or undefined
      assertParamExists('getImage', 'imageId', imageId);
      const localVarPath = `/instance/v1/zones/{zone}/images/{image_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'image_id'}}`, encodeURIComponent(String(imageId)));
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
     * List all existing Instance images.
     * @summary List Instance images
     * @param {ListImagesZoneEnum} zone The zone you want to target
     * @param {string} [organization]
     * @param {number} [perPage]
     * @param {number} [page]
     * @param {string} [name]
     * @param {boolean} [_public]
     * @param {string} [arch]
     * @param {string} [project]
     * @param {string} [tags]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listImages: async (
      zone: ListImagesZoneEnum,
      organization?: string,
      perPage?: number,
      page?: number,
      name?: string,
      _public?: boolean,
      arch?: string,
      project?: string,
      tags?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listImages', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/images`.replace(
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

      if (organization !== undefined) {
        localVarQueryParameter['organization'] = organization;
      }

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (_public !== undefined) {
        localVarQueryParameter['public'] = _public;
      }

      if (arch !== undefined) {
        localVarQueryParameter['arch'] = arch;
      }

      if (project !== undefined) {
        localVarQueryParameter['project'] = project;
      }

      if (tags !== undefined) {
        localVarQueryParameter['tags'] = tags;
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
     * Replace all image properties with an image message.
     * @summary Update image
     * @param {SetImageZoneEnum} zone The zone you want to target
     * @param {string} id
     * @param {SetImageRequest} setImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setImage: async (
      zone: SetImageZoneEnum,
      id: string,
      setImageRequest: SetImageRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setImage', 'zone', zone);
      // verify required parameter 'id' is not null or undefined
      assertParamExists('setImage', 'id', id);
      // verify required parameter 'setImageRequest' is not null or undefined
      assertParamExists('setImage', 'setImageRequest', setImageRequest);
      const localVarPath = `/instance/v1/zones/{zone}/images/{id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'id'}}`, encodeURIComponent(String(id)));
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
        setImageRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the properties of an image.
     * @summary Update image
     * @param {UpdateImageZoneEnum} zone The zone you want to target
     * @param {string} imageId UUID of the image. (UUID format)
     * @param {UpdateImageRequest} updateImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateImage: async (
      zone: UpdateImageZoneEnum,
      imageId: string,
      updateImageRequest: UpdateImageRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateImage', 'zone', zone);
      // verify required parameter 'imageId' is not null or undefined
      assertParamExists('updateImage', 'imageId', imageId);
      // verify required parameter 'updateImageRequest' is not null or undefined
      assertParamExists(
        'updateImage',
        'updateImageRequest',
        updateImageRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/images/{image_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'image_id'}}`, encodeURIComponent(String(imageId)));
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
        updateImageRequest,
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
 * ImagesApi - functional programming interface
 * @export
 */
export const ImagesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = ImagesApiAxiosParamCreator(configuration);
  return {
    /**
     * Create an Instance image from the specified snapshot ID.
     * @summary Create an Instance image
     * @param {CreateImageZoneEnum} zone The zone you want to target
     * @param {CreateImageRequest} createImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createImage(
      zone: CreateImageZoneEnum,
      createImageRequest: CreateImageRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1CreateImageResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createImage(
        zone,
        createImageRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.createImage']?.[
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
     * Delete the image with the specified ID.
     * @summary Delete an Instance image
     * @param {DeleteImageZoneEnum} zone The zone you want to target
     * @param {string} imageId UUID of the image you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteImage(
      zone: DeleteImageZoneEnum,
      imageId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteImage(
        zone,
        imageId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.deleteImage']?.[
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
     * Get details of an image with the specified ID.
     * @summary Get an Instance image
     * @param {GetImageZoneEnum} zone The zone you want to target
     * @param {string} imageId UUID of the image you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getImage(
      zone: GetImageZoneEnum,
      imageId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetImageResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getImage(
        zone,
        imageId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.getImage']?.[localVarOperationServerIndex]
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
     * List all existing Instance images.
     * @summary List Instance images
     * @param {ListImagesZoneEnum} zone The zone you want to target
     * @param {string} [organization]
     * @param {number} [perPage]
     * @param {number} [page]
     * @param {string} [name]
     * @param {boolean} [_public]
     * @param {string} [arch]
     * @param {string} [project]
     * @param {string} [tags]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listImages(
      zone: ListImagesZoneEnum,
      organization?: string,
      perPage?: number,
      page?: number,
      name?: string,
      _public?: boolean,
      arch?: string,
      project?: string,
      tags?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListImagesResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listImages(
        zone,
        organization,
        perPage,
        page,
        name,
        _public,
        arch,
        project,
        tags,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.listImages']?.[
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
     * Replace all image properties with an image message.
     * @summary Update image
     * @param {SetImageZoneEnum} zone The zone you want to target
     * @param {string} id
     * @param {SetImageRequest} setImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setImage(
      zone: SetImageZoneEnum,
      id: string,
      setImageRequest: SetImageRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1SetImageResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.setImage(
        zone,
        id,
        setImageRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.setImage']?.[localVarOperationServerIndex]
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
     * Update the properties of an image.
     * @summary Update image
     * @param {UpdateImageZoneEnum} zone The zone you want to target
     * @param {string} imageId UUID of the image. (UUID format)
     * @param {UpdateImageRequest} updateImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateImage(
      zone: UpdateImageZoneEnum,
      imageId: string,
      updateImageRequest: UpdateImageRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1UpdateImageResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateImage(
        zone,
        imageId,
        updateImageRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.updateImage']?.[
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
 * ImagesApi - factory interface
 * @export
 */
export const ImagesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = ImagesApiFp(configuration);
  return {
    /**
     * Create an Instance image from the specified snapshot ID.
     * @summary Create an Instance image
     * @param {CreateImageZoneEnum} zone The zone you want to target
     * @param {CreateImageRequest} createImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createImage(
      zone: CreateImageZoneEnum,
      createImageRequest: CreateImageRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1CreateImageResponse> {
      return localVarFp
        .createImage(zone, createImageRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete the image with the specified ID.
     * @summary Delete an Instance image
     * @param {DeleteImageZoneEnum} zone The zone you want to target
     * @param {string} imageId UUID of the image you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteImage(
      zone: DeleteImageZoneEnum,
      imageId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteImage(zone, imageId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get details of an image with the specified ID.
     * @summary Get an Instance image
     * @param {GetImageZoneEnum} zone The zone you want to target
     * @param {string} imageId UUID of the image you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getImage(
      zone: GetImageZoneEnum,
      imageId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetImageResponse> {
      return localVarFp
        .getImage(zone, imageId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all existing Instance images.
     * @summary List Instance images
     * @param {ListImagesZoneEnum} zone The zone you want to target
     * @param {string} [organization]
     * @param {number} [perPage]
     * @param {number} [page]
     * @param {string} [name]
     * @param {boolean} [_public]
     * @param {string} [arch]
     * @param {string} [project]
     * @param {string} [tags]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listImages(
      zone: ListImagesZoneEnum,
      organization?: string,
      perPage?: number,
      page?: number,
      name?: string,
      _public?: boolean,
      arch?: string,
      project?: string,
      tags?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListImagesResponse> {
      return localVarFp
        .listImages(
          zone,
          organization,
          perPage,
          page,
          name,
          _public,
          arch,
          project,
          tags,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Replace all image properties with an image message.
     * @summary Update image
     * @param {SetImageZoneEnum} zone The zone you want to target
     * @param {string} id
     * @param {SetImageRequest} setImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setImage(
      zone: SetImageZoneEnum,
      id: string,
      setImageRequest: SetImageRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1SetImageResponse> {
      return localVarFp
        .setImage(zone, id, setImageRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the properties of an image.
     * @summary Update image
     * @param {UpdateImageZoneEnum} zone The zone you want to target
     * @param {string} imageId UUID of the image. (UUID format)
     * @param {UpdateImageRequest} updateImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateImage(
      zone: UpdateImageZoneEnum,
      imageId: string,
      updateImageRequest: UpdateImageRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1UpdateImageResponse> {
      return localVarFp
        .updateImage(zone, imageId, updateImageRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ImagesApi - interface
 * @export
 * @interface ImagesApi
 */
export interface ImagesApiInterface {
  /**
   * Create an Instance image from the specified snapshot ID.
   * @summary Create an Instance image
   * @param {CreateImageZoneEnum} zone The zone you want to target
   * @param {CreateImageRequest} createImageRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  createImage(
    zone: CreateImageZoneEnum,
    createImageRequest: CreateImageRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1CreateImageResponse>;

  /**
   * Delete the image with the specified ID.
   * @summary Delete an Instance image
   * @param {DeleteImageZoneEnum} zone The zone you want to target
   * @param {string} imageId UUID of the image you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  deleteImage(
    zone: DeleteImageZoneEnum,
    imageId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get details of an image with the specified ID.
   * @summary Get an Instance image
   * @param {GetImageZoneEnum} zone The zone you want to target
   * @param {string} imageId UUID of the image you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  getImage(
    zone: GetImageZoneEnum,
    imageId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetImageResponse>;

  /**
   * List all existing Instance images.
   * @summary List Instance images
   * @param {ListImagesZoneEnum} zone The zone you want to target
   * @param {string} [organization]
   * @param {number} [perPage]
   * @param {number} [page]
   * @param {string} [name]
   * @param {boolean} [_public]
   * @param {string} [arch]
   * @param {string} [project]
   * @param {string} [tags]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  listImages(
    zone: ListImagesZoneEnum,
    organization?: string,
    perPage?: number,
    page?: number,
    name?: string,
    _public?: boolean,
    arch?: string,
    project?: string,
    tags?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListImagesResponse>;

  /**
   * Replace all image properties with an image message.
   * @summary Update image
   * @param {SetImageZoneEnum} zone The zone you want to target
   * @param {string} id
   * @param {SetImageRequest} setImageRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  setImage(
    zone: SetImageZoneEnum,
    id: string,
    setImageRequest: SetImageRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1SetImageResponse>;

  /**
   * Update the properties of an image.
   * @summary Update image
   * @param {UpdateImageZoneEnum} zone The zone you want to target
   * @param {string} imageId UUID of the image. (UUID format)
   * @param {UpdateImageRequest} updateImageRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  updateImage(
    zone: UpdateImageZoneEnum,
    imageId: string,
    updateImageRequest: UpdateImageRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1UpdateImageResponse>;
}

/**
 * ImagesApi - object-oriented interface
 * @export
 * @class ImagesApi
 * @extends {BaseAPI}
 */
export class ImagesApi extends BaseAPI implements ImagesApiInterface {
  /**
   * Create an Instance image from the specified snapshot ID.
   * @summary Create an Instance image
   * @param {CreateImageZoneEnum} zone The zone you want to target
   * @param {CreateImageRequest} createImageRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public createImage(
    zone: CreateImageZoneEnum,
    createImageRequest: CreateImageRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .createImage(zone, createImageRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete the image with the specified ID.
   * @summary Delete an Instance image
   * @param {DeleteImageZoneEnum} zone The zone you want to target
   * @param {string} imageId UUID of the image you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public deleteImage(
    zone: DeleteImageZoneEnum,
    imageId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .deleteImage(zone, imageId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get details of an image with the specified ID.
   * @summary Get an Instance image
   * @param {GetImageZoneEnum} zone The zone you want to target
   * @param {string} imageId UUID of the image you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public getImage(
    zone: GetImageZoneEnum,
    imageId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .getImage(zone, imageId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all existing Instance images.
   * @summary List Instance images
   * @param {ListImagesZoneEnum} zone The zone you want to target
   * @param {string} [organization]
   * @param {number} [perPage]
   * @param {number} [page]
   * @param {string} [name]
   * @param {boolean} [_public]
   * @param {string} [arch]
   * @param {string} [project]
   * @param {string} [tags]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public listImages(
    zone: ListImagesZoneEnum,
    organization?: string,
    perPage?: number,
    page?: number,
    name?: string,
    _public?: boolean,
    arch?: string,
    project?: string,
    tags?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .listImages(
        zone,
        organization,
        perPage,
        page,
        name,
        _public,
        arch,
        project,
        tags,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Replace all image properties with an image message.
   * @summary Update image
   * @param {SetImageZoneEnum} zone The zone you want to target
   * @param {string} id
   * @param {SetImageRequest} setImageRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public setImage(
    zone: SetImageZoneEnum,
    id: string,
    setImageRequest: SetImageRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .setImage(zone, id, setImageRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the properties of an image.
   * @summary Update image
   * @param {UpdateImageZoneEnum} zone The zone you want to target
   * @param {string} imageId UUID of the image. (UUID format)
   * @param {UpdateImageRequest} updateImageRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public updateImage(
    zone: UpdateImageZoneEnum,
    imageId: string,
    updateImageRequest: UpdateImageRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .updateImage(zone, imageId, updateImageRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CreateImageZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CreateImageZoneEnum =
  (typeof CreateImageZoneEnum)[keyof typeof CreateImageZoneEnum];
/**
 * @export
 */
export const DeleteImageZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeleteImageZoneEnum =
  (typeof DeleteImageZoneEnum)[keyof typeof DeleteImageZoneEnum];
/**
 * @export
 */
export const GetImageZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetImageZoneEnum =
  (typeof GetImageZoneEnum)[keyof typeof GetImageZoneEnum];
/**
 * @export
 */
export const ListImagesZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListImagesZoneEnum =
  (typeof ListImagesZoneEnum)[keyof typeof ListImagesZoneEnum];
/**
 * @export
 */
export const SetImageZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type SetImageZoneEnum =
  (typeof SetImageZoneEnum)[keyof typeof SetImageZoneEnum];
/**
 * @export
 */
export const UpdateImageZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdateImageZoneEnum =
  (typeof UpdateImageZoneEnum)[keyof typeof UpdateImageZoneEnum];

/**
 * InstanceTypesApi - axios parameter creator
 * @export
 */
export const InstanceTypesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Get availability for all Instance types.
     * @summary Get availability
     * @param {GetServerTypesAvailabilityZoneEnum} zone The zone you want to target
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServerTypesAvailability: async (
      zone: GetServerTypesAvailabilityZoneEnum,
      perPage?: number,
      page?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getServerTypesAvailability', 'zone', zone);
      const localVarPath =
        `/instance/v1/zones/{zone}/products/servers/availability`.replace(
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

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
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
     * List available Instance types and their technical details.
     * @summary List Instance types
     * @param {ListServersTypesZoneEnum} zone The zone you want to target
     * @param {number} [perPage]
     * @param {number} [page]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServersTypes: async (
      zone: ListServersTypesZoneEnum,
      perPage?: number,
      page?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listServersTypes', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/products/servers`.replace(
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

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
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
 * InstanceTypesApi - functional programming interface
 * @export
 */
export const InstanceTypesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    InstanceTypesApiAxiosParamCreator(configuration);
  return {
    /**
     * Get availability for all Instance types.
     * @summary Get availability
     * @param {GetServerTypesAvailabilityZoneEnum} zone The zone you want to target
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getServerTypesAvailability(
      zone: GetServerTypesAvailabilityZoneEnum,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetServerTypesAvailabilityResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getServerTypesAvailability(
          zone,
          perPage,
          page,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstanceTypesApi.getServerTypesAvailability']?.[
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
     * List available Instance types and their technical details.
     * @summary List Instance types
     * @param {ListServersTypesZoneEnum} zone The zone you want to target
     * @param {number} [perPage]
     * @param {number} [page]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listServersTypes(
      zone: ListServersTypesZoneEnum,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListServersTypesResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listServersTypes(
          zone,
          perPage,
          page,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstanceTypesApi.listServersTypes']?.[
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
 * InstanceTypesApi - factory interface
 * @export
 */
export const InstanceTypesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = InstanceTypesApiFp(configuration);
  return {
    /**
     * Get availability for all Instance types.
     * @summary Get availability
     * @param {GetServerTypesAvailabilityZoneEnum} zone The zone you want to target
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServerTypesAvailability(
      zone: GetServerTypesAvailabilityZoneEnum,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetServerTypesAvailabilityResponse> {
      return localVarFp
        .getServerTypesAvailability(zone, perPage, page, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List available Instance types and their technical details.
     * @summary List Instance types
     * @param {ListServersTypesZoneEnum} zone The zone you want to target
     * @param {number} [perPage]
     * @param {number} [page]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServersTypes(
      zone: ListServersTypesZoneEnum,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListServersTypesResponse> {
      return localVarFp
        .listServersTypes(zone, perPage, page, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * InstanceTypesApi - interface
 * @export
 * @interface InstanceTypesApi
 */
export interface InstanceTypesApiInterface {
  /**
   * Get availability for all Instance types.
   * @summary Get availability
   * @param {GetServerTypesAvailabilityZoneEnum} zone The zone you want to target
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceTypesApiInterface
   */
  getServerTypesAvailability(
    zone: GetServerTypesAvailabilityZoneEnum,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetServerTypesAvailabilityResponse>;

  /**
   * List available Instance types and their technical details.
   * @summary List Instance types
   * @param {ListServersTypesZoneEnum} zone The zone you want to target
   * @param {number} [perPage]
   * @param {number} [page]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceTypesApiInterface
   */
  listServersTypes(
    zone: ListServersTypesZoneEnum,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListServersTypesResponse>;
}

/**
 * InstanceTypesApi - object-oriented interface
 * @export
 * @class InstanceTypesApi
 * @extends {BaseAPI}
 */
export class InstanceTypesApi
  extends BaseAPI
  implements InstanceTypesApiInterface
{
  /**
   * Get availability for all Instance types.
   * @summary Get availability
   * @param {GetServerTypesAvailabilityZoneEnum} zone The zone you want to target
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceTypesApi
   */
  public getServerTypesAvailability(
    zone: GetServerTypesAvailabilityZoneEnum,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return InstanceTypesApiFp(this.configuration)
      .getServerTypesAvailability(zone, perPage, page, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List available Instance types and their technical details.
   * @summary List Instance types
   * @param {ListServersTypesZoneEnum} zone The zone you want to target
   * @param {number} [perPage]
   * @param {number} [page]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceTypesApi
   */
  public listServersTypes(
    zone: ListServersTypesZoneEnum,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return InstanceTypesApiFp(this.configuration)
      .listServersTypes(zone, perPage, page, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const GetServerTypesAvailabilityZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetServerTypesAvailabilityZoneEnum =
  (typeof GetServerTypesAvailabilityZoneEnum)[keyof typeof GetServerTypesAvailabilityZoneEnum];
/**
 * @export
 */
export const ListServersTypesZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListServersTypesZoneEnum =
  (typeof ListServersTypesZoneEnum)[keyof typeof ListServersTypesZoneEnum];

/**
 * InstancesApi - axios parameter creator
 * @export
 */
export const InstancesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     *
     * @summary Attach a filesystem volume to an Instance
     * @param {AttachServerFileSystemZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachServerFileSystem: async (
      zone: AttachServerFileSystemZoneEnum,
      serverId: string,
      attachServerFileSystemRequest: AttachServerFileSystemRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('attachServerFileSystem', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('attachServerFileSystem', 'serverId', serverId);
      // verify required parameter 'attachServerFileSystemRequest' is not null or undefined
      assertParamExists(
        'attachServerFileSystem',
        'attachServerFileSystemRequest',
        attachServerFileSystemRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/attach-filesystem`
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
        attachServerFileSystemRequest,
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
     * @summary Attach a volume to an Instance
     * @param {AttachServerVolumeZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {AttachServerVolumeRequest} attachServerVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachServerVolume: async (
      zone: AttachServerVolumeZoneEnum,
      serverId: string,
      attachServerVolumeRequest: AttachServerVolumeRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('attachServerVolume', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('attachServerVolume', 'serverId', serverId);
      // verify required parameter 'attachServerVolumeRequest' is not null or undefined
      assertParamExists(
        'attachServerVolume',
        'attachServerVolumeRequest',
        attachServerVolumeRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/attach-volume`
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
        attachServerVolumeRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Create a new Instance of the specified commercial type in the specified zone. Pay attention to the volumes parameter, which takes an object which can be used in different ways to achieve different behaviors. Get more information in the [Technical Information](#technical-information) section of the introduction.
     * @summary Create an Instance
     * @param {CreateServerZoneEnum} zone The zone you want to target
     * @param {CreateServerRequest} createServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createServer: async (
      zone: CreateServerZoneEnum,
      createServerRequest: CreateServerRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createServer', 'zone', zone);
      // verify required parameter 'createServerRequest' is not null or undefined
      assertParamExists(
        'createServer',
        'createServerRequest',
        createServerRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/servers`.replace(
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
        createServerRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete the Instance with the specified ID.
     * @summary Delete an Instance
     * @param {DeleteServerZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteServer: async (
      zone: DeleteServerZoneEnum,
      serverId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteServer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('deleteServer', 'serverId', serverId);
      const localVarPath = `/instance/v1/zones/{zone}/servers/{server_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)));
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
     *
     * @summary Detach a filesystem volume from an Instance
     * @param {DetachServerFileSystemZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    detachServerFileSystem: async (
      zone: DetachServerFileSystemZoneEnum,
      serverId: string,
      attachServerFileSystemRequest: AttachServerFileSystemRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('detachServerFileSystem', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('detachServerFileSystem', 'serverId', serverId);
      // verify required parameter 'attachServerFileSystemRequest' is not null or undefined
      assertParamExists(
        'detachServerFileSystem',
        'attachServerFileSystemRequest',
        attachServerFileSystemRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/detach-filesystem`
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
        attachServerFileSystemRequest,
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
     * @summary Detach a volume from an Instance
     * @param {DetachServerVolumeZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {DetachServerVolumeRequest} detachServerVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    detachServerVolume: async (
      zone: DetachServerVolumeZoneEnum,
      serverId: string,
      detachServerVolumeRequest: DetachServerVolumeRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('detachServerVolume', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('detachServerVolume', 'serverId', serverId);
      // verify required parameter 'detachServerVolumeRequest' is not null or undefined
      assertParamExists(
        'detachServerVolume',
        'detachServerVolumeRequest',
        detachServerVolumeRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/detach-volume`
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
        detachServerVolumeRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Get the details of a specified Instance.
     * @summary Get an Instance
     * @param {GetServerZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServer: async (
      zone: GetServerZoneEnum,
      serverId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getServer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('getServer', 'serverId', serverId);
      const localVarPath = `/instance/v1/zones/{zone}/servers/{server_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)));
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
     * Get compatible commercial types that can be used to update the Instance. The compatibility of an Instance offer is based on: * the CPU architecture * the OS type * the required l_ssd storage size * the required scratch storage size If the specified Instance offer is flagged as end of service, the best compatible offer is the first returned.
     * @summary Get Instance compatible types
     * @param {GetServerCompatibleTypesZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServerCompatibleTypes: async (
      zone: GetServerCompatibleTypesZoneEnum,
      serverId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getServerCompatibleTypes', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('getServerCompatibleTypes', 'serverId', serverId);
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/compatible-types`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)));
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
     * List all actions (e.g. power on, power off, reboot) that can currently be performed on an Instance.
     * @summary List Instance actions
     * @param {ListServerActionsZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServerActions: async (
      zone: ListServerActionsZoneEnum,
      serverId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listServerActions', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('listServerActions', 'serverId', serverId);
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/action`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)));
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
     * List all Instances in a specified Availability Zone, e.g. `fr-par-1`.
     * @summary List all Instances
     * @param {ListServersZoneEnum} zone The zone you want to target
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [organization] List only Instances of this Organization ID.
     * @param {string} [project] List only Instances of this Project ID.
     * @param {string} [name] Filter Instances by name (eg. \&quot;server1\&quot; will return \&quot;server100\&quot; and \&quot;server1\&quot; but not \&quot;foo\&quot;).
     * @param {string} [privateIp] List Instances by private_ip. (IP address)
     * @param {boolean} [withoutIp] List Instances that are not attached to a public IP.
     * @param {string} [withIp] List Instances by IP (both private_ip and public_ip are supported). (IP address)
     * @param {string} [commercialType] List Instances of this commercial type.
     * @param {ListServersStateEnum} [state] List Instances in this state.
     * @param {string} [tags] List Instances with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [privateNetwork] List Instances in this Private Network.
     * @param {ListServersOrderEnum} [order] Define the order of the returned servers.
     * @param {string} [privateNetworks] List Instances from the given Private Networks (use commas to separate them).
     * @param {string} [privateNicMacAddress] List Instances associated with the given private NIC MAC address.
     * @param {string} [servers] List Instances from these server ids (use commas to separate them).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServers: async (
      zone: ListServersZoneEnum,
      perPage?: number,
      page?: number,
      organization?: string,
      project?: string,
      name?: string,
      privateIp?: string,
      withoutIp?: boolean,
      withIp?: string,
      commercialType?: string,
      state?: ListServersStateEnum,
      tags?: string,
      privateNetwork?: string,
      order?: ListServersOrderEnum,
      privateNetworks?: string,
      privateNicMacAddress?: string,
      servers?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listServers', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/servers`.replace(
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

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (organization !== undefined) {
        localVarQueryParameter['organization'] = organization;
      }

      if (project !== undefined) {
        localVarQueryParameter['project'] = project;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (privateIp !== undefined) {
        localVarQueryParameter['private_ip'] = privateIp;
      }

      if (withoutIp !== undefined) {
        localVarQueryParameter['without_ip'] = withoutIp;
      }

      if (withIp !== undefined) {
        localVarQueryParameter['with_ip'] = withIp;
      }

      if (commercialType !== undefined) {
        localVarQueryParameter['commercial_type'] = commercialType;
      }

      if (state !== undefined) {
        localVarQueryParameter['state'] = state;
      }

      if (tags !== undefined) {
        localVarQueryParameter['tags'] = tags;
      }

      if (privateNetwork !== undefined) {
        localVarQueryParameter['private_network'] = privateNetwork;
      }

      if (order !== undefined) {
        localVarQueryParameter['order'] = order;
      }

      if (privateNetworks !== undefined) {
        localVarQueryParameter['private_networks'] = privateNetworks;
      }

      if (privateNicMacAddress !== undefined) {
        localVarQueryParameter['private_nic_mac_address'] =
          privateNicMacAddress;
      }

      if (servers !== undefined) {
        localVarQueryParameter['servers'] = servers;
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
     * Perform an action on an Instance. Available actions are: * `poweron`: Start a stopped Instance. * `poweroff`: Fully stop the Instance and release the hypervisor slot. * `stop_in_place`: Stop the Instance, but keep the slot on the hypervisor. * `reboot`: Stop the instance and restart it. * `backup`:  Create an image with all the volumes of an Instance. * `terminate`: Delete the Instance along with its attached local volumes. * `enable_routed_ip`: Migrate the Instance to the new network stack.  The `terminate` action will result in the deletion of `l_ssd` and `scratch` volumes types, `sbs_volume` volumes will only be detached. If you want to preserve your `l_ssd` volumes, you should stop your Instance, detach the volumes to be preserved, then delete your Instance.  The `backup` action can be done with: * No `volumes` key in the body: an image is created with snapshots of all the server volumes, except for the `scratch` volumes types. * `volumes` key in the body with a dictionary as value, in this dictionary volumes UUID as keys and empty dictionaries as values : an image is created with the snapshots of the volumes in `volumes` key. `scratch` volumes types can\'t be shapshotted.
     * @summary Perform action
     * @param {ServerActionZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {ServerActionRequest} serverActionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    serverAction: async (
      zone: ServerActionZoneEnum,
      serverId: string,
      serverActionRequest: ServerActionRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('serverAction', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('serverAction', 'serverId', serverId);
      // verify required parameter 'serverActionRequest' is not null or undefined
      assertParamExists(
        'serverAction',
        'serverActionRequest',
        serverActionRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/action`
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
        serverActionRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the Instance information, such as name, boot mode, or tags.
     * @summary Update an Instance
     * @param {UpdateServerZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {UpdateServerRequest} updateServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateServer: async (
      zone: UpdateServerZoneEnum,
      serverId: string,
      updateServerRequest: UpdateServerRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateServer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('updateServer', 'serverId', serverId);
      // verify required parameter 'updateServerRequest' is not null or undefined
      assertParamExists(
        'updateServer',
        'updateServerRequest',
        updateServerRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/servers/{server_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)));
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
        updateServerRequest,
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
 * InstancesApi - functional programming interface
 * @export
 */
export const InstancesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    InstancesApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @summary Attach a filesystem volume to an Instance
     * @param {AttachServerFileSystemZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async attachServerFileSystem(
      zone: AttachServerFileSystemZoneEnum,
      serverId: string,
      attachServerFileSystemRequest: AttachServerFileSystemRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1AttachServerFileSystemResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.attachServerFileSystem(
          zone,
          serverId,
          attachServerFileSystemRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.attachServerFileSystem']?.[
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
     * @summary Attach a volume to an Instance
     * @param {AttachServerVolumeZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {AttachServerVolumeRequest} attachServerVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async attachServerVolume(
      zone: AttachServerVolumeZoneEnum,
      serverId: string,
      attachServerVolumeRequest: AttachServerVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1AttachServerVolumeResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.attachServerVolume(
          zone,
          serverId,
          attachServerVolumeRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.attachServerVolume']?.[
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
     * Create a new Instance of the specified commercial type in the specified zone. Pay attention to the volumes parameter, which takes an object which can be used in different ways to achieve different behaviors. Get more information in the [Technical Information](#technical-information) section of the introduction.
     * @summary Create an Instance
     * @param {CreateServerZoneEnum} zone The zone you want to target
     * @param {CreateServerRequest} createServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createServer(
      zone: CreateServerZoneEnum,
      createServerRequest: CreateServerRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1CreateServerResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createServer(
        zone,
        createServerRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.createServer']?.[
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
     * Delete the Instance with the specified ID.
     * @summary Delete an Instance
     * @param {DeleteServerZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteServer(
      zone: DeleteServerZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteServer(
        zone,
        serverId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.deleteServer']?.[
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
     * @summary Detach a filesystem volume from an Instance
     * @param {DetachServerFileSystemZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async detachServerFileSystem(
      zone: DetachServerFileSystemZoneEnum,
      serverId: string,
      attachServerFileSystemRequest: AttachServerFileSystemRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1DetachServerFileSystemResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.detachServerFileSystem(
          zone,
          serverId,
          attachServerFileSystemRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.detachServerFileSystem']?.[
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
     * @summary Detach a volume from an Instance
     * @param {DetachServerVolumeZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {DetachServerVolumeRequest} detachServerVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async detachServerVolume(
      zone: DetachServerVolumeZoneEnum,
      serverId: string,
      detachServerVolumeRequest: DetachServerVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1DetachServerVolumeResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.detachServerVolume(
          zone,
          serverId,
          detachServerVolumeRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.detachServerVolume']?.[
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
     * Get the details of a specified Instance.
     * @summary Get an Instance
     * @param {GetServerZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getServer(
      zone: GetServerZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetServerResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getServer(
        zone,
        serverId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.getServer']?.[
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
     * Get compatible commercial types that can be used to update the Instance. The compatibility of an Instance offer is based on: * the CPU architecture * the OS type * the required l_ssd storage size * the required scratch storage size If the specified Instance offer is flagged as end of service, the best compatible offer is the first returned.
     * @summary Get Instance compatible types
     * @param {GetServerCompatibleTypesZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getServerCompatibleTypes(
      zone: GetServerCompatibleTypesZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ServerCompatibleTypes>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getServerCompatibleTypes(
          zone,
          serverId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.getServerCompatibleTypes']?.[
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
     * List all actions (e.g. power on, power off, reboot) that can currently be performed on an Instance.
     * @summary List Instance actions
     * @param {ListServerActionsZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listServerActions(
      zone: ListServerActionsZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListServerActionsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listServerActions(
          zone,
          serverId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.listServerActions']?.[
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
     * List all Instances in a specified Availability Zone, e.g. `fr-par-1`.
     * @summary List all Instances
     * @param {ListServersZoneEnum} zone The zone you want to target
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [organization] List only Instances of this Organization ID.
     * @param {string} [project] List only Instances of this Project ID.
     * @param {string} [name] Filter Instances by name (eg. \&quot;server1\&quot; will return \&quot;server100\&quot; and \&quot;server1\&quot; but not \&quot;foo\&quot;).
     * @param {string} [privateIp] List Instances by private_ip. (IP address)
     * @param {boolean} [withoutIp] List Instances that are not attached to a public IP.
     * @param {string} [withIp] List Instances by IP (both private_ip and public_ip are supported). (IP address)
     * @param {string} [commercialType] List Instances of this commercial type.
     * @param {ListServersStateEnum} [state] List Instances in this state.
     * @param {string} [tags] List Instances with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [privateNetwork] List Instances in this Private Network.
     * @param {ListServersOrderEnum} [order] Define the order of the returned servers.
     * @param {string} [privateNetworks] List Instances from the given Private Networks (use commas to separate them).
     * @param {string} [privateNicMacAddress] List Instances associated with the given private NIC MAC address.
     * @param {string} [servers] List Instances from these server ids (use commas to separate them).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listServers(
      zone: ListServersZoneEnum,
      perPage?: number,
      page?: number,
      organization?: string,
      project?: string,
      name?: string,
      privateIp?: string,
      withoutIp?: boolean,
      withIp?: string,
      commercialType?: string,
      state?: ListServersStateEnum,
      tags?: string,
      privateNetwork?: string,
      order?: ListServersOrderEnum,
      privateNetworks?: string,
      privateNicMacAddress?: string,
      servers?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListServersResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listServers(
        zone,
        perPage,
        page,
        organization,
        project,
        name,
        privateIp,
        withoutIp,
        withIp,
        commercialType,
        state,
        tags,
        privateNetwork,
        order,
        privateNetworks,
        privateNicMacAddress,
        servers,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.listServers']?.[
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
     * Perform an action on an Instance. Available actions are: * `poweron`: Start a stopped Instance. * `poweroff`: Fully stop the Instance and release the hypervisor slot. * `stop_in_place`: Stop the Instance, but keep the slot on the hypervisor. * `reboot`: Stop the instance and restart it. * `backup`:  Create an image with all the volumes of an Instance. * `terminate`: Delete the Instance along with its attached local volumes. * `enable_routed_ip`: Migrate the Instance to the new network stack.  The `terminate` action will result in the deletion of `l_ssd` and `scratch` volumes types, `sbs_volume` volumes will only be detached. If you want to preserve your `l_ssd` volumes, you should stop your Instance, detach the volumes to be preserved, then delete your Instance.  The `backup` action can be done with: * No `volumes` key in the body: an image is created with snapshots of all the server volumes, except for the `scratch` volumes types. * `volumes` key in the body with a dictionary as value, in this dictionary volumes UUID as keys and empty dictionaries as values : an image is created with the snapshots of the volumes in `volumes` key. `scratch` volumes types can\'t be shapshotted.
     * @summary Perform action
     * @param {ServerActionZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {ServerActionRequest} serverActionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async serverAction(
      zone: ServerActionZoneEnum,
      serverId: string,
      serverActionRequest: ServerActionRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ServerActionResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.serverAction(
        zone,
        serverId,
        serverActionRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.serverAction']?.[
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
     * Update the Instance information, such as name, boot mode, or tags.
     * @summary Update an Instance
     * @param {UpdateServerZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {UpdateServerRequest} updateServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateServer(
      zone: UpdateServerZoneEnum,
      serverId: string,
      updateServerRequest: UpdateServerRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1UpdateServerResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateServer(
        zone,
        serverId,
        updateServerRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.updateServer']?.[
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
 * InstancesApi - factory interface
 * @export
 */
export const InstancesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = InstancesApiFp(configuration);
  return {
    /**
     *
     * @summary Attach a filesystem volume to an Instance
     * @param {AttachServerFileSystemZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachServerFileSystem(
      zone: AttachServerFileSystemZoneEnum,
      serverId: string,
      attachServerFileSystemRequest: AttachServerFileSystemRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1AttachServerFileSystemResponse> {
      return localVarFp
        .attachServerFileSystem(
          zone,
          serverId,
          attachServerFileSystemRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Attach a volume to an Instance
     * @param {AttachServerVolumeZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {AttachServerVolumeRequest} attachServerVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachServerVolume(
      zone: AttachServerVolumeZoneEnum,
      serverId: string,
      attachServerVolumeRequest: AttachServerVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1AttachServerVolumeResponse> {
      return localVarFp
        .attachServerVolume(zone, serverId, attachServerVolumeRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a new Instance of the specified commercial type in the specified zone. Pay attention to the volumes parameter, which takes an object which can be used in different ways to achieve different behaviors. Get more information in the [Technical Information](#technical-information) section of the introduction.
     * @summary Create an Instance
     * @param {CreateServerZoneEnum} zone The zone you want to target
     * @param {CreateServerRequest} createServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createServer(
      zone: CreateServerZoneEnum,
      createServerRequest: CreateServerRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1CreateServerResponse> {
      return localVarFp
        .createServer(zone, createServerRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete the Instance with the specified ID.
     * @summary Delete an Instance
     * @param {DeleteServerZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteServer(
      zone: DeleteServerZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteServer(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Detach a filesystem volume from an Instance
     * @param {DetachServerFileSystemZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    detachServerFileSystem(
      zone: DetachServerFileSystemZoneEnum,
      serverId: string,
      attachServerFileSystemRequest: AttachServerFileSystemRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1DetachServerFileSystemResponse> {
      return localVarFp
        .detachServerFileSystem(
          zone,
          serverId,
          attachServerFileSystemRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Detach a volume from an Instance
     * @param {DetachServerVolumeZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {DetachServerVolumeRequest} detachServerVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    detachServerVolume(
      zone: DetachServerVolumeZoneEnum,
      serverId: string,
      detachServerVolumeRequest: DetachServerVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1DetachServerVolumeResponse> {
      return localVarFp
        .detachServerVolume(zone, serverId, detachServerVolumeRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get the details of a specified Instance.
     * @summary Get an Instance
     * @param {GetServerZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServer(
      zone: GetServerZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetServerResponse> {
      return localVarFp
        .getServer(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get compatible commercial types that can be used to update the Instance. The compatibility of an Instance offer is based on: * the CPU architecture * the OS type * the required l_ssd storage size * the required scratch storage size If the specified Instance offer is flagged as end of service, the best compatible offer is the first returned.
     * @summary Get Instance compatible types
     * @param {GetServerCompatibleTypesZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServerCompatibleTypes(
      zone: GetServerCompatibleTypesZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ServerCompatibleTypes> {
      return localVarFp
        .getServerCompatibleTypes(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all actions (e.g. power on, power off, reboot) that can currently be performed on an Instance.
     * @summary List Instance actions
     * @param {ListServerActionsZoneEnum} zone The zone you want to target
     * @param {string} serverId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServerActions(
      zone: ListServerActionsZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListServerActionsResponse> {
      return localVarFp
        .listServerActions(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all Instances in a specified Availability Zone, e.g. `fr-par-1`.
     * @summary List all Instances
     * @param {ListServersZoneEnum} zone The zone you want to target
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [organization] List only Instances of this Organization ID.
     * @param {string} [project] List only Instances of this Project ID.
     * @param {string} [name] Filter Instances by name (eg. \&quot;server1\&quot; will return \&quot;server100\&quot; and \&quot;server1\&quot; but not \&quot;foo\&quot;).
     * @param {string} [privateIp] List Instances by private_ip. (IP address)
     * @param {boolean} [withoutIp] List Instances that are not attached to a public IP.
     * @param {string} [withIp] List Instances by IP (both private_ip and public_ip are supported). (IP address)
     * @param {string} [commercialType] List Instances of this commercial type.
     * @param {ListServersStateEnum} [state] List Instances in this state.
     * @param {string} [tags] List Instances with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [privateNetwork] List Instances in this Private Network.
     * @param {ListServersOrderEnum} [order] Define the order of the returned servers.
     * @param {string} [privateNetworks] List Instances from the given Private Networks (use commas to separate them).
     * @param {string} [privateNicMacAddress] List Instances associated with the given private NIC MAC address.
     * @param {string} [servers] List Instances from these server ids (use commas to separate them).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServers(
      zone: ListServersZoneEnum,
      perPage?: number,
      page?: number,
      organization?: string,
      project?: string,
      name?: string,
      privateIp?: string,
      withoutIp?: boolean,
      withIp?: string,
      commercialType?: string,
      state?: ListServersStateEnum,
      tags?: string,
      privateNetwork?: string,
      order?: ListServersOrderEnum,
      privateNetworks?: string,
      privateNicMacAddress?: string,
      servers?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListServersResponse> {
      return localVarFp
        .listServers(
          zone,
          perPage,
          page,
          organization,
          project,
          name,
          privateIp,
          withoutIp,
          withIp,
          commercialType,
          state,
          tags,
          privateNetwork,
          order,
          privateNetworks,
          privateNicMacAddress,
          servers,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Perform an action on an Instance. Available actions are: * `poweron`: Start a stopped Instance. * `poweroff`: Fully stop the Instance and release the hypervisor slot. * `stop_in_place`: Stop the Instance, but keep the slot on the hypervisor. * `reboot`: Stop the instance and restart it. * `backup`:  Create an image with all the volumes of an Instance. * `terminate`: Delete the Instance along with its attached local volumes. * `enable_routed_ip`: Migrate the Instance to the new network stack.  The `terminate` action will result in the deletion of `l_ssd` and `scratch` volumes types, `sbs_volume` volumes will only be detached. If you want to preserve your `l_ssd` volumes, you should stop your Instance, detach the volumes to be preserved, then delete your Instance.  The `backup` action can be done with: * No `volumes` key in the body: an image is created with snapshots of all the server volumes, except for the `scratch` volumes types. * `volumes` key in the body with a dictionary as value, in this dictionary volumes UUID as keys and empty dictionaries as values : an image is created with the snapshots of the volumes in `volumes` key. `scratch` volumes types can\'t be shapshotted.
     * @summary Perform action
     * @param {ServerActionZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {ServerActionRequest} serverActionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    serverAction(
      zone: ServerActionZoneEnum,
      serverId: string,
      serverActionRequest: ServerActionRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ServerActionResponse> {
      return localVarFp
        .serverAction(zone, serverId, serverActionRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the Instance information, such as name, boot mode, or tags.
     * @summary Update an Instance
     * @param {UpdateServerZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {UpdateServerRequest} updateServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateServer(
      zone: UpdateServerZoneEnum,
      serverId: string,
      updateServerRequest: UpdateServerRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1UpdateServerResponse> {
      return localVarFp
        .updateServer(zone, serverId, updateServerRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * InstancesApi - interface
 * @export
 * @interface InstancesApi
 */
export interface InstancesApiInterface {
  /**
   *
   * @summary Attach a filesystem volume to an Instance
   * @param {AttachServerFileSystemZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  attachServerFileSystem(
    zone: AttachServerFileSystemZoneEnum,
    serverId: string,
    attachServerFileSystemRequest: AttachServerFileSystemRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1AttachServerFileSystemResponse>;

  /**
   *
   * @summary Attach a volume to an Instance
   * @param {AttachServerVolumeZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {AttachServerVolumeRequest} attachServerVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  attachServerVolume(
    zone: AttachServerVolumeZoneEnum,
    serverId: string,
    attachServerVolumeRequest: AttachServerVolumeRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1AttachServerVolumeResponse>;

  /**
   * Create a new Instance of the specified commercial type in the specified zone. Pay attention to the volumes parameter, which takes an object which can be used in different ways to achieve different behaviors. Get more information in the [Technical Information](#technical-information) section of the introduction.
   * @summary Create an Instance
   * @param {CreateServerZoneEnum} zone The zone you want to target
   * @param {CreateServerRequest} createServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  createServer(
    zone: CreateServerZoneEnum,
    createServerRequest: CreateServerRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1CreateServerResponse>;

  /**
   * Delete the Instance with the specified ID.
   * @summary Delete an Instance
   * @param {DeleteServerZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  deleteServer(
    zone: DeleteServerZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   *
   * @summary Detach a filesystem volume from an Instance
   * @param {DetachServerFileSystemZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  detachServerFileSystem(
    zone: DetachServerFileSystemZoneEnum,
    serverId: string,
    attachServerFileSystemRequest: AttachServerFileSystemRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1DetachServerFileSystemResponse>;

  /**
   *
   * @summary Detach a volume from an Instance
   * @param {DetachServerVolumeZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {DetachServerVolumeRequest} detachServerVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  detachServerVolume(
    zone: DetachServerVolumeZoneEnum,
    serverId: string,
    detachServerVolumeRequest: DetachServerVolumeRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1DetachServerVolumeResponse>;

  /**
   * Get the details of a specified Instance.
   * @summary Get an Instance
   * @param {GetServerZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  getServer(
    zone: GetServerZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetServerResponse>;

  /**
   * Get compatible commercial types that can be used to update the Instance. The compatibility of an Instance offer is based on: * the CPU architecture * the OS type * the required l_ssd storage size * the required scratch storage size If the specified Instance offer is flagged as end of service, the best compatible offer is the first returned.
   * @summary Get Instance compatible types
   * @param {GetServerCompatibleTypesZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  getServerCompatibleTypes(
    zone: GetServerCompatibleTypesZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ServerCompatibleTypes>;

  /**
   * List all actions (e.g. power on, power off, reboot) that can currently be performed on an Instance.
   * @summary List Instance actions
   * @param {ListServerActionsZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  listServerActions(
    zone: ListServerActionsZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListServerActionsResponse>;

  /**
   * List all Instances in a specified Availability Zone, e.g. `fr-par-1`.
   * @summary List all Instances
   * @param {ListServersZoneEnum} zone The zone you want to target
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {string} [organization] List only Instances of this Organization ID.
   * @param {string} [project] List only Instances of this Project ID.
   * @param {string} [name] Filter Instances by name (eg. \&quot;server1\&quot; will return \&quot;server100\&quot; and \&quot;server1\&quot; but not \&quot;foo\&quot;).
   * @param {string} [privateIp] List Instances by private_ip. (IP address)
   * @param {boolean} [withoutIp] List Instances that are not attached to a public IP.
   * @param {string} [withIp] List Instances by IP (both private_ip and public_ip are supported). (IP address)
   * @param {string} [commercialType] List Instances of this commercial type.
   * @param {ListServersStateEnum} [state] List Instances in this state.
   * @param {string} [tags] List Instances with these exact tags (to filter with several tags, use commas to separate them).
   * @param {string} [privateNetwork] List Instances in this Private Network.
   * @param {ListServersOrderEnum} [order] Define the order of the returned servers.
   * @param {string} [privateNetworks] List Instances from the given Private Networks (use commas to separate them).
   * @param {string} [privateNicMacAddress] List Instances associated with the given private NIC MAC address.
   * @param {string} [servers] List Instances from these server ids (use commas to separate them).
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  listServers(
    zone: ListServersZoneEnum,
    perPage?: number,
    page?: number,
    organization?: string,
    project?: string,
    name?: string,
    privateIp?: string,
    withoutIp?: boolean,
    withIp?: string,
    commercialType?: string,
    state?: ListServersStateEnum,
    tags?: string,
    privateNetwork?: string,
    order?: ListServersOrderEnum,
    privateNetworks?: string,
    privateNicMacAddress?: string,
    servers?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListServersResponse>;

  /**
   * Perform an action on an Instance. Available actions are: * `poweron`: Start a stopped Instance. * `poweroff`: Fully stop the Instance and release the hypervisor slot. * `stop_in_place`: Stop the Instance, but keep the slot on the hypervisor. * `reboot`: Stop the instance and restart it. * `backup`:  Create an image with all the volumes of an Instance. * `terminate`: Delete the Instance along with its attached local volumes. * `enable_routed_ip`: Migrate the Instance to the new network stack.  The `terminate` action will result in the deletion of `l_ssd` and `scratch` volumes types, `sbs_volume` volumes will only be detached. If you want to preserve your `l_ssd` volumes, you should stop your Instance, detach the volumes to be preserved, then delete your Instance.  The `backup` action can be done with: * No `volumes` key in the body: an image is created with snapshots of all the server volumes, except for the `scratch` volumes types. * `volumes` key in the body with a dictionary as value, in this dictionary volumes UUID as keys and empty dictionaries as values : an image is created with the snapshots of the volumes in `volumes` key. `scratch` volumes types can\'t be shapshotted.
   * @summary Perform action
   * @param {ServerActionZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {ServerActionRequest} serverActionRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  serverAction(
    zone: ServerActionZoneEnum,
    serverId: string,
    serverActionRequest: ServerActionRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ServerActionResponse>;

  /**
   * Update the Instance information, such as name, boot mode, or tags.
   * @summary Update an Instance
   * @param {UpdateServerZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {UpdateServerRequest} updateServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  updateServer(
    zone: UpdateServerZoneEnum,
    serverId: string,
    updateServerRequest: UpdateServerRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1UpdateServerResponse>;
}

/**
 * InstancesApi - object-oriented interface
 * @export
 * @class InstancesApi
 * @extends {BaseAPI}
 */
export class InstancesApi extends BaseAPI implements InstancesApiInterface {
  /**
   *
   * @summary Attach a filesystem volume to an Instance
   * @param {AttachServerFileSystemZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public attachServerFileSystem(
    zone: AttachServerFileSystemZoneEnum,
    serverId: string,
    attachServerFileSystemRequest: AttachServerFileSystemRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .attachServerFileSystem(
        zone,
        serverId,
        attachServerFileSystemRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Attach a volume to an Instance
   * @param {AttachServerVolumeZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {AttachServerVolumeRequest} attachServerVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public attachServerVolume(
    zone: AttachServerVolumeZoneEnum,
    serverId: string,
    attachServerVolumeRequest: AttachServerVolumeRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .attachServerVolume(zone, serverId, attachServerVolumeRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a new Instance of the specified commercial type in the specified zone. Pay attention to the volumes parameter, which takes an object which can be used in different ways to achieve different behaviors. Get more information in the [Technical Information](#technical-information) section of the introduction.
   * @summary Create an Instance
   * @param {CreateServerZoneEnum} zone The zone you want to target
   * @param {CreateServerRequest} createServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public createServer(
    zone: CreateServerZoneEnum,
    createServerRequest: CreateServerRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .createServer(zone, createServerRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete the Instance with the specified ID.
   * @summary Delete an Instance
   * @param {DeleteServerZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public deleteServer(
    zone: DeleteServerZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .deleteServer(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Detach a filesystem volume from an Instance
   * @param {DetachServerFileSystemZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {AttachServerFileSystemRequest} attachServerFileSystemRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public detachServerFileSystem(
    zone: DetachServerFileSystemZoneEnum,
    serverId: string,
    attachServerFileSystemRequest: AttachServerFileSystemRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .detachServerFileSystem(
        zone,
        serverId,
        attachServerFileSystemRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Detach a volume from an Instance
   * @param {DetachServerVolumeZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {DetachServerVolumeRequest} detachServerVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public detachServerVolume(
    zone: DetachServerVolumeZoneEnum,
    serverId: string,
    detachServerVolumeRequest: DetachServerVolumeRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .detachServerVolume(zone, serverId, detachServerVolumeRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get the details of a specified Instance.
   * @summary Get an Instance
   * @param {GetServerZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public getServer(
    zone: GetServerZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .getServer(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get compatible commercial types that can be used to update the Instance. The compatibility of an Instance offer is based on: * the CPU architecture * the OS type * the required l_ssd storage size * the required scratch storage size If the specified Instance offer is flagged as end of service, the best compatible offer is the first returned.
   * @summary Get Instance compatible types
   * @param {GetServerCompatibleTypesZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public getServerCompatibleTypes(
    zone: GetServerCompatibleTypesZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .getServerCompatibleTypes(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all actions (e.g. power on, power off, reboot) that can currently be performed on an Instance.
   * @summary List Instance actions
   * @param {ListServerActionsZoneEnum} zone The zone you want to target
   * @param {string} serverId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public listServerActions(
    zone: ListServerActionsZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .listServerActions(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all Instances in a specified Availability Zone, e.g. `fr-par-1`.
   * @summary List all Instances
   * @param {ListServersZoneEnum} zone The zone you want to target
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {string} [organization] List only Instances of this Organization ID.
   * @param {string} [project] List only Instances of this Project ID.
   * @param {string} [name] Filter Instances by name (eg. \&quot;server1\&quot; will return \&quot;server100\&quot; and \&quot;server1\&quot; but not \&quot;foo\&quot;).
   * @param {string} [privateIp] List Instances by private_ip. (IP address)
   * @param {boolean} [withoutIp] List Instances that are not attached to a public IP.
   * @param {string} [withIp] List Instances by IP (both private_ip and public_ip are supported). (IP address)
   * @param {string} [commercialType] List Instances of this commercial type.
   * @param {ListServersStateEnum} [state] List Instances in this state.
   * @param {string} [tags] List Instances with these exact tags (to filter with several tags, use commas to separate them).
   * @param {string} [privateNetwork] List Instances in this Private Network.
   * @param {ListServersOrderEnum} [order] Define the order of the returned servers.
   * @param {string} [privateNetworks] List Instances from the given Private Networks (use commas to separate them).
   * @param {string} [privateNicMacAddress] List Instances associated with the given private NIC MAC address.
   * @param {string} [servers] List Instances from these server ids (use commas to separate them).
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public listServers(
    zone: ListServersZoneEnum,
    perPage?: number,
    page?: number,
    organization?: string,
    project?: string,
    name?: string,
    privateIp?: string,
    withoutIp?: boolean,
    withIp?: string,
    commercialType?: string,
    state?: ListServersStateEnum,
    tags?: string,
    privateNetwork?: string,
    order?: ListServersOrderEnum,
    privateNetworks?: string,
    privateNicMacAddress?: string,
    servers?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .listServers(
        zone,
        perPage,
        page,
        organization,
        project,
        name,
        privateIp,
        withoutIp,
        withIp,
        commercialType,
        state,
        tags,
        privateNetwork,
        order,
        privateNetworks,
        privateNicMacAddress,
        servers,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Perform an action on an Instance. Available actions are: * `poweron`: Start a stopped Instance. * `poweroff`: Fully stop the Instance and release the hypervisor slot. * `stop_in_place`: Stop the Instance, but keep the slot on the hypervisor. * `reboot`: Stop the instance and restart it. * `backup`:  Create an image with all the volumes of an Instance. * `terminate`: Delete the Instance along with its attached local volumes. * `enable_routed_ip`: Migrate the Instance to the new network stack.  The `terminate` action will result in the deletion of `l_ssd` and `scratch` volumes types, `sbs_volume` volumes will only be detached. If you want to preserve your `l_ssd` volumes, you should stop your Instance, detach the volumes to be preserved, then delete your Instance.  The `backup` action can be done with: * No `volumes` key in the body: an image is created with snapshots of all the server volumes, except for the `scratch` volumes types. * `volumes` key in the body with a dictionary as value, in this dictionary volumes UUID as keys and empty dictionaries as values : an image is created with the snapshots of the volumes in `volumes` key. `scratch` volumes types can\'t be shapshotted.
   * @summary Perform action
   * @param {ServerActionZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {ServerActionRequest} serverActionRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public serverAction(
    zone: ServerActionZoneEnum,
    serverId: string,
    serverActionRequest: ServerActionRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .serverAction(zone, serverId, serverActionRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the Instance information, such as name, boot mode, or tags.
   * @summary Update an Instance
   * @param {UpdateServerZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {UpdateServerRequest} updateServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public updateServer(
    zone: UpdateServerZoneEnum,
    serverId: string,
    updateServerRequest: UpdateServerRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .updateServer(zone, serverId, updateServerRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const AttachServerFileSystemZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type AttachServerFileSystemZoneEnum =
  (typeof AttachServerFileSystemZoneEnum)[keyof typeof AttachServerFileSystemZoneEnum];
/**
 * @export
 */
export const AttachServerVolumeZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type AttachServerVolumeZoneEnum =
  (typeof AttachServerVolumeZoneEnum)[keyof typeof AttachServerVolumeZoneEnum];
/**
 * @export
 */
export const CreateServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CreateServerZoneEnum =
  (typeof CreateServerZoneEnum)[keyof typeof CreateServerZoneEnum];
/**
 * @export
 */
export const DeleteServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeleteServerZoneEnum =
  (typeof DeleteServerZoneEnum)[keyof typeof DeleteServerZoneEnum];
/**
 * @export
 */
export const DetachServerFileSystemZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DetachServerFileSystemZoneEnum =
  (typeof DetachServerFileSystemZoneEnum)[keyof typeof DetachServerFileSystemZoneEnum];
/**
 * @export
 */
export const DetachServerVolumeZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DetachServerVolumeZoneEnum =
  (typeof DetachServerVolumeZoneEnum)[keyof typeof DetachServerVolumeZoneEnum];
/**
 * @export
 */
export const GetServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetServerZoneEnum =
  (typeof GetServerZoneEnum)[keyof typeof GetServerZoneEnum];
/**
 * @export
 */
export const GetServerCompatibleTypesZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetServerCompatibleTypesZoneEnum =
  (typeof GetServerCompatibleTypesZoneEnum)[keyof typeof GetServerCompatibleTypesZoneEnum];
/**
 * @export
 */
export const ListServerActionsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListServerActionsZoneEnum =
  (typeof ListServerActionsZoneEnum)[keyof typeof ListServerActionsZoneEnum];
/**
 * @export
 */
export const ListServersZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListServersZoneEnum =
  (typeof ListServersZoneEnum)[keyof typeof ListServersZoneEnum];
/**
 * @export
 */
export const ListServersStateEnum = {
  Running: 'running',
  Stopped: 'stopped',
  StoppedInPlace: 'stopped in place',
  Starting: 'starting',
  Stopping: 'stopping',
  Locked: 'locked',
} as const;
export type ListServersStateEnum =
  (typeof ListServersStateEnum)[keyof typeof ListServersStateEnum];
/**
 * @export
 */
export const ListServersOrderEnum = {
  CreationDateDesc: 'creation_date_desc',
  CreationDateAsc: 'creation_date_asc',
  ModificationDateDesc: 'modification_date_desc',
  ModificationDateAsc: 'modification_date_asc',
} as const;
export type ListServersOrderEnum =
  (typeof ListServersOrderEnum)[keyof typeof ListServersOrderEnum];
/**
 * @export
 */
export const ServerActionZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ServerActionZoneEnum =
  (typeof ServerActionZoneEnum)[keyof typeof ServerActionZoneEnum];
/**
 * @export
 */
export const UpdateServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdateServerZoneEnum =
  (typeof UpdateServerZoneEnum)[keyof typeof UpdateServerZoneEnum];

/**
 * PlacementGroupsApi - axios parameter creator
 * @export
 */
export const PlacementGroupsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new placement group in a specified Availability Zone.
     * @summary Create a placement group
     * @param {CreatePlacementGroupZoneEnum} zone The zone you want to target
     * @param {CreatePlacementGroupRequest} createPlacementGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPlacementGroup: async (
      zone: CreatePlacementGroupZoneEnum,
      createPlacementGroupRequest: CreatePlacementGroupRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createPlacementGroup', 'zone', zone);
      // verify required parameter 'createPlacementGroupRequest' is not null or undefined
      assertParamExists(
        'createPlacementGroup',
        'createPlacementGroupRequest',
        createPlacementGroupRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/placement_groups`.replace(
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
        createPlacementGroupRequest,
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
     * @summary Delete the specified placement group
     * @param {DeletePlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePlacementGroup: async (
      zone: DeletePlacementGroupZoneEnum,
      placementGroupId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deletePlacementGroup', 'zone', zone);
      // verify required parameter 'placementGroupId' is not null or undefined
      assertParamExists(
        'deletePlacementGroup',
        'placementGroupId',
        placementGroupId,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/placement_groups/{placement_group_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'placement_group_id'}}`,
            encodeURIComponent(String(placementGroupId)),
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
     * Get the specified placement group.
     * @summary Get a placement group
     * @param {GetPlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPlacementGroup: async (
      zone: GetPlacementGroupZoneEnum,
      placementGroupId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getPlacementGroup', 'zone', zone);
      // verify required parameter 'placementGroupId' is not null or undefined
      assertParamExists(
        'getPlacementGroup',
        'placementGroupId',
        placementGroupId,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/placement_groups/{placement_group_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'placement_group_id'}}`,
            encodeURIComponent(String(placementGroupId)),
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
     * Get all Instances belonging to the specified placement group.
     * @summary Get placement group servers
     * @param {GetPlacementGroupServersZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPlacementGroupServers: async (
      zone: GetPlacementGroupServersZoneEnum,
      placementGroupId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getPlacementGroupServers', 'zone', zone);
      // verify required parameter 'placementGroupId' is not null or undefined
      assertParamExists(
        'getPlacementGroupServers',
        'placementGroupId',
        placementGroupId,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/placement_groups/{placement_group_id}/servers`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'placement_group_id'}}`,
            encodeURIComponent(String(placementGroupId)),
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
     * List all placement groups in a specified Availability Zone.
     * @summary List placement groups
     * @param {ListPlacementGroupsZoneEnum} zone The zone you want to target
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [organization] List only placement groups of this Organization ID.
     * @param {string} [project] List only placement groups of this Project ID.
     * @param {string} [tags] List placement groups with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [name] Filter placement groups by name (for eg. \&quot;cluster1\&quot; will return \&quot;cluster100\&quot; and \&quot;cluster1\&quot; but not \&quot;foo\&quot;).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPlacementGroups: async (
      zone: ListPlacementGroupsZoneEnum,
      perPage?: number,
      page?: number,
      organization?: string,
      project?: string,
      tags?: string,
      name?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listPlacementGroups', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/placement_groups`.replace(
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

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (organization !== undefined) {
        localVarQueryParameter['organization'] = organization;
      }

      if (project !== undefined) {
        localVarQueryParameter['project'] = project;
      }

      if (tags !== undefined) {
        localVarQueryParameter['tags'] = tags;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
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
     * Set all parameters of the specified placement group.
     * @summary Set placement group
     * @param {SetPlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId
     * @param {SetPlacementGroupRequest} setPlacementGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setPlacementGroup: async (
      zone: SetPlacementGroupZoneEnum,
      placementGroupId: string,
      setPlacementGroupRequest: SetPlacementGroupRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setPlacementGroup', 'zone', zone);
      // verify required parameter 'placementGroupId' is not null or undefined
      assertParamExists(
        'setPlacementGroup',
        'placementGroupId',
        placementGroupId,
      );
      // verify required parameter 'setPlacementGroupRequest' is not null or undefined
      assertParamExists(
        'setPlacementGroup',
        'setPlacementGroupRequest',
        setPlacementGroupRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/placement_groups/{placement_group_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'placement_group_id'}}`,
            encodeURIComponent(String(placementGroupId)),
          );
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
        setPlacementGroupRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Set all Instances belonging to the specified placement group.
     * @summary Set placement group servers
     * @param {SetPlacementGroupServersZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to set.
     * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setPlacementGroupServers: async (
      zone: SetPlacementGroupServersZoneEnum,
      placementGroupId: string,
      setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setPlacementGroupServers', 'zone', zone);
      // verify required parameter 'placementGroupId' is not null or undefined
      assertParamExists(
        'setPlacementGroupServers',
        'placementGroupId',
        placementGroupId,
      );
      // verify required parameter 'setPlacementGroupServersRequest' is not null or undefined
      assertParamExists(
        'setPlacementGroupServers',
        'setPlacementGroupServersRequest',
        setPlacementGroupServersRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/placement_groups/{placement_group_id}/servers`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'placement_group_id'}}`,
            encodeURIComponent(String(placementGroupId)),
          );
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
        setPlacementGroupServersRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update one or more parameter of the specified placement group.
     * @summary Update a placement group
     * @param {UpdatePlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group.
     * @param {UpdatePlacementGroupRequest} updatePlacementGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePlacementGroup: async (
      zone: UpdatePlacementGroupZoneEnum,
      placementGroupId: string,
      updatePlacementGroupRequest: UpdatePlacementGroupRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updatePlacementGroup', 'zone', zone);
      // verify required parameter 'placementGroupId' is not null or undefined
      assertParamExists(
        'updatePlacementGroup',
        'placementGroupId',
        placementGroupId,
      );
      // verify required parameter 'updatePlacementGroupRequest' is not null or undefined
      assertParamExists(
        'updatePlacementGroup',
        'updatePlacementGroupRequest',
        updatePlacementGroupRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/placement_groups/{placement_group_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'placement_group_id'}}`,
            encodeURIComponent(String(placementGroupId)),
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
        updatePlacementGroupRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update all Instances belonging to the specified placement group.
     * @summary Update placement group servers
     * @param {UpdatePlacementGroupServersZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to update.
     * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePlacementGroupServers: async (
      zone: UpdatePlacementGroupServersZoneEnum,
      placementGroupId: string,
      setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updatePlacementGroupServers', 'zone', zone);
      // verify required parameter 'placementGroupId' is not null or undefined
      assertParamExists(
        'updatePlacementGroupServers',
        'placementGroupId',
        placementGroupId,
      );
      // verify required parameter 'setPlacementGroupServersRequest' is not null or undefined
      assertParamExists(
        'updatePlacementGroupServers',
        'setPlacementGroupServersRequest',
        setPlacementGroupServersRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/placement_groups/{placement_group_id}/servers`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'placement_group_id'}}`,
            encodeURIComponent(String(placementGroupId)),
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
        setPlacementGroupServersRequest,
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
 * PlacementGroupsApi - functional programming interface
 * @export
 */
export const PlacementGroupsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    PlacementGroupsApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new placement group in a specified Availability Zone.
     * @summary Create a placement group
     * @param {CreatePlacementGroupZoneEnum} zone The zone you want to target
     * @param {CreatePlacementGroupRequest} createPlacementGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createPlacementGroup(
      zone: CreatePlacementGroupZoneEnum,
      createPlacementGroupRequest: CreatePlacementGroupRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1CreatePlacementGroupResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createPlacementGroup(
          zone,
          createPlacementGroupRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PlacementGroupsApi.createPlacementGroup']?.[
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
     * @summary Delete the specified placement group
     * @param {DeletePlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deletePlacementGroup(
      zone: DeletePlacementGroupZoneEnum,
      placementGroupId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deletePlacementGroup(
          zone,
          placementGroupId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PlacementGroupsApi.deletePlacementGroup']?.[
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
     * Get the specified placement group.
     * @summary Get a placement group
     * @param {GetPlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getPlacementGroup(
      zone: GetPlacementGroupZoneEnum,
      placementGroupId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetPlacementGroupResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getPlacementGroup(
          zone,
          placementGroupId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PlacementGroupsApi.getPlacementGroup']?.[
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
     * Get all Instances belonging to the specified placement group.
     * @summary Get placement group servers
     * @param {GetPlacementGroupServersZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getPlacementGroupServers(
      zone: GetPlacementGroupServersZoneEnum,
      placementGroupId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetPlacementGroupServersResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getPlacementGroupServers(
          zone,
          placementGroupId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PlacementGroupsApi.getPlacementGroupServers']?.[
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
     * List all placement groups in a specified Availability Zone.
     * @summary List placement groups
     * @param {ListPlacementGroupsZoneEnum} zone The zone you want to target
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [organization] List only placement groups of this Organization ID.
     * @param {string} [project] List only placement groups of this Project ID.
     * @param {string} [tags] List placement groups with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [name] Filter placement groups by name (for eg. \&quot;cluster1\&quot; will return \&quot;cluster100\&quot; and \&quot;cluster1\&quot; but not \&quot;foo\&quot;).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listPlacementGroups(
      zone: ListPlacementGroupsZoneEnum,
      perPage?: number,
      page?: number,
      organization?: string,
      project?: string,
      tags?: string,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListPlacementGroupsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listPlacementGroups(
          zone,
          perPage,
          page,
          organization,
          project,
          tags,
          name,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PlacementGroupsApi.listPlacementGroups']?.[
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
     * Set all parameters of the specified placement group.
     * @summary Set placement group
     * @param {SetPlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId
     * @param {SetPlacementGroupRequest} setPlacementGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setPlacementGroup(
      zone: SetPlacementGroupZoneEnum,
      placementGroupId: string,
      setPlacementGroupRequest: SetPlacementGroupRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1SetPlacementGroupResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.setPlacementGroup(
          zone,
          placementGroupId,
          setPlacementGroupRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PlacementGroupsApi.setPlacementGroup']?.[
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
     * Set all Instances belonging to the specified placement group.
     * @summary Set placement group servers
     * @param {SetPlacementGroupServersZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to set.
     * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setPlacementGroupServers(
      zone: SetPlacementGroupServersZoneEnum,
      placementGroupId: string,
      setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1SetPlacementGroupServersResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.setPlacementGroupServers(
          zone,
          placementGroupId,
          setPlacementGroupServersRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PlacementGroupsApi.setPlacementGroupServers']?.[
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
     * Update one or more parameter of the specified placement group.
     * @summary Update a placement group
     * @param {UpdatePlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group.
     * @param {UpdatePlacementGroupRequest} updatePlacementGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updatePlacementGroup(
      zone: UpdatePlacementGroupZoneEnum,
      placementGroupId: string,
      updatePlacementGroupRequest: UpdatePlacementGroupRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1UpdatePlacementGroupResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updatePlacementGroup(
          zone,
          placementGroupId,
          updatePlacementGroupRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PlacementGroupsApi.updatePlacementGroup']?.[
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
     * Update all Instances belonging to the specified placement group.
     * @summary Update placement group servers
     * @param {UpdatePlacementGroupServersZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to update.
     * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updatePlacementGroupServers(
      zone: UpdatePlacementGroupServersZoneEnum,
      placementGroupId: string,
      setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1UpdatePlacementGroupServersResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updatePlacementGroupServers(
          zone,
          placementGroupId,
          setPlacementGroupServersRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PlacementGroupsApi.updatePlacementGroupServers']?.[
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
 * PlacementGroupsApi - factory interface
 * @export
 */
export const PlacementGroupsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = PlacementGroupsApiFp(configuration);
  return {
    /**
     * Create a new placement group in a specified Availability Zone.
     * @summary Create a placement group
     * @param {CreatePlacementGroupZoneEnum} zone The zone you want to target
     * @param {CreatePlacementGroupRequest} createPlacementGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPlacementGroup(
      zone: CreatePlacementGroupZoneEnum,
      createPlacementGroupRequest: CreatePlacementGroupRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1CreatePlacementGroupResponse> {
      return localVarFp
        .createPlacementGroup(zone, createPlacementGroupRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Delete the specified placement group
     * @param {DeletePlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePlacementGroup(
      zone: DeletePlacementGroupZoneEnum,
      placementGroupId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deletePlacementGroup(zone, placementGroupId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get the specified placement group.
     * @summary Get a placement group
     * @param {GetPlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPlacementGroup(
      zone: GetPlacementGroupZoneEnum,
      placementGroupId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetPlacementGroupResponse> {
      return localVarFp
        .getPlacementGroup(zone, placementGroupId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get all Instances belonging to the specified placement group.
     * @summary Get placement group servers
     * @param {GetPlacementGroupServersZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPlacementGroupServers(
      zone: GetPlacementGroupServersZoneEnum,
      placementGroupId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetPlacementGroupServersResponse> {
      return localVarFp
        .getPlacementGroupServers(zone, placementGroupId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all placement groups in a specified Availability Zone.
     * @summary List placement groups
     * @param {ListPlacementGroupsZoneEnum} zone The zone you want to target
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [organization] List only placement groups of this Organization ID.
     * @param {string} [project] List only placement groups of this Project ID.
     * @param {string} [tags] List placement groups with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [name] Filter placement groups by name (for eg. \&quot;cluster1\&quot; will return \&quot;cluster100\&quot; and \&quot;cluster1\&quot; but not \&quot;foo\&quot;).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPlacementGroups(
      zone: ListPlacementGroupsZoneEnum,
      perPage?: number,
      page?: number,
      organization?: string,
      project?: string,
      tags?: string,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListPlacementGroupsResponse> {
      return localVarFp
        .listPlacementGroups(
          zone,
          perPage,
          page,
          organization,
          project,
          tags,
          name,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Set all parameters of the specified placement group.
     * @summary Set placement group
     * @param {SetPlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId
     * @param {SetPlacementGroupRequest} setPlacementGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setPlacementGroup(
      zone: SetPlacementGroupZoneEnum,
      placementGroupId: string,
      setPlacementGroupRequest: SetPlacementGroupRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1SetPlacementGroupResponse> {
      return localVarFp
        .setPlacementGroup(
          zone,
          placementGroupId,
          setPlacementGroupRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Set all Instances belonging to the specified placement group.
     * @summary Set placement group servers
     * @param {SetPlacementGroupServersZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to set.
     * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setPlacementGroupServers(
      zone: SetPlacementGroupServersZoneEnum,
      placementGroupId: string,
      setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1SetPlacementGroupServersResponse> {
      return localVarFp
        .setPlacementGroupServers(
          zone,
          placementGroupId,
          setPlacementGroupServersRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update one or more parameter of the specified placement group.
     * @summary Update a placement group
     * @param {UpdatePlacementGroupZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group.
     * @param {UpdatePlacementGroupRequest} updatePlacementGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePlacementGroup(
      zone: UpdatePlacementGroupZoneEnum,
      placementGroupId: string,
      updatePlacementGroupRequest: UpdatePlacementGroupRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1UpdatePlacementGroupResponse> {
      return localVarFp
        .updatePlacementGroup(
          zone,
          placementGroupId,
          updatePlacementGroupRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update all Instances belonging to the specified placement group.
     * @summary Update placement group servers
     * @param {UpdatePlacementGroupServersZoneEnum} zone The zone you want to target
     * @param {string} placementGroupId UUID of the placement group you want to update.
     * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePlacementGroupServers(
      zone: UpdatePlacementGroupServersZoneEnum,
      placementGroupId: string,
      setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1UpdatePlacementGroupServersResponse> {
      return localVarFp
        .updatePlacementGroupServers(
          zone,
          placementGroupId,
          setPlacementGroupServersRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * PlacementGroupsApi - interface
 * @export
 * @interface PlacementGroupsApi
 */
export interface PlacementGroupsApiInterface {
  /**
   * Create a new placement group in a specified Availability Zone.
   * @summary Create a placement group
   * @param {CreatePlacementGroupZoneEnum} zone The zone you want to target
   * @param {CreatePlacementGroupRequest} createPlacementGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApiInterface
   */
  createPlacementGroup(
    zone: CreatePlacementGroupZoneEnum,
    createPlacementGroupRequest: CreatePlacementGroupRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1CreatePlacementGroupResponse>;

  /**
   *
   * @summary Delete the specified placement group
   * @param {DeletePlacementGroupZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApiInterface
   */
  deletePlacementGroup(
    zone: DeletePlacementGroupZoneEnum,
    placementGroupId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get the specified placement group.
   * @summary Get a placement group
   * @param {GetPlacementGroupZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApiInterface
   */
  getPlacementGroup(
    zone: GetPlacementGroupZoneEnum,
    placementGroupId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetPlacementGroupResponse>;

  /**
   * Get all Instances belonging to the specified placement group.
   * @summary Get placement group servers
   * @param {GetPlacementGroupServersZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApiInterface
   */
  getPlacementGroupServers(
    zone: GetPlacementGroupServersZoneEnum,
    placementGroupId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetPlacementGroupServersResponse>;

  /**
   * List all placement groups in a specified Availability Zone.
   * @summary List placement groups
   * @param {ListPlacementGroupsZoneEnum} zone The zone you want to target
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {string} [organization] List only placement groups of this Organization ID.
   * @param {string} [project] List only placement groups of this Project ID.
   * @param {string} [tags] List placement groups with these exact tags (to filter with several tags, use commas to separate them).
   * @param {string} [name] Filter placement groups by name (for eg. \&quot;cluster1\&quot; will return \&quot;cluster100\&quot; and \&quot;cluster1\&quot; but not \&quot;foo\&quot;).
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApiInterface
   */
  listPlacementGroups(
    zone: ListPlacementGroupsZoneEnum,
    perPage?: number,
    page?: number,
    organization?: string,
    project?: string,
    tags?: string,
    name?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListPlacementGroupsResponse>;

  /**
   * Set all parameters of the specified placement group.
   * @summary Set placement group
   * @param {SetPlacementGroupZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId
   * @param {SetPlacementGroupRequest} setPlacementGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApiInterface
   */
  setPlacementGroup(
    zone: SetPlacementGroupZoneEnum,
    placementGroupId: string,
    setPlacementGroupRequest: SetPlacementGroupRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1SetPlacementGroupResponse>;

  /**
   * Set all Instances belonging to the specified placement group.
   * @summary Set placement group servers
   * @param {SetPlacementGroupServersZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to set.
   * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApiInterface
   */
  setPlacementGroupServers(
    zone: SetPlacementGroupServersZoneEnum,
    placementGroupId: string,
    setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1SetPlacementGroupServersResponse>;

  /**
   * Update one or more parameter of the specified placement group.
   * @summary Update a placement group
   * @param {UpdatePlacementGroupZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group.
   * @param {UpdatePlacementGroupRequest} updatePlacementGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApiInterface
   */
  updatePlacementGroup(
    zone: UpdatePlacementGroupZoneEnum,
    placementGroupId: string,
    updatePlacementGroupRequest: UpdatePlacementGroupRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1UpdatePlacementGroupResponse>;

  /**
   * Update all Instances belonging to the specified placement group.
   * @summary Update placement group servers
   * @param {UpdatePlacementGroupServersZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to update.
   * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApiInterface
   */
  updatePlacementGroupServers(
    zone: UpdatePlacementGroupServersZoneEnum,
    placementGroupId: string,
    setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1UpdatePlacementGroupServersResponse>;
}

/**
 * PlacementGroupsApi - object-oriented interface
 * @export
 * @class PlacementGroupsApi
 * @extends {BaseAPI}
 */
export class PlacementGroupsApi
  extends BaseAPI
  implements PlacementGroupsApiInterface
{
  /**
   * Create a new placement group in a specified Availability Zone.
   * @summary Create a placement group
   * @param {CreatePlacementGroupZoneEnum} zone The zone you want to target
   * @param {CreatePlacementGroupRequest} createPlacementGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApi
   */
  public createPlacementGroup(
    zone: CreatePlacementGroupZoneEnum,
    createPlacementGroupRequest: CreatePlacementGroupRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PlacementGroupsApiFp(this.configuration)
      .createPlacementGroup(zone, createPlacementGroupRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Delete the specified placement group
   * @param {DeletePlacementGroupZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApi
   */
  public deletePlacementGroup(
    zone: DeletePlacementGroupZoneEnum,
    placementGroupId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PlacementGroupsApiFp(this.configuration)
      .deletePlacementGroup(zone, placementGroupId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get the specified placement group.
   * @summary Get a placement group
   * @param {GetPlacementGroupZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApi
   */
  public getPlacementGroup(
    zone: GetPlacementGroupZoneEnum,
    placementGroupId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PlacementGroupsApiFp(this.configuration)
      .getPlacementGroup(zone, placementGroupId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get all Instances belonging to the specified placement group.
   * @summary Get placement group servers
   * @param {GetPlacementGroupServersZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApi
   */
  public getPlacementGroupServers(
    zone: GetPlacementGroupServersZoneEnum,
    placementGroupId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PlacementGroupsApiFp(this.configuration)
      .getPlacementGroupServers(zone, placementGroupId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all placement groups in a specified Availability Zone.
   * @summary List placement groups
   * @param {ListPlacementGroupsZoneEnum} zone The zone you want to target
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {string} [organization] List only placement groups of this Organization ID.
   * @param {string} [project] List only placement groups of this Project ID.
   * @param {string} [tags] List placement groups with these exact tags (to filter with several tags, use commas to separate them).
   * @param {string} [name] Filter placement groups by name (for eg. \&quot;cluster1\&quot; will return \&quot;cluster100\&quot; and \&quot;cluster1\&quot; but not \&quot;foo\&quot;).
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApi
   */
  public listPlacementGroups(
    zone: ListPlacementGroupsZoneEnum,
    perPage?: number,
    page?: number,
    organization?: string,
    project?: string,
    tags?: string,
    name?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PlacementGroupsApiFp(this.configuration)
      .listPlacementGroups(
        zone,
        perPage,
        page,
        organization,
        project,
        tags,
        name,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Set all parameters of the specified placement group.
   * @summary Set placement group
   * @param {SetPlacementGroupZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId
   * @param {SetPlacementGroupRequest} setPlacementGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApi
   */
  public setPlacementGroup(
    zone: SetPlacementGroupZoneEnum,
    placementGroupId: string,
    setPlacementGroupRequest: SetPlacementGroupRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PlacementGroupsApiFp(this.configuration)
      .setPlacementGroup(
        zone,
        placementGroupId,
        setPlacementGroupRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Set all Instances belonging to the specified placement group.
   * @summary Set placement group servers
   * @param {SetPlacementGroupServersZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to set.
   * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApi
   */
  public setPlacementGroupServers(
    zone: SetPlacementGroupServersZoneEnum,
    placementGroupId: string,
    setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PlacementGroupsApiFp(this.configuration)
      .setPlacementGroupServers(
        zone,
        placementGroupId,
        setPlacementGroupServersRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update one or more parameter of the specified placement group.
   * @summary Update a placement group
   * @param {UpdatePlacementGroupZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group.
   * @param {UpdatePlacementGroupRequest} updatePlacementGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApi
   */
  public updatePlacementGroup(
    zone: UpdatePlacementGroupZoneEnum,
    placementGroupId: string,
    updatePlacementGroupRequest: UpdatePlacementGroupRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PlacementGroupsApiFp(this.configuration)
      .updatePlacementGroup(
        zone,
        placementGroupId,
        updatePlacementGroupRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update all Instances belonging to the specified placement group.
   * @summary Update placement group servers
   * @param {UpdatePlacementGroupServersZoneEnum} zone The zone you want to target
   * @param {string} placementGroupId UUID of the placement group you want to update.
   * @param {SetPlacementGroupServersRequest} setPlacementGroupServersRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PlacementGroupsApi
   */
  public updatePlacementGroupServers(
    zone: UpdatePlacementGroupServersZoneEnum,
    placementGroupId: string,
    setPlacementGroupServersRequest: SetPlacementGroupServersRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PlacementGroupsApiFp(this.configuration)
      .updatePlacementGroupServers(
        zone,
        placementGroupId,
        setPlacementGroupServersRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CreatePlacementGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CreatePlacementGroupZoneEnum =
  (typeof CreatePlacementGroupZoneEnum)[keyof typeof CreatePlacementGroupZoneEnum];
/**
 * @export
 */
export const DeletePlacementGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeletePlacementGroupZoneEnum =
  (typeof DeletePlacementGroupZoneEnum)[keyof typeof DeletePlacementGroupZoneEnum];
/**
 * @export
 */
export const GetPlacementGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetPlacementGroupZoneEnum =
  (typeof GetPlacementGroupZoneEnum)[keyof typeof GetPlacementGroupZoneEnum];
/**
 * @export
 */
export const GetPlacementGroupServersZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetPlacementGroupServersZoneEnum =
  (typeof GetPlacementGroupServersZoneEnum)[keyof typeof GetPlacementGroupServersZoneEnum];
/**
 * @export
 */
export const ListPlacementGroupsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListPlacementGroupsZoneEnum =
  (typeof ListPlacementGroupsZoneEnum)[keyof typeof ListPlacementGroupsZoneEnum];
/**
 * @export
 */
export const SetPlacementGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type SetPlacementGroupZoneEnum =
  (typeof SetPlacementGroupZoneEnum)[keyof typeof SetPlacementGroupZoneEnum];
/**
 * @export
 */
export const SetPlacementGroupServersZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type SetPlacementGroupServersZoneEnum =
  (typeof SetPlacementGroupServersZoneEnum)[keyof typeof SetPlacementGroupServersZoneEnum];
/**
 * @export
 */
export const UpdatePlacementGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdatePlacementGroupZoneEnum =
  (typeof UpdatePlacementGroupZoneEnum)[keyof typeof UpdatePlacementGroupZoneEnum];
/**
 * @export
 */
export const UpdatePlacementGroupServersZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdatePlacementGroupServersZoneEnum =
  (typeof UpdatePlacementGroupServersZoneEnum)[keyof typeof UpdatePlacementGroupServersZoneEnum];

/**
 * PrivateNICsApi - axios parameter creator
 * @export
 */
export const PrivateNICsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     *
     * @summary Create a private NIC connecting an Instance to a Private Network
     * @param {CreatePrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance the private NIC will be attached to.
     * @param {CreatePrivateNICRequest} createPrivateNICRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPrivateNIC: async (
      zone: CreatePrivateNICZoneEnum,
      serverId: string,
      createPrivateNICRequest: CreatePrivateNICRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createPrivateNIC', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('createPrivateNIC', 'serverId', serverId);
      // verify required parameter 'createPrivateNICRequest' is not null or undefined
      assertParamExists(
        'createPrivateNIC',
        'createPrivateNICRequest',
        createPrivateNICRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/private_nics`
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
        createPrivateNICRequest,
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
     * @summary Delete a private NIC
     * @param {DeletePrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId Instance to which the private NIC is attached.
     * @param {string} privateNicId Private NIC unique ID.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePrivateNIC: async (
      zone: DeletePrivateNICZoneEnum,
      serverId: string,
      privateNicId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deletePrivateNIC', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('deletePrivateNIC', 'serverId', serverId);
      // verify required parameter 'privateNicId' is not null or undefined
      assertParamExists('deletePrivateNIC', 'privateNicId', privateNicId);
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/private_nics/{private_nic_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(
            `{${'private_nic_id'}}`,
            encodeURIComponent(String(privateNicId)),
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
     * Get private NIC properties.
     * @summary Get a private NIC
     * @param {GetPrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId Instance to which the private NIC is attached.
     * @param {string} privateNicId Private NIC unique ID.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPrivateNIC: async (
      zone: GetPrivateNICZoneEnum,
      serverId: string,
      privateNicId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getPrivateNIC', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('getPrivateNIC', 'serverId', serverId);
      // verify required parameter 'privateNicId' is not null or undefined
      assertParamExists('getPrivateNIC', 'privateNicId', privateNicId);
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/private_nics/{private_nic_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(
            `{${'private_nic_id'}}`,
            encodeURIComponent(String(privateNicId)),
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
     * List all private NICs of a specified Instance.
     * @summary List all private NICs
     * @param {ListPrivateNICsZoneEnum} zone The zone you want to target
     * @param {string} serverId Instance to which the private NIC is attached.
     * @param {string} [tags] Private NIC tags.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPrivateNICs: async (
      zone: ListPrivateNICsZoneEnum,
      serverId: string,
      tags?: string,
      perPage?: number,
      page?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listPrivateNICs', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('listPrivateNICs', 'serverId', serverId);
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/private_nics`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)));
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

      if (tags !== undefined) {
        localVarQueryParameter['tags'] = tags;
      }

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
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
     * Update one or more parameter(s) of a specified private NIC.
     * @summary Update a private NIC
     * @param {UpdatePrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance the private NIC will be attached to.
     * @param {string} privateNicId Private NIC unique ID.
     * @param {UpdatePrivateNICRequest} updatePrivateNICRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePrivateNIC: async (
      zone: UpdatePrivateNICZoneEnum,
      serverId: string,
      privateNicId: string,
      updatePrivateNICRequest: UpdatePrivateNICRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updatePrivateNIC', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('updatePrivateNIC', 'serverId', serverId);
      // verify required parameter 'privateNicId' is not null or undefined
      assertParamExists('updatePrivateNIC', 'privateNicId', privateNicId);
      // verify required parameter 'updatePrivateNICRequest' is not null or undefined
      assertParamExists(
        'updatePrivateNIC',
        'updatePrivateNICRequest',
        updatePrivateNICRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/private_nics/{private_nic_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(
            `{${'private_nic_id'}}`,
            encodeURIComponent(String(privateNicId)),
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
        updatePrivateNICRequest,
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
 * PrivateNICsApi - functional programming interface
 * @export
 */
export const PrivateNICsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    PrivateNICsApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @summary Create a private NIC connecting an Instance to a Private Network
     * @param {CreatePrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance the private NIC will be attached to.
     * @param {CreatePrivateNICRequest} createPrivateNICRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createPrivateNIC(
      zone: CreatePrivateNICZoneEnum,
      serverId: string,
      createPrivateNICRequest: CreatePrivateNICRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1CreatePrivateNICResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createPrivateNIC(
          zone,
          serverId,
          createPrivateNICRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNICsApi.createPrivateNIC']?.[
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
     * @summary Delete a private NIC
     * @param {DeletePrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId Instance to which the private NIC is attached.
     * @param {string} privateNicId Private NIC unique ID.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deletePrivateNIC(
      zone: DeletePrivateNICZoneEnum,
      serverId: string,
      privateNicId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deletePrivateNIC(
          zone,
          serverId,
          privateNicId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNICsApi.deletePrivateNIC']?.[
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
     * Get private NIC properties.
     * @summary Get a private NIC
     * @param {GetPrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId Instance to which the private NIC is attached.
     * @param {string} privateNicId Private NIC unique ID.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getPrivateNIC(
      zone: GetPrivateNICZoneEnum,
      serverId: string,
      privateNicId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetPrivateNICResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getPrivateNIC(
        zone,
        serverId,
        privateNicId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNICsApi.getPrivateNIC']?.[
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
     * List all private NICs of a specified Instance.
     * @summary List all private NICs
     * @param {ListPrivateNICsZoneEnum} zone The zone you want to target
     * @param {string} serverId Instance to which the private NIC is attached.
     * @param {string} [tags] Private NIC tags.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listPrivateNICs(
      zone: ListPrivateNICsZoneEnum,
      serverId: string,
      tags?: string,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListPrivateNICsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listPrivateNICs(
        zone,
        serverId,
        tags,
        perPage,
        page,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNICsApi.listPrivateNICs']?.[
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
     * Update one or more parameter(s) of a specified private NIC.
     * @summary Update a private NIC
     * @param {UpdatePrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance the private NIC will be attached to.
     * @param {string} privateNicId Private NIC unique ID.
     * @param {UpdatePrivateNICRequest} updatePrivateNICRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updatePrivateNIC(
      zone: UpdatePrivateNICZoneEnum,
      serverId: string,
      privateNicId: string,
      updatePrivateNICRequest: UpdatePrivateNICRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1PrivateNIC>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updatePrivateNIC(
          zone,
          serverId,
          privateNicId,
          updatePrivateNICRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNICsApi.updatePrivateNIC']?.[
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
 * PrivateNICsApi - factory interface
 * @export
 */
export const PrivateNICsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = PrivateNICsApiFp(configuration);
  return {
    /**
     *
     * @summary Create a private NIC connecting an Instance to a Private Network
     * @param {CreatePrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance the private NIC will be attached to.
     * @param {CreatePrivateNICRequest} createPrivateNICRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPrivateNIC(
      zone: CreatePrivateNICZoneEnum,
      serverId: string,
      createPrivateNICRequest: CreatePrivateNICRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1CreatePrivateNICResponse> {
      return localVarFp
        .createPrivateNIC(zone, serverId, createPrivateNICRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Delete a private NIC
     * @param {DeletePrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId Instance to which the private NIC is attached.
     * @param {string} privateNicId Private NIC unique ID.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePrivateNIC(
      zone: DeletePrivateNICZoneEnum,
      serverId: string,
      privateNicId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deletePrivateNIC(zone, serverId, privateNicId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get private NIC properties.
     * @summary Get a private NIC
     * @param {GetPrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId Instance to which the private NIC is attached.
     * @param {string} privateNicId Private NIC unique ID.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPrivateNIC(
      zone: GetPrivateNICZoneEnum,
      serverId: string,
      privateNicId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetPrivateNICResponse> {
      return localVarFp
        .getPrivateNIC(zone, serverId, privateNicId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all private NICs of a specified Instance.
     * @summary List all private NICs
     * @param {ListPrivateNICsZoneEnum} zone The zone you want to target
     * @param {string} serverId Instance to which the private NIC is attached.
     * @param {string} [tags] Private NIC tags.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPrivateNICs(
      zone: ListPrivateNICsZoneEnum,
      serverId: string,
      tags?: string,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListPrivateNICsResponse> {
      return localVarFp
        .listPrivateNICs(zone, serverId, tags, perPage, page, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update one or more parameter(s) of a specified private NIC.
     * @summary Update a private NIC
     * @param {UpdatePrivateNICZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance the private NIC will be attached to.
     * @param {string} privateNicId Private NIC unique ID.
     * @param {UpdatePrivateNICRequest} updatePrivateNICRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePrivateNIC(
      zone: UpdatePrivateNICZoneEnum,
      serverId: string,
      privateNicId: string,
      updatePrivateNICRequest: UpdatePrivateNICRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1PrivateNIC> {
      return localVarFp
        .updatePrivateNIC(
          zone,
          serverId,
          privateNicId,
          updatePrivateNICRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * PrivateNICsApi - interface
 * @export
 * @interface PrivateNICsApi
 */
export interface PrivateNICsApiInterface {
  /**
   *
   * @summary Create a private NIC connecting an Instance to a Private Network
   * @param {CreatePrivateNICZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance the private NIC will be attached to.
   * @param {CreatePrivateNICRequest} createPrivateNICRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApiInterface
   */
  createPrivateNIC(
    zone: CreatePrivateNICZoneEnum,
    serverId: string,
    createPrivateNICRequest: CreatePrivateNICRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1CreatePrivateNICResponse>;

  /**
   *
   * @summary Delete a private NIC
   * @param {DeletePrivateNICZoneEnum} zone The zone you want to target
   * @param {string} serverId Instance to which the private NIC is attached.
   * @param {string} privateNicId Private NIC unique ID.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApiInterface
   */
  deletePrivateNIC(
    zone: DeletePrivateNICZoneEnum,
    serverId: string,
    privateNicId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get private NIC properties.
   * @summary Get a private NIC
   * @param {GetPrivateNICZoneEnum} zone The zone you want to target
   * @param {string} serverId Instance to which the private NIC is attached.
   * @param {string} privateNicId Private NIC unique ID.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApiInterface
   */
  getPrivateNIC(
    zone: GetPrivateNICZoneEnum,
    serverId: string,
    privateNicId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetPrivateNICResponse>;

  /**
   * List all private NICs of a specified Instance.
   * @summary List all private NICs
   * @param {ListPrivateNICsZoneEnum} zone The zone you want to target
   * @param {string} serverId Instance to which the private NIC is attached.
   * @param {string} [tags] Private NIC tags.
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApiInterface
   */
  listPrivateNICs(
    zone: ListPrivateNICsZoneEnum,
    serverId: string,
    tags?: string,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListPrivateNICsResponse>;

  /**
   * Update one or more parameter(s) of a specified private NIC.
   * @summary Update a private NIC
   * @param {UpdatePrivateNICZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance the private NIC will be attached to.
   * @param {string} privateNicId Private NIC unique ID.
   * @param {UpdatePrivateNICRequest} updatePrivateNICRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApiInterface
   */
  updatePrivateNIC(
    zone: UpdatePrivateNICZoneEnum,
    serverId: string,
    privateNicId: string,
    updatePrivateNICRequest: UpdatePrivateNICRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1PrivateNIC>;
}

/**
 * PrivateNICsApi - object-oriented interface
 * @export
 * @class PrivateNICsApi
 * @extends {BaseAPI}
 */
export class PrivateNICsApi extends BaseAPI implements PrivateNICsApiInterface {
  /**
   *
   * @summary Create a private NIC connecting an Instance to a Private Network
   * @param {CreatePrivateNICZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance the private NIC will be attached to.
   * @param {CreatePrivateNICRequest} createPrivateNICRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApi
   */
  public createPrivateNIC(
    zone: CreatePrivateNICZoneEnum,
    serverId: string,
    createPrivateNICRequest: CreatePrivateNICRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNICsApiFp(this.configuration)
      .createPrivateNIC(zone, serverId, createPrivateNICRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Delete a private NIC
   * @param {DeletePrivateNICZoneEnum} zone The zone you want to target
   * @param {string} serverId Instance to which the private NIC is attached.
   * @param {string} privateNicId Private NIC unique ID.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApi
   */
  public deletePrivateNIC(
    zone: DeletePrivateNICZoneEnum,
    serverId: string,
    privateNicId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNICsApiFp(this.configuration)
      .deletePrivateNIC(zone, serverId, privateNicId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get private NIC properties.
   * @summary Get a private NIC
   * @param {GetPrivateNICZoneEnum} zone The zone you want to target
   * @param {string} serverId Instance to which the private NIC is attached.
   * @param {string} privateNicId Private NIC unique ID.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApi
   */
  public getPrivateNIC(
    zone: GetPrivateNICZoneEnum,
    serverId: string,
    privateNicId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNICsApiFp(this.configuration)
      .getPrivateNIC(zone, serverId, privateNicId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all private NICs of a specified Instance.
   * @summary List all private NICs
   * @param {ListPrivateNICsZoneEnum} zone The zone you want to target
   * @param {string} serverId Instance to which the private NIC is attached.
   * @param {string} [tags] Private NIC tags.
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApi
   */
  public listPrivateNICs(
    zone: ListPrivateNICsZoneEnum,
    serverId: string,
    tags?: string,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNICsApiFp(this.configuration)
      .listPrivateNICs(zone, serverId, tags, perPage, page, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update one or more parameter(s) of a specified private NIC.
   * @summary Update a private NIC
   * @param {UpdatePrivateNICZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance the private NIC will be attached to.
   * @param {string} privateNicId Private NIC unique ID.
   * @param {UpdatePrivateNICRequest} updatePrivateNICRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNICsApi
   */
  public updatePrivateNIC(
    zone: UpdatePrivateNICZoneEnum,
    serverId: string,
    privateNicId: string,
    updatePrivateNICRequest: UpdatePrivateNICRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNICsApiFp(this.configuration)
      .updatePrivateNIC(
        zone,
        serverId,
        privateNicId,
        updatePrivateNICRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CreatePrivateNICZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CreatePrivateNICZoneEnum =
  (typeof CreatePrivateNICZoneEnum)[keyof typeof CreatePrivateNICZoneEnum];
/**
 * @export
 */
export const DeletePrivateNICZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeletePrivateNICZoneEnum =
  (typeof DeletePrivateNICZoneEnum)[keyof typeof DeletePrivateNICZoneEnum];
/**
 * @export
 */
export const GetPrivateNICZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetPrivateNICZoneEnum =
  (typeof GetPrivateNICZoneEnum)[keyof typeof GetPrivateNICZoneEnum];
/**
 * @export
 */
export const ListPrivateNICsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListPrivateNICsZoneEnum =
  (typeof ListPrivateNICsZoneEnum)[keyof typeof ListPrivateNICsZoneEnum];
/**
 * @export
 */
export const UpdatePrivateNICZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdatePrivateNICZoneEnum =
  (typeof UpdatePrivateNICZoneEnum)[keyof typeof UpdatePrivateNICZoneEnum];

/**
 * SecurityGroupsApi - axios parameter creator
 * @export
 */
export const SecurityGroupsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a security group with a specified name and description.
     * @summary Create a security group
     * @param {CreateSecurityGroupZoneEnum} zone The zone you want to target
     * @param {CreateSecurityGroupRequest} createSecurityGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSecurityGroup: async (
      zone: CreateSecurityGroupZoneEnum,
      createSecurityGroupRequest: CreateSecurityGroupRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createSecurityGroup', 'zone', zone);
      // verify required parameter 'createSecurityGroupRequest' is not null or undefined
      assertParamExists(
        'createSecurityGroup',
        'createSecurityGroupRequest',
        createSecurityGroupRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/security_groups`.replace(
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
        createSecurityGroupRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Create a rule in the specified security group ID.
     * @summary Create rule
     * @param {CreateSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group.
     * @param {CreateSecurityGroupRuleRequest} createSecurityGroupRuleRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSecurityGroupRule: async (
      zone: CreateSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      createSecurityGroupRuleRequest: CreateSecurityGroupRuleRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createSecurityGroupRule', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists(
        'createSecurityGroupRule',
        'securityGroupId',
        securityGroupId,
      );
      // verify required parameter 'createSecurityGroupRuleRequest' is not null or undefined
      assertParamExists(
        'createSecurityGroupRule',
        'createSecurityGroupRuleRequest',
        createSecurityGroupRuleRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}/rules`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
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
        createSecurityGroupRuleRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete a security group with the specified ID.
     * @summary Delete a security group
     * @param {DeleteSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecurityGroup: async (
      zone: DeleteSecurityGroupZoneEnum,
      securityGroupId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteSecurityGroup', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists(
        'deleteSecurityGroup',
        'securityGroupId',
        securityGroupId,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
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
     * Delete a security group rule with the specified ID.
     * @summary Delete rule
     * @param {DeleteSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId
     * @param {string} securityGroupRuleId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecurityGroupRule: async (
      zone: DeleteSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteSecurityGroupRule', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists(
        'deleteSecurityGroupRule',
        'securityGroupId',
        securityGroupId,
      );
      // verify required parameter 'securityGroupRuleId' is not null or undefined
      assertParamExists(
        'deleteSecurityGroupRule',
        'securityGroupRuleId',
        securityGroupRuleId,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}/rules/{security_group_rule_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
          )
          .replace(
            `{${'security_group_rule_id'}}`,
            encodeURIComponent(String(securityGroupRuleId)),
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
     * Get the details of a security group with the specified ID.
     * @summary Get a security group
     * @param {GetSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSecurityGroup: async (
      zone: GetSecurityGroupZoneEnum,
      securityGroupId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getSecurityGroup', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists('getSecurityGroup', 'securityGroupId', securityGroupId);
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
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
     * Get details of a security group rule with the specified ID.
     * @summary Get rule
     * @param {GetSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId
     * @param {string} securityGroupRuleId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSecurityGroupRule: async (
      zone: GetSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getSecurityGroupRule', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists(
        'getSecurityGroupRule',
        'securityGroupId',
        securityGroupId,
      );
      // verify required parameter 'securityGroupRuleId' is not null or undefined
      assertParamExists(
        'getSecurityGroupRule',
        'securityGroupRuleId',
        securityGroupRuleId,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}/rules/{security_group_rule_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
          )
          .replace(
            `{${'security_group_rule_id'}}`,
            encodeURIComponent(String(securityGroupRuleId)),
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
     * Lists the default rules applied to all the security groups.
     * @summary Get default rules
     * @param {ListDefaultSecurityGroupRulesZoneEnum} zone The zone you want to target
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDefaultSecurityGroupRules: async (
      zone: ListDefaultSecurityGroupRulesZoneEnum,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listDefaultSecurityGroupRules', 'zone', zone);
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/default/rules`.replace(
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
     * List the rules of the a specified security group ID.
     * @summary List rules
     * @param {ListSecurityGroupRulesZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSecurityGroupRules: async (
      zone: ListSecurityGroupRulesZoneEnum,
      securityGroupId: string,
      perPage?: number,
      page?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listSecurityGroupRules', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists(
        'listSecurityGroupRules',
        'securityGroupId',
        securityGroupId,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}/rules`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
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

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
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
     * List all existing security groups.
     * @summary List security groups
     * @param {ListSecurityGroupsZoneEnum} zone The zone you want to target
     * @param {string} [name] Name of the security group.
     * @param {string} [organization] Security group Organization ID.
     * @param {string} [project] Security group Project ID.
     * @param {string} [tags] List security groups with these exact tags (to filter with several tags, use commas to separate them).
     * @param {boolean} [projectDefault] Filter security groups with this value for project_default.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSecurityGroups: async (
      zone: ListSecurityGroupsZoneEnum,
      name?: string,
      organization?: string,
      project?: string,
      tags?: string,
      projectDefault?: boolean,
      perPage?: number,
      page?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listSecurityGroups', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/security_groups`.replace(
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

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (organization !== undefined) {
        localVarQueryParameter['organization'] = organization;
      }

      if (project !== undefined) {
        localVarQueryParameter['project'] = project;
      }

      if (tags !== undefined) {
        localVarQueryParameter['tags'] = tags;
      }

      if (projectDefault !== undefined) {
        localVarQueryParameter['project_default'] = projectDefault;
      }

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
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
     * Replace all security group properties with a security group message.
     * @summary Update a security group
     * @param {SetSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} id UUID of the security group.
     * @param {SetSecurityGroupRequest} setSecurityGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setSecurityGroup: async (
      zone: SetSecurityGroupZoneEnum,
      id: string,
      setSecurityGroupRequest: SetSecurityGroupRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setSecurityGroup', 'zone', zone);
      // verify required parameter 'id' is not null or undefined
      assertParamExists('setSecurityGroup', 'id', id);
      // verify required parameter 'setSecurityGroupRequest' is not null or undefined
      assertParamExists(
        'setSecurityGroup',
        'setSecurityGroupRequest',
        setSecurityGroupRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/security_groups/{id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'id'}}`, encodeURIComponent(String(id)));
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
        setSecurityGroupRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Replace all the properties of a rule from a specified security group.
     * @summary Set security group rule
     * @param {SetSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId
     * @param {string} securityGroupRuleId
     * @param {SetSecurityGroupRuleRequest} setSecurityGroupRuleRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setSecurityGroupRule: async (
      zone: SetSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      setSecurityGroupRuleRequest: SetSecurityGroupRuleRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setSecurityGroupRule', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists(
        'setSecurityGroupRule',
        'securityGroupId',
        securityGroupId,
      );
      // verify required parameter 'securityGroupRuleId' is not null or undefined
      assertParamExists(
        'setSecurityGroupRule',
        'securityGroupRuleId',
        securityGroupRuleId,
      );
      // verify required parameter 'setSecurityGroupRuleRequest' is not null or undefined
      assertParamExists(
        'setSecurityGroupRule',
        'setSecurityGroupRuleRequest',
        setSecurityGroupRuleRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}/rules/{security_group_rule_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
          )
          .replace(
            `{${'security_group_rule_id'}}`,
            encodeURIComponent(String(securityGroupRuleId)),
          );
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
        setSecurityGroupRuleRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Replaces the existing rules of the security group with the rules provided. This endpoint supports the update of existing rules, creation of new rules and deletion of existing rules when they are not passed in the request.
     * @summary Update all the rules of a security group
     * @param {SetSecurityGroupRulesZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group to update the rules on.
     * @param {SetSecurityGroupRulesRequest} setSecurityGroupRulesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setSecurityGroupRules: async (
      zone: SetSecurityGroupRulesZoneEnum,
      securityGroupId: string,
      setSecurityGroupRulesRequest: SetSecurityGroupRulesRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setSecurityGroupRules', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists(
        'setSecurityGroupRules',
        'securityGroupId',
        securityGroupId,
      );
      // verify required parameter 'setSecurityGroupRulesRequest' is not null or undefined
      assertParamExists(
        'setSecurityGroupRules',
        'setSecurityGroupRulesRequest',
        setSecurityGroupRulesRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}/rules`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
          );
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
        setSecurityGroupRulesRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the properties of security group.
     * @summary Update a security group
     * @param {UpdateSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group. (UUID format)
     * @param {UpdateSecurityGroupRequest} updateSecurityGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSecurityGroup: async (
      zone: UpdateSecurityGroupZoneEnum,
      securityGroupId: string,
      updateSecurityGroupRequest: UpdateSecurityGroupRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateSecurityGroup', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists(
        'updateSecurityGroup',
        'securityGroupId',
        securityGroupId,
      );
      // verify required parameter 'updateSecurityGroupRequest' is not null or undefined
      assertParamExists(
        'updateSecurityGroup',
        'updateSecurityGroupRequest',
        updateSecurityGroupRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
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
        updateSecurityGroupRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the properties of a rule from a specified security group.
     * @summary Update security group rule
     * @param {UpdateSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group. (UUID format)
     * @param {string} securityGroupRuleId UUID of the rule. (UUID format)
     * @param {UpdateSecurityGroupRuleRequest} updateSecurityGroupRuleRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSecurityGroupRule: async (
      zone: UpdateSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      updateSecurityGroupRuleRequest: UpdateSecurityGroupRuleRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateSecurityGroupRule', 'zone', zone);
      // verify required parameter 'securityGroupId' is not null or undefined
      assertParamExists(
        'updateSecurityGroupRule',
        'securityGroupId',
        securityGroupId,
      );
      // verify required parameter 'securityGroupRuleId' is not null or undefined
      assertParamExists(
        'updateSecurityGroupRule',
        'securityGroupRuleId',
        securityGroupRuleId,
      );
      // verify required parameter 'updateSecurityGroupRuleRequest' is not null or undefined
      assertParamExists(
        'updateSecurityGroupRule',
        'updateSecurityGroupRuleRequest',
        updateSecurityGroupRuleRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/security_groups/{security_group_id}/rules/{security_group_rule_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'security_group_id'}}`,
            encodeURIComponent(String(securityGroupId)),
          )
          .replace(
            `{${'security_group_rule_id'}}`,
            encodeURIComponent(String(securityGroupRuleId)),
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
        updateSecurityGroupRuleRequest,
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
 * SecurityGroupsApi - functional programming interface
 * @export
 */
export const SecurityGroupsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    SecurityGroupsApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a security group with a specified name and description.
     * @summary Create a security group
     * @param {CreateSecurityGroupZoneEnum} zone The zone you want to target
     * @param {CreateSecurityGroupRequest} createSecurityGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createSecurityGroup(
      zone: CreateSecurityGroupZoneEnum,
      createSecurityGroupRequest: CreateSecurityGroupRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1CreateSecurityGroupResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createSecurityGroup(
          zone,
          createSecurityGroupRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.createSecurityGroup']?.[
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
     * Create a rule in the specified security group ID.
     * @summary Create rule
     * @param {CreateSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group.
     * @param {CreateSecurityGroupRuleRequest} createSecurityGroupRuleRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createSecurityGroupRule(
      zone: CreateSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      createSecurityGroupRuleRequest: CreateSecurityGroupRuleRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1CreateSecurityGroupRuleResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createSecurityGroupRule(
          zone,
          securityGroupId,
          createSecurityGroupRuleRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.createSecurityGroupRule']?.[
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
     * Delete a security group with the specified ID.
     * @summary Delete a security group
     * @param {DeleteSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSecurityGroup(
      zone: DeleteSecurityGroupZoneEnum,
      securityGroupId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteSecurityGroup(
          zone,
          securityGroupId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.deleteSecurityGroup']?.[
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
     * Delete a security group rule with the specified ID.
     * @summary Delete rule
     * @param {DeleteSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId
     * @param {string} securityGroupRuleId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSecurityGroupRule(
      zone: DeleteSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteSecurityGroupRule(
          zone,
          securityGroupId,
          securityGroupRuleId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.deleteSecurityGroupRule']?.[
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
     * Get the details of a security group with the specified ID.
     * @summary Get a security group
     * @param {GetSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSecurityGroup(
      zone: GetSecurityGroupZoneEnum,
      securityGroupId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetSecurityGroupResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getSecurityGroup(
          zone,
          securityGroupId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.getSecurityGroup']?.[
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
     * Get details of a security group rule with the specified ID.
     * @summary Get rule
     * @param {GetSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId
     * @param {string} securityGroupRuleId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSecurityGroupRule(
      zone: GetSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetSecurityGroupRuleResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getSecurityGroupRule(
          zone,
          securityGroupId,
          securityGroupRuleId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.getSecurityGroupRule']?.[
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
     * Lists the default rules applied to all the security groups.
     * @summary Get default rules
     * @param {ListDefaultSecurityGroupRulesZoneEnum} zone The zone you want to target
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listDefaultSecurityGroupRules(
      zone: ListDefaultSecurityGroupRulesZoneEnum,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListSecurityGroupRulesResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listDefaultSecurityGroupRules(
          zone,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.listDefaultSecurityGroupRules']?.[
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
     * List the rules of the a specified security group ID.
     * @summary List rules
     * @param {ListSecurityGroupRulesZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listSecurityGroupRules(
      zone: ListSecurityGroupRulesZoneEnum,
      securityGroupId: string,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListSecurityGroupRulesResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listSecurityGroupRules(
          zone,
          securityGroupId,
          perPage,
          page,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.listSecurityGroupRules']?.[
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
     * List all existing security groups.
     * @summary List security groups
     * @param {ListSecurityGroupsZoneEnum} zone The zone you want to target
     * @param {string} [name] Name of the security group.
     * @param {string} [organization] Security group Organization ID.
     * @param {string} [project] Security group Project ID.
     * @param {string} [tags] List security groups with these exact tags (to filter with several tags, use commas to separate them).
     * @param {boolean} [projectDefault] Filter security groups with this value for project_default.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listSecurityGroups(
      zone: ListSecurityGroupsZoneEnum,
      name?: string,
      organization?: string,
      project?: string,
      tags?: string,
      projectDefault?: boolean,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListSecurityGroupsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listSecurityGroups(
          zone,
          name,
          organization,
          project,
          tags,
          projectDefault,
          perPage,
          page,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.listSecurityGroups']?.[
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
     * Replace all security group properties with a security group message.
     * @summary Update a security group
     * @param {SetSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} id UUID of the security group.
     * @param {SetSecurityGroupRequest} setSecurityGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setSecurityGroup(
      zone: SetSecurityGroupZoneEnum,
      id: string,
      setSecurityGroupRequest: SetSecurityGroupRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1SetSecurityGroupResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.setSecurityGroup(
          zone,
          id,
          setSecurityGroupRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.setSecurityGroup']?.[
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
     * Replace all the properties of a rule from a specified security group.
     * @summary Set security group rule
     * @param {SetSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId
     * @param {string} securityGroupRuleId
     * @param {SetSecurityGroupRuleRequest} setSecurityGroupRuleRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setSecurityGroupRule(
      zone: SetSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      setSecurityGroupRuleRequest: SetSecurityGroupRuleRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1SetSecurityGroupRuleResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.setSecurityGroupRule(
          zone,
          securityGroupId,
          securityGroupRuleId,
          setSecurityGroupRuleRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.setSecurityGroupRule']?.[
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
     * Replaces the existing rules of the security group with the rules provided. This endpoint supports the update of existing rules, creation of new rules and deletion of existing rules when they are not passed in the request.
     * @summary Update all the rules of a security group
     * @param {SetSecurityGroupRulesZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group to update the rules on.
     * @param {SetSecurityGroupRulesRequest} setSecurityGroupRulesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setSecurityGroupRules(
      zone: SetSecurityGroupRulesZoneEnum,
      securityGroupId: string,
      setSecurityGroupRulesRequest: SetSecurityGroupRulesRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1SetSecurityGroupRulesResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.setSecurityGroupRules(
          zone,
          securityGroupId,
          setSecurityGroupRulesRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.setSecurityGroupRules']?.[
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
     * Update the properties of security group.
     * @summary Update a security group
     * @param {UpdateSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group. (UUID format)
     * @param {UpdateSecurityGroupRequest} updateSecurityGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateSecurityGroup(
      zone: UpdateSecurityGroupZoneEnum,
      securityGroupId: string,
      updateSecurityGroupRequest: UpdateSecurityGroupRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1UpdateSecurityGroupResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateSecurityGroup(
          zone,
          securityGroupId,
          updateSecurityGroupRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.updateSecurityGroup']?.[
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
     * Update the properties of a rule from a specified security group.
     * @summary Update security group rule
     * @param {UpdateSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group. (UUID format)
     * @param {string} securityGroupRuleId UUID of the rule. (UUID format)
     * @param {UpdateSecurityGroupRuleRequest} updateSecurityGroupRuleRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateSecurityGroupRule(
      zone: UpdateSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      updateSecurityGroupRuleRequest: UpdateSecurityGroupRuleRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1UpdateSecurityGroupRuleResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateSecurityGroupRule(
          zone,
          securityGroupId,
          securityGroupRuleId,
          updateSecurityGroupRuleRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecurityGroupsApi.updateSecurityGroupRule']?.[
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
 * SecurityGroupsApi - factory interface
 * @export
 */
export const SecurityGroupsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = SecurityGroupsApiFp(configuration);
  return {
    /**
     * Create a security group with a specified name and description.
     * @summary Create a security group
     * @param {CreateSecurityGroupZoneEnum} zone The zone you want to target
     * @param {CreateSecurityGroupRequest} createSecurityGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSecurityGroup(
      zone: CreateSecurityGroupZoneEnum,
      createSecurityGroupRequest: CreateSecurityGroupRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1CreateSecurityGroupResponse> {
      return localVarFp
        .createSecurityGroup(zone, createSecurityGroupRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a rule in the specified security group ID.
     * @summary Create rule
     * @param {CreateSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group.
     * @param {CreateSecurityGroupRuleRequest} createSecurityGroupRuleRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSecurityGroupRule(
      zone: CreateSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      createSecurityGroupRuleRequest: CreateSecurityGroupRuleRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1CreateSecurityGroupRuleResponse> {
      return localVarFp
        .createSecurityGroupRule(
          zone,
          securityGroupId,
          createSecurityGroupRuleRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete a security group with the specified ID.
     * @summary Delete a security group
     * @param {DeleteSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecurityGroup(
      zone: DeleteSecurityGroupZoneEnum,
      securityGroupId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteSecurityGroup(zone, securityGroupId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete a security group rule with the specified ID.
     * @summary Delete rule
     * @param {DeleteSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId
     * @param {string} securityGroupRuleId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecurityGroupRule(
      zone: DeleteSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteSecurityGroupRule(
          zone,
          securityGroupId,
          securityGroupRuleId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Get the details of a security group with the specified ID.
     * @summary Get a security group
     * @param {GetSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSecurityGroup(
      zone: GetSecurityGroupZoneEnum,
      securityGroupId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetSecurityGroupResponse> {
      return localVarFp
        .getSecurityGroup(zone, securityGroupId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get details of a security group rule with the specified ID.
     * @summary Get rule
     * @param {GetSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId
     * @param {string} securityGroupRuleId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSecurityGroupRule(
      zone: GetSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetSecurityGroupRuleResponse> {
      return localVarFp
        .getSecurityGroupRule(
          zone,
          securityGroupId,
          securityGroupRuleId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Lists the default rules applied to all the security groups.
     * @summary Get default rules
     * @param {ListDefaultSecurityGroupRulesZoneEnum} zone The zone you want to target
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDefaultSecurityGroupRules(
      zone: ListDefaultSecurityGroupRulesZoneEnum,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListSecurityGroupRulesResponse> {
      return localVarFp
        .listDefaultSecurityGroupRules(zone, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List the rules of the a specified security group ID.
     * @summary List rules
     * @param {ListSecurityGroupRulesZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSecurityGroupRules(
      zone: ListSecurityGroupRulesZoneEnum,
      securityGroupId: string,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListSecurityGroupRulesResponse> {
      return localVarFp
        .listSecurityGroupRules(zone, securityGroupId, perPage, page, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all existing security groups.
     * @summary List security groups
     * @param {ListSecurityGroupsZoneEnum} zone The zone you want to target
     * @param {string} [name] Name of the security group.
     * @param {string} [organization] Security group Organization ID.
     * @param {string} [project] Security group Project ID.
     * @param {string} [tags] List security groups with these exact tags (to filter with several tags, use commas to separate them).
     * @param {boolean} [projectDefault] Filter security groups with this value for project_default.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSecurityGroups(
      zone: ListSecurityGroupsZoneEnum,
      name?: string,
      organization?: string,
      project?: string,
      tags?: string,
      projectDefault?: boolean,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListSecurityGroupsResponse> {
      return localVarFp
        .listSecurityGroups(
          zone,
          name,
          organization,
          project,
          tags,
          projectDefault,
          perPage,
          page,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Replace all security group properties with a security group message.
     * @summary Update a security group
     * @param {SetSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} id UUID of the security group.
     * @param {SetSecurityGroupRequest} setSecurityGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setSecurityGroup(
      zone: SetSecurityGroupZoneEnum,
      id: string,
      setSecurityGroupRequest: SetSecurityGroupRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1SetSecurityGroupResponse> {
      return localVarFp
        .setSecurityGroup(zone, id, setSecurityGroupRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Replace all the properties of a rule from a specified security group.
     * @summary Set security group rule
     * @param {SetSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId
     * @param {string} securityGroupRuleId
     * @param {SetSecurityGroupRuleRequest} setSecurityGroupRuleRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setSecurityGroupRule(
      zone: SetSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      setSecurityGroupRuleRequest: SetSecurityGroupRuleRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1SetSecurityGroupRuleResponse> {
      return localVarFp
        .setSecurityGroupRule(
          zone,
          securityGroupId,
          securityGroupRuleId,
          setSecurityGroupRuleRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Replaces the existing rules of the security group with the rules provided. This endpoint supports the update of existing rules, creation of new rules and deletion of existing rules when they are not passed in the request.
     * @summary Update all the rules of a security group
     * @param {SetSecurityGroupRulesZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group to update the rules on.
     * @param {SetSecurityGroupRulesRequest} setSecurityGroupRulesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setSecurityGroupRules(
      zone: SetSecurityGroupRulesZoneEnum,
      securityGroupId: string,
      setSecurityGroupRulesRequest: SetSecurityGroupRulesRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1SetSecurityGroupRulesResponse> {
      return localVarFp
        .setSecurityGroupRules(
          zone,
          securityGroupId,
          setSecurityGroupRulesRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the properties of security group.
     * @summary Update a security group
     * @param {UpdateSecurityGroupZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group. (UUID format)
     * @param {UpdateSecurityGroupRequest} updateSecurityGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSecurityGroup(
      zone: UpdateSecurityGroupZoneEnum,
      securityGroupId: string,
      updateSecurityGroupRequest: UpdateSecurityGroupRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1UpdateSecurityGroupResponse> {
      return localVarFp
        .updateSecurityGroup(
          zone,
          securityGroupId,
          updateSecurityGroupRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the properties of a rule from a specified security group.
     * @summary Update security group rule
     * @param {UpdateSecurityGroupRuleZoneEnum} zone The zone you want to target
     * @param {string} securityGroupId UUID of the security group. (UUID format)
     * @param {string} securityGroupRuleId UUID of the rule. (UUID format)
     * @param {UpdateSecurityGroupRuleRequest} updateSecurityGroupRuleRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSecurityGroupRule(
      zone: UpdateSecurityGroupRuleZoneEnum,
      securityGroupId: string,
      securityGroupRuleId: string,
      updateSecurityGroupRuleRequest: UpdateSecurityGroupRuleRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1UpdateSecurityGroupRuleResponse> {
      return localVarFp
        .updateSecurityGroupRule(
          zone,
          securityGroupId,
          securityGroupRuleId,
          updateSecurityGroupRuleRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SecurityGroupsApi - interface
 * @export
 * @interface SecurityGroupsApi
 */
export interface SecurityGroupsApiInterface {
  /**
   * Create a security group with a specified name and description.
   * @summary Create a security group
   * @param {CreateSecurityGroupZoneEnum} zone The zone you want to target
   * @param {CreateSecurityGroupRequest} createSecurityGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  createSecurityGroup(
    zone: CreateSecurityGroupZoneEnum,
    createSecurityGroupRequest: CreateSecurityGroupRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1CreateSecurityGroupResponse>;

  /**
   * Create a rule in the specified security group ID.
   * @summary Create rule
   * @param {CreateSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group.
   * @param {CreateSecurityGroupRuleRequest} createSecurityGroupRuleRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  createSecurityGroupRule(
    zone: CreateSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    createSecurityGroupRuleRequest: CreateSecurityGroupRuleRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1CreateSecurityGroupRuleResponse>;

  /**
   * Delete a security group with the specified ID.
   * @summary Delete a security group
   * @param {DeleteSecurityGroupZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  deleteSecurityGroup(
    zone: DeleteSecurityGroupZoneEnum,
    securityGroupId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Delete a security group rule with the specified ID.
   * @summary Delete rule
   * @param {DeleteSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId
   * @param {string} securityGroupRuleId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  deleteSecurityGroupRule(
    zone: DeleteSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    securityGroupRuleId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get the details of a security group with the specified ID.
   * @summary Get a security group
   * @param {GetSecurityGroupZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  getSecurityGroup(
    zone: GetSecurityGroupZoneEnum,
    securityGroupId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetSecurityGroupResponse>;

  /**
   * Get details of a security group rule with the specified ID.
   * @summary Get rule
   * @param {GetSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId
   * @param {string} securityGroupRuleId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  getSecurityGroupRule(
    zone: GetSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    securityGroupRuleId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetSecurityGroupRuleResponse>;

  /**
   * Lists the default rules applied to all the security groups.
   * @summary Get default rules
   * @param {ListDefaultSecurityGroupRulesZoneEnum} zone The zone you want to target
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  listDefaultSecurityGroupRules(
    zone: ListDefaultSecurityGroupRulesZoneEnum,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListSecurityGroupRulesResponse>;

  /**
   * List the rules of the a specified security group ID.
   * @summary List rules
   * @param {ListSecurityGroupRulesZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group.
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  listSecurityGroupRules(
    zone: ListSecurityGroupRulesZoneEnum,
    securityGroupId: string,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListSecurityGroupRulesResponse>;

  /**
   * List all existing security groups.
   * @summary List security groups
   * @param {ListSecurityGroupsZoneEnum} zone The zone you want to target
   * @param {string} [name] Name of the security group.
   * @param {string} [organization] Security group Organization ID.
   * @param {string} [project] Security group Project ID.
   * @param {string} [tags] List security groups with these exact tags (to filter with several tags, use commas to separate them).
   * @param {boolean} [projectDefault] Filter security groups with this value for project_default.
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  listSecurityGroups(
    zone: ListSecurityGroupsZoneEnum,
    name?: string,
    organization?: string,
    project?: string,
    tags?: string,
    projectDefault?: boolean,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListSecurityGroupsResponse>;

  /**
   * Replace all security group properties with a security group message.
   * @summary Update a security group
   * @param {SetSecurityGroupZoneEnum} zone The zone you want to target
   * @param {string} id UUID of the security group.
   * @param {SetSecurityGroupRequest} setSecurityGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  setSecurityGroup(
    zone: SetSecurityGroupZoneEnum,
    id: string,
    setSecurityGroupRequest: SetSecurityGroupRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1SetSecurityGroupResponse>;

  /**
   * Replace all the properties of a rule from a specified security group.
   * @summary Set security group rule
   * @param {SetSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId
   * @param {string} securityGroupRuleId
   * @param {SetSecurityGroupRuleRequest} setSecurityGroupRuleRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  setSecurityGroupRule(
    zone: SetSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    securityGroupRuleId: string,
    setSecurityGroupRuleRequest: SetSecurityGroupRuleRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1SetSecurityGroupRuleResponse>;

  /**
   * Replaces the existing rules of the security group with the rules provided. This endpoint supports the update of existing rules, creation of new rules and deletion of existing rules when they are not passed in the request.
   * @summary Update all the rules of a security group
   * @param {SetSecurityGroupRulesZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group to update the rules on.
   * @param {SetSecurityGroupRulesRequest} setSecurityGroupRulesRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  setSecurityGroupRules(
    zone: SetSecurityGroupRulesZoneEnum,
    securityGroupId: string,
    setSecurityGroupRulesRequest: SetSecurityGroupRulesRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1SetSecurityGroupRulesResponse>;

  /**
   * Update the properties of security group.
   * @summary Update a security group
   * @param {UpdateSecurityGroupZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group. (UUID format)
   * @param {UpdateSecurityGroupRequest} updateSecurityGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  updateSecurityGroup(
    zone: UpdateSecurityGroupZoneEnum,
    securityGroupId: string,
    updateSecurityGroupRequest: UpdateSecurityGroupRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1UpdateSecurityGroupResponse>;

  /**
   * Update the properties of a rule from a specified security group.
   * @summary Update security group rule
   * @param {UpdateSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group. (UUID format)
   * @param {string} securityGroupRuleId UUID of the rule. (UUID format)
   * @param {UpdateSecurityGroupRuleRequest} updateSecurityGroupRuleRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApiInterface
   */
  updateSecurityGroupRule(
    zone: UpdateSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    securityGroupRuleId: string,
    updateSecurityGroupRuleRequest: UpdateSecurityGroupRuleRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1UpdateSecurityGroupRuleResponse>;
}

/**
 * SecurityGroupsApi - object-oriented interface
 * @export
 * @class SecurityGroupsApi
 * @extends {BaseAPI}
 */
export class SecurityGroupsApi
  extends BaseAPI
  implements SecurityGroupsApiInterface
{
  /**
   * Create a security group with a specified name and description.
   * @summary Create a security group
   * @param {CreateSecurityGroupZoneEnum} zone The zone you want to target
   * @param {CreateSecurityGroupRequest} createSecurityGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public createSecurityGroup(
    zone: CreateSecurityGroupZoneEnum,
    createSecurityGroupRequest: CreateSecurityGroupRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .createSecurityGroup(zone, createSecurityGroupRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a rule in the specified security group ID.
   * @summary Create rule
   * @param {CreateSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group.
   * @param {CreateSecurityGroupRuleRequest} createSecurityGroupRuleRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public createSecurityGroupRule(
    zone: CreateSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    createSecurityGroupRuleRequest: CreateSecurityGroupRuleRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .createSecurityGroupRule(
        zone,
        securityGroupId,
        createSecurityGroupRuleRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete a security group with the specified ID.
   * @summary Delete a security group
   * @param {DeleteSecurityGroupZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public deleteSecurityGroup(
    zone: DeleteSecurityGroupZoneEnum,
    securityGroupId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .deleteSecurityGroup(zone, securityGroupId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete a security group rule with the specified ID.
   * @summary Delete rule
   * @param {DeleteSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId
   * @param {string} securityGroupRuleId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public deleteSecurityGroupRule(
    zone: DeleteSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    securityGroupRuleId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .deleteSecurityGroupRule(
        zone,
        securityGroupId,
        securityGroupRuleId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get the details of a security group with the specified ID.
   * @summary Get a security group
   * @param {GetSecurityGroupZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public getSecurityGroup(
    zone: GetSecurityGroupZoneEnum,
    securityGroupId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .getSecurityGroup(zone, securityGroupId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get details of a security group rule with the specified ID.
   * @summary Get rule
   * @param {GetSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId
   * @param {string} securityGroupRuleId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public getSecurityGroupRule(
    zone: GetSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    securityGroupRuleId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .getSecurityGroupRule(zone, securityGroupId, securityGroupRuleId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Lists the default rules applied to all the security groups.
   * @summary Get default rules
   * @param {ListDefaultSecurityGroupRulesZoneEnum} zone The zone you want to target
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public listDefaultSecurityGroupRules(
    zone: ListDefaultSecurityGroupRulesZoneEnum,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .listDefaultSecurityGroupRules(zone, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List the rules of the a specified security group ID.
   * @summary List rules
   * @param {ListSecurityGroupRulesZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group.
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public listSecurityGroupRules(
    zone: ListSecurityGroupRulesZoneEnum,
    securityGroupId: string,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .listSecurityGroupRules(zone, securityGroupId, perPage, page, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all existing security groups.
   * @summary List security groups
   * @param {ListSecurityGroupsZoneEnum} zone The zone you want to target
   * @param {string} [name] Name of the security group.
   * @param {string} [organization] Security group Organization ID.
   * @param {string} [project] Security group Project ID.
   * @param {string} [tags] List security groups with these exact tags (to filter with several tags, use commas to separate them).
   * @param {boolean} [projectDefault] Filter security groups with this value for project_default.
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public listSecurityGroups(
    zone: ListSecurityGroupsZoneEnum,
    name?: string,
    organization?: string,
    project?: string,
    tags?: string,
    projectDefault?: boolean,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .listSecurityGroups(
        zone,
        name,
        organization,
        project,
        tags,
        projectDefault,
        perPage,
        page,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Replace all security group properties with a security group message.
   * @summary Update a security group
   * @param {SetSecurityGroupZoneEnum} zone The zone you want to target
   * @param {string} id UUID of the security group.
   * @param {SetSecurityGroupRequest} setSecurityGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public setSecurityGroup(
    zone: SetSecurityGroupZoneEnum,
    id: string,
    setSecurityGroupRequest: SetSecurityGroupRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .setSecurityGroup(zone, id, setSecurityGroupRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Replace all the properties of a rule from a specified security group.
   * @summary Set security group rule
   * @param {SetSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId
   * @param {string} securityGroupRuleId
   * @param {SetSecurityGroupRuleRequest} setSecurityGroupRuleRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public setSecurityGroupRule(
    zone: SetSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    securityGroupRuleId: string,
    setSecurityGroupRuleRequest: SetSecurityGroupRuleRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .setSecurityGroupRule(
        zone,
        securityGroupId,
        securityGroupRuleId,
        setSecurityGroupRuleRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Replaces the existing rules of the security group with the rules provided. This endpoint supports the update of existing rules, creation of new rules and deletion of existing rules when they are not passed in the request.
   * @summary Update all the rules of a security group
   * @param {SetSecurityGroupRulesZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group to update the rules on.
   * @param {SetSecurityGroupRulesRequest} setSecurityGroupRulesRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public setSecurityGroupRules(
    zone: SetSecurityGroupRulesZoneEnum,
    securityGroupId: string,
    setSecurityGroupRulesRequest: SetSecurityGroupRulesRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .setSecurityGroupRules(
        zone,
        securityGroupId,
        setSecurityGroupRulesRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the properties of security group.
   * @summary Update a security group
   * @param {UpdateSecurityGroupZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group. (UUID format)
   * @param {UpdateSecurityGroupRequest} updateSecurityGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public updateSecurityGroup(
    zone: UpdateSecurityGroupZoneEnum,
    securityGroupId: string,
    updateSecurityGroupRequest: UpdateSecurityGroupRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .updateSecurityGroup(
        zone,
        securityGroupId,
        updateSecurityGroupRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the properties of a rule from a specified security group.
   * @summary Update security group rule
   * @param {UpdateSecurityGroupRuleZoneEnum} zone The zone you want to target
   * @param {string} securityGroupId UUID of the security group. (UUID format)
   * @param {string} securityGroupRuleId UUID of the rule. (UUID format)
   * @param {UpdateSecurityGroupRuleRequest} updateSecurityGroupRuleRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecurityGroupsApi
   */
  public updateSecurityGroupRule(
    zone: UpdateSecurityGroupRuleZoneEnum,
    securityGroupId: string,
    securityGroupRuleId: string,
    updateSecurityGroupRuleRequest: UpdateSecurityGroupRuleRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SecurityGroupsApiFp(this.configuration)
      .updateSecurityGroupRule(
        zone,
        securityGroupId,
        securityGroupRuleId,
        updateSecurityGroupRuleRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CreateSecurityGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CreateSecurityGroupZoneEnum =
  (typeof CreateSecurityGroupZoneEnum)[keyof typeof CreateSecurityGroupZoneEnum];
/**
 * @export
 */
export const CreateSecurityGroupRuleZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CreateSecurityGroupRuleZoneEnum =
  (typeof CreateSecurityGroupRuleZoneEnum)[keyof typeof CreateSecurityGroupRuleZoneEnum];
/**
 * @export
 */
export const DeleteSecurityGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeleteSecurityGroupZoneEnum =
  (typeof DeleteSecurityGroupZoneEnum)[keyof typeof DeleteSecurityGroupZoneEnum];
/**
 * @export
 */
export const DeleteSecurityGroupRuleZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeleteSecurityGroupRuleZoneEnum =
  (typeof DeleteSecurityGroupRuleZoneEnum)[keyof typeof DeleteSecurityGroupRuleZoneEnum];
/**
 * @export
 */
export const GetSecurityGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetSecurityGroupZoneEnum =
  (typeof GetSecurityGroupZoneEnum)[keyof typeof GetSecurityGroupZoneEnum];
/**
 * @export
 */
export const GetSecurityGroupRuleZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetSecurityGroupRuleZoneEnum =
  (typeof GetSecurityGroupRuleZoneEnum)[keyof typeof GetSecurityGroupRuleZoneEnum];
/**
 * @export
 */
export const ListDefaultSecurityGroupRulesZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListDefaultSecurityGroupRulesZoneEnum =
  (typeof ListDefaultSecurityGroupRulesZoneEnum)[keyof typeof ListDefaultSecurityGroupRulesZoneEnum];
/**
 * @export
 */
export const ListSecurityGroupRulesZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListSecurityGroupRulesZoneEnum =
  (typeof ListSecurityGroupRulesZoneEnum)[keyof typeof ListSecurityGroupRulesZoneEnum];
/**
 * @export
 */
export const ListSecurityGroupsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListSecurityGroupsZoneEnum =
  (typeof ListSecurityGroupsZoneEnum)[keyof typeof ListSecurityGroupsZoneEnum];
/**
 * @export
 */
export const SetSecurityGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type SetSecurityGroupZoneEnum =
  (typeof SetSecurityGroupZoneEnum)[keyof typeof SetSecurityGroupZoneEnum];
/**
 * @export
 */
export const SetSecurityGroupRuleZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type SetSecurityGroupRuleZoneEnum =
  (typeof SetSecurityGroupRuleZoneEnum)[keyof typeof SetSecurityGroupRuleZoneEnum];
/**
 * @export
 */
export const SetSecurityGroupRulesZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type SetSecurityGroupRulesZoneEnum =
  (typeof SetSecurityGroupRulesZoneEnum)[keyof typeof SetSecurityGroupRulesZoneEnum];
/**
 * @export
 */
export const UpdateSecurityGroupZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdateSecurityGroupZoneEnum =
  (typeof UpdateSecurityGroupZoneEnum)[keyof typeof UpdateSecurityGroupZoneEnum];
/**
 * @export
 */
export const UpdateSecurityGroupRuleZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdateSecurityGroupRuleZoneEnum =
  (typeof UpdateSecurityGroupRuleZoneEnum)[keyof typeof UpdateSecurityGroupRuleZoneEnum];

/**
 * SnapshotsApi - axios parameter creator
 * @export
 */
export const SnapshotsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a snapshot from a specified volume or from a QCOW2 file in a specified Availability Zone.
     * @summary Create a snapshot from a specified volume or from a QCOW2 file
     * @param {CreateSnapshotZoneEnum} zone The zone you want to target
     * @param {CreateSnapshotRequest} createSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSnapshot: async (
      zone: CreateSnapshotZoneEnum,
      createSnapshotRequest: CreateSnapshotRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createSnapshot', 'zone', zone);
      // verify required parameter 'createSnapshotRequest' is not null or undefined
      assertParamExists(
        'createSnapshot',
        'createSnapshotRequest',
        createSnapshotRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/snapshots`.replace(
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
        createSnapshotRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete the snapshot with the specified ID.
     * @summary Delete a snapshot
     * @param {DeleteSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId UUID of the snapshot you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSnapshot: async (
      zone: DeleteSnapshotZoneEnum,
      snapshotId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteSnapshot', 'zone', zone);
      // verify required parameter 'snapshotId' is not null or undefined
      assertParamExists('deleteSnapshot', 'snapshotId', snapshotId);
      const localVarPath = `/instance/v1/zones/{zone}/snapshots/{snapshot_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'snapshot_id'}}`, encodeURIComponent(String(snapshotId)));
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
     * Export a snapshot to a specified Object Storage bucket in the same region.
     * @summary Export a snapshot
     * @param {ExportSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId Snapshot ID.
     * @param {ExportSnapshotRequest} exportSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    exportSnapshot: async (
      zone: ExportSnapshotZoneEnum,
      snapshotId: string,
      exportSnapshotRequest: ExportSnapshotRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('exportSnapshot', 'zone', zone);
      // verify required parameter 'snapshotId' is not null or undefined
      assertParamExists('exportSnapshot', 'snapshotId', snapshotId);
      // verify required parameter 'exportSnapshotRequest' is not null or undefined
      assertParamExists(
        'exportSnapshot',
        'exportSnapshotRequest',
        exportSnapshotRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/snapshots/{snapshot_id}/export`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(
            `{${'snapshot_id'}}`,
            encodeURIComponent(String(snapshotId)),
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
        exportSnapshotRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Get details of a snapshot with the specified ID.
     * @summary Get a snapshot
     * @param {GetSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId UUID of the snapshot you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSnapshot: async (
      zone: GetSnapshotZoneEnum,
      snapshotId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getSnapshot', 'zone', zone);
      // verify required parameter 'snapshotId' is not null or undefined
      assertParamExists('getSnapshot', 'snapshotId', snapshotId);
      const localVarPath = `/instance/v1/zones/{zone}/snapshots/{snapshot_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'snapshot_id'}}`, encodeURIComponent(String(snapshotId)));
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
     * List all snapshots of an Organization in a specified Availability Zone.
     * @summary List snapshots
     * @param {ListSnapshotsZoneEnum} zone The zone you want to target
     * @param {string} [organization] List snapshots only for this Organization ID.
     * @param {string} [project] List snapshots only for this Project ID.
     * @param {number} [perPage] Number of snapshots returned per page (positive integer lower or equal to 100).
     * @param {number} [page] Page to be returned.
     * @param {string} [name] List snapshots of the requested name.
     * @param {string} [tags] List snapshots that have the requested tag.
     * @param {string} [baseVolumeId] List snapshots originating only from this volume.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSnapshots: async (
      zone: ListSnapshotsZoneEnum,
      organization?: string,
      project?: string,
      perPage?: number,
      page?: number,
      name?: string,
      tags?: string,
      baseVolumeId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listSnapshots', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/snapshots`.replace(
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

      if (organization !== undefined) {
        localVarQueryParameter['organization'] = organization;
      }

      if (project !== undefined) {
        localVarQueryParameter['project'] = project;
      }

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (tags !== undefined) {
        localVarQueryParameter['tags'] = tags;
      }

      if (baseVolumeId !== undefined) {
        localVarQueryParameter['base_volume_id'] = baseVolumeId;
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
     * Replace all the properties of a snapshot.
     * @summary Set snapshot
     * @param {SetSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId
     * @param {SetSnapshotRequest} setSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setSnapshot: async (
      zone: SetSnapshotZoneEnum,
      snapshotId: string,
      setSnapshotRequest: SetSnapshotRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setSnapshot', 'zone', zone);
      // verify required parameter 'snapshotId' is not null or undefined
      assertParamExists('setSnapshot', 'snapshotId', snapshotId);
      // verify required parameter 'setSnapshotRequest' is not null or undefined
      assertParamExists(
        'setSnapshot',
        'setSnapshotRequest',
        setSnapshotRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/snapshots/{snapshot_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'snapshot_id'}}`, encodeURIComponent(String(snapshotId)));
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
        setSnapshotRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the properties of a snapshot.
     * @summary Update a snapshot
     * @param {UpdateSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId UUID of the snapshot. (UUID format)
     * @param {UpdateSnapshotRequest} updateSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSnapshot: async (
      zone: UpdateSnapshotZoneEnum,
      snapshotId: string,
      updateSnapshotRequest: UpdateSnapshotRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateSnapshot', 'zone', zone);
      // verify required parameter 'snapshotId' is not null or undefined
      assertParamExists('updateSnapshot', 'snapshotId', snapshotId);
      // verify required parameter 'updateSnapshotRequest' is not null or undefined
      assertParamExists(
        'updateSnapshot',
        'updateSnapshotRequest',
        updateSnapshotRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/snapshots/{snapshot_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'snapshot_id'}}`, encodeURIComponent(String(snapshotId)));
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
        updateSnapshotRequest,
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
 * SnapshotsApi - functional programming interface
 * @export
 */
export const SnapshotsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    SnapshotsApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a snapshot from a specified volume or from a QCOW2 file in a specified Availability Zone.
     * @summary Create a snapshot from a specified volume or from a QCOW2 file
     * @param {CreateSnapshotZoneEnum} zone The zone you want to target
     * @param {CreateSnapshotRequest} createSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createSnapshot(
      zone: CreateSnapshotZoneEnum,
      createSnapshotRequest: CreateSnapshotRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1CreateSnapshotResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createSnapshot(
        zone,
        createSnapshotRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.createSnapshot']?.[
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
     * Delete the snapshot with the specified ID.
     * @summary Delete a snapshot
     * @param {DeleteSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId UUID of the snapshot you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSnapshot(
      zone: DeleteSnapshotZoneEnum,
      snapshotId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteSnapshot(
        zone,
        snapshotId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.deleteSnapshot']?.[
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
     * Export a snapshot to a specified Object Storage bucket in the same region.
     * @summary Export a snapshot
     * @param {ExportSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId Snapshot ID.
     * @param {ExportSnapshotRequest} exportSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async exportSnapshot(
      zone: ExportSnapshotZoneEnum,
      snapshotId: string,
      exportSnapshotRequest: ExportSnapshotRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ExportSnapshotResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.exportSnapshot(
        zone,
        snapshotId,
        exportSnapshotRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.exportSnapshot']?.[
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
     * Get details of a snapshot with the specified ID.
     * @summary Get a snapshot
     * @param {GetSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId UUID of the snapshot you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSnapshot(
      zone: GetSnapshotZoneEnum,
      snapshotId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetSnapshotResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getSnapshot(
        zone,
        snapshotId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.getSnapshot']?.[
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
     * List all snapshots of an Organization in a specified Availability Zone.
     * @summary List snapshots
     * @param {ListSnapshotsZoneEnum} zone The zone you want to target
     * @param {string} [organization] List snapshots only for this Organization ID.
     * @param {string} [project] List snapshots only for this Project ID.
     * @param {number} [perPage] Number of snapshots returned per page (positive integer lower or equal to 100).
     * @param {number} [page] Page to be returned.
     * @param {string} [name] List snapshots of the requested name.
     * @param {string} [tags] List snapshots that have the requested tag.
     * @param {string} [baseVolumeId] List snapshots originating only from this volume.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listSnapshots(
      zone: ListSnapshotsZoneEnum,
      organization?: string,
      project?: string,
      perPage?: number,
      page?: number,
      name?: string,
      tags?: string,
      baseVolumeId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListSnapshotsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listSnapshots(
        zone,
        organization,
        project,
        perPage,
        page,
        name,
        tags,
        baseVolumeId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.listSnapshots']?.[
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
     * Replace all the properties of a snapshot.
     * @summary Set snapshot
     * @param {SetSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId
     * @param {SetSnapshotRequest} setSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setSnapshot(
      zone: SetSnapshotZoneEnum,
      snapshotId: string,
      setSnapshotRequest: SetSnapshotRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1SetSnapshotResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.setSnapshot(
        zone,
        snapshotId,
        setSnapshotRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.setSnapshot']?.[
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
     * Update the properties of a snapshot.
     * @summary Update a snapshot
     * @param {UpdateSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId UUID of the snapshot. (UUID format)
     * @param {UpdateSnapshotRequest} updateSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateSnapshot(
      zone: UpdateSnapshotZoneEnum,
      snapshotId: string,
      updateSnapshotRequest: UpdateSnapshotRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1UpdateSnapshotResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateSnapshot(
        zone,
        snapshotId,
        updateSnapshotRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.updateSnapshot']?.[
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
 * SnapshotsApi - factory interface
 * @export
 */
export const SnapshotsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = SnapshotsApiFp(configuration);
  return {
    /**
     * Create a snapshot from a specified volume or from a QCOW2 file in a specified Availability Zone.
     * @summary Create a snapshot from a specified volume or from a QCOW2 file
     * @param {CreateSnapshotZoneEnum} zone The zone you want to target
     * @param {CreateSnapshotRequest} createSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSnapshot(
      zone: CreateSnapshotZoneEnum,
      createSnapshotRequest: CreateSnapshotRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1CreateSnapshotResponse> {
      return localVarFp
        .createSnapshot(zone, createSnapshotRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete the snapshot with the specified ID.
     * @summary Delete a snapshot
     * @param {DeleteSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId UUID of the snapshot you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSnapshot(
      zone: DeleteSnapshotZoneEnum,
      snapshotId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteSnapshot(zone, snapshotId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Export a snapshot to a specified Object Storage bucket in the same region.
     * @summary Export a snapshot
     * @param {ExportSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId Snapshot ID.
     * @param {ExportSnapshotRequest} exportSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    exportSnapshot(
      zone: ExportSnapshotZoneEnum,
      snapshotId: string,
      exportSnapshotRequest: ExportSnapshotRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ExportSnapshotResponse> {
      return localVarFp
        .exportSnapshot(zone, snapshotId, exportSnapshotRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get details of a snapshot with the specified ID.
     * @summary Get a snapshot
     * @param {GetSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId UUID of the snapshot you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSnapshot(
      zone: GetSnapshotZoneEnum,
      snapshotId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetSnapshotResponse> {
      return localVarFp
        .getSnapshot(zone, snapshotId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all snapshots of an Organization in a specified Availability Zone.
     * @summary List snapshots
     * @param {ListSnapshotsZoneEnum} zone The zone you want to target
     * @param {string} [organization] List snapshots only for this Organization ID.
     * @param {string} [project] List snapshots only for this Project ID.
     * @param {number} [perPage] Number of snapshots returned per page (positive integer lower or equal to 100).
     * @param {number} [page] Page to be returned.
     * @param {string} [name] List snapshots of the requested name.
     * @param {string} [tags] List snapshots that have the requested tag.
     * @param {string} [baseVolumeId] List snapshots originating only from this volume.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSnapshots(
      zone: ListSnapshotsZoneEnum,
      organization?: string,
      project?: string,
      perPage?: number,
      page?: number,
      name?: string,
      tags?: string,
      baseVolumeId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListSnapshotsResponse> {
      return localVarFp
        .listSnapshots(
          zone,
          organization,
          project,
          perPage,
          page,
          name,
          tags,
          baseVolumeId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Replace all the properties of a snapshot.
     * @summary Set snapshot
     * @param {SetSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId
     * @param {SetSnapshotRequest} setSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setSnapshot(
      zone: SetSnapshotZoneEnum,
      snapshotId: string,
      setSnapshotRequest: SetSnapshotRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1SetSnapshotResponse> {
      return localVarFp
        .setSnapshot(zone, snapshotId, setSnapshotRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the properties of a snapshot.
     * @summary Update a snapshot
     * @param {UpdateSnapshotZoneEnum} zone The zone you want to target
     * @param {string} snapshotId UUID of the snapshot. (UUID format)
     * @param {UpdateSnapshotRequest} updateSnapshotRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSnapshot(
      zone: UpdateSnapshotZoneEnum,
      snapshotId: string,
      updateSnapshotRequest: UpdateSnapshotRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1UpdateSnapshotResponse> {
      return localVarFp
        .updateSnapshot(zone, snapshotId, updateSnapshotRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SnapshotsApi - interface
 * @export
 * @interface SnapshotsApi
 */
export interface SnapshotsApiInterface {
  /**
   * Create a snapshot from a specified volume or from a QCOW2 file in a specified Availability Zone.
   * @summary Create a snapshot from a specified volume or from a QCOW2 file
   * @param {CreateSnapshotZoneEnum} zone The zone you want to target
   * @param {CreateSnapshotRequest} createSnapshotRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  createSnapshot(
    zone: CreateSnapshotZoneEnum,
    createSnapshotRequest: CreateSnapshotRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1CreateSnapshotResponse>;

  /**
   * Delete the snapshot with the specified ID.
   * @summary Delete a snapshot
   * @param {DeleteSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId UUID of the snapshot you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  deleteSnapshot(
    zone: DeleteSnapshotZoneEnum,
    snapshotId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Export a snapshot to a specified Object Storage bucket in the same region.
   * @summary Export a snapshot
   * @param {ExportSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId Snapshot ID.
   * @param {ExportSnapshotRequest} exportSnapshotRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  exportSnapshot(
    zone: ExportSnapshotZoneEnum,
    snapshotId: string,
    exportSnapshotRequest: ExportSnapshotRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ExportSnapshotResponse>;

  /**
   * Get details of a snapshot with the specified ID.
   * @summary Get a snapshot
   * @param {GetSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId UUID of the snapshot you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  getSnapshot(
    zone: GetSnapshotZoneEnum,
    snapshotId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetSnapshotResponse>;

  /**
   * List all snapshots of an Organization in a specified Availability Zone.
   * @summary List snapshots
   * @param {ListSnapshotsZoneEnum} zone The zone you want to target
   * @param {string} [organization] List snapshots only for this Organization ID.
   * @param {string} [project] List snapshots only for this Project ID.
   * @param {number} [perPage] Number of snapshots returned per page (positive integer lower or equal to 100).
   * @param {number} [page] Page to be returned.
   * @param {string} [name] List snapshots of the requested name.
   * @param {string} [tags] List snapshots that have the requested tag.
   * @param {string} [baseVolumeId] List snapshots originating only from this volume.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  listSnapshots(
    zone: ListSnapshotsZoneEnum,
    organization?: string,
    project?: string,
    perPage?: number,
    page?: number,
    name?: string,
    tags?: string,
    baseVolumeId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListSnapshotsResponse>;

  /**
   * Replace all the properties of a snapshot.
   * @summary Set snapshot
   * @param {SetSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId
   * @param {SetSnapshotRequest} setSnapshotRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  setSnapshot(
    zone: SetSnapshotZoneEnum,
    snapshotId: string,
    setSnapshotRequest: SetSnapshotRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1SetSnapshotResponse>;

  /**
   * Update the properties of a snapshot.
   * @summary Update a snapshot
   * @param {UpdateSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId UUID of the snapshot. (UUID format)
   * @param {UpdateSnapshotRequest} updateSnapshotRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  updateSnapshot(
    zone: UpdateSnapshotZoneEnum,
    snapshotId: string,
    updateSnapshotRequest: UpdateSnapshotRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1UpdateSnapshotResponse>;
}

/**
 * SnapshotsApi - object-oriented interface
 * @export
 * @class SnapshotsApi
 * @extends {BaseAPI}
 */
export class SnapshotsApi extends BaseAPI implements SnapshotsApiInterface {
  /**
   * Create a snapshot from a specified volume or from a QCOW2 file in a specified Availability Zone.
   * @summary Create a snapshot from a specified volume or from a QCOW2 file
   * @param {CreateSnapshotZoneEnum} zone The zone you want to target
   * @param {CreateSnapshotRequest} createSnapshotRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public createSnapshot(
    zone: CreateSnapshotZoneEnum,
    createSnapshotRequest: CreateSnapshotRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .createSnapshot(zone, createSnapshotRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete the snapshot with the specified ID.
   * @summary Delete a snapshot
   * @param {DeleteSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId UUID of the snapshot you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public deleteSnapshot(
    zone: DeleteSnapshotZoneEnum,
    snapshotId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .deleteSnapshot(zone, snapshotId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Export a snapshot to a specified Object Storage bucket in the same region.
   * @summary Export a snapshot
   * @param {ExportSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId Snapshot ID.
   * @param {ExportSnapshotRequest} exportSnapshotRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public exportSnapshot(
    zone: ExportSnapshotZoneEnum,
    snapshotId: string,
    exportSnapshotRequest: ExportSnapshotRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .exportSnapshot(zone, snapshotId, exportSnapshotRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get details of a snapshot with the specified ID.
   * @summary Get a snapshot
   * @param {GetSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId UUID of the snapshot you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public getSnapshot(
    zone: GetSnapshotZoneEnum,
    snapshotId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .getSnapshot(zone, snapshotId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all snapshots of an Organization in a specified Availability Zone.
   * @summary List snapshots
   * @param {ListSnapshotsZoneEnum} zone The zone you want to target
   * @param {string} [organization] List snapshots only for this Organization ID.
   * @param {string} [project] List snapshots only for this Project ID.
   * @param {number} [perPage] Number of snapshots returned per page (positive integer lower or equal to 100).
   * @param {number} [page] Page to be returned.
   * @param {string} [name] List snapshots of the requested name.
   * @param {string} [tags] List snapshots that have the requested tag.
   * @param {string} [baseVolumeId] List snapshots originating only from this volume.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public listSnapshots(
    zone: ListSnapshotsZoneEnum,
    organization?: string,
    project?: string,
    perPage?: number,
    page?: number,
    name?: string,
    tags?: string,
    baseVolumeId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .listSnapshots(
        zone,
        organization,
        project,
        perPage,
        page,
        name,
        tags,
        baseVolumeId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Replace all the properties of a snapshot.
   * @summary Set snapshot
   * @param {SetSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId
   * @param {SetSnapshotRequest} setSnapshotRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public setSnapshot(
    zone: SetSnapshotZoneEnum,
    snapshotId: string,
    setSnapshotRequest: SetSnapshotRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .setSnapshot(zone, snapshotId, setSnapshotRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the properties of a snapshot.
   * @summary Update a snapshot
   * @param {UpdateSnapshotZoneEnum} zone The zone you want to target
   * @param {string} snapshotId UUID of the snapshot. (UUID format)
   * @param {UpdateSnapshotRequest} updateSnapshotRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public updateSnapshot(
    zone: UpdateSnapshotZoneEnum,
    snapshotId: string,
    updateSnapshotRequest: UpdateSnapshotRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .updateSnapshot(zone, snapshotId, updateSnapshotRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const CreateSnapshotZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CreateSnapshotZoneEnum =
  (typeof CreateSnapshotZoneEnum)[keyof typeof CreateSnapshotZoneEnum];
/**
 * @export
 */
export const DeleteSnapshotZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeleteSnapshotZoneEnum =
  (typeof DeleteSnapshotZoneEnum)[keyof typeof DeleteSnapshotZoneEnum];
/**
 * @export
 */
export const ExportSnapshotZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ExportSnapshotZoneEnum =
  (typeof ExportSnapshotZoneEnum)[keyof typeof ExportSnapshotZoneEnum];
/**
 * @export
 */
export const GetSnapshotZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetSnapshotZoneEnum =
  (typeof GetSnapshotZoneEnum)[keyof typeof GetSnapshotZoneEnum];
/**
 * @export
 */
export const ListSnapshotsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListSnapshotsZoneEnum =
  (typeof ListSnapshotsZoneEnum)[keyof typeof ListSnapshotsZoneEnum];
/**
 * @export
 */
export const SetSnapshotZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type SetSnapshotZoneEnum =
  (typeof SetSnapshotZoneEnum)[keyof typeof SetSnapshotZoneEnum];
/**
 * @export
 */
export const UpdateSnapshotZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdateSnapshotZoneEnum =
  (typeof UpdateSnapshotZoneEnum)[keyof typeof UpdateSnapshotZoneEnum];

/**
 * UserDataApi - axios parameter creator
 * @export
 */
export const UserDataApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Delete the specified key from an Instance\'s user data.
     * @summary Delete user data
     * @param {DeleteServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {string} key Key of the user data to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteServerUserData: async (
      zone: DeleteServerUserDataZoneEnum,
      serverId: string,
      key: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteServerUserData', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('deleteServerUserData', 'serverId', serverId);
      // verify required parameter 'key' is not null or undefined
      assertParamExists('deleteServerUserData', 'key', key);
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/user_data/{key}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(`{${'key'}}`, encodeURIComponent(String(key)));
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
     * Get the content of a user data with the specified key on an Instance.
     * @summary Get user data
     * @param {GetServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {string} key Key of the user data to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServerUserData: async (
      zone: GetServerUserDataZoneEnum,
      serverId: string,
      key: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getServerUserData', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('getServerUserData', 'serverId', serverId);
      // verify required parameter 'key' is not null or undefined
      assertParamExists('getServerUserData', 'key', key);
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/user_data/{key}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(`{${'key'}}`, encodeURIComponent(String(key)));
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
     * List all user data keys registered on a specified Instance.
     * @summary List user data
     * @param {ListServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServerUserData: async (
      zone: ListServerUserDataZoneEnum,
      serverId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listServerUserData', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('listServerUserData', 'serverId', serverId);
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/user_data`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)));
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
     * Add or update a user data with the specified key on an Instance.
     * @summary Add/set user data
     * @param {SetServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {string} key Key of the user data to set.
     * @param {File} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setServerUserData: async (
      zone: SetServerUserDataZoneEnum,
      serverId: string,
      key: string,
      body: File,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setServerUserData', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('setServerUserData', 'serverId', serverId);
      // verify required parameter 'key' is not null or undefined
      assertParamExists('setServerUserData', 'key', key);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('setServerUserData', 'body', body);
      const localVarPath =
        `/instance/v1/zones/{zone}/servers/{server_id}/user_data/{key}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(`{${'key'}}`, encodeURIComponent(String(key)));
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
        body,
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
 * UserDataApi - functional programming interface
 * @export
 */
export const UserDataApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = UserDataApiAxiosParamCreator(configuration);
  return {
    /**
     * Delete the specified key from an Instance\'s user data.
     * @summary Delete user data
     * @param {DeleteServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {string} key Key of the user data to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteServerUserData(
      zone: DeleteServerUserDataZoneEnum,
      serverId: string,
      key: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteServerUserData(
          zone,
          serverId,
          key,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UserDataApi.deleteServerUserData']?.[
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
     * Get the content of a user data with the specified key on an Instance.
     * @summary Get user data
     * @param {GetServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {string} key Key of the user data to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getServerUserData(
      zone: GetServerUserDataZoneEnum,
      serverId: string,
      key: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayStdFile>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getServerUserData(
          zone,
          serverId,
          key,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UserDataApi.getServerUserData']?.[
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
     * List all user data keys registered on a specified Instance.
     * @summary List user data
     * @param {ListServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listServerUserData(
      zone: ListServerUserDataZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListServerUserDataResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listServerUserData(
          zone,
          serverId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UserDataApi.listServerUserData']?.[
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
     * Add or update a user data with the specified key on an Instance.
     * @summary Add/set user data
     * @param {SetServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {string} key Key of the user data to set.
     * @param {File} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setServerUserData(
      zone: SetServerUserDataZoneEnum,
      serverId: string,
      key: string,
      body: File,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.setServerUserData(
          zone,
          serverId,
          key,
          body,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UserDataApi.setServerUserData']?.[
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
 * UserDataApi - factory interface
 * @export
 */
export const UserDataApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = UserDataApiFp(configuration);
  return {
    /**
     * Delete the specified key from an Instance\'s user data.
     * @summary Delete user data
     * @param {DeleteServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {string} key Key of the user data to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteServerUserData(
      zone: DeleteServerUserDataZoneEnum,
      serverId: string,
      key: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteServerUserData(zone, serverId, key, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get the content of a user data with the specified key on an Instance.
     * @summary Get user data
     * @param {GetServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {string} key Key of the user data to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServerUserData(
      zone: GetServerUserDataZoneEnum,
      serverId: string,
      key: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayStdFile> {
      return localVarFp
        .getServerUserData(zone, serverId, key, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all user data keys registered on a specified Instance.
     * @summary List user data
     * @param {ListServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServerUserData(
      zone: ListServerUserDataZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListServerUserDataResponse> {
      return localVarFp
        .listServerUserData(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Add or update a user data with the specified key on an Instance.
     * @summary Add/set user data
     * @param {SetServerUserDataZoneEnum} zone The zone you want to target
     * @param {string} serverId UUID of the Instance.
     * @param {string} key Key of the user data to set.
     * @param {File} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setServerUserData(
      zone: SetServerUserDataZoneEnum,
      serverId: string,
      key: string,
      body: File,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .setServerUserData(zone, serverId, key, body, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * UserDataApi - interface
 * @export
 * @interface UserDataApi
 */
export interface UserDataApiInterface {
  /**
   * Delete the specified key from an Instance\'s user data.
   * @summary Delete user data
   * @param {DeleteServerUserDataZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {string} key Key of the user data to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserDataApiInterface
   */
  deleteServerUserData(
    zone: DeleteServerUserDataZoneEnum,
    serverId: string,
    key: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get the content of a user data with the specified key on an Instance.
   * @summary Get user data
   * @param {GetServerUserDataZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {string} key Key of the user data to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserDataApiInterface
   */
  getServerUserData(
    zone: GetServerUserDataZoneEnum,
    serverId: string,
    key: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayStdFile>;

  /**
   * List all user data keys registered on a specified Instance.
   * @summary List user data
   * @param {ListServerUserDataZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserDataApiInterface
   */
  listServerUserData(
    zone: ListServerUserDataZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListServerUserDataResponse>;

  /**
   * Add or update a user data with the specified key on an Instance.
   * @summary Add/set user data
   * @param {SetServerUserDataZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {string} key Key of the user data to set.
   * @param {File} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserDataApiInterface
   */
  setServerUserData(
    zone: SetServerUserDataZoneEnum,
    serverId: string,
    key: string,
    body: File,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;
}

/**
 * UserDataApi - object-oriented interface
 * @export
 * @class UserDataApi
 * @extends {BaseAPI}
 */
export class UserDataApi extends BaseAPI implements UserDataApiInterface {
  /**
   * Delete the specified key from an Instance\'s user data.
   * @summary Delete user data
   * @param {DeleteServerUserDataZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {string} key Key of the user data to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserDataApi
   */
  public deleteServerUserData(
    zone: DeleteServerUserDataZoneEnum,
    serverId: string,
    key: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UserDataApiFp(this.configuration)
      .deleteServerUserData(zone, serverId, key, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get the content of a user data with the specified key on an Instance.
   * @summary Get user data
   * @param {GetServerUserDataZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {string} key Key of the user data to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserDataApi
   */
  public getServerUserData(
    zone: GetServerUserDataZoneEnum,
    serverId: string,
    key: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UserDataApiFp(this.configuration)
      .getServerUserData(zone, serverId, key, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all user data keys registered on a specified Instance.
   * @summary List user data
   * @param {ListServerUserDataZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserDataApi
   */
  public listServerUserData(
    zone: ListServerUserDataZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UserDataApiFp(this.configuration)
      .listServerUserData(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Add or update a user data with the specified key on an Instance.
   * @summary Add/set user data
   * @param {SetServerUserDataZoneEnum} zone The zone you want to target
   * @param {string} serverId UUID of the Instance.
   * @param {string} key Key of the user data to set.
   * @param {File} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UserDataApi
   */
  public setServerUserData(
    zone: SetServerUserDataZoneEnum,
    serverId: string,
    key: string,
    body: File,
    options?: RawAxiosRequestConfig,
  ) {
    return UserDataApiFp(this.configuration)
      .setServerUserData(zone, serverId, key, body, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const DeleteServerUserDataZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeleteServerUserDataZoneEnum =
  (typeof DeleteServerUserDataZoneEnum)[keyof typeof DeleteServerUserDataZoneEnum];
/**
 * @export
 */
export const GetServerUserDataZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetServerUserDataZoneEnum =
  (typeof GetServerUserDataZoneEnum)[keyof typeof GetServerUserDataZoneEnum];
/**
 * @export
 */
export const ListServerUserDataZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListServerUserDataZoneEnum =
  (typeof ListServerUserDataZoneEnum)[keyof typeof ListServerUserDataZoneEnum];
/**
 * @export
 */
export const SetServerUserDataZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type SetServerUserDataZoneEnum =
  (typeof SetServerUserDataZoneEnum)[keyof typeof SetServerUserDataZoneEnum];

/**
 * VolumeTypesApi - axios parameter creator
 * @export
 */
export const VolumeTypesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List all volume types and their technical details.
     * @summary List volume types
     * @param {ListVolumesTypesZoneEnum} zone The zone you want to target
     * @param {number} [perPage]
     * @param {number} [page]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listVolumesTypes: async (
      zone: ListVolumesTypesZoneEnum,
      perPage?: number,
      page?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listVolumesTypes', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/products/volumes`.replace(
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

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
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
 * VolumeTypesApi - functional programming interface
 * @export
 */
export const VolumeTypesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    VolumeTypesApiAxiosParamCreator(configuration);
  return {
    /**
     * List all volume types and their technical details.
     * @summary List volume types
     * @param {ListVolumesTypesZoneEnum} zone The zone you want to target
     * @param {number} [perPage]
     * @param {number} [page]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listVolumesTypes(
      zone: ListVolumesTypesZoneEnum,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListVolumesTypesResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listVolumesTypes(
          zone,
          perPage,
          page,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VolumeTypesApi.listVolumesTypes']?.[
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
 * VolumeTypesApi - factory interface
 * @export
 */
export const VolumeTypesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = VolumeTypesApiFp(configuration);
  return {
    /**
     * List all volume types and their technical details.
     * @summary List volume types
     * @param {ListVolumesTypesZoneEnum} zone The zone you want to target
     * @param {number} [perPage]
     * @param {number} [page]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listVolumesTypes(
      zone: ListVolumesTypesZoneEnum,
      perPage?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListVolumesTypesResponse> {
      return localVarFp
        .listVolumesTypes(zone, perPage, page, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * VolumeTypesApi - interface
 * @export
 * @interface VolumeTypesApi
 */
export interface VolumeTypesApiInterface {
  /**
   * List all volume types and their technical details.
   * @summary List volume types
   * @param {ListVolumesTypesZoneEnum} zone The zone you want to target
   * @param {number} [perPage]
   * @param {number} [page]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumeTypesApiInterface
   */
  listVolumesTypes(
    zone: ListVolumesTypesZoneEnum,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListVolumesTypesResponse>;
}

/**
 * VolumeTypesApi - object-oriented interface
 * @export
 * @class VolumeTypesApi
 * @extends {BaseAPI}
 */
export class VolumeTypesApi extends BaseAPI implements VolumeTypesApiInterface {
  /**
   * List all volume types and their technical details.
   * @summary List volume types
   * @param {ListVolumesTypesZoneEnum} zone The zone you want to target
   * @param {number} [perPage]
   * @param {number} [page]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumeTypesApi
   */
  public listVolumesTypes(
    zone: ListVolumesTypesZoneEnum,
    perPage?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return VolumeTypesApiFp(this.configuration)
      .listVolumesTypes(zone, perPage, page, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListVolumesTypesZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListVolumesTypesZoneEnum =
  (typeof ListVolumesTypesZoneEnum)[keyof typeof ListVolumesTypesZoneEnum];

/**
 * VolumesApi - axios parameter creator
 * @export
 */
export const VolumesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * To be used, the call to this endpoint must be preceded by a call to the [Get a volume or snapshot\'s migration plan](#path-volumes-get-a-volume-or-snapshots-migration-plan) endpoint. To migrate all resources mentioned in the migration plan, the validation_key returned in the plan must be provided.
     * @summary Migrate a volume and/or snapshots to SBS (Scaleway Block Storage)
     * @param {ApplyBlockMigrationZoneEnum} zone The zone you want to target
     * @param {ApplyBlockMigrationRequest} applyBlockMigrationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    applyBlockMigration: async (
      zone: ApplyBlockMigrationZoneEnum,
      applyBlockMigrationRequest: ApplyBlockMigrationRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('applyBlockMigration', 'zone', zone);
      // verify required parameter 'applyBlockMigrationRequest' is not null or undefined
      assertParamExists(
        'applyBlockMigration',
        'applyBlockMigrationRequest',
        applyBlockMigrationRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/block-migration/apply`.replace(
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
        applyBlockMigrationRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Create a volume of a specified type in an Availability Zone.
     * @summary Create a volume
     * @param {CreateVolumeZoneEnum} zone The zone you want to target
     * @param {CreateVolumeRequest} createVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createVolume: async (
      zone: CreateVolumeZoneEnum,
      createVolumeRequest: CreateVolumeRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createVolume', 'zone', zone);
      // verify required parameter 'createVolumeRequest' is not null or undefined
      assertParamExists(
        'createVolume',
        'createVolumeRequest',
        createVolumeRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/volumes`.replace(
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
        createVolumeRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete the volume with the specified ID.
     * @summary Delete a volume
     * @param {DeleteVolumeZoneEnum} zone The zone you want to target
     * @param {string} volumeId UUID of the volume you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteVolume: async (
      zone: DeleteVolumeZoneEnum,
      volumeId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteVolume', 'zone', zone);
      // verify required parameter 'volumeId' is not null or undefined
      assertParamExists('deleteVolume', 'volumeId', volumeId);
      const localVarPath = `/instance/v1/zones/{zone}/volumes/{volume_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'volume_id'}}`, encodeURIComponent(String(volumeId)));
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
     * Get details of a volume with the specified ID.
     * @summary Get a volume
     * @param {GetVolumeZoneEnum} zone The zone you want to target
     * @param {string} volumeId UUID of the volume you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getVolume: async (
      zone: GetVolumeZoneEnum,
      volumeId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getVolume', 'zone', zone);
      // verify required parameter 'volumeId' is not null or undefined
      assertParamExists('getVolume', 'volumeId', volumeId);
      const localVarPath = `/instance/v1/zones/{zone}/volumes/{volume_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'volume_id'}}`, encodeURIComponent(String(volumeId)));
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
     * List volumes in the specified Availability Zone. You can filter the output by volume type.
     * @summary List volumes
     * @param {ListVolumesZoneEnum} zone The zone you want to target
     * @param {ListVolumesVolumeTypeEnum} [volumeType] Filter by volume type.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [organization] Filter volume by Organization ID.
     * @param {string} [project] Filter volume by Project ID.
     * @param {string} [tags] Filter volumes with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [name] Filter volume by name (for eg. \&quot;vol\&quot; will return \&quot;myvolume\&quot; but not \&quot;data\&quot;).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listVolumes: async (
      zone: ListVolumesZoneEnum,
      volumeType?: ListVolumesVolumeTypeEnum,
      perPage?: number,
      page?: number,
      organization?: string,
      project?: string,
      tags?: string,
      name?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listVolumes', 'zone', zone);
      const localVarPath = `/instance/v1/zones/{zone}/volumes`.replace(
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

      if (volumeType !== undefined) {
        localVarQueryParameter['volume_type'] = volumeType;
      }

      if (perPage !== undefined) {
        localVarQueryParameter['per_page'] = perPage;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (organization !== undefined) {
        localVarQueryParameter['organization'] = organization;
      }

      if (project !== undefined) {
        localVarQueryParameter['project'] = project;
      }

      if (tags !== undefined) {
        localVarQueryParameter['tags'] = tags;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
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
     * Given a volume or snapshot, returns the migration plan but does not perform the actual migration. To perform the migration, you have to call the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint afterward. The endpoint returns the resources that should be migrated together: - the volume and any snapshots created from the volume, if the call was made to plan a volume migration. - the base volume of the snapshot (if the volume is not deleted) and its related snapshots, if the call was made to plan a snapshot migration. The endpoint also returns the validation_key, which must be provided to the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint to confirm that all resources listed in the plan should be migrated.
     * @summary Get a volume or snapshot\'s migration plan
     * @param {PlanBlockMigrationZoneEnum} zone The zone you want to target
     * @param {PlanBlockMigrationRequest} planBlockMigrationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    planBlockMigration: async (
      zone: PlanBlockMigrationZoneEnum,
      planBlockMigrationRequest: PlanBlockMigrationRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('planBlockMigration', 'zone', zone);
      // verify required parameter 'planBlockMigrationRequest' is not null or undefined
      assertParamExists(
        'planBlockMigration',
        'planBlockMigrationRequest',
        planBlockMigrationRequest,
      );
      const localVarPath =
        `/instance/v1/zones/{zone}/block-migration/plan`.replace(
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
        planBlockMigrationRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Replace all volume properties with a volume message.
     * @summary Update volume
     * @param {SetVolumeZoneEnum} zone The zone you want to target
     * @param {string} id Unique ID of the volume.
     * @param {SetVolumeRequest} setVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setVolume: async (
      zone: SetVolumeZoneEnum,
      id: string,
      setVolumeRequest: SetVolumeRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('setVolume', 'zone', zone);
      // verify required parameter 'id' is not null or undefined
      assertParamExists('setVolume', 'id', id);
      // verify required parameter 'setVolumeRequest' is not null or undefined
      assertParamExists('setVolume', 'setVolumeRequest', setVolumeRequest);
      const localVarPath = `/instance/v1/zones/{zone}/volumes/{id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'id'}}`, encodeURIComponent(String(id)));
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
        setVolumeRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Replace the name and/or size properties of a volume specified by its ID, with the specified value(s).
     * @summary Update a volume
     * @param {UpdateVolumeZoneEnum} zone The zone you want to target
     * @param {string} volumeId UUID of the volume.
     * @param {UpdateVolumeRequest} updateVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateVolume: async (
      zone: UpdateVolumeZoneEnum,
      volumeId: string,
      updateVolumeRequest: UpdateVolumeRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateVolume', 'zone', zone);
      // verify required parameter 'volumeId' is not null or undefined
      assertParamExists('updateVolume', 'volumeId', volumeId);
      // verify required parameter 'updateVolumeRequest' is not null or undefined
      assertParamExists(
        'updateVolume',
        'updateVolumeRequest',
        updateVolumeRequest,
      );
      const localVarPath = `/instance/v1/zones/{zone}/volumes/{volume_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'volume_id'}}`, encodeURIComponent(String(volumeId)));
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
        updateVolumeRequest,
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
 * VolumesApi - functional programming interface
 * @export
 */
export const VolumesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = VolumesApiAxiosParamCreator(configuration);
  return {
    /**
     * To be used, the call to this endpoint must be preceded by a call to the [Get a volume or snapshot\'s migration plan](#path-volumes-get-a-volume-or-snapshots-migration-plan) endpoint. To migrate all resources mentioned in the migration plan, the validation_key returned in the plan must be provided.
     * @summary Migrate a volume and/or snapshots to SBS (Scaleway Block Storage)
     * @param {ApplyBlockMigrationZoneEnum} zone The zone you want to target
     * @param {ApplyBlockMigrationRequest} applyBlockMigrationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async applyBlockMigration(
      zone: ApplyBlockMigrationZoneEnum,
      applyBlockMigrationRequest: ApplyBlockMigrationRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.applyBlockMigration(
          zone,
          applyBlockMigrationRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VolumesApi.applyBlockMigration']?.[
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
     * Create a volume of a specified type in an Availability Zone.
     * @summary Create a volume
     * @param {CreateVolumeZoneEnum} zone The zone you want to target
     * @param {CreateVolumeRequest} createVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createVolume(
      zone: CreateVolumeZoneEnum,
      createVolumeRequest: CreateVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1CreateVolumeResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createVolume(
        zone,
        createVolumeRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VolumesApi.createVolume']?.[
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
     * Delete the volume with the specified ID.
     * @summary Delete a volume
     * @param {DeleteVolumeZoneEnum} zone The zone you want to target
     * @param {string} volumeId UUID of the volume you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteVolume(
      zone: DeleteVolumeZoneEnum,
      volumeId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteVolume(
        zone,
        volumeId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VolumesApi.deleteVolume']?.[
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
     * Get details of a volume with the specified ID.
     * @summary Get a volume
     * @param {GetVolumeZoneEnum} zone The zone you want to target
     * @param {string} volumeId UUID of the volume you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getVolume(
      zone: GetVolumeZoneEnum,
      volumeId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1GetVolumeResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getVolume(
        zone,
        volumeId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VolumesApi.getVolume']?.[
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
     * List volumes in the specified Availability Zone. You can filter the output by volume type.
     * @summary List volumes
     * @param {ListVolumesZoneEnum} zone The zone you want to target
     * @param {ListVolumesVolumeTypeEnum} [volumeType] Filter by volume type.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [organization] Filter volume by Organization ID.
     * @param {string} [project] Filter volume by Project ID.
     * @param {string} [tags] Filter volumes with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [name] Filter volume by name (for eg. \&quot;vol\&quot; will return \&quot;myvolume\&quot; but not \&quot;data\&quot;).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listVolumes(
      zone: ListVolumesZoneEnum,
      volumeType?: ListVolumesVolumeTypeEnum,
      perPage?: number,
      page?: number,
      organization?: string,
      project?: string,
      tags?: string,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1ListVolumesResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listVolumes(
        zone,
        volumeType,
        perPage,
        page,
        organization,
        project,
        tags,
        name,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VolumesApi.listVolumes']?.[
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
     * Given a volume or snapshot, returns the migration plan but does not perform the actual migration. To perform the migration, you have to call the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint afterward. The endpoint returns the resources that should be migrated together: - the volume and any snapshots created from the volume, if the call was made to plan a volume migration. - the base volume of the snapshot (if the volume is not deleted) and its related snapshots, if the call was made to plan a snapshot migration. The endpoint also returns the validation_key, which must be provided to the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint to confirm that all resources listed in the plan should be migrated.
     * @summary Get a volume or snapshot\'s migration plan
     * @param {PlanBlockMigrationZoneEnum} zone The zone you want to target
     * @param {PlanBlockMigrationRequest} planBlockMigrationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async planBlockMigration(
      zone: PlanBlockMigrationZoneEnum,
      planBlockMigrationRequest: PlanBlockMigrationRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1MigrationPlan>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.planBlockMigration(
          zone,
          planBlockMigrationRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VolumesApi.planBlockMigration']?.[
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
     * Replace all volume properties with a volume message.
     * @summary Update volume
     * @param {SetVolumeZoneEnum} zone The zone you want to target
     * @param {string} id Unique ID of the volume.
     * @param {SetVolumeRequest} setVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setVolume(
      zone: SetVolumeZoneEnum,
      id: string,
      setVolumeRequest: SetVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1SetVolumeResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.setVolume(
        zone,
        id,
        setVolumeRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VolumesApi.setVolume']?.[
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
     * Replace the name and/or size properties of a volume specified by its ID, with the specified value(s).
     * @summary Update a volume
     * @param {UpdateVolumeZoneEnum} zone The zone you want to target
     * @param {string} volumeId UUID of the volume.
     * @param {UpdateVolumeRequest} updateVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateVolume(
      zone: UpdateVolumeZoneEnum,
      volumeId: string,
      updateVolumeRequest: UpdateVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayInstanceV1UpdateVolumeResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateVolume(
        zone,
        volumeId,
        updateVolumeRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VolumesApi.updateVolume']?.[
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
 * VolumesApi - factory interface
 * @export
 */
export const VolumesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = VolumesApiFp(configuration);
  return {
    /**
     * To be used, the call to this endpoint must be preceded by a call to the [Get a volume or snapshot\'s migration plan](#path-volumes-get-a-volume-or-snapshots-migration-plan) endpoint. To migrate all resources mentioned in the migration plan, the validation_key returned in the plan must be provided.
     * @summary Migrate a volume and/or snapshots to SBS (Scaleway Block Storage)
     * @param {ApplyBlockMigrationZoneEnum} zone The zone you want to target
     * @param {ApplyBlockMigrationRequest} applyBlockMigrationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    applyBlockMigration(
      zone: ApplyBlockMigrationZoneEnum,
      applyBlockMigrationRequest: ApplyBlockMigrationRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .applyBlockMigration(zone, applyBlockMigrationRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a volume of a specified type in an Availability Zone.
     * @summary Create a volume
     * @param {CreateVolumeZoneEnum} zone The zone you want to target
     * @param {CreateVolumeRequest} createVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createVolume(
      zone: CreateVolumeZoneEnum,
      createVolumeRequest: CreateVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1CreateVolumeResponse> {
      return localVarFp
        .createVolume(zone, createVolumeRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete the volume with the specified ID.
     * @summary Delete a volume
     * @param {DeleteVolumeZoneEnum} zone The zone you want to target
     * @param {string} volumeId UUID of the volume you want to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteVolume(
      zone: DeleteVolumeZoneEnum,
      volumeId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteVolume(zone, volumeId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get details of a volume with the specified ID.
     * @summary Get a volume
     * @param {GetVolumeZoneEnum} zone The zone you want to target
     * @param {string} volumeId UUID of the volume you want to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getVolume(
      zone: GetVolumeZoneEnum,
      volumeId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1GetVolumeResponse> {
      return localVarFp
        .getVolume(zone, volumeId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List volumes in the specified Availability Zone. You can filter the output by volume type.
     * @summary List volumes
     * @param {ListVolumesZoneEnum} zone The zone you want to target
     * @param {ListVolumesVolumeTypeEnum} [volumeType] Filter by volume type.
     * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
     * @param {number} [page] A positive integer to choose the page to return.
     * @param {string} [organization] Filter volume by Organization ID.
     * @param {string} [project] Filter volume by Project ID.
     * @param {string} [tags] Filter volumes with these exact tags (to filter with several tags, use commas to separate them).
     * @param {string} [name] Filter volume by name (for eg. \&quot;vol\&quot; will return \&quot;myvolume\&quot; but not \&quot;data\&quot;).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listVolumes(
      zone: ListVolumesZoneEnum,
      volumeType?: ListVolumesVolumeTypeEnum,
      perPage?: number,
      page?: number,
      organization?: string,
      project?: string,
      tags?: string,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1ListVolumesResponse> {
      return localVarFp
        .listVolumes(
          zone,
          volumeType,
          perPage,
          page,
          organization,
          project,
          tags,
          name,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Given a volume or snapshot, returns the migration plan but does not perform the actual migration. To perform the migration, you have to call the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint afterward. The endpoint returns the resources that should be migrated together: - the volume and any snapshots created from the volume, if the call was made to plan a volume migration. - the base volume of the snapshot (if the volume is not deleted) and its related snapshots, if the call was made to plan a snapshot migration. The endpoint also returns the validation_key, which must be provided to the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint to confirm that all resources listed in the plan should be migrated.
     * @summary Get a volume or snapshot\'s migration plan
     * @param {PlanBlockMigrationZoneEnum} zone The zone you want to target
     * @param {PlanBlockMigrationRequest} planBlockMigrationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    planBlockMigration(
      zone: PlanBlockMigrationZoneEnum,
      planBlockMigrationRequest: PlanBlockMigrationRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1MigrationPlan> {
      return localVarFp
        .planBlockMigration(zone, planBlockMigrationRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Replace all volume properties with a volume message.
     * @summary Update volume
     * @param {SetVolumeZoneEnum} zone The zone you want to target
     * @param {string} id Unique ID of the volume.
     * @param {SetVolumeRequest} setVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setVolume(
      zone: SetVolumeZoneEnum,
      id: string,
      setVolumeRequest: SetVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1SetVolumeResponse> {
      return localVarFp
        .setVolume(zone, id, setVolumeRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Replace the name and/or size properties of a volume specified by its ID, with the specified value(s).
     * @summary Update a volume
     * @param {UpdateVolumeZoneEnum} zone The zone you want to target
     * @param {string} volumeId UUID of the volume.
     * @param {UpdateVolumeRequest} updateVolumeRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateVolume(
      zone: UpdateVolumeZoneEnum,
      volumeId: string,
      updateVolumeRequest: UpdateVolumeRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayInstanceV1UpdateVolumeResponse> {
      return localVarFp
        .updateVolume(zone, volumeId, updateVolumeRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * VolumesApi - interface
 * @export
 * @interface VolumesApi
 */
export interface VolumesApiInterface {
  /**
   * To be used, the call to this endpoint must be preceded by a call to the [Get a volume or snapshot\'s migration plan](#path-volumes-get-a-volume-or-snapshots-migration-plan) endpoint. To migrate all resources mentioned in the migration plan, the validation_key returned in the plan must be provided.
   * @summary Migrate a volume and/or snapshots to SBS (Scaleway Block Storage)
   * @param {ApplyBlockMigrationZoneEnum} zone The zone you want to target
   * @param {ApplyBlockMigrationRequest} applyBlockMigrationRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApiInterface
   */
  applyBlockMigration(
    zone: ApplyBlockMigrationZoneEnum,
    applyBlockMigrationRequest: ApplyBlockMigrationRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Create a volume of a specified type in an Availability Zone.
   * @summary Create a volume
   * @param {CreateVolumeZoneEnum} zone The zone you want to target
   * @param {CreateVolumeRequest} createVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApiInterface
   */
  createVolume(
    zone: CreateVolumeZoneEnum,
    createVolumeRequest: CreateVolumeRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1CreateVolumeResponse>;

  /**
   * Delete the volume with the specified ID.
   * @summary Delete a volume
   * @param {DeleteVolumeZoneEnum} zone The zone you want to target
   * @param {string} volumeId UUID of the volume you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApiInterface
   */
  deleteVolume(
    zone: DeleteVolumeZoneEnum,
    volumeId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get details of a volume with the specified ID.
   * @summary Get a volume
   * @param {GetVolumeZoneEnum} zone The zone you want to target
   * @param {string} volumeId UUID of the volume you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApiInterface
   */
  getVolume(
    zone: GetVolumeZoneEnum,
    volumeId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1GetVolumeResponse>;

  /**
   * List volumes in the specified Availability Zone. You can filter the output by volume type.
   * @summary List volumes
   * @param {ListVolumesZoneEnum} zone The zone you want to target
   * @param {ListVolumesVolumeTypeEnum} [volumeType] Filter by volume type.
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {string} [organization] Filter volume by Organization ID.
   * @param {string} [project] Filter volume by Project ID.
   * @param {string} [tags] Filter volumes with these exact tags (to filter with several tags, use commas to separate them).
   * @param {string} [name] Filter volume by name (for eg. \&quot;vol\&quot; will return \&quot;myvolume\&quot; but not \&quot;data\&quot;).
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApiInterface
   */
  listVolumes(
    zone: ListVolumesZoneEnum,
    volumeType?: ListVolumesVolumeTypeEnum,
    perPage?: number,
    page?: number,
    organization?: string,
    project?: string,
    tags?: string,
    name?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1ListVolumesResponse>;

  /**
   * Given a volume or snapshot, returns the migration plan but does not perform the actual migration. To perform the migration, you have to call the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint afterward. The endpoint returns the resources that should be migrated together: - the volume and any snapshots created from the volume, if the call was made to plan a volume migration. - the base volume of the snapshot (if the volume is not deleted) and its related snapshots, if the call was made to plan a snapshot migration. The endpoint also returns the validation_key, which must be provided to the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint to confirm that all resources listed in the plan should be migrated.
   * @summary Get a volume or snapshot\'s migration plan
   * @param {PlanBlockMigrationZoneEnum} zone The zone you want to target
   * @param {PlanBlockMigrationRequest} planBlockMigrationRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApiInterface
   */
  planBlockMigration(
    zone: PlanBlockMigrationZoneEnum,
    planBlockMigrationRequest: PlanBlockMigrationRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1MigrationPlan>;

  /**
   * Replace all volume properties with a volume message.
   * @summary Update volume
   * @param {SetVolumeZoneEnum} zone The zone you want to target
   * @param {string} id Unique ID of the volume.
   * @param {SetVolumeRequest} setVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApiInterface
   */
  setVolume(
    zone: SetVolumeZoneEnum,
    id: string,
    setVolumeRequest: SetVolumeRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1SetVolumeResponse>;

  /**
   * Replace the name and/or size properties of a volume specified by its ID, with the specified value(s).
   * @summary Update a volume
   * @param {UpdateVolumeZoneEnum} zone The zone you want to target
   * @param {string} volumeId UUID of the volume.
   * @param {UpdateVolumeRequest} updateVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApiInterface
   */
  updateVolume(
    zone: UpdateVolumeZoneEnum,
    volumeId: string,
    updateVolumeRequest: UpdateVolumeRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayInstanceV1UpdateVolumeResponse>;
}

/**
 * VolumesApi - object-oriented interface
 * @export
 * @class VolumesApi
 * @extends {BaseAPI}
 */
export class VolumesApi extends BaseAPI implements VolumesApiInterface {
  /**
   * To be used, the call to this endpoint must be preceded by a call to the [Get a volume or snapshot\'s migration plan](#path-volumes-get-a-volume-or-snapshots-migration-plan) endpoint. To migrate all resources mentioned in the migration plan, the validation_key returned in the plan must be provided.
   * @summary Migrate a volume and/or snapshots to SBS (Scaleway Block Storage)
   * @param {ApplyBlockMigrationZoneEnum} zone The zone you want to target
   * @param {ApplyBlockMigrationRequest} applyBlockMigrationRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApi
   */
  public applyBlockMigration(
    zone: ApplyBlockMigrationZoneEnum,
    applyBlockMigrationRequest: ApplyBlockMigrationRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return VolumesApiFp(this.configuration)
      .applyBlockMigration(zone, applyBlockMigrationRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a volume of a specified type in an Availability Zone.
   * @summary Create a volume
   * @param {CreateVolumeZoneEnum} zone The zone you want to target
   * @param {CreateVolumeRequest} createVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApi
   */
  public createVolume(
    zone: CreateVolumeZoneEnum,
    createVolumeRequest: CreateVolumeRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return VolumesApiFp(this.configuration)
      .createVolume(zone, createVolumeRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete the volume with the specified ID.
   * @summary Delete a volume
   * @param {DeleteVolumeZoneEnum} zone The zone you want to target
   * @param {string} volumeId UUID of the volume you want to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApi
   */
  public deleteVolume(
    zone: DeleteVolumeZoneEnum,
    volumeId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VolumesApiFp(this.configuration)
      .deleteVolume(zone, volumeId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get details of a volume with the specified ID.
   * @summary Get a volume
   * @param {GetVolumeZoneEnum} zone The zone you want to target
   * @param {string} volumeId UUID of the volume you want to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApi
   */
  public getVolume(
    zone: GetVolumeZoneEnum,
    volumeId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VolumesApiFp(this.configuration)
      .getVolume(zone, volumeId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List volumes in the specified Availability Zone. You can filter the output by volume type.
   * @summary List volumes
   * @param {ListVolumesZoneEnum} zone The zone you want to target
   * @param {ListVolumesVolumeTypeEnum} [volumeType] Filter by volume type.
   * @param {number} [perPage] A positive integer lower or equal to 100 to select the number of items to return.
   * @param {number} [page] A positive integer to choose the page to return.
   * @param {string} [organization] Filter volume by Organization ID.
   * @param {string} [project] Filter volume by Project ID.
   * @param {string} [tags] Filter volumes with these exact tags (to filter with several tags, use commas to separate them).
   * @param {string} [name] Filter volume by name (for eg. \&quot;vol\&quot; will return \&quot;myvolume\&quot; but not \&quot;data\&quot;).
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApi
   */
  public listVolumes(
    zone: ListVolumesZoneEnum,
    volumeType?: ListVolumesVolumeTypeEnum,
    perPage?: number,
    page?: number,
    organization?: string,
    project?: string,
    tags?: string,
    name?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VolumesApiFp(this.configuration)
      .listVolumes(
        zone,
        volumeType,
        perPage,
        page,
        organization,
        project,
        tags,
        name,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Given a volume or snapshot, returns the migration plan but does not perform the actual migration. To perform the migration, you have to call the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint afterward. The endpoint returns the resources that should be migrated together: - the volume and any snapshots created from the volume, if the call was made to plan a volume migration. - the base volume of the snapshot (if the volume is not deleted) and its related snapshots, if the call was made to plan a snapshot migration. The endpoint also returns the validation_key, which must be provided to the [Migrate a volume and/or snapshots to SBS](#path-volumes-migrate-a-volume-andor-snapshots-to-sbs-scaleway-block-storage) endpoint to confirm that all resources listed in the plan should be migrated.
   * @summary Get a volume or snapshot\'s migration plan
   * @param {PlanBlockMigrationZoneEnum} zone The zone you want to target
   * @param {PlanBlockMigrationRequest} planBlockMigrationRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApi
   */
  public planBlockMigration(
    zone: PlanBlockMigrationZoneEnum,
    planBlockMigrationRequest: PlanBlockMigrationRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return VolumesApiFp(this.configuration)
      .planBlockMigration(zone, planBlockMigrationRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Replace all volume properties with a volume message.
   * @summary Update volume
   * @param {SetVolumeZoneEnum} zone The zone you want to target
   * @param {string} id Unique ID of the volume.
   * @param {SetVolumeRequest} setVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApi
   */
  public setVolume(
    zone: SetVolumeZoneEnum,
    id: string,
    setVolumeRequest: SetVolumeRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return VolumesApiFp(this.configuration)
      .setVolume(zone, id, setVolumeRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Replace the name and/or size properties of a volume specified by its ID, with the specified value(s).
   * @summary Update a volume
   * @param {UpdateVolumeZoneEnum} zone The zone you want to target
   * @param {string} volumeId UUID of the volume.
   * @param {UpdateVolumeRequest} updateVolumeRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VolumesApi
   */
  public updateVolume(
    zone: UpdateVolumeZoneEnum,
    volumeId: string,
    updateVolumeRequest: UpdateVolumeRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return VolumesApiFp(this.configuration)
      .updateVolume(zone, volumeId, updateVolumeRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ApplyBlockMigrationZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ApplyBlockMigrationZoneEnum =
  (typeof ApplyBlockMigrationZoneEnum)[keyof typeof ApplyBlockMigrationZoneEnum];
/**
 * @export
 */
export const CreateVolumeZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type CreateVolumeZoneEnum =
  (typeof CreateVolumeZoneEnum)[keyof typeof CreateVolumeZoneEnum];
/**
 * @export
 */
export const DeleteVolumeZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type DeleteVolumeZoneEnum =
  (typeof DeleteVolumeZoneEnum)[keyof typeof DeleteVolumeZoneEnum];
/**
 * @export
 */
export const GetVolumeZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type GetVolumeZoneEnum =
  (typeof GetVolumeZoneEnum)[keyof typeof GetVolumeZoneEnum];
/**
 * @export
 */
export const ListVolumesZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type ListVolumesZoneEnum =
  (typeof ListVolumesZoneEnum)[keyof typeof ListVolumesZoneEnum];
/**
 * @export
 */
export const ListVolumesVolumeTypeEnum = {
  LSsd: 'l_ssd',
  BSsd: 'b_ssd',
  Unified: 'unified',
  Scratch: 'scratch',
  SbsVolume: 'sbs_volume',
  SbsSnapshot: 'sbs_snapshot',
} as const;
export type ListVolumesVolumeTypeEnum =
  (typeof ListVolumesVolumeTypeEnum)[keyof typeof ListVolumesVolumeTypeEnum];
/**
 * @export
 */
export const PlanBlockMigrationZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type PlanBlockMigrationZoneEnum =
  (typeof PlanBlockMigrationZoneEnum)[keyof typeof PlanBlockMigrationZoneEnum];
/**
 * @export
 */
export const SetVolumeZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type SetVolumeZoneEnum =
  (typeof SetVolumeZoneEnum)[keyof typeof SetVolumeZoneEnum];
/**
 * @export
 */
export const UpdateVolumeZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  FrPar3: 'fr-par-3',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  NlAms3: 'nl-ams-3',
  PlWaw1: 'pl-waw-1',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
  ItMil1: 'it-mil-1',
} as const;
export type UpdateVolumeZoneEnum =
  (typeof UpdateVolumeZoneEnum)[keyof typeof UpdateVolumeZoneEnum];
