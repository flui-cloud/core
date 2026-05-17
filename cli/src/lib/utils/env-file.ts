export function updateEnvContent(
  content: string,
  updates: Record<string, string>,
): string {
  const lines = content.split('\n');
  const updatedLines: string[] = [];
  const processedKeys = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      updatedLines.push(line);
      continue;
    }

    const match = /^([^=]+)=(.*)$/.exec(trimmed);
    if (match) {
      const key = match[1].trim();
      if (updates[key] !== undefined) {
        updatedLines.push(formatEnvValue(key, updates[key]));
        processedKeys.add(key);
        continue;
      }
    }

    updatedLines.push(line);
  }

  const newKeys = Object.keys(updates).filter((k) => !processedKeys.has(k));
  if (newKeys.length > 0) {
    updatedLines.push('', '# Endpoint configuration (auto-synced)');
    for (const key of newKeys) {
      updatedLines.push(formatEnvValue(key, updates[key]));
    }
  }

  return updatedLines.join('\n');
}

export function formatEnvValue(key: string, value: string): string {
  if (value.includes('\n')) {
    return `${key}="${value}"`;
  }
  return `${key}=${value}`;
}
