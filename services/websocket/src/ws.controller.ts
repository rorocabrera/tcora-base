// services/websocket/src/ws.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class WsController {
  @Get('health')
  health() {
    return { status: 'OK' };
  }
}