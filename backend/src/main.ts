import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SwaggerConfig } from './swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { validateEnv } from './config/env';

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);

  // Headers de sécurité (CSP désactivée hors production : elle bloque Swagger UI)
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  // Cookies HttpOnly (auth web)
  app.use(cookieParser());

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

  // CORS restreint aux origines du frontend (plusieurs origines possibles,
  // séparées par des virgules), avec credentials pour les cookies.
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Configuration Swagger (uniquement en développement)
  if (SwaggerConfig.shouldEnable()) {
    SwaggerConfig.setup(app, 'swagger');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger UI disponible sur: http://localhost:${port}/swagger`);
}
bootstrap();
