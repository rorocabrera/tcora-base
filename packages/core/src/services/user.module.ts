// packages/core/src/services/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TenantService } from './tenant.service';

@Module({
  providers: [UserService, TenantService],
  exports: [UserService],
})
export class UserModule {}