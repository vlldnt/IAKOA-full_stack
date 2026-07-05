import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, CalendarClock, CheckCircle2, XCircle, Pencil, Ban } from 'lucide-react';
import type { NotificationItem, NotificationType } from '@/lib/services/notificationsService';
import { useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from './hooks';

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  EVENT_PUBLISHED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  EVENT_REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
  EVENT_UPDATED: <Pencil className="h-4 w-4 text-blue-500" />,
  EVENT_CANCELLED: <Ban className="h-4 w-4 text-gray-500" />,
  EVENT_REMINDER: <CalendarClock className="h-4 w-4 text-amber-500" />,
};

// "il y a 5 min", "il y a 3 h", "hier", "12 juin"
function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days} jours`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

interface NotificationBellProps {
  /** Ouvre le panneau vers le haut (barre de navigation mobile) */
  openUpward?: boolean;
}

// Cloche de notifications : badge non-lues + panneau déroulant
export function NotificationBell({ openUpward = false }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: unread } = useUnreadCount();
  const { data: notifications, isLoading } = useNotifications(open);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = unread?.count ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (notification: NotificationItem) => {
    if (!notification.readAt) {
      markRead.mutate(notification.id);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        className="relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute ${
            openUpward ? 'bottom-full mb-2' : 'top-12'
          } right-0 md:right-0 -right-14 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1 text-xs font-medium text-iakoa-blue hover:opacity-70 transition-opacity cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="text-center py-6">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            )}

            {!isLoading && (notifications ?? []).length === 0 && (
              <p className="text-center py-8 text-sm text-gray-400">
                Aucune notification pour le moment.
              </p>
            )}

            <ul>
              {(notifications ?? []).map(notification => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(notification)}
                    className={`flex gap-3 w-full px-4 py-3 text-left border-b border-gray-50 transition-colors cursor-pointer ${
                      notification.readAt ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'
                    }`}
                  >
                    <span className="shrink-0 mt-0.5">{TYPE_ICONS[notification.type]}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-gray-900 leading-snug">
                        {notification.title}
                      </span>
                      {notification.body && (
                        <span className="block text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notification.body}
                        </span>
                      )}
                      <span className="block text-[11px] text-gray-400 mt-1">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </span>
                    {!notification.readAt && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-iakoa-blue mt-1.5" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
