import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Sliders } from 'lucide-react';
import { useFilters } from '@/features/events_page/FilterContext';
import { FilterMenu, type FilterState } from '@/components/Header/components/SearchBar/FilterMenu';
import { fetchEventsPaginated } from '@/lib/services/eventsServices';
import type { EventType } from '@/lib/types/EventType';
import { getCategoryHexColor } from '@/lib/constants/filter-categories';

// Fix leaflet icon paths with bundlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createEventIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(37,99,235,0.55)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function getZoomForRadius(radius: number): number {
  if (radius <= 1) return 14;
  if (radius <= 2) return 13;
  if (radius <= 5) return 12;
  if (radius <= 10) return 11;
  if (radius <= 25) return 9;
  if (radius <= 50) return 8;
  return 7;
}

// Child component: flies to new position when filters change
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    if (!prev || prev.lat !== center[0] || prev.lng !== center[1] || prev.zoom !== zoom) {
      map.flyTo(center, zoom, { duration: 1 });
      prevRef.current = { lat: center[0], lng: center[1], zoom };
    }
  }, [center[0], center[1], zoom]);

  return null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(pricing: number): string {
  if (pricing === 0) return 'Gratuit';
  return `${(pricing / 100).toFixed(2).replace('.', ',')} €`;
}

export default function MapPage() {
  const { filters, updatePosition } = useFilters();
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState(filters.keyword);
  const [city, setCity] = useState(filters.city);
  const [headerHeight, setHeaderHeight] = useState(80);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);

  const userPosition: [number, number] | null =
    filters.latitude && filters.longitude
      ? [filters.latitude, filters.longitude]
      : null;

  // France centre par défaut, zoom pays si pas de position
  const mapCenter: [number, number] = userPosition ?? [46.603354, 1.888334];
  const mapZoom = userPosition ? getZoomForRadius(filters.radius) : 6;

  // Sync keyword/city from global filters (e.g. after reset)
  useEffect(() => {
    setKeyword(filters.keyword);
    setCity(filters.city);
  }, [filters.keyword, filters.city]);

  // Track header height for the fixed map container
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const update = () => setHeaderHeight((header as HTMLElement).offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Request geolocation once on mount if position not already set
  useEffect(() => {
    if (!filters.latitude && !filters.longitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => updatePosition(pos.coords.latitude, pos.coords.longitude),
        () => {},
      );
    }
  }, []);

  // Fetch events whenever filters change
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchEventsPaginated(1, 500, {
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
      });
      setEvents(
        result.data.filter(
          (e) =>
            e.location?.coordinates?.lat != null &&
            e.location?.coordinates?.lng != null,
        ),
      );
    } catch {
      // silent — map stays with stale data
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.keyword,
    filters.city,
    filters.latitude,
    filters.longitude,
    filters.radius,
    filters.selectedCategories,
    filters.dateFrom,
    filters.dateTo,
    filters.priceMin,
    filters.priceMax,
    filters.isFree,
  ]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filterCount = appliedFilters
    ? (appliedFilters.selectedCategories.length > 0 ? 1 : 0) +
      (appliedFilters.radius !== 2 ? 1 : 0)
    : 0;

  return (
    <>
      {/* Fixed map container — accounts for fixed header (top) and mobile nav (bottom) */}
      <div
        className="fixed left-0 right-0 bottom-16 xl:bottom-0"
        style={{ top: headerHeight }}
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Fly to user position when it changes */}
          {userPosition && <MapUpdater center={userPosition} zoom={mapZoom} />}

          {/* Radius circle + user marker */}
          {userPosition && (
            <>
              <Circle
                center={userPosition}
                radius={filters.radius * 1000}
                pathOptions={{
                  color: '#2563EB',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.07,
                  weight: 1.5,
                }}
              />
              <Marker position={userPosition} icon={USER_ICON}>
                <Popup>
                  <span style={{ fontWeight: 600, color: '#2563EB', fontSize: 13 }}>
                    Ma localisation
                  </span>
                </Popup>
              </Marker>
            </>
          )}

          {/* Event markers */}
          {events.map((event) => {
            const { lat, lng } = event.location.coordinates;
            const color = getCategoryHexColor(event.categories?.[0] ?? '');
            return (
              <Marker
                key={event.id}
                position={[lat, lng]}
                icon={createEventIcon(color)}
              >
                <Popup>
                  <div style={{ minWidth: 180, maxWidth: 220 }}>
                    {/* Category color stripe */}
                    <div
                      style={{
                        height: 3,
                        background: color,
                        borderRadius: 2,
                        marginBottom: 8,
                      }}
                    />
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        margin: '0 0 4px',
                        lineHeight: 1.3,
                        color: '#111827',
                      }}
                    >
                      {event.name}
                    </p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 2px' }}>
                      📅 {formatDate(event.date)}
                    </p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>
                      📍 {event.location.city}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color, margin: 0 }}>
                      {formatPrice(event.pricing)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating UI — bottom-right overlay */}
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-none">
          {/* Events count / loading pill */}
          <div className="pointer-events-auto bg-white rounded-full px-3 py-1.5 shadow-lg text-xs text-gray-600 flex items-center gap-1.5">
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                Chargement...
              </>
            ) : (
              `${events.length} événement${events.length !== 1 ? 's' : ''}`
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={() => setIsFilterMenuOpen(true)}
            className="pointer-events-auto relative flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-iakoa-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all duration-200"
            title="Filtres"
          >
            <Sliders className="h-5 w-5 text-white" />
            {filterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter menu — same as in SearchBar */}
      <FilterMenu
        isOpen={isFilterMenuOpen}
        onClose={() => setIsFilterMenuOpen(false)}
        onApply={(f) => setAppliedFilters(f)}
        keyword={keyword}
        city={city}
        onKeywordChange={setKeyword}
        onCityChange={setCity}
      />
    </>
  );
}
