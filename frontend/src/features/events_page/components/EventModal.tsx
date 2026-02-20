import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, CalendarDays, Globe, Building2 } from 'lucide-react';
import type { EventType } from '@/lib/types/EventType';
import { getCategoryHexColor } from '@/lib/constants/filter-categories';
import facebookIcon from '@/assets/icons/facebook.svg';
import instagramIcon from '@/assets/icons/instagram.svg';
import xIcon from '@/assets/icons/X.svg';
import youtubeIcon from '@/assets/icons/youtube.svg';
import tiktokIcon from '@/assets/icons/tiktok.svg';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const IAKOA_BLUE = '#2397FF';

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatPrice(pricing: number): string {
  if (pricing === 0) return 'Gratuit';
  return `${(pricing / 100).toFixed(2).replace('.', ',')} €`;
}

function getRemainingTime(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Événement terminé';
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const days   = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours  = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (months > 0) return `Dans ${months} mois`;
  if (days > 0)   return `Dans ${days} ${days === 1 ? 'jour' : 'jours'}`;
  if (hours > 0)  return `Dans ${hours} ${hours === 1 ? 'heure' : 'heures'}`;
  return "Aujourd'hui";
}

const SOCIAL_LINKS: Array<{
  key: 'facebook' | 'instagram' | 'x' | 'youtube' | 'tiktok';
  label: string;
  icon: string;
}> = [
  { key: 'facebook',  label: 'Facebook',  icon: facebookIcon  },
  { key: 'instagram', label: 'Instagram', icon: instagramIcon },
  { key: 'x',        label: 'X',         icon: xIcon         },
  { key: 'youtube',  label: 'YouTube',   icon: youtubeIcon   },
  { key: 'tiktok',   label: 'TikTok',    icon: tiktokIcon    },
];

const NAV_LINKS = (lat: number, lng: number) => [
  { label: 'OpenStreetMap', url: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`, color: '#7EBC6F' },
  { label: 'Google Maps',   url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,              color: '#4285F4' },
  { label: 'Waze',          url: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,                          color: '#33CCFF' },
];

interface EventModalProps {
  event: EventType;
  onClose: () => void;
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function AddressBlock({ location }: { location: EventType['location'] }) {
  return (
    <div className="flex items-start gap-1.5 text-sm text-gray-500">
      <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: IAKOA_BLUE }} />
      <div>
        {location.address && <p>{location.address}</p>}
        <p className="font-medium text-gray-700">{location.city} {location.postalCode}</p>
      </div>
    </div>
  );
}

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl overflow-hidden border border-gray-100" style={{ width: 180, height: 180, maxWidth: '100%' }}>
        <MapContainer
          center={[lat, lng]}
          zoom={13}
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
      <div className="flex gap-1.5 flex-wrap">
        {NAV_LINKS(lat, lng).map(({ label, url, color }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white transition-opacity hover:opacity-85"
            style={{ background: color }}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
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
  const photo      = event.media?.find((m) => m.type?.startsWith('image'))?.url ?? event.media?.[0]?.url;
  const social     = event.company?.socialNetworks;
  const websiteUrl = event.website || event.company?.website;
  const { lat, lng } = event.location.coordinates ?? {};
  const hasCoords  = lat != null && lng != null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row w-full lg:h-[82vh]"
        style={{ minWidth: 'min(75vw, calc(100vw - 2rem))', maxWidth: '92vw', maxHeight: '92vh' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
        >
          <X className="h-4 w-4 text-gray-700" />
        </button>

        {/* ══════════════════════════════════════════════════════════
            COL GAUCHE
            ── LG : photo (flex-1) + rangée bas [titre+adresse | minimap]
            ── Mobile : photo fixe + titre+adresse
        ══════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 flex flex-col overflow-hidden shrink-0">

          {/* Photo */}
          <div className="h-52 lg:flex-1 lg:min-h-0 shrink-0 bg-gray-100">
            {photo ? (
              <img src={photo} alt={event.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                <Globe className="h-14 w-14 opacity-20" style={{ color: IAKOA_BLUE }} />
              </div>
            )}
          </div>

          {/* LG only — rangée du bas : titre+adresse | minimap */}
          <div className="hidden lg:flex border-t border-gray-100 shrink-0">
            {/* Titre + adresse */}
            <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
              <h2 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
                {event.name}
              </h2>
              <AddressBlock location={event.location} />
            </div>

            {/* Mini carte */}
            {hasCoords && (
              <div className="shrink-0 p-3 flex items-start">
                <MiniMap lat={lat} lng={lng} />
              </div>
            )}
          </div>

          {/* Mobile only — titre + adresse */}
          <div className="lg:hidden p-4 flex flex-col gap-2 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 leading-snug">
              {event.name}
            </h2>
            <AddressBlock location={event.location} />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            COL DROITE / CONTENU MOBILE
        ══════════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-gray-100">

          {/* Catégories */}
          {event.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{ background: getCategoryHexColor(cat) }}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Date + temps restant + prix */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <CalendarDays className="h-4 w-4 shrink-0" style={{ color: IAKOA_BLUE }} />
              <span className="font-medium">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center justify-between pl-6">
              <p className="text-xs text-gray-400">{getRemainingTime(event.date)}</p>
              <span className="text-sm font-bold" style={{ color: IAKOA_BLUE }}>
                {formatPrice(event.pricing)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 min-h-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Description de l'évènement
            </p>
            {event.description ? (
              <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Aucune description disponible.</p>
            )}
          </div>

          {/* Bouton site */}
          <WebsiteButton url={websiteUrl} />

          {/* Mobile only — mini carte */}
          {hasCoords && (
            <div className="lg:hidden flex justify-center">
              <MiniMap lat={lat} lng={lng} />
            </div>
          )}

          {/* Bas : company + réseaux sociaux */}
          {(event.company?.name || (social && Object.values(social).some(Boolean))) && (
            <div className="flex flex-col items-center gap-2 pt-3 border-t border-gray-100">
              {event.company?.name && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Building2 className="h-4 w-4 shrink-0" style={{ color: IAKOA_BLUE }} />
                  <span>
                    Créé par{' '}
                    <span className="font-semibold text-gray-700">{event.company.name}</span>
                  </span>
                </div>
              )}
              {social && Object.values(social).some(Boolean) && (
                <div className="flex gap-3 justify-center">
                  {SOCIAL_LINKS.filter(({ key }) => social[key]).map(({ key, label, icon }) => (
                    <a
                      key={key}
                      href={social[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={label}
                      className="transition-opacity hover:opacity-70"
                    >
                      <img src={icon} alt={label} width={32} height={32} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
