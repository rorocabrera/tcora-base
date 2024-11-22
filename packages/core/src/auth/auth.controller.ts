import { Controller, Post, Body } from '@nestjs/common';
import { LoginCredentials, AuthResponse } from '@my-app/core/auth';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() credentials: LoginCredentials): Promise<AuthResponse> {
    // Implementation will be added later
    throw new Error('Not implemented');
  }

  @Post('logout')
  async logout(): Promise<void> {
    // Implementation will be added later
    throw new Error('Not implemented');
  }
}