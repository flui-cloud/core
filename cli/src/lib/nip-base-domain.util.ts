/**
 * Build the nip.io base domain for a cluster.
 *
 * The IP is encoded with dashes (`162-55-56-10.nip.io`) so the per-cluster
 * token (which may end in digits) cannot collide with nip.io's greedy IPv4
 * extraction across labels.
 */
export function buildNipBaseDomain(
  masterIp: string,
  token?: string | null,
): string {
  const ip = masterIp.replaceAll('.', '-');
  if (token) {
    return `${token}.${ip}.nip.io`;
  }
  return `${ip}.nip.io`;
}
