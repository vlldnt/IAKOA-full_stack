import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VerificationTokenType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { requireEnv } from '../config/env';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '30d';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 heure
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async register(registerUserDto: RegisterUserDto, userAgent?: string) {
    // Créer l'utilisateur avec isCreator défini à false par défaut
    const user = await this.usersService.create({
      ...registerUserDto,
      isCreator: false,
    });
    const tokens = await this.createSession(user.id, user.email, userAgent);

    // Best-effort : un échec de l'email de vérification ne bloque pas l'inscription
    try {
      await this.sendEmailVerification(user.id);
    } catch {
      // ignoré volontairement
    }

    return {
      user,
      ...tokens,
    };
  }

  async login(loginUserDto: LoginUserDto, userAgent?: string) {
    const user = await this.usersService.validateUser(loginUserDto);
    const tokens = await this.createSession(user.id, user.email, userAgent);

    return {
      user,
      ...tokens,
    };
  }

  async loginOAuth(user: any, userAgent?: string) {
    const tokens = await this.createSession(user.id, user.email, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        isCreator: user.isCreator,
        role: user.role,
      },
      ...tokens,
    };
  }

  /**
   * Crée une session (un enregistrement par appareil) et émet la paire de tokens.
   */
  private async createSession(
    userId: string,
    email: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const sessionId = randomUUID();
    const tokens = await this.generateTokens(userId, email, sessionId);

    await this.prisma.refreshSession.create({
      data: {
        id: sessionId,
        tokenHash: this.hashToken(tokens.refresh_token),
        userAgent: userAgent?.slice(0, 255),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        userId,
      },
    });

    return tokens;
  }

  /**
   * Rotation : émet une nouvelle paire de tokens et remplace le hash de la session.
   * L'ancien refresh token devient immédiatement invalide.
   */
  async refreshTokens(userId: string, sessionId: string): Promise<AuthTokens> {
    const user = await this.usersService.findOne(userId);
    const tokens = await this.generateTokens(user.id, user.email, sessionId);

    await this.prisma.refreshSession.update({
      where: { id: sessionId },
      data: {
        tokenHash: this.hashToken(tokens.refresh_token),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return tokens;
  }

  /**
   * Déconnexion de la session courante uniquement (les autres appareils restent connectés).
   */
  async logout(sessionId: string | undefined) {
    if (sessionId) {
      await this.prisma.refreshSession.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { message: 'Déconnexion réussie' };
  }

  /**
   * Sessions actives de l'utilisateur (une par appareil connecté).
   * `isCurrent` marque la session utilisée pour cette requête.
   */
  async listSessions(userId: string, currentSessionId?: string) {
    const sessions = await this.prisma.refreshSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, userAgent: true, createdAt: true, updatedAt: true },
    });
    return sessions.map(session => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));
  }

  /**
   * Révoque une session précise de l'utilisateur (déconnexion à distance
   * d'un appareil). Le filtre sur userId empêche de toucher aux sessions
   * d'un autre compte.
   */
  async revokeSession(userId: string, sessionId: string) {
    const result = await this.prisma.refreshSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) {
      throw new NotFoundException('Session non trouvée ou déjà déconnectée.');
    }
    return { message: 'Session déconnectée.' };
  }

  /**
   * Valide un refresh token présenté :
   * - session inexistante, révoquée ou expirée → refus
   * - hash différent (token déjà roté) → réutilisation détectée → révocation
   *   de toutes les sessions de l'utilisateur (vol probable)
   */
  async validateRefreshToken(userId: string, sessionId: string, refreshToken: string) {
    const session = await this.prisma.refreshSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Accès refusé');
    }

    if (session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Accès refusé');
    }

    if (session.tokenHash !== this.hashToken(refreshToken)) {
      // Réutilisation d'un token déjà roté : on révoque tout par précaution.
      await this.prisma.refreshSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Accès refusé');
    }

    return this.usersService.findOne(userId);
  }

  private async generateTokens(
    userId: string,
    email: string,
    sessionId: string,
  ): Promise<AuthTokens> {
    // jti : garantit l'unicité de chaque token, même signés dans la même
    // seconde (sinon payload + iat identiques → tokens identiques, et la
    // rotation deviendrait un no-op)
    const payload = { sub: userId, email, sid: sessionId, jti: randomUUID() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: requireEnv('JWT_SECRET'),
        expiresIn: ACCESS_TOKEN_TTL,
      }),
      this.jwtService.signAsync(payload, {
        secret: requireEnv('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_TTL,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // SHA-256 (et non bcrypt) : déterministe, permet la recherche par hash,
  // et ne tronque pas les entrées longues comme les JWT (limite bcrypt : 72 octets).
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Demande de réinitialisation de mot de passe.
   * Répond toujours pareil, que l'email existe ou non (anti-énumération).
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const message = 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.';

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message };
    }

    const token = await this.issueVerificationToken(
      user.id,
      VerificationTokenType.PASSWORD_RESET,
      PASSWORD_RESET_TTL_MS,
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    void this.mailService.sendPasswordReset(
      user.email,
      user.name,
      `${frontendUrl}/reset-password?token=${token}`,
    );

    return { message };
  }

  /**
   * Réinitialisation effective : consomme le token, change le mot de passe
   * et révoque toutes les sessions (un mot de passe compromis implique
   * que les sessions actives le sont peut-être aussi).
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const verification = await this.consumeVerificationToken(
      token,
      VerificationTokenType.PASSWORD_RESET,
    );

    const hashedPassword = await bcrypt.hash(password, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.verificationToken.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshSession.updateMany({
        where: { userId: verification.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' };
  }

  /**
   * Envoie (ou renvoie) l'email de vérification d'adresse.
   */
  async sendEmailVerification(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }
    if (user.emailVerifiedAt) {
      return { message: 'Email déjà vérifié.' };
    }

    const token = await this.issueVerificationToken(
      user.id,
      VerificationTokenType.EMAIL_VERIFICATION,
      EMAIL_VERIFICATION_TTL_MS,
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    void this.mailService.sendEmailVerification(
      user.email,
      user.name,
      `${frontendUrl}/verify-email?token=${token}`,
    );

    return { message: 'Email de vérification envoyé.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const verification = await this.consumeVerificationToken(
      token,
      VerificationTokenType.EMAIL_VERIFICATION,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.verificationToken.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email vérifié avec succès.' };
  }

  /**
   * Émet un token à usage unique : le token en clair part dans l'email,
   * seul son hash est stocké. Les anciens tokens du même type sont invalidés.
   */
  private async issueVerificationToken(
    userId: string,
    type: VerificationTokenType,
    ttlMs: number,
  ): Promise<string> {
    const token = randomBytes(32).toString('hex');

    await this.prisma.$transaction([
      this.prisma.verificationToken.deleteMany({
        where: { userId, type, usedAt: null },
      }),
      this.prisma.verificationToken.create({
        data: {
          tokenHash: this.hashToken(token),
          type,
          expiresAt: new Date(Date.now() + ttlMs),
          userId,
        },
      }),
    ]);

    return token;
  }

  private async consumeVerificationToken(token: string, type: VerificationTokenType) {
    const verification = await this.prisma.verificationToken.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });

    if (
      !verification ||
      verification.type !== type ||
      verification.usedAt ||
      verification.expiresAt < new Date()
    ) {
      throw new BadRequestException('Lien invalide ou expiré. Refaites une demande.');
    }

    return verification;
  }

  async validateUserById(userId: string) {
    return this.usersService.findOne(userId);
  }

  async validateOAuthUser(oauthData: {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    // 1. Chercher l'utilisateur par provider et providerId
    const existingByProvider = await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: oauthData.provider,
          providerId: oauthData.providerId,
        },
      },
    });

    if (existingByProvider) {
      // Mettre à jour l'avatar si fourni (au cas où il a changé)
      if (oauthData.avatar && existingByProvider.avatar !== oauthData.avatar) {
        return this.prisma.user.update({
          where: { id: existingByProvider.id },
          data: { avatar: oauthData.avatar },
        });
      }
      return existingByProvider;
    }

    // 2. Account-linking : un compte existe déjà avec cet email (local ou autre
    // provider) → on lui rattache ce provider au lieu de créer un doublon.
    // Le mot de passe éventuel est conservé : les deux modes de connexion coexistent.
    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: oauthData.email },
    });

    if (existingByEmail) {
      return this.prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          avatar: existingByEmail.avatar ?? oauthData.avatar,
        },
      });
    }

    // 3. Aucun compte : création
    return this.prisma.user.create({
      data: {
        provider: oauthData.provider,
        providerId: oauthData.providerId,
        email: oauthData.email,
        name: oauthData.name,
        avatar: oauthData.avatar,
        // Pas de password pour les utilisateurs OAuth
        isCreator: false,
      },
    });
  }
}
