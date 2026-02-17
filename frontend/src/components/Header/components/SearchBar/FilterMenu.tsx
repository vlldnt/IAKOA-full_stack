import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { FILTER_CATEGORY_GROUPS } from '@/lib/constants/filter-categories';
import { MapPreview } from './MapPreview';
import { CategoryGroupButton } from './CategoryGroupButton';

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
        : [...prev, categoryId],
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
        <div className="max-w-6xl mx-auto p-6">
          {/* Header avec bouton fermeture */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Filtrer les résultats
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Colonne Rayon - avec Carte (35%) */}
            <div className="flex-1 lg:basis-[35%]">
              <div className="space-y-4">
                {/* Slider avec 7 crans */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Rayon de recherche
                    </h3>{' '}
                    <span className="text-xl font-bold text-iakoa-blue">
                      {radius} km
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Slider */}
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
                </div>
                {/* Légende */}
                <p className="text-xs text-gray-500 text-center">
                  Sélectionnez le rayon de recherche autour de votre
                  localisation
                </p>

                {/* Carte */}
                <MapPreview radius={radius} />
              </div>
            </div>

            {/* Colonne Catégories (65%) */}
            <div className="flex-1 lg:basis-[65%] overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-visible">
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
