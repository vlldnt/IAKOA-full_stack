import { EventCard } from './components/EventCard';
import { EventModal } from './components/EventModal';
import { useRef, useEffect, useMemo, useState } from 'react';
import { useInfiniteEvents } from './hooks';
import { useFilters } from './FilterContext';
import type { EventType } from '@/lib/types/EventType';

interface EventsPageProps {
  text?: string;
  showCards?: boolean;
}

// Page d'accueil affichant les événements (infinite scroll via TanStack Query)
function EventsPage({ text, showCards = true }: EventsPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { filters, updatePosition } = useFilters();
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  // Sans filtre utilisateur actif : événements récents, sans restriction de
  // distance (la géolocalisation en arrière-plan ne déclenche pas de filtre).
  const hasUserFilter = Boolean(
    filters.keyword ||
      filters.city ||
      filters.selectedCategories.length > 0 ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.priceMin !== undefined ||
      filters.priceMax !== undefined ||
      filters.isFree,
  );

  const filterParams = useMemo(
    () =>
      hasUserFilter
        ? {
            keyword: filters.keyword || undefined,
            city: filters.city || undefined,
            latitude: filters.latitude,
            longitude: filters.longitude,
            radius: filters.radius,
            categories:
              filters.selectedCategories.length > 0 ? filters.selectedCategories : undefined,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            isFree: filters.isFree || undefined,
          }
        : undefined,
    [hasUserFilter, filters],
  );

  const { data, error, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteEvents(filterParams);

  const events = useMemo(() => data?.pages.flatMap(page => page.data) ?? [], [data]);

  useEffect(() => {
    const calculateMargin = () => {
      const header = document.querySelector('[data-header]');
      if (header) {
        const headerHeight = header.clientHeight;
        const margin = Math.max(32, headerHeight + 16);
        if (contentRef.current) {
          contentRef.current.style.marginTop = `${margin}px`;
        }
      }
    };

    calculateMargin();
    window.addEventListener('resize', calculateMargin);
    return () => window.removeEventListener('resize', calculateMargin);
  }, []);

  // Initialiser la position de l'utilisateur en arrière-plan
  useEffect(() => {
    if (!filters.latitude && !filters.longitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          updatePosition(position.coords.latitude, position.coords.longitude);
        },
        () => {
          updatePosition(44.3497, 2.5737);
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll avec Intersection Observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, events.length]);

  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4 pb-8 md:pb-8 relative">
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
      <div
        ref={contentRef}
        className="w-full lg:w-[95%] xl:w-[90%] [@media(min-width:1828px)]:w-[80%] mx-auto"
      >
        {showCards ? (
          <div className="w-full">
            {error && (
              <div className="alert alert-error max-w-md mx-auto">
                <span>{error.message}</span>
              </div>
            )}

            {!error && events.length > 0 && (
              <>
                <div
                  className="grid gap-6 w-full p-3
                             grid-cols-1
                             sm:grid-cols-2
                             lg:grid-cols-3
                             [@media(min-width:1828px)]:grid-cols-4
                             place-items-center"
                >
                  {events.map(event => (
                    <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
                  ))}
                </div>

                {/* Sentinel pour infinite scroll */}
                {hasNextPage && (
                  <div
                    ref={sentinelRef}
                    className="h-20 flex items-center justify-center mt-8 pb-20 lg:pb-8"
                  >
                    {isFetchingNextPage && (
                      <span className="loading loading-spinner loading-lg"></span>
                    )}
                  </div>
                )}

                {/* Message fin de liste */}
                {!hasNextPage && (
                  <div className="text-center py-8 pb-20 lg:pb-8 text-gray-500">
                    ✓ Plus d'événements à charger
                  </div>
                )}
              </>
            )}

            {isLoading && events.length === 0 && (
              <div className="text-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            {!isLoading && !error && events.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                Aucun événement disponible pour le moment.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 text-center text-lg text-gray-600">{text}</div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;
