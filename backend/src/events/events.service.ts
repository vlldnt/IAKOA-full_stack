import {
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
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MediaService } from 'src/media/media.service';

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
      // Créer l'événement
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
          categories: createEventDto.categories || [],
        },
      });

      // Créer les médias si présents
      if (createEventDto.media && createEventDto.media.length > 0) {
        await this.mediaService.createMany(createEventDto.media, event.id);
      }

      // Récupérer l'événement avec les médias
      const eventWithMedia = await this.prisma.event.findUnique({
        where: { id: event.id },
        include: { media: true },
      });

      if (!eventWithMedia) {
        throw new InternalServerErrorException('Événement introuvable après création.');
      }

      return new EventResponseDto(eventWithMedia);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(`Un événement avec ce nom ${createEventDto.name} existe déjà.`);
      }
      throw new InternalServerErrorException("Erreur lors de la création de l'événement.");
    }
  }

  async findAll(): Promise<EventResponseDto[]> {
    const events = await this.prisma.event.findMany({
      include: { media: true, company: true },
      orderBy: { date: 'desc' },
    });
    return events.map(event => new EventResponseDto(event));
  }

  /**
   * Calcule la distance en km entre deux points (formule de Haversine)
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Recherche filtrée avec pagination, distance, mot-clé et catégories
   */
  async findFiltered(filters: FilterEventsDto) {
    const { page = 1, limit = 12, keyword, latitude, longitude, radius = 5, categories, dateFrom, dateTo, priceMin, priceMax, isFree } = filters;

    // Construire le where Prisma
    const where: Prisma.EventWhereInput = {};

    // Filtre par mot-clé (nom OU description)
    if (keyword && keyword.trim()) {
      where.OR = [
        { name: { contains: keyword.trim(), mode: 'insensitive' } },
        { description: { contains: keyword.trim(), mode: 'insensitive' } },
      ];
    }

    // Filtre par catégories
    if (categories) {
      const categoryList = categories.split(',').map(c => c.trim()).filter(Boolean);
      if (categoryList.length > 0) {
        where.categories = { hasSome: categoryList as any };
      }
    }

    // Filtre par date
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    // Filtre par prix
    if (isFree) {
      where.pricing = 0;
    } else if (priceMin !== undefined || priceMax !== undefined) {
      where.pricing = {};
      if (priceMin !== undefined) {
        where.pricing.gte = priceMin;
      }
      if (priceMax !== undefined) {
        where.pricing.lte = priceMax;
      }
    }

    // Récupérer tous les events qui matchent keyword + catégories
    const allEvents = await this.prisma.event.findMany({
      where,
      include: { media: true, company: true },
      orderBy: { date: 'desc' },
    });

    // Filtrer par distance si lat/lon fournis
    let filteredEvents = allEvents;
    if (latitude !== undefined && longitude !== undefined) {
      filteredEvents = allEvents.filter(event => {
        const location = event.location as any;
        const eventLat = location?.coordinates?.lat;
        const eventLng = location?.coordinates?.lng;
        if (eventLat === undefined || eventLng === undefined) return false;
        const distance = this.haversineDistance(latitude, longitude, eventLat, eventLng);
        return distance <= radius;
      });
    }

    // Pagination
    const total = filteredEvents.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedEvents = filteredEvents.slice(start, start + limit);

    return {
      data: paginatedEvents.map(event => new EventResponseDto(event)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findAllByOwner(userId: string): Promise<EventResponseDto[]> {
    const events = await this.prisma.event.findMany({
      where: {
        company: {
          ownerId: userId,
        },
      },
      include: { media: true },
      orderBy: { date: 'desc' },
    });
    return events.map(event => new EventResponseDto(event));
  }

  async findOnePublic(id: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        media: true,
        company: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé.`);
    }

    return new EventResponseDto(event);
  }

  async findOne(id: string, userId: string, userRole: Role): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        media: true,
        company: true,
      },
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
          categories: updateEventDto.categories ?? undefined,
        },
        include: { media: true },
      });

      return new EventResponseDto(updatedEvent);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Un événement avec ce nom existe déjà.`);
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Événement avec l'ID ${id} non trouvé.`);
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
