// services/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('API');
  logger.log('Starting API server...');
  
  try {

    

    const app = await NestFactory.create(AppModule);
    logger.log('NestJS application created');

    app.enableCors({
      origin: ['http://localhost:3002'], // Your React app's URL
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true, // Important for cookies/auth
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const port = process.env.PORT || 3000;
    const host = '0.0.0.0';

    await app.listen(port, host);
    logger.log(`Server is running on http://${host}:${port}`);
    
    const server = app.getHttpServer();
    const address = server.address();
    logger.log(`Server bound to: ${JSON.stringify(address)}`);
    
    // Log all registered routes
    const router = server._events.request._router;
    logger.log('Registered routes:');
    router.stack.forEach((route: any) => {
      if (route.route) {
        logger.log(`${route.route.path}`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();