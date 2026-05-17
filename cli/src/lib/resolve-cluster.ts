import { CliClusterRepository } from './repositories/cli-cluster.repository';
import { ClusterEntity } from 'src/modules/infrastructure/clusters/entities/cluster.entity';

export interface ResolvedCluster {
  id: string;
  name: string;
  entity: ClusterEntity;
}

/**
 * Resolves which cluster to target for a CLI command.
 *
 * Resolution order:
 *   1. --cluster flag provided → match by ID or name (exact, case-insensitive)
 *   2. No flag + exactly 1 cluster stored locally → use it
 *   3. No flag + multiple clusters → error with list + hint
 *   4. No clusters at all → error asking to run `flui env create`
 */
export async function resolveCluster(clusterFlag?: string): Promise<ResolvedCluster> {
  const repo = new CliClusterRepository();
  const all = await repo.find();

  if (all.length === 0) {
    throw new Error('No clusters found locally. Run `flui env create` first.');
  }

  if (clusterFlag) {
    const needle = clusterFlag.toLowerCase();
    const match = all.find(
      (c) => c.id === clusterFlag || c.name.toLowerCase() === needle,
    );
    if (!match) {
      const list = all.map((c) => `  • ${c.name}  (${c.id})`).join('\n');
      throw new Error(
        `Cluster "${clusterFlag}" not found. Available clusters:\n${list}`,
      );
    }
    return { id: match.id, name: match.name, entity: match };
  }

  if (all.length === 1) {
    return { id: all[0].id, name: all[0].name, entity: all[0] };
  }

  const list = all.map((c) => `  • ${c.name}  (${c.id})`).join('\n');
  throw new Error(
    `Multiple clusters found. Specify one with --cluster <name-or-id>:\n${list}`,
  );
}
