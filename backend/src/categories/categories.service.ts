import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, UpdateCategoryGroupDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Catalogue public : groupes ordonnés avec leurs catégories actives.
   */
  async findAllGrouped() {
    return this.prisma.categoryGroup.findMany({
      orderBy: { position: 'asc' },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { label: 'asc' },
          select: { id: true, slug: true, label: true, color: true },
        },
      },
    });
  }

  /**
   * Vue admin : toutes les catégories, y compris inactives, avec compteur d'usage.
   */
  async findAllAdmin() {
    return this.prisma.category.findMany({
      orderBy: [{ group: { position: 'asc' } }, { label: 'asc' }],
      include: {
        group: { select: { id: true, slug: true, label: true } },
        _count: { select: { events: true } },
      },
    });
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({ data: dto });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException(`Une catégorie avec le slug ${dto.slug} existe déjà.`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    try {
      return await this.prisma.category.update({ where: { id }, data: dto });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'P2025') {
        throw new NotFoundException(`Catégorie ${id} non trouvée.`);
      }
      if (code === 'P2002') {
        throw new ConflictException(`Une catégorie avec ce slug existe déjà.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Les liaisons événement↔catégorie sont supprimées en cascade
      await this.prisma.category.delete({ where: { id } });
      return { message: 'Catégorie supprimée.' };
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException(`Catégorie ${id} non trouvée.`);
      }
      throw error;
    }
  }

  async updateGroup(id: string, dto: UpdateCategoryGroupDto) {
    try {
      return await this.prisma.categoryGroup.update({ where: { id }, data: dto });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        throw new NotFoundException(`Groupe ${id} non trouvé.`);
      }
      throw error;
    }
  }
}
