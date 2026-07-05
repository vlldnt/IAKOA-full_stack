import { useRef, useState } from 'react';

export interface CityResult {
  name: string;
  region: string;
  lat: number;
  lon: number;
  postcode?: string;
}

interface GeoApiCommune {
  nom: string;
  departement?: { nom: string };
  centre?: { coordinates?: [number, number] };
  codesPostaux?: string[];
}

const GEO_API_URL = 'https://geo.api.gouv.fr/communes';
const DEBOUNCE_MS = 300;

// Autocomplétion de villes françaises (geo.api.gouv.fr), avec debounce.
// Partagé entre la SearchBar du header et le menu de filtres.
export function useCitySearch() {
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `${GEO_API_URL}?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,centre,departement&boost=population&limit=5`,
      );
      const data: GeoApiCommune[] = await response.json();

      const cities: CityResult[] = data.map(item => ({
        name: item.nom,
        region: item.departement?.nom || '',
        lat: item.centre?.coordinates?.[1] || 0,
        lon: item.centre?.coordinates?.[0] || 0,
        postcode: item.codesPostaux?.[0],
      }));

      setSuggestions(cities);
      setShowSuggestions(cities.length > 0);
    } catch (error) {
      console.error('Erreur lors de la recherche de villes:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Version debouncée pour la saisie au clavier
  const searchCitiesDebounced = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCities(query), DEBOUNCE_MS);
  };

  const hideSuggestions = () => setShowSuggestions(false);

  return {
    suggestions,
    showSuggestions,
    searchCities,
    searchCitiesDebounced,
    hideSuggestions,
  };
}

// Libellé affiché pour une ville sélectionnée : "Nom (code postal)"
export function formatCityLabel(city: CityResult): string {
  return city.postcode ? `${city.name} (${city.postcode})` : city.name;
}
