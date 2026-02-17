import { useState, useRef, useEffect } from 'react';
import {
  X,
  MapPin,
  Check,
  Music,
  Dumbbell,
  Gamepad2,
  ChefHat,
  Brain,
  ShoppingBag,
  Theater,
  SkipForward,
  Palette,
  Film,
  BookOpen,
  Mountain,
  Wind,
  UtensilsCrossed,
  Lightbulb,
  Globe,
  Heart,
  Users,
  Sparkles,
  Wine,
  Leaf,
} from 'lucide-react';
import { FILTER_CATEGORY_GROUPS } from '@/lib/constants/filter-categories';
import { MapPreview } from './MapPreview';
import iakoaLogo from '@/assets/logo-iakoa.svg';
import { useFilters } from '@/features/events_page/FilterContext';

// Type pour les résultats de ville
interface CityResult {
  name: string;
  region: string;
  lat: number;
  lon: number;
  postcode?: string;
}

// Mapping des IDs de sous-catégories à leurs icônes
const SUBCATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  // Arts & Culture
  CONCERT: Music,
  THEATRE: Theater,
  SPECTACLE: SkipForward,
  DANSE: Music,
  CINEMA: Film,
  ART: Palette,
  PEINTURE: Palette,
  PHOTOGRAPHIE: Film,
  EXPOSITION: Sparkles,
  MUSEE: BookOpen,
  LECTURE: BookOpen,
  // Sports & Bien-être
  TRAIL: Mountain,
  SPORT: Dumbbell,
  COMPETITION: Dumbbell,
  RANDONNEE: Mountain,
  NAUTISME: Wind,
  YOGA: Heart,
  MEDITATION: Heart,
  BIENETRE: Heart,
  DEVELOPPEMENTPERSONNEL: Brain,
  // Loisirs & Divertissements
  JEUX: Gamepad2,
  JEUXVIDEO: Gamepad2,
  ESPORT: Gamepad2,
  MANGA: BookOpen,
  COSPLAY: Sparkles,
  FESTIVAL: Sparkles,
  FETELOCALE: Users,
  FERIA: Users,
  SOIREE: Users,
  JOURNEE: Sparkles,
  // Gastronomie
  REPAS: UtensilsCrossed,
  DEJEUNER: UtensilsCrossed,
  COURSDECUISINE: ChefHat,
  DEGUSTATION: Wine,
  BAR: Wine,
  // Savoir & Découverte
  CONFERENCE: Brain,
  FORMATION: BookOpen,
  LANGUES: Globe,
  SCIENCE: Lightbulb,
  DECOUVERTE: Sparkles,
  PATRIMOINE: Globe,
  VISITE: Globe,
  ATELIER: Lightbulb,
  // Marché & Commerce
  MARCHE: ShoppingBag,
  BROCANTE: ShoppingBag,
  VIDEGRENIER: ShoppingBag,
  ENCHERES: ShoppingBag,
  // Causes Sociales & Écologie
  ANIMAUX: Heart,
  BENEVOLAT: Users,
  ECOLOGIE: Leaf,
  SOLIDARITE: Heart,
};

interface FilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  keyword?: string;
  city?: string;
  onKeywordChange?: (keyword: string) => void;
  onCityChange?: (city: string) => void;
}

export interface FilterState {
  radius: number;
  selectedCategories: string[];
}

const RADIUS_PRESETS = [1, 2, 5, 10, 25, 50, 100];

export function FilterMenu({
  isOpen,
  onClose,
  onApply,
  keyword = '',
  city = '',
  onKeywordChange,
  onCityChange,
}: FilterMenuProps) {
  const { filters, updateRadius, updateCategories, updateCity: updateCityFilter, updateKeyword: updateKeywordFilter } = useFilters();
  const [radius, setRadius] = useState(filters.radius);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.selectedCategories);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [cityLat, setCityLat] = useState<number | undefined>(filters.latitude);
  const [cityLon, setCityLon] = useState<number | undefined>(filters.longitude);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<CityResult[]>([]);
  const hoveredGroupRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const citySearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchroniser les filtres locaux avec les filtres globaux
  useEffect(() => {
    setRadius(filters.radius);
    setSelectedCategories(filters.selectedCategories);
  }, [filters.radius, filters.selectedCategories]);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas disponible dans votre navigateur');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        setUserPosition([location.coords.latitude, location.coords.longitude]);
      },
      () => {
        alert('Impossible d\'accéder à votre localisation. Vérifiez les permissions.');
      }
    );
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

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleSelectAllInGroup = (groupId: string) => {
    const group = FILTER_CATEGORY_GROUPS.find((g) => g.id === groupId);
    if (!group) return;

    const groupCategoryIds = group.subcategories.map((sub) => sub.id);
    const allSelected = groupCategoryIds.every((id) =>
      selectedCategories.includes(id)
    );

    setSelectedCategories((prev) => {
      if (allSelected) {
        return prev.filter((id) => !groupCategoryIds.includes(id));
      } else {
        const newCategories = new Set(prev);
        groupCategoryIds.forEach((id) => newCategories.add(id));
        return Array.from(newCategories);
      }
    });
  };

  const getSelectedCount = (groupId: string) => {
    const group = FILTER_CATEGORY_GROUPS.find((g) => g.id === groupId);
    if (!group) return 0;
    return group.subcategories.filter((sub) =>
      selectedCategories.includes(sub.id)
    ).length;
  };

  const handleApply = () => {
    // Mettre à jour tous les filtres globaux d'un coup
    updateKeywordFilter(keyword);
    updateCityFilter(city, cityLat, cityLon);
    updateRadius(radius);
    updateCategories(selectedCategories);

    onApply({ radius, selectedCategories });
    onClose();
  };

  const handleReset = () => {
    setRadius(2);
    setSelectedCategories([]);
  };

  return (
    <>
      {/* Backdrop avec animation */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 pointer-events-none"
        onClick={onClose}
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      {/* Menu de filtres avec animation */}
      <div
        className="fixed top-0 left-0 right-0 bg-white shadow-2xl z-50 overflow-y-auto transition-all duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isOpen ? 1 : 0,
          maxHeight: isOpen ? '90vh' : '0',
        }}
      >
        {/* Header avec Logo et SearchBar */}
        <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            {/* Logo et titre */}
            <div className="flex items-center justify-between mb-4">
              <img src={iakoaLogo} alt="Logo IAKOA" className="w-32" />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* SearchBar */}
            <div className="flex items-center bg-white rounded-full px-4 py-2 gap-2 shadow-sm">
              {/* Champ mot-clé */}
              <input
                type="text"
                placeholder="Mots-clés..."
                className="bg-transparent outline-none text-sm flex-1 min-w-0"
                value={keyword}
                onChange={(e) => onKeywordChange?.(e.target.value)}
              />

              {/* Séparateur vertical - au milieu */}
              <div className="flex items-center h-6">
                <div className="w-px bg-gray-300 h-5" />
              </div>

              {/* Champ ville avec autocomplétion API Nominatim */}
              <div className="flex-1 min-w-0 relative">
                <input
                  type="text"
                  placeholder="Ville..."
                  className="bg-transparent outline-none text-sm w-full"
                  value={city}
                  onChange={(e) => {
                    const value = e.target.value;
                    onCityChange?.(value);
                    handleCitySearch(value);
                  }}
                  onFocus={() => {
                    if (city.length >= 2) {
                      searchCities(city);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowCitySuggestions(false), 200);
                  }}
                />

                {/* Suggestions de villes */}
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {citySuggestions.map((c) => (
                      <button
                        key={`${c.name}-${c.lat}-${c.lon}`}
                        onClick={() => {
                          const cityText = c.postcode ? `${c.name} (${c.postcode})` : c.name;
                          onCityChange?.(cityText);
                          setCityLat(c.lat);
                          setCityLon(c.lon);
                          setUserPosition([c.lat, c.lon]);
                          setShowCitySuggestions(false);
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

              {/* Bouton localisation */}
              <button
                onClick={handleGeolocation}
                className="flex items-center justify-center h-5 w-5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                title="Utiliser ma localisation"
              >
                <MapPin className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu des filtres - 3 colonnes */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6 relative">
            {/* Colonne 1: Carte avec Rayon */}
            <div className="shrink-0 w-full lg:w-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Localisation
              </h3>
              <div className="space-y-4">
                {/* Slider avec 7 crans */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Rayon
                    </span>
                    <span className="text-xl font-bold text-iakoa-blue">
                      {radius} km
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={RADIUS_PRESETS.indexOf(radius)}
                    onChange={(e) =>
                      setRadius(RADIUS_PRESETS[Number(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-iakoa-blue"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(RADIUS_PRESETS.indexOf(radius) / 6) * 100}%, #E5E7EB ${(RADIUS_PRESETS.indexOf(radius) / 6) * 100}%, #E5E7EB 100%)`,
                    }}
                  />

                  {/* Marqueurs des valeurs */}
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    {RADIUS_PRESETS.map((preset) => (
                      <span key={preset} className="text-center w-6">
                        {preset}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Carte - cachée en mobile/tablette */}
                <div className="hidden lg:block">
                  <MapPreview radius={radius} userPosition={userPosition} />
                </div>
              </div>
            </div>

            {/* Colonne 2: Catégories principales */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Catégories
              </h3>
              <div className="grid grid-cols-1 gap-3 relative">
                {FILTER_CATEGORY_GROUPS.map((group) => {
                  const selectedCount = getSelectedCount(group.id);
                  const isGroupSelected = selectedCount === group.subcategories.length && selectedCount > 0;
                  const isHovered = hoveredGroup === group.id;

                  return (
                    <div
                      key={group.id}
                      className="relative"
                      ref={isHovered ? hoveredGroupRef : null}
                    >
                      <button
                        onMouseEnter={() => {
                          setHoveredGroup(group.id);
                        }}
                        onMouseLeave={() => {
                          hoverTimeoutRef.current = setTimeout(() => {
                            setHoveredGroup(null);
                          }, 500);
                        }}
                        onClick={() => handleSelectAllInGroup(group.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all overflow-hidden group relative ${
                          isGroupSelected
                            ? 'border-iakoa-blue bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-iakoa-blue hover:shadow-md'
                        }`}
                        style={{
                          backgroundImage: isGroupSelected ? 'none' : `url(${group.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          minHeight: '59.5px',
                        }}
                      >
                        {!isGroupSelected && (
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all" />
                        )}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className={`font-bold text-sm drop-shadow-md block ${
                            isGroupSelected ? 'text-iakoa-blue' : 'text-white'
                          }`}>
                            {group.label}
                          </span>
                          {selectedCount > 0 && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              isGroupSelected
                                ? 'bg-iakoa-blue text-white'
                                : 'bg-iakoa-blue text-white'
                            }`}>
                              {selectedCount}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colonne 3: Sous-catégories au hover et résumé des filtres */}
            <div className="flex-1 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sélection
              </h3>

              <div className="transition-all duration-300">
                {hoveredGroup ? (
                  <div
                    className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sticky top-6 animate-in fade-in transition-all duration-300"
                    onMouseEnter={() => {
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                      }
                    }}
                    onMouseLeave={() => {
                      hoverTimeoutRef.current = setTimeout(() => {
                        setHoveredGroup(null);
                      }, 1000);
                    }}
                  >
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {
                        FILTER_CATEGORY_GROUPS.find((g) => g.id === hoveredGroup)
                          ?.label
                      }
                    </h4>
                    <button
                      onClick={() => handleSelectAllInGroup(hoveredGroup)}
                      className="w-full text-left mb-1 text-sm text-iakoa-blue hover:text-blue-700 font-medium"
                    >
                      Sélectionner tout
                    </button>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {FILTER_CATEGORY_GROUPS.find(
                        (g) => g.id === hoveredGroup,
                      )?.subcategories.map((subcategory) => {
                        const isSelected = selectedCategories.includes(subcategory.id);
                        const IconComponent = SUBCATEGORY_ICONS[subcategory.id];
                        return (
                          <button
                            key={subcategory.id}
                            onClick={() => handleCategoryToggle(subcategory.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-50 border border-iakoa-blue'
                                : 'hover:bg-gray-100 border border-transparent'
                            }`}
                          >
                            <div className={`w-5 h-5 flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'text-iakoa-blue'
                                : 'text-gray-400'
                            }`}>
                              {IconComponent ? (
                                <IconComponent className="w-5 h-5" />
                              ) : (
                                <Check className="w-5 h-5" />
                              )}
                            </div>
                            <span className={`text-sm ${
                              isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                            }`}>
                              {subcategory.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : selectedCategories.length > 0 ? (
                  <div className="bg-blue-50 rounded-lg border border-iakoa-blue p-4 sticky top-6 animate-in fade-in">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Filtres sélectionnés
                    </h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {FILTER_CATEGORY_GROUPS.map((group) => {
                        const groupSelected = group.subcategories.filter((sub) =>
                          selectedCategories.includes(sub.id)
                        );
                        if (groupSelected.length === 0) return null;

                        return (
                          <div key={group.id} className="space-y-1">
                            <p className="text-xs font-semibold text-iakoa-blue uppercase">
                              {group.label}
                            </p>
                            <div className="space-y-1">
                              {groupSelected.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center gap-2 text-sm text-gray-700"
                                >
                                  <div className="w-1.5 h-1.5 bg-iakoa-blue rounded-full" />
                                  {sub.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center text-gray-500 sticky top-6 animate-in fade-in">
                    <p className="text-sm">
                      Survolez une catégorie pour voir ses options
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleApply}
              className="ml-auto px-8 py-2 bg-iakoa-blue text-white hover:bg-blue-600 rounded-lg transition-colors font-medium"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
