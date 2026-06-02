import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Repository des utilisateurs.
 *
 * Description : isole tous les accès Prisma à la table `user`. Le service métier
 * ne manipule jamais directement Prisma : il passe par ce repository.
 * Pourquoi : respecter la séparation des responsabilités (Clean Architecture),
 * centraliser les requêtes, et faciliter le remplacement/mock de la couche
 * d'accès aux données dans les tests.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recherche un utilisateur par son email.
   *
   * Paramètres : `email` — email recherché.
   * Retour : l'utilisateur correspondant ou `null`.
   */
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Recherche un utilisateur par son identifiant.
   *
   * Paramètres : `id` — identifiant de l'utilisateur.
   * Retour : l'utilisateur correspondant ou `null`.
   */
  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Récupère tous les utilisateurs, du plus récent au plus ancien.
   *
   * Retour : la liste complète des utilisateurs.
   */
  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /**
   * Crée un utilisateur.
   *
   * Paramètres : `data` — données de création Prisma.
   * Retour : l'utilisateur créé.
   */
  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * Met à jour un utilisateur.
   *
   * Paramètres : `id` — identifiant ; `data` — champs à modifier.
   * Retour : l'utilisateur mis à jour.
   */
  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  /**
   * Supprime un utilisateur.
   *
   * Paramètres : `id` — identifiant de l'utilisateur.
   * Retour : l'utilisateur supprimé.
   */
  delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
