import { Request } from 'express';

export const FLUI_SESSION_COOKIE = 'flui_session';

/**
 * Reads the Flui session JWT from the `Cookie` header. Used by passport-jwt
 * strategies so the same token the dashboard places in a cookie (for
 * cross-subdomain ForwardAuth on internal apps) is also accepted on normal
 * API calls.
 *
 * Manual parse keeps us off a `cookie-parser` middleware dependency —
 * single-header parse is simpler than setting up an Express middleware
 * globally just for one cookie.
 */
export function extractJwtFromFluiSessionCookie(req: Request): string | null {
  const header = req?.headers?.cookie;
  if (!header || typeof header !== 'string') return null;
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${FLUI_SESSION_COOKIE}=`)) continue;
    const raw = trimmed.slice(FLUI_SESSION_COOKIE.length + 1);
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}
