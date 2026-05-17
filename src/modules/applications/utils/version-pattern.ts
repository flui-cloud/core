/**
 * Glob-style version pattern matcher for system-app version curation.
 *
 * Supported patterns:
 *   '**'       — matches any tag (semver, 'latest', branch names, sha tags)
 *   '*'        — matches any semver tag
 *   '4.*'      — matches major 4 (any minor/patch, including pre-release)
 *   '4.15.*'   — matches minor 4.15 (any patch)
 *   '4.15.0'   — matches exact version
 *
 * Leading 'v' is stripped from both tag and pattern before comparison, so
 * 'v4.15.0' matches '4.*' and '4.15.0' matches 'v4.*'.
 *
 * Pre-release suffixes (e.g. '4.15.0-rc.1', '0.1.0-pre-alpha.1') are kept and
 * pass when the major/minor/patch portion matches the pattern.
 */
export function matchesVersionPattern(tag: string, pattern: string): boolean {
  if (pattern === '**') return !!tag;

  const t = tag.replace(/^v/, '');
  const p = pattern.replace(/^v/, '');

  if (p === '*') return /^\d+\.\d+\.\d+/.test(t);

  const tMatch = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(t);
  if (!tMatch) return false;
  const [, tMajor, tMinor, tPatch] = tMatch;

  const parts = p.split('.');
  if (parts.length === 0 || parts.length > 3) return false;
  if (parts[0] !== '*' && parts[0] !== tMajor) return false;
  if (parts.length >= 2 && parts[1] !== '*' && parts[1] !== tMinor)
    return false;
  if (parts.length >= 3 && parts[2] !== '*' && parts[2] !== tPatch)
    return false;
  return true;
}

export function matchesAnyPattern(tag: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((p) => matchesVersionPattern(tag, p));
}
