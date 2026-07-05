import type { EventFormData } from '../form-utils';

interface DetailsStepProps {
  form: EventFormData;
  onChange: (patch: Partial<EventFormData>) => void;
}

// Étape 2 : informations principales de l'événement
export function DetailsStep({ form, onChange }: DetailsStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom de l'événement *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => onChange({ name: e.target.value })}
          maxLength={100}
          placeholder="Ex : Concert de jazz au parc"
          className="input input-bordered w-full"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{form.name.length}/100</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          value={form.description}
          onChange={e => onChange({ description: e.target.value })}
          maxLength={5000}
          rows={5}
          placeholder="Décrivez votre événement : programme, ambiance, public visé…"
          className="textarea textarea-bordered w-full"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/5000</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            value={form.date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => onChange({ date: e.target.value })}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
          <input
            type="time"
            value={form.time}
            onChange={e => onChange({ time: e.target.value })}
            className="input input-bordered w-full"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={form.isFree}
            onChange={e => onChange({ isFree: e.target.checked })}
            className="checkbox checkbox-sm"
          />
          <span className="text-sm font-medium text-gray-700">Événement gratuit</span>
        </label>
        {!form.isFree && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix d'entrée (à partir de) *
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={form.priceEuros}
                onChange={e => onChange({ priceEuros: e.target.value.replace(/[^\d.,]/g, '') })}
                placeholder="12,50"
                className="input input-bordered w-full pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Site web de l'événement (optionnel)
        </label>
        <input
          type="url"
          value={form.website}
          onChange={e => onChange({ website: e.target.value })}
          placeholder="https://…"
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
}
