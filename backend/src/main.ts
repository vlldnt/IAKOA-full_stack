import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SwaggerConfig } from './swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // En-têtes de sécurité HTTP (CSP, HSTS, X-Frame-Options, noSniff, etc.)
  app.use(helmet());

  // Exception filter global pour logger les erreurs
  app.useGlobalFilters(new HttpExceptionFilter());

  // Activer la validation globale avec messages d'erreur personnalisés
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Trust nginx reverse proxy headers
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // CORS restreint à une liste blanche d'origines (séparées par des virgules
  // dans CORS_ORIGINS), avec credentials pour préparer les cookies HttpOnly.
  const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Configuration Swagger (uniquement en développement)
  if (SwaggerConfig.shouldEnable()) {
    SwaggerConfig.setup(app, 'swagger');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(`Swagger UI disponible sur: http://localhost:${port}/swagger`);
}
bootstrap();
