// services/api/src/config/configuration.ts

import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || '',
  refreshSecret: process.env.JWT_REFRESH_SECRET || '',
  accessTokenExpiration: '15m',
  refreshTokenExpiration: '7d',
}));

export const databaseConfig = registerAs('database', () => {
  const url = new URL(process.env.DATABASE_URL || 'postgresql://localhost');
  
  return {
    host: url.hostname,
    port: parseInt(url.port, 10) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading '/'
  };
});

export const redisConfig = registerAs('redis', () => {
  // Remove any ${} template strings that might have leaked through
  const cleanEnvValue = (value: string | undefined) => {
    if (!value) return undefined;
    // If the value contains ${}, return undefined to use default
    return value.includes('${') ? undefined : value;
  };

  const rawHost = cleanEnvValue(process.env.REDIS_HOST);
  const rawPort = cleanEnvValue(process.env.REDIS_PORT);

  // Debug logging
  console.log('Raw Redis Environment variables:', {
    REDIS_HOST: rawHost,
    REDIS_PORT: rawPort,
    NODE_ENV: process.env.NODE_ENV
  });

  // Docker-friendly defaults
  const config = {
    host: rawHost || 'redis',  // Default to 'redis' for Docker
    port: rawPort ? parseInt(rawPort, 10) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  };

  console.log('Processed Redis config:', {
    ...config,
    password: config.password ? '[REDACTED]' : undefined
  });

  return config;
});