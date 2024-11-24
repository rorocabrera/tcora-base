  // packages/core/src/auth/guards/tenant.guard.ts
  
  import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
  import { UserType } from '@tcora/config';
  
  @Injectable()
  export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      
      // Platform admins can access all tenants
      if (user.type === UserType.PLATFORM_ADMIN) {
        return true;
      }
  
      // For tenant-specific users, check tenant ID
      const requestTenantId = request.params.tenantId || request.body.tenantId;
      if (!requestTenantId) {
        throw new UnauthorizedException('Tenant ID is required');
      }
  
      // Verify user has access to this tenant
      if (user.tenantId !== requestTenantId) {
        throw new UnauthorizedException('Unauthorized access to tenant');
      }
  
      return true;
    }
  }