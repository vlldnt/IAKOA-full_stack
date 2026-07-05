import { apiFetch } from '@/lib/api-client';
import type { EventType } from '@/lib/types/EventType';

// Favori tel que renvoyé par l'API (événement au format complet /events)
export interface FavoriteType {
  id: string;
  createdAt: string;
  userId: string;
  eventId: string;
  event?: EventType;
}

// Liste les favoris de l'utilisateur (plus récent en premier)
export async function fetchFavorites(userId: string): Promise<FavoriteType[]> {
  return apiFetch<FavoriteType[]>(`/user-favorites/user/${userId}`);
}

// Ajoute un événement aux favoris
export async function addFavorite(userId: string, eventId: string): Promise<FavoriteType> {
  return apiFetch<FavoriteType>('/user-favorites', {
    method: 'POST',
    body: { userId, eventId },
  });
}

// Retire un événement des favoris
export async function removeFavorite(userId: string, eventId: string): Promise<void> {
  await apiFetch<{ message: string }>(`/user-favorites/${userId}/${eventId}`, {
    method: 'DELETE',
  });
}
