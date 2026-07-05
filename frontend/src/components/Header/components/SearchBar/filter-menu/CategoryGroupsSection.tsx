import { FILTER_CATEGORY_GROUPS } from '@/lib/constants/filter-categories';

interface CategoryGroupsSectionProps {
  selectedCategories: string[];
  onSelectAllInGroup: (groupId: string) => void;
  onGroupHoverStart: (groupId: string) => void;
  onGroupHoverEnd: () => void;
}

// Colonne 2 : boutons des groupes de catégories (image de fond, compteur)
export function CategoryGroupsSection({
  selectedCategories,
  onSelectAllInGroup,
  onGroupHoverStart,
  onGroupHoverEnd,
}: CategoryGroupsSectionProps) {
  const getSelectedCount = (groupId: string) => {
    const group = FILTER_CATEGORY_GROUPS.find(g => g.id === groupId);
    if (!group) return 0;
    return group.subcategories.filter(sub => selectedCategories.includes(sub.id)).length;
  };

  return (
    <>
      {FILTER_CATEGORY_GROUPS.map(group => {
        const selectedCount = getSelectedCount(group.id);
        const isGroupSelected = selectedCount === group.subcategories.length && selectedCount > 0;

        return (
          <div key={group.id} className="relative">
            <button
              onMouseEnter={() => onGroupHoverStart(group.id)}
              onMouseLeave={onGroupHoverEnd}
              onClick={() => onSelectAllInGroup(group.id)}
              className={`w-full text-left p-1.5 rounded-lg border transition-all overflow-hidden group relative ${
                isGroupSelected
                  ? 'border-iakoa-blue bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:shadow-md'
              }`}
              style={{
                backgroundImage: isGroupSelected ? 'none' : `url(${group.image})`,
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
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-iakoa-blue text-white">
                    {selectedCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </>
  );
}
