// services/websocket/src/main.ts
import { NestFactory } from '@nestjs/core';
import { WsModule } from './ws.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WebSocket');
  try {
    const app = await NestFactory.create(WsModule);
    app.enableCors();
    
    // Log all registered routes
    const server = app.getHttpServer();
    const router = server._events.request._router;
    
    logger.log('Registered routes:');
    router.stack.forEach((route: any) => {
      if (route.route) {
        logger.log(`${route.route.path}`);
      }
    });
    
    await app.listen(3001, '0.0.0.0');
    logger.log(`WebSocket Service running at http://0.0.0.0:3001`);
  } catch (error) {
    logger.error('Failed to start WebSocket:', error);
    process.exit(1);
  }
}
bootstrap();