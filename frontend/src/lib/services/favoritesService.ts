import { api } from './apiClient';

// Récupère les identifiants des événements favoris d'un utilisateur.
export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const data = await api.get<{ eventId: string }[]>(`/user-favorites/user/${userId}`);
  return data.map((favorite) => favorite.eventId);
}

// Ajoute un événement aux favoris de l'utilisateur.
export function addFavorite(userId: string, eventId: string): Promise<void> {
  return api.post<void>('/user-favorites', { userId, eventId });
}

// Retire un événement des favoris de l'utilisateur.
export function removeFavorite(userId: string, eventId: string): Promise<void> {
  return api.delete<void>(`/user-favorites/${userId}/${eventId}`);
}
