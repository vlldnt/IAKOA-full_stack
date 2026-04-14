import { Type, Calendar, Clock, Globe, Building2, AlertTriangle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { AddressAutocomplete } from './AddressAutocomplete';
import { CategorySelector } from './CategorySelector';
import { PricingField } from './PricingField';
import { ImageUploadField } from './ImageUploadField';
import type { useCreateEventForm } from '../hooks/useCreateEventForm';

type FormProps = ReturnType<typeof useCreateEventForm> & {
  onRequestPreview: () => void;
};

export function CreateEventForm({
  form,
  setField,
  errors,
  isSubmitting,
  isPrefilling,
  isEditMode,
  submitSuccess,
  handleSubmit: _handleSubmit,
  onRequestPreview,
  addressQuery,
  addressSuggestions,
  selectedAddress,
  handleAddressInput,
  handleSelectAddress,
  clearAddress,
  toggleCategory,
  imageFile,
  imagePreviewUrl,
  handleImageChange,
  handleImageClear,
  companies,
  companiesLoading,
  companiesError,
  user,
}: FormProps) {
  if (isPrefilling) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" /> Chargement de l'événement…
      </div>
    );
  }

  // ── Garde : utilisateur non créateur ───────────────────────────────────────
  if (!user?.isCreator) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
        <AlertTriangle size={20} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Compte créateur requis</p>
          <p className="text-sm mt-0.5">
            Seuls les comptes créateurs peuvent publier des événements.
            Contactez-nous pour activer cette fonctionnalité.
          </p>
        </div>
      </div>
    );
  }

  // ── Garde : aucune entreprise ───────────────────────────────────────────────
  if (!companiesLoading && companies.length === 0 && !companiesError) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
        <Building2 size={20} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Aucune entreprise enregistrée</p>
          <p className="text-sm mt-0.5">
            Vous devez créer une entreprise avant de pouvoir publier un événement.
          </p>
          <Link
            to="/company/new"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold
              text-iakoa-blue hover:underline"
          >
            Créer mon entreprise
            <ArrowRight size={14} />
          </Link>
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
          <p className="text-xl font-bold text-gray-800">
            {isEditMode ? 'Événement mis à jour !' : 'Événement créé !'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Redirection en cours…</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onRequestPreview(); }}
      className="space-y-8"
      noValidate
    >
      {/* ── Section : Informations générales ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Informations générales
        </h2>

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Titre de l'événement <span className="text-red-500">*</span>
          </label>
          <ValidatedInput
            type="text"
            value={form.name}
            onChange={(v) => setField('name', v)}
            placeholder="Concert de Jazz au Sunset Club..."
            icon={Type}
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Décrivez votre événement : ambiance, programme, public cible..."
            rows={5}
            className={`w-full border rounded-lg px-4 py-3 text-sm bg-gray-50 outline-none resize-none
              transition-colors focus:border-iakoa-blue
              ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
          />
          <div className="flex justify-between mt-1">
            {errors.description
              ? <p className="text-xs text-red-500">{errors.description}</p>
              : <span />
            }
            <p className="text-xs text-gray-400">{form.description.length}/5000</p>
          </div>
        </div>
      </section>

      {/* ── Section : Date & Heure ────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Date & Heure
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <ValidatedInput
              type="date"
              value={form.date}
              onChange={(v) => setField('date', v)}
              placeholder=""
              icon={Calendar}
              isValid={!!form.date}
              showValidation={!!form.date}
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          {/* Heure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Heure <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
            </label>
            <ValidatedInput
              type="time"
              value={form.time}
              onChange={(v) => setField('time', v)}
              placeholder=""
              icon={Clock}
              isValid={true}
              showValidation={false}
            />
          </div>
        </div>
      </section>

      {/* ── Section : Lieu ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Lieu
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse <span className="text-red-500">*</span>
          </label>
          <AddressAutocomplete
            value={addressQuery}
            suggestions={addressSuggestions}
            isSelected={!!selectedAddress}
            onChange={handleAddressInput}
            onSelect={handleSelectAddress}
            onClear={clearAddress}
            error={errors.address}
          />
        </div>
      </section>

      {/* ── Section : Catégories ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Catégories <span className="text-red-500">*</span>
        </h2>
        <CategorySelector
          selected={form.categories}
          onToggle={toggleCategory}
          error={errors.categories}
        />
      </section>

      {/* ── Section : Tarification ────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Tarification
        </h2>
        <PricingField
          isFree={form.isFree}
          pricingEuros={form.pricingEuros}
          onToggleFree={(v) => setField('isFree', v)}
          onPriceChange={(v) => setField('pricingEuros', v)}
          error={errors.pricingEuros}
        />
      </section>

      {/* ── Section : Entreprise ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Organisateur
        </h2>

        {companiesError && (
          <p className="text-sm text-red-500">{companiesError}</p>
        )}

        {companiesLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            Chargement des entreprises…
          </div>
        ) : companies.length > 1 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Entreprise organisatrice <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center gap-2 px-3 py-3 rounded-lg border bg-gray-50
              ${errors.selectedCompanyId ? 'border-red-400' : 'border-gray-200 focus-within:border-iakoa-blue'}`}>
              <Building2 size={18} className="text-gray-400 shrink-0" />
              <select
                value={form.selectedCompanyId}
                onChange={(e) => setField('selectedCompanyId', e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm"
              >
                <option value="">Sélectionnez une entreprise…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {errors.selectedCompanyId && (
              <p className="text-xs text-red-500 mt-1">{errors.selectedCompanyId}</p>
            )}
          </div>
        ) : companies.length === 1 ? (
          <div className="flex items-center gap-2 px-3 py-3 rounded-lg bg-gray-50 border border-gray-200">
            <Building2 size={18} className="text-gray-400" />
            <span className="text-sm text-gray-700">{companies[0].name}</span>
          </div>
        ) : null}
      </section>

      {/* ── Section : Médias (optionnel) ──────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Médias <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
        </h2>
        <ImageUploadField
          file={imageFile}
          previewUrl={imagePreviewUrl}
          onChange={handleImageChange}
          onClear={handleImageClear}
        />
      </section>

      {/* ── Section : Site web (optionnel) ────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Liens <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Site web de l'événement
          </label>
          <ValidatedInput
            type="url"
            value={form.website}
            onChange={(v) => setField('website', v)}
            placeholder="https://monsite.fr/mon-evenement"
            icon={Globe}
            isValid={!errors.website}
            showValidation={form.website.length > 0}
          />
          {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website}</p>}
        </div>
      </section>

      {/* ── Erreur globale de soumission ──────────────────────────────────── */}
      {errors.submit && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{errors.submit}</p>
        </div>
      )}

      {/* ── Bouton aperçu / soumission ───────────────────────────────────── */}
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
            Publication en cours…
          </>
        ) : (
          isEditMode ? 'Aperçu et mise à jour →' : 'Aperçu et publication →'
        )}
      </button>
    </form>
  );
}
