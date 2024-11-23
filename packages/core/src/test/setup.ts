// packages/core/src/test/setup.ts

import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

// Define the config type
type TestConfig = {
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
};

// Mock ConfigService
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key: keyof TestConfig) => {
      const config: TestConfig = {
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USER: 'USER',
        DB_PASSWORD: 'password',
        DB_NAME: 'tCORA_db',
      };
      return config[key];
    }),
  })),
}));