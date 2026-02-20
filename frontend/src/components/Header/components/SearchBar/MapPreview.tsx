import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';

interface MapPreviewProps {
  radius: number;
  userPosition?: [number, number] | null;
}

// Fixer l'icône par défaut de Leaflet
const defaultIcon = L.icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Calculer le zoom adapté au rayon pour voir le cercle complet
function calculateZoomForRadius(radius: number): number {
  if (radius <= 1) return 14;
  if (radius <= 2) return 13;
  if (radius <= 5) return 12;
  if (radius <= 10) return 11;
  if (radius <= 25) return 9;
  if (radius <= 50) return 8;
  return 7;
}

export function MapPreview({ radius, userPosition }: MapPreviewProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const zoom = calculateZoomForRadius(radius);

  useEffect(() => {
    if (userPosition) {
      setPosition(userPosition);
    } else {
      setPosition(null);
    }
  }, [userPosition]);

  if (!position) {
    return (
      <div className="w-90 h-90 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center gap-2 mx-auto">
        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm text-gray-400 text-center px-4">Pas de localisation sélectionnée</span>
      </div>
    );
  }

  return (
    <div className="w-90 h-90 rounded-lg overflow-hidden shadow-md border border-gray-200 mx-auto relative">
      <MapContainer
        ref={mapRef}
        center={position}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        dragging={true}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        attributionControl={false}
        key={`${position[0]}-${position[1]}-${zoom}`}
      >

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Cercle de rayon */}
        <Circle
          center={position}
          radius={radius * 1000} // Convertir km en mètres
          pathOptions={{
            color: '#3B82F6', // Couleur IAKOA blue
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            weight: 2,
          }}
        />

        {/* Marqueur de localisation */}
        <Marker position={position} icon={defaultIcon}>
          <Popup>
            <span className="text-sm font-medium">
              Ma Localisation
            </span>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Bouton recentrer */}
      <button
        onClick={() => mapRef.current?.flyTo(position, zoom, { duration: 0.6 })}
        className="absolute bottom-2 right-2 z-1000 flex items-center justify-center w-7 h-7 bg-white rounded-md shadow-md hover:bg-gray-50 transition-colors"
        title="Recentrer"
      >
        <LocateFixed className="w-4 h-4 text-iakoa-blue" />
      </button>
    </div>
  );
}
