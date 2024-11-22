import { UserRole } from '../database/types';

export class AuthGuard {
  static verifyRole(requiredRoles: UserRole[], userRole: UserRole): boolean {
    return requiredRoles.includes(userRole);
  }

  static verifyTenantAccess(userTenantId: string, requestedTenantId: string): boolean {
    return userTenantId === requestedTenantId;
  }
}