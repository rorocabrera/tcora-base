// packages/core/src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, RoleGuard } from './guards';
import { Request } from 'express';

interface LoginDto {
  email: string;
  password: string;
}

interface RefreshTokenDto {
  refreshToken: string;
}

interface ImpersonateDto {
  targetUserId: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    const user = await this.authService.validateUser(
      credentials.email,
      credentials.password
    );
    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    return this.authService.logout(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('impersonate')
  async impersonate(
    @Req() req: Request,
    @Body() body: ImpersonateDto
  ) {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    return this.authService.impersonate(req.user, body.targetUserId);
  }
}