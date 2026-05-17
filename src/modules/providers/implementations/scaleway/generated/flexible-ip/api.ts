/* tslint:disable */
/* eslint-disable */
/**
 * Elastic Metal - Flexible IP API
 * Flexible IP addresses are additional public IP addresses that you can hold independently of any Elastic Metal server. They can either be IPv4 (single IP) or IPv6 (/64 IP block).  Flexible IPs can be attached to and detached from any Elastic Metal server within the same zone. You can hold multiple flexible IPs in your account, and a given server can be linked to multiple flexible IPs. When you delete a flexible IP address, it is disassociated from your account.  Flexible IPs can also be used to implement failovers. If any failure or maintenance issue occurs on a given Elastic Metal server, its flexible IP address can be transferred to another server.  (switchcolumn) <Message type=\"important\">   This documentation refers to flexible IPs for Elastic Metal servers. Refer to the corresponding product documentation if you are looking for information about flexible IPs for other products. </Message> (switchcolumn)  ## Concepts  Refer to our [dedicated concepts page](https://www.scaleway.com/en/docs/elastic-metal/concepts/) to find definitions of the different terms referring to Elastic Metal and flexible IPs.  ## Quickstart  (switchcolumn) (switchcolumn)  1. **Configure your environment variables.**     ```bash     export SCW_ACCESS_KEY=\"<API access key>\"     export SCW_SECRET_KEY=\"<API secret key>\"     export SCW_DEFAULT_ZONE=\"<Scaleway default zone>\"     ```     <Message type=\"note\">     This is an optional step that seeks to simplify your usage of the APIs. Refer to the Availability Zones section to verify which zones are available for use.     </Message>  2. **Edit the POST request payload** that we will use in the next step to create a flexible IP.     ```     {     \"project_id\": \"88f30nda-6768-9293-a89c-2b0b178628a6\",     \"description\": \"This is the description of my fIP\",     \"tags\": [         \"tag1\"     ],     \"server_id\": \"9dddd3sa-f13c-4351-9185-18f6b6d97t9w\",     \"reverse\": \"9dddd3se-f14c-4859-9185-18f6b6d78f8b.fr-par-1.baremetal.scw.cloud\",     \"is_ipv6\": true     }     ```      | Parameter      | Description                                                        |     |----------------|--------------------------------------------------------------------|     | `project_id`   | **REQUIRED** ID of the Project to create your flexible IP in.      |     | `description`  | A description for your flexible IP (max. 255 characters).          |     | `tags`         | One or several tags for your flexible IP (optional)                |     | `server_id`    | ID of the server on which to attach your newly created flexible IP.|     | `reverse`      | Value of the server\'s reverse DNS.                                 |     | `is_ipv6`      | **BOOLEAN** Defines whether the flexible IP has an IPv6 address.   |      <Message type=\"note\">     Except when specified, all values are nullable.     </Message>  3. **Create a flexible IP**: run the following command to create a flexible IP, including the payload you edited in the previous step.     ```bash     curl -X POST \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -H \"Content-Type: application/json\" \\       \"https://api.scaleway.com/flexible-ip/v1alpha1/zones/$SCW_DEFAULT_ZONE/fips\" \\       -d \'{           \"project_id\": \"88f30nda-6768-9293-a89c-2b0b178628a6\",           \"description\": \"This is the description of my fIP\",           \"tags\": [               \"tag1\"           ],           \"server_id\": \"9dddd3sa-f13c-4351-9185-18f6b6d97t9w\",           \"reverse\": \"9dddd3se-f14c-4859-9185-18f6b6d78f8b.fr-par-1.baremetal.scw.cloud\",           \"is_ipv6\": true           }\'     ```      You should get an output similar to the following one, providing details about your flexible IP:      <Message type=\"note\">     This is a response example, the UUIDs and IP address displayed are not real.     </Message>      ```bash     {         \"id\": \"058d9f12-c33d-523d-b216-da4c9d0f3d66\",         \"organization_id\": \"88f30nda-6768-9293-a89c-2b0b178628a6\",         \"project_id\": \"88f30nda-6768-9293-a89c-2b0b178628a6\",         \"description\": \"This is the description of my fIP\",         \"updated_at\": \"2023-04-04T13:34:19.058178830Z\",         \"created_at\": \"2023-01-31T16:30:54.017824Z\",         \"status\": \"updating\",         \"tags\": [             \"tag1\"         ],         \"ip_address\": \"1998:cb9:813:24f3::/75\",         \"server_id\": null,         \"reverse\": \"9dddd3se-f14c-4859-9185-18f6b6d78f8b.fr-par-1.baremetal.scw.cloud\",         \"mac_address\": null,         \"zone\": \"fr-par-1\"     }     ```  4. **Get a list of your flexible IPs**: run the following command to get a list of all the flexible IPs in your account, with their details:     ```bash     curl -X GET \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -H \"Content-Type: application/json\" \\       \"https://api.scaleway.com/flexible-ip/v1alpha1/zones/$SCW_DEFAULT_ZONE/fips\"     ```  5. **Generate a virtual MAC (Media Access Control) address**: run the following command to generate a virtual MAC address on a given flexible IP. Ensure that you replace `<FLEXIBLE-IP-ID>` in the URL with the ID of the flexible IP you want to create a virtual MAC address for.     ```bash     curl -X POST \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -H \"Content-Type: application/json\" \\       \"https://api.scaleway.com/flexible-ip/v1alpha1/zones/$SCW_DEFAULT_ZONE/fips/<FLEXIBLE-IP-ID>/mac\" \\       -d \'{         \"mac_type\": \"<MAC_TYPE>\"       }\'     ```      **Payload value**      * **mac_type** (string): Choose the type of virtual MAC address you want to generate on your flexible IP: `vmware`, `xen` or `kvm` (with the default value being set to `unknown_type`). To get more information about the available virtual MAC addresses, refer to the \"Technical information\" part of this quickstart.  6. **Duplicate a virtual MAC (Media Access Control) address**: run the following command to duplicate a Virtual MAC from a given flexible IP onto another flexible IP attached to the same server.     ```bash     curl -X POST \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -H \"Content-Type: application/json\" \\       \"https://api.scaleway.com/flexible-ip/v1alpha1/zones/$SCW_DEFAULT_ZONE/fips/<fip_id> \\       -d \'{         \"duplicate_from_fip_id\": \"<ID_OF_THE_FIP_TO_DUPLICATE_MAC_FROM>\"       }\'     ```     **Payload values**      * **fip_id** (string): ID of the flexible IP on which to duplicate the Virtual MAC. Note that flexible IPs need to be attached to the same server for the operation to work.     * **duplicate_from_fip_id** (string): ID of the flexible IP to duplicate the Virtual MAC from.  (switchcolumn) <Message type=\"requirement\"> To perform the following steps, you must first ensure that: - You have a [Scaleway account](https://console.scaleway.com/) - You have [created an API key](https://www.scaleway.com/en/docs/iam/how-to/create-api-keys/) and that the API key has [sufficient IAM permissions](https://www.scaleway.com/en/docs/iam/reference-content/permission-sets/) to perform the actions described on this page - You have [installed `curl`](https://curl.se/download.html) </Message> (switchcolumn)  ## Technical information  A virtual MAC (Media Access Control) address can be generated on a flexible IP. Virtual MAC addresses are unique identifiers assigned to a virtual machine\'s network interface. This is particularly useful for virtualization technologies enabling multiple virtual machines to run on a single host machine (now called a hypervisor).  Flexible IPs can have virtual MAC addresses assigned to them, and it is possible to duplicate these virtual MAC addresses between flexible IPs on the same server. When a virtual MAC address is duplicated onto another flexible IP, the two become part of the same virtual MAC group.  When flexible IPs belong to a given MAC group, they cannot be moved separately to another server. Both must be transferred to the new server, as a group. Subsequently, a MAC group can be moved by providing a list of flexible IP IDs in Attach/Detach requests.  Note that if you detach a single flexible IP from a MAC group, the virtual MAC address will be removed from the detached flexible IP.  ### Availability Zones  Flexible IPs are available in the following Availability Zones:  | Name      | API ID                           | |-----------|--------------------------------- | | Paris     | `fr-par-1` `fr-par-2`            | | Amsterdam | `nl-ams-1` `nl-ams-2`            | | Warsaw    | `pl-waw-2` `pl-waw-3`            |  ## Technical limitations  - Flexible IPs exist for many resources (Instances, Load Balancers, etc). Note, however, that each of these sets of flexible IPs is independent and usable only with that product. This API concerns flexible IPs for Elastic Metal servers only. - There is a limit of 64 flexible IPs per server ## Going further  For more help using flexible IPs, check out the following resources: - Our [main documentation](https://www.scaleway.com/en/docs/elastic-metal/) - Our [Slack Community](https://www.scaleway.com/en/docs/tutorials/scaleway-slack-community/) - Our [support ticketing system](https://www.scaleway.com/en/docs/account/how-to/open-a-support-ticket/).
 *
 * The version of the OpenAPI document: v1alpha1
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
 * @interface AttachFlexibleIPRequest
 */
export interface AttachFlexibleIPRequest {
  /**
   * List of flexible IP IDs to attach to a server. Multiple IDs can be provided, but note that flexible IPs must belong to the same MAC group (see details about MAC groups).
   * @type {Array<string>}
   * @memberof AttachFlexibleIPRequest
   */
  fips_ids: Array<string>;
  /**
   * ID of the server on which to attach the flexible IPs.
   * @type {string}
   * @memberof AttachFlexibleIPRequest
   */
  server_id: string;
}
/**
 *
 * @export
 * @interface CreateFlexibleIPRequest
 */
export interface CreateFlexibleIPRequest {
  /**
   * ID of the project to associate with the Flexible IP.
   * @type {string}
   * @memberof CreateFlexibleIPRequest
   */
  project_id: string;
  /**
   * Flexible IP description (max. of 255 characters).
   * @type {string}
   * @memberof CreateFlexibleIPRequest
   */
  description?: string;
  /**
   * Tags to associate to the flexible IP.
   * @type {Array<string>}
   * @memberof CreateFlexibleIPRequest
   */
  tags?: Array<string>;
  /**
   * ID of the server to which the newly created flexible IP will be attached.
   * @type {string}
   * @memberof CreateFlexibleIPRequest
   */
  server_id?: string;
  /**
   * Value of the reverse DNS.
   * @type {string}
   * @memberof CreateFlexibleIPRequest
   */
  reverse?: string;
  /**
   * Defines whether the flexible IP has an IPv6 address.
   * @type {boolean}
   * @memberof CreateFlexibleIPRequest
   */
  is_ipv6?: boolean;
}
/**
 *
 * @export
 * @interface DetachFlexibleIPRequest
 */
export interface DetachFlexibleIPRequest {
  /**
   * List of flexible IP IDs to detach from a server. Multiple IDs can be provided. Note that flexible IPs must belong to the same MAC group.
   * @type {Array<string>}
   * @memberof DetachFlexibleIPRequest
   */
  fips_ids: Array<string>;
}
/**
 *
 * @export
 * @interface DuplicateMACAddrRequest
 */
export interface DuplicateMACAddrRequest {
  /**
   * ID of the flexible IP to duplicate the Virtual MAC from. Note that flexible IPs need to be attached to the same server.
   * @type {string}
   * @memberof DuplicateMACAddrRequest
   */
  duplicate_from_fip_id: string;
}
/**
 *
 * @export
 * @interface GenerateMACAddrRequest
 */
export interface GenerateMACAddrRequest {
  /**
   * TODO.
   * @type {string}
   * @memberof GenerateMACAddrRequest
   */
  mac_type: GenerateMACAddrRequestMacTypeEnum;
}

export const GenerateMACAddrRequestMacTypeEnum = {
  UnknownType: 'unknown_type',
  Vmware: 'vmware',
  Xen: 'xen',
  Kvm: 'kvm',
} as const;

export type GenerateMACAddrRequestMacTypeEnum =
  (typeof GenerateMACAddrRequestMacTypeEnum)[keyof typeof GenerateMACAddrRequestMacTypeEnum];

/**
 *
 * @export
 * @interface MoveMACAddrRequest
 */
export interface MoveMACAddrRequest {
  /**
   *
   * @type {string}
   * @memberof MoveMACAddrRequest
   */
  dst_fip_id?: string;
}
/**
 *
 * @export
 * @interface ScalewayFlexibleIpV1alpha1AttachFlexibleIPsResponse
 */
export interface ScalewayFlexibleIpV1alpha1AttachFlexibleIPsResponse {
  /**
   * Total count of flexible IPs that are being updated.
   * @type {number}
   * @memberof ScalewayFlexibleIpV1alpha1AttachFlexibleIPsResponse
   */
  total_count?: number;
  /**
   * List of flexible IPs in an updating state.
   * @type {Array<ScalewayFlexibleIpV1alpha1FlexibleIP>}
   * @memberof ScalewayFlexibleIpV1alpha1AttachFlexibleIPsResponse
   */
  flexible_ips?: Array<ScalewayFlexibleIpV1alpha1FlexibleIP>;
}
/**
 *
 * @export
 * @interface ScalewayFlexibleIpV1alpha1DetachFlexibleIPsResponse
 */
export interface ScalewayFlexibleIpV1alpha1DetachFlexibleIPsResponse {
  /**
   * Total count of flexible IPs that are being detached.
   * @type {number}
   * @memberof ScalewayFlexibleIpV1alpha1DetachFlexibleIPsResponse
   */
  total_count?: number;
  /**
   * List of flexible IPs in a detaching state.
   * @type {Array<ScalewayFlexibleIpV1alpha1FlexibleIP>}
   * @memberof ScalewayFlexibleIpV1alpha1DetachFlexibleIPsResponse
   */
  flexible_ips?: Array<ScalewayFlexibleIpV1alpha1FlexibleIP>;
}
/**
 *
 * @export
 * @interface ScalewayFlexibleIpV1alpha1FlexibleIP
 */
export interface ScalewayFlexibleIpV1alpha1FlexibleIP {
  /**
   * ID of the flexible IP.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  id?: string;
  /**
   * ID of the Organization the flexible IP is attached to.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  organization_id?: string;
  /**
   * ID of the Project the flexible IP is attached to.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  project_id?: string;
  /**
   * Flexible IP description.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  description?: string;
  /**
   * Flexible IP tags.
   * @type {Array<string>}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  tags?: Array<string>;
  /**
   * Date on which the flexible IP was last updated. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  updated_at?: string;
  /**
   * Date on which the flexible IP was created. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  created_at?: string;
  /**
   * Flexible IP status. - ready : flexible IP is created and ready to be attached to a server or to be associated with a virtual MAC. - updating: flexible IP is being attached to a server or a virtual MAC operation is ongoing - attached: flexible IP is attached to a server - error: a flexible IP operation resulted in an error - detaching: flexible IP is being detached from a server - locked: the resource of the flexible IP is locked.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  status?: ScalewayFlexibleIpV1alpha1FlexibleIPStatusEnum;
  /**
   * IP of the flexible IP. (IP network)
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  ip_address?: string;
  /**
   *
   * @type {ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  mac_address?: ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress;
  /**
   * ID of the server linked to the flexible IP.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  server_id?: string;
  /**
   * Reverse DNS value.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  reverse?: string;
  /**
   * Availability Zone of the flexible IP.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIP
   */
  zone?: string;
}

export const ScalewayFlexibleIpV1alpha1FlexibleIPStatusEnum = {
  Unknown: 'unknown',
  Ready: 'ready',
  Updating: 'updating',
  Attached: 'attached',
  Error: 'error',
  Detaching: 'detaching',
  Locked: 'locked',
} as const;

export type ScalewayFlexibleIpV1alpha1FlexibleIPStatusEnum =
  (typeof ScalewayFlexibleIpV1alpha1FlexibleIPStatusEnum)[keyof typeof ScalewayFlexibleIpV1alpha1FlexibleIPStatusEnum];

/**
 * MAC address of the flexible IP.
 * @export
 * @interface ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress
 */
export interface ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress {
  /**
   * ID of the flexible IP.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress
   */
  id?: string;
  /**
   * MAC address of the Virtual MAC.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress
   */
  mac_address?: string;
  /**
   * Type of virtual MAC.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress
   */
  mac_type?: ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressMacTypeEnum;
  /**
   * Status of virtual MAC.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress
   */
  status?: ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressStatusEnum;
  /**
   * Date on which the virtual MAC was last updated. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress
   */
  updated_at?: string;
  /**
   * Date on which the virtual MAC was created. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress
   */
  created_at?: string;
  /**
   * MAC address IP Availability Zone.
   * @type {string}
   * @memberof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddress
   */
  zone?: string;
}

export const ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressMacTypeEnum = {
  UnknownType: 'unknown_type',
  Vmware: 'vmware',
  Xen: 'xen',
  Kvm: 'kvm',
} as const;

export type ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressMacTypeEnum =
  (typeof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressMacTypeEnum)[keyof typeof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressMacTypeEnum];
export const ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressStatusEnum = {
  Unknown: 'unknown',
  Ready: 'ready',
  Updating: 'updating',
  Used: 'used',
  Error: 'error',
  Deleting: 'deleting',
} as const;

export type ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressStatusEnum =
  (typeof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressStatusEnum)[keyof typeof ScalewayFlexibleIpV1alpha1FlexibleIPMacAddressStatusEnum];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayFlexibleIpV1alpha1FlexibleIPStatus = {
  Unknown: 'unknown',
  Ready: 'ready',
  Updating: 'updating',
  Attached: 'attached',
  Error: 'error',
  Detaching: 'detaching',
  Locked: 'locked',
} as const;

export type ScalewayFlexibleIpV1alpha1FlexibleIPStatus =
  (typeof ScalewayFlexibleIpV1alpha1FlexibleIPStatus)[keyof typeof ScalewayFlexibleIpV1alpha1FlexibleIPStatus];

/**
 *
 * @export
 * @interface ScalewayFlexibleIpV1alpha1ListFlexibleIPsResponse
 */
export interface ScalewayFlexibleIpV1alpha1ListFlexibleIPsResponse {
  /**
   * Total count of matching flexible IPs.
   * @type {number}
   * @memberof ScalewayFlexibleIpV1alpha1ListFlexibleIPsResponse
   */
  total_count?: number;
  /**
   * List of all flexible IPs.
   * @type {Array<ScalewayFlexibleIpV1alpha1FlexibleIP>}
   * @memberof ScalewayFlexibleIpV1alpha1ListFlexibleIPsResponse
   */
  flexible_ips?: Array<ScalewayFlexibleIpV1alpha1FlexibleIP>;
}
/**
 *
 * @export
 * @interface UpdateFlexibleIPRequest
 */
export interface UpdateFlexibleIPRequest {
  /**
   * Flexible IP description (max. 255 characters).
   * @type {string}
   * @memberof UpdateFlexibleIPRequest
   */
  description?: string;
  /**
   * Tags associated with the flexible IP.
   * @type {Array<string>}
   * @memberof UpdateFlexibleIPRequest
   */
  tags?: Array<string>;
  /**
   * Value of the reverse DNS.
   * @type {string}
   * @memberof UpdateFlexibleIPRequest
   */
  reverse?: string;
}

/**
 * FlexibleIPApi - axios parameter creator
 * @export
 */
export const FlexibleIPApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Attach an existing flexible IP to a specified Elastic Metal server.
     * @summary Attach an existing flexible IP to a server
     * @param {AttachFlexibleIPZoneEnum} zone The zone you want to target
     * @param {AttachFlexibleIPRequest} attachFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachFlexibleIP: async (
      zone: AttachFlexibleIPZoneEnum,
      attachFlexibleIPRequest: AttachFlexibleIPRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('attachFlexibleIP', 'zone', zone);
      // verify required parameter 'attachFlexibleIPRequest' is not null or undefined
      assertParamExists(
        'attachFlexibleIP',
        'attachFlexibleIPRequest',
        attachFlexibleIPRequest,
      );
      const localVarPath =
        `/flexible-ip/v1alpha1/zones/{zone}/fips/attach`.replace(
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
        attachFlexibleIPRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Generate a new flexible IP within a given zone, specifying its configuration including Project ID and description.
     * @summary Create a new flexible IP
     * @param {CreateFlexibleIPZoneEnum} zone The zone you want to target
     * @param {CreateFlexibleIPRequest} createFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createFlexibleIP: async (
      zone: CreateFlexibleIPZoneEnum,
      createFlexibleIPRequest: CreateFlexibleIPRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('createFlexibleIP', 'zone', zone);
      // verify required parameter 'createFlexibleIPRequest' is not null or undefined
      assertParamExists(
        'createFlexibleIP',
        'createFlexibleIPRequest',
        createFlexibleIPRequest,
      );
      const localVarPath = `/flexible-ip/v1alpha1/zones/{zone}/fips`.replace(
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
        createFlexibleIPRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete an existing flexible IP, specified by its ID and zone. Note that deleting a flexible IP is permanent and cannot be undone.
     * @summary Delete an existing flexible IP
     * @param {DeleteFlexibleIPZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteFlexibleIP: async (
      zone: DeleteFlexibleIPZoneEnum,
      fipId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteFlexibleIP', 'zone', zone);
      // verify required parameter 'fipId' is not null or undefined
      assertParamExists('deleteFlexibleIP', 'fipId', fipId);
      const localVarPath = `/flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'fip_id'}}`, encodeURIComponent(String(fipId)));
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
     * Detach a given MAC (Media Access Control) address from an existing flexible IP.
     * @summary Detach a given virtual MAC address from an existing flexible IP
     * @param {DeleteMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP from which to delete the virtual MAC. If the flexible IP belongs to a MAC group, the MAC will be removed from both the MAC group and flexible IP.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteMACAddr: async (
      zone: DeleteMACAddrZoneEnum,
      fipId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('deleteMACAddr', 'zone', zone);
      // verify required parameter 'fipId' is not null or undefined
      assertParamExists('deleteMACAddr', 'fipId', fipId);
      const localVarPath =
        `/flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}/mac`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'fip_id'}}`, encodeURIComponent(String(fipId)));
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
     * Detach an existing flexible IP from a specified Elastic Metal server.
     * @summary Detach an existing flexible IP from a server
     * @param {DetachFlexibleIPZoneEnum} zone The zone you want to target
     * @param {DetachFlexibleIPRequest} detachFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    detachFlexibleIP: async (
      zone: DetachFlexibleIPZoneEnum,
      detachFlexibleIPRequest: DetachFlexibleIPRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('detachFlexibleIP', 'zone', zone);
      // verify required parameter 'detachFlexibleIPRequest' is not null or undefined
      assertParamExists(
        'detachFlexibleIP',
        'detachFlexibleIPRequest',
        detachFlexibleIPRequest,
      );
      const localVarPath =
        `/flexible-ip/v1alpha1/zones/{zone}/fips/detach`.replace(
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
        detachFlexibleIPRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Duplicate a virtual MAC address from a given flexible IP to another flexible IP attached to the same server.
     * @summary Duplicate a virtual MAC address to another flexible IP
     * @param {DuplicateMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP on which to duplicate the virtual MAC. Note that the flexible IPs need to be attached to the same server.
     * @param {DuplicateMACAddrRequest} duplicateMACAddrRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    duplicateMACAddr: async (
      zone: DuplicateMACAddrZoneEnum,
      fipId: string,
      duplicateMACAddrRequest: DuplicateMACAddrRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('duplicateMACAddr', 'zone', zone);
      // verify required parameter 'fipId' is not null or undefined
      assertParamExists('duplicateMACAddr', 'fipId', fipId);
      // verify required parameter 'duplicateMACAddrRequest' is not null or undefined
      assertParamExists(
        'duplicateMACAddr',
        'duplicateMACAddrRequest',
        duplicateMACAddrRequest,
      );
      const localVarPath =
        `/flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}/mac/duplicate`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'fip_id'}}`, encodeURIComponent(String(fipId)));
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
        duplicateMACAddrRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Generate a virtual MAC (Media Access Control) address on an existing flexible IP.
     * @summary Generate a virtual MAC address on an existing flexible IP
     * @param {GenerateMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP for which to generate a virtual MAC.
     * @param {GenerateMACAddrRequest} generateMACAddrRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    generateMACAddr: async (
      zone: GenerateMACAddrZoneEnum,
      fipId: string,
      generateMACAddrRequest: GenerateMACAddrRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('generateMACAddr', 'zone', zone);
      // verify required parameter 'fipId' is not null or undefined
      assertParamExists('generateMACAddr', 'fipId', fipId);
      // verify required parameter 'generateMACAddrRequest' is not null or undefined
      assertParamExists(
        'generateMACAddr',
        'generateMACAddrRequest',
        generateMACAddrRequest,
      );
      const localVarPath =
        `/flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}/mac`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'fip_id'}}`, encodeURIComponent(String(fipId)));
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
        generateMACAddrRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Retrieve information about an existing flexible IP, specified by its ID and zone. Its full details, including Project ID, description and status, are returned in the response object.
     * @summary Get an existing flexible IP
     * @param {GetFlexibleIPZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getFlexibleIP: async (
      zone: GetFlexibleIPZoneEnum,
      fipId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('getFlexibleIP', 'zone', zone);
      // verify required parameter 'fipId' is not null or undefined
      assertParamExists('getFlexibleIP', 'fipId', fipId);
      const localVarPath = `/flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'fip_id'}}`, encodeURIComponent(String(fipId)));
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
     * List all flexible IPs within a given zone.
     * @summary List flexible IPs
     * @param {ListFlexibleIPsZoneEnum} zone The zone you want to target
     * @param {ListFlexibleIPsOrderByEnum} [orderBy] Sort order of the returned flexible IPs.
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Maximum number of flexible IPs per page.
     * @param {Array<string>} [tags] Filter by tag, only flexible IPs with one or more matching tags will be returned.
     * @param {Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>} [status] Filter by status, only flexible IPs with this status will be returned.
     * @param {Array<string>} [serverIds] Filter by server IDs, only flexible IPs with these server IDs will be returned.
     * @param {string} [organizationId] Filter by Organization ID, only flexible IPs from this Organization will be returned.
     * @param {string} [projectId] Filter by Project ID, only flexible IPs from this Project will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listFlexibleIPs: async (
      zone: ListFlexibleIPsZoneEnum,
      orderBy?: ListFlexibleIPsOrderByEnum,
      page?: number,
      pageSize?: number,
      tags?: Array<string>,
      status?: Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>,
      serverIds?: Array<string>,
      organizationId?: string,
      projectId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('listFlexibleIPs', 'zone', zone);
      const localVarPath = `/flexible-ip/v1alpha1/zones/{zone}/fips`.replace(
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

      if (tags) {
        localVarQueryParameter['tags'] = tags;
      }

      if (status) {
        localVarQueryParameter['status'] = status;
      }

      if (serverIds) {
        localVarQueryParameter['server_ids'] = serverIds;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
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
     * Relocate a virtual MAC (Media Access Control) address from an existing flexible IP to a different flexible IP.
     * @summary Relocate an existing virtual MAC address to a different flexible IP
     * @param {MoveMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId
     * @param {MoveMACAddrRequest} moveMACAddrRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    moveMACAddr: async (
      zone: MoveMACAddrZoneEnum,
      fipId: string,
      moveMACAddrRequest: MoveMACAddrRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('moveMACAddr', 'zone', zone);
      // verify required parameter 'fipId' is not null or undefined
      assertParamExists('moveMACAddr', 'fipId', fipId);
      // verify required parameter 'moveMACAddrRequest' is not null or undefined
      assertParamExists(
        'moveMACAddr',
        'moveMACAddrRequest',
        moveMACAddrRequest,
      );
      const localVarPath =
        `/flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}/mac/move`
          .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
          .replace(`{${'fip_id'}}`, encodeURIComponent(String(fipId)));
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
        moveMACAddrRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the parameters of an existing flexible IP, specified by its ID and zone. These parameters include tags and description.
     * @summary Update an existing flexible IP
     * @param {UpdateFlexibleIPZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP to update.
     * @param {UpdateFlexibleIPRequest} updateFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateFlexibleIP: async (
      zone: UpdateFlexibleIPZoneEnum,
      fipId: string,
      updateFlexibleIPRequest: UpdateFlexibleIPRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'zone' is not null or undefined
      assertParamExists('updateFlexibleIP', 'zone', zone);
      // verify required parameter 'fipId' is not null or undefined
      assertParamExists('updateFlexibleIP', 'fipId', fipId);
      // verify required parameter 'updateFlexibleIPRequest' is not null or undefined
      assertParamExists(
        'updateFlexibleIP',
        'updateFlexibleIPRequest',
        updateFlexibleIPRequest,
      );
      const localVarPath = `/flexible-ip/v1alpha1/zones/{zone}/fips/{fip_id}`
        .replace(`{${'zone'}}`, encodeURIComponent(String(zone)))
        .replace(`{${'fip_id'}}`, encodeURIComponent(String(fipId)));
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
        updateFlexibleIPRequest,
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
 * FlexibleIPApi - functional programming interface
 * @export
 */
export const FlexibleIPApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    FlexibleIPApiAxiosParamCreator(configuration);
  return {
    /**
     * Attach an existing flexible IP to a specified Elastic Metal server.
     * @summary Attach an existing flexible IP to a server
     * @param {AttachFlexibleIPZoneEnum} zone The zone you want to target
     * @param {AttachFlexibleIPRequest} attachFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async attachFlexibleIP(
      zone: AttachFlexibleIPZoneEnum,
      attachFlexibleIPRequest: AttachFlexibleIPRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayFlexibleIpV1alpha1AttachFlexibleIPsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.attachFlexibleIP(
          zone,
          attachFlexibleIPRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.attachFlexibleIP']?.[
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
     * Generate a new flexible IP within a given zone, specifying its configuration including Project ID and description.
     * @summary Create a new flexible IP
     * @param {CreateFlexibleIPZoneEnum} zone The zone you want to target
     * @param {CreateFlexibleIPRequest} createFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createFlexibleIP(
      zone: CreateFlexibleIPZoneEnum,
      createFlexibleIPRequest: CreateFlexibleIPRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createFlexibleIP(
          zone,
          createFlexibleIPRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.createFlexibleIP']?.[
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
     * Delete an existing flexible IP, specified by its ID and zone. Note that deleting a flexible IP is permanent and cannot be undone.
     * @summary Delete an existing flexible IP
     * @param {DeleteFlexibleIPZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteFlexibleIP(
      zone: DeleteFlexibleIPZoneEnum,
      fipId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteFlexibleIP(zone, fipId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.deleteFlexibleIP']?.[
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
     * Detach a given MAC (Media Access Control) address from an existing flexible IP.
     * @summary Detach a given virtual MAC address from an existing flexible IP
     * @param {DeleteMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP from which to delete the virtual MAC. If the flexible IP belongs to a MAC group, the MAC will be removed from both the MAC group and flexible IP.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteMACAddr(
      zone: DeleteMACAddrZoneEnum,
      fipId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteMACAddr(
        zone,
        fipId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.deleteMACAddr']?.[
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
     * Detach an existing flexible IP from a specified Elastic Metal server.
     * @summary Detach an existing flexible IP from a server
     * @param {DetachFlexibleIPZoneEnum} zone The zone you want to target
     * @param {DetachFlexibleIPRequest} detachFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async detachFlexibleIP(
      zone: DetachFlexibleIPZoneEnum,
      detachFlexibleIPRequest: DetachFlexibleIPRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayFlexibleIpV1alpha1DetachFlexibleIPsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.detachFlexibleIP(
          zone,
          detachFlexibleIPRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.detachFlexibleIP']?.[
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
     * Duplicate a virtual MAC address from a given flexible IP to another flexible IP attached to the same server.
     * @summary Duplicate a virtual MAC address to another flexible IP
     * @param {DuplicateMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP on which to duplicate the virtual MAC. Note that the flexible IPs need to be attached to the same server.
     * @param {DuplicateMACAddrRequest} duplicateMACAddrRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async duplicateMACAddr(
      zone: DuplicateMACAddrZoneEnum,
      fipId: string,
      duplicateMACAddrRequest: DuplicateMACAddrRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.duplicateMACAddr(
          zone,
          fipId,
          duplicateMACAddrRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.duplicateMACAddr']?.[
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
     * Generate a virtual MAC (Media Access Control) address on an existing flexible IP.
     * @summary Generate a virtual MAC address on an existing flexible IP
     * @param {GenerateMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP for which to generate a virtual MAC.
     * @param {GenerateMACAddrRequest} generateMACAddrRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async generateMACAddr(
      zone: GenerateMACAddrZoneEnum,
      fipId: string,
      generateMACAddrRequest: GenerateMACAddrRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.generateMACAddr(
        zone,
        fipId,
        generateMACAddrRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.generateMACAddr']?.[
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
     * Retrieve information about an existing flexible IP, specified by its ID and zone. Its full details, including Project ID, description and status, are returned in the response object.
     * @summary Get an existing flexible IP
     * @param {GetFlexibleIPZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getFlexibleIP(
      zone: GetFlexibleIPZoneEnum,
      fipId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getFlexibleIP(
        zone,
        fipId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.getFlexibleIP']?.[
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
     * List all flexible IPs within a given zone.
     * @summary List flexible IPs
     * @param {ListFlexibleIPsZoneEnum} zone The zone you want to target
     * @param {ListFlexibleIPsOrderByEnum} [orderBy] Sort order of the returned flexible IPs.
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Maximum number of flexible IPs per page.
     * @param {Array<string>} [tags] Filter by tag, only flexible IPs with one or more matching tags will be returned.
     * @param {Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>} [status] Filter by status, only flexible IPs with this status will be returned.
     * @param {Array<string>} [serverIds] Filter by server IDs, only flexible IPs with these server IDs will be returned.
     * @param {string} [organizationId] Filter by Organization ID, only flexible IPs from this Organization will be returned.
     * @param {string} [projectId] Filter by Project ID, only flexible IPs from this Project will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listFlexibleIPs(
      zone: ListFlexibleIPsZoneEnum,
      orderBy?: ListFlexibleIPsOrderByEnum,
      page?: number,
      pageSize?: number,
      tags?: Array<string>,
      status?: Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>,
      serverIds?: Array<string>,
      organizationId?: string,
      projectId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayFlexibleIpV1alpha1ListFlexibleIPsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listFlexibleIPs(
        zone,
        orderBy,
        page,
        pageSize,
        tags,
        status,
        serverIds,
        organizationId,
        projectId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.listFlexibleIPs']?.[
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
     * Relocate a virtual MAC (Media Access Control) address from an existing flexible IP to a different flexible IP.
     * @summary Relocate an existing virtual MAC address to a different flexible IP
     * @param {MoveMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId
     * @param {MoveMACAddrRequest} moveMACAddrRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async moveMACAddr(
      zone: MoveMACAddrZoneEnum,
      fipId: string,
      moveMACAddrRequest: MoveMACAddrRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.moveMACAddr(
        zone,
        fipId,
        moveMACAddrRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.moveMACAddr']?.[
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
     * Update the parameters of an existing flexible IP, specified by its ID and zone. These parameters include tags and description.
     * @summary Update an existing flexible IP
     * @param {UpdateFlexibleIPZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP to update.
     * @param {UpdateFlexibleIPRequest} updateFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateFlexibleIP(
      zone: UpdateFlexibleIPZoneEnum,
      fipId: string,
      updateFlexibleIPRequest: UpdateFlexibleIPRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateFlexibleIP(
          zone,
          fipId,
          updateFlexibleIPRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['FlexibleIPApi.updateFlexibleIP']?.[
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
 * FlexibleIPApi - factory interface
 * @export
 */
export const FlexibleIPApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = FlexibleIPApiFp(configuration);
  return {
    /**
     * Attach an existing flexible IP to a specified Elastic Metal server.
     * @summary Attach an existing flexible IP to a server
     * @param {AttachFlexibleIPZoneEnum} zone The zone you want to target
     * @param {AttachFlexibleIPRequest} attachFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    attachFlexibleIP(
      zone: AttachFlexibleIPZoneEnum,
      attachFlexibleIPRequest: AttachFlexibleIPRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayFlexibleIpV1alpha1AttachFlexibleIPsResponse> {
      return localVarFp
        .attachFlexibleIP(zone, attachFlexibleIPRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Generate a new flexible IP within a given zone, specifying its configuration including Project ID and description.
     * @summary Create a new flexible IP
     * @param {CreateFlexibleIPZoneEnum} zone The zone you want to target
     * @param {CreateFlexibleIPRequest} createFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createFlexibleIP(
      zone: CreateFlexibleIPZoneEnum,
      createFlexibleIPRequest: CreateFlexibleIPRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP> {
      return localVarFp
        .createFlexibleIP(zone, createFlexibleIPRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete an existing flexible IP, specified by its ID and zone. Note that deleting a flexible IP is permanent and cannot be undone.
     * @summary Delete an existing flexible IP
     * @param {DeleteFlexibleIPZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteFlexibleIP(
      zone: DeleteFlexibleIPZoneEnum,
      fipId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteFlexibleIP(zone, fipId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Detach a given MAC (Media Access Control) address from an existing flexible IP.
     * @summary Detach a given virtual MAC address from an existing flexible IP
     * @param {DeleteMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP from which to delete the virtual MAC. If the flexible IP belongs to a MAC group, the MAC will be removed from both the MAC group and flexible IP.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteMACAddr(
      zone: DeleteMACAddrZoneEnum,
      fipId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteMACAddr(zone, fipId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Detach an existing flexible IP from a specified Elastic Metal server.
     * @summary Detach an existing flexible IP from a server
     * @param {DetachFlexibleIPZoneEnum} zone The zone you want to target
     * @param {DetachFlexibleIPRequest} detachFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    detachFlexibleIP(
      zone: DetachFlexibleIPZoneEnum,
      detachFlexibleIPRequest: DetachFlexibleIPRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayFlexibleIpV1alpha1DetachFlexibleIPsResponse> {
      return localVarFp
        .detachFlexibleIP(zone, detachFlexibleIPRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Duplicate a virtual MAC address from a given flexible IP to another flexible IP attached to the same server.
     * @summary Duplicate a virtual MAC address to another flexible IP
     * @param {DuplicateMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP on which to duplicate the virtual MAC. Note that the flexible IPs need to be attached to the same server.
     * @param {DuplicateMACAddrRequest} duplicateMACAddrRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    duplicateMACAddr(
      zone: DuplicateMACAddrZoneEnum,
      fipId: string,
      duplicateMACAddrRequest: DuplicateMACAddrRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP> {
      return localVarFp
        .duplicateMACAddr(zone, fipId, duplicateMACAddrRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Generate a virtual MAC (Media Access Control) address on an existing flexible IP.
     * @summary Generate a virtual MAC address on an existing flexible IP
     * @param {GenerateMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP for which to generate a virtual MAC.
     * @param {GenerateMACAddrRequest} generateMACAddrRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    generateMACAddr(
      zone: GenerateMACAddrZoneEnum,
      fipId: string,
      generateMACAddrRequest: GenerateMACAddrRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP> {
      return localVarFp
        .generateMACAddr(zone, fipId, generateMACAddrRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve information about an existing flexible IP, specified by its ID and zone. Its full details, including Project ID, description and status, are returned in the response object.
     * @summary Get an existing flexible IP
     * @param {GetFlexibleIPZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getFlexibleIP(
      zone: GetFlexibleIPZoneEnum,
      fipId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP> {
      return localVarFp
        .getFlexibleIP(zone, fipId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all flexible IPs within a given zone.
     * @summary List flexible IPs
     * @param {ListFlexibleIPsZoneEnum} zone The zone you want to target
     * @param {ListFlexibleIPsOrderByEnum} [orderBy] Sort order of the returned flexible IPs.
     * @param {number} [page] Page number.
     * @param {number} [pageSize] Maximum number of flexible IPs per page.
     * @param {Array<string>} [tags] Filter by tag, only flexible IPs with one or more matching tags will be returned.
     * @param {Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>} [status] Filter by status, only flexible IPs with this status will be returned.
     * @param {Array<string>} [serverIds] Filter by server IDs, only flexible IPs with these server IDs will be returned.
     * @param {string} [organizationId] Filter by Organization ID, only flexible IPs from this Organization will be returned.
     * @param {string} [projectId] Filter by Project ID, only flexible IPs from this Project will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listFlexibleIPs(
      zone: ListFlexibleIPsZoneEnum,
      orderBy?: ListFlexibleIPsOrderByEnum,
      page?: number,
      pageSize?: number,
      tags?: Array<string>,
      status?: Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>,
      serverIds?: Array<string>,
      organizationId?: string,
      projectId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayFlexibleIpV1alpha1ListFlexibleIPsResponse> {
      return localVarFp
        .listFlexibleIPs(
          zone,
          orderBy,
          page,
          pageSize,
          tags,
          status,
          serverIds,
          organizationId,
          projectId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Relocate a virtual MAC (Media Access Control) address from an existing flexible IP to a different flexible IP.
     * @summary Relocate an existing virtual MAC address to a different flexible IP
     * @param {MoveMACAddrZoneEnum} zone The zone you want to target
     * @param {string} fipId
     * @param {MoveMACAddrRequest} moveMACAddrRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    moveMACAddr(
      zone: MoveMACAddrZoneEnum,
      fipId: string,
      moveMACAddrRequest: MoveMACAddrRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP> {
      return localVarFp
        .moveMACAddr(zone, fipId, moveMACAddrRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the parameters of an existing flexible IP, specified by its ID and zone. These parameters include tags and description.
     * @summary Update an existing flexible IP
     * @param {UpdateFlexibleIPZoneEnum} zone The zone you want to target
     * @param {string} fipId ID of the flexible IP to update.
     * @param {UpdateFlexibleIPRequest} updateFlexibleIPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateFlexibleIP(
      zone: UpdateFlexibleIPZoneEnum,
      fipId: string,
      updateFlexibleIPRequest: UpdateFlexibleIPRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP> {
      return localVarFp
        .updateFlexibleIP(zone, fipId, updateFlexibleIPRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * FlexibleIPApi - interface
 * @export
 * @interface FlexibleIPApi
 */
export interface FlexibleIPApiInterface {
  /**
   * Attach an existing flexible IP to a specified Elastic Metal server.
   * @summary Attach an existing flexible IP to a server
   * @param {AttachFlexibleIPZoneEnum} zone The zone you want to target
   * @param {AttachFlexibleIPRequest} attachFlexibleIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  attachFlexibleIP(
    zone: AttachFlexibleIPZoneEnum,
    attachFlexibleIPRequest: AttachFlexibleIPRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayFlexibleIpV1alpha1AttachFlexibleIPsResponse>;

  /**
   * Generate a new flexible IP within a given zone, specifying its configuration including Project ID and description.
   * @summary Create a new flexible IP
   * @param {CreateFlexibleIPZoneEnum} zone The zone you want to target
   * @param {CreateFlexibleIPRequest} createFlexibleIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  createFlexibleIP(
    zone: CreateFlexibleIPZoneEnum,
    createFlexibleIPRequest: CreateFlexibleIPRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>;

  /**
   * Delete an existing flexible IP, specified by its ID and zone. Note that deleting a flexible IP is permanent and cannot be undone.
   * @summary Delete an existing flexible IP
   * @param {DeleteFlexibleIPZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  deleteFlexibleIP(
    zone: DeleteFlexibleIPZoneEnum,
    fipId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Detach a given MAC (Media Access Control) address from an existing flexible IP.
   * @summary Detach a given virtual MAC address from an existing flexible IP
   * @param {DeleteMACAddrZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP from which to delete the virtual MAC. If the flexible IP belongs to a MAC group, the MAC will be removed from both the MAC group and flexible IP.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  deleteMACAddr(
    zone: DeleteMACAddrZoneEnum,
    fipId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Detach an existing flexible IP from a specified Elastic Metal server.
   * @summary Detach an existing flexible IP from a server
   * @param {DetachFlexibleIPZoneEnum} zone The zone you want to target
   * @param {DetachFlexibleIPRequest} detachFlexibleIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  detachFlexibleIP(
    zone: DetachFlexibleIPZoneEnum,
    detachFlexibleIPRequest: DetachFlexibleIPRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayFlexibleIpV1alpha1DetachFlexibleIPsResponse>;

  /**
   * Duplicate a virtual MAC address from a given flexible IP to another flexible IP attached to the same server.
   * @summary Duplicate a virtual MAC address to another flexible IP
   * @param {DuplicateMACAddrZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP on which to duplicate the virtual MAC. Note that the flexible IPs need to be attached to the same server.
   * @param {DuplicateMACAddrRequest} duplicateMACAddrRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  duplicateMACAddr(
    zone: DuplicateMACAddrZoneEnum,
    fipId: string,
    duplicateMACAddrRequest: DuplicateMACAddrRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>;

  /**
   * Generate a virtual MAC (Media Access Control) address on an existing flexible IP.
   * @summary Generate a virtual MAC address on an existing flexible IP
   * @param {GenerateMACAddrZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP for which to generate a virtual MAC.
   * @param {GenerateMACAddrRequest} generateMACAddrRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  generateMACAddr(
    zone: GenerateMACAddrZoneEnum,
    fipId: string,
    generateMACAddrRequest: GenerateMACAddrRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>;

  /**
   * Retrieve information about an existing flexible IP, specified by its ID and zone. Its full details, including Project ID, description and status, are returned in the response object.
   * @summary Get an existing flexible IP
   * @param {GetFlexibleIPZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  getFlexibleIP(
    zone: GetFlexibleIPZoneEnum,
    fipId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>;

  /**
   * List all flexible IPs within a given zone.
   * @summary List flexible IPs
   * @param {ListFlexibleIPsZoneEnum} zone The zone you want to target
   * @param {ListFlexibleIPsOrderByEnum} [orderBy] Sort order of the returned flexible IPs.
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Maximum number of flexible IPs per page.
   * @param {Array<string>} [tags] Filter by tag, only flexible IPs with one or more matching tags will be returned.
   * @param {Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>} [status] Filter by status, only flexible IPs with this status will be returned.
   * @param {Array<string>} [serverIds] Filter by server IDs, only flexible IPs with these server IDs will be returned.
   * @param {string} [organizationId] Filter by Organization ID, only flexible IPs from this Organization will be returned.
   * @param {string} [projectId] Filter by Project ID, only flexible IPs from this Project will be returned.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  listFlexibleIPs(
    zone: ListFlexibleIPsZoneEnum,
    orderBy?: ListFlexibleIPsOrderByEnum,
    page?: number,
    pageSize?: number,
    tags?: Array<string>,
    status?: Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>,
    serverIds?: Array<string>,
    organizationId?: string,
    projectId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayFlexibleIpV1alpha1ListFlexibleIPsResponse>;

  /**
   * Relocate a virtual MAC (Media Access Control) address from an existing flexible IP to a different flexible IP.
   * @summary Relocate an existing virtual MAC address to a different flexible IP
   * @param {MoveMACAddrZoneEnum} zone The zone you want to target
   * @param {string} fipId
   * @param {MoveMACAddrRequest} moveMACAddrRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  moveMACAddr(
    zone: MoveMACAddrZoneEnum,
    fipId: string,
    moveMACAddrRequest: MoveMACAddrRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>;

  /**
   * Update the parameters of an existing flexible IP, specified by its ID and zone. These parameters include tags and description.
   * @summary Update an existing flexible IP
   * @param {UpdateFlexibleIPZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP to update.
   * @param {UpdateFlexibleIPRequest} updateFlexibleIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApiInterface
   */
  updateFlexibleIP(
    zone: UpdateFlexibleIPZoneEnum,
    fipId: string,
    updateFlexibleIPRequest: UpdateFlexibleIPRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayFlexibleIpV1alpha1FlexibleIP>;
}

/**
 * FlexibleIPApi - object-oriented interface
 * @export
 * @class FlexibleIPApi
 * @extends {BaseAPI}
 */
export class FlexibleIPApi extends BaseAPI implements FlexibleIPApiInterface {
  /**
   * Attach an existing flexible IP to a specified Elastic Metal server.
   * @summary Attach an existing flexible IP to a server
   * @param {AttachFlexibleIPZoneEnum} zone The zone you want to target
   * @param {AttachFlexibleIPRequest} attachFlexibleIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public attachFlexibleIP(
    zone: AttachFlexibleIPZoneEnum,
    attachFlexibleIPRequest: AttachFlexibleIPRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .attachFlexibleIP(zone, attachFlexibleIPRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Generate a new flexible IP within a given zone, specifying its configuration including Project ID and description.
   * @summary Create a new flexible IP
   * @param {CreateFlexibleIPZoneEnum} zone The zone you want to target
   * @param {CreateFlexibleIPRequest} createFlexibleIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public createFlexibleIP(
    zone: CreateFlexibleIPZoneEnum,
    createFlexibleIPRequest: CreateFlexibleIPRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .createFlexibleIP(zone, createFlexibleIPRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete an existing flexible IP, specified by its ID and zone. Note that deleting a flexible IP is permanent and cannot be undone.
   * @summary Delete an existing flexible IP
   * @param {DeleteFlexibleIPZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public deleteFlexibleIP(
    zone: DeleteFlexibleIPZoneEnum,
    fipId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .deleteFlexibleIP(zone, fipId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Detach a given MAC (Media Access Control) address from an existing flexible IP.
   * @summary Detach a given virtual MAC address from an existing flexible IP
   * @param {DeleteMACAddrZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP from which to delete the virtual MAC. If the flexible IP belongs to a MAC group, the MAC will be removed from both the MAC group and flexible IP.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public deleteMACAddr(
    zone: DeleteMACAddrZoneEnum,
    fipId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .deleteMACAddr(zone, fipId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Detach an existing flexible IP from a specified Elastic Metal server.
   * @summary Detach an existing flexible IP from a server
   * @param {DetachFlexibleIPZoneEnum} zone The zone you want to target
   * @param {DetachFlexibleIPRequest} detachFlexibleIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public detachFlexibleIP(
    zone: DetachFlexibleIPZoneEnum,
    detachFlexibleIPRequest: DetachFlexibleIPRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .detachFlexibleIP(zone, detachFlexibleIPRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Duplicate a virtual MAC address from a given flexible IP to another flexible IP attached to the same server.
   * @summary Duplicate a virtual MAC address to another flexible IP
   * @param {DuplicateMACAddrZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP on which to duplicate the virtual MAC. Note that the flexible IPs need to be attached to the same server.
   * @param {DuplicateMACAddrRequest} duplicateMACAddrRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public duplicateMACAddr(
    zone: DuplicateMACAddrZoneEnum,
    fipId: string,
    duplicateMACAddrRequest: DuplicateMACAddrRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .duplicateMACAddr(zone, fipId, duplicateMACAddrRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Generate a virtual MAC (Media Access Control) address on an existing flexible IP.
   * @summary Generate a virtual MAC address on an existing flexible IP
   * @param {GenerateMACAddrZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP for which to generate a virtual MAC.
   * @param {GenerateMACAddrRequest} generateMACAddrRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public generateMACAddr(
    zone: GenerateMACAddrZoneEnum,
    fipId: string,
    generateMACAddrRequest: GenerateMACAddrRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .generateMACAddr(zone, fipId, generateMACAddrRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve information about an existing flexible IP, specified by its ID and zone. Its full details, including Project ID, description and status, are returned in the response object.
   * @summary Get an existing flexible IP
   * @param {GetFlexibleIPZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public getFlexibleIP(
    zone: GetFlexibleIPZoneEnum,
    fipId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .getFlexibleIP(zone, fipId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all flexible IPs within a given zone.
   * @summary List flexible IPs
   * @param {ListFlexibleIPsZoneEnum} zone The zone you want to target
   * @param {ListFlexibleIPsOrderByEnum} [orderBy] Sort order of the returned flexible IPs.
   * @param {number} [page] Page number.
   * @param {number} [pageSize] Maximum number of flexible IPs per page.
   * @param {Array<string>} [tags] Filter by tag, only flexible IPs with one or more matching tags will be returned.
   * @param {Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>} [status] Filter by status, only flexible IPs with this status will be returned.
   * @param {Array<string>} [serverIds] Filter by server IDs, only flexible IPs with these server IDs will be returned.
   * @param {string} [organizationId] Filter by Organization ID, only flexible IPs from this Organization will be returned.
   * @param {string} [projectId] Filter by Project ID, only flexible IPs from this Project will be returned.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public listFlexibleIPs(
    zone: ListFlexibleIPsZoneEnum,
    orderBy?: ListFlexibleIPsOrderByEnum,
    page?: number,
    pageSize?: number,
    tags?: Array<string>,
    status?: Array<ScalewayFlexibleIpV1alpha1FlexibleIPStatus>,
    serverIds?: Array<string>,
    organizationId?: string,
    projectId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .listFlexibleIPs(
        zone,
        orderBy,
        page,
        pageSize,
        tags,
        status,
        serverIds,
        organizationId,
        projectId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Relocate a virtual MAC (Media Access Control) address from an existing flexible IP to a different flexible IP.
   * @summary Relocate an existing virtual MAC address to a different flexible IP
   * @param {MoveMACAddrZoneEnum} zone The zone you want to target
   * @param {string} fipId
   * @param {MoveMACAddrRequest} moveMACAddrRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public moveMACAddr(
    zone: MoveMACAddrZoneEnum,
    fipId: string,
    moveMACAddrRequest: MoveMACAddrRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .moveMACAddr(zone, fipId, moveMACAddrRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the parameters of an existing flexible IP, specified by its ID and zone. These parameters include tags and description.
   * @summary Update an existing flexible IP
   * @param {UpdateFlexibleIPZoneEnum} zone The zone you want to target
   * @param {string} fipId ID of the flexible IP to update.
   * @param {UpdateFlexibleIPRequest} updateFlexibleIPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof FlexibleIPApi
   */
  public updateFlexibleIP(
    zone: UpdateFlexibleIPZoneEnum,
    fipId: string,
    updateFlexibleIPRequest: UpdateFlexibleIPRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return FlexibleIPApiFp(this.configuration)
      .updateFlexibleIP(zone, fipId, updateFlexibleIPRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const AttachFlexibleIPZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type AttachFlexibleIPZoneEnum =
  (typeof AttachFlexibleIPZoneEnum)[keyof typeof AttachFlexibleIPZoneEnum];
/**
 * @export
 */
export const CreateFlexibleIPZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type CreateFlexibleIPZoneEnum =
  (typeof CreateFlexibleIPZoneEnum)[keyof typeof CreateFlexibleIPZoneEnum];
/**
 * @export
 */
export const DeleteFlexibleIPZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type DeleteFlexibleIPZoneEnum =
  (typeof DeleteFlexibleIPZoneEnum)[keyof typeof DeleteFlexibleIPZoneEnum];
/**
 * @export
 */
export const DeleteMACAddrZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type DeleteMACAddrZoneEnum =
  (typeof DeleteMACAddrZoneEnum)[keyof typeof DeleteMACAddrZoneEnum];
/**
 * @export
 */
export const DetachFlexibleIPZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type DetachFlexibleIPZoneEnum =
  (typeof DetachFlexibleIPZoneEnum)[keyof typeof DetachFlexibleIPZoneEnum];
/**
 * @export
 */
export const DuplicateMACAddrZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type DuplicateMACAddrZoneEnum =
  (typeof DuplicateMACAddrZoneEnum)[keyof typeof DuplicateMACAddrZoneEnum];
/**
 * @export
 */
export const GenerateMACAddrZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type GenerateMACAddrZoneEnum =
  (typeof GenerateMACAddrZoneEnum)[keyof typeof GenerateMACAddrZoneEnum];
/**
 * @export
 */
export const GetFlexibleIPZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type GetFlexibleIPZoneEnum =
  (typeof GetFlexibleIPZoneEnum)[keyof typeof GetFlexibleIPZoneEnum];
/**
 * @export
 */
export const ListFlexibleIPsZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type ListFlexibleIPsZoneEnum =
  (typeof ListFlexibleIPsZoneEnum)[keyof typeof ListFlexibleIPsZoneEnum];
/**
 * @export
 */
export const ListFlexibleIPsOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
} as const;
export type ListFlexibleIPsOrderByEnum =
  (typeof ListFlexibleIPsOrderByEnum)[keyof typeof ListFlexibleIPsOrderByEnum];
/**
 * @export
 */
export const MoveMACAddrZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type MoveMACAddrZoneEnum =
  (typeof MoveMACAddrZoneEnum)[keyof typeof MoveMACAddrZoneEnum];
/**
 * @export
 */
export const UpdateFlexibleIPZoneEnum = {
  FrPar1: 'fr-par-1',
  FrPar2: 'fr-par-2',
  NlAms1: 'nl-ams-1',
  NlAms2: 'nl-ams-2',
  PlWaw2: 'pl-waw-2',
  PlWaw3: 'pl-waw-3',
} as const;
export type UpdateFlexibleIPZoneEnum =
  (typeof UpdateFlexibleIPZoneEnum)[keyof typeof UpdateFlexibleIPZoneEnum];
