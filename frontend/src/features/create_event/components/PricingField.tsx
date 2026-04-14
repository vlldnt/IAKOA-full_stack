import { Euro } from 'lucide-react';

interface PricingFieldProps {
  isFree: boolean;
  pricingEuros: string;
  onToggleFree: (isFree: boolean) => void;
  onPriceChange: (value: string) => void;
  error?: string;
}

export function PricingField({
  isFree,
  pricingEuros,
  onToggleFree,
  onPriceChange,
  error,
}: PricingFieldProps) {
  return (
    <div className="space-y-2">
      {/* Toggle Gratuit */}
      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <div
          onClick={() => onToggleFree(!isFree)}
          className={`relative w-10 h-5 rounded-full transition-colors duration-200
            ${isFree ? 'bg-iakoa-blue' : 'bg-gray-200'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
              ${isFree ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </div>
        <span className="text-sm text-gray-700 select-none">Événement gratuit</span>
      </label>

      {/* Champ prix — masqué si gratuit */}
      {!isFree && (
        <div>
          <div className={`flex items-center gap-2 px-3 py-3 rounded-lg border bg-gray-50 transition-colors
            ${error ? 'border-red-400' : 'border-gray-200 focus-within:border-iakoa-blue'}`}>
            <Euro size={18} className="text-gray-400 shrink-0" />
            <input
              type="number"
              value={pricingEuros}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="12.50"
              min="0"
              step="0.50"
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <span className="text-sm text-gray-400 shrink-0">€</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-1">Prix d'entrée minimum (ex: 12.50)</p>
          {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
        </div>
      )}

      {isFree && (
        <p className="text-xs text-green-600 ml-1">Cet événement sera affiché comme gratuit ✓</p>
      )}
    </div>
  );
}
