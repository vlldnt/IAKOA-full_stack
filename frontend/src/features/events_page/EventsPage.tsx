import { EventCard } from './components/EventCard';
import { EventModal } from './components/EventModal';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useEvents } from './EventContext';
import { useFilters } from './FilterContext';
import type { EventType } from '@/lib/types/EventType';

interface EventsPageProps {
  text?: string;
  showCards?: boolean;
}

// Page d'accueil affichant les événements
// Adapte le contenu selon l'état de connexion
function EventsPage({ text, showCards = true }: EventsPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { events = [], isLoading = false, error = null, fetchMoreEvents, prefetchNextPage, totalPages = 1, fetchFilteredEvents } = useEvents();
  const { filters, updatePosition } = useFilters();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const itemsPerPage = 12;

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

  // Initialiser la position de l'utilisateur en arrière-plan (sans déclencher de fetch)
  useEffect(() => {
    if (!filters.latitude && !filters.longitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updatePosition(position.coords.latitude, position.coords.longitude);
        },
        () => {
          updatePosition(44.3497, 2.5737);
        }
      );
    }
  }, []);

  // Chargement initial: événements récents sans filtre
  useEffect(() => {
    if (!hasAppliedFilters) {
      fetchFilteredEvents(1, itemsPerPage).then(() => {
        prefetchNextPage(2, itemsPerPage);
      });
    }
  }, []);

  // Quand les filtres changent (action utilisateur), fetcher avec filtres
  const buildFilterParams = useCallback(() => ({
    keyword: filters.keyword || undefined,
    city: filters.city || undefined,
    latitude: filters.latitude,
    longitude: filters.longitude,
    radius: filters.radius,
    categories: filters.selectedCategories.length > 0 ? filters.selectedCategories : undefined,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    isFree: filters.isFree || undefined,
  }), [filters]);

  // Détecter les changements de filtres (après le premier rendu)
  useEffect(() => {
    const hasAnyFilter = filters.keyword || filters.city || filters.selectedCategories.length > 0
      || filters.dateFrom || filters.dateTo || filters.priceMin !== undefined
      || filters.priceMax !== undefined || filters.isFree;

    if (hasAnyFilter || hasAppliedFilters) {
      setHasAppliedFilters(true);
      setCurrentPage(1);
      fetchFilteredEvents(1, itemsPerPage, buildFilterParams()).then(() => {
        prefetchNextPage(2, itemsPerPage);
      });
    }
  }, [filters.keyword, filters.city, filters.latitude, filters.longitude, filters.radius, filters.selectedCategories, filters.dateFrom, filters.dateTo, filters.priceMin, filters.priceMax, filters.isFree]);

  // Infinite scroll avec Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          currentPage < totalPages
        ) {
          // Charger la prochaine page
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [isLoading, currentPage, totalPages]);

  // Quand la page change, charger plus d'événements et prefetch la suivante
  useEffect(() => {
    if (currentPage > 1 && fetchMoreEvents) {
      fetchMoreEvents(currentPage, itemsPerPage).then(() => {
        // Prefetch la page suivante après le chargement
        prefetchNextPage(currentPage + 1, itemsPerPage);
      });
    }
  }, [currentPage]);

  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4 pb-8 md:pb-8 relative">
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
      <div ref={contentRef} className="w-full lg:w-[95%] xl:w-[90%] [@media(min-width:1828px)]:w-[80%] mx-auto">
        {showCards ? (
          <div className="w-full">

            {error && (
              <div className="alert alert-error max-w-md mx-auto">
                <span>{error}</span>
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
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
                  ))}
                </div>

                {/* Sentinel pour infinite scroll */}
                {currentPage < totalPages && (
                  <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-8 pb-20 lg:pb-8">
                    {isLoading && (
                      <span className="loading loading-spinner loading-lg"></span>
                    )}
                  </div>
                )}

                {/* Message fin de liste */}
                {currentPage === totalPages && events.length > 0 && (
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
