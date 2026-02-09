import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { FacebookOAuthGuard } from './guards/facebook-oauth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register - Inscription d'un nouvel utilisateur
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Inscription d'un nouvel utilisateur",
    description:
      'Crée un nouveau compte utilisateur avec email et mot de passe. Retourne les tokens JWT. Le rôle et le statut de créateur sont définis automatiquement.',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/UserResponseDto' },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  register(@Body(ValidationPipe) registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  /**
   * POST /auth/login - Connexion utilisateur
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion utilisateur',
    description: 'Authentifie un utilisateur avec email et mot de passe. Retourne les tokens JWT.',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/UserResponseDto' },
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  login(@Body(ValidationPipe) loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  /**
   * POST /auth/refresh - Rafraîchir l'access token
   */
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Rafraîchir l'access token",
    description: 'Utilise le refresh token pour obtenir un nouvel access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token rafraîchi avec succès',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  refreshTokens(@GetUser() user: UserResponseDto) {
    return this.authService.refreshTokens(user.id);
  }

  /**
   * POST /auth/logout - Déconnexion utilisateur
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Déconnexion utilisateur',
    description: "Invalide le refresh token de l'utilisateur.",
  })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  @ApiResponse({ status: 401, description: 'Token invalide' })
  logout(@GetUser() user: UserResponseDto) {
    return this.authService.logout(user.id);
  }

  /**
   * GET /auth/google - Initier l'authentification Google
   */
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Initier l\'authentification Google',
    description: 'Redirige vers la page de connexion Google',
  })
  @ApiResponse({ status: 302, description: 'Redirection vers Google' })
  async googleAuth() {
    // La redirection est gérée automatiquement par le guard
  }

  /**
   * GET /auth/google/callback - Callback OAuth Google
   */
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Callback OAuth Google',
    description: 'Traite la réponse de Google et connecte l\'utilisateur',
  })
  @ApiResponse({ status: 200, description: 'Authentification réussie' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.loginOAuth(req.user);

    // Rediriger vers le frontend avec les tokens en query params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}`,
    );
  }

  /**
   * GET /auth/facebook - Initier l'authentification Facebook
   */
  @Get('facebook')
  @UseGuards(FacebookOAuthGuard)
  @ApiOperation({
    summary: 'Initier l\'authentification Facebook',
    description: 'Redirige vers la page de connexion Facebook',
  })
  @ApiResponse({ status: 302, description: 'Redirection vers Facebook' })
  async facebookAuth() {
    // La redirection est gérée automatiquement par le guard
  }

  /**
   * GET /auth/facebook/callback - Callback OAuth Facebook
   */
  @Get('facebook/callback')
  @UseGuards(FacebookOAuthGuard)
  @ApiOperation({
    summary: 'Callback OAuth Facebook',
    description: 'Traite la réponse de Facebook et connecte l\'utilisateur',
  })
  @ApiResponse({ status: 200, description: 'Authentification réussie' })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.loginOAuth(req.user);

    // Rediriger vers le frontend avec les tokens en query params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}`,
    );
  }
}
