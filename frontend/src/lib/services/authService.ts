import type { UserType } from '@/lib/types/AuthType';
import { api } from './apiClient';

/**
 * Réponse d'authentification renvoyée par le backend.
 *
 * Les tokens restent présents dans le corps pour compatibilité, mais le client
 * n'en a plus besoin : la session est portée par des cookies HttpOnly.
 */
export interface IAuthResponse {
  user: UserType;
  access_token: string;
  refresh_token: string;
}

/**
 * Connecte un utilisateur avec email et mot de passe.
 *
 * Paramètres : `email`, `password` — identifiants de connexion.
 * Retour : l'utilisateur connecté (les cookies de session sont posés par le
 * serveur).
 * Cas d'utilisation : formulaire de connexion.
 * @throws {ApiError} si les identifiants sont invalides.
 */
export function loginAPI(email: string, password: string): Promise<IAuthResponse> {
  return api.post<IAuthResponse>('/auth/login', { email, password }, { skipRefresh: true });
}

/**
 * Crée un nouveau compte utilisateur.
 *
 * Paramètres : `name`, `email`, `password` — informations du compte.
 * Retour : l'utilisateur créé (cookies de session posés par le serveur).
 * Cas d'utilisation : formulaire d'inscription.
 * @throws {ApiError} en cas de données invalides ou d'email déjà utilisé.
 */
export function registerAPI(name: string, email: string, password: string): Promise<IAuthResponse> {
  return api.post<IAuthResponse>('/auth/register', { name, email, password }, { skipRefresh: true });
}

/**
 * Déconnecte l'utilisateur (invalide le refresh token et efface les cookies).
 *
 * Cas d'utilisation : action de déconnexion.
 * Pourquoi : l'authentification reposant sur les cookies, aucun token n'est à
 * fournir.
 */
export function logoutAPI(): Promise<void> {
  return api.post<void>('/auth/logout');
}

/**
 * Récupère les informations de l'utilisateur connecté.
 *
 * Retour : l'utilisateur courant.
 * Cas d'utilisation : initialisation de la session au chargement de l'app.
 * Pourquoi : la session est identifiée via le cookie d'access token ; en cas
 * d'expiration, le client tente automatiquement un rafraîchissement.
 * @throws {ApiError} si l'utilisateur n'est pas authentifié.
 */
export function getUserAPI(): Promise<UserType> {
  return api.get<UserType>('/users/me');
}
