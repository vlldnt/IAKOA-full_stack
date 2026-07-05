import { Test, TestingModule } from '@nestjs/testing';
import { EventStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { EventsService } from '../events/events.service';
import { MediaService } from '../media/media.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const PARIS = { lat: 48.8566, lng: 2.3522 };

describe('NotificationsService (in-app + déclencheurs événements)', () => {
  let notificationsService: NotificationsService;
  let eventsService: EventsService;
  let prisma: PrismaService;

  let ownerId: string;
  let fanId: string;
  let companyId: string;

  async function seedEvent(name: string, status: EventStatus = EventStatus.PUBLISHED) {
    return prisma.event.create({
      data: {
        name,
        date: new Date(Date.now() + 12 * 60 * 60 * 1000), // dans 12 h
        description: 'description',
        location: { city: 'Paris', coordinates: PARIS },
        status,
        companyId,
      },
    });
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, EventsService, MediaService, MailService, PrismaService],
    }).compile();

    notificationsService = module.get(NotificationsService);
    eventsService = module.get(EventsService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});

    const owner = await prisma.user.create({
      data: { name: 'Orga', email: 'orga-notif@example.com', isCreator: true },
    });
    const fan = await prisma.user.create({
      data: { name: 'Fan', email: 'fan-notif@example.com' },
    });
    const company = await prisma.company.create({
      data: { name: 'Notif Corp', siren: '111222333', ownerId: owner.id },
    });

    ownerId = owner.id;
    fanId = fan.id;
    companyId = company.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('lit, compte et marque les notifications', async () => {
    await notificationsService.notifyUser(fanId, {
      type: NotificationType.EVENT_REMINDER,
      title: 'Test',
      body: 'corps',
    });

    await expect(notificationsService.unreadCount(fanId)).resolves.toEqual({ count: 1 });

    const list = await notificationsService.findForUser(fanId);
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Test');
    expect(list[0].readAt).toBeNull();

    await notificationsService.markRead(fanId, list[0].id);
    await expect(notificationsService.unreadCount(fanId)).resolves.toEqual({ count: 0 });

    // Déjà lue → 404 ; notification d'un autre utilisateur → 404
    await expect(notificationsService.markRead(fanId, list[0].id)).rejects.toThrow();
    await expect(notificationsService.markRead(ownerId, list[0].id)).rejects.toThrow();
  });

  it("notifie l'organisateur à la publication et au refus", async () => {
    const event = await seedEvent('En modération', EventStatus.PENDING);

    await eventsService.moderate(event.id, EventStatus.PUBLISHED);
    await eventsService.moderate(event.id, EventStatus.REJECTED, 'Photo manquante');

    const notifications = await notificationsService.findForUser(ownerId);
    expect(notifications.map(n => n.type).sort()).toEqual([
      NotificationType.EVENT_PUBLISHED,
      NotificationType.EVENT_REJECTED,
    ]);
    expect(notifications.find(n => n.type === 'EVENT_REJECTED')?.body).toContain(
      'Photo manquante',
    );
  });

  it('notifie les favoris quand un événement suivi est modifié ou supprimé', async () => {
    const event = await seedEvent('Suivi');
    await prisma.userFavorite.create({ data: { userId: fanId, eventId: event.id } });

    await eventsService.update(event.id, { description: 'Nouvelle description' }, ownerId, 'USER');
    await eventsService.remove(event.id, ownerId, 'USER');

    const notifications = await notificationsService.findForUser(fanId);
    expect(notifications.map(n => n.type).sort()).toEqual([
      NotificationType.EVENT_CANCELLED,
      NotificationType.EVENT_UPDATED,
    ]);
    // La notification d'annulation survit à la suppression de l'événement
    expect(notifications.find(n => n.type === 'EVENT_CANCELLED')?.eventId).toBeNull();
  });

  it('envoie les rappels J-1 une seule fois par utilisateur/événement', async () => {
    const event = await seedEvent('Demain soir');
    await prisma.userFavorite.create({ data: { userId: fanId, eventId: event.id } });

    await expect(notificationsService.sendUpcomingReminders()).resolves.toBe(1);
    // Rejouer le cron ne renvoie pas de doublon
    await expect(notificationsService.sendUpcomingReminders()).resolves.toBe(0);

    const notifications = await notificationsService.findForUser(fanId);
    expect(notifications.filter(n => n.type === 'EVENT_REMINDER')).toHaveLength(1);
  });
});
