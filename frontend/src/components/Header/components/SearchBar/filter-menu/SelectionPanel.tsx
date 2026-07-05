import { Check } from 'lucide-react';
import { FILTER_CATEGORY_GROUPS, getCategoryHexColor } from '@/lib/constants/filter-categories';
import { SUBCATEGORY_ICONS } from '@/lib/constants/subcategory-icons';
import { DATE_PRESETS, type DatePreset } from '@/lib/utils/date-presets';

interface SelectionPanelProps {
  hoveredGroup: string | null;
  selectedCategories: string[];
  city: string;
  radius: number;
  dateFrom: string;
  dateTo: string;
  activeDatePreset: DatePreset | null;
  priceMin: string;
  priceMax: string;
  isFree: boolean;
  onCategoryToggle: (categoryId: string) => void;
  onSelectAllInGroup: (groupId: string) => void;
  onPanelMouseEnter: () => void;
  onPanelMouseLeave: () => void;
  onCardMouseEnter: () => void;
  onCardMouseLeave: () => void;
}

// Colonne 3 du menu de filtres : sous-catégories du groupe survolé,
// ou résumé des filtres sélectionnés
export function SelectionPanel({
  hoveredGroup,
  selectedCategories,
  city,
  radius,
  dateFrom,
  dateTo,
  activeDatePreset,
  priceMin,
  priceMax,
  isFree,
  onCategoryToggle,
  onSelectAllInGroup,
  onPanelMouseEnter,
  onPanelMouseLeave,
  onCardMouseEnter,
  onCardMouseLeave,
}: SelectionPanelProps) {
  const hasAnySelection =
    selectedCategories.length > 0 || city || dateFrom || dateTo || priceMin || priceMax || isFree;
  const hoveredGroupData = hoveredGroup
    ? FILTER_CATEGORY_GROUPS.find(g => g.id === hoveredGroup)
    : undefined;

  return (
    <div
      className="flex-1 overflow-y-auto py-4 relative"
      onMouseEnter={onPanelMouseEnter}
      onMouseLeave={onPanelMouseLeave}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hoveredGroup ? 'Sélection' : 'Filtres sélectionnés'}
      </h3>

      <div className="transition-all duration-300">
        {hoveredGroupData ? (
          <div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sticky top-6 animate-in fade-in transition-all duration-300"
            onMouseEnter={onCardMouseEnter}
            onMouseLeave={onCardMouseLeave}
          >
            <h4 className="font-semibold text-gray-900 mb-4">{hoveredGroupData.label}</h4>
            <button
              onClick={() => onSelectAllInGroup(hoveredGroupData.id)}
              className="w-full text-left mb-1 text-sm text-iakoa-blue hover:text-blue-700 font-medium"
            >
              {hoveredGroupData.subcategories.every(sub => selectedCategories.includes(sub.id))
                ? 'Supprimer tout'
                : 'Sélectionner tout'}
            </button>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {hoveredGroupData.subcategories.map(subcategory => {
                const isSelected = selectedCategories.includes(subcategory.id);
                const IconComponent = SUBCATEGORY_ICONS[subcategory.id];
                return (
                  <button
                    key={subcategory.id}
                    onClick={() => onCategoryToggle(subcategory.id)}
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
                        isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {subcategory.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : hasAnySelection ? (
          <FilterSummary
            selectedCategories={selectedCategories}
            city={city}
            radius={radius}
            dateFrom={dateFrom}
            dateTo={dateTo}
            activeDatePreset={activeDatePreset}
            priceMin={priceMin}
            priceMax={priceMax}
            isFree={isFree}
          />
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center text-gray-500 sticky top-6 animate-in fade-in">
            <p className="text-sm">Survolez une catégorie pour voir ses options</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterSummaryProps {
  selectedCategories: string[];
  city: string;
  radius: number;
  dateFrom: string;
  dateTo: string;
  activeDatePreset: DatePreset | null;
  priceMin: string;
  priceMax: string;
  isFree: boolean;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">{children}</span>
  );
}

// Résumé lisible des filtres actifs (localisation, date, prix, catégories)
function FilterSummary({
  selectedCategories,
  city,
  radius,
  dateFrom,
  dateTo,
  activeDatePreset,
  priceMin,
  priceMax,
  isFree,
}: FilterSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 animate-in fade-in">
      <div className="space-y-3">
        {/* Localisation */}
        {(city || radius !== 2) && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase">Localisation</p>
            <div className="flex flex-wrap gap-1">
              {city && <Chip>{city}</Chip>}
              <Chip>{radius} km</Chip>
            </div>
          </div>
        )}
        {/* Date */}
        {(dateFrom || dateTo) && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase">Date</p>
            <div className="flex flex-wrap gap-1">
              {activeDatePreset ? (
                <Chip>{DATE_PRESETS[activeDatePreset].label}</Chip>
              ) : (
                <>
                  {dateFrom && <Chip>Du {dateFrom}</Chip>}
                  {dateTo && <Chip>Au {dateTo}</Chip>}
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
                <Chip>Gratuit</Chip>
              ) : (
                <>
                  {priceMin && <Chip>Min {priceMin}€</Chip>}
                  {priceMax && <Chip>Max {priceMax}€</Chip>}
                </>
              )}
            </div>
          </div>
        )}
        {/* Catégories - 2 colonnes */}
        {FILTER_CATEGORY_GROUPS.map(group => {
          const groupSelected = group.subcategories.filter(sub =>
            selectedCategories.includes(sub.id),
          );
          if (groupSelected.length === 0) return null;
          const groupHex = getCategoryHexColor(group.subcategories[0]?.id);

          return (
            <div key={group.id} className="space-y-1">
              <p className="text-xs font-semibold uppercase" style={{ color: groupHex }}>
                {group.label}
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {groupSelected.map(sub => (
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
  );
}
