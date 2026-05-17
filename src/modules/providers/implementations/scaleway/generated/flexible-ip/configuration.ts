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

export interface ConfigurationParameters {
  apiKey?:
    | string
    | Promise<string>
    | ((name: string) => string)
    | ((name: string) => Promise<string>);
  username?: string;
  password?: string;
  accessToken?:
    | string
    | Promise<string>
    | ((name?: string, scopes?: string[]) => string)
    | ((name?: string, scopes?: string[]) => Promise<string>);
  basePath?: string;
  serverIndex?: number;
  baseOptions?: any;
  formDataCtor?: new () => any;
}

export class Configuration {
  /**
   * parameter for apiKey security
   * @param name security name
   * @memberof Configuration
   */
  apiKey?:
    | string
    | Promise<string>
    | ((name: string) => string)
    | ((name: string) => Promise<string>);
  /**
   * parameter for basic security
   *
   * @type {string}
   * @memberof Configuration
   */
  username?: string;
  /**
   * parameter for basic security
   *
   * @type {string}
   * @memberof Configuration
   */
  password?: string;
  /**
   * parameter for oauth2 security
   * @param name security name
   * @param scopes oauth2 scope
   * @memberof Configuration
   */
  accessToken?:
    | string
    | Promise<string>
    | ((name?: string, scopes?: string[]) => string)
    | ((name?: string, scopes?: string[]) => Promise<string>);
  /**
   * override base path
   *
   * @type {string}
   * @memberof Configuration
   */
  basePath?: string;
  /**
   * override server index
   *
   * @type {number}
   * @memberof Configuration
   */
  serverIndex?: number;
  /**
   * base options for axios calls
   *
   * @type {any}
   * @memberof Configuration
   */
  baseOptions?: any;
  /**
   * The FormData constructor that will be used to create multipart form data
   * requests. You can inject this here so that execution environments that
   * do not support the FormData class can still run the generated client.
   *
   * @type {new () => FormData}
   */
  formDataCtor?: new () => any;

  constructor(param: ConfigurationParameters = {}) {
    this.apiKey = param.apiKey;
    this.username = param.username;
    this.password = param.password;
    this.accessToken = param.accessToken;
    this.basePath = param.basePath;
    this.serverIndex = param.serverIndex;
    this.baseOptions = {
      ...param.baseOptions,
      headers: {
        ...param.baseOptions?.headers,
      },
    };
    this.formDataCtor = param.formDataCtor;
  }

  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  public isJsonMime(mime: string): boolean {
    const jsonMime: RegExp = new RegExp(
      '^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$',
      'i',
    );
    return (
      mime !== null &&
      (jsonMime.test(mime) ||
        mime.toLowerCase() === 'application/json-patch+json')
    );
  }
}
