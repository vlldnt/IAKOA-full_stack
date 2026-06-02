import { Injectable } from '@nestjs/common';
import { Company, Event, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Événement enrichi de ses médias. */
export type EventWithMedia = Prisma.EventGetPayload<{ include: { media: true } }>;
/** Événement enrichi de ses médias et de son entreprise. */
export type EventWithMediaAndCompany = Prisma.EventGetPayload<{
  include: { media: true; company: true };
}>;
/** Événement enrichi de son entreprise. */
export type EventWithCompany = Prisma.EventGetPayload<{ include: { company: true } }>;

/**
 * Repository des événements.
 *
 * Description : isole tous les accès Prisma à la table `event` (et la lecture
 * de `company` pour les contrôles de propriété). La logique métier (distance,
 * pagination, filtres) reste dans le service.
 * Pourquoi : centraliser l'accès aux données et respecter la séparation des
 * responsabilités.
 */
@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Récupère une entreprise par son identifiant (contrôle de propriété). */
  findCompany(companyId: string): Promise<Company | null> {
    return this.prisma.company.findUnique({ where: { id: companyId } });
  }

  /** Crée un événement. */
  create(data: Prisma.EventUncheckedCreateInput): Promise<Event> {
    return this.prisma.event.create({ data });
  }

  /** Récupère un événement avec ses médias (ou `null`). */
  findByIdWithMedia(id: string): Promise<EventWithMedia | null> {
    return this.prisma.event.findUnique({ where: { id }, include: { media: true } });
  }

  /** Récupère un événement avec ses médias et son entreprise (ou `null`). */
  findByIdWithMediaAndCompany(id: string): Promise<EventWithMediaAndCompany | null> {
    return this.prisma.event.findUnique({
      where: { id },
      include: { media: true, company: true },
    });
  }

  /** Récupère un événement avec son entreprise (ou `null`). */
  findByIdWithCompany(id: string): Promise<EventWithCompany | null> {
    return this.prisma.event.findUnique({ where: { id }, include: { company: true } });
  }

  /** Récupère tous les événements (médias + entreprise), du plus récent au plus ancien. */
  findAll(): Promise<EventWithMediaAndCompany[]> {
    return this.prisma.event.findMany({
      include: { media: true, company: true },
      orderBy: { date: 'desc' },
    });
  }

  /** Récupère les événements correspondant à un filtre Prisma. */
  findMany(where: Prisma.EventWhereInput): Promise<EventWithMediaAndCompany[]> {
    return this.prisma.event.findMany({
      where,
      include: { media: true, company: true },
      orderBy: { date: 'desc' },
    });
  }

  /** Récupère les événements appartenant aux entreprises d'un propriétaire. */
  findByOwner(userId: string): Promise<EventWithMedia[]> {
    return this.prisma.event.findMany({
      where: { company: { ownerId: userId } },
      include: { media: true },
      orderBy: { date: 'desc' },
    });
  }

  /** Met à jour un événement (médias inclus dans le retour). */
  update(id: string, data: Prisma.EventUpdateInput): Promise<EventWithMedia> {
    return this.prisma.event.update({
      where: { id },
      data,
      include: { media: true },
    });
  }

  /** Supprime un événement. */
  delete(id: string): Promise<Event> {
    return this.prisma.event.delete({ where: { id } });
  }
}
