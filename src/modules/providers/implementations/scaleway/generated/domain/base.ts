/* tslint:disable */
/* eslint-disable */
/**
 * Domains and DNS API
 * The Domains and DNS API documentation allows you to configure and manage your domains\' DNS zones and records. You can also use dynamic records to optimize and easily use your infrastructure as code. Read our [reference content documentation](https://www.scaleway.com/en/docs/network/domains-and-dns/reference-content/) for more information about domains.  Refer to the [Domains and DNS Registrar API documentation](https://www.scaleway.com/en/developers/api/domains-and-dns/registrar-api/) to find out how to buy,transfer and manage your domains and contacts (DNSSEC included).   (switchcolumn) (switchcolumn) ## Concepts  Refer to our [dedicated concepts page](https://www.scaleway.com/en/docs/network/domains-and-dns/concepts/) to find definitions of the different terms referring to Scaleway Domains and DNS.  (switchcolumn) (switchcolumn) ## Quickstart  1. **Configure your environment variables.**      <Message type=\"note\">     This is an optional step that seeks to simplify your usage of the API.     </Message>      ```bash     export SCW_ACCESS_KEY=\"<API access key>\"     export SCW_SECRET_KEY=\"<API secret key>\"     export SCW_PROJECT_ID=\"<Scaleway Project ID>\"     ``` 2. **Register an external domain.**      Run the following command to register your domain:      ```bash     curl https://api.scaleway.com/domain/v2beta1/external-domains \\       -X POST \\       -H \"Content-Type: application/json\" \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -d \'{         \"domain\": \"my-external-domain.test\",         \"project_id\": \"<Scaleway Project ID>\"     }\'     ``` 3. **Set up a TXT record.**      <Message type=\"important\">       After you register your external domain, you must set up a TXT record **within 48 hours**. This step is optional if you have an internal domain.     </Message>      Set up your TXT record as explained in **step 4** of our [documentation on how to add an external domain](https://www.scaleway.com/en/docs/network/domains-and-dns/how-to/add-external-domain/) to confirm you are the owner of the domain registered.      <Message type=\"note\">       You will receive a confirmation email once your domain is validated. Your domain will then be available on the API.     </Message> 4. **Update your DNS name servers.**      [Update your DNS name servers](https://www.scaleway.com/en/docs/network/domains-and-dns/how-to/manage-nameservers-internal-domain) to Scaleway\'s DNS name servers: `ns0.dom.scw.cloud` and `ns1.dom.scw.cloud`.      - For your domain: update the name servers at your registrar to point your domain to Scaleway\'s DNS servers     - For your subdomain: update the name servers at your parent DNS server to point your subdomain to Scaleway\'s DNS servers 5. **Set up your domain\'s DNSSEC.**      You need to set up your domain\'s DNSSEC on the registry by your registrar and on the DNS server with the same information.      To set up the DNSSEC:     * use the [Registrar API](https://www.scaleway.com/en/developers/api/domains-and-dns/registrar-api/#path-domains-update-domain-dnssec) `EnableDomainDNSSEC` to generate the setup on the DNS servers     * if your domain is not registered on Scaleway but on another registrar, use the DS or public key information to configure the DNSSEC on your registrar      <Message type=\"tip\">       You can remove your DNSSEC settings on your registrar before you migrate to our service. You will be able to set it up again afterwards.     </Message>  6. **List your domains.**      Run the following command to retrieve the list of your domains:      ```bash     curl https://api.scaleway.com/domain/v2beta1/domains \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\"     ```      The following output displays:      ```bash     {       \"total_count\": 1,       \"domains\": [         {           \"domain\": \"domain-external.test\",           \"organization_id\": \"<Scaleway Organization ID>\",           \"project_id\": \"<Scaleway Project ID>\",           \"auto_renew_status\": \"disabled\",           \"dnssec_status\": \"disabled\",           \"epp_code\": [],           \"expired_at\": null,           \"updated_at\": \"1970-01-01T00:00:00Z\",           \"registrar\": \"EXTERNAL\",           \"is_external\": true,           \"status\": \"active\"         }       ]     }     ```  7. **List the zones you can manage.**      Run the following command to list the DNS zones you can manage:      ```bash     curl https://api.scaleway.com/domain/v2beta1/dns-zones/ \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\"     ```     An output similar to the following displays:      ```bash     {       \"total_count\": 3,       \"dns_zones\": [         {           \"domain\": \"domain-external.test\",           \"subdomain\": \"\",           \"ns\": [             \"ns0.dom.scw.cloud\",             \"ns1.dom.scw.cloud\"           ],           \"ns_default\": [             \"ns0.dom.scw.cloud\",             \"ns1.dom.scw.cloud\"           ],           \"ns_master\": [],           \"status\": \"active\",           \"message\": null,           \"updated_at\": \"2022-06-21T01:34:55Z\",           \"project_id\": \"<Scaleway Project ID>\"         },         {           \"domain\": \"domain-external.test\",           \"subdomain\": \"test-zone\",           \"ns\": [             \"ns0.dom.scw.cloud\",             \"ns1.dom.scw.cloud\"           ],           \"ns_default\": [             \"ns0.dom.scw.cloud\",             \"ns1.dom.scw.cloud\"           ],           \"ns_master\": [],           \"status\": \"active\",           \"message\": null,           \"updated_at\": \"2022-06-21T01:34:55Z\",           \"project_id\": \"<Scaleway Project ID>\"         },         {           \"domain\": \"other-domain-external.test\",           \"subdomain\": \"\",           \"ns\": [             \"ns0.dom.scw.cloud\",             \"ns1.dom.scw.cloud\"           ],           \"ns_default\": [             \"ns0.dom.scw.cloud\",             \"ns1.dom.scw.cloud\"           ],           \"ns_master\": [],           \"status\": \"active\",           \"message\": null,           \"updated_at\": \"2022-06-21T01:34:55Z\",           \"project_id\": \"<Scaleway Project ID>\"         }       ]     }      ``` 8. **Update a zone\'s record(s).**      <Message type=\"important\">       - The `clear` command clears all your records. You will have to setup your records again       - If the zone you want to update does not exist but is included in a managed zone, the API will create the new (sub) zone     </Message>      Run the following command to update a zone\'s record:      ```bash     curl https://api.scaleway.com/domain/v2beta1/dns-zones/subdomain.domain-external.test/records \\       -X PATCH \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -d \'{         \"changes\": [           {             \"clear\": {}           },           {             \"add\": {               \"records\": [                 {                   \"name\": \"test1\",                   \"data\": \"127.0.0.1\",                   \"type\": \"A\",                   \"ttl\": 3600                 },                 {                   \"name\": \"test2\",                   \"data\": \"127.0.0.1\",                   \"type\": \"A\",                   \"ttl\": 3600                 }               ]             }           },           {             \"set\": {               \"id_fields\": {                 \"type\": \"A\",                 \"name\": \"test2\"               },               \"records\": [                 {                   \"name\": \"test2\",                   \"data\": \"127.0.0.2\",                   \"type\": \"A\",                   \"ttl\": 3600                 }               ]             }           },           {             \"add\": {               \"records\": [                 {                   \"name\": \"test3\",                   \"data\": \"127.0.0.3\",                   \"type\": \"A\",                   \"ttl\": 3600                 },                 {                   \"name\": \"test3\",                   \"data\": \"127.0.0.4\",                   \"type\": \"A\",                   \"ttl\": 3600                 }               ]             }           },           {             \"delete\": {               \"id_fields\": {                 \"name\": \"test3\",                 \"data\": \"127.0.0.4\",                 \"type\": \"A\",                 \"ttl\": 3600               }             }           }         ]       }\'     ```      An output similar to the following displays:      ```bash     {       \"records\": [         {           \"id\": \"<UUID>\",           \"data\": \"127.0.0.1\",           \"name\": \"test1\",           \"priority\": 0,           \"ttl\": 3600,           \"type\": \"A\"         },         {           \"id\": \"<UUID>\",           \"data\": \"127.0.0.1\",           \"name\": \"test2\",           \"priority\": 0,           \"ttl\": 3600,           \"type\": \"A\"         },         {           \"id\": \"<UUID>\",           \"data\": \"127.0.0.2\",           \"name\": \"test2\",           \"priority\": 0,           \"ttl\": 3600,           \"type\": \"A\"         },         {           \"id\": \"<UUID>\",           \"data\": \"127.0.0.3\",           \"name\": \"test3\",           \"priority\": 0,           \"ttl\": 3600,           \"type\": \"A\"         }       ]     }     ```  9. **Enable DNSSEC for external domains.**      - Run the following command if you have not set up DNSSEC at your registrar:      ```bash     curl https://api.scaleway.com/domain/v2beta1/domains/example.com/enable-dnssec \\       -X POST \\       -H \"Content-Type: application/json\" \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -d \'{}\'     ```     An output similar to the following displays:      ```json     {       \"domain\":{           \"domain\":\"example.fr\",           \"auto_renew_status\":\"enabled\",           \"dnssec_status\":\"disabled\",           \"ds_records\":[             {                 \"key_id\":49071,                 \"algorithm\":\"ecdsap256sha256\",                 \"digest\":{                   \"type\":\"sha_384\",                   \"digest\":\"c14421f739e35b62e3383d5972263f93610dea31da48a1990453752cf1b4f4f0314f75ecd0bc9061c51ee41ec7692204\"                 }             }           ],           \"epp\":[             \"clientTransferProhibited\"           ],           \"expired_at\":\"2021-04-04T12:46:29Z\",           \"updated_at\":\"2020-07-07T13:24:27Z\",           \"registrar\":\"EXTERNAL\",           \"is_external\":true,           \"status\":\"active\",           \"......\"       }     ```      <Message type=\"important\">       Set up the information returned under `ds_records` in the output, in your registrar to configure DNSSEC for your external domain.     </Message>      - Run the following command if you have already set up DNSSEC at your registrar:      ```bash     curl https://api.scaleway.com/domain/v2beta1/domains/example.com/enable-dnssec \\       -X POST \\       -H \"Content-Type: application/json\" \\       -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\       -d \'{         \"ds_record\": {           \"algorithm\": \"rsamd5\",           \"digest\":           {             \"type\": \"sha_1\",             \"digest\": \"ABCD\"           }         }       }\'     ``` 10. **Enable DNSSEC for internal domains.**      Find out how to enable DNSSEC for your internal domains in our [dedicated documentation](https://www.scaleway.com/en/docs/network/domains-and-dns/how-to/configure-dnssec-internal-domain/).  (switchcolumn) <Message type=\"requirement\"> - You have a [Scaleway account](https://console.scaleway.com/) - You have [created an API key](https://www.scaleway.com/en/docs/iam/how-to/create-api-keys/) and that the API key has sufficient [IAM permissions](https://www.scaleway.com/en/docs/iam/reference-content/permission-sets/) to perform the actions described on this page - You have your [Organization ID](https://console.scaleway.com/organization/settings) - You have [installed `curl`](https://curl.se/download.html) </Message> (switchcolumn)  ## Technical information  ### Regional availability  Scaleway Domains and DNS is currently available globally. Find out about [product availability in our dedicated documentation](https://www.scaleway.com/en/docs/account/reference-content/products-availability).  ### Format  - The format of record names is always in \"short\" format (i.e.\"test\" instead of the FQDN \"test.mydomain.com\") - If a data value is not in RFC format, quotes will be added for `TXT`records. If `CNAME`records are not in FQDDN, the zone will be added ## Technical limitations  - Only the owner of a domain can use and configure it with Domains and DNS - Each zone supports the creation of sub-zones, which inherit the parent\'s Project ID - We provide the following record types: `A`, `AAAA`, `CNAME`, `CAA`, `DNAME`, `HTTPS`, `MX`, `NAPTR`, `NS`, `SRV`, `SVCB`, `TLSA` and `TXT` - We support the following dynamic records: `http(s)` `health check` and `views`  ## Going further  For more information about Domains and DNS, you can check out the following pages:  - [Domains and DNS Documentation](https://www.scaleway.com/en/docs/network/domains-and-dns/) - [Scaleway Slack Community](http://slack.scaleway.com) join the #domains channel - [Contact our support team](https://console.scaleway.com/support/tickets)  ### Test if the service is up  Run the following command to test if an `http` or `https` service is up on a provided list of IPs:  ```bash curl https://api.scaleway.com/domain/v2beta1/dns-zones/dom.example.com/records \\   -X PATCH \\   -H \"Content-Type: application/json\" \\   -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\   -d \'{     \"return_all_records\": false,     \"changes\": [       {         \"add\": {           \"records\": [             {               \"name\": \"service-www\",               \"data\": \"10.51.2.8\",               \"type\": \"A\",               \"ttl\": 600,               \"http_service_config\": {                 \"ips\": [                   \"10.51.2.8\",                   \"10.51.3.7\",                   \"10.51.2.9\"                 ],                 \"must_contain\": \"I am fine\",                 \"url\": \"https://www.domain-test.test\"               }             }           ]         }       }     ]   }\' ```  <Message type=\"note\">   An IP is considered healthy if the query response contains the text specified in `must_contain`. The record type can be one of `A` and `AAAA`. </Message>  ### View  Run the following command to view responses depending on the requester\'s or resolver\'s IP:  ```bash curl https://api.scaleway.com/domain/v2beta1/dns-zones/dom.example.com/records \\   -X PATCH \\   -H \"Content-Type: application/json\" \\   -H \"X-Auth-Token: $SCW_SECRET_KEY\" \\   -d \'{     \"return_all_records\": false,     \"changes\": [       {         \"set\": {           \"id_fields\": {             \"name\": \"test\",             \"type\": \"CNAME\"           },           \"records\": [             {               \"name\": \"test\",               \"data\": \"default-domain.com.\",               \"type\": \"CNAME\",               \"ttl\": 600,               \"view_config\": {                 \"views\": [                   {                     \"subnet\": \"10.51.0.0/16\",                     \"data\": \"filtered-domain.com.\"                   }                 ]               }             }           ]         }       }     ]   }\' ``` <Message type=\"note\">   Record types include `A`, `AAAA`, `CNAME` and `TXT`. </Message>
 *
 * The version of the OpenAPI document: v2beta1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import type { Configuration } from './configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';

export const BASE_PATH = 'https://api.scaleway.com'.replace(/\/+$/, '');

/**
 *
 * @export
 */
export const COLLECTION_FORMATS = {
  csv: ',',
  ssv: ' ',
  tsv: '\t',
  pipes: '|',
};

/**
 *
 * @export
 * @interface RequestArgs
 */
export interface RequestArgs {
  url: string;
  options: RawAxiosRequestConfig;
}

/**
 *
 * @export
 * @class BaseAPI
 */
export class BaseAPI {
  protected configuration: Configuration | undefined;

  constructor(
    configuration?: Configuration,
    protected basePath: string = BASE_PATH,
    protected axios: AxiosInstance = globalAxios,
  ) {
    if (configuration) {
      this.configuration = configuration;
      this.basePath = configuration.basePath ?? basePath;
    }
  }
}

/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
export class RequiredError extends Error {
  constructor(
    public field: string,
    msg?: string,
  ) {
    super(msg);
    this.name = 'RequiredError';
  }
}

interface ServerMap {
  [key: string]: {
    url: string;
    description: string;
  }[];
}

/**
 *
 * @export
 */
export const operationServerMap: ServerMap = {};
