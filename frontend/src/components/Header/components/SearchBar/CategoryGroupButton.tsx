import { ChevronRight } from 'lucide-react';
import type { CategoryGroup } from '@/lib/constants/filter-categories';

// Discrete colors for each category group
const CATEGORY_GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  arts_culture: { bg: 'bg-purple-50', text: 'text-purple-700' },
  sports_wellness: { bg: 'bg-orange-50', text: 'text-orange-700' },
  leisure_entertainment: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  gastronomy: { bg: 'bg-amber-50', text: 'text-amber-700' },
  learning_discovery: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  market_commerce: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  social_causes: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

interface CategoryGroupButtonProps {
  group: CategoryGroup;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  hoverTimeoutRef: React.RefObject<ReturnType<typeof setTimeout> | null>;
}

export function CategoryGroupButton({
  group,
  isHovered,
  onHover,
  onLeave,
  selectedCategories,
  onCategoryToggle,
  hoverTimeoutRef,
}: CategoryGroupButtonProps) {
  const selectedCount = group.subcategories.filter((sub) =>
    selectedCategories.includes(sub.id),
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

  const colorClass = CATEGORY_GROUP_COLORS[group.id] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full flex items-center justify-between p-2 rounded-lg transition-all border border-gray-200 hover:border-iakoa-blue overflow-hidden group relative"
        style={{
          backgroundImage: `url(${group.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '65px',
        }}
      >
        {/* Dark overlay pour meilleure lisibilité du texte */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all" />

        <div className="text-left relative z-10">
          <span className="font-bold text-white text-base drop-shadow-md">
            {group.label}
          </span>
          {selectedCount > 0 && (
            <span className="ml-2 text-xs font-semibold bg-iakoa-blue text-white px-2 py-0.5 rounded-full">
              {selectedCount}
            </span>
          )}
        </div>
        <ChevronRight
          className="h-5 w-5 text-white transition-transform relative z-10 drop-shadow-md"
          style={{
            transform: isHovered
              ? 'rotate(90deg) translateX(4px)'
              : 'rotate(0)',
          }}
        />
      </button>

      {/* Dropdown des sous-catégories */}
      {isHovered && (
        <div
          className={`absolute top-0 left-full ml-2 bg-white rounded-lg shadow-xl border border-gray-200 z-10 min-w-64 animate-in fade-in slide-in-from-left-2 duration-200`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`p-4 rounded-t-lg ${colorClass.bg}`}>
            <h4 className={`font-semibold mb-3 text-sm ${colorClass.text}`}>
              Sélectionnez
            </h4>
          </div>
          <div className="p-4 space-y-1">
            {group.subcategories.map((subcategory) => (
              <label
                key={subcategory.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(subcategory.id)}
                  onChange={() => onCategoryToggle(subcategory.id)}
                  className="w-4 h-4 rounded border-gray-300 text-iakoa-blue cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  {subcategory.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
