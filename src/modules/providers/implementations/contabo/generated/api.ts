/* tslint:disable */
/* eslint-disable */
/**
 * Contabo API
 * # Introduction  Contabo API allows you to manage your resources using HTTP requests. This documentation includes a set of HTTP endpoints that are designed to RESTful principles. Each endpoint includes descriptions, request syntax, and examples.  Contabo provides also a CLI tool which enables you to manage your resources easily from the command line. [CLI Download and  Installation instructions.](https://github.com/contabo/cntb)  ## Product documentation  If you are looking for description about the products themselves and their usage in general or for specific purposes, please check the [Contabo Product Documentation](https://docs.contabo.com/).  ## Getting Started  In order to use the Contabo API you will need the following credentials which are available from the [Customer Control Panel](https://my.contabo.com/api/details): 1. ClientId 2. ClientSecret 3. API User (your email address to login to the [Customer Control Panel](https://my.contabo.com/api/details)) 4. API Password (this is a new password which you\'ll set or change in the [Customer Control Panel](https://my.contabo.com/api/details))  You can either use the API directly or by using the `cntb` CLI (Command Line Interface) tool.  ### Using the API directly  #### Via `curl` for Linux/Unix like systems  This requires `curl` and `jq` in your shell (e.g. `bash`, `zsh`). Please replace the first four placeholders with actual values.  ```sh CLIENT_ID=<ClientId from Customer Control Panel> CLIENT_SECRET=<ClientSecret from Customer Control Panel> API_USER=<API User from Customer Control Panel> API_PASSWORD=\'<API Password from Customer Control Panel>\' ACCESS_TOKEN=$(curl -d \"client_id=$CLIENT_ID\" -d \"client_secret=$CLIENT_SECRET\" --data-urlencode \"username=$API_USER\" --data-urlencode \"password=$API_PASSWORD\" -d \'grant_type=password\' \'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token\' | jq -r \'.access_token\') # get list of your instances curl -X GET -H \"Authorization: Bearer $ACCESS_TOKEN\" -H \"x-request-id: 51A87ECD-754E-4104-9C54-D01AD0F83406\" \"https://api.contabo.com/v1/compute/instances\" | jq ```  #### Via `PowerShell` for Windows  Please open `PowerShell` and execute the following code after replacing the first four placeholders with actual values.  ```powershell $client_id=\'<ClientId from Customer Control Panel>\' $client_secret=\'<ClientSecret from Customer Control Panel>\' $api_user=\'<API User from Customer Control Panel>\' $api_password=\'<API Password from Customer Control Panel>\' $body = @{grant_type=\'password\' client_id=$client_id client_secret=$client_secret username=$api_user password=$api_password} $response = Invoke-WebRequest -Uri \'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token\' -Method \'POST\' -Body $body $access_token = (ConvertFrom-Json $([String]::new($response.Content))).access_token # get list of your instances $headers = @{} $headers.Add(\"Authorization\",\"Bearer $access_token\") $headers.Add(\"x-request-id\",\"51A87ECD-754E-4104-9C54-D01AD0F83406\") Invoke-WebRequest -Uri \'https://api.contabo.com/v1/compute/instances\' -Method \'GET\' -Headers $headers ```  ### Using the Contabo API via the `cntb` CLI tool  1. Download `cntb` for your operating system (MacOS, Windows and Linux supported) [here](https://github.com/contabo/cntb) 2. Unzip the downloaded file 3. You might move the executable to any location on your disk. You may update your `PATH` environment variable for easier invocation. 4. Configure it once to use your credentials                     ```sh    cntb config set-credentials --oauth2-clientid=<ClientId from Customer Control Panel> --oauth2-client-secret=<ClientSecret from Customer Control Panel> --oauth2-user=<API User from Customer Control Panel> --oauth2-password=\'<API Password from Customer Control Panel>\'    ```  5. Use the CLI                     ```sh    # get list of your instances    cntb get instances    # help    cntb help    ```  ## API Overview  ### [Compute Management](#tag/Instances)  The Compute Management API allows you to manage compute resources (e.g. creation, deletion, starting, stopping) of VPS and VDS (please note that Storage VPS are not supported via API or CLI) as well as managing snapshots and custom images. It also offers you to take advantage of [cloud-init](https://cloud-init.io/) at least on our default / standard images (for custom images you\'ll need to provide cloud-init support packages). The API offers provisioning of cloud-init scripts via the `user_data` field.  Custom images must be provided in `.qcow2` or `.iso` format. This gives you even more flexibility for setting up your environment.  ### [Object Storage](#tag/Object-Storages)  The Object Storage API allows you to order, upgrade, cancel and control the auto-scaling feature for [S3](https://en.wikipedia.org/wiki/Amazon_S3) compatible object storage. You may also get some usage statistics. You can only buy one object storage per location. In case you need more storage space in a location you can purchase more space or enable the auto-scaling feature to purchase automatically more storage space up to the specified monthly limit.  Please note that this is not the S3 compatible API. It is not documented here. The S3 compatible API needs to be used with the corresponding credentials, namely an `access_key` and `secret_key`. Those can be retrieved by invoking the User Management API. All purchased object storages in different locations share the same credentials. You are free to use S3 compatible tools like [`aws`](https://aws.amazon.com/cli/) cli or similar.  ### [Private Networking](#tag/Private-Networks)  The Private Networking API allows you to manage private networks / Virtual Private Clouds (VPC) for your Cloud VPS and VDS (please note that Storage VPS are not supported via API or CLI). Having a private network allows the associated instances to have a private and direct network connection. The traffic won\'t leave the data center and cannot be accessed by any other instance.  With this feature you can create multi layer systems, e.g. having a database server being only accessible from your application servers in one private network and keep the database replication in a second, separate network. This increases the speed as the traffic is NOT routed to the internet and also security as the traffic is within it\'s own secured VLAN.  Adding a Cloud VPS or VDS to a private network requires a reinstallation to make sure that all relevant parts for private networking are in place. When adding the same instance to another private network it will require a restart in order to make additional virtual network interface cards (NICs) available.  Please note that for each instance being part of one or several private networks a payed add-on is required. You can automatically purchase it via the Compute Management API.  ### [Secrets Management](#tag/Secrets)  You can optionally save your passwords or public ssh keys using the Secrets Management API. You are not required to use it there will be no functional disadvantages.  By using that API you can easily reuse you public ssh keys when setting up different servers without the need to look them up every time. It can also be used to allow Contabo Supporters to access your machine without sending the passwords via potentially unsecure emails.  ### [User Management](#tag/Users)  If you need to allow other persons or automation scripts to access specific API endpoints resp. resources the User Management API comes into play. With that API you are able to manage users having possibly restricted access. You are free to define those restrictions to fit your needs. So beside an arbitrary number of users you basically define any number of so called `roles`. Roles allows access and must be one of the following types:  * `apiPermission`                    This allows you to specify a restriction to certain functions of an API by allowing control over POST (=Create), GET (=Read), PUT/PATCH (=Update) and DELETE (=Delete) methods for each API endpoint (URL) individually. * `resourcePermission`                    In order to restrict access to specific resources create a role with `resourcePermission` type by specifying any number of [tags](#tag-management). These tags need to be assigned to resources for them to take effect. E.g. a tag could be assigned to several compute resources. So that a user with that role (and of course access to the API endpoints via `apiPermission` role type) could only access those compute resources.  The `roles` are then assigned to a `user`. You can assign one or several roles regardless of the role\'s type. Of course you could also assign a user `admin` privileges without specifying any roles.  ### [Tag Management](#tag/Tags)  The Tag Management API allows you to manage your tags in order to organize your resources in a more convenient way. Simply assign a tag to resources like a compute resource to manage them.The assignments of tags to resources will also enable you to control access to these specific resources to users via the [User Management API](#user-management). For convenience reasons you might choose a color for tag. The Customer Control Panel will use that color to display the tags.  ## Requests  The Contabo API supports HTTP requests like mentioned below. Not every endpoint supports all methods. The allowed methods are listed within this documentation.  Method | Description ---    | --- GET    | To retrieve information about a resource, use the GET method.<br>The data is returned as a JSON object. GET methods are read-only and do not affect any resources. POST   | Issue a POST method to create a new object. Include all needed attributes in the request body encoded as JSON. PATCH  | Some resources support partial modification with PATCH,<br>which modifies specific attributes without updating the entire object representation. PUT    | Use the PUT method to update information about a resource.<br>PUT will set new values on the item without regard to their current values. DELETE | Use the DELETE method to destroy a resource in your account.<br>If it is not found, the operation will return a 4xx error and an appropriate message.  ## Responses  Usually the Contabo API should respond to your requests. The data returned is in [JSON](https://www.json.org/) format allowing easy processing in any programming language or tools.  As common for HTTP requests you will get back a so called HTTP status code. This gives you overall information about success or error. The following table lists common HTTP status codes.  Please note that the description of the endpoints and methods are not listing all possibly status codes in detail as they are generic. Only special return codes with their resp. response data are explicitly listed.  Response Code | Description --- | --- 200 | The response contains your requested information. 201 | Your request was accepted. The resource was created. 204 | Your request succeeded, there is no additional information returned. 400 | Your request was malformed. 401 | You did not supply valid authentication credentials. 402 | Request refused as it requires additional payed service. 403 | You are not allowed to perform the request. 404 | No results were found for your request or resource does not exist. 409 | Conflict with resources. For example violation of unique data constraints detected when trying to create or change resources. 429 | Rate-limit reached. Please wait for some time before doing more requests. 500 | We were unable to perform the request due to server-side problems. In such cases please retry or contact the support.  Not every endpoint returns data. For example DELETE requests usually don\'t return any data. All others do return data. For easy handling the return values consists of metadata denoted with and underscore (\"_\") like `_links` or `_pagination`. The actual data is returned in a field called `data`. For convenience reasons this `data` field is always returned as an array even if it consists of only one single element.  Some general details about Contabo API from [Contabo](https://contabo.com).
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: support@contabo.com
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
 * @interface AddOnQuantityRequest
 */
export interface AddOnQuantityRequest {
  /**
   * The number of Addons you wish to aquire.
   * @type {number}
   * @memberof AddOnQuantityRequest
   */
  quantity: number;
}
/**
 *
 * @export
 * @interface AddOnRequest
 */
export interface AddOnRequest {
  /**
   * Id of the Addon. Please refer to list [here](https://contabo.com/en/product-list/?show_ids=true).
   * @type {number}
   * @memberof AddOnRequest
   */
  id: number;
  /**
   * The number of Addons you wish to aquire.
   * @type {number}
   * @memberof AddOnRequest
   */
  quantity: number;
}
/**
 *
 * @export
 * @interface AddOnResponse
 */
export interface AddOnResponse {
  /**
   * Id of the Addon. Please refer to list [here](https://contabo.com/en/product-list/?show_ids=true).
   * @type {number}
   * @memberof AddOnResponse
   */
  id: number;
  /**
   * The number of Addons you wish to aquire.
   * @type {number}
   * @memberof AddOnResponse
   */
  quantity: number;
}
/**
 *
 * @export
 * @interface AdditionalIp
 */
export interface AdditionalIp {
  /**
   *
   * @type {IpV42}
   * @memberof AdditionalIp
   */
  v4: IpV42;
}
/**
 *
 * @export
 * @interface ApiPermissionsResponse
 */
export interface ApiPermissionsResponse {
  /**
   * API endpoint. In order to get a list availbale api enpoints please refer to the GET api-permissions endpoint.
   * @type {string}
   * @memberof ApiPermissionsResponse
   */
  apiName: string;
  /**
   * Action allowed for the API endpoint. Basically `CREATE` corresponds to POST endpoints, `READ` to GET endpoints, `UPDATE` to PATCH / PUT endpoints and `DELETE` to DELETE endpoints.
   * @type {Array<string>}
   * @memberof ApiPermissionsResponse
   */
  actions: Array<ApiPermissionsResponseActionsEnum>;
}

export const ApiPermissionsResponseActionsEnum = {
  Create: 'CREATE',
  Read: 'READ',
  Update: 'UPDATE',
  Delete: 'DELETE',
} as const;

export type ApiPermissionsResponseActionsEnum =
  (typeof ApiPermissionsResponseActionsEnum)[keyof typeof ApiPermissionsResponseActionsEnum];

/**
 *
 * @export
 * @interface ApplicationConfig
 */
export interface ApplicationConfig {
  /**
   * Image ID
   * @type {string}
   * @memberof ApplicationConfig
   */
  imageId: string;
  /**
   * User Data ID
   * @type {string}
   * @memberof ApplicationConfig
   */
  userDataId: string;
  /**
   * [Cloud-Init](https://cloud-init.io/) Config in order to customize during start of compute instance.
   * @type {string}
   * @memberof ApplicationConfig
   */
  userData: string;
}
/**
 *
 * @export
 * @interface ApplicationRequirements
 */
export interface ApplicationRequirements {
  /**
   * Application minimum requirements
   * @type {MinimumRequirements}
   * @memberof ApplicationRequirements
   */
  minimum?: MinimumRequirements;
  /**
   * Application optimal requirements
   * @type {OptimalRequirements}
   * @memberof ApplicationRequirements
   */
  optimal?: OptimalRequirements;
}
/**
 *
 * @export
 * @interface ApplicationResponse
 */
export interface ApplicationResponse {
  /**
   * Application ID
   * @type {string}
   * @memberof ApplicationResponse
   */
  applicationId: string;
  /**
   * Tenant ID
   * @type {string}
   * @memberof ApplicationResponse
   */
  tenantId: ApplicationResponseTenantIdEnum;
  /**
   * Customer ID
   * @type {string}
   * @memberof ApplicationResponse
   */
  customerId: string;
  /**
   * Application Name
   * @type {string}
   * @memberof ApplicationResponse
   */
  name: string;
  /**
   * Application Description
   * @type {string}
   * @memberof ApplicationResponse
   */
  description: string;
  /**
   * Application type
   * @type {string}
   * @memberof ApplicationResponse
   */
  type: ApplicationResponseTypeEnum;
  /**
   * Application Config
   * @type {Array<ApplicationConfig>}
   * @memberof ApplicationResponse
   */
  applicationConfig: Array<ApplicationConfig>;
  /**
   * Application Requirements
   * @type {ApplicationRequirements}
   * @memberof ApplicationResponse
   */
  requirements: ApplicationRequirements;
}

export const ApplicationResponseTenantIdEnum = {
  De: 'DE',
  Int: 'INT',
} as const;

export type ApplicationResponseTenantIdEnum =
  (typeof ApplicationResponseTenantIdEnum)[keyof typeof ApplicationResponseTenantIdEnum];
export const ApplicationResponseTypeEnum = {
  Standard: 'standard',
  Crypto: 'crypto',
} as const;

export type ApplicationResponseTypeEnum =
  (typeof ApplicationResponseTypeEnum)[keyof typeof ApplicationResponseTypeEnum];

/**
 *
 * @export
 * @interface AssignInstancePrivateNetworkResponse
 */
export interface AssignInstancePrivateNetworkResponse {
  /**
   * Links for easy navigation.
   * @type {InstanceAssignmentSelfLinks}
   * @memberof AssignInstancePrivateNetworkResponse
   */
  _links: InstanceAssignmentSelfLinks;
}
/**
 *
 * @export
 * @interface AssignVipResponse
 */
export interface AssignVipResponse {
  /**
   *
   * @type {Array<VipResponse>}
   * @memberof AssignVipResponse
   */
  data: Array<VipResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof AssignVipResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface AssignedTagResponse
 */
export interface AssignedTagResponse {
  /**
   * Tag\'s id
   * @type {number}
   * @memberof AssignedTagResponse
   */
  tagId: number;
  /**
   * Tag\'s name
   * @type {string}
   * @memberof AssignedTagResponse
   */
  tagName: string;
}
/**
 *
 * @export
 * @interface AssignmentAuditResponse
 */
export interface AssignmentAuditResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  customerId: string;
  /**
   * The identifier of the audit entry.
   * @type {number}
   * @memberof AssignmentAuditResponse
   */
  id: number;
  /**
   * Resource\'s id
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  resourceId: string;
  /**
   * Resource type. Resource type is one of `instance|image|object-storage`.
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  resourceType: string;
  /**
   * Tag\'s id
   * @type {number}
   * @memberof AssignmentAuditResponse
   */
  tagId: number;
  /**
   * Audit Action
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  action: AssignmentAuditResponseActionEnum;
  /**
   * Audit creation date
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  timestamp: string;
  /**
   * User ID
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  changedBy: string;
  /**
   * User Full Name
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  username: string;
  /**
   * Request ID
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  requestId: string;
  /**
   * Trace ID
   * @type {string}
   * @memberof AssignmentAuditResponse
   */
  traceId: string;
  /**
   * Changes made for a specific Tag
   * @type {object}
   * @memberof AssignmentAuditResponse
   */
  changes?: object;
}

export const AssignmentAuditResponseActionEnum = {
  Created: 'CREATED',
  Deleted: 'DELETED',
} as const;

export type AssignmentAuditResponseActionEnum =
  (typeof AssignmentAuditResponseActionEnum)[keyof typeof AssignmentAuditResponseActionEnum];

/**
 *
 * @export
 * @interface AssignmentResponse
 */
export interface AssignmentResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof AssignmentResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof AssignmentResponse
   */
  customerId: string;
  /**
   * The identifier of the tag.
   * @type {number}
   * @memberof AssignmentResponse
   */
  tagId: number;
  /**
   * Tag\'s name
   * @type {string}
   * @memberof AssignmentResponse
   */
  tagName: string;
  /**
   * Resource type. Resource type is one of `instance|image|object-storage`.
   * @type {string}
   * @memberof AssignmentResponse
   */
  resourceType: string;
  /**
   * Resource id
   * @type {string}
   * @memberof AssignmentResponse
   */
  resourceId: string;
  /**
   * Resource name
   * @type {string}
   * @memberof AssignmentResponse
   */
  resourceName: string;
}
/**
 *
 * @export
 * @interface AutoScalingTypeRequest
 */
export interface AutoScalingTypeRequest {
  /**
   * State of the autoscaling for the current object storage.
   * @type {string}
   * @memberof AutoScalingTypeRequest
   */
  state: AutoScalingTypeRequestStateEnum;
  /**
   * Autoscaling size limit for the current object storage.
   * @type {number}
   * @memberof AutoScalingTypeRequest
   */
  sizeLimitTB: number;
}

export const AutoScalingTypeRequestStateEnum = {
  Enabled: 'enabled',
  Disabled: 'disabled',
} as const;

export type AutoScalingTypeRequestStateEnum =
  (typeof AutoScalingTypeRequestStateEnum)[keyof typeof AutoScalingTypeRequestStateEnum];

/**
 *
 * @export
 * @interface AutoScalingTypeResponse
 */
export interface AutoScalingTypeResponse {
  /**
   * State of the autoscaling for the current object storage.
   * @type {string}
   * @memberof AutoScalingTypeResponse
   */
  state: AutoScalingTypeResponseStateEnum;
  /**
   * Autoscaling size limit for the current object storage.
   * @type {number}
   * @memberof AutoScalingTypeResponse
   */
  sizeLimitTB: number;
  /**
   * Error message
   * @type {string}
   * @memberof AutoScalingTypeResponse
   */
  errorMessage?: string;
}

export const AutoScalingTypeResponseStateEnum = {
  Enabled: 'enabled',
  Disabled: 'disabled',
  Error: 'error',
} as const;

export type AutoScalingTypeResponseStateEnum =
  (typeof AutoScalingTypeResponseStateEnum)[keyof typeof AutoScalingTypeResponseStateEnum];

/**
 *
 * @export
 * @interface CancelInstanceRequest
 */
export interface CancelInstanceRequest {
  /**
   * Date of cancellation
   * @type {string}
   * @memberof CancelInstanceRequest
   */
  cancelDate?: string;
}
/**
 *
 * @export
 * @interface CancelInstanceResponse
 */
export interface CancelInstanceResponse {
  /**
   *
   * @type {Array<CancelInstanceResponseData>}
   * @memberof CancelInstanceResponse
   */
  data: Array<CancelInstanceResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CancelInstanceResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CancelInstanceResponseData
 */
export interface CancelInstanceResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CancelInstanceResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CancelInstanceResponseData
   */
  customerId: string;
  /**
   * Instance\'s id
   * @type {number}
   * @memberof CancelInstanceResponseData
   */
  instanceId: number;
  /**
   * The date on which the instance will be cancelled
   * @type {string}
   * @memberof CancelInstanceResponseData
   */
  cancelDate: string;
}
/**
 *
 * @export
 * @interface CancelObjectStorageRequest
 */
export interface CancelObjectStorageRequest {
  /**
   * Date of cancellation
   * @type {string}
   * @memberof CancelObjectStorageRequest
   */
  cancelDate?: string;
}
/**
 *
 * @export
 * @interface CancelObjectStorageResponse
 */
export interface CancelObjectStorageResponse {
  /**
   *
   * @type {SelfLinks}
   * @memberof CancelObjectStorageResponse
   */
  _links: SelfLinks;
  /**
   *
   * @type {Array<CancelObjectStorageResponseData>}
   * @memberof CancelObjectStorageResponse
   */
  data: Array<CancelObjectStorageResponseData>;
}
/**
 *
 * @export
 * @interface CancelObjectStorageResponseData
 */
export interface CancelObjectStorageResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CancelObjectStorageResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CancelObjectStorageResponseData
   */
  customerId: string;
  /**
   * Object Storage id
   * @type {string}
   * @memberof CancelObjectStorageResponseData
   */
  objectStorageId: string;
  /**
   * Cancellation date for object storage.
   * @type {string}
   * @memberof CancelObjectStorageResponseData
   */
  cancelDate: string;
  /**
   * Display name for object storage.
   * @type {string}
   * @memberof CancelObjectStorageResponseData
   */
  displayName: string;
}
/**
 *
 * @export
 * @interface ClientResponse
 */
export interface ClientResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof ClientResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof ClientResponse
   */
  customerId: string;
  /**
   * Client\'s id
   * @type {string}
   * @memberof ClientResponse
   */
  id: string;
  /**
   * IDM client id
   * @type {string}
   * @memberof ClientResponse
   */
  clientId: string;
  /**
   * IDM client secret
   * @type {string}
   * @memberof ClientResponse
   */
  secret: string;
}
/**
 *
 * @export
 * @interface ClientSecretResponse
 */
export interface ClientSecretResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof ClientSecretResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof ClientSecretResponse
   */
  customerId: string;
  /**
   * IDM client secret
   * @type {string}
   * @memberof ClientSecretResponse
   */
  secret: string;
}
/**
 *
 * @export
 * @interface CreateAssignmentResponse
 */
export interface CreateAssignmentResponse {
  /**
   * Links for easy navigation.
   * @type {TagAssignmentSelfLinks}
   * @memberof CreateAssignmentResponse
   */
  _links: TagAssignmentSelfLinks;
}
/**
 *
 * @export
 * @interface CreateCustomImageFailResponse
 */
export interface CreateCustomImageFailResponse {
  /**
   * Unsupported Media Type: Please provide a direct link to an .iso or .qcow2 image.
   * @type {string}
   * @memberof CreateCustomImageFailResponse
   */
  message: string;
  /**
   * statuscode:415
   * @type {number}
   * @memberof CreateCustomImageFailResponse
   */
  statusCode: number;
}
/**
 *
 * @export
 * @interface CreateCustomImageRequest
 */
export interface CreateCustomImageRequest {
  /**
   * Image Name
   * @type {string}
   * @memberof CreateCustomImageRequest
   */
  name: string;
  /**
   * Image Description
   * @type {string}
   * @memberof CreateCustomImageRequest
   */
  description?: string;
  /**
   * URL from where the image has been downloaded / provided.
   * @type {string}
   * @memberof CreateCustomImageRequest
   */
  url: string;
  /**
   * Provided type of operating system (OS). Please specify `Windows` for MS Windows and `Linux` for other OS. Specifying wrong OS type may lead to disfunctional cloud instance.
   * @type {string}
   * @memberof CreateCustomImageRequest
   */
  osType: CreateCustomImageRequestOsTypeEnum;
  /**
   * Version number to distinguish the contents of an image. Could be the version of the operating system for example.
   * @type {string}
   * @memberof CreateCustomImageRequest
   */
  version: string;
}

export const CreateCustomImageRequestOsTypeEnum = {
  Windows: 'Windows',
  Linux: 'Linux',
} as const;

export type CreateCustomImageRequestOsTypeEnum =
  (typeof CreateCustomImageRequestOsTypeEnum)[keyof typeof CreateCustomImageRequestOsTypeEnum];

/**
 *
 * @export
 * @interface CreateCustomImageResponse
 */
export interface CreateCustomImageResponse {
  /**
   *
   * @type {Array<CreateCustomImageResponseData>}
   * @memberof CreateCustomImageResponse
   */
  data: Array<CreateCustomImageResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreateCustomImageResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateCustomImageResponseData
 */
export interface CreateCustomImageResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CreateCustomImageResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CreateCustomImageResponseData
   */
  customerId: string;
  /**
   * Image\'s id
   * @type {string}
   * @memberof CreateCustomImageResponseData
   */
  imageId: string;
}
/**
 *
 * @export
 * @interface CreateInstanceAddons
 */
export interface CreateInstanceAddons {
  /**
   * Set this attribute if you want to upgrade your instance with the Private Networking addon.   Please provide an empty object for the time being as value. There will be more configuration possible   in the future.
   * @type {object}
   * @memberof CreateInstanceAddons
   */
  privateNetworking?: object;
  /**
   * Set this attribute if you want to upgrade your instance with the Additional IPs addon. Please provide an empty object for the time being as value. There will be more configuration possible in the future.
   * @type {object}
   * @memberof CreateInstanceAddons
   */
  additionalIps?: object;
  /**
   * Set this attribute if you want to upgrade your instance with the Automated backup addon.     Please provide an empty object for the time being as value. There will be more configuration possible     in the future.
   * @type {object}
   * @memberof CreateInstanceAddons
   */
  backup?: object;
  /**
   * Set this attribute if you want to upgrade your instance with the Extra Storage addon.
   * @type {ExtraStorageRequest}
   * @memberof CreateInstanceAddons
   */
  extraStorage?: ExtraStorageRequest;
  /**
   * Set this attribute if you want to upgrade your instance with the Custom Images addon.   Please provide an empty object for the time being as value. There will be more configuration possible   in the future.
   * @type {object}
   * @memberof CreateInstanceAddons
   */
  customImage?: object;
  /**
   *
   * @type {Array<AddOnRequest>}
   * @memberof CreateInstanceAddons
   */
  addonsIds?: Array<AddOnRequest>;
}
/**
 *
 * @export
 * @interface CreateInstanceRequest
 */
export interface CreateInstanceRequest {
  /**
   * ImageId to be used to setup the compute instance. Default is Ubuntu 22.04
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  imageId?: string;
  /**
   * Default is V76
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  productId?: string;
  /**
   * Instance Region where the compute instance should be located. Default is EU
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  region?: CreateInstanceRequestRegionEnum;
  /**
   * Array of `secretId`s of public SSH keys for logging into as `defaultUser` with administrator/root privileges. Applies to Linux/BSD systems. Please refer to Secrets Management API.
   * @type {Array<number>}
   * @memberof CreateInstanceRequest
   */
  sshKeys?: Array<number>;
  /**
   * `secretId` of the password for the `defaultUser` with administrator/root privileges. For Linux/BSD please use SSH, for Windows RDP. Please refer to Secrets Management API.
   * @type {number}
   * @memberof CreateInstanceRequest
   */
  rootPassword?: number;
  /**
   * [Cloud-Init](https://cloud-init.io/) Config in order to customize during start of compute instance.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  userData?: string;
  /**
   * Additional licence in order to enhance your chosen product, mainly needed for software licenses on your product (not needed for windows).
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  license?: CreateInstanceRequestLicenseEnum;
  /**
   * Initial contract period in months. Available periods are: 1, 3, 6 and 12 months. Default to 1 month
   * @type {number}
   * @memberof CreateInstanceRequest
   */
  period: number;
  /**
   * The display name of the instance
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  displayName?: string;
  /**
   * Default user name created for login during (re-)installation with administrative privileges. Allowed values for Linux/BSD are `admin` (use sudo to apply administrative privileges like root) or `root`. Allowed values for Windows are `admin` (has administrative privileges like administrator) or `administrator`.
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  defaultUser?: CreateInstanceRequestDefaultUserEnum;
  /**
   * Set attributes in the addons object for the corresponding ones that need to be added to the instance
   * @type {CreateInstanceAddons}
   * @memberof CreateInstanceRequest
   */
  addOns?: CreateInstanceAddons;
  /**
   * Application ID
   * @type {string}
   * @memberof CreateInstanceRequest
   */
  applicationId?: string;
}

export const CreateInstanceRequestRegionEnum = {
  Eu: 'EU',
  UsCentral: 'US-central',
  UsEast: 'US-east',
  UsWest: 'US-west',
  Sin: 'SIN',
  Uk: 'UK',
  Aus: 'AUS',
  Jpn: 'JPN',
  Sin2: 'SIN',
  Ind: 'IND',
} as const;

export type CreateInstanceRequestRegionEnum =
  (typeof CreateInstanceRequestRegionEnum)[keyof typeof CreateInstanceRequestRegionEnum];
export const CreateInstanceRequestLicenseEnum = {
  CPanel5: 'cPanel5',
  CPanel30: 'cPanel30',
  CPanel50: 'cPanel50',
  CPanel100: 'cPanel100',
  CPanel150: 'cPanel150',
  CPanel200: 'cPanel200',
  CPanel250: 'cPanel250',
  CPanel300: 'cPanel300',
  CPanel350: 'cPanel350',
  CPanel400: 'cPanel400',
  CPanel450: 'cPanel450',
  CPanel500: 'cPanel500',
  CPanel550: 'cPanel550',
  CPanel600: 'cPanel600',
  CPanel650: 'cPanel650',
  CPanel700: 'cPanel700',
  CPanel750: 'cPanel750',
  CPanel800: 'cPanel800',
  CPanel850: 'cPanel850',
  CPanel900: 'cPanel900',
  CPanel950: 'cPanel950',
  CPanel1000: 'cPanel1000',
  PleskAdmin: 'PleskAdmin',
  PleskHost: 'PleskHost',
  PleskPro: 'PleskPro',
} as const;

export type CreateInstanceRequestLicenseEnum =
  (typeof CreateInstanceRequestLicenseEnum)[keyof typeof CreateInstanceRequestLicenseEnum];
export const CreateInstanceRequestDefaultUserEnum = {
  Root: 'root',
  Admin: 'admin',
  Administrator: 'administrator',
} as const;

export type CreateInstanceRequestDefaultUserEnum =
  (typeof CreateInstanceRequestDefaultUserEnum)[keyof typeof CreateInstanceRequestDefaultUserEnum];

/**
 *
 * @export
 * @interface CreateInstanceResponse
 */
export interface CreateInstanceResponse {
  /**
   *
   * @type {Array<CreateInstanceResponseData>}
   * @memberof CreateInstanceResponse
   */
  data: Array<CreateInstanceResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreateInstanceResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateInstanceResponseData
 */
export interface CreateInstanceResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CreateInstanceResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CreateInstanceResponseData
   */
  customerId: string;
  /**
   * Instance\'s id
   * @type {number}
   * @memberof CreateInstanceResponseData
   */
  instanceId: number;
  /**
   * Creation date for instance
   * @type {string}
   * @memberof CreateInstanceResponseData
   */
  createdDate: string;
  /**
   * Image\'s id
   * @type {string}
   * @memberof CreateInstanceResponseData
   */
  imageId: string;
  /**
   * Product ID
   * @type {string}
   * @memberof CreateInstanceResponseData
   */
  productId: string;
  /**
   * Instance Region where the compute instance should be located.
   * @type {string}
   * @memberof CreateInstanceResponseData
   */
  region: string;
  /**
   *
   * @type {Array<AddOnResponse>}
   * @memberof CreateInstanceResponseData
   */
  addOns: Array<AddOnResponse>;
  /**
   * Type of operating system (OS)
   * @type {string}
   * @memberof CreateInstanceResponseData
   */
  osType: string;
  /**
   *
   * @type {InstanceStatus}
   * @memberof CreateInstanceResponseData
   */
  status: InstanceStatus;
  /**
   * Array of `secretId`s of public SSH keys for logging into as `defaultUser` with administrator/root privileges. Applies to Linux/BSD systems. Please refer to Secrets Management API.
   * @type {Array<number>}
   * @memberof CreateInstanceResponseData
   */
  sshKeys: Array<number>;
}

/**
 *
 * @export
 * @interface CreateObjectStorageRequest
 */
export interface CreateObjectStorageRequest {
  /**
   * Region where the object storage should be located. Default is EU. Available regions: EU, US-central, SIN
   * @type {string}
   * @memberof CreateObjectStorageRequest
   */
  region: string;
  /**
   * Autoscaling settings
   * @type {AutoScalingTypeRequest}
   * @memberof CreateObjectStorageRequest
   */
  autoScaling?: AutoScalingTypeRequest;
  /**
   * Amount of purchased / requested object storage in TB.
   * @type {number}
   * @memberof CreateObjectStorageRequest
   */
  totalPurchasedSpaceTB: number;
  /**
   * Display name helps to differentiate between object storages, especially if they are in the same region. If display name is not provided, it will be generated. Display name can be changed any time.
   * @type {string}
   * @memberof CreateObjectStorageRequest
   */
  displayName?: string;
}
/**
 *
 * @export
 * @interface CreateObjectStorageResponse
 */
export interface CreateObjectStorageResponse {
  /**
   *
   * @type {Array<CreateObjectStorageResponseData>}
   * @memberof CreateObjectStorageResponse
   */
  data: Array<CreateObjectStorageResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreateObjectStorageResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateObjectStorageResponseData
 */
export interface CreateObjectStorageResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  customerId: string;
  /**
   * Your object storage id
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  objectStorageId: string;
  /**
   * Creation date for object storage.
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  createdDate: string;
  /**
   * Cancellation date for object storage.
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  cancelDate: string;
  /**
   * Autoscaling settings
   * @type {AutoScalingTypeResponse}
   * @memberof CreateObjectStorageResponseData
   */
  autoScaling: AutoScalingTypeResponse;
  /**
   * The data center of the storage
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  dataCenter: string;
  /**
   * Amount of purchased / requested object storage in TB.
   * @type {number}
   * @memberof CreateObjectStorageResponseData
   */
  totalPurchasedSpaceTB: number;
  /**
   * Currently used space in TB.
   * @type {number}
   * @memberof CreateObjectStorageResponseData
   */
  usedSpaceTB: number;
  /**
   * Currently used space in percentage.
   * @type {number}
   * @memberof CreateObjectStorageResponseData
   */
  usedSpacePercentage: number;
  /**
   * S3 URL to connect to your S3 compatible object storage
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  s3Url: string;
  /**
   * Your S3 tenantId. Only required for public sharing.
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  s3TenantId: string;
  /**
   * The object storage status
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  status: CreateObjectStorageResponseDataStatusEnum;
  /**
   * The region where your object storage is located
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  region: string;
  /**
   * Display name for object storage.
   * @type {string}
   * @memberof CreateObjectStorageResponseData
   */
  displayName: string;
}

export const CreateObjectStorageResponseDataStatusEnum = {
  Ready: 'READY',
  Provisioning: 'PROVISIONING',
  Upgrading: 'UPGRADING',
  Cancelled: 'CANCELLED',
  Error: 'ERROR',
  Enabled: 'ENABLED',
  Disabled: 'DISABLED',
  ManualProvisioning: 'MANUAL_PROVISIONING',
  ProductNotAvailable: 'PRODUCT_NOT_AVAILABLE',
  LimitExceeded: 'LIMIT_EXCEEDED',
  VerificationRequired: 'VERIFICATION_REQUIRED',
  Completed: 'COMPLETED',
  OrderProcessing: 'ORDER_PROCESSING',
  PendingPayment: 'PENDING_PAYMENT',
  Unknown: 'UNKNOWN',
} as const;

export type CreateObjectStorageResponseDataStatusEnum =
  (typeof CreateObjectStorageResponseDataStatusEnum)[keyof typeof CreateObjectStorageResponseDataStatusEnum];

/**
 *
 * @export
 * @interface CreatePrivateNetworkRequest
 */
export interface CreatePrivateNetworkRequest {
  /**
   * Region where the Private Network should be located. Default is `EU`
   * @type {string}
   * @memberof CreatePrivateNetworkRequest
   */
  region?: string;
  /**
   * The name of the Private Network. It may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per Private Network name.
   * @type {string}
   * @memberof CreatePrivateNetworkRequest
   */
  name: string;
  /**
   * The description of the Private Network. There is a limit of 255 characters per Private Network description.
   * @type {string}
   * @memberof CreatePrivateNetworkRequest
   */
  description?: string;
}
/**
 *
 * @export
 * @interface CreatePrivateNetworkResponse
 */
export interface CreatePrivateNetworkResponse {
  /**
   *
   * @type {Array<PrivateNetworkResponse>}
   * @memberof CreatePrivateNetworkResponse
   */
  data: Array<PrivateNetworkResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreatePrivateNetworkResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateRoleRequest
 */
export interface CreateRoleRequest {
  /**
   * The name of the role. There is a limit of 255 characters per role.
   * @type {string}
   * @memberof CreateRoleRequest
   */
  name: string;
  /**
   * If user is admin he will have permissions to all API endpoints and resources. Enabling this will superseed all role definitions and `accessAllResources`.
   * @type {boolean}
   * @memberof CreateRoleRequest
   */
  admin: boolean;
  /**
   * Allow access to all resources. This will superseed all assigned resources in a role.
   * @type {boolean}
   * @memberof CreateRoleRequest
   */
  accessAllResources: boolean;
  /**
   *
   * @type {Array<PermissionRequest>}
   * @memberof CreateRoleRequest
   */
  permissions?: Array<PermissionRequest>;
}
/**
 *
 * @export
 * @interface CreateRoleResponse
 */
export interface CreateRoleResponse {
  /**
   *
   * @type {Array<CreateRoleResponseData>}
   * @memberof CreateRoleResponse
   */
  data: Array<CreateRoleResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreateRoleResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateRoleResponseData
 */
export interface CreateRoleResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CreateRoleResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CreateRoleResponseData
   */
  customerId: string;
  /**
   * Role\'s id
   * @type {number}
   * @memberof CreateRoleResponseData
   */
  roleId: number;
}
/**
 *
 * @export
 * @interface CreateSecretRequest
 */
export interface CreateSecretRequest {
  /**
   * The name of the secret that will keep the password
   * @type {string}
   * @memberof CreateSecretRequest
   */
  name: string;
  /**
   * The secret value that needs to be saved. In case of a password it must match a pattern with at least one upper and lower case character and either one number with two special characters `!@#$^&*?_~` or at least three numbers with one special character `!@#$^&*?_~`. This is expressed in the following regular expression: `^((?=.*?[A-Z]{1,})(?=.*?[a-z]{1,}))(((?=(?:[^d]*d){1})(?=([^^&*?_~]*[!@#$^&*?_~]){2,}))|((?=(?:[^d]*d){3})(?=.*?[!@#$^&*?_~]+))).{8,}$`
   * @type {string}
   * @memberof CreateSecretRequest
   */
  value: string;
  /**
   * The type of the secret. Can be `password` or `ssh`
   * @type {string}
   * @memberof CreateSecretRequest
   */
  type: CreateSecretRequestTypeEnum;
}

export const CreateSecretRequestTypeEnum = {
  Password: 'password',
  Ssh: 'ssh',
} as const;

export type CreateSecretRequestTypeEnum =
  (typeof CreateSecretRequestTypeEnum)[keyof typeof CreateSecretRequestTypeEnum];

/**
 *
 * @export
 * @interface CreateSecretResponse
 */
export interface CreateSecretResponse {
  /**
   *
   * @type {Array<SecretResponse>}
   * @memberof CreateSecretResponse
   */
  data: Array<SecretResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreateSecretResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateSnapshotRequest
 */
export interface CreateSnapshotRequest {
  /**
   * The name of the snapshot. It may contain letters, numbers, spaces, dashes. There is a limit of 30 characters per snapshot.
   * @type {string}
   * @memberof CreateSnapshotRequest
   */
  name: string;
  /**
   * The description of the snapshot. There is a limit of 255 characters per snapshot.
   * @type {string}
   * @memberof CreateSnapshotRequest
   */
  description?: string;
}
/**
 *
 * @export
 * @interface CreateSnapshotResponse
 */
export interface CreateSnapshotResponse {
  /**
   *
   * @type {Array<SnapshotResponse>}
   * @memberof CreateSnapshotResponse
   */
  data: Array<SnapshotResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreateSnapshotResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateTagRequest
 */
export interface CreateTagRequest {
  /**
   * The name of the tag. Tags may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per tag.
   * @type {string}
   * @memberof CreateTagRequest
   */
  name: string;
  /**
   * The color of the tag. Color can be specified using hexadecimal value. Default color is #0A78C3
   * @type {string}
   * @memberof CreateTagRequest
   */
  color: string;
}
/**
 *
 * @export
 * @interface CreateTagResponse
 */
export interface CreateTagResponse {
  /**
   *
   * @type {Array<CreateTagResponseData>}
   * @memberof CreateTagResponse
   */
  data: Array<CreateTagResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreateTagResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateTagResponseData
 */
export interface CreateTagResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CreateTagResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CreateTagResponseData
   */
  customerId: string;
  /**
   * Tag\'s id
   * @type {number}
   * @memberof CreateTagResponseData
   */
  tagId: number;
}
/**
 *
 * @export
 * @interface CreateTicketRequest
 */
export interface CreateTicketRequest {
  /**
   * The ticket subject
   * @type {string}
   * @memberof CreateTicketRequest
   */
  subject: string;
  /**
   * The ticket note
   * @type {string}
   * @memberof CreateTicketRequest
   */
  note: string;
  /**
   * Customer email
   * @type {string}
   * @memberof CreateTicketRequest
   */
  sender: string;
}
/**
 *
 * @export
 * @interface CreateTicketResponse
 */
export interface CreateTicketResponse {
  /**
   *
   * @type {Array<CreateTicketResponseData>}
   * @memberof CreateTicketResponse
   */
  data: Array<CreateTicketResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreateTicketResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateTicketResponseData
 */
export interface CreateTicketResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CreateTicketResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CreateTicketResponseData
   */
  customerId: string;
}
/**
 *
 * @export
 * @interface CreateUserRequest
 */
export interface CreateUserRequest {
  /**
   * The name of the user. Names may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per user.
   * @type {string}
   * @memberof CreateUserRequest
   */
  firstName?: string;
  /**
   * The last name of the user. Users may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per user.
   * @type {string}
   * @memberof CreateUserRequest
   */
  lastName?: string;
  /**
   * The email of the user to which activation and forgot password links are being sent to. There is a limit of 255 characters per email.
   * @type {string}
   * @memberof CreateUserRequest
   */
  email: string;
  /**
   * If user is not enabled, he can\'t login and thus use services any longer.
   * @type {boolean}
   * @memberof CreateUserRequest
   */
  enabled: boolean;
  /**
   * Enable or disable two-factor authentication (2FA) via time based OTP.
   * @type {boolean}
   * @memberof CreateUserRequest
   */
  totp: boolean;
  /**
   * The locale of the user. This can be `de-DE`, `de`, `en-US`, `en`
   * @type {string}
   * @memberof CreateUserRequest
   */
  locale: CreateUserRequestLocaleEnum;
  /**
   * The roles as list of `roleId`s of the user.
   * @type {Array<number>}
   * @memberof CreateUserRequest
   */
  roles?: Array<number>;
}

export const CreateUserRequestLocaleEnum = {
  DeDe: 'de-DE',
  De: 'de',
  EnUs: 'en-US',
  En: 'en',
} as const;

export type CreateUserRequestLocaleEnum =
  (typeof CreateUserRequestLocaleEnum)[keyof typeof CreateUserRequestLocaleEnum];

/**
 *
 * @export
 * @interface CreateUserResponse
 */
export interface CreateUserResponse {
  /**
   *
   * @type {Array<CreateUserResponseData>}
   * @memberof CreateUserResponse
   */
  data: Array<CreateUserResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CreateUserResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CreateUserResponseData
 */
export interface CreateUserResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CreateUserResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CreateUserResponseData
   */
  customerId: string;
  /**
   * User\'s id
   * @type {string}
   * @memberof CreateUserResponseData
   */
  userId: string;
}
/**
 *
 * @export
 * @interface CredentialData
 */
export interface CredentialData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CredentialData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CredentialData
   */
  customerId: string;
  /**
   * Access key ID.
   * @type {string}
   * @memberof CredentialData
   */
  accessKey: string;
  /**
   * Secret key ID.
   * @type {string}
   * @memberof CredentialData
   */
  secretKey: string;
  /**
   * Object Storage ID.
   * @type {string}
   * @memberof CredentialData
   */
  objectStorageId: string;
  /**
   * Object Storage Name.
   * @type {string}
   * @memberof CredentialData
   */
  displayName: string;
  /**
   * Object Storage Region.
   * @type {string}
   * @memberof CredentialData
   */
  region: string;
  /**
   * Object Storage Credential ID
   * @type {number}
   * @memberof CredentialData
   */
  credentialId: number;
}
/**
 *
 * @export
 * @interface CustomImagesStatsResponse
 */
export interface CustomImagesStatsResponse {
  /**
   *
   * @type {Array<CustomImagesStatsResponseData>}
   * @memberof CustomImagesStatsResponse
   */
  data: Array<CustomImagesStatsResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof CustomImagesStatsResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface CustomImagesStatsResponseData
 */
export interface CustomImagesStatsResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof CustomImagesStatsResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof CustomImagesStatsResponseData
   */
  customerId: string;
  /**
   * The number of existing custom images
   * @type {number}
   * @memberof CustomImagesStatsResponseData
   */
  currentImagesCount: number;
  /**
   * Total available disk space in MB
   * @type {number}
   * @memberof CustomImagesStatsResponseData
   */
  totalSizeMb: number;
  /**
   * Used disk space in MB
   * @type {number}
   * @memberof CustomImagesStatsResponseData
   */
  usedSizeMb: number;
  /**
   * Free disk space in MB
   * @type {number}
   * @memberof CustomImagesStatsResponseData
   */
  freeSizeMb: number;
}
/**
 *
 * @export
 * @interface DataCenterResponse
 */
export interface DataCenterResponse {
  /**
   * Name of the data center
   * @type {string}
   * @memberof DataCenterResponse
   */
  name: string;
  /**
   * Slug of the data center
   * @type {string}
   * @memberof DataCenterResponse
   */
  slug: string;
  /**
   *
   * @type {Array<string>}
   * @memberof DataCenterResponse
   */
  capabilities: Array<DataCenterResponseCapabilitiesEnum>;
  /**
   * S3 URL of the data center
   * @type {string}
   * @memberof DataCenterResponse
   */
  s3Url: string;
  /**
   * Name of the region
   * @type {string}
   * @memberof DataCenterResponse
   */
  regionName: string;
  /**
   * Slug of the region
   * @type {string}
   * @memberof DataCenterResponse
   */
  regionSlug: string;
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof DataCenterResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof DataCenterResponse
   */
  customerId: string;
}

export const DataCenterResponseCapabilitiesEnum = {
  Vps: 'VPS',
  Vds: 'VDS',
  ObjectStorage: 'Object-Storage',
  PrivateNetworking: 'Private-Networking',
} as const;

export type DataCenterResponseCapabilitiesEnum =
  (typeof DataCenterResponseCapabilitiesEnum)[keyof typeof DataCenterResponseCapabilitiesEnum];

/**
 *
 * @export
 * @interface ExtraStorageRequest
 */
export interface ExtraStorageRequest {
  /**
   * Specify the size in TB and the quantity
   * @type {Array<string>}
   * @memberof ExtraStorageRequest
   */
  ssd?: Array<string>;
  /**
   * Specify the size in TB and the quantity
   * @type {Array<string>}
   * @memberof ExtraStorageRequest
   */
  nvme?: Array<string>;
}
/**
 *
 * @export
 * @interface FindAssignmentResponse
 */
export interface FindAssignmentResponse {
  /**
   *
   * @type {Array<AssignmentResponse>}
   * @memberof FindAssignmentResponse
   */
  data: Array<AssignmentResponse>;
  /**
   *
   * @type {TagAssignmentSelfLinks}
   * @memberof FindAssignmentResponse
   */
  _links: TagAssignmentSelfLinks;
}
/**
 *
 * @export
 * @interface FindClientResponse
 */
export interface FindClientResponse {
  /**
   *
   * @type {Array<ClientResponse>}
   * @memberof FindClientResponse
   */
  data: Array<ClientResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindClientResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindCredentialResponse
 */
export interface FindCredentialResponse {
  /**
   *
   * @type {Array<CredentialData>}
   * @memberof FindCredentialResponse
   */
  data: Array<CredentialData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindCredentialResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindImageResponse
 */
export interface FindImageResponse {
  /**
   *
   * @type {Array<ImageResponse>}
   * @memberof FindImageResponse
   */
  data: Array<ImageResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindImageResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindInstanceResponse
 */
export interface FindInstanceResponse {
  /**
   *
   * @type {Array<InstanceResponse>}
   * @memberof FindInstanceResponse
   */
  data: Array<InstanceResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindInstanceResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindObjectStorageResponse
 */
export interface FindObjectStorageResponse {
  /**
   *
   * @type {Array<ObjectStorageResponse>}
   * @memberof FindObjectStorageResponse
   */
  data: Array<ObjectStorageResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindObjectStorageResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindPrivateNetworkResponse
 */
export interface FindPrivateNetworkResponse {
  /**
   *
   * @type {Array<PrivateNetworkResponse>}
   * @memberof FindPrivateNetworkResponse
   */
  data: Array<PrivateNetworkResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindPrivateNetworkResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindRoleResponse
 */
export interface FindRoleResponse {
  /**
   *
   * @type {Array<RoleResponse>}
   * @memberof FindRoleResponse
   */
  data: Array<RoleResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindRoleResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindSecretResponse
 */
export interface FindSecretResponse {
  /**
   *
   * @type {Array<SecretResponse>}
   * @memberof FindSecretResponse
   */
  data: Array<SecretResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindSecretResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindSnapshotResponse
 */
export interface FindSnapshotResponse {
  /**
   *
   * @type {Array<SnapshotResponse>}
   * @memberof FindSnapshotResponse
   */
  data: Array<SnapshotResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindSnapshotResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindTagResponse
 */
export interface FindTagResponse {
  /**
   *
   * @type {Array<TagResponse>}
   * @memberof FindTagResponse
   */
  data: Array<TagResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindTagResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindUserIsPasswordSetResponse
 */
export interface FindUserIsPasswordSetResponse {
  /**
   *
   * @type {Array<UserIsPasswordSetResponse>}
   * @memberof FindUserIsPasswordSetResponse
   */
  data: Array<UserIsPasswordSetResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindUserIsPasswordSetResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindUserResponse
 */
export interface FindUserResponse {
  /**
   *
   * @type {Array<UserResponse>}
   * @memberof FindUserResponse
   */
  data: Array<UserResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindUserResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindVipResponse
 */
export interface FindVipResponse {
  /**
   *
   * @type {Array<VipResponse>}
   * @memberof FindVipResponse
   */
  data: Array<VipResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindVipResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FindVncResponse
 */
export interface FindVncResponse {
  /**
   *
   * @type {Array<VncResponse>}
   * @memberof FindVncResponse
   */
  data: Array<VncResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof FindVncResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface FirewallingUpgradeRequest
 */
export interface FirewallingUpgradeRequest {
  /**
   * List of IDs of firewalls the upgraded instance should be assigned to immediately.   If the list is empty or this property is not provided the instance will be assigned to   your current default firewall.
   * @type {Array<string>}
   * @memberof FirewallingUpgradeRequest
   */
  assignFirewalls?: Array<string>;
}
/**
 *
 * @export
 * @interface GenerateClientSecretResponse
 */
export interface GenerateClientSecretResponse {
  /**
   *
   * @type {Array<ClientSecretResponse>}
   * @memberof GenerateClientSecretResponse
   */
  data: Array<ClientSecretResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof GenerateClientSecretResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface ImageAuditResponse
 */
export interface ImageAuditResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ImageAuditResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<ImageAuditResponseData>}
   * @memberof ImageAuditResponse
   */
  data: Array<ImageAuditResponseData>;
  /**
   *
   * @type {Links}
   * @memberof ImageAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ImageAuditResponseData
 */
export interface ImageAuditResponseData {
  /**
   * The ID of the audit entry.
   * @type {number}
   * @memberof ImageAuditResponseData
   */
  id: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof ImageAuditResponseData
   */
  action: ImageAuditResponseDataActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof ImageAuditResponseData
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof ImageAuditResponseData
   */
  tenantId: string;
  /**
   * Customer ID
   * @type {string}
   * @memberof ImageAuditResponseData
   */
  customerId: string;
  /**
   * Id of user who performed the change
   * @type {string}
   * @memberof ImageAuditResponseData
   */
  changedBy: string;
  /**
   * Name of the user which led to the change.
   * @type {string}
   * @memberof ImageAuditResponseData
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof ImageAuditResponseData
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof ImageAuditResponseData
   */
  traceId: string;
  /**
   * The identifier of the image
   * @type {string}
   * @memberof ImageAuditResponseData
   */
  imageId: string;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof ImageAuditResponseData
   */
  changes?: object;
}

export const ImageAuditResponseDataActionEnum = {
  Created: 'CREATED',
  Updated: 'UPDATED',
  Deleted: 'DELETED',
} as const;

export type ImageAuditResponseDataActionEnum =
  (typeof ImageAuditResponseDataActionEnum)[keyof typeof ImageAuditResponseDataActionEnum];

/**
 *
 * @export
 * @interface ImageResponse
 */
export interface ImageResponse {
  /**
   * Image\'s id
   * @type {string}
   * @memberof ImageResponse
   */
  imageId: string;
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof ImageResponse
   */
  tenantId: ImageResponseTenantIdEnum;
  /**
   * Customer ID
   * @type {string}
   * @memberof ImageResponse
   */
  customerId: string;
  /**
   * Image Name
   * @type {string}
   * @memberof ImageResponse
   */
  name: string;
  /**
   * Image Description
   * @type {string}
   * @memberof ImageResponse
   */
  description: string;
  /**
   * URL from where the image has been downloaded / provided.
   * @type {string}
   * @memberof ImageResponse
   */
  url: string;
  /**
   * Image Size in MB
   * @type {number}
   * @memberof ImageResponse
   */
  sizeMb: number;
  /**
   * Image Uploaded Size in MB
   * @type {number}
   * @memberof ImageResponse
   */
  uploadedSizeMb: number;
  /**
   * Type of operating system (OS)
   * @type {string}
   * @memberof ImageResponse
   */
  osType: string;
  /**
   * Version number to distinguish the contents of an image. Could be the version of the operating system for example.
   * @type {string}
   * @memberof ImageResponse
   */
  version: string;
  /**
   * Image format
   * @type {string}
   * @memberof ImageResponse
   */
  format: ImageResponseFormatEnum;
  /**
   * Image status (e.g. if image is still downloading)
   * @type {string}
   * @memberof ImageResponse
   */
  status: string;
  /**
   * Image download error message
   * @type {string}
   * @memberof ImageResponse
   */
  errorMessage: string;
  /**
   * Flag indicating that image is either a standard (true) or a custom image (false)
   * @type {boolean}
   * @memberof ImageResponse
   */
  standardImage: boolean;
  /**
   * The creation date time for the image
   * @type {string}
   * @memberof ImageResponse
   */
  creationDate: string;
  /**
   * The last modified date time for the image
   * @type {string}
   * @memberof ImageResponse
   */
  lastModifiedDate: string;
}

export const ImageResponseTenantIdEnum = {
  De: 'DE',
  Int: 'INT',
} as const;

export type ImageResponseTenantIdEnum =
  (typeof ImageResponseTenantIdEnum)[keyof typeof ImageResponseTenantIdEnum];
export const ImageResponseFormatEnum = {
  Iso: 'iso',
  Qcow2: 'qcow2',
} as const;

export type ImageResponseFormatEnum =
  (typeof ImageResponseFormatEnum)[keyof typeof ImageResponseFormatEnum];

/**
 *
 * @export
 * @interface InstanceAssignmentSelfLinks
 */
export interface InstanceAssignmentSelfLinks {
  /**
   * Link to current resource.
   * @type {string}
   * @memberof InstanceAssignmentSelfLinks
   */
  self: string;
  /**
   * Link to related Private Network.
   * @type {string}
   * @memberof InstanceAssignmentSelfLinks
   */
  virtualPrivateCloud: string;
  /**
   * Link to assigned instance.
   * @type {string}
   * @memberof InstanceAssignmentSelfLinks
   */
  instance: string;
}
/**
 *
 * @export
 * @interface InstanceRescueActionResponse
 */
export interface InstanceRescueActionResponse {
  /**
   *
   * @type {Array<InstanceRescueActionResponseData>}
   * @memberof InstanceRescueActionResponse
   */
  data: Array<InstanceRescueActionResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof InstanceRescueActionResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface InstanceRescueActionResponseData
 */
export interface InstanceRescueActionResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof InstanceRescueActionResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof InstanceRescueActionResponseData
   */
  customerId: string;
  /**
   * Compute instance / resource id
   * @type {number}
   * @memberof InstanceRescueActionResponseData
   */
  instanceId: number;
  /**
   * Action that was triggered
   * @type {string}
   * @memberof InstanceRescueActionResponseData
   */
  action: string;
}
/**
 *
 * @export
 * @interface InstanceResetPasswordActionResponse
 */
export interface InstanceResetPasswordActionResponse {
  /**
   *
   * @type {Array<InstanceResetPasswordActionResponseData>}
   * @memberof InstanceResetPasswordActionResponse
   */
  data: Array<InstanceResetPasswordActionResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof InstanceResetPasswordActionResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface InstanceResetPasswordActionResponseData
 */
export interface InstanceResetPasswordActionResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof InstanceResetPasswordActionResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof InstanceResetPasswordActionResponseData
   */
  customerId: string;
  /**
   * Compute instance / resource id
   * @type {number}
   * @memberof InstanceResetPasswordActionResponseData
   */
  instanceId: number;
  /**
   * Action that was triggered
   * @type {string}
   * @memberof InstanceResetPasswordActionResponseData
   */
  action: string;
}
/**
 *
 * @export
 * @interface InstanceResponse
 */
export interface InstanceResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof InstanceResponse
   */
  tenantId: InstanceResponseTenantIdEnum;
  /**
   * Customer ID
   * @type {string}
   * @memberof InstanceResponse
   */
  customerId: string;
  /**
   *
   * @type {Array<AdditionalIp>}
   * @memberof InstanceResponse
   */
  additionalIps: Array<AdditionalIp>;
  /**
   * Instance Name
   * @type {string}
   * @memberof InstanceResponse
   */
  name: string;
  /**
   * Instance display name
   * @type {string}
   * @memberof InstanceResponse
   */
  displayName: string;
  /**
   * Instance ID
   * @type {number}
   * @memberof InstanceResponse
   */
  instanceId: number;
  /**
   * The data center where your Private Network is located
   * @type {string}
   * @memberof InstanceResponse
   */
  dataCenter: string;
  /**
   * Instance region where the compute instance should be located.
   * @type {string}
   * @memberof InstanceResponse
   */
  region: string;
  /**
   * The name of the region where the instance is located.
   * @type {string}
   * @memberof InstanceResponse
   */
  regionName: string;
  /**
   * Product ID
   * @type {string}
   * @memberof InstanceResponse
   */
  productId: string;
  /**
   * Image\'s id
   * @type {string}
   * @memberof InstanceResponse
   */
  imageId: string;
  /**
   *
   * @type {IpConfig1}
   * @memberof InstanceResponse
   */
  ipConfig: IpConfig1;
  /**
   * MAC Address
   * @type {string}
   * @memberof InstanceResponse
   */
  macAddress: string;
  /**
   * Image RAM size in MB
   * @type {number}
   * @memberof InstanceResponse
   */
  ramMb: number;
  /**
   * CPU core count
   * @type {number}
   * @memberof InstanceResponse
   */
  cpuCores: number;
  /**
   * Type of operating system (OS)
   * @type {string}
   * @memberof InstanceResponse
   */
  osType: string;
  /**
   * Image Disk size in MB
   * @type {number}
   * @memberof InstanceResponse
   */
  diskMb: number;
  /**
   * Array of `secretId`s of public SSH keys for logging into as `defaultUser` with administrator/root privileges. Applies to Linux/BSD systems. Please refer to Secrets Management API.
   * @type {Array<number>}
   * @memberof InstanceResponse
   */
  sshKeys: Array<number>;
  /**
   * The creation date for the instance
   * @type {string}
   * @memberof InstanceResponse
   */
  createdDate: string;
  /**
   * The date on which the instance will be cancelled
   * @type {string}
   * @memberof InstanceResponse
   */
  cancelDate: string;
  /**
   *
   * @type {InstanceStatus}
   * @memberof InstanceResponse
   */
  status: InstanceStatus;
  /**
   * ID of host system
   * @type {number}
   * @memberof InstanceResponse
   */
  vHostId: number;
  /**
   * Number of host system
   * @type {number}
   * @memberof InstanceResponse
   */
  vHostNumber: number;
  /**
   * Name of host system
   * @type {string}
   * @memberof InstanceResponse
   */
  vHostName: string;
  /**
   *
   * @type {Array<AddOnResponse>}
   * @memberof InstanceResponse
   */
  addOns: Array<AddOnResponse>;
  /**
   * Message in case of an error.
   * @type {string}
   * @memberof InstanceResponse
   */
  errorMessage?: string;
  /**
   * Instance\'s category depending on Product Id
   * @type {string}
   * @memberof InstanceResponse
   */
  productType: InstanceResponseProductTypeEnum;
  /**
   * Instance\'s Product Name
   * @type {string}
   * @memberof InstanceResponse
   */
  productName: string;
  /**
   * Default user name created for login during (re-)installation with administrative privileges. Allowed values for Linux/BSD are `admin` (use sudo to apply administrative privileges like root) or `root`. Allowed values for Windows are `admin` (has administrative privileges like administrator) or `administrator`.
   * @type {string}
   * @memberof InstanceResponse
   */
  defaultUser?: InstanceResponseDefaultUserEnum;
}

export const InstanceResponseTenantIdEnum = {
  De: 'DE',
  Int: 'INT',
} as const;

export type InstanceResponseTenantIdEnum =
  (typeof InstanceResponseTenantIdEnum)[keyof typeof InstanceResponseTenantIdEnum];
export const InstanceResponseProductTypeEnum = {
  Hdd: 'hdd',
  Ssd: 'ssd',
  Vds: 'vds',
  Nvme: 'nvme',
} as const;

export type InstanceResponseProductTypeEnum =
  (typeof InstanceResponseProductTypeEnum)[keyof typeof InstanceResponseProductTypeEnum];
export const InstanceResponseDefaultUserEnum = {
  Root: 'root',
  Admin: 'admin',
  Administrator: 'administrator',
} as const;

export type InstanceResponseDefaultUserEnum =
  (typeof InstanceResponseDefaultUserEnum)[keyof typeof InstanceResponseDefaultUserEnum];

/**
 *
 * @export
 * @interface InstanceRestartActionResponse
 */
export interface InstanceRestartActionResponse {
  /**
   *
   * @type {Array<InstanceRestartActionResponseData>}
   * @memberof InstanceRestartActionResponse
   */
  data: Array<InstanceRestartActionResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof InstanceRestartActionResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface InstanceRestartActionResponseData
 */
export interface InstanceRestartActionResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof InstanceRestartActionResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof InstanceRestartActionResponseData
   */
  customerId: string;
  /**
   * Compute instance / resource id
   * @type {number}
   * @memberof InstanceRestartActionResponseData
   */
  instanceId: number;
  /**
   * Action that was triggered
   * @type {string}
   * @memberof InstanceRestartActionResponseData
   */
  action: string;
}
/**
 *
 * @export
 * @interface InstanceShutdownActionResponse
 */
export interface InstanceShutdownActionResponse {
  /**
   *
   * @type {Array<InstanceShutdownActionResponseData>}
   * @memberof InstanceShutdownActionResponse
   */
  data: Array<InstanceShutdownActionResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof InstanceShutdownActionResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface InstanceShutdownActionResponseData
 */
export interface InstanceShutdownActionResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof InstanceShutdownActionResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof InstanceShutdownActionResponseData
   */
  customerId: string;
  /**
   * Compute instance / resource id
   * @type {number}
   * @memberof InstanceShutdownActionResponseData
   */
  instanceId: number;
  /**
   * Action that was triggered
   * @type {string}
   * @memberof InstanceShutdownActionResponseData
   */
  action: string;
}
/**
 *
 * @export
 * @interface InstanceStartActionResponse
 */
export interface InstanceStartActionResponse {
  /**
   *
   * @type {Array<InstanceStartActionResponseData>}
   * @memberof InstanceStartActionResponse
   */
  data: Array<InstanceStartActionResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof InstanceStartActionResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface InstanceStartActionResponseData
 */
export interface InstanceStartActionResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof InstanceStartActionResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof InstanceStartActionResponseData
   */
  customerId: string;
  /**
   * Compute instance / resource id
   * @type {number}
   * @memberof InstanceStartActionResponseData
   */
  instanceId: number;
  /**
   * Action that was triggered
   * @type {string}
   * @memberof InstanceStartActionResponseData
   */
  action: string;
}
/**
 *
 * @export
 * @enum {string}
 */

export const InstanceStatus = {
  Provisioning: 'provisioning',
  Uninstalled: 'uninstalled',
  Running: 'running',
  Stopped: 'stopped',
  Error: 'error',
  Installing: 'installing',
  Unknown: 'unknown',
  ManualProvisioning: 'manual_provisioning',
  ProductNotAvailable: 'product_not_available',
  VerificationRequired: 'verification_required',
  Rescue: 'rescue',
  PendingPayment: 'pending_payment',
  Other: 'other',
  ResetPassword: 'reset_password',
} as const;

export type InstanceStatus =
  (typeof InstanceStatus)[keyof typeof InstanceStatus];

/**
 *
 * @export
 * @interface InstanceStopActionResponse
 */
export interface InstanceStopActionResponse {
  /**
   *
   * @type {Array<InstanceStopActionResponseData>}
   * @memberof InstanceStopActionResponse
   */
  data: Array<InstanceStopActionResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof InstanceStopActionResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface InstanceStopActionResponseData
 */
export interface InstanceStopActionResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof InstanceStopActionResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof InstanceStopActionResponseData
   */
  customerId: string;
  /**
   * Compute instance / resource id
   * @type {number}
   * @memberof InstanceStopActionResponseData
   */
  instanceId: number;
  /**
   * Action that was triggered
   * @type {string}
   * @memberof InstanceStopActionResponseData
   */
  action: string;
}
/**
 *
 * @export
 * @interface Instances
 */
export interface Instances {
  /**
   * Instance id
   * @type {number}
   * @memberof Instances
   */
  instanceId: number;
  /**
   * Instance display name
   * @type {string}
   * @memberof Instances
   */
  displayName: string;
  /**
   * Instance name
   * @type {string}
   * @memberof Instances
   */
  name: string;
  /**
   * Product id
   * @type {string}
   * @memberof Instances
   */
  productId: string;
  /**
   *
   * @type {PrivateIpConfig}
   * @memberof Instances
   */
  privateIpConfig: PrivateIpConfig;
  /**
   *
   * @type {IpConfig}
   * @memberof Instances
   */
  ipConfig: IpConfig;
  /**
   * State of the instance in the Private Network
   * @type {string}
   * @memberof Instances
   */
  status: InstancesStatusEnum;
  /**
   * Message in case of an error.
   * @type {string}
   * @memberof Instances
   */
  errorMessage?: string;
}

export const InstancesStatusEnum = {
  Ok: 'ok',
  Restart: 'restart',
  Reinstall: 'reinstall',
  ReinstallationFailed: 'reinstallation failed',
  Installing: 'installing',
} as const;

export type InstancesStatusEnum =
  (typeof InstancesStatusEnum)[keyof typeof InstancesStatusEnum];

/**
 *
 * @export
 * @interface InstancesActionsAuditResponse
 */
export interface InstancesActionsAuditResponse {
  /**
   * The ID of the audit entry.
   * @type {number}
   * @memberof InstancesActionsAuditResponse
   */
  id: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof InstancesActionsAuditResponse
   */
  action: InstancesActionsAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof InstancesActionsAuditResponse
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof InstancesActionsAuditResponse
   */
  tenantId: string;
  /**
   * Customer ID
   * @type {string}
   * @memberof InstancesActionsAuditResponse
   */
  customerId: string;
  /**
   * Id of user who performed the change
   * @type {string}
   * @memberof InstancesActionsAuditResponse
   */
  changedBy: string;
  /**
   * Name of the user which led to the change.
   * @type {string}
   * @memberof InstancesActionsAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof InstancesActionsAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof InstancesActionsAuditResponse
   */
  traceId: string;
  /**
   * The identifier of the instancesActions
   * @type {number}
   * @memberof InstancesActionsAuditResponse
   */
  instanceId: number;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof InstancesActionsAuditResponse
   */
  changes?: object;
}

export const InstancesActionsAuditResponseActionEnum = {
  Created: 'CREATED',
  Updated: 'UPDATED',
  Deleted: 'DELETED',
} as const;

export type InstancesActionsAuditResponseActionEnum =
  (typeof InstancesActionsAuditResponseActionEnum)[keyof typeof InstancesActionsAuditResponseActionEnum];

/**
 *
 * @export
 * @interface InstancesActionsRescueRequest
 */
export interface InstancesActionsRescueRequest {
  /**
   * `secretId` of the password to login into rescue system for the `root` user.
   * @type {number}
   * @memberof InstancesActionsRescueRequest
   */
  rootPassword?: number;
  /**
   * Array of `secretId`s of public SSH keys for logging into rescue system as `root` user.
   * @type {Array<number>}
   * @memberof InstancesActionsRescueRequest
   */
  sshKeys?: Array<number>;
  /**
   * [Cloud-Init](https://cloud-init.io/) Config in order to customize during start of compute instance.
   * @type {string}
   * @memberof InstancesActionsRescueRequest
   */
  userData?: string;
}
/**
 *
 * @export
 * @interface InstancesAuditResponse
 */
export interface InstancesAuditResponse {
  /**
   * The ID of the audit entry.
   * @type {number}
   * @memberof InstancesAuditResponse
   */
  id: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof InstancesAuditResponse
   */
  action: InstancesAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof InstancesAuditResponse
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof InstancesAuditResponse
   */
  tenantId: string;
  /**
   * Customer ID
   * @type {string}
   * @memberof InstancesAuditResponse
   */
  customerId: string;
  /**
   * Id of user who performed the change
   * @type {string}
   * @memberof InstancesAuditResponse
   */
  changedBy: string;
  /**
   * Name of the user which led to the change.
   * @type {string}
   * @memberof InstancesAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof InstancesAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof InstancesAuditResponse
   */
  traceId: string;
  /**
   * The identifier of the instance
   * @type {number}
   * @memberof InstancesAuditResponse
   */
  instanceId: number;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof InstancesAuditResponse
   */
  changes?: object;
}

export const InstancesAuditResponseActionEnum = {
  Created: 'CREATED',
  Updated: 'UPDATED',
  Deleted: 'DELETED',
} as const;

export type InstancesAuditResponseActionEnum =
  (typeof InstancesAuditResponseActionEnum)[keyof typeof InstancesAuditResponseActionEnum];

/**
 *
 * @export
 * @interface InstancesResetPasswordActionsRequest
 */
export interface InstancesResetPasswordActionsRequest {
  /**
   * Array of `secretId`s of public SSH keys for logging into as `defaultUser` with administrator/root privileges. Applies to Linux/BSD systems. Please refer to Secrets Management API.
   * @type {Array<number>}
   * @memberof InstancesResetPasswordActionsRequest
   */
  sshKeys?: Array<number>;
  /**
   * `secretId` of the password for the `defaultUser` with administrator/root privileges. For Linux/BSD please use SSH, for Windows RDP. Please refer to Secrets Management API.
   * @type {number}
   * @memberof InstancesResetPasswordActionsRequest
   */
  rootPassword?: number;
  /**
   * [Cloud-Init](https://cloud-init.io/) Config in order to customize during start of compute instance.
   * @type {string}
   * @memberof InstancesResetPasswordActionsRequest
   */
  userData?: string;
}
/**
 *
 * @export
 * @interface IpConfig
 */
export interface IpConfig {
  /**
   *
   * @type {IpV41}
   * @memberof IpConfig
   */
  v4: IpV41;
  /**
   *
   * @type {IpV6}
   * @memberof IpConfig
   */
  v6: IpV6;
}
/**
 *
 * @export
 * @interface IpConfig1
 */
export interface IpConfig1 {
  /**
   *
   * @type {IpV42}
   * @memberof IpConfig1
   */
  v4: IpV42;
  /**
   *
   * @type {IpV6}
   * @memberof IpConfig1
   */
  v6: IpV6;
}
/**
 *
 * @export
 * @interface IpV4
 */
export interface IpV4 {
  /**
   * IP address
   * @type {string}
   * @memberof IpV4
   */
  ip: string;
  /**
   * Gateway
   * @type {string}
   * @memberof IpV4
   */
  gateway: string;
  /**
   * Netmask CIDR
   * @type {number}
   * @memberof IpV4
   */
  netmaskCidr: number;
  /**
   * Broadcast address
   * @type {string}
   * @memberof IpV4
   */
  broadcast: string;
  /**
   * Net address
   * @type {string}
   * @memberof IpV4
   */
  net: string;
}
/**
 *
 * @export
 * @interface IpV41
 */
export interface IpV41 {
  /**
   * IP Address
   * @type {string}
   * @memberof IpV41
   */
  ip: string;
  /**
   * Netmask CIDR
   * @type {number}
   * @memberof IpV41
   */
  netmaskCidr: number;
  /**
   * Gateway
   * @type {string}
   * @memberof IpV41
   */
  gateway: string;
}
/**
 *
 * @export
 * @interface IpV42
 */
export interface IpV42 {
  /**
   * IP Address
   * @type {string}
   * @memberof IpV42
   */
  ip: string;
  /**
   * Netmask CIDR
   * @type {number}
   * @memberof IpV42
   */
  netmaskCidr: number;
  /**
   * Gateway
   * @type {string}
   * @memberof IpV42
   */
  gateway: string;
}
/**
 *
 * @export
 * @interface IpV6
 */
export interface IpV6 {
  /**
   * IP Address
   * @type {string}
   * @memberof IpV6
   */
  ip: string;
  /**
   * Netmask CIDR
   * @type {number}
   * @memberof IpV6
   */
  netmaskCidr: number;
  /**
   * Gateway
   * @type {string}
   * @memberof IpV6
   */
  gateway: string;
}
/**
 *
 * @export
 * @interface Links
 */
export interface Links {
  /**
   * Link to current resource.
   * @type {string}
   * @memberof Links
   */
  self: string;
  /**
   * Link to first page, if applicable.
   * @type {string}
   * @memberof Links
   */
  first: string;
  /**
   * Link to previous page, if applicable.
   * @type {string}
   * @memberof Links
   */
  previous?: string;
  /**
   * Link to next page, if applicable.
   * @type {string}
   * @memberof Links
   */
  next?: string;
  /**
   * Link to last page, if applicable.
   * @type {string}
   * @memberof Links
   */
  last: string;
}
/**
 *
 * @export
 * @interface ListApiPermissionResponse
 */
export interface ListApiPermissionResponse {
  /**
   *
   * @type {Array<ApiPermissionsResponse>}
   * @memberof ListApiPermissionResponse
   */
  data: Array<ApiPermissionsResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListApiPermissionResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListApplicationsResponse
 */
export interface ListApplicationsResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListApplicationsResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<ApplicationResponse>}
   * @memberof ListApplicationsResponse
   */
  data: Array<ApplicationResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListApplicationsResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListAssignmentAuditsResponse
 */
export interface ListAssignmentAuditsResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListAssignmentAuditsResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<AssignmentAuditResponse>}
   * @memberof ListAssignmentAuditsResponse
   */
  data: Array<AssignmentAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListAssignmentAuditsResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListAssignmentResponse
 */
export interface ListAssignmentResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListAssignmentResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<AssignmentResponse>}
   * @memberof ListAssignmentResponse
   */
  data: Array<AssignmentResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListAssignmentResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListCredentialResponse
 */
export interface ListCredentialResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListCredentialResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<CredentialData>}
   * @memberof ListCredentialResponse
   */
  data: Array<CredentialData>;
  /**
   *
   * @type {Links}
   * @memberof ListCredentialResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListDataCenterResponse
 */
export interface ListDataCenterResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListDataCenterResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<DataCenterResponse>}
   * @memberof ListDataCenterResponse
   */
  data: Array<DataCenterResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListDataCenterResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListImageResponse
 */
export interface ListImageResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListImageResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<ListImageResponseData>}
   * @memberof ListImageResponse
   */
  data: Array<ListImageResponseData>;
  /**
   *
   * @type {Links}
   * @memberof ListImageResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListImageResponseData
 */
export interface ListImageResponseData {
  /**
   * Image\'s id
   * @type {string}
   * @memberof ListImageResponseData
   */
  imageId: string;
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof ListImageResponseData
   */
  tenantId: ListImageResponseDataTenantIdEnum;
  /**
   * Customer ID
   * @type {string}
   * @memberof ListImageResponseData
   */
  customerId: string;
  /**
   * Image Name
   * @type {string}
   * @memberof ListImageResponseData
   */
  name: string;
  /**
   * Image Description
   * @type {string}
   * @memberof ListImageResponseData
   */
  description: string;
  /**
   * URL from where the image has been downloaded / provided.
   * @type {string}
   * @memberof ListImageResponseData
   */
  url: string;
  /**
   * Image Size in MB
   * @type {number}
   * @memberof ListImageResponseData
   */
  sizeMb: number;
  /**
   * Image Uploaded Size in MB
   * @type {number}
   * @memberof ListImageResponseData
   */
  uploadedSizeMb: number;
  /**
   * Type of operating system (OS)
   * @type {string}
   * @memberof ListImageResponseData
   */
  osType: string;
  /**
   * Version number to distinguish the contents of an image. Could be the version of the operating system for example.
   * @type {string}
   * @memberof ListImageResponseData
   */
  version: string;
  /**
   * Image format
   * @type {string}
   * @memberof ListImageResponseData
   */
  format: ListImageResponseDataFormatEnum;
  /**
   * Image status (e.g. if image is still downloading)
   * @type {string}
   * @memberof ListImageResponseData
   */
  status: string;
  /**
   * Image download error message
   * @type {string}
   * @memberof ListImageResponseData
   */
  errorMessage: string;
  /**
   * Flag indicating that image is either a standard (true) or a custom image (false)
   * @type {boolean}
   * @memberof ListImageResponseData
   */
  standardImage: boolean;
  /**
   * The creation date time for the image
   * @type {string}
   * @memberof ListImageResponseData
   */
  creationDate: string;
  /**
   * The last modified date time for the image
   * @type {string}
   * @memberof ListImageResponseData
   */
  lastModifiedDate: string;
  /**
   * The tags assigned to the image
   * @type {Array<AssignedTagResponse>}
   * @memberof ListImageResponseData
   */
  tags: Array<AssignedTagResponse>;
}

export const ListImageResponseDataTenantIdEnum = {
  De: 'DE',
  Int: 'INT',
} as const;

export type ListImageResponseDataTenantIdEnum =
  (typeof ListImageResponseDataTenantIdEnum)[keyof typeof ListImageResponseDataTenantIdEnum];
export const ListImageResponseDataFormatEnum = {
  Iso: 'iso',
  Qcow2: 'qcow2',
} as const;

export type ListImageResponseDataFormatEnum =
  (typeof ListImageResponseDataFormatEnum)[keyof typeof ListImageResponseDataFormatEnum];

/**
 *
 * @export
 * @interface ListInstancesActionsAuditResponse
 */
export interface ListInstancesActionsAuditResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListInstancesActionsAuditResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<InstancesActionsAuditResponse>}
   * @memberof ListInstancesActionsAuditResponse
   */
  data: Array<InstancesActionsAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListInstancesActionsAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListInstancesAuditResponse
 */
export interface ListInstancesAuditResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListInstancesAuditResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<InstancesAuditResponse>}
   * @memberof ListInstancesAuditResponse
   */
  data: Array<InstancesAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListInstancesAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListInstancesResponse
 */
export interface ListInstancesResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListInstancesResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<ListInstancesResponseData>}
   * @memberof ListInstancesResponse
   */
  data: Array<ListInstancesResponseData>;
  /**
   *
   * @type {Links}
   * @memberof ListInstancesResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListInstancesResponseData
 */
export interface ListInstancesResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  tenantId: ListInstancesResponseDataTenantIdEnum;
  /**
   * Customer ID
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  customerId: string;
  /**
   *
   * @type {Array<AdditionalIp>}
   * @memberof ListInstancesResponseData
   */
  additionalIps: Array<AdditionalIp>;
  /**
   * Instance Name
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  name: string;
  /**
   * Instance display name
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  displayName: string;
  /**
   * Instance ID
   * @type {number}
   * @memberof ListInstancesResponseData
   */
  instanceId: number;
  /**
   * The data center where your Private Network is located
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  dataCenter: string;
  /**
   * Instance region where the compute instance should be located.
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  region: string;
  /**
   * The name of the region where the instance is located.
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  regionName: string;
  /**
   * Product ID
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  productId: string;
  /**
   * Image\'s id
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  imageId: string;
  /**
   *
   * @type {IpConfig1}
   * @memberof ListInstancesResponseData
   */
  ipConfig: IpConfig1;
  /**
   * MAC Address
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  macAddress: string;
  /**
   * Image RAM size in MB
   * @type {number}
   * @memberof ListInstancesResponseData
   */
  ramMb: number;
  /**
   * CPU core count
   * @type {number}
   * @memberof ListInstancesResponseData
   */
  cpuCores: number;
  /**
   * Type of operating system (OS)
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  osType: string;
  /**
   * Image Disk size in MB
   * @type {number}
   * @memberof ListInstancesResponseData
   */
  diskMb: number;
  /**
   * Array of `secretId`s of public SSH keys for logging into as `defaultUser` with administrator/root privileges. Applies to Linux/BSD systems. Please refer to Secrets Management API.
   * @type {Array<number>}
   * @memberof ListInstancesResponseData
   */
  sshKeys: Array<number>;
  /**
   * The creation date for the instance
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  createdDate: string;
  /**
   * The date on which the instance will be cancelled
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  cancelDate: string;
  /**
   *
   * @type {InstanceStatus}
   * @memberof ListInstancesResponseData
   */
  status: InstanceStatus;
  /**
   * ID of host system
   * @type {number}
   * @memberof ListInstancesResponseData
   */
  vHostId: number;
  /**
   * Number of host system
   * @type {number}
   * @memberof ListInstancesResponseData
   */
  vHostNumber: number;
  /**
   * Name of host system
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  vHostName: string;
  /**
   *
   * @type {Array<AddOnResponse>}
   * @memberof ListInstancesResponseData
   */
  addOns: Array<AddOnResponse>;
  /**
   * Message in case of an error.
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  errorMessage?: string;
  /**
   * Instance\'s category depending on Product Id
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  productType: ListInstancesResponseDataProductTypeEnum;
  /**
   * Instance\'s Product Name
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  productName: string;
  /**
   * Default user name created for login during (re-)installation with administrative privileges. Allowed values for Linux/BSD are `admin` (use sudo to apply administrative privileges like root) or `root`. Allowed values for Windows are `admin` (has administrative privileges like administrator) or `administrator`.
   * @type {string}
   * @memberof ListInstancesResponseData
   */
  defaultUser?: ListInstancesResponseDataDefaultUserEnum;
}

export const ListInstancesResponseDataTenantIdEnum = {
  De: 'DE',
  Int: 'INT',
} as const;

export type ListInstancesResponseDataTenantIdEnum =
  (typeof ListInstancesResponseDataTenantIdEnum)[keyof typeof ListInstancesResponseDataTenantIdEnum];
export const ListInstancesResponseDataProductTypeEnum = {
  Hdd: 'hdd',
  Ssd: 'ssd',
  Vds: 'vds',
  Nvme: 'nvme',
} as const;

export type ListInstancesResponseDataProductTypeEnum =
  (typeof ListInstancesResponseDataProductTypeEnum)[keyof typeof ListInstancesResponseDataProductTypeEnum];
export const ListInstancesResponseDataDefaultUserEnum = {
  Root: 'root',
  Admin: 'admin',
  Administrator: 'administrator',
} as const;

export type ListInstancesResponseDataDefaultUserEnum =
  (typeof ListInstancesResponseDataDefaultUserEnum)[keyof typeof ListInstancesResponseDataDefaultUserEnum];

/**
 *
 * @export
 * @interface ListObjectStorageAuditResponse
 */
export interface ListObjectStorageAuditResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListObjectStorageAuditResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<ObjectStorageAuditResponse>}
   * @memberof ListObjectStorageAuditResponse
   */
  data: Array<ObjectStorageAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListObjectStorageAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListObjectStorageResponse
 */
export interface ListObjectStorageResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListObjectStorageResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<ObjectStorageResponse>}
   * @memberof ListObjectStorageResponse
   */
  data: Array<ObjectStorageResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListObjectStorageResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListPrivateNetworkAuditResponse
 */
export interface ListPrivateNetworkAuditResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListPrivateNetworkAuditResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<PrivateNetworkAuditResponse>}
   * @memberof ListPrivateNetworkAuditResponse
   */
  data: Array<PrivateNetworkAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListPrivateNetworkAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListPrivateNetworkResponse
 */
export interface ListPrivateNetworkResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListPrivateNetworkResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<ListPrivateNetworkResponseData>}
   * @memberof ListPrivateNetworkResponse
   */
  data: Array<ListPrivateNetworkResponseData>;
  /**
   *
   * @type {Links}
   * @memberof ListPrivateNetworkResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListPrivateNetworkResponseData
 */
export interface ListPrivateNetworkResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof ListPrivateNetworkResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof ListPrivateNetworkResponseData
   */
  customerId: string;
  /**
   * Private Network\'s id
   * @type {number}
   * @memberof ListPrivateNetworkResponseData
   */
  privateNetworkId: number;
  /**
   * The data center where your Private Network is located
   * @type {string}
   * @memberof ListPrivateNetworkResponseData
   */
  dataCenter: string;
  /**
   * The slug of the region where your Private Network is located
   * @type {string}
   * @memberof ListPrivateNetworkResponseData
   */
  region: string;
  /**
   * The region where your Private Network is located
   * @type {string}
   * @memberof ListPrivateNetworkResponseData
   */
  regionName: string;
  /**
   * The name of the Private Network
   * @type {string}
   * @memberof ListPrivateNetworkResponseData
   */
  name: string;
  /**
   * The description of the Private Network
   * @type {string}
   * @memberof ListPrivateNetworkResponseData
   */
  description: string;
  /**
   * The cidr range of the Private Network
   * @type {string}
   * @memberof ListPrivateNetworkResponseData
   */
  cidr: string;
  /**
   * The total available IPs of the Private Network
   * @type {number}
   * @memberof ListPrivateNetworkResponseData
   */
  availableIps: number;
  /**
   * The creation date of the Private Network
   * @type {string}
   * @memberof ListPrivateNetworkResponseData
   */
  createdDate: string;
  /**
   *
   * @type {Array<Instances>}
   * @memberof ListPrivateNetworkResponseData
   */
  instances: Array<Instances>;
}
/**
 *
 * @export
 * @interface ListRoleAuditResponse
 */
export interface ListRoleAuditResponse {
  /**
   *
   * @type {Array<RoleAuditResponse>}
   * @memberof ListRoleAuditResponse
   */
  data: Array<RoleAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListRoleAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListRoleResponse
 */
export interface ListRoleResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListRoleResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<RoleResponse>}
   * @memberof ListRoleResponse
   */
  data: Array<RoleResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListRoleResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListSecretAuditResponse
 */
export interface ListSecretAuditResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListSecretAuditResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<SecretAuditResponse>}
   * @memberof ListSecretAuditResponse
   */
  data: Array<SecretAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListSecretAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListSecretResponse
 */
export interface ListSecretResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListSecretResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<SecretResponse>}
   * @memberof ListSecretResponse
   */
  data: Array<SecretResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof ListSecretResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface ListSnapshotResponse
 */
export interface ListSnapshotResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListSnapshotResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<SnapshotResponse>}
   * @memberof ListSnapshotResponse
   */
  data: Array<SnapshotResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListSnapshotResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListSnapshotsAuditResponse
 */
export interface ListSnapshotsAuditResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListSnapshotsAuditResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<SnapshotsAuditResponse>}
   * @memberof ListSnapshotsAuditResponse
   */
  data: Array<SnapshotsAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListSnapshotsAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListTagAuditsResponse
 */
export interface ListTagAuditsResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListTagAuditsResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<TagAuditResponse>}
   * @memberof ListTagAuditsResponse
   */
  data: Array<TagAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListTagAuditsResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListTagResponse
 */
export interface ListTagResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListTagResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<TagResponse>}
   * @memberof ListTagResponse
   */
  data: Array<TagResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListTagResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListUserAuditResponse
 */
export interface ListUserAuditResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListUserAuditResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<UserAuditResponse>}
   * @memberof ListUserAuditResponse
   */
  data: Array<UserAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListUserAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListUserResponse
 */
export interface ListUserResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListUserResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<UserResponse>}
   * @memberof ListUserResponse
   */
  data: Array<UserResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListUserResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListVipAuditResponse
 */
export interface ListVipAuditResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListVipAuditResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<VipAuditResponse>}
   * @memberof ListVipAuditResponse
   */
  data: Array<VipAuditResponse>;
  /**
   *
   * @type {Links}
   * @memberof ListVipAuditResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListVipResponse
 */
export interface ListVipResponse {
  /**
   * Data about pagination like how many results, pages, page size.
   * @type {PaginationMeta}
   * @memberof ListVipResponse
   */
  _pagination: PaginationMeta;
  /**
   *
   * @type {Array<ListVipResponseData>}
   * @memberof ListVipResponse
   */
  data: Array<ListVipResponseData>;
  /**
   *
   * @type {Links}
   * @memberof ListVipResponse
   */
  _links: Links;
}
/**
 *
 * @export
 * @interface ListVipResponseData
 */
export interface ListVipResponseData {
  /**
   * Tenant Id.
   * @type {string}
   * @memberof ListVipResponseData
   */
  tenantId: string;
  /**
   * Customer\'s Id.
   * @type {string}
   * @memberof ListVipResponseData
   */
  customerId: string;
  /**
   * Vip uuid.
   * @type {string}
   * @memberof ListVipResponseData
   */
  vipId: string;
  /**
   * data center.
   * @type {string}
   * @memberof ListVipResponseData
   */
  dataCenter: string;
  /**
   * Region
   * @type {string}
   * @memberof ListVipResponseData
   */
  region: string;
  /**
   * Resource Id.
   * @type {string}
   * @memberof ListVipResponseData
   */
  resourceId: string;
  /**
   * The resourceType using the VIP.
   * @type {string}
   * @memberof ListVipResponseData
   */
  resourceType?: ListVipResponseDataResourceTypeEnum;
  /**
   * Resource name.
   * @type {string}
   * @memberof ListVipResponseData
   */
  resourceName: string;
  /**
   * Resource display name.
   * @type {string}
   * @memberof ListVipResponseData
   */
  resourceDisplayName: string;
  /**
   * Version of Ip.
   * @type {string}
   * @memberof ListVipResponseData
   */
  ipVersion: ListVipResponseDataIpVersionEnum;
  /**
   * The VIP type.
   * @type {string}
   * @memberof ListVipResponseData
   */
  type?: ListVipResponseDataTypeEnum;
  /**
   *
   * @type {IpV4}
   * @memberof ListVipResponseData
   */
  v4?: IpV4;
}

export const ListVipResponseDataResourceTypeEnum = {
  Instances: 'instances',
  BareMetal: 'bare-metal',
  Null: 'null',
} as const;

export type ListVipResponseDataResourceTypeEnum =
  (typeof ListVipResponseDataResourceTypeEnum)[keyof typeof ListVipResponseDataResourceTypeEnum];
export const ListVipResponseDataIpVersionEnum = {
  V4: 'v4',
} as const;

export type ListVipResponseDataIpVersionEnum =
  (typeof ListVipResponseDataIpVersionEnum)[keyof typeof ListVipResponseDataIpVersionEnum];
export const ListVipResponseDataTypeEnum = {
  Additional: 'additional',
  Floating: 'floating',
} as const;

export type ListVipResponseDataTypeEnum =
  (typeof ListVipResponseDataTypeEnum)[keyof typeof ListVipResponseDataTypeEnum];

/**
 *
 * @export
 * @interface MinimumRequirements
 */
export interface MinimumRequirements {
  /**
   * CPU Cores Requirement
   * @type {number}
   * @memberof MinimumRequirements
   */
  cpuCores?: number;
  /**
   * Memory Requirement in MB
   * @type {number}
   * @memberof MinimumRequirements
   */
  ramMb?: number;
  /**
   * Storage Requirement in MB
   * @type {number}
   * @memberof MinimumRequirements
   */
  diskMb?: number;
  /**
   * Valid Product IDs for this application
   * @type {Array<string>}
   * @memberof MinimumRequirements
   */
  validProductIds?: Array<string>;
}
/**
 *
 * @export
 * @interface ObjectStorageAuditResponse
 */
export interface ObjectStorageAuditResponse {
  /**
   * The identifier of the audit entry.
   * @type {number}
   * @memberof ObjectStorageAuditResponse
   */
  id: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof ObjectStorageAuditResponse
   */
  action: ObjectStorageAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof ObjectStorageAuditResponse
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof ObjectStorageAuditResponse
   */
  tenantId: string;
  /**
   * Customer number
   * @type {string}
   * @memberof ObjectStorageAuditResponse
   */
  customerId: string;
  /**
   * User ID
   * @type {string}
   * @memberof ObjectStorageAuditResponse
   */
  changedBy: string;
  /**
   * Name of the user which led to the change.
   * @type {string}
   * @memberof ObjectStorageAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof ObjectStorageAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof ObjectStorageAuditResponse
   */
  traceId: string;
  /**
   * Object Storage Id
   * @type {string}
   * @memberof ObjectStorageAuditResponse
   */
  objectStorageId: string;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof ObjectStorageAuditResponse
   */
  changes?: object;
}

export const ObjectStorageAuditResponseActionEnum = {
  Created: 'CREATED',
  Updated: 'UPDATED',
  Deleted: 'DELETED',
} as const;

export type ObjectStorageAuditResponseActionEnum =
  (typeof ObjectStorageAuditResponseActionEnum)[keyof typeof ObjectStorageAuditResponseActionEnum];

/**
 *
 * @export
 * @interface ObjectStorageResponse
 */
export interface ObjectStorageResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  customerId: string;
  /**
   * Your object storage id
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  objectStorageId: string;
  /**
   * Creation date for object storage.
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  createdDate: string;
  /**
   * Cancellation date for object storage.
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  cancelDate: string;
  /**
   * Autoscaling settings
   * @type {AutoScalingTypeResponse}
   * @memberof ObjectStorageResponse
   */
  autoScaling: AutoScalingTypeResponse;
  /**
   * Data center your object storage is located
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  dataCenter: string;
  /**
   * Amount of purchased / requested object storage in TB.
   * @type {number}
   * @memberof ObjectStorageResponse
   */
  totalPurchasedSpaceTB: number;
  /**
   * S3 URL to connect to your S3 compatible object storage
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  s3Url: string;
  /**
   * Your S3 tenantId. Only required for public sharing.
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  s3TenantId: string;
  /**
   * The object storage status
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  status: ObjectStorageResponseStatusEnum;
  /**
   * The region where your object storage is located
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  region: string;
  /**
   * Display name for object storage.
   * @type {string}
   * @memberof ObjectStorageResponse
   */
  displayName: string;
}

export const ObjectStorageResponseStatusEnum = {
  Ready: 'READY',
  Provisioning: 'PROVISIONING',
  Upgrading: 'UPGRADING',
  Cancelled: 'CANCELLED',
  Error: 'ERROR',
  Enabled: 'ENABLED',
  Disabled: 'DISABLED',
  ManualProvisioning: 'MANUAL_PROVISIONING',
  ProductNotAvailable: 'PRODUCT_NOT_AVAILABLE',
  LimitExceeded: 'LIMIT_EXCEEDED',
  VerificationRequired: 'VERIFICATION_REQUIRED',
  Completed: 'COMPLETED',
  OrderProcessing: 'ORDER_PROCESSING',
  PendingPayment: 'PENDING_PAYMENT',
  Unknown: 'UNKNOWN',
} as const;

export type ObjectStorageResponseStatusEnum =
  (typeof ObjectStorageResponseStatusEnum)[keyof typeof ObjectStorageResponseStatusEnum];

/**
 *
 * @export
 * @interface ObjectStoragesStatsResponse
 */
export interface ObjectStoragesStatsResponse {
  /**
   *
   * @type {Array<ObjectStoragesStatsResponseData>}
   * @memberof ObjectStoragesStatsResponse
   */
  data: Array<ObjectStoragesStatsResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof ObjectStoragesStatsResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface ObjectStoragesStatsResponseData
 */
export interface ObjectStoragesStatsResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof ObjectStoragesStatsResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof ObjectStoragesStatsResponseData
   */
  customerId: string;
  /**
   * Currently used space in TB.
   * @type {number}
   * @memberof ObjectStoragesStatsResponseData
   */
  usedSpaceTB: number;
  /**
   * Currently used space in percentage.
   * @type {number}
   * @memberof ObjectStoragesStatsResponseData
   */
  usedSpacePercentage: number;
  /**
   * Number of all objects (i.e. files and folders) in object storage.
   * @type {number}
   * @memberof ObjectStoragesStatsResponseData
   */
  numberOfObjects: number;
}
/**
 *
 * @export
 * @interface OptimalRequirements
 */
export interface OptimalRequirements {
  /**
   * CPU Cores Requirement
   * @type {number}
   * @memberof OptimalRequirements
   */
  cpuCores?: number;
  /**
   * Memory Requirement in MB
   * @type {number}
   * @memberof OptimalRequirements
   */
  ramMb?: number;
  /**
   * Storage Requirement in MB
   * @type {number}
   * @memberof OptimalRequirements
   */
  diskMb?: number;
  /**
   * Valid Product IDs for this application
   * @type {Array<string>}
   * @memberof OptimalRequirements
   */
  validProductIds?: Array<string>;
}
/**
 *
 * @export
 * @interface PaginationMeta
 */
export interface PaginationMeta {
  /**
   * Number of elements per page.
   * @type {number}
   * @memberof PaginationMeta
   */
  size: number;
  /**
   * Number of overall matched elements.
   * @type {number}
   * @memberof PaginationMeta
   */
  totalElements: number;
  /**
   * Overall number of pages.
   * @type {number}
   * @memberof PaginationMeta
   */
  totalPages: number;
  /**
   * Current number of page.
   * @type {number}
   * @memberof PaginationMeta
   */
  page: number;
}
/**
 *
 * @export
 * @interface PatchInstanceRequest
 */
export interface PatchInstanceRequest {
  /**
   * The display name of the instance
   * @type {string}
   * @memberof PatchInstanceRequest
   */
  displayName?: string;
}
/**
 *
 * @export
 * @interface PatchInstanceResponse
 */
export interface PatchInstanceResponse {
  /**
   *
   * @type {Array<PatchInstanceResponseData>}
   * @memberof PatchInstanceResponse
   */
  data: Array<PatchInstanceResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof PatchInstanceResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface PatchInstanceResponseData
 */
export interface PatchInstanceResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof PatchInstanceResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof PatchInstanceResponseData
   */
  customerId: string;
  /**
   * Instance\'s id
   * @type {number}
   * @memberof PatchInstanceResponseData
   */
  instanceId: number;
  /**
   * Creation date of the instance
   * @type {string}
   * @memberof PatchInstanceResponseData
   */
  createdDate: string;
}
/**
 *
 * @export
 * @interface PatchObjectStorageRequest
 */
export interface PatchObjectStorageRequest {
  /**
   * Display name helps to differentiate between object storages, especially if they are in the same region.
   * @type {string}
   * @memberof PatchObjectStorageRequest
   */
  displayName: string;
}
/**
 *
 * @export
 * @interface PatchPrivateNetworkRequest
 */
export interface PatchPrivateNetworkRequest {
  /**
   * The name of the Private Network. It may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per Private Network.
   * @type {string}
   * @memberof PatchPrivateNetworkRequest
   */
  name?: string;
  /**
   * The description of the Private Network. There is a limit of 255 characters per Private Network.
   * @type {string}
   * @memberof PatchPrivateNetworkRequest
   */
  description?: string;
}
/**
 *
 * @export
 * @interface PatchPrivateNetworkResponse
 */
export interface PatchPrivateNetworkResponse {
  /**
   *
   * @type {Array<PrivateNetworkResponse>}
   * @memberof PatchPrivateNetworkResponse
   */
  data: Array<PrivateNetworkResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof PatchPrivateNetworkResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface PatchVncRequest
 */
export interface PatchVncRequest {
  /**
   * Password for instance VNC
   * @type {string}
   * @memberof PatchVncRequest
   */
  vncPassword: string;
}
/**
 *
 * @export
 * @interface PermissionRequest
 */
export interface PermissionRequest {
  /**
   * The name of the role. There is a limit of 255 characters per role.
   * @type {string}
   * @memberof PermissionRequest
   */
  apiName: string;
  /**
   * Action allowed for the API endpoint. Basically `CREATE` corresponds to POST endpoints, `READ` to GET endpoints, `UPDATE` to PATCH / PUT endpoints and `DELETE` to DELETE endpoints.
   * @type {Array<string>}
   * @memberof PermissionRequest
   */
  actions: Array<PermissionRequestActionsEnum>;
  /**
   * The IDs of tags. Only if those tags are assgined to a resource the user with that role will be able to access the resource.
   * @type {Array<number>}
   * @memberof PermissionRequest
   */
  resources?: Array<number>;
}

export const PermissionRequestActionsEnum = {
  Create: 'CREATE',
  Read: 'READ',
  Update: 'UPDATE',
  Delete: 'DELETE',
} as const;

export type PermissionRequestActionsEnum =
  (typeof PermissionRequestActionsEnum)[keyof typeof PermissionRequestActionsEnum];

/**
 *
 * @export
 * @interface PermissionResponse
 */
export interface PermissionResponse {
  /**
   * API endpoint. In order to get a list availbale api enpoints please refer to the GET api-permissions endpoint.
   * @type {string}
   * @memberof PermissionResponse
   */
  apiName: string;
  /**
   * Action allowed for the API endpoint. Basically `CREATE` corresponds to POST endpoints, `READ` to GET endpoints, `UPDATE` to PATCH / PUT endpoints and `DELETE` to DELETE endpoints.
   * @type {Array<string>}
   * @memberof PermissionResponse
   */
  actions: Array<PermissionResponseActionsEnum>;
  /**
   *
   * @type {Array<ResourcePermissionsResponse>}
   * @memberof PermissionResponse
   */
  resources?: Array<ResourcePermissionsResponse>;
}

export const PermissionResponseActionsEnum = {
  Create: 'CREATE',
  Read: 'READ',
  Update: 'UPDATE',
  Delete: 'DELETE',
} as const;

export type PermissionResponseActionsEnum =
  (typeof PermissionResponseActionsEnum)[keyof typeof PermissionResponseActionsEnum];

/**
 *
 * @export
 * @interface PrivateIpConfig
 */
export interface PrivateIpConfig {
  /**
   *
   * @type {Array<IpV41>}
   * @memberof PrivateIpConfig
   */
  v4: Array<IpV41>;
}
/**
 *
 * @export
 * @interface PrivateNetworkAuditResponse
 */
export interface PrivateNetworkAuditResponse {
  /**
   * The identifier of the audit entry.
   * @type {number}
   * @memberof PrivateNetworkAuditResponse
   */
  id: number;
  /**
   * The identifier of the Private Network
   * @type {number}
   * @memberof PrivateNetworkAuditResponse
   */
  privateNetworkId: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof PrivateNetworkAuditResponse
   */
  action: PrivateNetworkAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof PrivateNetworkAuditResponse
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof PrivateNetworkAuditResponse
   */
  tenantId: string;
  /**
   * Customer number
   * @type {string}
   * @memberof PrivateNetworkAuditResponse
   */
  customerId: string;
  /**
   * User id
   * @type {string}
   * @memberof PrivateNetworkAuditResponse
   */
  changedBy: string;
  /**
   * User name which did the change.
   * @type {string}
   * @memberof PrivateNetworkAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof PrivateNetworkAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof PrivateNetworkAuditResponse
   */
  traceId: string;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof PrivateNetworkAuditResponse
   */
  changes?: object;
}

export const PrivateNetworkAuditResponseActionEnum = {
  Created: 'CREATED',
  Deleted: 'DELETED',
  Updated: 'UPDATED',
} as const;

export type PrivateNetworkAuditResponseActionEnum =
  (typeof PrivateNetworkAuditResponseActionEnum)[keyof typeof PrivateNetworkAuditResponseActionEnum];

/**
 *
 * @export
 * @interface PrivateNetworkResponse
 */
export interface PrivateNetworkResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof PrivateNetworkResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof PrivateNetworkResponse
   */
  customerId: string;
  /**
   * Private Network\'s id
   * @type {number}
   * @memberof PrivateNetworkResponse
   */
  privateNetworkId: number;
  /**
   * The data center where your Private Network is located
   * @type {string}
   * @memberof PrivateNetworkResponse
   */
  dataCenter: string;
  /**
   * The slug of the region where your Private Network is located
   * @type {string}
   * @memberof PrivateNetworkResponse
   */
  region: string;
  /**
   * The region where your Private Network is located
   * @type {string}
   * @memberof PrivateNetworkResponse
   */
  regionName: string;
  /**
   * The name of the Private Network
   * @type {string}
   * @memberof PrivateNetworkResponse
   */
  name: string;
  /**
   * The description of the Private Network
   * @type {string}
   * @memberof PrivateNetworkResponse
   */
  description: string;
  /**
   * The cidr range of the Private Network
   * @type {string}
   * @memberof PrivateNetworkResponse
   */
  cidr: string;
  /**
   * The total available IPs of the Private Network
   * @type {number}
   * @memberof PrivateNetworkResponse
   */
  availableIps: number;
  /**
   * The creation date of the Private Network
   * @type {string}
   * @memberof PrivateNetworkResponse
   */
  createdDate: string;
  /**
   *
   * @type {Array<Instances>}
   * @memberof PrivateNetworkResponse
   */
  instances: Array<Instances>;
}
/**
 *
 * @export
 * @interface ReinstallInstanceRequest
 */
export interface ReinstallInstanceRequest {
  /**
   * ImageId to be used to setup the compute instance.
   * @type {string}
   * @memberof ReinstallInstanceRequest
   */
  imageId: string;
  /**
   * Array of `secretId`s of public SSH keys for logging into as `defaultUser` with administrator/root privileges. Applies to Linux/BSD systems. Please refer to Secrets Management API.
   * @type {Array<number>}
   * @memberof ReinstallInstanceRequest
   */
  sshKeys?: Array<number>;
  /**
   * `secretId` of the password for the `defaultUser` with administrator/root privileges. For Linux/BSD please use SSH, for Windows RDP. Please refer to Secrets Management API.
   * @type {number}
   * @memberof ReinstallInstanceRequest
   */
  rootPassword?: number;
  /**
   * [Cloud-Init](https://cloud-init.io/) Config in order to customize during start of compute instance.
   * @type {string}
   * @memberof ReinstallInstanceRequest
   */
  userData?: string;
  /**
   * Default user name created for login during (re-)installation with administrative privileges. Allowed values for Linux/BSD are `admin` (use sudo to apply administrative privileges like root) or `root`. Allowed values for Windows are `admin` (has administrative privileges like administrator) or `administrator`.
   * @type {string}
   * @memberof ReinstallInstanceRequest
   */
  defaultUser?: ReinstallInstanceRequestDefaultUserEnum;
  /**
   * Application ID
   * @type {string}
   * @memberof ReinstallInstanceRequest
   */
  applicationId?: string;
}

export const ReinstallInstanceRequestDefaultUserEnum = {
  Root: 'root',
  Admin: 'admin',
  Administrator: 'administrator',
} as const;

export type ReinstallInstanceRequestDefaultUserEnum =
  (typeof ReinstallInstanceRequestDefaultUserEnum)[keyof typeof ReinstallInstanceRequestDefaultUserEnum];

/**
 *
 * @export
 * @interface ReinstallInstanceResponse
 */
export interface ReinstallInstanceResponse {
  /**
   *
   * @type {Array<ReinstallInstanceResponseData>}
   * @memberof ReinstallInstanceResponse
   */
  data: Array<ReinstallInstanceResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof ReinstallInstanceResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface ReinstallInstanceResponseData
 */
export interface ReinstallInstanceResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof ReinstallInstanceResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof ReinstallInstanceResponseData
   */
  customerId: string;
  /**
   * Instance\'s id
   * @type {number}
   * @memberof ReinstallInstanceResponseData
   */
  instanceId: number;
  /**
   * Creation date for instance
   * @type {string}
   * @memberof ReinstallInstanceResponseData
   */
  createdDate: string;
}
/**
 *
 * @export
 * @interface ResourcePermissionsResponse
 */
export interface ResourcePermissionsResponse {
  /**
   * Tag\'s id
   * @type {number}
   * @memberof ResourcePermissionsResponse
   */
  tagId: number;
  /**
   * Tag name. The resriction is based on the resources which have been assigned to that tag. If no resource has been assigned to the given tag, no access will be possible.
   * @type {string}
   * @memberof ResourcePermissionsResponse
   */
  tagName: string;
}
/**
 *
 * @export
 * @interface RoleAuditResponse
 */
export interface RoleAuditResponse {
  /**
   * The identifier of the audit entry.
   * @type {number}
   * @memberof RoleAuditResponse
   */
  id: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof RoleAuditResponse
   */
  action: RoleAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof RoleAuditResponse
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof RoleAuditResponse
   */
  tenantId: string;
  /**
   * Customer number
   * @type {string}
   * @memberof RoleAuditResponse
   */
  customerId: string;
  /**
   * User ID
   * @type {string}
   * @memberof RoleAuditResponse
   */
  changedBy: string;
  /**
   * Name of the user which led to the change.
   * @type {string}
   * @memberof RoleAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof RoleAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof RoleAuditResponse
   */
  traceId: string;
  /**
   * The identifier of the role
   * @type {number}
   * @memberof RoleAuditResponse
   */
  roleId: number;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof RoleAuditResponse
   */
  changes?: object;
}

export const RoleAuditResponseActionEnum = {
  Created: 'CREATED',
  Updated: 'UPDATED',
  Deleted: 'DELETED',
} as const;

export type RoleAuditResponseActionEnum =
  (typeof RoleAuditResponseActionEnum)[keyof typeof RoleAuditResponseActionEnum];

/**
 *
 * @export
 * @interface RoleResponse
 */
export interface RoleResponse {
  /**
   * Role\'s id
   * @type {number}
   * @memberof RoleResponse
   */
  roleId: number;
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof RoleResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof RoleResponse
   */
  customerId: string;
  /**
   * Role\'s name
   * @type {string}
   * @memberof RoleResponse
   */
  name: string;
  /**
   * Admin
   * @type {boolean}
   * @memberof RoleResponse
   */
  admin: boolean;
  /**
   * Access All Resources
   * @type {boolean}
   * @memberof RoleResponse
   */
  accessAllResources: boolean;
  /**
   * Role type can be either `default` or `custom`. The `default` roles cannot be modified or deleted.
   * @type {string}
   * @memberof RoleResponse
   */
  type: string;
  /**
   *
   * @type {Array<PermissionResponse>}
   * @memberof RoleResponse
   */
  permissions?: Array<PermissionResponse>;
}
/**
 *
 * @export
 * @interface RollbackSnapshotResponse
 */
export interface RollbackSnapshotResponse {
  /**
   * Links for easy navigation.
   * @type {SelfLinks}
   * @memberof RollbackSnapshotResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface SecretAuditResponse
 */
export interface SecretAuditResponse {
  /**
   * The identifier of the audit entry.
   * @type {number}
   * @memberof SecretAuditResponse
   */
  id: number;
  /**
   * Secret\'s id
   * @type {number}
   * @memberof SecretAuditResponse
   */
  secretId: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof SecretAuditResponse
   */
  action: SecretAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof SecretAuditResponse
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof SecretAuditResponse
   */
  tenantId: string;
  /**
   * Customer number
   * @type {string}
   * @memberof SecretAuditResponse
   */
  customerId: string;
  /**
   * User ID
   * @type {string}
   * @memberof SecretAuditResponse
   */
  changedBy: string;
  /**
   * Name of the user which led to the change.
   * @type {string}
   * @memberof SecretAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof SecretAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof SecretAuditResponse
   */
  traceId: string;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof SecretAuditResponse
   */
  changes?: object;
}

export const SecretAuditResponseActionEnum = {
  Created: 'CREATED',
  Updated: 'UPDATED',
  Deleted: 'DELETED',
} as const;

export type SecretAuditResponseActionEnum =
  (typeof SecretAuditResponseActionEnum)[keyof typeof SecretAuditResponseActionEnum];

/**
 *
 * @export
 * @interface SecretResponse
 */
export interface SecretResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof SecretResponse
   */
  tenantId: string;
  /**
   * Your Customer number
   * @type {string}
   * @memberof SecretResponse
   */
  customerId: string;
  /**
   * Secret\'s id
   * @type {number}
   * @memberof SecretResponse
   */
  secretId: number;
  /**
   * The name assigned to the password/ssh
   * @type {string}
   * @memberof SecretResponse
   */
  name: string;
  /**
   * The type of the secret. This will be available only when retrieving secrets
   * @type {string}
   * @memberof SecretResponse
   */
  type: SecretResponseTypeEnum;
  /**
   * The value of the secret. This will be available only when retrieving a single secret
   * @type {string}
   * @memberof SecretResponse
   */
  value: string;
  /**
   * The creation date for the secret
   * @type {string}
   * @memberof SecretResponse
   */
  createdAt: string;
  /**
   * The last update date for the secret
   * @type {string}
   * @memberof SecretResponse
   */
  updatedAt: string;
}

export const SecretResponseTypeEnum = {
  Password: 'password',
  Ssh: 'ssh',
} as const;

export type SecretResponseTypeEnum =
  (typeof SecretResponseTypeEnum)[keyof typeof SecretResponseTypeEnum];

/**
 *
 * @export
 * @interface SelfLinks
 */
export interface SelfLinks {
  /**
   * Link to current resource.
   * @type {string}
   * @memberof SelfLinks
   */
  self: string;
}
/**
 *
 * @export
 * @interface SnapshotResponse
 */
export interface SnapshotResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof SnapshotResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof SnapshotResponse
   */
  customerId: string;
  /**
   * Snapshot\'s id
   * @type {string}
   * @memberof SnapshotResponse
   */
  snapshotId: string;
  /**
   * The name of the snapshot.
   * @type {string}
   * @memberof SnapshotResponse
   */
  name: string;
  /**
   * The description of the snapshot.
   * @type {string}
   * @memberof SnapshotResponse
   */
  description: string;
  /**
   * The instance identifier associated with the snapshot
   * @type {number}
   * @memberof SnapshotResponse
   */
  instanceId: number;
  /**
   * The date when the snapshot was created
   * @type {string}
   * @memberof SnapshotResponse
   */
  createdDate: string;
  /**
   * The date when the snapshot will be auto-deleted
   * @type {string}
   * @memberof SnapshotResponse
   */
  autoDeleteDate: string;
  /**
   * Image Id the snapshot was taken on
   * @type {string}
   * @memberof SnapshotResponse
   */
  imageId: string;
  /**
   * Image name the snapshot was taken on
   * @type {string}
   * @memberof SnapshotResponse
   */
  imageName: string;
}
/**
 *
 * @export
 * @interface SnapshotsAuditResponse
 */
export interface SnapshotsAuditResponse {
  /**
   * The ID of the audit entry.
   * @type {number}
   * @memberof SnapshotsAuditResponse
   */
  id: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof SnapshotsAuditResponse
   */
  action: SnapshotsAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof SnapshotsAuditResponse
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof SnapshotsAuditResponse
   */
  tenantId: string;
  /**
   * Customer ID
   * @type {string}
   * @memberof SnapshotsAuditResponse
   */
  customerId: string;
  /**
   * Id of user who performed the change
   * @type {string}
   * @memberof SnapshotsAuditResponse
   */
  changedBy: string;
  /**
   * Name of the user which led to the change.
   * @type {string}
   * @memberof SnapshotsAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof SnapshotsAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof SnapshotsAuditResponse
   */
  traceId: string;
  /**
   * The identifier of the instance
   * @type {number}
   * @memberof SnapshotsAuditResponse
   */
  instanceId: number;
  /**
   * The identifier of the snapshot
   * @type {string}
   * @memberof SnapshotsAuditResponse
   */
  snapshotId: string;
  /**
   * List of actual changes
   * @type {object}
   * @memberof SnapshotsAuditResponse
   */
  changes?: object;
}

export const SnapshotsAuditResponseActionEnum = {
  Created: 'CREATED',
  Updated: 'UPDATED',
  Deleted: 'DELETED',
} as const;

export type SnapshotsAuditResponseActionEnum =
  (typeof SnapshotsAuditResponseActionEnum)[keyof typeof SnapshotsAuditResponseActionEnum];

/**
 *
 * @export
 * @interface TagAssignmentSelfLinks
 */
export interface TagAssignmentSelfLinks {
  /**
   * Link to current resource.
   * @type {string}
   * @memberof TagAssignmentSelfLinks
   */
  self: string;
  /**
   * Link to related tag.
   * @type {string}
   * @memberof TagAssignmentSelfLinks
   */
  tag: string;
  /**
   * Link to assigned resource
   * @type {string}
   * @memberof TagAssignmentSelfLinks
   */
  _resource: string;
}
/**
 *
 * @export
 * @interface TagAuditResponse
 */
export interface TagAuditResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof TagAuditResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof TagAuditResponse
   */
  customerId: string;
  /**
   * The identifier of the audit entry.
   * @type {number}
   * @memberof TagAuditResponse
   */
  id: number;
  /**
   * The identifier of the audit entry.
   * @type {number}
   * @memberof TagAuditResponse
   */
  tagId: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof TagAuditResponse
   */
  action: TagAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof TagAuditResponse
   */
  timestamp: string;
  /**
   * User ID
   * @type {string}
   * @memberof TagAuditResponse
   */
  changedBy: string;
  /**
   * Name of the user which led to the change.
   * @type {string}
   * @memberof TagAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof TagAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof TagAuditResponse
   */
  traceId: string;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof TagAuditResponse
   */
  changes?: object;
}

export const TagAuditResponseActionEnum = {
  Created: 'CREATED',
  Deleted: 'DELETED',
  Updated: 'UPDATED',
} as const;

export type TagAuditResponseActionEnum =
  (typeof TagAuditResponseActionEnum)[keyof typeof TagAuditResponseActionEnum];

/**
 *
 * @export
 * @interface TagResponse
 */
export interface TagResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof TagResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof TagResponse
   */
  customerId: string;
  /**
   * Tag\'s id
   * @type {number}
   * @memberof TagResponse
   */
  tagId: number;
  /**
   * Tag\'s name
   * @type {string}
   * @memberof TagResponse
   */
  name: string;
  /**
   * Tag\'s color
   * @type {string}
   * @memberof TagResponse
   */
  color: string;
}
/**
 *
 * @export
 * @interface UnassignInstancePrivateNetworkResponse
 */
export interface UnassignInstancePrivateNetworkResponse {
  /**
   * Links for easy navigation.
   * @type {InstanceAssignmentSelfLinks}
   * @memberof UnassignInstancePrivateNetworkResponse
   */
  _links: InstanceAssignmentSelfLinks;
}
/**
 *
 * @export
 * @interface UpdateCustomImageRequest
 */
export interface UpdateCustomImageRequest {
  /**
   * Image Name
   * @type {string}
   * @memberof UpdateCustomImageRequest
   */
  name?: string;
  /**
   * Image Description
   * @type {string}
   * @memberof UpdateCustomImageRequest
   */
  description?: string;
}
/**
 *
 * @export
 * @interface UpdateCustomImageResponse
 */
export interface UpdateCustomImageResponse {
  /**
   *
   * @type {Array<UpdateCustomImageResponseData>}
   * @memberof UpdateCustomImageResponse
   */
  data: Array<UpdateCustomImageResponseData>;
  /**
   *
   * @type {SelfLinks}
   * @memberof UpdateCustomImageResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface UpdateCustomImageResponseData
 */
export interface UpdateCustomImageResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof UpdateCustomImageResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof UpdateCustomImageResponseData
   */
  customerId: string;
  /**
   * Image\'s id
   * @type {string}
   * @memberof UpdateCustomImageResponseData
   */
  imageId: string;
}
/**
 *
 * @export
 * @interface UpdateRoleRequest
 */
export interface UpdateRoleRequest {
  /**
   * The name of the role. There is a limit of 255 characters per role.
   * @type {string}
   * @memberof UpdateRoleRequest
   */
  name: string;
  /**
   * If user is admin he will have permissions to all API endpoints and resources. Enabling this will superseed all role definitions and `accessAllResources`.
   * @type {boolean}
   * @memberof UpdateRoleRequest
   */
  admin: boolean;
  /**
   * Allow access to all resources. This will superseed all assigned resources in a role.
   * @type {boolean}
   * @memberof UpdateRoleRequest
   */
  accessAllResources: boolean;
  /**
   *
   * @type {Array<PermissionRequest>}
   * @memberof UpdateRoleRequest
   */
  permissions?: Array<PermissionRequest>;
}
/**
 *
 * @export
 * @interface UpdateRoleResponse
 */
export interface UpdateRoleResponse {
  /**
   * Links for easy navigation.
   * @type {SelfLinks}
   * @memberof UpdateRoleResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface UpdateSecretRequest
 */
export interface UpdateSecretRequest {
  /**
   * The name of the secret to be saved
   * @type {string}
   * @memberof UpdateSecretRequest
   */
  name?: string;
  /**
   * The value of the secret to be saved
   * @type {string}
   * @memberof UpdateSecretRequest
   */
  value?: string;
}
/**
 *
 * @export
 * @interface UpdateSecretResponse
 */
export interface UpdateSecretResponse {
  /**
   * Links for easy navigation.
   * @type {SelfLinks}
   * @memberof UpdateSecretResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface UpdateSnapshotRequest
 */
export interface UpdateSnapshotRequest {
  /**
   * The name of the snapshot. Tags may contain only letters, numbers, spaces, dashes. There is a limit of 30 characters per snapshot.
   * @type {string}
   * @memberof UpdateSnapshotRequest
   */
  name?: string;
  /**
   * The description of the snapshot. There is a limit of 255 characters per snapshot.
   * @type {string}
   * @memberof UpdateSnapshotRequest
   */
  description?: string;
}
/**
 *
 * @export
 * @interface UpdateSnapshotResponse
 */
export interface UpdateSnapshotResponse {
  /**
   *
   * @type {Array<SnapshotResponse>}
   * @memberof UpdateSnapshotResponse
   */
  data: Array<SnapshotResponse>;
  /**
   *
   * @type {SelfLinks}
   * @memberof UpdateSnapshotResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface UpdateTagRequest
 */
export interface UpdateTagRequest {
  /**
   * The name of the tag. Tags may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per tag.
   * @type {string}
   * @memberof UpdateTagRequest
   */
  name?: string;
  /**
   * The color of the tag. Color can be specified using hexadecimal value. Default color is #0A78C3
   * @type {string}
   * @memberof UpdateTagRequest
   */
  color?: string;
}
/**
 *
 * @export
 * @interface UpdateTagResponse
 */
export interface UpdateTagResponse {
  /**
   * Links for easy navigation.
   * @type {SelfLinks}
   * @memberof UpdateTagResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface UpdateUserRequest
 */
export interface UpdateUserRequest {
  /**
   * The name of the user. Names may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per user.
   * @type {string}
   * @memberof UpdateUserRequest
   */
  firstName?: string;
  /**
   * The last name of the user. Users may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per user.
   * @type {string}
   * @memberof UpdateUserRequest
   */
  lastName?: string;
  /**
   * The email of the user to which activation and forgot password links are being sent to. There is a limit of 255 characters per email.
   * @type {string}
   * @memberof UpdateUserRequest
   */
  email?: string;
  /**
   * If user is not enabled, he can\'t login and thus use services any longer.
   * @type {boolean}
   * @memberof UpdateUserRequest
   */
  enabled?: boolean;
  /**
   * Enable or disable two-factor authentication (2FA) via time based OTP.
   * @type {boolean}
   * @memberof UpdateUserRequest
   */
  totp?: boolean;
  /**
   * The locale of the user. This can be `de-DE`, `de`, `en-US`, `en`
   * @type {string}
   * @memberof UpdateUserRequest
   */
  locale?: UpdateUserRequestLocaleEnum;
  /**
   * The roles as list of `roleId`s of the user.
   * @type {Array<number>}
   * @memberof UpdateUserRequest
   */
  roles?: Array<number>;
}

export const UpdateUserRequestLocaleEnum = {
  DeDe: 'de-DE',
  De: 'de',
  EnUs: 'en-US',
  En: 'en',
} as const;

export type UpdateUserRequestLocaleEnum =
  (typeof UpdateUserRequestLocaleEnum)[keyof typeof UpdateUserRequestLocaleEnum];

/**
 *
 * @export
 * @interface UpdateUserResponse
 */
export interface UpdateUserResponse {
  /**
   * Links for easy navigation.
   * @type {SelfLinks}
   * @memberof UpdateUserResponse
   */
  _links: SelfLinks;
}
/**
 *
 * @export
 * @interface UpgradeAutoScalingType
 */
export interface UpgradeAutoScalingType {
  /**
   * State of the autoscaling for the current object storage.
   * @type {string}
   * @memberof UpgradeAutoScalingType
   */
  state?: UpgradeAutoScalingTypeStateEnum;
  /**
   * Autoscaling size limit for the current object storage.
   * @type {number}
   * @memberof UpgradeAutoScalingType
   */
  sizeLimitTB?: number;
}

export const UpgradeAutoScalingTypeStateEnum = {
  Enabled: 'enabled',
  Disabled: 'disabled',
} as const;

export type UpgradeAutoScalingTypeStateEnum =
  (typeof UpgradeAutoScalingTypeStateEnum)[keyof typeof UpgradeAutoScalingTypeStateEnum];

/**
 *
 * @export
 * @interface UpgradeInstanceRequest
 */
export interface UpgradeInstanceRequest {
  /**
   * Set this attribute if you want to upgrade your instance with the Private Networking addon. Please provide an empty object for the time being as value. There will be more configuration possible in the future.
   * @type {object}
   * @memberof UpgradeInstanceRequest
   */
  privateNetworking?: object;
  /**
   * Set this attribute if you want to upgrade your instance with the Automated Backup addon.   Please provide an empty object for the time being as value. There will be more configuration possible   in the future.
   * @type {object}
   * @memberof UpgradeInstanceRequest
   */
  backup?: object;
}
/**
 *
 * @export
 * @interface UpgradeObjectStorageRequest
 */
export interface UpgradeObjectStorageRequest {
  /**
   * New monthly object storage size limit for autoscaling if enabled.
   * @type {UpgradeAutoScalingType}
   * @memberof UpgradeObjectStorageRequest
   */
  autoScaling?: UpgradeAutoScalingType;
  /**
   * New total object storage limit. If this number is larger than before you will also be billed for the added storage space. No downgrade possible.
   * @type {number}
   * @memberof UpgradeObjectStorageRequest
   */
  totalPurchasedSpaceTB?: number;
}
/**
 *
 * @export
 * @interface UpgradeObjectStorageResponse
 */
export interface UpgradeObjectStorageResponse {
  /**
   *
   * @type {SelfLinks}
   * @memberof UpgradeObjectStorageResponse
   */
  _links: SelfLinks;
  /**
   *
   * @type {Array<UpgradeObjectStorageResponseData>}
   * @memberof UpgradeObjectStorageResponse
   */
  data: Array<UpgradeObjectStorageResponseData>;
}
/**
 *
 * @export
 * @interface UpgradeObjectStorageResponseData
 */
export interface UpgradeObjectStorageResponseData {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof UpgradeObjectStorageResponseData
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof UpgradeObjectStorageResponseData
   */
  customerId: string;
  /**
   * Object storage id
   * @type {string}
   * @memberof UpgradeObjectStorageResponseData
   */
  objectStorageId: string;
  /**
   * Creation date for object storage.
   * @type {string}
   * @memberof UpgradeObjectStorageResponseData
   */
  createdDate: string;
  /**
   * Data center of the object storage.
   * @type {string}
   * @memberof UpgradeObjectStorageResponseData
   */
  dataCenter: string;
  /**
   * The autoscaling limit of the object storage.
   * @type {AutoScalingTypeResponse}
   * @memberof UpgradeObjectStorageResponseData
   */
  autoScaling: AutoScalingTypeResponse;
  /**
   * S3 URL to connect to your S3 compatible object storage
   * @type {string}
   * @memberof UpgradeObjectStorageResponseData
   */
  s3Url: string;
  /**
   * The object storage status
   * @type {string}
   * @memberof UpgradeObjectStorageResponseData
   */
  status: UpgradeObjectStorageResponseDataStatusEnum;
  /**
   * Total purchased object storage space in TB.
   * @type {number}
   * @memberof UpgradeObjectStorageResponseData
   */
  totalPurchasedSpaceTB: number;
  /**
   * The region where your object storage is located
   * @type {string}
   * @memberof UpgradeObjectStorageResponseData
   */
  region: string;
  /**
   * Display name for object storage.
   * @type {string}
   * @memberof UpgradeObjectStorageResponseData
   */
  displayName: string;
}

export const UpgradeObjectStorageResponseDataStatusEnum = {
  Ready: 'READY',
  Provisioning: 'PROVISIONING',
  Upgrading: 'UPGRADING',
  Cancelled: 'CANCELLED',
  Error: 'ERROR',
  Enabled: 'ENABLED',
  Disabled: 'DISABLED',
  ManualProvisioning: 'MANUAL_PROVISIONING',
  ProductNotAvailable: 'PRODUCT_NOT_AVAILABLE',
  LimitExceeded: 'LIMIT_EXCEEDED',
  VerificationRequired: 'VERIFICATION_REQUIRED',
  Completed: 'COMPLETED',
  OrderProcessing: 'ORDER_PROCESSING',
  PendingPayment: 'PENDING_PAYMENT',
  Unknown: 'UNKNOWN',
} as const;

export type UpgradeObjectStorageResponseDataStatusEnum =
  (typeof UpgradeObjectStorageResponseDataStatusEnum)[keyof typeof UpgradeObjectStorageResponseDataStatusEnum];

/**
 *
 * @export
 * @interface UserAuditResponse
 */
export interface UserAuditResponse {
  /**
   * The identifier of the audit entry.
   * @type {number}
   * @memberof UserAuditResponse
   */
  id: number;
  /**
   * Type of the action.
   * @type {string}
   * @memberof UserAuditResponse
   */
  action: UserAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof UserAuditResponse
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof UserAuditResponse
   */
  tenantId: string;
  /**
   * Customer number
   * @type {string}
   * @memberof UserAuditResponse
   */
  customerId: string;
  /**
   * User ID
   * @type {string}
   * @memberof UserAuditResponse
   */
  changedBy: string;
  /**
   * Name of the user which led to the change.
   * @type {string}
   * @memberof UserAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof UserAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof UserAuditResponse
   */
  traceId: string;
  /**
   * The identifier of the user
   * @type {string}
   * @memberof UserAuditResponse
   */
  userId: string;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof UserAuditResponse
   */
  changes?: object;
}

export const UserAuditResponseActionEnum = {
  Created: 'CREATED',
  Updated: 'UPDATED',
  Deleted: 'DELETED',
} as const;

export type UserAuditResponseActionEnum =
  (typeof UserAuditResponseActionEnum)[keyof typeof UserAuditResponseActionEnum];

/**
 *
 * @export
 * @interface UserIsPasswordSetResponse
 */
export interface UserIsPasswordSetResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof UserIsPasswordSetResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof UserIsPasswordSetResponse
   */
  customerId: string;
  /**
   * Indicates if the user has set a password for his account
   * @type {boolean}
   * @memberof UserIsPasswordSetResponse
   */
  isPasswordSet: boolean;
}
/**
 *
 * @export
 * @interface UserResponse
 */
export interface UserResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof UserResponse
   */
  tenantId: string;
  /**
   * Your customer number
   * @type {string}
   * @memberof UserResponse
   */
  customerId: string;
  /**
   * The identifier of the user.
   * @type {string}
   * @memberof UserResponse
   */
  userId: string;
  /**
   * The first name of the user. Users may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per user.
   * @type {string}
   * @memberof UserResponse
   */
  firstName: string;
  /**
   * The last name of the user. Users may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per user.
   * @type {string}
   * @memberof UserResponse
   */
  lastName: string;
  /**
   * The email of the user to which activation and forgot password links are being sent to. There is a limit of 255 characters per email.
   * @type {string}
   * @memberof UserResponse
   */
  email: string;
  /**
   * User email verification status.
   * @type {boolean}
   * @memberof UserResponse
   */
  emailVerified: boolean;
  /**
   * If uses is not enabled, he can\'t login and thus use services any longer.
   * @type {boolean}
   * @memberof UserResponse
   */
  enabled: boolean;
  /**
   * Enable or disable two-factor authentication (2FA) via time based OTP.
   * @type {boolean}
   * @memberof UserResponse
   */
  totp: boolean;
  /**
   * The locale of the user. This can be `de-DE`, `de`, `en-US`, `en`
   * @type {string}
   * @memberof UserResponse
   */
  locale: UserResponseLocaleEnum;
  /**
   * The roles as list of `roleId`s of the user.
   * @type {Array<RoleResponse>}
   * @memberof UserResponse
   */
  roles: Array<RoleResponse>;
  /**
   * If user is owner he will have permissions to all API endpoints and resources. Enabling this will superseed all role definitions and `accessAllResources`.
   * @type {boolean}
   * @memberof UserResponse
   */
  owner: boolean;
}

export const UserResponseLocaleEnum = {
  DeDe: 'de-DE',
  De: 'de',
  EnUs: 'en-US',
  En: 'en',
} as const;

export type UserResponseLocaleEnum =
  (typeof UserResponseLocaleEnum)[keyof typeof UserResponseLocaleEnum];

/**
 *
 * @export
 * @interface VipAuditResponse
 */
export interface VipAuditResponse {
  /**
   * The identifier of the audit entry.
   * @type {number}
   * @memberof VipAuditResponse
   */
  id: number;
  /**
   * The identifier of the VIP
   * @type {string}
   * @memberof VipAuditResponse
   */
  vipId: string;
  /**
   * Type of the action.
   * @type {string}
   * @memberof VipAuditResponse
   */
  action: VipAuditResponseActionEnum;
  /**
   * When the change took place.
   * @type {string}
   * @memberof VipAuditResponse
   */
  timestamp: string;
  /**
   * Customer tenant id
   * @type {string}
   * @memberof VipAuditResponse
   */
  tenantId: string;
  /**
   * Customer number
   * @type {string}
   * @memberof VipAuditResponse
   */
  customerId: string;
  /**
   * User id
   * @type {string}
   * @memberof VipAuditResponse
   */
  changedBy: string;
  /**
   * User name which did the change.
   * @type {string}
   * @memberof VipAuditResponse
   */
  username: string;
  /**
   * The requestId of the API call which led to the change.
   * @type {string}
   * @memberof VipAuditResponse
   */
  requestId: string;
  /**
   * The traceId of the API call which led to the change.
   * @type {string}
   * @memberof VipAuditResponse
   */
  traceId: string;
  /**
   * List of actual changes.
   * @type {object}
   * @memberof VipAuditResponse
   */
  changes?: object;
}

export const VipAuditResponseActionEnum = {
  Created: 'CREATED',
  Deleted: 'DELETED',
  Updated: 'UPDATED',
} as const;

export type VipAuditResponseActionEnum =
  (typeof VipAuditResponseActionEnum)[keyof typeof VipAuditResponseActionEnum];

/**
 *
 * @export
 * @interface VipResponse
 */
export interface VipResponse {
  /**
   * Tenant Id.
   * @type {string}
   * @memberof VipResponse
   */
  tenantId: string;
  /**
   * Customer\'s Id.
   * @type {string}
   * @memberof VipResponse
   */
  customerId: string;
  /**
   * Vip uuid.
   * @type {string}
   * @memberof VipResponse
   */
  vipId: string;
  /**
   * data center.
   * @type {string}
   * @memberof VipResponse
   */
  dataCenter: string;
  /**
   * Region
   * @type {string}
   * @memberof VipResponse
   */
  region: string;
  /**
   * Resource Id.
   * @type {string}
   * @memberof VipResponse
   */
  resourceId: string;
  /**
   * The resourceType using the VIP.
   * @type {string}
   * @memberof VipResponse
   */
  resourceType?: VipResponseResourceTypeEnum;
  /**
   * Resource name.
   * @type {string}
   * @memberof VipResponse
   */
  resourceName: string;
  /**
   * Resource display name.
   * @type {string}
   * @memberof VipResponse
   */
  resourceDisplayName: string;
  /**
   * Version of Ip.
   * @type {string}
   * @memberof VipResponse
   */
  ipVersion: VipResponseIpVersionEnum;
  /**
   * The VIP type.
   * @type {string}
   * @memberof VipResponse
   */
  type?: VipResponseTypeEnum;
  /**
   *
   * @type {IpV4}
   * @memberof VipResponse
   */
  v4?: IpV4;
}

export const VipResponseResourceTypeEnum = {
  Instances: 'instances',
  BareMetal: 'bare-metal',
  Null: 'null',
} as const;

export type VipResponseResourceTypeEnum =
  (typeof VipResponseResourceTypeEnum)[keyof typeof VipResponseResourceTypeEnum];
export const VipResponseIpVersionEnum = {
  V4: 'v4',
} as const;

export type VipResponseIpVersionEnum =
  (typeof VipResponseIpVersionEnum)[keyof typeof VipResponseIpVersionEnum];
export const VipResponseTypeEnum = {
  Additional: 'additional',
  Floating: 'floating',
} as const;

export type VipResponseTypeEnum =
  (typeof VipResponseTypeEnum)[keyof typeof VipResponseTypeEnum];

/**
 *
 * @export
 * @interface VncResponse
 */
export interface VncResponse {
  /**
   * Your customer tenant id
   * @type {string}
   * @memberof VncResponse
   */
  tenantId: VncResponseTenantIdEnum;
  /**
   * Customer ID
   * @type {string}
   * @memberof VncResponse
   */
  customerId: string;
  /**
   * Instance ID
   * @type {number}
   * @memberof VncResponse
   */
  instanceId: number;
  /**
   * VNC Status for the instance.
   * @type {boolean}
   * @memberof VncResponse
   */
  enabled: boolean;
  /**
   * VNC IP for the instance.
   * @type {string}
   * @memberof VncResponse
   */
  vncIp: string;
  /**
   * VNC Port for the instance.
   * @type {number}
   * @memberof VncResponse
   */
  vncPort: number;
}

export const VncResponseTenantIdEnum = {
  De: 'DE',
  Int: 'INT',
} as const;

export type VncResponseTenantIdEnum =
  (typeof VncResponseTenantIdEnum)[keyof typeof VncResponseTenantIdEnum];

/**
 * ImagesApi - axios parameter creator
 * @export
 */
export const ImagesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * In order to provide a custom image please specify an URL from where the image can be directly downloaded. A custom image must be in either `.iso` or `.qcow2` format. Other formats will be rejected. Please note that downloading can take a while depending on network speed resp. bandwidth and size of image. You can check the status by retrieving information about the image via a GET request. Download will be rejected if you have exceeded your limits.
     * @summary Provide a custom image
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateCustomImageRequest} createCustomImageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createCustomImage: async (
      xRequestId: string,
      createCustomImageRequest: CreateCustomImageRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createCustomImage', 'xRequestId', xRequestId);
      // verify required parameter 'createCustomImageRequest' is not null or undefined
      assertParamExists(
        'createCustomImage',
        'createCustomImageRequest',
        createCustomImageRequest,
      );
      const localVarPath = `/v1/compute/images`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        createCustomImageRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Your are free to delete a previously uploaded custom images at any time
     * @summary Delete an uploaded custom image by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} imageId The identifier of the image
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteImage: async (
      xRequestId: string,
      imageId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('deleteImage', 'xRequestId', xRequestId);
      // verify required parameter 'imageId' is not null or undefined
      assertParamExists('deleteImage', 'imageId', imageId);
      const localVarPath = `/v1/compute/images/{imageId}`.replace(
        `{${'imageId'}}`,
        encodeURIComponent(String(imageId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List statistics regarding the customer\'s custom images such as the number of custom images uploaded, used disk space, free available disk space and total available disk space
     * @summary List statistics regarding the customer\'s custom images
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveCustomImagesStats: async (
      xRequestId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveCustomImagesStats', 'xRequestId', xRequestId);
      const localVarPath = `/v1/compute/images/stats`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get details about a specific image. This could be either a standard or custom image. In case of an custom image you can also check the download status
     * @summary Get details about a specific image by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} imageId The identifier of the image
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveImage: async (
      xRequestId: string,
      imageId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveImage', 'xRequestId', xRequestId);
      // verify required parameter 'imageId' is not null or undefined
      assertParamExists('retrieveImage', 'imageId', imageId);
      const localVarPath = `/v1/compute/images/{imageId}`.replace(
        `{${'imageId'}}`,
        encodeURIComponent(String(imageId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all available standard images provided by [Contabo](https://contabo.com) and your uploaded custom images.
     * @summary List available standard and custom images
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the image
     * @param {boolean} [standardImage] Flag indicating that image is either a standard (true) or a custom image (false)
     * @param {string} [search] full text search on image name or image os type
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveImageList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      standardImage?: boolean,
      search?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveImageList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/compute/images`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (standardImage !== undefined) {
        localVarQueryParameter['standardImage'] = standardImage;
      }

      if (search !== undefined) {
        localVarQueryParameter['search'] = search;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Update name of the custom image
     * @summary Update custom image name by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} imageId The identifier of the image
     * @param {UpdateCustomImageRequest} updateCustomImageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateImage: async (
      xRequestId: string,
      imageId: string,
      updateCustomImageRequest: UpdateCustomImageRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('updateImage', 'xRequestId', xRequestId);
      // verify required parameter 'imageId' is not null or undefined
      assertParamExists('updateImage', 'imageId', imageId);
      // verify required parameter 'updateCustomImageRequest' is not null or undefined
      assertParamExists(
        'updateImage',
        'updateCustomImageRequest',
        updateCustomImageRequest,
      );
      const localVarPath = `/v1/compute/images/{imageId}`.replace(
        `{${'imageId'}}`,
        encodeURIComponent(String(imageId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        updateCustomImageRequest,
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
     * In order to provide a custom image please specify an URL from where the image can be directly downloaded. A custom image must be in either `.iso` or `.qcow2` format. Other formats will be rejected. Please note that downloading can take a while depending on network speed resp. bandwidth and size of image. You can check the status by retrieving information about the image via a GET request. Download will be rejected if you have exceeded your limits.
     * @summary Provide a custom image
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateCustomImageRequest} createCustomImageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createCustomImage(
      xRequestId: string,
      createCustomImageRequest: CreateCustomImageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateCustomImageResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createCustomImage(
          xRequestId,
          createCustomImageRequest,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.createCustomImage']?.[
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
     * Your are free to delete a previously uploaded custom images at any time
     * @summary Delete an uploaded custom image by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} imageId The identifier of the image
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteImage(
      xRequestId: string,
      imageId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteImage(
        xRequestId,
        imageId,
        xTraceId,
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
     * List statistics regarding the customer\'s custom images such as the number of custom images uploaded, used disk space, free available disk space and total available disk space
     * @summary List statistics regarding the customer\'s custom images
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveCustomImagesStats(
      xRequestId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CustomImagesStatsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveCustomImagesStats(
          xRequestId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.retrieveCustomImagesStats']?.[
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
     * Get details about a specific image. This could be either a standard or custom image. In case of an custom image you can also check the download status
     * @summary Get details about a specific image by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} imageId The identifier of the image
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveImage(
      xRequestId: string,
      imageId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindImageResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveImage(
        xRequestId,
        imageId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.retrieveImage']?.[
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
     * List and filter all available standard images provided by [Contabo](https://contabo.com) and your uploaded custom images.
     * @summary List available standard and custom images
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the image
     * @param {boolean} [standardImage] Flag indicating that image is either a standard (true) or a custom image (false)
     * @param {string} [search] full text search on image name or image os type
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveImageList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      standardImage?: boolean,
      search?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListImageResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveImageList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          standardImage,
          search,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesApi.retrieveImageList']?.[
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
     * Update name of the custom image
     * @summary Update custom image name by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} imageId The identifier of the image
     * @param {UpdateCustomImageRequest} updateCustomImageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateImage(
      xRequestId: string,
      imageId: string,
      updateCustomImageRequest: UpdateCustomImageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<UpdateCustomImageResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateImage(
        xRequestId,
        imageId,
        updateCustomImageRequest,
        xTraceId,
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
     * In order to provide a custom image please specify an URL from where the image can be directly downloaded. A custom image must be in either `.iso` or `.qcow2` format. Other formats will be rejected. Please note that downloading can take a while depending on network speed resp. bandwidth and size of image. You can check the status by retrieving information about the image via a GET request. Download will be rejected if you have exceeded your limits.
     * @summary Provide a custom image
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateCustomImageRequest} createCustomImageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createCustomImage(
      xRequestId: string,
      createCustomImageRequest: CreateCustomImageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateCustomImageResponse> {
      return localVarFp
        .createCustomImage(
          xRequestId,
          createCustomImageRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Your are free to delete a previously uploaded custom images at any time
     * @summary Delete an uploaded custom image by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} imageId The identifier of the image
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteImage(
      xRequestId: string,
      imageId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteImage(xRequestId, imageId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List statistics regarding the customer\'s custom images such as the number of custom images uploaded, used disk space, free available disk space and total available disk space
     * @summary List statistics regarding the customer\'s custom images
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveCustomImagesStats(
      xRequestId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CustomImagesStatsResponse> {
      return localVarFp
        .retrieveCustomImagesStats(xRequestId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get details about a specific image. This could be either a standard or custom image. In case of an custom image you can also check the download status
     * @summary Get details about a specific image by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} imageId The identifier of the image
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveImage(
      xRequestId: string,
      imageId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindImageResponse> {
      return localVarFp
        .retrieveImage(xRequestId, imageId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all available standard images provided by [Contabo](https://contabo.com) and your uploaded custom images.
     * @summary List available standard and custom images
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the image
     * @param {boolean} [standardImage] Flag indicating that image is either a standard (true) or a custom image (false)
     * @param {string} [search] full text search on image name or image os type
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveImageList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      standardImage?: boolean,
      search?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListImageResponse> {
      return localVarFp
        .retrieveImageList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          standardImage,
          search,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update name of the custom image
     * @summary Update custom image name by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} imageId The identifier of the image
     * @param {UpdateCustomImageRequest} updateCustomImageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateImage(
      xRequestId: string,
      imageId: string,
      updateCustomImageRequest: UpdateCustomImageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<UpdateCustomImageResponse> {
      return localVarFp
        .updateImage(
          xRequestId,
          imageId,
          updateCustomImageRequest,
          xTraceId,
          options,
        )
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
   * In order to provide a custom image please specify an URL from where the image can be directly downloaded. A custom image must be in either `.iso` or `.qcow2` format. Other formats will be rejected. Please note that downloading can take a while depending on network speed resp. bandwidth and size of image. You can check the status by retrieving information about the image via a GET request. Download will be rejected if you have exceeded your limits.
   * @summary Provide a custom image
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateCustomImageRequest} createCustomImageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  createCustomImage(
    xRequestId: string,
    createCustomImageRequest: CreateCustomImageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateCustomImageResponse>;

  /**
   * Your are free to delete a previously uploaded custom images at any time
   * @summary Delete an uploaded custom image by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} imageId The identifier of the image
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  deleteImage(
    xRequestId: string,
    imageId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * List statistics regarding the customer\'s custom images such as the number of custom images uploaded, used disk space, free available disk space and total available disk space
   * @summary List statistics regarding the customer\'s custom images
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  retrieveCustomImagesStats(
    xRequestId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CustomImagesStatsResponse>;

  /**
   * Get details about a specific image. This could be either a standard or custom image. In case of an custom image you can also check the download status
   * @summary Get details about a specific image by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} imageId The identifier of the image
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  retrieveImage(
    xRequestId: string,
    imageId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindImageResponse>;

  /**
   * List and filter all available standard images provided by [Contabo](https://contabo.com) and your uploaded custom images.
   * @summary List available standard and custom images
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] The name of the image
   * @param {boolean} [standardImage] Flag indicating that image is either a standard (true) or a custom image (false)
   * @param {string} [search] full text search on image name or image os type
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  retrieveImageList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    standardImage?: boolean,
    search?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListImageResponse>;

  /**
   * Update name of the custom image
   * @summary Update custom image name by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} imageId The identifier of the image
   * @param {UpdateCustomImageRequest} updateCustomImageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApiInterface
   */
  updateImage(
    xRequestId: string,
    imageId: string,
    updateCustomImageRequest: UpdateCustomImageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<UpdateCustomImageResponse>;
}

/**
 * ImagesApi - object-oriented interface
 * @export
 * @class ImagesApi
 * @extends {BaseAPI}
 */
export class ImagesApi extends BaseAPI implements ImagesApiInterface {
  /**
   * In order to provide a custom image please specify an URL from where the image can be directly downloaded. A custom image must be in either `.iso` or `.qcow2` format. Other formats will be rejected. Please note that downloading can take a while depending on network speed resp. bandwidth and size of image. You can check the status by retrieving information about the image via a GET request. Download will be rejected if you have exceeded your limits.
   * @summary Provide a custom image
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateCustomImageRequest} createCustomImageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public createCustomImage(
    xRequestId: string,
    createCustomImageRequest: CreateCustomImageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .createCustomImage(
        xRequestId,
        createCustomImageRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Your are free to delete a previously uploaded custom images at any time
   * @summary Delete an uploaded custom image by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} imageId The identifier of the image
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public deleteImage(
    xRequestId: string,
    imageId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .deleteImage(xRequestId, imageId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List statistics regarding the customer\'s custom images such as the number of custom images uploaded, used disk space, free available disk space and total available disk space
   * @summary List statistics regarding the customer\'s custom images
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public retrieveCustomImagesStats(
    xRequestId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .retrieveCustomImagesStats(xRequestId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get details about a specific image. This could be either a standard or custom image. In case of an custom image you can also check the download status
   * @summary Get details about a specific image by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} imageId The identifier of the image
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public retrieveImage(
    xRequestId: string,
    imageId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .retrieveImage(xRequestId, imageId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all available standard images provided by [Contabo](https://contabo.com) and your uploaded custom images.
   * @summary List available standard and custom images
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] The name of the image
   * @param {boolean} [standardImage] Flag indicating that image is either a standard (true) or a custom image (false)
   * @param {string} [search] full text search on image name or image os type
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public retrieveImageList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    standardImage?: boolean,
    search?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .retrieveImageList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        name,
        standardImage,
        search,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update name of the custom image
   * @summary Update custom image name by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} imageId The identifier of the image
   * @param {UpdateCustomImageRequest} updateCustomImageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesApi
   */
  public updateImage(
    xRequestId: string,
    imageId: string,
    updateCustomImageRequest: UpdateCustomImageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesApiFp(this.configuration)
      .updateImage(
        xRequestId,
        imageId,
        updateCustomImageRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * ImagesAuditsApi - axios parameter creator
 * @export
 */
export const ImagesAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your custom images.
     * @summary List history about your custom images (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [imageId] The identifier of the image.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] UserId of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveImageAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      imageId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveImageAuditsList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/compute/images/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (imageId !== undefined) {
        localVarQueryParameter['imageId'] = imageId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * ImagesAuditsApi - functional programming interface
 * @export
 */
export const ImagesAuditsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    ImagesAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your custom images.
     * @summary List history about your custom images (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [imageId] The identifier of the image.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] UserId of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveImageAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      imageId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ImageAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveImageAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          imageId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImagesAuditsApi.retrieveImageAuditsList']?.[
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
 * ImagesAuditsApi - factory interface
 * @export
 */
export const ImagesAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = ImagesAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your custom images.
     * @summary List history about your custom images (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [imageId] The identifier of the image.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] UserId of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveImageAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      imageId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ImageAuditResponse> {
      return localVarFp
        .retrieveImageAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          imageId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ImagesAuditsApi - interface
 * @export
 * @interface ImagesAuditsApi
 */
export interface ImagesAuditsApiInterface {
  /**
   * List and filters the history about your custom images.
   * @summary List history about your custom images (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [imageId] The identifier of the image.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] UserId of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesAuditsApiInterface
   */
  retrieveImageAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    imageId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ImageAuditResponse>;
}

/**
 * ImagesAuditsApi - object-oriented interface
 * @export
 * @class ImagesAuditsApi
 * @extends {BaseAPI}
 */
export class ImagesAuditsApi
  extends BaseAPI
  implements ImagesAuditsApiInterface
{
  /**
   * List and filters the history about your custom images.
   * @summary List history about your custom images (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [imageId] The identifier of the image.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] UserId of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImagesAuditsApi
   */
  public retrieveImageAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    imageId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ImagesAuditsApiFp(this.configuration)
      .retrieveImageAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        imageId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * InstanceActionsApi - axios parameter creator
 * @export
 */
export const InstanceActionsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * You can reboot your instance in rescue mode to resolve system issues. Rescue system is Linux based and its booted instead of your regular operating system. The disk containing your operating sytstem, software and your data is already mounted for you to access and repair/modify files. After a reboot your compute instance will boot your operating system. Please note that this is for advanced users.
     * @summary Rescue a compute instance / resource identified by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {InstancesActionsRescueRequest} instancesActionsRescueRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    rescue: async (
      xRequestId: string,
      instanceId: number,
      instancesActionsRescueRequest: InstancesActionsRescueRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('rescue', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('rescue', 'instanceId', instanceId);
      // verify required parameter 'instancesActionsRescueRequest' is not null or undefined
      assertParamExists(
        'rescue',
        'instancesActionsRescueRequest',
        instancesActionsRescueRequest,
      );
      const localVarPath =
        `/v1/compute/instances/{instanceId}/actions/rescue`.replace(
          `{${'instanceId'}}`,
          encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        instancesActionsRescueRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Reset password for a compute instance / resource referenced by an id. This will reset the current password to the password that you provided in the body of this request.
     * @summary Reset password for a compute instance / resource referenced by an id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {InstancesResetPasswordActionsRequest} instancesResetPasswordActionsRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    resetPasswordAction: async (
      xRequestId: string,
      instanceId: number,
      instancesResetPasswordActionsRequest: InstancesResetPasswordActionsRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('resetPasswordAction', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('resetPasswordAction', 'instanceId', instanceId);
      // verify required parameter 'instancesResetPasswordActionsRequest' is not null or undefined
      assertParamExists(
        'resetPasswordAction',
        'instancesResetPasswordActionsRequest',
        instancesResetPasswordActionsRequest,
      );
      const localVarPath =
        `/v1/compute/instances/{instanceId}/actions/resetPassword`.replace(
          `{${'instanceId'}}`,
          encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        instancesResetPasswordActionsRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * To restart a compute instance that has been identified by its id, you should perform a restart action on it.
     * @summary Restart a compute instance / resource identified by its id.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    restart: async (
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('restart', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('restart', 'instanceId', instanceId);
      const localVarPath =
        `/v1/compute/instances/{instanceId}/actions/restart`.replace(
          `{${'instanceId'}}`,
          encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Shutdown an compute instance / resource. This is similar to pressing the power button on a physical machine. This will send an ACPI event for the guest OS, which should then proceed to a clean shutdown.
     * @summary Shutdown compute instance / resource by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    shutdown: async (
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('shutdown', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('shutdown', 'instanceId', instanceId);
      const localVarPath =
        `/v1/compute/instances/{instanceId}/actions/shutdown`.replace(
          `{${'instanceId'}}`,
          encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Starting a compute instance / resource is like powering on a real server. If the compute instance / resource is already started nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
     * @summary Start a compute instance / resource identified by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    start: async (
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('start', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('start', 'instanceId', instanceId);
      const localVarPath =
        `/v1/compute/instances/{instanceId}/actions/start`.replace(
          `{${'instanceId'}}`,
          encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Stopping a compute instance / resource is like powering off a real server. So please be aware that data may be lost. Alternatively you may log in and shut your compute instance / resource gracefully via the operating system. If the compute instance / resource is already stopped nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
     * @summary Stop compute instance / resource by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    stop: async (
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('stop', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('stop', 'instanceId', instanceId);
      const localVarPath =
        `/v1/compute/instances/{instanceId}/actions/stop`.replace(
          `{${'instanceId'}}`,
          encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * InstanceActionsApi - functional programming interface
 * @export
 */
export const InstanceActionsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    InstanceActionsApiAxiosParamCreator(configuration);
  return {
    /**
     * You can reboot your instance in rescue mode to resolve system issues. Rescue system is Linux based and its booted instead of your regular operating system. The disk containing your operating sytstem, software and your data is already mounted for you to access and repair/modify files. After a reboot your compute instance will boot your operating system. Please note that this is for advanced users.
     * @summary Rescue a compute instance / resource identified by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {InstancesActionsRescueRequest} instancesActionsRescueRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async rescue(
      xRequestId: string,
      instanceId: number,
      instancesActionsRescueRequest: InstancesActionsRescueRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<InstanceRescueActionResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.rescue(
        xRequestId,
        instanceId,
        instancesActionsRescueRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstanceActionsApi.rescue']?.[
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
     * Reset password for a compute instance / resource referenced by an id. This will reset the current password to the password that you provided in the body of this request.
     * @summary Reset password for a compute instance / resource referenced by an id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {InstancesResetPasswordActionsRequest} instancesResetPasswordActionsRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async resetPasswordAction(
      xRequestId: string,
      instanceId: number,
      instancesResetPasswordActionsRequest: InstancesResetPasswordActionsRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<InstanceResetPasswordActionResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.resetPasswordAction(
          xRequestId,
          instanceId,
          instancesResetPasswordActionsRequest,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstanceActionsApi.resetPasswordAction']?.[
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
     * To restart a compute instance that has been identified by its id, you should perform a restart action on it.
     * @summary Restart a compute instance / resource identified by its id.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async restart(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<InstanceRestartActionResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.restart(
        xRequestId,
        instanceId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstanceActionsApi.restart']?.[
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
     * Shutdown an compute instance / resource. This is similar to pressing the power button on a physical machine. This will send an ACPI event for the guest OS, which should then proceed to a clean shutdown.
     * @summary Shutdown compute instance / resource by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async shutdown(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<InstanceShutdownActionResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.shutdown(
        xRequestId,
        instanceId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstanceActionsApi.shutdown']?.[
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
     * Starting a compute instance / resource is like powering on a real server. If the compute instance / resource is already started nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
     * @summary Start a compute instance / resource identified by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async start(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<InstanceStartActionResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.start(
        xRequestId,
        instanceId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstanceActionsApi.start']?.[
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
     * Stopping a compute instance / resource is like powering off a real server. So please be aware that data may be lost. Alternatively you may log in and shut your compute instance / resource gracefully via the operating system. If the compute instance / resource is already stopped nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
     * @summary Stop compute instance / resource by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async stop(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<InstanceStopActionResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.stop(
        xRequestId,
        instanceId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstanceActionsApi.stop']?.[
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
 * InstanceActionsApi - factory interface
 * @export
 */
export const InstanceActionsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = InstanceActionsApiFp(configuration);
  return {
    /**
     * You can reboot your instance in rescue mode to resolve system issues. Rescue system is Linux based and its booted instead of your regular operating system. The disk containing your operating sytstem, software and your data is already mounted for you to access and repair/modify files. After a reboot your compute instance will boot your operating system. Please note that this is for advanced users.
     * @summary Rescue a compute instance / resource identified by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {InstancesActionsRescueRequest} instancesActionsRescueRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    rescue(
      xRequestId: string,
      instanceId: number,
      instancesActionsRescueRequest: InstancesActionsRescueRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<InstanceRescueActionResponse> {
      return localVarFp
        .rescue(
          xRequestId,
          instanceId,
          instancesActionsRescueRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Reset password for a compute instance / resource referenced by an id. This will reset the current password to the password that you provided in the body of this request.
     * @summary Reset password for a compute instance / resource referenced by an id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {InstancesResetPasswordActionsRequest} instancesResetPasswordActionsRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    resetPasswordAction(
      xRequestId: string,
      instanceId: number,
      instancesResetPasswordActionsRequest: InstancesResetPasswordActionsRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<InstanceResetPasswordActionResponse> {
      return localVarFp
        .resetPasswordAction(
          xRequestId,
          instanceId,
          instancesResetPasswordActionsRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * To restart a compute instance that has been identified by its id, you should perform a restart action on it.
     * @summary Restart a compute instance / resource identified by its id.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    restart(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<InstanceRestartActionResponse> {
      return localVarFp
        .restart(xRequestId, instanceId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Shutdown an compute instance / resource. This is similar to pressing the power button on a physical machine. This will send an ACPI event for the guest OS, which should then proceed to a clean shutdown.
     * @summary Shutdown compute instance / resource by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    shutdown(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<InstanceShutdownActionResponse> {
      return localVarFp
        .shutdown(xRequestId, instanceId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Starting a compute instance / resource is like powering on a real server. If the compute instance / resource is already started nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
     * @summary Start a compute instance / resource identified by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    start(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<InstanceStartActionResponse> {
      return localVarFp
        .start(xRequestId, instanceId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Stopping a compute instance / resource is like powering off a real server. So please be aware that data may be lost. Alternatively you may log in and shut your compute instance / resource gracefully via the operating system. If the compute instance / resource is already stopped nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
     * @summary Stop compute instance / resource by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    stop(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<InstanceStopActionResponse> {
      return localVarFp
        .stop(xRequestId, instanceId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * InstanceActionsApi - interface
 * @export
 * @interface InstanceActionsApi
 */
export interface InstanceActionsApiInterface {
  /**
   * You can reboot your instance in rescue mode to resolve system issues. Rescue system is Linux based and its booted instead of your regular operating system. The disk containing your operating sytstem, software and your data is already mounted for you to access and repair/modify files. After a reboot your compute instance will boot your operating system. Please note that this is for advanced users.
   * @summary Rescue a compute instance / resource identified by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {InstancesActionsRescueRequest} instancesActionsRescueRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApiInterface
   */
  rescue(
    xRequestId: string,
    instanceId: number,
    instancesActionsRescueRequest: InstancesActionsRescueRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<InstanceRescueActionResponse>;

  /**
   * Reset password for a compute instance / resource referenced by an id. This will reset the current password to the password that you provided in the body of this request.
   * @summary Reset password for a compute instance / resource referenced by an id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {InstancesResetPasswordActionsRequest} instancesResetPasswordActionsRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApiInterface
   */
  resetPasswordAction(
    xRequestId: string,
    instanceId: number,
    instancesResetPasswordActionsRequest: InstancesResetPasswordActionsRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<InstanceResetPasswordActionResponse>;

  /**
   * To restart a compute instance that has been identified by its id, you should perform a restart action on it.
   * @summary Restart a compute instance / resource identified by its id.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApiInterface
   */
  restart(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<InstanceRestartActionResponse>;

  /**
   * Shutdown an compute instance / resource. This is similar to pressing the power button on a physical machine. This will send an ACPI event for the guest OS, which should then proceed to a clean shutdown.
   * @summary Shutdown compute instance / resource by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApiInterface
   */
  shutdown(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<InstanceShutdownActionResponse>;

  /**
   * Starting a compute instance / resource is like powering on a real server. If the compute instance / resource is already started nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
   * @summary Start a compute instance / resource identified by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApiInterface
   */
  start(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<InstanceStartActionResponse>;

  /**
   * Stopping a compute instance / resource is like powering off a real server. So please be aware that data may be lost. Alternatively you may log in and shut your compute instance / resource gracefully via the operating system. If the compute instance / resource is already stopped nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
   * @summary Stop compute instance / resource by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApiInterface
   */
  stop(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<InstanceStopActionResponse>;
}

/**
 * InstanceActionsApi - object-oriented interface
 * @export
 * @class InstanceActionsApi
 * @extends {BaseAPI}
 */
export class InstanceActionsApi
  extends BaseAPI
  implements InstanceActionsApiInterface
{
  /**
   * You can reboot your instance in rescue mode to resolve system issues. Rescue system is Linux based and its booted instead of your regular operating system. The disk containing your operating sytstem, software and your data is already mounted for you to access and repair/modify files. After a reboot your compute instance will boot your operating system. Please note that this is for advanced users.
   * @summary Rescue a compute instance / resource identified by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {InstancesActionsRescueRequest} instancesActionsRescueRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApi
   */
  public rescue(
    xRequestId: string,
    instanceId: number,
    instancesActionsRescueRequest: InstancesActionsRescueRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstanceActionsApiFp(this.configuration)
      .rescue(
        xRequestId,
        instanceId,
        instancesActionsRescueRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Reset password for a compute instance / resource referenced by an id. This will reset the current password to the password that you provided in the body of this request.
   * @summary Reset password for a compute instance / resource referenced by an id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {InstancesResetPasswordActionsRequest} instancesResetPasswordActionsRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApi
   */
  public resetPasswordAction(
    xRequestId: string,
    instanceId: number,
    instancesResetPasswordActionsRequest: InstancesResetPasswordActionsRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstanceActionsApiFp(this.configuration)
      .resetPasswordAction(
        xRequestId,
        instanceId,
        instancesResetPasswordActionsRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * To restart a compute instance that has been identified by its id, you should perform a restart action on it.
   * @summary Restart a compute instance / resource identified by its id.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApi
   */
  public restart(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstanceActionsApiFp(this.configuration)
      .restart(xRequestId, instanceId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Shutdown an compute instance / resource. This is similar to pressing the power button on a physical machine. This will send an ACPI event for the guest OS, which should then proceed to a clean shutdown.
   * @summary Shutdown compute instance / resource by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApi
   */
  public shutdown(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstanceActionsApiFp(this.configuration)
      .shutdown(xRequestId, instanceId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Starting a compute instance / resource is like powering on a real server. If the compute instance / resource is already started nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
   * @summary Start a compute instance / resource identified by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApi
   */
  public start(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstanceActionsApiFp(this.configuration)
      .start(xRequestId, instanceId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Stopping a compute instance / resource is like powering off a real server. So please be aware that data may be lost. Alternatively you may log in and shut your compute instance / resource gracefully via the operating system. If the compute instance / resource is already stopped nothing will happen. You may check the current status anytime when getting information about a compute instance / resource.
   * @summary Stop compute instance / resource by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the compute instance / resource to be started in rescue mode.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsApi
   */
  public stop(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstanceActionsApiFp(this.configuration)
      .stop(xRequestId, instanceId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * InstanceActionsAuditsApi - axios parameter creator
 * @export
 */
export const InstanceActionsAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your actions your triggered via the API.
     * @summary List history about your actions (audit) triggered via the API
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [instanceId] The identifier of the instancesActions.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveInstancesActionsAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      instanceId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'retrieveInstancesActionsAuditsList',
        'xRequestId',
        xRequestId,
      );
      const localVarPath = `/v1/compute/instances/actions/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (instanceId !== undefined) {
        localVarQueryParameter['instanceId'] = instanceId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * InstanceActionsAuditsApi - functional programming interface
 * @export
 */
export const InstanceActionsAuditsApiFp = function (
  configuration?: Configuration,
) {
  const localVarAxiosParamCreator =
    InstanceActionsAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your actions your triggered via the API.
     * @summary List history about your actions (audit) triggered via the API
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [instanceId] The identifier of the instancesActions.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveInstancesActionsAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      instanceId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListInstancesActionsAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveInstancesActionsAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          instanceId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'InstanceActionsAuditsApi.retrieveInstancesActionsAuditsList'
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
 * InstanceActionsAuditsApi - factory interface
 * @export
 */
export const InstanceActionsAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = InstanceActionsAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your actions your triggered via the API.
     * @summary List history about your actions (audit) triggered via the API
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [instanceId] The identifier of the instancesActions.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveInstancesActionsAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      instanceId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListInstancesActionsAuditResponse> {
      return localVarFp
        .retrieveInstancesActionsAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          instanceId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * InstanceActionsAuditsApi - interface
 * @export
 * @interface InstanceActionsAuditsApi
 */
export interface InstanceActionsAuditsApiInterface {
  /**
   * List and filters the history about your actions your triggered via the API.
   * @summary List history about your actions (audit) triggered via the API
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [instanceId] The identifier of the instancesActions.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsAuditsApiInterface
   */
  retrieveInstancesActionsAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    instanceId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListInstancesActionsAuditResponse>;
}

/**
 * InstanceActionsAuditsApi - object-oriented interface
 * @export
 * @class InstanceActionsAuditsApi
 * @extends {BaseAPI}
 */
export class InstanceActionsAuditsApi
  extends BaseAPI
  implements InstanceActionsAuditsApiInterface
{
  /**
   * List and filters the history about your actions your triggered via the API.
   * @summary List history about your actions (audit) triggered via the API
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [instanceId] The identifier of the instancesActions.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstanceActionsAuditsApi
   */
  public retrieveInstancesActionsAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    instanceId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstanceActionsAuditsApiFp(this.configuration)
      .retrieveInstancesActionsAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        instanceId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * InstancesApi - axios parameter creator
 * @export
 */
export const InstancesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Your are free to cancel a previously created instance at any time.
     * @summary Cancel specific instance by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {CancelInstanceRequest} cancelInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    cancelInstance: async (
      xRequestId: string,
      instanceId: number,
      cancelInstanceRequest: CancelInstanceRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('cancelInstance', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('cancelInstance', 'instanceId', instanceId);
      // verify required parameter 'cancelInstanceRequest' is not null or undefined
      assertParamExists(
        'cancelInstance',
        'cancelInstanceRequest',
        cancelInstanceRequest,
      );
      const localVarPath = `/v1/compute/instances/{instanceId}/cancel`.replace(
        `{${'instanceId'}}`,
        encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        cancelInstanceRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Create a new instance for your account with the provided parameters.         <table>           <tr><th>ProductId</th><th>Product</th><th>Disk Size</th></tr>           <tr><td>V68</td><td>VPS 4C NVMe</td><td>100 GB NVMe</td></tr>           <tr><td>V76</td><td>VPS 4C SSD</td><td>200 GB SSD</td></tr>          <tr><td>V85</td><td>VPS 4C Storage</td><td>600 GB NVMe</td></tr>           <tr><td>V69</td><td>VPS 6C NVMe</td><td>150 GB NVMe</td></tr>           <tr><td>V77</td><td>VPS 6C SSD</td><td>300 GB SSD</td></tr>          <tr><td>V86</td><td>VPS 6C Storage</td><td>1800 GB NVMe</td></tr>           <tr><td>V70</td><td>VPS 8C NVMe</td><td>200 GB NVMe</td></tr>           <tr><td>V78</td><td>VPS 8C SSD</td><td>400 GB SSD</td></tr>          <tr><td>V87</td><td>VPS 8C Storage</td><td>2400 GB NVMe</td></tr>           <tr><td>V71</td><td>VPS 10C NVMe</td><td>250 GB NVMe</td></tr>           <tr><td>V79</td><td>VPS 10C SSD</td><td>500 GB SSD</td></tr>           <tr><td>V88</td><td>VPS 10C Storage</td><td>3200 GB NVMe</td></tr>           <tr><td>V72</td><td>VPS 14C NVMe</td><td>300 GB NVMe</td></tr>           <tr><td>V80</td><td>VPS 14C SSD</td><td>600 GB SSD</td></tr>           <tr><td>V89</td><td>VPS 16C Storage</td><td>3600 GB SSD</td></tr>           <tr><td>V73</td><td>VPS 20C NVMe</td><td>400 GB NVMe</td></tr>           <tr><td>V81</td><td>VPS 20C SSD</td><td>800 GB SSD</td></tr>           <tr><td>V74</td><td>VPS 24C NVMe</td><td>600 GB NVMe</td></tr>           <tr><td>V83</td><td>VPS 24C SSD</td><td>1200 GB SSD</td></tr>           <tr><td>V8</td><td>VDS S</td><td>180 GB NVMe</td></tr>           <tr><td>V9</td><td>VDS M</td><td>240 GB NVMe</td></tr>           <tr><td>V10</td><td>VDS L</td><td>360 GB NVMe</td></tr>           <tr><td>V11</td><td>VDS XL</td><td>480 GB NVMe</td></tr>           <tr><td>V16</td><td>VDS XXL</td><td>720 GB NVMe</td></tr>           </table>
     * @summary Create a new instance
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateInstanceRequest} createInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createInstance: async (
      xRequestId: string,
      createInstanceRequest: CreateInstanceRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createInstance', 'xRequestId', xRequestId);
      // verify required parameter 'createInstanceRequest' is not null or undefined
      assertParamExists(
        'createInstance',
        'createInstanceRequest',
        createInstanceRequest,
      );
      const localVarPath = `/v1/compute/instances`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        createInstanceRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update specific instance by instanceId.
     * @summary Update specific instance
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {PatchInstanceRequest} patchInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    patchInstance: async (
      xRequestId: string,
      instanceId: number,
      patchInstanceRequest: PatchInstanceRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('patchInstance', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('patchInstance', 'instanceId', instanceId);
      // verify required parameter 'patchInstanceRequest' is not null or undefined
      assertParamExists(
        'patchInstance',
        'patchInstanceRequest',
        patchInstanceRequest,
      );
      const localVarPath = `/v1/compute/instances/{instanceId}`.replace(
        `{${'instanceId'}}`,
        encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        patchInstanceRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * You can reinstall a specific instance with a new image and optionally add ssh keys, a root password or cloud-init.
     * @summary Reinstall specific instance
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {ReinstallInstanceRequest} reinstallInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    reinstallInstance: async (
      xRequestId: string,
      instanceId: number,
      reinstallInstanceRequest: ReinstallInstanceRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('reinstallInstance', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('reinstallInstance', 'instanceId', instanceId);
      // verify required parameter 'reinstallInstanceRequest' is not null or undefined
      assertParamExists(
        'reinstallInstance',
        'reinstallInstanceRequest',
        reinstallInstanceRequest,
      );
      const localVarPath = `/v1/compute/instances/{instanceId}`.replace(
        `{${'instanceId'}}`,
        encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        reinstallInstanceRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Get attributes values to a specific instance on your account.
     * @summary Get specific instance by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveInstance: async (
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveInstance', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('retrieveInstance', 'instanceId', instanceId);
      const localVarPath = `/v1/compute/instances/{instanceId}`.replace(
        `{${'instanceId'}}`,
        encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all instances in your account
     * @summary List instances
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the instance
     * @param {string} [displayName] The display name of the instance
     * @param {string} [dataCenter] The data center of the instance
     * @param {string} [region] The Region of the instance
     * @param {number} [instanceId] The identifier of the instance (deprecated)
     * @param {string} [instanceIds] Comma separated instances identifiers
     * @param {RetrieveInstancesListStatusEnum} [status] The status of the instance
     * @param {string} [addOnIds] Identifiers of Addons the instances have
     * @param {string} [productTypes] Comma separated instance\&#39;s category depending on Product Id
     * @param {boolean} [ipConfig] Filter instances that have an ip config
     * @param {string} [search] Full text search when listing the instances. Can be searched by &#x60;name&#x60;, &#x60;displayName&#x60;, &#x60;ipAddress&#x60;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveInstancesList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      displayName?: string,
      dataCenter?: string,
      region?: string,
      instanceId?: number,
      instanceIds?: string,
      status?: RetrieveInstancesListStatusEnum,
      addOnIds?: string,
      productTypes?: string,
      ipConfig?: boolean,
      search?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveInstancesList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/compute/instances`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (displayName !== undefined) {
        localVarQueryParameter['displayName'] = displayName;
      }

      if (dataCenter !== undefined) {
        localVarQueryParameter['dataCenter'] = dataCenter;
      }

      if (region !== undefined) {
        localVarQueryParameter['region'] = region;
      }

      if (instanceId !== undefined) {
        localVarQueryParameter['instanceId'] = instanceId;
      }

      if (instanceIds !== undefined) {
        localVarQueryParameter['instanceIds'] = instanceIds;
      }

      if (status !== undefined) {
        localVarQueryParameter['status'] = status;
      }

      if (addOnIds !== undefined) {
        localVarQueryParameter['addOnIds'] = addOnIds;
      }

      if (productTypes !== undefined) {
        localVarQueryParameter['productTypes'] = productTypes;
      }

      if (ipConfig !== undefined) {
        localVarQueryParameter['ipConfig'] = ipConfig;
      }

      if (search !== undefined) {
        localVarQueryParameter['search'] = search;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * In order to enhance your instance with additional features you can purchase add-ons.   Currently only firewalling and private network addon is allowed.
     * @summary Upgrading instance capabilities
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {UpgradeInstanceRequest} upgradeInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    upgradeInstance: async (
      xRequestId: string,
      instanceId: number,
      upgradeInstanceRequest: UpgradeInstanceRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('upgradeInstance', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('upgradeInstance', 'instanceId', instanceId);
      // verify required parameter 'upgradeInstanceRequest' is not null or undefined
      assertParamExists(
        'upgradeInstance',
        'upgradeInstanceRequest',
        upgradeInstanceRequest,
      );
      const localVarPath = `/v1/compute/instances/{instanceId}/upgrade`.replace(
        `{${'instanceId'}}`,
        encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        upgradeInstanceRequest,
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
     * Your are free to cancel a previously created instance at any time.
     * @summary Cancel specific instance by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {CancelInstanceRequest} cancelInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async cancelInstance(
      xRequestId: string,
      instanceId: number,
      cancelInstanceRequest: CancelInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CancelInstanceResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.cancelInstance(
        xRequestId,
        instanceId,
        cancelInstanceRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.cancelInstance']?.[
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
     * Create a new instance for your account with the provided parameters.         <table>           <tr><th>ProductId</th><th>Product</th><th>Disk Size</th></tr>           <tr><td>V68</td><td>VPS 4C NVMe</td><td>100 GB NVMe</td></tr>           <tr><td>V76</td><td>VPS 4C SSD</td><td>200 GB SSD</td></tr>          <tr><td>V85</td><td>VPS 4C Storage</td><td>600 GB NVMe</td></tr>           <tr><td>V69</td><td>VPS 6C NVMe</td><td>150 GB NVMe</td></tr>           <tr><td>V77</td><td>VPS 6C SSD</td><td>300 GB SSD</td></tr>          <tr><td>V86</td><td>VPS 6C Storage</td><td>1800 GB NVMe</td></tr>           <tr><td>V70</td><td>VPS 8C NVMe</td><td>200 GB NVMe</td></tr>           <tr><td>V78</td><td>VPS 8C SSD</td><td>400 GB SSD</td></tr>          <tr><td>V87</td><td>VPS 8C Storage</td><td>2400 GB NVMe</td></tr>           <tr><td>V71</td><td>VPS 10C NVMe</td><td>250 GB NVMe</td></tr>           <tr><td>V79</td><td>VPS 10C SSD</td><td>500 GB SSD</td></tr>           <tr><td>V88</td><td>VPS 10C Storage</td><td>3200 GB NVMe</td></tr>           <tr><td>V72</td><td>VPS 14C NVMe</td><td>300 GB NVMe</td></tr>           <tr><td>V80</td><td>VPS 14C SSD</td><td>600 GB SSD</td></tr>           <tr><td>V89</td><td>VPS 16C Storage</td><td>3600 GB SSD</td></tr>           <tr><td>V73</td><td>VPS 20C NVMe</td><td>400 GB NVMe</td></tr>           <tr><td>V81</td><td>VPS 20C SSD</td><td>800 GB SSD</td></tr>           <tr><td>V74</td><td>VPS 24C NVMe</td><td>600 GB NVMe</td></tr>           <tr><td>V83</td><td>VPS 24C SSD</td><td>1200 GB SSD</td></tr>           <tr><td>V8</td><td>VDS S</td><td>180 GB NVMe</td></tr>           <tr><td>V9</td><td>VDS M</td><td>240 GB NVMe</td></tr>           <tr><td>V10</td><td>VDS L</td><td>360 GB NVMe</td></tr>           <tr><td>V11</td><td>VDS XL</td><td>480 GB NVMe</td></tr>           <tr><td>V16</td><td>VDS XXL</td><td>720 GB NVMe</td></tr>           </table>
     * @summary Create a new instance
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateInstanceRequest} createInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createInstance(
      xRequestId: string,
      createInstanceRequest: CreateInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateInstanceResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createInstance(
        xRequestId,
        createInstanceRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.createInstance']?.[
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
     * Update specific instance by instanceId.
     * @summary Update specific instance
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {PatchInstanceRequest} patchInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async patchInstance(
      xRequestId: string,
      instanceId: number,
      patchInstanceRequest: PatchInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<PatchInstanceResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.patchInstance(
        xRequestId,
        instanceId,
        patchInstanceRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.patchInstance']?.[
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
     * You can reinstall a specific instance with a new image and optionally add ssh keys, a root password or cloud-init.
     * @summary Reinstall specific instance
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {ReinstallInstanceRequest} reinstallInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async reinstallInstance(
      xRequestId: string,
      instanceId: number,
      reinstallInstanceRequest: ReinstallInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ReinstallInstanceResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.reinstallInstance(
          xRequestId,
          instanceId,
          reinstallInstanceRequest,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.reinstallInstance']?.[
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
     * Get attributes values to a specific instance on your account.
     * @summary Get specific instance by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveInstance(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindInstanceResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveInstance(
          xRequestId,
          instanceId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.retrieveInstance']?.[
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
     * List and filter all instances in your account
     * @summary List instances
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the instance
     * @param {string} [displayName] The display name of the instance
     * @param {string} [dataCenter] The data center of the instance
     * @param {string} [region] The Region of the instance
     * @param {number} [instanceId] The identifier of the instance (deprecated)
     * @param {string} [instanceIds] Comma separated instances identifiers
     * @param {RetrieveInstancesListStatusEnum} [status] The status of the instance
     * @param {string} [addOnIds] Identifiers of Addons the instances have
     * @param {string} [productTypes] Comma separated instance\&#39;s category depending on Product Id
     * @param {boolean} [ipConfig] Filter instances that have an ip config
     * @param {string} [search] Full text search when listing the instances. Can be searched by &#x60;name&#x60;, &#x60;displayName&#x60;, &#x60;ipAddress&#x60;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveInstancesList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      displayName?: string,
      dataCenter?: string,
      region?: string,
      instanceId?: number,
      instanceIds?: string,
      status?: RetrieveInstancesListStatusEnum,
      addOnIds?: string,
      productTypes?: string,
      ipConfig?: boolean,
      search?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListInstancesResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveInstancesList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          displayName,
          dataCenter,
          region,
          instanceId,
          instanceIds,
          status,
          addOnIds,
          productTypes,
          ipConfig,
          search,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.retrieveInstancesList']?.[
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
     * In order to enhance your instance with additional features you can purchase add-ons.   Currently only firewalling and private network addon is allowed.
     * @summary Upgrading instance capabilities
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {UpgradeInstanceRequest} upgradeInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async upgradeInstance(
      xRequestId: string,
      instanceId: number,
      upgradeInstanceRequest: UpgradeInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<PatchInstanceResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.upgradeInstance(
        xRequestId,
        instanceId,
        upgradeInstanceRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesApi.upgradeInstance']?.[
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
     * Your are free to cancel a previously created instance at any time.
     * @summary Cancel specific instance by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {CancelInstanceRequest} cancelInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    cancelInstance(
      xRequestId: string,
      instanceId: number,
      cancelInstanceRequest: CancelInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CancelInstanceResponse> {
      return localVarFp
        .cancelInstance(
          xRequestId,
          instanceId,
          cancelInstanceRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a new instance for your account with the provided parameters.         <table>           <tr><th>ProductId</th><th>Product</th><th>Disk Size</th></tr>           <tr><td>V68</td><td>VPS 4C NVMe</td><td>100 GB NVMe</td></tr>           <tr><td>V76</td><td>VPS 4C SSD</td><td>200 GB SSD</td></tr>          <tr><td>V85</td><td>VPS 4C Storage</td><td>600 GB NVMe</td></tr>           <tr><td>V69</td><td>VPS 6C NVMe</td><td>150 GB NVMe</td></tr>           <tr><td>V77</td><td>VPS 6C SSD</td><td>300 GB SSD</td></tr>          <tr><td>V86</td><td>VPS 6C Storage</td><td>1800 GB NVMe</td></tr>           <tr><td>V70</td><td>VPS 8C NVMe</td><td>200 GB NVMe</td></tr>           <tr><td>V78</td><td>VPS 8C SSD</td><td>400 GB SSD</td></tr>          <tr><td>V87</td><td>VPS 8C Storage</td><td>2400 GB NVMe</td></tr>           <tr><td>V71</td><td>VPS 10C NVMe</td><td>250 GB NVMe</td></tr>           <tr><td>V79</td><td>VPS 10C SSD</td><td>500 GB SSD</td></tr>           <tr><td>V88</td><td>VPS 10C Storage</td><td>3200 GB NVMe</td></tr>           <tr><td>V72</td><td>VPS 14C NVMe</td><td>300 GB NVMe</td></tr>           <tr><td>V80</td><td>VPS 14C SSD</td><td>600 GB SSD</td></tr>           <tr><td>V89</td><td>VPS 16C Storage</td><td>3600 GB SSD</td></tr>           <tr><td>V73</td><td>VPS 20C NVMe</td><td>400 GB NVMe</td></tr>           <tr><td>V81</td><td>VPS 20C SSD</td><td>800 GB SSD</td></tr>           <tr><td>V74</td><td>VPS 24C NVMe</td><td>600 GB NVMe</td></tr>           <tr><td>V83</td><td>VPS 24C SSD</td><td>1200 GB SSD</td></tr>           <tr><td>V8</td><td>VDS S</td><td>180 GB NVMe</td></tr>           <tr><td>V9</td><td>VDS M</td><td>240 GB NVMe</td></tr>           <tr><td>V10</td><td>VDS L</td><td>360 GB NVMe</td></tr>           <tr><td>V11</td><td>VDS XL</td><td>480 GB NVMe</td></tr>           <tr><td>V16</td><td>VDS XXL</td><td>720 GB NVMe</td></tr>           </table>
     * @summary Create a new instance
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateInstanceRequest} createInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createInstance(
      xRequestId: string,
      createInstanceRequest: CreateInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateInstanceResponse> {
      return localVarFp
        .createInstance(xRequestId, createInstanceRequest, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update specific instance by instanceId.
     * @summary Update specific instance
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {PatchInstanceRequest} patchInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    patchInstance(
      xRequestId: string,
      instanceId: number,
      patchInstanceRequest: PatchInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<PatchInstanceResponse> {
      return localVarFp
        .patchInstance(
          xRequestId,
          instanceId,
          patchInstanceRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * You can reinstall a specific instance with a new image and optionally add ssh keys, a root password or cloud-init.
     * @summary Reinstall specific instance
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {ReinstallInstanceRequest} reinstallInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    reinstallInstance(
      xRequestId: string,
      instanceId: number,
      reinstallInstanceRequest: ReinstallInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ReinstallInstanceResponse> {
      return localVarFp
        .reinstallInstance(
          xRequestId,
          instanceId,
          reinstallInstanceRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Get attributes values to a specific instance on your account.
     * @summary Get specific instance by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveInstance(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindInstanceResponse> {
      return localVarFp
        .retrieveInstance(xRequestId, instanceId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all instances in your account
     * @summary List instances
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the instance
     * @param {string} [displayName] The display name of the instance
     * @param {string} [dataCenter] The data center of the instance
     * @param {string} [region] The Region of the instance
     * @param {number} [instanceId] The identifier of the instance (deprecated)
     * @param {string} [instanceIds] Comma separated instances identifiers
     * @param {RetrieveInstancesListStatusEnum} [status] The status of the instance
     * @param {string} [addOnIds] Identifiers of Addons the instances have
     * @param {string} [productTypes] Comma separated instance\&#39;s category depending on Product Id
     * @param {boolean} [ipConfig] Filter instances that have an ip config
     * @param {string} [search] Full text search when listing the instances. Can be searched by &#x60;name&#x60;, &#x60;displayName&#x60;, &#x60;ipAddress&#x60;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveInstancesList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      displayName?: string,
      dataCenter?: string,
      region?: string,
      instanceId?: number,
      instanceIds?: string,
      status?: RetrieveInstancesListStatusEnum,
      addOnIds?: string,
      productTypes?: string,
      ipConfig?: boolean,
      search?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListInstancesResponse> {
      return localVarFp
        .retrieveInstancesList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          displayName,
          dataCenter,
          region,
          instanceId,
          instanceIds,
          status,
          addOnIds,
          productTypes,
          ipConfig,
          search,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * In order to enhance your instance with additional features you can purchase add-ons.   Currently only firewalling and private network addon is allowed.
     * @summary Upgrading instance capabilities
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {UpgradeInstanceRequest} upgradeInstanceRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    upgradeInstance(
      xRequestId: string,
      instanceId: number,
      upgradeInstanceRequest: UpgradeInstanceRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<PatchInstanceResponse> {
      return localVarFp
        .upgradeInstance(
          xRequestId,
          instanceId,
          upgradeInstanceRequest,
          xTraceId,
          options,
        )
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
   * Your are free to cancel a previously created instance at any time.
   * @summary Cancel specific instance by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {CancelInstanceRequest} cancelInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  cancelInstance(
    xRequestId: string,
    instanceId: number,
    cancelInstanceRequest: CancelInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CancelInstanceResponse>;

  /**
   * Create a new instance for your account with the provided parameters.         <table>           <tr><th>ProductId</th><th>Product</th><th>Disk Size</th></tr>           <tr><td>V68</td><td>VPS 4C NVMe</td><td>100 GB NVMe</td></tr>           <tr><td>V76</td><td>VPS 4C SSD</td><td>200 GB SSD</td></tr>          <tr><td>V85</td><td>VPS 4C Storage</td><td>600 GB NVMe</td></tr>           <tr><td>V69</td><td>VPS 6C NVMe</td><td>150 GB NVMe</td></tr>           <tr><td>V77</td><td>VPS 6C SSD</td><td>300 GB SSD</td></tr>          <tr><td>V86</td><td>VPS 6C Storage</td><td>1800 GB NVMe</td></tr>           <tr><td>V70</td><td>VPS 8C NVMe</td><td>200 GB NVMe</td></tr>           <tr><td>V78</td><td>VPS 8C SSD</td><td>400 GB SSD</td></tr>          <tr><td>V87</td><td>VPS 8C Storage</td><td>2400 GB NVMe</td></tr>           <tr><td>V71</td><td>VPS 10C NVMe</td><td>250 GB NVMe</td></tr>           <tr><td>V79</td><td>VPS 10C SSD</td><td>500 GB SSD</td></tr>           <tr><td>V88</td><td>VPS 10C Storage</td><td>3200 GB NVMe</td></tr>           <tr><td>V72</td><td>VPS 14C NVMe</td><td>300 GB NVMe</td></tr>           <tr><td>V80</td><td>VPS 14C SSD</td><td>600 GB SSD</td></tr>           <tr><td>V89</td><td>VPS 16C Storage</td><td>3600 GB SSD</td></tr>           <tr><td>V73</td><td>VPS 20C NVMe</td><td>400 GB NVMe</td></tr>           <tr><td>V81</td><td>VPS 20C SSD</td><td>800 GB SSD</td></tr>           <tr><td>V74</td><td>VPS 24C NVMe</td><td>600 GB NVMe</td></tr>           <tr><td>V83</td><td>VPS 24C SSD</td><td>1200 GB SSD</td></tr>           <tr><td>V8</td><td>VDS S</td><td>180 GB NVMe</td></tr>           <tr><td>V9</td><td>VDS M</td><td>240 GB NVMe</td></tr>           <tr><td>V10</td><td>VDS L</td><td>360 GB NVMe</td></tr>           <tr><td>V11</td><td>VDS XL</td><td>480 GB NVMe</td></tr>           <tr><td>V16</td><td>VDS XXL</td><td>720 GB NVMe</td></tr>           </table>
   * @summary Create a new instance
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateInstanceRequest} createInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  createInstance(
    xRequestId: string,
    createInstanceRequest: CreateInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateInstanceResponse>;

  /**
   * Update specific instance by instanceId.
   * @summary Update specific instance
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {PatchInstanceRequest} patchInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  patchInstance(
    xRequestId: string,
    instanceId: number,
    patchInstanceRequest: PatchInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<PatchInstanceResponse>;

  /**
   * You can reinstall a specific instance with a new image and optionally add ssh keys, a root password or cloud-init.
   * @summary Reinstall specific instance
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {ReinstallInstanceRequest} reinstallInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  reinstallInstance(
    xRequestId: string,
    instanceId: number,
    reinstallInstanceRequest: ReinstallInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ReinstallInstanceResponse>;

  /**
   * Get attributes values to a specific instance on your account.
   * @summary Get specific instance by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  retrieveInstance(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindInstanceResponse>;

  /**
   * List and filter all instances in your account
   * @summary List instances
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] The name of the instance
   * @param {string} [displayName] The display name of the instance
   * @param {string} [dataCenter] The data center of the instance
   * @param {string} [region] The Region of the instance
   * @param {number} [instanceId] The identifier of the instance (deprecated)
   * @param {string} [instanceIds] Comma separated instances identifiers
   * @param {RetrieveInstancesListStatusEnum} [status] The status of the instance
   * @param {string} [addOnIds] Identifiers of Addons the instances have
   * @param {string} [productTypes] Comma separated instance\&#39;s category depending on Product Id
   * @param {boolean} [ipConfig] Filter instances that have an ip config
   * @param {string} [search] Full text search when listing the instances. Can be searched by &#x60;name&#x60;, &#x60;displayName&#x60;, &#x60;ipAddress&#x60;
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  retrieveInstancesList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    displayName?: string,
    dataCenter?: string,
    region?: string,
    instanceId?: number,
    instanceIds?: string,
    status?: RetrieveInstancesListStatusEnum,
    addOnIds?: string,
    productTypes?: string,
    ipConfig?: boolean,
    search?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListInstancesResponse>;

  /**
   * In order to enhance your instance with additional features you can purchase add-ons.   Currently only firewalling and private network addon is allowed.
   * @summary Upgrading instance capabilities
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {UpgradeInstanceRequest} upgradeInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApiInterface
   */
  upgradeInstance(
    xRequestId: string,
    instanceId: number,
    upgradeInstanceRequest: UpgradeInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<PatchInstanceResponse>;
}

/**
 * InstancesApi - object-oriented interface
 * @export
 * @class InstancesApi
 * @extends {BaseAPI}
 */
export class InstancesApi extends BaseAPI implements InstancesApiInterface {
  /**
   * Your are free to cancel a previously created instance at any time.
   * @summary Cancel specific instance by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {CancelInstanceRequest} cancelInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public cancelInstance(
    xRequestId: string,
    instanceId: number,
    cancelInstanceRequest: CancelInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .cancelInstance(
        xRequestId,
        instanceId,
        cancelInstanceRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a new instance for your account with the provided parameters.         <table>           <tr><th>ProductId</th><th>Product</th><th>Disk Size</th></tr>           <tr><td>V68</td><td>VPS 4C NVMe</td><td>100 GB NVMe</td></tr>           <tr><td>V76</td><td>VPS 4C SSD</td><td>200 GB SSD</td></tr>          <tr><td>V85</td><td>VPS 4C Storage</td><td>600 GB NVMe</td></tr>           <tr><td>V69</td><td>VPS 6C NVMe</td><td>150 GB NVMe</td></tr>           <tr><td>V77</td><td>VPS 6C SSD</td><td>300 GB SSD</td></tr>          <tr><td>V86</td><td>VPS 6C Storage</td><td>1800 GB NVMe</td></tr>           <tr><td>V70</td><td>VPS 8C NVMe</td><td>200 GB NVMe</td></tr>           <tr><td>V78</td><td>VPS 8C SSD</td><td>400 GB SSD</td></tr>          <tr><td>V87</td><td>VPS 8C Storage</td><td>2400 GB NVMe</td></tr>           <tr><td>V71</td><td>VPS 10C NVMe</td><td>250 GB NVMe</td></tr>           <tr><td>V79</td><td>VPS 10C SSD</td><td>500 GB SSD</td></tr>           <tr><td>V88</td><td>VPS 10C Storage</td><td>3200 GB NVMe</td></tr>           <tr><td>V72</td><td>VPS 14C NVMe</td><td>300 GB NVMe</td></tr>           <tr><td>V80</td><td>VPS 14C SSD</td><td>600 GB SSD</td></tr>           <tr><td>V89</td><td>VPS 16C Storage</td><td>3600 GB SSD</td></tr>           <tr><td>V73</td><td>VPS 20C NVMe</td><td>400 GB NVMe</td></tr>           <tr><td>V81</td><td>VPS 20C SSD</td><td>800 GB SSD</td></tr>           <tr><td>V74</td><td>VPS 24C NVMe</td><td>600 GB NVMe</td></tr>           <tr><td>V83</td><td>VPS 24C SSD</td><td>1200 GB SSD</td></tr>           <tr><td>V8</td><td>VDS S</td><td>180 GB NVMe</td></tr>           <tr><td>V9</td><td>VDS M</td><td>240 GB NVMe</td></tr>           <tr><td>V10</td><td>VDS L</td><td>360 GB NVMe</td></tr>           <tr><td>V11</td><td>VDS XL</td><td>480 GB NVMe</td></tr>           <tr><td>V16</td><td>VDS XXL</td><td>720 GB NVMe</td></tr>           </table>
   * @summary Create a new instance
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateInstanceRequest} createInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public createInstance(
    xRequestId: string,
    createInstanceRequest: CreateInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .createInstance(xRequestId, createInstanceRequest, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update specific instance by instanceId.
   * @summary Update specific instance
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {PatchInstanceRequest} patchInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public patchInstance(
    xRequestId: string,
    instanceId: number,
    patchInstanceRequest: PatchInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .patchInstance(
        xRequestId,
        instanceId,
        patchInstanceRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * You can reinstall a specific instance with a new image and optionally add ssh keys, a root password or cloud-init.
   * @summary Reinstall specific instance
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {ReinstallInstanceRequest} reinstallInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public reinstallInstance(
    xRequestId: string,
    instanceId: number,
    reinstallInstanceRequest: ReinstallInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .reinstallInstance(
        xRequestId,
        instanceId,
        reinstallInstanceRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get attributes values to a specific instance on your account.
   * @summary Get specific instance by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public retrieveInstance(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .retrieveInstance(xRequestId, instanceId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all instances in your account
   * @summary List instances
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] The name of the instance
   * @param {string} [displayName] The display name of the instance
   * @param {string} [dataCenter] The data center of the instance
   * @param {string} [region] The Region of the instance
   * @param {number} [instanceId] The identifier of the instance (deprecated)
   * @param {string} [instanceIds] Comma separated instances identifiers
   * @param {RetrieveInstancesListStatusEnum} [status] The status of the instance
   * @param {string} [addOnIds] Identifiers of Addons the instances have
   * @param {string} [productTypes] Comma separated instance\&#39;s category depending on Product Id
   * @param {boolean} [ipConfig] Filter instances that have an ip config
   * @param {string} [search] Full text search when listing the instances. Can be searched by &#x60;name&#x60;, &#x60;displayName&#x60;, &#x60;ipAddress&#x60;
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public retrieveInstancesList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    displayName?: string,
    dataCenter?: string,
    region?: string,
    instanceId?: number,
    instanceIds?: string,
    status?: RetrieveInstancesListStatusEnum,
    addOnIds?: string,
    productTypes?: string,
    ipConfig?: boolean,
    search?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .retrieveInstancesList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        name,
        displayName,
        dataCenter,
        region,
        instanceId,
        instanceIds,
        status,
        addOnIds,
        productTypes,
        ipConfig,
        search,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * In order to enhance your instance with additional features you can purchase add-ons.   Currently only firewalling and private network addon is allowed.
   * @summary Upgrading instance capabilities
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {UpgradeInstanceRequest} upgradeInstanceRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesApi
   */
  public upgradeInstance(
    xRequestId: string,
    instanceId: number,
    upgradeInstanceRequest: UpgradeInstanceRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesApiFp(this.configuration)
      .upgradeInstance(
        xRequestId,
        instanceId,
        upgradeInstanceRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const RetrieveInstancesListStatusEnum = {
  Provisioning: 'provisioning',
  Uninstalled: 'uninstalled',
  Running: 'running',
  Stopped: 'stopped',
  Error: 'error',
  Installing: 'installing',
  Unknown: 'unknown',
  ManualProvisioning: 'manual_provisioning',
  ProductNotAvailable: 'product_not_available',
  VerificationRequired: 'verification_required',
  Rescue: 'rescue',
  PendingPayment: 'pending_payment',
  Other: 'other',
  ResetPassword: 'reset_password',
} as const;
export type RetrieveInstancesListStatusEnum =
  (typeof RetrieveInstancesListStatusEnum)[keyof typeof RetrieveInstancesListStatusEnum];

/**
 * InstancesAuditsApi - axios parameter creator
 * @export
 */
export const InstancesAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your instances.
     * @summary List history about your instances (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [instanceId] The identifier of the instances.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveInstancesAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      instanceId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'retrieveInstancesAuditsList',
        'xRequestId',
        xRequestId,
      );
      const localVarPath = `/v1/compute/instances/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (instanceId !== undefined) {
        localVarQueryParameter['instanceId'] = instanceId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * InstancesAuditsApi - functional programming interface
 * @export
 */
export const InstancesAuditsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    InstancesAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your instances.
     * @summary List history about your instances (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [instanceId] The identifier of the instances.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveInstancesAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      instanceId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListInstancesAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveInstancesAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          instanceId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InstancesAuditsApi.retrieveInstancesAuditsList']?.[
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
 * InstancesAuditsApi - factory interface
 * @export
 */
export const InstancesAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = InstancesAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your instances.
     * @summary List history about your instances (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [instanceId] The identifier of the instances.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveInstancesAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      instanceId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListInstancesAuditResponse> {
      return localVarFp
        .retrieveInstancesAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          instanceId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * InstancesAuditsApi - interface
 * @export
 * @interface InstancesAuditsApi
 */
export interface InstancesAuditsApiInterface {
  /**
   * List and filters the history about your instances.
   * @summary List history about your instances (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [instanceId] The identifier of the instances.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesAuditsApiInterface
   */
  retrieveInstancesAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    instanceId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListInstancesAuditResponse>;
}

/**
 * InstancesAuditsApi - object-oriented interface
 * @export
 * @class InstancesAuditsApi
 * @extends {BaseAPI}
 */
export class InstancesAuditsApi
  extends BaseAPI
  implements InstancesAuditsApiInterface
{
  /**
   * List and filters the history about your instances.
   * @summary List history about your instances (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [instanceId] The identifier of the instances.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InstancesAuditsApi
   */
  public retrieveInstancesAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    instanceId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InstancesAuditsApiFp(this.configuration)
      .retrieveInstancesAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        instanceId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * InternalApi - axios parameter creator
 * @export
 */
export const InternalApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new support ticket.
     * @summary Create a new support ticket
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateTicketRequest} createTicketRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createTicket: async (
      xRequestId: string,
      createTicketRequest: CreateTicketRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createTicket', 'xRequestId', xRequestId);
      // verify required parameter 'createTicketRequest' is not null or undefined
      assertParamExists(
        'createTicket',
        'createTicketRequest',
        createTicketRequest,
      );
      const localVarPath = `/v1/create-ticket`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        createTicketRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Get info about idm user if the password is set.
     * @summary Get user is password set status
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {string} [userId] The user ID for checking if password is set for him
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUserIsPasswordSet: async (
      xRequestId: string,
      xTraceId?: string,
      userId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveUserIsPasswordSet', 'xRequestId', xRequestId);
      const localVarPath = `/v1/users/is-password-set`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (userId !== undefined) {
        localVarQueryParameter['userId'] = userId;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * InternalApi - functional programming interface
 * @export
 */
export const InternalApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = InternalApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new support ticket.
     * @summary Create a new support ticket
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateTicketRequest} createTicketRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createTicket(
      xRequestId: string,
      createTicketRequest: CreateTicketRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateTicketResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createTicket(
        xRequestId,
        createTicketRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InternalApi.createTicket']?.[
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
     * Get info about idm user if the password is set.
     * @summary Get user is password set status
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {string} [userId] The user ID for checking if password is set for him
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveUserIsPasswordSet(
      xRequestId: string,
      xTraceId?: string,
      userId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindUserIsPasswordSetResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveUserIsPasswordSet(
          xRequestId,
          xTraceId,
          userId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['InternalApi.retrieveUserIsPasswordSet']?.[
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
 * InternalApi - factory interface
 * @export
 */
export const InternalApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = InternalApiFp(configuration);
  return {
    /**
     * Create a new support ticket.
     * @summary Create a new support ticket
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateTicketRequest} createTicketRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createTicket(
      xRequestId: string,
      createTicketRequest: CreateTicketRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateTicketResponse> {
      return localVarFp
        .createTicket(xRequestId, createTicketRequest, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get info about idm user if the password is set.
     * @summary Get user is password set status
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {string} [userId] The user ID for checking if password is set for him
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUserIsPasswordSet(
      xRequestId: string,
      xTraceId?: string,
      userId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindUserIsPasswordSetResponse> {
      return localVarFp
        .retrieveUserIsPasswordSet(xRequestId, xTraceId, userId, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * InternalApi - interface
 * @export
 * @interface InternalApi
 */
export interface InternalApiInterface {
  /**
   * Create a new support ticket.
   * @summary Create a new support ticket
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateTicketRequest} createTicketRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InternalApiInterface
   */
  createTicket(
    xRequestId: string,
    createTicketRequest: CreateTicketRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateTicketResponse>;

  /**
   * Get info about idm user if the password is set.
   * @summary Get user is password set status
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {string} [userId] The user ID for checking if password is set for him
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InternalApiInterface
   */
  retrieveUserIsPasswordSet(
    xRequestId: string,
    xTraceId?: string,
    userId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindUserIsPasswordSetResponse>;
}

/**
 * InternalApi - object-oriented interface
 * @export
 * @class InternalApi
 * @extends {BaseAPI}
 */
export class InternalApi extends BaseAPI implements InternalApiInterface {
  /**
   * Create a new support ticket.
   * @summary Create a new support ticket
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateTicketRequest} createTicketRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InternalApi
   */
  public createTicket(
    xRequestId: string,
    createTicketRequest: CreateTicketRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InternalApiFp(this.configuration)
      .createTicket(xRequestId, createTicketRequest, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get info about idm user if the password is set.
   * @summary Get user is password set status
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {string} [userId] The user ID for checking if password is set for him
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof InternalApi
   */
  public retrieveUserIsPasswordSet(
    xRequestId: string,
    xTraceId?: string,
    userId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return InternalApiFp(this.configuration)
      .retrieveUserIsPasswordSet(xRequestId, xTraceId, userId, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * ObjectStoragesApi - axios parameter creator
 * @export
 */
export const ObjectStoragesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Cancels the specified object storage at the next possible date. Please be aware of your contract periods.
     * @summary Cancels the specified object storage at the next possible date
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {CancelObjectStorageRequest} cancelObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    cancelObjectStorage: async (
      xRequestId: string,
      objectStorageId: string,
      cancelObjectStorageRequest: CancelObjectStorageRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('cancelObjectStorage', 'xRequestId', xRequestId);
      // verify required parameter 'objectStorageId' is not null or undefined
      assertParamExists(
        'cancelObjectStorage',
        'objectStorageId',
        objectStorageId,
      );
      // verify required parameter 'cancelObjectStorageRequest' is not null or undefined
      assertParamExists(
        'cancelObjectStorage',
        'cancelObjectStorageRequest',
        cancelObjectStorageRequest,
      );
      const localVarPath =
        `/v1/object-storages/{objectStorageId}/cancel`.replace(
          `{${'objectStorageId'}}`,
          encodeURIComponent(String(objectStorageId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        cancelObjectStorageRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Create / purchase a new object storage in your account. Please note that you can only buy one object storage per location. You can actually increase the object storage space via `POST` to `/v1/object-storages/{objectStorageId}/resize`
     * @summary Create a new object storage
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateObjectStorageRequest} createObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createObjectStorage: async (
      xRequestId: string,
      createObjectStorageRequest: CreateObjectStorageRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createObjectStorage', 'xRequestId', xRequestId);
      // verify required parameter 'createObjectStorageRequest' is not null or undefined
      assertParamExists(
        'createObjectStorage',
        'createObjectStorageRequest',
        createObjectStorageRequest,
      );
      const localVarPath = `/v1/object-storages`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        createObjectStorageRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * List all data centers and their corresponding regions.
     * @summary List data centers
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [slug] Filter as match for data centers.
     * @param {string} [name] Filter for Object Storages regions.
     * @param {string} [regionName] Filter for Object Storage region names.
     * @param {string} [regionSlug] Filter for Object Storage region slugs.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveDataCenterList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      slug?: string,
      name?: string,
      regionName?: string,
      regionSlug?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveDataCenterList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/data-centers`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (slug !== undefined) {
        localVarQueryParameter['slug'] = slug;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (regionName !== undefined) {
        localVarQueryParameter['regionName'] = regionName;
      }

      if (regionSlug !== undefined) {
        localVarQueryParameter['regionSlug'] = regionSlug;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get data for a specific object storage on your account.
     * @summary Get specific object storage by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveObjectStorage: async (
      xRequestId: string,
      objectStorageId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveObjectStorage', 'xRequestId', xRequestId);
      // verify required parameter 'objectStorageId' is not null or undefined
      assertParamExists(
        'retrieveObjectStorage',
        'objectStorageId',
        objectStorageId,
      );
      const localVarPath = `/v1/object-storages/{objectStorageId}`.replace(
        `{${'objectStorageId'}}`,
        encodeURIComponent(String(objectStorageId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all object storages in your account
     * @summary List all your object storages
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [dataCenterName] Filter for Object Storage locations.
     * @param {string} [s3TenantId] Filter for Object Storage S3 tenantId.
     * @param {string} [region] Filter for Object Storage by regions. Available regions: EU, US-central, SIN
     * @param {string} [displayName] Filter for Object Storage by display name.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveObjectStorageList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      dataCenterName?: string,
      s3TenantId?: string,
      region?: string,
      displayName?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveObjectStorageList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/object-storages`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (dataCenterName !== undefined) {
        localVarQueryParameter['dataCenterName'] = dataCenterName;
      }

      if (s3TenantId !== undefined) {
        localVarQueryParameter['s3TenantId'] = s3TenantId;
      }

      if (region !== undefined) {
        localVarQueryParameter['region'] = region;
      }

      if (displayName !== undefined) {
        localVarQueryParameter['displayName'] = displayName;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List usage statistics about the specified object storage such as the number of objects uploaded / created, used object storage space. Please note that the usage statistics are updated regularly and are not live usage statistics.
     * @summary List usage statistics about the specified object storage
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveObjectStoragesStats: async (
      xRequestId: string,
      objectStorageId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'retrieveObjectStoragesStats',
        'xRequestId',
        xRequestId,
      );
      // verify required parameter 'objectStorageId' is not null or undefined
      assertParamExists(
        'retrieveObjectStoragesStats',
        'objectStorageId',
        objectStorageId,
      );
      const localVarPath =
        `/v1/object-storages/{objectStorageId}/stats`.replace(
          `{${'objectStorageId'}}`,
          encodeURIComponent(String(objectStorageId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Modifies the display name of object storage. Display name must be unique.
     * @summary Modifies the display name of object storage
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {PatchObjectStorageRequest} patchObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateObjectStorage: async (
      xRequestId: string,
      objectStorageId: string,
      patchObjectStorageRequest: PatchObjectStorageRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('updateObjectStorage', 'xRequestId', xRequestId);
      // verify required parameter 'objectStorageId' is not null or undefined
      assertParamExists(
        'updateObjectStorage',
        'objectStorageId',
        objectStorageId,
      );
      // verify required parameter 'patchObjectStorageRequest' is not null or undefined
      assertParamExists(
        'updateObjectStorage',
        'patchObjectStorageRequest',
        patchObjectStorageRequest,
      );
      const localVarPath = `/v1/object-storages/{objectStorageId}`.replace(
        `{${'objectStorageId'}}`,
        encodeURIComponent(String(objectStorageId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        patchObjectStorageRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Upgrade object storage size. You can also adjust the autoscaling settings for your object storage. Autoscaling allows you to automatically purchase storage capacity on a monthly basis up to the specified limit.
     * @summary Upgrade object storage size resp. update autoscaling settings.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {UpgradeObjectStorageRequest} upgradeObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    upgradeObjectStorage: async (
      xRequestId: string,
      objectStorageId: string,
      upgradeObjectStorageRequest: UpgradeObjectStorageRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('upgradeObjectStorage', 'xRequestId', xRequestId);
      // verify required parameter 'objectStorageId' is not null or undefined
      assertParamExists(
        'upgradeObjectStorage',
        'objectStorageId',
        objectStorageId,
      );
      // verify required parameter 'upgradeObjectStorageRequest' is not null or undefined
      assertParamExists(
        'upgradeObjectStorage',
        'upgradeObjectStorageRequest',
        upgradeObjectStorageRequest,
      );
      const localVarPath =
        `/v1/object-storages/{objectStorageId}/resize`.replace(
          `{${'objectStorageId'}}`,
          encodeURIComponent(String(objectStorageId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        upgradeObjectStorageRequest,
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
 * ObjectStoragesApi - functional programming interface
 * @export
 */
export const ObjectStoragesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    ObjectStoragesApiAxiosParamCreator(configuration);
  return {
    /**
     * Cancels the specified object storage at the next possible date. Please be aware of your contract periods.
     * @summary Cancels the specified object storage at the next possible date
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {CancelObjectStorageRequest} cancelObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async cancelObjectStorage(
      xRequestId: string,
      objectStorageId: string,
      cancelObjectStorageRequest: CancelObjectStorageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CancelObjectStorageResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.cancelObjectStorage(
          xRequestId,
          objectStorageId,
          cancelObjectStorageRequest,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ObjectStoragesApi.cancelObjectStorage']?.[
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
     * Create / purchase a new object storage in your account. Please note that you can only buy one object storage per location. You can actually increase the object storage space via `POST` to `/v1/object-storages/{objectStorageId}/resize`
     * @summary Create a new object storage
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateObjectStorageRequest} createObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createObjectStorage(
      xRequestId: string,
      createObjectStorageRequest: CreateObjectStorageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateObjectStorageResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createObjectStorage(
          xRequestId,
          createObjectStorageRequest,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ObjectStoragesApi.createObjectStorage']?.[
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
     * List all data centers and their corresponding regions.
     * @summary List data centers
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [slug] Filter as match for data centers.
     * @param {string} [name] Filter for Object Storages regions.
     * @param {string} [regionName] Filter for Object Storage region names.
     * @param {string} [regionSlug] Filter for Object Storage region slugs.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveDataCenterList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      slug?: string,
      name?: string,
      regionName?: string,
      regionSlug?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListDataCenterResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveDataCenterList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          slug,
          name,
          regionName,
          regionSlug,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ObjectStoragesApi.retrieveDataCenterList']?.[
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
     * Get data for a specific object storage on your account.
     * @summary Get specific object storage by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveObjectStorage(
      xRequestId: string,
      objectStorageId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindObjectStorageResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveObjectStorage(
          xRequestId,
          objectStorageId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ObjectStoragesApi.retrieveObjectStorage']?.[
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
     * List and filter all object storages in your account
     * @summary List all your object storages
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [dataCenterName] Filter for Object Storage locations.
     * @param {string} [s3TenantId] Filter for Object Storage S3 tenantId.
     * @param {string} [region] Filter for Object Storage by regions. Available regions: EU, US-central, SIN
     * @param {string} [displayName] Filter for Object Storage by display name.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveObjectStorageList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      dataCenterName?: string,
      s3TenantId?: string,
      region?: string,
      displayName?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListObjectStorageResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveObjectStorageList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          dataCenterName,
          s3TenantId,
          region,
          displayName,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ObjectStoragesApi.retrieveObjectStorageList']?.[
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
     * List usage statistics about the specified object storage such as the number of objects uploaded / created, used object storage space. Please note that the usage statistics are updated regularly and are not live usage statistics.
     * @summary List usage statistics about the specified object storage
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveObjectStoragesStats(
      xRequestId: string,
      objectStorageId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ObjectStoragesStatsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveObjectStoragesStats(
          xRequestId,
          objectStorageId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ObjectStoragesApi.retrieveObjectStoragesStats']?.[
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
     * Modifies the display name of object storage. Display name must be unique.
     * @summary Modifies the display name of object storage
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {PatchObjectStorageRequest} patchObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateObjectStorage(
      xRequestId: string,
      objectStorageId: string,
      patchObjectStorageRequest: PatchObjectStorageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CancelObjectStorageResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateObjectStorage(
          xRequestId,
          objectStorageId,
          patchObjectStorageRequest,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ObjectStoragesApi.updateObjectStorage']?.[
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
     * Upgrade object storage size. You can also adjust the autoscaling settings for your object storage. Autoscaling allows you to automatically purchase storage capacity on a monthly basis up to the specified limit.
     * @summary Upgrade object storage size resp. update autoscaling settings.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {UpgradeObjectStorageRequest} upgradeObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async upgradeObjectStorage(
      xRequestId: string,
      objectStorageId: string,
      upgradeObjectStorageRequest: UpgradeObjectStorageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<UpgradeObjectStorageResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.upgradeObjectStorage(
          xRequestId,
          objectStorageId,
          upgradeObjectStorageRequest,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ObjectStoragesApi.upgradeObjectStorage']?.[
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
 * ObjectStoragesApi - factory interface
 * @export
 */
export const ObjectStoragesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = ObjectStoragesApiFp(configuration);
  return {
    /**
     * Cancels the specified object storage at the next possible date. Please be aware of your contract periods.
     * @summary Cancels the specified object storage at the next possible date
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {CancelObjectStorageRequest} cancelObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    cancelObjectStorage(
      xRequestId: string,
      objectStorageId: string,
      cancelObjectStorageRequest: CancelObjectStorageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CancelObjectStorageResponse> {
      return localVarFp
        .cancelObjectStorage(
          xRequestId,
          objectStorageId,
          cancelObjectStorageRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Create / purchase a new object storage in your account. Please note that you can only buy one object storage per location. You can actually increase the object storage space via `POST` to `/v1/object-storages/{objectStorageId}/resize`
     * @summary Create a new object storage
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateObjectStorageRequest} createObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createObjectStorage(
      xRequestId: string,
      createObjectStorageRequest: CreateObjectStorageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateObjectStorageResponse> {
      return localVarFp
        .createObjectStorage(
          xRequestId,
          createObjectStorageRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * List all data centers and their corresponding regions.
     * @summary List data centers
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [slug] Filter as match for data centers.
     * @param {string} [name] Filter for Object Storages regions.
     * @param {string} [regionName] Filter for Object Storage region names.
     * @param {string} [regionSlug] Filter for Object Storage region slugs.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveDataCenterList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      slug?: string,
      name?: string,
      regionName?: string,
      regionSlug?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListDataCenterResponse> {
      return localVarFp
        .retrieveDataCenterList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          slug,
          name,
          regionName,
          regionSlug,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Get data for a specific object storage on your account.
     * @summary Get specific object storage by its id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveObjectStorage(
      xRequestId: string,
      objectStorageId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindObjectStorageResponse> {
      return localVarFp
        .retrieveObjectStorage(xRequestId, objectStorageId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all object storages in your account
     * @summary List all your object storages
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [dataCenterName] Filter for Object Storage locations.
     * @param {string} [s3TenantId] Filter for Object Storage S3 tenantId.
     * @param {string} [region] Filter for Object Storage by regions. Available regions: EU, US-central, SIN
     * @param {string} [displayName] Filter for Object Storage by display name.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveObjectStorageList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      dataCenterName?: string,
      s3TenantId?: string,
      region?: string,
      displayName?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListObjectStorageResponse> {
      return localVarFp
        .retrieveObjectStorageList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          dataCenterName,
          s3TenantId,
          region,
          displayName,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * List usage statistics about the specified object storage such as the number of objects uploaded / created, used object storage space. Please note that the usage statistics are updated regularly and are not live usage statistics.
     * @summary List usage statistics about the specified object storage
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveObjectStoragesStats(
      xRequestId: string,
      objectStorageId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ObjectStoragesStatsResponse> {
      return localVarFp
        .retrieveObjectStoragesStats(
          xRequestId,
          objectStorageId,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Modifies the display name of object storage. Display name must be unique.
     * @summary Modifies the display name of object storage
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {PatchObjectStorageRequest} patchObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateObjectStorage(
      xRequestId: string,
      objectStorageId: string,
      patchObjectStorageRequest: PatchObjectStorageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CancelObjectStorageResponse> {
      return localVarFp
        .updateObjectStorage(
          xRequestId,
          objectStorageId,
          patchObjectStorageRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Upgrade object storage size. You can also adjust the autoscaling settings for your object storage. Autoscaling allows you to automatically purchase storage capacity on a monthly basis up to the specified limit.
     * @summary Upgrade object storage size resp. update autoscaling settings.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} objectStorageId The identifier of the object storage.
     * @param {UpgradeObjectStorageRequest} upgradeObjectStorageRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    upgradeObjectStorage(
      xRequestId: string,
      objectStorageId: string,
      upgradeObjectStorageRequest: UpgradeObjectStorageRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<UpgradeObjectStorageResponse> {
      return localVarFp
        .upgradeObjectStorage(
          xRequestId,
          objectStorageId,
          upgradeObjectStorageRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ObjectStoragesApi - interface
 * @export
 * @interface ObjectStoragesApi
 */
export interface ObjectStoragesApiInterface {
  /**
   * Cancels the specified object storage at the next possible date. Please be aware of your contract periods.
   * @summary Cancels the specified object storage at the next possible date
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {CancelObjectStorageRequest} cancelObjectStorageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApiInterface
   */
  cancelObjectStorage(
    xRequestId: string,
    objectStorageId: string,
    cancelObjectStorageRequest: CancelObjectStorageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CancelObjectStorageResponse>;

  /**
   * Create / purchase a new object storage in your account. Please note that you can only buy one object storage per location. You can actually increase the object storage space via `POST` to `/v1/object-storages/{objectStorageId}/resize`
   * @summary Create a new object storage
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateObjectStorageRequest} createObjectStorageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApiInterface
   */
  createObjectStorage(
    xRequestId: string,
    createObjectStorageRequest: CreateObjectStorageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateObjectStorageResponse>;

  /**
   * List all data centers and their corresponding regions.
   * @summary List data centers
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [slug] Filter as match for data centers.
   * @param {string} [name] Filter for Object Storages regions.
   * @param {string} [regionName] Filter for Object Storage region names.
   * @param {string} [regionSlug] Filter for Object Storage region slugs.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApiInterface
   */
  retrieveDataCenterList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    slug?: string,
    name?: string,
    regionName?: string,
    regionSlug?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListDataCenterResponse>;

  /**
   * Get data for a specific object storage on your account.
   * @summary Get specific object storage by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApiInterface
   */
  retrieveObjectStorage(
    xRequestId: string,
    objectStorageId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindObjectStorageResponse>;

  /**
   * List and filter all object storages in your account
   * @summary List all your object storages
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [dataCenterName] Filter for Object Storage locations.
   * @param {string} [s3TenantId] Filter for Object Storage S3 tenantId.
   * @param {string} [region] Filter for Object Storage by regions. Available regions: EU, US-central, SIN
   * @param {string} [displayName] Filter for Object Storage by display name.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApiInterface
   */
  retrieveObjectStorageList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    dataCenterName?: string,
    s3TenantId?: string,
    region?: string,
    displayName?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListObjectStorageResponse>;

  /**
   * List usage statistics about the specified object storage such as the number of objects uploaded / created, used object storage space. Please note that the usage statistics are updated regularly and are not live usage statistics.
   * @summary List usage statistics about the specified object storage
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApiInterface
   */
  retrieveObjectStoragesStats(
    xRequestId: string,
    objectStorageId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ObjectStoragesStatsResponse>;

  /**
   * Modifies the display name of object storage. Display name must be unique.
   * @summary Modifies the display name of object storage
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {PatchObjectStorageRequest} patchObjectStorageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApiInterface
   */
  updateObjectStorage(
    xRequestId: string,
    objectStorageId: string,
    patchObjectStorageRequest: PatchObjectStorageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CancelObjectStorageResponse>;

  /**
   * Upgrade object storage size. You can also adjust the autoscaling settings for your object storage. Autoscaling allows you to automatically purchase storage capacity on a monthly basis up to the specified limit.
   * @summary Upgrade object storage size resp. update autoscaling settings.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {UpgradeObjectStorageRequest} upgradeObjectStorageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApiInterface
   */
  upgradeObjectStorage(
    xRequestId: string,
    objectStorageId: string,
    upgradeObjectStorageRequest: UpgradeObjectStorageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<UpgradeObjectStorageResponse>;
}

/**
 * ObjectStoragesApi - object-oriented interface
 * @export
 * @class ObjectStoragesApi
 * @extends {BaseAPI}
 */
export class ObjectStoragesApi
  extends BaseAPI
  implements ObjectStoragesApiInterface
{
  /**
   * Cancels the specified object storage at the next possible date. Please be aware of your contract periods.
   * @summary Cancels the specified object storage at the next possible date
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {CancelObjectStorageRequest} cancelObjectStorageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApi
   */
  public cancelObjectStorage(
    xRequestId: string,
    objectStorageId: string,
    cancelObjectStorageRequest: CancelObjectStorageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ObjectStoragesApiFp(this.configuration)
      .cancelObjectStorage(
        xRequestId,
        objectStorageId,
        cancelObjectStorageRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create / purchase a new object storage in your account. Please note that you can only buy one object storage per location. You can actually increase the object storage space via `POST` to `/v1/object-storages/{objectStorageId}/resize`
   * @summary Create a new object storage
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateObjectStorageRequest} createObjectStorageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApi
   */
  public createObjectStorage(
    xRequestId: string,
    createObjectStorageRequest: CreateObjectStorageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ObjectStoragesApiFp(this.configuration)
      .createObjectStorage(
        xRequestId,
        createObjectStorageRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all data centers and their corresponding regions.
   * @summary List data centers
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [slug] Filter as match for data centers.
   * @param {string} [name] Filter for Object Storages regions.
   * @param {string} [regionName] Filter for Object Storage region names.
   * @param {string} [regionSlug] Filter for Object Storage region slugs.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApi
   */
  public retrieveDataCenterList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    slug?: string,
    name?: string,
    regionName?: string,
    regionSlug?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ObjectStoragesApiFp(this.configuration)
      .retrieveDataCenterList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        slug,
        name,
        regionName,
        regionSlug,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get data for a specific object storage on your account.
   * @summary Get specific object storage by its id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApi
   */
  public retrieveObjectStorage(
    xRequestId: string,
    objectStorageId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ObjectStoragesApiFp(this.configuration)
      .retrieveObjectStorage(xRequestId, objectStorageId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all object storages in your account
   * @summary List all your object storages
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [dataCenterName] Filter for Object Storage locations.
   * @param {string} [s3TenantId] Filter for Object Storage S3 tenantId.
   * @param {string} [region] Filter for Object Storage by regions. Available regions: EU, US-central, SIN
   * @param {string} [displayName] Filter for Object Storage by display name.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApi
   */
  public retrieveObjectStorageList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    dataCenterName?: string,
    s3TenantId?: string,
    region?: string,
    displayName?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ObjectStoragesApiFp(this.configuration)
      .retrieveObjectStorageList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        dataCenterName,
        s3TenantId,
        region,
        displayName,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List usage statistics about the specified object storage such as the number of objects uploaded / created, used object storage space. Please note that the usage statistics are updated regularly and are not live usage statistics.
   * @summary List usage statistics about the specified object storage
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApi
   */
  public retrieveObjectStoragesStats(
    xRequestId: string,
    objectStorageId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ObjectStoragesApiFp(this.configuration)
      .retrieveObjectStoragesStats(
        xRequestId,
        objectStorageId,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Modifies the display name of object storage. Display name must be unique.
   * @summary Modifies the display name of object storage
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {PatchObjectStorageRequest} patchObjectStorageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApi
   */
  public updateObjectStorage(
    xRequestId: string,
    objectStorageId: string,
    patchObjectStorageRequest: PatchObjectStorageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ObjectStoragesApiFp(this.configuration)
      .updateObjectStorage(
        xRequestId,
        objectStorageId,
        patchObjectStorageRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Upgrade object storage size. You can also adjust the autoscaling settings for your object storage. Autoscaling allows you to automatically purchase storage capacity on a monthly basis up to the specified limit.
   * @summary Upgrade object storage size resp. update autoscaling settings.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} objectStorageId The identifier of the object storage.
   * @param {UpgradeObjectStorageRequest} upgradeObjectStorageRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesApi
   */
  public upgradeObjectStorage(
    xRequestId: string,
    objectStorageId: string,
    upgradeObjectStorageRequest: UpgradeObjectStorageRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ObjectStoragesApiFp(this.configuration)
      .upgradeObjectStorage(
        xRequestId,
        objectStorageId,
        upgradeObjectStorageRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * ObjectStoragesAuditsApi - axios parameter creator
 * @export
 */
export const ObjectStoragesAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your object storages.
     * @summary List history about your object storages (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [objectStorageId] The identifier of the object storage.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveObjectStorageAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      objectStorageId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'retrieveObjectStorageAuditsList',
        'xRequestId',
        xRequestId,
      );
      const localVarPath = `/v1/object-storages/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (objectStorageId !== undefined) {
        localVarQueryParameter['objectStorageId'] = objectStorageId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * ObjectStoragesAuditsApi - functional programming interface
 * @export
 */
export const ObjectStoragesAuditsApiFp = function (
  configuration?: Configuration,
) {
  const localVarAxiosParamCreator =
    ObjectStoragesAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your object storages.
     * @summary List history about your object storages (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [objectStorageId] The identifier of the object storage.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveObjectStorageAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      objectStorageId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListObjectStorageAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveObjectStorageAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          objectStorageId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'ObjectStoragesAuditsApi.retrieveObjectStorageAuditsList'
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
 * ObjectStoragesAuditsApi - factory interface
 * @export
 */
export const ObjectStoragesAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = ObjectStoragesAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your object storages.
     * @summary List history about your object storages (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [objectStorageId] The identifier of the object storage.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveObjectStorageAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      objectStorageId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListObjectStorageAuditResponse> {
      return localVarFp
        .retrieveObjectStorageAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          objectStorageId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ObjectStoragesAuditsApi - interface
 * @export
 * @interface ObjectStoragesAuditsApi
 */
export interface ObjectStoragesAuditsApiInterface {
  /**
   * List and filters the history about your object storages.
   * @summary List history about your object storages (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [objectStorageId] The identifier of the object storage.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesAuditsApiInterface
   */
  retrieveObjectStorageAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    objectStorageId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListObjectStorageAuditResponse>;
}

/**
 * ObjectStoragesAuditsApi - object-oriented interface
 * @export
 * @class ObjectStoragesAuditsApi
 * @extends {BaseAPI}
 */
export class ObjectStoragesAuditsApi
  extends BaseAPI
  implements ObjectStoragesAuditsApiInterface
{
  /**
   * List and filters the history about your object storages.
   * @summary List history about your object storages (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [objectStorageId] The identifier of the object storage.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ObjectStoragesAuditsApi
   */
  public retrieveObjectStorageAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    objectStorageId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ObjectStoragesAuditsApiFp(this.configuration)
      .retrieveObjectStorageAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        objectStorageId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
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
     * Add a specific instance to a Private Network
     * @summary Add instance to a Private Network
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    assignInstancePrivateNetwork: async (
      xRequestId: string,
      privateNetworkId: number,
      instanceId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'assignInstancePrivateNetwork',
        'xRequestId',
        xRequestId,
      );
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists(
        'assignInstancePrivateNetwork',
        'privateNetworkId',
        privateNetworkId,
      );
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists(
        'assignInstancePrivateNetwork',
        'instanceId',
        instanceId,
      );
      const localVarPath =
        `/v1/private-networks/{privateNetworkId}/instances/{instanceId}`
          .replace(
            `{${'privateNetworkId'}}`,
            encodeURIComponent(String(privateNetworkId)),
          )
          .replace(`{${'instanceId'}}`, encodeURIComponent(String(instanceId)));
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Create a new Private Network in your account.
     * @summary Create a new Private Network
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPrivateNetwork: async (
      xRequestId: string,
      createPrivateNetworkRequest: CreatePrivateNetworkRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createPrivateNetwork', 'xRequestId', xRequestId);
      // verify required parameter 'createPrivateNetworkRequest' is not null or undefined
      assertParamExists(
        'createPrivateNetwork',
        'createPrivateNetworkRequest',
        createPrivateNetworkRequest,
      );
      const localVarPath = `/v1/private-networks`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
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
     * Delete existing Virtual Private Cloud by id and automatically unassign all instances from it
     * @summary Delete existing Private Network by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePrivateNetwork: async (
      xRequestId: string,
      privateNetworkId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('deletePrivateNetwork', 'xRequestId', xRequestId);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists(
        'deletePrivateNetwork',
        'privateNetworkId',
        privateNetworkId,
      );
      const localVarPath = `/v1/private-networks/{privateNetworkId}`.replace(
        `{${'privateNetworkId'}}`,
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Update a Private Network by id in your account.
     * @summary Update a Private Network by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {PatchPrivateNetworkRequest} patchPrivateNetworkRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    patchPrivateNetwork: async (
      xRequestId: string,
      privateNetworkId: number,
      patchPrivateNetworkRequest: PatchPrivateNetworkRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('patchPrivateNetwork', 'xRequestId', xRequestId);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists(
        'patchPrivateNetwork',
        'privateNetworkId',
        privateNetworkId,
      );
      // verify required parameter 'patchPrivateNetworkRequest' is not null or undefined
      assertParamExists(
        'patchPrivateNetwork',
        'patchPrivateNetworkRequest',
        patchPrivateNetworkRequest,
      );
      const localVarPath = `/v1/private-networks/{privateNetworkId}`.replace(
        `{${'privateNetworkId'}}`,
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        patchPrivateNetworkRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Get attributes values to a specific Private Network on your account.
     * @summary Get specific Private Network by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrievePrivateNetwork: async (
      xRequestId: string,
      privateNetworkId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrievePrivateNetwork', 'xRequestId', xRequestId);
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists(
        'retrievePrivateNetwork',
        'privateNetworkId',
        privateNetworkId,
      );
      const localVarPath = `/v1/private-networks/{privateNetworkId}`.replace(
        `{${'privateNetworkId'}}`,
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all Private Networks in your account
     * @summary List Private Networks
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the Private Network
     * @param {string} [instanceIds] Comma separated instances identifiers
     * @param {string} [region] The slug of the region where your Private Network is located
     * @param {string} [dataCenter] The data center where your Private Network is located
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrievePrivateNetworkList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      instanceIds?: string,
      region?: string,
      dataCenter?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrievePrivateNetworkList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/private-networks`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (instanceIds !== undefined) {
        localVarQueryParameter['instanceIds'] = instanceIds;
      }

      if (region !== undefined) {
        localVarQueryParameter['region'] = region;
      }

      if (dataCenter !== undefined) {
        localVarQueryParameter['dataCenter'] = dataCenter;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Remove a specific instance from a Private Network
     * @summary Remove instance from a Private Network
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    unassignInstancePrivateNetwork: async (
      xRequestId: string,
      privateNetworkId: number,
      instanceId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'unassignInstancePrivateNetwork',
        'xRequestId',
        xRequestId,
      );
      // verify required parameter 'privateNetworkId' is not null or undefined
      assertParamExists(
        'unassignInstancePrivateNetwork',
        'privateNetworkId',
        privateNetworkId,
      );
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists(
        'unassignInstancePrivateNetwork',
        'instanceId',
        instanceId,
      );
      const localVarPath =
        `/v1/private-networks/{privateNetworkId}/instances/{instanceId}`
          .replace(
            `{${'privateNetworkId'}}`,
            encodeURIComponent(String(privateNetworkId)),
          )
          .replace(`{${'instanceId'}}`, encodeURIComponent(String(instanceId)));
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * PrivateNetworksApi - functional programming interface
 * @export
 */
export const PrivateNetworksApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    PrivateNetworksApiAxiosParamCreator(configuration);
  return {
    /**
     * Add a specific instance to a Private Network
     * @summary Add instance to a Private Network
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async assignInstancePrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<AssignInstancePrivateNetworkResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.assignInstancePrivateNetwork(
          xRequestId,
          privateNetworkId,
          instanceId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.assignInstancePrivateNetwork']?.[
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
     * Create a new Private Network in your account.
     * @summary Create a new Private Network
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createPrivateNetwork(
      xRequestId: string,
      createPrivateNetworkRequest: CreatePrivateNetworkRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreatePrivateNetworkResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createPrivateNetwork(
          xRequestId,
          createPrivateNetworkRequest,
          xTraceId,
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
     * Delete existing Virtual Private Cloud by id and automatically unassign all instances from it
     * @summary Delete existing Private Network by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deletePrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deletePrivateNetwork(
          xRequestId,
          privateNetworkId,
          xTraceId,
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
     * Update a Private Network by id in your account.
     * @summary Update a Private Network by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {PatchPrivateNetworkRequest} patchPrivateNetworkRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async patchPrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      patchPrivateNetworkRequest: PatchPrivateNetworkRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<PatchPrivateNetworkResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.patchPrivateNetwork(
          xRequestId,
          privateNetworkId,
          patchPrivateNetworkRequest,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.patchPrivateNetwork']?.[
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
     * Get attributes values to a specific Private Network on your account.
     * @summary Get specific Private Network by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrievePrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindPrivateNetworkResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrievePrivateNetwork(
          xRequestId,
          privateNetworkId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.retrievePrivateNetwork']?.[
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
     * List and filter all Private Networks in your account
     * @summary List Private Networks
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the Private Network
     * @param {string} [instanceIds] Comma separated instances identifiers
     * @param {string} [region] The slug of the region where your Private Network is located
     * @param {string} [dataCenter] The data center where your Private Network is located
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrievePrivateNetworkList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      instanceIds?: string,
      region?: string,
      dataCenter?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListPrivateNetworkResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrievePrivateNetworkList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          instanceIds,
          region,
          dataCenter,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PrivateNetworksApi.retrievePrivateNetworkList']?.[
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
     * Remove a specific instance from a Private Network
     * @summary Remove instance from a Private Network
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async unassignInstancePrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<UnassignInstancePrivateNetworkResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.unassignInstancePrivateNetwork(
          xRequestId,
          privateNetworkId,
          instanceId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'PrivateNetworksApi.unassignInstancePrivateNetwork'
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
     * Add a specific instance to a Private Network
     * @summary Add instance to a Private Network
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    assignInstancePrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<AssignInstancePrivateNetworkResponse> {
      return localVarFp
        .assignInstancePrivateNetwork(
          xRequestId,
          privateNetworkId,
          instanceId,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a new Private Network in your account.
     * @summary Create a new Private Network
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPrivateNetwork(
      xRequestId: string,
      createPrivateNetworkRequest: CreatePrivateNetworkRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreatePrivateNetworkResponse> {
      return localVarFp
        .createPrivateNetwork(
          xRequestId,
          createPrivateNetworkRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete existing Virtual Private Cloud by id and automatically unassign all instances from it
     * @summary Delete existing Private Network by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deletePrivateNetwork(xRequestId, privateNetworkId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update a Private Network by id in your account.
     * @summary Update a Private Network by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {PatchPrivateNetworkRequest} patchPrivateNetworkRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    patchPrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      patchPrivateNetworkRequest: PatchPrivateNetworkRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<PatchPrivateNetworkResponse> {
      return localVarFp
        .patchPrivateNetwork(
          xRequestId,
          privateNetworkId,
          patchPrivateNetworkRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Get attributes values to a specific Private Network on your account.
     * @summary Get specific Private Network by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrievePrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindPrivateNetworkResponse> {
      return localVarFp
        .retrievePrivateNetwork(xRequestId, privateNetworkId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all Private Networks in your account
     * @summary List Private Networks
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the Private Network
     * @param {string} [instanceIds] Comma separated instances identifiers
     * @param {string} [region] The slug of the region where your Private Network is located
     * @param {string} [dataCenter] The data center where your Private Network is located
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrievePrivateNetworkList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      instanceIds?: string,
      region?: string,
      dataCenter?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListPrivateNetworkResponse> {
      return localVarFp
        .retrievePrivateNetworkList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          instanceIds,
          region,
          dataCenter,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Remove a specific instance from a Private Network
     * @summary Remove instance from a Private Network
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} privateNetworkId The identifier of the Private Network
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    unassignInstancePrivateNetwork(
      xRequestId: string,
      privateNetworkId: number,
      instanceId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<UnassignInstancePrivateNetworkResponse> {
      return localVarFp
        .unassignInstancePrivateNetwork(
          xRequestId,
          privateNetworkId,
          instanceId,
          xTraceId,
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
   * Add a specific instance to a Private Network
   * @summary Add instance to a Private Network
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {number} instanceId The identifier of the instance
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  assignInstancePrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<AssignInstancePrivateNetworkResponse>;

  /**
   * Create a new Private Network in your account.
   * @summary Create a new Private Network
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  createPrivateNetwork(
    xRequestId: string,
    createPrivateNetworkRequest: CreatePrivateNetworkRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreatePrivateNetworkResponse>;

  /**
   * Delete existing Virtual Private Cloud by id and automatically unassign all instances from it
   * @summary Delete existing Private Network by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  deletePrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Update a Private Network by id in your account.
   * @summary Update a Private Network by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {PatchPrivateNetworkRequest} patchPrivateNetworkRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  patchPrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    patchPrivateNetworkRequest: PatchPrivateNetworkRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<PatchPrivateNetworkResponse>;

  /**
   * Get attributes values to a specific Private Network on your account.
   * @summary Get specific Private Network by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  retrievePrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindPrivateNetworkResponse>;

  /**
   * List and filter all Private Networks in your account
   * @summary List Private Networks
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] The name of the Private Network
   * @param {string} [instanceIds] Comma separated instances identifiers
   * @param {string} [region] The slug of the region where your Private Network is located
   * @param {string} [dataCenter] The data center where your Private Network is located
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  retrievePrivateNetworkList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    instanceIds?: string,
    region?: string,
    dataCenter?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListPrivateNetworkResponse>;

  /**
   * Remove a specific instance from a Private Network
   * @summary Remove instance from a Private Network
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {number} instanceId The identifier of the instance
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApiInterface
   */
  unassignInstancePrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<UnassignInstancePrivateNetworkResponse>;
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
   * Add a specific instance to a Private Network
   * @summary Add instance to a Private Network
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {number} instanceId The identifier of the instance
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public assignInstancePrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .assignInstancePrivateNetwork(
        xRequestId,
        privateNetworkId,
        instanceId,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a new Private Network in your account.
   * @summary Create a new Private Network
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreatePrivateNetworkRequest} createPrivateNetworkRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public createPrivateNetwork(
    xRequestId: string,
    createPrivateNetworkRequest: CreatePrivateNetworkRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .createPrivateNetwork(
        xRequestId,
        createPrivateNetworkRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete existing Virtual Private Cloud by id and automatically unassign all instances from it
   * @summary Delete existing Private Network by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public deletePrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .deletePrivateNetwork(xRequestId, privateNetworkId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update a Private Network by id in your account.
   * @summary Update a Private Network by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {PatchPrivateNetworkRequest} patchPrivateNetworkRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public patchPrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    patchPrivateNetworkRequest: PatchPrivateNetworkRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .patchPrivateNetwork(
        xRequestId,
        privateNetworkId,
        patchPrivateNetworkRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get attributes values to a specific Private Network on your account.
   * @summary Get specific Private Network by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public retrievePrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .retrievePrivateNetwork(xRequestId, privateNetworkId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all Private Networks in your account
   * @summary List Private Networks
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] The name of the Private Network
   * @param {string} [instanceIds] Comma separated instances identifiers
   * @param {string} [region] The slug of the region where your Private Network is located
   * @param {string} [dataCenter] The data center where your Private Network is located
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public retrievePrivateNetworkList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    instanceIds?: string,
    region?: string,
    dataCenter?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .retrievePrivateNetworkList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        name,
        instanceIds,
        region,
        dataCenter,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Remove a specific instance from a Private Network
   * @summary Remove instance from a Private Network
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} privateNetworkId The identifier of the Private Network
   * @param {number} instanceId The identifier of the instance
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksApi
   */
  public unassignInstancePrivateNetwork(
    xRequestId: string,
    privateNetworkId: number,
    instanceId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksApiFp(this.configuration)
      .unassignInstancePrivateNetwork(
        xRequestId,
        privateNetworkId,
        instanceId,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * PrivateNetworksAuditsApi - axios parameter creator
 * @export
 */
export const PrivateNetworksAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your Private Networks.
     * @summary List history about your Private Networks (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [privateNetworkId] The identifier of the Private Network
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] User name which did the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrievePrivateNetworkAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      privateNetworkId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'retrievePrivateNetworkAuditsList',
        'xRequestId',
        xRequestId,
      );
      const localVarPath = `/v1/private-networks/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (privateNetworkId !== undefined) {
        localVarQueryParameter['privateNetworkId'] = privateNetworkId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * PrivateNetworksAuditsApi - functional programming interface
 * @export
 */
export const PrivateNetworksAuditsApiFp = function (
  configuration?: Configuration,
) {
  const localVarAxiosParamCreator =
    PrivateNetworksAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your Private Networks.
     * @summary List history about your Private Networks (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [privateNetworkId] The identifier of the Private Network
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] User name which did the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrievePrivateNetworkAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      privateNetworkId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListPrivateNetworkAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrievePrivateNetworkAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          privateNetworkId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'PrivateNetworksAuditsApi.retrievePrivateNetworkAuditsList'
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
 * PrivateNetworksAuditsApi - factory interface
 * @export
 */
export const PrivateNetworksAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = PrivateNetworksAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your Private Networks.
     * @summary List history about your Private Networks (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [privateNetworkId] The identifier of the Private Network
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] User name which did the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrievePrivateNetworkAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      privateNetworkId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListPrivateNetworkAuditResponse> {
      return localVarFp
        .retrievePrivateNetworkAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          privateNetworkId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * PrivateNetworksAuditsApi - interface
 * @export
 * @interface PrivateNetworksAuditsApi
 */
export interface PrivateNetworksAuditsApiInterface {
  /**
   * List and filters the history about your Private Networks.
   * @summary List history about your Private Networks (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [privateNetworkId] The identifier of the Private Network
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] User name which did the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksAuditsApiInterface
   */
  retrievePrivateNetworkAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    privateNetworkId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListPrivateNetworkAuditResponse>;
}

/**
 * PrivateNetworksAuditsApi - object-oriented interface
 * @export
 * @class PrivateNetworksAuditsApi
 * @extends {BaseAPI}
 */
export class PrivateNetworksAuditsApi
  extends BaseAPI
  implements PrivateNetworksAuditsApiInterface
{
  /**
   * List and filters the history about your Private Networks.
   * @summary List history about your Private Networks (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [privateNetworkId] The identifier of the Private Network
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] User name which did the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PrivateNetworksAuditsApi
   */
  public retrievePrivateNetworkAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    privateNetworkId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return PrivateNetworksAuditsApiFp(this.configuration)
      .retrievePrivateNetworkAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        privateNetworkId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * RolesApi - axios parameter creator
 * @export
 */
export const RolesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new role. In order to get a list availbale api enpoints (apiName) and their actions please refer to the GET api-permissions endpoint. For specifying `resources` please enter tag ids. For those to take effect please assign them to a resource in the tag management api.
     * @summary Create a new role
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateRoleRequest} createRoleRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createRole: async (
      xRequestId: string,
      createRoleRequest: CreateRoleRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createRole', 'xRequestId', xRequestId);
      // verify required parameter 'createRoleRequest' is not null or undefined
      assertParamExists('createRole', 'createRoleRequest', createRoleRequest);
      const localVarPath = `/v1/roles`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        createRoleRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * You can\'t delete a role if it is still assigned to a user. In such cases please remove the role from the users.
     * @summary Delete existing role by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} roleId The identifier of the role
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteRole: async (
      xRequestId: string,
      roleId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('deleteRole', 'xRequestId', xRequestId);
      // verify required parameter 'roleId' is not null or undefined
      assertParamExists('deleteRole', 'roleId', roleId);
      const localVarPath = `/v1/roles/{roleId}`.replace(
        `{${'roleId'}}`,
        encodeURIComponent(String(roleId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List all available API permissions. This list serves as a reference for specifying roles. As endpoints differ in their possibilities not all actions are available for each endpoint.
     * @summary List of API permissions
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [apiName] The name of api
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveApiPermissionsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      apiName?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveApiPermissionsList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/roles/api-permissions`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (apiName !== undefined) {
        localVarQueryParameter['apiName'] = apiName;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get attributes of specific role.
     * @summary Get specific role by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} roleId The identifier of the role
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveRole: async (
      xRequestId: string,
      roleId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveRole', 'xRequestId', xRequestId);
      // verify required parameter 'roleId' is not null or undefined
      assertParamExists('retrieveRole', 'roleId', roleId);
      const localVarPath = `/v1/roles/{roleId}`.replace(
        `{${'roleId'}}`,
        encodeURIComponent(String(roleId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all your roles. A role allows you to specify permission to api endpoints and resources like compute.
     * @summary List roles
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the role
     * @param {string} [apiName] The name of api
     * @param {string} [tagName] The name of the tag
     * @param {string} [type] The type of the tag. Can be either &#x60;default&#x60; or &#x60;custom&#x60;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveRoleList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      apiName?: string,
      tagName?: string,
      type?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveRoleList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/roles`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (apiName !== undefined) {
        localVarQueryParameter['apiName'] = apiName;
      }

      if (tagName !== undefined) {
        localVarQueryParameter['tagName'] = tagName;
      }

      if (type !== undefined) {
        localVarQueryParameter['type'] = type;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Update attributes to your role. Attributes are optional. If not set, the attributes will retain their original values.
     * @summary Update specific role by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} roleId The identifier of the role
     * @param {UpdateRoleRequest} updateRoleRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateRole: async (
      xRequestId: string,
      roleId: number,
      updateRoleRequest: UpdateRoleRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('updateRole', 'xRequestId', xRequestId);
      // verify required parameter 'roleId' is not null or undefined
      assertParamExists('updateRole', 'roleId', roleId);
      // verify required parameter 'updateRoleRequest' is not null or undefined
      assertParamExists('updateRole', 'updateRoleRequest', updateRoleRequest);
      const localVarPath = `/v1/roles/{roleId}`.replace(
        `{${'roleId'}}`,
        encodeURIComponent(String(roleId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        updateRoleRequest,
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
 * RolesApi - functional programming interface
 * @export
 */
export const RolesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = RolesApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new role. In order to get a list availbale api enpoints (apiName) and their actions please refer to the GET api-permissions endpoint. For specifying `resources` please enter tag ids. For those to take effect please assign them to a resource in the tag management api.
     * @summary Create a new role
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateRoleRequest} createRoleRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createRole(
      xRequestId: string,
      createRoleRequest: CreateRoleRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateRoleResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createRole(
        xRequestId,
        createRoleRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RolesApi.createRole']?.[
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
     * You can\'t delete a role if it is still assigned to a user. In such cases please remove the role from the users.
     * @summary Delete existing role by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} roleId The identifier of the role
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteRole(
      xRequestId: string,
      roleId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteRole(
        xRequestId,
        roleId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RolesApi.deleteRole']?.[
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
     * List all available API permissions. This list serves as a reference for specifying roles. As endpoints differ in their possibilities not all actions are available for each endpoint.
     * @summary List of API permissions
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [apiName] The name of api
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveApiPermissionsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      apiName?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListApiPermissionResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveApiPermissionsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          apiName,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RolesApi.retrieveApiPermissionsList']?.[
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
     * Get attributes of specific role.
     * @summary Get specific role by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} roleId The identifier of the role
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveRole(
      xRequestId: string,
      roleId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindRoleResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveRole(
        xRequestId,
        roleId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RolesApi.retrieveRole']?.[
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
     * List and filter all your roles. A role allows you to specify permission to api endpoints and resources like compute.
     * @summary List roles
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the role
     * @param {string} [apiName] The name of api
     * @param {string} [tagName] The name of the tag
     * @param {string} [type] The type of the tag. Can be either &#x60;default&#x60; or &#x60;custom&#x60;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveRoleList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      apiName?: string,
      tagName?: string,
      type?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListRoleResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveRoleList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          apiName,
          tagName,
          type,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RolesApi.retrieveRoleList']?.[
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
     * Update attributes to your role. Attributes are optional. If not set, the attributes will retain their original values.
     * @summary Update specific role by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} roleId The identifier of the role
     * @param {UpdateRoleRequest} updateRoleRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateRole(
      xRequestId: string,
      roleId: number,
      updateRoleRequest: UpdateRoleRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<UpdateRoleResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateRole(
        xRequestId,
        roleId,
        updateRoleRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RolesApi.updateRole']?.[
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
 * RolesApi - factory interface
 * @export
 */
export const RolesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = RolesApiFp(configuration);
  return {
    /**
     * Create a new role. In order to get a list availbale api enpoints (apiName) and their actions please refer to the GET api-permissions endpoint. For specifying `resources` please enter tag ids. For those to take effect please assign them to a resource in the tag management api.
     * @summary Create a new role
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateRoleRequest} createRoleRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createRole(
      xRequestId: string,
      createRoleRequest: CreateRoleRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateRoleResponse> {
      return localVarFp
        .createRole(xRequestId, createRoleRequest, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * You can\'t delete a role if it is still assigned to a user. In such cases please remove the role from the users.
     * @summary Delete existing role by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} roleId The identifier of the role
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteRole(
      xRequestId: string,
      roleId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteRole(xRequestId, roleId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all available API permissions. This list serves as a reference for specifying roles. As endpoints differ in their possibilities not all actions are available for each endpoint.
     * @summary List of API permissions
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [apiName] The name of api
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveApiPermissionsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      apiName?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListApiPermissionResponse> {
      return localVarFp
        .retrieveApiPermissionsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          apiName,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Get attributes of specific role.
     * @summary Get specific role by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} roleId The identifier of the role
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveRole(
      xRequestId: string,
      roleId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindRoleResponse> {
      return localVarFp
        .retrieveRole(xRequestId, roleId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all your roles. A role allows you to specify permission to api endpoints and resources like compute.
     * @summary List roles
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] The name of the role
     * @param {string} [apiName] The name of api
     * @param {string} [tagName] The name of the tag
     * @param {string} [type] The type of the tag. Can be either &#x60;default&#x60; or &#x60;custom&#x60;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveRoleList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      apiName?: string,
      tagName?: string,
      type?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListRoleResponse> {
      return localVarFp
        .retrieveRoleList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          apiName,
          tagName,
          type,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update attributes to your role. Attributes are optional. If not set, the attributes will retain their original values.
     * @summary Update specific role by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} roleId The identifier of the role
     * @param {UpdateRoleRequest} updateRoleRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateRole(
      xRequestId: string,
      roleId: number,
      updateRoleRequest: UpdateRoleRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<UpdateRoleResponse> {
      return localVarFp
        .updateRole(xRequestId, roleId, updateRoleRequest, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * RolesApi - interface
 * @export
 * @interface RolesApi
 */
export interface RolesApiInterface {
  /**
   * Create a new role. In order to get a list availbale api enpoints (apiName) and their actions please refer to the GET api-permissions endpoint. For specifying `resources` please enter tag ids. For those to take effect please assign them to a resource in the tag management api.
   * @summary Create a new role
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateRoleRequest} createRoleRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApiInterface
   */
  createRole(
    xRequestId: string,
    createRoleRequest: CreateRoleRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateRoleResponse>;

  /**
   * You can\'t delete a role if it is still assigned to a user. In such cases please remove the role from the users.
   * @summary Delete existing role by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} roleId The identifier of the role
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApiInterface
   */
  deleteRole(
    xRequestId: string,
    roleId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * List all available API permissions. This list serves as a reference for specifying roles. As endpoints differ in their possibilities not all actions are available for each endpoint.
   * @summary List of API permissions
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [apiName] The name of api
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApiInterface
   */
  retrieveApiPermissionsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    apiName?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListApiPermissionResponse>;

  /**
   * Get attributes of specific role.
   * @summary Get specific role by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} roleId The identifier of the role
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApiInterface
   */
  retrieveRole(
    xRequestId: string,
    roleId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindRoleResponse>;

  /**
   * List and filter all your roles. A role allows you to specify permission to api endpoints and resources like compute.
   * @summary List roles
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] The name of the role
   * @param {string} [apiName] The name of api
   * @param {string} [tagName] The name of the tag
   * @param {string} [type] The type of the tag. Can be either &#x60;default&#x60; or &#x60;custom&#x60;
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApiInterface
   */
  retrieveRoleList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    apiName?: string,
    tagName?: string,
    type?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListRoleResponse>;

  /**
   * Update attributes to your role. Attributes are optional. If not set, the attributes will retain their original values.
   * @summary Update specific role by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} roleId The identifier of the role
   * @param {UpdateRoleRequest} updateRoleRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApiInterface
   */
  updateRole(
    xRequestId: string,
    roleId: number,
    updateRoleRequest: UpdateRoleRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<UpdateRoleResponse>;
}

/**
 * RolesApi - object-oriented interface
 * @export
 * @class RolesApi
 * @extends {BaseAPI}
 */
export class RolesApi extends BaseAPI implements RolesApiInterface {
  /**
   * Create a new role. In order to get a list availbale api enpoints (apiName) and their actions please refer to the GET api-permissions endpoint. For specifying `resources` please enter tag ids. For those to take effect please assign them to a resource in the tag management api.
   * @summary Create a new role
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateRoleRequest} createRoleRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApi
   */
  public createRole(
    xRequestId: string,
    createRoleRequest: CreateRoleRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RolesApiFp(this.configuration)
      .createRole(xRequestId, createRoleRequest, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * You can\'t delete a role if it is still assigned to a user. In such cases please remove the role from the users.
   * @summary Delete existing role by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} roleId The identifier of the role
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApi
   */
  public deleteRole(
    xRequestId: string,
    roleId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RolesApiFp(this.configuration)
      .deleteRole(xRequestId, roleId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all available API permissions. This list serves as a reference for specifying roles. As endpoints differ in their possibilities not all actions are available for each endpoint.
   * @summary List of API permissions
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [apiName] The name of api
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApi
   */
  public retrieveApiPermissionsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    apiName?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RolesApiFp(this.configuration)
      .retrieveApiPermissionsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        apiName,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get attributes of specific role.
   * @summary Get specific role by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} roleId The identifier of the role
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApi
   */
  public retrieveRole(
    xRequestId: string,
    roleId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RolesApiFp(this.configuration)
      .retrieveRole(xRequestId, roleId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all your roles. A role allows you to specify permission to api endpoints and resources like compute.
   * @summary List roles
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] The name of the role
   * @param {string} [apiName] The name of api
   * @param {string} [tagName] The name of the tag
   * @param {string} [type] The type of the tag. Can be either &#x60;default&#x60; or &#x60;custom&#x60;
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApi
   */
  public retrieveRoleList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    apiName?: string,
    tagName?: string,
    type?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RolesApiFp(this.configuration)
      .retrieveRoleList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        name,
        apiName,
        tagName,
        type,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update attributes to your role. Attributes are optional. If not set, the attributes will retain their original values.
   * @summary Update specific role by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} roleId The identifier of the role
   * @param {UpdateRoleRequest} updateRoleRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesApi
   */
  public updateRole(
    xRequestId: string,
    roleId: number,
    updateRoleRequest: UpdateRoleRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RolesApiFp(this.configuration)
      .updateRole(xRequestId, roleId, updateRoleRequest, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * RolesAuditsApi - axios parameter creator
 * @export
 */
export const RolesAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filter the history about your roles.
     * @summary List history about your roles (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [roleId] The identifier of the role.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveRoleAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      roleId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveRoleAuditsList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/roles/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (roleId !== undefined) {
        localVarQueryParameter['roleId'] = roleId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * RolesAuditsApi - functional programming interface
 * @export
 */
export const RolesAuditsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    RolesAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filter the history about your roles.
     * @summary List history about your roles (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [roleId] The identifier of the role.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveRoleAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      roleId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListRoleAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveRoleAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          roleId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RolesAuditsApi.retrieveRoleAuditsList']?.[
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
 * RolesAuditsApi - factory interface
 * @export
 */
export const RolesAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = RolesAuditsApiFp(configuration);
  return {
    /**
     * List and filter the history about your roles.
     * @summary List history about your roles (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [roleId] The identifier of the role.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveRoleAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      roleId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListRoleAuditResponse> {
      return localVarFp
        .retrieveRoleAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          roleId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * RolesAuditsApi - interface
 * @export
 * @interface RolesAuditsApi
 */
export interface RolesAuditsApiInterface {
  /**
   * List and filter the history about your roles.
   * @summary List history about your roles (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [roleId] The identifier of the role.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesAuditsApiInterface
   */
  retrieveRoleAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    roleId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListRoleAuditResponse>;
}

/**
 * RolesAuditsApi - object-oriented interface
 * @export
 * @class RolesAuditsApi
 * @extends {BaseAPI}
 */
export class RolesAuditsApi extends BaseAPI implements RolesAuditsApiInterface {
  /**
   * List and filter the history about your roles.
   * @summary List history about your roles (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [roleId] The identifier of the role.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RolesAuditsApi
   */
  public retrieveRoleAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    roleId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RolesAuditsApiFp(this.configuration)
      .retrieveRoleAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        roleId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * SecretsApi - axios parameter creator
 * @export
 */
export const SecretsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new secret in your account with attributes name, type and value. Attribute type can be password or ssh.
     * @summary Create a new secret
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateSecretRequest} createSecretRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSecret: async (
      xRequestId: string,
      createSecretRequest: CreateSecretRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createSecret', 'xRequestId', xRequestId);
      // verify required parameter 'createSecretRequest' is not null or undefined
      assertParamExists(
        'createSecret',
        'createSecretRequest',
        createSecretRequest,
      );
      const localVarPath = `/v1/secrets`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        createSecretRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * You can remove a specific secret from your account.
     * @summary Delete existing secret by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} secretId The id of the secret
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecret: async (
      xRequestId: string,
      secretId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('deleteSecret', 'xRequestId', xRequestId);
      // verify required parameter 'secretId' is not null or undefined
      assertParamExists('deleteSecret', 'secretId', secretId);
      const localVarPath = `/v1/secrets/{secretId}`.replace(
        `{${'secretId'}}`,
        encodeURIComponent(String(secretId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get attributes values for a specific secret on your account.
     * @summary Get specific secret by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} secretId The id of the secret
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSecret: async (
      xRequestId: string,
      secretId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveSecret', 'xRequestId', xRequestId);
      // verify required parameter 'secretId' is not null or undefined
      assertParamExists('retrieveSecret', 'secretId', secretId);
      const localVarPath = `/v1/secrets/{secretId}`.replace(
        `{${'secretId'}}`,
        encodeURIComponent(String(secretId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all secrets in your account.
     * @summary List secrets
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] Filter secrets by name
     * @param {RetrieveSecretListTypeEnum} [type] Filter secrets by type
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSecretList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      type?: RetrieveSecretListTypeEnum,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveSecretList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/secrets`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (type !== undefined) {
        localVarQueryParameter['type'] = type;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Update attributes to your secret. Attributes are optional. If not set, the attributes will retain their original values. Only name and value can be updated.
     * @summary Update specific secret by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} secretId The id of the secret
     * @param {UpdateSecretRequest} updateSecretRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSecret: async (
      xRequestId: string,
      secretId: number,
      updateSecretRequest: UpdateSecretRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('updateSecret', 'xRequestId', xRequestId);
      // verify required parameter 'secretId' is not null or undefined
      assertParamExists('updateSecret', 'secretId', secretId);
      // verify required parameter 'updateSecretRequest' is not null or undefined
      assertParamExists(
        'updateSecret',
        'updateSecretRequest',
        updateSecretRequest,
      );
      const localVarPath = `/v1/secrets/{secretId}`.replace(
        `{${'secretId'}}`,
        encodeURIComponent(String(secretId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        updateSecretRequest,
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
 * SecretsApi - functional programming interface
 * @export
 */
export const SecretsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = SecretsApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new secret in your account with attributes name, type and value. Attribute type can be password or ssh.
     * @summary Create a new secret
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateSecretRequest} createSecretRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createSecret(
      xRequestId: string,
      createSecretRequest: CreateSecretRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateSecretResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createSecret(
        xRequestId,
        createSecretRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecretsApi.createSecret']?.[
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
     * You can remove a specific secret from your account.
     * @summary Delete existing secret by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} secretId The id of the secret
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSecret(
      xRequestId: string,
      secretId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteSecret(
        xRequestId,
        secretId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecretsApi.deleteSecret']?.[
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
     * Get attributes values for a specific secret on your account.
     * @summary Get specific secret by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} secretId The id of the secret
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveSecret(
      xRequestId: string,
      secretId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindSecretResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveSecret(
        xRequestId,
        secretId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecretsApi.retrieveSecret']?.[
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
     * List and filter all secrets in your account.
     * @summary List secrets
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] Filter secrets by name
     * @param {RetrieveSecretListTypeEnum} [type] Filter secrets by type
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveSecretList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      type?: RetrieveSecretListTypeEnum,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListSecretResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveSecretList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          type,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecretsApi.retrieveSecretList']?.[
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
     * Update attributes to your secret. Attributes are optional. If not set, the attributes will retain their original values. Only name and value can be updated.
     * @summary Update specific secret by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} secretId The id of the secret
     * @param {UpdateSecretRequest} updateSecretRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateSecret(
      xRequestId: string,
      secretId: number,
      updateSecretRequest: UpdateSecretRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<UpdateSecretResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateSecret(
        xRequestId,
        secretId,
        updateSecretRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecretsApi.updateSecret']?.[
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
 * SecretsApi - factory interface
 * @export
 */
export const SecretsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = SecretsApiFp(configuration);
  return {
    /**
     * Create a new secret in your account with attributes name, type and value. Attribute type can be password or ssh.
     * @summary Create a new secret
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateSecretRequest} createSecretRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSecret(
      xRequestId: string,
      createSecretRequest: CreateSecretRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateSecretResponse> {
      return localVarFp
        .createSecret(xRequestId, createSecretRequest, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * You can remove a specific secret from your account.
     * @summary Delete existing secret by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} secretId The id of the secret
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSecret(
      xRequestId: string,
      secretId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteSecret(xRequestId, secretId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get attributes values for a specific secret on your account.
     * @summary Get specific secret by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} secretId The id of the secret
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSecret(
      xRequestId: string,
      secretId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindSecretResponse> {
      return localVarFp
        .retrieveSecret(xRequestId, secretId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all secrets in your account.
     * @summary List secrets
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] Filter secrets by name
     * @param {RetrieveSecretListTypeEnum} [type] Filter secrets by type
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSecretList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      type?: RetrieveSecretListTypeEnum,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListSecretResponse> {
      return localVarFp
        .retrieveSecretList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          type,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update attributes to your secret. Attributes are optional. If not set, the attributes will retain their original values. Only name and value can be updated.
     * @summary Update specific secret by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} secretId The id of the secret
     * @param {UpdateSecretRequest} updateSecretRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSecret(
      xRequestId: string,
      secretId: number,
      updateSecretRequest: UpdateSecretRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<UpdateSecretResponse> {
      return localVarFp
        .updateSecret(
          xRequestId,
          secretId,
          updateSecretRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SecretsApi - interface
 * @export
 * @interface SecretsApi
 */
export interface SecretsApiInterface {
  /**
   * Create a new secret in your account with attributes name, type and value. Attribute type can be password or ssh.
   * @summary Create a new secret
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateSecretRequest} createSecretRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApiInterface
   */
  createSecret(
    xRequestId: string,
    createSecretRequest: CreateSecretRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateSecretResponse>;

  /**
   * You can remove a specific secret from your account.
   * @summary Delete existing secret by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} secretId The id of the secret
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApiInterface
   */
  deleteSecret(
    xRequestId: string,
    secretId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get attributes values for a specific secret on your account.
   * @summary Get specific secret by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} secretId The id of the secret
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApiInterface
   */
  retrieveSecret(
    xRequestId: string,
    secretId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindSecretResponse>;

  /**
   * List and filter all secrets in your account.
   * @summary List secrets
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] Filter secrets by name
   * @param {RetrieveSecretListTypeEnum} [type] Filter secrets by type
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApiInterface
   */
  retrieveSecretList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    type?: RetrieveSecretListTypeEnum,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListSecretResponse>;

  /**
   * Update attributes to your secret. Attributes are optional. If not set, the attributes will retain their original values. Only name and value can be updated.
   * @summary Update specific secret by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} secretId The id of the secret
   * @param {UpdateSecretRequest} updateSecretRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApiInterface
   */
  updateSecret(
    xRequestId: string,
    secretId: number,
    updateSecretRequest: UpdateSecretRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<UpdateSecretResponse>;
}

/**
 * SecretsApi - object-oriented interface
 * @export
 * @class SecretsApi
 * @extends {BaseAPI}
 */
export class SecretsApi extends BaseAPI implements SecretsApiInterface {
  /**
   * Create a new secret in your account with attributes name, type and value. Attribute type can be password or ssh.
   * @summary Create a new secret
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateSecretRequest} createSecretRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApi
   */
  public createSecret(
    xRequestId: string,
    createSecretRequest: CreateSecretRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecretsApiFp(this.configuration)
      .createSecret(xRequestId, createSecretRequest, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * You can remove a specific secret from your account.
   * @summary Delete existing secret by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} secretId The id of the secret
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApi
   */
  public deleteSecret(
    xRequestId: string,
    secretId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecretsApiFp(this.configuration)
      .deleteSecret(xRequestId, secretId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get attributes values for a specific secret on your account.
   * @summary Get specific secret by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} secretId The id of the secret
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApi
   */
  public retrieveSecret(
    xRequestId: string,
    secretId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecretsApiFp(this.configuration)
      .retrieveSecret(xRequestId, secretId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all secrets in your account.
   * @summary List secrets
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] Filter secrets by name
   * @param {RetrieveSecretListTypeEnum} [type] Filter secrets by type
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApi
   */
  public retrieveSecretList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    type?: RetrieveSecretListTypeEnum,
    options?: RawAxiosRequestConfig,
  ) {
    return SecretsApiFp(this.configuration)
      .retrieveSecretList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        name,
        type,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update attributes to your secret. Attributes are optional. If not set, the attributes will retain their original values. Only name and value can be updated.
   * @summary Update specific secret by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} secretId The id of the secret
   * @param {UpdateSecretRequest} updateSecretRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsApi
   */
  public updateSecret(
    xRequestId: string,
    secretId: number,
    updateSecretRequest: UpdateSecretRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecretsApiFp(this.configuration)
      .updateSecret(
        xRequestId,
        secretId,
        updateSecretRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const RetrieveSecretListTypeEnum = {
  Password: 'password',
  Ssh: 'ssh',
} as const;
export type RetrieveSecretListTypeEnum =
  (typeof RetrieveSecretListTypeEnum)[keyof typeof RetrieveSecretListTypeEnum];

/**
 * SecretsAuditsApi - axios parameter creator
 * @export
 */
export const SecretsAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your secrets.
     * @summary List history about your secrets (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [secretId] The id of the secret.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSecretAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      secretId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveSecretAuditsList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/secrets/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (secretId !== undefined) {
        localVarQueryParameter['secretId'] = secretId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * SecretsAuditsApi - functional programming interface
 * @export
 */
export const SecretsAuditsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    SecretsAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your secrets.
     * @summary List history about your secrets (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [secretId] The id of the secret.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveSecretAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      secretId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListSecretAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveSecretAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          secretId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SecretsAuditsApi.retrieveSecretAuditsList']?.[
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
 * SecretsAuditsApi - factory interface
 * @export
 */
export const SecretsAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = SecretsAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your secrets.
     * @summary List history about your secrets (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [secretId] The id of the secret.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSecretAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      secretId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListSecretAuditResponse> {
      return localVarFp
        .retrieveSecretAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          secretId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SecretsAuditsApi - interface
 * @export
 * @interface SecretsAuditsApi
 */
export interface SecretsAuditsApiInterface {
  /**
   * List and filters the history about your secrets.
   * @summary List history about your secrets (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [secretId] The id of the secret.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsAuditsApiInterface
   */
  retrieveSecretAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    secretId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListSecretAuditResponse>;
}

/**
 * SecretsAuditsApi - object-oriented interface
 * @export
 * @class SecretsAuditsApi
 * @extends {BaseAPI}
 */
export class SecretsAuditsApi
  extends BaseAPI
  implements SecretsAuditsApiInterface
{
  /**
   * List and filters the history about your secrets.
   * @summary List history about your secrets (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [secretId] The id of the secret.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecretsAuditsApi
   */
  public retrieveSecretAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    secretId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecretsAuditsApiFp(this.configuration)
      .retrieveSecretAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        secretId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * SnapshotsApi - axios parameter creator
 * @export
 */
export const SnapshotsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new snapshot for instance, with name and description attributes
     * @summary Create a new instance snapshot
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {CreateSnapshotRequest} createSnapshotRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSnapshot: async (
      xRequestId: string,
      instanceId: number,
      createSnapshotRequest: CreateSnapshotRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createSnapshot', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('createSnapshot', 'instanceId', instanceId);
      // verify required parameter 'createSnapshotRequest' is not null or undefined
      assertParamExists(
        'createSnapshot',
        'createSnapshotRequest',
        createSnapshotRequest,
      );
      const localVarPath =
        `/v1/compute/instances/{instanceId}/snapshots`.replace(
          `{${'instanceId'}}`,
          encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
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
     * Delete existing instance snapshot by id
     * @summary Delete existing snapshot by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSnapshot: async (
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('deleteSnapshot', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('deleteSnapshot', 'instanceId', instanceId);
      // verify required parameter 'snapshotId' is not null or undefined
      assertParamExists('deleteSnapshot', 'snapshotId', snapshotId);
      const localVarPath =
        `/v1/compute/instances/{instanceId}/snapshots/{snapshotId}`
          .replace(`{${'instanceId'}}`, encodeURIComponent(String(instanceId)))
          .replace(`{${'snapshotId'}}`, encodeURIComponent(String(snapshotId)));
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get all attributes for a specific snapshot
     * @summary Retrieve a specific snapshot by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSnapshot: async (
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveSnapshot', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('retrieveSnapshot', 'instanceId', instanceId);
      // verify required parameter 'snapshotId' is not null or undefined
      assertParamExists('retrieveSnapshot', 'snapshotId', snapshotId);
      const localVarPath =
        `/v1/compute/instances/{instanceId}/snapshots/{snapshotId}`
          .replace(`{${'instanceId'}}`, encodeURIComponent(String(instanceId)))
          .replace(`{${'snapshotId'}}`, encodeURIComponent(String(snapshotId)));
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all your snapshots for a specific instance
     * @summary List snapshots
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] Filter as substring match for snapshots names.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSnapshotList: async (
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveSnapshotList', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('retrieveSnapshotList', 'instanceId', instanceId);
      const localVarPath =
        `/v1/compute/instances/{instanceId}/snapshots`.replace(
          `{${'instanceId'}}`,
          encodeURIComponent(String(instanceId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Rollback the instance to a specific snapshot. In case the snapshot is not the latest one, it will automatically delete all the newer snapshots of the instance
     * @summary Revert the instance to a particular snapshot based on its identifier
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {object} body
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    rollbackSnapshot: async (
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      body: object,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('rollbackSnapshot', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('rollbackSnapshot', 'instanceId', instanceId);
      // verify required parameter 'snapshotId' is not null or undefined
      assertParamExists('rollbackSnapshot', 'snapshotId', snapshotId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('rollbackSnapshot', 'body', body);
      const localVarPath =
        `/v1/compute/instances/{instanceId}/snapshots/{snapshotId}/rollback`
          .replace(`{${'instanceId'}}`, encodeURIComponent(String(instanceId)))
          .replace(`{${'snapshotId'}}`, encodeURIComponent(String(snapshotId)));
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
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
     * Update attributes of a snapshot. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
     * @summary Update specific snapshot by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {UpdateSnapshotRequest} updateSnapshotRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSnapshot: async (
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      updateSnapshotRequest: UpdateSnapshotRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('updateSnapshot', 'xRequestId', xRequestId);
      // verify required parameter 'instanceId' is not null or undefined
      assertParamExists('updateSnapshot', 'instanceId', instanceId);
      // verify required parameter 'snapshotId' is not null or undefined
      assertParamExists('updateSnapshot', 'snapshotId', snapshotId);
      // verify required parameter 'updateSnapshotRequest' is not null or undefined
      assertParamExists(
        'updateSnapshot',
        'updateSnapshotRequest',
        updateSnapshotRequest,
      );
      const localVarPath =
        `/v1/compute/instances/{instanceId}/snapshots/{snapshotId}`
          .replace(`{${'instanceId'}}`, encodeURIComponent(String(instanceId)))
          .replace(`{${'snapshotId'}}`, encodeURIComponent(String(snapshotId)));
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
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
     * Create a new snapshot for instance, with name and description attributes
     * @summary Create a new instance snapshot
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {CreateSnapshotRequest} createSnapshotRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createSnapshot(
      xRequestId: string,
      instanceId: number,
      createSnapshotRequest: CreateSnapshotRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateSnapshotResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createSnapshot(
        xRequestId,
        instanceId,
        createSnapshotRequest,
        xTraceId,
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
     * Delete existing instance snapshot by id
     * @summary Delete existing snapshot by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSnapshot(
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteSnapshot(
        xRequestId,
        instanceId,
        snapshotId,
        xTraceId,
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
     * Get all attributes for a specific snapshot
     * @summary Retrieve a specific snapshot by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveSnapshot(
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindSnapshotResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveSnapshot(
          xRequestId,
          instanceId,
          snapshotId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.retrieveSnapshot']?.[
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
     * List and filter all your snapshots for a specific instance
     * @summary List snapshots
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] Filter as substring match for snapshots names.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveSnapshotList(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListSnapshotResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveSnapshotList(
          xRequestId,
          instanceId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.retrieveSnapshotList']?.[
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
     * Rollback the instance to a specific snapshot. In case the snapshot is not the latest one, it will automatically delete all the newer snapshots of the instance
     * @summary Revert the instance to a particular snapshot based on its identifier
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {object} body
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async rollbackSnapshot(
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      body: object,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<RollbackSnapshotResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.rollbackSnapshot(
          xRequestId,
          instanceId,
          snapshotId,
          body,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsApi.rollbackSnapshot']?.[
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
     * Update attributes of a snapshot. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
     * @summary Update specific snapshot by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {UpdateSnapshotRequest} updateSnapshotRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateSnapshot(
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      updateSnapshotRequest: UpdateSnapshotRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<UpdateSnapshotResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateSnapshot(
        xRequestId,
        instanceId,
        snapshotId,
        updateSnapshotRequest,
        xTraceId,
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
     * Create a new snapshot for instance, with name and description attributes
     * @summary Create a new instance snapshot
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {CreateSnapshotRequest} createSnapshotRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSnapshot(
      xRequestId: string,
      instanceId: number,
      createSnapshotRequest: CreateSnapshotRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateSnapshotResponse> {
      return localVarFp
        .createSnapshot(
          xRequestId,
          instanceId,
          createSnapshotRequest,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete existing instance snapshot by id
     * @summary Delete existing snapshot by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSnapshot(
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteSnapshot(xRequestId, instanceId, snapshotId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get all attributes for a specific snapshot
     * @summary Retrieve a specific snapshot by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSnapshot(
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindSnapshotResponse> {
      return localVarFp
        .retrieveSnapshot(xRequestId, instanceId, snapshotId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all your snapshots for a specific instance
     * @summary List snapshots
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] Filter as substring match for snapshots names.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSnapshotList(
      xRequestId: string,
      instanceId: number,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListSnapshotResponse> {
      return localVarFp
        .retrieveSnapshotList(
          xRequestId,
          instanceId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Rollback the instance to a specific snapshot. In case the snapshot is not the latest one, it will automatically delete all the newer snapshots of the instance
     * @summary Revert the instance to a particular snapshot based on its identifier
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {object} body
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    rollbackSnapshot(
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      body: object,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<RollbackSnapshotResponse> {
      return localVarFp
        .rollbackSnapshot(
          xRequestId,
          instanceId,
          snapshotId,
          body,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update attributes of a snapshot. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
     * @summary Update specific snapshot by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} instanceId The identifier of the instance
     * @param {string} snapshotId The identifier of the snapshot
     * @param {UpdateSnapshotRequest} updateSnapshotRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSnapshot(
      xRequestId: string,
      instanceId: number,
      snapshotId: string,
      updateSnapshotRequest: UpdateSnapshotRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<UpdateSnapshotResponse> {
      return localVarFp
        .updateSnapshot(
          xRequestId,
          instanceId,
          snapshotId,
          updateSnapshotRequest,
          xTraceId,
          options,
        )
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
   * Create a new snapshot for instance, with name and description attributes
   * @summary Create a new instance snapshot
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {CreateSnapshotRequest} createSnapshotRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  createSnapshot(
    xRequestId: string,
    instanceId: number,
    createSnapshotRequest: CreateSnapshotRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateSnapshotResponse>;

  /**
   * Delete existing instance snapshot by id
   * @summary Delete existing snapshot by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} snapshotId The identifier of the snapshot
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  deleteSnapshot(
    xRequestId: string,
    instanceId: number,
    snapshotId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get all attributes for a specific snapshot
   * @summary Retrieve a specific snapshot by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} snapshotId The identifier of the snapshot
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  retrieveSnapshot(
    xRequestId: string,
    instanceId: number,
    snapshotId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindSnapshotResponse>;

  /**
   * List and filter all your snapshots for a specific instance
   * @summary List snapshots
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] Filter as substring match for snapshots names.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  retrieveSnapshotList(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListSnapshotResponse>;

  /**
   * Rollback the instance to a specific snapshot. In case the snapshot is not the latest one, it will automatically delete all the newer snapshots of the instance
   * @summary Revert the instance to a particular snapshot based on its identifier
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} snapshotId The identifier of the snapshot
   * @param {object} body
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  rollbackSnapshot(
    xRequestId: string,
    instanceId: number,
    snapshotId: string,
    body: object,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<RollbackSnapshotResponse>;

  /**
   * Update attributes of a snapshot. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
   * @summary Update specific snapshot by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} snapshotId The identifier of the snapshot
   * @param {UpdateSnapshotRequest} updateSnapshotRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApiInterface
   */
  updateSnapshot(
    xRequestId: string,
    instanceId: number,
    snapshotId: string,
    updateSnapshotRequest: UpdateSnapshotRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<UpdateSnapshotResponse>;
}

/**
 * SnapshotsApi - object-oriented interface
 * @export
 * @class SnapshotsApi
 * @extends {BaseAPI}
 */
export class SnapshotsApi extends BaseAPI implements SnapshotsApiInterface {
  /**
   * Create a new snapshot for instance, with name and description attributes
   * @summary Create a new instance snapshot
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {CreateSnapshotRequest} createSnapshotRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public createSnapshot(
    xRequestId: string,
    instanceId: number,
    createSnapshotRequest: CreateSnapshotRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .createSnapshot(
        xRequestId,
        instanceId,
        createSnapshotRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete existing instance snapshot by id
   * @summary Delete existing snapshot by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} snapshotId The identifier of the snapshot
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public deleteSnapshot(
    xRequestId: string,
    instanceId: number,
    snapshotId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .deleteSnapshot(xRequestId, instanceId, snapshotId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get all attributes for a specific snapshot
   * @summary Retrieve a specific snapshot by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} snapshotId The identifier of the snapshot
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public retrieveSnapshot(
    xRequestId: string,
    instanceId: number,
    snapshotId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .retrieveSnapshot(xRequestId, instanceId, snapshotId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all your snapshots for a specific instance
   * @summary List snapshots
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] Filter as substring match for snapshots names.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public retrieveSnapshotList(
    xRequestId: string,
    instanceId: number,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .retrieveSnapshotList(
        xRequestId,
        instanceId,
        xTraceId,
        page,
        size,
        orderBy,
        name,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Rollback the instance to a specific snapshot. In case the snapshot is not the latest one, it will automatically delete all the newer snapshots of the instance
   * @summary Revert the instance to a particular snapshot based on its identifier
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} snapshotId The identifier of the snapshot
   * @param {object} body
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public rollbackSnapshot(
    xRequestId: string,
    instanceId: number,
    snapshotId: string,
    body: object,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .rollbackSnapshot(
        xRequestId,
        instanceId,
        snapshotId,
        body,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update attributes of a snapshot. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
   * @summary Update specific snapshot by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} instanceId The identifier of the instance
   * @param {string} snapshotId The identifier of the snapshot
   * @param {UpdateSnapshotRequest} updateSnapshotRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsApi
   */
  public updateSnapshot(
    xRequestId: string,
    instanceId: number,
    snapshotId: string,
    updateSnapshotRequest: UpdateSnapshotRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsApiFp(this.configuration)
      .updateSnapshot(
        xRequestId,
        instanceId,
        snapshotId,
        updateSnapshotRequest,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * SnapshotsAuditsApi - axios parameter creator
 * @export
 */
export const SnapshotsAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your snapshots your triggered via the API.
     * @summary List history about your snapshots (audit) triggered via the API
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [instanceId] The identifier of the instance
     * @param {string} [snapshotId] The identifier of the snapshot
     * @param {string} [requestId] The requestId of the API call which led to the change
     * @param {string} [changedBy] changedBy of the user which led to the change
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSnapshotsAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      instanceId?: number,
      snapshotId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'retrieveSnapshotsAuditsList',
        'xRequestId',
        xRequestId,
      );
      const localVarPath = `/v1/compute/snapshots/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (instanceId !== undefined) {
        localVarQueryParameter['instanceId'] = instanceId;
      }

      if (snapshotId !== undefined) {
        localVarQueryParameter['snapshotId'] = snapshotId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * SnapshotsAuditsApi - functional programming interface
 * @export
 */
export const SnapshotsAuditsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    SnapshotsAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your snapshots your triggered via the API.
     * @summary List history about your snapshots (audit) triggered via the API
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [instanceId] The identifier of the instance
     * @param {string} [snapshotId] The identifier of the snapshot
     * @param {string} [requestId] The requestId of the API call which led to the change
     * @param {string} [changedBy] changedBy of the user which led to the change
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveSnapshotsAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      instanceId?: number,
      snapshotId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListSnapshotsAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveSnapshotsAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          instanceId,
          snapshotId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SnapshotsAuditsApi.retrieveSnapshotsAuditsList']?.[
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
 * SnapshotsAuditsApi - factory interface
 * @export
 */
export const SnapshotsAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = SnapshotsAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your snapshots your triggered via the API.
     * @summary List history about your snapshots (audit) triggered via the API
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [instanceId] The identifier of the instance
     * @param {string} [snapshotId] The identifier of the snapshot
     * @param {string} [requestId] The requestId of the API call which led to the change
     * @param {string} [changedBy] changedBy of the user which led to the change
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveSnapshotsAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      instanceId?: number,
      snapshotId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListSnapshotsAuditResponse> {
      return localVarFp
        .retrieveSnapshotsAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          instanceId,
          snapshotId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SnapshotsAuditsApi - interface
 * @export
 * @interface SnapshotsAuditsApi
 */
export interface SnapshotsAuditsApiInterface {
  /**
   * List and filters the history about your snapshots your triggered via the API.
   * @summary List history about your snapshots (audit) triggered via the API
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [instanceId] The identifier of the instance
   * @param {string} [snapshotId] The identifier of the snapshot
   * @param {string} [requestId] The requestId of the API call which led to the change
   * @param {string} [changedBy] changedBy of the user which led to the change
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsAuditsApiInterface
   */
  retrieveSnapshotsAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    instanceId?: number,
    snapshotId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListSnapshotsAuditResponse>;
}

/**
 * SnapshotsAuditsApi - object-oriented interface
 * @export
 * @class SnapshotsAuditsApi
 * @extends {BaseAPI}
 */
export class SnapshotsAuditsApi
  extends BaseAPI
  implements SnapshotsAuditsApiInterface
{
  /**
   * List and filters the history about your snapshots your triggered via the API.
   * @summary List history about your snapshots (audit) triggered via the API
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [instanceId] The identifier of the instance
   * @param {string} [snapshotId] The identifier of the snapshot
   * @param {string} [requestId] The requestId of the API call which led to the change
   * @param {string} [changedBy] changedBy of the user which led to the change
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SnapshotsAuditsApi
   */
  public retrieveSnapshotsAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    instanceId?: number,
    snapshotId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SnapshotsAuditsApiFp(this.configuration)
      .retrieveSnapshotsAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        instanceId,
        snapshotId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * TagAssignmentsApi - axios parameter creator
 * @export
 */
export const TagAssignmentsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new tag assignment. This marks the specified resource with the specified tag for organizing purposes or to restrict access to that resource.
     * @summary Create a new assignment for the tag
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {string} resourceId The identifier of the resource id
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createAssignment: async (
      xRequestId: string,
      tagId: number,
      resourceType: string,
      resourceId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createAssignment', 'xRequestId', xRequestId);
      // verify required parameter 'tagId' is not null or undefined
      assertParamExists('createAssignment', 'tagId', tagId);
      // verify required parameter 'resourceType' is not null or undefined
      assertParamExists('createAssignment', 'resourceType', resourceType);
      // verify required parameter 'resourceId' is not null or undefined
      assertParamExists('createAssignment', 'resourceId', resourceId);
      const localVarPath =
        `/v1/tags/{tagId}/assignments/{resourceType}/{resourceId}`
          .replace(`{${'tagId'}}`, encodeURIComponent(String(tagId)))
          .replace(
            `{${'resourceType'}}`,
            encodeURIComponent(String(resourceType)),
          )
          .replace(`{${'resourceId'}}`, encodeURIComponent(String(resourceId)));
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Tag assignment will be removed from the specified resource. If this tag is being used for access restrictions the affected users will no longer be able to access that resource.
     * @summary Delete existing tag assignment
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {string} resourceId The identifier of the resource id
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteAssignment: async (
      xRequestId: string,
      tagId: number,
      resourceType: string,
      resourceId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('deleteAssignment', 'xRequestId', xRequestId);
      // verify required parameter 'tagId' is not null or undefined
      assertParamExists('deleteAssignment', 'tagId', tagId);
      // verify required parameter 'resourceType' is not null or undefined
      assertParamExists('deleteAssignment', 'resourceType', resourceType);
      // verify required parameter 'resourceId' is not null or undefined
      assertParamExists('deleteAssignment', 'resourceId', resourceId);
      const localVarPath =
        `/v1/tags/{tagId}/assignments/{resourceType}/{resourceId}`
          .replace(`{${'tagId'}}`, encodeURIComponent(String(tagId)))
          .replace(
            `{${'resourceType'}}`,
            encodeURIComponent(String(resourceType)),
          )
          .replace(`{${'resourceId'}}`, encodeURIComponent(String(resourceId)));
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get attributes for a specific tag assignment in your account. For this the resource type and resource id is required.
     * @summary Get specific assignment for the tag
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {string} resourceId The identifier of the resource id
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveAssignment: async (
      xRequestId: string,
      tagId: number,
      resourceType: string,
      resourceId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveAssignment', 'xRequestId', xRequestId);
      // verify required parameter 'tagId' is not null or undefined
      assertParamExists('retrieveAssignment', 'tagId', tagId);
      // verify required parameter 'resourceType' is not null or undefined
      assertParamExists('retrieveAssignment', 'resourceType', resourceType);
      // verify required parameter 'resourceId' is not null or undefined
      assertParamExists('retrieveAssignment', 'resourceId', resourceId);
      const localVarPath =
        `/v1/tags/{tagId}/assignments/{resourceType}/{resourceId}`
          .replace(`{${'tagId'}}`, encodeURIComponent(String(tagId)))
          .replace(
            `{${'resourceType'}}`,
            encodeURIComponent(String(resourceType)),
          )
          .replace(`{${'resourceId'}}`, encodeURIComponent(String(resourceId)));
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all existing assignments for a tag in your account
     * @summary List tag assignments
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [resourceType] Filter as substring match for assignment resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveAssignmentList: async (
      xRequestId: string,
      tagId: number,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      resourceType?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveAssignmentList', 'xRequestId', xRequestId);
      // verify required parameter 'tagId' is not null or undefined
      assertParamExists('retrieveAssignmentList', 'tagId', tagId);
      const localVarPath = `/v1/tags/{tagId}/assignments`.replace(
        `{${'tagId'}}`,
        encodeURIComponent(String(tagId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (resourceType !== undefined) {
        localVarQueryParameter['resourceType'] = resourceType;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * TagAssignmentsApi - functional programming interface
 * @export
 */
export const TagAssignmentsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    TagAssignmentsApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new tag assignment. This marks the specified resource with the specified tag for organizing purposes or to restrict access to that resource.
     * @summary Create a new assignment for the tag
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {string} resourceId The identifier of the resource id
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createAssignment(
      xRequestId: string,
      tagId: number,
      resourceType: string,
      resourceId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateAssignmentResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createAssignment(
          xRequestId,
          tagId,
          resourceType,
          resourceId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagAssignmentsApi.createAssignment']?.[
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
     * Tag assignment will be removed from the specified resource. If this tag is being used for access restrictions the affected users will no longer be able to access that resource.
     * @summary Delete existing tag assignment
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {string} resourceId The identifier of the resource id
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteAssignment(
      xRequestId: string,
      tagId: number,
      resourceType: string,
      resourceId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteAssignment(
          xRequestId,
          tagId,
          resourceType,
          resourceId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagAssignmentsApi.deleteAssignment']?.[
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
     * Get attributes for a specific tag assignment in your account. For this the resource type and resource id is required.
     * @summary Get specific assignment for the tag
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {string} resourceId The identifier of the resource id
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveAssignment(
      xRequestId: string,
      tagId: number,
      resourceType: string,
      resourceId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindAssignmentResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveAssignment(
          xRequestId,
          tagId,
          resourceType,
          resourceId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagAssignmentsApi.retrieveAssignment']?.[
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
     * List and filter all existing assignments for a tag in your account
     * @summary List tag assignments
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [resourceType] Filter as substring match for assignment resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveAssignmentList(
      xRequestId: string,
      tagId: number,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      resourceType?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListAssignmentResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveAssignmentList(
          xRequestId,
          tagId,
          xTraceId,
          page,
          size,
          orderBy,
          resourceType,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagAssignmentsApi.retrieveAssignmentList']?.[
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
 * TagAssignmentsApi - factory interface
 * @export
 */
export const TagAssignmentsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = TagAssignmentsApiFp(configuration);
  return {
    /**
     * Create a new tag assignment. This marks the specified resource with the specified tag for organizing purposes or to restrict access to that resource.
     * @summary Create a new assignment for the tag
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {string} resourceId The identifier of the resource id
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createAssignment(
      xRequestId: string,
      tagId: number,
      resourceType: string,
      resourceId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateAssignmentResponse> {
      return localVarFp
        .createAssignment(
          xRequestId,
          tagId,
          resourceType,
          resourceId,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Tag assignment will be removed from the specified resource. If this tag is being used for access restrictions the affected users will no longer be able to access that resource.
     * @summary Delete existing tag assignment
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {string} resourceId The identifier of the resource id
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteAssignment(
      xRequestId: string,
      tagId: number,
      resourceType: string,
      resourceId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteAssignment(
          xRequestId,
          tagId,
          resourceType,
          resourceId,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Get attributes for a specific tag assignment in your account. For this the resource type and resource id is required.
     * @summary Get specific assignment for the tag
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {string} resourceId The identifier of the resource id
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveAssignment(
      xRequestId: string,
      tagId: number,
      resourceType: string,
      resourceId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindAssignmentResponse> {
      return localVarFp
        .retrieveAssignment(
          xRequestId,
          tagId,
          resourceType,
          resourceId,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all existing assignments for a tag in your account
     * @summary List tag assignments
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [resourceType] Filter as substring match for assignment resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveAssignmentList(
      xRequestId: string,
      tagId: number,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      resourceType?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListAssignmentResponse> {
      return localVarFp
        .retrieveAssignmentList(
          xRequestId,
          tagId,
          xTraceId,
          page,
          size,
          orderBy,
          resourceType,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * TagAssignmentsApi - interface
 * @export
 * @interface TagAssignmentsApi
 */
export interface TagAssignmentsApiInterface {
  /**
   * Create a new tag assignment. This marks the specified resource with the specified tag for organizing purposes or to restrict access to that resource.
   * @summary Create a new assignment for the tag
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag.
   * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
   * @param {string} resourceId The identifier of the resource id
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsApiInterface
   */
  createAssignment(
    xRequestId: string,
    tagId: number,
    resourceType: string,
    resourceId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateAssignmentResponse>;

  /**
   * Tag assignment will be removed from the specified resource. If this tag is being used for access restrictions the affected users will no longer be able to access that resource.
   * @summary Delete existing tag assignment
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag.
   * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
   * @param {string} resourceId The identifier of the resource id
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsApiInterface
   */
  deleteAssignment(
    xRequestId: string,
    tagId: number,
    resourceType: string,
    resourceId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get attributes for a specific tag assignment in your account. For this the resource type and resource id is required.
   * @summary Get specific assignment for the tag
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag.
   * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
   * @param {string} resourceId The identifier of the resource id
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsApiInterface
   */
  retrieveAssignment(
    xRequestId: string,
    tagId: number,
    resourceType: string,
    resourceId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindAssignmentResponse>;

  /**
   * List and filter all existing assignments for a tag in your account
   * @summary List tag assignments
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [resourceType] Filter as substring match for assignment resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsApiInterface
   */
  retrieveAssignmentList(
    xRequestId: string,
    tagId: number,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    resourceType?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListAssignmentResponse>;
}

/**
 * TagAssignmentsApi - object-oriented interface
 * @export
 * @class TagAssignmentsApi
 * @extends {BaseAPI}
 */
export class TagAssignmentsApi
  extends BaseAPI
  implements TagAssignmentsApiInterface
{
  /**
   * Create a new tag assignment. This marks the specified resource with the specified tag for organizing purposes or to restrict access to that resource.
   * @summary Create a new assignment for the tag
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag.
   * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
   * @param {string} resourceId The identifier of the resource id
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsApi
   */
  public createAssignment(
    xRequestId: string,
    tagId: number,
    resourceType: string,
    resourceId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagAssignmentsApiFp(this.configuration)
      .createAssignment(
        xRequestId,
        tagId,
        resourceType,
        resourceId,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Tag assignment will be removed from the specified resource. If this tag is being used for access restrictions the affected users will no longer be able to access that resource.
   * @summary Delete existing tag assignment
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag.
   * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
   * @param {string} resourceId The identifier of the resource id
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsApi
   */
  public deleteAssignment(
    xRequestId: string,
    tagId: number,
    resourceType: string,
    resourceId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagAssignmentsApiFp(this.configuration)
      .deleteAssignment(
        xRequestId,
        tagId,
        resourceType,
        resourceId,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get attributes for a specific tag assignment in your account. For this the resource type and resource id is required.
   * @summary Get specific assignment for the tag
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag.
   * @param {string} resourceType The identifier of the resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
   * @param {string} resourceId The identifier of the resource id
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsApi
   */
  public retrieveAssignment(
    xRequestId: string,
    tagId: number,
    resourceType: string,
    resourceId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagAssignmentsApiFp(this.configuration)
      .retrieveAssignment(
        xRequestId,
        tagId,
        resourceType,
        resourceId,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all existing assignments for a tag in your account
   * @summary List tag assignments
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [resourceType] Filter as substring match for assignment resource type. Resource type is one of &#x60;instance|image|object-storage&#x60;.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsApi
   */
  public retrieveAssignmentList(
    xRequestId: string,
    tagId: number,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    resourceType?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagAssignmentsApiFp(this.configuration)
      .retrieveAssignmentList(
        xRequestId,
        tagId,
        xTraceId,
        page,
        size,
        orderBy,
        resourceType,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * TagAssignmentsAuditsApi - axios parameter creator
 * @export
 */
export const TagAssignmentsAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your assignments.
     * @summary List history about your assignments (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [tagId] The identifier of the tag.
     * @param {string} [resourceId] The identifier of the resource.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] UserId of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveAssignmentsAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      tagId?: number,
      resourceId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'retrieveAssignmentsAuditsList',
        'xRequestId',
        xRequestId,
      );
      const localVarPath = `/v1/tags/assignments/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (tagId !== undefined) {
        localVarQueryParameter['tagId'] = tagId;
      }

      if (resourceId !== undefined) {
        localVarQueryParameter['resourceId'] = resourceId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * TagAssignmentsAuditsApi - functional programming interface
 * @export
 */
export const TagAssignmentsAuditsApiFp = function (
  configuration?: Configuration,
) {
  const localVarAxiosParamCreator =
    TagAssignmentsAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your assignments.
     * @summary List history about your assignments (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [tagId] The identifier of the tag.
     * @param {string} [resourceId] The identifier of the resource.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] UserId of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveAssignmentsAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      tagId?: number,
      resourceId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListAssignmentAuditsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveAssignmentsAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          tagId,
          resourceId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'TagAssignmentsAuditsApi.retrieveAssignmentsAuditsList'
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
 * TagAssignmentsAuditsApi - factory interface
 * @export
 */
export const TagAssignmentsAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = TagAssignmentsAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your assignments.
     * @summary List history about your assignments (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [tagId] The identifier of the tag.
     * @param {string} [resourceId] The identifier of the resource.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] UserId of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveAssignmentsAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      tagId?: number,
      resourceId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListAssignmentAuditsResponse> {
      return localVarFp
        .retrieveAssignmentsAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          tagId,
          resourceId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * TagAssignmentsAuditsApi - interface
 * @export
 * @interface TagAssignmentsAuditsApi
 */
export interface TagAssignmentsAuditsApiInterface {
  /**
   * List and filters the history about your assignments.
   * @summary List history about your assignments (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [tagId] The identifier of the tag.
   * @param {string} [resourceId] The identifier of the resource.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] UserId of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsAuditsApiInterface
   */
  retrieveAssignmentsAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    tagId?: number,
    resourceId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListAssignmentAuditsResponse>;
}

/**
 * TagAssignmentsAuditsApi - object-oriented interface
 * @export
 * @class TagAssignmentsAuditsApi
 * @extends {BaseAPI}
 */
export class TagAssignmentsAuditsApi
  extends BaseAPI
  implements TagAssignmentsAuditsApiInterface
{
  /**
   * List and filters the history about your assignments.
   * @summary List history about your assignments (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [tagId] The identifier of the tag.
   * @param {string} [resourceId] The identifier of the resource.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] UserId of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagAssignmentsAuditsApi
   */
  public retrieveAssignmentsAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    tagId?: number,
    resourceId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagAssignmentsAuditsApiFp(this.configuration)
      .retrieveAssignmentsAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        tagId,
        resourceId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * TagsApi - axios parameter creator
 * @export
 */
export const TagsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new tag in your account with attribute name and optional attribute color.
     * @summary Create a new tag
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateTagRequest} createTagRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createTag: async (
      xRequestId: string,
      createTagRequest: CreateTagRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createTag', 'xRequestId', xRequestId);
      // verify required parameter 'createTagRequest' is not null or undefined
      assertParamExists('createTag', 'createTagRequest', createTagRequest);
      const localVarPath = `/v1/tags`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        createTagRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Your tag can be deleted if it is not assigned to any resource on your account. Check tag assigments before deleting tag.
     * @summary Delete existing tag by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteTag: async (
      xRequestId: string,
      tagId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('deleteTag', 'xRequestId', xRequestId);
      // verify required parameter 'tagId' is not null or undefined
      assertParamExists('deleteTag', 'tagId', tagId);
      const localVarPath = `/v1/tags/{tagId}`.replace(
        `{${'tagId'}}`,
        encodeURIComponent(String(tagId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get attributes values to a specific tag on your account.
     * @summary Get specific tag by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveTag: async (
      xRequestId: string,
      tagId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveTag', 'xRequestId', xRequestId);
      // verify required parameter 'tagId' is not null or undefined
      assertParamExists('retrieveTag', 'tagId', tagId);
      const localVarPath = `/v1/tags/{tagId}`.replace(
        `{${'tagId'}}`,
        encodeURIComponent(String(tagId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all tags in your account
     * @summary List tags
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] Filter as substring match for tag names. Tags may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per tag.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveTagList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveTagList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/tags`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Update attributes to your tag. Attributes are optional. If not set, the attributes will retain their original values.
     * @summary Update specific tag by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag
     * @param {UpdateTagRequest} updateTagRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateTag: async (
      xRequestId: string,
      tagId: number,
      updateTagRequest: UpdateTagRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('updateTag', 'xRequestId', xRequestId);
      // verify required parameter 'tagId' is not null or undefined
      assertParamExists('updateTag', 'tagId', tagId);
      // verify required parameter 'updateTagRequest' is not null or undefined
      assertParamExists('updateTag', 'updateTagRequest', updateTagRequest);
      const localVarPath = `/v1/tags/{tagId}`.replace(
        `{${'tagId'}}`,
        encodeURIComponent(String(tagId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        updateTagRequest,
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
 * TagsApi - functional programming interface
 * @export
 */
export const TagsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = TagsApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new tag in your account with attribute name and optional attribute color.
     * @summary Create a new tag
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateTagRequest} createTagRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createTag(
      xRequestId: string,
      createTagRequest: CreateTagRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateTagResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createTag(
        xRequestId,
        createTagRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagsApi.createTag']?.[localVarOperationServerIndex]
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
     * Your tag can be deleted if it is not assigned to any resource on your account. Check tag assigments before deleting tag.
     * @summary Delete existing tag by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteTag(
      xRequestId: string,
      tagId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteTag(
        xRequestId,
        tagId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagsApi.deleteTag']?.[localVarOperationServerIndex]
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
     * Get attributes values to a specific tag on your account.
     * @summary Get specific tag by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveTag(
      xRequestId: string,
      tagId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindTagResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveTag(
        xRequestId,
        tagId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagsApi.retrieveTag']?.[
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
     * List and filter all tags in your account
     * @summary List tags
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] Filter as substring match for tag names. Tags may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per tag.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveTagList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListTagResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveTagList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        name,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagsApi.retrieveTagList']?.[
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
     * Update attributes to your tag. Attributes are optional. If not set, the attributes will retain their original values.
     * @summary Update specific tag by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag
     * @param {UpdateTagRequest} updateTagRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateTag(
      xRequestId: string,
      tagId: number,
      updateTagRequest: UpdateTagRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<UpdateTagResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateTag(
        xRequestId,
        tagId,
        updateTagRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagsApi.updateTag']?.[localVarOperationServerIndex]
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
 * TagsApi - factory interface
 * @export
 */
export const TagsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = TagsApiFp(configuration);
  return {
    /**
     * Create a new tag in your account with attribute name and optional attribute color.
     * @summary Create a new tag
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateTagRequest} createTagRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createTag(
      xRequestId: string,
      createTagRequest: CreateTagRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateTagResponse> {
      return localVarFp
        .createTag(xRequestId, createTagRequest, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Your tag can be deleted if it is not assigned to any resource on your account. Check tag assigments before deleting tag.
     * @summary Delete existing tag by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteTag(
      xRequestId: string,
      tagId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteTag(xRequestId, tagId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get attributes values to a specific tag on your account.
     * @summary Get specific tag by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveTag(
      xRequestId: string,
      tagId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindTagResponse> {
      return localVarFp
        .retrieveTag(xRequestId, tagId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all tags in your account
     * @summary List tags
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [name] Filter as substring match for tag names. Tags may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per tag.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveTagList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      name?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListTagResponse> {
      return localVarFp
        .retrieveTagList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          name,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update attributes to your tag. Attributes are optional. If not set, the attributes will retain their original values.
     * @summary Update specific tag by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} tagId The identifier of the tag
     * @param {UpdateTagRequest} updateTagRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateTag(
      xRequestId: string,
      tagId: number,
      updateTagRequest: UpdateTagRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<UpdateTagResponse> {
      return localVarFp
        .updateTag(xRequestId, tagId, updateTagRequest, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * TagsApi - interface
 * @export
 * @interface TagsApi
 */
export interface TagsApiInterface {
  /**
   * Create a new tag in your account with attribute name and optional attribute color.
   * @summary Create a new tag
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateTagRequest} createTagRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApiInterface
   */
  createTag(
    xRequestId: string,
    createTagRequest: CreateTagRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateTagResponse>;

  /**
   * Your tag can be deleted if it is not assigned to any resource on your account. Check tag assigments before deleting tag.
   * @summary Delete existing tag by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApiInterface
   */
  deleteTag(
    xRequestId: string,
    tagId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get attributes values to a specific tag on your account.
   * @summary Get specific tag by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApiInterface
   */
  retrieveTag(
    xRequestId: string,
    tagId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindTagResponse>;

  /**
   * List and filter all tags in your account
   * @summary List tags
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] Filter as substring match for tag names. Tags may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per tag.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApiInterface
   */
  retrieveTagList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListTagResponse>;

  /**
   * Update attributes to your tag. Attributes are optional. If not set, the attributes will retain their original values.
   * @summary Update specific tag by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag
   * @param {UpdateTagRequest} updateTagRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApiInterface
   */
  updateTag(
    xRequestId: string,
    tagId: number,
    updateTagRequest: UpdateTagRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<UpdateTagResponse>;
}

/**
 * TagsApi - object-oriented interface
 * @export
 * @class TagsApi
 * @extends {BaseAPI}
 */
export class TagsApi extends BaseAPI implements TagsApiInterface {
  /**
   * Create a new tag in your account with attribute name and optional attribute color.
   * @summary Create a new tag
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateTagRequest} createTagRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApi
   */
  public createTag(
    xRequestId: string,
    createTagRequest: CreateTagRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagsApiFp(this.configuration)
      .createTag(xRequestId, createTagRequest, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Your tag can be deleted if it is not assigned to any resource on your account. Check tag assigments before deleting tag.
   * @summary Delete existing tag by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApi
   */
  public deleteTag(
    xRequestId: string,
    tagId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagsApiFp(this.configuration)
      .deleteTag(xRequestId, tagId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get attributes values to a specific tag on your account.
   * @summary Get specific tag by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApi
   */
  public retrieveTag(
    xRequestId: string,
    tagId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagsApiFp(this.configuration)
      .retrieveTag(xRequestId, tagId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all tags in your account
   * @summary List tags
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [name] Filter as substring match for tag names. Tags may contain letters, numbers, colons, dashes, and underscores. There is a limit of 255 characters per tag.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApi
   */
  public retrieveTagList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    name?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagsApiFp(this.configuration)
      .retrieveTagList(xRequestId, xTraceId, page, size, orderBy, name, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update attributes to your tag. Attributes are optional. If not set, the attributes will retain their original values.
   * @summary Update specific tag by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} tagId The identifier of the tag
   * @param {UpdateTagRequest} updateTagRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsApi
   */
  public updateTag(
    xRequestId: string,
    tagId: number,
    updateTagRequest: UpdateTagRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagsApiFp(this.configuration)
      .updateTag(xRequestId, tagId, updateTagRequest, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * TagsAuditsApi - axios parameter creator
 * @export
 */
export const TagsAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your assignments.
     * @summary List history about your assignments (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [tagId] The identifier of the tag.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] UserId of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveTagAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      tagId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveTagAuditsList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/tags/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (tagId !== undefined) {
        localVarQueryParameter['tagId'] = tagId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * TagsAuditsApi - functional programming interface
 * @export
 */
export const TagsAuditsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    TagsAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your assignments.
     * @summary List history about your assignments (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [tagId] The identifier of the tag.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] UserId of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveTagAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      tagId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListTagAuditsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveTagAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          tagId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['TagsAuditsApi.retrieveTagAuditsList']?.[
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
 * TagsAuditsApi - factory interface
 * @export
 */
export const TagsAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = TagsAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your assignments.
     * @summary List history about your assignments (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {number} [tagId] The identifier of the tag.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] UserId of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveTagAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      tagId?: number,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListTagAuditsResponse> {
      return localVarFp
        .retrieveTagAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          tagId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * TagsAuditsApi - interface
 * @export
 * @interface TagsAuditsApi
 */
export interface TagsAuditsApiInterface {
  /**
   * List and filters the history about your assignments.
   * @summary List history about your assignments (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [tagId] The identifier of the tag.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] UserId of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsAuditsApiInterface
   */
  retrieveTagAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    tagId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListTagAuditsResponse>;
}

/**
 * TagsAuditsApi - object-oriented interface
 * @export
 * @class TagsAuditsApi
 * @extends {BaseAPI}
 */
export class TagsAuditsApi extends BaseAPI implements TagsAuditsApiInterface {
  /**
   * List and filters the history about your assignments.
   * @summary List history about your assignments (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {number} [tagId] The identifier of the tag.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] UserId of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof TagsAuditsApi
   */
  public retrieveTagAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    tagId?: number,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return TagsAuditsApiFp(this.configuration)
      .retrieveTagAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        tagId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * UsersApi - axios parameter creator
 * @export
 */
export const UsersApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new user with required attributes name, email, enabled, totp (=Two-factor authentication 2FA), admin (=access to all endpoints and resources), accessAllResources and roles. You can\'t specify any password / secrets for the user. For security reasons the user will have to specify secrets on his own.
     * @summary Create a new user
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateUserRequest} createUserRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUser: async (
      xRequestId: string,
      createUserRequest: CreateUserRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('createUser', 'xRequestId', xRequestId);
      // verify required parameter 'createUserRequest' is not null or undefined
      assertParamExists('createUser', 'createUserRequest', createUserRequest);
      const localVarPath = `/v1/users`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        createUserRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * By deleting a user he will not be able to access any endpoints or resources any longer. In order to temporarily disable a user please update its `enabled` attribute.
     * @summary Delete existing user by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUser: async (
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('deleteUser', 'xRequestId', xRequestId);
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('deleteUser', 'userId', userId);
      const localVarPath = `/v1/users/{userId}`.replace(
        `{${'userId'}}`,
        encodeURIComponent(String(userId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Generate and get new client secret.
     * @summary Generate new client secret
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    generateClientSecret: async (
      xRequestId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('generateClientSecret', 'xRequestId', xRequestId);
      const localVarPath = `/v1/users/client/secret`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
     * @summary Get S3 compatible object storage credentials.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} objectStorageId The identifier of the S3 object storage
     * @param {number} credentialId The ID of the object storage credential
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getObjectStorageCredentials: async (
      xRequestId: string,
      userId: string,
      objectStorageId: string,
      credentialId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'getObjectStorageCredentials',
        'xRequestId',
        xRequestId,
      );
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('getObjectStorageCredentials', 'userId', userId);
      // verify required parameter 'objectStorageId' is not null or undefined
      assertParamExists(
        'getObjectStorageCredentials',
        'objectStorageId',
        objectStorageId,
      );
      // verify required parameter 'credentialId' is not null or undefined
      assertParamExists(
        'getObjectStorageCredentials',
        'credentialId',
        credentialId,
      );
      const localVarPath =
        `/v1/users/{userId}/object-storages/{objectStorageId}/credentials/{credentialId}`
          .replace(`{${'userId'}}`, encodeURIComponent(String(userId)))
          .replace(
            `{${'objectStorageId'}}`,
            encodeURIComponent(String(objectStorageId)),
          )
          .replace(
            `{${'credentialId'}}`,
            encodeURIComponent(String(credentialId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get list of S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
     * @summary Get list of S3 compatible object storage credentials for user.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [objectStorageId] The identifier of the S3 object storage
     * @param {string} [regionName] Filter for Object Storage by regions. Available regions: Asia (Singapore), European Union, United States (Central)
     * @param {string} [displayName] Filter for Object Storage by his displayName.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listObjectStorageCredentials: async (
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      objectStorageId?: string,
      regionName?: string,
      displayName?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'listObjectStorageCredentials',
        'xRequestId',
        xRequestId,
      );
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('listObjectStorageCredentials', 'userId', userId);
      const localVarPath =
        `/v1/users/{userId}/object-storages/credentials`.replace(
          `{${'userId'}}`,
          encodeURIComponent(String(userId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (objectStorageId !== undefined) {
        localVarQueryParameter['objectStorageId'] = objectStorageId;
      }

      if (regionName !== undefined) {
        localVarQueryParameter['regionName'] = regionName;
      }

      if (displayName !== undefined) {
        localVarQueryParameter['displayName'] = displayName;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Regenerates secret key of specified user for the a specific S3 compatible object storages.
     * @summary Regenerates secret key of specified user for the S3 compatible object storages.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} objectStorageId The identifier of the S3 object storage
     * @param {number} credentialId The ID of the object storage credential
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    regenerateObjectStorageCredentials: async (
      xRequestId: string,
      userId: string,
      objectStorageId: string,
      credentialId: number,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists(
        'regenerateObjectStorageCredentials',
        'xRequestId',
        xRequestId,
      );
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('regenerateObjectStorageCredentials', 'userId', userId);
      // verify required parameter 'objectStorageId' is not null or undefined
      assertParamExists(
        'regenerateObjectStorageCredentials',
        'objectStorageId',
        objectStorageId,
      );
      // verify required parameter 'credentialId' is not null or undefined
      assertParamExists(
        'regenerateObjectStorageCredentials',
        'credentialId',
        credentialId,
      );
      const localVarPath =
        `/v1/users/{userId}/object-storages/{objectStorageId}/credentials/{credentialId}`
          .replace(`{${'userId'}}`, encodeURIComponent(String(userId)))
          .replace(
            `{${'objectStorageId'}}`,
            encodeURIComponent(String(objectStorageId)),
          )
          .replace(
            `{${'credentialId'}}`,
            encodeURIComponent(String(credentialId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Resend email verification for a specific user
     * @summary Resend email verification
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {string} [redirectUrl] The redirect url used for email verification
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    resendEmailVerification: async (
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      redirectUrl?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('resendEmailVerification', 'xRequestId', xRequestId);
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('resendEmailVerification', 'userId', userId);
      const localVarPath =
        `/v1/users/{userId}/resend-email-verification`.replace(
          `{${'userId'}}`,
          encodeURIComponent(String(userId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (redirectUrl !== undefined) {
        localVarQueryParameter['redirectUrl'] = redirectUrl;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Send reset password email for a specific user
     * @summary Send reset password email
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {string} [redirectUrl] The redirect url used for resetting password
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    resetPassword: async (
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      redirectUrl?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('resetPassword', 'xRequestId', xRequestId);
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('resetPassword', 'userId', userId);
      const localVarPath = `/v1/users/{userId}/reset-password`.replace(
        `{${'userId'}}`,
        encodeURIComponent(String(userId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (redirectUrl !== undefined) {
        localVarQueryParameter['redirectUrl'] = redirectUrl;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get attributes for a specific user.
     * @summary Get specific user by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUser: async (
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveUser', 'xRequestId', xRequestId);
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('retrieveUser', 'userId', userId);
      const localVarPath = `/v1/users/{userId}`.replace(
        `{${'userId'}}`,
        encodeURIComponent(String(userId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get idm client.
     * @summary Get client
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUserClient: async (
      xRequestId: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveUserClient', 'xRequestId', xRequestId);
      const localVarPath = `/v1/users/client`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all your users.
     * @summary List users
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [email] Filter as substring match for user emails.
     * @param {boolean} [enabled] Filter if user is enabled or not.
     * @param {boolean} [owner] Filter if user is owner or not.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUserList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      email?: string,
      enabled?: boolean,
      owner?: boolean,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveUserList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/users`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (email !== undefined) {
        localVarQueryParameter['email'] = email;
      }

      if (enabled !== undefined) {
        localVarQueryParameter['enabled'] = enabled;
      }

      if (owner !== undefined) {
        localVarQueryParameter['owner'] = owner;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Update attributes of a user. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
     * @summary Update specific user by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {UpdateUserRequest} updateUserRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUser: async (
      xRequestId: string,
      userId: string,
      updateUserRequest: UpdateUserRequest,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('updateUser', 'xRequestId', xRequestId);
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('updateUser', 'userId', userId);
      // verify required parameter 'updateUserRequest' is not null or undefined
      assertParamExists('updateUser', 'updateUserRequest', updateUserRequest);
      const localVarPath = `/v1/users/{userId}`.replace(
        `{${'userId'}}`,
        encodeURIComponent(String(userId)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      localVarHeaderParameter['Content-Type'] = 'application/json';

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
      }
      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions =
        baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = {
        ...localVarHeaderParameter,
        ...headersFromBaseOptions,
        ...options.headers,
      };
      localVarRequestOptions.data = serializeDataIfNeeded(
        updateUserRequest,
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
 * UsersApi - functional programming interface
 * @export
 */
export const UsersApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = UsersApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new user with required attributes name, email, enabled, totp (=Two-factor authentication 2FA), admin (=access to all endpoints and resources), accessAllResources and roles. You can\'t specify any password / secrets for the user. For security reasons the user will have to specify secrets on his own.
     * @summary Create a new user
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateUserRequest} createUserRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createUser(
      xRequestId: string,
      createUserRequest: CreateUserRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<CreateUserResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createUser(
        xRequestId,
        createUserRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.createUser']?.[
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
     * By deleting a user he will not be able to access any endpoints or resources any longer. In order to temporarily disable a user please update its `enabled` attribute.
     * @summary Delete existing user by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteUser(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteUser(
        xRequestId,
        userId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.deleteUser']?.[
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
     * Generate and get new client secret.
     * @summary Generate new client secret
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async generateClientSecret(
      xRequestId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<GenerateClientSecretResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.generateClientSecret(
          xRequestId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.generateClientSecret']?.[
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
     * Get S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
     * @summary Get S3 compatible object storage credentials.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} objectStorageId The identifier of the S3 object storage
     * @param {number} credentialId The ID of the object storage credential
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getObjectStorageCredentials(
      xRequestId: string,
      userId: string,
      objectStorageId: string,
      credentialId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindCredentialResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getObjectStorageCredentials(
          xRequestId,
          userId,
          objectStorageId,
          credentialId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.getObjectStorageCredentials']?.[
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
     * Get list of S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
     * @summary Get list of S3 compatible object storage credentials for user.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [objectStorageId] The identifier of the S3 object storage
     * @param {string} [regionName] Filter for Object Storage by regions. Available regions: Asia (Singapore), European Union, United States (Central)
     * @param {string} [displayName] Filter for Object Storage by his displayName.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listObjectStorageCredentials(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      objectStorageId?: string,
      regionName?: string,
      displayName?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListCredentialResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listObjectStorageCredentials(
          xRequestId,
          userId,
          xTraceId,
          page,
          size,
          orderBy,
          objectStorageId,
          regionName,
          displayName,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.listObjectStorageCredentials']?.[
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
     * Regenerates secret key of specified user for the a specific S3 compatible object storages.
     * @summary Regenerates secret key of specified user for the S3 compatible object storages.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} objectStorageId The identifier of the S3 object storage
     * @param {number} credentialId The ID of the object storage credential
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async regenerateObjectStorageCredentials(
      xRequestId: string,
      userId: string,
      objectStorageId: string,
      credentialId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindCredentialResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.regenerateObjectStorageCredentials(
          xRequestId,
          userId,
          objectStorageId,
          credentialId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.regenerateObjectStorageCredentials']?.[
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
     * Resend email verification for a specific user
     * @summary Resend email verification
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {string} [redirectUrl] The redirect url used for email verification
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async resendEmailVerification(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      redirectUrl?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.resendEmailVerification(
          xRequestId,
          userId,
          xTraceId,
          redirectUrl,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.resendEmailVerification']?.[
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
     * Send reset password email for a specific user
     * @summary Send reset password email
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {string} [redirectUrl] The redirect url used for resetting password
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async resetPassword(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      redirectUrl?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.resetPassword(
        xRequestId,
        userId,
        xTraceId,
        redirectUrl,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.resetPassword']?.[
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
     * Get attributes for a specific user.
     * @summary Get specific user by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveUser(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindUserResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveUser(
        xRequestId,
        userId,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.retrieveUser']?.[
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
     * Get idm client.
     * @summary Get client
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveUserClient(
      xRequestId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindClientResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveUserClient(
          xRequestId,
          xTraceId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.retrieveUserClient']?.[
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
     * List and filter all your users.
     * @summary List users
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [email] Filter as substring match for user emails.
     * @param {boolean} [enabled] Filter if user is enabled or not.
     * @param {boolean} [owner] Filter if user is owner or not.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveUserList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      email?: string,
      enabled?: boolean,
      owner?: boolean,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListUserResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveUserList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          email,
          enabled,
          owner,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.retrieveUserList']?.[
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
     * Update attributes of a user. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
     * @summary Update specific user by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {UpdateUserRequest} updateUserRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateUser(
      xRequestId: string,
      userId: string,
      updateUserRequest: UpdateUserRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<UpdateUserResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateUser(
        xRequestId,
        userId,
        updateUserRequest,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.updateUser']?.[
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
 * UsersApi - factory interface
 * @export
 */
export const UsersApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = UsersApiFp(configuration);
  return {
    /**
     * Create a new user with required attributes name, email, enabled, totp (=Two-factor authentication 2FA), admin (=access to all endpoints and resources), accessAllResources and roles. You can\'t specify any password / secrets for the user. For security reasons the user will have to specify secrets on his own.
     * @summary Create a new user
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {CreateUserRequest} createUserRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUser(
      xRequestId: string,
      createUserRequest: CreateUserRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<CreateUserResponse> {
      return localVarFp
        .createUser(xRequestId, createUserRequest, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * By deleting a user he will not be able to access any endpoints or resources any longer. In order to temporarily disable a user please update its `enabled` attribute.
     * @summary Delete existing user by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUser(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteUser(xRequestId, userId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Generate and get new client secret.
     * @summary Generate new client secret
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    generateClientSecret(
      xRequestId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<GenerateClientSecretResponse> {
      return localVarFp
        .generateClientSecret(xRequestId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
     * @summary Get S3 compatible object storage credentials.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} objectStorageId The identifier of the S3 object storage
     * @param {number} credentialId The ID of the object storage credential
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getObjectStorageCredentials(
      xRequestId: string,
      userId: string,
      objectStorageId: string,
      credentialId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindCredentialResponse> {
      return localVarFp
        .getObjectStorageCredentials(
          xRequestId,
          userId,
          objectStorageId,
          credentialId,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Get list of S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
     * @summary Get list of S3 compatible object storage credentials for user.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [objectStorageId] The identifier of the S3 object storage
     * @param {string} [regionName] Filter for Object Storage by regions. Available regions: Asia (Singapore), European Union, United States (Central)
     * @param {string} [displayName] Filter for Object Storage by his displayName.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listObjectStorageCredentials(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      objectStorageId?: string,
      regionName?: string,
      displayName?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListCredentialResponse> {
      return localVarFp
        .listObjectStorageCredentials(
          xRequestId,
          userId,
          xTraceId,
          page,
          size,
          orderBy,
          objectStorageId,
          regionName,
          displayName,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Regenerates secret key of specified user for the a specific S3 compatible object storages.
     * @summary Regenerates secret key of specified user for the S3 compatible object storages.
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} objectStorageId The identifier of the S3 object storage
     * @param {number} credentialId The ID of the object storage credential
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    regenerateObjectStorageCredentials(
      xRequestId: string,
      userId: string,
      objectStorageId: string,
      credentialId: number,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindCredentialResponse> {
      return localVarFp
        .regenerateObjectStorageCredentials(
          xRequestId,
          userId,
          objectStorageId,
          credentialId,
          xTraceId,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Resend email verification for a specific user
     * @summary Resend email verification
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {string} [redirectUrl] The redirect url used for email verification
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    resendEmailVerification(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      redirectUrl?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .resendEmailVerification(
          xRequestId,
          userId,
          xTraceId,
          redirectUrl,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Send reset password email for a specific user
     * @summary Send reset password email
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {string} [redirectUrl] The redirect url used for resetting password
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    resetPassword(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      redirectUrl?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .resetPassword(xRequestId, userId, xTraceId, redirectUrl, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get attributes for a specific user.
     * @summary Get specific user by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUser(
      xRequestId: string,
      userId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindUserResponse> {
      return localVarFp
        .retrieveUser(xRequestId, userId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get idm client.
     * @summary Get client
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUserClient(
      xRequestId: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindClientResponse> {
      return localVarFp
        .retrieveUserClient(xRequestId, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all your users.
     * @summary List users
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [email] Filter as substring match for user emails.
     * @param {boolean} [enabled] Filter if user is enabled or not.
     * @param {boolean} [owner] Filter if user is owner or not.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUserList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      email?: string,
      enabled?: boolean,
      owner?: boolean,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListUserResponse> {
      return localVarFp
        .retrieveUserList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          email,
          enabled,
          owner,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update attributes of a user. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
     * @summary Update specific user by id
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} userId The identifier of the user.
     * @param {UpdateUserRequest} updateUserRequest
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUser(
      xRequestId: string,
      userId: string,
      updateUserRequest: UpdateUserRequest,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<UpdateUserResponse> {
      return localVarFp
        .updateUser(xRequestId, userId, updateUserRequest, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * UsersApi - interface
 * @export
 * @interface UsersApi
 */
export interface UsersApiInterface {
  /**
   * Create a new user with required attributes name, email, enabled, totp (=Two-factor authentication 2FA), admin (=access to all endpoints and resources), accessAllResources and roles. You can\'t specify any password / secrets for the user. For security reasons the user will have to specify secrets on his own.
   * @summary Create a new user
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateUserRequest} createUserRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  createUser(
    xRequestId: string,
    createUserRequest: CreateUserRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<CreateUserResponse>;

  /**
   * By deleting a user he will not be able to access any endpoints or resources any longer. In order to temporarily disable a user please update its `enabled` attribute.
   * @summary Delete existing user by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  deleteUser(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Generate and get new client secret.
   * @summary Generate new client secret
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  generateClientSecret(
    xRequestId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<GenerateClientSecretResponse>;

  /**
   * Get S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
   * @summary Get S3 compatible object storage credentials.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} objectStorageId The identifier of the S3 object storage
   * @param {number} credentialId The ID of the object storage credential
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  getObjectStorageCredentials(
    xRequestId: string,
    userId: string,
    objectStorageId: string,
    credentialId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindCredentialResponse>;

  /**
   * Get list of S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
   * @summary Get list of S3 compatible object storage credentials for user.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [objectStorageId] The identifier of the S3 object storage
   * @param {string} [regionName] Filter for Object Storage by regions. Available regions: Asia (Singapore), European Union, United States (Central)
   * @param {string} [displayName] Filter for Object Storage by his displayName.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  listObjectStorageCredentials(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    objectStorageId?: string,
    regionName?: string,
    displayName?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListCredentialResponse>;

  /**
   * Regenerates secret key of specified user for the a specific S3 compatible object storages.
   * @summary Regenerates secret key of specified user for the S3 compatible object storages.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} objectStorageId The identifier of the S3 object storage
   * @param {number} credentialId The ID of the object storage credential
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  regenerateObjectStorageCredentials(
    xRequestId: string,
    userId: string,
    objectStorageId: string,
    credentialId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindCredentialResponse>;

  /**
   * Resend email verification for a specific user
   * @summary Resend email verification
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {string} [redirectUrl] The redirect url used for email verification
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  resendEmailVerification(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    redirectUrl?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Send reset password email for a specific user
   * @summary Send reset password email
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {string} [redirectUrl] The redirect url used for resetting password
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  resetPassword(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    redirectUrl?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Get attributes for a specific user.
   * @summary Get specific user by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  retrieveUser(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindUserResponse>;

  /**
   * Get idm client.
   * @summary Get client
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  retrieveUserClient(
    xRequestId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindClientResponse>;

  /**
   * List and filter all your users.
   * @summary List users
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [email] Filter as substring match for user emails.
   * @param {boolean} [enabled] Filter if user is enabled or not.
   * @param {boolean} [owner] Filter if user is owner or not.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  retrieveUserList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    email?: string,
    enabled?: boolean,
    owner?: boolean,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListUserResponse>;

  /**
   * Update attributes of a user. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
   * @summary Update specific user by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {UpdateUserRequest} updateUserRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  updateUser(
    xRequestId: string,
    userId: string,
    updateUserRequest: UpdateUserRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<UpdateUserResponse>;
}

/**
 * UsersApi - object-oriented interface
 * @export
 * @class UsersApi
 * @extends {BaseAPI}
 */
export class UsersApi extends BaseAPI implements UsersApiInterface {
  /**
   * Create a new user with required attributes name, email, enabled, totp (=Two-factor authentication 2FA), admin (=access to all endpoints and resources), accessAllResources and roles. You can\'t specify any password / secrets for the user. For security reasons the user will have to specify secrets on his own.
   * @summary Create a new user
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {CreateUserRequest} createUserRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public createUser(
    xRequestId: string,
    createUserRequest: CreateUserRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .createUser(xRequestId, createUserRequest, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * By deleting a user he will not be able to access any endpoints or resources any longer. In order to temporarily disable a user please update its `enabled` attribute.
   * @summary Delete existing user by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public deleteUser(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .deleteUser(xRequestId, userId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Generate and get new client secret.
   * @summary Generate new client secret
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public generateClientSecret(
    xRequestId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .generateClientSecret(xRequestId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
   * @summary Get S3 compatible object storage credentials.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} objectStorageId The identifier of the S3 object storage
   * @param {number} credentialId The ID of the object storage credential
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public getObjectStorageCredentials(
    xRequestId: string,
    userId: string,
    objectStorageId: string,
    credentialId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .getObjectStorageCredentials(
        xRequestId,
        userId,
        objectStorageId,
        credentialId,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get list of S3 compatible object storage credentials for accessing it via S3 compatible tools like `aws` cli.
   * @summary Get list of S3 compatible object storage credentials for user.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [objectStorageId] The identifier of the S3 object storage
   * @param {string} [regionName] Filter for Object Storage by regions. Available regions: Asia (Singapore), European Union, United States (Central)
   * @param {string} [displayName] Filter for Object Storage by his displayName.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public listObjectStorageCredentials(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    objectStorageId?: string,
    regionName?: string,
    displayName?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .listObjectStorageCredentials(
        xRequestId,
        userId,
        xTraceId,
        page,
        size,
        orderBy,
        objectStorageId,
        regionName,
        displayName,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Regenerates secret key of specified user for the a specific S3 compatible object storages.
   * @summary Regenerates secret key of specified user for the S3 compatible object storages.
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} objectStorageId The identifier of the S3 object storage
   * @param {number} credentialId The ID of the object storage credential
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public regenerateObjectStorageCredentials(
    xRequestId: string,
    userId: string,
    objectStorageId: string,
    credentialId: number,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .regenerateObjectStorageCredentials(
        xRequestId,
        userId,
        objectStorageId,
        credentialId,
        xTraceId,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Resend email verification for a specific user
   * @summary Resend email verification
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {string} [redirectUrl] The redirect url used for email verification
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public resendEmailVerification(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    redirectUrl?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .resendEmailVerification(
        xRequestId,
        userId,
        xTraceId,
        redirectUrl,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Send reset password email for a specific user
   * @summary Send reset password email
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {string} [redirectUrl] The redirect url used for resetting password
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public resetPassword(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    redirectUrl?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .resetPassword(xRequestId, userId, xTraceId, redirectUrl, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get attributes for a specific user.
   * @summary Get specific user by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public retrieveUser(
    xRequestId: string,
    userId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .retrieveUser(xRequestId, userId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get idm client.
   * @summary Get client
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public retrieveUserClient(
    xRequestId: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .retrieveUserClient(xRequestId, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all your users.
   * @summary List users
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [email] Filter as substring match for user emails.
   * @param {boolean} [enabled] Filter if user is enabled or not.
   * @param {boolean} [owner] Filter if user is owner or not.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public retrieveUserList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    email?: string,
    enabled?: boolean,
    owner?: boolean,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .retrieveUserList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        email,
        enabled,
        owner,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update attributes of a user. You may only specify the attributes you want to change. If an attribute is not set, it will retain its original value.
   * @summary Update specific user by id
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} userId The identifier of the user.
   * @param {UpdateUserRequest} updateUserRequest
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public updateUser(
    xRequestId: string,
    userId: string,
    updateUserRequest: UpdateUserRequest,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .updateUser(xRequestId, userId, updateUserRequest, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * UsersAuditsApi - axios parameter creator
 * @export
 */
export const UsersAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filter the history about your users.
     * @summary List history about your users (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [userId] The identifier of the user.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUserAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      userId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveUserAuditsList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/users/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (userId !== undefined) {
        localVarQueryParameter['userId'] = userId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * UsersAuditsApi - functional programming interface
 * @export
 */
export const UsersAuditsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    UsersAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filter the history about your users.
     * @summary List history about your users (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [userId] The identifier of the user.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveUserAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      userId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListUserAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveUserAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          userId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersAuditsApi.retrieveUserAuditsList']?.[
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
 * UsersAuditsApi - factory interface
 * @export
 */
export const UsersAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = UsersAuditsApiFp(configuration);
  return {
    /**
     * List and filter the history about your users.
     * @summary List history about your users (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [userId] The identifier of the user.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] changedBy of the user which led to the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveUserAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      userId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListUserAuditResponse> {
      return localVarFp
        .retrieveUserAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          userId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * UsersAuditsApi - interface
 * @export
 * @interface UsersAuditsApi
 */
export interface UsersAuditsApiInterface {
  /**
   * List and filter the history about your users.
   * @summary List history about your users (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [userId] The identifier of the user.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersAuditsApiInterface
   */
  retrieveUserAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    userId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListUserAuditResponse>;
}

/**
 * UsersAuditsApi - object-oriented interface
 * @export
 * @class UsersAuditsApi
 * @extends {BaseAPI}
 */
export class UsersAuditsApi extends BaseAPI implements UsersAuditsApiInterface {
  /**
   * List and filter the history about your users.
   * @summary List history about your users (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [userId] The identifier of the user.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] changedBy of the user which led to the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersAuditsApi
   */
  public retrieveUserAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    userId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersAuditsApiFp(this.configuration)
      .retrieveUserAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        userId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * VIPApi - axios parameter creator
 * @export
 */
export const VIPApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Assign a VIP to a VPS/VDS/Bare Metal using the machine id.
     * @summary Assign a VIP to an VPS/VDS/Bare Metal
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} resourceId The identifier of the resource
     * @param {string} ip The ip you want to add the instance to
     * @param {AssignIpResourceTypeEnum} resourceType The resourceType using the VIP.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    assignIp: async (
      xRequestId: string,
      resourceId: number,
      ip: string,
      resourceType: AssignIpResourceTypeEnum,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('assignIp', 'xRequestId', xRequestId);
      // verify required parameter 'resourceId' is not null or undefined
      assertParamExists('assignIp', 'resourceId', resourceId);
      // verify required parameter 'ip' is not null or undefined
      assertParamExists('assignIp', 'ip', ip);
      // verify required parameter 'resourceType' is not null or undefined
      assertParamExists('assignIp', 'resourceType', resourceType);
      const localVarPath = `/v1/vips/{ip}/{resourceType}/{resourceId}`
        .replace(`{${'resourceId'}}`, encodeURIComponent(String(resourceId)))
        .replace(`{${'ip'}}`, encodeURIComponent(String(ip)))
        .replace(
          `{${'resourceType'}}`,
          encodeURIComponent(String(resourceType)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Get attributes values to a specific VIP on your account.
     * @summary Get specific VIP by ip
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} ip The ip of the VIP
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveVip: async (
      xRequestId: string,
      ip: string,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveVip', 'xRequestId', xRequestId);
      // verify required parameter 'ip' is not null or undefined
      assertParamExists('retrieveVip', 'ip', ip);
      const localVarPath = `/v1/vips/{ip}`.replace(
        `{${'ip'}}`,
        encodeURIComponent(String(ip)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * List and filter all vips in your account
     * @summary List VIPs
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [resourceId] The resourceId using the VIP.
     * @param {RetrieveVipListResourceTypeEnum} [resourceType] The resourceType using the VIP.
     * @param {string} [resourceName] The name of the resource.
     * @param {string} [resourceDisplayName] The display name of the resource.
     * @param {RetrieveVipListIpVersionEnum} [ipVersion] The VIP version.
     * @param {string} [ips] Comma separated IPs
     * @param {string} [ip] The ip of the VIP
     * @param {RetrieveVipListTypeEnum} [type] The VIP type.
     * @param {string} [dataCenter] The dataCenter of the VIP.
     * @param {string} [region] The region of the VIP.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveVipList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      resourceId?: string,
      resourceType?: RetrieveVipListResourceTypeEnum,
      resourceName?: string,
      resourceDisplayName?: string,
      ipVersion?: RetrieveVipListIpVersionEnum,
      ips?: string,
      ip?: string,
      type?: RetrieveVipListTypeEnum,
      dataCenter?: string,
      region?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveVipList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/vips`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (resourceId !== undefined) {
        localVarQueryParameter['resourceId'] = resourceId;
      }

      if (resourceType !== undefined) {
        localVarQueryParameter['resourceType'] = resourceType;
      }

      if (resourceName !== undefined) {
        localVarQueryParameter['resourceName'] = resourceName;
      }

      if (resourceDisplayName !== undefined) {
        localVarQueryParameter['resourceDisplayName'] = resourceDisplayName;
      }

      if (ipVersion !== undefined) {
        localVarQueryParameter['ipVersion'] = ipVersion;
      }

      if (ips !== undefined) {
        localVarQueryParameter['ips'] = ips;
      }

      if (ip !== undefined) {
        localVarQueryParameter['ip'] = ip;
      }

      if (type !== undefined) {
        localVarQueryParameter['type'] = type;
      }

      if (dataCenter !== undefined) {
        localVarQueryParameter['dataCenter'] = dataCenter;
      }

      if (region !== undefined) {
        localVarQueryParameter['region'] = region;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
     * Unassign a VIP from an VPS/VDS/Bare Metal using the machine id.
     * @summary Unassign a VIP to a VPS/VDS/Bare Metal
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} resourceId The identifier of the resource
     * @param {string} ip The ip you want to add the instance to
     * @param {UnassignIpResourceTypeEnum} resourceType The resourceType using the VIP.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    unassignIp: async (
      xRequestId: string,
      resourceId: number,
      ip: string,
      resourceType: UnassignIpResourceTypeEnum,
      xTraceId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('unassignIp', 'xRequestId', xRequestId);
      // verify required parameter 'resourceId' is not null or undefined
      assertParamExists('unassignIp', 'resourceId', resourceId);
      // verify required parameter 'ip' is not null or undefined
      assertParamExists('unassignIp', 'ip', ip);
      // verify required parameter 'resourceType' is not null or undefined
      assertParamExists('unassignIp', 'resourceType', resourceType);
      const localVarPath = `/v1/vips/{ip}/{resourceType}/{resourceId}`
        .replace(`{${'resourceId'}}`, encodeURIComponent(String(resourceId)))
        .replace(`{${'ip'}}`, encodeURIComponent(String(ip)))
        .replace(
          `{${'resourceType'}}`,
          encodeURIComponent(String(resourceType)),
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * VIPApi - functional programming interface
 * @export
 */
export const VIPApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = VIPApiAxiosParamCreator(configuration);
  return {
    /**
     * Assign a VIP to a VPS/VDS/Bare Metal using the machine id.
     * @summary Assign a VIP to an VPS/VDS/Bare Metal
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} resourceId The identifier of the resource
     * @param {string} ip The ip you want to add the instance to
     * @param {AssignIpResourceTypeEnum} resourceType The resourceType using the VIP.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async assignIp(
      xRequestId: string,
      resourceId: number,
      ip: string,
      resourceType: AssignIpResourceTypeEnum,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<AssignVipResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.assignIp(
        xRequestId,
        resourceId,
        ip,
        resourceType,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VIPApi.assignIp']?.[localVarOperationServerIndex]
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
     * Get attributes values to a specific VIP on your account.
     * @summary Get specific VIP by ip
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} ip The ip of the VIP
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveVip(
      xRequestId: string,
      ip: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<FindVipResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveVip(
        xRequestId,
        ip,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VIPApi.retrieveVip']?.[localVarOperationServerIndex]
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
     * List and filter all vips in your account
     * @summary List VIPs
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [resourceId] The resourceId using the VIP.
     * @param {RetrieveVipListResourceTypeEnum} [resourceType] The resourceType using the VIP.
     * @param {string} [resourceName] The name of the resource.
     * @param {string} [resourceDisplayName] The display name of the resource.
     * @param {RetrieveVipListIpVersionEnum} [ipVersion] The VIP version.
     * @param {string} [ips] Comma separated IPs
     * @param {string} [ip] The ip of the VIP
     * @param {RetrieveVipListTypeEnum} [type] The VIP type.
     * @param {string} [dataCenter] The dataCenter of the VIP.
     * @param {string} [region] The region of the VIP.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveVipList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      resourceId?: string,
      resourceType?: RetrieveVipListResourceTypeEnum,
      resourceName?: string,
      resourceDisplayName?: string,
      ipVersion?: RetrieveVipListIpVersionEnum,
      ips?: string,
      ip?: string,
      type?: RetrieveVipListTypeEnum,
      dataCenter?: string,
      region?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListVipResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.retrieveVipList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        resourceId,
        resourceType,
        resourceName,
        resourceDisplayName,
        ipVersion,
        ips,
        ip,
        type,
        dataCenter,
        region,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VIPApi.retrieveVipList']?.[
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
     * Unassign a VIP from an VPS/VDS/Bare Metal using the machine id.
     * @summary Unassign a VIP to a VPS/VDS/Bare Metal
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} resourceId The identifier of the resource
     * @param {string} ip The ip you want to add the instance to
     * @param {UnassignIpResourceTypeEnum} resourceType The resourceType using the VIP.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async unassignIp(
      xRequestId: string,
      resourceId: number,
      ip: string,
      resourceType: UnassignIpResourceTypeEnum,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.unassignIp(
        xRequestId,
        resourceId,
        ip,
        resourceType,
        xTraceId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VIPApi.unassignIp']?.[localVarOperationServerIndex]
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
 * VIPApi - factory interface
 * @export
 */
export const VIPApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = VIPApiFp(configuration);
  return {
    /**
     * Assign a VIP to a VPS/VDS/Bare Metal using the machine id.
     * @summary Assign a VIP to an VPS/VDS/Bare Metal
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} resourceId The identifier of the resource
     * @param {string} ip The ip you want to add the instance to
     * @param {AssignIpResourceTypeEnum} resourceType The resourceType using the VIP.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    assignIp(
      xRequestId: string,
      resourceId: number,
      ip: string,
      resourceType: AssignIpResourceTypeEnum,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<AssignVipResponse> {
      return localVarFp
        .assignIp(xRequestId, resourceId, ip, resourceType, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get attributes values to a specific VIP on your account.
     * @summary Get specific VIP by ip
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} ip The ip of the VIP
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveVip(
      xRequestId: string,
      ip: string,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<FindVipResponse> {
      return localVarFp
        .retrieveVip(xRequestId, ip, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List and filter all vips in your account
     * @summary List VIPs
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [resourceId] The resourceId using the VIP.
     * @param {RetrieveVipListResourceTypeEnum} [resourceType] The resourceType using the VIP.
     * @param {string} [resourceName] The name of the resource.
     * @param {string} [resourceDisplayName] The display name of the resource.
     * @param {RetrieveVipListIpVersionEnum} [ipVersion] The VIP version.
     * @param {string} [ips] Comma separated IPs
     * @param {string} [ip] The ip of the VIP
     * @param {RetrieveVipListTypeEnum} [type] The VIP type.
     * @param {string} [dataCenter] The dataCenter of the VIP.
     * @param {string} [region] The region of the VIP.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveVipList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      resourceId?: string,
      resourceType?: RetrieveVipListResourceTypeEnum,
      resourceName?: string,
      resourceDisplayName?: string,
      ipVersion?: RetrieveVipListIpVersionEnum,
      ips?: string,
      ip?: string,
      type?: RetrieveVipListTypeEnum,
      dataCenter?: string,
      region?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListVipResponse> {
      return localVarFp
        .retrieveVipList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          resourceId,
          resourceType,
          resourceName,
          resourceDisplayName,
          ipVersion,
          ips,
          ip,
          type,
          dataCenter,
          region,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Unassign a VIP from an VPS/VDS/Bare Metal using the machine id.
     * @summary Unassign a VIP to a VPS/VDS/Bare Metal
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {number} resourceId The identifier of the resource
     * @param {string} ip The ip you want to add the instance to
     * @param {UnassignIpResourceTypeEnum} resourceType The resourceType using the VIP.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    unassignIp(
      xRequestId: string,
      resourceId: number,
      ip: string,
      resourceType: UnassignIpResourceTypeEnum,
      xTraceId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .unassignIp(xRequestId, resourceId, ip, resourceType, xTraceId, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * VIPApi - interface
 * @export
 * @interface VIPApi
 */
export interface VIPApiInterface {
  /**
   * Assign a VIP to a VPS/VDS/Bare Metal using the machine id.
   * @summary Assign a VIP to an VPS/VDS/Bare Metal
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} resourceId The identifier of the resource
   * @param {string} ip The ip you want to add the instance to
   * @param {AssignIpResourceTypeEnum} resourceType The resourceType using the VIP.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VIPApiInterface
   */
  assignIp(
    xRequestId: string,
    resourceId: number,
    ip: string,
    resourceType: AssignIpResourceTypeEnum,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<AssignVipResponse>;

  /**
   * Get attributes values to a specific VIP on your account.
   * @summary Get specific VIP by ip
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} ip The ip of the VIP
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VIPApiInterface
   */
  retrieveVip(
    xRequestId: string,
    ip: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<FindVipResponse>;

  /**
   * List and filter all vips in your account
   * @summary List VIPs
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [resourceId] The resourceId using the VIP.
   * @param {RetrieveVipListResourceTypeEnum} [resourceType] The resourceType using the VIP.
   * @param {string} [resourceName] The name of the resource.
   * @param {string} [resourceDisplayName] The display name of the resource.
   * @param {RetrieveVipListIpVersionEnum} [ipVersion] The VIP version.
   * @param {string} [ips] Comma separated IPs
   * @param {string} [ip] The ip of the VIP
   * @param {RetrieveVipListTypeEnum} [type] The VIP type.
   * @param {string} [dataCenter] The dataCenter of the VIP.
   * @param {string} [region] The region of the VIP.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VIPApiInterface
   */
  retrieveVipList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    resourceId?: string,
    resourceType?: RetrieveVipListResourceTypeEnum,
    resourceName?: string,
    resourceDisplayName?: string,
    ipVersion?: RetrieveVipListIpVersionEnum,
    ips?: string,
    ip?: string,
    type?: RetrieveVipListTypeEnum,
    dataCenter?: string,
    region?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListVipResponse>;

  /**
   * Unassign a VIP from an VPS/VDS/Bare Metal using the machine id.
   * @summary Unassign a VIP to a VPS/VDS/Bare Metal
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} resourceId The identifier of the resource
   * @param {string} ip The ip you want to add the instance to
   * @param {UnassignIpResourceTypeEnum} resourceType The resourceType using the VIP.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VIPApiInterface
   */
  unassignIp(
    xRequestId: string,
    resourceId: number,
    ip: string,
    resourceType: UnassignIpResourceTypeEnum,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;
}

/**
 * VIPApi - object-oriented interface
 * @export
 * @class VIPApi
 * @extends {BaseAPI}
 */
export class VIPApi extends BaseAPI implements VIPApiInterface {
  /**
   * Assign a VIP to a VPS/VDS/Bare Metal using the machine id.
   * @summary Assign a VIP to an VPS/VDS/Bare Metal
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} resourceId The identifier of the resource
   * @param {string} ip The ip you want to add the instance to
   * @param {AssignIpResourceTypeEnum} resourceType The resourceType using the VIP.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VIPApi
   */
  public assignIp(
    xRequestId: string,
    resourceId: number,
    ip: string,
    resourceType: AssignIpResourceTypeEnum,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VIPApiFp(this.configuration)
      .assignIp(xRequestId, resourceId, ip, resourceType, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get attributes values to a specific VIP on your account.
   * @summary Get specific VIP by ip
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} ip The ip of the VIP
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VIPApi
   */
  public retrieveVip(
    xRequestId: string,
    ip: string,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VIPApiFp(this.configuration)
      .retrieveVip(xRequestId, ip, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List and filter all vips in your account
   * @summary List VIPs
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [resourceId] The resourceId using the VIP.
   * @param {RetrieveVipListResourceTypeEnum} [resourceType] The resourceType using the VIP.
   * @param {string} [resourceName] The name of the resource.
   * @param {string} [resourceDisplayName] The display name of the resource.
   * @param {RetrieveVipListIpVersionEnum} [ipVersion] The VIP version.
   * @param {string} [ips] Comma separated IPs
   * @param {string} [ip] The ip of the VIP
   * @param {RetrieveVipListTypeEnum} [type] The VIP type.
   * @param {string} [dataCenter] The dataCenter of the VIP.
   * @param {string} [region] The region of the VIP.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VIPApi
   */
  public retrieveVipList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    resourceId?: string,
    resourceType?: RetrieveVipListResourceTypeEnum,
    resourceName?: string,
    resourceDisplayName?: string,
    ipVersion?: RetrieveVipListIpVersionEnum,
    ips?: string,
    ip?: string,
    type?: RetrieveVipListTypeEnum,
    dataCenter?: string,
    region?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VIPApiFp(this.configuration)
      .retrieveVipList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        resourceId,
        resourceType,
        resourceName,
        resourceDisplayName,
        ipVersion,
        ips,
        ip,
        type,
        dataCenter,
        region,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Unassign a VIP from an VPS/VDS/Bare Metal using the machine id.
   * @summary Unassign a VIP to a VPS/VDS/Bare Metal
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {number} resourceId The identifier of the resource
   * @param {string} ip The ip you want to add the instance to
   * @param {UnassignIpResourceTypeEnum} resourceType The resourceType using the VIP.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VIPApi
   */
  public unassignIp(
    xRequestId: string,
    resourceId: number,
    ip: string,
    resourceType: UnassignIpResourceTypeEnum,
    xTraceId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VIPApiFp(this.configuration)
      .unassignIp(xRequestId, resourceId, ip, resourceType, xTraceId, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const AssignIpResourceTypeEnum = {
  Instances: 'instances',
  BareMetal: 'bare-metal',
} as const;
export type AssignIpResourceTypeEnum =
  (typeof AssignIpResourceTypeEnum)[keyof typeof AssignIpResourceTypeEnum];
/**
 * @export
 */
export const RetrieveVipListResourceTypeEnum = {
  Instances: 'instances',
  BareMetal: 'bare-metal',
  Null: 'null',
} as const;
export type RetrieveVipListResourceTypeEnum =
  (typeof RetrieveVipListResourceTypeEnum)[keyof typeof RetrieveVipListResourceTypeEnum];
/**
 * @export
 */
export const RetrieveVipListIpVersionEnum = {
  V4: 'v4',
} as const;
export type RetrieveVipListIpVersionEnum =
  (typeof RetrieveVipListIpVersionEnum)[keyof typeof RetrieveVipListIpVersionEnum];
/**
 * @export
 */
export const RetrieveVipListTypeEnum = {
  Additional: 'additional',
  Floating: 'floating',
} as const;
export type RetrieveVipListTypeEnum =
  (typeof RetrieveVipListTypeEnum)[keyof typeof RetrieveVipListTypeEnum];
/**
 * @export
 */
export const UnassignIpResourceTypeEnum = {
  Instances: 'instances',
  BareMetal: 'bare-metal',
} as const;
export type UnassignIpResourceTypeEnum =
  (typeof UnassignIpResourceTypeEnum)[keyof typeof UnassignIpResourceTypeEnum];

/**
 * VipAuditsApi - axios parameter creator
 * @export
 */
export const VipAuditsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List and filters the history about your VIPs.
     * @summary List history about your VIPs (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [vipId] The identifier of the VIP.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] User name which did the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveVipAuditsList: async (
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      vipId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'xRequestId' is not null or undefined
      assertParamExists('retrieveVipAuditsList', 'xRequestId', xRequestId);
      const localVarPath = `/v1/vips/audits`;
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

      // authentication bearer required
      // http bearer authentication required
      await setBearerAuthToObject(localVarHeaderParameter, configuration);

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (size !== undefined) {
        localVarQueryParameter['size'] = size;
      }

      if (orderBy) {
        localVarQueryParameter['orderBy'] = orderBy;
      }

      if (vipId !== undefined) {
        localVarQueryParameter['vipId'] = vipId;
      }

      if (requestId !== undefined) {
        localVarQueryParameter['requestId'] = requestId;
      }

      if (changedBy !== undefined) {
        localVarQueryParameter['changedBy'] = changedBy;
      }

      if (startDate !== undefined) {
        localVarQueryParameter['startDate'] =
          (startDate as any) instanceof Date
            ? (startDate as any).toISOString().substring(0, 10)
            : startDate;
      }

      if (endDate !== undefined) {
        localVarQueryParameter['endDate'] =
          (endDate as any) instanceof Date
            ? (endDate as any).toISOString().substring(0, 10)
            : endDate;
      }

      if (xRequestId != null) {
        localVarHeaderParameter['x-request-id'] = String(xRequestId);
      }
      if (xTraceId != null) {
        localVarHeaderParameter['x-trace-id'] = String(xTraceId);
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
 * VipAuditsApi - functional programming interface
 * @export
 */
export const VipAuditsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    VipAuditsApiAxiosParamCreator(configuration);
  return {
    /**
     * List and filters the history about your VIPs.
     * @summary List history about your VIPs (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [vipId] The identifier of the VIP.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] User name which did the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async retrieveVipAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      vipId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ListVipAuditResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.retrieveVipAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          vipId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VipAuditsApi.retrieveVipAuditsList']?.[
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
 * VipAuditsApi - factory interface
 * @export
 */
export const VipAuditsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = VipAuditsApiFp(configuration);
  return {
    /**
     * List and filters the history about your VIPs.
     * @summary List history about your VIPs (audit)
     * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
     * @param {string} [xTraceId] Identifier to trace group of requests.
     * @param {number} [page] Number of page to be fetched.
     * @param {number} [size] Number of elements per page.
     * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
     * @param {string} [vipId] The identifier of the VIP.
     * @param {string} [requestId] The requestId of the API call which led to the change.
     * @param {string} [changedBy] User name which did the change.
     * @param {string} [startDate] Start of search time range.
     * @param {string} [endDate] End of search time range.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    retrieveVipAuditsList(
      xRequestId: string,
      xTraceId?: string,
      page?: number,
      size?: number,
      orderBy?: Array<string>,
      vipId?: string,
      requestId?: string,
      changedBy?: string,
      startDate?: string,
      endDate?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ListVipAuditResponse> {
      return localVarFp
        .retrieveVipAuditsList(
          xRequestId,
          xTraceId,
          page,
          size,
          orderBy,
          vipId,
          requestId,
          changedBy,
          startDate,
          endDate,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * VipAuditsApi - interface
 * @export
 * @interface VipAuditsApi
 */
export interface VipAuditsApiInterface {
  /**
   * List and filters the history about your VIPs.
   * @summary List history about your VIPs (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [vipId] The identifier of the VIP.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] User name which did the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VipAuditsApiInterface
   */
  retrieveVipAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    vipId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ListVipAuditResponse>;
}

/**
 * VipAuditsApi - object-oriented interface
 * @export
 * @class VipAuditsApi
 * @extends {BaseAPI}
 */
export class VipAuditsApi extends BaseAPI implements VipAuditsApiInterface {
  /**
   * List and filters the history about your VIPs.
   * @summary List history about your VIPs (audit)
   * @param {string} xRequestId [Uuid4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)) to identify individual requests for support cases. You can use [uuidgenerator](https://www.uuidgenerator.net/version4) to generate them manually.
   * @param {string} [xTraceId] Identifier to trace group of requests.
   * @param {number} [page] Number of page to be fetched.
   * @param {number} [size] Number of elements per page.
   * @param {Array<string>} [orderBy] Specify fields and ordering (ASC for ascending, DESC for descending) in following format &#x60;field:ASC|DESC&#x60;.
   * @param {string} [vipId] The identifier of the VIP.
   * @param {string} [requestId] The requestId of the API call which led to the change.
   * @param {string} [changedBy] User name which did the change.
   * @param {string} [startDate] Start of search time range.
   * @param {string} [endDate] End of search time range.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VipAuditsApi
   */
  public retrieveVipAuditsList(
    xRequestId: string,
    xTraceId?: string,
    page?: number,
    size?: number,
    orderBy?: Array<string>,
    vipId?: string,
    requestId?: string,
    changedBy?: string,
    startDate?: string,
    endDate?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VipAuditsApiFp(this.configuration)
      .retrieveVipAuditsList(
        xRequestId,
        xTraceId,
        page,
        size,
        orderBy,
        vipId,
        requestId,
        changedBy,
        startDate,
        endDate,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}
