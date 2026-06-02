import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './repositories/auth.repository';

/** Nombre de tours de salage bcrypt pour le hachage des refresh tokens. */
const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private authRepository: AuthRepository,
  ) {}

  /** Indique si l'erreur Prisma est un enregistrement absent (P2025). */
  private isRecordNotFoundError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
  }

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.usersService.create({
      ...registerUserDto,
      isCreator: false,
    });
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(loginUserDto);
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      user,
      ...tokens,
    };
  }

  async refreshTokens(userId: string) {
    const user = await this.usersService.findOne(userId);
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: string) {
    try {
      await this.authRepository.setRefreshToken(userId, null);

      return { message: 'Déconnexion réussie' };
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }
      throw error;
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'votre-secret-super-securise-a-changer',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'votre-refresh-secret-super-securise',
        expiresIn: '30d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

    try {
      await this.authRepository.setRefreshToken(userId, hashedRefreshToken);
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }
      throw error;
    }
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    try {
      const user = await this.authRepository.findById(userId);

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Accès refusé');
      }

      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Accès refusé');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Accès refusé');
    }
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
    try {
      let user = await this.authRepository.findByProvider(
        oauthData.provider,
        oauthData.providerId,
      );

      if (!user) {
        user = await this.authRepository.createOAuthUser({
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          email: oauthData.email,
          name: oauthData.name,
          avatar: oauthData.avatar,
          isCreator: false,
        });
      } else if (oauthData.avatar && user.avatar !== oauthData.avatar) {
        user = await this.authRepository.updateAvatar(user.id, oauthData.avatar);
      }

      return user;
    } catch (error) {
      this.logger.error('[OAuth] validateOAuthUser error', error as Error);
      throw new UnauthorizedException("Erreur lors de l'authentification OAuth");
    }
  }

  async loginOAuth(user: any) {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

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
}
