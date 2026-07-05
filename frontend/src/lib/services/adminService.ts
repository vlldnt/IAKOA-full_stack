import { apiFetch } from '@/lib/api-client';
import type { EventStatus, EventType } from '@/lib/types/EventType';
import type { UserType } from '@/lib/types/AuthType';
import type { CompanyType } from '@/lib/services/companiesService';

// ── Types ────────────────────────────────────────────────────────────────

export interface AdminStats {
  users: { total: number; last30Days: number };
  companies: { total: number; pendingValidation: number };
  events: {
    byStatus: Record<EventStatus, number>;
    upcomingPublished: number;
    pendingModeration: number;
  };
  favorites: { total: number };
  categories: { active: number };
  places: { total: number };
}

export interface AdminCategory {
  id: string;
  slug: string;
  label: string;
  color: string | null;
  isActive: boolean;
  groupId: string | null;
  group: { id: string; slug: string; label: string } | null;
  _count: { events: number };
}

export interface CategoryGroupPublic {
  id: string;
  slug: string;
  label: string;
  position: number;
  categories: { id: string; slug: string; label: string; color: string | null }[];
}

export interface PlaceType {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export type PlacePayload = Omit<PlaceType, 'id' | 'createdAt' | 'updatedAt'>;

// ── Dashboard ────────────────────────────────────────────────────────────

export async function fetchAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats');
}

// ── Modération ───────────────────────────────────────────────────────────

export async function fetchModerationQueue(status: EventStatus): Promise<EventType[]> {
  return apiFetch<EventType[]>(`/events/moderation?status=${status}`);
}

export async function moderateEvent(
  id: string,
  status: EventStatus,
  moderationNote?: string,
): Promise<EventType> {
  return apiFetch<EventType>(`/events/${id}/moderate`, {
    method: 'PATCH',
    body: { status, moderationNote },
  });
}

// ── Utilisateurs ─────────────────────────────────────────────────────────

export async function fetchAllUsers(): Promise<UserType[]> {
  return apiFetch<UserType[]>('/users');
}

export async function updateUserRole(id: string, role: 'ADMIN' | 'USER'): Promise<UserType> {
  return apiFetch<UserType>(`/users/${id}`, { method: 'PATCH', body: { role } });
}

export async function deleteUserAdmin(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/users/${id}`, { method: 'DELETE' });
}

// ── Entreprises ──────────────────────────────────────────────────────────

export async function fetchAllCompanies(): Promise<CompanyType[]> {
  return apiFetch<CompanyType[]>('/companies');
}

export async function setCompanyValidation(
  id: string,
  isValidated: boolean,
): Promise<CompanyType> {
  return apiFetch<CompanyType>(`/companies/${id}/validate`, {
    method: 'PATCH',
    body: { isValidated },
  });
}

// ── Catégories ───────────────────────────────────────────────────────────

export async function fetchCategoryGroups(): Promise<CategoryGroupPublic[]> {
  return apiFetch<CategoryGroupPublic[]>('/categories');
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  return apiFetch<AdminCategory[]>('/categories/admin');
}

export interface CategoryPayload {
  slug?: string;
  label?: string;
  color?: string;
  groupId?: string;
  isActive?: boolean;
}

export async function createCategory(payload: CategoryPayload): Promise<AdminCategory> {
  return apiFetch<AdminCategory>('/categories', { method: 'POST', body: payload });
}

export async function updateCategory(
  id: string,
  payload: CategoryPayload,
): Promise<AdminCategory> {
  return apiFetch<AdminCategory>(`/categories/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/categories/${id}`, { method: 'DELETE' });
}

// ── Lieux ────────────────────────────────────────────────────────────────

export async function fetchPlaces(city?: string): Promise<PlaceType[]> {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return apiFetch<PlaceType[]>(`/places${query}`);
}

export async function createPlace(payload: PlacePayload): Promise<PlaceType> {
  return apiFetch<PlaceType>('/places', { method: 'POST', body: payload });
}

export async function updatePlace(
  id: string,
  payload: Partial<PlacePayload>,
): Promise<PlaceType> {
  return apiFetch<PlaceType>(`/places/${id}`, { method: 'PATCH', body: payload });
}

export async function deletePlace(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/places/${id}`, { method: 'DELETE' });
}
