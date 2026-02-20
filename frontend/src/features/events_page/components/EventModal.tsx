import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X,
  MapPin,
  CalendarDays,
  Globe,
  Building2,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { EventType } from '@/lib/types/EventType';
import {
  getCategoryHexColor,
  getCategoryLabel,
} from '@/lib/constants/filter-categories';
import facebookIcon from '@/assets/icons/facebook.svg';
import instagramIcon from '@/assets/icons/instagram.svg';
import xIcon from '@/assets/icons/X.svg';
import youtubeIcon from '@/assets/icons/youtube.svg';
import tiktokIcon from '@/assets/icons/tiktok.svg';
import googlemapIcon from '@/assets/icons/googlemap.png';
import mapsappleIcon from '@/assets/icons/mapsapple.png';
import wazeIcon from '@/assets/icons/waze.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const IAKOA_BLUE = '#2397FF';

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatPrice(pricing: number): string {
  if (pricing === 0) return 'Gratuit';
  const n = pricing % 1 === 0 ? pricing.toFixed(0) : pricing.toFixed(2);
  return `${n} €`;
}

function getRemainingTime(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Événement terminé';
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (months > 0) return `Dans ${months} mois`;
  if (days > 0) return `Dans ${days} ${days === 1 ? 'jour' : 'jours'}`;
  if (hours > 0) return `Dans ${hours} ${hours === 1 ? 'heure' : 'heures'}`;
  return "Aujourd'hui";
}

const SOCIAL_LINKS: Array<{
  key: 'facebook' | 'instagram' | 'x' | 'youtube' | 'tiktok';
  label: string;
  icon: string;
}> = [
  { key: 'facebook', label: 'Facebook', icon: facebookIcon },
  { key: 'instagram', label: 'Instagram', icon: instagramIcon },
  { key: 'x', label: 'X', icon: xIcon },
  { key: 'youtube', label: 'YouTube', icon: youtubeIcon },
  { key: 'tiktok', label: 'TikTok', icon: tiktokIcon },
];

const NAV_APPS = (lat: number, lng: number) => [
  {
    label: 'Google Maps',
    icon: googlemapIcon,
    url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  },
  {
    label: 'Apple Maps',
    icon: mapsappleIcon,
    url: `https://maps.apple.com/?ll=${lat},${lng}&z=15`,
  },
  {
    label: 'Waze',
    icon: wazeIcon,
    url: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  },
];

interface EventModalProps {
  event: EventType;
  onClose: () => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Divider() {
  return <hr className="border-gray-100" />;
}

function WebsiteButton({ url }: { url?: string | null }) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: IAKOA_BLUE }}
      >
        <Globe className="h-4 w-4" />
        Voir le site de l'évènement
      </a>
    );
  }
  return (
    <button
      disabled
      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed"
    >
      <Globe className="h-4 w-4" />
      Voir le site de l'évènement
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function EventModal({ event, onClose }: EventModalProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [isDescTruncated, setIsDescTruncated] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  const photo =
    event.media?.find((m) => m.type?.startsWith('image'))?.url ??
    event.media?.[0]?.url;
  const social = event.company?.socialNetworks;
  const websiteUrl = event.website || event.company?.website;
  const { lat, lng } = event.location.coordinates ?? {};
  const hasCoords = lat != null && lng != null;

  const addressLine = [
    event.location.address,
    event.location.postalCode,
    event.location.city,
  ]
    .filter(Boolean)
    .join(', ');

  // Detect if description overflows 4 lines
  useEffect(() => {
    const el = descRef.current;
    if (el) {
      setIsDescTruncated(el.scrollHeight > el.clientHeight + 2);
    }
  }, [event.description]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col w-full max-h-[92vh] overflow-hidden"
        style={{ maxWidth: 'min(98vw, 860px)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
        >
          <X className="h-4 w-4 text-gray-700" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex flex-col">
          {/* ── 1. Photo ── */}
          <div className="h-64 sm:h-80 shrink-0 bg-gray-100">
            {photo ? (
              <img
                src={photo}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                <Globe
                  className="h-14 w-14 opacity-20"
                  style={{ color: IAKOA_BLUE }}
                />
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <div className="flex flex-col gap-4 p-6">
            {/* ── 2. Catégories + Titre ── */}
            {event.categories?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {event.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: getCategoryHexColor(cat) }}
                  >
                    {getCategoryLabel(cat)}
                  </span>
                ))}
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 leading-snug">
              {event.name}
            </h2>

            <Divider />

            {/* ── 3. Adresse + Créé par + Réseaux ── */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin
                  className="h-4 w-4 shrink-0 mt-0.5"
                  style={{ color: IAKOA_BLUE }}
                />
                <span>{addressLine}</span>
              </div>

              {(event.company?.name ||
                (social && Object.values(social).some(Boolean))) && (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {event.company?.name && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Building2
                        className="h-4 w-4 shrink-0"
                        style={{ color: IAKOA_BLUE }}
                      />
                      <span>
                        Créé par{' '}
                        <span className="font-semibold text-gray-700">
                          {event.company.name}
                        </span>
                      </span>
                    </div>
                  )}
                  {social && Object.values(social).some(Boolean) && (
                    <div className="flex gap-2.5">
                      {SOCIAL_LINKS.filter(({ key }) => social[key]).map(
                        ({ key, label, icon }) => (
                          <a
                            key={key}
                            href={social[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={label}
                            className="transition-opacity hover:opacity-70"
                          >
                            <img
                              src={icon}
                              alt={label}
                              width={28}
                              height={28}
                            />
                          </a>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Divider />

            {/* ── 4. Prix + Date ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span
                className="text-base font-bold"
                style={{ color: IAKOA_BLUE }}
              >
                {event.pricing === 0 ? 'Gratuit' : `à partir de ${formatPrice(event.pricing)}`}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CalendarDays
                    className="h-4 w-4 shrink-0"
                    style={{ color: IAKOA_BLUE }}
                  />
                  <span className="font-bold italic">
                    {formatDate(event.date)}
                  </span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {getRemainingTime(event.date)}
                </span>
              </div>
            </div>

            <Divider />

            {/* ── 5. Description (repliable) ── */}
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Description de l'évènement
              </p>
              {event.description ? (
                <>
                  <p
                    ref={descRef}
                    className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line transition-all ${
                      descExpanded ? '' : 'line-clamp-10'
                    }`}
                  >
                    {event.description.replace(/\\n/g, '\n')}
                  </p>
                  {isDescTruncated && (
                    <button
                      onClick={() => setDescExpanded((v) => !v)}
                      className="flex items-center gap-1 text-xs font-semibold self-start transition-opacity hover:opacity-70"
                      style={{ color: IAKOA_BLUE }}
                    >
                      {descExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" /> Voir moins
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" /> Voir plus
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Aucune description disponible.
                </p>
              )}
            </div>

            <Divider />

            {/* ── 6. Carte + Adresse ── */}
            {hasCoords && (
              <div className="flex flex-col gap-3">
                {/* Map paysage */}
                <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-100">
                  <MapContainer
                    center={[lat, lng]}
                    zoom={14}
                    className="w-full h-full"
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                    attributionControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[lat, lng]} />
                  </MapContainer>
                </div>

                {/* Hint + icônes navigation */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Cliquer pour y aller
                  </p>
                  <div className="flex gap-3">
                    {NAV_APPS(lat, lng).map(({ label, icon, url }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={label}
                        className="transition-opacity hover:opacity-70"
                      >
                        <img
                          src={icon}
                          alt={label}
                          className="w-9 h-9 object-contain rounded-lg"
                        />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Adresse répétée */}
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <MapPin
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: IAKOA_BLUE }}
                  />
                  <span>{addressLine}</span>
                </div>
              </div>
            )}

            <Divider />

            {/* ── Actions + Bouton site ── */}
            <div className="flex gap-2">
              <button
                disabled
                title="Partager (bientôt disponible)"
                className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed"
              >
                <Share2 className="h-4 w-4" />
                Partager
              </button>
              <button
                disabled
                title="Ajouter aux favoris (bientôt disponible)"
                className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed"
              >
                <Heart className="h-4 w-4" />
                Favoris
              </button>
            </div>

            <WebsiteButton url={websiteUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
