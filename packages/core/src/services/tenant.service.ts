// packages/core/src/services/tenant.service.ts

import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Tenant } from '../database/types';

@Injectable()
export class TenantService implements OnModuleInit {
  private pool: Pool;

  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      user: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('TenantService: Database connection verified');
    } catch (error) {
      console.error('TenantService: Database connection failed', error);
      throw error;
    }
  }

  async validateTenant(identifier: string): Promise<Tenant> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<Tenant>(
        `SELECT id, name, domain, is_active as "isActive", settings, created_at as "createdAt", updated_at as "updatedAt"
         FROM tenants 
         WHERE domain = $1 OR id = $1`,
        [identifier]
      );

      if (!result.rows[0]) {
        throw new NotFoundException(`Tenant not found for identifier: ${identifier}`);
      }

      const tenant = result.rows[0];

      if (!tenant.isActive) {
        // Instead of a generic error, we throw the specific message we want
        throw new Error(`Tenant ${identifier} is not active`);
      }

      return tenant;
      
    } finally {
      client.release();
    }
  }

  async listTenants(
    options: {
      limit?: number;
      offset?: number;
      isActive?: boolean;
    } = {}
  ): Promise<{ tenants: Tenant[]; total: number }> {
    const client = await this.pool.connect();
    try {
      const whereClause = options.isActive !== undefined 
        ? 'WHERE is_active = $3'
        : '';
      
      const [tenantsResult, countResult] = await Promise.all([
        client.query<Tenant>(
          `SELECT id, name, domain, is_active as "isActive", settings, 
           created_at as "createdAt", updated_at as "updatedAt"
           FROM tenants 
           ${whereClause}
           ORDER BY created_at DESC 
           LIMIT $1 OFFSET $2`,
          options.isActive !== undefined
            ? [options.limit || 10, options.offset || 0, options.isActive]
            : [options.limit || 10, options.offset || 0]
        ),
        client.query<{ count: string }>(
          `SELECT COUNT(*) as count 
           FROM tenants
           ${whereClause}`,
          options.isActive !== undefined ? [options.isActive] : []
        ),
      ]);

      return {
        tenants: tenantsResult.rows,
        total: parseInt(countResult.rows[0].count, 10),
      };
    } finally {
      client.release();
    }
  }
}