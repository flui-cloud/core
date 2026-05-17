import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationsRepository } from '../../applications/repositories/applications.repository';
import { ApplicationExposure } from '../../applications/enums/application-exposure.enum';
import { ApplicationEntity } from '../../applications/entities/application.entity';

export interface InternalAppAuthzRequest {
  forwardedHost: string | undefined;
  forwardedUri: string | undefined;
  forwardedMethod: string | undefined;
  clientIp: string | undefined;
  userAgent: string | undefined;
}

export interface InternalAppAuthzDecision {
  app: ApplicationEntity;
  appSlug: string;
}

/**
 * Resolves the internal app targeted by a ForwardAuth subrequest and decides
 * whether the current user is allowed to reach it.
 *
 * MVP authorization model: any authenticated user is allowed to open any app
 * marked `exposure=internal`. This is the single-tenant / self-hosted
 * baseline. When workspace / ownership is introduced, this is the single
 * place to enforce ownerId / membership checks.
 */
@Injectable()
export class InternalAppAuthzService {
  private readonly logger = new Logger(InternalAppAuthzService.name);

  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
  ) {}

  /**
   * Given the `Host` the browser used (as reported by the Ingress via
   * `X-Forwarded-Host`), extract the app slug. Convention: slug is the first
   * DNS label of a host of the form `<slug>.internal.<rest>`.
   */
  extractSlugFromHost(host: string | undefined): string | null {
    if (!host) return null;
    const bare = host.split(':')[0].toLowerCase();
    const labels = bare.split('.');
    if (labels.length < 3) return null;
    if (labels[1] !== 'internal') return null;
    const slug = labels[0];
    if (!/^[a-z][a-z0-9-]{0,62}$/.test(slug)) return null;
    return slug;
  }

  async authorize(
    req: InternalAppAuthzRequest,
  ): Promise<InternalAppAuthzDecision> {
    const slug = this.extractSlugFromHost(req.forwardedHost);
    if (!slug) {
      throw new NotFoundException(
        'forwarded host does not resolve to an internal app',
      );
    }
    const app = await this.applicationsRepository.findBySlug(slug);
    if (!app) {
      throw new NotFoundException(`app "${slug}" not found`);
    }
    if (app.exposure !== ApplicationExposure.INTERNAL) {
      throw new ForbiddenException(
        `app "${slug}" is not an internal app (exposure=${app.exposure})`,
      );
    }
    return { app, appSlug: slug };
  }
}
