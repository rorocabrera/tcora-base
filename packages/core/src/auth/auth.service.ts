// packages/core/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTManager } from './jwt';
import { UserService } from '../services/user.service';
import { RedisService } from '../services/redis.service';
import { compare } from 'bcrypt';
import { JWTPayload, TokenPair, UserRole } from '@tcora/config';
import { User } from '../database/types';

@Injectable()
export class AuthService {
  constructor(
    private jwtManager: JWTManager,
    private userService: UserService,
    private redisService: RedisService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: User): Promise<TokenPair> {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      resellerId: user.resellerId,
    };

    return this.jwtManager.generateTokenPair(payload);
  }

  async impersonate(
    platformAdmin: JWTPayload,
    targetUserId: string
  ): Promise<TokenPair> {
    if (platformAdmin.role !== UserRole.PLATFORM_ADMIN) {
      throw new UnauthorizedException('Only platform admins can impersonate users');
    }

    const targetUser = await this.userService.findById(targetUserId);
    if (!targetUser) {
      throw new UnauthorizedException('Target user not found');
    }

    const payload: JWTPayload = {
      sub: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      tenantId: targetUser.tenantId,
      resellerId: targetUser.resellerId,
      impersonating: {
        originalUserId: platformAdmin.sub,
        originalRole: platformAdmin.role,
      },
    };

    return this.jwtManager.generateTokenPair(payload);
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const decoded = await this.jwtManager.verifyToken(refreshToken, true);
    const storedToken = await this.redisService.get(`refresh_token:${decoded.sub}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new token pair
    const user = await this.userService.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Invalidate old refresh token
    await this.redisService.del(`refresh_token:${decoded.sub}`);
    
    // Generate new token pair
    return this.login(user);
  }

  async logout(userId: string): Promise<void> {
    await this.redisService.del(`refresh_token:${userId}`);
  }
}