// packages/core/src/auth/multi-auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTManager } from './jwt.manager';
import { RedisService } from '../../services/redis.service';
import { compare } from 'bcrypt';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import {
  JWTPayload,
  TokenPair,
  UserRole,
  UserType,
  LoginContext
} from '@tcora/config';

interface ResolvedTenant {
  id: string;
  name: string;
  isActive: boolean;
  settings?: Record<string, any>;
}

@Injectable()
export class MultiAuthService {
  private pool: Pool;

  constructor(
    private jwtManager: JWTManager,
    private redisService: RedisService,
    private configService: ConfigService
  ) {
    this.pool = new Pool({
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      user: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
    });
  }

  /**
   * Validate user credentials based on the login context
   */
  async validateUser(
    email: string,
    password: string,
    context: LoginContext
  ): Promise<any> {
    const client = await this.pool.connect();
    try {
      let user;

      switch (context.type) {
        case UserType.PLATFORM_ADMIN:
          const { rows: [platformAdmin] } = await client.query(
            `SELECT * FROM platform_schema.platform_admins 
             WHERE email = $1 AND is_active = true`,
            [email]
          );
          user = platformAdmin;
          break;

        case UserType.TENANT_ADMIN:
          if (!context.tenantId) {
            throw new UnauthorizedException('Tenant ID is required for tenant admin login');
          }
          const { rows: [tenantAdmin] } = await client.query(
            `SELECT * FROM platform_schema.tenant_admins 
             WHERE email = $1 AND tenant_id = $2 AND is_active = true`,
            [email, context.tenantId]
          );
          user = tenantAdmin;
          break;

        case UserType.END_USER:
          if (!context.tenantId) {
            throw new UnauthorizedException('Tenant ID is required for end user login');
          }
          const schemaName = await this.getTenantSchemaName(context.tenantId);
          const { rows: [endUser] } = await client.query(
            `SELECT * FROM ${schemaName}.users 
             WHERE email = $1 AND is_active = true`,
            [email]
          );
          user = endUser;
          break;

        default:
          throw new UnauthorizedException('Invalid login context');
      }

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Update last login
      const updateQuery = this.getLastLoginUpdateQuery(context.type);
      await client.query(updateQuery, [user.id]);

      return user;
    } finally {
      client.release();
    }
  }

  /**
 * Resolve tenant domain to tenant details
 */

  async resolveTenantDomain(domain: string): Promise<ResolvedTenant> {
    const client = await this.pool.connect();
    try {
      const { rows: [tenant] } = await client.query<ResolvedTenant>(
        `SELECT 
          id,
          name,
          is_active as "isActive",
          settings
        FROM platform_schema.tenants 
        WHERE domain = $1 AND is_active = true`,
        [domain.toLowerCase()]
      );
  
      if (!tenant) {
        throw new UnauthorizedException('Invalid or inactive tenant domain');
      }
  
      return tenant;
    } finally {
      client.release();
    }
  }

  /**
 * Validate tenant exists and is active
 */
async validateTenant(tenantId: string): Promise<ResolvedTenant> {
  const client = await this.pool.connect();
  try {
    const { rows: [tenant] } = await client.query<ResolvedTenant>(
      `SELECT 
        id,
        name,
        is_active as "isActive",
        settings
      FROM platform_schema.tenants 
      WHERE id = $1 AND is_active = true`,
      [tenantId]
    );

    if (!tenant) {
      throw new UnauthorizedException('Invalid or inactive tenant');
    }

    return tenant;
  } finally {
    client.release();
  }
}

  /**
   * Generate JWT tokens for authenticated user
   */
  async login(user: any, context: LoginContext): Promise<TokenPair> {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      type: context.type,
      role: this.mapUserRole(context.type, user.role),
      ...(context.tenantId && { tenantId: context.tenantId }),
    };

    const tokenPair = await this.jwtManager.generateTokenPair(payload);

    // Store refresh token in Redis
    await this.redisService.set(
      `refresh_token:${user.id}:${context.type}`,
      tokenPair.refreshToken,
      7 * 24 * 60 * 60 // 7 days
    );

    return tokenPair;
  }

  /**
   * Handle impersonation for platform admins
   */
  async impersonate(
    platformAdmin: JWTPayload,
    targetUserId: string,
    targetType: UserType
  ): Promise<TokenPair> {
    if (platformAdmin.type !== UserType.PLATFORM_ADMIN) {
      throw new UnauthorizedException('Only platform admins can impersonate users');
    }

    const client = await this.pool.connect();
    try {
      let targetUser;
      let tenantId: string | null = null;

      switch (targetType) {
        case UserType.TENANT_ADMIN:
          const { rows: [admin] } = await client.query(
            `SELECT * FROM platform_schema.tenant_admins WHERE id = $1`,
            [targetUserId]
          );
          targetUser = admin;
          tenantId = admin?.tenant_id;
          break;

        case UserType.END_USER:
          // First find the tenant for this user
          const { rows: [userTenant] } = await client.query(
            `SELECT tenant_id FROM platform_schema.tenant_users WHERE user_id = $1`,
            [targetUserId]
          );
          
          if (userTenant) {
            const schemaName = await this.getTenantSchemaName(userTenant.tenant_id);
            const { rows: [user] } = await client.query(
              `SELECT * FROM ${schemaName}.users WHERE id = $1`,
              [targetUserId]
            );
            targetUser = user;
            tenantId = userTenant.tenant_id;
          }
          break;

        default:
          throw new UnauthorizedException('Cannot impersonate this user type');
      }

      if (!targetUser) {
        throw new UnauthorizedException('Target user not found');
      }

      const payload: JWTPayload = {
        sub: targetUser.id,
        email: targetUser.email,
        type: targetType,
        role: this.mapUserRole(targetType, targetUser.role),
        ...(tenantId && { tenantId }),
        impersonating: {
          originalUserId: platformAdmin.sub,
          originalType: platformAdmin.type,
        },
      };

      return this.jwtManager.generateTokenPair(payload);
    } finally {
      client.release();
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshToken(refreshToken: string, context: LoginContext): Promise<TokenPair> {
    const decoded = await this.jwtManager.verifyToken(refreshToken, true);
    const storedToken = await this.redisService.get(
      `refresh_token:${decoded.sub}:${context.type}`
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user data based on context
    const client = await this.pool.connect();
    try {
      let user;
      
      switch (context.type) {
        case UserType.PLATFORM_ADMIN:
          const { rows: [platformAdmin] } = await client.query(
            `SELECT * FROM platform_schema.platform_admins WHERE id = $1`,
            [decoded.sub]
          );
          user = platformAdmin;
          break;

        case UserType.TENANT_ADMIN:
          const { rows: [tenantAdmin] } = await client.query(
            `SELECT * FROM platform_schema.tenant_admins WHERE id = $1`,
            [decoded.sub]
          );
          user = tenantAdmin;
          break;

        case UserType.END_USER:
          if (!context.tenantId) {
            throw new UnauthorizedException('Tenant ID is required');
          }
          const schemaName = await this.getTenantSchemaName(context.tenantId);
          const { rows: [endUser] } = await client.query(
            `SELECT * FROM ${schemaName}.users WHERE id = $1`,
            [decoded.sub]
          );
          user = endUser;
          break;
      }

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Invalidate old refresh token
      await this.redisService.del(`refresh_token:${decoded.sub}:${context.type}`);

      // Generate new token pair
      return this.login(user, context);
    } finally {
      client.release();
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string, userType: UserType): Promise<void> {
    await this.redisService.del(`refresh_token:${userId}:${userType}`);
  }

  

  private async getTenantSchemaName(tenantId: string): Promise<string> {
    const client = await this.pool.connect();
    try {
      const { rows: [result] } = await client.query(
        'SELECT get_tenant_schema_name($1) as schema_name',
        [tenantId]
      );
      return result.schema_name;
    } finally {
      client.release();
    }
  }

  private getLastLoginUpdateQuery(userType: UserType): string {
    switch (userType) {
      case UserType.PLATFORM_ADMIN:
        return 'UPDATE platform_schema.platform_admins SET last_login = NOW() WHERE id = $1';
      case UserType.TENANT_ADMIN:
        return 'UPDATE platform_schema.tenant_admins SET last_login = NOW() WHERE id = $1';
      case UserType.END_USER:
        return 'UPDATE users SET last_login = NOW() WHERE id = $1';
      default:
        throw new Error('Invalid user type');
    }
  }

  private mapUserRole(userType: UserType, dbRole?: string): UserRole {
    switch (userType) {
      case UserType.PLATFORM_ADMIN:
        return UserRole.PLATFORM_ADMIN;
      case UserType.TENANT_ADMIN:
        return UserRole.TENANT_ADMIN;
      case UserType.END_USER:
        return dbRole as UserRole || UserRole.END_USER;
      default:
        return UserRole.END_USER;
    }
  }
}