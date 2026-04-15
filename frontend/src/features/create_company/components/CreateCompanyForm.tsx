import { Building2, Hash, Globe, Share2, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { SocialNetworksFields } from './SocialNetworksFields';
import type { useCreateCompanyForm } from '../hooks/useCreateCompanyForm';

type FormProps = ReturnType<typeof useCreateCompanyForm>;

export function CreateCompanyForm({
  form,
  setField,
  setSocialField,
  errors,
  isSubmitting,
  submitSuccess,
  handleSubmit,
  user,
}: FormProps) {
  // ── Garde : utilisateur non créateur ───────────────────────────────────────
  if (!user?.isCreator) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
        <AlertTriangle size={20} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Compte créateur requis</p>
          <p className="text-sm mt-0.5">
            Seuls les comptes créateurs peuvent enregistrer une entreprise.
            Contactez-nous pour activer cette fonctionnalité.
          </p>
        </div>
      </div>
    );
  }

  // ── Feedback succès ─────────────────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 size={48} className="text-green-500" />
        <div>
          <p className="text-xl font-bold text-gray-800">Entreprise créée !</p>
          <p className="text-sm text-gray-500 mt-1">
            Redirection vers la création d'événement…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      className="space-y-8"
      noValidate
    >
      {/* ── Section : Informations légales ───────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Informations légales
        </h2>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nom de l'entreprise <span className="text-red-500">*</span>
          </label>
          <ValidatedInput
            type="text"
            value={form.name}
            onChange={(v) => setField('name', v)}
            placeholder="Acme Événements SARL"
            icon={Building2}
            isValid={form.name.trim().length > 0 && form.name.length <= 100}
            showValidation={form.name.length > 0}
          />
          <div className="flex justify-between mt-1">
            {errors.name
              ? <p className="text-xs text-red-500">{errors.name}</p>
              : <span />
            }
            <p className="text-xs text-gray-400">{form.name.length}/100</p>
          </div>
        </div>

        {/* SIREN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Numéro SIREN <span className="text-red-500">*</span>
          </label>
          <ValidatedInput
            type="text"
            value={form.siren}
            onChange={(v) => setField('siren', v.replace(/\D/g, '').slice(0, 9))}
            placeholder="123456789"
            icon={Hash}
            isValid={/^\d{9}$/.test(form.siren)}
            showValidation={form.siren.length > 0}
          />
          <div className="flex justify-between mt-1">
            {errors.siren
              ? <p className="text-xs text-red-500">{errors.siren}</p>
              : <p className="text-xs text-gray-400">9 chiffres, sans espaces</p>
            }
            <p className="text-xs text-gray-400">{form.siren.length}/9</p>
          </div>
        </div>
      </section>

      {/* ── Section : Présentation ───────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Présentation{' '}
          <span className="text-gray-400 text-xs font-normal normal-case">(optionnel)</span>
        </h2>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Décrivez votre entreprise, vos activités, vos valeurs…"
            rows={3}
            className={`w-full border rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none resize-none
              transition-colors focus:border-iakoa-blue
              ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
          />
          <div className="flex justify-between mt-1">
            {errors.description
              ? <p className="text-xs text-red-500">{errors.description}</p>
              : <span />
            }
            <p className="text-xs text-gray-400">{form.description.length}/300</p>
          </div>
        </div>

        {/* Site web */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Site web
          </label>
          <ValidatedInput
            type="url"
            value={form.website}
            onChange={(v) => setField('website', v)}
            placeholder="https://www.mon-entreprise.fr"
            icon={Globe}
            isValid={!errors.website}
            showValidation={form.website.length > 0}
          />
          {errors.website && (
            <p className="text-xs text-red-500 mt-1">{errors.website}</p>
          )}
        </div>
      </section>

      {/* ── Section : Réseaux sociaux ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Réseaux sociaux{' '}
            <span className="text-gray-400 text-xs font-normal normal-case">(optionnel)</span>
          </h2>
        </div>
        <SocialNetworksFields
          values={form.socialNetworks}
          onChange={setSocialField}
          errors={errors}
        />
      </section>

      {/* ── Erreur globale ────────────────────────────────────────────────── */}
      {errors.submit && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{errors.submit}</p>
        </div>
      )}

      {/* ── Bouton soumission ─────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm
          bg-iakoa-blue hover:bg-blue-600 active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Création en cours…
          </>
        ) : (
          'Créer l\'entreprise'
        )}
      </button>
    </form>
  );
}
