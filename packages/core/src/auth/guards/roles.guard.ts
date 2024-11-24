  // packages/core/src/auth/guards/roles.guard.ts
  
  import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { UserRole, UserType } from '@tcora/config';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
      const requiredTypes = this.reflector.get<UserType[]>('userTypes', context.getHandler());
      
      if (!requiredRoles && !requiredTypes) {
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (requiredTypes && !requiredTypes.includes(user.type)) {
        return false;
      }
  
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        return false;
      }
  
      return true;
    }
  }
  
