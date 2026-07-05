import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/place.dto';

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(city?: string) {
    const where: Prisma.PlaceWhereInput = city
      ? { city: { contains: city, mode: 'insensitive' } }
      : {};
    return this.prisma.place.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { events: true } } },
    });
  }

  async findOne(id: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: { _count: { select: { events: true } } },
    });
    if (!place) {
      throw new NotFoundException(`Lieu ${id} non trouvé.`);
    }
    return place;
  }

  async create(dto: CreatePlaceDto) {
    return this.prisma.place.create({ data: dto });
  }

  async update(id: string, dto: UpdatePlaceDto) {
    try {
      return await this.prisma.place.update({ where: { id }, data: dto });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException(`Lieu ${id} non trouvé.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Les événements liés perdent leur référence (SetNull), ils ne sont pas supprimés
      await this.prisma.place.delete({ where: { id } });
      return { message: 'Lieu supprimé.' };
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException(`Lieu ${id} non trouvé.`);
      }
      throw error;
    }
  }
}
