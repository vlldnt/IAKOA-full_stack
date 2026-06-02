import { Injectable } from '@nestjs/common';
import { Company, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Repository des entreprises.
 *
 * Description : isole tous les accès Prisma à la table `company`.
 * Pourquoi : séparer la logique métier (service) de l'accès aux données et
 * centraliser les requêtes pour faciliter tests et évolutions.
 */
@Injectable()
export class CompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Crée une entreprise à partir des données Prisma fournies. */
  create(data: Prisma.CompanyCreateInput): Promise<Company> {
    return this.prisma.company.create({ data });
  }

  /** Récupère toutes les entreprises, de la plus récente à la plus ancienne. */
  findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /** Récupère les entreprises d'un propriétaire donné. */
  findAllByOwner(ownerId: string): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Récupère une entreprise par son identifiant. */
  findById(id: string): Promise<Company | null> {
    return this.prisma.company.findUnique({ where: { id } });
  }

  /** Met à jour une entreprise. */
  update(id: string, data: Prisma.CompanyUpdateInput): Promise<Company> {
    return this.prisma.company.update({ where: { id }, data });
  }

  /** Supprime une entreprise. */
  delete(id: string): Promise<Company> {
    return this.prisma.company.delete({ where: { id } });
  }
}
