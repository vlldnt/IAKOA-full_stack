import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MediaModule } from 'src/media/media.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PrismaModule, MediaModule, NotificationsModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
