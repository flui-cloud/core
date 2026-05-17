import { IdentityRole } from '../entities/user.entity';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  roles: Record<string, Record<string, string>>;
  role: IdentityRole;
  isAdmin?: boolean;
}
