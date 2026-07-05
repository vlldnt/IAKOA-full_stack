import { apiFetch } from '@/lib/api-client';

export type NotificationType =
  | 'EVENT_PUBLISHED'
  | 'EVENT_REJECTED'
  | 'EVENT_UPDATED'
  | 'EVENT_CANCELLED'
  | 'EVENT_REMINDER';

export interface NotificationItem {
  id: string;
  createdAt: string;
  type: NotificationType;
  title: string;
  body: string | null;
  readAt: string | null;
  eventId: string | null;
}

// 50 dernières notifications de l'utilisateur connecté
export async function fetchNotifications(): Promise<NotificationItem[]> {
  return apiFetch<NotificationItem[]>('/notifications');
}

export async function fetchUnreadCount(): Promise<{ count: number }> {
  return apiFetch<{ count: number }>('/notifications/unread-count');
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch<{ message: string; count: number }>('/notifications/read-all', {
    method: 'PATCH',
  });
}
