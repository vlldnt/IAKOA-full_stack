import { useState } from 'react';
import { Plus, X, ImageIcon } from 'lucide-react';
import { FILTER_CATEGORY_GROUPS } from '@/lib/constants/filter-categories';
import type { EventFormData } from '../form-utils';
import { MAX_CATEGORIES } from '../form-utils';

interface CategoriesMediaStepProps {
  form: EventFormData;
  onChange: (patch: Partial<EventFormData>) => void;
}

// Étape 4 : catégories (max 5) et photos (URLs)
export function CategoriesMediaStep({ form, onChange }: CategoriesMediaStepProps) {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaError, setMediaError] = useState<string | null>(null);

  const toggleCategory = (slug: string) => {
    if (form.categories.includes(slug)) {
      onChange({ categories: form.categories.filter(c => c !== slug) });
    } else if (form.categories.length < MAX_CATEGORIES) {
      onChange({ categories: [...form.categories, slug] });
    }
  };

  const addMedia = () => {
    setMediaError(null);
    const url = mediaUrl.trim();
    if (!/^https?:\/\/\S+\.\S+/.test(url)) {
      return setMediaError('Entrez une URL d’image valide (https://…).');
    }
    if (form.mediaUrls.includes(url)) {
      return setMediaError('Cette image est déjà ajoutée.');
    }
    onChange({ mediaUrls: [...form.mediaUrls, url] });
    setMediaUrl('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Catégories */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Catégories *</label>
          <span className="text-xs text-gray-400">
            {form.categories.length}/{MAX_CATEGORIES}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {FILTER_CATEGORY_GROUPS.map(group => (
            <div key={group.id}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.subcategories.map(sub => {
                  const isSelected = form.categories.includes(sub.id);
                  const isDisabled = !isSelected && form.categories.length >= MAX_CATEGORIES;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleCategory(sub.id)}
                      disabled={isDisabled}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: sub.hexColor, color: 'white' }
                          : { backgroundColor: `${sub.hexColor}15`, color: sub.hexColor }
                      }
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Médias */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photos (optionnel)
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Collez l'URL d'une image hébergée en ligne. La première photo sert de couverture.
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addMedia();
              }
            }}
            placeholder="https://…/photo.jpg"
            className="input input-bordered flex-1"
          />
          <button
            type="button"
            onClick={addMedia}
            className="flex items-center gap-1 px-4 rounded-lg text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
        {mediaError && <p className="text-sm text-red-500 mt-1">{mediaError}</p>}

        {form.mediaUrls.length > 0 && (
          <ul className="flex flex-col gap-2 mt-3">
            {form.mediaUrls.map((url, index) => (
              <li
                key={url}
                className="flex items-center gap-3 p-2 rounded-lg border border-gray-200"
              >
                <img
                  src={url}
                  alt=""
                  className="w-14 h-14 object-cover rounded-md bg-gray-100"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">{url}</p>
                  {index === 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-iakoa-blue">
                      <ImageIcon className="h-3 w-3" /> Couverture
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onChange({ mediaUrls: form.mediaUrls.filter(u => u !== url) })
                  }
                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  aria-label="Retirer cette image"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
