import { Injectable } from '@nestjs/common';
import { Event, Media, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Événement enrichi de son entreprise propriétaire. */
export type EventWithCompany = Prisma.EventGetPayload<{ include: { company: true } }>;

/**
 * Repository des médias.
 *
 * Description : isole les accès Prisma aux tables `media` et `event` (lecture
 * d'existence) utilisés par le service des médias.
 * Pourquoi : centraliser l'accès aux données et respecter la séparation des
 * responsabilités.
 */
@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée plusieurs médias de façon atomique (transaction).
   *
   * Paramètres : `data` — données de création des médias.
   * Retour : les médias créés.
   * Pourquoi : garantir l'insertion « tout ou rien » des médias d'un événement.
   */
  createMany(data: Prisma.MediaCreateManyInput[]): Promise<Media[]> {
    return this.prisma.$transaction(
      data.map((media) => this.prisma.media.create({ data: media })),
    );
  }

  /** Récupère un événement par son identifiant (ou `null`). */
  findEvent(eventId: string): Promise<Event | null> {
    return this.prisma.event.findUnique({ where: { id: eventId } });
  }

  /** Récupère un événement et son entreprise propriétaire (ou `null`). */
  findEventWithCompany(eventId: string): Promise<EventWithCompany | null> {
    return this.prisma.event.findUnique({
      where: { id: eventId },
      include: { company: true },
    });
  }

  /** Récupère les médias d'un événement, du plus ancien au plus récent. */
  findByEventId(eventId: string): Promise<Media[]> {
    return this.prisma.media.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
