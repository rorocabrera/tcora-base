// packages/core/src/services/redis.service.ts

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryStrategy?: (times: number) => number | void;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private isConnected = false;

  constructor(config: RedisConfig) {
    console.log('Initializing Redis connection with:', {
      host: config.host,
      port: config.port,
      db: config.db
    });

    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      retryStrategy: (times: number) => {
        if (times > 10) {
          console.error('Max Redis retry attempts reached');
          return null; // stop retrying
        }
        const delay = Math.min(times * 100, 3000);
        console.log(`Redis retry attempt ${times} with delay ${delay}ms`);
        return delay;
      },
      lazyConnect: true // Don't connect immediately
    });

    // Handle events
    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
      this.isConnected = true;
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
      this.isConnected = false;
    });

    // Initial connection
    this.connect();
  }

  private async connect() {
    try {
      await this.redis.connect();
    } catch (error) {
      console.error('Failed to establish Redis connection:', error);
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      console.warn('Redis not connected while attempting to get key:', key);
      return null;
    }
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis not connected while attempting to set key:', key);
      return;
    }
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis not connected while attempting to delete key:', key);
      return;
    }
    await this.redis.del(key);
  }

  isReady(): boolean {
    return this.isConnected;
  }
}