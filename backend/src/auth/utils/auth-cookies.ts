import { CookieOptions, Response } from 'express';

/**
 * Nom du cookie contenant l'access token JWT.
 */
export const ACCESS_TOKEN_COOKIE = 'access_token';

/**
 * Nom du cookie contenant le refresh token JWT.
 */
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/** Durée de vie de l'access token (15 minutes, en millisecondes). */
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
/** Durée de vie du refresh token (30 jours, en millisecondes). */
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

/**
 * Construit les options communes des cookies d'authentification.
 *
 * Paramètres : `maxAge` — durée de vie du cookie en millisecondes.
 * Retour : les options de cookie sécurisées.
 * Pourquoi : centraliser la politique de sécurité des cookies (HttpOnly, Secure,
 * SameSite) et la rendre configurable par variables d'environnement pour
 * s'adapter aux déploiements (même domaine vs cross-site).
 */
function buildCookieOptions(maxAge: number): CookieOptions {
  const sameSite = (process.env.COOKIE_SAMESITE as CookieOptions['sameSite']) || 'lax';
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite,
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge,
  };
}

/**
 * Dépose les tokens JWT dans des cookies HttpOnly sur la réponse.
 *
 * Paramètres :
 * - `res` : réponse Express.
 * - `tokens` : access token et refresh token à stocker.
 * Cas d'utilisation : connexion, inscription, rafraîchissement, callback OAuth.
 * Pourquoi : empêcher l'accès aux tokens depuis JavaScript (protection XSS),
 * contrairement au stockage en `localStorage`.
 */
export function setAuthCookies(
  res: Response,
  tokens: { access_token: string; refresh_token: string },
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.access_token, buildCookieOptions(ACCESS_TOKEN_MAX_AGE));
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refresh_token, buildCookieOptions(REFRESH_TOKEN_MAX_AGE));
}

/**
 * Supprime les cookies d'authentification de la réponse.
 *
 * Paramètres : `res` — réponse Express.
 * Cas d'utilisation : déconnexion.
 * Pourquoi : invalider la session côté client en effaçant les cookies.
 */
export function clearAuthCookies(res: Response): void {
  const options = buildCookieOptions(0);
  res.clearCookie(ACCESS_TOKEN_COOKIE, options);
  res.clearCookie(REFRESH_TOKEN_COOKIE, options);
}
