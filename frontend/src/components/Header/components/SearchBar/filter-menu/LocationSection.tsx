import { lazy, Suspense } from 'react';

// Chargée à la demande : leaflet reste hors du bundle principal
const MapPreview = lazy(() =>
  import('../MapPreview').then(module => ({ default: module.MapPreview })),
);

const RADIUS_PRESETS = [1, 2, 5, 10, 25, 50, 100];

interface LocationSectionProps {
  radius: number;
  userPosition: [number, number] | null;
  onRadiusChange: (radius: number) => void;
}

// Colonne "Localisation" : slider de rayon + carte de prévisualisation
export function LocationSection({ radius, userPosition, onRadiusChange }: LocationSectionProps) {
  const radiusIndex = RADIUS_PRESETS.indexOf(radius);

  return (
    <div className="shrink-0 w-full lg:w-90 overflow-y-auto py-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Localisation</h3>
      <div className="space-y-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Rayon</span>
            <span className="text-xl font-bold text-iakoa-blue">{radius} km</span>
          </div>

          <input
            type="range"
            min="0"
            max="6"
            value={radiusIndex}
            onChange={e => onRadiusChange(RADIUS_PRESETS[Number(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-iakoa-blue"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(radiusIndex / 6) * 100}%, #E5E7EB ${(radiusIndex / 6) * 100}%, #E5E7EB 100%)`,
            }}
          />

          {/* Marqueurs des valeurs */}
          <div className="flex justify-between text-xs text-gray-600 font-medium">
            {RADIUS_PRESETS.map(preset => (
              <span key={preset} className="text-center w-6">
                {preset}
              </span>
            ))}
          </div>
        </div>

        {/* Carte - cachée en mobile/tablette */}
        <div className="hidden lg:block">
          <Suspense fallback={<div className="w-full h-48 rounded-xl bg-gray-100 animate-pulse" />}>
            <MapPreview radius={radius} userPosition={userPosition} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
