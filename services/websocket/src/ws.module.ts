// services/websocket/src/ws.module.ts
import { Module } from '@nestjs/common';
import { WsController } from './ws.controller';

@Module({
  imports: [],
  controllers: [WsController],
})
export class WsModule {}