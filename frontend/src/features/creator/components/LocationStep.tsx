import { useState } from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { useCitySearch, formatCityLabel } from '@/lib/hooks/useCitySearch';
import type { CityResult } from '@/lib/hooks/useCitySearch';
import type { EventFormData } from '../form-utils';

interface LocationStepProps {
  form: EventFormData;
  onChange: (patch: Partial<EventFormData>) => void;
}

// Étape 3 : lieu de l'événement. La sélection d'une ville dans les
// suggestions fournit les coordonnées GPS exigées par l'API.
export function LocationStep({ form, onChange }: LocationStepProps) {
  const { suggestions, showSuggestions, searchCitiesDebounced, hideSuggestions } = useCitySearch();
  const [cityInput, setCityInput] = useState(form.city);

  const selectCity = (city: CityResult) => {
    setCityInput(city.name);
    hideSuggestions();
    onChange({
      city: city.name,
      postalCode: city.postcode ?? form.postalCode,
      lat: city.lat,
      lng: city.lon,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
        <input
          type="text"
          value={cityInput}
          onChange={e => {
            setCityInput(e.target.value);
            searchCitiesDebounced(e.target.value);
            // Toute modification manuelle invalide la sélection précédente
            if (e.target.value !== form.city) {
              onChange({ city: '', lat: undefined, lng: undefined });
            }
          }}
          placeholder="Commencez à taper puis sélectionnez…"
          className="input input-bordered w-full"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map(city => (
              <li key={`${city.name}-${city.postcode}`}>
                <button
                  type="button"
                  onClick={() => selectCity(city)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="flex-1">{formatCityLabel(city)}</span>
                  <span className="text-xs text-gray-400">{city.region}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {form.city && form.lat != null && (
          <p className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {form.city} — position GPS enregistrée
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse (optionnel)</label>
        <input
          type="text"
          value={form.address}
          onChange={e => onChange({ address: e.target.value })}
          maxLength={255}
          placeholder="Ex : 12 place de la Mairie"
          className="input input-bordered w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
          <input
            type="text"
            value={form.postalCode}
            onChange={e => onChange({ postalCode: e.target.value.slice(0, 20) })}
            placeholder="75001"
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
          <input
            type="text"
            value={form.country}
            onChange={e => onChange({ country: e.target.value })}
            maxLength={100}
            className="input input-bordered w-full"
          />
        </div>
      </div>
    </div>
  );
}
