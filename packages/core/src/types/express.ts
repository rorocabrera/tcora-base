// packages/core/src/types/express.ts
import { Tenant, UserRole } from '../database/types';

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      currentUser?: {
        id: string;
        tenantId: string;
        role: UserRole;
      };
    }
  }
}