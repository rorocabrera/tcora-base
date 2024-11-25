// packages/core/src/config/database.config.ts

export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }
  
  export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
  }
  
  export interface CoreConfig {
    database: DatabaseConfig;
    redis: RedisConfig;
  }