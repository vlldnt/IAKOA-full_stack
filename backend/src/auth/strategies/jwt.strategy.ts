import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { requireEnv } from '../../config/env';
import { ACCESS_TOKEN_COOKIE } from '../cookies';

// Cookie HttpOnly en priorité (web), header Bearer en secours (future app mobile)
export function accessTokenExtractor(req: Request): string | null {
  return (
    (req?.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined) ??
    ExtractJwt.fromAuthHeaderAsBearerToken()(req)
  );
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: accessTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    // sessionId permet la déconnexion de la session courante uniquement
    return { ...user, sessionId: payload.sid as string | undefined };
  }
}
