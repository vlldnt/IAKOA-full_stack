import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminService from '@/lib/services/adminService';
import type { CategoryPayload, PlacePayload } from '@/lib/services/adminService';
import type { EventStatus } from '@/lib/types/EventType';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.fetchAdminStats,
    staleTime: 30_000,
  });
}

// ── Modération ───────────────────────────────────────────────────────────

export function useModerationQueue(status: EventStatus) {
  return useQuery({
    queryKey: ['admin', 'moderation', status],
    queryFn: () => adminService.fetchModerationQueue(status),
    staleTime: 10_000,
  });
}

export function useModerateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      moderationNote,
    }: {
      id: string;
      status: EventStatus;
      moderationNote?: string;
    }) => adminService.moderateEvent(id, status, moderationNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// ── Utilisateurs ─────────────────────────────────────────────────────────

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminService.fetchAllUsers,
    staleTime: 30_000,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'ADMIN' | 'USER' }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteUserAdmin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

// ── Entreprises ──────────────────────────────────────────────────────────

export function useAdminCompanies() {
  return useQuery({
    queryKey: ['admin', 'companies'],
    queryFn: adminService.fetchAllCompanies,
    staleTime: 30_000,
  });
}

export function useValidateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isValidated }: { id: string; isValidated: boolean }) =>
      adminService.setCompanyValidation(id, isValidated),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

// ── Catégories ───────────────────────────────────────────────────────────

export function useCategoryGroups() {
  return useQuery({
    queryKey: ['categories', 'groups'],
    queryFn: adminService.fetchCategoryGroups,
    staleTime: 60_000,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminService.fetchAdminCategories,
    staleTime: 30_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => adminService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryPayload }) =>
      adminService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ── Lieux ────────────────────────────────────────────────────────────────

export function useAdminPlaces() {
  return useQuery({
    queryKey: ['admin', 'places'],
    queryFn: () => adminService.fetchPlaces(),
    staleTime: 30_000,
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlacePayload) => adminService.createPlace(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'places'] }),
  });
}

export function useUpdatePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PlacePayload> }) =>
      adminService.updatePlace(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'places'] }),
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deletePlace(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'places'] }),
  });
}
