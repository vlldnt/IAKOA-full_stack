import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CalendarPlus,
  LogIn,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { EventType, EventStatus } from '@/lib/types/EventType';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/toast';
import { useDeleteEvent } from '@/features/events_page/hooks';
import { EventModal } from '@/features/events_page/components/EventModal';
import { formatDate } from '@/lib/utils/format';
import { useMyEvents } from './hooks';

// Apparence des badges de statut de modération
const STATUS_BADGES: Record<EventStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Brouillon', className: 'bg-gray-100 text-gray-600' },
  PENDING: { label: 'En vérification', className: 'bg-amber-100 text-amber-700' },
  PUBLISHED: { label: 'Publié', className: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Refusé', className: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Annulé', className: 'bg-gray-100 text-gray-500' },
};

// Page /my-events : les événements de l'organisateur, tous statuts confondus
function MyEventsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: events, isLoading, error } = useMyEvents();
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDelete = (event: EventType) => {
    deleteEvent.mutate(event.id!, {
      onSuccess: () => {
        toast('success', `« ${event.name} » supprimé.`);
        setPendingDeleteId(null);
      },
      onError: () => toast('error', 'La suppression a échoué. Réessayez.'),
    });
  };

  const openAuthModal = () => {
    (document.getElementById('auth_modal') as HTMLDialogElement | null)?.showModal();
  };

  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4 pb-24 lg:pb-8">
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between pt-6 pb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-iakoa-blue" />
            <h1 className="text-2xl font-bold text-gray-900">Mes événements</h1>
          </div>
          {user?.isCreator && (
            <Link
              to="/create"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity"
            >
              <CalendarPlus className="h-4 w-4" />
              Créer
            </Link>
          )}
        </div>

        {!isAuthLoading && !user && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <LogIn className="h-12 w-12 text-gray-200" />
            <p className="text-gray-600">Connectez-vous pour gérer vos événements.</p>
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              Se connecter
            </button>
          </div>
        )}

        {!isAuthLoading && user && !user.isCreator && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <CalendarPlus className="h-12 w-12 text-gray-200" />
            <p className="text-gray-600">
              Vous n'êtes pas encore organisateur. Créez votre premier événement pour commencer.
            </p>
            <Link
              to="/create"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity"
            >
              Créer un événement
            </Link>
          </div>
        )}

        {(isAuthLoading || (user?.isCreator && isLoading)) && (
          <div className="text-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {user?.isCreator && error && (
          <div className="alert alert-error max-w-md mx-auto mt-6">
            <span>{error.message}</span>
          </div>
        )}

        {user?.isCreator && !isLoading && !error && (events ?? []).length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <CalendarDays className="h-12 w-12 text-gray-200" />
            <p className="text-gray-600">Vous n'avez pas encore créé d'événement.</p>
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {(events ?? []).map(event => {
            const badge = STATUS_BADGES[event.status ?? 'PENDING'];
            const cover = event.media?.[0]?.url;
            return (
              <li
                key={event.id}
                className="flex gap-3 p-3 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                <button
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                >
                  {cover ? (
                    <img src={cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CalendarDays className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </button>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className="font-semibold text-sm text-gray-900 truncate cursor-pointer hover:text-iakoa-blue transition-colors"
                      >
                        {event.name}
                      </button>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(event.date)}
                      </span>
                      {event.location?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location.city}
                        </span>
                      )}
                    </div>
                    {event.status === 'REJECTED' && event.moderationNote && (
                      <p className="text-xs text-red-500 mt-1 line-clamp-2">
                        Motif : {event.moderationNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/edit/${event.id}`)}
                    title="Modifier"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-iakoa-blue bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </button>

                  {pendingDeleteId === event.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(event)}
                        disabled={deleteEvent.isPending}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        className="px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(event.id!)}
                      title="Supprimer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default MyEventsPage;
