// packages/core/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'auth/index': 'src/auth/index.ts',
  
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['@tcora/config', '@nestjs/common', '@nestjs/core', '@nestjs/jwt', 'bcrypt', 'ioredis'],
  sourcemap: true,
  tsconfig: './tsconfig.json',
});