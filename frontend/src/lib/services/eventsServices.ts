import type { EventType } from '@/lib/types/EventType';
import { api } from './apiClient';

/** Réponse paginée renvoyée par l'endpoint de liste des événements. */
export interface PaginatedEventsResponse {
  data: EventType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Paramètres de filtrage acceptés par l'endpoint paginé des événements. */
export interface EventFilterParams {
  page?: number;
  limit?: number;
  keyword?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  isFree?: boolean;
}

/**
 * Récupère tous les événements publics (sans pagination).
 *
 * Retour : la liste complète des événements.
 * Cas d'utilisation : affichages legacy nécessitant l'ensemble des événements.
 * Pourquoi : exposer un accès simple à la ressource publique `/events`.
 */
export function fetchAllEvents(): Promise<EventType[]> {
  return api.get<EventType[]>('/events', { skipAuth: true });
}

/**
 * Construit la chaîne de requête de filtrage des événements.
 *
 * Paramètres :
 * - `page`, `limit` : pagination.
 * - `filters` : critères optionnels (mots-clés, géolocalisation, dates, prix...).
 * Retour : `URLSearchParams` prêt à être concaténé à l'URL.
 * Pourquoi : isoler la logique de sérialisation des filtres pour garder
 * `fetchEventsPaginated` lisible.
 */
function buildEventQuery(page: number, limit: number, filters?: EventFilterParams): URLSearchParams {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.keyword) params.append('keyword', filters.keyword);
  if (filters?.latitude !== undefined) params.append('latitude', String(filters.latitude));
  if (filters?.longitude !== undefined) params.append('longitude', String(filters.longitude));
  if (filters?.radius !== undefined) params.append('radius', String(filters.radius));
  if (filters?.categories?.length) params.append('categories', filters.categories.join(','));
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  if (filters?.priceMin !== undefined) params.append('priceMin', String(filters.priceMin));
  if (filters?.priceMax !== undefined) params.append('priceMax', String(filters.priceMax));
  if (filters?.isFree) params.append('isFree', 'true');
  return params;
}

/**
 * Récupère les événements avec pagination et filtres.
 *
 * Paramètres :
 * - `page` : numéro de page (défaut 1).
 * - `limit` : nombre d'éléments par page (défaut 12).
 * - `filters` : critères de filtrage optionnels.
 * Retour : la réponse paginée (données + métadonnées).
 * Cas d'utilisation : liste principale des événements et recherche filtrée.
 * Pourquoi : endpoint central d'exploration des événements côté front.
 */
export function fetchEventsPaginated(
  page = 1,
  limit = 12,
  filters?: EventFilterParams,
): Promise<PaginatedEventsResponse> {
  return api.get<PaginatedEventsResponse>(`/events?${buildEventQuery(page, limit, filters)}`, {
    skipAuth: true,
  });
}

/**
 * Récupère un événement public par son identifiant.
 *
 * Paramètres : `id` — identifiant de l'événement.
 * Retour : l'événement correspondant.
 * Cas d'utilisation : page/modale de détail d'un événement.
 */
export function fetchEventById(id: string): Promise<EventType> {
  return api.get<EventType>(`/events/${id}`, { skipAuth: true });
}

/**
 * Récupère les événements appartenant à l'utilisateur connecté.
 *
 * Retour : la liste des événements de l'utilisateur.
 * Cas d'utilisation : section « Mes événements » du profil.
 * Pourquoi : nécessite l'authentification, gérée automatiquement par le client.
 */
export function fetchMyEvents(): Promise<EventType[]> {
  return api.get<EventType[]>('/events/my-events');
}

/**
 * Crée un nouvel événement.
 *
 * Paramètres : `eventData` — données de l'événement (sans `id`).
 * Retour : l'événement créé.
 * Cas d'utilisation : formulaire de création d'événement.
 */
export function createEvent(eventData: Omit<EventType, 'id'>): Promise<EventType> {
  return api.post<EventType>('/events', eventData);
}

/**
 * Met à jour un événement existant.
 *
 * Paramètres : `id` — identifiant ; `eventData` — champs à modifier.
 * Retour : l'événement mis à jour.
 * Cas d'utilisation : édition d'un événement par son propriétaire.
 */
export function updateEvent(id: string, eventData: Partial<EventType>): Promise<EventType> {
  return api.patch<EventType>(`/events/${id}`, eventData);
}

/**
 * Supprime un événement.
 *
 * Paramètres : `id` — identifiant de l'événement.
 * Cas d'utilisation : suppression d'un événement par son propriétaire.
 */
export function deleteEvent(id: string): Promise<void> {
  return api.delete<void>(`/events/${id}`);
}
