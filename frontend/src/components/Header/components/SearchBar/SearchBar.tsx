import { useState } from 'react';
import { Search, MapPin, Sliders, Loader } from 'lucide-react';
import { FilterMenu, type FilterState } from './FilterMenu';

// Barre de recherche avec deux champs: mots-clés et ville
// Utilise les icônes lucide-react au lieu de SVG inline
export function SearchBars() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);
  const [showFilterTooltip, setShowFilterTooltip] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const filterCount = appliedFilters
    ? (appliedFilters.selectedCategories.length > 0 ? 1 : 0) +
      (appliedFilters.radius !== 2 ? 1 : 0)
    : 0;

  const handleSearch = () => {
    if (keyword || city) {
      // TODO: Implémenter la logique de recherche côté serveur
      // Exemple: naviguer vers /search?keyword=${keyword}&city=${city}
    }
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // TODO: Convertir les coordonnées en nom de ville via une API (reverse geocoding)
        // Pour l'instant, on affiche les coordonnées
        setCity(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible de récupérer votre localisation');
        setIsLoadingLocation(false);
      }
    );
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 w-full">
        {/* Barre de recherche */}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2 flex-1 lg:flex-none lg:max-w-3xl">
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
            className="bg-transparent outline-none text-sm flex-1 min-w-0 lg:w-72"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={handleOpenFilters}
          />

          {/* Séparateur vertical */}
          <div className="h-5 w-px bg-gray-300 shrink-0" />

          {/* Champ ville avec bouton de localisation */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="Ville..."
              className="bg-transparent outline-none text-sm flex-1 min-w-0 lg:w-48"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={handleOpenFilters}
            />

            {/* Bouton localisation GPS */}
            <button
              onClick={handleGetLocation}
              disabled={isLoadingLocation}
              className="flex items-center justify-center h-5 w-5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0 disabled:opacity-40"
              title="Utiliser ma localisation"
            >
              {isLoadingLocation ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </button>
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

        {/* Bouton filtre - seulement sur lg */}
        <div className="hidden lg:block relative">
          <button
            onClick={handleOpenFilters}
            onMouseEnter={() => setShowFilterTooltip(true)}
            onMouseLeave={() => setShowFilterTooltip(false)}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-linear-to-br from-iakoa-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md transition-all duration-200 shrink-0 relative group"
            title="Filtres"
          >
            <Sliders className="h-5 w-5 text-white" />

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
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Filtres appliqués</h4>
              <div className="space-y-2">
                {appliedFilters.radius !== 2 && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Rayon:</span> {appliedFilters.radius} km
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
      />
    </>
  );
}
