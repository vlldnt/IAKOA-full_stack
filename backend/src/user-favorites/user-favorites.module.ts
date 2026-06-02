import { Module } from '@nestjs/common';
import { UserFavoritesService } from './user-favorites.service';
import { UserFavoritesController } from './user-favorites.controller';
import { UserFavoritesRepository } from './repositories/user-favorites.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserFavoritesController],
  providers: [UserFavoritesService, UserFavoritesRepository],
  exports: [UserFavoritesService],
})
export class UserFavoritesModule {}
