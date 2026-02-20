import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus, LocateFixed } from 'lucide-react';
import { useFilters } from '@/features/events_page/FilterContext';
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

type DeviceType = 'mobile' | 'tablet' | 'desktop';

function useDeviceType(): DeviceType {
  const getDevice = (): DeviceType => {
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  };
  const [device, setDevice] = useState<DeviceType>(getDevice);
  useEffect(() => {
    const handler = () => setDevice(getDevice());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return device;
}

function getZoomForRadius(radius: number, device: DeviceType): number {
  // Desktop base values
  if (radius <= 1) return device === 'mobile' ? 14 : 15;
  if (radius <= 2) return device === 'mobile' ? 13 : 14;
  if (radius <= 5) return device === 'mobile' ? 12 : 13;
  if (radius <= 10) return device === 'mobile' ? 11 : 12;
  if (radius <= 25) return device === 'desktop' ? 11 : 10;
  if (radius <= 50) return device === 'desktop' ? 10 : 9;
  return device === 'desktop' ? 9 : 8;
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

const RADIUS_PRESETS = [1, 2, 5, 10, 25, 50, 100];

export default function MapPage() {
  const { filters, updatePosition, updateRadius } = useFilters();
  const device = useDeviceType();
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(80);
  const mapRef = useRef<L.Map | null>(null);

  const userPosition: [number, number] | null =
    filters.latitude && filters.longitude
      ? [filters.latitude, filters.longitude]
      : null;

  // France centre par défaut, zoom pays si pas de position
  const mapCenter: [number, number] = userPosition ?? [46.603354, 1.888334];
  const mapZoom = userPosition ? getZoomForRadius(filters.radius, device) : 6;

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

  return (
    <>
      {/* Fixed map container — accounts for fixed header (top) and mobile nav (bottom) */}
      <div
        className="fixed left-0 right-0 bottom-16 xl:bottom-0"
        style={{ top: headerHeight }}
      >
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl={false}
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
          {/* Zoom + / - */}
          <div className="pointer-events-auto flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="flex items-center justify-center w-10 h-10 hover:bg-gray-50 transition-colors border-b border-gray-100"
              title="Zoom +"
            >
              <Plus className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="flex items-center justify-center w-10 h-10 hover:bg-gray-50 transition-colors"
              title="Zoom -"
            >
              <Minus className="h-4 w-4 text-gray-700" />
            </button>
          </div>

          {/* Bottom row: events count + slider + recentrer */}
          <div className="flex items-center gap-2">
            {/* Events count / loading pill */}
            <div className="pointer-events-auto bg-white rounded-full px-3 py-1.5 shadow-lg text-xs text-gray-600 flex items-center gap-1.5 whitespace-nowrap">
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Chargement...
                </>
              ) : (
                `${events.length} événement${events.length !== 1 ? 's' : ''}`
              )}
            </div>

            {/* Radius slider */}
            <div className="pointer-events-auto bg-white rounded-xl shadow-lg px-3 py-2 flex flex-col gap-1 w-40">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Rayon</span>
                <span className="text-xs font-bold text-iakoa-blue">{filters.radius} km</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={RADIUS_PRESETS.indexOf(filters.radius)}
                onChange={(e) => updateRadius(RADIUS_PRESETS[Number(e.target.value)])}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-iakoa-blue"
                style={{
                  background: `linear-gradient(to right, #2563EB 0%, #2563EB ${(RADIUS_PRESETS.indexOf(filters.radius) / 6) * 100}%, #E5E7EB ${(RADIUS_PRESETS.indexOf(filters.radius) / 6) * 100}%, #E5E7EB 100%)`,
                }}
              />
              {/* Labels alignés sur les encoches du slider (offset = demi-largeur du thumb ~6px) */}
              <div className="grid grid-cols-7 text-[9px] text-gray-400">
                {RADIUS_PRESETS.map((p) => (
                  <span key={p} className="text-center">{p}</span>
                ))}
              </div>
            </div>

            {/* Recentrer */}
            {userPosition && (
              <button
                onClick={() => mapRef.current?.flyTo(userPosition, mapZoom, { duration: 1 })}
                className="pointer-events-auto flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                title="Recentrer"
              >
                <LocateFixed className="h-4 w-4 text-iakoa-blue" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
