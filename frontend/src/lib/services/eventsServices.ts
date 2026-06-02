import type { EventType } from '@/lib/types/EventType';
import { api } from './apiClient';

// Réponse paginée renvoyée par l'endpoint de liste des événements.
export interface PaginatedEventsResponse {
  data: EventType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Paramètres de filtrage acceptés par l'endpoint paginé des événements.
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

// Récupère tous les événements publics (sans pagination).
export function fetchAllEvents(): Promise<EventType[]> {
  return api.get<EventType[]>('/events', { skipAuth: true });
}

// Construit la chaîne de requête de filtrage (pagination + critères optionnels).
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

// Récupère les événements avec pagination et filtres.
export function fetchEventsPaginated(
  page = 1,
  limit = 12,
  filters?: EventFilterParams,
): Promise<PaginatedEventsResponse> {
  return api.get<PaginatedEventsResponse>(`/events?${buildEventQuery(page, limit, filters)}`, {
    skipAuth: true,
  });
}

// Récupère un événement public par son identifiant.
export function fetchEventById(id: string): Promise<EventType> {
  return api.get<EventType>(`/events/${id}`, { skipAuth: true });
}

// Récupère les événements appartenant à l'utilisateur connecté.
export function fetchMyEvents(): Promise<EventType[]> {
  return api.get<EventType[]>('/events/my-events');
}

// Crée un nouvel événement.
export function createEvent(eventData: Omit<EventType, 'id'>): Promise<EventType> {
  return api.post<EventType>('/events', eventData);
}

// Met à jour un événement existant.
export function updateEvent(id: string, eventData: Partial<EventType>): Promise<EventType> {
  return api.patch<EventType>(`/events/${id}`, eventData);
}

// Supprime un événement.
export function deleteEvent(id: string): Promise<void> {
  return api.delete<void>(`/events/${id}`);
}
