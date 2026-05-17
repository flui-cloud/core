export function makeTopologySlug(name: string, maxLen = 14): string {
  if (!name) return '';
  if (name.length <= maxLen) return name;

  if (name.includes('-') || name.includes('_')) {
    const parts = name.split(/[-_]/).filter((p) => p.length > 0);
    if (parts.length > 1) {
      const perPart = Math.max(
        2,
        Math.floor((maxLen - parts.length + 1) / parts.length),
      );
      const joined = parts.map((p) => p.slice(0, perPart)).join('-');
      if (joined.length <= maxLen + 2) return joined;
    }
  }

  return name.slice(0, maxLen - 1) + '…';
}
