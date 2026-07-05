import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { VerificationTokenType } from '@prisma/client';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

// Extrait le payload d'un JWT sans vérifier la signature (usage test uniquement)
function decodeJwt(token: string): { sub: string; sid: string; email: string } {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
}

// Extrait le token d'une URL de type https://…?token=xxx
function tokenFromUrl(url: string): string {
  return new URL(url).searchParams.get('token') ?? '';
}

describe('AuthService (sessions, rotation, reset)', () => {
  let authService: AuthService;
  let mailService: MailService;
  let prisma: PrismaService;

  const testUser = {
    name: 'Test User',
    email: 'auth-test@example.com',
    password: 'Password123!',
  };

  async function clearAll() {
    // Supprimer les users cascade sessions et tokens de vérification
    await prisma.user.deleteMany({});
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [AuthService, UsersService, PrismaService, MailService],
    }).compile();

    authService = module.get(AuthService);
    mailService = module.get(MailService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await clearAll();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await clearAll();
    await prisma.$disconnect();
  });

  describe('register', () => {
    it('crée un utilisateur, une session et retourne les tokens', async () => {
      const result = await authService.register({ ...testUser }, 'jest-agent');

      expect(result.user.email).toBe(testUser.email);
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();

      const sessions = await prisma.refreshSession.findMany({
        where: { userId: result.user.id },
      });
      expect(sessions).toHaveLength(1);
      expect(sessions[0].userAgent).toBe('jest-agent');
      expect(sessions[0].revokedAt).toBeNull();
      // Le refresh token n'est jamais stocké en clair
      expect(sessions[0].tokenHash).not.toBe(result.refresh_token);
    });
  });

  describe('login multi-appareils', () => {
    it('crée une session par appareil sans invalider les autres', async () => {
      const { user } = await authService.register({ ...testUser });

      const phone = await authService.login({ ...testUser }, 'iphone');
      const laptop = await authService.login({ ...testUser }, 'macbook');

      const sessions = await prisma.refreshSession.findMany({ where: { userId: user.id } });
      expect(sessions).toHaveLength(3); // register + 2 logins

      // Les deux refresh tokens restent valides indépendamment
      const phonePayload = decodeJwt(phone.refresh_token);
      const laptopPayload = decodeJwt(laptop.refresh_token);
      await expect(
        authService.validateRefreshToken(user.id, phonePayload.sid, phone.refresh_token),
      ).resolves.toBeDefined();
      await expect(
        authService.validateRefreshToken(user.id, laptopPayload.sid, laptop.refresh_token),
      ).resolves.toBeDefined();
    });

    it('refuse un mauvais mot de passe', async () => {
      await authService.register({ ...testUser });
      await expect(
        authService.login({ email: testUser.email, password: 'WrongPassword123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('rotation du refresh token', () => {
    it('invalide l’ancien token après rotation', async () => {
      const { user, refresh_token: oldToken } = await authService.register({ ...testUser });
      const { sid } = decodeJwt(oldToken);

      // Rotation : nouveau token émis pour la même session
      const rotated = await authService.refreshTokens(user.id, sid);
      expect(rotated.refresh_token).not.toBe(oldToken);

      // Le nouveau token est accepté
      await expect(
        authService.validateRefreshToken(user.id, sid, rotated.refresh_token),
      ).resolves.toBeDefined();

      // L'ancien token est refusé (déjà roté)
      await expect(authService.validateRefreshToken(user.id, sid, oldToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('révoque toutes les sessions si un token roté est réutilisé (vol détecté)', async () => {
      const first = await authService.register({ ...testUser }, 'appareil-1');
      const second = await authService.login({ ...testUser }, 'appareil-2');
      const { sid: sid1 } = decodeJwt(first.refresh_token);
      const { sid: sid2 } = decodeJwt(second.refresh_token);

      const rotated = await authService.refreshTokens(first.user.id, sid1);

      // Réutilisation de l'ancien token → détection de vol
      await expect(
        authService.validateRefreshToken(first.user.id, sid1, first.refresh_token),
      ).rejects.toThrow(UnauthorizedException);

      // TOUTES les sessions sont révoquées, y compris le token roté et l'appareil 2
      await expect(
        authService.validateRefreshToken(first.user.id, sid1, rotated.refresh_token),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.validateRefreshToken(first.user.id, sid2, second.refresh_token),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('révoque uniquement la session courante', async () => {
      const phone = await authService.register({ ...testUser }, 'iphone');
      const laptop = await authService.login({ ...testUser }, 'macbook');
      const { sid: phoneSid } = decodeJwt(phone.refresh_token);
      const { sid: laptopSid } = decodeJwt(laptop.refresh_token);

      await authService.logout(phoneSid);

      await expect(
        authService.validateRefreshToken(phone.user.id, phoneSid, phone.refresh_token),
      ).rejects.toThrow(UnauthorizedException);
      // L'autre appareil reste connecté
      await expect(
        authService.validateRefreshToken(phone.user.id, laptopSid, laptop.refresh_token),
      ).resolves.toBeDefined();
    });
  });

  describe('réinitialisation de mot de passe', () => {
    it('répond de façon identique que l’email existe ou non (anti-énumération)', async () => {
      const unknown = await authService.requestPasswordReset('inconnu@example.com');
      await authService.register({ ...testUser });
      const known = await authService.requestPasswordReset(testUser.email);
      expect(unknown.message).toBe(known.message);
    });

    it('change le mot de passe, révoque les sessions et consomme le token', async () => {
      const spy = jest.spyOn(mailService, 'sendPasswordReset').mockResolvedValue(undefined);

      const { user, refresh_token } = await authService.register({ ...testUser });
      const { sid } = decodeJwt(refresh_token);

      await authService.requestPasswordReset(testUser.email);
      const resetUrl = spy.mock.calls[0][2];
      const rawToken = tokenFromUrl(resetUrl);
      expect(rawToken).toHaveLength(64);

      await authService.resetPassword(rawToken, 'NewPassword456!');

      // Ancien mot de passe refusé, nouveau accepté
      await expect(authService.login({ ...testUser })).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.login({ email: testUser.email, password: 'NewPassword456!' }),
      ).resolves.toBeDefined();

      // Toutes les sessions antérieures sont révoquées
      await expect(authService.validateRefreshToken(user.id, sid, refresh_token)).rejects.toThrow(
        UnauthorizedException,
      );

      // Le token est à usage unique
      await expect(authService.resetPassword(rawToken, 'Another789!')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('vérification d’email', () => {
    it('marque l’email vérifié et consomme le token', async () => {
      const spy = jest.spyOn(mailService, 'sendEmailVerification').mockResolvedValue(undefined);

      const { user } = await authService.register({ ...testUser });
      await authService.sendEmailVerification(user.id);

      const verifyUrl = spy.mock.calls[spy.mock.calls.length - 1][2];
      const rawToken = tokenFromUrl(verifyUrl);

      await authService.verifyEmail(rawToken);

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated?.emailVerifiedAt).toBeInstanceOf(Date);

      // Token à usage unique
      await expect(authService.verifyEmail(rawToken)).rejects.toThrow(BadRequestException);
    });

    it('stocke uniquement le hash du token', async () => {
      jest.spyOn(mailService, 'sendEmailVerification').mockResolvedValue(undefined);
      const { user } = await authService.register({ ...testUser });
      await authService.sendEmailVerification(user.id);

      const tokens = await prisma.verificationToken.findMany({
        where: { userId: user.id, type: VerificationTokenType.EMAIL_VERIFICATION },
      });
      expect(tokens).toHaveLength(1);
      expect(tokens[0].tokenHash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
    });
  });
});
