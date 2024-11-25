// packages/core/src/auth/jwt.manager.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../services/redis.service';
import { JWTPayload } from '@tcora/config';
import { TokenPair } from '@tcora/config';

@Injectable()
export class JWTManager {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService
  ) {}

  
  async generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken, expiresIn: 7 * 24 * 60 * 60 };
  }

  async verifyToken(token: string, isRefresh = false): Promise<JWTPayload> {
    return this.jwtService.verify(token);
  }

  async blacklistToken(token: string): Promise<void> {
    const decoded = this.jwtService.decode(token) as JWTPayload;
    if (!decoded) return;

    const exp = decoded.exp || 0;
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;

    if (ttl > 0) {
      await this.redisService.set(`blacklist:${token}`, '1', ttl);
    }
  }
}