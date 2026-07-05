import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useCitySearch, formatCityLabel } from '@/lib/hooks/useCitySearch';

interface FilterMenuSearchBarProps {
  keyword: string;
  city: string;
  cityError: boolean;
  geoError: string | null;
  onKeywordChange?: (keyword: string) => void;
  onCityChange?: (city: string) => void;
  onCityPicked: (lat: number, lon: number) => void;
  onGeolocate: () => void;
  onCityCleared: () => void;
}

// Barre mot-clé + ville (avec autocomplétion et géolocalisation) du menu de filtres
export function FilterMenuSearchBar({
  keyword,
  city,
  cityError,
  geoError,
  onKeywordChange,
  onCityChange,
  onCityPicked,
  onGeolocate,
  onCityCleared,
}: FilterMenuSearchBarProps) {
  const { suggestions, showSuggestions, searchCities, searchCitiesDebounced, hideSuggestions } =
    useCitySearch();
  const [cityFocused, setCityFocused] = useState(false);

  return (
    <div
      className={`flex items-center bg-white rounded-full px-4 py-2 gap-2 shadow-sm transition-all ${cityError ? 'ring-2 ring-red-400 shadow-red-100' : ''}`}
    >
      {/* Champ mot-clé */}
      <input
        type="text"
        placeholder="Mots-clés..."
        className="bg-transparent outline-none text-sm flex-1 min-w-0"
        value={keyword}
        onChange={e => onKeywordChange?.(e.target.value)}
      />

      {/* Séparateur vertical */}
      <div className="flex items-center h-6">
        <div className="w-px bg-gray-300 h-5" />
      </div>

      {/* Champ ville avec autocomplétion */}
      <div className="flex-1 min-w-0 relative">
        <input
          type="text"
          placeholder={cityError ? '⚠ Ville requise' : 'Ville...'}
          className={`bg-transparent outline-none text-sm w-full ${city === 'Ma localisation' ? 'text-iakoa-blue font-bold' : ''} ${cityError ? 'placeholder:text-red-500 placeholder:font-semibold' : ''}`}
          value={city}
          onChange={e => {
            const value = e.target.value;
            if (value) onCityCleared();
            onCityChange?.(value);
            searchCitiesDebounced(value);
          }}
          onFocus={() => {
            setCityFocused(true);
            if (city.length >= 2) searchCities(city);
          }}
          onBlur={() => {
            setTimeout(() => {
              hideSuggestions();
              setCityFocused(false);
            }, 200);
          }}
        />

        {/* Erreur géolocalisation */}
        {geoError && (
          <div className="absolute top-full left-0 right-0 mt-1 z-200 bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-3 py-2 rounded-lg shadow">
            {geoError}
          </div>
        )}

        {/* Dropdown : Ma localisation + suggestions villes */}
        {(cityFocused || showSuggestions) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-200">
            <button
              onClick={() => {
                onGeolocate();
                setCityFocused(false);
                hideSuggestions();
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-100"
            >
              <MapPin className="h-3.5 w-3.5 text-iakoa-blue shrink-0" />
              <span className="font-bold text-sm text-iakoa-blue">Ma localisation</span>
            </button>

            {suggestions.map(c => (
              <button
                key={`${c.name}-${c.lat}-${c.lon}`}
                onClick={() => {
                  onCityChange?.(formatCityLabel(c));
                  onCityPicked(c.lat, c.lon);
                  hideSuggestions();
                  setCityFocused(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors text-sm"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-gray-500 italic ml-2">({c.region})</span>
                {c.postcode && (
                  <span className="text-gray-400 italic text-xs ml-2">({c.postcode})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
