// packages/core/src/auth/guards/jwt.guard.ts

import { 
    Injectable, 
    CanActivate, 
    ExecutionContext, 
    UnauthorizedException 
  } from '@nestjs/common';
  import { JWTManager } from '../services/jwt.manager';
  import { RedisService } from '../../services/redis.service';
  
  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(
      private jwtManager: JWTManager,
      private redisService: RedisService
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
  
      try {
        // Check if token is blacklisted
        const isBlacklisted = await this.redisService.get(`blacklist:${token}`);
        if (isBlacklisted) {
          throw new UnauthorizedException('Token has been revoked');
        }
  
        const payload = await this.jwtManager.verifyToken(token);
        request.user = payload;
        return true;
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }
  
    private extractTokenFromHeader(request: any): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  
