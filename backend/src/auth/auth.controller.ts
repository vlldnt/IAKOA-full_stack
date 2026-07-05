import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
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
import { ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/password-reset.dto';
import { setAuthCookies, clearAuthCookies } from './cookies';

type AuthenticatedUser = UserResponseDto & { sessionId?: string };

// Limite stricte sur les endpoints sensibles (anti brute-force),
// en plus de la limite globale définie dans AppModule.
const STRICT_RATE_LIMIT = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register - Inscription d'un nouvel utilisateur
   *
   * Les tokens sont posés en cookies HttpOnly (web) ET retournés dans le
   * corps de la réponse (clients non-navigateur, future app mobile).
   */
  @Post('register')
  @Throttle(STRICT_RATE_LIMIT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Inscription d'un nouvel utilisateur",
    description:
      'Crée un nouveau compte utilisateur avec email et mot de passe. Pose les tokens en cookies HttpOnly et les retourne dans la réponse.',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives' })
  async register(
    @Body(ValidationPipe) registerUserDto: RegisterUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerUserDto, req.get('user-agent'));
    setAuthCookies(res, result);
    return result;
  }

  /**
   * POST /auth/login - Connexion utilisateur
   */
  @Post('login')
  @Throttle(STRICT_RATE_LIMIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion utilisateur',
    description:
      'Authentifie un utilisateur avec email et mot de passe. Pose les tokens en cookies HttpOnly et les retourne dans la réponse.',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives' })
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginUserDto, req.get('user-agent'));
    setAuthCookies(res, result);
    return result;
  }

  /**
   * POST /auth/refresh - Rafraîchir l'access token (rotation du refresh token)
   */
  @Post('refresh')
  @Throttle(STRICT_RATE_LIMIT)
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Rafraîchir l'access token",
    description:
      "Utilise le refresh token (cookie ou header) pour émettre une nouvelle paire de tokens. L'ancien refresh token est invalidé (rotation).",
  })
  @ApiResponse({ status: 200, description: 'Token rafraîchi avec succès' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  async refreshTokens(
    @GetUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(user.id, user.sessionId!);
    setAuthCookies(res, tokens);
    return tokens;
  }

  /**
   * POST /auth/logout - Déconnexion de la session courante
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Déconnexion utilisateur',
    description:
      'Révoque la session courante (les autres appareils restent connectés) et supprime les cookies.',
  })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  @ApiResponse({ status: 401, description: 'Token invalide' })
  async logout(@GetUser() user: AuthenticatedUser, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.logout(user.sessionId);
    clearAuthCookies(res);
    return result;
  }

  /**
   * GET /auth/sessions - Sessions actives (appareils connectés)
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Lister les sessions actives',
    description:
      "Retourne les appareils connectés de l'utilisateur. La session courante est marquée isCurrent.",
  })
  @ApiResponse({ status: 200, description: 'Liste des sessions actives' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  listSessions(@GetUser() user: AuthenticatedUser) {
    return this.authService.listSessions(user.id, user.sessionId);
  }

  /**
   * DELETE /auth/sessions/:id - Déconnecter un appareil
   */
  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Révoquer une session',
    description:
      "Déconnecte un appareil précis. Seules les sessions de l'utilisateur connecté sont accessibles.",
  })
  @ApiResponse({ status: 200, description: 'Session révoquée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Session non trouvée' })
  revokeSession(@GetUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.authService.revokeSession(user.id, id);
  }

  /**
   * POST /auth/forgot-password - Demander un lien de réinitialisation
   */
  @Post('forgot-password')
  @Throttle(STRICT_RATE_LIMIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demander la réinitialisation du mot de passe',
    description:
      "Envoie un lien de réinitialisation par email si un compte existe. La réponse est identique que l'email existe ou non.",
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Demande enregistrée' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives' })
  forgotPassword(@Body(ValidationPipe) dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  /**
   * POST /auth/reset-password - Réinitialiser le mot de passe
   */
  @Post('reset-password')
  @Throttle(STRICT_RATE_LIMIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Réinitialiser le mot de passe',
    description:
      'Consomme le token reçu par email, change le mot de passe et révoque toutes les sessions actives.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Mot de passe réinitialisé' })
  @ApiResponse({ status: 400, description: 'Lien invalide ou expiré' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives' })
  resetPassword(@Body(ValidationPipe) dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  /**
   * POST /auth/verify-email - Confirmer l'adresse email
   */
  @Post('verify-email')
  @Throttle(STRICT_RATE_LIMIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Confirmer l'adresse email",
    description: "Consomme le token de vérification reçu par email à l'inscription.",
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email vérifié' })
  @ApiResponse({ status: 400, description: 'Lien invalide ou expiré' })
  verifyEmail(@Body(ValidationPipe) dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  /**
   * POST /auth/resend-verification - Renvoyer l'email de vérification
   */
  @Post('resend-verification')
  @Throttle(STRICT_RATE_LIMIT)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Renvoyer l'email de vérification",
    description: "Renvoie l'email de confirmation à l'utilisateur connecté.",
  })
  @ApiResponse({ status: 200, description: 'Email envoyé' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  resendVerification(@GetUser() user: AuthenticatedUser) {
    return this.authService.sendEmailVerification(user.id);
  }

  /**
   * GET /auth/google - Initier l'authentification Google
   */
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: "Initier l'authentification Google",
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
    description: "Traite la réponse de Google et connecte l'utilisateur",
  })
  @ApiResponse({
    status: 302,
    description: 'Authentification réussie, redirection vers le frontend',
  })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.completeOAuthLogin(req, res);
  }

  /**
   * GET /auth/facebook - Initier l'authentification Facebook
   */
  @Get('facebook')
  @UseGuards(FacebookOAuthGuard)
  @ApiOperation({
    summary: "Initier l'authentification Facebook",
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
    description: "Traite la réponse de Facebook et connecte l'utilisateur",
  })
  @ApiResponse({
    status: 302,
    description: 'Authentification réussie, redirection vers le frontend',
  })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.completeOAuthLogin(req, res);
  }

  /**
   * Fin du flux OAuth : les tokens sont posés en cookies HttpOnly puis
   * l'utilisateur est redirigé vers le frontend — jamais de token dans l'URL
   * (historique navigateur, logs du proxy, header Referer).
   */
  private async completeOAuthLogin(req: Request, res: Response) {
    const result = await this.authService.loginOAuth(req.user, req.get('user-agent'));
    setAuthCookies(res, result);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback`);
  }
}
