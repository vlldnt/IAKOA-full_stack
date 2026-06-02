import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, JwtFromRequestFunction } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ACCESS_TOKEN_COOKIE } from '../utils/auth-cookies';

/**
 * Extrait l'access token depuis le cookie HttpOnly.
 *
 * Paramètres : `req` — requête Express.
 * Retour : le token présent dans le cookie, ou `null`.
 * Pourquoi : permettre l'authentification par cookie sécurisé (protection XSS)
 * tout en conservant le repli sur l'en-tête `Authorization` (Swagger, clients).
 */
const cookieExtractor: JwtFromRequestFunction = (req: Request): string | null => {
  return req?.cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'votre-secret-super-securise-a-changer',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
