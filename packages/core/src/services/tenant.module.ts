// packages/core/src/tenant/tenant.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantService } from '../services/tenant.service';
import { TenantMiddleware } from '../middleware/tenant.middleware';

@Module({
  imports: [ConfigModule],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}

