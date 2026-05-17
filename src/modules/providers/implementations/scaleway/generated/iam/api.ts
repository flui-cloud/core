/* tslint:disable */
/* eslint-disable */
/**
 * IAM API
 * Identity and Access Management (IAM) allows you to share access to the management of your Scaleway resources and Organization settings, in a controlled and secure manner. With IAM, you can invite other users to your Organization, as well as create IAM applications which represent non-human users with their own API keys. You define permissions for users and applications in your Organization via highly customizable policies. Policies let you specify exactly what rights users and applications (or groups of users and applications) should have within your Organization.  (switchcolumn) (switchcolumn)  ## Concepts  Refer to our [dedicated IAM concepts page](https://www.scaleway.com/en/docs/iam/concepts/) to find definitions of the different terms referring to IAM.  (switchcolumn) (switchcolumn)  ## Quickstart  1. Configure your environment variables.      ```bash     export ACCESS_KEY=\"<access-key>\"     export SECRET_KEY=\"<secret-key>\"     export REGION=\"<region>\"     ```  2. Create an application. Replace the parameter values in the request payload with the details of your new application.     <Message type=\"note\">     The UUIDs used in the following code examples are not real     </Message>      ```bash     curl -X POST \\       -H \"Content-Type: application/json\" \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" https://api.scaleway.com/iam/v1alpha1/applications \\       -d \'{         \"name\": \"prod1\",         \"organization_id\": \"c6842bac-7938-4c04-9e03-f48147eee1f1\",         \"description\": \"this is my new application\"         }\'     ```      | Parameter        | Description                                   |     | :--------------- | :--------------------------------------       |     | `name`           | **REQUIRED** The name of your new application |     | `organization_id`| The ID of your Scaleway Organization          |     | `description`    | The description of your application           | 3. Retrieve your application ID from the response.      ```json     {       \"id\": \"950dde46-5cba-427d-a4f5-ce5a8a79717c\",       \"name\": \"prod1\",       \"description\": \"this is my new application\",       \"created_at\": \"2023-03-08T12:34:56.123456Z\",       \"updated_at\": \"2023-03-08T12:34:56.123456Z\",       \"organization_id\": \"c6842bac-7938-4c04-9e03-f48147eee1f1\",       \"editable\": \"true\",       \"nb_api_keys\": \"0\"     }     ```  4. Create a policy. Replace the parameter values in the request payload with the details of your new application, including the application ID retrieved in the previous step.      ```bash     curl -X POST \\       -H \"Content-Type: application/json\" \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" https://api.scaleway.com/iam/v1alpha1/policies \\       -d \'{       \"name\": \"policy-prod1\",       \"description\": \"This policy grants full access to IAM in my Organization to application prod1\",       \"organization_id\": \"c6842bac-7938-4c04-9e03-f48147eee1f1\",       \"rules\": [         {           \"permission_set_names\": [             \"IAMManager\"           ],           \"organization_id\": \"c6842bac-7938-4c04-9e03-f48147eee1f1\"         }       ],       \"application_id\": \"950dde46-5cba-427d-a4f5-ce5a8a79717c\"     }\'     ```      | Parameter        | Description                                   |     | :--------------- | :--------------------------------------       |     | `name`           | **REQUIRED** The name of your new application |     | `description`| The description of your policy          |     | `organization_id`| The ID of your Scaleway Organization |     | `rules`| The [rules](https://www.scaleway.com/en/docs/iam/reference-content/policy/#rules) of your policy |     | `permission_set_names` | The permission sets you want to grant. You can either [list all permission sets](#path-permission-sets-list-permission-sets) or find a complete list in the [permission sets documentation page](https://www.scaleway.com/en/docs/iam/reference-content/permission-sets/) |     | `organization_id`| The ID of the Scaleway Organization where you want your permission sets to apply. You can add one as the [scope](https://www.scaleway.com/en/docs/iam/reference-content/policy/#scope) of your policy |     | `application_id`| The ID of your application |      <Message type=\"note\">     To learn more about IAM policies, refer to our dedicated [IAM policies reference page](https://www.scaleway.com/en/docs/iam/reference-content/policy/).     </Message> 5. Create an API key for your application.      ```bash     curl -X POST \\       -H \"Content-Type: application/json\" \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" https://api.scaleway.com/iam/v1alpha1/api-keys \\       -d \'{         \"application_id\": \"950dde46-5cba-427d-a4f5-ce5a8a79717c\",         \"expires_at\": \"2023-12-22T12:34:56.123456Z\",         \"default_project_id\": \"2aeadddc-c589-4784-8ef5-fae989a4bac8\",         \"description\": \"This is an API key for prod1\"       }\'     ```      | Parameter        | Description                                                        |     | :--------------- | :----------------------------------------------------------------- |     | `application_id`     | The ID of your application |     | `expires_at`         | **OPTIONAL** The expiration date of your API key|     | `default_project_id` | **OPTIONAL** The Project ID of your preferred Project, to use with Object Storage. If no Project ID is specified, the default project is used. Refer to the [Using API Keys with Object Storage documentation page](https://www.scaleway.com/en/docs/iam/api-cli/using-api-key-object-storage/) |     | `description`        | The description of your API key | 6. Retrieve your access and secret keys from the response.     <Message type=\"note\">     The secret key is only showed once. Make sure that you copy and store both keys somewhere safe.     </Message> You can now have an IAM configuration fully set up and can begin working on your Scaleway projects.  (switchcolumn) <Message type=\"requirement\">   To perform the following steps, you must first ensure that:<br /><br />     - you have an account and are logged into the [Scaleway console](https://console.scaleway.com/organization)     - you have created an [API key](https://www.scaleway.com/en/docs/iam/how-to/create-api-keys/) and that the API key has sufficient [IAM permissions](https://www.scaleway.com/en/docs/iam/reference-content/permission-sets/) to perform the actions described on this page.     - you have [installed `curl`](https://curl.se/download.html) </Message> (switchcolumn)  ## Technical Limitations  * Currently, IAM users cannot be created within Scaleway Organizations, they can only be invited to join them. Refer to the [Users, groups and applications reference page](https://www.scaleway.com/en/docs/iam/reference-content/users-groups-and-applications/#users) to learn more about users.  * Access management at resource level is not yet available. You can currently scope the permission sets to a Project or to an Organization. Refer to the [Permission sets reference page](https://www.scaleway.com/en/docs/iam/reference-content/permission-sets/) to learn more about permission sets.  * Explicit deny permissions are not yet available. You can currently only explicitly allow access to different products or Organization management features.  ## Going Further  For more information about IAM, you can check out the following pages:  * [Identity and Access Management Documentation](https://www.scaleway.com/en/docs/iam/reference-content/overview/) * [Identity and Access Management FAQ](https://www.scaleway.com/en/docs/iam/faq/) * [Scaleway Slack Community](https://scaleway-community.slack.com/) join the #iam channel * [Contact our support team](https://console.scaleway.com/support/tickets) * [Scaleway CLI for IAM](https://github.com/scaleway/scaleway-cli/blob/master/docs/commands/iam.md) * [Scaleway Provider Terraform Documentation for IAM](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/iam_api_key).
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
 * @interface AddGroupMemberRequest
 */
export interface AddGroupMemberRequest {
  /**
   * ID of the user to add.
   * @type {string}
   * @memberof AddGroupMemberRequest
   */
  user_id?: string;
  /**
   * ID of the application to add.
   * @type {string}
   * @memberof AddGroupMemberRequest
   */
  application_id?: string;
}
/**
 *
 * @export
 * @interface AddGroupMembersRequest
 */
export interface AddGroupMembersRequest {
  /**
   * IDs of the users to add.
   * @type {Array<string>}
   * @memberof AddGroupMembersRequest
   */
  user_ids?: Array<string>;
  /**
   * IDs of the applications to add.
   * @type {Array<string>}
   * @memberof AddGroupMembersRequest
   */
  application_ids?: Array<string>;
}
/**
 *
 * @export
 * @interface AddSamlCertificateRequest
 */
export interface AddSamlCertificateRequest {
  /**
   * Type of the SAML certificate.
   * @type {string}
   * @memberof AddSamlCertificateRequest
   */
  type: AddSamlCertificateRequestTypeEnum;
  /**
   * Content of the SAML certificate.
   * @type {string}
   * @memberof AddSamlCertificateRequest
   */
  content: string;
}

export const AddSamlCertificateRequestTypeEnum = {
  UnknownCertificateType: 'unknown_certificate_type',
  Signing: 'signing',
  Encryption: 'encryption',
} as const;

export type AddSamlCertificateRequestTypeEnum =
  (typeof AddSamlCertificateRequestTypeEnum)[keyof typeof AddSamlCertificateRequestTypeEnum];

/**
 *
 * @export
 * @interface CheckPermissionsRequest
 */
export interface CheckPermissionsRequest {
  /**
   *
   * @type {Array<ScalewayIamV1alpha1CheckPermissionsRequestPermission>}
   * @memberof CheckPermissionsRequest
   */
  permissions?: Array<ScalewayIamV1alpha1CheckPermissionsRequestPermission>;
}
/**
 *
 * @export
 * @interface CreateAPIKeyRequest
 */
export interface CreateAPIKeyRequest {
  /**
   * ID of the application.
   * @type {string}
   * @memberof CreateAPIKeyRequest
   */
  application_id?: string;
  /**
   * ID of the user.
   * @type {string}
   * @memberof CreateAPIKeyRequest
   */
  user_id?: string;
  /**
   * Expiration date of the API key. (RFC 3339 format)
   * @type {string}
   * @memberof CreateAPIKeyRequest
   */
  expires_at?: string;
  /**
   * Default Project ID to use with Object Storage.
   * @type {string}
   * @memberof CreateAPIKeyRequest
   */
  default_project_id?: string;
  /**
   * Description of the API key (max length is 200 characters).
   * @type {string}
   * @memberof CreateAPIKeyRequest
   */
  description?: string;
}
/**
 *
 * @export
 * @interface CreateApplicationRequest
 */
export interface CreateApplicationRequest {
  /**
   * Name of the application to create (max length is 64 characters).
   * @type {string}
   * @memberof CreateApplicationRequest
   */
  name: string;
  /**
   * ID of the Organization.
   * @type {string}
   * @memberof CreateApplicationRequest
   */
  organization_id?: string;
  /**
   * Description of the application (max length is 200 characters).
   * @type {string}
   * @memberof CreateApplicationRequest
   */
  description?: string;
  /**
   * Tags associated with the application (maximum of 10 tags).
   * @type {Array<string>}
   * @memberof CreateApplicationRequest
   */
  tags?: Array<string>;
}
/**
 *
 * @export
 * @interface CreateGroupRequest
 */
export interface CreateGroupRequest {
  /**
   * ID of Organization linked to the group.
   * @type {string}
   * @memberof CreateGroupRequest
   */
  organization_id: string;
  /**
   * Name of the group to create (max length is 64 chars). MUST be unique inside an Organization.
   * @type {string}
   * @memberof CreateGroupRequest
   */
  name: string;
  /**
   * Description of the group to create (max length is 200 chars).
   * @type {string}
   * @memberof CreateGroupRequest
   */
  description?: string;
  /**
   * Tags associated with the group (maximum of 10 tags).
   * @type {Array<string>}
   * @memberof CreateGroupRequest
   */
  tags?: Array<string>;
}
/**
 *
 * @export
 * @interface CreatePolicyRequest
 */
export interface CreatePolicyRequest {
  /**
   * Name of the policy to create (max length is 64 characters).
   * @type {string}
   * @memberof CreatePolicyRequest
   */
  name: string;
  /**
   * Description of the policy to create (max length is 200 characters).
   * @type {string}
   * @memberof CreatePolicyRequest
   */
  description?: string;
  /**
   * ID of the Organization.
   * @type {string}
   * @memberof CreatePolicyRequest
   */
  organization_id?: string;
  /**
   * Rules of the policy to create.
   * @type {Array<ScalewayIamV1alpha1RuleSpecs>}
   * @memberof CreatePolicyRequest
   */
  rules?: Array<ScalewayIamV1alpha1RuleSpecs>;
  /**
   * Tags associated with the policy (maximum of 10 tags).
   * @type {Array<string>}
   * @memberof CreatePolicyRequest
   */
  tags?: Array<string>;
  /**
   * ID of user attributed to the policy.
   * @type {string}
   * @memberof CreatePolicyRequest
   */
  user_id?: string;
  /**
   * ID of group attributed to the policy.
   * @type {string}
   * @memberof CreatePolicyRequest
   */
  group_id?: string;
  /**
   * ID of application attributed to the policy.
   * @type {string}
   * @memberof CreatePolicyRequest
   */
  application_id?: string;
  /**
   * Defines whether or not a policy is attributed to a principal.
   * @type {boolean}
   * @memberof CreatePolicyRequest
   */
  no_principal?: boolean;
}
/**
 *
 * @export
 * @interface CreateSSHKeyRequest
 */
export interface CreateSSHKeyRequest {
  /**
   * Name of the SSH key. Max length is 1000.
   * @type {string}
   * @memberof CreateSSHKeyRequest
   */
  name: string;
  /**
   * SSH public key. Currently only the ssh-rsa, ssh-dss (DSA), ssh-ed25519 and ecdsa keys with NIST curves are supported. Max length is 65000.
   * @type {string}
   * @memberof CreateSSHKeyRequest
   */
  public_key: string;
  /**
   * Project the resource is attributed to.
   * @type {string}
   * @memberof CreateSSHKeyRequest
   */
  project_id: string;
}
/**
 *
 * @export
 * @interface CreateUserRequest
 */
export interface CreateUserRequest {
  /**
   * ID of the Organization.
   * @type {string}
   * @memberof CreateUserRequest
   */
  organization_id: string;
  /**
   * Email of the user.
   * @type {string}
   * @memberof CreateUserRequest
   */
  email?: string;
  /**
   * Tags associated with the user.
   * @type {Array<string>}
   * @memberof CreateUserRequest
   */
  tags?: Array<string>;
  /**
   *
   * @type {CreateUserRequestMember}
   * @memberof CreateUserRequest
   */
  member?: CreateUserRequestMember;
}
/**
 * Details of IAM member.
 * @export
 * @interface CreateUserRequestMember
 */
export interface CreateUserRequestMember {
  /**
   * Email of the user to create.
   * @type {string}
   * @memberof CreateUserRequestMember
   */
  email?: string;
  /**
   * Whether or not to send an email containing the member\'s password.
   * @type {boolean}
   * @memberof CreateUserRequestMember
   */
  send_password_email?: boolean;
  /**
   * Whether or not to send a welcome email that includes onboarding information.
   * @type {boolean}
   * @memberof CreateUserRequestMember
   */
  send_welcome_email?: boolean;
  /**
   * The member\'s username.
   * @type {string}
   * @memberof CreateUserRequestMember
   */
  username?: string;
  /**
   * The member\'s password.
   * @type {string}
   * @memberof CreateUserRequestMember
   */
  password?: string;
  /**
   * The member\'s first name.
   * @type {string}
   * @memberof CreateUserRequestMember
   */
  first_name?: string;
  /**
   * The member\'s last name.
   * @type {string}
   * @memberof CreateUserRequestMember
   */
  last_name?: string;
  /**
   * The member\'s phone number.
   * @type {string}
   * @memberof CreateUserRequestMember
   */
  phone_number?: string;
  /**
   * The member\'s locale.
   * @type {string}
   * @memberof CreateUserRequestMember
   */
  locale?: string;
}
/**
 *
 * @export
 * @interface JoinUserConnectionRequest
 */
export interface JoinUserConnectionRequest {
  /**
   * A token returned by InitiateUserConnection.
   * @type {string}
   * @memberof JoinUserConnectionRequest
   */
  token?: string;
}
/**
 *
 * @export
 * @interface RemoveGroupMemberRequest
 */
export interface RemoveGroupMemberRequest {
  /**
   * ID of the user to remove.
   * @type {string}
   * @memberof RemoveGroupMemberRequest
   */
  user_id?: string;
  /**
   * ID of the application to remove.
   * @type {string}
   * @memberof RemoveGroupMemberRequest
   */
  application_id?: string;
}
/**
 *
 * @export
 * @interface RemoveUserConnectionRequest
 */
export interface RemoveUserConnectionRequest {
  /**
   * ID of the user you want to remove from your connection.
   * @type {string}
   * @memberof RemoveUserConnectionRequest
   */
  target_user_id?: string;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1APIKey
 */
export interface ScalewayIamV1alpha1APIKey {
  /**
   * Access key of the API key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  access_key?: string;
  /**
   * Secret key of the API Key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  secret_key?: string;
  /**
   * ID of application that bears the API key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  application_id?: string;
  /**
   * ID of user that bears the API key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  user_id?: string;
  /**
   * Description of API key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  description?: string;
  /**
   * Date and time of API key creation. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  created_at?: string;
  /**
   * Date and time of last API key update. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  updated_at?: string;
  /**
   * Date and time of API key expiration. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  expires_at?: string;
  /**
   * Default Project ID specified for this API key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  default_project_id?: string;
  /**
   * Defines whether or not the API key is editable.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  editable?: boolean;
  /**
   * Defines whether or not the API key is deletable.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  deletable?: boolean;
  /**
   * Defines whether or not the API key is managed.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  managed?: boolean;
  /**
   * IP address of the device that created the API key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1APIKey
   */
  creation_ip?: string;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1Application
 */
export interface ScalewayIamV1alpha1Application {
  /**
   * ID of the application.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Application
   */
  id?: string;
  /**
   * Name of the application.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Application
   */
  name?: string;
  /**
   * Description of the application.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Application
   */
  description?: string;
  /**
   * Date and time application was created. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Application
   */
  created_at?: string;
  /**
   * Date and time of last application update. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Application
   */
  updated_at?: string;
  /**
   * ID of the Organization.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Application
   */
  organization_id?: string;
  /**
   * Defines whether or not the application is editable.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Application
   */
  editable?: boolean;
  /**
   * Defines whether or not the application is deletable.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Application
   */
  deletable?: boolean;
  /**
   * Defines whether or not the application is managed.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Application
   */
  managed?: boolean;
  /**
   * Number of API keys attributed to the application.
   * @type {number}
   * @memberof ScalewayIamV1alpha1Application
   */
  nb_api_keys?: number;
  /**
   * Tags associated with the user.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1Application
   */
  tags?: Array<string>;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1CheckPermissionsRequestPermission
 */
export interface ScalewayIamV1alpha1CheckPermissionsRequestPermission {
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1CheckPermissionsRequestPermission
   */
  service?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1CheckPermissionsRequestPermission
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1CheckPermissionsRequestPermission
   */
  action?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1CheckPermissionsRequestPermission
   */
  project_id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1CheckPermissionsRequestPermission
   */
  organization_id?: string;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1CheckPermissionsResponse
 */
export interface ScalewayIamV1alpha1CheckPermissionsResponse {
  /**
   *
   * @type {Array<ScalewayIamV1alpha1CheckPermissionsResponseResponse>}
   * @memberof ScalewayIamV1alpha1CheckPermissionsResponse
   */
  responses?: Array<ScalewayIamV1alpha1CheckPermissionsResponseResponse>;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1CheckPermissionsResponseResponse
 */
export interface ScalewayIamV1alpha1CheckPermissionsResponseResponse {
  /**
   *
   * @type {ScalewayIamV1alpha1CheckPermissionsResponseResponseDecision}
   * @memberof ScalewayIamV1alpha1CheckPermissionsResponseResponse
   */
  decision?: ScalewayIamV1alpha1CheckPermissionsResponseResponseDecision;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayIamV1alpha1CheckPermissionsResponseResponseDecision = {
  Deny: 'deny',
  Allow: 'allow',
} as const;

export type ScalewayIamV1alpha1CheckPermissionsResponseResponseDecision =
  (typeof ScalewayIamV1alpha1CheckPermissionsResponseResponseDecision)[keyof typeof ScalewayIamV1alpha1CheckPermissionsResponseResponseDecision];

/**
 *
 * @export
 * @interface ScalewayIamV1alpha1Connection
 */
export interface ScalewayIamV1alpha1Connection {
  /**
   *
   * @type {ScalewayIamV1alpha1ConnectionOrganization}
   * @memberof ScalewayIamV1alpha1Connection
   */
  organization?: ScalewayIamV1alpha1ConnectionOrganization;
  /**
   *
   * @type {ScalewayIamV1alpha1ConnectionUser}
   * @memberof ScalewayIamV1alpha1Connection
   */
  user?: ScalewayIamV1alpha1ConnectionUser;
}
/**
 * Information about the connected organization.
 * @export
 * @interface ScalewayIamV1alpha1ConnectionOrganization
 */
export interface ScalewayIamV1alpha1ConnectionOrganization {
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1ConnectionOrganization
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1ConnectionOrganization
   */
  name?: string;
  /**
   *
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1ConnectionOrganization
   */
  locked?: boolean;
}
/**
 * Information about the connected user.
 * @export
 * @interface ScalewayIamV1alpha1ConnectionUser
 */
export interface ScalewayIamV1alpha1ConnectionUser {
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1ConnectionUser
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1ConnectionUser
   */
  username?: string;
  /**
   *
   * @type {ScalewayIamV1alpha1UserType}
   * @memberof ScalewayIamV1alpha1ConnectionUser
   */
  type?: ScalewayIamV1alpha1UserType;
}

/**
 *
 * @export
 * @interface ScalewayIamV1alpha1GetUserConnectionsResponse
 */
export interface ScalewayIamV1alpha1GetUserConnectionsResponse {
  /**
   * List of connections.
   * @type {Array<ScalewayIamV1alpha1Connection>}
   * @memberof ScalewayIamV1alpha1GetUserConnectionsResponse
   */
  connections?: Array<ScalewayIamV1alpha1Connection>;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1GracePeriod
 */
export interface ScalewayIamV1alpha1GracePeriod {
  /**
   * Type of grace period.
   * @type {string}
   * @memberof ScalewayIamV1alpha1GracePeriod
   */
  type?: ScalewayIamV1alpha1GracePeriodTypeEnum;
  /**
   * Date and time the grace period was created. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1GracePeriod
   */
  created_at?: string;
  /**
   * Date and time the grace period expires. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1GracePeriod
   */
  expires_at?: string;
}

export const ScalewayIamV1alpha1GracePeriodTypeEnum = {
  UnknownGracePeriodType: 'unknown_grace_period_type',
  UpdatePassword: 'update_password',
  SetMfa: 'set_mfa',
} as const;

export type ScalewayIamV1alpha1GracePeriodTypeEnum =
  (typeof ScalewayIamV1alpha1GracePeriodTypeEnum)[keyof typeof ScalewayIamV1alpha1GracePeriodTypeEnum];

/**
 *
 * @export
 * @interface ScalewayIamV1alpha1Group
 */
export interface ScalewayIamV1alpha1Group {
  /**
   * ID of the group.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Group
   */
  id?: string;
  /**
   * Date and time of group creation. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Group
   */
  created_at?: string;
  /**
   * Date and time of last group update. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Group
   */
  updated_at?: string;
  /**
   * ID of Organization linked to the group.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Group
   */
  organization_id?: string;
  /**
   * Name of the group.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Group
   */
  name?: string;
  /**
   * Description of the group.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Group
   */
  description?: string;
  /**
   * IDs of users attached to this group.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1Group
   */
  user_ids?: Array<string>;
  /**
   * IDs of applications attached to this group.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1Group
   */
  application_ids?: Array<string>;
  /**
   * Tags associated to the group.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1Group
   */
  tags?: Array<string>;
  /**
   * Defines whether or not the group is editable.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Group
   */
  editable?: boolean;
  /**
   * Defines whether or not the group is deletable.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Group
   */
  deletable?: boolean;
  /**
   * Defines whether or not the group is managed.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Group
   */
  managed?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1InitiateUserConnectionResponse
 */
export interface ScalewayIamV1alpha1InitiateUserConnectionResponse {
  /**
   * Token to be used in JoinUserConnection.
   * @type {string}
   * @memberof ScalewayIamV1alpha1InitiateUserConnectionResponse
   */
  token?: string;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1JWT
 */
export interface ScalewayIamV1alpha1JWT {
  /**
   * JWT ID.
   * @type {string}
   * @memberof ScalewayIamV1alpha1JWT
   */
  jti?: string;
  /**
   * ID of the user who issued the JWT.
   * @type {string}
   * @memberof ScalewayIamV1alpha1JWT
   */
  issuer_id?: string;
  /**
   * ID of the user targeted by the JWT.
   * @type {string}
   * @memberof ScalewayIamV1alpha1JWT
   */
  audience_id?: string;
  /**
   * Creation date of the JWT. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1JWT
   */
  created_at?: string;
  /**
   * Last update date of the JWT. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1JWT
   */
  updated_at?: string;
  /**
   * Expiration date of the JWT. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1JWT
   */
  expires_at?: string;
  /**
   * IP address used during the creation of the JWT. (IP address)
   * @type {string}
   * @memberof ScalewayIamV1alpha1JWT
   */
  ip?: string;
  /**
   * User-agent used during the creation of the JWT.
   * @type {string}
   * @memberof ScalewayIamV1alpha1JWT
   */
  user_agent?: string;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListAPIKeysResponse
 */
export interface ScalewayIamV1alpha1ListAPIKeysResponse {
  /**
   * List of API keys.
   * @type {Array<ScalewayIamV1alpha1APIKey>}
   * @memberof ScalewayIamV1alpha1ListAPIKeysResponse
   */
  api_keys?: Array<ScalewayIamV1alpha1APIKey>;
  /**
   * Total count of API Keys.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListAPIKeysResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListApplicationsResponse
 */
export interface ScalewayIamV1alpha1ListApplicationsResponse {
  /**
   * List of applications.
   * @type {Array<ScalewayIamV1alpha1Application>}
   * @memberof ScalewayIamV1alpha1ListApplicationsResponse
   */
  applications?: Array<ScalewayIamV1alpha1Application>;
  /**
   * Total count of applications.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListApplicationsResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListGracePeriodsResponse
 */
export interface ScalewayIamV1alpha1ListGracePeriodsResponse {
  /**
   * List of grace periods.
   * @type {Array<ScalewayIamV1alpha1GracePeriod>}
   * @memberof ScalewayIamV1alpha1ListGracePeriodsResponse
   */
  grace_periods?: Array<ScalewayIamV1alpha1GracePeriod>;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListGroupsResponse
 */
export interface ScalewayIamV1alpha1ListGroupsResponse {
  /**
   * List of groups.
   * @type {Array<ScalewayIamV1alpha1Group>}
   * @memberof ScalewayIamV1alpha1ListGroupsResponse
   */
  groups?: Array<ScalewayIamV1alpha1Group>;
  /**
   * Total count of groups.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListGroupsResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListJWTsResponse
 */
export interface ScalewayIamV1alpha1ListJWTsResponse {
  /**
   *
   * @type {Array<ScalewayIamV1alpha1JWT>}
   * @memberof ScalewayIamV1alpha1ListJWTsResponse
   */
  jwts?: Array<ScalewayIamV1alpha1JWT>;
  /**
   *
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListJWTsResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListLogsResponse
 */
export interface ScalewayIamV1alpha1ListLogsResponse {
  /**
   * List of logs.
   * @type {Array<ScalewayIamV1alpha1Log>}
   * @memberof ScalewayIamV1alpha1ListLogsResponse
   */
  logs?: Array<ScalewayIamV1alpha1Log>;
  /**
   * Total count of logs.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListLogsResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListPermissionSetsResponse
 */
export interface ScalewayIamV1alpha1ListPermissionSetsResponse {
  /**
   * List of permission sets.
   * @type {Array<ScalewayIamV1alpha1PermissionSet>}
   * @memberof ScalewayIamV1alpha1ListPermissionSetsResponse
   */
  permission_sets?: Array<ScalewayIamV1alpha1PermissionSet>;
  /**
   * Total count of permission sets.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListPermissionSetsResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListPoliciesResponse
 */
export interface ScalewayIamV1alpha1ListPoliciesResponse {
  /**
   * List of policies.
   * @type {Array<ScalewayIamV1alpha1Policy>}
   * @memberof ScalewayIamV1alpha1ListPoliciesResponse
   */
  policies?: Array<ScalewayIamV1alpha1Policy>;
  /**
   * Total count of policies.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListPoliciesResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListQuotaResponse
 */
export interface ScalewayIamV1alpha1ListQuotaResponse {
  /**
   * List of quota.
   * @type {Array<ScalewayIamV1alpha1Quotum>}
   * @memberof ScalewayIamV1alpha1ListQuotaResponse
   */
  quota?: Array<ScalewayIamV1alpha1Quotum>;
  /**
   * Total count of quota.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListQuotaResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListRulesResponse
 */
export interface ScalewayIamV1alpha1ListRulesResponse {
  /**
   * Rules of the policy.
   * @type {Array<ScalewayIamV1alpha1Rule>}
   * @memberof ScalewayIamV1alpha1ListRulesResponse
   */
  rules?: Array<ScalewayIamV1alpha1Rule>;
  /**
   * Total count of rules.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListRulesResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListSSHKeysResponse
 */
export interface ScalewayIamV1alpha1ListSSHKeysResponse {
  /**
   * List of SSH keys.
   * @type {Array<ScalewayIamV1alpha1SSHKey>}
   * @memberof ScalewayIamV1alpha1ListSSHKeysResponse
   */
  ssh_keys?: Array<ScalewayIamV1alpha1SSHKey>;
  /**
   * Total count of SSH keys.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListSSHKeysResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListSamlCertificatesResponse
 */
export interface ScalewayIamV1alpha1ListSamlCertificatesResponse {
  /**
   * List of SAML certificates.
   * @type {Array<ScalewayIamV1alpha1SamlCertificate>}
   * @memberof ScalewayIamV1alpha1ListSamlCertificatesResponse
   */
  certificates?: Array<ScalewayIamV1alpha1SamlCertificate>;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ListUsersResponse
 */
export interface ScalewayIamV1alpha1ListUsersResponse {
  /**
   * List of users.
   * @type {Array<ScalewayIamV1alpha1User>}
   * @memberof ScalewayIamV1alpha1ListUsersResponse
   */
  users?: Array<ScalewayIamV1alpha1User>;
  /**
   * Total count of users.
   * @type {number}
   * @memberof ScalewayIamV1alpha1ListUsersResponse
   */
  total_count?: number;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1Log
 */
export interface ScalewayIamV1alpha1Log {
  /**
   * Log ID. (UUID format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Log
   */
  id?: string;
  /**
   * Creation date of the log. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Log
   */
  created_at?: string;
  /**
   * IP address of the HTTP request linked to the log. (IP address)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Log
   */
  ip?: string;
  /**
   * User-Agent of the HTTP request linked to the log.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Log
   */
  user_agent?: string;
  /**
   * Action linked to the log.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Log
   */
  action?: ScalewayIamV1alpha1LogActionEnum;
  /**
   * ID of the principal at the origin of the log. (UUID format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Log
   */
  bearer_id?: string;
  /**
   * ID of Organization linked to the log. (UUID format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Log
   */
  organization_id?: string;
  /**
   * Type of the resource linked to the log.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Log
   */
  resource_type?: ScalewayIamV1alpha1LogResourceTypeEnum;
  /**
   * ID of the resource linked  to the log.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Log
   */
  resource_id?: string;
}

export const ScalewayIamV1alpha1LogActionEnum = {
  UnknownAction: 'unknown_action',
  Created: 'created',
  Updated: 'updated',
  Deleted: 'deleted',
} as const;

export type ScalewayIamV1alpha1LogActionEnum =
  (typeof ScalewayIamV1alpha1LogActionEnum)[keyof typeof ScalewayIamV1alpha1LogActionEnum];
export const ScalewayIamV1alpha1LogResourceTypeEnum = {
  UnknownResourceType: 'unknown_resource_type',
  ApiKey: 'api_key',
  User: 'user',
  Application: 'application',
  Group: 'group',
  Policy: 'policy',
} as const;

export type ScalewayIamV1alpha1LogResourceTypeEnum =
  (typeof ScalewayIamV1alpha1LogResourceTypeEnum)[keyof typeof ScalewayIamV1alpha1LogResourceTypeEnum];

/**
 *
 * @export
 * @interface ScalewayIamV1alpha1MFAOTP
 */
export interface ScalewayIamV1alpha1MFAOTP {
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1MFAOTP
   */
  secret?: string;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1Organization
 */
export interface ScalewayIamV1alpha1Organization {
  /**
   * ID of the Organization.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Organization
   */
  id?: string;
  /**
   * Name of the Organization.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Organization
   */
  name?: string;
  /**
   * Alias of the Organization.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Organization
   */
  alias?: string;
  /**
   * Defines whether login with a password is enabled for the Organization.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Organization
   */
  login_password_enabled?: boolean;
  /**
   * Defines whether login with an authentication code is enabled for the Organization.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Organization
   */
  login_magic_code_enabled?: boolean;
  /**
   * Defines whether login through OAuth2 is enabled for the Organization.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Organization
   */
  login_oauth2_enabled?: boolean;
  /**
   * Defines whether login through SAML is enabled for the Organization.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Organization
   */
  login_saml_enabled?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1OrganizationSecuritySettings
 */
export interface ScalewayIamV1alpha1OrganizationSecuritySettings {
  /**
   * Defines whether password renewal is enforced during first login.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1OrganizationSecuritySettings
   */
  enforce_password_renewal?: boolean;
  /**
   * Duration of the grace period to renew password or enable MFA. (in seconds)
   * @type {string}
   * @memberof ScalewayIamV1alpha1OrganizationSecuritySettings
   */
  grace_period_duration?: string;
  /**
   * Number of login attempts before the account is locked.
   * @type {number}
   * @memberof ScalewayIamV1alpha1OrganizationSecuritySettings
   */
  login_attempts_before_locked?: number;
  /**
   * Maximum duration a login session will stay active before needing to relogin. (in seconds)
   * @type {string}
   * @memberof ScalewayIamV1alpha1OrganizationSecuritySettings
   */
  max_login_session_duration?: string;
  /**
   * Maximum duration the `expires_at` field of an API key can represent. A value of 0 means there is no maximum duration. (in seconds)
   * @type {string}
   * @memberof ScalewayIamV1alpha1OrganizationSecuritySettings
   */
  max_api_key_expiration_duration?: string;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1PermissionSet
 */
export interface ScalewayIamV1alpha1PermissionSet {
  /**
   * Id of the permission set.
   * @type {string}
   * @memberof ScalewayIamV1alpha1PermissionSet
   */
  id?: string;
  /**
   * Name of the permission set.
   * @type {string}
   * @memberof ScalewayIamV1alpha1PermissionSet
   */
  name?: string;
  /**
   * Scope of the permission set.
   * @type {string}
   * @memberof ScalewayIamV1alpha1PermissionSet
   */
  scope_type?: ScalewayIamV1alpha1PermissionSetScopeTypeEnum;
  /**
   * Description of the permission set.
   * @type {string}
   * @memberof ScalewayIamV1alpha1PermissionSet
   */
  description?: string;
  /**
   * Categories of the permission set.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1PermissionSet
   */
  categories?: Array<string>;
}

export const ScalewayIamV1alpha1PermissionSetScopeTypeEnum = {
  UnknownScopeType: 'unknown_scope_type',
  Projects: 'projects',
  Organization: 'organization',
  AccountRootUser: 'account_root_user',
} as const;

export type ScalewayIamV1alpha1PermissionSetScopeTypeEnum =
  (typeof ScalewayIamV1alpha1PermissionSetScopeTypeEnum)[keyof typeof ScalewayIamV1alpha1PermissionSetScopeTypeEnum];

/**
 *
 * @export
 * @interface ScalewayIamV1alpha1Policy
 */
export interface ScalewayIamV1alpha1Policy {
  /**
   * Id of the policy.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Policy
   */
  id?: string;
  /**
   * Name of the policy.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Policy
   */
  name?: string;
  /**
   * Description of the policy.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Policy
   */
  description?: string;
  /**
   * Organization ID of the policy.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Policy
   */
  organization_id?: string;
  /**
   * Date and time of policy creation. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Policy
   */
  created_at?: string;
  /**
   * Date and time of last policy update. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1Policy
   */
  updated_at?: string;
  /**
   * Defines whether or not a policy is editable.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Policy
   */
  editable?: boolean;
  /**
   * Defines whether or not a policy is deletable.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Policy
   */
  deletable?: boolean;
  /**
   * Defines whether or not a policy is managed.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Policy
   */
  managed?: boolean;
  /**
   * Number of rules of the policy.
   * @type {number}
   * @memberof ScalewayIamV1alpha1Policy
   */
  nb_rules?: number;
  /**
   * Number of policy scopes.
   * @type {number}
   * @memberof ScalewayIamV1alpha1Policy
   */
  nb_scopes?: number;
  /**
   * Number of permission sets of the policy.
   * @type {number}
   * @memberof ScalewayIamV1alpha1Policy
   */
  nb_permission_sets?: number;
  /**
   * Tags associated with the policy.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1Policy
   */
  tags?: Array<string>;
  /**
   * ID of the user attributed to the policy.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Policy
   */
  user_id?: string;
  /**
   * ID of the group attributed to the policy.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Policy
   */
  group_id?: string;
  /**
   * ID of the application attributed to the policy.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Policy
   */
  application_id?: string;
  /**
   * Defines whether or not a policy is attributed to a principal.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Policy
   */
  no_principal?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1Quotum
 */
export interface ScalewayIamV1alpha1Quotum {
  /**
   * Name of the quota.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Quotum
   */
  name?: string;
  /**
   * Maximum limit of the quota.
   * @type {number}
   * @memberof ScalewayIamV1alpha1Quotum
   * @deprecated
   */
  limit?: number;
  /**
   * Defines whether or not the quota is unlimited.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1Quotum
   * @deprecated
   */
  unlimited?: boolean;
  /**
   * A human-readable name for the quota.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Quotum
   */
  pretty_name?: string;
  /**
   * The unit in which the quota is expressed.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Quotum
   */
  unit?: string;
  /**
   * Details about the quota.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Quotum
   */
  description?: string;
  /**
   * Whether this quotum is applied on at the zone level, region level, or globally.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Quotum
   */
  locality_type?: ScalewayIamV1alpha1QuotumLocalityTypeEnum;
  /**
   * Limits per locality.
   * @type {Array<ScalewayIamV1alpha1QuotumLimit>}
   * @memberof ScalewayIamV1alpha1Quotum
   */
  limits?: Array<ScalewayIamV1alpha1QuotumLimit>;
}

export const ScalewayIamV1alpha1QuotumLocalityTypeEnum = {
  Global: 'global',
  Region: 'region',
  Zone: 'zone',
} as const;

export type ScalewayIamV1alpha1QuotumLocalityTypeEnum =
  (typeof ScalewayIamV1alpha1QuotumLocalityTypeEnum)[keyof typeof ScalewayIamV1alpha1QuotumLocalityTypeEnum];

/**
 *
 * @export
 * @interface ScalewayIamV1alpha1QuotumLimit
 */
export interface ScalewayIamV1alpha1QuotumLimit {
  /**
   * Whether or not the limit is applied globally.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1QuotumLimit
   */
  global?: boolean;
  /**
   * The region on which the limit is applied.
   * @type {string}
   * @memberof ScalewayIamV1alpha1QuotumLimit
   */
  region?: string;
  /**
   * The zone on which the limit is applied.
   * @type {string}
   * @memberof ScalewayIamV1alpha1QuotumLimit
   */
  zone?: string;
  /**
   * Maximum locality limit.
   * @type {number}
   * @memberof ScalewayIamV1alpha1QuotumLimit
   */
  limit?: number;
  /**
   * Whether or not the quota per locality is unlimited.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1QuotumLimit
   */
  unlimited?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1Rule
 */
export interface ScalewayIamV1alpha1Rule {
  /**
   * Id of rule.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Rule
   */
  id?: string;
  /**
   * Names of permission sets bound to the rule.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1Rule
   */
  permission_set_names?: Array<string>;
  /**
   * Permission_set_names have the same scope_type.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Rule
   */
  permission_sets_scope_type?: ScalewayIamV1alpha1RulePermissionSetsScopeTypeEnum;
  /**
   * Condition expression to evaluate.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Rule
   */
  condition?: string;
  /**
   * List of Project IDs the rule is scoped to.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1Rule
   */
  project_ids?: Array<string>;
  /**
   * ID of Organization the rule is scoped to.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Rule
   */
  organization_id?: string;
  /**
   * ID of account root user the rule is scoped to.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Rule
   */
  account_root_user_id?: string;
}

export const ScalewayIamV1alpha1RulePermissionSetsScopeTypeEnum = {
  UnknownScopeType: 'unknown_scope_type',
  Projects: 'projects',
  Organization: 'organization',
  AccountRootUser: 'account_root_user',
} as const;

export type ScalewayIamV1alpha1RulePermissionSetsScopeTypeEnum =
  (typeof ScalewayIamV1alpha1RulePermissionSetsScopeTypeEnum)[keyof typeof ScalewayIamV1alpha1RulePermissionSetsScopeTypeEnum];

/**
 *
 * @export
 * @interface ScalewayIamV1alpha1RuleSpecs
 */
export interface ScalewayIamV1alpha1RuleSpecs {
  /**
   * Names of permission sets bound to the rule.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1RuleSpecs
   */
  permission_set_names?: Array<string>;
  /**
   * Condition expression to evaluate.
   * @type {string}
   * @memberof ScalewayIamV1alpha1RuleSpecs
   */
  condition?: string;
  /**
   * List of Project IDs the rule is scoped to.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1RuleSpecs
   */
  project_ids?: Array<string>;
  /**
   * ID of Organization the rule is scoped to.
   * @type {string}
   * @memberof ScalewayIamV1alpha1RuleSpecs
   */
  organization_id?: string;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1SSHKey
 */
export interface ScalewayIamV1alpha1SSHKey {
  /**
   * ID of SSH key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SSHKey
   */
  id?: string;
  /**
   * Name of SSH key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SSHKey
   */
  name?: string;
  /**
   * Public key of SSH key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SSHKey
   */
  public_key?: string;
  /**
   * Fingerprint of the SSH key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SSHKey
   */
  fingerprint?: string;
  /**
   * Creation date of SSH key. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1SSHKey
   */
  created_at?: string;
  /**
   * Last update date of SSH key. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1SSHKey
   */
  updated_at?: string;
  /**
   * ID of Organization linked to the SSH key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SSHKey
   */
  organization_id?: string;
  /**
   * ID of Project linked to the SSH key.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SSHKey
   */
  project_id?: string;
  /**
   * SSH key status.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1SSHKey
   */
  disabled?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1Saml
 */
export interface ScalewayIamV1alpha1Saml {
  /**
   * ID of the SAML configuration.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Saml
   */
  id?: string;
  /**
   * Status of the SAML configuration.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Saml
   */
  status?: ScalewayIamV1alpha1SamlStatusEnum;
  /**
   *
   * @type {ScalewayIamV1alpha1SamlServiceProvider}
   * @memberof ScalewayIamV1alpha1Saml
   */
  service_provider?: ScalewayIamV1alpha1SamlServiceProvider;
  /**
   * Entity ID of the SAML Identity Provider.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Saml
   */
  entity_id?: string;
  /**
   * Single Sign-On URL of the SAML Identity Provider.
   * @type {string}
   * @memberof ScalewayIamV1alpha1Saml
   */
  single_sign_on_url?: string;
}

export const ScalewayIamV1alpha1SamlStatusEnum = {
  UnknownSamlStatus: 'unknown_saml_status',
  Valid: 'valid',
  MissingCertificate: 'missing_certificate',
  MissingEntityId: 'missing_entity_id',
  MissingSingleSignOnUrl: 'missing_single_sign_on_url',
} as const;

export type ScalewayIamV1alpha1SamlStatusEnum =
  (typeof ScalewayIamV1alpha1SamlStatusEnum)[keyof typeof ScalewayIamV1alpha1SamlStatusEnum];

/**
 *
 * @export
 * @interface ScalewayIamV1alpha1SamlCertificate
 */
export interface ScalewayIamV1alpha1SamlCertificate {
  /**
   * ID of the SAML certificate.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SamlCertificate
   */
  id?: string;
  /**
   * Type of the SAML certificate.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SamlCertificate
   */
  type?: ScalewayIamV1alpha1SamlCertificateTypeEnum;
  /**
   * Origin of the SAML certificate.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SamlCertificate
   */
  origin?: ScalewayIamV1alpha1SamlCertificateOriginEnum;
  /**
   * Content of the SAML certificate.
   * @type {string}
   * @memberof ScalewayIamV1alpha1SamlCertificate
   */
  content?: string;
  /**
   * Date and time of the SAML certificate expiration. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1SamlCertificate
   */
  expires_at?: string;
}

export const ScalewayIamV1alpha1SamlCertificateTypeEnum = {
  UnknownCertificateType: 'unknown_certificate_type',
  Signing: 'signing',
  Encryption: 'encryption',
} as const;

export type ScalewayIamV1alpha1SamlCertificateTypeEnum =
  (typeof ScalewayIamV1alpha1SamlCertificateTypeEnum)[keyof typeof ScalewayIamV1alpha1SamlCertificateTypeEnum];
export const ScalewayIamV1alpha1SamlCertificateOriginEnum = {
  UnknownCertificateOrigin: 'unknown_certificate_origin',
  Scaleway: 'scaleway',
  IdentityProvider: 'identity_provider',
} as const;

export type ScalewayIamV1alpha1SamlCertificateOriginEnum =
  (typeof ScalewayIamV1alpha1SamlCertificateOriginEnum)[keyof typeof ScalewayIamV1alpha1SamlCertificateOriginEnum];

/**
 * Service Provider information.
 * @export
 * @interface ScalewayIamV1alpha1SamlServiceProvider
 */
export interface ScalewayIamV1alpha1SamlServiceProvider {
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1SamlServiceProvider
   */
  entity_id?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayIamV1alpha1SamlServiceProvider
   */
  assertion_consumer_service_url?: string;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1SetRulesResponse
 */
export interface ScalewayIamV1alpha1SetRulesResponse {
  /**
   * Rules of the policy.
   * @type {Array<ScalewayIamV1alpha1Rule>}
   * @memberof ScalewayIamV1alpha1SetRulesResponse
   */
  rules?: Array<ScalewayIamV1alpha1Rule>;
}
/**
 *
 * @export
 * @interface ScalewayIamV1alpha1User
 */
export interface ScalewayIamV1alpha1User {
  /**
   * ID of user.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  id?: string;
  /**
   * Email of user.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  email?: string;
  /**
   * User identifier unique to the Organization.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  username?: string;
  /**
   * First name of the user.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  first_name?: string;
  /**
   * Last name of the user.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  last_name?: string;
  /**
   * Phone number of the user.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  phone_number?: string;
  /**
   * Locale of the user.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  locale?: string;
  /**
   * Date user was created. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  created_at?: string;
  /**
   * Date of last user update. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  updated_at?: string;
  /**
   * ID of the Organization.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  organization_id?: string;
  /**
   * Deletion status of user. Owners cannot be deleted.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1User
   */
  deletable?: boolean;
  /**
   * Date of the last login. (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  last_login_at?: string;
  /**
   * Type of user.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  type?: ScalewayIamV1alpha1UserTypeEnum;
  /**
   * Deprecated, use \"mfa\" instead.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1User
   * @deprecated
   */
  two_factor_enabled?: boolean;
  /**
   * Status of user invitation.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   * @deprecated
   */
  status?: ScalewayIamV1alpha1UserStatusEnum;
  /**
   * Defines whether MFA is enabled.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1User
   */
  mfa?: boolean;
  /**
   * ID of the account root user associated with the user.
   * @type {string}
   * @memberof ScalewayIamV1alpha1User
   */
  account_root_user_id?: string;
  /**
   * Tags associated with the user.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1User
   */
  tags?: Array<string>;
  /**
   * Defines whether the user is locked.
   * @type {boolean}
   * @memberof ScalewayIamV1alpha1User
   */
  locked?: boolean;
}

export const ScalewayIamV1alpha1UserTypeEnum = {
  UnknownType: 'unknown_type',
  Owner: 'owner',
  Member: 'member',
} as const;

export type ScalewayIamV1alpha1UserTypeEnum =
  (typeof ScalewayIamV1alpha1UserTypeEnum)[keyof typeof ScalewayIamV1alpha1UserTypeEnum];
export const ScalewayIamV1alpha1UserStatusEnum = {
  UnknownStatus: 'unknown_status',
  InvitationPending: 'invitation_pending',
  Activated: 'activated',
} as const;

export type ScalewayIamV1alpha1UserStatusEnum =
  (typeof ScalewayIamV1alpha1UserStatusEnum)[keyof typeof ScalewayIamV1alpha1UserStatusEnum];

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayIamV1alpha1UserType = {
  UnknownType: 'unknown_type',
  Owner: 'owner',
  Member: 'member',
} as const;

export type ScalewayIamV1alpha1UserType =
  (typeof ScalewayIamV1alpha1UserType)[keyof typeof ScalewayIamV1alpha1UserType];

/**
 *
 * @export
 * @interface ScalewayIamV1alpha1ValidateUserMFAOTPResponse
 */
export interface ScalewayIamV1alpha1ValidateUserMFAOTPResponse {
  /**
   * List of recovery codes usable for this OTP method.
   * @type {Array<string>}
   * @memberof ScalewayIamV1alpha1ValidateUserMFAOTPResponse
   */
  recovery_codes?: Array<string>;
}
/**
 *
 * @export
 * @interface SetGroupMembersRequest
 */
export interface SetGroupMembersRequest {
  /**
   *
   * @type {Array<string>}
   * @memberof SetGroupMembersRequest
   */
  user_ids: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof SetGroupMembersRequest
   */
  application_ids: Array<string>;
}
/**
 *
 * @export
 * @interface SetOrganizationAliasRequest
 */
export interface SetOrganizationAliasRequest {
  /**
   * Alias of the Organization.
   * @type {string}
   * @memberof SetOrganizationAliasRequest
   */
  alias?: string;
}
/**
 *
 * @export
 * @interface SetRulesRequest
 */
export interface SetRulesRequest {
  /**
   * Id of policy to update.
   * @type {string}
   * @memberof SetRulesRequest
   */
  policy_id: string;
  /**
   * Rules of the policy to set.
   * @type {Array<ScalewayIamV1alpha1RuleSpecs>}
   * @memberof SetRulesRequest
   */
  rules: Array<ScalewayIamV1alpha1RuleSpecs>;
}
/**
 *
 * @export
 * @interface UpdateAPIKeyRequest
 */
export interface UpdateAPIKeyRequest {
  /**
   * New default Project ID to set.
   * @type {string}
   * @memberof UpdateAPIKeyRequest
   */
  default_project_id?: string;
  /**
   * New description to update.
   * @type {string}
   * @memberof UpdateAPIKeyRequest
   */
  description?: string;
  /**
   * New expiration date of the API key. (RFC 3339 format)
   * @type {string}
   * @memberof UpdateAPIKeyRequest
   */
  expires_at?: string;
}
/**
 *
 * @export
 * @interface UpdateApplicationRequest
 */
export interface UpdateApplicationRequest {
  /**
   * New name for the application (max length is 64 chars).
   * @type {string}
   * @memberof UpdateApplicationRequest
   */
  name?: string;
  /**
   * New description for the application (max length is 200 chars).
   * @type {string}
   * @memberof UpdateApplicationRequest
   */
  description?: string;
  /**
   * New tags for the application (maximum of 10 tags).
   * @type {Array<string>}
   * @memberof UpdateApplicationRequest
   */
  tags?: Array<string>;
}
/**
 *
 * @export
 * @interface UpdateGroupRequest
 */
export interface UpdateGroupRequest {
  /**
   * New name for the group (max length is 64 chars). MUST be unique inside an Organization.
   * @type {string}
   * @memberof UpdateGroupRequest
   */
  name?: string;
  /**
   * New description for the group (max length is 200 chars).
   * @type {string}
   * @memberof UpdateGroupRequest
   */
  description?: string;
  /**
   * New tags for the group (maximum of 10 tags).
   * @type {Array<string>}
   * @memberof UpdateGroupRequest
   */
  tags?: Array<string>;
}
/**
 *
 * @export
 * @interface UpdateOrganizationLoginMethodsRequest
 */
export interface UpdateOrganizationLoginMethodsRequest {
  /**
   * Defines whether login with a password is enabled for the Organization.
   * @type {boolean}
   * @memberof UpdateOrganizationLoginMethodsRequest
   */
  login_password_enabled?: boolean;
  /**
   * Defines whether login through OAuth2 is enabled for the Organization.
   * @type {boolean}
   * @memberof UpdateOrganizationLoginMethodsRequest
   */
  login_oauth2_enabled?: boolean;
  /**
   * Defines whether login with an authentication code is enabled for the Organization.
   * @type {boolean}
   * @memberof UpdateOrganizationLoginMethodsRequest
   */
  login_magic_code_enabled?: boolean;
  /**
   * Defines whether login through SAML is enabled for the Organization.
   * @type {boolean}
   * @memberof UpdateOrganizationLoginMethodsRequest
   */
  login_saml_enabled?: boolean;
}
/**
 *
 * @export
 * @interface UpdateOrganizationSecuritySettingsRequest
 */
export interface UpdateOrganizationSecuritySettingsRequest {
  /**
   * Defines whether password renewal is enforced during first login.
   * @type {boolean}
   * @memberof UpdateOrganizationSecuritySettingsRequest
   */
  enforce_password_renewal?: boolean;
  /**
   * Duration of the grace period to renew password or enable MFA. (in seconds)
   * @type {string}
   * @memberof UpdateOrganizationSecuritySettingsRequest
   */
  grace_period_duration?: string;
  /**
   * Number of login attempts before the account is locked.
   * @type {number}
   * @memberof UpdateOrganizationSecuritySettingsRequest
   */
  login_attempts_before_locked?: number;
  /**
   * Maximum duration a login session will stay active before needing to relogin. (in seconds)
   * @type {string}
   * @memberof UpdateOrganizationSecuritySettingsRequest
   */
  max_login_session_duration?: string;
  /**
   * Maximum duration the `expires_at` field of an API key can represent. A value of 0 means there is no maximum duration. (in seconds)
   * @type {string}
   * @memberof UpdateOrganizationSecuritySettingsRequest
   */
  max_api_key_expiration_duration?: string;
}
/**
 *
 * @export
 * @interface UpdatePolicyRequest
 */
export interface UpdatePolicyRequest {
  /**
   * New name for the policy (max length is 64 characters).
   * @type {string}
   * @memberof UpdatePolicyRequest
   */
  name?: string;
  /**
   * New description of policy (max length is 200 characters).
   * @type {string}
   * @memberof UpdatePolicyRequest
   */
  description?: string;
  /**
   * New tags for the policy (maximum of 10 tags).
   * @type {Array<string>}
   * @memberof UpdatePolicyRequest
   */
  tags?: Array<string>;
  /**
   * New ID of user attributed to the policy.
   * @type {string}
   * @memberof UpdatePolicyRequest
   */
  user_id?: string;
  /**
   * New ID of group attributed to the policy.
   * @type {string}
   * @memberof UpdatePolicyRequest
   */
  group_id?: string;
  /**
   * New ID of application attributed to the policy.
   * @type {string}
   * @memberof UpdatePolicyRequest
   */
  application_id?: string;
  /**
   * Defines whether or not the policy is attributed to a principal.
   * @type {boolean}
   * @memberof UpdatePolicyRequest
   */
  no_principal?: boolean;
}
/**
 *
 * @export
 * @interface UpdateSSHKeyRequest
 */
export interface UpdateSSHKeyRequest {
  /**
   * Name of the SSH key. Max length is 1000.
   * @type {string}
   * @memberof UpdateSSHKeyRequest
   */
  name?: string;
  /**
   * Enable or disable the SSH key.
   * @type {boolean}
   * @memberof UpdateSSHKeyRequest
   */
  disabled?: boolean;
}
/**
 *
 * @export
 * @interface UpdateSamlRequest
 */
export interface UpdateSamlRequest {
  /**
   * Entity ID of the SAML Identity Provider.
   * @type {string}
   * @memberof UpdateSamlRequest
   */
  entity_id?: string;
  /**
   * Single Sign-On URL of the SAML Identity Provider.
   * @type {string}
   * @memberof UpdateSamlRequest
   */
  single_sign_on_url?: string;
}
/**
 *
 * @export
 * @interface UpdateUserPasswordRequest
 */
export interface UpdateUserPasswordRequest {
  /**
   * The new password.
   * @type {string}
   * @memberof UpdateUserPasswordRequest
   */
  password: string;
}
/**
 *
 * @export
 * @interface UpdateUserRequest
 */
export interface UpdateUserRequest {
  /**
   * New tags for the user (maximum of 10 tags).
   * @type {Array<string>}
   * @memberof UpdateUserRequest
   */
  tags?: Array<string>;
  /**
   * IAM member email.
   * @type {string}
   * @memberof UpdateUserRequest
   */
  email?: string;
  /**
   * IAM member first name.
   * @type {string}
   * @memberof UpdateUserRequest
   */
  first_name?: string;
  /**
   * IAM member last name.
   * @type {string}
   * @memberof UpdateUserRequest
   */
  last_name?: string;
  /**
   * IAM member phone number.
   * @type {string}
   * @memberof UpdateUserRequest
   */
  phone_number?: string;
  /**
   * IAM member locale.
   * @type {string}
   * @memberof UpdateUserRequest
   */
  locale?: string;
}
/**
 *
 * @export
 * @interface UpdateUserUsernameRequest
 */
export interface UpdateUserUsernameRequest {
  /**
   * The new username.
   * @type {string}
   * @memberof UpdateUserUsernameRequest
   */
  username: string;
}
/**
 *
 * @export
 * @interface ValidateUserMFAOTPRequest
 */
export interface ValidateUserMFAOTPRequest {
  /**
   * A password generated using the OTP.
   * @type {string}
   * @memberof ValidateUserMFAOTPRequest
   */
  one_time_password?: string;
}

/**
 * APIKeysApi - axios parameter creator
 * @export
 */
export const APIKeysApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create an API key. You must specify the `application_id` or the `user_id` and the description. You can also specify the `default_project_id`, which is the Project ID of your preferred Project, to use with Object Storage. The `access_key` and `secret_key` values are returned in the response. Note that the secret key is only shown once. Make sure that you copy and store both keys somewhere safe.
     * @summary Create an API key
     * @param {CreateAPIKeyRequest} createAPIKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createAPIKey: async (
      createAPIKeyRequest: CreateAPIKeyRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'createAPIKeyRequest' is not null or undefined
      assertParamExists(
        'createAPIKey',
        'createAPIKeyRequest',
        createAPIKeyRequest,
      );
      const localVarPath = `/iam/v1alpha1/api-keys`;
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
        createAPIKeyRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete an API key. Note that this action is irreversible and cannot be undone. Make sure you update any configurations using the API keys you delete.
     * @summary Delete an API key
     * @param {string} accessKey Access key to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteAPIKey: async (
      accessKey: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'accessKey' is not null or undefined
      assertParamExists('deleteAPIKey', 'accessKey', accessKey);
      const localVarPath = `/iam/v1alpha1/api-keys/{access_key}`.replace(
        `{${'access_key'}}`,
        encodeURIComponent(String(accessKey)),
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
     * Retrieve information about an API key, specified by the `access_key` parameter. The API key\'s details, including either the `user_id` or `application_id` of its bearer are returned in the response. Note that the string value for the `secret_key` is nullable, and therefore is not displayed in the response. The `secret_key` value is only displayed upon API key creation.
     * @summary Get an API key
     * @param {string} accessKey Access key to search for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getAPIKey: async (
      accessKey: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'accessKey' is not null or undefined
      assertParamExists('getAPIKey', 'accessKey', accessKey);
      const localVarPath = `/iam/v1alpha1/api-keys/{access_key}`.replace(
        `{${'access_key'}}`,
        encodeURIComponent(String(accessKey)),
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
     * List API keys. By default, the API keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `editable`, `expired`, `access_key` and `bearer_id`.
     * @summary List API keys
     * @param {ListAPIKeysOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [page] Page number. Value must be greater or equal to 1.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {string} [organizationId] ID of Organization.
     * @param {boolean} [editable] Defines whether to filter out editable API keys or not.
     * @param {boolean} [expired] Defines whether to filter out expired API keys or not.
     * @param {string} [accessKey] Filter by access key (deprecated in favor of &#x60;access_keys&#x60;).
     * @param {string} [description] Filter by description.
     * @param {string} [bearerId] Filter by bearer ID.
     * @param {ListAPIKeysBearerTypeEnum} [bearerType] Filter by type of bearer.
     * @param {Array<string>} [accessKeys] Filter by a list of access keys.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listAPIKeys: async (
      orderBy?: ListAPIKeysOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      editable?: boolean,
      expired?: boolean,
      accessKey?: string,
      description?: string,
      bearerId?: string,
      bearerType?: ListAPIKeysBearerTypeEnum,
      accessKeys?: Array<string>,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/api-keys`;
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

      if (editable !== undefined) {
        localVarQueryParameter['editable'] = editable;
      }

      if (expired !== undefined) {
        localVarQueryParameter['expired'] = expired;
      }

      if (accessKey !== undefined) {
        localVarQueryParameter['access_key'] = accessKey;
      }

      if (description !== undefined) {
        localVarQueryParameter['description'] = description;
      }

      if (bearerId !== undefined) {
        localVarQueryParameter['bearer_id'] = bearerId;
      }

      if (bearerType !== undefined) {
        localVarQueryParameter['bearer_type'] = bearerType;
      }

      if (accessKeys) {
        localVarQueryParameter['access_keys'] = accessKeys;
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
     * Update the parameters of an API key, including `default_project_id` and `description`.
     * @summary Update an API key
     * @param {string} accessKey Access key to update.
     * @param {UpdateAPIKeyRequest} updateAPIKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateAPIKey: async (
      accessKey: string,
      updateAPIKeyRequest: UpdateAPIKeyRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'accessKey' is not null or undefined
      assertParamExists('updateAPIKey', 'accessKey', accessKey);
      // verify required parameter 'updateAPIKeyRequest' is not null or undefined
      assertParamExists(
        'updateAPIKey',
        'updateAPIKeyRequest',
        updateAPIKeyRequest,
      );
      const localVarPath = `/iam/v1alpha1/api-keys/{access_key}`.replace(
        `{${'access_key'}}`,
        encodeURIComponent(String(accessKey)),
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
        updateAPIKeyRequest,
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
 * APIKeysApi - functional programming interface
 * @export
 */
export const APIKeysApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = APIKeysApiAxiosParamCreator(configuration);
  return {
    /**
     * Create an API key. You must specify the `application_id` or the `user_id` and the description. You can also specify the `default_project_id`, which is the Project ID of your preferred Project, to use with Object Storage. The `access_key` and `secret_key` values are returned in the response. Note that the secret key is only shown once. Make sure that you copy and store both keys somewhere safe.
     * @summary Create an API key
     * @param {CreateAPIKeyRequest} createAPIKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createAPIKey(
      createAPIKeyRequest: CreateAPIKeyRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1APIKey>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createAPIKey(
        createAPIKeyRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['APIKeysApi.createAPIKey']?.[
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
     * Delete an API key. Note that this action is irreversible and cannot be undone. Make sure you update any configurations using the API keys you delete.
     * @summary Delete an API key
     * @param {string} accessKey Access key to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteAPIKey(
      accessKey: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteAPIKey(
        accessKey,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['APIKeysApi.deleteAPIKey']?.[
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
     * Retrieve information about an API key, specified by the `access_key` parameter. The API key\'s details, including either the `user_id` or `application_id` of its bearer are returned in the response. Note that the string value for the `secret_key` is nullable, and therefore is not displayed in the response. The `secret_key` value is only displayed upon API key creation.
     * @summary Get an API key
     * @param {string} accessKey Access key to search for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getAPIKey(
      accessKey: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1APIKey>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getAPIKey(
        accessKey,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['APIKeysApi.getAPIKey']?.[
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
     * List API keys. By default, the API keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `editable`, `expired`, `access_key` and `bearer_id`.
     * @summary List API keys
     * @param {ListAPIKeysOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [page] Page number. Value must be greater or equal to 1.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {string} [organizationId] ID of Organization.
     * @param {boolean} [editable] Defines whether to filter out editable API keys or not.
     * @param {boolean} [expired] Defines whether to filter out expired API keys or not.
     * @param {string} [accessKey] Filter by access key (deprecated in favor of &#x60;access_keys&#x60;).
     * @param {string} [description] Filter by description.
     * @param {string} [bearerId] Filter by bearer ID.
     * @param {ListAPIKeysBearerTypeEnum} [bearerType] Filter by type of bearer.
     * @param {Array<string>} [accessKeys] Filter by a list of access keys.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listAPIKeys(
      orderBy?: ListAPIKeysOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      editable?: boolean,
      expired?: boolean,
      accessKey?: string,
      description?: string,
      bearerId?: string,
      bearerType?: ListAPIKeysBearerTypeEnum,
      accessKeys?: Array<string>,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListAPIKeysResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listAPIKeys(
        orderBy,
        page,
        pageSize,
        organizationId,
        editable,
        expired,
        accessKey,
        description,
        bearerId,
        bearerType,
        accessKeys,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['APIKeysApi.listAPIKeys']?.[
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
     * Update the parameters of an API key, including `default_project_id` and `description`.
     * @summary Update an API key
     * @param {string} accessKey Access key to update.
     * @param {UpdateAPIKeyRequest} updateAPIKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateAPIKey(
      accessKey: string,
      updateAPIKeyRequest: UpdateAPIKeyRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1APIKey>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateAPIKey(
        accessKey,
        updateAPIKeyRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['APIKeysApi.updateAPIKey']?.[
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
 * APIKeysApi - factory interface
 * @export
 */
export const APIKeysApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = APIKeysApiFp(configuration);
  return {
    /**
     * Create an API key. You must specify the `application_id` or the `user_id` and the description. You can also specify the `default_project_id`, which is the Project ID of your preferred Project, to use with Object Storage. The `access_key` and `secret_key` values are returned in the response. Note that the secret key is only shown once. Make sure that you copy and store both keys somewhere safe.
     * @summary Create an API key
     * @param {CreateAPIKeyRequest} createAPIKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createAPIKey(
      createAPIKeyRequest: CreateAPIKeyRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1APIKey> {
      return localVarFp
        .createAPIKey(createAPIKeyRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete an API key. Note that this action is irreversible and cannot be undone. Make sure you update any configurations using the API keys you delete.
     * @summary Delete an API key
     * @param {string} accessKey Access key to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteAPIKey(
      accessKey: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteAPIKey(accessKey, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve information about an API key, specified by the `access_key` parameter. The API key\'s details, including either the `user_id` or `application_id` of its bearer are returned in the response. Note that the string value for the `secret_key` is nullable, and therefore is not displayed in the response. The `secret_key` value is only displayed upon API key creation.
     * @summary Get an API key
     * @param {string} accessKey Access key to search for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getAPIKey(
      accessKey: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1APIKey> {
      return localVarFp
        .getAPIKey(accessKey, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List API keys. By default, the API keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `editable`, `expired`, `access_key` and `bearer_id`.
     * @summary List API keys
     * @param {ListAPIKeysOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [page] Page number. Value must be greater or equal to 1.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {string} [organizationId] ID of Organization.
     * @param {boolean} [editable] Defines whether to filter out editable API keys or not.
     * @param {boolean} [expired] Defines whether to filter out expired API keys or not.
     * @param {string} [accessKey] Filter by access key (deprecated in favor of &#x60;access_keys&#x60;).
     * @param {string} [description] Filter by description.
     * @param {string} [bearerId] Filter by bearer ID.
     * @param {ListAPIKeysBearerTypeEnum} [bearerType] Filter by type of bearer.
     * @param {Array<string>} [accessKeys] Filter by a list of access keys.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listAPIKeys(
      orderBy?: ListAPIKeysOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      editable?: boolean,
      expired?: boolean,
      accessKey?: string,
      description?: string,
      bearerId?: string,
      bearerType?: ListAPIKeysBearerTypeEnum,
      accessKeys?: Array<string>,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListAPIKeysResponse> {
      return localVarFp
        .listAPIKeys(
          orderBy,
          page,
          pageSize,
          organizationId,
          editable,
          expired,
          accessKey,
          description,
          bearerId,
          bearerType,
          accessKeys,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the parameters of an API key, including `default_project_id` and `description`.
     * @summary Update an API key
     * @param {string} accessKey Access key to update.
     * @param {UpdateAPIKeyRequest} updateAPIKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateAPIKey(
      accessKey: string,
      updateAPIKeyRequest: UpdateAPIKeyRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1APIKey> {
      return localVarFp
        .updateAPIKey(accessKey, updateAPIKeyRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * APIKeysApi - interface
 * @export
 * @interface APIKeysApi
 */
export interface APIKeysApiInterface {
  /**
   * Create an API key. You must specify the `application_id` or the `user_id` and the description. You can also specify the `default_project_id`, which is the Project ID of your preferred Project, to use with Object Storage. The `access_key` and `secret_key` values are returned in the response. Note that the secret key is only shown once. Make sure that you copy and store both keys somewhere safe.
   * @summary Create an API key
   * @param {CreateAPIKeyRequest} createAPIKeyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApiInterface
   */
  createAPIKey(
    createAPIKeyRequest: CreateAPIKeyRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1APIKey>;

  /**
   * Delete an API key. Note that this action is irreversible and cannot be undone. Make sure you update any configurations using the API keys you delete.
   * @summary Delete an API key
   * @param {string} accessKey Access key to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApiInterface
   */
  deleteAPIKey(
    accessKey: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Retrieve information about an API key, specified by the `access_key` parameter. The API key\'s details, including either the `user_id` or `application_id` of its bearer are returned in the response. Note that the string value for the `secret_key` is nullable, and therefore is not displayed in the response. The `secret_key` value is only displayed upon API key creation.
   * @summary Get an API key
   * @param {string} accessKey Access key to search for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApiInterface
   */
  getAPIKey(
    accessKey: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1APIKey>;

  /**
   * List API keys. By default, the API keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `editable`, `expired`, `access_key` and `bearer_id`.
   * @summary List API keys
   * @param {ListAPIKeysOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [page] Page number. Value must be greater or equal to 1.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {string} [organizationId] ID of Organization.
   * @param {boolean} [editable] Defines whether to filter out editable API keys or not.
   * @param {boolean} [expired] Defines whether to filter out expired API keys or not.
   * @param {string} [accessKey] Filter by access key (deprecated in favor of &#x60;access_keys&#x60;).
   * @param {string} [description] Filter by description.
   * @param {string} [bearerId] Filter by bearer ID.
   * @param {ListAPIKeysBearerTypeEnum} [bearerType] Filter by type of bearer.
   * @param {Array<string>} [accessKeys] Filter by a list of access keys.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApiInterface
   */
  listAPIKeys(
    orderBy?: ListAPIKeysOrderByEnum,
    page?: number,
    pageSize?: number,
    organizationId?: string,
    editable?: boolean,
    expired?: boolean,
    accessKey?: string,
    description?: string,
    bearerId?: string,
    bearerType?: ListAPIKeysBearerTypeEnum,
    accessKeys?: Array<string>,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListAPIKeysResponse>;

  /**
   * Update the parameters of an API key, including `default_project_id` and `description`.
   * @summary Update an API key
   * @param {string} accessKey Access key to update.
   * @param {UpdateAPIKeyRequest} updateAPIKeyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApiInterface
   */
  updateAPIKey(
    accessKey: string,
    updateAPIKeyRequest: UpdateAPIKeyRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1APIKey>;
}

/**
 * APIKeysApi - object-oriented interface
 * @export
 * @class APIKeysApi
 * @extends {BaseAPI}
 */
export class APIKeysApi extends BaseAPI implements APIKeysApiInterface {
  /**
   * Create an API key. You must specify the `application_id` or the `user_id` and the description. You can also specify the `default_project_id`, which is the Project ID of your preferred Project, to use with Object Storage. The `access_key` and `secret_key` values are returned in the response. Note that the secret key is only shown once. Make sure that you copy and store both keys somewhere safe.
   * @summary Create an API key
   * @param {CreateAPIKeyRequest} createAPIKeyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApi
   */
  public createAPIKey(
    createAPIKeyRequest: CreateAPIKeyRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return APIKeysApiFp(this.configuration)
      .createAPIKey(createAPIKeyRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete an API key. Note that this action is irreversible and cannot be undone. Make sure you update any configurations using the API keys you delete.
   * @summary Delete an API key
   * @param {string} accessKey Access key to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApi
   */
  public deleteAPIKey(accessKey: string, options?: RawAxiosRequestConfig) {
    return APIKeysApiFp(this.configuration)
      .deleteAPIKey(accessKey, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve information about an API key, specified by the `access_key` parameter. The API key\'s details, including either the `user_id` or `application_id` of its bearer are returned in the response. Note that the string value for the `secret_key` is nullable, and therefore is not displayed in the response. The `secret_key` value is only displayed upon API key creation.
   * @summary Get an API key
   * @param {string} accessKey Access key to search for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApi
   */
  public getAPIKey(accessKey: string, options?: RawAxiosRequestConfig) {
    return APIKeysApiFp(this.configuration)
      .getAPIKey(accessKey, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List API keys. By default, the API keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `editable`, `expired`, `access_key` and `bearer_id`.
   * @summary List API keys
   * @param {ListAPIKeysOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [page] Page number. Value must be greater or equal to 1.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {string} [organizationId] ID of Organization.
   * @param {boolean} [editable] Defines whether to filter out editable API keys or not.
   * @param {boolean} [expired] Defines whether to filter out expired API keys or not.
   * @param {string} [accessKey] Filter by access key (deprecated in favor of &#x60;access_keys&#x60;).
   * @param {string} [description] Filter by description.
   * @param {string} [bearerId] Filter by bearer ID.
   * @param {ListAPIKeysBearerTypeEnum} [bearerType] Filter by type of bearer.
   * @param {Array<string>} [accessKeys] Filter by a list of access keys.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApi
   */
  public listAPIKeys(
    orderBy?: ListAPIKeysOrderByEnum,
    page?: number,
    pageSize?: number,
    organizationId?: string,
    editable?: boolean,
    expired?: boolean,
    accessKey?: string,
    description?: string,
    bearerId?: string,
    bearerType?: ListAPIKeysBearerTypeEnum,
    accessKeys?: Array<string>,
    options?: RawAxiosRequestConfig,
  ) {
    return APIKeysApiFp(this.configuration)
      .listAPIKeys(
        orderBy,
        page,
        pageSize,
        organizationId,
        editable,
        expired,
        accessKey,
        description,
        bearerId,
        bearerType,
        accessKeys,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the parameters of an API key, including `default_project_id` and `description`.
   * @summary Update an API key
   * @param {string} accessKey Access key to update.
   * @param {UpdateAPIKeyRequest} updateAPIKeyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof APIKeysApi
   */
  public updateAPIKey(
    accessKey: string,
    updateAPIKeyRequest: UpdateAPIKeyRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return APIKeysApiFp(this.configuration)
      .updateAPIKey(accessKey, updateAPIKeyRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListAPIKeysOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  UpdatedAtAsc: 'updated_at_asc',
  UpdatedAtDesc: 'updated_at_desc',
  ExpiresAtAsc: 'expires_at_asc',
  ExpiresAtDesc: 'expires_at_desc',
  AccessKeyAsc: 'access_key_asc',
  AccessKeyDesc: 'access_key_desc',
} as const;
export type ListAPIKeysOrderByEnum =
  (typeof ListAPIKeysOrderByEnum)[keyof typeof ListAPIKeysOrderByEnum];
/**
 * @export
 */
export const ListAPIKeysBearerTypeEnum = {
  UnknownBearerType: 'unknown_bearer_type',
  User: 'user',
  Application: 'application',
} as const;
export type ListAPIKeysBearerTypeEnum =
  (typeof ListAPIKeysBearerTypeEnum)[keyof typeof ListAPIKeysBearerTypeEnum];

/**
 * ApplicationsApi - axios parameter creator
 * @export
 */
export const ApplicationsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Create a new application. You must define the `name` parameter in the request.
     * @summary Create a new application
     * @param {CreateApplicationRequest} createApplicationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createApplication: async (
      createApplicationRequest: CreateApplicationRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'createApplicationRequest' is not null or undefined
      assertParamExists(
        'createApplication',
        'createApplicationRequest',
        createApplicationRequest,
      );
      const localVarPath = `/iam/v1alpha1/applications`;
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
        createApplicationRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete an application. Note that this action is irreversible and will automatically delete the application\'s API keys. Policies attached to users and applications via this group will no longer apply.
     * @summary Delete an application
     * @param {string} applicationId ID of the application to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteApplication: async (
      applicationId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'applicationId' is not null or undefined
      assertParamExists('deleteApplication', 'applicationId', applicationId);
      const localVarPath =
        `/iam/v1alpha1/applications/{application_id}`.replace(
          `{${'application_id'}}`,
          encodeURIComponent(String(applicationId)),
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
     * Retrieve information about an application, specified by the `application_id` parameter. The application\'s full details, including `id`, `email`, `organization_id`, `status` and `two_factor_enabled` are returned in the response.
     * @summary Get a given application
     * @param {string} applicationId ID of the application to find.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getApplication: async (
      applicationId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'applicationId' is not null or undefined
      assertParamExists('getApplication', 'applicationId', applicationId);
      const localVarPath =
        `/iam/v1alpha1/applications/{application_id}`.replace(
          `{${'application_id'}}`,
          encodeURIComponent(String(applicationId)),
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
     * List the applications of an Organization. By default, the applications listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `application_ids`.
     * @summary List applications of an Organization
     * @param {ListApplicationsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {string} [name] Name of the application to filter.
     * @param {string} [organizationId] ID of the Organization to filter.
     * @param {boolean} [editable] Defines whether to filter out editable applications or not.
     * @param {Array<string>} [applicationIds] Filter by list of IDs.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listApplications: async (
      orderBy?: ListApplicationsOrderByEnum,
      pageSize?: number,
      page?: number,
      name?: string,
      organizationId?: string,
      editable?: boolean,
      applicationIds?: Array<string>,
      tag?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/applications`;
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

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (editable !== undefined) {
        localVarQueryParameter['editable'] = editable;
      }

      if (applicationIds) {
        localVarQueryParameter['application_ids'] = applicationIds;
      }

      if (tag !== undefined) {
        localVarQueryParameter['tag'] = tag;
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
     * Update the parameters of an application, including `name` and `description`.
     * @summary Update an application
     * @param {string} applicationId ID of the application to update.
     * @param {UpdateApplicationRequest} updateApplicationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateApplication: async (
      applicationId: string,
      updateApplicationRequest: UpdateApplicationRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'applicationId' is not null or undefined
      assertParamExists('updateApplication', 'applicationId', applicationId);
      // verify required parameter 'updateApplicationRequest' is not null or undefined
      assertParamExists(
        'updateApplication',
        'updateApplicationRequest',
        updateApplicationRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/applications/{application_id}`.replace(
          `{${'application_id'}}`,
          encodeURIComponent(String(applicationId)),
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
        updateApplicationRequest,
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
 * ApplicationsApi - functional programming interface
 * @export
 */
export const ApplicationsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    ApplicationsApiAxiosParamCreator(configuration);
  return {
    /**
     * Create a new application. You must define the `name` parameter in the request.
     * @summary Create a new application
     * @param {CreateApplicationRequest} createApplicationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createApplication(
      createApplicationRequest: CreateApplicationRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Application>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createApplication(
          createApplicationRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ApplicationsApi.createApplication']?.[
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
     * Delete an application. Note that this action is irreversible and will automatically delete the application\'s API keys. Policies attached to users and applications via this group will no longer apply.
     * @summary Delete an application
     * @param {string} applicationId ID of the application to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteApplication(
      applicationId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteApplication(
          applicationId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ApplicationsApi.deleteApplication']?.[
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
     * Retrieve information about an application, specified by the `application_id` parameter. The application\'s full details, including `id`, `email`, `organization_id`, `status` and `two_factor_enabled` are returned in the response.
     * @summary Get a given application
     * @param {string} applicationId ID of the application to find.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getApplication(
      applicationId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Application>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getApplication(
        applicationId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ApplicationsApi.getApplication']?.[
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
     * List the applications of an Organization. By default, the applications listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `application_ids`.
     * @summary List applications of an Organization
     * @param {ListApplicationsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {string} [name] Name of the application to filter.
     * @param {string} [organizationId] ID of the Organization to filter.
     * @param {boolean} [editable] Defines whether to filter out editable applications or not.
     * @param {Array<string>} [applicationIds] Filter by list of IDs.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listApplications(
      orderBy?: ListApplicationsOrderByEnum,
      pageSize?: number,
      page?: number,
      name?: string,
      organizationId?: string,
      editable?: boolean,
      applicationIds?: Array<string>,
      tag?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListApplicationsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listApplications(
          orderBy,
          pageSize,
          page,
          name,
          organizationId,
          editable,
          applicationIds,
          tag,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ApplicationsApi.listApplications']?.[
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
     * Update the parameters of an application, including `name` and `description`.
     * @summary Update an application
     * @param {string} applicationId ID of the application to update.
     * @param {UpdateApplicationRequest} updateApplicationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateApplication(
      applicationId: string,
      updateApplicationRequest: UpdateApplicationRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Application>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateApplication(
          applicationId,
          updateApplicationRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ApplicationsApi.updateApplication']?.[
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
 * ApplicationsApi - factory interface
 * @export
 */
export const ApplicationsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = ApplicationsApiFp(configuration);
  return {
    /**
     * Create a new application. You must define the `name` parameter in the request.
     * @summary Create a new application
     * @param {CreateApplicationRequest} createApplicationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createApplication(
      createApplicationRequest: CreateApplicationRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Application> {
      return localVarFp
        .createApplication(createApplicationRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete an application. Note that this action is irreversible and will automatically delete the application\'s API keys. Policies attached to users and applications via this group will no longer apply.
     * @summary Delete an application
     * @param {string} applicationId ID of the application to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteApplication(
      applicationId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteApplication(applicationId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve information about an application, specified by the `application_id` parameter. The application\'s full details, including `id`, `email`, `organization_id`, `status` and `two_factor_enabled` are returned in the response.
     * @summary Get a given application
     * @param {string} applicationId ID of the application to find.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getApplication(
      applicationId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Application> {
      return localVarFp
        .getApplication(applicationId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List the applications of an Organization. By default, the applications listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `application_ids`.
     * @summary List applications of an Organization
     * @param {ListApplicationsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {string} [name] Name of the application to filter.
     * @param {string} [organizationId] ID of the Organization to filter.
     * @param {boolean} [editable] Defines whether to filter out editable applications or not.
     * @param {Array<string>} [applicationIds] Filter by list of IDs.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listApplications(
      orderBy?: ListApplicationsOrderByEnum,
      pageSize?: number,
      page?: number,
      name?: string,
      organizationId?: string,
      editable?: boolean,
      applicationIds?: Array<string>,
      tag?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListApplicationsResponse> {
      return localVarFp
        .listApplications(
          orderBy,
          pageSize,
          page,
          name,
          organizationId,
          editable,
          applicationIds,
          tag,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the parameters of an application, including `name` and `description`.
     * @summary Update an application
     * @param {string} applicationId ID of the application to update.
     * @param {UpdateApplicationRequest} updateApplicationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateApplication(
      applicationId: string,
      updateApplicationRequest: UpdateApplicationRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Application> {
      return localVarFp
        .updateApplication(applicationId, updateApplicationRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ApplicationsApi - interface
 * @export
 * @interface ApplicationsApi
 */
export interface ApplicationsApiInterface {
  /**
   * Create a new application. You must define the `name` parameter in the request.
   * @summary Create a new application
   * @param {CreateApplicationRequest} createApplicationRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApiInterface
   */
  createApplication(
    createApplicationRequest: CreateApplicationRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Application>;

  /**
   * Delete an application. Note that this action is irreversible and will automatically delete the application\'s API keys. Policies attached to users and applications via this group will no longer apply.
   * @summary Delete an application
   * @param {string} applicationId ID of the application to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApiInterface
   */
  deleteApplication(
    applicationId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Retrieve information about an application, specified by the `application_id` parameter. The application\'s full details, including `id`, `email`, `organization_id`, `status` and `two_factor_enabled` are returned in the response.
   * @summary Get a given application
   * @param {string} applicationId ID of the application to find.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApiInterface
   */
  getApplication(
    applicationId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Application>;

  /**
   * List the applications of an Organization. By default, the applications listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `application_ids`.
   * @summary List applications of an Organization
   * @param {ListApplicationsOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {string} [name] Name of the application to filter.
   * @param {string} [organizationId] ID of the Organization to filter.
   * @param {boolean} [editable] Defines whether to filter out editable applications or not.
   * @param {Array<string>} [applicationIds] Filter by list of IDs.
   * @param {string} [tag] Filter by tags containing a given string.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApiInterface
   */
  listApplications(
    orderBy?: ListApplicationsOrderByEnum,
    pageSize?: number,
    page?: number,
    name?: string,
    organizationId?: string,
    editable?: boolean,
    applicationIds?: Array<string>,
    tag?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListApplicationsResponse>;

  /**
   * Update the parameters of an application, including `name` and `description`.
   * @summary Update an application
   * @param {string} applicationId ID of the application to update.
   * @param {UpdateApplicationRequest} updateApplicationRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApiInterface
   */
  updateApplication(
    applicationId: string,
    updateApplicationRequest: UpdateApplicationRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Application>;
}

/**
 * ApplicationsApi - object-oriented interface
 * @export
 * @class ApplicationsApi
 * @extends {BaseAPI}
 */
export class ApplicationsApi
  extends BaseAPI
  implements ApplicationsApiInterface
{
  /**
   * Create a new application. You must define the `name` parameter in the request.
   * @summary Create a new application
   * @param {CreateApplicationRequest} createApplicationRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApi
   */
  public createApplication(
    createApplicationRequest: CreateApplicationRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ApplicationsApiFp(this.configuration)
      .createApplication(createApplicationRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete an application. Note that this action is irreversible and will automatically delete the application\'s API keys. Policies attached to users and applications via this group will no longer apply.
   * @summary Delete an application
   * @param {string} applicationId ID of the application to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApi
   */
  public deleteApplication(
    applicationId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ApplicationsApiFp(this.configuration)
      .deleteApplication(applicationId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve information about an application, specified by the `application_id` parameter. The application\'s full details, including `id`, `email`, `organization_id`, `status` and `two_factor_enabled` are returned in the response.
   * @summary Get a given application
   * @param {string} applicationId ID of the application to find.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApi
   */
  public getApplication(
    applicationId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ApplicationsApiFp(this.configuration)
      .getApplication(applicationId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List the applications of an Organization. By default, the applications listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `application_ids`.
   * @summary List applications of an Organization
   * @param {ListApplicationsOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {string} [name] Name of the application to filter.
   * @param {string} [organizationId] ID of the Organization to filter.
   * @param {boolean} [editable] Defines whether to filter out editable applications or not.
   * @param {Array<string>} [applicationIds] Filter by list of IDs.
   * @param {string} [tag] Filter by tags containing a given string.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApi
   */
  public listApplications(
    orderBy?: ListApplicationsOrderByEnum,
    pageSize?: number,
    page?: number,
    name?: string,
    organizationId?: string,
    editable?: boolean,
    applicationIds?: Array<string>,
    tag?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return ApplicationsApiFp(this.configuration)
      .listApplications(
        orderBy,
        pageSize,
        page,
        name,
        organizationId,
        editable,
        applicationIds,
        tag,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the parameters of an application, including `name` and `description`.
   * @summary Update an application
   * @param {string} applicationId ID of the application to update.
   * @param {UpdateApplicationRequest} updateApplicationRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ApplicationsApi
   */
  public updateApplication(
    applicationId: string,
    updateApplicationRequest: UpdateApplicationRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ApplicationsApiFp(this.configuration)
      .updateApplication(applicationId, updateApplicationRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListApplicationsOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  UpdatedAtAsc: 'updated_at_asc',
  UpdatedAtDesc: 'updated_at_desc',
  NameAsc: 'name_asc',
  NameDesc: 'name_desc',
} as const;
export type ListApplicationsOrderByEnum =
  (typeof ListApplicationsOrderByEnum)[keyof typeof ListApplicationsOrderByEnum];

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
     * @param {CheckPermissionsRequest} checkPermissionsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    checkPermissions: async (
      checkPermissionsRequest: CheckPermissionsRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'checkPermissionsRequest' is not null or undefined
      assertParamExists(
        'checkPermissions',
        'checkPermissionsRequest',
        checkPermissionsRequest,
      );
      const localVarPath = `/iam/v1alpha1/check-permissions`;
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
        checkPermissionsRequest,
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
     * @summary Get your Organization\'s IAM information
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOrganization: async (
      organizationId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists('getOrganization', 'organizationId', organizationId);
      const localVarPath =
        `/iam/v1alpha1/organizations/{organization_id}`.replace(
          `{${'organization_id'}}`,
          encodeURIComponent(String(organizationId)),
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
     *
     * @param {string} userId ID of the user to list connections for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUserConnections: async (
      userId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('getUserConnections', 'userId', userId);
      const localVarPath = `/iam/v1alpha1/users/{user_id}/connections`.replace(
        `{${'user_id'}}`,
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
     * @param {string} userId ID of the user that will be added to your connection.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    initiateUserConnection: async (
      userId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('initiateUserConnection', 'userId', userId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('initiateUserConnection', 'body', body);
      const localVarPath =
        `/iam/v1alpha1/users/{user_id}/initiate-connection`.replace(
          `{${'user_id'}}`,
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
     *
     * @param {string} userId User ID.
     * @param {JoinUserConnectionRequest} joinUserConnectionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    joinUserConnection: async (
      userId: string,
      joinUserConnectionRequest: JoinUserConnectionRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('joinUserConnection', 'userId', userId);
      // verify required parameter 'joinUserConnectionRequest' is not null or undefined
      assertParamExists(
        'joinUserConnection',
        'joinUserConnectionRequest',
        joinUserConnectionRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/users/{user_id}/join-connection`.replace(
          `{${'user_id'}}`,
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
        joinUserConnectionRequest,
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
     * @param {string} userId ID of the user you want to manage the connection for.
     * @param {RemoveUserConnectionRequest} removeUserConnectionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    removeUserConnection: async (
      userId: string,
      removeUserConnectionRequest: RemoveUserConnectionRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('removeUserConnection', 'userId', userId);
      // verify required parameter 'removeUserConnectionRequest' is not null or undefined
      assertParamExists(
        'removeUserConnection',
        'removeUserConnectionRequest',
        removeUserConnectionRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/users/{user_id}/remove-connection`.replace(
          `{${'user_id'}}`,
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
        removeUserConnectionRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * This will fail if an alias has already been defined. Please contact support if you need to change your Organization\'s alias.
     * @summary Set your Organization\'s alias.
     * @param {string} organizationId ID of the Organization.
     * @param {SetOrganizationAliasRequest} setOrganizationAliasRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setOrganizationAlias: async (
      organizationId: string,
      setOrganizationAliasRequest: SetOrganizationAliasRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists(
        'setOrganizationAlias',
        'organizationId',
        organizationId,
      );
      // verify required parameter 'setOrganizationAliasRequest' is not null or undefined
      assertParamExists(
        'setOrganizationAlias',
        'setOrganizationAliasRequest',
        setOrganizationAliasRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/organizations/{organization_id}/alias`.replace(
          `{${'organization_id'}}`,
          encodeURIComponent(String(organizationId)),
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
        setOrganizationAliasRequest,
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
     * @summary Set your Organization\'s allowed login methods.
     * @param {string} organizationId ID of the Organization.
     * @param {UpdateOrganizationLoginMethodsRequest} updateOrganizationLoginMethodsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateOrganizationLoginMethods: async (
      organizationId: string,
      updateOrganizationLoginMethodsRequest: UpdateOrganizationLoginMethodsRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists(
        'updateOrganizationLoginMethods',
        'organizationId',
        organizationId,
      );
      // verify required parameter 'updateOrganizationLoginMethodsRequest' is not null or undefined
      assertParamExists(
        'updateOrganizationLoginMethods',
        'updateOrganizationLoginMethodsRequest',
        updateOrganizationLoginMethodsRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/organizations/{organization_id}/login-methods`.replace(
          `{${'organization_id'}}`,
          encodeURIComponent(String(organizationId)),
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
        updateOrganizationLoginMethodsRequest,
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
 * DefaultApi - functional programming interface
 * @export
 */
export const DefaultApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = DefaultApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @param {CheckPermissionsRequest} checkPermissionsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async checkPermissions(
      checkPermissionsRequest: CheckPermissionsRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1CheckPermissionsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.checkPermissions(
          checkPermissionsRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DefaultApi.checkPermissions']?.[
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
     * @summary Get your Organization\'s IAM information
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getOrganization(
      organizationId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Organization>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getOrganization(
        organizationId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DefaultApi.getOrganization']?.[
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
     * @param {string} userId ID of the user to list connections for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getUserConnections(
      userId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1GetUserConnectionsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getUserConnections(userId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DefaultApi.getUserConnections']?.[
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
     * @param {string} userId ID of the user that will be added to your connection.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async initiateUserConnection(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1InitiateUserConnectionResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.initiateUserConnection(
          userId,
          body,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DefaultApi.initiateUserConnection']?.[
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
     * @param {string} userId User ID.
     * @param {JoinUserConnectionRequest} joinUserConnectionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async joinUserConnection(
      userId: string,
      joinUserConnectionRequest: JoinUserConnectionRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.joinUserConnection(
          userId,
          joinUserConnectionRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DefaultApi.joinUserConnection']?.[
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
     * @param {string} userId ID of the user you want to manage the connection for.
     * @param {RemoveUserConnectionRequest} removeUserConnectionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async removeUserConnection(
      userId: string,
      removeUserConnectionRequest: RemoveUserConnectionRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.removeUserConnection(
          userId,
          removeUserConnectionRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DefaultApi.removeUserConnection']?.[
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
     * This will fail if an alias has already been defined. Please contact support if you need to change your Organization\'s alias.
     * @summary Set your Organization\'s alias.
     * @param {string} organizationId ID of the Organization.
     * @param {SetOrganizationAliasRequest} setOrganizationAliasRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setOrganizationAlias(
      organizationId: string,
      setOrganizationAliasRequest: SetOrganizationAliasRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Organization>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.setOrganizationAlias(
          organizationId,
          setOrganizationAliasRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DefaultApi.setOrganizationAlias']?.[
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
     * @summary Set your Organization\'s allowed login methods.
     * @param {string} organizationId ID of the Organization.
     * @param {UpdateOrganizationLoginMethodsRequest} updateOrganizationLoginMethodsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateOrganizationLoginMethods(
      organizationId: string,
      updateOrganizationLoginMethodsRequest: UpdateOrganizationLoginMethodsRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Organization>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateOrganizationLoginMethods(
          organizationId,
          updateOrganizationLoginMethodsRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DefaultApi.updateOrganizationLoginMethods']?.[
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
     * @param {CheckPermissionsRequest} checkPermissionsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    checkPermissions(
      checkPermissionsRequest: CheckPermissionsRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1CheckPermissionsResponse> {
      return localVarFp
        .checkPermissions(checkPermissionsRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Get your Organization\'s IAM information
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOrganization(
      organizationId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Organization> {
      return localVarFp
        .getOrganization(organizationId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} userId ID of the user to list connections for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUserConnections(
      userId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1GetUserConnectionsResponse> {
      return localVarFp
        .getUserConnections(userId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} userId ID of the user that will be added to your connection.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    initiateUserConnection(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1InitiateUserConnectionResponse> {
      return localVarFp
        .initiateUserConnection(userId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} userId User ID.
     * @param {JoinUserConnectionRequest} joinUserConnectionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    joinUserConnection(
      userId: string,
      joinUserConnectionRequest: JoinUserConnectionRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .joinUserConnection(userId, joinUserConnectionRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @param {string} userId ID of the user you want to manage the connection for.
     * @param {RemoveUserConnectionRequest} removeUserConnectionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    removeUserConnection(
      userId: string,
      removeUserConnectionRequest: RemoveUserConnectionRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .removeUserConnection(userId, removeUserConnectionRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * This will fail if an alias has already been defined. Please contact support if you need to change your Organization\'s alias.
     * @summary Set your Organization\'s alias.
     * @param {string} organizationId ID of the Organization.
     * @param {SetOrganizationAliasRequest} setOrganizationAliasRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setOrganizationAlias(
      organizationId: string,
      setOrganizationAliasRequest: SetOrganizationAliasRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Organization> {
      return localVarFp
        .setOrganizationAlias(
          organizationId,
          setOrganizationAliasRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Set your Organization\'s allowed login methods.
     * @param {string} organizationId ID of the Organization.
     * @param {UpdateOrganizationLoginMethodsRequest} updateOrganizationLoginMethodsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateOrganizationLoginMethods(
      organizationId: string,
      updateOrganizationLoginMethodsRequest: UpdateOrganizationLoginMethodsRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Organization> {
      return localVarFp
        .updateOrganizationLoginMethods(
          organizationId,
          updateOrganizationLoginMethodsRequest,
          options,
        )
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
   * @param {CheckPermissionsRequest} checkPermissionsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  checkPermissions(
    checkPermissionsRequest: CheckPermissionsRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1CheckPermissionsResponse>;

  /**
   *
   * @summary Get your Organization\'s IAM information
   * @param {string} organizationId ID of the Organization.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  getOrganization(
    organizationId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Organization>;

  /**
   *
   * @param {string} userId ID of the user to list connections for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  getUserConnections(
    userId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1GetUserConnectionsResponse>;

  /**
   *
   * @param {string} userId ID of the user that will be added to your connection.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  initiateUserConnection(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1InitiateUserConnectionResponse>;

  /**
   *
   * @param {string} userId User ID.
   * @param {JoinUserConnectionRequest} joinUserConnectionRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  joinUserConnection(
    userId: string,
    joinUserConnectionRequest: JoinUserConnectionRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   *
   * @param {string} userId ID of the user you want to manage the connection for.
   * @param {RemoveUserConnectionRequest} removeUserConnectionRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  removeUserConnection(
    userId: string,
    removeUserConnectionRequest: RemoveUserConnectionRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * This will fail if an alias has already been defined. Please contact support if you need to change your Organization\'s alias.
   * @summary Set your Organization\'s alias.
   * @param {string} organizationId ID of the Organization.
   * @param {SetOrganizationAliasRequest} setOrganizationAliasRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  setOrganizationAlias(
    organizationId: string,
    setOrganizationAliasRequest: SetOrganizationAliasRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Organization>;

  /**
   *
   * @summary Set your Organization\'s allowed login methods.
   * @param {string} organizationId ID of the Organization.
   * @param {UpdateOrganizationLoginMethodsRequest} updateOrganizationLoginMethodsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApiInterface
   */
  updateOrganizationLoginMethods(
    organizationId: string,
    updateOrganizationLoginMethodsRequest: UpdateOrganizationLoginMethodsRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Organization>;
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
   * @param {CheckPermissionsRequest} checkPermissionsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public checkPermissions(
    checkPermissionsRequest: CheckPermissionsRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DefaultApiFp(this.configuration)
      .checkPermissions(checkPermissionsRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Get your Organization\'s IAM information
   * @param {string} organizationId ID of the Organization.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public getOrganization(
    organizationId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return DefaultApiFp(this.configuration)
      .getOrganization(organizationId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {string} userId ID of the user to list connections for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public getUserConnections(userId: string, options?: RawAxiosRequestConfig) {
    return DefaultApiFp(this.configuration)
      .getUserConnections(userId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {string} userId ID of the user that will be added to your connection.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public initiateUserConnection(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return DefaultApiFp(this.configuration)
      .initiateUserConnection(userId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {string} userId User ID.
   * @param {JoinUserConnectionRequest} joinUserConnectionRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public joinUserConnection(
    userId: string,
    joinUserConnectionRequest: JoinUserConnectionRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DefaultApiFp(this.configuration)
      .joinUserConnection(userId, joinUserConnectionRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @param {string} userId ID of the user you want to manage the connection for.
   * @param {RemoveUserConnectionRequest} removeUserConnectionRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public removeUserConnection(
    userId: string,
    removeUserConnectionRequest: RemoveUserConnectionRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DefaultApiFp(this.configuration)
      .removeUserConnection(userId, removeUserConnectionRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * This will fail if an alias has already been defined. Please contact support if you need to change your Organization\'s alias.
   * @summary Set your Organization\'s alias.
   * @param {string} organizationId ID of the Organization.
   * @param {SetOrganizationAliasRequest} setOrganizationAliasRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public setOrganizationAlias(
    organizationId: string,
    setOrganizationAliasRequest: SetOrganizationAliasRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DefaultApiFp(this.configuration)
      .setOrganizationAlias(
        organizationId,
        setOrganizationAliasRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Set your Organization\'s allowed login methods.
   * @param {string} organizationId ID of the Organization.
   * @param {UpdateOrganizationLoginMethodsRequest} updateOrganizationLoginMethodsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DefaultApi
   */
  public updateOrganizationLoginMethods(
    organizationId: string,
    updateOrganizationLoginMethodsRequest: UpdateOrganizationLoginMethodsRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DefaultApiFp(this.configuration)
      .updateOrganizationLoginMethods(
        organizationId,
        updateOrganizationLoginMethodsRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * GroupsApi - axios parameter creator
 * @export
 */
export const GroupsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Add a user or an application to a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only add one of each per request.
     * @summary Add a user or an application to a group
     * @param {string} groupId ID of the group.
     * @param {AddGroupMemberRequest} addGroupMemberRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addGroupMember: async (
      groupId: string,
      addGroupMemberRequest: AddGroupMemberRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      assertParamExists('addGroupMember', 'groupId', groupId);
      // verify required parameter 'addGroupMemberRequest' is not null or undefined
      assertParamExists(
        'addGroupMember',
        'addGroupMemberRequest',
        addGroupMemberRequest,
      );
      const localVarPath = `/iam/v1alpha1/groups/{group_id}/add-member`.replace(
        `{${'group_id'}}`,
        encodeURIComponent(String(groupId)),
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
        addGroupMemberRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Add multiple users and applications to a group in a single call. You can specify an array of `user_id`s and `application_id`s. Note that any existing users and applications in the group will remain. To add new users/applications and delete pre-existing ones, use the [Overwrite users and applications of a group](#path-groups-overwrite-users-and-applications-of-a-group) method.
     * @summary Add multiple users and applications to a group
     * @param {string} groupId ID of the group.
     * @param {AddGroupMembersRequest} addGroupMembersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addGroupMembers: async (
      groupId: string,
      addGroupMembersRequest: AddGroupMembersRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      assertParamExists('addGroupMembers', 'groupId', groupId);
      // verify required parameter 'addGroupMembersRequest' is not null or undefined
      assertParamExists(
        'addGroupMembers',
        'addGroupMembersRequest',
        addGroupMembersRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/groups/{group_id}/add-members`.replace(
          `{${'group_id'}}`,
          encodeURIComponent(String(groupId)),
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
        addGroupMembersRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Create a new group. You must define the `name` and `organization_id` parameters in the request.
     * @summary Create a group
     * @param {CreateGroupRequest} createGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createGroup: async (
      createGroupRequest: CreateGroupRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'createGroupRequest' is not null or undefined
      assertParamExists(
        'createGroup',
        'createGroupRequest',
        createGroupRequest,
      );
      const localVarPath = `/iam/v1alpha1/groups`;
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
        createGroupRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete a group. Note that this action is irreversible and could delete permissions for group members. Policies attached to users and applications via this group will no longer apply.
     * @summary Delete a group
     * @param {string} groupId ID of the group to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteGroup: async (
      groupId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      assertParamExists('deleteGroup', 'groupId', groupId);
      const localVarPath = `/iam/v1alpha1/groups/{group_id}`.replace(
        `{${'group_id'}}`,
        encodeURIComponent(String(groupId)),
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
     * Retrieve information about a given group, specified by the `group_id` parameter. The group\'s full details, including `user_ids` and `application_ids` are returned in the response.
     * @summary Get a group
     * @param {string} groupId ID of the group.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getGroup: async (
      groupId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      assertParamExists('getGroup', 'groupId', groupId);
      const localVarPath = `/iam/v1alpha1/groups/{group_id}`.replace(
        `{${'group_id'}}`,
        encodeURIComponent(String(groupId)),
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
     * List groups. By default, the groups listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters to filter your query. Use `user_ids` or `application_ids` to list all groups certain users or applications belong to.
     * @summary List groups
     * @param {ListGroupsOrderByEnum} [orderBy] Sort order of groups.
     * @param {number} [page] Requested page number. Value must be greater or equal to 1.
     * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
     * @param {string} [organizationId] Filter by Organization ID.
     * @param {string} [name] Name of group to find.
     * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
     * @param {Array<string>} [userIds] Filter by a list of user IDs.
     * @param {Array<string>} [groupIds] Filter by a list of group IDs.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listGroups: async (
      orderBy?: ListGroupsOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      name?: string,
      applicationIds?: Array<string>,
      userIds?: Array<string>,
      groupIds?: Array<string>,
      tag?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/groups`;
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

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (applicationIds) {
        localVarQueryParameter['application_ids'] = applicationIds;
      }

      if (userIds) {
        localVarQueryParameter['user_ids'] = userIds;
      }

      if (groupIds) {
        localVarQueryParameter['group_ids'] = groupIds;
      }

      if (tag !== undefined) {
        localVarQueryParameter['tag'] = tag;
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
     * Remove a user or an application from a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only remove one of each per request. Removing a user from a group means that any permissions given to them via the group (i.e. from an attached policy) will no longer apply. Be sure you want to remove these permissions from the user before proceeding.
     * @summary Remove a user or an application from a group
     * @param {string} groupId ID of the group.
     * @param {RemoveGroupMemberRequest} removeGroupMemberRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    removeGroupMember: async (
      groupId: string,
      removeGroupMemberRequest: RemoveGroupMemberRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      assertParamExists('removeGroupMember', 'groupId', groupId);
      // verify required parameter 'removeGroupMemberRequest' is not null or undefined
      assertParamExists(
        'removeGroupMember',
        'removeGroupMemberRequest',
        removeGroupMemberRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/groups/{group_id}/remove-member`.replace(
          `{${'group_id'}}`,
          encodeURIComponent(String(groupId)),
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
        removeGroupMemberRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Overwrite users and applications configuration in a group. Any information that you add using this command will overwrite the previous configuration.
     * @summary Overwrite users and applications of a group
     * @param {string} groupId
     * @param {SetGroupMembersRequest} setGroupMembersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setGroupMembers: async (
      groupId: string,
      setGroupMembersRequest: SetGroupMembersRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      assertParamExists('setGroupMembers', 'groupId', groupId);
      // verify required parameter 'setGroupMembersRequest' is not null or undefined
      assertParamExists(
        'setGroupMembers',
        'setGroupMembersRequest',
        setGroupMembersRequest,
      );
      const localVarPath = `/iam/v1alpha1/groups/{group_id}/members`.replace(
        `{${'group_id'}}`,
        encodeURIComponent(String(groupId)),
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
        setGroupMembersRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the parameters of group, including `name` and `description`.
     * @summary Update a group
     * @param {string} groupId ID of the group to update.
     * @param {UpdateGroupRequest} updateGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateGroup: async (
      groupId: string,
      updateGroupRequest: UpdateGroupRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'groupId' is not null or undefined
      assertParamExists('updateGroup', 'groupId', groupId);
      // verify required parameter 'updateGroupRequest' is not null or undefined
      assertParamExists(
        'updateGroup',
        'updateGroupRequest',
        updateGroupRequest,
      );
      const localVarPath = `/iam/v1alpha1/groups/{group_id}`.replace(
        `{${'group_id'}}`,
        encodeURIComponent(String(groupId)),
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
        updateGroupRequest,
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
 * GroupsApi - functional programming interface
 * @export
 */
export const GroupsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = GroupsApiAxiosParamCreator(configuration);
  return {
    /**
     * Add a user or an application to a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only add one of each per request.
     * @summary Add a user or an application to a group
     * @param {string} groupId ID of the group.
     * @param {AddGroupMemberRequest} addGroupMemberRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async addGroupMember(
      groupId: string,
      addGroupMemberRequest: AddGroupMemberRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Group>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.addGroupMember(
        groupId,
        addGroupMemberRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['GroupsApi.addGroupMember']?.[
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
     * Add multiple users and applications to a group in a single call. You can specify an array of `user_id`s and `application_id`s. Note that any existing users and applications in the group will remain. To add new users/applications and delete pre-existing ones, use the [Overwrite users and applications of a group](#path-groups-overwrite-users-and-applications-of-a-group) method.
     * @summary Add multiple users and applications to a group
     * @param {string} groupId ID of the group.
     * @param {AddGroupMembersRequest} addGroupMembersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async addGroupMembers(
      groupId: string,
      addGroupMembersRequest: AddGroupMembersRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Group>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.addGroupMembers(
        groupId,
        addGroupMembersRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['GroupsApi.addGroupMembers']?.[
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
     * Create a new group. You must define the `name` and `organization_id` parameters in the request.
     * @summary Create a group
     * @param {CreateGroupRequest} createGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createGroup(
      createGroupRequest: CreateGroupRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Group>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createGroup(
        createGroupRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['GroupsApi.createGroup']?.[
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
     * Delete a group. Note that this action is irreversible and could delete permissions for group members. Policies attached to users and applications via this group will no longer apply.
     * @summary Delete a group
     * @param {string} groupId ID of the group to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteGroup(
      groupId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteGroup(
        groupId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['GroupsApi.deleteGroup']?.[
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
     * Retrieve information about a given group, specified by the `group_id` parameter. The group\'s full details, including `user_ids` and `application_ids` are returned in the response.
     * @summary Get a group
     * @param {string} groupId ID of the group.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getGroup(
      groupId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Group>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getGroup(
        groupId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['GroupsApi.getGroup']?.[localVarOperationServerIndex]
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
     * List groups. By default, the groups listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters to filter your query. Use `user_ids` or `application_ids` to list all groups certain users or applications belong to.
     * @summary List groups
     * @param {ListGroupsOrderByEnum} [orderBy] Sort order of groups.
     * @param {number} [page] Requested page number. Value must be greater or equal to 1.
     * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
     * @param {string} [organizationId] Filter by Organization ID.
     * @param {string} [name] Name of group to find.
     * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
     * @param {Array<string>} [userIds] Filter by a list of user IDs.
     * @param {Array<string>} [groupIds] Filter by a list of group IDs.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listGroups(
      orderBy?: ListGroupsOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      name?: string,
      applicationIds?: Array<string>,
      userIds?: Array<string>,
      groupIds?: Array<string>,
      tag?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListGroupsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listGroups(
        orderBy,
        page,
        pageSize,
        organizationId,
        name,
        applicationIds,
        userIds,
        groupIds,
        tag,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['GroupsApi.listGroups']?.[
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
     * Remove a user or an application from a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only remove one of each per request. Removing a user from a group means that any permissions given to them via the group (i.e. from an attached policy) will no longer apply. Be sure you want to remove these permissions from the user before proceeding.
     * @summary Remove a user or an application from a group
     * @param {string} groupId ID of the group.
     * @param {RemoveGroupMemberRequest} removeGroupMemberRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async removeGroupMember(
      groupId: string,
      removeGroupMemberRequest: RemoveGroupMemberRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Group>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.removeGroupMember(
          groupId,
          removeGroupMemberRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['GroupsApi.removeGroupMember']?.[
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
     * Overwrite users and applications configuration in a group. Any information that you add using this command will overwrite the previous configuration.
     * @summary Overwrite users and applications of a group
     * @param {string} groupId
     * @param {SetGroupMembersRequest} setGroupMembersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setGroupMembers(
      groupId: string,
      setGroupMembersRequest: SetGroupMembersRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Group>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.setGroupMembers(
        groupId,
        setGroupMembersRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['GroupsApi.setGroupMembers']?.[
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
     * Update the parameters of group, including `name` and `description`.
     * @summary Update a group
     * @param {string} groupId ID of the group to update.
     * @param {UpdateGroupRequest} updateGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateGroup(
      groupId: string,
      updateGroupRequest: UpdateGroupRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Group>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateGroup(
        groupId,
        updateGroupRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['GroupsApi.updateGroup']?.[
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
 * GroupsApi - factory interface
 * @export
 */
export const GroupsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = GroupsApiFp(configuration);
  return {
    /**
     * Add a user or an application to a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only add one of each per request.
     * @summary Add a user or an application to a group
     * @param {string} groupId ID of the group.
     * @param {AddGroupMemberRequest} addGroupMemberRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addGroupMember(
      groupId: string,
      addGroupMemberRequest: AddGroupMemberRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Group> {
      return localVarFp
        .addGroupMember(groupId, addGroupMemberRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Add multiple users and applications to a group in a single call. You can specify an array of `user_id`s and `application_id`s. Note that any existing users and applications in the group will remain. To add new users/applications and delete pre-existing ones, use the [Overwrite users and applications of a group](#path-groups-overwrite-users-and-applications-of-a-group) method.
     * @summary Add multiple users and applications to a group
     * @param {string} groupId ID of the group.
     * @param {AddGroupMembersRequest} addGroupMembersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addGroupMembers(
      groupId: string,
      addGroupMembersRequest: AddGroupMembersRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Group> {
      return localVarFp
        .addGroupMembers(groupId, addGroupMembersRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a new group. You must define the `name` and `organization_id` parameters in the request.
     * @summary Create a group
     * @param {CreateGroupRequest} createGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createGroup(
      createGroupRequest: CreateGroupRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Group> {
      return localVarFp
        .createGroup(createGroupRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete a group. Note that this action is irreversible and could delete permissions for group members. Policies attached to users and applications via this group will no longer apply.
     * @summary Delete a group
     * @param {string} groupId ID of the group to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteGroup(
      groupId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteGroup(groupId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve information about a given group, specified by the `group_id` parameter. The group\'s full details, including `user_ids` and `application_ids` are returned in the response.
     * @summary Get a group
     * @param {string} groupId ID of the group.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getGroup(
      groupId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Group> {
      return localVarFp
        .getGroup(groupId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List groups. By default, the groups listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters to filter your query. Use `user_ids` or `application_ids` to list all groups certain users or applications belong to.
     * @summary List groups
     * @param {ListGroupsOrderByEnum} [orderBy] Sort order of groups.
     * @param {number} [page] Requested page number. Value must be greater or equal to 1.
     * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
     * @param {string} [organizationId] Filter by Organization ID.
     * @param {string} [name] Name of group to find.
     * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
     * @param {Array<string>} [userIds] Filter by a list of user IDs.
     * @param {Array<string>} [groupIds] Filter by a list of group IDs.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listGroups(
      orderBy?: ListGroupsOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      name?: string,
      applicationIds?: Array<string>,
      userIds?: Array<string>,
      groupIds?: Array<string>,
      tag?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListGroupsResponse> {
      return localVarFp
        .listGroups(
          orderBy,
          page,
          pageSize,
          organizationId,
          name,
          applicationIds,
          userIds,
          groupIds,
          tag,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Remove a user or an application from a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only remove one of each per request. Removing a user from a group means that any permissions given to them via the group (i.e. from an attached policy) will no longer apply. Be sure you want to remove these permissions from the user before proceeding.
     * @summary Remove a user or an application from a group
     * @param {string} groupId ID of the group.
     * @param {RemoveGroupMemberRequest} removeGroupMemberRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    removeGroupMember(
      groupId: string,
      removeGroupMemberRequest: RemoveGroupMemberRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Group> {
      return localVarFp
        .removeGroupMember(groupId, removeGroupMemberRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Overwrite users and applications configuration in a group. Any information that you add using this command will overwrite the previous configuration.
     * @summary Overwrite users and applications of a group
     * @param {string} groupId
     * @param {SetGroupMembersRequest} setGroupMembersRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setGroupMembers(
      groupId: string,
      setGroupMembersRequest: SetGroupMembersRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Group> {
      return localVarFp
        .setGroupMembers(groupId, setGroupMembersRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the parameters of group, including `name` and `description`.
     * @summary Update a group
     * @param {string} groupId ID of the group to update.
     * @param {UpdateGroupRequest} updateGroupRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateGroup(
      groupId: string,
      updateGroupRequest: UpdateGroupRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Group> {
      return localVarFp
        .updateGroup(groupId, updateGroupRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * GroupsApi - interface
 * @export
 * @interface GroupsApi
 */
export interface GroupsApiInterface {
  /**
   * Add a user or an application to a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only add one of each per request.
   * @summary Add a user or an application to a group
   * @param {string} groupId ID of the group.
   * @param {AddGroupMemberRequest} addGroupMemberRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApiInterface
   */
  addGroupMember(
    groupId: string,
    addGroupMemberRequest: AddGroupMemberRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Group>;

  /**
   * Add multiple users and applications to a group in a single call. You can specify an array of `user_id`s and `application_id`s. Note that any existing users and applications in the group will remain. To add new users/applications and delete pre-existing ones, use the [Overwrite users and applications of a group](#path-groups-overwrite-users-and-applications-of-a-group) method.
   * @summary Add multiple users and applications to a group
   * @param {string} groupId ID of the group.
   * @param {AddGroupMembersRequest} addGroupMembersRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApiInterface
   */
  addGroupMembers(
    groupId: string,
    addGroupMembersRequest: AddGroupMembersRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Group>;

  /**
   * Create a new group. You must define the `name` and `organization_id` parameters in the request.
   * @summary Create a group
   * @param {CreateGroupRequest} createGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApiInterface
   */
  createGroup(
    createGroupRequest: CreateGroupRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Group>;

  /**
   * Delete a group. Note that this action is irreversible and could delete permissions for group members. Policies attached to users and applications via this group will no longer apply.
   * @summary Delete a group
   * @param {string} groupId ID of the group to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApiInterface
   */
  deleteGroup(
    groupId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Retrieve information about a given group, specified by the `group_id` parameter. The group\'s full details, including `user_ids` and `application_ids` are returned in the response.
   * @summary Get a group
   * @param {string} groupId ID of the group.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApiInterface
   */
  getGroup(
    groupId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Group>;

  /**
   * List groups. By default, the groups listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters to filter your query. Use `user_ids` or `application_ids` to list all groups certain users or applications belong to.
   * @summary List groups
   * @param {ListGroupsOrderByEnum} [orderBy] Sort order of groups.
   * @param {number} [page] Requested page number. Value must be greater or equal to 1.
   * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
   * @param {string} [organizationId] Filter by Organization ID.
   * @param {string} [name] Name of group to find.
   * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
   * @param {Array<string>} [userIds] Filter by a list of user IDs.
   * @param {Array<string>} [groupIds] Filter by a list of group IDs.
   * @param {string} [tag] Filter by tags containing a given string.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApiInterface
   */
  listGroups(
    orderBy?: ListGroupsOrderByEnum,
    page?: number,
    pageSize?: number,
    organizationId?: string,
    name?: string,
    applicationIds?: Array<string>,
    userIds?: Array<string>,
    groupIds?: Array<string>,
    tag?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListGroupsResponse>;

  /**
   * Remove a user or an application from a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only remove one of each per request. Removing a user from a group means that any permissions given to them via the group (i.e. from an attached policy) will no longer apply. Be sure you want to remove these permissions from the user before proceeding.
   * @summary Remove a user or an application from a group
   * @param {string} groupId ID of the group.
   * @param {RemoveGroupMemberRequest} removeGroupMemberRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApiInterface
   */
  removeGroupMember(
    groupId: string,
    removeGroupMemberRequest: RemoveGroupMemberRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Group>;

  /**
   * Overwrite users and applications configuration in a group. Any information that you add using this command will overwrite the previous configuration.
   * @summary Overwrite users and applications of a group
   * @param {string} groupId
   * @param {SetGroupMembersRequest} setGroupMembersRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApiInterface
   */
  setGroupMembers(
    groupId: string,
    setGroupMembersRequest: SetGroupMembersRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Group>;

  /**
   * Update the parameters of group, including `name` and `description`.
   * @summary Update a group
   * @param {string} groupId ID of the group to update.
   * @param {UpdateGroupRequest} updateGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApiInterface
   */
  updateGroup(
    groupId: string,
    updateGroupRequest: UpdateGroupRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Group>;
}

/**
 * GroupsApi - object-oriented interface
 * @export
 * @class GroupsApi
 * @extends {BaseAPI}
 */
export class GroupsApi extends BaseAPI implements GroupsApiInterface {
  /**
   * Add a user or an application to a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only add one of each per request.
   * @summary Add a user or an application to a group
   * @param {string} groupId ID of the group.
   * @param {AddGroupMemberRequest} addGroupMemberRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApi
   */
  public addGroupMember(
    groupId: string,
    addGroupMemberRequest: AddGroupMemberRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return GroupsApiFp(this.configuration)
      .addGroupMember(groupId, addGroupMemberRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Add multiple users and applications to a group in a single call. You can specify an array of `user_id`s and `application_id`s. Note that any existing users and applications in the group will remain. To add new users/applications and delete pre-existing ones, use the [Overwrite users and applications of a group](#path-groups-overwrite-users-and-applications-of-a-group) method.
   * @summary Add multiple users and applications to a group
   * @param {string} groupId ID of the group.
   * @param {AddGroupMembersRequest} addGroupMembersRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApi
   */
  public addGroupMembers(
    groupId: string,
    addGroupMembersRequest: AddGroupMembersRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return GroupsApiFp(this.configuration)
      .addGroupMembers(groupId, addGroupMembersRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a new group. You must define the `name` and `organization_id` parameters in the request.
   * @summary Create a group
   * @param {CreateGroupRequest} createGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApi
   */
  public createGroup(
    createGroupRequest: CreateGroupRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return GroupsApiFp(this.configuration)
      .createGroup(createGroupRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete a group. Note that this action is irreversible and could delete permissions for group members. Policies attached to users and applications via this group will no longer apply.
   * @summary Delete a group
   * @param {string} groupId ID of the group to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApi
   */
  public deleteGroup(groupId: string, options?: RawAxiosRequestConfig) {
    return GroupsApiFp(this.configuration)
      .deleteGroup(groupId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve information about a given group, specified by the `group_id` parameter. The group\'s full details, including `user_ids` and `application_ids` are returned in the response.
   * @summary Get a group
   * @param {string} groupId ID of the group.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApi
   */
  public getGroup(groupId: string, options?: RawAxiosRequestConfig) {
    return GroupsApiFp(this.configuration)
      .getGroup(groupId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List groups. By default, the groups listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters to filter your query. Use `user_ids` or `application_ids` to list all groups certain users or applications belong to.
   * @summary List groups
   * @param {ListGroupsOrderByEnum} [orderBy] Sort order of groups.
   * @param {number} [page] Requested page number. Value must be greater or equal to 1.
   * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
   * @param {string} [organizationId] Filter by Organization ID.
   * @param {string} [name] Name of group to find.
   * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
   * @param {Array<string>} [userIds] Filter by a list of user IDs.
   * @param {Array<string>} [groupIds] Filter by a list of group IDs.
   * @param {string} [tag] Filter by tags containing a given string.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApi
   */
  public listGroups(
    orderBy?: ListGroupsOrderByEnum,
    page?: number,
    pageSize?: number,
    organizationId?: string,
    name?: string,
    applicationIds?: Array<string>,
    userIds?: Array<string>,
    groupIds?: Array<string>,
    tag?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return GroupsApiFp(this.configuration)
      .listGroups(
        orderBy,
        page,
        pageSize,
        organizationId,
        name,
        applicationIds,
        userIds,
        groupIds,
        tag,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Remove a user or an application from a group. You can specify a `user_id` and `application_id` in the body of your request. Note that you can only remove one of each per request. Removing a user from a group means that any permissions given to them via the group (i.e. from an attached policy) will no longer apply. Be sure you want to remove these permissions from the user before proceeding.
   * @summary Remove a user or an application from a group
   * @param {string} groupId ID of the group.
   * @param {RemoveGroupMemberRequest} removeGroupMemberRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApi
   */
  public removeGroupMember(
    groupId: string,
    removeGroupMemberRequest: RemoveGroupMemberRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return GroupsApiFp(this.configuration)
      .removeGroupMember(groupId, removeGroupMemberRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Overwrite users and applications configuration in a group. Any information that you add using this command will overwrite the previous configuration.
   * @summary Overwrite users and applications of a group
   * @param {string} groupId
   * @param {SetGroupMembersRequest} setGroupMembersRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApi
   */
  public setGroupMembers(
    groupId: string,
    setGroupMembersRequest: SetGroupMembersRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return GroupsApiFp(this.configuration)
      .setGroupMembers(groupId, setGroupMembersRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the parameters of group, including `name` and `description`.
   * @summary Update a group
   * @param {string} groupId ID of the group to update.
   * @param {UpdateGroupRequest} updateGroupRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof GroupsApi
   */
  public updateGroup(
    groupId: string,
    updateGroupRequest: UpdateGroupRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return GroupsApiFp(this.configuration)
      .updateGroup(groupId, updateGroupRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListGroupsOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  UpdatedAtAsc: 'updated_at_asc',
  UpdatedAtDesc: 'updated_at_desc',
  NameAsc: 'name_asc',
  NameDesc: 'name_desc',
} as const;
export type ListGroupsOrderByEnum =
  (typeof ListGroupsOrderByEnum)[keyof typeof ListGroupsOrderByEnum];

/**
 * JWTsApi - axios parameter creator
 * @export
 */
export const JWTsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     *
     * @summary Delete a JWT
     * @param {string} jti JWT ID of the JWT to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteJWT: async (
      jti: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'jti' is not null or undefined
      assertParamExists('deleteJWT', 'jti', jti);
      const localVarPath = `/iam/v1alpha1/jwts/{jti}`.replace(
        `{${'jti'}}`,
        encodeURIComponent(String(jti)),
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
     *
     * @summary Get a JWT
     * @param {string} jti JWT ID of the JWT to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getJWT: async (
      jti: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'jti' is not null or undefined
      assertParamExists('getJWT', 'jti', jti);
      const localVarPath = `/iam/v1alpha1/jwts/{jti}`.replace(
        `{${'jti'}}`,
        encodeURIComponent(String(jti)),
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
     *
     * @summary List JWTs
     * @param {ListJWTsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {string} [audienceId] ID of the user to search.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater to 1.
     * @param {boolean} [expired] Filter out expired JWTs or not.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listJWTs: async (
      orderBy?: ListJWTsOrderByEnum,
      audienceId?: string,
      pageSize?: number,
      page?: number,
      expired?: boolean,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/jwts`;
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

      if (audienceId !== undefined) {
        localVarQueryParameter['audience_id'] = audienceId;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (expired !== undefined) {
        localVarQueryParameter['expired'] = expired;
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
 * JWTsApi - functional programming interface
 * @export
 */
export const JWTsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = JWTsApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @summary Delete a JWT
     * @param {string} jti JWT ID of the JWT to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteJWT(
      jti: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteJWT(
        jti,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['JWTsApi.deleteJWT']?.[localVarOperationServerIndex]
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
     *
     * @summary Get a JWT
     * @param {string} jti JWT ID of the JWT to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getJWT(
      jti: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1JWT>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getJWT(
        jti,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['JWTsApi.getJWT']?.[localVarOperationServerIndex]
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
     *
     * @summary List JWTs
     * @param {ListJWTsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {string} [audienceId] ID of the user to search.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater to 1.
     * @param {boolean} [expired] Filter out expired JWTs or not.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listJWTs(
      orderBy?: ListJWTsOrderByEnum,
      audienceId?: string,
      pageSize?: number,
      page?: number,
      expired?: boolean,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListJWTsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listJWTs(
        orderBy,
        audienceId,
        pageSize,
        page,
        expired,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['JWTsApi.listJWTs']?.[localVarOperationServerIndex]
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
 * JWTsApi - factory interface
 * @export
 */
export const JWTsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = JWTsApiFp(configuration);
  return {
    /**
     *
     * @summary Delete a JWT
     * @param {string} jti JWT ID of the JWT to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteJWT(
      jti: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteJWT(jti, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Get a JWT
     * @param {string} jti JWT ID of the JWT to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getJWT(
      jti: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1JWT> {
      return localVarFp
        .getJWT(jti, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary List JWTs
     * @param {ListJWTsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {string} [audienceId] ID of the user to search.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater to 1.
     * @param {boolean} [expired] Filter out expired JWTs or not.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listJWTs(
      orderBy?: ListJWTsOrderByEnum,
      audienceId?: string,
      pageSize?: number,
      page?: number,
      expired?: boolean,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListJWTsResponse> {
      return localVarFp
        .listJWTs(orderBy, audienceId, pageSize, page, expired, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * JWTsApi - interface
 * @export
 * @interface JWTsApi
 */
export interface JWTsApiInterface {
  /**
   *
   * @summary Delete a JWT
   * @param {string} jti JWT ID of the JWT to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof JWTsApiInterface
   */
  deleteJWT(jti: string, options?: RawAxiosRequestConfig): AxiosPromise<void>;

  /**
   *
   * @summary Get a JWT
   * @param {string} jti JWT ID of the JWT to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof JWTsApiInterface
   */
  getJWT(
    jti: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1JWT>;

  /**
   *
   * @summary List JWTs
   * @param {ListJWTsOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {string} [audienceId] ID of the user to search.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater to 1.
   * @param {boolean} [expired] Filter out expired JWTs or not.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof JWTsApiInterface
   */
  listJWTs(
    orderBy?: ListJWTsOrderByEnum,
    audienceId?: string,
    pageSize?: number,
    page?: number,
    expired?: boolean,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListJWTsResponse>;
}

/**
 * JWTsApi - object-oriented interface
 * @export
 * @class JWTsApi
 * @extends {BaseAPI}
 */
export class JWTsApi extends BaseAPI implements JWTsApiInterface {
  /**
   *
   * @summary Delete a JWT
   * @param {string} jti JWT ID of the JWT to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof JWTsApi
   */
  public deleteJWT(jti: string, options?: RawAxiosRequestConfig) {
    return JWTsApiFp(this.configuration)
      .deleteJWT(jti, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Get a JWT
   * @param {string} jti JWT ID of the JWT to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof JWTsApi
   */
  public getJWT(jti: string, options?: RawAxiosRequestConfig) {
    return JWTsApiFp(this.configuration)
      .getJWT(jti, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary List JWTs
   * @param {ListJWTsOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {string} [audienceId] ID of the user to search.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater to 1.
   * @param {boolean} [expired] Filter out expired JWTs or not.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof JWTsApi
   */
  public listJWTs(
    orderBy?: ListJWTsOrderByEnum,
    audienceId?: string,
    pageSize?: number,
    page?: number,
    expired?: boolean,
    options?: RawAxiosRequestConfig,
  ) {
    return JWTsApiFp(this.configuration)
      .listJWTs(orderBy, audienceId, pageSize, page, expired, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListJWTsOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  UpdatedAtAsc: 'updated_at_asc',
  UpdatedAtDesc: 'updated_at_desc',
} as const;
export type ListJWTsOrderByEnum =
  (typeof ListJWTsOrderByEnum)[keyof typeof ListJWTsOrderByEnum];

/**
 * LogsApi - axios parameter creator
 * @export
 */
export const LogsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Retrieve information about a log, specified by the `log_id` parameter. The log\'s full details, including `id`, `ip`, `user_agent`, `action`, `bearer_id`, `resource_type` and `resource_id` are returned in the response.
     * @summary Get a log
     * @param {string} logId ID of the log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getLog: async (
      logId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'logId' is not null or undefined
      assertParamExists('getLog', 'logId', logId);
      const localVarPath = `/iam/v1alpha1/logs/{log_id}`.replace(
        `{${'log_id'}}`,
        encodeURIComponent(String(logId)),
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
     * List logs available for given Organization. You must define the `organization_id` in the query path of your request.
     * @summary List logs
     * @param {ListLogsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {string} [organizationId] Filter by Organization ID.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater to 1.
     * @param {string} [createdAfter] Defined whether or not to filter out logs created after this timestamp. (RFC 3339 format)
     * @param {string} [createdBefore] Defined whether or not to filter out logs created before this timestamp. (RFC 3339 format)
     * @param {ListLogsActionEnum} [action] Defined whether or not to filter out by a specific action.
     * @param {ListLogsResourceTypeEnum} [resourceType] Defined whether or not to filter out by a specific type of resource.
     * @param {string} [search] Defined whether or not to filter out log by bearer ID or resource ID.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listLogs: async (
      orderBy?: ListLogsOrderByEnum,
      organizationId?: string,
      pageSize?: number,
      page?: number,
      createdAfter?: string,
      createdBefore?: string,
      action?: ListLogsActionEnum,
      resourceType?: ListLogsResourceTypeEnum,
      search?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/logs`;
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

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (createdAfter !== undefined) {
        localVarQueryParameter['created_after'] =
          (createdAfter as any) instanceof Date
            ? (createdAfter as any).toISOString()
            : createdAfter;
      }

      if (createdBefore !== undefined) {
        localVarQueryParameter['created_before'] =
          (createdBefore as any) instanceof Date
            ? (createdBefore as any).toISOString()
            : createdBefore;
      }

      if (action !== undefined) {
        localVarQueryParameter['action'] = action;
      }

      if (resourceType !== undefined) {
        localVarQueryParameter['resource_type'] = resourceType;
      }

      if (search !== undefined) {
        localVarQueryParameter['search'] = search;
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
 * LogsApi - functional programming interface
 * @export
 */
export const LogsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = LogsApiAxiosParamCreator(configuration);
  return {
    /**
     * Retrieve information about a log, specified by the `log_id` parameter. The log\'s full details, including `id`, `ip`, `user_agent`, `action`, `bearer_id`, `resource_type` and `resource_id` are returned in the response.
     * @summary Get a log
     * @param {string} logId ID of the log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getLog(
      logId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Log>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getLog(
        logId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['LogsApi.getLog']?.[localVarOperationServerIndex]
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
     * List logs available for given Organization. You must define the `organization_id` in the query path of your request.
     * @summary List logs
     * @param {ListLogsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {string} [organizationId] Filter by Organization ID.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater to 1.
     * @param {string} [createdAfter] Defined whether or not to filter out logs created after this timestamp. (RFC 3339 format)
     * @param {string} [createdBefore] Defined whether or not to filter out logs created before this timestamp. (RFC 3339 format)
     * @param {ListLogsActionEnum} [action] Defined whether or not to filter out by a specific action.
     * @param {ListLogsResourceTypeEnum} [resourceType] Defined whether or not to filter out by a specific type of resource.
     * @param {string} [search] Defined whether or not to filter out log by bearer ID or resource ID.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listLogs(
      orderBy?: ListLogsOrderByEnum,
      organizationId?: string,
      pageSize?: number,
      page?: number,
      createdAfter?: string,
      createdBefore?: string,
      action?: ListLogsActionEnum,
      resourceType?: ListLogsResourceTypeEnum,
      search?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListLogsResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listLogs(
        orderBy,
        organizationId,
        pageSize,
        page,
        createdAfter,
        createdBefore,
        action,
        resourceType,
        search,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['LogsApi.listLogs']?.[localVarOperationServerIndex]
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
 * LogsApi - factory interface
 * @export
 */
export const LogsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = LogsApiFp(configuration);
  return {
    /**
     * Retrieve information about a log, specified by the `log_id` parameter. The log\'s full details, including `id`, `ip`, `user_agent`, `action`, `bearer_id`, `resource_type` and `resource_id` are returned in the response.
     * @summary Get a log
     * @param {string} logId ID of the log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getLog(
      logId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Log> {
      return localVarFp
        .getLog(logId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List logs available for given Organization. You must define the `organization_id` in the query path of your request.
     * @summary List logs
     * @param {ListLogsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {string} [organizationId] Filter by Organization ID.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater to 1.
     * @param {string} [createdAfter] Defined whether or not to filter out logs created after this timestamp. (RFC 3339 format)
     * @param {string} [createdBefore] Defined whether or not to filter out logs created before this timestamp. (RFC 3339 format)
     * @param {ListLogsActionEnum} [action] Defined whether or not to filter out by a specific action.
     * @param {ListLogsResourceTypeEnum} [resourceType] Defined whether or not to filter out by a specific type of resource.
     * @param {string} [search] Defined whether or not to filter out log by bearer ID or resource ID.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listLogs(
      orderBy?: ListLogsOrderByEnum,
      organizationId?: string,
      pageSize?: number,
      page?: number,
      createdAfter?: string,
      createdBefore?: string,
      action?: ListLogsActionEnum,
      resourceType?: ListLogsResourceTypeEnum,
      search?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListLogsResponse> {
      return localVarFp
        .listLogs(
          orderBy,
          organizationId,
          pageSize,
          page,
          createdAfter,
          createdBefore,
          action,
          resourceType,
          search,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * LogsApi - interface
 * @export
 * @interface LogsApi
 */
export interface LogsApiInterface {
  /**
   * Retrieve information about a log, specified by the `log_id` parameter. The log\'s full details, including `id`, `ip`, `user_agent`, `action`, `bearer_id`, `resource_type` and `resource_id` are returned in the response.
   * @summary Get a log
   * @param {string} logId ID of the log.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LogsApiInterface
   */
  getLog(
    logId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Log>;

  /**
   * List logs available for given Organization. You must define the `organization_id` in the query path of your request.
   * @summary List logs
   * @param {ListLogsOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {string} [organizationId] Filter by Organization ID.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater to 1.
   * @param {string} [createdAfter] Defined whether or not to filter out logs created after this timestamp. (RFC 3339 format)
   * @param {string} [createdBefore] Defined whether or not to filter out logs created before this timestamp. (RFC 3339 format)
   * @param {ListLogsActionEnum} [action] Defined whether or not to filter out by a specific action.
   * @param {ListLogsResourceTypeEnum} [resourceType] Defined whether or not to filter out by a specific type of resource.
   * @param {string} [search] Defined whether or not to filter out log by bearer ID or resource ID.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LogsApiInterface
   */
  listLogs(
    orderBy?: ListLogsOrderByEnum,
    organizationId?: string,
    pageSize?: number,
    page?: number,
    createdAfter?: string,
    createdBefore?: string,
    action?: ListLogsActionEnum,
    resourceType?: ListLogsResourceTypeEnum,
    search?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListLogsResponse>;
}

/**
 * LogsApi - object-oriented interface
 * @export
 * @class LogsApi
 * @extends {BaseAPI}
 */
export class LogsApi extends BaseAPI implements LogsApiInterface {
  /**
   * Retrieve information about a log, specified by the `log_id` parameter. The log\'s full details, including `id`, `ip`, `user_agent`, `action`, `bearer_id`, `resource_type` and `resource_id` are returned in the response.
   * @summary Get a log
   * @param {string} logId ID of the log.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LogsApi
   */
  public getLog(logId: string, options?: RawAxiosRequestConfig) {
    return LogsApiFp(this.configuration)
      .getLog(logId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List logs available for given Organization. You must define the `organization_id` in the query path of your request.
   * @summary List logs
   * @param {ListLogsOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {string} [organizationId] Filter by Organization ID.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater to 1.
   * @param {string} [createdAfter] Defined whether or not to filter out logs created after this timestamp. (RFC 3339 format)
   * @param {string} [createdBefore] Defined whether or not to filter out logs created before this timestamp. (RFC 3339 format)
   * @param {ListLogsActionEnum} [action] Defined whether or not to filter out by a specific action.
   * @param {ListLogsResourceTypeEnum} [resourceType] Defined whether or not to filter out by a specific type of resource.
   * @param {string} [search] Defined whether or not to filter out log by bearer ID or resource ID.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof LogsApi
   */
  public listLogs(
    orderBy?: ListLogsOrderByEnum,
    organizationId?: string,
    pageSize?: number,
    page?: number,
    createdAfter?: string,
    createdBefore?: string,
    action?: ListLogsActionEnum,
    resourceType?: ListLogsResourceTypeEnum,
    search?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return LogsApiFp(this.configuration)
      .listLogs(
        orderBy,
        organizationId,
        pageSize,
        page,
        createdAfter,
        createdBefore,
        action,
        resourceType,
        search,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListLogsOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
} as const;
export type ListLogsOrderByEnum =
  (typeof ListLogsOrderByEnum)[keyof typeof ListLogsOrderByEnum];
/**
 * @export
 */
export const ListLogsActionEnum = {
  UnknownAction: 'unknown_action',
  Created: 'created',
  Updated: 'updated',
  Deleted: 'deleted',
} as const;
export type ListLogsActionEnum =
  (typeof ListLogsActionEnum)[keyof typeof ListLogsActionEnum];
/**
 * @export
 */
export const ListLogsResourceTypeEnum = {
  UnknownResourceType: 'unknown_resource_type',
  ApiKey: 'api_key',
  User: 'user',
  Application: 'application',
  Group: 'group',
  Policy: 'policy',
} as const;
export type ListLogsResourceTypeEnum =
  (typeof ListLogsResourceTypeEnum)[keyof typeof ListLogsResourceTypeEnum];

/**
 * PermissionSetsApi - axios parameter creator
 * @export
 */
export const PermissionSetsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List permission sets available for given Organization. You must define the `organization_id` in the query path of your request.
     * @summary List permission sets
     * @param {string} organizationId Filter by Organization ID.
     * @param {ListPermissionSetsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPermissionSets: async (
      organizationId: string,
      orderBy?: ListPermissionSetsOrderByEnum,
      pageSize?: number,
      page?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists('listPermissionSets', 'organizationId', organizationId);
      const localVarPath = `/iam/v1alpha1/permission-sets`;
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

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
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
 * PermissionSetsApi - functional programming interface
 * @export
 */
export const PermissionSetsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    PermissionSetsApiAxiosParamCreator(configuration);
  return {
    /**
     * List permission sets available for given Organization. You must define the `organization_id` in the query path of your request.
     * @summary List permission sets
     * @param {string} organizationId Filter by Organization ID.
     * @param {ListPermissionSetsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listPermissionSets(
      organizationId: string,
      orderBy?: ListPermissionSetsOrderByEnum,
      pageSize?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListPermissionSetsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listPermissionSets(
          organizationId,
          orderBy,
          pageSize,
          page,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PermissionSetsApi.listPermissionSets']?.[
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
 * PermissionSetsApi - factory interface
 * @export
 */
export const PermissionSetsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = PermissionSetsApiFp(configuration);
  return {
    /**
     * List permission sets available for given Organization. You must define the `organization_id` in the query path of your request.
     * @summary List permission sets
     * @param {string} organizationId Filter by Organization ID.
     * @param {ListPermissionSetsOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPermissionSets(
      organizationId: string,
      orderBy?: ListPermissionSetsOrderByEnum,
      pageSize?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListPermissionSetsResponse> {
      return localVarFp
        .listPermissionSets(organizationId, orderBy, pageSize, page, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * PermissionSetsApi - interface
 * @export
 * @interface PermissionSetsApi
 */
export interface PermissionSetsApiInterface {
  /**
   * List permission sets available for given Organization. You must define the `organization_id` in the query path of your request.
   * @summary List permission sets
   * @param {string} organizationId Filter by Organization ID.
   * @param {ListPermissionSetsOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PermissionSetsApiInterface
   */
  listPermissionSets(
    organizationId: string,
    orderBy?: ListPermissionSetsOrderByEnum,
    pageSize?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListPermissionSetsResponse>;
}

/**
 * PermissionSetsApi - object-oriented interface
 * @export
 * @class PermissionSetsApi
 * @extends {BaseAPI}
 */
export class PermissionSetsApi
  extends BaseAPI
  implements PermissionSetsApiInterface
{
  /**
   * List permission sets available for given Organization. You must define the `organization_id` in the query path of your request.
   * @summary List permission sets
   * @param {string} organizationId Filter by Organization ID.
   * @param {ListPermissionSetsOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PermissionSetsApi
   */
  public listPermissionSets(
    organizationId: string,
    orderBy?: ListPermissionSetsOrderByEnum,
    pageSize?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return PermissionSetsApiFp(this.configuration)
      .listPermissionSets(organizationId, orderBy, pageSize, page, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListPermissionSetsOrderByEnum = {
  NameAsc: 'name_asc',
  NameDesc: 'name_desc',
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
} as const;
export type ListPermissionSetsOrderByEnum =
  (typeof ListPermissionSetsOrderByEnum)[keyof typeof ListPermissionSetsOrderByEnum];

/**
 * PoliciesApi - axios parameter creator
 * @export
 */
export const PoliciesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Clone a policy. You must define specify the `policy_id` parameter in your request.
     * @summary Clone a policy
     * @param {string} policyId
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    clonePolicy: async (
      policyId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'policyId' is not null or undefined
      assertParamExists('clonePolicy', 'policyId', policyId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('clonePolicy', 'body', body);
      const localVarPath = `/iam/v1alpha1/policies/{policy_id}/clone`.replace(
        `{${'policy_id'}}`,
        encodeURIComponent(String(policyId)),
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
     * Create a new application. You must define the `name` parameter in the request. You can specify parameters such as `user_id`, `groups_id`, `application_id`, `no_principal`, `rules` and its child attributes.
     * @summary Create a new policy
     * @param {CreatePolicyRequest} createPolicyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPolicy: async (
      createPolicyRequest: CreatePolicyRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'createPolicyRequest' is not null or undefined
      assertParamExists(
        'createPolicy',
        'createPolicyRequest',
        createPolicyRequest,
      );
      const localVarPath = `/iam/v1alpha1/policies`;
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
        createPolicyRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete a policy. You must define specify the `policy_id` parameter in your request. Note that when deleting a policy, all permissions it gives to its principal (user, group or application) will be revoked.
     * @summary Delete a policy
     * @param {string} policyId Id of policy to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePolicy: async (
      policyId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'policyId' is not null or undefined
      assertParamExists('deletePolicy', 'policyId', policyId);
      const localVarPath = `/iam/v1alpha1/policies/{policy_id}`.replace(
        `{${'policy_id'}}`,
        encodeURIComponent(String(policyId)),
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
     * Retrieve information about a policy, specified by the `policy_id` parameter. The policy\'s full details, including `id`, `name`, `organization_id`, `nb_rules` and `nb_scopes`, `nb_permission_sets` are returned in the response.
     * @summary Get an existing policy
     * @param {string} policyId Id of policy to search.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPolicy: async (
      policyId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'policyId' is not null or undefined
      assertParamExists('getPolicy', 'policyId', policyId);
      const localVarPath = `/iam/v1alpha1/policies/{policy_id}`.replace(
        `{${'policy_id'}}`,
        encodeURIComponent(String(policyId)),
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
     * List the policies of an Organization. By default, the policies listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters to filter your query, such as `user_ids`, `groups_ids`, `application_ids`, and `policy_name`.
     * @summary List policies of an Organization
     * @param {ListPoliciesOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {string} [organizationId] ID of the Organization to filter.
     * @param {boolean} [editable] Defines whether or not filter out editable policies.
     * @param {Array<string>} [userIds] Defines whether or not to filter by list of user IDs.
     * @param {Array<string>} [groupIds] Defines whether or not to filter by list of group IDs.
     * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
     * @param {boolean} [noPrincipal] Defines whether or not the policy is attributed to a principal.
     * @param {string} [policyName] Name of the policy to fetch.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {Array<string>} [policyIds] Filter by a list of IDs.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPolicies: async (
      orderBy?: ListPoliciesOrderByEnum,
      pageSize?: number,
      page?: number,
      organizationId?: string,
      editable?: boolean,
      userIds?: Array<string>,
      groupIds?: Array<string>,
      applicationIds?: Array<string>,
      noPrincipal?: boolean,
      policyName?: string,
      tag?: string,
      policyIds?: Array<string>,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/policies`;
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

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (editable !== undefined) {
        localVarQueryParameter['editable'] = editable;
      }

      if (userIds) {
        localVarQueryParameter['user_ids'] = userIds;
      }

      if (groupIds) {
        localVarQueryParameter['group_ids'] = groupIds;
      }

      if (applicationIds) {
        localVarQueryParameter['application_ids'] = applicationIds;
      }

      if (noPrincipal !== undefined) {
        localVarQueryParameter['no_principal'] = noPrincipal;
      }

      if (policyName !== undefined) {
        localVarQueryParameter['policy_name'] = policyName;
      }

      if (tag !== undefined) {
        localVarQueryParameter['tag'] = tag;
      }

      if (policyIds) {
        localVarQueryParameter['policy_ids'] = policyIds;
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
     * Update the parameters of a policy, including `name`, `description`, `user_id`, `group_id`, `application_id` and `no_principal`.
     * @summary Update an existing policy
     * @param {string} policyId Id of policy to update.
     * @param {UpdatePolicyRequest} updatePolicyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePolicy: async (
      policyId: string,
      updatePolicyRequest: UpdatePolicyRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'policyId' is not null or undefined
      assertParamExists('updatePolicy', 'policyId', policyId);
      // verify required parameter 'updatePolicyRequest' is not null or undefined
      assertParamExists(
        'updatePolicy',
        'updatePolicyRequest',
        updatePolicyRequest,
      );
      const localVarPath = `/iam/v1alpha1/policies/{policy_id}`.replace(
        `{${'policy_id'}}`,
        encodeURIComponent(String(policyId)),
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
        updatePolicyRequest,
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
 * PoliciesApi - functional programming interface
 * @export
 */
export const PoliciesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = PoliciesApiAxiosParamCreator(configuration);
  return {
    /**
     * Clone a policy. You must define specify the `policy_id` parameter in your request.
     * @summary Clone a policy
     * @param {string} policyId
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async clonePolicy(
      policyId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Policy>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.clonePolicy(
        policyId,
        body,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PoliciesApi.clonePolicy']?.[
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
     * Create a new application. You must define the `name` parameter in the request. You can specify parameters such as `user_id`, `groups_id`, `application_id`, `no_principal`, `rules` and its child attributes.
     * @summary Create a new policy
     * @param {CreatePolicyRequest} createPolicyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createPolicy(
      createPolicyRequest: CreatePolicyRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Policy>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createPolicy(
        createPolicyRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PoliciesApi.createPolicy']?.[
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
     * Delete a policy. You must define specify the `policy_id` parameter in your request. Note that when deleting a policy, all permissions it gives to its principal (user, group or application) will be revoked.
     * @summary Delete a policy
     * @param {string} policyId Id of policy to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deletePolicy(
      policyId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deletePolicy(
        policyId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PoliciesApi.deletePolicy']?.[
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
     * Retrieve information about a policy, specified by the `policy_id` parameter. The policy\'s full details, including `id`, `name`, `organization_id`, `nb_rules` and `nb_scopes`, `nb_permission_sets` are returned in the response.
     * @summary Get an existing policy
     * @param {string} policyId Id of policy to search.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getPolicy(
      policyId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Policy>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getPolicy(
        policyId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PoliciesApi.getPolicy']?.[
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
     * List the policies of an Organization. By default, the policies listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters to filter your query, such as `user_ids`, `groups_ids`, `application_ids`, and `policy_name`.
     * @summary List policies of an Organization
     * @param {ListPoliciesOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {string} [organizationId] ID of the Organization to filter.
     * @param {boolean} [editable] Defines whether or not filter out editable policies.
     * @param {Array<string>} [userIds] Defines whether or not to filter by list of user IDs.
     * @param {Array<string>} [groupIds] Defines whether or not to filter by list of group IDs.
     * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
     * @param {boolean} [noPrincipal] Defines whether or not the policy is attributed to a principal.
     * @param {string} [policyName] Name of the policy to fetch.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {Array<string>} [policyIds] Filter by a list of IDs.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listPolicies(
      orderBy?: ListPoliciesOrderByEnum,
      pageSize?: number,
      page?: number,
      organizationId?: string,
      editable?: boolean,
      userIds?: Array<string>,
      groupIds?: Array<string>,
      applicationIds?: Array<string>,
      noPrincipal?: boolean,
      policyName?: string,
      tag?: string,
      policyIds?: Array<string>,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListPoliciesResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listPolicies(
        orderBy,
        pageSize,
        page,
        organizationId,
        editable,
        userIds,
        groupIds,
        applicationIds,
        noPrincipal,
        policyName,
        tag,
        policyIds,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PoliciesApi.listPolicies']?.[
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
     * Update the parameters of a policy, including `name`, `description`, `user_id`, `group_id`, `application_id` and `no_principal`.
     * @summary Update an existing policy
     * @param {string} policyId Id of policy to update.
     * @param {UpdatePolicyRequest} updatePolicyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updatePolicy(
      policyId: string,
      updatePolicyRequest: UpdatePolicyRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Policy>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updatePolicy(
        policyId,
        updatePolicyRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['PoliciesApi.updatePolicy']?.[
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
 * PoliciesApi - factory interface
 * @export
 */
export const PoliciesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = PoliciesApiFp(configuration);
  return {
    /**
     * Clone a policy. You must define specify the `policy_id` parameter in your request.
     * @summary Clone a policy
     * @param {string} policyId
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    clonePolicy(
      policyId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Policy> {
      return localVarFp
        .clonePolicy(policyId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a new application. You must define the `name` parameter in the request. You can specify parameters such as `user_id`, `groups_id`, `application_id`, `no_principal`, `rules` and its child attributes.
     * @summary Create a new policy
     * @param {CreatePolicyRequest} createPolicyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createPolicy(
      createPolicyRequest: CreatePolicyRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Policy> {
      return localVarFp
        .createPolicy(createPolicyRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete a policy. You must define specify the `policy_id` parameter in your request. Note that when deleting a policy, all permissions it gives to its principal (user, group or application) will be revoked.
     * @summary Delete a policy
     * @param {string} policyId Id of policy to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deletePolicy(
      policyId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deletePolicy(policyId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve information about a policy, specified by the `policy_id` parameter. The policy\'s full details, including `id`, `name`, `organization_id`, `nb_rules` and `nb_scopes`, `nb_permission_sets` are returned in the response.
     * @summary Get an existing policy
     * @param {string} policyId Id of policy to search.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getPolicy(
      policyId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Policy> {
      return localVarFp
        .getPolicy(policyId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List the policies of an Organization. By default, the policies listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters to filter your query, such as `user_ids`, `groups_ids`, `application_ids`, and `policy_name`.
     * @summary List policies of an Organization
     * @param {ListPoliciesOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {string} [organizationId] ID of the Organization to filter.
     * @param {boolean} [editable] Defines whether or not filter out editable policies.
     * @param {Array<string>} [userIds] Defines whether or not to filter by list of user IDs.
     * @param {Array<string>} [groupIds] Defines whether or not to filter by list of group IDs.
     * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
     * @param {boolean} [noPrincipal] Defines whether or not the policy is attributed to a principal.
     * @param {string} [policyName] Name of the policy to fetch.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {Array<string>} [policyIds] Filter by a list of IDs.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listPolicies(
      orderBy?: ListPoliciesOrderByEnum,
      pageSize?: number,
      page?: number,
      organizationId?: string,
      editable?: boolean,
      userIds?: Array<string>,
      groupIds?: Array<string>,
      applicationIds?: Array<string>,
      noPrincipal?: boolean,
      policyName?: string,
      tag?: string,
      policyIds?: Array<string>,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListPoliciesResponse> {
      return localVarFp
        .listPolicies(
          orderBy,
          pageSize,
          page,
          organizationId,
          editable,
          userIds,
          groupIds,
          applicationIds,
          noPrincipal,
          policyName,
          tag,
          policyIds,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the parameters of a policy, including `name`, `description`, `user_id`, `group_id`, `application_id` and `no_principal`.
     * @summary Update an existing policy
     * @param {string} policyId Id of policy to update.
     * @param {UpdatePolicyRequest} updatePolicyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updatePolicy(
      policyId: string,
      updatePolicyRequest: UpdatePolicyRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Policy> {
      return localVarFp
        .updatePolicy(policyId, updatePolicyRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * PoliciesApi - interface
 * @export
 * @interface PoliciesApi
 */
export interface PoliciesApiInterface {
  /**
   * Clone a policy. You must define specify the `policy_id` parameter in your request.
   * @summary Clone a policy
   * @param {string} policyId
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApiInterface
   */
  clonePolicy(
    policyId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Policy>;

  /**
   * Create a new application. You must define the `name` parameter in the request. You can specify parameters such as `user_id`, `groups_id`, `application_id`, `no_principal`, `rules` and its child attributes.
   * @summary Create a new policy
   * @param {CreatePolicyRequest} createPolicyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApiInterface
   */
  createPolicy(
    createPolicyRequest: CreatePolicyRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Policy>;

  /**
   * Delete a policy. You must define specify the `policy_id` parameter in your request. Note that when deleting a policy, all permissions it gives to its principal (user, group or application) will be revoked.
   * @summary Delete a policy
   * @param {string} policyId Id of policy to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApiInterface
   */
  deletePolicy(
    policyId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Retrieve information about a policy, specified by the `policy_id` parameter. The policy\'s full details, including `id`, `name`, `organization_id`, `nb_rules` and `nb_scopes`, `nb_permission_sets` are returned in the response.
   * @summary Get an existing policy
   * @param {string} policyId Id of policy to search.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApiInterface
   */
  getPolicy(
    policyId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Policy>;

  /**
   * List the policies of an Organization. By default, the policies listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters to filter your query, such as `user_ids`, `groups_ids`, `application_ids`, and `policy_name`.
   * @summary List policies of an Organization
   * @param {ListPoliciesOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {string} [organizationId] ID of the Organization to filter.
   * @param {boolean} [editable] Defines whether or not filter out editable policies.
   * @param {Array<string>} [userIds] Defines whether or not to filter by list of user IDs.
   * @param {Array<string>} [groupIds] Defines whether or not to filter by list of group IDs.
   * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
   * @param {boolean} [noPrincipal] Defines whether or not the policy is attributed to a principal.
   * @param {string} [policyName] Name of the policy to fetch.
   * @param {string} [tag] Filter by tags containing a given string.
   * @param {Array<string>} [policyIds] Filter by a list of IDs.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApiInterface
   */
  listPolicies(
    orderBy?: ListPoliciesOrderByEnum,
    pageSize?: number,
    page?: number,
    organizationId?: string,
    editable?: boolean,
    userIds?: Array<string>,
    groupIds?: Array<string>,
    applicationIds?: Array<string>,
    noPrincipal?: boolean,
    policyName?: string,
    tag?: string,
    policyIds?: Array<string>,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListPoliciesResponse>;

  /**
   * Update the parameters of a policy, including `name`, `description`, `user_id`, `group_id`, `application_id` and `no_principal`.
   * @summary Update an existing policy
   * @param {string} policyId Id of policy to update.
   * @param {UpdatePolicyRequest} updatePolicyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApiInterface
   */
  updatePolicy(
    policyId: string,
    updatePolicyRequest: UpdatePolicyRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Policy>;
}

/**
 * PoliciesApi - object-oriented interface
 * @export
 * @class PoliciesApi
 * @extends {BaseAPI}
 */
export class PoliciesApi extends BaseAPI implements PoliciesApiInterface {
  /**
   * Clone a policy. You must define specify the `policy_id` parameter in your request.
   * @summary Clone a policy
   * @param {string} policyId
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApi
   */
  public clonePolicy(
    policyId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return PoliciesApiFp(this.configuration)
      .clonePolicy(policyId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a new application. You must define the `name` parameter in the request. You can specify parameters such as `user_id`, `groups_id`, `application_id`, `no_principal`, `rules` and its child attributes.
   * @summary Create a new policy
   * @param {CreatePolicyRequest} createPolicyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApi
   */
  public createPolicy(
    createPolicyRequest: CreatePolicyRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PoliciesApiFp(this.configuration)
      .createPolicy(createPolicyRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete a policy. You must define specify the `policy_id` parameter in your request. Note that when deleting a policy, all permissions it gives to its principal (user, group or application) will be revoked.
   * @summary Delete a policy
   * @param {string} policyId Id of policy to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApi
   */
  public deletePolicy(policyId: string, options?: RawAxiosRequestConfig) {
    return PoliciesApiFp(this.configuration)
      .deletePolicy(policyId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve information about a policy, specified by the `policy_id` parameter. The policy\'s full details, including `id`, `name`, `organization_id`, `nb_rules` and `nb_scopes`, `nb_permission_sets` are returned in the response.
   * @summary Get an existing policy
   * @param {string} policyId Id of policy to search.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApi
   */
  public getPolicy(policyId: string, options?: RawAxiosRequestConfig) {
    return PoliciesApiFp(this.configuration)
      .getPolicy(policyId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List the policies of an Organization. By default, the policies listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters to filter your query, such as `user_ids`, `groups_ids`, `application_ids`, and `policy_name`.
   * @summary List policies of an Organization
   * @param {ListPoliciesOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {string} [organizationId] ID of the Organization to filter.
   * @param {boolean} [editable] Defines whether or not filter out editable policies.
   * @param {Array<string>} [userIds] Defines whether or not to filter by list of user IDs.
   * @param {Array<string>} [groupIds] Defines whether or not to filter by list of group IDs.
   * @param {Array<string>} [applicationIds] Filter by a list of application IDs.
   * @param {boolean} [noPrincipal] Defines whether or not the policy is attributed to a principal.
   * @param {string} [policyName] Name of the policy to fetch.
   * @param {string} [tag] Filter by tags containing a given string.
   * @param {Array<string>} [policyIds] Filter by a list of IDs.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApi
   */
  public listPolicies(
    orderBy?: ListPoliciesOrderByEnum,
    pageSize?: number,
    page?: number,
    organizationId?: string,
    editable?: boolean,
    userIds?: Array<string>,
    groupIds?: Array<string>,
    applicationIds?: Array<string>,
    noPrincipal?: boolean,
    policyName?: string,
    tag?: string,
    policyIds?: Array<string>,
    options?: RawAxiosRequestConfig,
  ) {
    return PoliciesApiFp(this.configuration)
      .listPolicies(
        orderBy,
        pageSize,
        page,
        organizationId,
        editable,
        userIds,
        groupIds,
        applicationIds,
        noPrincipal,
        policyName,
        tag,
        policyIds,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the parameters of a policy, including `name`, `description`, `user_id`, `group_id`, `application_id` and `no_principal`.
   * @summary Update an existing policy
   * @param {string} policyId Id of policy to update.
   * @param {UpdatePolicyRequest} updatePolicyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof PoliciesApi
   */
  public updatePolicy(
    policyId: string,
    updatePolicyRequest: UpdatePolicyRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return PoliciesApiFp(this.configuration)
      .updatePolicy(policyId, updatePolicyRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListPoliciesOrderByEnum = {
  PolicyNameAsc: 'policy_name_asc',
  PolicyNameDesc: 'policy_name_desc',
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
} as const;
export type ListPoliciesOrderByEnum =
  (typeof ListPoliciesOrderByEnum)[keyof typeof ListPoliciesOrderByEnum];

/**
 * QuotasApi - axios parameter creator
 * @export
 */
export const QuotasApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Retrieve information about a resource quota, specified by the `quotum_name` parameter. The quota\'s `limit`, or whether it is unlimited, is returned in the response.
     * @summary Get a quota in the Organization
     * @param {string} quotumName Name of the quota to get.
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getQuotum: async (
      quotumName: string,
      organizationId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'quotumName' is not null or undefined
      assertParamExists('getQuotum', 'quotumName', quotumName);
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists('getQuotum', 'organizationId', organizationId);
      const localVarPath = `/iam/v1alpha1/quota/{quotum_name}`.replace(
        `{${'quotum_name'}}`,
        encodeURIComponent(String(quotumName)),
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

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
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
     * List all product and features quota for an Organization, with their associated limits. By default, the quota listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request.
     * @summary List all quotas in the Organization
     * @param {string} organizationId Filter by Organization ID.
     * @param {ListQuotaOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {Array<string>} [quotumNames] List of quotum names to filter from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listQuota: async (
      organizationId: string,
      orderBy?: ListQuotaOrderByEnum,
      pageSize?: number,
      page?: number,
      quotumNames?: Array<string>,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists('listQuota', 'organizationId', organizationId);
      const localVarPath = `/iam/v1alpha1/quota`;
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

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (quotumNames) {
        localVarQueryParameter['quotum_names'] = quotumNames;
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
 * QuotasApi - functional programming interface
 * @export
 */
export const QuotasApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = QuotasApiAxiosParamCreator(configuration);
  return {
    /**
     * Retrieve information about a resource quota, specified by the `quotum_name` parameter. The quota\'s `limit`, or whether it is unlimited, is returned in the response.
     * @summary Get a quota in the Organization
     * @param {string} quotumName Name of the quota to get.
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getQuotum(
      quotumName: string,
      organizationId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Quotum>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getQuotum(
        quotumName,
        organizationId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['QuotasApi.getQuotum']?.[
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
     * List all product and features quota for an Organization, with their associated limits. By default, the quota listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request.
     * @summary List all quotas in the Organization
     * @param {string} organizationId Filter by Organization ID.
     * @param {ListQuotaOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {Array<string>} [quotumNames] List of quotum names to filter from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listQuota(
      organizationId: string,
      orderBy?: ListQuotaOrderByEnum,
      pageSize?: number,
      page?: number,
      quotumNames?: Array<string>,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListQuotaResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listQuota(
        organizationId,
        orderBy,
        pageSize,
        page,
        quotumNames,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['QuotasApi.listQuota']?.[
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
 * QuotasApi - factory interface
 * @export
 */
export const QuotasApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = QuotasApiFp(configuration);
  return {
    /**
     * Retrieve information about a resource quota, specified by the `quotum_name` parameter. The quota\'s `limit`, or whether it is unlimited, is returned in the response.
     * @summary Get a quota in the Organization
     * @param {string} quotumName Name of the quota to get.
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getQuotum(
      quotumName: string,
      organizationId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Quotum> {
      return localVarFp
        .getQuotum(quotumName, organizationId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List all product and features quota for an Organization, with their associated limits. By default, the quota listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request.
     * @summary List all quotas in the Organization
     * @param {string} organizationId Filter by Organization ID.
     * @param {ListQuotaOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {Array<string>} [quotumNames] List of quotum names to filter from.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listQuota(
      organizationId: string,
      orderBy?: ListQuotaOrderByEnum,
      pageSize?: number,
      page?: number,
      quotumNames?: Array<string>,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListQuotaResponse> {
      return localVarFp
        .listQuota(
          organizationId,
          orderBy,
          pageSize,
          page,
          quotumNames,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * QuotasApi - interface
 * @export
 * @interface QuotasApi
 */
export interface QuotasApiInterface {
  /**
   * Retrieve information about a resource quota, specified by the `quotum_name` parameter. The quota\'s `limit`, or whether it is unlimited, is returned in the response.
   * @summary Get a quota in the Organization
   * @param {string} quotumName Name of the quota to get.
   * @param {string} organizationId ID of the Organization.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof QuotasApiInterface
   */
  getQuotum(
    quotumName: string,
    organizationId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Quotum>;

  /**
   * List all product and features quota for an Organization, with their associated limits. By default, the quota listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request.
   * @summary List all quotas in the Organization
   * @param {string} organizationId Filter by Organization ID.
   * @param {ListQuotaOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {Array<string>} [quotumNames] List of quotum names to filter from.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof QuotasApiInterface
   */
  listQuota(
    organizationId: string,
    orderBy?: ListQuotaOrderByEnum,
    pageSize?: number,
    page?: number,
    quotumNames?: Array<string>,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListQuotaResponse>;
}

/**
 * QuotasApi - object-oriented interface
 * @export
 * @class QuotasApi
 * @extends {BaseAPI}
 */
export class QuotasApi extends BaseAPI implements QuotasApiInterface {
  /**
   * Retrieve information about a resource quota, specified by the `quotum_name` parameter. The quota\'s `limit`, or whether it is unlimited, is returned in the response.
   * @summary Get a quota in the Organization
   * @param {string} quotumName Name of the quota to get.
   * @param {string} organizationId ID of the Organization.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof QuotasApi
   */
  public getQuotum(
    quotumName: string,
    organizationId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return QuotasApiFp(this.configuration)
      .getQuotum(quotumName, organizationId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all product and features quota for an Organization, with their associated limits. By default, the quota listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request.
   * @summary List all quotas in the Organization
   * @param {string} organizationId Filter by Organization ID.
   * @param {ListQuotaOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {Array<string>} [quotumNames] List of quotum names to filter from.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof QuotasApi
   */
  public listQuota(
    organizationId: string,
    orderBy?: ListQuotaOrderByEnum,
    pageSize?: number,
    page?: number,
    quotumNames?: Array<string>,
    options?: RawAxiosRequestConfig,
  ) {
    return QuotasApiFp(this.configuration)
      .listQuota(organizationId, orderBy, pageSize, page, quotumNames, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListQuotaOrderByEnum = {
  NameAsc: 'name_asc',
  NameDesc: 'name_desc',
} as const;
export type ListQuotaOrderByEnum =
  (typeof ListQuotaOrderByEnum)[keyof typeof ListQuotaOrderByEnum];

/**
 * RulesApi - axios parameter creator
 * @export
 */
export const RulesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * List the rules of a given policy. By default, the rules listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `policy_id` in the query path of your request.
     * @summary List rules of a given policy
     * @param {string} [policyId] Id of policy to search.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listRules: async (
      policyId?: string,
      pageSize?: number,
      page?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/rules`;
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

      if (policyId !== undefined) {
        localVarQueryParameter['policy_id'] = policyId;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
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
     * Overwrite the rules of a given policy. Any information that you add using this command will overwrite the previous configuration. If you include some of the rules you already had in your previous configuration in your new one, but you change their order, the new order of display will apply. While policy rules are ordered, they have no impact on the access logic of IAM because rules are allow-only.
     * @summary Set rules of a given policy
     * @param {SetRulesRequest} setRulesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setRules: async (
      setRulesRequest: SetRulesRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'setRulesRequest' is not null or undefined
      assertParamExists('setRules', 'setRulesRequest', setRulesRequest);
      const localVarPath = `/iam/v1alpha1/rules`;
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
        setRulesRequest,
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
 * RulesApi - functional programming interface
 * @export
 */
export const RulesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = RulesApiAxiosParamCreator(configuration);
  return {
    /**
     * List the rules of a given policy. By default, the rules listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `policy_id` in the query path of your request.
     * @summary List rules of a given policy
     * @param {string} [policyId] Id of policy to search.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listRules(
      policyId?: string,
      pageSize?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListRulesResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listRules(
        policyId,
        pageSize,
        page,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RulesApi.listRules']?.[localVarOperationServerIndex]
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
     * Overwrite the rules of a given policy. Any information that you add using this command will overwrite the previous configuration. If you include some of the rules you already had in your previous configuration in your new one, but you change their order, the new order of display will apply. While policy rules are ordered, they have no impact on the access logic of IAM because rules are allow-only.
     * @summary Set rules of a given policy
     * @param {SetRulesRequest} setRulesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setRules(
      setRulesRequest: SetRulesRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1SetRulesResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.setRules(
        setRulesRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RulesApi.setRules']?.[localVarOperationServerIndex]
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
 * RulesApi - factory interface
 * @export
 */
export const RulesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = RulesApiFp(configuration);
  return {
    /**
     * List the rules of a given policy. By default, the rules listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `policy_id` in the query path of your request.
     * @summary List rules of a given policy
     * @param {string} [policyId] Id of policy to search.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater than 1.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listRules(
      policyId?: string,
      pageSize?: number,
      page?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListRulesResponse> {
      return localVarFp
        .listRules(policyId, pageSize, page, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Overwrite the rules of a given policy. Any information that you add using this command will overwrite the previous configuration. If you include some of the rules you already had in your previous configuration in your new one, but you change their order, the new order of display will apply. While policy rules are ordered, they have no impact on the access logic of IAM because rules are allow-only.
     * @summary Set rules of a given policy
     * @param {SetRulesRequest} setRulesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setRules(
      setRulesRequest: SetRulesRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1SetRulesResponse> {
      return localVarFp
        .setRules(setRulesRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * RulesApi - interface
 * @export
 * @interface RulesApi
 */
export interface RulesApiInterface {
  /**
   * List the rules of a given policy. By default, the rules listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `policy_id` in the query path of your request.
   * @summary List rules of a given policy
   * @param {string} [policyId] Id of policy to search.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RulesApiInterface
   */
  listRules(
    policyId?: string,
    pageSize?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListRulesResponse>;

  /**
   * Overwrite the rules of a given policy. Any information that you add using this command will overwrite the previous configuration. If you include some of the rules you already had in your previous configuration in your new one, but you change their order, the new order of display will apply. While policy rules are ordered, they have no impact on the access logic of IAM because rules are allow-only.
   * @summary Set rules of a given policy
   * @param {SetRulesRequest} setRulesRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RulesApiInterface
   */
  setRules(
    setRulesRequest: SetRulesRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1SetRulesResponse>;
}

/**
 * RulesApi - object-oriented interface
 * @export
 * @class RulesApi
 * @extends {BaseAPI}
 */
export class RulesApi extends BaseAPI implements RulesApiInterface {
  /**
   * List the rules of a given policy. By default, the rules listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `policy_id` in the query path of your request.
   * @summary List rules of a given policy
   * @param {string} [policyId] Id of policy to search.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater than 1.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RulesApi
   */
  public listRules(
    policyId?: string,
    pageSize?: number,
    page?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return RulesApiFp(this.configuration)
      .listRules(policyId, pageSize, page, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Overwrite the rules of a given policy. Any information that you add using this command will overwrite the previous configuration. If you include some of the rules you already had in your previous configuration in your new one, but you change their order, the new order of display will apply. While policy rules are ordered, they have no impact on the access logic of IAM because rules are allow-only.
   * @summary Set rules of a given policy
   * @param {SetRulesRequest} setRulesRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RulesApi
   */
  public setRules(
    setRulesRequest: SetRulesRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return RulesApiFp(this.configuration)
      .setRules(setRulesRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * SAMLApi - axios parameter creator
 * @export
 */
export const SAMLApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     *
     * @summary Add a SAML certificate
     * @param {string} samlId ID of the SAML configuration.
     * @param {AddSamlCertificateRequest} addSamlCertificateRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addSamlCertificate: async (
      samlId: string,
      addSamlCertificateRequest: AddSamlCertificateRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'samlId' is not null or undefined
      assertParamExists('addSamlCertificate', 'samlId', samlId);
      // verify required parameter 'addSamlCertificateRequest' is not null or undefined
      assertParamExists(
        'addSamlCertificate',
        'addSamlCertificateRequest',
        addSamlCertificateRequest,
      );
      const localVarPath = `/iam/v1alpha1/saml/{saml_id}/certificates`.replace(
        `{${'saml_id'}}`,
        encodeURIComponent(String(samlId)),
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
        addSamlCertificateRequest,
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
     * @summary Disable SAML Identity Provider for an Organization
     * @param {string} samlId ID of the SAML configuration.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSaml: async (
      samlId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'samlId' is not null or undefined
      assertParamExists('deleteSaml', 'samlId', samlId);
      const localVarPath = `/iam/v1alpha1/saml/{saml_id}`.replace(
        `{${'saml_id'}}`,
        encodeURIComponent(String(samlId)),
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
     *
     * @summary Delete a SAML certificate
     * @param {string} certificateId ID of the certificate to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSamlCertificate: async (
      certificateId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'certificateId' is not null or undefined
      assertParamExists(
        'deleteSamlCertificate',
        'certificateId',
        certificateId,
      );
      const localVarPath =
        `/iam/v1alpha1/saml-certificates/{certificate_id}`.replace(
          `{${'certificate_id'}}`,
          encodeURIComponent(String(certificateId)),
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
     *
     * @summary Enable SAML Identity Provider for an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    enableOrganizationSaml: async (
      organizationId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists(
        'enableOrganizationSaml',
        'organizationId',
        organizationId,
      );
      // verify required parameter 'body' is not null or undefined
      assertParamExists('enableOrganizationSaml', 'body', body);
      const localVarPath =
        `/iam/v1alpha1/organizations/{organization_id}/saml`.replace(
          `{${'organization_id'}}`,
          encodeURIComponent(String(organizationId)),
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
     *
     * @summary Get SAML Identity Provider configuration of an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOrganizationSaml: async (
      organizationId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists(
        'getOrganizationSaml',
        'organizationId',
        organizationId,
      );
      const localVarPath =
        `/iam/v1alpha1/organizations/{organization_id}/saml`.replace(
          `{${'organization_id'}}`,
          encodeURIComponent(String(organizationId)),
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
     *
     * @summary Get a SAML certificate
     * @param {string} certificateId ID of the certificate to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSamlCertificate: async (
      certificateId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'certificateId' is not null or undefined
      assertParamExists('getSamlCertificate', 'certificateId', certificateId);
      const localVarPath =
        `/iam/v1alpha1/saml-certificates/{certificate_id}`.replace(
          `{${'certificate_id'}}`,
          encodeURIComponent(String(certificateId)),
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
     *
     * @summary List SAML certificates
     * @param {string} samlId ID of the SAML configuration.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSamlCertificates: async (
      samlId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'samlId' is not null or undefined
      assertParamExists('listSamlCertificates', 'samlId', samlId);
      const localVarPath = `/iam/v1alpha1/saml/{saml_id}/certificates`.replace(
        `{${'saml_id'}}`,
        encodeURIComponent(String(samlId)),
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
     *
     * @summary Update SAML Identity Provider configuration
     * @param {string} samlId ID of the SAML configuration.
     * @param {UpdateSamlRequest} updateSamlRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSaml: async (
      samlId: string,
      updateSamlRequest: UpdateSamlRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'samlId' is not null or undefined
      assertParamExists('updateSaml', 'samlId', samlId);
      // verify required parameter 'updateSamlRequest' is not null or undefined
      assertParamExists('updateSaml', 'updateSamlRequest', updateSamlRequest);
      const localVarPath = `/iam/v1alpha1/saml/{saml_id}`.replace(
        `{${'saml_id'}}`,
        encodeURIComponent(String(samlId)),
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
        updateSamlRequest,
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
 * SAMLApi - functional programming interface
 * @export
 */
export const SAMLApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = SAMLApiAxiosParamCreator(configuration);
  return {
    /**
     *
     * @summary Add a SAML certificate
     * @param {string} samlId ID of the SAML configuration.
     * @param {AddSamlCertificateRequest} addSamlCertificateRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async addSamlCertificate(
      samlId: string,
      addSamlCertificateRequest: AddSamlCertificateRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1SamlCertificate>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.addSamlCertificate(
          samlId,
          addSamlCertificateRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SAMLApi.addSamlCertificate']?.[
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
     * @summary Disable SAML Identity Provider for an Organization
     * @param {string} samlId ID of the SAML configuration.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSaml(
      samlId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteSaml(
        samlId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SAMLApi.deleteSaml']?.[localVarOperationServerIndex]
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
     *
     * @summary Delete a SAML certificate
     * @param {string} certificateId ID of the certificate to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSamlCertificate(
      certificateId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteSamlCertificate(
          certificateId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SAMLApi.deleteSamlCertificate']?.[
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
     * @summary Enable SAML Identity Provider for an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async enableOrganizationSaml(
      organizationId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Saml>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.enableOrganizationSaml(
          organizationId,
          body,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SAMLApi.enableOrganizationSaml']?.[
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
     * @summary Get SAML Identity Provider configuration of an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getOrganizationSaml(
      organizationId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Saml>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getOrganizationSaml(
          organizationId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SAMLApi.getOrganizationSaml']?.[
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
     * @summary Get a SAML certificate
     * @param {string} certificateId ID of the certificate to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSamlCertificate(
      certificateId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1SamlCertificate>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getSamlCertificate(
          certificateId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SAMLApi.getSamlCertificate']?.[
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
     * @summary List SAML certificates
     * @param {string} samlId ID of the SAML configuration.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listSamlCertificates(
      samlId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListSamlCertificatesResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listSamlCertificates(samlId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SAMLApi.listSamlCertificates']?.[
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
     * @summary Update SAML Identity Provider configuration
     * @param {string} samlId ID of the SAML configuration.
     * @param {UpdateSamlRequest} updateSamlRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateSaml(
      samlId: string,
      updateSamlRequest: UpdateSamlRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1Saml>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateSaml(
        samlId,
        updateSamlRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SAMLApi.updateSaml']?.[localVarOperationServerIndex]
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
 * SAMLApi - factory interface
 * @export
 */
export const SAMLApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = SAMLApiFp(configuration);
  return {
    /**
     *
     * @summary Add a SAML certificate
     * @param {string} samlId ID of the SAML configuration.
     * @param {AddSamlCertificateRequest} addSamlCertificateRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    addSamlCertificate(
      samlId: string,
      addSamlCertificateRequest: AddSamlCertificateRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1SamlCertificate> {
      return localVarFp
        .addSamlCertificate(samlId, addSamlCertificateRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Disable SAML Identity Provider for an Organization
     * @param {string} samlId ID of the SAML configuration.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSaml(
      samlId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteSaml(samlId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Delete a SAML certificate
     * @param {string} certificateId ID of the certificate to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSamlCertificate(
      certificateId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteSamlCertificate(certificateId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Enable SAML Identity Provider for an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    enableOrganizationSaml(
      organizationId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Saml> {
      return localVarFp
        .enableOrganizationSaml(organizationId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Get SAML Identity Provider configuration of an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOrganizationSaml(
      organizationId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Saml> {
      return localVarFp
        .getOrganizationSaml(organizationId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Get a SAML certificate
     * @param {string} certificateId ID of the certificate to get.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSamlCertificate(
      certificateId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1SamlCertificate> {
      return localVarFp
        .getSamlCertificate(certificateId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary List SAML certificates
     * @param {string} samlId ID of the SAML configuration.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSamlCertificates(
      samlId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListSamlCertificatesResponse> {
      return localVarFp
        .listSamlCertificates(samlId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Update SAML Identity Provider configuration
     * @param {string} samlId ID of the SAML configuration.
     * @param {UpdateSamlRequest} updateSamlRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSaml(
      samlId: string,
      updateSamlRequest: UpdateSamlRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1Saml> {
      return localVarFp
        .updateSaml(samlId, updateSamlRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SAMLApi - interface
 * @export
 * @interface SAMLApi
 */
export interface SAMLApiInterface {
  /**
   *
   * @summary Add a SAML certificate
   * @param {string} samlId ID of the SAML configuration.
   * @param {AddSamlCertificateRequest} addSamlCertificateRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApiInterface
   */
  addSamlCertificate(
    samlId: string,
    addSamlCertificateRequest: AddSamlCertificateRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1SamlCertificate>;

  /**
   *
   * @summary Disable SAML Identity Provider for an Organization
   * @param {string} samlId ID of the SAML configuration.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApiInterface
   */
  deleteSaml(
    samlId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   *
   * @summary Delete a SAML certificate
   * @param {string} certificateId ID of the certificate to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApiInterface
   */
  deleteSamlCertificate(
    certificateId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   *
   * @summary Enable SAML Identity Provider for an Organization
   * @param {string} organizationId ID of the Organization.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApiInterface
   */
  enableOrganizationSaml(
    organizationId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Saml>;

  /**
   *
   * @summary Get SAML Identity Provider configuration of an Organization
   * @param {string} organizationId ID of the Organization.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApiInterface
   */
  getOrganizationSaml(
    organizationId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Saml>;

  /**
   *
   * @summary Get a SAML certificate
   * @param {string} certificateId ID of the certificate to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApiInterface
   */
  getSamlCertificate(
    certificateId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1SamlCertificate>;

  /**
   *
   * @summary List SAML certificates
   * @param {string} samlId ID of the SAML configuration.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApiInterface
   */
  listSamlCertificates(
    samlId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListSamlCertificatesResponse>;

  /**
   *
   * @summary Update SAML Identity Provider configuration
   * @param {string} samlId ID of the SAML configuration.
   * @param {UpdateSamlRequest} updateSamlRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApiInterface
   */
  updateSaml(
    samlId: string,
    updateSamlRequest: UpdateSamlRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1Saml>;
}

/**
 * SAMLApi - object-oriented interface
 * @export
 * @class SAMLApi
 * @extends {BaseAPI}
 */
export class SAMLApi extends BaseAPI implements SAMLApiInterface {
  /**
   *
   * @summary Add a SAML certificate
   * @param {string} samlId ID of the SAML configuration.
   * @param {AddSamlCertificateRequest} addSamlCertificateRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApi
   */
  public addSamlCertificate(
    samlId: string,
    addSamlCertificateRequest: AddSamlCertificateRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SAMLApiFp(this.configuration)
      .addSamlCertificate(samlId, addSamlCertificateRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Disable SAML Identity Provider for an Organization
   * @param {string} samlId ID of the SAML configuration.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApi
   */
  public deleteSaml(samlId: string, options?: RawAxiosRequestConfig) {
    return SAMLApiFp(this.configuration)
      .deleteSaml(samlId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Delete a SAML certificate
   * @param {string} certificateId ID of the certificate to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApi
   */
  public deleteSamlCertificate(
    certificateId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SAMLApiFp(this.configuration)
      .deleteSamlCertificate(certificateId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Enable SAML Identity Provider for an Organization
   * @param {string} organizationId ID of the Organization.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApi
   */
  public enableOrganizationSaml(
    organizationId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return SAMLApiFp(this.configuration)
      .enableOrganizationSaml(organizationId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Get SAML Identity Provider configuration of an Organization
   * @param {string} organizationId ID of the Organization.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApi
   */
  public getOrganizationSaml(
    organizationId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SAMLApiFp(this.configuration)
      .getOrganizationSaml(organizationId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Get a SAML certificate
   * @param {string} certificateId ID of the certificate to get.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApi
   */
  public getSamlCertificate(
    certificateId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SAMLApiFp(this.configuration)
      .getSamlCertificate(certificateId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary List SAML certificates
   * @param {string} samlId ID of the SAML configuration.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApi
   */
  public listSamlCertificates(samlId: string, options?: RawAxiosRequestConfig) {
    return SAMLApiFp(this.configuration)
      .listSamlCertificates(samlId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Update SAML Identity Provider configuration
   * @param {string} samlId ID of the SAML configuration.
   * @param {UpdateSamlRequest} updateSamlRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SAMLApi
   */
  public updateSaml(
    samlId: string,
    updateSamlRequest: UpdateSamlRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SAMLApiFp(this.configuration)
      .updateSaml(samlId, updateSamlRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * SSHKeysApi - axios parameter creator
 * @export
 */
export const SSHKeysApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Add a new SSH key to a Scaleway Project. You must specify the `name`, `public_key` and `project_id`.
     * @summary Create an SSH key
     * @param {CreateSSHKeyRequest} createSSHKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSSHKey: async (
      createSSHKeyRequest: CreateSSHKeyRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'createSSHKeyRequest' is not null or undefined
      assertParamExists(
        'createSSHKey',
        'createSSHKeyRequest',
        createSSHKeyRequest,
      );
      const localVarPath = `/iam/v1alpha1/ssh-keys`;
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
        createSSHKeyRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete a given SSH key, specified by the `ssh_key_id`. Deleting an SSH is permanent, and cannot be undone. Note that you might need to update any configurations that used the SSH key.
     * @summary Delete an SSH key
     * @param {string} sshKeyId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSSHKey: async (
      sshKeyId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'sshKeyId' is not null or undefined
      assertParamExists('deleteSSHKey', 'sshKeyId', sshKeyId);
      const localVarPath = `/iam/v1alpha1/ssh-keys/{ssh_key_id}`.replace(
        `{${'ssh_key_id'}}`,
        encodeURIComponent(String(sshKeyId)),
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
     * Retrieve information about a given SSH key, specified by the `ssh_key_id` parameter. The SSH key\'s full details, including `id`, `name`, `public_key`, and `project_id` are returned in the response.
     * @summary Get an SSH key
     * @param {string} sshKeyId ID of the SSH key.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSSHKey: async (
      sshKeyId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'sshKeyId' is not null or undefined
      assertParamExists('getSSHKey', 'sshKeyId', sshKeyId);
      const localVarPath = `/iam/v1alpha1/ssh-keys/{ssh_key_id}`.replace(
        `{${'ssh_key_id'}}`,
        encodeURIComponent(String(sshKeyId)),
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
     * List SSH keys. By default, the SSH keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `organization_id`, `name`, `project_id` and `disabled`.
     * @summary List SSH keys
     * @param {ListSSHKeysOrderByEnum} [orderBy] Sort order of the SSH keys.
     * @param {number} [page] Requested page number. Value must be greater or equal to 1.
     * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
     * @param {string} [organizationId] Filter by Organization ID.
     * @param {string} [name] Name of group to find.
     * @param {string} [projectId] Filter by Project ID.
     * @param {boolean} [disabled] Defines whether to include disabled SSH keys or not.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSSHKeys: async (
      orderBy?: ListSSHKeysOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      name?: string,
      projectId?: string,
      disabled?: boolean,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/ssh-keys`;
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

      if (name !== undefined) {
        localVarQueryParameter['name'] = name;
      }

      if (projectId !== undefined) {
        localVarQueryParameter['project_id'] = projectId;
      }

      if (disabled !== undefined) {
        localVarQueryParameter['disabled'] = disabled;
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
     * Update the parameters of an SSH key, including `name` and `disable`.
     * @summary Update an SSH key
     * @param {string} sshKeyId
     * @param {UpdateSSHKeyRequest} updateSSHKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSSHKey: async (
      sshKeyId: string,
      updateSSHKeyRequest: UpdateSSHKeyRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'sshKeyId' is not null or undefined
      assertParamExists('updateSSHKey', 'sshKeyId', sshKeyId);
      // verify required parameter 'updateSSHKeyRequest' is not null or undefined
      assertParamExists(
        'updateSSHKey',
        'updateSSHKeyRequest',
        updateSSHKeyRequest,
      );
      const localVarPath = `/iam/v1alpha1/ssh-keys/{ssh_key_id}`.replace(
        `{${'ssh_key_id'}}`,
        encodeURIComponent(String(sshKeyId)),
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
        updateSSHKeyRequest,
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
 * SSHKeysApi - functional programming interface
 * @export
 */
export const SSHKeysApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = SSHKeysApiAxiosParamCreator(configuration);
  return {
    /**
     * Add a new SSH key to a Scaleway Project. You must specify the `name`, `public_key` and `project_id`.
     * @summary Create an SSH key
     * @param {CreateSSHKeyRequest} createSSHKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createSSHKey(
      createSSHKeyRequest: CreateSSHKeyRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1SSHKey>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createSSHKey(
        createSSHKeyRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SSHKeysApi.createSSHKey']?.[
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
     * Delete a given SSH key, specified by the `ssh_key_id`. Deleting an SSH is permanent, and cannot be undone. Note that you might need to update any configurations that used the SSH key.
     * @summary Delete an SSH key
     * @param {string} sshKeyId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSSHKey(
      sshKeyId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteSSHKey(
        sshKeyId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SSHKeysApi.deleteSSHKey']?.[
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
     * Retrieve information about a given SSH key, specified by the `ssh_key_id` parameter. The SSH key\'s full details, including `id`, `name`, `public_key`, and `project_id` are returned in the response.
     * @summary Get an SSH key
     * @param {string} sshKeyId ID of the SSH key.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSSHKey(
      sshKeyId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1SSHKey>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getSSHKey(
        sshKeyId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SSHKeysApi.getSSHKey']?.[
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
     * List SSH keys. By default, the SSH keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `organization_id`, `name`, `project_id` and `disabled`.
     * @summary List SSH keys
     * @param {ListSSHKeysOrderByEnum} [orderBy] Sort order of the SSH keys.
     * @param {number} [page] Requested page number. Value must be greater or equal to 1.
     * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
     * @param {string} [organizationId] Filter by Organization ID.
     * @param {string} [name] Name of group to find.
     * @param {string} [projectId] Filter by Project ID.
     * @param {boolean} [disabled] Defines whether to include disabled SSH keys or not.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listSSHKeys(
      orderBy?: ListSSHKeysOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      name?: string,
      projectId?: string,
      disabled?: boolean,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListSSHKeysResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listSSHKeys(
        orderBy,
        page,
        pageSize,
        organizationId,
        name,
        projectId,
        disabled,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SSHKeysApi.listSSHKeys']?.[
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
     * Update the parameters of an SSH key, including `name` and `disable`.
     * @summary Update an SSH key
     * @param {string} sshKeyId
     * @param {UpdateSSHKeyRequest} updateSSHKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateSSHKey(
      sshKeyId: string,
      updateSSHKeyRequest: UpdateSSHKeyRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1SSHKey>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateSSHKey(
        sshKeyId,
        updateSSHKeyRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['SSHKeysApi.updateSSHKey']?.[
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
 * SSHKeysApi - factory interface
 * @export
 */
export const SSHKeysApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = SSHKeysApiFp(configuration);
  return {
    /**
     * Add a new SSH key to a Scaleway Project. You must specify the `name`, `public_key` and `project_id`.
     * @summary Create an SSH key
     * @param {CreateSSHKeyRequest} createSSHKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSSHKey(
      createSSHKeyRequest: CreateSSHKeyRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1SSHKey> {
      return localVarFp
        .createSSHKey(createSSHKeyRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete a given SSH key, specified by the `ssh_key_id`. Deleting an SSH is permanent, and cannot be undone. Note that you might need to update any configurations that used the SSH key.
     * @summary Delete an SSH key
     * @param {string} sshKeyId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSSHKey(
      sshKeyId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteSSHKey(sshKeyId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve information about a given SSH key, specified by the `ssh_key_id` parameter. The SSH key\'s full details, including `id`, `name`, `public_key`, and `project_id` are returned in the response.
     * @summary Get an SSH key
     * @param {string} sshKeyId ID of the SSH key.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSSHKey(
      sshKeyId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1SSHKey> {
      return localVarFp
        .getSSHKey(sshKeyId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List SSH keys. By default, the SSH keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `organization_id`, `name`, `project_id` and `disabled`.
     * @summary List SSH keys
     * @param {ListSSHKeysOrderByEnum} [orderBy] Sort order of the SSH keys.
     * @param {number} [page] Requested page number. Value must be greater or equal to 1.
     * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
     * @param {string} [organizationId] Filter by Organization ID.
     * @param {string} [name] Name of group to find.
     * @param {string} [projectId] Filter by Project ID.
     * @param {boolean} [disabled] Defines whether to include disabled SSH keys or not.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSSHKeys(
      orderBy?: ListSSHKeysOrderByEnum,
      page?: number,
      pageSize?: number,
      organizationId?: string,
      name?: string,
      projectId?: string,
      disabled?: boolean,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListSSHKeysResponse> {
      return localVarFp
        .listSSHKeys(
          orderBy,
          page,
          pageSize,
          organizationId,
          name,
          projectId,
          disabled,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the parameters of an SSH key, including `name` and `disable`.
     * @summary Update an SSH key
     * @param {string} sshKeyId
     * @param {UpdateSSHKeyRequest} updateSSHKeyRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSSHKey(
      sshKeyId: string,
      updateSSHKeyRequest: UpdateSSHKeyRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1SSHKey> {
      return localVarFp
        .updateSSHKey(sshKeyId, updateSSHKeyRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SSHKeysApi - interface
 * @export
 * @interface SSHKeysApi
 */
export interface SSHKeysApiInterface {
  /**
   * Add a new SSH key to a Scaleway Project. You must specify the `name`, `public_key` and `project_id`.
   * @summary Create an SSH key
   * @param {CreateSSHKeyRequest} createSSHKeyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApiInterface
   */
  createSSHKey(
    createSSHKeyRequest: CreateSSHKeyRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1SSHKey>;

  /**
   * Delete a given SSH key, specified by the `ssh_key_id`. Deleting an SSH is permanent, and cannot be undone. Note that you might need to update any configurations that used the SSH key.
   * @summary Delete an SSH key
   * @param {string} sshKeyId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApiInterface
   */
  deleteSSHKey(
    sshKeyId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Retrieve information about a given SSH key, specified by the `ssh_key_id` parameter. The SSH key\'s full details, including `id`, `name`, `public_key`, and `project_id` are returned in the response.
   * @summary Get an SSH key
   * @param {string} sshKeyId ID of the SSH key.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApiInterface
   */
  getSSHKey(
    sshKeyId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1SSHKey>;

  /**
   * List SSH keys. By default, the SSH keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `organization_id`, `name`, `project_id` and `disabled`.
   * @summary List SSH keys
   * @param {ListSSHKeysOrderByEnum} [orderBy] Sort order of the SSH keys.
   * @param {number} [page] Requested page number. Value must be greater or equal to 1.
   * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
   * @param {string} [organizationId] Filter by Organization ID.
   * @param {string} [name] Name of group to find.
   * @param {string} [projectId] Filter by Project ID.
   * @param {boolean} [disabled] Defines whether to include disabled SSH keys or not.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApiInterface
   */
  listSSHKeys(
    orderBy?: ListSSHKeysOrderByEnum,
    page?: number,
    pageSize?: number,
    organizationId?: string,
    name?: string,
    projectId?: string,
    disabled?: boolean,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListSSHKeysResponse>;

  /**
   * Update the parameters of an SSH key, including `name` and `disable`.
   * @summary Update an SSH key
   * @param {string} sshKeyId
   * @param {UpdateSSHKeyRequest} updateSSHKeyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApiInterface
   */
  updateSSHKey(
    sshKeyId: string,
    updateSSHKeyRequest: UpdateSSHKeyRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1SSHKey>;
}

/**
 * SSHKeysApi - object-oriented interface
 * @export
 * @class SSHKeysApi
 * @extends {BaseAPI}
 */
export class SSHKeysApi extends BaseAPI implements SSHKeysApiInterface {
  /**
   * Add a new SSH key to a Scaleway Project. You must specify the `name`, `public_key` and `project_id`.
   * @summary Create an SSH key
   * @param {CreateSSHKeyRequest} createSSHKeyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApi
   */
  public createSSHKey(
    createSSHKeyRequest: CreateSSHKeyRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SSHKeysApiFp(this.configuration)
      .createSSHKey(createSSHKeyRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete a given SSH key, specified by the `ssh_key_id`. Deleting an SSH is permanent, and cannot be undone. Note that you might need to update any configurations that used the SSH key.
   * @summary Delete an SSH key
   * @param {string} sshKeyId
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApi
   */
  public deleteSSHKey(sshKeyId: string, options?: RawAxiosRequestConfig) {
    return SSHKeysApiFp(this.configuration)
      .deleteSSHKey(sshKeyId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve information about a given SSH key, specified by the `ssh_key_id` parameter. The SSH key\'s full details, including `id`, `name`, `public_key`, and `project_id` are returned in the response.
   * @summary Get an SSH key
   * @param {string} sshKeyId ID of the SSH key.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApi
   */
  public getSSHKey(sshKeyId: string, options?: RawAxiosRequestConfig) {
    return SSHKeysApiFp(this.configuration)
      .getSSHKey(sshKeyId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List SSH keys. By default, the SSH keys listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You can define additional parameters for your query such as `organization_id`, `name`, `project_id` and `disabled`.
   * @summary List SSH keys
   * @param {ListSSHKeysOrderByEnum} [orderBy] Sort order of the SSH keys.
   * @param {number} [page] Requested page number. Value must be greater or equal to 1.
   * @param {number} [pageSize] Number of items per page. Value must be between 1 and 100.
   * @param {string} [organizationId] Filter by Organization ID.
   * @param {string} [name] Name of group to find.
   * @param {string} [projectId] Filter by Project ID.
   * @param {boolean} [disabled] Defines whether to include disabled SSH keys or not.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApi
   */
  public listSSHKeys(
    orderBy?: ListSSHKeysOrderByEnum,
    page?: number,
    pageSize?: number,
    organizationId?: string,
    name?: string,
    projectId?: string,
    disabled?: boolean,
    options?: RawAxiosRequestConfig,
  ) {
    return SSHKeysApiFp(this.configuration)
      .listSSHKeys(
        orderBy,
        page,
        pageSize,
        organizationId,
        name,
        projectId,
        disabled,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the parameters of an SSH key, including `name` and `disable`.
   * @summary Update an SSH key
   * @param {string} sshKeyId
   * @param {UpdateSSHKeyRequest} updateSSHKeyRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SSHKeysApi
   */
  public updateSSHKey(
    sshKeyId: string,
    updateSSHKeyRequest: UpdateSSHKeyRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SSHKeysApiFp(this.configuration)
      .updateSSHKey(sshKeyId, updateSSHKeyRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListSSHKeysOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  UpdatedAtAsc: 'updated_at_asc',
  UpdatedAtDesc: 'updated_at_desc',
  NameAsc: 'name_asc',
  NameDesc: 'name_desc',
} as const;
export type ListSSHKeysOrderByEnum =
  (typeof ListSSHKeysOrderByEnum)[keyof typeof ListSSHKeysOrderByEnum];

/**
 * SecuritySettingsApi - axios parameter creator
 * @export
 */
export const SecuritySettingsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Retrieve information about the security settings of an Organization, specified by the `organization_id` parameter.
     * @summary Get security settings of an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOrganizationSecuritySettings: async (
      organizationId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists(
        'getOrganizationSecuritySettings',
        'organizationId',
        organizationId,
      );
      const localVarPath =
        `/iam/v1alpha1/organizations/{organization_id}/security-settings`.replace(
          `{${'organization_id'}}`,
          encodeURIComponent(String(organizationId)),
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
     *
     * @summary Update the security settings of an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {UpdateOrganizationSecuritySettingsRequest} updateOrganizationSecuritySettingsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateOrganizationSecuritySettings: async (
      organizationId: string,
      updateOrganizationSecuritySettingsRequest: UpdateOrganizationSecuritySettingsRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'organizationId' is not null or undefined
      assertParamExists(
        'updateOrganizationSecuritySettings',
        'organizationId',
        organizationId,
      );
      // verify required parameter 'updateOrganizationSecuritySettingsRequest' is not null or undefined
      assertParamExists(
        'updateOrganizationSecuritySettings',
        'updateOrganizationSecuritySettingsRequest',
        updateOrganizationSecuritySettingsRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/organizations/{organization_id}/security-settings`.replace(
          `{${'organization_id'}}`,
          encodeURIComponent(String(organizationId)),
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
        updateOrganizationSecuritySettingsRequest,
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
 * SecuritySettingsApi - functional programming interface
 * @export
 */
export const SecuritySettingsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    SecuritySettingsApiAxiosParamCreator(configuration);
  return {
    /**
     * Retrieve information about the security settings of an Organization, specified by the `organization_id` parameter.
     * @summary Get security settings of an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getOrganizationSecuritySettings(
      organizationId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1OrganizationSecuritySettings>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getOrganizationSecuritySettings(
          organizationId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'SecuritySettingsApi.getOrganizationSecuritySettings'
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
     * @summary Update the security settings of an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {UpdateOrganizationSecuritySettingsRequest} updateOrganizationSecuritySettingsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateOrganizationSecuritySettings(
      organizationId: string,
      updateOrganizationSecuritySettingsRequest: UpdateOrganizationSecuritySettingsRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1OrganizationSecuritySettings>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateOrganizationSecuritySettings(
          organizationId,
          updateOrganizationSecuritySettingsRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap[
          'SecuritySettingsApi.updateOrganizationSecuritySettings'
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
 * SecuritySettingsApi - factory interface
 * @export
 */
export const SecuritySettingsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = SecuritySettingsApiFp(configuration);
  return {
    /**
     * Retrieve information about the security settings of an Organization, specified by the `organization_id` parameter.
     * @summary Get security settings of an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getOrganizationSecuritySettings(
      organizationId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1OrganizationSecuritySettings> {
      return localVarFp
        .getOrganizationSecuritySettings(organizationId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Update the security settings of an Organization
     * @param {string} organizationId ID of the Organization.
     * @param {UpdateOrganizationSecuritySettingsRequest} updateOrganizationSecuritySettingsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateOrganizationSecuritySettings(
      organizationId: string,
      updateOrganizationSecuritySettingsRequest: UpdateOrganizationSecuritySettingsRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1OrganizationSecuritySettings> {
      return localVarFp
        .updateOrganizationSecuritySettings(
          organizationId,
          updateOrganizationSecuritySettingsRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * SecuritySettingsApi - interface
 * @export
 * @interface SecuritySettingsApi
 */
export interface SecuritySettingsApiInterface {
  /**
   * Retrieve information about the security settings of an Organization, specified by the `organization_id` parameter.
   * @summary Get security settings of an Organization
   * @param {string} organizationId ID of the Organization.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecuritySettingsApiInterface
   */
  getOrganizationSecuritySettings(
    organizationId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1OrganizationSecuritySettings>;

  /**
   *
   * @summary Update the security settings of an Organization
   * @param {string} organizationId ID of the Organization.
   * @param {UpdateOrganizationSecuritySettingsRequest} updateOrganizationSecuritySettingsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecuritySettingsApiInterface
   */
  updateOrganizationSecuritySettings(
    organizationId: string,
    updateOrganizationSecuritySettingsRequest: UpdateOrganizationSecuritySettingsRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1OrganizationSecuritySettings>;
}

/**
 * SecuritySettingsApi - object-oriented interface
 * @export
 * @class SecuritySettingsApi
 * @extends {BaseAPI}
 */
export class SecuritySettingsApi
  extends BaseAPI
  implements SecuritySettingsApiInterface
{
  /**
   * Retrieve information about the security settings of an Organization, specified by the `organization_id` parameter.
   * @summary Get security settings of an Organization
   * @param {string} organizationId ID of the Organization.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecuritySettingsApi
   */
  public getOrganizationSecuritySettings(
    organizationId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return SecuritySettingsApiFp(this.configuration)
      .getOrganizationSecuritySettings(organizationId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Update the security settings of an Organization
   * @param {string} organizationId ID of the Organization.
   * @param {UpdateOrganizationSecuritySettingsRequest} updateOrganizationSecuritySettingsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SecuritySettingsApi
   */
  public updateOrganizationSecuritySettings(
    organizationId: string,
    updateOrganizationSecuritySettingsRequest: UpdateOrganizationSecuritySettingsRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return SecuritySettingsApiFp(this.configuration)
      .updateOrganizationSecuritySettings(
        organizationId,
        updateOrganizationSecuritySettingsRequest,
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
     * Create a new user. You must define the `organization_id` in your request. If you are adding a member, enter the member\'s details. If you are adding a guest, you must define the `email` and not add the member attribute.
     * @summary Create a new user
     * @param {CreateUserRequest} createUserRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUser: async (
      createUserRequest: CreateUserRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'createUserRequest' is not null or undefined
      assertParamExists('createUser', 'createUserRequest', createUserRequest);
      const localVarPath = `/iam/v1alpha1/users`;
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
     *
     * @summary Create a MFA OTP.
     * @param {string} userId User ID of the MFA OTP.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUserMFAOTP: async (
      userId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('createUserMFAOTP', 'userId', userId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('createUserMFAOTP', 'body', body);
      const localVarPath = `/iam/v1alpha1/users/{user_id}/mfa-otp`.replace(
        `{${'user_id'}}`,
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
     * Remove a user from an Organization in which they are a guest. You must define the `user_id` in your request. Note that removing a user from an Organization automatically deletes their API keys, and any policies directly attached to them become orphaned.
     * @summary Delete a guest user from an Organization
     * @param {string} userId ID of the user to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUser: async (
      userId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('deleteUser', 'userId', userId);
      const localVarPath = `/iam/v1alpha1/users/{user_id}`.replace(
        `{${'user_id'}}`,
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
     * @summary Delete a MFA OTP.
     * @param {string} userId User ID of the MFA OTP.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUserMFAOTP: async (
      userId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('deleteUserMFAOTP', 'userId', userId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('deleteUserMFAOTP', 'body', body);
      const localVarPath = `/iam/v1alpha1/users/{user_id}/mfa-otp`.replace(
        `{${'user_id'}}`,
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
     * Retrieve information about a user, specified by the `user_id` parameter. The user\'s full details, including `id`, `email`, `organization_id`, `status` and `mfa` are returned in the response.
     * @summary Get a given user
     * @param {string} userId ID of the user to find.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUser: async (
      userId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('getUser', 'userId', userId);
      const localVarPath = `/iam/v1alpha1/users/{user_id}`.replace(
        `{${'user_id'}}`,
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
     * List the grace periods of a member.
     * @summary List grace periods of a member
     * @param {string} [userId] ID of the user to list grace periods for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listGracePeriods: async (
      userId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/grace-periods`;
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

      if (userId !== undefined) {
        localVarQueryParameter['user_id'] = userId;
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
     * List the users of an Organization. By default, the users listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `user_ids`.
     * @summary List users of an Organization
     * @param {ListUsersOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater or equal to 1.
     * @param {string} [organizationId] ID of the Organization to filter.
     * @param {Array<string>} [userIds] Filter by list of IDs.
     * @param {boolean} [mfa] Filter by MFA status.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {ListUsersTypeEnum} [type] Filter by user type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listUsers: async (
      orderBy?: ListUsersOrderByEnum,
      pageSize?: number,
      page?: number,
      organizationId?: string,
      userIds?: Array<string>,
      mfa?: boolean,
      tag?: string,
      type?: ListUsersTypeEnum,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      const localVarPath = `/iam/v1alpha1/users`;
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

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (organizationId !== undefined) {
        localVarQueryParameter['organization_id'] = organizationId;
      }

      if (userIds) {
        localVarQueryParameter['user_ids'] = userIds;
      }

      if (mfa !== undefined) {
        localVarQueryParameter['mfa'] = mfa;
      }

      if (tag !== undefined) {
        localVarQueryParameter['tag'] = tag;
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
     * Lock a member. A locked member cannot log in or use API keys until the locked status is removed.
     * @summary Lock a member
     * @param {string} userId ID of the user to lock.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    lockUser: async (
      userId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('lockUser', 'userId', userId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('lockUser', 'body', body);
      const localVarPath = `/iam/v1alpha1/users/{user_id}/lock`.replace(
        `{${'user_id'}}`,
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
     *
     * @summary Unlock a member
     * @param {string} userId ID of the user to unlock.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    unlockUser: async (
      userId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('unlockUser', 'userId', userId);
      // verify required parameter 'body' is not null or undefined
      assertParamExists('unlockUser', 'body', body);
      const localVarPath = `/iam/v1alpha1/users/{user_id}/unlock`.replace(
        `{${'user_id'}}`,
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
     * Update the parameters of a user, including `tags`.
     * @summary Update a user
     * @param {string} userId ID of the user to update.
     * @param {UpdateUserRequest} updateUserRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUser: async (
      userId: string,
      updateUserRequest: UpdateUserRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('updateUser', 'userId', userId);
      // verify required parameter 'updateUserRequest' is not null or undefined
      assertParamExists('updateUser', 'updateUserRequest', updateUserRequest);
      const localVarPath = `/iam/v1alpha1/users/{user_id}`.replace(
        `{${'user_id'}}`,
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
        updateUserRequest,
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
     * @summary Update an user\'s password.
     * @param {string} userId ID of the user to update.
     * @param {UpdateUserPasswordRequest} updateUserPasswordRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUserPassword: async (
      userId: string,
      updateUserPasswordRequest: UpdateUserPasswordRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('updateUserPassword', 'userId', userId);
      // verify required parameter 'updateUserPasswordRequest' is not null or undefined
      assertParamExists(
        'updateUserPassword',
        'updateUserPasswordRequest',
        updateUserPasswordRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/users/{user_id}/update-password`.replace(
          `{${'user_id'}}`,
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
        updateUserPasswordRequest,
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
     * @summary Update an user\'s username.
     * @param {string} userId ID of the user to update.
     * @param {UpdateUserUsernameRequest} updateUserUsernameRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUserUsername: async (
      userId: string,
      updateUserUsernameRequest: UpdateUserUsernameRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('updateUserUsername', 'userId', userId);
      // verify required parameter 'updateUserUsernameRequest' is not null or undefined
      assertParamExists(
        'updateUserUsername',
        'updateUserUsernameRequest',
        updateUserUsernameRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/users/{user_id}/update-username`.replace(
          `{${'user_id'}}`,
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
        updateUserUsernameRequest,
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
     * @summary Validate a MFA OTP.
     * @param {string} userId User ID of the MFA OTP.
     * @param {ValidateUserMFAOTPRequest} validateUserMFAOTPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    validateUserMFAOTP: async (
      userId: string,
      validateUserMFAOTPRequest: ValidateUserMFAOTPRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'userId' is not null or undefined
      assertParamExists('validateUserMFAOTP', 'userId', userId);
      // verify required parameter 'validateUserMFAOTPRequest' is not null or undefined
      assertParamExists(
        'validateUserMFAOTP',
        'validateUserMFAOTPRequest',
        validateUserMFAOTPRequest,
      );
      const localVarPath =
        `/iam/v1alpha1/users/{user_id}/validate-mfa-otp`.replace(
          `{${'user_id'}}`,
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
        validateUserMFAOTPRequest,
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
     * Create a new user. You must define the `organization_id` in your request. If you are adding a member, enter the member\'s details. If you are adding a guest, you must define the `email` and not add the member attribute.
     * @summary Create a new user
     * @param {CreateUserRequest} createUserRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createUser(
      createUserRequest: CreateUserRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1User>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createUser(
        createUserRequest,
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
     *
     * @summary Create a MFA OTP.
     * @param {string} userId User ID of the MFA OTP.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createUserMFAOTP(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1MFAOTP>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createUserMFAOTP(userId, body, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.createUserMFAOTP']?.[
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
     * Remove a user from an Organization in which they are a guest. You must define the `user_id` in your request. Note that removing a user from an Organization automatically deletes their API keys, and any policies directly attached to them become orphaned.
     * @summary Delete a guest user from an Organization
     * @param {string} userId ID of the user to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteUser(
      userId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteUser(
        userId,
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
     *
     * @summary Delete a MFA OTP.
     * @param {string} userId User ID of the MFA OTP.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteUserMFAOTP(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteUserMFAOTP(userId, body, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.deleteUserMFAOTP']?.[
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
     * Retrieve information about a user, specified by the `user_id` parameter. The user\'s full details, including `id`, `email`, `organization_id`, `status` and `mfa` are returned in the response.
     * @summary Get a given user
     * @param {string} userId ID of the user to find.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getUser(
      userId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1User>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.getUser(
        userId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.getUser']?.[localVarOperationServerIndex]
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
     * List the grace periods of a member.
     * @summary List grace periods of a member
     * @param {string} [userId] ID of the user to list grace periods for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listGracePeriods(
      userId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListGracePeriodsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listGracePeriods(userId, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.listGracePeriods']?.[
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
     * List the users of an Organization. By default, the users listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `user_ids`.
     * @summary List users of an Organization
     * @param {ListUsersOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater or equal to 1.
     * @param {string} [organizationId] ID of the Organization to filter.
     * @param {Array<string>} [userIds] Filter by list of IDs.
     * @param {boolean} [mfa] Filter by MFA status.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {ListUsersTypeEnum} [type] Filter by user type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listUsers(
      orderBy?: ListUsersOrderByEnum,
      pageSize?: number,
      page?: number,
      organizationId?: string,
      userIds?: Array<string>,
      mfa?: boolean,
      tag?: string,
      type?: ListUsersTypeEnum,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ListUsersResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listUsers(
        orderBy,
        pageSize,
        page,
        organizationId,
        userIds,
        mfa,
        tag,
        type,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.listUsers']?.[localVarOperationServerIndex]
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
     * Lock a member. A locked member cannot log in or use API keys until the locked status is removed.
     * @summary Lock a member
     * @param {string} userId ID of the user to lock.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async lockUser(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1User>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.lockUser(
        userId,
        body,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.lockUser']?.[localVarOperationServerIndex]
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
     *
     * @summary Unlock a member
     * @param {string} userId ID of the user to unlock.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async unlockUser(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1User>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.unlockUser(
        userId,
        body,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.unlockUser']?.[
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
     * Update the parameters of a user, including `tags`.
     * @summary Update a user
     * @param {string} userId ID of the user to update.
     * @param {UpdateUserRequest} updateUserRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateUser(
      userId: string,
      updateUserRequest: UpdateUserRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1User>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateUser(
        userId,
        updateUserRequest,
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
    /**
     *
     * @summary Update an user\'s password.
     * @param {string} userId ID of the user to update.
     * @param {UpdateUserPasswordRequest} updateUserPasswordRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateUserPassword(
      userId: string,
      updateUserPasswordRequest: UpdateUserPasswordRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1User>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateUserPassword(
          userId,
          updateUserPasswordRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.updateUserPassword']?.[
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
     * @summary Update an user\'s username.
     * @param {string} userId ID of the user to update.
     * @param {UpdateUserUsernameRequest} updateUserUsernameRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateUserUsername(
      userId: string,
      updateUserUsernameRequest: UpdateUserUsernameRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1User>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateUserUsername(
          userId,
          updateUserUsernameRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.updateUserUsername']?.[
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
     * @summary Validate a MFA OTP.
     * @param {string} userId User ID of the MFA OTP.
     * @param {ValidateUserMFAOTPRequest} validateUserMFAOTPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async validateUserMFAOTP(
      userId: string,
      validateUserMFAOTPRequest: ValidateUserMFAOTPRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayIamV1alpha1ValidateUserMFAOTPResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.validateUserMFAOTP(
          userId,
          validateUserMFAOTPRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['UsersApi.validateUserMFAOTP']?.[
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
     * Create a new user. You must define the `organization_id` in your request. If you are adding a member, enter the member\'s details. If you are adding a guest, you must define the `email` and not add the member attribute.
     * @summary Create a new user
     * @param {CreateUserRequest} createUserRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUser(
      createUserRequest: CreateUserRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1User> {
      return localVarFp
        .createUser(createUserRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Create a MFA OTP.
     * @param {string} userId User ID of the MFA OTP.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createUserMFAOTP(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1MFAOTP> {
      return localVarFp
        .createUserMFAOTP(userId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Remove a user from an Organization in which they are a guest. You must define the `user_id` in your request. Note that removing a user from an Organization automatically deletes their API keys, and any policies directly attached to them become orphaned.
     * @summary Delete a guest user from an Organization
     * @param {string} userId ID of the user to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUser(
      userId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteUser(userId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Delete a MFA OTP.
     * @param {string} userId User ID of the MFA OTP.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUserMFAOTP(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteUserMFAOTP(userId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve information about a user, specified by the `user_id` parameter. The user\'s full details, including `id`, `email`, `organization_id`, `status` and `mfa` are returned in the response.
     * @summary Get a given user
     * @param {string} userId ID of the user to find.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUser(
      userId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1User> {
      return localVarFp
        .getUser(userId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List the grace periods of a member.
     * @summary List grace periods of a member
     * @param {string} [userId] ID of the user to list grace periods for.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listGracePeriods(
      userId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListGracePeriodsResponse> {
      return localVarFp
        .listGracePeriods(userId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * List the users of an Organization. By default, the users listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `user_ids`.
     * @summary List users of an Organization
     * @param {ListUsersOrderByEnum} [orderBy] Criteria for sorting results.
     * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
     * @param {number} [page] Page number. Value must be greater or equal to 1.
     * @param {string} [organizationId] ID of the Organization to filter.
     * @param {Array<string>} [userIds] Filter by list of IDs.
     * @param {boolean} [mfa] Filter by MFA status.
     * @param {string} [tag] Filter by tags containing a given string.
     * @param {ListUsersTypeEnum} [type] Filter by user type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listUsers(
      orderBy?: ListUsersOrderByEnum,
      pageSize?: number,
      page?: number,
      organizationId?: string,
      userIds?: Array<string>,
      mfa?: boolean,
      tag?: string,
      type?: ListUsersTypeEnum,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ListUsersResponse> {
      return localVarFp
        .listUsers(
          orderBy,
          pageSize,
          page,
          organizationId,
          userIds,
          mfa,
          tag,
          type,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Lock a member. A locked member cannot log in or use API keys until the locked status is removed.
     * @summary Lock a member
     * @param {string} userId ID of the user to lock.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    lockUser(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1User> {
      return localVarFp
        .lockUser(userId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Unlock a member
     * @param {string} userId ID of the user to unlock.
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    unlockUser(
      userId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1User> {
      return localVarFp
        .unlockUser(userId, body, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the parameters of a user, including `tags`.
     * @summary Update a user
     * @param {string} userId ID of the user to update.
     * @param {UpdateUserRequest} updateUserRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUser(
      userId: string,
      updateUserRequest: UpdateUserRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1User> {
      return localVarFp
        .updateUser(userId, updateUserRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Update an user\'s password.
     * @param {string} userId ID of the user to update.
     * @param {UpdateUserPasswordRequest} updateUserPasswordRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUserPassword(
      userId: string,
      updateUserPasswordRequest: UpdateUserPasswordRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1User> {
      return localVarFp
        .updateUserPassword(userId, updateUserPasswordRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Update an user\'s username.
     * @param {string} userId ID of the user to update.
     * @param {UpdateUserUsernameRequest} updateUserUsernameRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateUserUsername(
      userId: string,
      updateUserUsernameRequest: UpdateUserUsernameRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1User> {
      return localVarFp
        .updateUserUsername(userId, updateUserUsernameRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     *
     * @summary Validate a MFA OTP.
     * @param {string} userId User ID of the MFA OTP.
     * @param {ValidateUserMFAOTPRequest} validateUserMFAOTPRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    validateUserMFAOTP(
      userId: string,
      validateUserMFAOTPRequest: ValidateUserMFAOTPRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayIamV1alpha1ValidateUserMFAOTPResponse> {
      return localVarFp
        .validateUserMFAOTP(userId, validateUserMFAOTPRequest, options)
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
   * Create a new user. You must define the `organization_id` in your request. If you are adding a member, enter the member\'s details. If you are adding a guest, you must define the `email` and not add the member attribute.
   * @summary Create a new user
   * @param {CreateUserRequest} createUserRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  createUser(
    createUserRequest: CreateUserRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1User>;

  /**
   *
   * @summary Create a MFA OTP.
   * @param {string} userId User ID of the MFA OTP.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  createUserMFAOTP(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1MFAOTP>;

  /**
   * Remove a user from an Organization in which they are a guest. You must define the `user_id` in your request. Note that removing a user from an Organization automatically deletes their API keys, and any policies directly attached to them become orphaned.
   * @summary Delete a guest user from an Organization
   * @param {string} userId ID of the user to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  deleteUser(
    userId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   *
   * @summary Delete a MFA OTP.
   * @param {string} userId User ID of the MFA OTP.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  deleteUserMFAOTP(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Retrieve information about a user, specified by the `user_id` parameter. The user\'s full details, including `id`, `email`, `organization_id`, `status` and `mfa` are returned in the response.
   * @summary Get a given user
   * @param {string} userId ID of the user to find.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  getUser(
    userId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1User>;

  /**
   * List the grace periods of a member.
   * @summary List grace periods of a member
   * @param {string} [userId] ID of the user to list grace periods for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  listGracePeriods(
    userId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListGracePeriodsResponse>;

  /**
   * List the users of an Organization. By default, the users listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `user_ids`.
   * @summary List users of an Organization
   * @param {ListUsersOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater or equal to 1.
   * @param {string} [organizationId] ID of the Organization to filter.
   * @param {Array<string>} [userIds] Filter by list of IDs.
   * @param {boolean} [mfa] Filter by MFA status.
   * @param {string} [tag] Filter by tags containing a given string.
   * @param {ListUsersTypeEnum} [type] Filter by user type.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  listUsers(
    orderBy?: ListUsersOrderByEnum,
    pageSize?: number,
    page?: number,
    organizationId?: string,
    userIds?: Array<string>,
    mfa?: boolean,
    tag?: string,
    type?: ListUsersTypeEnum,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ListUsersResponse>;

  /**
   * Lock a member. A locked member cannot log in or use API keys until the locked status is removed.
   * @summary Lock a member
   * @param {string} userId ID of the user to lock.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  lockUser(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1User>;

  /**
   *
   * @summary Unlock a member
   * @param {string} userId ID of the user to unlock.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  unlockUser(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1User>;

  /**
   * Update the parameters of a user, including `tags`.
   * @summary Update a user
   * @param {string} userId ID of the user to update.
   * @param {UpdateUserRequest} updateUserRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  updateUser(
    userId: string,
    updateUserRequest: UpdateUserRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1User>;

  /**
   *
   * @summary Update an user\'s password.
   * @param {string} userId ID of the user to update.
   * @param {UpdateUserPasswordRequest} updateUserPasswordRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  updateUserPassword(
    userId: string,
    updateUserPasswordRequest: UpdateUserPasswordRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1User>;

  /**
   *
   * @summary Update an user\'s username.
   * @param {string} userId ID of the user to update.
   * @param {UpdateUserUsernameRequest} updateUserUsernameRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  updateUserUsername(
    userId: string,
    updateUserUsernameRequest: UpdateUserUsernameRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1User>;

  /**
   *
   * @summary Validate a MFA OTP.
   * @param {string} userId User ID of the MFA OTP.
   * @param {ValidateUserMFAOTPRequest} validateUserMFAOTPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApiInterface
   */
  validateUserMFAOTP(
    userId: string,
    validateUserMFAOTPRequest: ValidateUserMFAOTPRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayIamV1alpha1ValidateUserMFAOTPResponse>;
}

/**
 * UsersApi - object-oriented interface
 * @export
 * @class UsersApi
 * @extends {BaseAPI}
 */
export class UsersApi extends BaseAPI implements UsersApiInterface {
  /**
   * Create a new user. You must define the `organization_id` in your request. If you are adding a member, enter the member\'s details. If you are adding a guest, you must define the `email` and not add the member attribute.
   * @summary Create a new user
   * @param {CreateUserRequest} createUserRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public createUser(
    createUserRequest: CreateUserRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .createUser(createUserRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Create a MFA OTP.
   * @param {string} userId User ID of the MFA OTP.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public createUserMFAOTP(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .createUserMFAOTP(userId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Remove a user from an Organization in which they are a guest. You must define the `user_id` in your request. Note that removing a user from an Organization automatically deletes their API keys, and any policies directly attached to them become orphaned.
   * @summary Delete a guest user from an Organization
   * @param {string} userId ID of the user to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public deleteUser(userId: string, options?: RawAxiosRequestConfig) {
    return UsersApiFp(this.configuration)
      .deleteUser(userId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Delete a MFA OTP.
   * @param {string} userId User ID of the MFA OTP.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public deleteUserMFAOTP(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .deleteUserMFAOTP(userId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve information about a user, specified by the `user_id` parameter. The user\'s full details, including `id`, `email`, `organization_id`, `status` and `mfa` are returned in the response.
   * @summary Get a given user
   * @param {string} userId ID of the user to find.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public getUser(userId: string, options?: RawAxiosRequestConfig) {
    return UsersApiFp(this.configuration)
      .getUser(userId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List the grace periods of a member.
   * @summary List grace periods of a member
   * @param {string} [userId] ID of the user to list grace periods for.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public listGracePeriods(userId?: string, options?: RawAxiosRequestConfig) {
    return UsersApiFp(this.configuration)
      .listGracePeriods(userId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List the users of an Organization. By default, the users listed are ordered by creation date in ascending order. This can be modified via the `order_by` field. You must define the `organization_id` in the query path of your request. You can also define additional parameters for your query such as `user_ids`.
   * @summary List users of an Organization
   * @param {ListUsersOrderByEnum} [orderBy] Criteria for sorting results.
   * @param {number} [pageSize] Number of results per page. Value must be between 1 and 100.
   * @param {number} [page] Page number. Value must be greater or equal to 1.
   * @param {string} [organizationId] ID of the Organization to filter.
   * @param {Array<string>} [userIds] Filter by list of IDs.
   * @param {boolean} [mfa] Filter by MFA status.
   * @param {string} [tag] Filter by tags containing a given string.
   * @param {ListUsersTypeEnum} [type] Filter by user type.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public listUsers(
    orderBy?: ListUsersOrderByEnum,
    pageSize?: number,
    page?: number,
    organizationId?: string,
    userIds?: Array<string>,
    mfa?: boolean,
    tag?: string,
    type?: ListUsersTypeEnum,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .listUsers(
        orderBy,
        pageSize,
        page,
        organizationId,
        userIds,
        mfa,
        tag,
        type,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Lock a member. A locked member cannot log in or use API keys until the locked status is removed.
   * @summary Lock a member
   * @param {string} userId ID of the user to lock.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public lockUser(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .lockUser(userId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Unlock a member
   * @param {string} userId ID of the user to unlock.
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public unlockUser(
    userId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .unlockUser(userId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the parameters of a user, including `tags`.
   * @summary Update a user
   * @param {string} userId ID of the user to update.
   * @param {UpdateUserRequest} updateUserRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public updateUser(
    userId: string,
    updateUserRequest: UpdateUserRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .updateUser(userId, updateUserRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Update an user\'s password.
   * @param {string} userId ID of the user to update.
   * @param {UpdateUserPasswordRequest} updateUserPasswordRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public updateUserPassword(
    userId: string,
    updateUserPasswordRequest: UpdateUserPasswordRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .updateUserPassword(userId, updateUserPasswordRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Update an user\'s username.
   * @param {string} userId ID of the user to update.
   * @param {UpdateUserUsernameRequest} updateUserUsernameRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public updateUserUsername(
    userId: string,
    updateUserUsernameRequest: UpdateUserUsernameRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .updateUserUsername(userId, updateUserUsernameRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   *
   * @summary Validate a MFA OTP.
   * @param {string} userId User ID of the MFA OTP.
   * @param {ValidateUserMFAOTPRequest} validateUserMFAOTPRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof UsersApi
   */
  public validateUserMFAOTP(
    userId: string,
    validateUserMFAOTPRequest: ValidateUserMFAOTPRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return UsersApiFp(this.configuration)
      .validateUserMFAOTP(userId, validateUserMFAOTPRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListUsersOrderByEnum = {
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  UpdatedAtAsc: 'updated_at_asc',
  UpdatedAtDesc: 'updated_at_desc',
  EmailAsc: 'email_asc',
  EmailDesc: 'email_desc',
  LastLoginAsc: 'last_login_asc',
  LastLoginDesc: 'last_login_desc',
  UsernameAsc: 'username_asc',
  UsernameDesc: 'username_desc',
} as const;
export type ListUsersOrderByEnum =
  (typeof ListUsersOrderByEnum)[keyof typeof ListUsersOrderByEnum];
/**
 * @export
 */
export const ListUsersTypeEnum = {
  UnknownType: 'unknown_type',
  Owner: 'owner',
  Member: 'member',
} as const;
export type ListUsersTypeEnum =
  (typeof ListUsersTypeEnum)[keyof typeof ListUsersTypeEnum];
