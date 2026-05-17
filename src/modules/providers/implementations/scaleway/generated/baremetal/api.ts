/* tslint:disable */
/* eslint-disable */
/**
 * Elastic Metal API
 * Scaleway Elastic Metal servers are dedicated physical servers that you can order on-demand, like Instances. You can install an OS or other images on your Elastic Metal server and connect to it via SSH to use it as you require. You can power off the server when you are not using or delete it from your account once you have finished using it. Elastic Metal servers are ideal for large workloads, big data, and applications that require increased security and dedicated resources.  (switchcolumn) <Message type=\"tip\">   Check out our dedicated APIs to manage [Private Networks](https://www.scaleway.com/en/developers/api/elastic-metal/private-network-api/) and [Flexible IPs](https://www.scaleway.com/en/developers/api/elastic-metal-flexible-ip/) for Elastic Metal servers. </Message> (switchcolumn)  ## Concepts  Refer to our [dedicated concepts](https://www.scaleway.com/en/docs/elastic-metal/concepts/) page to find definitions of the different terms referring to Elastic Metal servers.  ## Quickstart  (switchcolumn) (switchcolumn)  1. **Configure your environment variables.**     ```bash     export PROJECT_ID=\"<project-id>\"     export ACCESS_KEY=\"<access-key>\"     export SECRET_KEY=\"<secret-key>\"     export ZONE=\"<availability-zone>\"     ```     <Message type=\"note\">       This is an optional step that seeks to simplify your usage of the Bare Metal API.     </Message>  2. **Edit the POST request payload** that we will use in the next step to create an Elastic Metal server. Modify the values in the example according to your needs, using the information in the table to help.     ```json     {     \"offer_id\": \"string\",     \"project_id\": \"string\",     \"name\": \"string\",     \"description\": \"string\",     \"tags\": [         \"tag1\", \"tag2\"     ],     \"install\": {         \"os_id\": \"string\",         \"hostname\": \"string\",         \"ssh_key_ids\": [         \"string\"         ],         \"user\": \"string\",         \"password\": \"string\",         \"service_user\": \"string\",         \"service_password\": \"string\"     },     \"option_ids\": [         \"string\"     ]     }     ```      | Parameter        | Description                                                        |     | :--------------- | :----------------------------------------------------------------- |     | `offer_id`           | **REQUIRED** UUID of the Elastic Metal offer                                         |     | `project_id`     | **REQUIRED** UUID of the project you want to create your Elastic Metal in.  |     | `name`           | **REQUIRED** Name of the Elastic Metal server (≠hostname)                                          |     | `description`     | **REQUIRED** A description of your server (max 255 characters)                             |     | `tags`  | **OPTIONAL** An array of tags associated with your server   |     | `os_id`  | The ID of the operating system image to install on the server   |     | `hostname`  | Hostname of the server   |     | `ssh_key_ids`  | SSH key IDs authorized on the server   |     | `user`  | **NULLABLE** A regular user to be configured on the server   |     | `password`  | **NULLABLE** The password for the user account   |     | `service_user`  | **NULLABLE** A service user for third party services (user to login in services such as BigBlueButton)  |     | `service password`  | **NULLABLE** Password for the service user   |     | `option_ids`  | IDs of options to enable on server  |      <Message type=\"tip\">       [To find your Project ID you can either use the [Account API](https://www.scaleway.com/en/developers/api/account/project-api/#path-projects-list-all-projects-of-an-organization) or the [Scaleway console](https://console.scaleway.com/project/settings):     </Message>  3. **Run the following command** to create an Elastic Metal server. Make sure you include the payload you edited in the previous step.     ```bash     curl -X POST \\       -H \"Content-Type: application/json\" \\       -H \"X-Auth-Token: $SECRET_KEY\" https://api.scaleway.com/baremetal/v1/zones/$ZONE/servers \\       -d \'{         \"offer_id\": \"bd757ca3-a71b-4158-9ef5-39436b6db2a4\",         \"project_id\": \"cc6d123a-bc09-4e24-b5d9-3310f2104e13\",         \"name\": \"MyElasticMetal\",         \"description\": \"My_Elastic_Metal_Server\",         \"tags\": [             \"Ubuntu22\", \"Dedicated\"         ],         \"install\": {             \"os_id\": \"96e5f0f2-d216-4de2-8a15-68730d877885\",             \"hostname\": \"elasticmetal.example.com\",             \"ssh_key_ids\": [             \"fa05e77f-66b7-43b9-bc21-4dfe3c5bb624\"             ],             \"user\": \"ubuntu\",             \"password\": \"mySecretPa$$word\"         \"option_ids\": [             \"string\"         ]       }\"     ``` 4. **List your Elastic Metal servers.**     ```bash     curl -X GET \\       -H \"Content-Type: application/json\" \\       -H \"X-Auth-Token: $SECRET_KEY\" https://api.scaleway.com/baremetal/v1/zones/$ZONE/servers     ```  5. **Retrieve your Elastic Metal server IP** from the response.  6. **Connect to your Elastic Metal server** using SSH     ```bash     ssh root@my-elastic-metal-server-ip     ```  (switchcolumn) <Message type=\"requirement\"> To perform the following steps, you must first ensure that:   - you have an account and are logged into the [Scaleway console](https://console.scaleway.com/organization)   - you have created an [API key](https://www.scaleway.com/en/docs/iam/how-to/create-api-keys/) and that the API key has sufficient [IAM permissions](https://www.scaleway.com/en/docs/iam/reference-content/permission-sets/) to perform the actions described on this page.   - you have [installed `curl`](https://curl.se/download.html) </Message> (switchcolumn)  ## Technical information  ### Features  - Installation (Server is installed by preseed [preseed: complete install from a virtual media], you must define at least one ssh key to install your server) - Start/Stop/Reboot - Rescue Reboot, a rescue image is an operating system image designed to help you diagnose and fix OS experiencing failures. When your server boot on rescue, you can mount your disks and start diagnosing/fixing your image. - Billed by the minute (billing starts when the server is delivered and stops when the server is deleted) - IPv6, all servers are available with a /128 IPv6 subnet - ReverseIP, You can configure your reverse IP (IPv4 and IPv6), you must register the server IP in your DNS records before calling the endpoint - Basic monitoring with ping status - Flexible IP is available ([documentation](https://www.scaleway.com/en/developers/api/elastic-metal-flexible-ip/))  ### Availability Zones  Scaleway\'s infrastructure is spread across different [regions and Availability Zones](https://www.scaleway.com/en/docs/account/reference-content/products-availability/).  Elastic Metal servers are available in Paris, Amsterdam, and Warsaw regions, with product availability in the following AZs:  | Name      | API ID                           | |-----------|----------------------------------| | Paris     | `fr-par-1` `fr-par-2`            | | Amsterdam | `nl-ams-1` `nl-ams-2`            | | Warsaw    | `pl-waw-2` `pl-waw-3`            |  ## Technical limitations  - Failover IPs are not available in API `v1`, use the API `v1alpha1` ## Going further  For more help using Scaleway Elastic Metal servers, check out the following resources: - Our [main documentation](https://www.scaleway.com/en/docs/elastic-metal/) - The #elastic-metal channel on our [Slack Community](https://www.scaleway.com/en/docs/tutorials/scaleway-slack-community/) - Our [support ticketing system](https://www.scaleway.com/en/docs/account/how-to/open-a-support-ticket/) ### Troubleshooting  #### How is the installation of Elastic Metal servers done?  - The installation of Elastic Metal servers is done by preseed (± 10min) (preseed: complete install from a virtual media) #### How can I retrieve my secret key and Project ID?  You can find your [secret key](https://console.scaleway.com/iam/api-keys) and your [Project ID](https://console.scaleway.com/project/credentials) in the Scaleway console.  #### How can I add my server to a Private Network?  See [our dedicated documentation](/en/developers/api/elastic-metal-flexible-ip).
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
 * @interface AddOptionServerRequest
 */
export interface AddOptionServerRequest {
  /**
   * Auto expire the option after this date. (RFC 3339 format)
   * @type {string}
   * @memberof AddOptionServerRequest
   */
  expires_at?: string;
}
/**
 *
 * @export
 * @interface CreateServerRequest
 */
export interface CreateServerRequest {
  /**
   * Offer ID of the new server.
   * @type {string}
   * @memberof CreateServerRequest
   */
  offer_id: string;
  /**
   * Organization ID with which the server will be created.
   * @type {string}
   * @memberof CreateServerRequest
   * @deprecated
   */
  organization_id?: string;
  /**
   * Project ID with which the server will be created.
   * @type {string}
   * @memberof CreateServerRequest
   */
  project_id?: string;
  /**
   * Name of the server (≠hostname).
   * @type {string}
   * @memberof CreateServerRequest
   */
  name: string;
  /**
   * Description associated with the server, max 255 characters.
   * @type {string}
   * @memberof CreateServerRequest
   */
  description: string;
  /**
   * Tags to associate to the server.
   * @type {Array<string>}
   * @memberof CreateServerRequest
   */
  tags?: Array<string>;
  /**
   *
   * @type {CreateServerRequestInstall}
   * @memberof CreateServerRequest
   */
  install?: CreateServerRequestInstall;
  /**
   * IDs of options to enable on server.
   * @type {Array<string>}
   * @memberof CreateServerRequest
   */
  option_ids?: Array<string>;
  /**
   * If enabled, the server can not be deleted.
   * @type {boolean}
   * @memberof CreateServerRequest
   */
  protected?: boolean;
  /**
   *
   * @type {CreateServerRequestUserData}
   * @memberof CreateServerRequest
   */
  user_data?: CreateServerRequestUserData;
}
/**
 * Object describing the configuration details of the OS installation on the server.
 * @export
 * @interface CreateServerRequestInstall
 */
export interface CreateServerRequestInstall {
  /**
   * ID of the OS to installation on the server.
   * @type {string}
   * @memberof CreateServerRequestInstall
   */
  os_id?: string;
  /**
   * Hostname of the server.
   * @type {string}
   * @memberof CreateServerRequestInstall
   */
  hostname?: string;
  /**
   * SSH key IDs authorized on the server.
   * @type {Array<string>}
   * @memberof CreateServerRequestInstall
   */
  ssh_key_ids?: Array<string>;
  /**
   * User for the installation.
   * @type {string}
   * @memberof CreateServerRequestInstall
   */
  user?: string;
  /**
   * Password for the installation.
   * @type {string}
   * @memberof CreateServerRequestInstall
   */
  password?: string;
  /**
   * Regular user that runs the service to be installed on the server.
   * @type {string}
   * @memberof CreateServerRequestInstall
   */
  service_user?: string;
  /**
   * Password used for the service to install.
   * @type {string}
   * @memberof CreateServerRequestInstall
   */
  service_password?: string;
  /**
   *
   * @type {ValidatePartitioningSchemaRequestPartitioningSchema}
   * @memberof CreateServerRequestInstall
   */
  partitioning_schema?: ValidatePartitioningSchemaRequestPartitioningSchema;
}
/**
 * Configuration data to pass to cloud-init such as a YAML cloud config data or a user-data script.
 * @export
 * @interface CreateServerRequestUserData
 */
export interface CreateServerRequestUserData {
  /**
   *
   * @type {string}
   * @memberof CreateServerRequestUserData
   */
  value?: string;
}
/**
 *
 * @export
 * @interface InstallServerRequest
 */
export interface InstallServerRequest {
  /**
   * ID of the OS to installation on the server.
   * @type {string}
   * @memberof InstallServerRequest
   */
  os_id: string;
  /**
   * Hostname of the server.
   * @type {string}
   * @memberof InstallServerRequest
   */
  hostname: string;
  /**
   * SSH key IDs authorized on the server.
   * @type {Array<string>}
   * @memberof InstallServerRequest
   */
  ssh_key_ids: Array<string>;
  /**
   * User used for the installation.
   * @type {string}
   * @memberof InstallServerRequest
   */
  user?: string;
  /**
   * Password used for the installation.
   * @type {string}
   * @memberof InstallServerRequest
   */
  password?: string;
  /**
   * User used for the service to install.
   * @type {string}
   * @memberof InstallServerRequest
   */
  service_user?: string;
  /**
   * Password used for the service to install.
   * @type {string}
   * @memberof InstallServerRequest
   */
  service_password?: string;
  /**
   *
   * @type {ValidatePartitioningSchemaRequestPartitioningSchema}
   * @memberof InstallServerRequest
   */
  partitioning_schema?: ValidatePartitioningSchemaRequestPartitioningSchema;
  /**
   *
   * @type {InstallServerRequestUserData}
   * @memberof InstallServerRequest
   * @deprecated
   */
  user_data?: InstallServerRequestUserData;
}
/**
 * Configuration data to pass to cloud-init such as a YAML cloud config data or a user-data script.
 * @export
 * @interface InstallServerRequestUserData
 */
export interface InstallServerRequestUserData {
  /**
   *
   * @type {string}
   * @memberof InstallServerRequestUserData
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof InstallServerRequestUserData
   */
  content_type?: string;
  /**
   *
   * @type {string}
   * @memberof InstallServerRequestUserData
   */
  content?: string;
}
/**
 *
 * @export
 * @interface RebootServerRequest
 */
export interface RebootServerRequest {
  /**
   * The type of boot.
   * @type {string}
   * @memberof RebootServerRequest
   */
  boot_type?: RebootServerRequestBootTypeEnum;
  /**
   * Additional SSH public key IDs to configure on rescue image.
   * @type {Array<string>}
   * @memberof RebootServerRequest
   */
  ssh_key_ids?: Array<string>;
}

export const RebootServerRequestBootTypeEnum = {
  UnknownBootType: 'unknown_boot_type',
  Normal: 'normal',
  Rescue: 'rescue',
} as const;

export type RebootServerRequestBootTypeEnum =
  (typeof RebootServerRequestBootTypeEnum)[keyof typeof RebootServerRequestBootTypeEnum];

/**
 *
 * @export
 * @interface ScalewayBaremetalV1BMCAccess
 */
export interface ScalewayBaremetalV1BMCAccess {
  /**
   * URL to access to the server console.
   * @type {string}
   * @memberof ScalewayBaremetalV1BMCAccess
   */
  url?: string;
  /**
   * The login to use for the BMC (Baseboard Management Controller) access authentication.
   * @type {string}
   * @memberof ScalewayBaremetalV1BMCAccess
   */
  login?: string;
  /**
   * The password to use for the BMC (Baseboard Management Controller) access authentication.
   * @type {string}
   * @memberof ScalewayBaremetalV1BMCAccess
   */
  password?: string;
  /**
   * The date after which the BMC (Baseboard Management Controller) access will be closed. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayBaremetalV1BMCAccess
   */
  expires_at?: string;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1CPU
 */
export interface ScalewayBaremetalV1CPU {
  /**
   * Name of the CPU.
   * @type {string}
   * @memberof ScalewayBaremetalV1CPU
   */
  name?: string;
  /**
   * Number of CPU cores.
   * @type {number}
   * @memberof ScalewayBaremetalV1CPU
   */
  core_count?: number;
  /**
   * Number CPU threads.
   * @type {number}
   * @memberof ScalewayBaremetalV1CPU
   */
  thread_count?: number;
  /**
   * Frequency of the CPU in MHz.
   * @type {number}
   * @memberof ScalewayBaremetalV1CPU
   */
  frequency?: number;
  /**
   * Benchmark of the CPU.
   * @type {string}
   * @memberof ScalewayBaremetalV1CPU
   */
  benchmark?: string;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1Disk
 */
export interface ScalewayBaremetalV1Disk {
  /**
   * Capacity of the disk in bytes. (in bytes)
   * @type {number}
   * @memberof ScalewayBaremetalV1Disk
   */
  capacity?: number;
  /**
   * Type of the disk.
   * @type {string}
   * @memberof ScalewayBaremetalV1Disk
   */
  type?: string;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1GPU
 */
export interface ScalewayBaremetalV1GPU {
  /**
   * Name of the GPU.
   * @type {string}
   * @memberof ScalewayBaremetalV1GPU
   */
  name?: string;
  /**
   * Capacity of the vram in bytes.
   * @type {number}
   * @memberof ScalewayBaremetalV1GPU
   */
  vram?: number;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1GetServerMetricsResponse
 */
export interface ScalewayBaremetalV1GetServerMetricsResponse {
  /**
   *
   * @type {ScalewayBaremetalV1GetServerMetricsResponsePings}
   * @memberof ScalewayBaremetalV1GetServerMetricsResponse
   */
  pings?: ScalewayBaremetalV1GetServerMetricsResponsePings;
}
/**
 * Timeseries object representing pings on the server.
 * @export
 * @interface ScalewayBaremetalV1GetServerMetricsResponsePings
 */
export interface ScalewayBaremetalV1GetServerMetricsResponsePings {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1GetServerMetricsResponsePings
   */
  name?: string;
  /**
   *
   * @type {Array<Array<ScalewayStdTimeSeriesPointInner>>}
   * @memberof ScalewayBaremetalV1GetServerMetricsResponsePings
   */
  points?: Array<Array<ScalewayStdTimeSeriesPointInner>>;
  /**
   *
   * @type {ScalewayBaremetalV1GetServerMetricsResponsePingsMetadata}
   * @memberof ScalewayBaremetalV1GetServerMetricsResponsePings
   */
  metadata?: ScalewayBaremetalV1GetServerMetricsResponsePingsMetadata;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1GetServerMetricsResponsePingsMetadata
 */
export interface ScalewayBaremetalV1GetServerMetricsResponsePingsMetadata {
  [key: string]: any;

  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1GetServerMetricsResponsePingsMetadata
   */
  '&lt;metadataKey&gt;'?: string;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1IP
 */
export interface ScalewayBaremetalV1IP {
  /**
   * ID of the IP.
   * @type {string}
   * @memberof ScalewayBaremetalV1IP
   */
  id?: string;
  /**
   * Address of the IP. (IP address)
   * @type {string}
   * @memberof ScalewayBaremetalV1IP
   */
  address?: string;
  /**
   * Reverse IP value.
   * @type {string}
   * @memberof ScalewayBaremetalV1IP
   */
  reverse?: string;
  /**
   * Version of IP (v4 or v6).
   * @type {string}
   * @memberof ScalewayBaremetalV1IP
   */
  version?: ScalewayBaremetalV1IPVersionEnum;
  /**
   * Status of the reverse.
   * @type {string}
   * @memberof ScalewayBaremetalV1IP
   */
  reverse_status?: ScalewayBaremetalV1IPReverseStatusEnum;
  /**
   * A message related to the reverse status, e.g. in case of an error.
   * @type {string}
   * @memberof ScalewayBaremetalV1IP
   */
  reverse_status_message?: string;
}

export const ScalewayBaremetalV1IPVersionEnum = {
  Ipv4: 'IPv4',
  Ipv6: 'IPv6',
} as const;

export type ScalewayBaremetalV1IPVersionEnum =
  (typeof ScalewayBaremetalV1IPVersionEnum)[keyof typeof ScalewayBaremetalV1IPVersionEnum];
export const ScalewayBaremetalV1IPReverseStatusEnum = {
  Unknown: 'unknown',
  Pending: 'pending',
  Active: 'active',
  Error: 'error',
} as const;

export type ScalewayBaremetalV1IPReverseStatusEnum =
  (typeof ScalewayBaremetalV1IPReverseStatusEnum)[keyof typeof ScalewayBaremetalV1IPReverseStatusEnum];

/**
 *
 * @export
 * @interface ScalewayBaremetalV1ListOSResponse
 */
export interface ScalewayBaremetalV1ListOSResponse {
  /**
   * Total count of matching OS.
   * @type {number}
   * @memberof ScalewayBaremetalV1ListOSResponse
   */
  total_count?: number;
  /**
   * OS that match filters.
   * @type {Array<ScalewayBaremetalV1OS>}
   * @memberof ScalewayBaremetalV1ListOSResponse
   */
  os?: Array<ScalewayBaremetalV1OS>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1ListOffersResponse
 */
export interface ScalewayBaremetalV1ListOffersResponse {
  /**
   * Total count of matching offers.
   * @type {number}
   * @memberof ScalewayBaremetalV1ListOffersResponse
   */
  total_count?: number;
  /**
   * Offers that match filters.
   * @type {Array<ScalewayBaremetalV1Offer>}
   * @memberof ScalewayBaremetalV1ListOffersResponse
   */
  offers?: Array<ScalewayBaremetalV1Offer>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1ListOptionsResponse
 */
export interface ScalewayBaremetalV1ListOptionsResponse {
  /**
   * Total count of matching options.
   * @type {number}
   * @memberof ScalewayBaremetalV1ListOptionsResponse
   */
  total_count?: number;
  /**
   * Options that match filters.
   * @type {Array<ScalewayBaremetalV1Option>}
   * @memberof ScalewayBaremetalV1ListOptionsResponse
   */
  options?: Array<ScalewayBaremetalV1Option>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1ListServerEventsResponse
 */
export interface ScalewayBaremetalV1ListServerEventsResponse {
  /**
   * Total count of matching events.
   * @type {number}
   * @memberof ScalewayBaremetalV1ListServerEventsResponse
   */
  total_count?: number;
  /**
   * Server events that match filters.
   * @type {Array<ScalewayBaremetalV1ServerEvent>}
   * @memberof ScalewayBaremetalV1ListServerEventsResponse
   */
  events?: Array<ScalewayBaremetalV1ServerEvent>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1ListServersResponse
 */
export interface ScalewayBaremetalV1ListServersResponse {
  /**
   * Total count of matching servers.
   * @type {number}
   * @memberof ScalewayBaremetalV1ListServersResponse
   */
  total_count?: number;
  /**
   * Array of Elastic Metal server objects matching the filters in the request.
   * @type {Array<ScalewayBaremetalV1Server>}
   * @memberof ScalewayBaremetalV1ListServersResponse
   */
  servers?: Array<ScalewayBaremetalV1Server>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1ListSettingsResponse
 */
export interface ScalewayBaremetalV1ListSettingsResponse {
  /**
   * Total count of matching settings.
   * @type {number}
   * @memberof ScalewayBaremetalV1ListSettingsResponse
   */
  total_count?: number;
  /**
   * Settings that match filters.
   * @type {Array<ScalewayBaremetalV1Setting>}
   * @memberof ScalewayBaremetalV1ListSettingsResponse
   */
  settings?: Array<ScalewayBaremetalV1Setting>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1Memory
 */
export interface ScalewayBaremetalV1Memory {
  /**
   * Capacity of the memory in bytes. (in bytes)
   * @type {number}
   * @memberof ScalewayBaremetalV1Memory
   */
  capacity?: number;
  /**
   * Type of the memory.
   * @type {string}
   * @memberof ScalewayBaremetalV1Memory
   */
  type?: string;
  /**
   * Frequency of the memory in MHz.
   * @type {number}
   * @memberof ScalewayBaremetalV1Memory
   */
  frequency?: number;
  /**
   * True if the memory is an error-correcting code memory.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1Memory
   */
  is_ecc?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1OS
 */
export interface ScalewayBaremetalV1OS {
  /**
   * ID of the OS.
   * @type {string}
   * @memberof ScalewayBaremetalV1OS
   */
  id?: string;
  /**
   * Name of the OS.
   * @type {string}
   * @memberof ScalewayBaremetalV1OS
   */
  name?: string;
  /**
   * Version of the OS.
   * @type {string}
   * @memberof ScalewayBaremetalV1OS
   */
  version?: string;
  /**
   * URL of this OS\'s logo.
   * @type {string}
   * @memberof ScalewayBaremetalV1OS
   */
  logo_url?: string;
  /**
   *
   * @type {ScalewayBaremetalV1OSSsh}
   * @memberof ScalewayBaremetalV1OS
   */
  ssh?: ScalewayBaremetalV1OSSsh;
  /**
   *
   * @type {ScalewayBaremetalV1OSUser}
   * @memberof ScalewayBaremetalV1OS
   */
  user?: ScalewayBaremetalV1OSUser;
  /**
   *
   * @type {ScalewayBaremetalV1OSPassword}
   * @memberof ScalewayBaremetalV1OS
   */
  password?: ScalewayBaremetalV1OSPassword;
  /**
   *
   * @type {ScalewayBaremetalV1OSServiceUser}
   * @memberof ScalewayBaremetalV1OS
   */
  service_user?: ScalewayBaremetalV1OSServiceUser;
  /**
   *
   * @type {ScalewayBaremetalV1OSServicePassword}
   * @memberof ScalewayBaremetalV1OS
   */
  service_password?: ScalewayBaremetalV1OSServicePassword;
  /**
   * Defines if the operating system is enabled or not.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OS
   */
  enabled?: boolean;
  /**
   * License required (check server options for pricing details).
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OS
   */
  license_required?: boolean;
  /**
   * Defines if a specific Organization is allowed to install this OS type.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OS
   */
  allowed?: boolean;
  /**
   * Defines if custom partitioning is supported by this OS.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OS
   */
  custom_partitioning_supported?: boolean;
  /**
   * Defines if cloud-init is supported by this OS.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OS
   */
  cloud_init_supported?: boolean;
  /**
   * Defines the cloud-init API version used by this OS.
   * @type {string}
   * @memberof ScalewayBaremetalV1OS
   */
  cloud_init_version?: string;
  /**
   * Zone in which is the OS is available.
   * @type {string}
   * @memberof ScalewayBaremetalV1OS
   */
  zone?: string;
}
/**
 * Object defining the password requirements to install the OS.
 * @export
 * @interface ScalewayBaremetalV1OSPassword
 */
export interface ScalewayBaremetalV1OSPassword {
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSPassword
   */
  editable?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSPassword
   */
  required?: boolean;
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OSPassword
   */
  default_value?: string;
}
/**
 * Object defining the password requirements to install the service.
 * @export
 * @interface ScalewayBaremetalV1OSServicePassword
 */
export interface ScalewayBaremetalV1OSServicePassword {
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSServicePassword
   */
  editable?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSServicePassword
   */
  required?: boolean;
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OSServicePassword
   */
  default_value?: string;
}
/**
 * Object defining the username requirements to install the service.
 * @export
 * @interface ScalewayBaremetalV1OSServiceUser
 */
export interface ScalewayBaremetalV1OSServiceUser {
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSServiceUser
   */
  editable?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSServiceUser
   */
  required?: boolean;
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OSServiceUser
   */
  default_value?: string;
}
/**
 * Object defining the SSH requirements to install the OS.
 * @export
 * @interface ScalewayBaremetalV1OSSsh
 */
export interface ScalewayBaremetalV1OSSsh {
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSSsh
   */
  editable?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSSsh
   */
  required?: boolean;
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OSSsh
   */
  default_value?: string;
}
/**
 * Object defining the username requirements to install the OS.
 * @export
 * @interface ScalewayBaremetalV1OSUser
 */
export interface ScalewayBaremetalV1OSUser {
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSUser
   */
  editable?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OSUser
   */
  required?: boolean;
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OSUser
   */
  default_value?: string;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1Offer
 */
export interface ScalewayBaremetalV1Offer {
  /**
   * ID of the offer.
   * @type {string}
   * @memberof ScalewayBaremetalV1Offer
   */
  id?: string;
  /**
   * Name of the offer.
   * @type {string}
   * @memberof ScalewayBaremetalV1Offer
   */
  name?: string;
  /**
   * Stock level.
   * @type {string}
   * @memberof ScalewayBaremetalV1Offer
   */
  stock?: ScalewayBaremetalV1OfferStockEnum;
  /**
   * Public bandwidth available (in bits/s) with the offer.
   * @type {number}
   * @memberof ScalewayBaremetalV1Offer
   */
  bandwidth?: number;
  /**
   * Maximum public bandwidth available (in bits/s) depending on available options.
   * @type {number}
   * @memberof ScalewayBaremetalV1Offer
   */
  max_bandwidth?: number;
  /**
   * Commercial range of the offer.
   * @type {string}
   * @memberof ScalewayBaremetalV1Offer
   */
  commercial_range?: string;
  /**
   *
   * @type {ScalewayBaremetalV1OfferPricePerHour}
   * @memberof ScalewayBaremetalV1Offer
   */
  price_per_hour?: ScalewayBaremetalV1OfferPricePerHour;
  /**
   *
   * @type {ScalewayBaremetalV1OfferPricePerMonth}
   * @memberof ScalewayBaremetalV1Offer
   */
  price_per_month?: ScalewayBaremetalV1OfferPricePerMonth;
  /**
   * Disks specifications of the offer.
   * @type {Array<ScalewayBaremetalV1Disk>}
   * @memberof ScalewayBaremetalV1Offer
   */
  disks?: Array<ScalewayBaremetalV1Disk>;
  /**
   * Defines whether the offer is currently available.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1Offer
   */
  enable?: boolean;
  /**
   * CPU specifications of the offer.
   * @type {Array<ScalewayBaremetalV1CPU>}
   * @memberof ScalewayBaremetalV1Offer
   */
  cpus?: Array<ScalewayBaremetalV1CPU>;
  /**
   * Memory specifications of the offer.
   * @type {Array<ScalewayBaremetalV1Memory>}
   * @memberof ScalewayBaremetalV1Offer
   */
  memories?: Array<ScalewayBaremetalV1Memory>;
  /**
   * Name of the quota associated to the offer.
   * @type {string}
   * @memberof ScalewayBaremetalV1Offer
   */
  quota_name?: string;
  /**
   * Persistent memory specifications of the offer.
   * @type {Array<ScalewayBaremetalV1PersistentMemory>}
   * @memberof ScalewayBaremetalV1Offer
   */
  persistent_memories?: Array<ScalewayBaremetalV1PersistentMemory>;
  /**
   * Raid controller specifications of the offer.
   * @type {Array<ScalewayBaremetalV1RaidController>}
   * @memberof ScalewayBaremetalV1Offer
   */
  raid_controllers?: Array<ScalewayBaremetalV1RaidController>;
  /**
   * Array of OS images IDs incompatible with the server.
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV1Offer
   */
  incompatible_os_ids?: Array<string>;
  /**
   * Period of subscription for the offer.
   * @type {string}
   * @memberof ScalewayBaremetalV1Offer
   */
  subscription_period?: ScalewayBaremetalV1OfferSubscriptionPeriodEnum;
  /**
   * Operation path of the service.
   * @type {string}
   * @memberof ScalewayBaremetalV1Offer
   */
  operation_path?: string;
  /**
   *
   * @type {ScalewayBaremetalV1OfferFee}
   * @memberof ScalewayBaremetalV1Offer
   */
  fee?: ScalewayBaremetalV1OfferFee;
  /**
   * Available options for customization of the server.
   * @type {Array<ScalewayBaremetalV1OfferOptionOffer>}
   * @memberof ScalewayBaremetalV1Offer
   */
  options?: Array<ScalewayBaremetalV1OfferOptionOffer>;
  /**
   * Private bandwidth available in bits/s with the offer.
   * @type {number}
   * @memberof ScalewayBaremetalV1Offer
   */
  private_bandwidth?: number;
  /**
   * Defines whether the offer\'s bandwidth is shared or not.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1Offer
   */
  shared_bandwidth?: boolean;
  /**
   * Array of tags attached to the offer.
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV1Offer
   */
  tags?: Array<string>;
  /**
   * GPU specifications of the offer.
   * @type {Array<ScalewayBaremetalV1GPU>}
   * @memberof ScalewayBaremetalV1Offer
   */
  gpus?: Array<ScalewayBaremetalV1GPU>;
  /**
   * Exist only for hourly offers, to migrate to the monthly offer.
   * @type {string}
   * @memberof ScalewayBaremetalV1Offer
   */
  monthly_offer_id?: string;
  /**
   * Zone in which is the offer is available.
   * @type {string}
   * @memberof ScalewayBaremetalV1Offer
   */
  zone?: string;
}

export const ScalewayBaremetalV1OfferStockEnum = {
  Empty: 'empty',
  Low: 'low',
  Available: 'available',
} as const;

export type ScalewayBaremetalV1OfferStockEnum =
  (typeof ScalewayBaremetalV1OfferStockEnum)[keyof typeof ScalewayBaremetalV1OfferStockEnum];
export const ScalewayBaremetalV1OfferSubscriptionPeriodEnum = {
  UnknownSubscriptionPeriod: 'unknown_subscription_period',
  Hourly: 'hourly',
  Monthly: 'monthly',
} as const;

export type ScalewayBaremetalV1OfferSubscriptionPeriodEnum =
  (typeof ScalewayBaremetalV1OfferSubscriptionPeriodEnum)[keyof typeof ScalewayBaremetalV1OfferSubscriptionPeriodEnum];

/**
 * One time fee invoiced by Scaleway for the setup and activation of the server.
 * @export
 * @interface ScalewayBaremetalV1OfferFee
 */
export interface ScalewayBaremetalV1OfferFee {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OfferFee
   */
  currency_code?: string;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferFee
   */
  units?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferFee
   */
  nanos?: number;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1OfferOptionOffer
 */
export interface ScalewayBaremetalV1OfferOptionOffer {
  /**
   * ID of the option.
   * @type {string}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  id?: string;
  /**
   * Name of the option.
   * @type {string}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  name?: string;
  /**
   * If true the option is enabled and included by default in the offer. If true the option is enabled and included by default in the offer If false the option is available for the offer but not included by default.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  enabled?: boolean;
  /**
   * Period of subscription for the offer.
   * @type {string}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  subscription_period?: ScalewayBaremetalV1OfferOptionOfferSubscriptionPeriodEnum;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferPrice}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  price?: ScalewayBaremetalV1OfferOptionOfferPrice;
  /**
   * Boolean to know if option could be managed.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  manageable?: boolean;
  /**
   * Deprecated, use LicenseOptionVars.os_id instead.
   * @type {string}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   * @deprecated
   */
  os_id?: string;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferLicense}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  license?: ScalewayBaremetalV1OfferOptionOfferLicense;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferPublicBandwidth}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  public_bandwidth?: ScalewayBaremetalV1OfferOptionOfferPublicBandwidth;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferPrivateNetwork}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  private_network?: ScalewayBaremetalV1OfferOptionOfferPrivateNetwork;
  /**
   * Remote_access option.
   * @type {object}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  remote_access?: object;
  /**
   * Certification option.
   * @type {object}
   * @memberof ScalewayBaremetalV1OfferOptionOffer
   */
  certification?: object;
}

export const ScalewayBaremetalV1OfferOptionOfferSubscriptionPeriodEnum = {
  UnknownSubscriptionPeriod: 'unknown_subscription_period',
  Hourly: 'hourly',
  Monthly: 'monthly',
} as const;

export type ScalewayBaremetalV1OfferOptionOfferSubscriptionPeriodEnum =
  (typeof ScalewayBaremetalV1OfferOptionOfferSubscriptionPeriodEnum)[keyof typeof ScalewayBaremetalV1OfferOptionOfferSubscriptionPeriodEnum];

/**
 * License option, contains the ID of the OS linked to the option.
 * @export
 * @interface ScalewayBaremetalV1OfferOptionOfferLicense
 */
export interface ScalewayBaremetalV1OfferOptionOfferLicense {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OfferOptionOfferLicense
   */
  os_id?: string;
}
/**
 * Price of the option.
 * @export
 * @interface ScalewayBaremetalV1OfferOptionOfferPrice
 */
export interface ScalewayBaremetalV1OfferOptionOfferPrice {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OfferOptionOfferPrice
   */
  currency_code?: string;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferOptionOfferPrice
   */
  units?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferOptionOfferPrice
   */
  nanos?: number;
}
/**
 * Private_network option, contains the bandwidth_in_bps.
 * @export
 * @interface ScalewayBaremetalV1OfferOptionOfferPrivateNetwork
 */
export interface ScalewayBaremetalV1OfferOptionOfferPrivateNetwork {
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferOptionOfferPrivateNetwork
   */
  bandwidth_in_bps?: number;
}
/**
 * Public_bandwidth option, contains the bandwidth_in_bps.
 * @export
 * @interface ScalewayBaremetalV1OfferOptionOfferPublicBandwidth
 */
export interface ScalewayBaremetalV1OfferOptionOfferPublicBandwidth {
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferOptionOfferPublicBandwidth
   */
  bandwidth_in_bps?: number;
}
/**
 * Price of the offer for the next 60 minutes (a server order at 11h32 will be paid until 12h32).
 * @export
 * @interface ScalewayBaremetalV1OfferPricePerHour
 */
export interface ScalewayBaremetalV1OfferPricePerHour {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OfferPricePerHour
   */
  currency_code?: string;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferPricePerHour
   */
  units?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferPricePerHour
   */
  nanos?: number;
}
/**
 * Monthly price of the offer, if subscribing on a monthly basis.
 * @export
 * @interface ScalewayBaremetalV1OfferPricePerMonth
 */
export interface ScalewayBaremetalV1OfferPricePerMonth {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1OfferPricePerMonth
   */
  currency_code?: string;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferPricePerMonth
   */
  units?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1OfferPricePerMonth
   */
  nanos?: number;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1Option
 */
export interface ScalewayBaremetalV1Option {
  /**
   * ID of the option.
   * @type {string}
   * @memberof ScalewayBaremetalV1Option
   */
  id?: string;
  /**
   * Name of the option.
   * @type {string}
   * @memberof ScalewayBaremetalV1Option
   */
  name?: string;
  /**
   * Defines whether the option is manageable (could be added or removed).
   * @type {boolean}
   * @memberof ScalewayBaremetalV1Option
   */
  manageable?: boolean;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferLicense}
   * @memberof ScalewayBaremetalV1Option
   */
  license?: ScalewayBaremetalV1OfferOptionOfferLicense;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferPublicBandwidth}
   * @memberof ScalewayBaremetalV1Option
   */
  public_bandwidth?: ScalewayBaremetalV1OfferOptionOfferPublicBandwidth;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferPrivateNetwork}
   * @memberof ScalewayBaremetalV1Option
   */
  private_network?: ScalewayBaremetalV1OfferOptionOfferPrivateNetwork;
  /**
   * Remote_access option.
   * @type {object}
   * @memberof ScalewayBaremetalV1Option
   */
  remote_access?: object;
  /**
   * Certification option.
   * @type {object}
   * @memberof ScalewayBaremetalV1Option
   */
  certification?: object;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1PersistentMemory
 */
export interface ScalewayBaremetalV1PersistentMemory {
  /**
   * Capacity of the memory in bytes. (in bytes)
   * @type {number}
   * @memberof ScalewayBaremetalV1PersistentMemory
   */
  capacity?: number;
  /**
   * Type of the memory.
   * @type {string}
   * @memberof ScalewayBaremetalV1PersistentMemory
   */
  type?: string;
  /**
   * Frequency of the memory in MHz.
   * @type {number}
   * @memberof ScalewayBaremetalV1PersistentMemory
   */
  frequency?: number;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1RaidController
 */
export interface ScalewayBaremetalV1RaidController {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1RaidController
   */
  model?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV1RaidController
   */
  raid_level?: Array<string>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1Schema
 */
export interface ScalewayBaremetalV1Schema {
  /**
   *
   * @type {Array<ScalewayBaremetalV1SchemaDisk>}
   * @memberof ScalewayBaremetalV1Schema
   */
  disks?: Array<ScalewayBaremetalV1SchemaDisk>;
  /**
   *
   * @type {Array<ScalewayBaremetalV1SchemaRAID>}
   * @memberof ScalewayBaremetalV1Schema
   */
  raids?: Array<ScalewayBaremetalV1SchemaRAID>;
  /**
   *
   * @type {Array<ScalewayBaremetalV1SchemaFilesystem>}
   * @memberof ScalewayBaremetalV1Schema
   */
  filesystems?: Array<ScalewayBaremetalV1SchemaFilesystem>;
  /**
   *
   * @type {ScalewayBaremetalV1SchemaZFS}
   * @memberof ScalewayBaremetalV1Schema
   */
  zfs?: ScalewayBaremetalV1SchemaZFS;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1SchemaDisk
 */
export interface ScalewayBaremetalV1SchemaDisk {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1SchemaDisk
   */
  device?: string;
  /**
   *
   * @type {Array<ScalewayBaremetalV1SchemaPartition>}
   * @memberof ScalewayBaremetalV1SchemaDisk
   */
  partitions?: Array<ScalewayBaremetalV1SchemaPartition>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1SchemaFilesystem
 */
export interface ScalewayBaremetalV1SchemaFilesystem {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1SchemaFilesystem
   */
  device?: string;
  /**
   *
   * @type {ScalewayBaremetalV1SchemaFilesystemFormat}
   * @memberof ScalewayBaremetalV1SchemaFilesystem
   */
  format?: ScalewayBaremetalV1SchemaFilesystemFormat;
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1SchemaFilesystem
   */
  mountpoint?: string;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayBaremetalV1SchemaFilesystemFormat = {
  UnknownFormat: 'unknown_format',
  Fat32: 'fat32',
  Ext4: 'ext4',
  Swap: 'swap',
  Zfs: 'zfs',
  Xfs: 'xfs',
} as const;

export type ScalewayBaremetalV1SchemaFilesystemFormat =
  (typeof ScalewayBaremetalV1SchemaFilesystemFormat)[keyof typeof ScalewayBaremetalV1SchemaFilesystemFormat];

/**
 *
 * @export
 * @interface ScalewayBaremetalV1SchemaPartition
 */
export interface ScalewayBaremetalV1SchemaPartition {
  /**
   *
   * @type {ScalewayBaremetalV1SchemaPartitionLabel}
   * @memberof ScalewayBaremetalV1SchemaPartition
   */
  label?: ScalewayBaremetalV1SchemaPartitionLabel;
  /**
   *
   * @type {number}
   * @memberof ScalewayBaremetalV1SchemaPartition
   */
  number?: number;
  /**
   * (in bytes)
   * @type {number}
   * @memberof ScalewayBaremetalV1SchemaPartition
   */
  size?: number;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayBaremetalV1SchemaPartition
   */
  use_all_available_space?: boolean;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayBaremetalV1SchemaPartitionLabel = {
  UnknownPartitionLabel: 'unknown_partition_label',
  Uefi: 'uefi',
  Legacy: 'legacy',
  Root: 'root',
  Boot: 'boot',
  Swap: 'swap',
  Data: 'data',
  Home: 'home',
  Raid: 'raid',
  Zfs: 'zfs',
} as const;

export type ScalewayBaremetalV1SchemaPartitionLabel =
  (typeof ScalewayBaremetalV1SchemaPartitionLabel)[keyof typeof ScalewayBaremetalV1SchemaPartitionLabel];

/**
 *
 * @export
 * @interface ScalewayBaremetalV1SchemaPool
 */
export interface ScalewayBaremetalV1SchemaPool {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1SchemaPool
   */
  name?: string;
  /**
   *
   * @type {ScalewayBaremetalV1SchemaPoolType}
   * @memberof ScalewayBaremetalV1SchemaPool
   */
  type?: ScalewayBaremetalV1SchemaPoolType;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV1SchemaPool
   */
  devices?: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV1SchemaPool
   */
  options?: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV1SchemaPool
   */
  filesystem_options?: Array<string>;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayBaremetalV1SchemaPoolType = {
  UnknownType: 'unknown_type',
  NoRaid: 'no_raid',
  Mirror: 'mirror',
  Raidz1: 'raidz1',
  Raidz2: 'raidz2',
} as const;

export type ScalewayBaremetalV1SchemaPoolType =
  (typeof ScalewayBaremetalV1SchemaPoolType)[keyof typeof ScalewayBaremetalV1SchemaPoolType];

/**
 *
 * @export
 * @interface ScalewayBaremetalV1SchemaRAID
 */
export interface ScalewayBaremetalV1SchemaRAID {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1SchemaRAID
   */
  name?: string;
  /**
   *
   * @type {ScalewayBaremetalV1SchemaRAIDLevel}
   * @memberof ScalewayBaremetalV1SchemaRAID
   */
  level?: ScalewayBaremetalV1SchemaRAIDLevel;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV1SchemaRAID
   */
  devices?: Array<string>;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayBaremetalV1SchemaRAIDLevel = {
  UnknownRaidLevel: 'unknown_raid_level',
  RaidLevel0: 'raid_level_0',
  RaidLevel1: 'raid_level_1',
  RaidLevel5: 'raid_level_5',
  RaidLevel6: 'raid_level_6',
  RaidLevel10: 'raid_level_10',
} as const;

export type ScalewayBaremetalV1SchemaRAIDLevel =
  (typeof ScalewayBaremetalV1SchemaRAIDLevel)[keyof typeof ScalewayBaremetalV1SchemaRAIDLevel];

/**
 *
 * @export
 * @interface ScalewayBaremetalV1SchemaZFS
 */
export interface ScalewayBaremetalV1SchemaZFS {
  /**
   *
   * @type {Array<ScalewayBaremetalV1SchemaPool>}
   * @memberof ScalewayBaremetalV1SchemaZFS
   */
  pools?: Array<ScalewayBaremetalV1SchemaPool>;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1Server
 */
export interface ScalewayBaremetalV1Server {
  /**
   * ID of the server.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  id?: string;
  /**
   * Organization ID the server is attached to.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  organization_id?: string;
  /**
   * Project ID the server is attached to.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  project_id?: string;
  /**
   * Name of the server.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  name?: string;
  /**
   * Description of the server.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  description?: string;
  /**
   * Last modification date of the server. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  updated_at?: string;
  /**
   * Creation date of the server. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  created_at?: string;
  /**
   * Status of the server.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  status?: ScalewayBaremetalV1ServerStatusEnum;
  /**
   * Offer ID of the server.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  offer_id?: string;
  /**
   * Offer name of the server.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  offer_name?: string;
  /**
   * Array of custom tags attached to the server.
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV1Server
   */
  tags?: Array<string>;
  /**
   * Array of IPs attached to the server.
   * @type {Array<ScalewayBaremetalV1IP>}
   * @memberof ScalewayBaremetalV1Server
   */
  ips?: Array<ScalewayBaremetalV1IP>;
  /**
   * Domain of the server.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  domain?: string;
  /**
   * Boot type of the server.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  boot_type?: ScalewayBaremetalV1ServerBootTypeEnum;
  /**
   * Zone in which is the server located.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  zone?: string;
  /**
   *
   * @type {ScalewayBaremetalV1ServerInstall}
   * @memberof ScalewayBaremetalV1Server
   */
  install?: ScalewayBaremetalV1ServerInstall;
  /**
   * Status of server ping.
   * @type {string}
   * @memberof ScalewayBaremetalV1Server
   */
  ping_status?: ScalewayBaremetalV1ServerPingStatusEnum;
  /**
   * Options enabled on the server.
   * @type {Array<ScalewayBaremetalV1ServerOption>}
   * @memberof ScalewayBaremetalV1Server
   */
  options?: Array<ScalewayBaremetalV1ServerOption>;
  /**
   *
   * @type {ScalewayBaremetalV1ServerRescueServer}
   * @memberof ScalewayBaremetalV1Server
   */
  rescue_server?: ScalewayBaremetalV1ServerRescueServer;
  /**
   * If enabled, the server can not be deleted.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1Server
   */
  protected?: boolean;
  /**
   *
   * @type {ScalewayBaremetalV1ServerUserData}
   * @memberof ScalewayBaremetalV1Server
   */
  user_data?: ScalewayBaremetalV1ServerUserData;
}

export const ScalewayBaremetalV1ServerStatusEnum = {
  Unknown: 'unknown',
  Delivering: 'delivering',
  Ready: 'ready',
  Stopping: 'stopping',
  Stopped: 'stopped',
  Starting: 'starting',
  Error: 'error',
  Deleting: 'deleting',
  Locked: 'locked',
  OutOfStock: 'out_of_stock',
  Ordered: 'ordered',
  Resetting: 'resetting',
  Migrating: 'migrating',
} as const;

export type ScalewayBaremetalV1ServerStatusEnum =
  (typeof ScalewayBaremetalV1ServerStatusEnum)[keyof typeof ScalewayBaremetalV1ServerStatusEnum];
export const ScalewayBaremetalV1ServerBootTypeEnum = {
  UnknownBootType: 'unknown_boot_type',
  Normal: 'normal',
  Rescue: 'rescue',
} as const;

export type ScalewayBaremetalV1ServerBootTypeEnum =
  (typeof ScalewayBaremetalV1ServerBootTypeEnum)[keyof typeof ScalewayBaremetalV1ServerBootTypeEnum];
export const ScalewayBaremetalV1ServerPingStatusEnum = {
  PingStatusUnknown: 'ping_status_unknown',
  PingStatusUp: 'ping_status_up',
  PingStatusDown: 'ping_status_down',
} as const;

export type ScalewayBaremetalV1ServerPingStatusEnum =
  (typeof ScalewayBaremetalV1ServerPingStatusEnum)[keyof typeof ScalewayBaremetalV1ServerPingStatusEnum];

/**
 *
 * @export
 * @interface ScalewayBaremetalV1ServerEvent
 */
export interface ScalewayBaremetalV1ServerEvent {
  /**
   * ID of the server to which the action will be applied.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerEvent
   */
  id?: string;
  /**
   * The action that will be applied to the server.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerEvent
   */
  action?: string;
  /**
   * Date of last modification of the action. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerEvent
   */
  updated_at?: string;
  /**
   * Date of creation of the action. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerEvent
   */
  created_at?: string;
}
/**
 * Configuration of the installation.
 * @export
 * @interface ScalewayBaremetalV1ServerInstall
 */
export interface ScalewayBaremetalV1ServerInstall {
  /**
   * ID of the OS.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerInstall
   */
  os_id?: string;
  /**
   * Host defined during the server installation.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerInstall
   */
  hostname?: string;
  /**
   * SSH public key IDs defined during server installation.
   * @type {Array<string>}
   * @memberof ScalewayBaremetalV1ServerInstall
   */
  ssh_key_ids?: Array<string>;
  /**
   * Status of the server installation.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerInstall
   */
  status?: ScalewayBaremetalV1ServerInstallStatusEnum;
  /**
   * User defined in the server installation, or the default user if none were specified.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerInstall
   */
  user?: string;
  /**
   * Service user defined in the server installation, or the default user if none were specified.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerInstall
   */
  service_user?: string;
  /**
   * Address of the installed service.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerInstall
   */
  service_url?: string;
  /**
   *
   * @type {ValidatePartitioningSchemaRequestPartitioningSchema}
   * @memberof ScalewayBaremetalV1ServerInstall
   */
  partitioning_schema?: ValidatePartitioningSchemaRequestPartitioningSchema;
}

export const ScalewayBaremetalV1ServerInstallStatusEnum = {
  Unknown: 'unknown',
  ToInstall: 'to_install',
  Installing: 'installing',
  Completed: 'completed',
  Error: 'error',
} as const;

export type ScalewayBaremetalV1ServerInstallStatusEnum =
  (typeof ScalewayBaremetalV1ServerInstallStatusEnum)[keyof typeof ScalewayBaremetalV1ServerInstallStatusEnum];

/**
 *
 * @export
 * @interface ScalewayBaremetalV1ServerOption
 */
export interface ScalewayBaremetalV1ServerOption {
  /**
   * ID of the option.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  id?: string;
  /**
   * Name of the option.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  name?: string;
  /**
   * Status of the option on this server.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  status?: ScalewayBaremetalV1ServerOptionStatusEnum;
  /**
   * Defines whether the option can be managed (added or removed).
   * @type {boolean}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  manageable?: boolean;
  /**
   * Auto expiration date for compatible options. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  expires_at?: string;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferLicense}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  license?: ScalewayBaremetalV1OfferOptionOfferLicense;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferPublicBandwidth}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  public_bandwidth?: ScalewayBaremetalV1OfferOptionOfferPublicBandwidth;
  /**
   *
   * @type {ScalewayBaremetalV1OfferOptionOfferPrivateNetwork}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  private_network?: ScalewayBaremetalV1OfferOptionOfferPrivateNetwork;
  /**
   * Remote_access option.
   * @type {object}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  remote_access?: object;
  /**
   * Certification option.
   * @type {object}
   * @memberof ScalewayBaremetalV1ServerOption
   */
  certification?: object;
}

export const ScalewayBaremetalV1ServerOptionStatusEnum = {
  OptionStatusUnknown: 'option_status_unknown',
  OptionStatusEnable: 'option_status_enable',
  OptionStatusEnabling: 'option_status_enabling',
  OptionStatusDisabling: 'option_status_disabling',
  OptionStatusError: 'option_status_error',
} as const;

export type ScalewayBaremetalV1ServerOptionStatusEnum =
  (typeof ScalewayBaremetalV1ServerOptionStatusEnum)[keyof typeof ScalewayBaremetalV1ServerOptionStatusEnum];

/**
 * Configuration of rescue boot.
 * @export
 * @interface ScalewayBaremetalV1ServerRescueServer
 */
export interface ScalewayBaremetalV1ServerRescueServer {
  /**
   * Rescue user name.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerRescueServer
   */
  user?: string;
  /**
   * Rescue password.
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerRescueServer
   */
  password?: string;
}
/**
 * Optional configuration data passed to cloud-init.
 * @export
 * @interface ScalewayBaremetalV1ServerUserData
 */
export interface ScalewayBaremetalV1ServerUserData {
  /**
   *
   * @type {string}
   * @memberof ScalewayBaremetalV1ServerUserData
   */
  value?: string;
}
/**
 *
 * @export
 * @interface ScalewayBaremetalV1Setting
 */
export interface ScalewayBaremetalV1Setting {
  /**
   * ID of the setting.
   * @type {string}
   * @memberof ScalewayBaremetalV1Setting
   */
  id?: string;
  /**
   * Type of the setting.
   * @type {string}
   * @memberof ScalewayBaremetalV1Setting
   */
  type?: ScalewayBaremetalV1SettingTypeEnum;
  /**
   * ID of the Project ID.
   * @type {string}
   * @memberof ScalewayBaremetalV1Setting
   */
  project_id?: string;
  /**
   * Defines whether the setting is enabled.
   * @type {boolean}
   * @memberof ScalewayBaremetalV1Setting
   */
  enabled?: boolean;
}

export const ScalewayBaremetalV1SettingTypeEnum = {
  Unknown: 'unknown',
  Smtp: 'smtp',
} as const;

export type ScalewayBaremetalV1SettingTypeEnum =
  (typeof ScalewayBaremetalV1SettingTypeEnum)[keyof typeof ScalewayBaremetalV1SettingTypeEnum];

/**
 * @type ScalewayStdTimeSeriesPointInner
 * @export
 */
export type ScalewayStdTimeSeriesPointInner = number | string;

/**
 *
 * @export
 * @interface StartBMCAccessRequest
 */
export interface StartBMCAccessRequest {
  /**
   * The IP authorized to connect to the server. (IPv4 address)
   * @type {string}
   * @memberof StartBMCAccessRequest
   */
  ip: string;
}
/**
 *
 * @export
 * @interface UpdateIPRequest
 */
export interface UpdateIPRequest {
  /**
   * New reverse IP to update, not updated if null.
   * @type {string}
   * @memberof UpdateIPRequest
   */
  reverse?: string;
}
/**
 *
 * @export
 * @interface UpdateServerRequest
 */
export interface UpdateServerRequest {
  /**
   * Name of the server (≠hostname), not updated if null.
   * @type {string}
   * @memberof UpdateServerRequest
   */
  name?: string;
  /**
   * Description associated with the server, max 255 characters, not updated if null.
   * @type {string}
   * @memberof UpdateServerRequest
   */
  description?: string;
  /**
   * Tags associated with the server, not updated if null.
   * @type {Array<string>}
   * @memberof UpdateServerRequest
   */
  tags?: Array<string>;
  /**
   * If enabled, the server can not be deleted.
   * @type {boolean}
   * @memberof UpdateServerRequest
   */
  protected?: boolean;
  /**
   *
   * @type {CreateServerRequestUserData}
   * @memberof UpdateServerRequest
   */
  user_data?: CreateServerRequestUserData;
}
/**
 *
 * @export
 * @interface UpdateSettingRequest
 */
export interface UpdateSettingRequest {
  /**
   * Defines whether the setting is enabled.
   * @type {boolean}
   * @memberof UpdateSettingRequest
   */
  enabled?: boolean;
}
/**
 *
 * @export
 * @interface ValidatePartitioningSchemaRequest
 */
export interface ValidatePartitioningSchemaRequest {
  /**
   *
   * @type {ValidatePartitioningSchemaRequestPartitioningSchema}
   * @memberof ValidatePartitioningSchemaRequest
   */
  partitioning_schema?: ValidatePartitioningSchemaRequestPartitioningSchema;
  /**
   * Offer ID of the server.
   * @type {string}
   * @memberof ValidatePartitioningSchemaRequest
   */
  offer_id?: string;
  /**
   * OS ID.
   * @type {string}
   * @memberof ValidatePartitioningSchemaRequest
   */
  os_id?: string;
}
/**
 * Partitioning schema.
 * @export
 * @interface ValidatePartitioningSchemaRequestPartitioningSchema
 */
export interface ValidatePartitioningSchemaRequestPartitioningSchema {
  /**
   *
   * @type {Array<ScalewayBaremetalV1SchemaDisk>}
   * @memberof ValidatePartitioningSchemaRequestPartitioningSchema
   */
  disks?: Array<ScalewayBaremetalV1SchemaDisk>;
  /**
   *
   * @type {Array<ScalewayBaremetalV1SchemaRAID>}
   * @memberof ValidatePartitioningSchemaRequestPartitioningSchema
   */
  raids?: Array<ScalewayBaremetalV1SchemaRAID>;
  /**
   *
   * @type {Array<ScalewayBaremetalV1SchemaFilesystem>}
   * @memberof ValidatePartitioningSchemaRequestPartitioningSchema
   */
  filesystems?: Array<ScalewayBaremetalV1SchemaFilesystem>;
  /**
   *
   * @type {ScalewayBaremetalV1SchemaZFS}
   * @memberof ValidatePartitioningSchemaRequestPartitioningSchema
   */
  zfs?: ScalewayBaremetalV1SchemaZFS;
}

/**
 * BMCAccessApi - axios parameter creator
 * @export
 */
export const BMCAccessApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Get the BMC (Baseboard Management Controller) access associated with the ID, including the URL and login information needed to connect.
     * @summary Get BMC access
     * @param {GetBMCAccessZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getBMCAccess: async (
      zone: GetBMCAccessZoneEnum,
      serverId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getBMCAccess', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('getBMCAccess', 'serverId', serverId);
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/bmc-access`
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
     * Start BMC (Baseboard Management Controller) access associated with the ID. The BMC (Baseboard Management Controller) access is available one hour after the installation of the server. You need first to create an option Remote Access. You will find the ID and the price with a call to listOffers (https://developers.scaleway.com/en/products/baremetal/api/#get-78db92). Then add the option https://developers.scaleway.com/en/products/baremetal/api/#post-b14abd. After adding the BMC option, you need to Get Remote Access to get the login/password https://developers.scaleway.com/en/products/baremetal/api/#get-cefc0f. Do not forget to delete the Option after use.
     * @summary Start BMC access
     * @param {StartBMCAccessZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {StartBMCAccessRequest} startBMCAccessRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    startBMCAccess: async (
      zone: StartBMCAccessZoneEnum,
      serverId: string,
      startBMCAccessRequest: StartBMCAccessRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('startBMCAccess', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('startBMCAccess', 'serverId', serverId);
      // verify required parameter 'startBMCAccessRequest' is not null or undefined
      assertParamExists(
        'startBMCAccess',
        'startBMCAccessRequest',
        startBMCAccessRequest,
      );
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/bmc-access`
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
        startBMCAccessRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Stop BMC (Baseboard Management Controller) access associated with the ID.
     * @summary Stop BMC access
     * @param {StopBMCAccessZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    stopBMCAccess: async (
      zone: StopBMCAccessZoneEnum,
      serverId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('stopBMCAccess', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('stopBMCAccess', 'serverId', serverId);
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/bmc-access`
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
  };
};

/**
 * BMCAccessApi - functional programming interface
 * @export
 */
export const BMCAccessApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    BMCAccessApiAxiosParamCreator(configuration);
  return {
    /**
     * Get the BMC (Baseboard Management Controller) access associated with the ID, including the URL and login information needed to connect.
     * @summary Get BMC access
     * @param {GetBMCAccessZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getBMCAccess(
      zone: GetBMCAccessZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1BMCAccess>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getBMCAccess(
        zone,
        serverId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['BMCAccessApi.getBMCAccess']?.[
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
     * Start BMC (Baseboard Management Controller) access associated with the ID. The BMC (Baseboard Management Controller) access is available one hour after the installation of the server. You need first to create an option Remote Access. You will find the ID and the price with a call to listOffers (https://developers.scaleway.com/en/products/baremetal/api/#get-78db92). Then add the option https://developers.scaleway.com/en/products/baremetal/api/#post-b14abd. After adding the BMC option, you need to Get Remote Access to get the login/password https://developers.scaleway.com/en/products/baremetal/api/#get-cefc0f. Do not forget to delete the Option after use.
     * @summary Start BMC access
     * @param {StartBMCAccessZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {StartBMCAccessRequest} startBMCAccessRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async startBMCAccess(
      zone: StartBMCAccessZoneEnum,
      serverId: string,
      startBMCAccessRequest: StartBMCAccessRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1BMCAccess>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.startBMCAccess(
        zone,
        serverId,
        startBMCAccessRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['BMCAccessApi.startBMCAccess']?.[
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
     * Stop BMC (Baseboard Management Controller) access associated with the ID.
     * @summary Stop BMC access
     * @param {StopBMCAccessZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async stopBMCAccess(
      zone: StopBMCAccessZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.stopBMCAccess(
        zone,
        serverId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['BMCAccessApi.stopBMCAccess']?.[
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
 * BMCAccessApi - factory interface
 * @export
 */
export const BMCAccessApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = BMCAccessApiFp(configuration);
  return {
    /**
     * Get the BMC (Baseboard Management Controller) access associated with the ID, including the URL and login information needed to connect.
     * @summary Get BMC access
     * @param {GetBMCAccessZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getBMCAccess(
      zone: GetBMCAccessZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1BMCAccess> {
      return localVarFp
        .getBMCAccess(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Start BMC (Baseboard Management Controller) access associated with the ID. The BMC (Baseboard Management Controller) access is available one hour after the installation of the server. You need first to create an option Remote Access. You will find the ID and the price with a call to listOffers (https://developers.scaleway.com/en/products/baremetal/api/#get-78db92). Then add the option https://developers.scaleway.com/en/products/baremetal/api/#post-b14abd. After adding the BMC option, you need to Get Remote Access to get the login/password https://developers.scaleway.com/en/products/baremetal/api/#get-cefc0f. Do not forget to delete the Option after use.
     * @summary Start BMC access
     * @param {StartBMCAccessZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {StartBMCAccessRequest} startBMCAccessRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    startBMCAccess(
      zone: StartBMCAccessZoneEnum,
      serverId: string,
      startBMCAccessRequest: StartBMCAccessRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1BMCAccess> {
      return localVarFp
        .startBMCAccess(zone, serverId, startBMCAccessRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Stop BMC (Baseboard Management Controller) access associated with the ID.
     * @summary Stop BMC access
     * @param {StopBMCAccessZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    stopBMCAccess(
      zone: StopBMCAccessZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .stopBMCAccess(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * BMCAccessApi - interface
 * @export
 * @interface BMCAccessApi
 */
export interface BMCAccessApiInterface {
  /**
   * Get the BMC (Baseboard Management Controller) access associated with the ID, including the URL and login information needed to connect.
   * @summary Get BMC access
   * @param {GetBMCAccessZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof BMCAccessApiInterface
   */
  getBMCAccess(
    zone: GetBMCAccessZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1BMCAccess>;

  /**
   * Start BMC (Baseboard Management Controller) access associated with the ID. The BMC (Baseboard Management Controller) access is available one hour after the installation of the server. You need first to create an option Remote Access. You will find the ID and the price with a call to listOffers (https://developers.scaleway.com/en/products/baremetal/api/#get-78db92). Then add the option https://developers.scaleway.com/en/products/baremetal/api/#post-b14abd. After adding the BMC option, you need to Get Remote Access to get the login/password https://developers.scaleway.com/en/products/baremetal/api/#get-cefc0f. Do not forget to delete the Option after use.
   * @summary Start BMC access
   * @param {StartBMCAccessZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {StartBMCAccessRequest} startBMCAccessRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof BMCAccessApiInterface
   */
  startBMCAccess(
    zone: StartBMCAccessZoneEnum,
    serverId: string,
    startBMCAccessRequest: StartBMCAccessRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1BMCAccess>;

  /**
   * Stop BMC (Baseboard Management Controller) access associated with the ID.
   * @summary Stop BMC access
   * @param {StopBMCAccessZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof BMCAccessApiInterface
   */
  stopBMCAccess(
    zone: StopBMCAccessZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;
}

/**
 * BMCAccessApi - object-oriented interface
 * @export
 * @class BMCAccessApi
 * @extends {BaseAPI}
 */
export class BMCAccessApi extends BaseAPI implements BMCAccessApiInterface {
  /**
   * Get the BMC (Baseboard Management Controller) access associated with the ID, including the URL and login information needed to connect.
   * @summary Get BMC access
   * @param {GetBMCAccessZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof BMCAccessApi
   */
  public getBMCAccess(
    zone: GetBMCAccessZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return BMCAccessApiFp(this.configuration)
      .getBMCAccess(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Start BMC (Baseboard Management Controller) access associated with the ID. The BMC (Baseboard Management Controller) access is available one hour after the installation of the server. You need first to create an option Remote Access. You will find the ID and the price with a call to listOffers (https://developers.scaleway.com/en/products/baremetal/api/#get-78db92). Then add the option https://developers.scaleway.com/en/products/baremetal/api/#post-b14abd. After adding the BMC option, you need to Get Remote Access to get the login/password https://developers.scaleway.com/en/products/baremetal/api/#get-cefc0f. Do not forget to delete the Option after use.
   * @summary Start BMC access
   * @param {StartBMCAccessZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {StartBMCAccessRequest} startBMCAccessRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof BMCAccessApi
   */
  public startBMCAccess(
    zone: StartBMCAccessZoneEnum,
    serverId: string,
    startBMCAccessRequest: StartBMCAccessRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return BMCAccessApiFp(this.configuration)
      .startBMCAccess(zone, serverId, startBMCAccessRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Stop BMC (Baseboard Management Controller) access associated with the ID.
   * @summary Stop BMC access
   * @param {StopBMCAccessZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof BMCAccessApi
   */
  public stopBMCAccess(
    zone: StopBMCAccessZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return BMCAccessApiFp(this.configuration)
      .stopBMCAccess(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const GetBMCAccessZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type GetBMCAccessZoneEnum =
  (typeof GetBMCAccessZoneEnum)[keyof typeof GetBMCAccessZoneEnum];
/**
 * @export
 */
export const StartBMCAccessZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type StartBMCAccessZoneEnum =
  (typeof StartBMCAccessZoneEnum)[keyof typeof StartBMCAccessZoneEnum];
/**
 * @export
 */
export const StopBMCAccessZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type StopBMCAccessZoneEnum =
  (typeof StopBMCAccessZoneEnum)[keyof typeof StopBMCAccessZoneEnum];

/**
 * OSApi - axios parameter creator
 * @export
 */
export const OSApiAxiosParamCreator = function (configuration?: Configuration) {
  return {
    /**
     * Return the specific OS for the ID.
     * @summary Get OS with an ID
     * @param {GetOSZoneEnum} zone The zone you want to target
     * @param {string} osId ID of the OS.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOS: async (
      zone: GetOSZoneEnum,
      osId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getOS', 'zone', zone);
      // verify required parameter 'osId' is not null or undefined
      assertParamExists('getOS', 'osId', osId);
      const localVarPath = `/baremetal/v1/zones/{zone}/os/{os_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'os_id'}}`, encodeURIComponent(String(osId)));
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
     * List all OSes that are available for installation on Elastic Metal servers.
     * @summary List available OSes
     * @param {ListOSZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of OS per page.
     * @param {string} [offerId] Offer IDs to filter OSes for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listOS: async (
      zone: ListOSZoneEnum,
      page?: number,
      pageSize?: number,
      offerId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listOS', 'zone', zone);
      const localVarPath = `/baremetal/v1/zones/{zone}/os`.replace(
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

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (offerId !== undefined) {
        localVarQueryParameter['offer_id'] = offerId;
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
 * OSApi - functional programming interface
 * @export
 */
export const OSApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = OSApiAxiosParamCreator(configuration);
  return {
    /**
     * Return the specific OS for the ID.
     * @summary Get OS with an ID
     * @param {GetOSZoneEnum} zone The zone you want to target
     * @param {string} osId ID of the OS.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getOS(
      zone: GetOSZoneEnum,
      osId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1OS>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getOS(
        zone,
        osId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['OSApi.getOS']?.[localVarOperationServerIndex]?.url;
      return (axios, basePath) =>
        createRequestFunction(
          localVarAxiosArgs,
          globalAxios,
          BASE_PATH,
          configuration,
        )(axios, localVarOperationServerBasePath || basePath);
    },
    /**
     * List all OSes that are available for installation on Elastic Metal servers.
     * @summary List available OSes
     * @param {ListOSZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of OS per page.
     * @param {string} [offerId] Offer IDs to filter OSes for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listOS(
      zone: ListOSZoneEnum,
      page?: number,
      pageSize?: number,
      offerId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1ListOSResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listOS(
        zone,
        page,
        pageSize,
        offerId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['OSApi.listOS']?.[localVarOperationServerIndex]?.url;
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
 * OSApi - factory interface
 * @export
 */
export const OSApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = OSApiFp(configuration);
  return {
    /**
     * Return the specific OS for the ID.
     * @summary Get OS with an ID
     * @param {GetOSZoneEnum} zone The zone you want to target
     * @param {string} osId ID of the OS.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOS(
      zone: GetOSZoneEnum,
      osId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1OS> {
      return localVarFp
        .getOS(zone, osId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all OSes that are available for installation on Elastic Metal servers.
     * @summary List available OSes
     * @param {ListOSZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of OS per page.
     * @param {string} [offerId] Offer IDs to filter OSes for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listOS(
      zone: ListOSZoneEnum,
      page?: number,
      pageSize?: number,
      offerId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1ListOSResponse> {
      return localVarFp
        .listOS(zone, page, pageSize, offerId, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * OSApi - interface
 * @export
 * @interface OSApi
 */
export interface OSApiInterface {
  /**
   * Return the specific OS for the ID.
   * @summary Get OS with an ID
   * @param {GetOSZoneEnum} zone The zone you want to target
   * @param {string} osId ID of the OS.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OSApiInterface
   */
  getOS(
    zone: GetOSZoneEnum,
    osId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1OS>;

  /**
   * List all OSes that are available for installation on Elastic Metal servers.
   * @summary List available OSes
   * @param {ListOSZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of OS per page.
   * @param {string} [offerId] Offer IDs to filter OSes for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OSApiInterface
   */
  listOS(
    zone: ListOSZoneEnum,
    page?: number,
    pageSize?: number,
    offerId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1ListOSResponse>;
}

/**
 * OSApi - object-oriented interface
 * @export
 * @class OSApi
 * @extends {BaseAPI}
 */
export class OSApi extends BaseAPI implements OSApiInterface {
  /**
   * Return the specific OS for the ID.
   * @summary Get OS with an ID
   * @param {GetOSZoneEnum} zone The zone you want to target
   * @param {string} osId ID of the OS.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OSApi
   */
  public getOS(
    zone: GetOSZoneEnum,
    osId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return OSApiFp(this.configuration)
      .getOS(zone, osId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all OSes that are available for installation on Elastic Metal servers.
   * @summary List available OSes
   * @param {ListOSZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of OS per page.
   * @param {string} [offerId] Offer IDs to filter OSes for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OSApi
   */
  public listOS(
    zone: ListOSZoneEnum,
    page?: number,
    pageSize?: number,
    offerId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return OSApiFp(this.configuration)
      .listOS(zone, page, pageSize, offerId, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const GetOSZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type GetOSZoneEnum = (typeof GetOSZoneEnum)[keyof typeof GetOSZoneEnum];
/**
 * @export
 */
export const ListOSZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type ListOSZoneEnum =
  (typeof ListOSZoneEnum)[keyof typeof ListOSZoneEnum];

/**
 * OffersApi - axios parameter creator
 * @export
 */
export const OffersApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Get details of an offer identified by its offer ID.
     * @summary Get offer
     * @param {GetOfferZoneEnum} zone The zone you want to target
     * @param {string} offerId ID of the researched Offer.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOffer: async (
      zone: GetOfferZoneEnum,
      offerId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getOffer', 'zone', zone);
      // verify required parameter 'offerId' is not null or undefined
      assertParamExists('getOffer', 'offerId', offerId);
      const localVarPath = `/baremetal/v1/zones/{zone}/offers/{offer_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'offer_id'}}`, encodeURIComponent(String(offerId)));
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
     * List all available Elastic Metal server configurations.
     * @summary List offers
     * @param {ListOffersZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of offers per page.
     * @param {ListOffersSubscriptionPeriodEnum} [subscriptionPeriod] Subscription period type to filter offers by.
     * @param {string} [name] Offer name to filter offers by.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listOffers: async (
      zone: ListOffersZoneEnum,
      page?: number,
      pageSize?: number,
      subscriptionPeriod?: ListOffersSubscriptionPeriodEnum,
      name?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listOffers', 'zone', zone);
      const localVarPath = `/baremetal/v1/zones/{zone}/offers`.replace(
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

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (subscriptionPeriod !== undefined) {
        localVarQueryParameter['subscription_period'] = subscriptionPeriod;
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
  };
};

/**
 * OffersApi - functional programming interface
 * @export
 */
export const OffersApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = OffersApiAxiosParamCreator(configuration);
  return {
    /**
     * Get details of an offer identified by its offer ID.
     * @summary Get offer
     * @param {GetOfferZoneEnum} zone The zone you want to target
     * @param {string} offerId ID of the researched Offer.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getOffer(
      zone: GetOfferZoneEnum,
      offerId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Offer>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getOffer(
        zone,
        offerId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['OffersApi.getOffer']?.[localVarOperationServerIndex]
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
     * List all available Elastic Metal server configurations.
     * @summary List offers
     * @param {ListOffersZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of offers per page.
     * @param {ListOffersSubscriptionPeriodEnum} [subscriptionPeriod] Subscription period type to filter offers by.
     * @param {string} [name] Offer name to filter offers by.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listOffers(
      zone: ListOffersZoneEnum,
      page?: number,
      pageSize?: number,
      subscriptionPeriod?: ListOffersSubscriptionPeriodEnum,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1ListOffersResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listOffers(
        zone,
        page,
        pageSize,
        subscriptionPeriod,
        name,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['OffersApi.listOffers']?.[
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
 * OffersApi - factory interface
 * @export
 */
export const OffersApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = OffersApiFp(configuration);
  return {
    /**
     * Get details of an offer identified by its offer ID.
     * @summary Get offer
     * @param {GetOfferZoneEnum} zone The zone you want to target
     * @param {string} offerId ID of the researched Offer.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOffer(
      zone: GetOfferZoneEnum,
      offerId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Offer> {
      return localVarFp
        .getOffer(zone, offerId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all available Elastic Metal server configurations.
     * @summary List offers
     * @param {ListOffersZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of offers per page.
     * @param {ListOffersSubscriptionPeriodEnum} [subscriptionPeriod] Subscription period type to filter offers by.
     * @param {string} [name] Offer name to filter offers by.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listOffers(
      zone: ListOffersZoneEnum,
      page?: number,
      pageSize?: number,
      subscriptionPeriod?: ListOffersSubscriptionPeriodEnum,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1ListOffersResponse> {
      return localVarFp
        .listOffers(zone, page, pageSize, subscriptionPeriod, name, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * OffersApi - interface
 * @export
 * @interface OffersApi
 */
export interface OffersApiInterface {
  /**
   * Get details of an offer identified by its offer ID.
   * @summary Get offer
   * @param {GetOfferZoneEnum} zone The zone you want to target
   * @param {string} offerId ID of the researched Offer.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OffersApiInterface
   */
  getOffer(
    zone: GetOfferZoneEnum,
    offerId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Offer>;

  /**
   * List all available Elastic Metal server configurations.
   * @summary List offers
   * @param {ListOffersZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of offers per page.
   * @param {ListOffersSubscriptionPeriodEnum} [subscriptionPeriod] Subscription period type to filter offers by.
   * @param {string} [name] Offer name to filter offers by.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OffersApiInterface
   */
  listOffers(
    zone: ListOffersZoneEnum,
    page?: number,
    pageSize?: number,
    subscriptionPeriod?: ListOffersSubscriptionPeriodEnum,
    name?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1ListOffersResponse>;
}

/**
 * OffersApi - object-oriented interface
 * @export
 * @class OffersApi
 * @extends {BaseAPI}
 */
export class OffersApi extends BaseAPI implements OffersApiInterface {
  /**
   * Get details of an offer identified by its offer ID.
   * @summary Get offer
   * @param {GetOfferZoneEnum} zone The zone you want to target
   * @param {string} offerId ID of the researched Offer.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OffersApi
   */
  public getOffer(
    zone: GetOfferZoneEnum,
    offerId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return OffersApiFp(this.configuration)
      .getOffer(zone, offerId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all available Elastic Metal server configurations.
   * @summary List offers
   * @param {ListOffersZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of offers per page.
   * @param {ListOffersSubscriptionPeriodEnum} [subscriptionPeriod] Subscription period type to filter offers by.
   * @param {string} [name] Offer name to filter offers by.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OffersApi
   */
  public listOffers(
    zone: ListOffersZoneEnum,
    page?: number,
    pageSize?: number,
    subscriptionPeriod?: ListOffersSubscriptionPeriodEnum,
    name?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return OffersApiFp(this.configuration)
      .listOffers(zone, page, pageSize, subscriptionPeriod, name, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const GetOfferZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type GetOfferZoneEnum =
  (typeof GetOfferZoneEnum)[keyof typeof GetOfferZoneEnum];
/**
 * @export
 */
export const ListOffersZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type ListOffersZoneEnum =
  (typeof ListOffersZoneEnum)[keyof typeof ListOffersZoneEnum];
/**
 * @export
 */
export const ListOffersSubscriptionPeriodEnum = {
  UnknownSubscriptionPeriod: 'unknown_subscription_period',
  Hourly: 'hourly',
  Monthly: 'monthly',
} as const;
export type ListOffersSubscriptionPeriodEnum =
  (typeof ListOffersSubscriptionPeriodEnum)[keyof typeof ListOffersSubscriptionPeriodEnum];

/**
 * OptionsApi - axios parameter creator
 * @export
 */
export const OptionsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Return specific option for the ID.
     * @summary Get option
     * @param {GetOptionZoneEnum} zone The zone you want to target
     * @param {string} optionId ID of the option.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOption: async (
      zone: GetOptionZoneEnum,
      optionId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getOption', 'zone', zone);
      // verify required parameter 'optionId' is not null or undefined
      assertParamExists('getOption', 'optionId', optionId);
      const localVarPath = `/baremetal/v1/zones/{zone}/options/{option_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'option_id'}}`, encodeURIComponent(String(optionId)));
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
     * List all options matching with filters.
     * @summary List options
     * @param {ListOptionsZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of options per page.
     * @param {string} [offerId] Offer ID to filter options for.
     * @param {string} [name] Name to filter options for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listOptions: async (
      zone: ListOptionsZoneEnum,
      page?: number,
      pageSize?: number,
      offerId?: string,
      name?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listOptions', 'zone', zone);
      const localVarPath = `/baremetal/v1/zones/{zone}/options`.replace(
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

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (offerId !== undefined) {
        localVarQueryParameter['offer_id'] = offerId;
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
     * Return all settings for a Project ID.
     * @summary List all settings
     * @param {ListSettingsZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Set the maximum list size.
     * @param {ListSettingsOrderByEnum} [orderBy] Sort order for items in the response.
     * @param {string} [projectId] ID of the Project. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSettings: async (
      zone: ListSettingsZoneEnum,
      page?: number,
      pageSize?: number,
      orderBy?: ListSettingsOrderByEnum,
      projectId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listSettings', 'zone', zone);
      const localVarPath = `/baremetal/v1/zones/{zone}/settings`.replace(
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

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (orderBy !== undefined) {
        localVarQueryParameter['order_by'] = orderBy;
      }

      if (projectId !== undefined) {
        localVarQueryParameter['project_id'] = projectId;
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
     * Update a setting for a Project ID (enable or disable).
     * @summary Update setting
     * @param {UpdateSettingZoneEnum} zone The zone you want to target
     * @param {string} settingId ID of the setting.
     * @param {UpdateSettingRequest} updateSettingRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSetting: async (
      zone: UpdateSettingZoneEnum,
      settingId: string,
      updateSettingRequest: UpdateSettingRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateSetting', 'zone', zone);
      // verify required parameter 'settingId' is not null or undefined
      assertParamExists('updateSetting', 'settingId', settingId);
      // verify required parameter 'updateSettingRequest' is not null or undefined
      assertParamExists(
        'updateSetting',
        'updateSettingRequest',
        updateSettingRequest,
      );
      const localVarPath = `/baremetal/v1/zones/{zone}/settings/{setting_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'setting_id'}}`, encodeURIComponent(String(settingId)));
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
        updateSettingRequest,
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
 * OptionsApi - functional programming interface
 * @export
 */
export const OptionsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = OptionsApiAxiosParamCreator(configuration);
  return {
    /**
     * Return specific option for the ID.
     * @summary Get option
     * @param {GetOptionZoneEnum} zone The zone you want to target
     * @param {string} optionId ID of the option.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getOption(
      zone: GetOptionZoneEnum,
      optionId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Option>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getOption(
        zone,
        optionId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['OptionsApi.getOption']?.[
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
     * List all options matching with filters.
     * @summary List options
     * @param {ListOptionsZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of options per page.
     * @param {string} [offerId] Offer ID to filter options for.
     * @param {string} [name] Name to filter options for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listOptions(
      zone: ListOptionsZoneEnum,
      page?: number,
      pageSize?: number,
      offerId?: string,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1ListOptionsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listOptions(
        zone,
        page,
        pageSize,
        offerId,
        name,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['OptionsApi.listOptions']?.[
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
     * Return all settings for a Project ID.
     * @summary List all settings
     * @param {ListSettingsZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Set the maximum list size.
     * @param {ListSettingsOrderByEnum} [orderBy] Sort order for items in the response.
     * @param {string} [projectId] ID of the Project. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listSettings(
      zone: ListSettingsZoneEnum,
      page?: number,
      pageSize?: number,
      orderBy?: ListSettingsOrderByEnum,
      projectId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1ListSettingsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listSettings(
        zone,
        page,
        pageSize,
        orderBy,
        projectId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['OptionsApi.listSettings']?.[
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
     * Update a setting for a Project ID (enable or disable).
     * @summary Update setting
     * @param {UpdateSettingZoneEnum} zone The zone you want to target
     * @param {string} settingId ID of the setting.
     * @param {UpdateSettingRequest} updateSettingRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateSetting(
      zone: UpdateSettingZoneEnum,
      settingId: string,
      updateSettingRequest: UpdateSettingRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Setting>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateSetting(
        zone,
        settingId,
        updateSettingRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['OptionsApi.updateSetting']?.[
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
 * OptionsApi - factory interface
 * @export
 */
export const OptionsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = OptionsApiFp(configuration);
  return {
    /**
     * Return specific option for the ID.
     * @summary Get option
     * @param {GetOptionZoneEnum} zone The zone you want to target
     * @param {string} optionId ID of the option.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOption(
      zone: GetOptionZoneEnum,
      optionId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Option> {
      return localVarFp
        .getOption(zone, optionId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all options matching with filters.
     * @summary List options
     * @param {ListOptionsZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of options per page.
     * @param {string} [offerId] Offer ID to filter options for.
     * @param {string} [name] Name to filter options for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listOptions(
      zone: ListOptionsZoneEnum,
      page?: number,
      pageSize?: number,
      offerId?: string,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1ListOptionsResponse> {
      return localVarFp
        .listOptions(zone, page, pageSize, offerId, name, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Return all settings for a Project ID.
     * @summary List all settings
     * @param {ListSettingsZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Set the maximum list size.
     * @param {ListSettingsOrderByEnum} [orderBy] Sort order for items in the response.
     * @param {string} [projectId] ID of the Project. (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSettings(
      zone: ListSettingsZoneEnum,
      page?: number,
      pageSize?: number,
      orderBy?: ListSettingsOrderByEnum,
      projectId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1ListSettingsResponse> {
      return localVarFp
        .listSettings(zone, page, pageSize, orderBy, projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update a setting for a Project ID (enable or disable).
     * @summary Update setting
     * @param {UpdateSettingZoneEnum} zone The zone you want to target
     * @param {string} settingId ID of the setting.
     * @param {UpdateSettingRequest} updateSettingRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSetting(
      zone: UpdateSettingZoneEnum,
      settingId: string,
      updateSettingRequest: UpdateSettingRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Setting> {
      return localVarFp
        .updateSetting(zone, settingId, updateSettingRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * OptionsApi - interface
 * @export
 * @interface OptionsApi
 */
export interface OptionsApiInterface {
  /**
   * Return specific option for the ID.
   * @summary Get option
   * @param {GetOptionZoneEnum} zone The zone you want to target
   * @param {string} optionId ID of the option.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OptionsApiInterface
   */
  getOption(
    zone: GetOptionZoneEnum,
    optionId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Option>;

  /**
   * List all options matching with filters.
   * @summary List options
   * @param {ListOptionsZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of options per page.
   * @param {string} [offerId] Offer ID to filter options for.
   * @param {string} [name] Name to filter options for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OptionsApiInterface
   */
  listOptions(
    zone: ListOptionsZoneEnum,
    page?: number,
    pageSize?: number,
    offerId?: string,
    name?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1ListOptionsResponse>;

  /**
   * Return all settings for a Project ID.
   * @summary List all settings
   * @param {ListSettingsZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Set the maximum list size.
   * @param {ListSettingsOrderByEnum} [orderBy] Sort order for items in the response.
   * @param {string} [projectId] ID of the Project. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OptionsApiInterface
   */
  listSettings(
    zone: ListSettingsZoneEnum,
    page?: number,
    pageSize?: number,
    orderBy?: ListSettingsOrderByEnum,
    projectId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1ListSettingsResponse>;

  /**
   * Update a setting for a Project ID (enable or disable).
   * @summary Update setting
   * @param {UpdateSettingZoneEnum} zone The zone you want to target
   * @param {string} settingId ID of the setting.
   * @param {UpdateSettingRequest} updateSettingRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OptionsApiInterface
   */
  updateSetting(
    zone: UpdateSettingZoneEnum,
    settingId: string,
    updateSettingRequest: UpdateSettingRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Setting>;
}

/**
 * OptionsApi - object-oriented interface
 * @export
 * @class OptionsApi
 * @extends {BaseAPI}
 */
export class OptionsApi extends BaseAPI implements OptionsApiInterface {
  /**
   * Return specific option for the ID.
   * @summary Get option
   * @param {GetOptionZoneEnum} zone The zone you want to target
   * @param {string} optionId ID of the option.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OptionsApi
   */
  public getOption(
    zone: GetOptionZoneEnum,
    optionId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return OptionsApiFp(this.configuration)
      .getOption(zone, optionId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all options matching with filters.
   * @summary List options
   * @param {ListOptionsZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of options per page.
   * @param {string} [offerId] Offer ID to filter options for.
   * @param {string} [name] Name to filter options for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OptionsApi
   */
  public listOptions(
    zone: ListOptionsZoneEnum,
    page?: number,
    pageSize?: number,
    offerId?: string,
    name?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return OptionsApiFp(this.configuration)
      .listOptions(zone, page, pageSize, offerId, name, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Return all settings for a Project ID.
   * @summary List all settings
   * @param {ListSettingsZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Set the maximum list size.
   * @param {ListSettingsOrderByEnum} [orderBy] Sort order for items in the response.
   * @param {string} [projectId] ID of the Project. (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OptionsApi
   */
  public listSettings(
    zone: ListSettingsZoneEnum,
    page?: number,
    pageSize?: number,
    orderBy?: ListSettingsOrderByEnum,
    projectId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return OptionsApiFp(this.configuration)
      .listSettings(zone, page, pageSize, orderBy, projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update a setting for a Project ID (enable or disable).
   * @summary Update setting
   * @param {UpdateSettingZoneEnum} zone The zone you want to target
   * @param {string} settingId ID of the setting.
   * @param {UpdateSettingRequest} updateSettingRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof OptionsApi
   */
  public updateSetting(
    zone: UpdateSettingZoneEnum,
    settingId: string,
    updateSettingRequest: UpdateSettingRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return OptionsApiFp(this.configuration)
      .updateSetting(zone, settingId, updateSettingRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const GetOptionZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type GetOptionZoneEnum =
  (typeof GetOptionZoneEnum)[keyof typeof GetOptionZoneEnum];
/**
 * @export
 */
export const ListOptionsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type ListOptionsZoneEnum =
  (typeof ListOptionsZoneEnum)[keyof typeof ListOptionsZoneEnum];
/**
 * @export
 */
export const ListSettingsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type ListSettingsZoneEnum =
  (typeof ListSettingsZoneEnum)[keyof typeof ListSettingsZoneEnum];
/**
 * @export
 */
export const ListSettingsOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
} as const;
export type ListSettingsOrderByEnum =
  (typeof ListSettingsOrderByEnum)[keyof typeof ListSettingsOrderByEnum];
/**
 * @export
 */
export const UpdateSettingZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type UpdateSettingZoneEnum =
  (typeof UpdateSettingZoneEnum)[keyof typeof UpdateSettingZoneEnum];

/**
 * PartitioningSchemasApi - axios parameter creator
 * @export
 */
export const PartitioningSchemasApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Get the default partitioning schema for the given offer ID and OS ID.
     * @summary Get default partitioning schema
     * @param {GetDefaultPartitioningSchemaZoneEnum} zone The zone you want to target
     * @param {string} offerId ID of the offer.
     * @param {string} osId ID of the OS.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getDefaultPartitioningSchema: async (
      zone: GetDefaultPartitioningSchemaZoneEnum,
      offerId: string,
      osId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getDefaultPartitioningSchema', 'zone', zone);
      // verify required parameter 'offerId' is not null or undefined
      assertParamExists('getDefaultPartitioningSchema', 'offerId', offerId);
      // verify required parameter 'osId' is not null or undefined
      assertParamExists('getDefaultPartitioningSchema', 'osId', osId);
      const localVarPath =
        `/baremetal/v1/zones/{zone}/partitioning-schemas/default`.replace(
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

      if (offerId !== undefined) {
        localVarQueryParameter['offer_id'] = offerId;
      }

      if (osId !== undefined) {
        localVarQueryParameter['os_id'] = osId;
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
     * Validate the incoming partitioning schema from a user before installing the server. Return default ErrorCode if invalid.
     * @summary Validate client partitioning schema
     * @param {ValidatePartitioningSchemaZoneEnum} zone The zone you want to target
     * @param {ValidatePartitioningSchemaRequest} validatePartitioningSchemaRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    validatePartitioningSchema: async (
      zone: ValidatePartitioningSchemaZoneEnum,
      validatePartitioningSchemaRequest: ValidatePartitioningSchemaRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('validatePartitioningSchema', 'zone', zone);
      // verify required parameter 'validatePartitioningSchemaRequest' is not null or undefined
      assertParamExists(
        'validatePartitioningSchema',
        'validatePartitioningSchemaRequest',
        validatePartitioningSchemaRequest,
      );
      const localVarPath =
        `/baremetal/v1/zones/{zone}/partitioning-schemas/validate`.replace(
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
        validatePartitioningSchemaRequest,
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
 * PartitioningSchemasApi - functional programming interface
 * @export
 */
export const PartitioningSchemasApiFp = function (
  configuration?: Configuration,
) {
  const localVarAxiosParamCreator =
    PartitioningSchemasApiAxiosParamCreator(configuration);
  return {
    /**
     * Get the default partitioning schema for the given offer ID and OS ID.
     * @summary Get default partitioning schema
     * @param {GetDefaultPartitioningSchemaZoneEnum} zone The zone you want to target
     * @param {string} offerId ID of the offer.
     * @param {string} osId ID of the OS.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getDefaultPartitioningSchema(
      zone: GetDefaultPartitioningSchemaZoneEnum,
      offerId: string,
      osId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Schema>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getDefaultPartitioningSchema(
          zone,
          offerId,
          osId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'PartitioningSchemasApi.getDefaultPartitioningSchema'
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
     * Validate the incoming partitioning schema from a user before installing the server. Return default ErrorCode if invalid.
     * @summary Validate client partitioning schema
     * @param {ValidatePartitioningSchemaZoneEnum} zone The zone you want to target
     * @param {ValidatePartitioningSchemaRequest} validatePartitioningSchemaRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async validatePartitioningSchema(
      zone: ValidatePartitioningSchemaZoneEnum,
      validatePartitioningSchemaRequest: ValidatePartitioningSchemaRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.validatePartitioningSchema(
          zone,
          validatePartitioningSchemaRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'PartitioningSchemasApi.validatePartitioningSchema'
        ]?.[localVarOperationServerIndex]?.url;
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
 * PartitioningSchemasApi - factory interface
 * @export
 */
export const PartitioningSchemasApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = PartitioningSchemasApiFp(configuration);
  return {
    /**
     * Get the default partitioning schema for the given offer ID and OS ID.
     * @summary Get default partitioning schema
     * @param {GetDefaultPartitioningSchemaZoneEnum} zone The zone you want to target
     * @param {string} offerId ID of the offer.
     * @param {string} osId ID of the OS.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getDefaultPartitioningSchema(
      zone: GetDefaultPartitioningSchemaZoneEnum,
      offerId: string,
      osId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Schema> {
      return localVarFp
        .getDefaultPartitioningSchema(zone, offerId, osId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Validate the incoming partitioning schema from a user before installing the server. Return default ErrorCode if invalid.
     * @summary Validate client partitioning schema
     * @param {ValidatePartitioningSchemaZoneEnum} zone The zone you want to target
     * @param {ValidatePartitioningSchemaRequest} validatePartitioningSchemaRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    validatePartitioningSchema(
      zone: ValidatePartitioningSchemaZoneEnum,
      validatePartitioningSchemaRequest: ValidatePartitioningSchemaRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .validatePartitioningSchema(
          zone,
          validatePartitioningSchemaRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * PartitioningSchemasApi - interface
 * @export
 * @interface PartitioningSchemasApi
 */
export interface PartitioningSchemasApiInterface {
  /**
   * Get the default partitioning schema for the given offer ID and OS ID.
   * @summary Get default partitioning schema
   * @param {GetDefaultPartitioningSchemaZoneEnum} zone The zone you want to target
   * @param {string} offerId ID of the offer.
   * @param {string} osId ID of the OS.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PartitioningSchemasApiInterface
   */
  getDefaultPartitioningSchema(
    zone: GetDefaultPartitioningSchemaZoneEnum,
    offerId: string,
    osId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Schema>;

  /**
   * Validate the incoming partitioning schema from a user before installing the server. Return default ErrorCode if invalid.
   * @summary Validate client partitioning schema
   * @param {ValidatePartitioningSchemaZoneEnum} zone The zone you want to target
   * @param {ValidatePartitioningSchemaRequest} validatePartitioningSchemaRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PartitioningSchemasApiInterface
   */
  validatePartitioningSchema(
    zone: ValidatePartitioningSchemaZoneEnum,
    validatePartitioningSchemaRequest: ValidatePartitioningSchemaRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;
}

/**
 * PartitioningSchemasApi - object-oriented interface
 * @export
 * @class PartitioningSchemasApi
 * @extends {BaseAPI}
 */
export class PartitioningSchemasApi
  extends BaseAPI
  implements PartitioningSchemasApiInterface
{
  /**
   * Get the default partitioning schema for the given offer ID and OS ID.
   * @summary Get default partitioning schema
   * @param {GetDefaultPartitioningSchemaZoneEnum} zone The zone you want to target
   * @param {string} offerId ID of the offer.
   * @param {string} osId ID of the OS.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PartitioningSchemasApi
   */
  public getDefaultPartitioningSchema(
    zone: GetDefaultPartitioningSchemaZoneEnum,
    offerId: string,
    osId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PartitioningSchemasApiFp(this.configuration)
      .getDefaultPartitioningSchema(zone, offerId, osId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Validate the incoming partitioning schema from a user before installing the server. Return default ErrorCode if invalid.
   * @summary Validate client partitioning schema
   * @param {ValidatePartitioningSchemaZoneEnum} zone The zone you want to target
   * @param {ValidatePartitioningSchemaRequest} validatePartitioningSchemaRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PartitioningSchemasApi
   */
  public validatePartitioningSchema(
    zone: ValidatePartitioningSchemaZoneEnum,
    validatePartitioningSchemaRequest: ValidatePartitioningSchemaRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PartitioningSchemasApiFp(this.configuration)
      .validatePartitioningSchema(
        zone,
        validatePartitioningSchemaRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const GetDefaultPartitioningSchemaZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type GetDefaultPartitioningSchemaZoneEnum =
  (typeof GetDefaultPartitioningSchemaZoneEnum)[keyof typeof GetDefaultPartitioningSchemaZoneEnum];
/**
 * @export
 */
export const ValidatePartitioningSchemaZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type ValidatePartitioningSchemaZoneEnum =
  (typeof ValidatePartitioningSchemaZoneEnum)[keyof typeof ValidatePartitioningSchemaZoneEnum];

/**
 * ServerActionsApi - axios parameter creator
 * @export
 */
export const ServerActionsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Reboot the Elastic Metal server associated with the ID, use the `boot_type` `rescue` to reboot the server in rescue mode.
     * @summary Reboot an Elastic Metal server
     * @param {RebootServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to reboot.
     * @param {RebootServerRequest} rebootServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    rebootServer: async (
      zone: RebootServerZoneEnum,
      serverId: string,
      rebootServerRequest: RebootServerRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('rebootServer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('rebootServer', 'serverId', serverId);
      // verify required parameter 'rebootServerRequest' is not null or undefined
      assertParamExists(
        'rebootServer',
        'rebootServerRequest',
        rebootServerRequest,
      );
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/reboot`
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
        rebootServerRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Start the server associated with the ID.
     * @summary Start an Elastic Metal server
     * @param {StartServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to start.
     * @param {RebootServerRequest} rebootServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    startServer: async (
      zone: StartServerZoneEnum,
      serverId: string,
      rebootServerRequest: RebootServerRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('startServer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('startServer', 'serverId', serverId);
      // verify required parameter 'rebootServerRequest' is not null or undefined
      assertParamExists(
        'startServer',
        'rebootServerRequest',
        rebootServerRequest,
      );
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/start`
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
        rebootServerRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Stop the server associated with the ID. The server remains allocated to your account and all data remains on the local storage of the server.
     * @summary Stop an Elastic Metal server
     * @param {StopServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to stop.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    stopServer: async (
      zone: StopServerZoneEnum,
      serverId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('stopServer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('stopServer', 'serverId', serverId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('stopServer', 'body', body);
      const localVarPath = `/baremetal/v1/zones/{zone}/servers/{server_id}/stop`
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
 * ServerActionsApi - functional programming interface
 * @export
 */
export const ServerActionsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    ServerActionsApiAxiosParamCreator(configuration);
  return {
    /**
     * Reboot the Elastic Metal server associated with the ID, use the `boot_type` `rescue` to reboot the server in rescue mode.
     * @summary Reboot an Elastic Metal server
     * @param {RebootServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to reboot.
     * @param {RebootServerRequest} rebootServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async rebootServer(
      zone: RebootServerZoneEnum,
      serverId: string,
      rebootServerRequest: RebootServerRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.rebootServer(
        zone,
        serverId,
        rebootServerRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServerActionsApi.rebootServer']?.[
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
     * Start the server associated with the ID.
     * @summary Start an Elastic Metal server
     * @param {StartServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to start.
     * @param {RebootServerRequest} rebootServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async startServer(
      zone: StartServerZoneEnum,
      serverId: string,
      rebootServerRequest: RebootServerRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.startServer(
        zone,
        serverId,
        rebootServerRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServerActionsApi.startServer']?.[
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
     * Stop the server associated with the ID. The server remains allocated to your account and all data remains on the local storage of the server.
     * @summary Stop an Elastic Metal server
     * @param {StopServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to stop.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async stopServer(
      zone: StopServerZoneEnum,
      serverId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.stopServer(
        zone,
        serverId,
        body,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServerActionsApi.stopServer']?.[
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
 * ServerActionsApi - factory interface
 * @export
 */
export const ServerActionsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = ServerActionsApiFp(configuration);
  return {
    /**
     * Reboot the Elastic Metal server associated with the ID, use the `boot_type` `rescue` to reboot the server in rescue mode.
     * @summary Reboot an Elastic Metal server
     * @param {RebootServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to reboot.
     * @param {RebootServerRequest} rebootServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    rebootServer(
      zone: RebootServerZoneEnum,
      serverId: string,
      rebootServerRequest: RebootServerRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .rebootServer(zone, serverId, rebootServerRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Start the server associated with the ID.
     * @summary Start an Elastic Metal server
     * @param {StartServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to start.
     * @param {RebootServerRequest} rebootServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    startServer(
      zone: StartServerZoneEnum,
      serverId: string,
      rebootServerRequest: RebootServerRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .startServer(zone, serverId, rebootServerRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Stop the server associated with the ID. The server remains allocated to your account and all data remains on the local storage of the server.
     * @summary Stop an Elastic Metal server
     * @param {StopServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to stop.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    stopServer(
      zone: StopServerZoneEnum,
      serverId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .stopServer(zone, serverId, body, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ServerActionsApi - interface
 * @export
 * @interface ServerActionsApi
 */
export interface ServerActionsApiInterface {
  /**
   * Reboot the Elastic Metal server associated with the ID, use the `boot_type` `rescue` to reboot the server in rescue mode.
   * @summary Reboot an Elastic Metal server
   * @param {RebootServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to reboot.
   * @param {RebootServerRequest} rebootServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServerActionsApiInterface
   */
  rebootServer(
    zone: RebootServerZoneEnum,
    serverId: string,
    rebootServerRequest: RebootServerRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;

  /**
   * Start the server associated with the ID.
   * @summary Start an Elastic Metal server
   * @param {StartServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to start.
   * @param {RebootServerRequest} rebootServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServerActionsApiInterface
   */
  startServer(
    zone: StartServerZoneEnum,
    serverId: string,
    rebootServerRequest: RebootServerRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;

  /**
   * Stop the server associated with the ID. The server remains allocated to your account and all data remains on the local storage of the server.
   * @summary Stop an Elastic Metal server
   * @param {StopServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to stop.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServerActionsApiInterface
   */
  stopServer(
    zone: StopServerZoneEnum,
    serverId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;
}

/**
 * ServerActionsApi - object-oriented interface
 * @export
 * @class ServerActionsApi
 * @extends {BaseAPI}
 */
export class ServerActionsApi
  extends BaseAPI
  implements ServerActionsApiInterface
{
  /**
   * Reboot the Elastic Metal server associated with the ID, use the `boot_type` `rescue` to reboot the server in rescue mode.
   * @summary Reboot an Elastic Metal server
   * @param {RebootServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to reboot.
   * @param {RebootServerRequest} rebootServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServerActionsApi
   */
  public rebootServer(
    zone: RebootServerZoneEnum,
    serverId: string,
    rebootServerRequest: RebootServerRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ServerActionsApiFp(this.configuration)
      .rebootServer(zone, serverId, rebootServerRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Start the server associated with the ID.
   * @summary Start an Elastic Metal server
   * @param {StartServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to start.
   * @param {RebootServerRequest} rebootServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServerActionsApi
   */
  public startServer(
    zone: StartServerZoneEnum,
    serverId: string,
    rebootServerRequest: RebootServerRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ServerActionsApiFp(this.configuration)
      .startServer(zone, serverId, rebootServerRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Stop the server associated with the ID. The server remains allocated to your account and all data remains on the local storage of the server.
   * @summary Stop an Elastic Metal server
   * @param {StopServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to stop.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServerActionsApi
   */
  public stopServer(
    zone: StopServerZoneEnum,
    serverId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return ServerActionsApiFp(this.configuration)
      .stopServer(zone, serverId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const RebootServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type RebootServerZoneEnum =
  (typeof RebootServerZoneEnum)[keyof typeof RebootServerZoneEnum];
/**
 * @export
 */
export const StartServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type StartServerZoneEnum =
  (typeof StartServerZoneEnum)[keyof typeof StartServerZoneEnum];
/**
 * @export
 */
export const StopServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type StopServerZoneEnum =
  (typeof StopServerZoneEnum)[keyof typeof StopServerZoneEnum];

/**
 * ServersApi - axios parameter creator
 * @export
 */
export const ServersApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Add an option, such as Private Networks, to a specific server.
     * @summary Add server option
     * @param {AddOptionServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {string} optionId ID of the option to add.
     * @param {AddOptionServerRequest} addOptionServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addOptionServer: async (
      zone: AddOptionServerZoneEnum,
      serverId: string,
      optionId: string,
      addOptionServerRequest: AddOptionServerRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('addOptionServer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('addOptionServer', 'serverId', serverId);
      // verify required parameter 'optionId' is not null or undefined
      assertParamExists('addOptionServer', 'optionId', optionId);
      // verify required parameter 'addOptionServerRequest' is not null or undefined
      assertParamExists(
        'addOptionServer',
        'addOptionServerRequest',
        addOptionServerRequest,
      );
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/options/{option_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(`{${'option_id'}}`, encodeURIComponent(String(optionId)));
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
        addOptionServerRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Create a new Elastic Metal server. Once the server is created, proceed with the [installation of an OS](#post-3e949e).
     * @summary Create an Elastic Metal server
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
      const localVarPath = `/baremetal/v1/zones/{zone}/servers`.replace(
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
     * Delete an option from a specific server.
     * @summary Delete server option
     * @param {DeleteOptionServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {string} optionId ID of the option to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteOptionServer: async (
      zone: DeleteOptionServerZoneEnum,
      serverId: string,
      optionId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteOptionServer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('deleteOptionServer', 'serverId', serverId);
      // verify required parameter 'optionId' is not null or undefined
      assertParamExists('deleteOptionServer', 'optionId', optionId);
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/options/{option_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(`{${'option_id'}}`, encodeURIComponent(String(optionId)));
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
     * Delete the server associated with the ID.
     * @summary Delete an Elastic Metal server
     * @param {DeleteServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to delete.
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
      const localVarPath = `/baremetal/v1/zones/{zone}/servers/{server_id}`
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
     * Get full details of an existing Elastic Metal server associated with the ID.
     * @summary Get a specific Elastic Metal server
     * @param {GetServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
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
      const localVarPath = `/baremetal/v1/zones/{zone}/servers/{server_id}`
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
     * Get the ping status of the server associated with the ID.
     * @summary Return server metrics
     * @param {GetServerMetricsZoneEnum} zone The zone you want to target
     * @param {string} serverId Server ID to get the metrics.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServerMetrics: async (
      zone: GetServerMetricsZoneEnum,
      serverId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getServerMetrics', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('getServerMetrics', 'serverId', serverId);
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/metrics`
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
     * Install an Operating System (OS) on the Elastic Metal server with a specific ID.
     * @summary Install an Elastic Metal server
     * @param {InstallServerZoneEnum} zone The zone you want to target
     * @param {string} serverId Server ID to install.
     * @param {InstallServerRequest} installServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    installServer: async (
      zone: InstallServerZoneEnum,
      serverId: string,
      installServerRequest: InstallServerRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('installServer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('installServer', 'serverId', serverId);
      // verify required parameter 'installServerRequest' is not null or undefined
      assertParamExists(
        'installServer',
        'installServerRequest',
        installServerRequest,
      );
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/install`
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
        installServerRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * List event (i.e. start/stop/reboot) associated to the server ID.
     * @summary List server events
     * @param {ListServerEventsZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server events searched.
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of server events per page.
     * @param {ListServerEventsOrderByEnum} [orderBy] Order of the server events.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServerEvents: async (
      zone: ListServerEventsZoneEnum,
      serverId: string,
      page?: number,
      pageSize?: number,
      orderBy?: ListServerEventsOrderByEnum,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listServerEvents', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('listServerEvents', 'serverId', serverId);
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/events`
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

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (orderBy !== undefined) {
        localVarQueryParameter['order_by'] = orderBy;
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
     * List Elastic Metal servers for a specific Organization.
     * @summary List Elastic Metal servers for an Organization
     * @param {ListServersZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of servers per page.
     * @param {ListServersOrderByEnum} [orderBy] Order of the servers.
     * @param {Array<string>} [tags] Tags to filter for.
     * @param {Array<string>} [status] Status to filter for.
     * @param {string} [name] Names to filter for.
     * @param {string} [organizationId] Organization ID to filter for.
     * @param {string} [projectId] Project ID to filter for.
     * @param {string} [optionId] Option ID to filter for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServers: async (
      zone: ListServersZoneEnum,
      page?: number,
      pageSize?: number,
      orderBy?: ListServersOrderByEnum,
      tags?: Array<string>,
      status?: Array<string>,
      name?: string,
      organizationId?: string,
      projectId?: string,
      optionId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listServers', 'zone', zone);
      const localVarPath = `/baremetal/v1/zones/{zone}/servers`.replace(
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

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (orderBy !== undefined) {
        localVarQueryParameter['order_by'] = orderBy;
      }

      if (tags) {
        localVarQueryParameter['tags'] = tags;
      }

      if (status) {
        localVarQueryParameter['status'] = status;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (projectId !== undefined) {
        localVarQueryParameter['project_id'] = projectId;
      }

      if (optionId !== undefined) {
        localVarQueryParameter['option_id'] = optionId;
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
     * Migrate server with hourly offer to monthly offer.
     * @summary Migrate server offer
     * @param {MigrateServerToMonthlyOfferZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    migrateServerToMonthlyOffer: async (
      zone: MigrateServerToMonthlyOfferZoneEnum,
      serverId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('migrateServerToMonthlyOffer', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('migrateServerToMonthlyOffer', 'serverId', serverId);
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/migrate-offer-monthly`
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
     * Configure the IP address associated with the server ID and IP ID. You can use this method to set a reverse DNS for an IP address.
     * @summary Update IP
     * @param {UpdateIPZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {string} ipId ID of the IP to update.
     * @param {UpdateIPRequest} updateIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateIP: async (
      zone: UpdateIPZoneEnum,
      serverId: string,
      ipId: string,
      updateIPRequest: UpdateIPRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateIP', 'zone', zone);
      // verify required parameter 'serverId' is not null or undefined
      assertParamExists('updateIP', 'serverId', serverId);
      // verify required parameter 'ipId' is not null or undefined
      assertParamExists('updateIP', 'ipId', ipId);
      // verify required parameter 'updateIPRequest' is not null or undefined
      assertParamExists('updateIP', 'updateIPRequest', updateIPRequest);
      const localVarPath =
        `/baremetal/v1/zones/{zone}/servers/{server_id}/ips/{ip_id}`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'server_id'}}`, encodeURIComponent(String(serverId)))
          .replace(`{${'ip_id'}}`, encodeURIComponent(String(ipId)));
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
        updateIPRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the server associated with the ID. You can update parameters such as the server\'s name, tags, description and protection flag. Any parameters left null in the request body are not updated.
     * @summary Update an Elastic Metal server
     * @param {UpdateServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to update.
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
      const localVarPath = `/baremetal/v1/zones/{zone}/servers/{server_id}`
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
 * ServersApi - functional programming interface
 * @export
 */
export const ServersApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = ServersApiAxiosParamCreator(configuration);
  return {
    /**
     * Add an option, such as Private Networks, to a specific server.
     * @summary Add server option
     * @param {AddOptionServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {string} optionId ID of the option to add.
     * @param {AddOptionServerRequest} addOptionServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async addOptionServer(
      zone: AddOptionServerZoneEnum,
      serverId: string,
      optionId: string,
      addOptionServerRequest: AddOptionServerRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.addOptionServer(
        zone,
        serverId,
        optionId,
        addOptionServerRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.addOptionServer']?.[
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
     * Create a new Elastic Metal server. Once the server is created, proceed with the [installation of an OS](#post-3e949e).
     * @summary Create an Elastic Metal server
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
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createServer(
        zone,
        createServerRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.createServer']?.[
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
     * Delete an option from a specific server.
     * @summary Delete server option
     * @param {DeleteOptionServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {string} optionId ID of the option to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteOptionServer(
      zone: DeleteOptionServerZoneEnum,
      serverId: string,
      optionId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteOptionServer(
          zone,
          serverId,
          optionId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.deleteOptionServer']?.[
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
     * Delete the server associated with the ID.
     * @summary Delete an Elastic Metal server
     * @param {DeleteServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteServer(
      zone: DeleteServerZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteServer(
        zone,
        serverId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.deleteServer']?.[
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
     * Get full details of an existing Elastic Metal server associated with the ID.
     * @summary Get a specific Elastic Metal server
     * @param {GetServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
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
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getServer(
        zone,
        serverId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.getServer']?.[
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
     * Get the ping status of the server associated with the ID.
     * @summary Return server metrics
     * @param {GetServerMetricsZoneEnum} zone The zone you want to target
     * @param {string} serverId Server ID to get the metrics.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getServerMetrics(
      zone: GetServerMetricsZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1GetServerMetricsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getServerMetrics(
          zone,
          serverId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.getServerMetrics']?.[
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
     * Install an Operating System (OS) on the Elastic Metal server with a specific ID.
     * @summary Install an Elastic Metal server
     * @param {InstallServerZoneEnum} zone The zone you want to target
     * @param {string} serverId Server ID to install.
     * @param {InstallServerRequest} installServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async installServer(
      zone: InstallServerZoneEnum,
      serverId: string,
      installServerRequest: InstallServerRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.installServer(
        zone,
        serverId,
        installServerRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.installServer']?.[
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
     * List event (i.e. start/stop/reboot) associated to the server ID.
     * @summary List server events
     * @param {ListServerEventsZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server events searched.
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of server events per page.
     * @param {ListServerEventsOrderByEnum} [orderBy] Order of the server events.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listServerEvents(
      zone: ListServerEventsZoneEnum,
      serverId: string,
      page?: number,
      pageSize?: number,
      orderBy?: ListServerEventsOrderByEnum,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1ListServerEventsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listServerEvents(
          zone,
          serverId,
          page,
          pageSize,
          orderBy,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.listServerEvents']?.[
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
     * List Elastic Metal servers for a specific Organization.
     * @summary List Elastic Metal servers for an Organization
     * @param {ListServersZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of servers per page.
     * @param {ListServersOrderByEnum} [orderBy] Order of the servers.
     * @param {Array<string>} [tags] Tags to filter for.
     * @param {Array<string>} [status] Status to filter for.
     * @param {string} [name] Names to filter for.
     * @param {string} [organizationId] Organization ID to filter for.
     * @param {string} [projectId] Project ID to filter for.
     * @param {string} [optionId] Option ID to filter for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listServers(
      zone: ListServersZoneEnum,
      page?: number,
      pageSize?: number,
      orderBy?: ListServersOrderByEnum,
      tags?: Array<string>,
      status?: Array<string>,
      name?: string,
      organizationId?: string,
      projectId?: string,
      optionId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1ListServersResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listServers(
        zone,
        page,
        pageSize,
        orderBy,
        tags,
        status,
        name,
        organizationId,
        projectId,
        optionId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.listServers']?.[
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
     * Migrate server with hourly offer to monthly offer.
     * @summary Migrate server offer
     * @param {MigrateServerToMonthlyOfferZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async migrateServerToMonthlyOffer(
      zone: MigrateServerToMonthlyOfferZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.migrateServerToMonthlyOffer(
          zone,
          serverId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.migrateServerToMonthlyOffer']?.[
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
     * Configure the IP address associated with the server ID and IP ID. You can use this method to set a reverse DNS for an IP address.
     * @summary Update IP
     * @param {UpdateIPZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {string} ipId ID of the IP to update.
     * @param {UpdateIPRequest} updateIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateIP(
      zone: UpdateIPZoneEnum,
      serverId: string,
      ipId: string,
      updateIPRequest: UpdateIPRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayBaremetalV1IP>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateIP(
        zone,
        serverId,
        ipId,
        updateIPRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.updateIP']?.[
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
     * Update the server associated with the ID. You can update parameters such as the server\'s name, tags, description and protection flag. Any parameters left null in the request body are not updated.
     * @summary Update an Elastic Metal server
     * @param {UpdateServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to update.
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
      ) => AxiosPromise<ScalewayBaremetalV1Server>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateServer(
        zone,
        serverId,
        updateServerRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ServersApi.updateServer']?.[
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
 * ServersApi - factory interface
 * @export
 */
export const ServersApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = ServersApiFp(configuration);
  return {
    /**
     * Add an option, such as Private Networks, to a specific server.
     * @summary Add server option
     * @param {AddOptionServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {string} optionId ID of the option to add.
     * @param {AddOptionServerRequest} addOptionServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addOptionServer(
      zone: AddOptionServerZoneEnum,
      serverId: string,
      optionId: string,
      addOptionServerRequest: AddOptionServerRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .addOptionServer(
          zone,
          serverId,
          optionId,
          addOptionServerRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a new Elastic Metal server. Once the server is created, proceed with the [installation of an OS](#post-3e949e).
     * @summary Create an Elastic Metal server
     * @param {CreateServerZoneEnum} zone The zone you want to target
     * @param {CreateServerRequest} createServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createServer(
      zone: CreateServerZoneEnum,
      createServerRequest: CreateServerRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .createServer(zone, createServerRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete an option from a specific server.
     * @summary Delete server option
     * @param {DeleteOptionServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {string} optionId ID of the option to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteOptionServer(
      zone: DeleteOptionServerZoneEnum,
      serverId: string,
      optionId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .deleteOptionServer(zone, serverId, optionId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete the server associated with the ID.
     * @summary Delete an Elastic Metal server
     * @param {DeleteServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteServer(
      zone: DeleteServerZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .deleteServer(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get full details of an existing Elastic Metal server associated with the ID.
     * @summary Get a specific Elastic Metal server
     * @param {GetServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServer(
      zone: GetServerZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .getServer(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get the ping status of the server associated with the ID.
     * @summary Return server metrics
     * @param {GetServerMetricsZoneEnum} zone The zone you want to target
     * @param {string} serverId Server ID to get the metrics.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getServerMetrics(
      zone: GetServerMetricsZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1GetServerMetricsResponse> {
      return localVarFp
        .getServerMetrics(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Install an Operating System (OS) on the Elastic Metal server with a specific ID.
     * @summary Install an Elastic Metal server
     * @param {InstallServerZoneEnum} zone The zone you want to target
     * @param {string} serverId Server ID to install.
     * @param {InstallServerRequest} installServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    installServer(
      zone: InstallServerZoneEnum,
      serverId: string,
      installServerRequest: InstallServerRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .installServer(zone, serverId, installServerRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List event (i.e. start/stop/reboot) associated to the server ID.
     * @summary List server events
     * @param {ListServerEventsZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server events searched.
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of server events per page.
     * @param {ListServerEventsOrderByEnum} [orderBy] Order of the server events.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServerEvents(
      zone: ListServerEventsZoneEnum,
      serverId: string,
      page?: number,
      pageSize?: number,
      orderBy?: ListServerEventsOrderByEnum,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1ListServerEventsResponse> {
      return localVarFp
        .listServerEvents(zone, serverId, page, pageSize, orderBy, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List Elastic Metal servers for a specific Organization.
     * @summary List Elastic Metal servers for an Organization
     * @param {ListServersZoneEnum} zone The zone you want to target
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Number of servers per page.
     * @param {ListServersOrderByEnum} [orderBy] Order of the servers.
     * @param {Array<string>} [tags] Tags to filter for.
     * @param {Array<string>} [status] Status to filter for.
     * @param {string} [name] Names to filter for.
     * @param {string} [organizationId] Organization ID to filter for.
     * @param {string} [projectId] Project ID to filter for.
     * @param {string} [optionId] Option ID to filter for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listServers(
      zone: ListServersZoneEnum,
      page?: number,
      pageSize?: number,
      orderBy?: ListServersOrderByEnum,
      tags?: Array<string>,
      status?: Array<string>,
      name?: string,
      organizationId?: string,
      projectId?: string,
      optionId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1ListServersResponse> {
      return localVarFp
        .listServers(
          zone,
          page,
          pageSize,
          orderBy,
          tags,
          status,
          name,
          organizationId,
          projectId,
          optionId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Migrate server with hourly offer to monthly offer.
     * @summary Migrate server offer
     * @param {MigrateServerToMonthlyOfferZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    migrateServerToMonthlyOffer(
      zone: MigrateServerToMonthlyOfferZoneEnum,
      serverId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .migrateServerToMonthlyOffer(zone, serverId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Configure the IP address associated with the server ID and IP ID. You can use this method to set a reverse DNS for an IP address.
     * @summary Update IP
     * @param {UpdateIPZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server.
     * @param {string} ipId ID of the IP to update.
     * @param {UpdateIPRequest} updateIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateIP(
      zone: UpdateIPZoneEnum,
      serverId: string,
      ipId: string,
      updateIPRequest: UpdateIPRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1IP> {
      return localVarFp
        .updateIP(zone, serverId, ipId, updateIPRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the server associated with the ID. You can update parameters such as the server\'s name, tags, description and protection flag. Any parameters left null in the request body are not updated.
     * @summary Update an Elastic Metal server
     * @param {UpdateServerZoneEnum} zone The zone you want to target
     * @param {string} serverId ID of the server to update.
     * @param {UpdateServerRequest} updateServerRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateServer(
      zone: UpdateServerZoneEnum,
      serverId: string,
      updateServerRequest: UpdateServerRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayBaremetalV1Server> {
      return localVarFp
        .updateServer(zone, serverId, updateServerRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ServersApi - interface
 * @export
 * @interface ServersApi
 */
export interface ServersApiInterface {
  /**
   * Add an option, such as Private Networks, to a specific server.
   * @summary Add server option
   * @param {AddOptionServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {string} optionId ID of the option to add.
   * @param {AddOptionServerRequest} addOptionServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  addOptionServer(
    zone: AddOptionServerZoneEnum,
    serverId: string,
    optionId: string,
    addOptionServerRequest: AddOptionServerRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;

  /**
   * Create a new Elastic Metal server. Once the server is created, proceed with the [installation of an OS](#post-3e949e).
   * @summary Create an Elastic Metal server
   * @param {CreateServerZoneEnum} zone The zone you want to target
   * @param {CreateServerRequest} createServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  createServer(
    zone: CreateServerZoneEnum,
    createServerRequest: CreateServerRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;

  /**
   * Delete an option from a specific server.
   * @summary Delete server option
   * @param {DeleteOptionServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {string} optionId ID of the option to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  deleteOptionServer(
    zone: DeleteOptionServerZoneEnum,
    serverId: string,
    optionId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;

  /**
   * Delete the server associated with the ID.
   * @summary Delete an Elastic Metal server
   * @param {DeleteServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  deleteServer(
    zone: DeleteServerZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;

  /**
   * Get full details of an existing Elastic Metal server associated with the ID.
   * @summary Get a specific Elastic Metal server
   * @param {GetServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  getServer(
    zone: GetServerZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;

  /**
   * Get the ping status of the server associated with the ID.
   * @summary Return server metrics
   * @param {GetServerMetricsZoneEnum} zone The zone you want to target
   * @param {string} serverId Server ID to get the metrics.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  getServerMetrics(
    zone: GetServerMetricsZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1GetServerMetricsResponse>;

  /**
   * Install an Operating System (OS) on the Elastic Metal server with a specific ID.
   * @summary Install an Elastic Metal server
   * @param {InstallServerZoneEnum} zone The zone you want to target
   * @param {string} serverId Server ID to install.
   * @param {InstallServerRequest} installServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  installServer(
    zone: InstallServerZoneEnum,
    serverId: string,
    installServerRequest: InstallServerRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;

  /**
   * List event (i.e. start/stop/reboot) associated to the server ID.
   * @summary List server events
   * @param {ListServerEventsZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server events searched.
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of server events per page.
   * @param {ListServerEventsOrderByEnum} [orderBy] Order of the server events.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  listServerEvents(
    zone: ListServerEventsZoneEnum,
    serverId: string,
    page?: number,
    pageSize?: number,
    orderBy?: ListServerEventsOrderByEnum,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1ListServerEventsResponse>;

  /**
   * List Elastic Metal servers for a specific Organization.
   * @summary List Elastic Metal servers for an Organization
   * @param {ListServersZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of servers per page.
   * @param {ListServersOrderByEnum} [orderBy] Order of the servers.
   * @param {Array<string>} [tags] Tags to filter for.
   * @param {Array<string>} [status] Status to filter for.
   * @param {string} [name] Names to filter for.
   * @param {string} [organizationId] Organization ID to filter for.
   * @param {string} [projectId] Project ID to filter for.
   * @param {string} [optionId] Option ID to filter for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  listServers(
    zone: ListServersZoneEnum,
    page?: number,
    pageSize?: number,
    orderBy?: ListServersOrderByEnum,
    tags?: Array<string>,
    status?: Array<string>,
    name?: string,
    organizationId?: string,
    projectId?: string,
    optionId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1ListServersResponse>;

  /**
   * Migrate server with hourly offer to monthly offer.
   * @summary Migrate server offer
   * @param {MigrateServerToMonthlyOfferZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  migrateServerToMonthlyOffer(
    zone: MigrateServerToMonthlyOfferZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;

  /**
   * Configure the IP address associated with the server ID and IP ID. You can use this method to set a reverse DNS for an IP address.
   * @summary Update IP
   * @param {UpdateIPZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {string} ipId ID of the IP to update.
   * @param {UpdateIPRequest} updateIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  updateIP(
    zone: UpdateIPZoneEnum,
    serverId: string,
    ipId: string,
    updateIPRequest: UpdateIPRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1IP>;

  /**
   * Update the server associated with the ID. You can update parameters such as the server\'s name, tags, description and protection flag. Any parameters left null in the request body are not updated.
   * @summary Update an Elastic Metal server
   * @param {UpdateServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to update.
   * @param {UpdateServerRequest} updateServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApiInterface
   */
  updateServer(
    zone: UpdateServerZoneEnum,
    serverId: string,
    updateServerRequest: UpdateServerRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayBaremetalV1Server>;
}

/**
 * ServersApi - object-oriented interface
 * @export
 * @class ServersApi
 * @extends {BaseAPI}
 */
export class ServersApi extends BaseAPI implements ServersApiInterface {
  /**
   * Add an option, such as Private Networks, to a specific server.
   * @summary Add server option
   * @param {AddOptionServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {string} optionId ID of the option to add.
   * @param {AddOptionServerRequest} addOptionServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public addOptionServer(
    zone: AddOptionServerZoneEnum,
    serverId: string,
    optionId: string,
    addOptionServerRequest: AddOptionServerRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .addOptionServer(
        zone,
        serverId,
        optionId,
        addOptionServerRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a new Elastic Metal server. Once the server is created, proceed with the [installation of an OS](#post-3e949e).
   * @summary Create an Elastic Metal server
   * @param {CreateServerZoneEnum} zone The zone you want to target
   * @param {CreateServerRequest} createServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public createServer(
    zone: CreateServerZoneEnum,
    createServerRequest: CreateServerRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .createServer(zone, createServerRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete an option from a specific server.
   * @summary Delete server option
   * @param {DeleteOptionServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {string} optionId ID of the option to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public deleteOptionServer(
    zone: DeleteOptionServerZoneEnum,
    serverId: string,
    optionId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .deleteOptionServer(zone, serverId, optionId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete the server associated with the ID.
   * @summary Delete an Elastic Metal server
   * @param {DeleteServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public deleteServer(
    zone: DeleteServerZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .deleteServer(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get full details of an existing Elastic Metal server associated with the ID.
   * @summary Get a specific Elastic Metal server
   * @param {GetServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public getServer(
    zone: GetServerZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .getServer(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get the ping status of the server associated with the ID.
   * @summary Return server metrics
   * @param {GetServerMetricsZoneEnum} zone The zone you want to target
   * @param {string} serverId Server ID to get the metrics.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public getServerMetrics(
    zone: GetServerMetricsZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .getServerMetrics(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Install an Operating System (OS) on the Elastic Metal server with a specific ID.
   * @summary Install an Elastic Metal server
   * @param {InstallServerZoneEnum} zone The zone you want to target
   * @param {string} serverId Server ID to install.
   * @param {InstallServerRequest} installServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public installServer(
    zone: InstallServerZoneEnum,
    serverId: string,
    installServerRequest: InstallServerRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .installServer(zone, serverId, installServerRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List event (i.e. start/stop/reboot) associated to the server ID.
   * @summary List server events
   * @param {ListServerEventsZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server events searched.
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of server events per page.
   * @param {ListServerEventsOrderByEnum} [orderBy] Order of the server events.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public listServerEvents(
    zone: ListServerEventsZoneEnum,
    serverId: string,
    page?: number,
    pageSize?: number,
    orderBy?: ListServerEventsOrderByEnum,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .listServerEvents(zone, serverId, page, pageSize, orderBy, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List Elastic Metal servers for a specific Organization.
   * @summary List Elastic Metal servers for an Organization
   * @param {ListServersZoneEnum} zone The zone you want to target
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Number of servers per page.
   * @param {ListServersOrderByEnum} [orderBy] Order of the servers.
   * @param {Array<string>} [tags] Tags to filter for.
   * @param {Array<string>} [status] Status to filter for.
   * @param {string} [name] Names to filter for.
   * @param {string} [organizationId] Organization ID to filter for.
   * @param {string} [projectId] Project ID to filter for.
   * @param {string} [optionId] Option ID to filter for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public listServers(
    zone: ListServersZoneEnum,
    page?: number,
    pageSize?: number,
    orderBy?: ListServersOrderByEnum,
    tags?: Array<string>,
    status?: Array<string>,
    name?: string,
    organizationId?: string,
    projectId?: string,
    optionId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .listServers(
        zone,
        page,
        pageSize,
        orderBy,
        tags,
        status,
        name,
        organizationId,
        projectId,
        optionId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Migrate server with hourly offer to monthly offer.
   * @summary Migrate server offer
   * @param {MigrateServerToMonthlyOfferZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public migrateServerToMonthlyOffer(
    zone: MigrateServerToMonthlyOfferZoneEnum,
    serverId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .migrateServerToMonthlyOffer(zone, serverId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Configure the IP address associated with the server ID and IP ID. You can use this method to set a reverse DNS for an IP address.
   * @summary Update IP
   * @param {UpdateIPZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server.
   * @param {string} ipId ID of the IP to update.
   * @param {UpdateIPRequest} updateIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public updateIP(
    zone: UpdateIPZoneEnum,
    serverId: string,
    ipId: string,
    updateIPRequest: UpdateIPRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .updateIP(zone, serverId, ipId, updateIPRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the server associated with the ID. You can update parameters such as the server\'s name, tags, description and protection flag. Any parameters left null in the request body are not updated.
   * @summary Update an Elastic Metal server
   * @param {UpdateServerZoneEnum} zone The zone you want to target
   * @param {string} serverId ID of the server to update.
   * @param {UpdateServerRequest} updateServerRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ServersApi
   */
  public updateServer(
    zone: UpdateServerZoneEnum,
    serverId: string,
    updateServerRequest: UpdateServerRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ServersApiFp(this.configuration)
      .updateServer(zone, serverId, updateServerRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const AddOptionServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type AddOptionServerZoneEnum =
  (typeof AddOptionServerZoneEnum)[keyof typeof AddOptionServerZoneEnum];
/**
 * @export
 */
export const CreateServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type CreateServerZoneEnum =
  (typeof CreateServerZoneEnum)[keyof typeof CreateServerZoneEnum];
/**
 * @export
 */
export const DeleteOptionServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type DeleteOptionServerZoneEnum =
  (typeof DeleteOptionServerZoneEnum)[keyof typeof DeleteOptionServerZoneEnum];
/**
 * @export
 */
export const DeleteServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type DeleteServerZoneEnum =
  (typeof DeleteServerZoneEnum)[keyof typeof DeleteServerZoneEnum];
/**
 * @export
 */
export const GetServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type GetServerZoneEnum =
  (typeof GetServerZoneEnum)[keyof typeof GetServerZoneEnum];
/**
 * @export
 */
export const GetServerMetricsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type GetServerMetricsZoneEnum =
  (typeof GetServerMetricsZoneEnum)[keyof typeof GetServerMetricsZoneEnum];
/**
 * @export
 */
export const InstallServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type InstallServerZoneEnum =
  (typeof InstallServerZoneEnum)[keyof typeof InstallServerZoneEnum];
/**
 * @export
 */
export const ListServerEventsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type ListServerEventsZoneEnum =
  (typeof ListServerEventsZoneEnum)[keyof typeof ListServerEventsZoneEnum];
/**
 * @export
 */
export const ListServerEventsOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
} as const;
export type ListServerEventsOrderByEnum =
  (typeof ListServerEventsOrderByEnum)[keyof typeof ListServerEventsOrderByEnum];
/**
 * @export
 */
export const ListServersZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type ListServersZoneEnum =
  (typeof ListServersZoneEnum)[keyof typeof ListServersZoneEnum];
/**
 * @export
 */
export const ListServersOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
} as const;
export type ListServersOrderByEnum =
  (typeof ListServersOrderByEnum)[keyof typeof ListServersOrderByEnum];
/**
 * @export
 */
export const MigrateServerToMonthlyOfferZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type MigrateServerToMonthlyOfferZoneEnum =
  (typeof MigrateServerToMonthlyOfferZoneEnum)[keyof typeof MigrateServerToMonthlyOfferZoneEnum];
/**
 * @export
 */
export const UpdateIPZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type UpdateIPZoneEnum =
  (typeof UpdateIPZoneEnum)[keyof typeof UpdateIPZoneEnum];
/**
 * @export
 */
export const UpdateServerZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type UpdateServerZoneEnum =
  (typeof UpdateServerZoneEnum)[keyof typeof UpdateServerZoneEnum];
