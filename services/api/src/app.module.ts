// services/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  constructor() {
    console.log('AppModule initialized with controllers:', [AppController.name]);
  }
}