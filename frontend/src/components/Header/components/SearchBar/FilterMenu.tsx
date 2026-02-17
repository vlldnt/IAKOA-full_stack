import { useState, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { FILTER_CATEGORY_GROUPS, type CategoryGroup } from '@/lib/constants/filter-categories';
import { MapPreview } from './MapPreview';

interface FilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  radius: number;
  selectedCategories: string[];
}

const RADIUS_PRESETS = [1, 2, 5, 10, 25, 50, 100];

export function FilterMenu({ isOpen, onClose, onApply }: FilterMenuProps) {
  const [radius, setRadius] = useState(2);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApply = () => {
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
          style={{
            opacity: isOpen ? 1 : 0,
          }}
        />
      )}

      {/* Menu de filtres avec animation */}
      <div
        className="fixed top-0 left-0 right-0 bg-white shadow-2xl z-50 overflow-y-auto transition-all duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isOpen ? 1 : 0,
          height: isOpen ? 'auto' : '0',
          maxHeight: isOpen ? '90vh' : '0',
        }}
      >
        <div className="max-w-7xl mx-auto p-6">
          {/* Header avec bouton fermeture */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Filtrer les résultats</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Carte de préview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Visualisation</h3>
            <MapPreview radius={radius} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Colonne Rayon */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rayon de recherche</h3>

                {/* Affichage rayon */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">Distance</span>
                    <span className="text-2xl font-bold text-iakoa-blue">{radius} km</span>
                  </div>

                  {/* Slider avec traits de repère */}
                  <div className="relative pt-6">
                    {/* Traits de repère */}
                    <div className="absolute top-0 left-0 right-0 h-6 flex justify-between px-0">
                      {RADIUS_PRESETS.map((preset) => (
                        <div
                          key={preset}
                          className="flex flex-col items-center"
                          style={{
                            flex: 1,
                          }}
                        >
                          <div className="w-0.5 h-2 bg-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">{preset}</span>
                        </div>
                      ))}
                    </div>

                    {/* Slider input */}
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer relative"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(radius / 100) * 100}%, #E5E7EB ${(radius / 100) * 100}%, #E5E7EB 100%)`,
                      }}
                    />
                  </div>

                  {/* Boutons de sélection rapide */}
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {RADIUS_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setRadius(preset)}
                        className={`py-2 px-1 rounded-lg font-medium text-sm transition-all ${
                          radius === preset
                            ? 'bg-iakoa-blue text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    Sélectionnez le rayon de recherche autour de votre localisation
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne Catégories */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Catégories</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FILTER_CATEGORY_GROUPS.map((group) => (
                  <CategoryGroupButton
                    key={group.id}
                    group={group}
                    isHovered={hoveredGroup === group.id}
                    onHover={() => setHoveredGroup(group.id)}
                    onLeave={() => setHoveredGroup(null)}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    hoverTimeoutRef={hoverTimeoutRef}
                  />
                ))}
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

interface CategoryGroupButtonProps {
  group: CategoryGroup;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  hoverTimeoutRef: React.RefObject<ReturnType<typeof setTimeout> | null>;
}

function CategoryGroupButton({
  group,
  isHovered,
  onHover,
  onLeave,
  selectedCategories,
  onCategoryToggle,
  hoverTimeoutRef,
}: CategoryGroupButtonProps) {
  const selectedCount = group.subcategories.filter((sub) =>
    selectedCategories.includes(sub.id)
  ).length;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    onHover();
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      onLeave();
    }, 300);
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 hover:border-iakoa-blue"
      >
        <div className="text-left">
          <span className="font-medium text-gray-900">{group.label}</span>
          {selectedCount > 0 && (
            <span className="ml-2 text-xs font-semibold bg-iakoa-blue text-white px-2 py-0.5 rounded-full">
              {selectedCount}
            </span>
          )}
        </div>
        <ChevronRight
          className="h-5 w-5 text-gray-400 transition-transform"
          style={{
            transform: isHovered ? 'rotate(90deg) translateX(4px)' : 'rotate(0)',
          }}
        />
      </button>

      {/* Dropdown des sous-catégories */}
      {isHovered && (
        <div
          className="absolute top-0 left-full ml-2 bg-white rounded-lg shadow-xl border border-gray-200 z-10 min-w-64 animate-in fade-in slide-in-from-left-2 duration-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Sélectionnez</h4>
            <div className="space-y-2">
              {group.subcategories.map((subcategory) => (
                <label
                  key={subcategory.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(subcategory.id)}
                    onChange={() => onCategoryToggle(subcategory.id)}
                    className="w-4 h-4 rounded border-gray-300 text-iakoa-blue cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{subcategory.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
