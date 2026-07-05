import type { EventType } from "@/lib/types/EventType";
import { apiFetch } from "@/lib/api-client";

// Interface pour la réponse paginée
export interface PaginatedEventsResponse {
  data: EventType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface pour les paramètres de filtrage
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

// Récupère les événements avec pagination et filtres
export async function fetchEventsPaginated(
  page: number = 1,
  limit: number = 12,
  filters?: EventFilterParams,
): Promise<PaginatedEventsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filters?.keyword) params.append("keyword", filters.keyword);
  if (filters?.latitude !== undefined) params.append("latitude", String(filters.latitude));
  if (filters?.longitude !== undefined) params.append("longitude", String(filters.longitude));
  if (filters?.radius !== undefined) params.append("radius", String(filters.radius));
  if (filters?.categories && filters.categories.length > 0) {
    params.append("categories", filters.categories.join(","));
  }
  if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters?.dateTo) params.append("dateTo", filters.dateTo);
  if (filters?.priceMin !== undefined) params.append("priceMin", String(filters.priceMin));
  if (filters?.priceMax !== undefined) params.append("priceMax", String(filters.priceMax));
  if (filters?.isFree) params.append("isFree", "true");

  return apiFetch<PaginatedEventsResponse>(`/events?${params}`);
}

// Récupère un événement par ID (public)
export async function fetchEventById(id: string): Promise<EventType> {
  return apiFetch<EventType>(`/events/${id}`);
}

// Récupère tous les événements de l'utilisateur connecté
export async function fetchMyEvents(): Promise<EventType[]> {
  return apiFetch<EventType[]>(`/events/my-events`);
}

// Crée un nouvel événement
export async function createEvent(eventData: Omit<EventType, "id">): Promise<EventType> {
  return apiFetch<EventType>(`/events`, { method: "POST", body: eventData });
}

// Met à jour un événement
export async function updateEvent(
  id: string,
  eventData: Partial<EventType>,
): Promise<EventType> {
  return apiFetch<EventType>(`/events/${id}`, { method: "PATCH", body: eventData });
}

// Supprime un événement
export async function deleteEvent(id: string): Promise<void> {
  return apiFetch<void>(`/events/${id}`, { method: "DELETE" });
}
