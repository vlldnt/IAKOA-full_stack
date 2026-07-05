import { apiFetch } from '@/lib/api-client';
import type { UserType } from '@/lib/types/AuthType';

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  isCreator?: boolean;
  notifyByEmail?: boolean;
}

// Met à jour le profil (le back interdit la modification du rôle)
export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<UserType> {
  return apiFetch<UserType>(`/users/${userId}`, { method: 'PATCH', body: payload });
}

// Supprime définitivement le compte
export async function deleteUser(userId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/users/${userId}`, { method: 'DELETE' });
}
