import type { UserType } from '@/lib/types/AuthType';
import { api } from './apiClient';

/** Champs modifiables du profil utilisateur. */
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * Met à jour le profil de l'utilisateur.
 *
 * Paramètres : `id` — identifiant utilisateur ; `payload` — champs à modifier.
 * Retour : l'utilisateur mis à jour.
 * Cas d'utilisation : édition du profil et changement de mot de passe.
 * Pourquoi : centraliser l'appel `PATCH /users/:id` via le client API.
 */
export function updateUser(id: string, payload: UpdateUserPayload): Promise<UserType> {
  return api.patch<UserType>(`/users/${id}`, payload);
}
