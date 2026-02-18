import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const [position, setPosition] = useState<[number, number]>([44.3497, 2.5737]);
  const [isLoading, setIsLoading] = useState(false);
  const zoom = calculateZoomForRadius(radius);

  useEffect(() => {
    // Si une position utilisateur est fournie, l'utiliser
    if (userPosition) {
      setPosition(userPosition);
      setIsLoading(false);
    }
  }, [userPosition]);

  if (isLoading) {
    return (
      <div className="w-90 h-90 bg-gray-200 rounded-lg lg:flex items-center justify-center">
        <span className="text-gray-600">Chargement de la carte...</span>
      </div>
    );
  }

  return (
    <div className="w-90 h-90 rounded-lg overflow-hidden shadow-md border border-gray-200 mx-auto">
      <MapContainer
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
    </div>
  );
}
