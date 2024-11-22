// services/api/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    console.log('Health check called'); // Add logging
    return 'OK';
  }
}