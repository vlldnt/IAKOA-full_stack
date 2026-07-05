import { useState } from 'react';
import { Check, X, Eye, CalendarDays, MapPin, Building2 } from 'lucide-react';
import type { EventStatus, EventType } from '@/lib/types/EventType';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { EventModal } from '@/features/events_page/components/EventModal';
import { formatDate } from '@/lib/utils/format';
import { useModerationQueue, useModerateEvent } from './hooks';

const TABS: { status: EventStatus; label: string }[] = [
  { status: 'PENDING', label: 'En attente' },
  { status: 'PUBLISHED', label: 'Publiés' },
  { status: 'REJECTED', label: 'Refusés' },
  { status: 'CANCELLED', label: 'Annulés' },
];

// File de modération : publication / refus (motif obligatoire) des événements
function ModerationPage() {
  const [activeStatus, setActiveStatus] = useState<EventStatus>('PENDING');
  const { data: events, isLoading, error } = useModerationQueue(activeStatus);
  const moderate = useModerateEvent();
  const { toast } = useToast();

  const [previewEvent, setPreviewEvent] = useState<EventType | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const handleModerate = (event: EventType, status: EventStatus, note?: string) => {
    moderate.mutate(
      { id: event.id!, status, moderationNote: note },
      {
        onSuccess: () => {
          toast(
            'success',
            status === 'PUBLISHED'
              ? `« ${event.name} » publié.`
              : status === 'REJECTED'
                ? `« ${event.name} » refusé.`
                : `« ${event.name} » mis à jour.`,
          );
          setRejectingId(null);
          setRejectNote('');
        },
        onError: err =>
          toast('error', err instanceof ApiError ? err.message : 'La modération a échoué.'),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {previewEvent && (
        <EventModal event={previewEvent} onClose={() => setPreviewEvent(null)} />
      )}

      <h1 className="text-2xl font-bold text-gray-900">Modération</h1>

      {/* Onglets par statut */}
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map(({ status, label }) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeStatus === status
                ? 'bg-iakoa-blue text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {error && (
        <div className="alert alert-error max-w-md">
          <span>{error.message}</span>
        </div>
      )}

      {!isLoading && !error && (events ?? []).length === 0 && (
        <p className="text-center py-12 text-gray-400">
          Aucun événement dans cette catégorie.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {(events ?? []).map(event => (
          <li key={event.id} className="p-4 rounded-xl border border-gray-200 flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {event.media?.[0]?.url ? (
                  <img
                    src={event.media[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{event.name}</p>
                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400 mt-1">
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
                  {event.company?.name && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {event.company.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                {event.moderationNote && activeStatus === 'REJECTED' && (
                  <p className="text-xs text-red-500 mt-1">Motif : {event.moderationNote}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setPreviewEvent(event)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Aperçu
              </button>
              {activeStatus !== 'PUBLISHED' && (
                <button
                  onClick={() => handleModerate(event, 'PUBLISHED')}
                  disabled={moderate.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Publier
                </button>
              )}
              {activeStatus !== 'REJECTED' && activeStatus !== 'CANCELLED' && (
                <button
                  onClick={() => {
                    setRejectingId(rejectingId === event.id ? null : event.id!);
                    setRejectNote('');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  Refuser
                </button>
              )}
            </div>

            {/* Formulaire de refus (motif obligatoire) */}
            {rejectingId === event.id && (
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-50">
                <textarea
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="Motif du refus (visible par l'organisateur) *"
                  className="textarea textarea-bordered w-full bg-white text-sm"
                />
                <div className="flex gap-2 self-end">
                  <button
                    onClick={() => setRejectingId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-white transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleModerate(event, 'REJECTED', rejectNote.trim())}
                    disabled={!rejectNote.trim() || moderate.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Confirmer le refus
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ModerationPage;
