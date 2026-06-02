import { Plus, Building2, Hash, Globe, Share2 } from 'lucide-react';
import { useCreateCompanyForm } from './hooks/useCreateCompanyForm';
import { CreateCompanyForm } from './components/CreateCompanyForm';

export default function CreateCompanyPage() {
  const formProps = useCreateCompanyForm();
  const { form, handleSubmit, isSubmitting, submitSuccess } = formProps;

  const hasSocials = Object.values(form.socialNetworks).some((v) => v && v.trim());

  return (
    <div id="create-company-page" className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden w-full">

      {/* ── Colonne gauche : formulaire (scrollable) ────────────────────── */}
      <div className="flex-1 lg:overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 lg:py-10 lg:px-8">

          {/* En-tête mobile/tablette uniquement */}
          <div className="lg:hidden mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Créer une entreprise</h1>
            <p className="text-sm text-gray-500 mt-1">
              Votre entreprise sera liée à tous vos événements publiés.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <CreateCompanyForm {...formProps} />
          </div>
        </div>
      </div>

      {/* ── Colonne droite : panneau fixe desktop ──────────────────────── */}
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-gray-100 bg-gray-50 lg:overflow-y-auto">
        <div className="flex flex-col h-full px-6 py-10 gap-6">

          {/* Titre */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Créer une entreprise</h1>
            <p className="text-sm text-gray-500 mt-1">
              Liée à tous vos événements publiés.
            </p>
          </div>

          {/* Récapitulatif en temps réel */}
          <div className="flex-1 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Récapitulatif
            </p>

            <SummaryRow
              icon={<Building2 size={14} className="text-iakoa-blue" />}
              label="Nom"
              value={form.name || null}
            />

            <SummaryRow
              icon={<Hash size={14} className="text-iakoa-blue" />}
              label="SIREN"
              value={/^\d{9}$/.test(form.siren) ? form.siren : null}
            />

            <SummaryRow
              icon={<Globe size={14} className="text-iakoa-blue" />}
              label="Site web"
              value={form.website || null}
            />

            <SummaryRow
              icon={<Share2 size={14} className="text-iakoa-blue" />}
              label="Réseaux sociaux"
              value={hasSocials
                ? `${Object.values(form.socialNetworks).filter((v) => v && v.trim()).length} renseigné(s)`
                : null}
            />
          </div>

          {/* Note informative */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700 leading-relaxed">
            Votre entreprise sera en attente de validation avant d'apparaître publiquement. Vous pourrez créer des événements dès maintenant.
          </div>

          {/* CTA desktop */}
          {!submitSuccess && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                bg-iakoa-blue text-white text-sm font-semibold shadow-sm
                hover:bg-blue-600 active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-150"
            >
              <Plus size={16} />
              Créer l'entreprise
            </button>
          )}
        </div>
      </aside>

      {/* ── Bouton flottant mobile/tablette ─────────────────────────────── */}
      {!submitSuccess && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-iakoa-blue text-white font-semibold
              text-sm shadow-lg flex items-center justify-center gap-2
              disabled:opacity-60 disabled:cursor-not-allowed
              active:scale-[0.98] transition-all duration-150"
          >
            <Plus size={18} />
            Créer l'entreprise
          </button>
        </div>
      )}
    </div>
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
