import { StorageBackendProvider } from '../enums/storage-backend-provider.enum';

export enum ProvisionerCapability {
  FULL_AUTO = 'full_auto', // Bucket + credenziali create automaticamente via API
  SEMI_AUTO = 'semi_auto', // Bucket auto, ma credenziali devono essere fornite una tantum
  NONE = 'none', // Nessun provisioning automatico (Generic / MinIO)
}

export interface ProvisionerReadiness {
  ready: boolean;
  reason?: string; // codice macchina-leggibile, es. 'CONNECT_HETZNER_OBJECT_STORAGE_REQUIRED'
  message?: string; // human-readable
}

export interface ProvisionInput {
  userId: string;
  /** Cluster di riferimento — usato per naming bucket e region defaulting */
  clusterId: string;
  /** Suggested bucket name (opzionale; il provisioner può sovrascrivere) */
  desiredBucketName?: string;
  /** Region preferita (opzionale; il provisioner può sceglierla in base al cluster) */
  desiredRegion?: string;
  /** Display name per la BackupDestinationEntity creata */
  destinationName?: string;
}

/**
 * Risultato del provisioning. Le credenziali sono in-memory plaintext —
 * il caller (QuickSetupService) le ricifra via EncryptionService quando salva
 * la BackupDestinationEntity. NON loggare ProvisionResult.accessKey/secretKey.
 */
export interface ProvisionResult {
  bucket: string;
  region: string;
  endpoint: string;
  forcePathStyle: boolean;
  pathPrefix?: string;
  accessKey: string;
  secretKey: string;
  costPerGbMonthCents?: number;
  usableForEtcdL1: boolean;
  alreadyExisted: boolean;
}

export interface IObjectStorageProvisioner {
  readonly provider: StorageBackendProvider;
  readonly capability: ProvisionerCapability;

  /**
   * Verifica se il provisioner è pronto per l'utente:
   *  - FULL_AUTO: ha credenziali compute valide (es. Scaleway)
   *  - SEMI_AUTO: l'utente ha collegato Object Storage credentials (es. Hetzner)
   */
  isReady(userId: string): Promise<ProvisionerReadiness>;

  /**
   * Provisiona una BackupDestination: crea bucket se necessario, salva la
   * destination in DB con creds cifrate, ritorna i dettagli.
   * Idempotente: se esiste già una destination per (userId, bucket), la riusa.
   */
  provisionDestination(input: ProvisionInput): Promise<ProvisionResult>;
}
