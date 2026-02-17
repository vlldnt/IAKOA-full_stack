import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPreviewProps {
  radius: number;
}

// Fixer l'icône par défaut de Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function MapPreview({ radius }: MapPreviewProps) {
  const [position, setPosition] = useState<[number, number]>([48.8566, 2.3522]); // Paris par défaut
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (loc) => {
        setPosition([loc.coords.latitude, loc.coords.longitude]);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-600">Chargement de la carte...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-48 rounded-lg overflow-hidden shadow-md border border-gray-200">
      <MapContainer
        center={position}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
            <span className="text-sm">
              Localisation actuelle
              <br />
              {position[0].toFixed(3)}, {position[1].toFixed(3)}
            </span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
