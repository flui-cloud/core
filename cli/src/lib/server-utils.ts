import { ServerResponseDto } from 'src/modules/infrastructure/servers/dto/server-response.dto';

/**
 * Filter servers by labels
 * @param servers List of servers
 * @param labelFilter Label filter as Record<string, string>
 * @returns Filtered servers
 */
export function filterServersByLabels(
  servers: ServerResponseDto[],
  labelFilter: Record<string, string>
): ServerResponseDto[] {
  return servers.filter(server => {
    if (!server.labels) return false;

    // Check if all filter labels match
    return Object.entries(labelFilter).every(([key, value]) => {
      return server.labels?.some(label => label.key === key && label.value === value);
    });
  });
}
