// packages/core/src/types/express.ts
import { UserRole } from '@tcora/config';
import { Tenant } from '../database/types';
import { JWTPayload } from '@tcora/config';

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      user?: JWTPayload;
      currentUser?: {
        id: string;
        tenantId: string;
        role: UserRole;
        email: string;
        resellerId?: string;
      };
    }
  }
}