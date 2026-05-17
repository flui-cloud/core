import { BadRequestException } from '@nestjs/common';

export const INTERNAL_HOSTING_ERROR_CODE = 'INTERNAL_HOSTING_NOT_AVAILABLE';

export type InternalHostingMissingRequirement = 'dns_zone' | 'wildcard_issuer';

export interface InternalHostingErrorBody {
  statusCode: 400;
  code: typeof INTERNAL_HOSTING_ERROR_CODE;
  message: string;
  missingRequirements: InternalHostingMissingRequirement[];
  clusterId: string;
}

const REQUIREMENT_LABEL: Record<InternalHostingMissingRequirement, string> = {
  dns_zone: 'DNS zone not assigned',
  wildcard_issuer: 'wildcard certificate issuer not configured',
};

/**
 * Single source of truth for the structured 400 returned by every gating
 * point that refuses an `exposure=internal` operation on a cluster that
 * does not yet support internal hosting. Same shape across:
 *   - POST /clusters/:id/applications
 *   - PATCH /applications/:id
 *   - POST /catalog/:slug/install
 *   - GET /catalog/:slug?clusterId=... (as `notInstallableReason`)
 */
export function internalHostingNotAvailableException(
  clusterId: string,
  missing: InternalHostingMissingRequirement[],
): BadRequestException {
  const reasons = missing.map((m) => REQUIREMENT_LABEL[m]).join(', ');
  const body: InternalHostingErrorBody = {
    statusCode: 400,
    code: INTERNAL_HOSTING_ERROR_CODE,
    message: `Cluster ${clusterId} does not support internal apps: ${reasons}. Configure DNS zone + wildcard issuer first via POST /clusters/${clusterId}/dns/configure-issuer.`,
    missingRequirements: missing,
    clusterId,
  };
  return new BadRequestException(body);
}
