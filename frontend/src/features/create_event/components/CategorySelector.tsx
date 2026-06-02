import { FILTER_CATEGORY_GROUPS } from '@/lib/constants/filter-categories';

interface CategorySelectorProps {
  selected: string[];
  onToggle: (categoryId: string) => void;
  error?: string;
}

export function CategorySelector({ selected, onToggle, error }: CategorySelectorProps) {
  return (
    <div id="category-selector" className="space-y-4">
      {FILTER_CATEGORY_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.subcategories.map((cat) => {
              const isActive = selected.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggle(cat.id)}
                  style={isActive ? { backgroundColor: cat.hexColor, borderColor: cat.hexColor } : {}}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150
                    ${isActive
                      ? 'text-white shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <p className="text-xs text-iakoa-blue font-medium">
          {selected.length} catégorie{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
