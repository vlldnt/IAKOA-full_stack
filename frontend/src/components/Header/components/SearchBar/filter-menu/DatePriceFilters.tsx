import { DATE_PRESETS, type DatePreset } from '@/lib/utils/date-presets';

interface DateFilterProps {
  dateFrom: string;
  dateTo: string;
  activePreset: DatePreset | null;
  onChange: (dateFrom: string, dateTo: string, preset: DatePreset | null) => void;
}

// Filtre par date : raccourcis (aujourd'hui / semaine / week-end) + champs manuels
export function DateFilter({ dateFrom, dateTo, activePreset, onChange }: DateFilterProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700">Date</span>
      <div className="flex gap-2">
        {(Object.keys(DATE_PRESETS) as DatePreset[]).map(preset => (
          <button
            key={preset}
            onClick={() => {
              const range = DATE_PRESETS[preset].getRange();
              onChange(range.from, range.to, preset);
            }}
            className={`flex-1 text-xs px-2 py-1.5 rounded-lg border transition-colors ${
              activePreset === preset
                ? 'bg-iakoa-blue text-white border-iakoa-blue'
                : 'border-gray-200 text-gray-600 hover:border-iakoa-blue hover:text-iakoa-blue'
            }`}
          >
            {DATE_PRESETS[preset].label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-sm text-gray-500">Du</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => onChange(e.target.value, dateTo, null)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-iakoa-blue"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-bold text-gray-500">Au</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => onChange(dateFrom, e.target.value, null)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-iakoa-blue"
          />
        </div>
      </div>
    </div>
  );
}

interface PriceFilterProps {
  priceMax: string;
  isFree: boolean;
  onPriceMaxChange: (value: string) => void;
  onIsFreeChange: (value: boolean) => void;
}

// Filtre par prix : plafond + "gratuit uniquement"
export function PriceFilter({ priceMax, isFree, onPriceMaxChange, onIsFreeChange }: PriceFilterProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700">Prix</span>
      <div className="flex items-center gap-3">
        <input
          type="number"
          placeholder="Max €"
          min="0"
          step="0.01"
          value={priceMax}
          onChange={e => onPriceMaxChange(e.target.value)}
          disabled={isFree}
          className="w-24 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-iakoa-blue disabled:opacity-40 disabled:bg-gray-50"
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFree}
            onChange={e => onIsFreeChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-iakoa-blue focus:ring-iakoa-blue"
          />
          <span className="text-sm text-gray-400">Gratuit uniquement</span>
        </label>
      </div>
    </div>
  );
}
