import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserFavoritesService } from './user-favorites.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserFavoritesService', () => {
  let favoritesService: UserFavoritesService;
  let prisma: PrismaService;

  let userId: string;
  let otherUserId: string;
  let eventId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserFavoritesService, PrismaService],
    }).compile();

    favoritesService = module.get(UserFavoritesService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});

    const user = await prisma.user.create({
      data: { name: 'Fan', email: 'fan@example.com' },
    });
    const other = await prisma.user.create({
      data: { name: 'Other', email: 'other-fav@example.com' },
    });
    const owner = await prisma.user.create({
      data: { name: 'Owner', email: 'owner-fav@example.com', isCreator: true },
    });
    const company = await prisma.company.create({
      data: { name: 'Orga', siren: '987654321', ownerId: owner.id },
    });
    const event = await prisma.event.create({
      data: {
        name: 'Super événement',
        date: new Date('2030-01-01T20:00:00Z'),
        description: 'desc',
        location: { coordinates: { lat: 48.85, lng: 2.35 } },
        companyId: company.id,
      },
    });

    userId = user.id;
    otherUserId = other.id;
    eventId = event.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('ajoute un événement aux favoris', async () => {
    const favorite = await favoritesService.create({ userId, eventId }, userId);
    expect(favorite.userId).toBe(userId);
    expect(favorite.eventId).toBe(eventId);

    await expect(favoritesService.isFavorite(userId, eventId)).resolves.toBe(true);
  });

  it("interdit d'ajouter un favori pour un autre utilisateur", async () => {
    await expect(favoritesService.create({ userId: otherUserId, eventId }, userId)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('refuse le doublon de favori', async () => {
    await favoritesService.create({ userId, eventId }, userId);
    await expect(favoritesService.create({ userId, eventId }, userId)).rejects.toThrow(
      ConflictException,
    );
  });

  it('refuse un événement inexistant', async () => {
    await expect(
      favoritesService.create({ userId, eventId: '00000000-0000-4000-8000-000000000000' }, userId),
    ).rejects.toThrow(NotFoundException);
  });

  it('liste les favoris d’un utilisateur (plus récent en premier)', async () => {
    await favoritesService.create({ userId, eventId }, userId);

    const favorites = await favoritesService.findByUserId(userId);
    expect(favorites).toHaveLength(1);
    expect(favorites[0].eventId).toBe(eventId);
    // Les favoris des autres utilisateurs ne fuient pas
    await expect(favoritesService.findByUserId(otherUserId)).resolves.toHaveLength(0);
  });

  it('supprime un favori', async () => {
    await favoritesService.create({ userId, eventId }, userId);
    await favoritesService.remove(userId, eventId);

    await expect(favoritesService.isFavorite(userId, eventId)).resolves.toBe(false);
    await expect(favoritesService.remove(userId, eventId)).rejects.toThrow(NotFoundException);
  });

  it('supprime les favoris en cascade avec l’événement', async () => {
    await favoritesService.create({ userId, eventId }, userId);
    await prisma.event.delete({ where: { id: eventId } });

    await expect(favoritesService.isFavorite(userId, eventId)).resolves.toBe(false);
  });
});
