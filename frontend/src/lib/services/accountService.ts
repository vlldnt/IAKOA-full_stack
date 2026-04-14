import * as tokenService from './tokenService';
import type { UserType } from '@/lib/types/AuthType';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function authHeaders() {
  const token = tokenService.getAccessToken();
  if (!token) throw new Error('Non authentifié');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
}

// Met à jour le profil utilisateur (PATCH /users/:id)
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserType> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message[0]
      : errorData.message;
    throw new Error(message || `Erreur lors de la mise à jour : ${res.statusText}`);
  }

  return await res.json();
}
