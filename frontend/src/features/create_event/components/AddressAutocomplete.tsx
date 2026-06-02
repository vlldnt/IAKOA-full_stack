import { MapPin, X } from 'lucide-react';
import type { AddressSuggestion } from '../services/geocodingService';

interface AddressAutocompleteProps {
  value: string;
  suggestions: AddressSuggestion[];
  isSelected: boolean;
  onChange: (query: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  onClear: () => void;
  error?: string;
}

export function AddressAutocomplete({
  value,
  suggestions,
  isSelected,
  onChange,
  onSelect,
  onClear,
  error,
}: AddressAutocompleteProps) {
  const borderColor = error
    ? 'border-red-400 focus-within:border-red-400'
    : isSelected
      ? 'border-green-500 focus-within:border-green-500'
      : 'border-gray-200 focus-within:border-iakoa-blue';

  return (
    <div id="address-autocomplete" className="relative">
      <div className={`flex items-center gap-2 px-3 py-3 rounded-lg border bg-gray-50 transition-colors ${borderColor}`}>
        <MapPin size={18} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="12 Rue de la Paix, Paris..."
          className="flex-1 bg-transparent outline-none text-sm"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => onSelect(s)}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 flex items-start gap-2.5 border-b border-gray-50 last:border-0 transition-colors"
            >
              <MapPin size={14} className="text-iakoa-blue mt-0.5 shrink-0" />
              <span className="leading-snug">{s.label}</span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
      {isSelected && !error && (
        <p className="text-xs text-green-600 mt-1 ml-1">Adresse confirmée ✓</p>
      )}
    </div>
  );
}
