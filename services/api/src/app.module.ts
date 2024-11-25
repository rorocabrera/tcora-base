// services/api/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { 
  MultiAuthController, 
  MultiAuthService, 
  JWTManager,
  RedisService 
} from '@tcora/core';
import { databaseConfig, redisConfig, jwtConfig } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.getOrThrow('jwt.accessSecret'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MultiAuthController],
  providers: [
    {
      provide: RedisService,
      useFactory: (config: ConfigService) => {
        const redisConfig = config.getOrThrow('redis');
        return new RedisService(redisConfig);
      },
      inject: [ConfigService],
    },
    {
      provide: JWTManager,
      useFactory: (jwtService: JwtService, redisService: RedisService) => {
        return new JWTManager(jwtService, redisService);
      },
      inject: [JwtService, RedisService],
    },
    {
      provide: MultiAuthService,
      useFactory: (jwtManager: JWTManager, redisService: RedisService, config: ConfigService) => {
        const dbConfig = config.getOrThrow('database');
        return new MultiAuthService(jwtManager, redisService, dbConfig);
      },
      inject: [JWTManager, RedisService, ConfigService],
    },
  ],
})
export class AppModule {}