import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

export interface NotifyInput {
  type: NotificationType;
  title: string;
  body?: string;
  eventId?: string;
}

/**
 * Notifications in-app avec relais email best-effort
 * (uniquement si User.notifyByEmail est actif).
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /**
   * Crée une notification pour un utilisateur, et l'email associé si activé.
   * Best-effort : ne fait jamais échouer l'opération appelante.
   */
  async notifyUser(userId: string, input: NotifyInput): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          type: input.type,
          title: input.title,
          body: input.body,
          eventId: input.eventId,
        },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true, notifyByEmail: true },
      });
      if (user?.notifyByEmail) {
        await this.mail.sendNotification(user.email, user.name, input.title, input.body);
      }
    } catch (error) {
      this.logger.error(
        `Échec de notification pour ${userId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * Notifie tous les utilisateurs ayant l'événement en favori.
   */
  async notifyFavoriters(eventId: string, input: Omit<NotifyInput, 'eventId'>): Promise<void> {
    const favorites = await this.prisma.userFavorite.findMany({
      where: { eventId },
      select: { userId: true },
    });
    await Promise.all(
      favorites.map(favorite => this.notifyUser(favorite.userId, { ...input, eventId })),
    );
  }

  /**
   * Notifie le propriétaire (organisateur) d'un événement.
   */
  async notifyEventOwner(eventId: string, input: Omit<NotifyInput, 'eventId'>): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { company: { select: { ownerId: true } } },
    });
    if (event) {
      await this.notifyUser(event.company.ownerId, { ...input, eventId });
    }
  }

  /**
   * Dernières notifications de l'utilisateur (50 max).
   */
  async findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  async markRead(userId: string, notificationId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (result.count === 0) {
      throw new NotFoundException('Notification non trouvée ou déjà lue.');
    }
    return { message: 'Notification lue.' };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { message: 'Notifications lues.', count: result.count };
  }

  /**
   * Rappels J-1 : notifie les utilisateurs dont un favori a lieu dans les
   * prochaines 24 h. Idempotent (un seul rappel par utilisateur/événement).
   */
  async sendUpcomingReminders(): Promise<number> {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const favorites = await this.prisma.userFavorite.findMany({
      where: {
        event: { status: 'PUBLISHED', date: { gte: now, lte: in24h } },
      },
      select: {
        userId: true,
        eventId: true,
        event: { select: { name: true, date: true } },
      },
    });

    let sent = 0;
    for (const favorite of favorites) {
      const alreadySent = await this.prisma.notification.findFirst({
        where: {
          userId: favorite.userId,
          eventId: favorite.eventId,
          type: NotificationType.EVENT_REMINDER,
        },
        select: { id: true },
      });
      if (alreadySent) continue;

      const time = favorite.event.date.toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
      });
      await this.notifyUser(favorite.userId, {
        type: NotificationType.EVENT_REMINDER,
        title: `C'est demain : ${favorite.event.name}`,
        body: `Votre événement en favori « ${favorite.event.name} » a lieu dans moins de 24 h (${time}).`,
        eventId: favorite.eventId,
      });
      sent++;
    }

    if (sent > 0) {
      this.logger.log(`${sent} rappel(s) J-1 envoyé(s).`);
    }
    return sent;
  }
}
