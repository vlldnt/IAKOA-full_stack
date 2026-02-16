import type { EventType } from "@/lib/types/EventType";
import * as tokenService from "./tokenService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Interface pour la réponse paginée
export interface PaginatedEventsResponse {
  data: EventType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Récupère tous les événements publics
export async function fetchAllEvents(): Promise<EventType[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Récupère les événements avec pagination
export async function fetchEventsPaginated(
  page: number = 1,
  limit: number = 12,
): Promise<PaginatedEventsResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const res = await fetch(`${API_BASE_URL}/events?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Récupère un événement par ID (public)
export async function fetchEventById(id: string): Promise<EventType> {
  try {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch event: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Récupère tous les événements de l'utilisateur connecté
export async function fetchMyEvents(): Promise<EventType[]> {
  try {
    const token = tokenService.getAccessToken();
    if (!token) {
      throw new Error("No access token found");
    }

    const res = await fetch(`${API_BASE_URL}/events/my-events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch my events: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Crée un nouvel événement
export async function createEvent(
  eventData: Omit<EventType, "id">,
): Promise<EventType> {
  try {
    const token = tokenService.getAccessToken();
    if (!token) {
      throw new Error("No access token found");
    }

    const res = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create event: ${res.statusText}`,
      );
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Met à jour un événement
export async function updateEvent(
  id: string,
  eventData: Partial<EventType>,
): Promise<EventType> {
  try {
    const token = tokenService.getAccessToken();
    if (!token) {
      throw new Error("No access token found");
    }

    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update event: ${res.statusText}`,
      );
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Supprime un événement
export async function deleteEvent(id: string): Promise<void> {
  try {
    const token = tokenService.getAccessToken();
    if (!token) {
      throw new Error("No access token found");
    }

    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete event: ${res.statusText}`,
      );
    }
  } catch (error) {
    throw error;
  }
}
