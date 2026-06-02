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
import { Throttle } from '@nestjs/throttler';
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
import { setAuthCookies, clearAuthCookies } from './utils/auth-cookies';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
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
  async register(
    @Body(ValidationPipe) registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerUserDto);
    setAuthCookies(res, result);
    return result;
  }

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
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
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginUserDto);
    setAuthCookies(res, result);
    return result;
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
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
  async refreshTokens(
    @GetUser() user: UserResponseDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(user.id);
    setAuthCookies(res, tokens);
    return tokens;
  }

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
  async logout(
    @GetUser() user: UserResponseDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(user.id);
    clearAuthCookies(res);
    return result;
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Initier l\'authentification Google',
    description: 'Redirige vers la page de connexion Google',
  })
  @ApiResponse({ status: 302, description: 'Redirection vers Google' })
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Callback OAuth Google',
    description: 'Traite la réponse de Google et connecte l\'utilisateur',
  })
  @ApiResponse({ status: 200, description: 'Authentification réussie' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.loginOAuth(req.user);

    // Déposer les tokens dans des cookies HttpOnly puis rediriger (sans exposer
    // les tokens dans l'URL, ce qui éviterait leur fuite via l'historique/logs).
    setAuthCookies(res, result);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback`);
  }

  @Get('facebook')
  @UseGuards(FacebookOAuthGuard)
  @ApiOperation({
    summary: 'Initier l\'authentification Facebook',
    description: 'Redirige vers la page de connexion Facebook',
  })
  @ApiResponse({ status: 302, description: 'Redirection vers Facebook' })
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(FacebookOAuthGuard)
  @ApiOperation({
    summary: 'Callback OAuth Facebook',
    description: 'Traite la réponse de Facebook et connecte l\'utilisateur',
  })
  @ApiResponse({ status: 200, description: 'Authentification réussie' })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.loginOAuth(req.user);

    // Déposer les tokens dans des cookies HttpOnly puis rediriger (sans exposer
    // les tokens dans l'URL, ce qui éviterait leur fuite via l'historique/logs).
    setAuthCookies(res, result);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback`);
  }
}
