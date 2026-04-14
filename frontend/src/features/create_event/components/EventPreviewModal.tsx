import { X, MapPin, Calendar, Clock, Euro, Building2, Globe, Loader2 } from 'lucide-react';
import { getCategoryLabel, getCategoryHexColor } from '@/lib/constants/filter-categories';
import type { useCreateEventForm } from '../hooks/useCreateEventForm';

type PreviewProps = Pick<
  ReturnType<typeof useCreateEventForm>,
  'form' | 'selectedAddress' | 'companies' | 'isSubmitting' | 'handleSubmit' | 'closePreview' | 'imagePreviewUrl' | 'isEditMode'
>;

function formatDate(date: string, time: string) {
  if (!date) return '';
  const d = new Date(`${date}T${time || '00:00'}`);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatPrice(isFree: boolean, pricingEuros: string) {
  if (isFree) return 'Gratuit';
  const n = parseFloat(pricingEuros);
  if (isNaN(n)) return '—';
  return `À partir de ${n.toFixed(2).replace('.', ',')} €`;
}

export function EventPreviewModal({
  form,
  selectedAddress,
  companies,
  isSubmitting,
  handleSubmit,
  closePreview,
  imagePreviewUrl,
  isEditMode,
}: PreviewProps) {
  const company = companies.find((c) => c.id === form.selectedCompanyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closePreview}
      />

      {/* Modale */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* ── En-tête ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aperçu</p>
            <h2 className="text-lg font-bold text-gray-900 mt-0.5">
              {isEditMode ? 'Vérifiez les modifications' : 'Vérifiez votre événement'}
            </h2>
          </div>
          <button
            onClick={closePreview}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Corps scrollable ─────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Titre */}
          <div>
            <p className="text-xl font-bold text-gray-900 leading-snug">{form.name}</p>
          </div>

          {/* Image de couverture */}
          {imagePreviewUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
              <img
                src={imagePreviewUrl}
                alt="Aperçu de l'image sélectionnée"
                className="w-full h-52 object-cover"
              />
            </div>
          )}

          {/* Catégories */}
          {form.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.categories.map((cat) => (
                <span
                  key={cat}
                  style={{ backgroundColor: getCategoryHexColor(cat) }}
                  className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                >
                  {getCategoryLabel(cat)}
                </span>
              ))}
            </div>
          )}

          {/* Infos clés */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Calendar size={15} className="text-iakoa-blue shrink-0" />
              <span>{formatDate(form.date, form.time)}</span>
            </div>

            {form.time && (
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <Clock size={15} className="text-iakoa-blue shrink-0" />
                <span>{form.time}</span>
              </div>
            )}

            {selectedAddress && (
              <div className="flex items-start gap-2.5 text-sm text-gray-700">
                <MapPin size={15} className="text-iakoa-blue shrink-0 mt-0.5" />
                <span>{selectedAddress.label}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Euro size={15} className="text-iakoa-blue shrink-0" />
              <span>{formatPrice(form.isFree, form.pricingEuros)}</span>
            </div>

            {company && (
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <Building2 size={15} className="text-iakoa-blue shrink-0" />
                <span>{company.name}</span>
              </div>
            )}

            {form.website && (
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <Globe size={15} className="text-iakoa-blue shrink-0" />
                <a
                  href={form.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-iakoa-blue hover:underline truncate"
                >
                  {form.website}
                </a>
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-100" />

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line line-clamp-6">
              {form.description}
            </p>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={closePreview}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
              text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-iakoa-blue text-white text-sm font-semibold
              hover:bg-blue-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-150 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Publication…
              </>
            ) : (
              isEditMode ? 'Confirmer et mettre à jour' : 'Confirmer et publier'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
