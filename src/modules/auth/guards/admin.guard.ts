import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';
import { IdentityRole } from '../entities/user.entity';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireAdmin = this.reflector.getAllAndOverride<boolean>(
      IS_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireAdmin) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (process.env.AUTH_MODE !== 'local') {
      if (user?.isAdmin) return true;
      const adminRole = process.env.OIDC_ADMIN_ROLE || IdentityRole.ADMIN;
      const claimedRoles = user?.roles ?? {};
      if (!Object.keys(claimedRoles).includes(adminRole)) {
        throw new ForbiddenException('Admin access required');
      }
      return true;
    }

    if (user?.role !== IdentityRole.ADMIN && !user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
