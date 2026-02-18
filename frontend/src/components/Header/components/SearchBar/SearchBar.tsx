import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Sliders, X } from 'lucide-react';
import { FilterMenu, type FilterState } from './FilterMenu';
import { useFilters } from '@/features/events_page/FilterContext';

// Type pour les résultats de ville
interface CityResult {
  name: string;
  region: string;
  lat: number;
  lon: number;
  postcode?: string;
}

// Barre de recherche avec deux champs: mots-clés et ville
// Utilise les icônes lucide-react au lieu de SVG inline
export function SearchBars() {
  const { filters, updateKeyword, updateCity, resetFilters } = useFilters();
  const [keyword, setKeyword] = useState(filters.keyword);
  const [city, setCity] = useState(filters.city);
  const [cityLat, setCityLat] = useState<number | undefined>(filters.latitude);
  const [cityLon, setCityLon] = useState<number | undefined>(filters.longitude);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(
    null,
  );
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<CityResult[]>([]);
  const [cityFocused, setCityFocused] = useState(false);
  const citySearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchroniser les filtres globaux avec l'état local
  useEffect(() => {
    setKeyword(filters.keyword);
    setCity(filters.city);
    setCityLat(filters.latitude);
    setCityLon(filters.longitude);
  }, [filters.keyword, filters.city, filters.latitude, filters.longitude]);

  const filterCount = appliedFilters
    ? (appliedFilters.selectedCategories.length > 0 ? 1 : 0) +
      (appliedFilters.radius !== 2 ? 1 : 0)
    : 0;

  const hasActiveFilters = !!(keyword || city || filterCount > 0
    || filters.dateFrom || filters.dateTo || filters.priceMin !== undefined
    || filters.priceMax !== undefined || filters.isFree);

  const handleClearAll = () => {
    setKeyword('');
    setCity('');
    setCityLat(undefined);
    setCityLon(undefined);
    setAppliedFilters(null);
    resetFilters();
  };

  const handleSearch = () => {
    updateKeyword(keyword);
    updateCity(city, cityLat, cityLon);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOpenFilters = () => {
    setIsFilterMenuOpen(true);
  };

  const handleApplyFilters = (filters: FilterState) => {
    setAppliedFilters(filters);
    // TODO: Appliquer les filtres à la recherche
    console.log('Filtres appliqués:', filters);
  };

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setShowCitySuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,centre,departement&boost=population&limit=5`
      );
      const data = await response.json();

      const cities: CityResult[] = data.map((item: any) => ({
        name: item.nom,
        region: item.departement?.nom || '',
        lat: item.centre?.coordinates?.[1] || 0,
        lon: item.centre?.coordinates?.[0] || 0,
        postcode: item.codesPostaux?.[0],
      }));

      setCitySuggestions(cities);
      setShowCitySuggestions(cities.length > 0);
    } catch (error) {
      console.error('Erreur lors de la recherche de villes:', error);
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  };

  const handleCitySearch = (value: string) => {
    if (citySearchTimeoutRef.current) {
      clearTimeout(citySearchTimeoutRef.current);
    }

    citySearchTimeoutRef.current = setTimeout(() => {
      searchCities(value);
    }, 300);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCity('Ma localisation');
        setCityLat(latitude);
        setCityLon(longitude);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible de récupérer votre localisation');
      },
    );
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-center gap-2 w-full">
        {/* Barre de recherche */}
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 lg:px-5 lg:py-2 gap-2 flex-1 max-w-[calc(100vw-6rem)] md:max-w-none lg:flex-none lg:max-w-5xl">
          {/* Icône recherche - cliquable pour ouvrir le filtre */}
          <button
            onClick={handleOpenFilters}
            className="flex items-center justify-center h-4 w-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
            title="Ouvrir les filtres"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Champ mot-clé */}
          <input
            type="text"
            placeholder="Mots-clés..."
            className="bg-transparent outline-none text-sm flex-1 min-w-0 lg:w-96"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          {/* Séparateur vertical */}
          <div className="h-5 w-px bg-gray-300 shrink-0" />

          {/* Champ ville */}
          <div className="relative flex-1 min-w-0 lg:flex-none lg:w-64">
            <input
              type="text"
              placeholder="Ville..."
              className={`bg-transparent outline-none text-sm w-full ${city === 'Ma localisation' ? 'text-iakoa-blue font-bold' : ''}`}
              value={city}
              onChange={(e) => {
                const value = e.target.value;
                setCity(value);
                setCityLat(undefined);
                setCityLon(undefined);
                handleCitySearch(value);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setCityFocused(true);
                if (city.length >= 2) searchCities(city);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowCitySuggestions(false);
                  setCityFocused(false);
                }, 200);
              }}
            />

            {/* Dropdown : Ma localisation + suggestions villes */}
            {(cityFocused || showCitySuggestions) && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64">
                <button
                  onClick={() => {
                    handleGetLocation();
                    setCityFocused(false);
                    setShowCitySuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-100"
                >
                  <MapPin className="h-3.5 w-3.5 text-iakoa-blue shrink-0" />
                  <span className="font-bold text-sm text-iakoa-blue">Ma localisation</span>
                </button>
                {citySuggestions.map((c) => (
                  <button
                    key={`${c.name}-${c.lat}-${c.lon}`}
                    onClick={() => {
                      const cityText = c.postcode ? `${c.name} (${c.postcode})` : c.name;
                      setCity(cityText);
                      setCityLat(c.lat);
                      setCityLon(c.lon);
                      setShowCitySuggestions(false);
                      setCityFocused(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <span className="font-medium">{c.name}</span>
                    {c.postcode && (
                      <span className="text-gray-400 italic text-xs ml-2">({c.postcode})</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bouton recherche - intégré dans la barre */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 transition-colors shrink-0 ml-1"
            title="Rechercher"
          >
            <Search className="h-4 w-4 text-iakoa-blue" />
          </button>
        </div>

        {/* Bouton clear filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center w-8 h-8 bg-red-400 rounded-full hover:bg-red-500 transition-all duration-200 shrink-0 text-white"
            title="Effacer tous les filtres"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Bouton filtre */}
        <div className="relative">
          <button
            onClick={handleOpenFilters}
            onMouseEnter={() => setShowFilterTooltip(true)}
            onMouseLeave={() => setShowFilterTooltip(false)}
            className="flex items-center justify-center w-8 h-8 lg:w-11 lg:h-11 rounded-full bg-linear-to-br from-iakoa-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md transition-all duration-200 shrink-0 relative group"
            title="Filtres"
          >
            <Sliders className="h-4 w-4 lg:h-5 lg:w-5 text-white" />

            {/* Badge avec nombre de filtres */}
            {filterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                {filterCount}
              </span>
            )}
          </button>

          {/* Tooltip - Liste des filtres appliqués */}
          {showFilterTooltip && appliedFilters && filterCount > 0 && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-56 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                Filtres appliqués
              </h4>
              <div className="space-y-2">
                {appliedFilters.radius !== 2 && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Rayon:</span>{' '}
                      {appliedFilters.radius} km
                    </span>
                    <button
                      onClick={() => {
                        setAppliedFilters({
                          ...appliedFilters,
                          radius: 2,
                        });
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {appliedFilters.selectedCategories.length > 0 && (
                  <div className="p-2 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700 font-medium block mb-2">
                      Catégories ({appliedFilters.selectedCategories.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {appliedFilters.selectedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="text-xs bg-green-200 text-green-900 px-2 py-1 rounded-full"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setAppliedFilters(null);
                  setShowFilterTooltip(false);
                }}
                className="mt-3 w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                Effacer tous les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu de filtres */}
      <FilterMenu
        isOpen={isFilterMenuOpen}
        onClose={() => setIsFilterMenuOpen(false)}
        onApply={handleApplyFilters}
        keyword={keyword}
        city={city}
        onKeywordChange={setKeyword}
        onCityChange={setCity}
      />
    </div>
  );
}
