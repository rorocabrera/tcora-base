// packages/core/src/auth/jwt.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_CONFIG } from '@tcora/config';
import { JWTPayload, TokenPair } from '@tcora/config';
import { RedisService } from '../services/redis.service';

@Injectable()
export class JWTManager {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: JWT_CONFIG.accessToken.secret,
      expiresIn: JWT_CONFIG.accessToken.expiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: JWT_CONFIG.refreshToken.secret,
      expiresIn: JWT_CONFIG.refreshToken.expiresIn,
    });

    // Store refresh token in Redis with user ID as key
    await this.redisService.set(
      `refresh_token:${payload.sub}`,
      refreshToken,
      7 * 24 * 60 * 60 // 7 days in seconds
    );

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string, isRefresh = false): Promise<JWTPayload> {
    const secret = isRefresh ? JWT_CONFIG.refreshToken.secret : JWT_CONFIG.accessToken.secret;
    return this.jwtService.verifyAsync(token, { secret });
  }

  async blacklistToken(token: string): Promise<void> {
    const decoded = await this.verifyToken(token);
    await this.redisService.set(
      `blacklist:${token}`,
      'true',
      60 * 15 // 15 minutes
    );
  }
}