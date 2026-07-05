import { useState } from 'react';
import { Building2, Plus, CheckCircle2 } from 'lucide-react';
import type { CompanyType } from '@/lib/services/companiesService';
import { useCreateCompany } from '../hooks';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';

interface CompanyStepProps {
  companies: CompanyType[];
  isLoading: boolean;
  selectedCompanyId: string;
  onSelect: (companyId: string) => void;
}

// Étape 1 : choix de l'entreprise organisatrice, avec création inline
export function CompanyStep({
  companies,
  isLoading,
  selectedCompanyId,
  onSelect,
}: CompanyStepProps) {
  const { toast } = useToast();
  const createCompany = useCreateCompany();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [siren, setSiren] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    setFormError(null);
    if (!name.trim()) return setFormError("Le nom de l'entreprise est obligatoire.");
    if (!/^\d{9}$/.test(siren))
      return setFormError('Le SIREN doit contenir exactement 9 chiffres.');
    if (website.trim() && !/^https?:\/\/\S+\.\S+/.test(website.trim()))
      return setFormError('Le site web doit être une URL valide (https://…).');

    createCompany.mutate(
      {
        name: name.trim(),
        siren,
        description: description.trim() || undefined,
        website: website.trim() || undefined,
      },
      {
        onSuccess: company => {
          onSelect(company.id);
          setShowForm(false);
          toast('success', `Entreprise « ${company.name} » créée.`);
        },
        onError: error =>
          setFormError(
            error instanceof ApiError ? error.message : "La création de l'entreprise a échoué.",
          ),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        L'événement sera publié au nom d'une de vos entreprises.
      </p>

      {companies.length > 0 && (
        <div className="flex flex-col gap-2">
          {companies.map(company => {
            const isSelected = company.id === selectedCompanyId;
            return (
              <button
                key={company.id}
                type="button"
                onClick={() => onSelect(company.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-iakoa-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Building2
                  className={`h-5 w-5 shrink-0 ${isSelected ? 'text-iakoa-blue' : 'text-gray-400'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{company.name}</p>
                  <p className="text-xs text-gray-400">SIREN {company.siren}</p>
                </div>
                {isSelected && <CheckCircle2 className="h-5 w-5 text-iakoa-blue shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-iakoa-blue hover:text-iakoa-blue transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {companies.length > 0 ? 'Ajouter une entreprise' : 'Créer mon entreprise'}
        </button>
      ) : (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700">Nouvelle entreprise</p>
          <input
            type="text"
            placeholder="Nom de l'entreprise *"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={100}
            className="input input-bordered w-full bg-white"
          />
          <input
            type="text"
            placeholder="SIREN (9 chiffres) *"
            value={siren}
            onChange={e => setSiren(e.target.value.replace(/\D/g, '').slice(0, 9))}
            inputMode="numeric"
            className="input input-bordered w-full bg-white"
          />
          <input
            type="url"
            placeholder="Site web (optionnel)"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            className="input input-bordered w-full bg-white"
          />
          <textarea
            placeholder="Description (optionnel)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={300}
            rows={2}
            className="textarea textarea-bordered w-full bg-white"
          />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={createCompany.isPending}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {createCompany.isPending ? 'Création…' : "Créer l'entreprise"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
