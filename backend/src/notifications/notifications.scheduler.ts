import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

/**
 * Tâches planifiées des notifications.
 * Rappel J-1 : tous les jours à 09:00 (heure de Paris).
 */
@Injectable()
export class NotificationsScheduler {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron('0 9 * * *', { name: 'event-reminders', timeZone: 'Europe/Paris' })
  async sendDailyReminders(): Promise<void> {
    await this.notificationsService.sendUpcomingReminders();
  }
}
