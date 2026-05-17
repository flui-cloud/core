import { Injectable, Logger } from '@nestjs/common';

export type GhcrPatAuditEventType =
  | 'ghcr_pat.created'
  | 'ghcr_pat.rotated'
  | 'ghcr_pat.expiry_updated'
  | 'ghcr_pat.deleted'
  | 'ghcr_pat.verification_failed';

export interface GhcrPatAuditEvent {
  type: GhcrPatAuditEventType;
  ts: string;
  userId: string;
  scopes?: string[];
  expiresAt?: string | null;
  previousExpiresAt?: string | null;
  newExpiresAt?: string | null;
  reason?: string;
}

@Injectable()
export class GhcrPatAuditService {
  private readonly logger = new Logger('GhcrPatAudit');

  emit(event: Omit<GhcrPatAuditEvent, 'ts'>): void {
    const payload: GhcrPatAuditEvent = {
      ts: new Date().toISOString(),
      ...event,
    };
    if (event.type === 'ghcr_pat.verification_failed') {
      this.logger.warn(payload);
    } else {
      this.logger.log(payload);
    }
  }
}
