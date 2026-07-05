import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as notificationsService from '@/lib/services/notificationsService';
import { useAuth } from '@/features/auth/AuthContext';

// Liste des notifications (rafraîchie toutes les 60 s)
export function useNotifications(enabled: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: notificationsService.fetchNotifications,
    enabled: !!user && enabled,
    staleTime: 30_000,
  });
}

// Compteur non-lues, poll léger pour le badge de la cloche
export function useUnreadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id, 'unread'],
    queryFn: notificationsService.fetchUnreadCount,
    enabled: !!user,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMarkRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markNotificationRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  });
}

export function useMarkAllRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  });
}
