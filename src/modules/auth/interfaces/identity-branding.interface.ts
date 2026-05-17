export const IDENTITY_BRANDING = 'IDENTITY_BRANDING';

export interface IIdentityBranding {
  /**
   * Apply branding (logos, icons, colors) to the identity provider's hosted
   * login UI. Idempotent — returns true if anything changed, false otherwise.
   * `overrides` lets the bootstrap caller supply the PAT / hostHeader before
   * they are persisted to env (which happens later in the bootstrap flow).
   */
  ensureBranding(
    force?: boolean,
    overrides?: { pat?: string; hostHeader?: string },
  ): Promise<boolean>;
}
