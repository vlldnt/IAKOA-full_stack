import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    // Placeholder si les identifiants manquent : l'app démarre en dev sans
    // clés OAuth (le flux Google échouera côté Google, le reste fonctionne).
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'google-client-id-manquant',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret-manquant',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
    if (!process.env.GOOGLE_CLIENT_ID) {
      new Logger(GoogleStrategy.name).warn(
        'GOOGLE_CLIENT_ID absent : la connexion Google est désactivée.',
      );
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = await this.authService.validateOAuthUser({
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      name: name.givenName + (name.familyName ? ' ' + name.familyName : ''),
      avatar: photos && photos[0] ? photos[0].value : undefined,
    });

    done(null, user);
  }
}
