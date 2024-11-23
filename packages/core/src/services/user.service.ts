// packages/core/src/services/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { TenantService } from './tenant.service';
import { User } from '../database/types';
import { UserRole } from '@tcora/config';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  private pool: Pool;

  constructor(
    private readonly configService: ConfigService,
    private readonly tenantService: TenantService
  ) {
    this.pool = new Pool({
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      user: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
    });
  }

  async findByEmail(email: string, tenantId?: string): Promise<User | null> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT id, tenant_id, email, password_hash, role, is_active, 
               reseller_id, last_login, permissions, created_at, updated_at
        FROM users
        WHERE email = $1
        ${tenantId ? 'AND tenant_id = $2' : ''}
      `;
      
      const params = tenantId ? [email, tenantId] : [email];
      const result = await client.query<User>(query, params);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<User | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<User>(
        `SELECT id, tenant_id, email, password_hash, role, is_active, 
                reseller_id, last_login, permissions, created_at, updated_at
         FROM users
         WHERE id = $1`,
        [id]
      );
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async createUser(data: {
    email: string;
    password: string;
    role: UserRole;
    tenantId?: string;
    resellerId?: string;
  }): Promise<User> {
    // For tenant-specific users, validate tenant first
    if (data.tenantId) {
      await this.tenantService.validateTenant(data.tenantId);
    }

    const client = await this.pool.connect();
    try {
      const passwordHash = await hash(data.password, 10);
      
      const result = await client.query<User>(
        `INSERT INTO users (
           id, tenant_id, email, password_hash, role, 
           is_active, reseller_id, created_at, updated_at
         )
         VALUES (
           uuid_generate_v4(), $1, $2, $3, $4, 
           true, $5, NOW(), NOW()
         )
         RETURNING *`,
        [
          data.tenantId,
          data.email,
          passwordHash,
          data.role,
          data.resellerId,
        ]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [userId]
      );
    } finally {
      client.release();
    }
  }

  async listUsers(options: {
    tenantId?: string;
    limit?: number;
    offset?: number;
    isActive?: boolean;
  }): Promise<{ users: User[]; total: number }> {
    const client = await this.pool.connect();
    try {
      const whereConditions = ['1=1'];
      const params: any[] = [];
      let paramCounter = 1;

      if (options.tenantId) {
        whereConditions.push(`tenant_id = $${paramCounter}`);
        params.push(options.tenantId);
        paramCounter++;
      }

      if (options.isActive !== undefined) {
        whereConditions.push(`is_active = $${paramCounter}`);
        params.push(options.isActive);
        paramCounter++;
      }

      const whereClause = whereConditions.join(' AND ');

      const [usersResult, countResult] = await Promise.all([
        client.query<User>(
          `SELECT id, tenant_id, email, role, is_active, 
                  reseller_id, last_login, permissions, created_at, updated_at
           FROM users 
           WHERE ${whereClause}
           ORDER BY created_at DESC 
           LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`,
          [...params, options.limit || 10, options.offset || 0]
        ),
        client.query<{ count: string }>(
          `SELECT COUNT(*) as count 
           FROM users
           WHERE ${whereClause}`,
          params
        ),
      ]);

      return {
        users: usersResult.rows,
        total: parseInt(countResult.rows[0].count, 10),
      };
    } finally {
      client.release();
    }
  }
}