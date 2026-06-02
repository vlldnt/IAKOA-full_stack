import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';
import { AppController } from './app.controller';
import { CompaniesModule } from './companies/companies.module';
import { EventsModule } from './events/events.module';
import { MediaModule } from './media/media.module';
import { UserFavoritesModule } from './user-favorites/user-favorites.module';
import { HttpLoggerMiddleware } from './middlewares/http-logger.middleware';
import { CsrfMiddleware } from './middlewares/csrf.middleware';

@Module({
  imports: [
    // Limitation de débit globale : 100 requêtes / 60s par IP (anti brute-force / DoS).
    // Surchargeable par route via @Throttle (ex. login plus strict).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    CompaniesModule,
    EventsModule,
    MediaModule,
    UserFavoritesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware, CsrfMiddleware).forRoutes('*');
  }
}
