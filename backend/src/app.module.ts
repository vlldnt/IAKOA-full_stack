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
import { MailModule } from './mail/mail.module';
import { CategoriesModule } from './categories/categories.module';
import { PlacesModule } from './places/places.module';
import { AdminModule } from './admin/admin.module';
import { HttpLoggerMiddleware } from './middlewares/http-logger.middleware';

@Module({
  imports: [
    // Rate limiting global : 100 requêtes/minute par IP.
    // Les endpoints sensibles (/auth/*) ont une limite plus stricte via @Throttle.
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    CompaniesModule,
    EventsModule,
    MediaModule,
    UserFavoritesModule,
    CategoriesModule,
    PlacesModule,
    AdminModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
