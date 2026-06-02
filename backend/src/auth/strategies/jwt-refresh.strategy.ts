import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, JwtFromRequestFunction } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { REFRESH_TOKEN_COOKIE } from '../utils/auth-cookies';

/**
 * Extrait le refresh token depuis le cookie HttpOnly.
 *
 * Paramètres : `req` — requête Express.
 * Retour : le refresh token présent dans le cookie, ou `null`.
 * Pourquoi : authentifier le rafraîchissement via cookie sécurisé, avec repli
 * sur l'en-tête `Authorization` pour la compatibilité.
 */
const refreshCookieExtractor: JwtFromRequestFunction = (req: Request): string | null => {
  return req?.cookies?.[REFRESH_TOKEN_COOKIE] ?? null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        refreshCookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'votre-refresh-secret-super-securise',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    // Récupère le refresh token brut (cookie prioritaire, sinon en-tête Bearer).
    const refreshToken =
      req?.cookies?.[REFRESH_TOKEN_COOKIE] ??
      req.get('Authorization')?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    const user = await this.authService.validateRefreshToken(payload.sub, refreshToken);

    if (!user) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    return user;
  }
}
