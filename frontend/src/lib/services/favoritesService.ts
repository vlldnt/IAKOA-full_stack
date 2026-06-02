import { api } from './apiClient';

/**
 * Récupère les identifiants des événements favoris d'un utilisateur.
 *
 * Paramètres : `userId` — identifiant de l'utilisateur.
 * Retour : la liste des `eventId` mis en favori.
 * Cas d'utilisation : initialisation de l'état des favoris au chargement.
 */
export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const data = await api.get<{ eventId: string }[]>(`/user-favorites/user/${userId}`);
  return data.map((favorite) => favorite.eventId);
}

/**
 * Ajoute un événement aux favoris de l'utilisateur.
 *
 * Paramètres : `userId` — utilisateur ; `eventId` — événement à ajouter.
 * Cas d'utilisation : clic sur le bouton « favori » d'un événement.
 */
export function addFavorite(userId: string, eventId: string): Promise<void> {
  return api.post<void>('/user-favorites', { userId, eventId });
}

/**
 * Retire un événement des favoris de l'utilisateur.
 *
 * Paramètres : `userId` — utilisateur ; `eventId` — événement à retirer.
 * Cas d'utilisation : clic pour désactiver le favori d'un événement.
 */
export function removeFavorite(userId: string, eventId: string): Promise<void> {
  return api.delete<void>(`/user-favorites/${userId}/${eventId}`);
}
