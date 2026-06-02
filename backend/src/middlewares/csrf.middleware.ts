import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/** En-tête personnalisé exigé sur les requêtes mutatives (défense CSRF). */
export const CSRF_HEADER = 'x-requested-with';

/** Méthodes HTTP considérées comme sûres (sans effet de bord). */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Chemins exemptés (callbacks OAuth : navigations top-level, pas de cookie applicatif préalable). */
const EXEMPT_PATHS = ['/auth/google', '/auth/facebook'];

/**
 * Middleware de protection CSRF par en-tête personnalisé.
 *
 * Description : exige un en-tête `X-Requested-With` sur toute requête mutative
 * (POST/PUT/PATCH/DELETE). Les requêtes inter-sites « simples » (formulaire,
 * balise img) ne peuvent pas ajouter d'en-tête personnalisé, et une requête
 * cross-origin avec en-tête déclenche un preflight CORS bloqué par notre liste
 * blanche. La session étant portée par des cookies, cette vérification empêche
 * un site tiers de déclencher des actions au nom de l'utilisateur.
 *
 * Pourquoi : alternative légère et maintenue au paquet `csurf` (déprécié),
 * adaptée à une SPA avec client API dédié qui ajoute l'en-tête automatiquement.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(req.method)) {
      return next();
    }

    if (EXEMPT_PATHS.some((path) => req.path.startsWith(path))) {
      return next();
    }

    if (!req.headers[CSRF_HEADER]) {
      throw new ForbiddenException('Requête bloquée : en-tête anti-CSRF manquant.');
    }

    next();
  }
}
