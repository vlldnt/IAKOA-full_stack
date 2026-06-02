import type { UserType } from '@/lib/types/AuthType';
import { api } from './apiClient';

// Réponse d'authentification du backend (tokens présents pour compatibilité ;
// la session est en réalité portée par des cookies HttpOnly).
export interface IAuthResponse {
  user: UserType;
  access_token: string;
  refresh_token: string;
}

// Connecte un utilisateur avec email et mot de passe (cookies posés par le serveur).
export function loginAPI(email: string, password: string): Promise<IAuthResponse> {
  return api.post<IAuthResponse>('/auth/login', { email, password }, { skipRefresh: true });
}

// Crée un nouveau compte utilisateur (cookies posés par le serveur).
export function registerAPI(name: string, email: string, password: string): Promise<IAuthResponse> {
  return api.post<IAuthResponse>('/auth/register', { name, email, password }, { skipRefresh: true });
}

// Déconnecte l'utilisateur (invalide le refresh token et efface les cookies).
export function logoutAPI(): Promise<void> {
  return api.post<void>('/auth/logout');
}

// Récupère les informations de l'utilisateur connecté (via cookie de session).
export function getUserAPI(): Promise<UserType> {
  return api.get<UserType>('/users/me');
}
