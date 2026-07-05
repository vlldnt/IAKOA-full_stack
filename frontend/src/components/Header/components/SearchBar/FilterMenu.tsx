import { useState, useRef, useEffect } from 'react';
import { FILTER_CATEGORY_GROUPS } from '@/lib/constants/filter-categories';
import type { DatePreset } from '@/lib/utils/date-presets';
import iakoaLogo from '@/assets/logo-iakoa.svg';
import { useFilters } from '@/features/events_page/FilterContext';
import { FilterMenuSearchBar } from './filter-menu/FilterMenuSearchBar';
import { LocationSection } from './filter-menu/LocationSection';
import { CategoryGroupsSection } from './filter-menu/CategoryGroupsSection';
import { DateFilter, PriceFilter } from './filter-menu/DatePriceFilters';
import { SelectionPanel } from './filter-menu/SelectionPanel';

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

// Menu plein écran de filtres : localisation, catégories, date, prix.
// Porte l'état local (brouillon) des filtres ; ils ne sont poussés dans le
// FilterContext global qu'au clic sur "Appliquer".
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

  // Brouillon local des filtres
  const [radius, setRadius] = useState(filters.radius);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.selectedCategories,
  );
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
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
  const [activeDatePreset, setActiveDatePreset] = useState<DatePreset | null>(null);
  const [cityError, setCityError] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Survol des groupes de catégories (colonne 2 → panneau colonne 3)
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverEnterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchroniser les filtres locaux avec les filtres globaux
  useEffect(() => {
    setRadius(filters.radius);
    setSelectedCategories(filters.selectedCategories);
  }, [filters.radius, filters.selectedCategories]);

  // Synchroniser la position GPS quand la ville change depuis la SearchBar principale
  useEffect(() => {
    if (filters.latitude && filters.longitude) {
      setCityLat(filters.latitude);
      setCityLon(filters.longitude);
      setUserPosition([filters.latitude, filters.longitude]);
    } else {
      setUserPosition(null);
    }
  }, [filters.latitude, filters.longitude]);

  const showGeoError = (msg: string) => {
    setGeoError(msg);
    setTimeout(() => setGeoError(null), 3500);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      showGeoError('Géolocalisation non supportée par votre navigateur');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      location => {
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        setUserPosition([lat, lon]);
        setCityLat(lat);
        setCityLon(lon);
        onCityChange?.('Ma localisation');
      },
      () => {
        showGeoError('Localisation refusée — vérifiez les permissions du navigateur');
      },
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId],
    );
  };

  const handleSelectAllInGroup = (groupId: string) => {
    const group = FILTER_CATEGORY_GROUPS.find(g => g.id === groupId);
    if (!group) return;

    const groupCategoryIds = group.subcategories.map(sub => sub.id);
    const allSelected = groupCategoryIds.every(id => selectedCategories.includes(id));

    setSelectedCategories(prev => {
      if (allSelected) {
        return prev.filter(id => !groupCategoryIds.includes(id));
      }
      const newCategories = new Set(prev);
      groupCategoryIds.forEach(id => newCategories.add(id));
      return Array.from(newCategories);
    });
  };

  const clearHoverTimeouts = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (hoverEnterTimeoutRef.current) clearTimeout(hoverEnterTimeoutRef.current);
  };

  const handleGroupHoverStart = (groupId: string) => {
    clearHoverTimeouts();
    hoverEnterTimeoutRef.current = setTimeout(() => setHoveredGroup(groupId), 120);
  };

  const scheduleHoverEnd = (delayMs: number) => {
    if (hoverEnterTimeoutRef.current) clearTimeout(hoverEnterTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setHoveredGroup(null), delayMs);
  };

  const handleApply = () => {
    if (!city) {
      setCityError(true);
      return;
    }
    setCityError(false);
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
    setCityError(false);
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
          height: isOpen ? '85vh' : '0',
          overflow: 'hidden',
        }}
      >
        {/* Header avec logo et barre de recherche */}
        <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-2 border-b border-gray-200 shrink-0">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <img src={iakoaLogo} alt="Logo IAKOA" className="w-32" />
            </div>

            <FilterMenuSearchBar
              keyword={keyword}
              city={city}
              cityError={cityError}
              geoError={geoError}
              onKeywordChange={onKeywordChange}
              onCityChange={onCityChange}
              onCityPicked={(lat, lon) => {
                setCityLat(lat);
                setCityLon(lon);
                setUserPosition([lat, lon]);
              }}
              onGeolocate={handleGeolocation}
              onCityCleared={() => setCityError(false)}
            />
          </div>
        </div>

        {/* Contenu des filtres - 3 colonnes */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 h-full">
            <div className="flex flex-col lg:flex-row gap-4 h-full">
              {/* Colonne 1: rayon + carte */}
              <LocationSection
                radius={radius}
                userPosition={userPosition}
                onRadiusChange={setRadius}
              />

              {/* Colonne 2: groupes de catégories + date + prix */}
              <div className="flex-1 overflow-y-auto py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Catégories</h3>
                <div className="grid grid-cols-1 gap-1.5 relative">
                  <CategoryGroupsSection
                    selectedCategories={selectedCategories}
                    onSelectAllInGroup={handleSelectAllInGroup}
                    onGroupHoverStart={handleGroupHoverStart}
                    onGroupHoverEnd={() => scheduleHoverEnd(800)}
                  />
                  <DateFilter
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    activePreset={activeDatePreset}
                    onChange={(from, to, preset) => {
                      setDateFrom(from);
                      setDateTo(to);
                      setActiveDatePreset(preset);
                    }}
                  />
                  <PriceFilter
                    priceMax={priceMax}
                    isFree={isFree}
                    onPriceMaxChange={setPriceMax}
                    onIsFreeChange={setIsFree}
                  />
                </div>
              </div>

              {/* Colonne 3: sous-catégories au hover / résumé */}
              <SelectionPanel
                hoveredGroup={hoveredGroup}
                selectedCategories={selectedCategories}
                city={city}
                radius={radius}
                dateFrom={dateFrom}
                dateTo={dateTo}
                activeDatePreset={activeDatePreset}
                priceMin={priceMin}
                priceMax={priceMax}
                isFree={isFree}
                onCategoryToggle={handleCategoryToggle}
                onSelectAllInGroup={handleSelectAllInGroup}
                onPanelMouseEnter={clearHoverTimeouts}
                onPanelMouseLeave={() => scheduleHoverEnd(300)}
                onCardMouseEnter={clearHoverTimeouts}
                onCardMouseLeave={() => scheduleHoverEnd(1000)}
              />
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
            <div className="ml-auto flex items-center gap-4">
              {!city && (
                <span className="text-sm text-red-500 font-semibold flex items-center gap-1.5">
                  <span>⚠</span> Choisissez une ville pour rechercher
                </span>
              )}
              <button
                onClick={handleApply}
                className={`px-8 py-2 rounded-lg transition-colors font-medium ${city ? 'bg-iakoa-blue text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
