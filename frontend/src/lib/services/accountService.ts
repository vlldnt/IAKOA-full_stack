import type { UserType } from '@/lib/types/AuthType';
import { api } from './apiClient';

// Champs modifiables du profil utilisateur.
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
}

// Met à jour le profil de l'utilisateur (PATCH /users/:id).
export function updateUser(id: string, payload: UpdateUserPayload): Promise<UserType> {
  return api.patch<UserType>(`/users/${id}`, payload);
}
