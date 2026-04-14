import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Building2, Filter, Loader2, AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EventModal } from '@/features/events_page/components/EventModal';
import { deleteEvent, fetchMyEvents } from '@/lib/services/eventsServices';
import { fetchMyCompanies, type CompanyType } from '@/lib/services/companiesService';
import type { EventType } from '@/lib/types/EventType';

type SortOrder = 'date_desc' | 'date_asc';

function formatEventDate(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'Date inconnue';

  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MyEventsSection() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [myEvents, myCompanies] = await Promise.all([
          fetchMyEvents(),
          fetchMyCompanies(),
        ]);

        if (cancelled) return;
        setEvents(myEvents);
        setCompanies(myCompanies);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || 'Impossible de charger vos événements.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const companyNameById = useMemo(() => {
    return new Map(companies.map((c) => [c.id, c.name]));
  }, [companies]);

  const companyOptions = useMemo(() => {
    const idsInEvents = new Set(events.map((e) => e.companyId).filter(Boolean));

    return companies
      .filter((c) => idsInEvents.has(c.id))
      .map((c) => ({ id: c.id, name: c.name }));
  }, [companies, events]);

  const filteredAndSortedEvents = useMemo(() => {
    const filtered = companyFilter === 'all'
      ? events
      : events.filter((e) => e.companyId === companyFilter);

    return [...filtered].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();

      if (sortOrder === 'date_asc') return aDate - bDate;
      return bDate - aDate;
    });
  }, [events, companyFilter, sortOrder]);

  const handleDelete = async (event: EventType) => {
    if (!event.id) return;

    const confirmDelete = window.confirm(
      `Supprimer l'événement "${event.name}" ? Cette action est irréversible.`
    );
    if (!confirmDelete) return;

    setDeletingId(event.id);
    setError(null);

    try {
      await deleteEvent(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (err: any) {
      setError(err?.message || "Impossible de supprimer l'événement.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Chargement de vos événements…
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Mes événements</h2>
        </div>
        <Link
          to="/create"
          className="flex items-center gap-1.5 text-sm text-iakoa-blue hover:underline"
        >
          <Plus size={14} /> Nouvel événement
        </Link>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-red-600 text-sm">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {!error && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Entreprise</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
              <Building2 size={15} className="text-gray-400 shrink-0" />
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm"
                disabled={companyOptions.length <= 1}
              >
                <option value="all">Toutes les entreprises</option>
                {companyOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:w-56">
            <label className="block text-xs font-medium text-gray-600 mb-1">Tri</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
              <Filter size={15} className="text-gray-400 shrink-0" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="flex-1 bg-transparent outline-none text-sm"
              >
                <option value="date_desc">Plus récents</option>
                <option value="date_asc">Plus anciens</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {!error && filteredAndSortedEvents.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
          <CalendarDays size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Aucun événement trouvé pour ce filtre.</p>
        </div>
      ) : !error ? (
        <div className="space-y-3">
          {filteredAndSortedEvents.map((event) => {
            const mediaUrl = event.media?.[0]?.url;
            const companyName = event.company?.name || companyNameById.get(event.companyId) || 'Entreprise inconnue';

            return (
              <div
                key={event.id || `${event.companyId}-${event.name}-${event.date}`}
                className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedEvent(event)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedEvent(event);
                  }
                }}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {mediaUrl ? (
                    <img src={mediaUrl} alt={event.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <CalendarDays size={18} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{event.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatEventDate(event.date)}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{companyName}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{event.description}</p>

                  {event.id && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <Link
                        to={`/create?edit=${event.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                          text-xs font-medium text-iakoa-blue bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Pencil size={12} /> Éditer
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(event);
                        }}
                        disabled={deletingId === event.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                          text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors
                          disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={12} />
                        {deletingId === event.id ? 'Suppression…' : 'Supprimer'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
