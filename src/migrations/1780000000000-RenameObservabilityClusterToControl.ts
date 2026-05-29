import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renames the control cluster's wire value from `observability` to `control`.
 * Adds `control` to both enum types (keeping `observability` for back-compat),
 * migrates existing rows, and backfills the cluster metadata flag/purpose.
 */
export class RenameObservabilityClusterToControl1780000000000
  implements MigrationInterface
{
  name = 'RenameObservabilityClusterToControl1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- infrastructure_clusters.clusterType enum: add 'control' ---
    await queryRunner.query(
      `ALTER TYPE public.infrastructure_clusters_clustertype_enum RENAME TO infrastructure_clusters_clustertype_enum_old`,
    );
    await queryRunner.query(
      `CREATE TYPE public.infrastructure_clusters_clustertype_enum AS ENUM ('control', 'workload', 'observability')`,
    );
    await queryRunner.query(
      `ALTER TABLE public.infrastructure_clusters ALTER COLUMN "clusterType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE public.infrastructure_clusters
         ALTER COLUMN "clusterType" TYPE public.infrastructure_clusters_clustertype_enum
         USING "clusterType"::text::public.infrastructure_clusters_clustertype_enum`,
    );
    await queryRunner.query(
      `ALTER TABLE public.infrastructure_clusters ALTER COLUMN "clusterType" SET DEFAULT 'workload'`,
    );
    await queryRunner.query(
      `DROP TYPE public.infrastructure_clusters_clustertype_enum_old`,
    );

    // --- restore_jobs.targetKind enum: add 'control' ---
    await queryRunner.query(
      `ALTER TYPE public.restore_jobs_targetkind_enum RENAME TO restore_jobs_targetkind_enum_old`,
    );
    await queryRunner.query(
      `CREATE TYPE public.restore_jobs_targetkind_enum AS ENUM ('cluster', 'namespace', 'application', 'control', 'observability')`,
    );
    await queryRunner.query(
      `ALTER TABLE public.restore_jobs
         ALTER COLUMN "targetKind" TYPE public.restore_jobs_targetkind_enum
         USING "targetKind"::text::public.restore_jobs_targetkind_enum`,
    );
    await queryRunner.query(
      `DROP TYPE public.restore_jobs_targetkind_enum_old`,
    );

    // --- migrate existing rows ---
    const clusters = await queryRunner.query(
      `UPDATE public.infrastructure_clusters SET "clusterType" = 'control' WHERE "clusterType" = 'observability' RETURNING id`,
    );
    const restores = await queryRunner.query(
      `UPDATE public.restore_jobs SET "targetKind" = 'control' WHERE "targetKind" = 'observability' RETURNING id`,
    );

    // --- backfill metadata flag + purpose (metadata column is `json`, cast via jsonb) ---
    await queryRunner.query(
      `UPDATE public.infrastructure_clusters
         SET metadata = jsonb_set(COALESCE(metadata::jsonb, '{}'::jsonb), '{isControlCluster}', 'true'::jsonb)::json
       WHERE metadata->>'isObservabilityCluster' = 'true'`,
    );
    await queryRunner.query(
      `UPDATE public.infrastructure_clusters
         SET metadata = jsonb_set(COALESCE(metadata::jsonb, '{}'::jsonb), '{purpose}', '"control"'::jsonb)::json
       WHERE metadata->>'purpose' = 'observability'`,
    );

    console.log(
      `[RenameObservabilityClusterToControl] migrated clusters: ${clusters.length}, restore_jobs: ${restores.length}`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert rows to the legacy value first.
    await queryRunner.query(
      `UPDATE public.infrastructure_clusters SET "clusterType" = 'observability' WHERE "clusterType" = 'control'`,
    );
    await queryRunner.query(
      `UPDATE public.restore_jobs SET "targetKind" = 'observability' WHERE "targetKind" = 'control'`,
    );
    await queryRunner.query(
      `UPDATE public.infrastructure_clusters
         SET metadata = jsonb_set(metadata::jsonb, '{purpose}', '"observability"'::jsonb)::json
       WHERE metadata->>'purpose' = 'control'`,
    );
    await queryRunner.query(
      `UPDATE public.infrastructure_clusters SET metadata = ((metadata::jsonb) - 'isControlCluster')::json
       WHERE metadata::jsonb ? 'isControlCluster'`,
    );

    // Drop 'control' from the enum types.
    await queryRunner.query(
      `ALTER TABLE public.infrastructure_clusters ALTER COLUMN "clusterType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TYPE public.infrastructure_clusters_clustertype_enum RENAME TO infrastructure_clusters_clustertype_enum_old`,
    );
    await queryRunner.query(
      `CREATE TYPE public.infrastructure_clusters_clustertype_enum AS ENUM ('observability', 'workload')`,
    );
    await queryRunner.query(
      `ALTER TABLE public.infrastructure_clusters
         ALTER COLUMN "clusterType" TYPE public.infrastructure_clusters_clustertype_enum
         USING "clusterType"::text::public.infrastructure_clusters_clustertype_enum`,
    );
    await queryRunner.query(
      `ALTER TABLE public.infrastructure_clusters ALTER COLUMN "clusterType" SET DEFAULT 'workload'`,
    );
    await queryRunner.query(
      `DROP TYPE public.infrastructure_clusters_clustertype_enum_old`,
    );

    await queryRunner.query(
      `ALTER TYPE public.restore_jobs_targetkind_enum RENAME TO restore_jobs_targetkind_enum_old`,
    );
    await queryRunner.query(
      `CREATE TYPE public.restore_jobs_targetkind_enum AS ENUM ('cluster', 'namespace', 'application', 'observability')`,
    );
    await queryRunner.query(
      `ALTER TABLE public.restore_jobs
         ALTER COLUMN "targetKind" TYPE public.restore_jobs_targetkind_enum
         USING "targetKind"::text::public.restore_jobs_targetkind_enum`,
    );
    await queryRunner.query(
      `DROP TYPE public.restore_jobs_targetkind_enum_old`,
    );
  }
}
