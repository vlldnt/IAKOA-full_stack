import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { FilterEventsDto } from './dto/filter-events.dto';
import { EventStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MediaService } from 'src/media/media.service';

// Relations chargées avec chaque événement retourné par l'API
const EVENT_INCLUDE = { media: true, company: true, categories: true } as const;

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    companyId: string,
    userId: string,
  ): Promise<EventResponseDto> {
    // Vérifier que la company existe et que l'utilisateur en est le propriétaire
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Entreprise avec l'ID ${companyId} non trouvée.`);
    }

    if (company.ownerId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez créer un événement que pour une entreprise dont vous êtes propriétaire.',
      );
    }

    try {
      // Créer l'événement (soumis à modération : statut PENDING)
      const event = await this.prisma.event.create({
        data: {
          name: createEventDto.name,
          date: createEventDto.date,
          description: createEventDto.description,
          pricing: createEventDto.pricing,
          location: createEventDto.location
            ? JSON.parse(JSON.stringify(createEventDto.location))
            : undefined,
          companyId: companyId,
          website: createEventDto.website,
          status: EventStatus.PENDING,
          categories: this.connectCategories(createEventDto.categories),
        },
      });

      // Créer les médias si présents
      if (createEventDto.media && createEventDto.media.length > 0) {
        await this.mediaService.createMany(createEventDto.media, event.id);
      }

      // Récupérer l'événement complet
      const eventWithRelations = await this.prisma.event.findUnique({
        where: { id: event.id },
        include: EVENT_INCLUDE,
      });

      if (!eventWithRelations) {
        throw new InternalServerErrorException('Événement introuvable après création.');
      }

      return new EventResponseDto(eventWithRelations);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(`Un événement avec ce nom ${createEventDto.name} existe déjà.`);
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('Une des catégories fournies est inconnue.');
      }
      throw new InternalServerErrorException("Erreur lors de la création de l'événement.");
    }
  }

  // Connexion many-to-many par slug (les slugs inconnus font échouer la requête → 400)
  private connectCategories(slugs?: string[]) {
    if (!slugs || slugs.length === 0) return undefined;
    return { connect: slugs.map(slug => ({ slug })) };
  }

  /**
   * Recherche filtrée avec pagination, distance, mot-clé et catégories.
   *
   * Tout le filtrage (y compris la distance) et la pagination s'exécutent
   * en SQL : un pré-filtre par bounding box réduit les candidats, puis la
   * formule de Haversine calcule la distance exacte. Rien n'est chargé en
   * mémoire au-delà de la page demandée.
   */
  async findFiltered(filters: FilterEventsDto) {
    const {
      page = 1,
      limit = 12,
      keyword,
      latitude,
      longitude,
      radius = 5,
      categories,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      isFree,
    } = filters;

    // Seuls les événements publiés sont visibles publiquement
    const conditions: Prisma.Sql[] = [Prisma.sql`e.status = 'PUBLISHED'`];

    // Filtre par mot-clé (nom OU description)
    if (keyword && keyword.trim()) {
      const pattern = `%${keyword.trim()}%`;
      conditions.push(Prisma.sql`(e.name ILIKE ${pattern} OR e.description ILIKE ${pattern})`);
    }

    // Filtre par catégories via la table de jointure (slugs inconnus sans effet)
    if (categories) {
      const categoryList = categories
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
      if (categoryList.length > 0) {
        conditions.push(Prisma.sql`EXISTS (
          SELECT 1 FROM "_CategoryToEvent" j
          JOIN categories c ON c.id = j."A"
          WHERE j."B" = e.id AND c.slug IN (${Prisma.join(categoryList)})
        )`);
      }
    }

    // Filtre par date
    if (dateFrom) {
      conditions.push(Prisma.sql`e.date >= ${new Date(dateFrom)}`);
    }
    if (dateTo) {
      conditions.push(Prisma.sql`e.date <= ${new Date(dateTo)}`);
    }

    // Filtre par prix
    if (isFree) {
      conditions.push(Prisma.sql`e.pricing = 0`);
    } else {
      if (priceMin !== undefined) {
        conditions.push(Prisma.sql`e.pricing >= ${priceMin}`);
      }
      if (priceMax !== undefined) {
        conditions.push(Prisma.sql`e.pricing <= ${priceMax}`);
      }
    }

    // Filtre par distance : bounding box (rapide) puis Haversine (exacte)
    if (latitude !== undefined && longitude !== undefined) {
      const latDelta = radius / 111.32; // ~111,32 km par degré de latitude
      const lngDelta = radius / (111.32 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.01));
      const eventLat = Prisma.sql`(e.location->'coordinates'->>'lat')::float8`;
      const eventLng = Prisma.sql`(e.location->'coordinates'->>'lng')::float8`;

      conditions.push(Prisma.sql`
        e.location->'coordinates'->>'lat' IS NOT NULL
        AND e.location->'coordinates'->>'lng' IS NOT NULL
        AND ${eventLat} BETWEEN ${latitude - latDelta} AND ${latitude + latDelta}
        AND ${eventLng} BETWEEN ${longitude - lngDelta} AND ${longitude + lngDelta}
        AND 6371 * 2 * asin(sqrt(
          pow(sin(radians((${eventLat} - ${latitude}) / 2)), 2)
          + cos(radians(${latitude})) * cos(radians(${eventLat}))
            * pow(sin(radians((${eventLng} - ${longitude}) / 2)), 2)
        )) <= ${radius}
      `);
    }

    const where =
      conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

    const [countRows, idRows] = await Promise.all([
      this.prisma.$queryRaw<{ count: bigint }[]>(
        Prisma.sql`SELECT COUNT(*)::bigint AS count FROM events e ${where}`,
      ),
      this.prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT e.id FROM events e ${where}
        ORDER BY e.date DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `),
    ]);

    const total = Number(countRows[0]?.count ?? 0);
    const ids = idRows.map(row => row.id);

    // Charger les relations uniquement pour la page demandée,
    // en préservant l'ordre du tri SQL
    const events =
      ids.length > 0
        ? await this.prisma.event.findMany({
            where: { id: { in: ids } },
            include: EVENT_INCLUDE,
          })
        : [];
    const eventsById = new Map(events.map(event => [event.id, event]));
    const ordered = ids.flatMap(id => {
      const event = eventsById.get(id);
      return event ? [event] : [];
    });

    return {
      data: ordered.map(event => new EventResponseDto(event)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllByOwner(userId: string): Promise<EventResponseDto[]> {
    // L'organisateur voit tous ses événements, quel que soit leur statut
    const events = await this.prisma.event.findMany({
      where: {
        company: {
          ownerId: userId,
        },
      },
      include: EVENT_INCLUDE,
      orderBy: { date: 'desc' },
    });
    return events.map(event => new EventResponseDto(event));
  }

  /**
   * File de modération (admin) : événements par statut, plus anciens d'abord.
   */
  async findByStatus(status: EventStatus): Promise<EventResponseDto[]> {
    const events = await this.prisma.event.findMany({
      where: { status },
      include: EVENT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
    return events.map(event => new EventResponseDto(event));
  }

  /**
   * Modération (admin) : changer le statut d'un événement,
   * avec motif obligatoire en cas de refus.
   */
  async moderate(
    id: string,
    status: EventStatus,
    moderationNote?: string,
  ): Promise<EventResponseDto> {
    if (status === EventStatus.REJECTED && !moderationNote) {
      throw new BadRequestException('Un motif est requis pour refuser un événement.');
    }

    try {
      const event = await this.prisma.event.update({
        where: { id },
        data: { status, moderationNote: moderationNote ?? null },
        include: EVENT_INCLUDE,
      });
      return new EventResponseDto(event);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Événement avec l'ID ${id} non trouvé.`);
      }
      throw error;
    }
  }

  async findOnePublic(id: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: EVENT_INCLUDE,
    });

    // Un événement non publié n'existe pas pour le public
    if (!event || event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé.`);
    }

    return new EventResponseDto(event);
  }

  async findOne(id: string, userId: string, userRole: Role): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: EVENT_INCLUDE,
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé.`);
    }

    // Vérifier que l'utilisateur est propriétaire de la company (sauf admin)
    if (userRole !== Role.ADMIN && event.company.ownerId !== userId) {
      throw new ForbiddenException("Vous n'avez pas accès à cet événement.");
    }

    return new EventResponseDto(event);
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
    userRole: Role,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé.`);
    }

    // Vérifier que l'utilisateur est propriétaire de la company (sauf admin)
    if (userRole !== Role.ADMIN && event.company.ownerId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à modifier cet événement.");
    }

    try {
      const updatedEvent = await this.prisma.event.update({
        where: { id },
        data: {
          name: updateEventDto.name ?? undefined,
          date: updateEventDto.date ?? undefined,
          description: updateEventDto.description ?? undefined,
          pricing: updateEventDto.pricing ?? undefined,
          location: updateEventDto.location
            ? JSON.parse(JSON.stringify(updateEventDto.location))
            : undefined,
          website: updateEventDto.website ?? undefined,
          categories: updateEventDto.categories
            ? { set: [], connect: updateEventDto.categories.map(slug => ({ slug })) }
            : undefined,
          // Un événement refusé puis corrigé repart en modération
          status: event.status === EventStatus.REJECTED ? EventStatus.PENDING : undefined,
        },
        include: EVENT_INCLUDE,
      });

      return new EventResponseDto(updatedEvent);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Un événement avec ce nom existe déjà.`);
      }
      if (error.code === 'P2025') {
        throw new BadRequestException(
          'Événement introuvable ou une des catégories fournies est inconnue.',
        );
      }
      throw new InternalServerErrorException("Erreur lors de la mise à jour de l'événement.");
    }
  }

  async remove(id: string, userId: string, userRole: Role): Promise<{ message: string }> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé.`);
    }

    // Vérifier que l'utilisateur est propriétaire de la company (sauf admin)
    if (userRole !== Role.ADMIN && event.company.ownerId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à supprimer cet événement.");
    }

    try {
      await this.prisma.event.delete({
        where: { id },
      });

      return { message: `Événement ${event.name} supprimé avec succès.` };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Événement avec l'ID ${id} non trouvé.`);
      }
      throw new InternalServerErrorException("Erreur lors de la suppression de l'événement.");
    }
  }
}
