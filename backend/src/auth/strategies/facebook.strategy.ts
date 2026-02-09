import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback',
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = await this.authService.validateOAuthUser({
      provider: 'facebook',
      providerId: id,
      email: emails && emails[0] ? emails[0].value : `facebook_${id}@oauth.local`,
      name: name ? (name.givenName + (name.familyName ? ' ' + name.familyName : '')) : 'Facebook User',
      avatar: photos && photos[0] ? photos[0].value : undefined,
    });

    done(null, user);
  }
}
