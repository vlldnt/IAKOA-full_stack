import { Injectable } from '@nestjs/common';
import { Event, Prisma, User, UserFavorite } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Sélection publique d'un utilisateur associée à un favori. */
const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  isCreator: true,
} as const;

/**
 * Repository des favoris utilisateurs.
 *
 * Description : isole les accès Prisma à la table `userFavorite`, ainsi que les
 * vérifications d'existence sur `user` et `event`.
 * Pourquoi : centraliser l'accès aux données et découpler le service métier de
 * Prisma.
 */
@Injectable()
export class UserFavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Vérifie l'existence d'un utilisateur par son identifiant. */
  findUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  /** Vérifie l'existence d'un événement par son identifiant. */
  findEvent(eventId: string): Promise<Event | null> {
    return this.prisma.event.findUnique({ where: { id: eventId } });
  }

  /** Crée un favori (avec événement et utilisateur public inclus). */
  create(userId: string, eventId: string) {
    return this.prisma.userFavorite.create({
      data: { userId, eventId },
      include: { event: true, user: { select: USER_PUBLIC_SELECT } },
    });
  }

  /** Récupère les favoris d'un utilisateur (événements inclus). */
  findByUserId(userId: string) {
    return this.prisma.userFavorite.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Récupère les favoris d'un événement (utilisateurs publics inclus). */
  findByEventId(eventId: string) {
    return this.prisma.userFavorite.findMany({
      where: { eventId },
      include: { user: { select: USER_PUBLIC_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Récupère un favori via sa clé composite (utilisateur + événement). */
  findOne(userId: string, eventId: string): Promise<UserFavorite | null> {
    return this.prisma.userFavorite.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
  }

  /** Supprime un favori via sa clé composite. */
  delete(userId: string, eventId: string): Promise<UserFavorite> {
    return this.prisma.userFavorite.delete({
      where: { userId_eventId: { userId, eventId } },
    });
  }

  /** Compte les favoris d'un événement. */
  countByEventId(eventId: string): Promise<number> {
    return this.prisma.userFavorite.count({ where: { eventId } });
  }

  /** Supprime tous les favoris d'un utilisateur. */
  deleteAllByUserId(userId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.userFavorite.deleteMany({ where: { userId } });
  }
}
