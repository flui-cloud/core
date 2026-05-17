import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema0000000000000 implements MigrationInterface {
  name = 'InitialSchema0000000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    `);
    await queryRunner.query(`
CREATE TYPE public.app_builds_status_enum AS ENUM (
    'PENDING',
    'CLONING',
    'ANALYZING',
    'BUILDING',
    'PUSHING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_endpoints_certchallenge_enum AS ENUM (
    'http-01',
    'dns-01'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_endpoints_certificateprovider_enum AS ENUM (
    'lets_encrypt',
    'lets_encrypt_staging'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_endpoints_certificatestatus_enum AS ENUM (
    'pending',
    'issuing',
    'valid',
    'expired',
    'failed'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_endpoints_dnsrecordtype_enum AS ENUM (
    'A',
    'AAAA',
    'CNAME',
    'TXT',
    'MX',
    'SRV'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_endpoints_endpointtype_enum AS ENUM (
    'public',
    'internal'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_endpoints_hostnamemode_enum AS ENUM (
    'ip',
    'domain'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_endpoints_reconciliationstatus_enum AS ENUM (
    'PENDING',
    'IN_SYNC',
    'DRIFT',
    'RECONCILING',
    'ERROR'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_resources_kind_enum AS ENUM (
    'Deployment',
    'StatefulSet',
    'DaemonSet',
    'Service',
    'Ingress',
    'IngressRoute',
    'ConfigMap',
    'Secret',
    'PersistentVolumeClaim',
    'HorizontalPodAutoscaler',
    'Certificate',
    'ClusterIssuer',
    'Job',
    'CronJob',
    'Namespace'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_resources_reconciliationstatus_enum AS ENUM (
    'PENDING',
    'IN_SYNC',
    'DRIFT',
    'RECONCILING',
    'ERROR'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_resources_status_enum AS ENUM (
    'pending',
    'applied',
    'ready',
    'degraded',
    'failed',
    'deleted'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_revisions_eventtype_enum AS ENUM (
    'deploy',
    'rollback',
    'scale',
    'resource_update',
    'restart',
    'start',
    'stop',
    'config_update',
    'reconciled',
    'created',
    'delete'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.app_revisions_status_enum AS ENUM (
    'pending',
    'awaiting_build',
    'provisioning',
    'running',
    'degraded',
    'stopped',
    'updating',
    'rolling_back',
    'failed',
    'deleting',
    'deleted'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.applications_category_enum AS ENUM (
    'system',
    'user'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.applications_exposure_enum AS ENUM (
    'public',
    'internal'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.applications_kind_enum AS ENUM (
    'DATABASE',
    'APPLICATION',
    'TOOL',
    'SYSTEM'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.applications_reconciliationstatus_enum AS ENUM (
    'PENDING',
    'IN_SYNC',
    'DRIFT',
    'RECONCILING',
    'ERROR'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.applications_sourcetype_enum AS ENUM (
    'docker_image',
    'git_build',
    'helm_chart',
    'raw_manifest'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.applications_status_enum AS ENUM (
    'pending',
    'awaiting_build',
    'provisioning',
    'running',
    'degraded',
    'stopped',
    'updating',
    'rolling_back',
    'failed',
    'deleting',
    'deleted'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_artifact_locations_role_enum AS ENUM (
    'primary',
    'replica'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_artifact_locations_state_enum AS ENUM (
    'pending',
    'uploading',
    'available',
    'verified',
    'missing',
    'expired',
    'failed'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_artifacts_encryptionmode_enum AS ENUM (
    'flui_managed',
    'byo_passphrase',
    'none'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_destinations_encryptionmode_enum AS ENUM (
    'flui_managed',
    'byo_passphrase',
    'none'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_destinations_healthstatus_enum AS ENUM (
    'unknown',
    'healthy',
    'degraded',
    'failed'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_destinations_provider_enum AS ENUM (
    'hetzner_object_storage',
    'scaleway_object_storage',
    'minio',
    'generic_s3'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_jobs_status_enum AS ENUM (
    'pending',
    'running',
    'uploading',
    'replicating',
    'partially_completed',
    'completed',
    'failed',
    'cancelled'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_jobs_triggertype_enum AS ENUM (
    'scheduled',
    'on_demand',
    'pre_deploy'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_policies_profile_enum AS ENUM (
    'single',
    'mirrored',
    'custom'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_policies_scope_enum AS ENUM (
    'cluster_all',
    'namespaces',
    'applications',
    'label_selector'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_policies_status_enum AS ENUM (
    'active',
    'paused',
    'degraded',
    'failed'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_policy_destinations_lastreplicationstatus_enum AS ENUM (
    'ok',
    'degraded',
    'failed',
    'never_run'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.backup_policy_destinations_role_enum AS ENUM (
    'primary',
    'replica'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.catalog_app_definitions_appkind_enum AS ENUM (
    'DATABASE',
    'APPLICATION',
    'TOOL',
    'SYSTEM'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.catalog_app_definitions_apptype_enum AS ENUM (
    'standalone',
    'building-block',
    'composed'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.catalog_installs_status_enum AS ENUM (
    'PENDING',
    'INSTALLING',
    'RUNNING',
    'FAILED',
    'UNINSTALLING',
    'UNINSTALLED'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.cluster_authz_installs_status_enum AS ENUM (
    'PENDING',
    'INSTALLING',
    'RUNNING',
    'FAILED',
    'UNINSTALLED'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.cluster_dns_zones_certificateprovider_enum AS ENUM (
    'lets_encrypt',
    'lets_encrypt_staging'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.cluster_dns_zones_reconciliationstatus_enum AS ENUM (
    'PENDING',
    'IN_SYNC',
    'DRIFT',
    'RECONCILING',
    'ERROR'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.cluster_firewalls_reconciliationstatus_enum AS ENUM (
    'PENDING',
    'IN_SYNC',
    'DRIFT',
    'RECONCILING',
    'ERROR'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.crash_diagnoses_category_enum AS ENUM (
    'oom_killed',
    'crash_loop',
    'config_error',
    'image_pull_error',
    'probe_failure',
    'unschedulable',
    'unknown'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.crash_diagnoses_severity_enum AS ENUM (
    'critical',
    'warning',
    'info'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.dns_zones_dnsprovider_enum AS ENUM (
    'hetzner',
    'scaleway',
    'none'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.github_integration_config_auth_method_enum AS ENUM (
    'oauth_app',
    'pat',
    'github_app'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.infrastructure_cluster_nodes_nodetype_enum AS ENUM (
    'master',
    'worker'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.infrastructure_cluster_nodes_status_enum AS ENUM (
    'creating',
    'joining',
    'ready',
    'error',
    'deleting'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.infrastructure_clusters_clustertype_enum AS ENUM (
    'observability',
    'workload'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.infrastructure_clusters_endpointhostnamemode_enum AS ENUM (
    'ip',
    'domain'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.infrastructure_clusters_status_enum AS ENUM (
    'creating',
    'ready',
    'scaling',
    'stopped',
    'error',
    'deleting',
    'deletion_failed',
    'deleted'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.infrastructure_operations_currentstep_enum AS ENUM (
    'server_create_init',
    'server_create_provisioning',
    'server_create_waiting',
    'server_create_finalizing',
    'server_delete_init',
    'server_delete_executing',
    'server_delete_waiting',
    'server_delete_cleanup',
    'cluster_create_init',
    'cluster_create_master',
    'cluster_create_master_wait_k3s',
    'cluster_create_kubeconfig',
    'cluster_create_workers',
    'cluster_create_finalizing',
    'cluster_delete_init',
    'cluster_delete_nodes',
    'cluster_delete_waiting',
    'cluster_delete_cleanup',
    'cluster_stop_init',
    'cluster_stop_servers',
    'cluster_stop_update_status',
    'cluster_start_init',
    'cluster_start_servers',
    'cluster_start_wait_ready',
    'cluster_start_update_status',
    'cluster_attach_vnet_init',
    'cluster_attach_vnet_nodes',
    'cluster_attach_vnet_persist',
    'cluster_add_worker_validate',
    'cluster_add_worker_provision',
    'cluster_add_worker_join',
    'cluster_add_worker_finalize',
    'cluster_remove_worker_cordon',
    'cluster_remove_worker_drain',
    'cluster_remove_worker_delete',
    'cluster_remove_worker_finalize',
    'app_build_init',
    'app_build_create_job',
    'app_build_cloning',
    'app_build_analyzing',
    'app_build_building',
    'app_build_pushing',
    'app_build_finalize',
    'app_deploy_init',
    'app_deploy_build',
    'app_deploy_push_image',
    'app_deploy_generate_manifests',
    'app_deploy_apply_manifests',
    'app_deploy_wait_ready',
    'app_deploy_finalize',
    'app_delete_init',
    'app_delete_k8s_resources',
    'app_delete_finalize',
    'build_cache_clear_init',
    'build_cache_clear_deleting',
    'build_cache_clear_recreating',
    'catalog_install_init',
    'catalog_install_resolve_deps',
    'catalog_install_generate_secrets',
    'catalog_install_resolve_templates',
    'catalog_install_create_applications',
    'catalog_install_deploy_components',
    'catalog_install_create_endpoints',
    'catalog_install_finalize',
    'catalog_uninstall_init',
    'catalog_uninstall_delete_apps',
    'catalog_uninstall_finalize',
    'authz_install_init',
    'authz_ensure_namespace',
    'authz_deploy_service',
    'authz_deploy_workload',
    'authz_wait_ready',
    'authz_install_finalize',
    'authz_uninstall_init',
    'authz_uninstall_delete_workload',
    'authz_uninstall_finalize',
    'velero_install_render_manifests',
    'velero_install_apply_namespace',
    'velero_install_apply_crds',
    'velero_install_apply_rbac',
    'velero_install_apply_credentials_secret',
    'velero_install_apply_deployment',
    'velero_install_apply_bsl',
    'velero_install_apply_vsl',
    'velero_install_wait_ready',
    'velero_install_finalize',
    'backup_run_resolve_scope',
    'backup_run_create_velero_cr',
    'backup_run_watch_progress',
    'backup_run_record_artifact',
    'backup_run_enqueue_replication',
    'backup_run_finalize',
    'replicate_presign_source',
    'replicate_launch_rclone',
    'replicate_wait_completion',
    'replicate_verify_objects',
    'replicate_mark_available',
    'restore_select_source',
    'restore_ensure_bsl',
    'restore_create_velero_cr',
    'restore_watch_progress',
    'restore_postprocess',
    'dest_health_connect',
    'dest_health_list_bucket',
    'dest_health_write_probe',
    'dest_health_delete_probe',
    'dest_health_update_usage',
    'etcd_render_dropin',
    'etcd_ssh_apply',
    'etcd_reload_k3s',
    'etcd_verify_first_snapshot',
    'provider_snapshot_init',
    'provider_snapshot_create',
    'provider_snapshot_wait',
    'provider_snapshot_finalize',
    'predeploy_snapshot_init',
    'predeploy_snapshot_run',
    'predeploy_snapshot_finalize',
    'vm_backups_resolve_provider',
    'vm_backups_toggle_node',
    'vm_backups_finalize',
    'quick_setup_resolve_provisioners',
    'quick_setup_provision_primary',
    'quick_setup_provision_replica',
    'quick_setup_create_policy',
    'quick_setup_install_velero',
    'quick_setup_run_first_backup',
    'quick_setup_finalize'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.infrastructure_operations_operationtype_enum AS ENUM (
    'create_server',
    'delete_server',
    'update_server',
    'start_server',
    'stop_server',
    'restart_server',
    'create_cluster',
    'delete_cluster',
    'add_worker',
    'remove_worker',
    'start_cluster',
    'stop_cluster',
    'attach_cluster_to_vnet',
    'build_application',
    'clear_build_cache',
    'deploy_application',
    'update_application',
    'delete_application',
    'rollback_application',
    'install_catalog_app',
    'uninstall_catalog_app',
    'install_authz',
    'uninstall_authz',
    'create_backup_destination',
    'health_check_destination',
    'install_velero',
    'uninstall_velero',
    'run_backup_job',
    'replicate_backup',
    'run_restore_job',
    'restore_preview',
    'pre_deploy_snapshot',
    'enable_etcd_snapshots',
    'create_provider_snapshot',
    'restore_from_provider_snapshot',
    'backup_quick_setup',
    'enable_vm_backups',
    'disable_vm_backups'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.infrastructure_operations_provider_enum AS ENUM (
    'contabo',
    'hetzner',
    'scaleway'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.infrastructure_operations_status_enum AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.repositories_provider_enum AS ENUM (
    'github',
    'gitlab',
    'bitbucket'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.repository_credentials_credential_type_enum AS ENUM (
    'oauth_app',
    'pat',
    'github_app'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.repository_credentials_provider_enum AS ENUM (
    'github',
    'gitlab',
    'bitbucket'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.restore_jobs_status_enum AS ENUM (
    'pending',
    'previewing',
    'restoring',
    'completed',
    'failed',
    'cancelled'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.restore_jobs_strategy_enum AS ENUM (
    'velero_rebuild',
    'os_snapshot'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.restore_jobs_targetkind_enum AS ENUM (
    'cluster',
    'namespace',
    'application',
    'observability'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.san_certificates_certchallenge_enum AS ENUM (
    'http-01',
    'dns-01'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.san_certificates_certificateprovider_enum AS ENUM (
    'lets_encrypt',
    'lets_encrypt_staging'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.san_certificates_reconciliationstatus_enum AS ENUM (
    'PENDING',
    'IN_SYNC',
    'DRIFT',
    'RECONCILING',
    'ERROR'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.san_certificates_status_enum AS ENUM (
    'pending',
    'issuing',
    'valid',
    'expired',
    'failed'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.users_role_enum AS ENUM (
    'admin',
    'user',
    'readonly'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.vnet_subnets_type_enum AS ENUM (
    'cloud',
    'server',
    'vswitch'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.vnets_provider_enum AS ENUM (
    'contabo',
    'hetzner',
    'scaleway'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.vnets_status_enum AS ENUM (
    'PENDING',
    'ACTIVE',
    'FAILED',
    'DELETING',
    'DELETED'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.wildcard_certificates_certificateprovider_enum AS ENUM (
    'lets_encrypt',
    'lets_encrypt_staging'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.wildcard_certificates_reconciliationstatus_enum AS ENUM (
    'PENDING',
    'IN_SYNC',
    'DRIFT',
    'RECONCILING',
    'ERROR'
);
    `);
    await queryRunner.query(`
CREATE TYPE public.wildcard_certificates_status_enum AS ENUM (
    'pending',
    'issuing',
    'valid',
    'expired',
    'failed'
);
    `);
    await queryRunner.query(`
CREATE TABLE public.api_keys (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    key character varying NOT NULL,
    name character varying NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "expiresAt" timestamp with time zone,
    "userId" character varying
);
    `);
    await queryRunner.query(`
CREATE TABLE public.api_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    provider character varying NOT NULL,
    credential_type character varying DEFAULT 'api_key'::character varying NOT NULL,
    label character varying NOT NULL,
    notes character varying,
    encrypted_token character varying NOT NULL,
    encrypted_access_key character varying,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    purpose character varying(32) DEFAULT 'compute'::character varying NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.app_builds (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "applicationId" uuid,
    "targetClusterId" uuid,
    "gitUrl" character varying(500),
    "suggestedName" character varying(255),
    "buildClusterId" uuid NOT NULL,
    branch character varying(255) NOT NULL,
    "commitSha" character varying(255),
    "imageRef" character varying(500),
    "k8sJobName" character varying(255) NOT NULL,
    "k8sPodName" character varying(255),
    status public.app_builds_status_enum DEFAULT 'PENDING'::public.app_builds_status_enum NOT NULL,
    "railpackPlan" json,
    "detectedPort" integer,
    "detectedFramework" character varying(64),
    "detectedFrontendFramework" character varying(64),
    "detectedStartCommand" text,
    "deployStrategy" character varying(64),
    "deployabilityScore" numeric(4,3),
    "deployabilityFactors" json,
    "suggestedBuildCommand" text,
    "suggestedStartCommand" text,
    "recommendedStructure" text,
    logs text,
    "errorMessage" text,
    "operationId" character varying,
    "startedAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.app_endpoints (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "clusterId" uuid NOT NULL,
    "clusterDnsZoneId" uuid,
    "applicationId" uuid,
    "endpointType" public.app_endpoints_endpointtype_enum DEFAULT 'public'::public.app_endpoints_endpointtype_enum NOT NULL,
    "certChallenge" public.app_endpoints_certchallenge_enum DEFAULT 'http-01'::public.app_endpoints_certchallenge_enum NOT NULL,
    "hostnameMode" public.app_endpoints_hostnamemode_enum DEFAULT 'ip'::public.app_endpoints_hostnamemode_enum NOT NULL,
    fqdn character varying NOT NULL,
    "serviceName" character varying NOT NULL,
    "k8sServiceName" character varying NOT NULL,
    "k8sNamespace" character varying NOT NULL,
    "k8sServicePort" integer NOT NULL,
    "dnsRecordType" public.app_endpoints_dnsrecordtype_enum DEFAULT 'A'::public.app_endpoints_dnsrecordtype_enum NOT NULL,
    "dnsRecordValue" character varying,
    "dnsRecordId" character varying,
    "certificateProvider" public.app_endpoints_certificateprovider_enum,
    "certificateRequired" boolean DEFAULT true NOT NULL,
    "certificateStatus" public.app_endpoints_certificatestatus_enum,
    "certificateMessage" text,
    "certificateExpiresAt" timestamp with time zone,
    "wildcardCertificateId" uuid,
    "tlsSecretName" character varying,
    "sanCertificateId" uuid,
    "reconciliationStatus" public.app_endpoints_reconciliationstatus_enum DEFAULT 'PENDING'::public.app_endpoints_reconciliationstatus_enum NOT NULL,
    "lastReconciliationAt" timestamp with time zone,
    "lastSyncedAt" timestamp with time zone,
    "syncedDomain" character varying,
    "errorMessage" text,
    metadata jsonb,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.app_resources (
    id uuid NOT NULL,
    "applicationId" uuid NOT NULL,
    kind public.app_resources_kind_enum NOT NULL,
    name character varying(255) NOT NULL,
    namespace character varying(100) NOT NULL,
    "apiVersion" character varying(255) NOT NULL,
    status public.app_resources_status_enum DEFAULT 'pending'::public.app_resources_status_enum NOT NULL,
    "desiredHash" character varying(64),
    "actualHash" character varying(64),
    "desiredManifest" text,
    "reconciliationStatus" public.app_resources_reconciliationstatus_enum DEFAULT 'PENDING'::public.app_resources_reconciliationstatus_enum NOT NULL,
    "lastObservedAt" timestamp with time zone,
    "errorMessage" text,
    metadata json,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.app_revisions (
    id uuid NOT NULL,
    "applicationId" uuid NOT NULL,
    "eventType" public.app_revisions_eventtype_enum DEFAULT 'deploy'::public.app_revisions_eventtype_enum NOT NULL,
    actor json,
    "changeMetadata" json DEFAULT '{}'::json NOT NULL,
    "revisionNumber" integer,
    "imageRef" character varying(255),
    "commitSha" character varying(255),
    "chartVersion" character varying(255),
    "sourceConfigSnapshot" json DEFAULT '{}'::json NOT NULL,
    "envSnapshot" json DEFAULT '[]'::json NOT NULL,
    "resourcesSnapshot" json DEFAULT '{}'::json NOT NULL,
    replicas integer,
    status public.app_revisions_status_enum DEFAULT 'pending'::public.app_revisions_status_enum NOT NULL,
    "errorMessage" text,
    "deployedBy" character varying,
    "operationId" character varying,
    "buildId" uuid,
    "k8sResourceHashes" json DEFAULT '{}'::json NOT NULL,
    "rollbackReason" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.applications (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    category public.applications_category_enum NOT NULL,
    kind public.applications_kind_enum DEFAULT 'APPLICATION'::public.applications_kind_enum NOT NULL,
    "sourceType" public.applications_sourcetype_enum NOT NULL,
    "clusterId" uuid NOT NULL,
    "k8sNamespace" character varying(100) DEFAULT 'default'::character varying NOT NULL,
    status public.applications_status_enum DEFAULT 'pending'::public.applications_status_enum NOT NULL,
    "reconciliationStatus" public.applications_reconciliationstatus_enum DEFAULT 'PENDING'::public.applications_reconciliationstatus_enum NOT NULL,
    "lastReconciliationAt" timestamp with time zone,
    "reconciliationError" text,
    "sourceConfig" json DEFAULT '{}'::json NOT NULL,
    env json DEFAULT '[]'::json NOT NULL,
    resources json DEFAULT '{}'::json NOT NULL,
    scaling json DEFAULT '{}'::json NOT NULL,
    "healthProbe" json,
    volumes json DEFAULT '[]'::json NOT NULL,
    "workloadKind" character varying(20) DEFAULT 'Deployment'::character varying NOT NULL,
    replicas integer DEFAULT 1 NOT NULL,
    port integer,
    "currentRevisionId" uuid,
    "imageRef" character varying(255),
    "startCommand" text,
    "userId" character varying,
    "systemProtected" boolean DEFAULT false NOT NULL,
    "autoDeploy" boolean DEFAULT false NOT NULL,
    exposure public.applications_exposure_enum DEFAULT 'public'::public.applications_exposure_enum NOT NULL,
    labels json DEFAULT '{}'::json NOT NULL,
    metadata json DEFAULT '{}'::json NOT NULL,
    "preDeploySnapshotEnabled" boolean DEFAULT false NOT NULL,
    "preDeploySnapshotPolicy" character varying(32) DEFAULT 'best_effort'::character varying NOT NULL,
    "preDeployRetention" json DEFAULT '{"maxCopies":5,"days":7}'::json NOT NULL,
    "lastDeployedAt" timestamp with time zone,
    "buildPath" character varying(50),
    "workflowRunId" text,
    "workflowRunUrl" text,
    "buildStartedAt" timestamp with time zone,
    "lastBuildStatus" character varying(20),
    "lastBuildConclusion" character varying(20),
    "webhookToken" text,
    "frameworkConfirmed" character varying(100),
    "isFluiManaged" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone
);
    `);
    await queryRunner.query(`
CREATE TABLE public.backup_artifact_locations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "artifactId" uuid NOT NULL,
    "destinationId" uuid NOT NULL,
    role public.backup_artifact_locations_role_enum NOT NULL,
    state public.backup_artifact_locations_state_enum DEFAULT 'pending'::public.backup_artifact_locations_state_enum NOT NULL,
    "objectKeyPrefix" character varying(512) NOT NULL,
    "bytesStored" bigint,
    checksum character varying(128),
    "verifiedAt" timestamp with time zone,
    "lastError" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.backup_artifacts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "backupJobId" uuid NOT NULL,
    "clusterId" uuid NOT NULL,
    "veleroBackupName" character varying(253) NOT NULL,
    "sizeBytes" bigint,
    "itemCount" integer,
    "expiresAt" timestamp with time zone,
    "manifestSummary" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "encryptionMode" public.backup_artifacts_encryptionmode_enum DEFAULT 'flui_managed'::public.backup_artifacts_encryptionmode_enum NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.backup_destinations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    name character varying(120) NOT NULL,
    provider public.backup_destinations_provider_enum NOT NULL,
    endpoint character varying(255) NOT NULL,
    region character varying(64) NOT NULL,
    bucket character varying(255) NOT NULL,
    "pathPrefix" character varying(255),
    "accessKeyEncrypted" text NOT NULL,
    "secretKeyEncrypted" text NOT NULL,
    "encryptionMode" public.backup_destinations_encryptionmode_enum DEFAULT 'flui_managed'::public.backup_destinations_encryptionmode_enum NOT NULL,
    "encryptionPassphraseEncrypted" text,
    "useSse" boolean DEFAULT false NOT NULL,
    "forcePathStyle" boolean DEFAULT true NOT NULL,
    "usableForEtcdL1" boolean DEFAULT false NOT NULL,
    "healthStatus" public.backup_destinations_healthstatus_enum DEFAULT 'unknown'::public.backup_destinations_healthstatus_enum NOT NULL,
    "lastHealthCheckAt" timestamp with time zone,
    "lastHealthError" text,
    "usageBytes" bigint,
    "usageRefreshedAt" timestamp with time zone,
    "costPerGbMonthCents" integer,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.backup_jobs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "policyId" uuid,
    "clusterId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "triggerType" public.backup_jobs_triggertype_enum NOT NULL,
    "triggerContext" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "veleroBackupName" character varying(253),
    status public.backup_jobs_status_enum DEFAULT 'pending'::public.backup_jobs_status_enum NOT NULL,
    "scopeSnapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "startedAt" timestamp with time zone,
    "finishedAt" timestamp with time zone,
    "infrastructureOperationId" uuid,
    "errorMessage" text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.backup_policies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "clusterId" uuid NOT NULL,
    name character varying(120) NOT NULL,
    scope public.backup_policies_scope_enum NOT NULL,
    "scopeSelector" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "includePvcs" boolean DEFAULT true NOT NULL,
    "includeEtcdL1" boolean DEFAULT false NOT NULL,
    "cronSchedule" character varying(64),
    "retentionDays" integer DEFAULT 30 NOT NULL,
    "retentionMaxCopies" integer,
    enabled boolean DEFAULT true NOT NULL,
    status public.backup_policies_status_enum DEFAULT 'active'::public.backup_policies_status_enum NOT NULL,
    profile public.backup_policies_profile_enum DEFAULT 'single'::public.backup_policies_profile_enum NOT NULL,
    "lastRunAt" timestamp with time zone,
    "nextRunAt" timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.backup_policy_destinations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "policyId" uuid NOT NULL,
    "destinationId" uuid NOT NULL,
    role public.backup_policy_destinations_role_enum NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "retentionDaysOverride" integer,
    "retentionMaxCopiesOverride" integer,
    enabled boolean DEFAULT true NOT NULL,
    "lastReplicationAt" timestamp with time zone,
    "lastReplicationStatus" public.backup_policy_destinations_lastreplicationstatus_enum DEFAULT 'never_run'::public.backup_policy_destinations_lastreplicationstatus_enum NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.build_cache_snapshots (
    "clusterId" uuid NOT NULL,
    "totalSizeBytes" bigint,
    "layerSizeBytes" bigint,
    "packageCacheSizeBytes" bigint,
    "packageCaches" json,
    "scannedAt" timestamp with time zone,
    "scanDurationMs" integer,
    "scanInProgress" boolean DEFAULT false NOT NULL,
    "scanStartedAt" timestamp with time zone,
    "lastScanStatus" character varying DEFAULT 'pending'::character varying NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.ca_keypairs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    "publicKey" text NOT NULL,
    "encryptedPrivateKey" text,
    fingerprint character varying NOT NULL,
    type character varying DEFAULT 'ed25519'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp without time zone,
    metadata jsonb,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.catalog_app_definitions (
    id uuid NOT NULL,
    slug character varying(100) NOT NULL,
    version character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    "appKind" public.catalog_app_definitions_appkind_enum DEFAULT 'APPLICATION'::public.catalog_app_definitions_appkind_enum NOT NULL,
    "appType" public.catalog_app_definitions_apptype_enum NOT NULL,
    tags text DEFAULT ''::text NOT NULL,
    license character varying(100),
    "iconUrl" text,
    links json,
    ratings json,
    "alternativeTo" text DEFAULT ''::text NOT NULL,
    "maintainedAt" character varying(10),
    "entrypointPath" character varying(255),
    "clientFor" text[] DEFAULT '{}'::text[] NOT NULL,
    "clientDefaultFor" text[] DEFAULT '{}'::text[] NOT NULL,
    "rawYaml" text NOT NULL,
    manifest json NOT NULL,
    checksum character varying(64) NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.catalog_installs (
    id uuid NOT NULL,
    "catalogAppDefinitionId" uuid NOT NULL,
    "clusterId" uuid NOT NULL,
    "userId" character varying,
    "userEmail" character varying,
    status public.catalog_installs_status_enum DEFAULT 'PENDING'::public.catalog_installs_status_enum NOT NULL,
    "operationId" uuid,
    "applicationIds" json DEFAULT '[]'::json NOT NULL,
    "userInputs" json DEFAULT '{}'::json NOT NULL,
    "dependencyChoices" json DEFAULT '[]'::json NOT NULL,
    "dependencyInstallIds" json DEFAULT '[]'::json NOT NULL,
    "envOverrides" json DEFAULT '{}'::json NOT NULL,
    "resourceOverrides" json,
    "displayName" character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    "requestedDomain" character varying(255),
    "resolvedFqdn" character varying(255),
    "skipEndpoint" boolean DEFAULT false NOT NULL,
    "requestedExposure" character varying(20),
    "errorMessage" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone
);
    `);
    await queryRunner.query(`
CREATE TABLE public.cluster_authz_installs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "clusterId" character varying NOT NULL,
    "clusterName" character varying NOT NULL,
    status public.cluster_authz_installs_status_enum NOT NULL,
    "operationId" character varying,
    "errorMessage" text,
    "userId" character varying,
    "installedAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.cluster_dns_zones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "clusterId" uuid NOT NULL,
    "dnsZoneId" uuid NOT NULL,
    "certificateProvider" public.cluster_dns_zones_certificateprovider_enum,
    "acmeEmail" character varying,
    "wildcardCertificate" boolean DEFAULT true NOT NULL,
    "reconciliationStatus" public.cluster_dns_zones_reconciliationstatus_enum DEFAULT 'PENDING'::public.cluster_dns_zones_reconciliationstatus_enum NOT NULL,
    "lastReconciliationAt" timestamp with time zone,
    "errorMessage" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.cluster_firewalls (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "clusterId" uuid NOT NULL,
    "providerFirewallId" character varying,
    "desiredRules" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "lastAppliedRules" jsonb,
    "desiredHash" character varying(64),
    "lastAppliedHash" character varying(64),
    "reconciliationStatus" public.cluster_firewalls_reconciliationstatus_enum DEFAULT 'PENDING'::public.cluster_firewalls_reconciliationstatus_enum NOT NULL,
    "lastReconciliationAt" timestamp with time zone,
    "errorMessage" text,
    metadata jsonb,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.crash_diagnoses (
    id uuid NOT NULL,
    "applicationId" uuid NOT NULL,
    "podName" character varying(255) NOT NULL,
    "containerName" character varying(255),
    category public.crash_diagnoses_category_enum NOT NULL,
    severity public.crash_diagnoses_severity_enum NOT NULL,
    title character varying(255) NOT NULL,
    explanation text NOT NULL,
    evidence json DEFAULT '{}'::json NOT NULL,
    "patternMatchedKey" character varying(100),
    "suggestedAction" json NOT NULL,
    "podSnapshot" json,
    "resolvedAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.dns_zones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "providerZoneId" character varying NOT NULL,
    "zoneName" character varying NOT NULL,
    "dnsProvider" public.dns_zones_dnsprovider_enum NOT NULL,
    description character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.framework_build_scores (
    framework character varying(100) NOT NULL,
    "githubActionsScore" integer NOT NULL,
    "railpackScore" integer NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedBy" character varying(50) DEFAULT 'system'::character varying NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.github_app_installations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    installation_id bigint NOT NULL,
    account_login character varying NOT NULL,
    account_type character varying NOT NULL,
    user_id character varying NOT NULL,
    repository_selection character varying DEFAULT 'all'::character varying NOT NULL,
    suspended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.github_integration_config (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    auth_method public.github_integration_config_auth_method_enum NOT NULL,
    client_id_encrypted text,
    client_secret_encrypted text,
    callback_url character varying,
    app_id character varying,
    private_key_encrypted text,
    app_webhook_secret_encrypted text,
    app_slug character varying,
    is_configured boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.github_user_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    flui_user_id uuid NOT NULL,
    github_user_id bigint NOT NULL,
    github_login character varying NOT NULL,
    installation_id bigint,
    access_token_encrypted text NOT NULL,
    refresh_token_encrypted text,
    expires_at timestamp with time zone,
    refresh_token_expires_at timestamp with time zone,
    scopes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.images (
    id uuid NOT NULL,
    "appId" uuid NOT NULL,
    "imageRef" character varying(500) NOT NULL,
    "commitSha" character varying(40) NOT NULL,
    branch character varying(255) NOT NULL,
    "githubPackageId" text,
    "sizeBytes" bigint,
    "fluiTags" json DEFAULT '[]'::json NOT NULL,
    "isCurrentlyDeployed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.infrastructure_cluster_nodes (
    id uuid NOT NULL,
    "clusterId" uuid NOT NULL,
    "serverName" character varying NOT NULL,
    "providerResourceId" character varying NOT NULL,
    "nodeType" public.infrastructure_cluster_nodes_nodetype_enum NOT NULL,
    "ipAddress" character varying,
    "privateIp" character varying,
    "subnetId" uuid,
    status public.infrastructure_cluster_nodes_status_enum DEFAULT 'creating'::public.infrastructure_cluster_nodes_status_enum NOT NULL,
    metadata json DEFAULT '{}'::json NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.infrastructure_clusters (
    id uuid NOT NULL,
    name character varying NOT NULL,
    provider character varying NOT NULL,
    region character varying NOT NULL,
    "nodeSize" character varying NOT NULL,
    "nodeCount" integer DEFAULT 0 NOT NULL,
    "autoscalingEnabled" boolean DEFAULT false NOT NULL,
    "minNodes" integer,
    "maxNodes" integer,
    "scaleUpMemoryPct" integer,
    "scaleUpCpuPct" integer,
    "cooldownSeconds" integer,
    "k3sTokenEncrypted" text NOT NULL,
    "k3sVersion" character varying,
    "masterNodeId" character varying,
    "masterIpAddress" character varying,
    "masterPrivateIp" character varying,
    "kubeconfigEncrypted" text,
    status public.infrastructure_clusters_status_enum DEFAULT 'creating'::public.infrastructure_clusters_status_enum NOT NULL,
    "clusterType" public.infrastructure_clusters_clustertype_enum DEFAULT 'workload'::public.infrastructure_clusters_clustertype_enum NOT NULL,
    "endpointHostnameMode" public.infrastructure_clusters_endpointhostnamemode_enum DEFAULT 'ip'::public.infrastructure_clusters_endpointhostnamemode_enum NOT NULL,
    "nipHostnameToken" character varying(30),
    metadata json DEFAULT '{}'::json NOT NULL,
    "sshKeyIds" json,
    image character varying,
    "diskSizeGb" integer,
    "bootstrapKeyId" character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone
);
    `);
    await queryRunner.query(`
CREATE TABLE public.infrastructure_firewalls (
    id character varying NOT NULL,
    name character varying NOT NULL,
    provider character varying NOT NULL,
    "clusterId" uuid,
    rules json NOT NULL,
    "sourceCidrs" json DEFAULT '[]'::json NOT NULL,
    "appliedToServerIds" json DEFAULT '[]'::json NOT NULL,
    labels json DEFAULT '{}'::json NOT NULL,
    metadata json DEFAULT '{}'::json NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp with time zone
);
    `);
    await queryRunner.query(`
CREATE TABLE public.infrastructure_operations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "operationType" public.infrastructure_operations_operationtype_enum,
    status public.infrastructure_operations_status_enum DEFAULT 'PENDING'::public.infrastructure_operations_status_enum NOT NULL,
    "resourceType" character varying,
    "resourceName" character varying,
    "resourceId" character varying,
    provider public.infrastructure_operations_provider_enum,
    "userId" character varying,
    metadata json DEFAULT '{}'::json NOT NULL,
    "errorMessage" character varying,
    progress integer DEFAULT 0 NOT NULL,
    "currentStep" public.infrastructure_operations_currentstep_enum,
    "currentStepIndex" integer DEFAULT 0 NOT NULL,
    "totalSteps" integer DEFAULT 0 NOT NULL,
    "currentStepProgress" integer DEFAULT 0 NOT NULL,
    "estimatedDurationInSeconds" integer,
    "startedAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.infrastructure_servers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    provider character varying NOT NULL,
    "providerResourceId" character varying,
    size character varying NOT NULL,
    region character varying NOT NULL,
    status character varying NOT NULL,
    "ipAddress" character varying,
    "privateIp" character varying,
    "subnetId" uuid,
    "pulumiProject" character varying NOT NULL,
    "pulumiStack" character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.provider_configurations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" character varying NOT NULL,
    provider character varying NOT NULL,
    status character varying DEFAULT 'not_configured'::character varying NOT NULL,
    "enabledRegions" json DEFAULT '[]'::json NOT NULL,
    configuration json,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "lastHealthCheck" timestamp without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata json
);
    `);
    await queryRunner.query(`
CREATE TABLE public.provider_credentials (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    client_id character varying NOT NULL,
    client_secret character varying NOT NULL,
    username character varying NOT NULL,
    password character varying NOT NULL,
    provider character varying NOT NULL,
    refresh_token character varying,
    access_token character varying,
    token_expires_at timestamp without time zone,
    refresh_token_expires_at timestamp without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    purpose character varying(32) DEFAULT 'compute'::character varying NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    token character varying NOT NULL,
    "userId" character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.repositories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying NOT NULL,
    provider public.repositories_provider_enum NOT NULL,
    repository_url character varying NOT NULL,
    repository_name character varying NOT NULL,
    repository_full_name character varying NOT NULL,
    owner character varying NOT NULL,
    default_branch character varying DEFAULT 'main'::character varying NOT NULL,
    is_private boolean DEFAULT false NOT NULL,
    clone_url character varying NOT NULL,
    ssh_url character varying,
    html_url character varying NOT NULL,
    description text,
    language character varying,
    access_token_encrypted text NOT NULL,
    webhook_secret character varying,
    webhook_url character varying,
    webhook_id character varying,
    webhook_active boolean DEFAULT false NOT NULL,
    auto_deploy_enabled boolean DEFAULT false NOT NULL,
    detected_framework character varying,
    detected_frontend_framework character varying,
    detected_port integer,
    last_sync_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.repository_credentials (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying NOT NULL,
    provider public.repository_credentials_provider_enum NOT NULL,
    access_token_encrypted text NOT NULL,
    refresh_token_encrypted text,
    scope character varying,
    token_type character varying DEFAULT 'Bearer'::character varying NOT NULL,
    expires_at timestamp with time zone,
    revoked_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    credential_type public.repository_credentials_credential_type_enum DEFAULT 'oauth_app'::public.repository_credentials_credential_type_enum NOT NULL,
    github_user_id character varying,
    github_username character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.restore_jobs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "artifactId" uuid NOT NULL,
    "sourceDestinationId" uuid NOT NULL,
    "targetClusterId" uuid NOT NULL,
    "targetKind" public.restore_jobs_targetkind_enum NOT NULL,
    "targetSelector" jsonb DEFAULT '{}'::jsonb NOT NULL,
    strategy public.restore_jobs_strategy_enum,
    "veleroRestoreName" character varying(253),
    status public.restore_jobs_status_enum DEFAULT 'pending'::public.restore_jobs_status_enum NOT NULL,
    "previewResult" jsonb,
    "infrastructureOperationId" uuid,
    "errorMessage" text,
    "startedAt" timestamp with time zone,
    "finishedAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.san_certificates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "clusterId" uuid NOT NULL,
    "clusterDnsZoneId" uuid,
    name character varying NOT NULL,
    "dnsNames" text NOT NULL,
    "certChallenge" public.san_certificates_certchallenge_enum DEFAULT 'http-01'::public.san_certificates_certchallenge_enum NOT NULL,
    "certificateProvider" public.san_certificates_certificateprovider_enum DEFAULT 'lets_encrypt'::public.san_certificates_certificateprovider_enum NOT NULL,
    "masterNamespace" character varying DEFAULT 'flui-system'::character varying NOT NULL,
    "masterCertName" character varying NOT NULL,
    "masterSecretName" character varying NOT NULL,
    "issuerName" character varying NOT NULL,
    status public.san_certificates_status_enum DEFAULT 'pending'::public.san_certificates_status_enum NOT NULL,
    "reconciliationStatus" public.san_certificates_reconciliationstatus_enum DEFAULT 'PENDING'::public.san_certificates_reconciliationstatus_enum NOT NULL,
    "notAfter" timestamp with time zone,
    "renewalTime" timestamp with time zone,
    "lastReconciliationAt" timestamp with time zone,
    "errorMessage" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.ssh_keys (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    "publicKey" character varying NOT NULL,
    fingerprint character varying NOT NULL,
    "keyPath" character varying NOT NULL,
    type character varying DEFAULT 'ed25519'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "autoGenerated" boolean DEFAULT false NOT NULL,
    "lastUsed" timestamp without time zone,
    tags jsonb DEFAULT '{}'::jsonb,
    "providerKeyMappings" jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
COMMENT ON COLUMN public.ssh_keys.tags IS 'Key-value pairs for tagging. Values can be strings or arrays (e.g., cluster-id: ["cluster1", "cluster2"], cluster-node-id: "node1")';
    `);
    await queryRunner.query(`
COMMENT ON COLUMN public.ssh_keys."providerKeyMappings" IS 'Mapping of cloud provider to provider-specific SSH key IDs (e.g., { "HETZNER": "12345", "CONTABO": "abc-def" })';
    `);
    await queryRunner.query(`
CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    "passwordHash" character varying,
    name character varying,
    "isAdmin" boolean DEFAULT false NOT NULL,
    role public.users_role_enum DEFAULT 'user'::public.users_role_enum NOT NULL,
    "oidcSub" character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.vnet_routes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "vnetId" uuid NOT NULL,
    destination character varying(50) NOT NULL,
    gateway character varying(50) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.vnet_subnets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "vnetId" uuid NOT NULL,
    "providerSubnetId" character varying(255),
    "ipRange" character varying(50) NOT NULL,
    type public.vnet_subnets_type_enum NOT NULL,
    "networkZone" character varying(50) NOT NULL,
    gateway character varying(50),
    "vswitchId" character varying(255),
    "attachedServerIds" json DEFAULT '[]'::json NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.vnets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "providerResourceId" character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    provider public.vnets_provider_enum NOT NULL,
    "ipRange" character varying(50) NOT NULL,
    labels jsonb DEFAULT '[]'::jsonb NOT NULL,
    metadata jsonb,
    status public.vnets_status_enum DEFAULT 'PENDING'::public.vnets_status_enum NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
CREATE TABLE public.wildcard_certificates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "clusterId" uuid NOT NULL,
    "dnsZoneId" uuid NOT NULL,
    scope character varying NOT NULL,
    "masterNamespace" character varying NOT NULL,
    "masterSecretName" character varying NOT NULL,
    "masterCertName" character varying NOT NULL,
    "issuerName" character varying NOT NULL,
    "certificateProvider" public.wildcard_certificates_certificateprovider_enum NOT NULL,
    status public.wildcard_certificates_status_enum DEFAULT 'pending'::public.wildcard_certificates_status_enum NOT NULL,
    "reconciliationStatus" public.wildcard_certificates_reconciliationstatus_enum DEFAULT 'PENDING'::public.wildcard_certificates_reconciliationstatus_enum NOT NULL,
    "notAfter" timestamp with time zone,
    "renewalTime" timestamp with time zone,
    "lastReconciliationAt" timestamp with time zone,
    "errorMessage" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.repository_credentials
    ADD CONSTRAINT "PK_0146eccc462198952a3f9d1a63c" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.infrastructure_cluster_nodes
    ADD CONSTRAINT "PK_0db78c5b9cb899246e630c61a07" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.cluster_dns_zones
    ADD CONSTRAINT "PK_1ac65bf9d5f6e3b0f132c2b049f" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_endpoints
    ADD CONSTRAINT "PK_1b01520f5eb49f9bd76cba4b655" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.images
    ADD CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.github_app_installations
    ADD CONSTRAINT "PK_25a63d76935ddf621bfb6277954" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_policies
    ADD CONSTRAINT "PK_260ee37c86657e1679e3cb73333" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.catalog_installs
    ADD CONSTRAINT "PK_2f36c48f59d3277ff8922b739eb" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.infrastructure_clusters
    ADD CONSTRAINT "PK_2f9bd2f6549d91bbc995d6c70b1" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.vnets
    ADD CONSTRAINT "PK_307a56e2e425005dd055ccbc60d" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.provider_credentials
    ADD CONSTRAINT "PK_31f2884572a5fef8e25a08b5a59" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.github_user_tokens
    ADD CONSTRAINT "PK_360a4c10e5ad06f3447b02efc2b" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.ca_keypairs
    ADD CONSTRAINT "PK_3b2987c23daa1fd6dc9970b4d17" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.cluster_firewalls
    ADD CONSTRAINT "PK_40577d3b2d8b7a554710fcd8e77" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_builds
    ADD CONSTRAINT "PK_48ec439ffc3ff816c825351b6ce" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.infrastructure_servers
    ADD CONSTRAINT "PK_6814a683bdfabe284b83db73037" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.provider_configurations
    ADD CONSTRAINT "PK_6f9a0c4efa2aaa5d32a98ee5e7c" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.ssh_keys
    ADD CONSTRAINT "PK_8d68194272e979ab2d77700b1a4" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_resources
    ADD CONSTRAINT "PK_8eb5461de31a34438259d0e85f9" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.dns_zones
    ADD CONSTRAINT "PK_a98966f1f535829b8ce331e1499" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_artifact_locations
    ADD CONSTRAINT "PK_accdfe7b20c01508715140cd5d8" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.infrastructure_firewalls
    ADD CONSTRAINT "PK_b3671e356a7577c45906370ebaa" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.build_cache_snapshots
    ADD CONSTRAINT "PK_b4964f671ee229dda683c9f9277" PRIMARY KEY ("clusterId");
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_revisions
    ADD CONSTRAINT "PK_b720183fcdd78742cf59f5dac9f" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.crash_diagnoses
    ADD CONSTRAINT "PK_b7acc2c8f8597619f321e444646" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.cluster_authz_installs
    ADD CONSTRAINT "PK_c15ad2696c8092253d215724f34" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.restore_jobs
    ADD CONSTRAINT "PK_c315e48b7f0d319fc3ca3c8336c" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_artifacts
    ADD CONSTRAINT "PK_c3b3350ea83db7acd968a828991" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.api_tokens
    ADD CONSTRAINT "PK_c587455266b5fa8dace7194caac" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.wildcard_certificates
    ADD CONSTRAINT "PK_c8fe3df16763e1a878bb45f9214" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.catalog_app_definitions
    ADD CONSTRAINT "PK_d3171e258cf83892ef7f13fa4d4" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_jobs
    ADD CONSTRAINT "PK_d63aa10bc561df545b6532201c6" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.infrastructure_operations
    ADD CONSTRAINT "PK_d812bd812a5547e0437505fd956" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.san_certificates
    ADD CONSTRAINT "PK_e09d86ab17a9d19dba3483599c2" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.vnet_subnets
    ADD CONSTRAINT "PK_ea26604967009ca2e454d5e6c65" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.repositories
    ADD CONSTRAINT "PK_ef0c358c04b4f4d29b8ca68ddff" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_policy_destinations
    ADD CONSTRAINT "PK_f017257328141b0b1330ffc0486" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_destinations
    ADD CONSTRAINT "PK_f22075ec504da919aa86e7bfe2a" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.framework_build_scores
    ADD CONSTRAINT "PK_f46b66e5234a4941407f061d336" PRIMARY KEY (framework);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.vnet_routes
    ADD CONSTRAINT "PK_fc202ff7fddff13a96e34f6eeac" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.github_integration_config
    ADD CONSTRAINT "PK_ff0d68de3b5c5c1e042dfcaff22" PRIMARY KEY (id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.catalog_app_definitions
    ADD CONSTRAINT "UQ_2d1fdde6d0857f5f29b1494d0c8" UNIQUE (slug, version);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE (token);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "UQ_7482543b92c5b8b51b988f890e5" UNIQUE (slug);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.cluster_dns_zones
    ADD CONSTRAINT "UQ_7e19228a4d5966348c4bdb9a3e9" UNIQUE ("clusterId");
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.cluster_firewalls
    ADD CONSTRAINT "UQ_a58bd5b8004c1581e4bb4f1ad40" UNIQUE ("clusterId");
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.ca_keypairs
    ADD CONSTRAINT "UQ_cbe16d2a920a5cf22fa5b37ed77" UNIQUE (name);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.github_app_installations
    ADD CONSTRAINT "UQ_d5ddfd56b8261364169e855c759" UNIQUE (installation_id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.catalog_installs
    ADD CONSTRAINT "UQ_e0575cea71c173fa5bbe8193b3e" UNIQUE (slug);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT "UQ_e42cf55faeafdcce01a82d24849" UNIQUE (key);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_artifact_locations
    ADD CONSTRAINT uq_artifact_locations_artifact_dest UNIQUE ("artifactId", "destinationId");
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_destinations
    ADD CONSTRAINT uq_backup_destinations_user_name UNIQUE ("userId", name);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_policy_destinations
    ADD CONSTRAINT uq_backup_policy_destinations_policy_dest UNIQUE ("policyId", "destinationId");
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_01d0a80f46bb43811628f4174f" ON public.repositories USING btree (user_id);
    `);
    await queryRunner.query(`
CREATE UNIQUE INDEX "IDX_0856bc06fb2697da6f32a2c644" ON public.github_user_tokens USING btree (flui_user_id);
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_124d96645d8cc6eee349f84b8a" ON public.repository_credentials USING btree (user_id);
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_130cf14a5dd75fb36f6c474672" ON public.github_app_installations USING btree (user_id);
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_165e4da6c3e084e87f1ab7ef19" ON public.app_builds USING btree ("commitSha");
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_2db23377a7112433ef1498c90d" ON public.repositories USING btree (repository_full_name);
    `);
    await queryRunner.query(`
CREATE UNIQUE INDEX "IDX_351642a9fa287899b7496d6449" ON public.app_endpoints USING btree (fqdn);
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_5ca0747e4b7e6ccf2829ef70ed" ON public.repository_credentials USING btree (provider);
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_657ea8cf580bc406e4e2bab3c4" ON public.catalog_installs USING btree ("clusterId");
    `);
    await queryRunner.query(`
CREATE UNIQUE INDEX "IDX_92098ec5e221ee0a8f54ee0b8e" ON public.san_certificates USING btree ("clusterId", name);
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_ae2febc3710ebe6ed4445ab311" ON public.repository_credentials USING btree (is_active);
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_be8d91921da00e04c16cefa303" ON public.crash_diagnoses USING btree ("applicationId", "createdAt");
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_c6a99aa3cf8c8c4e4e4e9961c2" ON public.github_app_installations USING btree (account_login);
    `);
    await queryRunner.query(`
CREATE INDEX "IDX_c945916df1bf9f362260771d68" ON public.app_builds USING btree ("applicationId");
    `);
    await queryRunner.query(`
CREATE UNIQUE INDEX "IDX_ee2639ac0ac60b222741efe0ee" ON public.users USING btree ("oidcSub") WHERE ("oidcSub" IS NOT NULL);
    `);
    await queryRunner.query(`
CREATE UNIQUE INDEX "IDX_fe666e45ab90f28106934ab06f" ON public.wildcard_certificates USING btree ("clusterId", scope);
    `);
    await queryRunner.query(`
CREATE INDEX idx_artifact_locations_dest_state ON public.backup_artifact_locations USING btree ("destinationId", state);
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_artifacts_expires ON public.backup_artifacts USING btree ("expiresAt");
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_artifacts_velero_name ON public.backup_artifacts USING btree ("veleroBackupName");
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_destinations_health ON public.backup_destinations USING btree ("healthStatus");
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_destinations_user ON public.backup_destinations USING btree ("userId");
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_jobs_cluster_status ON public.backup_jobs USING btree ("clusterId", status);
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_jobs_policy_created ON public.backup_jobs USING btree ("policyId", "createdAt");
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_jobs_trigger_status ON public.backup_jobs USING btree ("triggerType", status);
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_policies_cluster ON public.backup_policies USING btree ("clusterId");
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_policies_enabled_next ON public.backup_policies USING btree (enabled, "nextRunAt");
    `);
    await queryRunner.query(`
CREATE INDEX idx_backup_policies_user ON public.backup_policies USING btree ("userId");
    `);
    await queryRunner.query(`
CREATE INDEX idx_bpd_destination ON public.backup_policy_destinations USING btree ("destinationId");
    `);
    await queryRunner.query(`
CREATE INDEX idx_bpd_policy ON public.backup_policy_destinations USING btree ("policyId");
    `);
    await queryRunner.query(`
CREATE INDEX idx_restore_jobs_artifact ON public.restore_jobs USING btree ("artifactId");
    `);
    await queryRunner.query(`
CREATE INDEX idx_restore_jobs_status ON public.restore_jobs USING btree (status);
    `);
    await queryRunner.query(`
CREATE INDEX idx_restore_jobs_user ON public.restore_jobs USING btree ("userId");
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_resources
    ADD CONSTRAINT "FK_0d55826fcd76ff434148ec86dfd" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.infrastructure_firewalls
    ADD CONSTRAINT "FK_0e61757b30b775a1e1b2fc7b1f6" FOREIGN KEY ("clusterId") REFERENCES public.infrastructure_clusters(id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.wildcard_certificates
    ADD CONSTRAINT "FK_1c2948da890c647cb29ac06e9b8" FOREIGN KEY ("dnsZoneId") REFERENCES public.dns_zones(id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_revisions
    ADD CONSTRAINT "FK_2dbf332e88b4399b5ef29b91c17" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "FK_30166ad87f87f4d9d8c294cd4ec" FOREIGN KEY ("clusterId") REFERENCES public.infrastructure_clusters(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_policy_destinations
    ADD CONSTRAINT "FK_32cbfb6a7387f358be06fbb90da" FOREIGN KEY ("policyId") REFERENCES public.backup_policies(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.crash_diagnoses
    ADD CONSTRAINT "FK_4109b972d7273524425ca45c061" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.cluster_dns_zones
    ADD CONSTRAINT "FK_44de952fee811e4d164266061fe" FOREIGN KEY ("dnsZoneId") REFERENCES public.dns_zones(id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_endpoints
    ADD CONSTRAINT "FK_5159febd68817cc9cea6eadc1d4" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON DELETE SET NULL;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_endpoints
    ADD CONSTRAINT "FK_5a83de5b9813a89a382b08cc551" FOREIGN KEY ("clusterId") REFERENCES public.infrastructure_clusters(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.images
    ADD CONSTRAINT "FK_61a3fabbaaa991a9b03c5190aa6" FOREIGN KEY ("appId") REFERENCES public.applications(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_policies
    ADD CONSTRAINT "FK_6a683b4928e2d435d363f311f9c" FOREIGN KEY ("clusterId") REFERENCES public.infrastructure_clusters(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.san_certificates
    ADD CONSTRAINT "FK_7249b30639825a4b99ba4a8aaf1" FOREIGN KEY ("clusterDnsZoneId") REFERENCES public.cluster_dns_zones(id) ON DELETE SET NULL;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.cluster_dns_zones
    ADD CONSTRAINT "FK_7e19228a4d5966348c4bdb9a3e9" FOREIGN KEY ("clusterId") REFERENCES public.infrastructure_clusters(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_endpoints
    ADD CONSTRAINT "FK_7fc7d2398ba0615dde2b1959974" FOREIGN KEY ("clusterDnsZoneId") REFERENCES public.cluster_dns_zones(id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.vnet_subnets
    ADD CONSTRAINT "FK_83c4e0fcaaacfdb76912383090e" FOREIGN KEY ("vnetId") REFERENCES public.vnets(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_artifact_locations
    ADD CONSTRAINT "FK_9ae791ad67540bd846454352e80" FOREIGN KEY ("destinationId") REFERENCES public.backup_destinations(id);
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.infrastructure_cluster_nodes
    ADD CONSTRAINT "FK_a10727f48fc7bf29439fdd321cf" FOREIGN KEY ("clusterId") REFERENCES public.infrastructure_clusters(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_policy_destinations
    ADD CONSTRAINT "FK_a4490891325cf09bf9183a3ff66" FOREIGN KEY ("destinationId") REFERENCES public.backup_destinations(id) ON DELETE RESTRICT;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.cluster_firewalls
    ADD CONSTRAINT "FK_a58bd5b8004c1581e4bb4f1ad40" FOREIGN KEY ("clusterId") REFERENCES public.infrastructure_clusters(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.san_certificates
    ADD CONSTRAINT "FK_a60f5a1bee69f06e99cda558d49" FOREIGN KEY ("clusterId") REFERENCES public.infrastructure_clusters(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.wildcard_certificates
    ADD CONSTRAINT "FK_b127f95e785f163f5e6a60df6ce" FOREIGN KEY ("clusterId") REFERENCES public.infrastructure_clusters(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_endpoints
    ADD CONSTRAINT "FK_bcad4435eb990b8bd5ddb28f66f" FOREIGN KEY ("sanCertificateId") REFERENCES public.san_certificates(id) ON DELETE SET NULL;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.backup_artifact_locations
    ADD CONSTRAINT "FK_c891004cc0291bce2a60ce57d3b" FOREIGN KEY ("artifactId") REFERENCES public.backup_artifacts(id) ON DELETE CASCADE;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.app_endpoints
    ADD CONSTRAINT "FK_e20cf06226ac20c11acdf63730e" FOREIGN KEY ("wildcardCertificateId") REFERENCES public.wildcard_certificates(id) ON DELETE SET NULL;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.catalog_installs
    ADD CONSTRAINT "FK_e21651c0e92f4e7e85f1af06f6c" FOREIGN KEY ("catalogAppDefinitionId") REFERENCES public.catalog_app_definitions(id) ON DELETE RESTRICT;
    `);
    await queryRunner.query(`
ALTER TABLE ONLY public.vnet_routes
    ADD CONSTRAINT "FK_f3b8ba1260522d986f4b2cc37a0" FOREIGN KEY ("vnetId") REFERENCES public.vnets(id) ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'wildcard_certificates',
      'vnets',
      'vnet_subnets',
      'vnet_routes',
      'users',
      'ssh_keys',
      'san_certificates',
      'restore_jobs',
      'repository_credentials',
      'repositories',
      'refresh_tokens',
      'provider_credentials',
      'provider_configurations',
      'infrastructure_servers',
      'infrastructure_operations',
      'infrastructure_firewalls',
      'infrastructure_clusters',
      'infrastructure_cluster_nodes',
      'images',
      'github_user_tokens',
      'github_integration_config',
      'github_app_installations',
      'framework_build_scores',
      'dns_zones',
      'crash_diagnoses',
      'cluster_firewalls',
      'cluster_dns_zones',
      'cluster_authz_installs',
      'catalog_installs',
      'catalog_app_definitions',
      'ca_keypairs',
      'build_cache_snapshots',
      'backup_policy_destinations',
      'backup_policies',
      'backup_jobs',
      'backup_destinations',
      'backup_artifacts',
      'backup_artifact_locations',
      'applications',
      'app_revisions',
      'app_resources',
      'app_endpoints',
      'app_builds',
      'api_tokens',
      'api_keys',
    ];
    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS public."${table}" CASCADE`);
    }
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
