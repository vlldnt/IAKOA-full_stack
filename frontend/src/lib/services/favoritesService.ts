import * as tokenService from './tokenService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function authHeaders() {
  const token = tokenService.getAccessToken();
  if (!token) throw new Error('Non authentifié');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// Récupère les IDs des événements favoris de l'utilisateur
export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/user-favorites/user/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Impossible de charger les favoris');
  const data = await res.json();
  return (data as { eventId: string }[]).map((f) => f.eventId);
}

// Ajoute un événement aux favoris
export async function addFavorite(userId: string, eventId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/user-favorites`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId, eventId }),
  });
  if (!res.ok) throw new Error("Impossible d'ajouter aux favoris");
}

// Retire un événement des favoris
export async function removeFavorite(userId: string, eventId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/user-favorites/${userId}/${eventId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Impossible de retirer des favoris');
}
