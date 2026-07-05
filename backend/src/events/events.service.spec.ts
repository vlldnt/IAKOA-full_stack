import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { EventsService } from './events.service';
import { MediaService } from '../media/media.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

const PARIS = { lat: 48.8566, lng: 2.3522 };
const LYON = { lat: 45.764, lng: 4.8357 };
const VERSAILLES = { lat: 48.8049, lng: 2.1204 }; // ~17 km de Paris

describe('EventsService (création & recherche filtrée SQL)', () => {
  let eventsService: EventsService;
  let prisma: PrismaService;

  let ownerId: string;
  let otherUserId: string;
  let companyId: string;

  function eventDto(overrides: Partial<CreateEventDto> = {}): CreateEventDto {
    return {
      name: 'Concert de Jazz',
      date: '2030-06-15T20:00:00Z',
      description: 'Un concert exceptionnel',
      pricing: 0,
      location: { city: 'Paris', coordinates: PARIS },
      companyId,
      categories: ['CONCERT'],
      ...overrides,
    } as CreateEventDto;
  }

  // Insertion directe en base pour préparer les scénarios de recherche.
  // Statut PUBLISHED par défaut : c'est le seul visible publiquement.
  async function seedEvent(data: {
    name: string;
    date?: string;
    description?: string;
    pricing?: number;
    location?: object | null;
    categories?: string[];
    status?: EventStatus;
  }) {
    return prisma.event.create({
      data: {
        name: data.name,
        date: new Date(data.date ?? '2030-06-15T20:00:00Z'),
        description: data.description ?? 'description',
        pricing: data.pricing ?? 0,
        location: data.location ?? { city: 'Paris', coordinates: PARIS },
        status: data.status ?? EventStatus.PUBLISHED,
        categories: data.categories
          ? { connect: data.categories.map(slug => ({ slug })) }
          : undefined,
        companyId,
      },
    });
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, MediaService, PrismaService],
    }).compile();

    eventsService = module.get(EventsService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});

    const owner = await prisma.user.create({
      data: { name: 'Owner', email: 'owner@example.com', isCreator: true },
    });
    const other = await prisma.user.create({
      data: { name: 'Other', email: 'other@example.com' },
    });
    const company = await prisma.company.create({
      data: { name: 'Ma Boîte', siren: '123456789', ownerId: owner.id },
    });

    ownerId = owner.id;
    otherUserId = other.id;
    companyId = company.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('crée un événement avec médias pour le propriétaire de la company', async () => {
      const event = await eventsService.create(
        eventDto({
          media: [{ url: 'https://example.com/img.jpg', type: 'image/jpeg' }],
        }),
        companyId,
        ownerId,
      );

      expect(event.id).toBeDefined();
      expect(event.name).toBe('Concert de Jazz');
      expect(event.media).toHaveLength(1);
      expect(event.categories).toEqual(['CONCERT']);
      // Tout nouvel événement part en modération
      expect(event.status).toBe(EventStatus.PENDING);
    });

    it("refuse la création si l'utilisateur n'est pas propriétaire", async () => {
      await expect(eventsService.create(eventDto(), companyId, otherUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('refuse une catégorie inconnue', async () => {
      await expect(
        eventsService.create(eventDto({ categories: ['NEXISTEPAS'] }), companyId, ownerId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('modération', () => {
    it('un événement PENDING est invisible publiquement, visible après publication', async () => {
      const event = await seedEvent({ name: 'En attente', status: EventStatus.PENDING });

      let result = await eventsService.findFiltered({});
      expect(result.total).toBe(0);
      await expect(eventsService.findOnePublic(event.id)).rejects.toThrow();

      await eventsService.moderate(event.id, EventStatus.PUBLISHED);

      result = await eventsService.findFiltered({});
      expect(result.data.map(e => e.name)).toEqual(['En attente']);
      await expect(eventsService.findOnePublic(event.id)).resolves.toBeDefined();
    });

    it('exige un motif pour refuser un événement', async () => {
      const event = await seedEvent({ name: 'À refuser', status: EventStatus.PENDING });

      await expect(eventsService.moderate(event.id, EventStatus.REJECTED)).rejects.toThrow(
        BadRequestException,
      );

      const rejected = await eventsService.moderate(
        event.id,
        EventStatus.REJECTED,
        'Description incomplète',
      );
      expect(rejected.status).toBe(EventStatus.REJECTED);
      expect(rejected.moderationNote).toBe('Description incomplète');
    });

    it('un événement refusé repart en modération quand son organisateur le modifie', async () => {
      const event = await seedEvent({ name: 'Refusé', status: EventStatus.REJECTED });

      const updated = await eventsService.update(
        event.id,
        { description: 'Description corrigée' },
        ownerId,
        'USER',
      );
      expect(updated.status).toBe(EventStatus.PENDING);
    });

    it('liste la file de modération par statut', async () => {
      await seedEvent({ name: 'Pending 1', status: EventStatus.PENDING });
      await seedEvent({ name: 'Publié', status: EventStatus.PUBLISHED });

      const queue = await eventsService.findByStatus(EventStatus.PENDING);
      expect(queue.map(e => e.name)).toEqual(['Pending 1']);
    });
  });

  describe('findFiltered — mot-clé', () => {
    it('matche le nom et la description, insensible à la casse', async () => {
      await seedEvent({ name: 'Festival Rock' });
      await seedEvent({ name: 'Atelier cuisine', description: 'Spécial rock progressif' });
      await seedEvent({ name: 'Brocante' });

      const result = await eventsService.findFiltered({ keyword: 'ROCK' });

      expect(result.total).toBe(2);
      expect(result.data.map(e => e.name).sort()).toEqual(['Atelier cuisine', 'Festival Rock']);
    });
  });

  describe('findFiltered — distance', () => {
    beforeEach(async () => {
      await seedEvent({ name: 'Event Paris', location: { coordinates: PARIS } });
      await seedEvent({ name: 'Event Versailles', location: { coordinates: VERSAILLES } });
      await seedEvent({ name: 'Event Lyon', location: { coordinates: LYON } });
      await seedEvent({ name: 'Event sans coordonnées', location: { city: 'Nulle part' } });
    });

    it('rayon 5 km autour de Paris → uniquement Paris', async () => {
      const result = await eventsService.findFiltered({
        latitude: PARIS.lat,
        longitude: PARIS.lng,
        radius: 5,
      });
      expect(result.data.map(e => e.name)).toEqual(['Event Paris']);
    });

    it('rayon 30 km autour de Paris → Paris + Versailles', async () => {
      const result = await eventsService.findFiltered({
        latitude: PARIS.lat,
        longitude: PARIS.lng,
        radius: 30,
      });
      expect(result.data.map(e => e.name).sort()).toEqual(['Event Paris', 'Event Versailles']);
    });

    it('rayon 500 km → inclut Lyon mais jamais les événements sans coordonnées', async () => {
      const result = await eventsService.findFiltered({
        latitude: PARIS.lat,
        longitude: PARIS.lng,
        radius: 500,
      });
      expect(result.data.map(e => e.name).sort()).toEqual([
        'Event Lyon',
        'Event Paris',
        'Event Versailles',
      ]);
    });
  });

  describe('findFiltered — pagination et tri', () => {
    it('pagine en base et trie par date décroissante', async () => {
      for (let i = 1; i <= 15; i++) {
        await seedEvent({
          name: `Event ${String(i).padStart(2, '0')}`,
          date: `2030-06-${String(i).padStart(2, '0')}T20:00:00Z`,
        });
      }

      const page1 = await eventsService.findFiltered({ page: 1, limit: 12 });
      expect(page1.total).toBe(15);
      expect(page1.totalPages).toBe(2);
      expect(page1.data).toHaveLength(12);
      expect(page1.data[0].name).toBe('Event 15'); // date la plus récente d'abord

      const page2 = await eventsService.findFiltered({ page: 2, limit: 12 });
      expect(page2.data).toHaveLength(3);
      expect(page2.data[2].name).toBe('Event 01');
    });
  });

  describe('findFiltered — prix et catégories', () => {
    it('filtre les événements gratuits', async () => {
      await seedEvent({ name: 'Gratuit', pricing: 0 });
      await seedEvent({ name: 'Payant', pricing: 2500 });

      const result = await eventsService.findFiltered({ isFree: true });
      expect(result.data.map(e => e.name)).toEqual(['Gratuit']);
    });

    it('filtre par fourchette de prix', async () => {
      await seedEvent({ name: 'Cher', pricing: 10000 });
      await seedEvent({ name: 'Abordable', pricing: 1500 });

      const result = await eventsService.findFiltered({ priceMin: 1000, priceMax: 5000 });
      expect(result.data.map(e => e.name)).toEqual(['Abordable']);
    });

    it('filtre par catégories (jointure) et ignore les slugs inconnus', async () => {
      await seedEvent({ name: 'Concert', categories: ['CONCERT'] });
      await seedEvent({ name: 'Théâtre', categories: ['THEATRE'] });

      const result = await eventsService.findFiltered({
        categories: 'CONCERT,PAS_UNE_CATEGORIE',
      });
      expect(result.data.map(e => e.name)).toEqual(['Concert']);
    });
  });

  describe('update / remove — contrôle d’accès', () => {
    it("interdit la modification par un utilisateur qui n'est pas propriétaire", async () => {
      const event = await seedEvent({ name: 'Protégé' });
      await expect(
        eventsService.update(event.id, { name: 'Piraté' }, otherUserId, 'USER'),
      ).rejects.toThrow(ForbiddenException);
      await expect(eventsService.remove(event.id, otherUserId, 'USER')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
