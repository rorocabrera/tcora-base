// packages/core/src/middleware/tenant.middleware.ts

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';
import { Tenant } from '../database/types';

interface RequestWithTenant extends Request {
  tenant?: Tenant;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: RequestWithTenant, res: Response, next: NextFunction) {
    // Skip tenant check for public routes
    if (req.path === '/health' || req.path === '/api/public') {
      return next();
    }

    // Get tenant ID from header
    const tenantId = req.header('x-tenant-id');

    if (!tenantId) {
      return next(new UnauthorizedException('Tenant ID is required'));
    }

    try {
      const tenant = await this.tenantService.validateTenant(tenantId);
      req.tenant = tenant;
      next();
    } catch (error) {
      next(new UnauthorizedException('Invalid tenant'));
    }
  }
}