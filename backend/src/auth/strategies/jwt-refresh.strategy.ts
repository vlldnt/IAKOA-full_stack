import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { requireEnv } from '../../config/env';
import { REFRESH_TOKEN_COOKIE } from '../cookies';

// Cookie HttpOnly en priorité (web), header Bearer en secours (future app mobile)
export function refreshTokenExtractor(req: Request): string | null {
  return (
    (req?.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined) ??
    ExtractJwt.fromAuthHeaderAsBearerToken()(req)
  );
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: refreshTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: requireEnv('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = refreshTokenExtractor(req);

    if (!refreshToken || !payload.sid) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    const user = await this.authService.validateRefreshToken(
      payload.sub,
      payload.sid,
      refreshToken,
    );

    if (!user) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    // sessionId requis par le contrôleur pour la rotation
    return { ...user, sessionId: payload.sid as string };
  }
}
