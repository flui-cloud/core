/**
 * Provider supportati per Backup Destinations.
 *
 * Posizionamento Flui (EU sovereignty):
 * - Hetzner / Scaleway: provider EU di prima classe, adapter dedicati
 * - MinIO: self-hosted, sovranità totale dell'utente
 * - Generic S3: catch-all per qualsiasi endpoint S3-compatibile (AWS S3,
 *   Wasabi, Backblaze B2, Cloudflare R2, IDrive E2, ecc.)
 *
 * I provider US (AWS, Wasabi, B2) si configurano via Generic S3 e funzionano
 * identicamente — non hanno bisogno di un enum value dedicato perché non
 * abbiamo override provider-specific lato BE.
 */
export enum StorageBackendProvider {
  HETZNER_OBJECT_STORAGE = 'hetzner_object_storage',
  SCALEWAY_OBJECT_STORAGE = 'scaleway_object_storage',
  MINIO = 'minio',
  GENERIC_S3 = 'generic_s3',
}
