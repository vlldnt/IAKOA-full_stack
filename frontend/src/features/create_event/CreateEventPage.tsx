import { Plus, CalendarDays, MapPin, Tag, Euro, Building2 } from 'lucide-react';
import { useCreateEventForm } from './hooks/useCreateEventForm';
import { CreateEventForm } from './components/CreateEventForm';
import { EventPreviewModal } from './components/EventPreviewModal';
import { getCategoryLabel } from '@/lib/constants/filter-categories';

export default function CreateEventPage() {
  const formProps = useCreateEventForm();
  const { form, selectedAddress, companies, showPreview, openPreview, closePreview,
    handleSubmit, isSubmitting, submitSuccess, imagePreviewUrl, isEditMode } = formProps;

  const company = companies.find((c) => c.id === form.selectedCompanyId);

  return (
    <>
      {/* ── Layout principal ──────────────────────────────────────────────── */}
      <div id="create-event-page" className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden w-full">

        {/* ── Colonne gauche : formulaire (scrollable) ─────────────────────── */}
        <div className="flex-1 lg:overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-8 lg:py-10 lg:px-8">

            {/* En-tête mobile/tablette uniquement */}
            <div className="lg:hidden mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Modifier l'événement" : 'Créer un événement'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode
                  ? "Mettez à jour les informations puis prévisualisez avant d'enregistrer."
                  : 'Remplissez les informations puis prévisualisez avant de publier.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <CreateEventForm {...formProps} onRequestPreview={openPreview} />
            </div>
          </div>
        </div>

        {/* ── Colonne droite : panneau fixe desktop ────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-gray-100 bg-gray-50 lg:overflow-y-auto">
          <div className="flex flex-col h-full px-6 py-10 gap-6">

            {/* Titre */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isEditMode ? "Modifier l'événement" : 'Créer un événement'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode ? "Prévisualisez avant d'enregistrer." : 'Prévisualisez avant de publier.'}
              </p>
            </div>

            {/* Récapitulatif en temps réel */}
            <div className="flex-1 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Récapitulatif
              </p>

              <SummaryRow
                icon={<CalendarDays size={14} className="text-iakoa-blue" />}
                label="Date"
                value={form.date
                  ? new Date(`${form.date}T${form.time || '00:00'}`).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    }) + (form.time ? ` · ${form.time}` : '')
                  : null}
              />

              <SummaryRow
                icon={<MapPin size={14} className="text-iakoa-blue" />}
                label="Lieu"
                value={selectedAddress?.city ?? null}
              />

              <SummaryRow
                icon={<Tag size={14} className="text-iakoa-blue" />}
                label="Catégories"
                value={form.categories.length > 0
                  ? form.categories.map(getCategoryLabel).join(', ')
                  : null}
              />

              <SummaryRow
                icon={<Euro size={14} className="text-iakoa-blue" />}
                label="Prix"
                value={form.isFree
                  ? 'Gratuit'
                  : form.pricingEuros
                    ? `${parseFloat(form.pricingEuros).toFixed(2)} €`
                    : null}
              />

              <SummaryRow
                icon={<Building2 size={14} className="text-iakoa-blue" />}
                label="Organisateur"
                value={company?.name ?? null}
              />
            </div>

          </div>
        </aside>
      </div>

      {/* ── Bouton flottant mobile/tablette ───────────────────────────────── */}
      {!submitSuccess && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
          <button
            type="button"
            onClick={openPreview}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-iakoa-blue text-white font-semibold
              text-sm shadow-lg flex items-center justify-center gap-2
              disabled:opacity-60 disabled:cursor-not-allowed
              active:scale-[0.98] transition-all duration-150"
          >
            <Plus size={18} />
            {isEditMode ? 'Aperçu et mise à jour' : 'Aperçu et publication'}
          </button>
        </div>
      )}

      {/* ── Modal aperçu ─────────────────────────────────────────────────── */}
      {showPreview && (
        <EventPreviewModal
          form={form}
          selectedAddress={selectedAddress}
          companies={companies}
          imagePreviewUrl={imagePreviewUrl}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          closePreview={closePreview}
        />
      )}
    </>
  );
}

// ── Composant utilitaire : ligne du récapitulatif ─────────────────────────────

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-100 last:border-0">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-sm font-medium truncate mt-0.5 ${value ? 'text-gray-800' : 'text-gray-300 italic'}`}>
          {value ?? 'Non renseigné'}
        </p>
      </div>
    </div>
  );
}
