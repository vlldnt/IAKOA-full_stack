import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Repository d'authentification.
 *
 * Description : isole les accès Prisma à la table `user` spécifiques à
 * l'authentification (refresh token, comptes OAuth).
 * Pourquoi : éviter que le service d'authentification manipule Prisma
 * directement et centraliser ces requêtes sensibles.
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Met à jour le refresh token (haché) d'un utilisateur.
   *
   * Paramètres : `userId` — utilisateur ; `hashedToken` — token haché ou `null`
   * pour invalider la session (déconnexion).
   * Retour : l'utilisateur mis à jour.
   */
  setRefreshToken(userId: string, hashedToken: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  /** Récupère un utilisateur par son identifiant (ou `null`). */
  findById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  /** Récupère un utilisateur par couple (fournisseur OAuth, identifiant). */
  findByProvider(provider: string, providerId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { provider_providerId: { provider, providerId } },
    });
  }

  /** Crée un utilisateur issu d'une authentification OAuth. */
  createOAuthUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /** Met à jour l'avatar d'un utilisateur. */
  updateAvatar(userId: string, avatar: string): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data: { avatar } });
  }
}
