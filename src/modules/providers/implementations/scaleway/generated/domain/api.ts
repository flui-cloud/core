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
 * @interface CloneDNSZoneRequest
 */
export interface CloneDNSZoneRequest {
  /**
   * Destination DNS zone in which to clone the chosen DNS zone.
   * @type {string}
   * @memberof CloneDNSZoneRequest
   */
  dest_dns_zone: string;
  /**
   * Specifies whether or not the destination DNS zone will be overwritten.
   * @type {boolean}
   * @memberof CloneDNSZoneRequest
   */
  overwrite?: boolean;
  /**
   * Project ID of the destination DNS zone.
   * @type {string}
   * @memberof CloneDNSZoneRequest
   */
  project_id?: string;
}
/**
 *
 * @export
 * @interface CreateDNSZoneRequest
 */
export interface CreateDNSZoneRequest {
  /**
   * Domain in which to crreate the DNS zone.
   * @type {string}
   * @memberof CreateDNSZoneRequest
   */
  domain: string;
  /**
   * Subdomain of the DNS zone to create.
   * @type {string}
   * @memberof CreateDNSZoneRequest
   */
  subdomain: string;
  /**
   * Project ID in which to create the DNS zone.
   * @type {string}
   * @memberof CreateDNSZoneRequest
   */
  project_id: string;
}
/**
 *
 * @export
 * @interface CreateSSLCertificateRequest
 */
export interface CreateSSLCertificateRequest {
  /**
   *
   * @type {string}
   * @memberof CreateSSLCertificateRequest
   */
  dns_zone?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof CreateSSLCertificateRequest
   */
  alternative_dns_zones?: Array<string>;
}
/**
 *
 * @export
 * @interface ImportProviderDNSZoneRequest
 */
export interface ImportProviderDNSZoneRequest {
  /**
   *
   * @type {ImportProviderDNSZoneRequestOnlineV1}
   * @memberof ImportProviderDNSZoneRequest
   */
  online_v1?: ImportProviderDNSZoneRequestOnlineV1;
}
/**
 *
 * @export
 * @interface ImportProviderDNSZoneRequestOnlineV1
 */
export interface ImportProviderDNSZoneRequestOnlineV1 {
  /**
   *
   * @type {string}
   * @memberof ImportProviderDNSZoneRequestOnlineV1
   */
  token?: string;
}
/**
 *
 * @export
 * @interface ImportRawDNSZoneRequest
 */
export interface ImportRawDNSZoneRequest {
  /**
   *
   * @type {string}
   * @memberof ImportRawDNSZoneRequest
   * @deprecated
   */
  content?: string;
  /**
   *
   * @type {string}
   * @memberof ImportRawDNSZoneRequest
   */
  project_id?: string;
  /**
   *
   * @type {ScalewayDomainV2beta1RawFormat}
   * @memberof ImportRawDNSZoneRequest
   * @deprecated
   */
  format?: ScalewayDomainV2beta1RawFormat;
  /**
   *
   * @type {ImportRawDNSZoneRequestBindSource}
   * @memberof ImportRawDNSZoneRequest
   */
  bind_source?: ImportRawDNSZoneRequestBindSource;
  /**
   *
   * @type {ImportRawDNSZoneRequestAxfrSource}
   * @memberof ImportRawDNSZoneRequest
   */
  axfr_source?: ImportRawDNSZoneRequestAxfrSource;
}

/**
 * Import from the name server given with TSIG, to use or not.
 * @export
 * @interface ImportRawDNSZoneRequestAxfrSource
 */
export interface ImportRawDNSZoneRequestAxfrSource {
  /**
   *
   * @type {string}
   * @memberof ImportRawDNSZoneRequestAxfrSource
   */
  name_server?: string;
  /**
   *
   * @type {ScalewayDomainV2beta1ImportRawDNSZoneRequestTsigKey}
   * @memberof ImportRawDNSZoneRequestAxfrSource
   */
  tsig_key?: ScalewayDomainV2beta1ImportRawDNSZoneRequestTsigKey;
}
/**
 * Import a bind file format.
 * @export
 * @interface ImportRawDNSZoneRequestBindSource
 */
export interface ImportRawDNSZoneRequestBindSource {
  /**
   *
   * @type {string}
   * @memberof ImportRawDNSZoneRequestBindSource
   */
  content?: string;
}
/**
 *
 * @export
 * @interface RefreshDNSZoneRequest
 */
export interface RefreshDNSZoneRequest {
  /**
   * Specifies whether or not to recreate the DNS zone.
   * @type {boolean}
   * @memberof RefreshDNSZoneRequest
   */
  recreate_dns_zone?: boolean;
  /**
   * Specifies whether or not to recreate the sub DNS zone.
   * @type {boolean}
   * @memberof RefreshDNSZoneRequest
   */
  recreate_sub_dns_zone?: boolean;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1DNSZone
 */
export interface ScalewayDomainV2beta1DNSZone {
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  domain?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  subdomain?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  ns?: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  ns_default?: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  ns_master?: Array<string>;
  /**
   *
   * @type {ScalewayDomainV2beta1DNSZoneStatus}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  status?: ScalewayDomainV2beta1DNSZoneStatus;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  message?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  updated_at?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  project_id?: string;
  /**
   *
   * @type {Array<ScalewayDomainV2beta1LinkedProduct>}
   * @memberof ScalewayDomainV2beta1DNSZone
   */
  linked_products?: Array<ScalewayDomainV2beta1LinkedProduct>;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayDomainV2beta1DNSZoneStatus = {
  Unknown: 'unknown',
  Active: 'active',
  Pending: 'pending',
  Error: 'error',
  Locked: 'locked',
} as const;

export type ScalewayDomainV2beta1DNSZoneStatus =
  (typeof ScalewayDomainV2beta1DNSZoneStatus)[keyof typeof ScalewayDomainV2beta1DNSZoneStatus];

/**
 *
 * @export
 * @interface ScalewayDomainV2beta1DNSZoneVersion
 */
export interface ScalewayDomainV2beta1DNSZoneVersion {
  /**
   * (UUID format)
   * @type {string}
   * @memberof ScalewayDomainV2beta1DNSZoneVersion
   */
  id?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayDomainV2beta1DNSZoneVersion
   */
  created_at?: string;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1GetDNSZoneTsigKeyResponse
 */
export interface ScalewayDomainV2beta1GetDNSZoneTsigKeyResponse {
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1GetDNSZoneTsigKeyResponse
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1GetDNSZoneTsigKeyResponse
   */
  key?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1GetDNSZoneTsigKeyResponse
   */
  algorithm?: string;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1GetDNSZoneVersionDiffResponse
 */
export interface ScalewayDomainV2beta1GetDNSZoneVersionDiffResponse {
  /**
   *
   * @type {Array<ScalewayDomainV2beta1RecordChange>}
   * @memberof ScalewayDomainV2beta1GetDNSZoneVersionDiffResponse
   */
  changes?: Array<ScalewayDomainV2beta1RecordChange>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1ImportProviderDNSZoneResponse
 */
export interface ScalewayDomainV2beta1ImportProviderDNSZoneResponse {
  /**
   *
   * @type {Array<ScalewayDomainV2beta1Record>}
   * @memberof ScalewayDomainV2beta1ImportProviderDNSZoneResponse
   */
  records?: Array<ScalewayDomainV2beta1Record>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1ImportRawDNSZoneRequestTsigKey
 */
export interface ScalewayDomainV2beta1ImportRawDNSZoneRequestTsigKey {
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1ImportRawDNSZoneRequestTsigKey
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1ImportRawDNSZoneRequestTsigKey
   */
  key?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1ImportRawDNSZoneRequestTsigKey
   */
  algorithm?: string;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1ImportRawDNSZoneResponse
 */
export interface ScalewayDomainV2beta1ImportRawDNSZoneResponse {
  /**
   *
   * @type {Array<ScalewayDomainV2beta1Record>}
   * @memberof ScalewayDomainV2beta1ImportRawDNSZoneResponse
   */
  records?: Array<ScalewayDomainV2beta1Record>;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayDomainV2beta1LinkedProduct = {
  UnknownProduct: 'unknown_product',
  Vpc: 'vpc',
} as const;

export type ScalewayDomainV2beta1LinkedProduct =
  (typeof ScalewayDomainV2beta1LinkedProduct)[keyof typeof ScalewayDomainV2beta1LinkedProduct];

/**
 *
 * @export
 * @interface ScalewayDomainV2beta1ListDNSZoneNameserversResponse
 */
export interface ScalewayDomainV2beta1ListDNSZoneNameserversResponse {
  /**
   * DNS zone name servers returned.
   * @type {Array<ScalewayDomainV2beta1Nameserver>}
   * @memberof ScalewayDomainV2beta1ListDNSZoneNameserversResponse
   */
  ns?: Array<ScalewayDomainV2beta1Nameserver>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1ListDNSZoneRecordsResponse
 */
export interface ScalewayDomainV2beta1ListDNSZoneRecordsResponse {
  /**
   * Total number of DNS zone records.
   * @type {number}
   * @memberof ScalewayDomainV2beta1ListDNSZoneRecordsResponse
   */
  total_count?: number;
  /**
   * Paginated returned DNS zone records.
   * @type {Array<ScalewayDomainV2beta1Record>}
   * @memberof ScalewayDomainV2beta1ListDNSZoneRecordsResponse
   */
  records?: Array<ScalewayDomainV2beta1Record>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1ListDNSZoneVersionRecordsResponse
 */
export interface ScalewayDomainV2beta1ListDNSZoneVersionRecordsResponse {
  /**
   * Total number of DNS zones versions records.
   * @type {number}
   * @memberof ScalewayDomainV2beta1ListDNSZoneVersionRecordsResponse
   */
  total_count?: number;
  /**
   *
   * @type {Array<ScalewayDomainV2beta1Record>}
   * @memberof ScalewayDomainV2beta1ListDNSZoneVersionRecordsResponse
   */
  records?: Array<ScalewayDomainV2beta1Record>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1ListDNSZoneVersionsResponse
 */
export interface ScalewayDomainV2beta1ListDNSZoneVersionsResponse {
  /**
   * Total number of DNS zones versions.
   * @type {number}
   * @memberof ScalewayDomainV2beta1ListDNSZoneVersionsResponse
   */
  total_count?: number;
  /**
   *
   * @type {Array<ScalewayDomainV2beta1DNSZoneVersion>}
   * @memberof ScalewayDomainV2beta1ListDNSZoneVersionsResponse
   */
  versions?: Array<ScalewayDomainV2beta1DNSZoneVersion>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1ListDNSZonesResponse
 */
export interface ScalewayDomainV2beta1ListDNSZonesResponse {
  /**
   * Total number of DNS zones matching the requested criteria.
   * @type {number}
   * @memberof ScalewayDomainV2beta1ListDNSZonesResponse
   */
  total_count?: number;
  /**
   * Paginated returned DNS zones.
   * @type {Array<ScalewayDomainV2beta1DNSZone>}
   * @memberof ScalewayDomainV2beta1ListDNSZonesResponse
   */
  dns_zones?: Array<ScalewayDomainV2beta1DNSZone>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1ListSSLCertificatesResponse
 */
export interface ScalewayDomainV2beta1ListSSLCertificatesResponse {
  /**
   *
   * @type {number}
   * @memberof ScalewayDomainV2beta1ListSSLCertificatesResponse
   */
  total_count?: number;
  /**
   *
   * @type {Array<ScalewayDomainV2beta1SSLCertificate>}
   * @memberof ScalewayDomainV2beta1ListSSLCertificatesResponse
   */
  certificates?: Array<ScalewayDomainV2beta1SSLCertificate>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1Nameserver
 */
export interface ScalewayDomainV2beta1Nameserver {
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1Nameserver
   */
  name?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayDomainV2beta1Nameserver
   */
  ip?: Array<string>;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayDomainV2beta1RawFormat = {
  UnknownRawFormat: 'unknown_raw_format',
  Bind: 'bind',
} as const;

export type ScalewayDomainV2beta1RawFormat =
  (typeof ScalewayDomainV2beta1RawFormat)[keyof typeof ScalewayDomainV2beta1RawFormat];

/**
 *
 * @export
 * @interface ScalewayDomainV2beta1Record
 */
export interface ScalewayDomainV2beta1Record {
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1Record
   */
  data?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1Record
   */
  name?: string;
  /**
   *
   * @type {number}
   * @memberof ScalewayDomainV2beta1Record
   */
  priority?: number;
  /**
   *
   * @type {number}
   * @memberof ScalewayDomainV2beta1Record
   */
  ttl?: number;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordType}
   * @memberof ScalewayDomainV2beta1Record
   */
  type?: ScalewayDomainV2beta1RecordType;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1Record
   */
  comment?: string;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordGeoIpConfig}
   * @memberof ScalewayDomainV2beta1Record
   */
  geo_ip_config?: ScalewayDomainV2beta1RecordGeoIpConfig;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordHttpServiceConfig}
   * @memberof ScalewayDomainV2beta1Record
   */
  http_service_config?: ScalewayDomainV2beta1RecordHttpServiceConfig;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordWeightedConfig}
   * @memberof ScalewayDomainV2beta1Record
   */
  weighted_config?: ScalewayDomainV2beta1RecordWeightedConfig;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordViewConfig}
   * @memberof ScalewayDomainV2beta1Record
   */
  view_config?: ScalewayDomainV2beta1RecordViewConfig;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1Record
   */
  id?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayDomainV2beta1Record
   */
  updated_at?: string;
}

/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordChange
 */
export interface ScalewayDomainV2beta1RecordChange {
  /**
   *
   * @type {ScalewayDomainV2beta1RecordChangeAdd}
   * @memberof ScalewayDomainV2beta1RecordChange
   */
  add?: ScalewayDomainV2beta1RecordChangeAdd;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordChangeSet}
   * @memberof ScalewayDomainV2beta1RecordChange
   */
  set?: ScalewayDomainV2beta1RecordChangeSet;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordChangeDelete}
   * @memberof ScalewayDomainV2beta1RecordChange
   */
  delete?: ScalewayDomainV2beta1RecordChangeDelete;
  /**
   *
   * @type {object}
   * @memberof ScalewayDomainV2beta1RecordChange
   */
  clear?: object;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordChangeAdd
 */
export interface ScalewayDomainV2beta1RecordChangeAdd {
  /**
   *
   * @type {Array<ScalewayDomainV2beta1Record>}
   * @memberof ScalewayDomainV2beta1RecordChangeAdd
   */
  records?: Array<ScalewayDomainV2beta1Record>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordChangeDelete
 */
export interface ScalewayDomainV2beta1RecordChangeDelete {
  /**
   * (UUID format)
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordChangeDelete
   */
  id?: string;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordChangeSetIdFields}
   * @memberof ScalewayDomainV2beta1RecordChangeDelete
   */
  id_fields?: ScalewayDomainV2beta1RecordChangeSetIdFields;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordChangeSet
 */
export interface ScalewayDomainV2beta1RecordChangeSet {
  /**
   * (UUID format)
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordChangeSet
   */
  id?: string;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordChangeSetIdFields}
   * @memberof ScalewayDomainV2beta1RecordChangeSet
   */
  id_fields?: ScalewayDomainV2beta1RecordChangeSetIdFields;
  /**
   *
   * @type {Array<ScalewayDomainV2beta1Record>}
   * @memberof ScalewayDomainV2beta1RecordChangeSet
   */
  records?: Array<ScalewayDomainV2beta1Record>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordChangeSetIdFields
 */
export interface ScalewayDomainV2beta1RecordChangeSetIdFields {
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordChangeSetIdFields
   */
  name?: string;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordType}
   * @memberof ScalewayDomainV2beta1RecordChangeSetIdFields
   */
  type?: ScalewayDomainV2beta1RecordType;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordChangeSetIdFields
   */
  data?: string;
  /**
   *
   * @type {number}
   * @memberof ScalewayDomainV2beta1RecordChangeSetIdFields
   */
  ttl?: number;
}

/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordGeoIPConfigMatch
 */
export interface ScalewayDomainV2beta1RecordGeoIPConfigMatch {
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayDomainV2beta1RecordGeoIPConfigMatch
   */
  countries?: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayDomainV2beta1RecordGeoIPConfigMatch
   */
  continents?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordGeoIPConfigMatch
   */
  data?: string;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordGeoIpConfig
 */
export interface ScalewayDomainV2beta1RecordGeoIpConfig {
  /**
   *
   * @type {Array<ScalewayDomainV2beta1RecordGeoIPConfigMatch>}
   * @memberof ScalewayDomainV2beta1RecordGeoIpConfig
   */
  matches?: Array<ScalewayDomainV2beta1RecordGeoIPConfigMatch>;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordGeoIpConfig
   */
  default?: string;
}
/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayDomainV2beta1RecordHTTPServiceConfigStrategy = {
  Random: 'random',
  Hashed: 'hashed',
  All: 'all',
} as const;

export type ScalewayDomainV2beta1RecordHTTPServiceConfigStrategy =
  (typeof ScalewayDomainV2beta1RecordHTTPServiceConfigStrategy)[keyof typeof ScalewayDomainV2beta1RecordHTTPServiceConfigStrategy];

/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordHttpServiceConfig
 */
export interface ScalewayDomainV2beta1RecordHttpServiceConfig {
  /**
   * (IP address)
   * @type {Array<string>}
   * @memberof ScalewayDomainV2beta1RecordHttpServiceConfig
   */
  ips?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordHttpServiceConfig
   */
  must_contain?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordHttpServiceConfig
   */
  url?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordHttpServiceConfig
   */
  user_agent?: string;
  /**
   *
   * @type {ScalewayDomainV2beta1RecordHTTPServiceConfigStrategy}
   * @memberof ScalewayDomainV2beta1RecordHttpServiceConfig
   */
  strategy?: ScalewayDomainV2beta1RecordHTTPServiceConfigStrategy;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayDomainV2beta1RecordType = {
  Unknown: 'unknown',
  A: 'A',
  Aaaa: 'AAAA',
  Cname: 'CNAME',
  Txt: 'TXT',
  Srv: 'SRV',
  Tlsa: 'TLSA',
  Mx: 'MX',
  Ns: 'NS',
  Ptr: 'PTR',
  Caa: 'CAA',
  Alias: 'ALIAS',
  Loc: 'LOC',
  Sshfp: 'SSHFP',
  Hinfo: 'HINFO',
  Rp: 'RP',
  Uri: 'URI',
  Ds: 'DS',
  Naptr: 'NAPTR',
  Dname: 'DNAME',
  Svcb: 'SVCB',
  Https: 'HTTPS',
} as const;

export type ScalewayDomainV2beta1RecordType =
  (typeof ScalewayDomainV2beta1RecordType)[keyof typeof ScalewayDomainV2beta1RecordType];

/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordViewConfig
 */
export interface ScalewayDomainV2beta1RecordViewConfig {
  /**
   *
   * @type {Array<ScalewayDomainV2beta1RecordViewConfigView>}
   * @memberof ScalewayDomainV2beta1RecordViewConfig
   */
  views?: Array<ScalewayDomainV2beta1RecordViewConfigView>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordViewConfigView
 */
export interface ScalewayDomainV2beta1RecordViewConfigView {
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordViewConfigView
   */
  subnet?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordViewConfigView
   */
  data?: string;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordWeightedConfig
 */
export interface ScalewayDomainV2beta1RecordWeightedConfig {
  /**
   *
   * @type {Array<ScalewayDomainV2beta1RecordWeightedConfigWeightedIP>}
   * @memberof ScalewayDomainV2beta1RecordWeightedConfig
   */
  weighted_ips?: Array<ScalewayDomainV2beta1RecordWeightedConfigWeightedIP>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RecordWeightedConfigWeightedIP
 */
export interface ScalewayDomainV2beta1RecordWeightedConfigWeightedIP {
  /**
   * (IP address)
   * @type {string}
   * @memberof ScalewayDomainV2beta1RecordWeightedConfigWeightedIP
   */
  ip?: string;
  /**
   *
   * @type {number}
   * @memberof ScalewayDomainV2beta1RecordWeightedConfigWeightedIP
   */
  weight?: number;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1RefreshDNSZoneResponse
 */
export interface ScalewayDomainV2beta1RefreshDNSZoneResponse {
  /**
   * DNS zones returned.
   * @type {Array<ScalewayDomainV2beta1DNSZone>}
   * @memberof ScalewayDomainV2beta1RefreshDNSZoneResponse
   */
  dns_zones?: Array<ScalewayDomainV2beta1DNSZone>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1SSLCertificate
 */
export interface ScalewayDomainV2beta1SSLCertificate {
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1SSLCertificate
   */
  dns_zone?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof ScalewayDomainV2beta1SSLCertificate
   */
  alternative_dns_zones?: Array<string>;
  /**
   *
   * @type {ScalewayDomainV2beta1SSLCertificateStatus}
   * @memberof ScalewayDomainV2beta1SSLCertificate
   */
  status?: ScalewayDomainV2beta1SSLCertificateStatus;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1SSLCertificate
   */
  private_key?: string;
  /**
   *
   * @type {string}
   * @memberof ScalewayDomainV2beta1SSLCertificate
   */
  certificate_chain?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayDomainV2beta1SSLCertificate
   */
  created_at?: string;
  /**
   * (RFC 3339 format)
   * @type {string}
   * @memberof ScalewayDomainV2beta1SSLCertificate
   */
  expired_at?: string;
}

/**
 *
 * @export
 * @enum {string}
 */

export const ScalewayDomainV2beta1SSLCertificateStatus = {
  Unknown: 'unknown',
  New: 'new',
  Pending: 'pending',
  Success: 'success',
  Error: 'error',
} as const;

export type ScalewayDomainV2beta1SSLCertificateStatus =
  (typeof ScalewayDomainV2beta1SSLCertificateStatus)[keyof typeof ScalewayDomainV2beta1SSLCertificateStatus];

/**
 *
 * @export
 * @interface ScalewayDomainV2beta1UpdateDNSZoneNameserversResponse
 */
export interface ScalewayDomainV2beta1UpdateDNSZoneNameserversResponse {
  /**
   * DNS zone name servers returned.
   * @type {Array<ScalewayDomainV2beta1Nameserver>}
   * @memberof ScalewayDomainV2beta1UpdateDNSZoneNameserversResponse
   */
  ns?: Array<ScalewayDomainV2beta1Nameserver>;
}
/**
 *
 * @export
 * @interface ScalewayDomainV2beta1UpdateDNSZoneRecordsResponse
 */
export interface ScalewayDomainV2beta1UpdateDNSZoneRecordsResponse {
  /**
   * DNS zone records returned.
   * @type {Array<ScalewayDomainV2beta1Record>}
   * @memberof ScalewayDomainV2beta1UpdateDNSZoneRecordsResponse
   */
  records?: Array<ScalewayDomainV2beta1Record>;
}
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
 * @interface UpdateDNSZoneNameserversRequest
 */
export interface UpdateDNSZoneNameserversRequest {
  /**
   * New DNS zone name servers.
   * @type {Array<ScalewayDomainV2beta1Nameserver>}
   * @memberof UpdateDNSZoneNameserversRequest
   */
  ns: Array<ScalewayDomainV2beta1Nameserver>;
}
/**
 *
 * @export
 * @interface UpdateDNSZoneRecordsRequest
 */
export interface UpdateDNSZoneRecordsRequest {
  /**
   * Changes made to the records.
   * @type {Array<ScalewayDomainV2beta1RecordChange>}
   * @memberof UpdateDNSZoneRecordsRequest
   */
  changes: Array<ScalewayDomainV2beta1RecordChange>;
  /**
   * Specifies whether or not to return all the records.
   * @type {boolean}
   * @memberof UpdateDNSZoneRecordsRequest
   */
  return_all_records?: boolean;
  /**
   * Disable the creation of the target zone if it does not exist. Target zone creation is disabled by default.
   * @type {boolean}
   * @memberof UpdateDNSZoneRecordsRequest
   */
  disallow_new_zone_creation?: boolean;
  /**
   * Use the provided serial (0) instead of the auto-increment serial.
   * @type {number}
   * @memberof UpdateDNSZoneRecordsRequest
   */
  serial?: number;
}
/**
 *
 * @export
 * @interface UpdateDNSZoneRequest
 */
export interface UpdateDNSZoneRequest {
  /**
   * Name of the new DNS zone to create.
   * @type {string}
   * @memberof UpdateDNSZoneRequest
   */
  new_dns_zone: string;
  /**
   * Project ID in which to create the new DNS zone.
   * @type {string}
   * @memberof UpdateDNSZoneRequest
   */
  project_id: string;
}

/**
 * DNSZonesApi - axios parameter creator
 * @export
 */
export const DNSZonesApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Clone an existing DNS zone with all its records into a new DNS zone.
     * @summary Clone a DNS zone
     * @param {string} dnsZone DNS zone to clone.
     * @param {CloneDNSZoneRequest} cloneDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    cloneDNSZone: async (
      dnsZone: string,
      cloneDNSZoneRequest: CloneDNSZoneRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('cloneDNSZone', 'dnsZone', dnsZone);
      // verify required parameter 'cloneDNSZoneRequest' is not null or undefined
      assertParamExists(
        'cloneDNSZone',
        'cloneDNSZoneRequest',
        cloneDNSZoneRequest,
      );
      const localVarPath = `/domain/v2beta1/dns-zones/{dns_zone}/clone`.replace(
        `{${'dns_zone'}}`,
        encodeURIComponent(String(dnsZone)),
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
        cloneDNSZoneRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Create a new DNS zone specified by the domain name, the subdomain and the Project ID.
     * @summary Create a DNS zone
     * @param {CreateDNSZoneRequest} createDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createDNSZone: async (
      createDNSZoneRequest: CreateDNSZoneRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'createDNSZoneRequest' is not null or undefined
      assertParamExists(
        'createDNSZone',
        'createDNSZoneRequest',
        createDNSZoneRequest,
      );
      const localVarPath = `/domain/v2beta1/dns-zones`;
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
        createDNSZoneRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Create a new TLS certificate or retrieve information about an existing TLS certificate.
     * @summary Create or get the DNS zone\'s TLS certificate
     * @param {CreateSSLCertificateRequest} createSSLCertificateRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSSLCertificate: async (
      createSSLCertificateRequest: CreateSSLCertificateRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'createSSLCertificateRequest' is not null or undefined
      assertParamExists(
        'createSSLCertificate',
        'createSSLCertificateRequest',
        createSSLCertificateRequest,
      );
      const localVarPath = `/domain/v2beta1/ssl-certificates`;
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
        createSSLCertificateRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Delete a DNS zone and all its records.
     * @summary Delete a DNS zone
     * @param {string} dnsZone DNS zone to delete.
     * @param {string} projectId Project ID of the DNS zone to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteDNSZone: async (
      dnsZone: string,
      projectId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('deleteDNSZone', 'dnsZone', dnsZone);
      // verify required parameter 'projectId' is not null or undefined
      assertParamExists('deleteDNSZone', 'projectId', projectId);
      const localVarPath = `/domain/v2beta1/dns-zones/{dns_zone}`.replace(
        `{${'dns_zone'}}`,
        encodeURIComponent(String(dnsZone)),
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
     * Delete an existing TSIG key specified by its DNS zone. Deleting a TSIG key is permanent and cannot be undone.
     * @summary Delete the DNS zone\'s TSIG key
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteDNSZoneTsigKey: async (
      dnsZone: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('deleteDNSZoneTsigKey', 'dnsZone', dnsZone);
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/tsig-key`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
     * Delete an existing TLS certificate specified by its DNS zone. Deleting a TLS certificate is permanent and cannot be undone.
     * @summary Delete a TLS certificate
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSSLCertificate: async (
      dnsZone: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('deleteSSLCertificate', 'dnsZone', dnsZone);
      const localVarPath =
        `/domain/v2beta1/ssl-certificates/{dns_zone}`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
     * Retrieve information about the TSIG key of a given DNS zone to allow AXFR requests.
     * @summary Get the DNS zone\'s TSIG key
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getDNSZoneTsigKey: async (
      dnsZone: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('getDNSZoneTsigKey', 'dnsZone', dnsZone);
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/tsig-key`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
     * Get the DNS zone\'s TLS certificate. If you do not have a certificate, the output returns `no certificate found`.
     * @summary Get a DNS zone\'s TLS certificate
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSSLCertificate: async (
      dnsZone: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('getSSLCertificate', 'dnsZone', dnsZone);
      const localVarPath =
        `/domain/v2beta1/ssl-certificates/{dns_zone}`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
     * Retrieve the list of DNS zones you can manage and filter DNS zones associated with specific domain names.
     * @summary List DNS zones
     * @param {string} domain Domain on which to filter the returned DNS zones.
     * @param {string} dnsZone DNS zone on which to filter the returned DNS zones.
     * @param {string} [organizationId] Organization ID on which to filter the returned DNS zones.
     * @param {string} [projectId] Project ID on which to filter the returned DNS zones.
     * @param {ListDNSZonesOrderByEnum} [orderBy] Sort order of the returned DNS zones.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zones to return per page.
     * @param {Array<string>} [dnsZones] DNS zones on which to filter the returned DNS zones.
     * @param {string} [createdAfter] Only list DNS zones created after this date. (RFC 3339 format)
     * @param {string} [createdBefore] Only list DNS zones created before this date. (RFC 3339 format)
     * @param {string} [updatedAfter] Only list DNS zones updated after this date. (RFC 3339 format)
     * @param {string} [updatedBefore] Only list DNS zones updated before this date. (RFC 3339 format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZones: async (
      domain: string,
      dnsZone: string,
      organizationId?: string,
      projectId?: string,
      orderBy?: ListDNSZonesOrderByEnum,
      page?: number,
      pageSize?: number,
      dnsZones?: Array<string>,
      createdAfter?: string,
      createdBefore?: string,
      updatedAfter?: string,
      updatedBefore?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'domain' is not null or undefined
      assertParamExists('listDNSZones', 'domain', domain);
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('listDNSZones', 'dnsZone', dnsZone);
      const localVarPath = `/domain/v2beta1/dns-zones`;
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

      if (projectId !== undefined) {
        localVarQueryParameter['project_id'] = projectId;
      }

      if (orderBy !== undefined) {
        localVarQueryParameter['order_by'] = orderBy;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
      }

      if (domain !== undefined) {
        localVarQueryParameter['domain'] = domain;
      }

      if (dnsZone !== undefined) {
        localVarQueryParameter['dns_zone'] = dnsZone;
      }

      if (dnsZones) {
        localVarQueryParameter['dns_zones'] = dnsZones;
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

      if (updatedAfter !== undefined) {
        localVarQueryParameter['updated_after'] =
          (updatedAfter as any) instanceof Date
            ? (updatedAfter as any).toISOString()
            : updatedAfter;
      }

      if (updatedBefore !== undefined) {
        localVarQueryParameter['updated_before'] =
          (updatedBefore as any) instanceof Date
            ? (updatedBefore as any).toISOString()
            : updatedBefore;
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
     * List all the TLS certificates a user has created, specified by the user\'s Project ID and the DNS zone.
     * @summary List a user\'s TLS certificates
     * @param {string} dnsZone
     * @param {number} [page]
     * @param {number} [pageSize]
     * @param {string} [projectId]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSSLCertificates: async (
      dnsZone: string,
      page?: number,
      pageSize?: number,
      projectId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('listSSLCertificates', 'dnsZone', dnsZone);
      const localVarPath = `/domain/v2beta1/ssl-certificates`;
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

      if (dnsZone !== undefined) {
        localVarQueryParameter['dns_zone'] = dnsZone;
      }

      if (page !== undefined) {
        localVarQueryParameter['page'] = page;
      }

      if (pageSize !== undefined) {
        localVarQueryParameter['page_size'] = pageSize;
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
     * Refresh an SOA DNS zone to reload the records in the DNS zone and update the SOA serial. You can recreate the given DNS zone and its sub DNS zone if needed.
     * @summary Refresh a DNS zone
     * @param {string} dnsZone DNS zone to refresh.
     * @param {RefreshDNSZoneRequest} refreshDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    refreshDNSZone: async (
      dnsZone: string,
      refreshDNSZoneRequest: RefreshDNSZoneRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('refreshDNSZone', 'dnsZone', dnsZone);
      // verify required parameter 'refreshDNSZoneRequest' is not null or undefined
      assertParamExists(
        'refreshDNSZone',
        'refreshDNSZoneRequest',
        refreshDNSZoneRequest,
      );
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/refresh`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
        refreshDNSZoneRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update the name and/or the Organizations for a DNS zone.
     * @summary Update a DNS zone
     * @param {string} dnsZone DNS zone to update.
     * @param {UpdateDNSZoneRequest} updateDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateDNSZone: async (
      dnsZone: string,
      updateDNSZoneRequest: UpdateDNSZoneRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('updateDNSZone', 'dnsZone', dnsZone);
      // verify required parameter 'updateDNSZoneRequest' is not null or undefined
      assertParamExists(
        'updateDNSZone',
        'updateDNSZoneRequest',
        updateDNSZoneRequest,
      );
      const localVarPath = `/domain/v2beta1/dns-zones/{dns_zone}`.replace(
        `{${'dns_zone'}}`,
        encodeURIComponent(String(dnsZone)),
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
        updateDNSZoneRequest,
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
 * DNSZonesApi - functional programming interface
 * @export
 */
export const DNSZonesApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = DNSZonesApiAxiosParamCreator(configuration);
  return {
    /**
     * Clone an existing DNS zone with all its records into a new DNS zone.
     * @summary Clone a DNS zone
     * @param {string} dnsZone DNS zone to clone.
     * @param {CloneDNSZoneRequest} cloneDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async cloneDNSZone(
      dnsZone: string,
      cloneDNSZoneRequest: CloneDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1DNSZone>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.cloneDNSZone(
        dnsZone,
        cloneDNSZoneRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.cloneDNSZone']?.[
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
     * Create a new DNS zone specified by the domain name, the subdomain and the Project ID.
     * @summary Create a DNS zone
     * @param {CreateDNSZoneRequest} createDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createDNSZone(
      createDNSZoneRequest: CreateDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1DNSZone>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.createDNSZone(
        createDNSZoneRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.createDNSZone']?.[
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
     * Create a new TLS certificate or retrieve information about an existing TLS certificate.
     * @summary Create or get the DNS zone\'s TLS certificate
     * @param {CreateSSLCertificateRequest} createSSLCertificateRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createSSLCertificate(
      createSSLCertificateRequest: CreateSSLCertificateRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1SSLCertificate>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.createSSLCertificate(
          createSSLCertificateRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.createSSLCertificate']?.[
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
     * Delete a DNS zone and all its records.
     * @summary Delete a DNS zone
     * @param {string} dnsZone DNS zone to delete.
     * @param {string} projectId Project ID of the DNS zone to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteDNSZone(
      dnsZone: string,
      projectId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<object>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.deleteDNSZone(
        dnsZone,
        projectId,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.deleteDNSZone']?.[
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
     * Delete an existing TSIG key specified by its DNS zone. Deleting a TSIG key is permanent and cannot be undone.
     * @summary Delete the DNS zone\'s TSIG key
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteDNSZoneTsigKey(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteDNSZoneTsigKey(dnsZone, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.deleteDNSZoneTsigKey']?.[
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
     * Delete an existing TLS certificate specified by its DNS zone. Deleting a TLS certificate is permanent and cannot be undone.
     * @summary Delete a TLS certificate
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSSLCertificate(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<object>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.deleteSSLCertificate(dnsZone, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.deleteSSLCertificate']?.[
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
     * Retrieve information about the TSIG key of a given DNS zone to allow AXFR requests.
     * @summary Get the DNS zone\'s TSIG key
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getDNSZoneTsigKey(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1GetDNSZoneTsigKeyResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getDNSZoneTsigKey(dnsZone, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.getDNSZoneTsigKey']?.[
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
     * Get the DNS zone\'s TLS certificate. If you do not have a certificate, the output returns `no certificate found`.
     * @summary Get a DNS zone\'s TLS certificate
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSSLCertificate(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1SSLCertificate>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getSSLCertificate(dnsZone, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.getSSLCertificate']?.[
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
     * Retrieve the list of DNS zones you can manage and filter DNS zones associated with specific domain names.
     * @summary List DNS zones
     * @param {string} domain Domain on which to filter the returned DNS zones.
     * @param {string} dnsZone DNS zone on which to filter the returned DNS zones.
     * @param {string} [organizationId] Organization ID on which to filter the returned DNS zones.
     * @param {string} [projectId] Project ID on which to filter the returned DNS zones.
     * @param {ListDNSZonesOrderByEnum} [orderBy] Sort order of the returned DNS zones.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zones to return per page.
     * @param {Array<string>} [dnsZones] DNS zones on which to filter the returned DNS zones.
     * @param {string} [createdAfter] Only list DNS zones created after this date. (RFC 3339 format)
     * @param {string} [createdBefore] Only list DNS zones created before this date. (RFC 3339 format)
     * @param {string} [updatedAfter] Only list DNS zones updated after this date. (RFC 3339 format)
     * @param {string} [updatedBefore] Only list DNS zones updated before this date. (RFC 3339 format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listDNSZones(
      domain: string,
      dnsZone: string,
      organizationId?: string,
      projectId?: string,
      orderBy?: ListDNSZonesOrderByEnum,
      page?: number,
      pageSize?: number,
      dnsZones?: Array<string>,
      createdAfter?: string,
      createdBefore?: string,
      updatedAfter?: string,
      updatedBefore?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1ListDNSZonesResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.listDNSZones(
        domain,
        dnsZone,
        organizationId,
        projectId,
        orderBy,
        page,
        pageSize,
        dnsZones,
        createdAfter,
        createdBefore,
        updatedAfter,
        updatedBefore,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.listDNSZones']?.[
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
     * List all the TLS certificates a user has created, specified by the user\'s Project ID and the DNS zone.
     * @summary List a user\'s TLS certificates
     * @param {string} dnsZone
     * @param {number} [page]
     * @param {number} [pageSize]
     * @param {string} [projectId]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listSSLCertificates(
      dnsZone: string,
      page?: number,
      pageSize?: number,
      projectId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1ListSSLCertificatesResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listSSLCertificates(
          dnsZone,
          page,
          pageSize,
          projectId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.listSSLCertificates']?.[
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
     * Refresh an SOA DNS zone to reload the records in the DNS zone and update the SOA serial. You can recreate the given DNS zone and its sub DNS zone if needed.
     * @summary Refresh a DNS zone
     * @param {string} dnsZone DNS zone to refresh.
     * @param {RefreshDNSZoneRequest} refreshDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async refreshDNSZone(
      dnsZone: string,
      refreshDNSZoneRequest: RefreshDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1RefreshDNSZoneResponse>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.refreshDNSZone(
        dnsZone,
        refreshDNSZoneRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.refreshDNSZone']?.[
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
     * Update the name and/or the Organizations for a DNS zone.
     * @summary Update a DNS zone
     * @param {string} dnsZone DNS zone to update.
     * @param {UpdateDNSZoneRequest} updateDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateDNSZone(
      dnsZone: string,
      updateDNSZoneRequest: UpdateDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1DNSZone>
    > {
      const localVarAxiosArgs = await localVarAxiosParamCreator.updateDNSZone(
        dnsZone,
        updateDNSZoneRequest,
        options,
      );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['DNSZonesApi.updateDNSZone']?.[
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
 * DNSZonesApi - factory interface
 * @export
 */
export const DNSZonesApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = DNSZonesApiFp(configuration);
  return {
    /**
     * Clone an existing DNS zone with all its records into a new DNS zone.
     * @summary Clone a DNS zone
     * @param {string} dnsZone DNS zone to clone.
     * @param {CloneDNSZoneRequest} cloneDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    cloneDNSZone(
      dnsZone: string,
      cloneDNSZoneRequest: CloneDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1DNSZone> {
      return localVarFp
        .cloneDNSZone(dnsZone, cloneDNSZoneRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a new DNS zone specified by the domain name, the subdomain and the Project ID.
     * @summary Create a DNS zone
     * @param {CreateDNSZoneRequest} createDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createDNSZone(
      createDNSZoneRequest: CreateDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1DNSZone> {
      return localVarFp
        .createDNSZone(createDNSZoneRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Create a new TLS certificate or retrieve information about an existing TLS certificate.
     * @summary Create or get the DNS zone\'s TLS certificate
     * @param {CreateSSLCertificateRequest} createSSLCertificateRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSSLCertificate(
      createSSLCertificateRequest: CreateSSLCertificateRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1SSLCertificate> {
      return localVarFp
        .createSSLCertificate(createSSLCertificateRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete a DNS zone and all its records.
     * @summary Delete a DNS zone
     * @param {string} dnsZone DNS zone to delete.
     * @param {string} projectId Project ID of the DNS zone to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteDNSZone(
      dnsZone: string,
      projectId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<object> {
      return localVarFp
        .deleteDNSZone(dnsZone, projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete an existing TSIG key specified by its DNS zone. Deleting a TSIG key is permanent and cannot be undone.
     * @summary Delete the DNS zone\'s TSIG key
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteDNSZoneTsigKey(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<void> {
      return localVarFp
        .deleteDNSZoneTsigKey(dnsZone, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Delete an existing TLS certificate specified by its DNS zone. Deleting a TLS certificate is permanent and cannot be undone.
     * @summary Delete a TLS certificate
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSSLCertificate(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<object> {
      return localVarFp
        .deleteSSLCertificate(dnsZone, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve information about the TSIG key of a given DNS zone to allow AXFR requests.
     * @summary Get the DNS zone\'s TSIG key
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getDNSZoneTsigKey(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1GetDNSZoneTsigKeyResponse> {
      return localVarFp
        .getDNSZoneTsigKey(dnsZone, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Get the DNS zone\'s TLS certificate. If you do not have a certificate, the output returns `no certificate found`.
     * @summary Get a DNS zone\'s TLS certificate
     * @param {string} dnsZone
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSSLCertificate(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1SSLCertificate> {
      return localVarFp
        .getSSLCertificate(dnsZone, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve the list of DNS zones you can manage and filter DNS zones associated with specific domain names.
     * @summary List DNS zones
     * @param {string} domain Domain on which to filter the returned DNS zones.
     * @param {string} dnsZone DNS zone on which to filter the returned DNS zones.
     * @param {string} [organizationId] Organization ID on which to filter the returned DNS zones.
     * @param {string} [projectId] Project ID on which to filter the returned DNS zones.
     * @param {ListDNSZonesOrderByEnum} [orderBy] Sort order of the returned DNS zones.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zones to return per page.
     * @param {Array<string>} [dnsZones] DNS zones on which to filter the returned DNS zones.
     * @param {string} [createdAfter] Only list DNS zones created after this date. (RFC 3339 format)
     * @param {string} [createdBefore] Only list DNS zones created before this date. (RFC 3339 format)
     * @param {string} [updatedAfter] Only list DNS zones updated after this date. (RFC 3339 format)
     * @param {string} [updatedBefore] Only list DNS zones updated before this date. (RFC 3339 format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZones(
      domain: string,
      dnsZone: string,
      organizationId?: string,
      projectId?: string,
      orderBy?: ListDNSZonesOrderByEnum,
      page?: number,
      pageSize?: number,
      dnsZones?: Array<string>,
      createdAfter?: string,
      createdBefore?: string,
      updatedAfter?: string,
      updatedBefore?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1ListDNSZonesResponse> {
      return localVarFp
        .listDNSZones(
          domain,
          dnsZone,
          organizationId,
          projectId,
          orderBy,
          page,
          pageSize,
          dnsZones,
          createdAfter,
          createdBefore,
          updatedAfter,
          updatedBefore,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * List all the TLS certificates a user has created, specified by the user\'s Project ID and the DNS zone.
     * @summary List a user\'s TLS certificates
     * @param {string} dnsZone
     * @param {number} [page]
     * @param {number} [pageSize]
     * @param {string} [projectId]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSSLCertificates(
      dnsZone: string,
      page?: number,
      pageSize?: number,
      projectId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1ListSSLCertificatesResponse> {
      return localVarFp
        .listSSLCertificates(dnsZone, page, pageSize, projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Refresh an SOA DNS zone to reload the records in the DNS zone and update the SOA serial. You can recreate the given DNS zone and its sub DNS zone if needed.
     * @summary Refresh a DNS zone
     * @param {string} dnsZone DNS zone to refresh.
     * @param {RefreshDNSZoneRequest} refreshDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    refreshDNSZone(
      dnsZone: string,
      refreshDNSZoneRequest: RefreshDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1RefreshDNSZoneResponse> {
      return localVarFp
        .refreshDNSZone(dnsZone, refreshDNSZoneRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Update the name and/or the Organizations for a DNS zone.
     * @summary Update a DNS zone
     * @param {string} dnsZone DNS zone to update.
     * @param {UpdateDNSZoneRequest} updateDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateDNSZone(
      dnsZone: string,
      updateDNSZoneRequest: UpdateDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1DNSZone> {
      return localVarFp
        .updateDNSZone(dnsZone, updateDNSZoneRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * DNSZonesApi - interface
 * @export
 * @interface DNSZonesApi
 */
export interface DNSZonesApiInterface {
  /**
   * Clone an existing DNS zone with all its records into a new DNS zone.
   * @summary Clone a DNS zone
   * @param {string} dnsZone DNS zone to clone.
   * @param {CloneDNSZoneRequest} cloneDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  cloneDNSZone(
    dnsZone: string,
    cloneDNSZoneRequest: CloneDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1DNSZone>;

  /**
   * Create a new DNS zone specified by the domain name, the subdomain and the Project ID.
   * @summary Create a DNS zone
   * @param {CreateDNSZoneRequest} createDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  createDNSZone(
    createDNSZoneRequest: CreateDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1DNSZone>;

  /**
   * Create a new TLS certificate or retrieve information about an existing TLS certificate.
   * @summary Create or get the DNS zone\'s TLS certificate
   * @param {CreateSSLCertificateRequest} createSSLCertificateRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  createSSLCertificate(
    createSSLCertificateRequest: CreateSSLCertificateRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1SSLCertificate>;

  /**
   * Delete a DNS zone and all its records.
   * @summary Delete a DNS zone
   * @param {string} dnsZone DNS zone to delete.
   * @param {string} projectId Project ID of the DNS zone to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  deleteDNSZone(
    dnsZone: string,
    projectId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<object>;

  /**
   * Delete an existing TSIG key specified by its DNS zone. Deleting a TSIG key is permanent and cannot be undone.
   * @summary Delete the DNS zone\'s TSIG key
   * @param {string} dnsZone
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  deleteDNSZoneTsigKey(
    dnsZone: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<void>;

  /**
   * Delete an existing TLS certificate specified by its DNS zone. Deleting a TLS certificate is permanent and cannot be undone.
   * @summary Delete a TLS certificate
   * @param {string} dnsZone
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  deleteSSLCertificate(
    dnsZone: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<object>;

  /**
   * Retrieve information about the TSIG key of a given DNS zone to allow AXFR requests.
   * @summary Get the DNS zone\'s TSIG key
   * @param {string} dnsZone
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  getDNSZoneTsigKey(
    dnsZone: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1GetDNSZoneTsigKeyResponse>;

  /**
   * Get the DNS zone\'s TLS certificate. If you do not have a certificate, the output returns `no certificate found`.
   * @summary Get a DNS zone\'s TLS certificate
   * @param {string} dnsZone
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  getSSLCertificate(
    dnsZone: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1SSLCertificate>;

  /**
   * Retrieve the list of DNS zones you can manage and filter DNS zones associated with specific domain names.
   * @summary List DNS zones
   * @param {string} domain Domain on which to filter the returned DNS zones.
   * @param {string} dnsZone DNS zone on which to filter the returned DNS zones.
   * @param {string} [organizationId] Organization ID on which to filter the returned DNS zones.
   * @param {string} [projectId] Project ID on which to filter the returned DNS zones.
   * @param {ListDNSZonesOrderByEnum} [orderBy] Sort order of the returned DNS zones.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of DNS zones to return per page.
   * @param {Array<string>} [dnsZones] DNS zones on which to filter the returned DNS zones.
   * @param {string} [createdAfter] Only list DNS zones created after this date. (RFC 3339 format)
   * @param {string} [createdBefore] Only list DNS zones created before this date. (RFC 3339 format)
   * @param {string} [updatedAfter] Only list DNS zones updated after this date. (RFC 3339 format)
   * @param {string} [updatedBefore] Only list DNS zones updated before this date. (RFC 3339 format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  listDNSZones(
    domain: string,
    dnsZone: string,
    organizationId?: string,
    projectId?: string,
    orderBy?: ListDNSZonesOrderByEnum,
    page?: number,
    pageSize?: number,
    dnsZones?: Array<string>,
    createdAfter?: string,
    createdBefore?: string,
    updatedAfter?: string,
    updatedBefore?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1ListDNSZonesResponse>;

  /**
   * List all the TLS certificates a user has created, specified by the user\'s Project ID and the DNS zone.
   * @summary List a user\'s TLS certificates
   * @param {string} dnsZone
   * @param {number} [page]
   * @param {number} [pageSize]
   * @param {string} [projectId]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  listSSLCertificates(
    dnsZone: string,
    page?: number,
    pageSize?: number,
    projectId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1ListSSLCertificatesResponse>;

  /**
   * Refresh an SOA DNS zone to reload the records in the DNS zone and update the SOA serial. You can recreate the given DNS zone and its sub DNS zone if needed.
   * @summary Refresh a DNS zone
   * @param {string} dnsZone DNS zone to refresh.
   * @param {RefreshDNSZoneRequest} refreshDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  refreshDNSZone(
    dnsZone: string,
    refreshDNSZoneRequest: RefreshDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1RefreshDNSZoneResponse>;

  /**
   * Update the name and/or the Organizations for a DNS zone.
   * @summary Update a DNS zone
   * @param {string} dnsZone DNS zone to update.
   * @param {UpdateDNSZoneRequest} updateDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApiInterface
   */
  updateDNSZone(
    dnsZone: string,
    updateDNSZoneRequest: UpdateDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1DNSZone>;
}

/**
 * DNSZonesApi - object-oriented interface
 * @export
 * @class DNSZonesApi
 * @extends {BaseAPI}
 */
export class DNSZonesApi extends BaseAPI implements DNSZonesApiInterface {
  /**
   * Clone an existing DNS zone with all its records into a new DNS zone.
   * @summary Clone a DNS zone
   * @param {string} dnsZone DNS zone to clone.
   * @param {CloneDNSZoneRequest} cloneDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public cloneDNSZone(
    dnsZone: string,
    cloneDNSZoneRequest: CloneDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .cloneDNSZone(dnsZone, cloneDNSZoneRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a new DNS zone specified by the domain name, the subdomain and the Project ID.
   * @summary Create a DNS zone
   * @param {CreateDNSZoneRequest} createDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public createDNSZone(
    createDNSZoneRequest: CreateDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .createDNSZone(createDNSZoneRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Create a new TLS certificate or retrieve information about an existing TLS certificate.
   * @summary Create or get the DNS zone\'s TLS certificate
   * @param {CreateSSLCertificateRequest} createSSLCertificateRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public createSSLCertificate(
    createSSLCertificateRequest: CreateSSLCertificateRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .createSSLCertificate(createSSLCertificateRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete a DNS zone and all its records.
   * @summary Delete a DNS zone
   * @param {string} dnsZone DNS zone to delete.
   * @param {string} projectId Project ID of the DNS zone to delete.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public deleteDNSZone(
    dnsZone: string,
    projectId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .deleteDNSZone(dnsZone, projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete an existing TSIG key specified by its DNS zone. Deleting a TSIG key is permanent and cannot be undone.
   * @summary Delete the DNS zone\'s TSIG key
   * @param {string} dnsZone
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public deleteDNSZoneTsigKey(
    dnsZone: string,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .deleteDNSZoneTsigKey(dnsZone, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Delete an existing TLS certificate specified by its DNS zone. Deleting a TLS certificate is permanent and cannot be undone.
   * @summary Delete a TLS certificate
   * @param {string} dnsZone
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public deleteSSLCertificate(
    dnsZone: string,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .deleteSSLCertificate(dnsZone, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve information about the TSIG key of a given DNS zone to allow AXFR requests.
   * @summary Get the DNS zone\'s TSIG key
   * @param {string} dnsZone
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public getDNSZoneTsigKey(dnsZone: string, options?: RawAxiosRequestConfig) {
    return DNSZonesApiFp(this.configuration)
      .getDNSZoneTsigKey(dnsZone, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Get the DNS zone\'s TLS certificate. If you do not have a certificate, the output returns `no certificate found`.
   * @summary Get a DNS zone\'s TLS certificate
   * @param {string} dnsZone
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public getSSLCertificate(dnsZone: string, options?: RawAxiosRequestConfig) {
    return DNSZonesApiFp(this.configuration)
      .getSSLCertificate(dnsZone, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve the list of DNS zones you can manage and filter DNS zones associated with specific domain names.
   * @summary List DNS zones
   * @param {string} domain Domain on which to filter the returned DNS zones.
   * @param {string} dnsZone DNS zone on which to filter the returned DNS zones.
   * @param {string} [organizationId] Organization ID on which to filter the returned DNS zones.
   * @param {string} [projectId] Project ID on which to filter the returned DNS zones.
   * @param {ListDNSZonesOrderByEnum} [orderBy] Sort order of the returned DNS zones.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of DNS zones to return per page.
   * @param {Array<string>} [dnsZones] DNS zones on which to filter the returned DNS zones.
   * @param {string} [createdAfter] Only list DNS zones created after this date. (RFC 3339 format)
   * @param {string} [createdBefore] Only list DNS zones created before this date. (RFC 3339 format)
   * @param {string} [updatedAfter] Only list DNS zones updated after this date. (RFC 3339 format)
   * @param {string} [updatedBefore] Only list DNS zones updated before this date. (RFC 3339 format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public listDNSZones(
    domain: string,
    dnsZone: string,
    organizationId?: string,
    projectId?: string,
    orderBy?: ListDNSZonesOrderByEnum,
    page?: number,
    pageSize?: number,
    dnsZones?: Array<string>,
    createdAfter?: string,
    createdBefore?: string,
    updatedAfter?: string,
    updatedBefore?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .listDNSZones(
        domain,
        dnsZone,
        organizationId,
        projectId,
        orderBy,
        page,
        pageSize,
        dnsZones,
        createdAfter,
        createdBefore,
        updatedAfter,
        updatedBefore,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * List all the TLS certificates a user has created, specified by the user\'s Project ID and the DNS zone.
   * @summary List a user\'s TLS certificates
   * @param {string} dnsZone
   * @param {number} [page]
   * @param {number} [pageSize]
   * @param {string} [projectId]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public listSSLCertificates(
    dnsZone: string,
    page?: number,
    pageSize?: number,
    projectId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .listSSLCertificates(dnsZone, page, pageSize, projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Refresh an SOA DNS zone to reload the records in the DNS zone and update the SOA serial. You can recreate the given DNS zone and its sub DNS zone if needed.
   * @summary Refresh a DNS zone
   * @param {string} dnsZone DNS zone to refresh.
   * @param {RefreshDNSZoneRequest} refreshDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public refreshDNSZone(
    dnsZone: string,
    refreshDNSZoneRequest: RefreshDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .refreshDNSZone(dnsZone, refreshDNSZoneRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update the name and/or the Organizations for a DNS zone.
   * @summary Update a DNS zone
   * @param {string} dnsZone DNS zone to update.
   * @param {UpdateDNSZoneRequest} updateDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof DNSZonesApi
   */
  public updateDNSZone(
    dnsZone: string,
    updateDNSZoneRequest: UpdateDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return DNSZonesApiFp(this.configuration)
      .updateDNSZone(dnsZone, updateDNSZoneRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListDNSZonesOrderByEnum = {
  DomainAsc: 'domain_asc',
  DomainDesc: 'domain_desc',
  SubdomainAsc: 'subdomain_asc',
  SubdomainDesc: 'subdomain_desc',
  CreatedAtAsc: 'created_at_asc',
  CreatedAtDesc: 'created_at_desc',
  UpdatedAtAsc: 'updated_at_asc',
  UpdatedAtDesc: 'updated_at_desc',
} as const;
export type ListDNSZonesOrderByEnum =
  (typeof ListDNSZonesOrderByEnum)[keyof typeof ListDNSZonesOrderByEnum];

/**
 * ImportsExportsApi - axios parameter creator
 * @export
 */
export const ImportsExportsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Export a DNS zone with default name servers, in a specific format.
     * @summary Export a raw DNS zone
     * @param {string} dnsZone DNS zone to export.
     * @param {ExportRawDNSZoneFormatEnum} [format] DNS zone format.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    exportRawDNSZone: async (
      dnsZone: string,
      format?: ExportRawDNSZoneFormatEnum,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('exportRawDNSZone', 'dnsZone', dnsZone);
      const localVarPath = `/domain/v2beta1/dns-zones/{dns_zone}/raw`.replace(
        `{${'dns_zone'}}`,
        encodeURIComponent(String(dnsZone)),
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

      if (format !== undefined) {
        localVarQueryParameter['format'] = format;
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
     * Import and replace the format of records from a given provider, with default name servers.
     * @summary Import a DNS zone from another provider
     * @param {string} dnsZone
     * @param {ImportProviderDNSZoneRequest} importProviderDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    importProviderDNSZone: async (
      dnsZone: string,
      importProviderDNSZoneRequest: ImportProviderDNSZoneRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('importProviderDNSZone', 'dnsZone', dnsZone);
      // verify required parameter 'importProviderDNSZoneRequest' is not null or undefined
      assertParamExists(
        'importProviderDNSZone',
        'importProviderDNSZoneRequest',
        importProviderDNSZoneRequest,
      );
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/import-provider`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
        importProviderDNSZoneRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Import and replace the format of records from a given provider, with default name servers.
     * @summary Import a raw DNS zone
     * @param {string} dnsZone DNS zone to import.
     * @param {ImportRawDNSZoneRequest} importRawDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    importRawDNSZone: async (
      dnsZone: string,
      importRawDNSZoneRequest: ImportRawDNSZoneRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('importRawDNSZone', 'dnsZone', dnsZone);
      // verify required parameter 'importRawDNSZoneRequest' is not null or undefined
      assertParamExists(
        'importRawDNSZone',
        'importRawDNSZoneRequest',
        importRawDNSZoneRequest,
      );
      const localVarPath = `/domain/v2beta1/dns-zones/{dns_zone}/raw`.replace(
        `{${'dns_zone'}}`,
        encodeURIComponent(String(dnsZone)),
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
        importRawDNSZoneRequest,
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
 * ImportsExportsApi - functional programming interface
 * @export
 */
export const ImportsExportsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator =
    ImportsExportsApiAxiosParamCreator(configuration);
  return {
    /**
     * Export a DNS zone with default name servers, in a specific format.
     * @summary Export a raw DNS zone
     * @param {string} dnsZone DNS zone to export.
     * @param {ExportRawDNSZoneFormatEnum} [format] DNS zone format.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async exportRawDNSZone(
      dnsZone: string,
      format?: ExportRawDNSZoneFormatEnum,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayStdFile>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.exportRawDNSZone(
          dnsZone,
          format,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImportsExportsApi.exportRawDNSZone']?.[
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
     * Import and replace the format of records from a given provider, with default name servers.
     * @summary Import a DNS zone from another provider
     * @param {string} dnsZone
     * @param {ImportProviderDNSZoneRequest} importProviderDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async importProviderDNSZone(
      dnsZone: string,
      importProviderDNSZoneRequest: ImportProviderDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1ImportProviderDNSZoneResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.importProviderDNSZone(
          dnsZone,
          importProviderDNSZoneRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImportsExportsApi.importProviderDNSZone']?.[
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
     * Import and replace the format of records from a given provider, with default name servers.
     * @summary Import a raw DNS zone
     * @param {string} dnsZone DNS zone to import.
     * @param {ImportRawDNSZoneRequest} importRawDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async importRawDNSZone(
      dnsZone: string,
      importRawDNSZoneRequest: ImportRawDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1ImportRawDNSZoneResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.importRawDNSZone(
          dnsZone,
          importRawDNSZoneRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['ImportsExportsApi.importRawDNSZone']?.[
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
 * ImportsExportsApi - factory interface
 * @export
 */
export const ImportsExportsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = ImportsExportsApiFp(configuration);
  return {
    /**
     * Export a DNS zone with default name servers, in a specific format.
     * @summary Export a raw DNS zone
     * @param {string} dnsZone DNS zone to export.
     * @param {ExportRawDNSZoneFormatEnum} [format] DNS zone format.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    exportRawDNSZone(
      dnsZone: string,
      format?: ExportRawDNSZoneFormatEnum,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayStdFile> {
      return localVarFp
        .exportRawDNSZone(dnsZone, format, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Import and replace the format of records from a given provider, with default name servers.
     * @summary Import a DNS zone from another provider
     * @param {string} dnsZone
     * @param {ImportProviderDNSZoneRequest} importProviderDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    importProviderDNSZone(
      dnsZone: string,
      importProviderDNSZoneRequest: ImportProviderDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1ImportProviderDNSZoneResponse> {
      return localVarFp
        .importProviderDNSZone(dnsZone, importProviderDNSZoneRequest, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Import and replace the format of records from a given provider, with default name servers.
     * @summary Import a raw DNS zone
     * @param {string} dnsZone DNS zone to import.
     * @param {ImportRawDNSZoneRequest} importRawDNSZoneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    importRawDNSZone(
      dnsZone: string,
      importRawDNSZoneRequest: ImportRawDNSZoneRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1ImportRawDNSZoneResponse> {
      return localVarFp
        .importRawDNSZone(dnsZone, importRawDNSZoneRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * ImportsExportsApi - interface
 * @export
 * @interface ImportsExportsApi
 */
export interface ImportsExportsApiInterface {
  /**
   * Export a DNS zone with default name servers, in a specific format.
   * @summary Export a raw DNS zone
   * @param {string} dnsZone DNS zone to export.
   * @param {ExportRawDNSZoneFormatEnum} [format] DNS zone format.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImportsExportsApiInterface
   */
  exportRawDNSZone(
    dnsZone: string,
    format?: ExportRawDNSZoneFormatEnum,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayStdFile>;

  /**
   * Import and replace the format of records from a given provider, with default name servers.
   * @summary Import a DNS zone from another provider
   * @param {string} dnsZone
   * @param {ImportProviderDNSZoneRequest} importProviderDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImportsExportsApiInterface
   */
  importProviderDNSZone(
    dnsZone: string,
    importProviderDNSZoneRequest: ImportProviderDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1ImportProviderDNSZoneResponse>;

  /**
   * Import and replace the format of records from a given provider, with default name servers.
   * @summary Import a raw DNS zone
   * @param {string} dnsZone DNS zone to import.
   * @param {ImportRawDNSZoneRequest} importRawDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImportsExportsApiInterface
   */
  importRawDNSZone(
    dnsZone: string,
    importRawDNSZoneRequest: ImportRawDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1ImportRawDNSZoneResponse>;
}

/**
 * ImportsExportsApi - object-oriented interface
 * @export
 * @class ImportsExportsApi
 * @extends {BaseAPI}
 */
export class ImportsExportsApi
  extends BaseAPI
  implements ImportsExportsApiInterface
{
  /**
   * Export a DNS zone with default name servers, in a specific format.
   * @summary Export a raw DNS zone
   * @param {string} dnsZone DNS zone to export.
   * @param {ExportRawDNSZoneFormatEnum} [format] DNS zone format.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImportsExportsApi
   */
  public exportRawDNSZone(
    dnsZone: string,
    format?: ExportRawDNSZoneFormatEnum,
    options?: RawAxiosRequestConfig,
  ) {
    return ImportsExportsApiFp(this.configuration)
      .exportRawDNSZone(dnsZone, format, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Import and replace the format of records from a given provider, with default name servers.
   * @summary Import a DNS zone from another provider
   * @param {string} dnsZone
   * @param {ImportProviderDNSZoneRequest} importProviderDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImportsExportsApi
   */
  public importProviderDNSZone(
    dnsZone: string,
    importProviderDNSZoneRequest: ImportProviderDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ImportsExportsApiFp(this.configuration)
      .importProviderDNSZone(dnsZone, importProviderDNSZoneRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Import and replace the format of records from a given provider, with default name servers.
   * @summary Import a raw DNS zone
   * @param {string} dnsZone DNS zone to import.
   * @param {ImportRawDNSZoneRequest} importRawDNSZoneRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof ImportsExportsApi
   */
  public importRawDNSZone(
    dnsZone: string,
    importRawDNSZoneRequest: ImportRawDNSZoneRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return ImportsExportsApiFp(this.configuration)
      .importRawDNSZone(dnsZone, importRawDNSZoneRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ExportRawDNSZoneFormatEnum = {
  UnknownRawFormat: 'unknown_raw_format',
  Bind: 'bind',
} as const;
export type ExportRawDNSZoneFormatEnum =
  (typeof ExportRawDNSZoneFormatEnum)[keyof typeof ExportRawDNSZoneFormatEnum];

/**
 * RecordsApi - axios parameter creator
 * @export
 */
export const RecordsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Delete all records within a DNS zone that has default name servers.<br/> All edits will be versioned.
     * @summary Clear records within a DNS zone
     * @param {string} dnsZone DNS zone to clear.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    clearDNSZoneRecords: async (
      dnsZone: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('clearDNSZoneRecords', 'dnsZone', dnsZone);
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/records`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
     * Retrieve a list of name servers within a DNS zone and their optional glue records.
     * @summary List name servers within a DNS zone
     * @param {string} dnsZone DNS zone on which to filter the returned DNS zone name servers.
     * @param {string} [projectId] Project ID on which to filter the returned DNS zone name servers.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZoneNameservers: async (
      dnsZone: string,
      projectId?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('listDNSZoneNameservers', 'dnsZone', dnsZone);
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/nameservers`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
     * Retrieve a list of DNS records within a DNS zone that has default name servers. You can filter records by type and name.
     * @summary List records within a DNS zone
     * @param {string} dnsZone DNS zone on which to filter the returned DNS zone records.
     * @param {string} name Name on which to filter the returned DNS zone records.
     * @param {string} [projectId] Project ID on which to filter the returned DNS zone records.
     * @param {ListDNSZoneRecordsOrderByEnum} [orderBy] Sort order of the returned DNS zone records.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zone records per page.
     * @param {ListDNSZoneRecordsTypeEnum} [type] Record type on which to filter the returned DNS zone records.
     * @param {string} [id] Record ID on which to filter the returned DNS zone records.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZoneRecords: async (
      dnsZone: string,
      name: string,
      projectId?: string,
      orderBy?: ListDNSZoneRecordsOrderByEnum,
      page?: number,
      pageSize?: number,
      type?: ListDNSZoneRecordsTypeEnum,
      id?: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('listDNSZoneRecords', 'dnsZone', dnsZone);
      // verify required parameter 'name' is not null or undefined
      assertParamExists('listDNSZoneRecords', 'name', name);
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/records`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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

      if (projectId !== undefined) {
        localVarQueryParameter['project_id'] = projectId;
      }

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

      if (type !== undefined) {
        localVarQueryParameter['type'] = type;
      }

      if (id !== undefined) {
        localVarQueryParameter['id'] = id;
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
     * Update name servers within a DNS zone and set optional glue records.
     * @summary Update name servers within a DNS zone
     * @param {string} dnsZone DNS zone in which to update the DNS zone name servers.
     * @param {UpdateDNSZoneNameserversRequest} updateDNSZoneNameserversRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateDNSZoneNameservers: async (
      dnsZone: string,
      updateDNSZoneNameserversRequest: UpdateDNSZoneNameserversRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('updateDNSZoneNameservers', 'dnsZone', dnsZone);
      // verify required parameter 'updateDNSZoneNameserversRequest' is not null or undefined
      assertParamExists(
        'updateDNSZoneNameservers',
        'updateDNSZoneNameserversRequest',
        updateDNSZoneNameserversRequest,
      );
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/nameservers`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
        updateDNSZoneNameserversRequest,
        localVarRequestOptions,
        configuration,
      );

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
    /**
     * Update records within a DNS zone that has default name servers and perform several actions on your records.  Actions include:  - add: allows you to add a new record or add a new IP to an existing A record, for example  - set: allows you to edit a record or edit an IP from an existing A record, for example  - delete: allows you to delete a record or delete an IP from an existing A record, for example  - clear: allows you to delete all records from a DNS zone  All edits will be versioned.
     * @summary Update records within a DNS zone
     * @param {string} dnsZone DNS zone in which to update the DNS zone records.
     * @param {UpdateDNSZoneRecordsRequest} updateDNSZoneRecordsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateDNSZoneRecords: async (
      dnsZone: string,
      updateDNSZoneRecordsRequest: UpdateDNSZoneRecordsRequest,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('updateDNSZoneRecords', 'dnsZone', dnsZone);
      // verify required parameter 'updateDNSZoneRecordsRequest' is not null or undefined
      assertParamExists(
        'updateDNSZoneRecords',
        'updateDNSZoneRecordsRequest',
        updateDNSZoneRecordsRequest,
      );
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/records`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
        updateDNSZoneRecordsRequest,
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
 * RecordsApi - functional programming interface
 * @export
 */
export const RecordsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = RecordsApiAxiosParamCreator(configuration);
  return {
    /**
     * Delete all records within a DNS zone that has default name servers.<br/> All edits will be versioned.
     * @summary Clear records within a DNS zone
     * @param {string} dnsZone DNS zone to clear.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async clearDNSZoneRecords(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<object>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.clearDNSZoneRecords(dnsZone, options);
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RecordsApi.clearDNSZoneRecords']?.[
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
     * Retrieve a list of name servers within a DNS zone and their optional glue records.
     * @summary List name servers within a DNS zone
     * @param {string} dnsZone DNS zone on which to filter the returned DNS zone name servers.
     * @param {string} [projectId] Project ID on which to filter the returned DNS zone name servers.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listDNSZoneNameservers(
      dnsZone: string,
      projectId?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1ListDNSZoneNameserversResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listDNSZoneNameservers(
          dnsZone,
          projectId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RecordsApi.listDNSZoneNameservers']?.[
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
     * Retrieve a list of DNS records within a DNS zone that has default name servers. You can filter records by type and name.
     * @summary List records within a DNS zone
     * @param {string} dnsZone DNS zone on which to filter the returned DNS zone records.
     * @param {string} name Name on which to filter the returned DNS zone records.
     * @param {string} [projectId] Project ID on which to filter the returned DNS zone records.
     * @param {ListDNSZoneRecordsOrderByEnum} [orderBy] Sort order of the returned DNS zone records.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zone records per page.
     * @param {ListDNSZoneRecordsTypeEnum} [type] Record type on which to filter the returned DNS zone records.
     * @param {string} [id] Record ID on which to filter the returned DNS zone records.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listDNSZoneRecords(
      dnsZone: string,
      name: string,
      projectId?: string,
      orderBy?: ListDNSZoneRecordsOrderByEnum,
      page?: number,
      pageSize?: number,
      type?: ListDNSZoneRecordsTypeEnum,
      id?: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1ListDNSZoneRecordsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listDNSZoneRecords(
          dnsZone,
          name,
          projectId,
          orderBy,
          page,
          pageSize,
          type,
          id,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RecordsApi.listDNSZoneRecords']?.[
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
     * Update name servers within a DNS zone and set optional glue records.
     * @summary Update name servers within a DNS zone
     * @param {string} dnsZone DNS zone in which to update the DNS zone name servers.
     * @param {UpdateDNSZoneNameserversRequest} updateDNSZoneNameserversRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateDNSZoneNameservers(
      dnsZone: string,
      updateDNSZoneNameserversRequest: UpdateDNSZoneNameserversRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1UpdateDNSZoneNameserversResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateDNSZoneNameservers(
          dnsZone,
          updateDNSZoneNameserversRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RecordsApi.updateDNSZoneNameservers']?.[
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
     * Update records within a DNS zone that has default name servers and perform several actions on your records.  Actions include:  - add: allows you to add a new record or add a new IP to an existing A record, for example  - set: allows you to edit a record or edit an IP from an existing A record, for example  - delete: allows you to delete a record or delete an IP from an existing A record, for example  - clear: allows you to delete all records from a DNS zone  All edits will be versioned.
     * @summary Update records within a DNS zone
     * @param {string} dnsZone DNS zone in which to update the DNS zone records.
     * @param {UpdateDNSZoneRecordsRequest} updateDNSZoneRecordsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateDNSZoneRecords(
      dnsZone: string,
      updateDNSZoneRecordsRequest: UpdateDNSZoneRecordsRequest,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1UpdateDNSZoneRecordsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.updateDNSZoneRecords(
          dnsZone,
          updateDNSZoneRecordsRequest,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['RecordsApi.updateDNSZoneRecords']?.[
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
 * RecordsApi - factory interface
 * @export
 */
export const RecordsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = RecordsApiFp(configuration);
  return {
    /**
     * Delete all records within a DNS zone that has default name servers.<br/> All edits will be versioned.
     * @summary Clear records within a DNS zone
     * @param {string} dnsZone DNS zone to clear.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    clearDNSZoneRecords(
      dnsZone: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<object> {
      return localVarFp
        .clearDNSZoneRecords(dnsZone, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve a list of name servers within a DNS zone and their optional glue records.
     * @summary List name servers within a DNS zone
     * @param {string} dnsZone DNS zone on which to filter the returned DNS zone name servers.
     * @param {string} [projectId] Project ID on which to filter the returned DNS zone name servers.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZoneNameservers(
      dnsZone: string,
      projectId?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1ListDNSZoneNameserversResponse> {
      return localVarFp
        .listDNSZoneNameservers(dnsZone, projectId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve a list of DNS records within a DNS zone that has default name servers. You can filter records by type and name.
     * @summary List records within a DNS zone
     * @param {string} dnsZone DNS zone on which to filter the returned DNS zone records.
     * @param {string} name Name on which to filter the returned DNS zone records.
     * @param {string} [projectId] Project ID on which to filter the returned DNS zone records.
     * @param {ListDNSZoneRecordsOrderByEnum} [orderBy] Sort order of the returned DNS zone records.
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zone records per page.
     * @param {ListDNSZoneRecordsTypeEnum} [type] Record type on which to filter the returned DNS zone records.
     * @param {string} [id] Record ID on which to filter the returned DNS zone records.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZoneRecords(
      dnsZone: string,
      name: string,
      projectId?: string,
      orderBy?: ListDNSZoneRecordsOrderByEnum,
      page?: number,
      pageSize?: number,
      type?: ListDNSZoneRecordsTypeEnum,
      id?: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1ListDNSZoneRecordsResponse> {
      return localVarFp
        .listDNSZoneRecords(
          dnsZone,
          name,
          projectId,
          orderBy,
          page,
          pageSize,
          type,
          id,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update name servers within a DNS zone and set optional glue records.
     * @summary Update name servers within a DNS zone
     * @param {string} dnsZone DNS zone in which to update the DNS zone name servers.
     * @param {UpdateDNSZoneNameserversRequest} updateDNSZoneNameserversRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateDNSZoneNameservers(
      dnsZone: string,
      updateDNSZoneNameserversRequest: UpdateDNSZoneNameserversRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1UpdateDNSZoneNameserversResponse> {
      return localVarFp
        .updateDNSZoneNameservers(
          dnsZone,
          updateDNSZoneNameserversRequest,
          options,
        )
        .then((request) => request(axios, basePath));
    },
    /**
     * Update records within a DNS zone that has default name servers and perform several actions on your records.  Actions include:  - add: allows you to add a new record or add a new IP to an existing A record, for example  - set: allows you to edit a record or edit an IP from an existing A record, for example  - delete: allows you to delete a record or delete an IP from an existing A record, for example  - clear: allows you to delete all records from a DNS zone  All edits will be versioned.
     * @summary Update records within a DNS zone
     * @param {string} dnsZone DNS zone in which to update the DNS zone records.
     * @param {UpdateDNSZoneRecordsRequest} updateDNSZoneRecordsRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateDNSZoneRecords(
      dnsZone: string,
      updateDNSZoneRecordsRequest: UpdateDNSZoneRecordsRequest,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1UpdateDNSZoneRecordsResponse> {
      return localVarFp
        .updateDNSZoneRecords(dnsZone, updateDNSZoneRecordsRequest, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * RecordsApi - interface
 * @export
 * @interface RecordsApi
 */
export interface RecordsApiInterface {
  /**
   * Delete all records within a DNS zone that has default name servers.<br/> All edits will be versioned.
   * @summary Clear records within a DNS zone
   * @param {string} dnsZone DNS zone to clear.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApiInterface
   */
  clearDNSZoneRecords(
    dnsZone: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<object>;

  /**
   * Retrieve a list of name servers within a DNS zone and their optional glue records.
   * @summary List name servers within a DNS zone
   * @param {string} dnsZone DNS zone on which to filter the returned DNS zone name servers.
   * @param {string} [projectId] Project ID on which to filter the returned DNS zone name servers.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApiInterface
   */
  listDNSZoneNameservers(
    dnsZone: string,
    projectId?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1ListDNSZoneNameserversResponse>;

  /**
   * Retrieve a list of DNS records within a DNS zone that has default name servers. You can filter records by type and name.
   * @summary List records within a DNS zone
   * @param {string} dnsZone DNS zone on which to filter the returned DNS zone records.
   * @param {string} name Name on which to filter the returned DNS zone records.
   * @param {string} [projectId] Project ID on which to filter the returned DNS zone records.
   * @param {ListDNSZoneRecordsOrderByEnum} [orderBy] Sort order of the returned DNS zone records.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of DNS zone records per page.
   * @param {ListDNSZoneRecordsTypeEnum} [type] Record type on which to filter the returned DNS zone records.
   * @param {string} [id] Record ID on which to filter the returned DNS zone records.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApiInterface
   */
  listDNSZoneRecords(
    dnsZone: string,
    name: string,
    projectId?: string,
    orderBy?: ListDNSZoneRecordsOrderByEnum,
    page?: number,
    pageSize?: number,
    type?: ListDNSZoneRecordsTypeEnum,
    id?: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1ListDNSZoneRecordsResponse>;

  /**
   * Update name servers within a DNS zone and set optional glue records.
   * @summary Update name servers within a DNS zone
   * @param {string} dnsZone DNS zone in which to update the DNS zone name servers.
   * @param {UpdateDNSZoneNameserversRequest} updateDNSZoneNameserversRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApiInterface
   */
  updateDNSZoneNameservers(
    dnsZone: string,
    updateDNSZoneNameserversRequest: UpdateDNSZoneNameserversRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1UpdateDNSZoneNameserversResponse>;

  /**
   * Update records within a DNS zone that has default name servers and perform several actions on your records.  Actions include:  - add: allows you to add a new record or add a new IP to an existing A record, for example  - set: allows you to edit a record or edit an IP from an existing A record, for example  - delete: allows you to delete a record or delete an IP from an existing A record, for example  - clear: allows you to delete all records from a DNS zone  All edits will be versioned.
   * @summary Update records within a DNS zone
   * @param {string} dnsZone DNS zone in which to update the DNS zone records.
   * @param {UpdateDNSZoneRecordsRequest} updateDNSZoneRecordsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApiInterface
   */
  updateDNSZoneRecords(
    dnsZone: string,
    updateDNSZoneRecordsRequest: UpdateDNSZoneRecordsRequest,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1UpdateDNSZoneRecordsResponse>;
}

/**
 * RecordsApi - object-oriented interface
 * @export
 * @class RecordsApi
 * @extends {BaseAPI}
 */
export class RecordsApi extends BaseAPI implements RecordsApiInterface {
  /**
   * Delete all records within a DNS zone that has default name servers.<br/> All edits will be versioned.
   * @summary Clear records within a DNS zone
   * @param {string} dnsZone DNS zone to clear.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApi
   */
  public clearDNSZoneRecords(dnsZone: string, options?: RawAxiosRequestConfig) {
    return RecordsApiFp(this.configuration)
      .clearDNSZoneRecords(dnsZone, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve a list of name servers within a DNS zone and their optional glue records.
   * @summary List name servers within a DNS zone
   * @param {string} dnsZone DNS zone on which to filter the returned DNS zone name servers.
   * @param {string} [projectId] Project ID on which to filter the returned DNS zone name servers.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApi
   */
  public listDNSZoneNameservers(
    dnsZone: string,
    projectId?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RecordsApiFp(this.configuration)
      .listDNSZoneNameservers(dnsZone, projectId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve a list of DNS records within a DNS zone that has default name servers. You can filter records by type and name.
   * @summary List records within a DNS zone
   * @param {string} dnsZone DNS zone on which to filter the returned DNS zone records.
   * @param {string} name Name on which to filter the returned DNS zone records.
   * @param {string} [projectId] Project ID on which to filter the returned DNS zone records.
   * @param {ListDNSZoneRecordsOrderByEnum} [orderBy] Sort order of the returned DNS zone records.
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of DNS zone records per page.
   * @param {ListDNSZoneRecordsTypeEnum} [type] Record type on which to filter the returned DNS zone records.
   * @param {string} [id] Record ID on which to filter the returned DNS zone records.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApi
   */
  public listDNSZoneRecords(
    dnsZone: string,
    name: string,
    projectId?: string,
    orderBy?: ListDNSZoneRecordsOrderByEnum,
    page?: number,
    pageSize?: number,
    type?: ListDNSZoneRecordsTypeEnum,
    id?: string,
    options?: RawAxiosRequestConfig,
  ) {
    return RecordsApiFp(this.configuration)
      .listDNSZoneRecords(
        dnsZone,
        name,
        projectId,
        orderBy,
        page,
        pageSize,
        type,
        id,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update name servers within a DNS zone and set optional glue records.
   * @summary Update name servers within a DNS zone
   * @param {string} dnsZone DNS zone in which to update the DNS zone name servers.
   * @param {UpdateDNSZoneNameserversRequest} updateDNSZoneNameserversRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApi
   */
  public updateDNSZoneNameservers(
    dnsZone: string,
    updateDNSZoneNameserversRequest: UpdateDNSZoneNameserversRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return RecordsApiFp(this.configuration)
      .updateDNSZoneNameservers(
        dnsZone,
        updateDNSZoneNameserversRequest,
        options,
      )
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Update records within a DNS zone that has default name servers and perform several actions on your records.  Actions include:  - add: allows you to add a new record or add a new IP to an existing A record, for example  - set: allows you to edit a record or edit an IP from an existing A record, for example  - delete: allows you to delete a record or delete an IP from an existing A record, for example  - clear: allows you to delete all records from a DNS zone  All edits will be versioned.
   * @summary Update records within a DNS zone
   * @param {string} dnsZone DNS zone in which to update the DNS zone records.
   * @param {UpdateDNSZoneRecordsRequest} updateDNSZoneRecordsRequest
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof RecordsApi
   */
  public updateDNSZoneRecords(
    dnsZone: string,
    updateDNSZoneRecordsRequest: UpdateDNSZoneRecordsRequest,
    options?: RawAxiosRequestConfig,
  ) {
    return RecordsApiFp(this.configuration)
      .updateDNSZoneRecords(dnsZone, updateDNSZoneRecordsRequest, options)
      .then((request) => request(this.axios, this.basePath));
  }
}

/**
 * @export
 */
export const ListDNSZoneRecordsOrderByEnum = {
  NameAsc: 'name_asc',
  NameDesc: 'name_desc',
} as const;
export type ListDNSZoneRecordsOrderByEnum =
  (typeof ListDNSZoneRecordsOrderByEnum)[keyof typeof ListDNSZoneRecordsOrderByEnum];
/**
 * @export
 */
export const ListDNSZoneRecordsTypeEnum = {
  Unknown: 'unknown',
  A: 'A',
  Aaaa: 'AAAA',
  Cname: 'CNAME',
  Txt: 'TXT',
  Srv: 'SRV',
  Tlsa: 'TLSA',
  Mx: 'MX',
  Ns: 'NS',
  Ptr: 'PTR',
  Caa: 'CAA',
  Alias: 'ALIAS',
  Loc: 'LOC',
  Sshfp: 'SSHFP',
  Hinfo: 'HINFO',
  Rp: 'RP',
  Uri: 'URI',
  Ds: 'DS',
  Naptr: 'NAPTR',
  Dname: 'DNAME',
  Svcb: 'SVCB',
  Https: 'HTTPS',
} as const;
export type ListDNSZoneRecordsTypeEnum =
  (typeof ListDNSZoneRecordsTypeEnum)[keyof typeof ListDNSZoneRecordsTypeEnum];

/**
 * VersionsApi - axios parameter creator
 * @export
 */
export const VersionsApiAxiosParamCreator = function (
  configuration?: Configuration,
) {
  return {
    /**
     * Access a previous DNS zone version to see the differences from another specific version.
     * @summary Access differences from a specific DNS zone version
     * @param {string} dnsZoneVersionId (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getDNSZoneVersionDiff: async (
      dnsZoneVersionId: string,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZoneVersionId' is not null or undefined
      assertParamExists(
        'getDNSZoneVersionDiff',
        'dnsZoneVersionId',
        dnsZoneVersionId,
      );
      const localVarPath =
        `/domain/v2beta1/dns-zones/version/{dns_zone_version_id}/diff`.replace(
          `{${'dns_zone_version_id'}}`,
          encodeURIComponent(String(dnsZoneVersionId)),
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
     * Retrieve a list of records from a specific DNS zone version.
     * @summary List records from a given version of a specific DNS zone
     * @param {string} dnsZoneVersionId (UUID format)
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zones versions records per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZoneVersionRecords: async (
      dnsZoneVersionId: string,
      page?: number,
      pageSize?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZoneVersionId' is not null or undefined
      assertParamExists(
        'listDNSZoneVersionRecords',
        'dnsZoneVersionId',
        dnsZoneVersionId,
      );
      const localVarPath =
        `/domain/v2beta1/dns-zones/version/{dns_zone_version_id}`.replace(
          `{${'dns_zone_version_id'}}`,
          encodeURIComponent(String(dnsZoneVersionId)),
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
     * Retrieve a list of a DNS zone\'s versions.<br/> The maximum version count is 100. If the count reaches this limit, the oldest version will be deleted after each new modification.
     * @summary List versions of a DNS zone
     * @param {string} dnsZone
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zones versions per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZoneVersions: async (
      dnsZone: string,
      page?: number,
      pageSize?: number,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZone' is not null or undefined
      assertParamExists('listDNSZoneVersions', 'dnsZone', dnsZone);
      const localVarPath =
        `/domain/v2beta1/dns-zones/{dns_zone}/versions`.replace(
          `{${'dns_zone'}}`,
          encodeURIComponent(String(dnsZone)),
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
     * Restore and activate a version of a specific DNS zone.
     * @summary Restore a DNS zone version
     * @param {string} dnsZoneVersionId (UUID format)
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    restoreDNSZoneVersion: async (
      dnsZoneVersionId: string,
      body: object,
      options: RawAxiosRequestConfig = {},
    ): Promise<RequestArgs> => {
      // verify required parameter 'dnsZoneVersionId' is not null or undefined
      assertParamExists(
        'restoreDNSZoneVersion',
        'dnsZoneVersionId',
        dnsZoneVersionId,
      );
      // verify required parameter 'body' is not null or undefined
      assertParamExists('restoreDNSZoneVersion', 'body', body);
      const localVarPath =
        `/domain/v2beta1/dns-zones/version/{dns_zone_version_id}/restore`.replace(
          `{${'dns_zone_version_id'}}`,
          encodeURIComponent(String(dnsZoneVersionId)),
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
  };
};

/**
 * VersionsApi - functional programming interface
 * @export
 */
export const VersionsApiFp = function (configuration?: Configuration) {
  const localVarAxiosParamCreator = VersionsApiAxiosParamCreator(configuration);
  return {
    /**
     * Access a previous DNS zone version to see the differences from another specific version.
     * @summary Access differences from a specific DNS zone version
     * @param {string} dnsZoneVersionId (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getDNSZoneVersionDiff(
      dnsZoneVersionId: string,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1GetDNSZoneVersionDiffResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.getDNSZoneVersionDiff(
          dnsZoneVersionId,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VersionsApi.getDNSZoneVersionDiff']?.[
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
     * Retrieve a list of records from a specific DNS zone version.
     * @summary List records from a given version of a specific DNS zone
     * @param {string} dnsZoneVersionId (UUID format)
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zones versions records per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listDNSZoneVersionRecords(
      dnsZoneVersionId: string,
      page?: number,
      pageSize?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1ListDNSZoneVersionRecordsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listDNSZoneVersionRecords(
          dnsZoneVersionId,
          page,
          pageSize,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VersionsApi.listDNSZoneVersionRecords']?.[
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
     * Retrieve a list of a DNS zone\'s versions.<br/> The maximum version count is 100. If the count reaches this limit, the oldest version will be deleted after each new modification.
     * @summary List versions of a DNS zone
     * @param {string} dnsZone
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zones versions per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listDNSZoneVersions(
      dnsZone: string,
      page?: number,
      pageSize?: number,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (
        axios?: AxiosInstance,
        basePath?: string,
      ) => AxiosPromise<ScalewayDomainV2beta1ListDNSZoneVersionsResponse>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.listDNSZoneVersions(
          dnsZone,
          page,
          pageSize,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VersionsApi.listDNSZoneVersions']?.[
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
     * Restore and activate a version of a specific DNS zone.
     * @summary Restore a DNS zone version
     * @param {string} dnsZoneVersionId (UUID format)
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async restoreDNSZoneVersion(
      dnsZoneVersionId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): Promise<
      (axios?: AxiosInstance, basePath?: string) => AxiosPromise<object>
    > {
      const localVarAxiosArgs =
        await localVarAxiosParamCreator.restoreDNSZoneVersion(
          dnsZoneVersionId,
          body,
          options,
        );
      const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
      const localVarOperationServerBasePath =
        operationServerMap['VersionsApi.restoreDNSZoneVersion']?.[
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
 * VersionsApi - factory interface
 * @export
 */
export const VersionsApiFactory = function (
  configuration?: Configuration,
  basePath?: string,
  axios?: AxiosInstance,
) {
  const localVarFp = VersionsApiFp(configuration);
  return {
    /**
     * Access a previous DNS zone version to see the differences from another specific version.
     * @summary Access differences from a specific DNS zone version
     * @param {string} dnsZoneVersionId (UUID format)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getDNSZoneVersionDiff(
      dnsZoneVersionId: string,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1GetDNSZoneVersionDiffResponse> {
      return localVarFp
        .getDNSZoneVersionDiff(dnsZoneVersionId, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve a list of records from a specific DNS zone version.
     * @summary List records from a given version of a specific DNS zone
     * @param {string} dnsZoneVersionId (UUID format)
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zones versions records per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZoneVersionRecords(
      dnsZoneVersionId: string,
      page?: number,
      pageSize?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1ListDNSZoneVersionRecordsResponse> {
      return localVarFp
        .listDNSZoneVersionRecords(dnsZoneVersionId, page, pageSize, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Retrieve a list of a DNS zone\'s versions.<br/> The maximum version count is 100. If the count reaches this limit, the oldest version will be deleted after each new modification.
     * @summary List versions of a DNS zone
     * @param {string} dnsZone
     * @param {number} [page] Page number to return, from the paginated results.
     * @param {number} [pageSize] Maximum number of DNS zones versions per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDNSZoneVersions(
      dnsZone: string,
      page?: number,
      pageSize?: number,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<ScalewayDomainV2beta1ListDNSZoneVersionsResponse> {
      return localVarFp
        .listDNSZoneVersions(dnsZone, page, pageSize, options)
        .then((request) => request(axios, basePath));
    },
    /**
     * Restore and activate a version of a specific DNS zone.
     * @summary Restore a DNS zone version
     * @param {string} dnsZoneVersionId (UUID format)
     * @param {object} body
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    restoreDNSZoneVersion(
      dnsZoneVersionId: string,
      body: object,
      options?: RawAxiosRequestConfig,
    ): AxiosPromise<object> {
      return localVarFp
        .restoreDNSZoneVersion(dnsZoneVersionId, body, options)
        .then((request) => request(axios, basePath));
    },
  };
};

/**
 * VersionsApi - interface
 * @export
 * @interface VersionsApi
 */
export interface VersionsApiInterface {
  /**
   * Access a previous DNS zone version to see the differences from another specific version.
   * @summary Access differences from a specific DNS zone version
   * @param {string} dnsZoneVersionId (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VersionsApiInterface
   */
  getDNSZoneVersionDiff(
    dnsZoneVersionId: string,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1GetDNSZoneVersionDiffResponse>;

  /**
   * Retrieve a list of records from a specific DNS zone version.
   * @summary List records from a given version of a specific DNS zone
   * @param {string} dnsZoneVersionId (UUID format)
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of DNS zones versions records per page.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VersionsApiInterface
   */
  listDNSZoneVersionRecords(
    dnsZoneVersionId: string,
    page?: number,
    pageSize?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1ListDNSZoneVersionRecordsResponse>;

  /**
   * Retrieve a list of a DNS zone\'s versions.<br/> The maximum version count is 100. If the count reaches this limit, the oldest version will be deleted after each new modification.
   * @summary List versions of a DNS zone
   * @param {string} dnsZone
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of DNS zones versions per page.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VersionsApiInterface
   */
  listDNSZoneVersions(
    dnsZone: string,
    page?: number,
    pageSize?: number,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<ScalewayDomainV2beta1ListDNSZoneVersionsResponse>;

  /**
   * Restore and activate a version of a specific DNS zone.
   * @summary Restore a DNS zone version
   * @param {string} dnsZoneVersionId (UUID format)
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VersionsApiInterface
   */
  restoreDNSZoneVersion(
    dnsZoneVersionId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ): AxiosPromise<object>;
}

/**
 * VersionsApi - object-oriented interface
 * @export
 * @class VersionsApi
 * @extends {BaseAPI}
 */
export class VersionsApi extends BaseAPI implements VersionsApiInterface {
  /**
   * Access a previous DNS zone version to see the differences from another specific version.
   * @summary Access differences from a specific DNS zone version
   * @param {string} dnsZoneVersionId (UUID format)
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VersionsApi
   */
  public getDNSZoneVersionDiff(
    dnsZoneVersionId: string,
    options?: RawAxiosRequestConfig,
  ) {
    return VersionsApiFp(this.configuration)
      .getDNSZoneVersionDiff(dnsZoneVersionId, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve a list of records from a specific DNS zone version.
   * @summary List records from a given version of a specific DNS zone
   * @param {string} dnsZoneVersionId (UUID format)
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of DNS zones versions records per page.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VersionsApi
   */
  public listDNSZoneVersionRecords(
    dnsZoneVersionId: string,
    page?: number,
    pageSize?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return VersionsApiFp(this.configuration)
      .listDNSZoneVersionRecords(dnsZoneVersionId, page, pageSize, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Retrieve a list of a DNS zone\'s versions.<br/> The maximum version count is 100. If the count reaches this limit, the oldest version will be deleted after each new modification.
   * @summary List versions of a DNS zone
   * @param {string} dnsZone
   * @param {number} [page] Page number to return, from the paginated results.
   * @param {number} [pageSize] Maximum number of DNS zones versions per page.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VersionsApi
   */
  public listDNSZoneVersions(
    dnsZone: string,
    page?: number,
    pageSize?: number,
    options?: RawAxiosRequestConfig,
  ) {
    return VersionsApiFp(this.configuration)
      .listDNSZoneVersions(dnsZone, page, pageSize, options)
      .then((request) => request(this.axios, this.basePath));
  }

  /**
   * Restore and activate a version of a specific DNS zone.
   * @summary Restore a DNS zone version
   * @param {string} dnsZoneVersionId (UUID format)
   * @param {object} body
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof VersionsApi
   */
  public restoreDNSZoneVersion(
    dnsZoneVersionId: string,
    body: object,
    options?: RawAxiosRequestConfig,
  ) {
    return VersionsApiFp(this.configuration)
      .restoreDNSZoneVersion(dnsZoneVersionId, body, options)
      .then((request) => request(this.axios, this.basePath));
  }
}
