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
import { getCategoryHexColor } from '@/lib/constants/event-category.config';
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


function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}
function getThisWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() + (day === 0 ? 0 : 7 - day));
  return { from: fmtDate(today), to: fmtDate(sunday) };
}
function getWeekendDates() {
  const today = new Date();
  const day = today.getDay();
  if (day === 6) {
    const sun = new Date(today); sun.setDate(today.getDate() + 1);
    return { from: fmtDate(today), to: fmtDate(sun) };
  }
  if (day === 0) return { from: fmtDate(today), to: fmtDate(today) };
  const sat = new Date(today); sat.setDate(today.getDate() + (6 - day));
  const sun = new Date(sat);   sun.setDate(sat.getDate() + 1);
  return { from: fmtDate(sat), to: fmtDate(sun) };
}
function getTodayDates() {
  const today = new Date();
  return { from: fmtDate(today), to: fmtDate(today) };
}

export function FilterMenu({
  isOpen,
  onClose,
  onApply,
  keyword = '',
  city = '',
  onKeywordChange,
  onCityChange,
}: FilterMenuProps) {
  const {
    filters,
    updateRadius,
    updateCategories,
    updateCity: updateCityFilter,
    updateKeyword: updateKeywordFilter,
    updateDateRange,
    updatePrice,
  } = useFilters();
  const [radius, setRadius] = useState(filters.radius);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.selectedCategories,
  );
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );
  const [cityLat, setCityLat] = useState<number | undefined>(filters.latitude);
  const [cityLon, setCityLon] = useState<number | undefined>(filters.longitude);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
  const [dateTo, setDateTo] = useState(filters.dateTo || '');
  const [priceMin, setPriceMin] = useState<string>(
    filters.priceMin !== undefined ? String(filters.priceMin / 100) : '',
  );
  const [priceMax, setPriceMax] = useState<string>(
    filters.priceMax !== undefined ? String(filters.priceMax / 100) : '',
  );
  const [isFree, setIsFree] = useState(filters.isFree);
  const [activeDatePreset, setActiveDatePreset] = useState<'today' | 'week' | 'weekend' | null>(null);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<CityResult[]>([]);
  const [cityFocused, setCityFocused] = useState(false);
  const hoveredGroupRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const citySearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Synchroniser les filtres locaux avec les filtres globaux
  useEffect(() => {
    setRadius(filters.radius);
    setSelectedCategories(filters.selectedCategories);
  }, [filters.radius, filters.selectedCategories]);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas disponible dans votre navigateur");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        setUserPosition([lat, lon]);
        setCityLat(lat);
        setCityLon(lon);
        onCityChange?.('Ma localisation');
      },
      () => {
        alert(
          "Impossible d'accéder à votre localisation. Vérifiez les permissions.",
        );
      },
    );
  };

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setShowCitySuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,centre,departement&boost=population&limit=5`,
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
      selectedCategories.includes(id),
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
      selectedCategories.includes(sub.id),
    ).length;
  };

  const handleApply = () => {
    updateKeywordFilter(keyword);
    updateCityFilter(city, cityLat, cityLon);
    updateRadius(radius);
    updateCategories(selectedCategories);
    updateDateRange(dateFrom || undefined, dateTo || undefined);
    updatePrice(
      priceMin ? Math.round(parseFloat(priceMin) * 100) : undefined,
      priceMax ? Math.round(parseFloat(priceMax) * 100) : undefined,
      isFree,
    );

    onApply({ radius, selectedCategories });
    onClose();
  };

  const handleReset = () => {
    setRadius(2);
    setSelectedCategories([]);
    setDateFrom('');
    setDateTo('');
    setPriceMin('');
    setPriceMax('');
    setIsFree(false);
    setActiveDatePreset(null);
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
        className="fixed top-0 left-0 right-0 bg-white shadow-2xl z-50 flex flex-col transition-all duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isOpen ? 1 : 0,
          height: isOpen ? '80vh' : '0',
          overflow: 'hidden',
        }}
      >
        {/* Header avec Logo et SearchBar */}
        <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-2 border-b border-gray-200 shrink-0">
          <div className="max-w-6xl mx-auto">
            {/* Logo et titre */}
            <div className="flex items-center justify-between mb-2">
              <img src={iakoaLogo} alt="Logo IAKOA" className="w-32" />
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

              {/* Champ ville avec autocomplétion */}
              <div className="flex-1 min-w-0 relative">
                <input
                  type="text"
                  placeholder="Ville..."
                  className={`bg-transparent outline-none text-sm w-full ${city === 'Ma localisation' ? 'text-iakoa-blue font-bold' : ''}`}
                  value={city}
                  onChange={(e) => {
                    const value = e.target.value;
                    onCityChange?.(value);
                    handleCitySearch(value);
                  }}
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
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {/* Option Ma localisation */}
                    <button
                      onClick={() => {
                        handleGeolocation();
                        setCityFocused(false);
                        setShowCitySuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-gray-100"
                    >
                      <MapPin className="h-3.5 w-3.5 text-iakoa-blue shrink-0" />
                      <span className="font-bold text-sm text-iakoa-blue">Ma localisation</span>
                    </button>

                    {/* Suggestions de villes */}
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
          </div>
        </div>

        {/* Contenu des filtres - 3 colonnes */}
        <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex flex-col lg:flex-row gap-4 relative">
            {/* Colonne 1: Carte avec Rayon */}
            <div className="shrink-0 w-full lg:w-90">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Localisation
              </h3>
              <div className="space-y-2">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Catégories
              </h3>
              <div className="grid grid-cols-1 gap-1.5 relative">
                {FILTER_CATEGORY_GROUPS.map((group) => {
                  const selectedCount = getSelectedCount(group.id);
                  const isGroupSelected =
                    selectedCount === group.subcategories.length &&
                    selectedCount > 0;
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
                        className={`w-full text-left p-1.5 rounded-lg border transition-all overflow-hidden group relative ${
                          isGroupSelected
                            ? 'border-iakoa-blue bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:shadow-md'
                        }`}
                        style={{
                          backgroundImage: isGroupSelected
                            ? 'none'
                            : `url(${group.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          minHeight: '42px',
                        }}
                      >
                        {!isGroupSelected && (
                          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/60 transition-all" />
                        )}
                        <div className="relative z-10 flex items-center justify-between">
                          <span
                            className={`font-bold text-base drop-shadow-md block ${
                              isGroupSelected ? 'text-iakoa-blue' : 'text-white'
                            }`}
                          >
                            {group.label}
                          </span>
                          {selectedCount > 0 && (
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                isGroupSelected
                                  ? 'bg-iakoa-blue text-white'
                                  : 'bg-iakoa-blue text-white'
                              }`}
                            >
                              {selectedCount}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
                {/* Filtre par date */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Date</span>
                  {/* Raccourcis rapides */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { const d = getTodayDates(); setDateFrom(d.from); setDateTo(d.to); setActiveDatePreset('today'); }}
                      className={`flex-1 text-xs px-2 py-1.5 rounded-lg border transition-colors ${activeDatePreset === 'today' ? 'bg-iakoa-blue text-white border-iakoa-blue' : 'border-gray-200 text-gray-600 hover:border-iakoa-blue hover:text-iakoa-blue'}`}
                    >
                      Aujourd'hui
                    </button>
                    <button
                      onClick={() => { const d = getThisWeekDates(); setDateFrom(d.from); setDateTo(d.to); setActiveDatePreset('week'); }}
                      className={`flex-1 text-xs px-2 py-1.5 rounded-lg border transition-colors ${activeDatePreset === 'week' ? 'bg-iakoa-blue text-white border-iakoa-blue' : 'border-gray-200 text-gray-600 hover:border-iakoa-blue hover:text-iakoa-blue'}`}
                    >
                      Cette semaine
                    </button>
                    <button
                      onClick={() => { const d = getWeekendDates(); setDateFrom(d.from); setDateTo(d.to); setActiveDatePreset('weekend'); }}
                      className={`flex-1 text-xs px-2 py-1.5 rounded-lg border transition-colors ${activeDatePreset === 'weekend' ? 'bg-iakoa-blue text-white border-iakoa-blue' : 'border-gray-200 text-gray-600 hover:border-iakoa-blue hover:text-iakoa-blue'}`}
                    >
                      Ce week-end
                    </button>
                  </div>
                  {/* Champs manuels */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-sm text-gray-500">Du</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setActiveDatePreset(null); }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-iakoa-blue"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-bold text-gray-500">Au</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setActiveDatePreset(null); }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-iakoa-blue"
                      />
                    </div>
                  </div>
                </div>
                {/* Filtre par prix */}
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Prix</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Max €"
                      min="0"
                      step="0.01"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      disabled={isFree}
                      className="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-iakoa-blue disabled:opacity-40 disabled:bg-gray-50"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => setIsFree(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-iakoa-blue focus:ring-iakoa-blue"
                      />
                      <span className="text-sm text-gray-400">Gratuit uniquement</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne 3: Sous-catégories au hover et résumé des filtres */}
            <div className="flex-1 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
                        FILTER_CATEGORY_GROUPS.find(
                          (g) => g.id === hoveredGroup,
                        )?.label
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
                        const isSelected = selectedCategories.includes(
                          subcategory.id,
                        );
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
                            <div
                              className={`w-5 h-5 flex items-center justify-center shrink-0 transition-all ${
                                isSelected ? 'text-iakoa-blue' : 'text-gray-400'
                              }`}
                            >
                              {IconComponent ? (
                                <IconComponent className="w-5 h-5" />
                              ) : (
                                <Check className="w-5 h-5" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                isSelected
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-700'
                              }`}
                            >
                              {subcategory.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (selectedCategories.length > 0 || city || dateFrom || dateTo || priceMin || priceMax || isFree) ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sticky top-6 animate-in fade-in">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Filtres sélectionnés
                    </h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {/* Localisation */}
                      {(city || radius !== 2) && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase">Localisation</p>
                          <div className="flex flex-wrap gap-1">
                            {city && (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                {city}
                              </span>
                            )}
                            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                              {radius} km
                            </span>
                          </div>
                        </div>
                      )}
                      {/* Date */}
                      {(dateFrom || dateTo) && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase">Date</p>
                          <div className="flex flex-wrap gap-1">
                            {activeDatePreset ? (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                {activeDatePreset === 'today' && "Aujourd'hui"}
                                {activeDatePreset === 'week' && 'Cette semaine'}
                                {activeDatePreset === 'weekend' && 'Ce week-end'}
                              </span>
                            ) : (
                              <>
                                {dateFrom && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                    Du {dateFrom}
                                  </span>
                                )}
                                {dateTo && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                    Au {dateTo}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Prix */}
                      {(isFree || priceMin || priceMax) && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase">Prix</p>
                          <div className="flex flex-wrap gap-1">
                            {isFree ? (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                Gratuit
                              </span>
                            ) : (
                              <>
                                {priceMin && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                    Min {priceMin}€
                                  </span>
                                )}
                                {priceMax && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                                    Max {priceMax}€
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Catégories - 2 colonnes */}
                      {FILTER_CATEGORY_GROUPS.map((group) => {
                        const groupSelected = group.subcategories.filter(
                          (sub) => selectedCategories.includes(sub.id),
                        );
                        if (groupSelected.length === 0) return null;
                        const groupHex = getCategoryHexColor(group.subcategories[0]?.id);

                        return (
                          <div key={group.id} className="space-y-1">
                            <p className="text-xs font-semibold uppercase" style={{ color: groupHex }}>
                              {group.label}
                            </p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                              {groupSelected.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center gap-1.5 text-xs text-gray-700 min-w-0"
                                >
                                  <div
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: getCategoryHexColor(sub.id) }}
                                  />
                                  <span className="truncate">{sub.label}</span>
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

        </div>
        </div>
        {/* Boutons d'action - fixés en bas */}
        <div className="shrink-0 border-t border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
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
