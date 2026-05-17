/**
 * Centralized nip.io hostname builders. Keep these in sync between bootstrap
 * (system services) and user-facing endpoints so cluster-wide hostname
 * conventions stay coherent.
 *
 * The IP is encoded with dashes (`162-55-56-10.nip.io`) rather than dots so
 * that any token between the service prefix and the IP cannot collide with
 * nip.io's greedy IPv4 extraction across labels (which historically caused
 * `app.royal-gecko-72.162.55.56.10.nip.io` to resolve to `72.162.55.56`).
 */

function encodeNipIp(masterIp: string): string {
  return masterIp.replaceAll('.', '-');
}

export function buildSystemNipHostname(
  service: 'auth' | 'app' | 'grafana' | 'api',
  masterIp: string,
  token?: string | null,
): string {
  const ip = encodeNipIp(masterIp);
  if (token) {
    return `${service}.${token}.${ip}.nip.io`;
  }
  return `${service}.${ip}.nip.io`;
}

export function buildAppNipHostname(slug: string, masterIp: string): string {
  return `${slug}.${encodeNipIp(masterIp)}.nip.io`;
}
