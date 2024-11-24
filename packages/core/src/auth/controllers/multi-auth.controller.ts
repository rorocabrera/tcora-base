// packages/core/src/auth/controllers/multi-auth.controller.ts

import { 
    Controller, 
    Post, 
    Body, 
    UseGuards, 
    Req, 
    UnauthorizedException 
  } from '@nestjs/common';
  import { MultiAuthService } from '../services/multi-auth.service';
  import { JwtAuthGuard } from '../guards/jwt.guard';
  import { Request } from 'express';
  import { LoginContext, UserType, JWTPayload } from '@tcora/config';
  
  interface LoginDto {
    email: string;
    password: string;
    context: LoginContext;
  }
  
  interface RefreshTokenDto {
    refreshToken: string;
    context: LoginContext;
  }
  
  interface ImpersonateDto {
    targetUserId: string;
    targetType: UserType;
  }
  
  @Controller('auth')
  export class MultiAuthController {
    constructor(private authService: MultiAuthService) {}
  
    @Post('platform/login')
    async platformLogin(@Body() credentials: Omit<LoginDto, 'context'>) {
      const user = await this.authService.validateUser(
        credentials.email,
        credentials.password,
        { type: UserType.PLATFORM_ADMIN }
      );
      return this.authService.login(user, { type: UserType.PLATFORM_ADMIN });
    }
  
    @Post('tenant/login')
    async tenantLogin(
      @Body() credentials: Omit<LoginDto, 'context'> & { tenantId: string }
    ) {
      const user = await this.authService.validateUser(
        credentials.email,
        credentials.password,
        { type: UserType.TENANT_ADMIN, tenantId: credentials.tenantId }
      );
      return this.authService.login(user, { 
        type: UserType.TENANT_ADMIN, 
        tenantId: credentials.tenantId 
      });
    }
  
    @Post('user/login')
    async userLogin(
      @Body() credentials: Omit<LoginDto, 'context'> & { domain: string }
    ) {
      // First resolve domain to tenantId
      const tenant = await this.authService.resolveTenantDomain(credentials.domain);
      const user = await this.authService.validateUser(
        credentials.email,
        credentials.password,
        { type: UserType.END_USER, tenantId: tenant.id }
      );
      return this.authService.login(user, { 
        type: UserType.END_USER, 
        tenantId: tenant.id 
      });
    }
  
    @Post('refresh')
    async refresh(@Body() body: RefreshTokenDto) {
      return this.authService.refreshToken(body.refreshToken, body.context);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req: Request) {
      const user = req.user as JWTPayload;
      if (!user) {
        throw new UnauthorizedException('User not found in request');
      }
      return this.authService.logout(user.sub, user.type);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('impersonate')
    async impersonate(
      @Req() req: Request,
      @Body() body: ImpersonateDto
    ) {
      const user = req.user as JWTPayload;
      if (!user) {
        throw new UnauthorizedException('User not found in request');
      }
      return this.authService.impersonate(user, body.targetUserId, body.targetType);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('stop-impersonation')
    async stopImpersonation(@Req() req: Request) {
      const user = req.user as JWTPayload;
      if (!user || !user.impersonating) {
        throw new UnauthorizedException('Not currently impersonating');
      }
      // Return to original user context
      const originalUser = await this.authService.validateUser(
        user.email,
        '',
        { type: user.impersonating.originalType }
      );
      return this.authService.login(originalUser, { 
        type: user.impersonating.originalType 
      });
    }
  }