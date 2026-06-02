import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Plus, Pencil, Trash2, ChevronUp,
  Globe, Hash, CheckCircle2, AlertTriangle, Loader2, X,
} from 'lucide-react';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { SocialNetworksFields } from '@/features/create_company/components/SocialNetworksFields';
import {
  fetchMyCompanies, updateCompany, deleteCompany,
  type CompanyType, type SocialNetworks,
} from '@/lib/services/companiesService';

interface EditState {
  name: string;
  siren: string;
  description: string;
  website: string;
  socialNetworks: SocialNetworks;
}

function emptyEdit(c: CompanyType): EditState {
  return {
    name: c.name,
    siren: c.siren,
    description: c.description ?? '',
    website: c.website ?? '',
    socialNetworks: (c as any).socialNetworks ?? {},
  };
}

export function CompaniesSection() {
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editStates, setEditStates] = useState<Record<string, EditState>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successes, setSuccesses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMyCompanies()
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string, company: CompanyType) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!editStates[id]) {
        setEditStates((s) => ({ ...s, [id]: emptyEdit(company) }));
      }
    }
  };

  const setEditField = (id: string, key: keyof EditState, value: string) => {
    setEditStates((s) => ({ ...s, [id]: { ...s[id], [key]: value } }));
  };

  const setSocialField = (id: string, key: keyof SocialNetworks, value: string) => {
    setEditStates((s) => ({
      ...s,
      [id]: { ...s[id], socialNetworks: { ...s[id].socialNetworks, [key]: value } },
    }));
  };

  const handleSave = async (id: string) => {
    const state = editStates[id];
    if (!state) return;

    if (!state.name.trim()) {
      setErrors((e) => ({ ...e, [id]: 'Le nom est requis.' }));
      return;
    }
    if (!/^\d{9}$/.test(state.siren.trim())) {
      setErrors((e) => ({ ...e, [id]: 'Le SIREN doit contenir 9 chiffres.' }));
      return;
    }

    setSaving(id);
    setErrors((e) => ({ ...e, [id]: '' }));
    try {
      const updated = await updateCompany(id, {
        name: state.name.trim(),
        siren: state.siren.trim(),
        description: state.description.trim() || undefined,
        website: state.website.trim() || undefined,
        socialNetworks: state.socialNetworks,
      });
      setCompanies((cs) => cs.map((c) => (c.id === id ? updated : c)));
      setSuccesses((s) => ({ ...s, [id]: true }));
      setTimeout(() => setSuccesses((s) => ({ ...s, [id]: false })), 3000);
      setExpandedId(null);
    } catch (err: any) {
      setErrors((e) => ({ ...e, [id]: err.message }));
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette entreprise ? Cette action est irréversible.')) return;
    setDeleting(id);
    try {
      await deleteCompany(id);
      setCompanies((cs) => cs.filter((c) => c.id !== id));
    } catch (err: any) {
      setErrors((e) => ({ ...e, [id]: err.message }));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Chargement des entreprises…
      </div>
    );
  }

  return (
    <div id="companies-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Mes entreprises</h2>
        </div>
        <Link
          to="/company/new"
          className="flex items-center gap-1.5 text-sm text-iakoa-blue hover:underline"
        >
          <Plus size={14} /> Nouvelle
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-8">
          <Building2 size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-500">Aucune entreprise enregistrée.</p>
          <Link to="/company/new" className="text-sm text-iakoa-blue hover:underline mt-2 inline-block">
            Créer ma première entreprise →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => {
            const isExpanded = expandedId === company.id;
            const edit = editStates[company.id];
            const isSaving = saving === company.id;
            const isDeleting = deleting === company.id;

            return (
              <div key={company.id} className="border border-gray-100 rounded-xl overflow-hidden">
                {/* ── En-tête de l'entreprise ── */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Building2 size={15} className="text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{company.name}</p>
                      <p className="text-xs text-gray-400">SIREN : {company.siren}</p>
                    </div>
                    {company.isValidated && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-600 font-medium">
                        Validée
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleExpand(company.id, company)}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-500 transition-colors"
                      title="Modifier"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <Pencil size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* ── Formulaire d'édition ── */}
                {isExpanded && edit && (
                  <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                        <ValidatedInput
                          type="text"
                          value={edit.name}
                          onChange={(v) => setEditField(company.id, 'name', v)}
                          placeholder="Nom de l'entreprise"
                          icon={Building2}
                          isValid={edit.name.trim().length > 0}
                          showValidation={edit.name.length > 0}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">SIREN *</label>
                        <ValidatedInput
                          type="text"
                          value={edit.siren}
                          onChange={(v) => setEditField(company.id, 'siren', v.replace(/\D/g, '').slice(0, 9))}
                          placeholder="123456789"
                          icon={Hash}
                          isValid={/^\d{9}$/.test(edit.siren)}
                          showValidation={edit.siren.length > 0}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <textarea
                        value={edit.description}
                        onChange={(e) => setEditField(company.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none resize-none focus:border-iakoa-blue"
                        placeholder="Description de votre entreprise…"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Site web</label>
                      <ValidatedInput
                        type="url"
                        value={edit.website}
                        onChange={(v) => setEditField(company.id, 'website', v)}
                        placeholder="https://mon-entreprise.fr"
                        icon={Globe}
                        isValid={!edit.website || (() => { try { new URL(edit.website); return true; } catch { return false; } })()}
                        showValidation={edit.website.length > 0}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Réseaux sociaux</label>
                      <SocialNetworksFields
                        values={edit.socialNetworks}
                        onChange={(key, value) => setSocialField(company.id, key, value)}
                        errors={{}}
                      />
                    </div>

                    {errors[company.id] && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertTriangle size={14} /> {errors[company.id]}
                      </div>
                    )}
                    {successes[company.id] && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle2 size={14} /> Entreprise mise à jour
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setExpandedId(null)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                          text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
                      >
                        <X size={13} /> Annuler
                      </button>
                      <button
                        onClick={() => handleSave(company.id)}
                        disabled={isSaving}
                        className="flex-1 py-2.5 rounded-xl bg-iakoa-blue text-white text-sm font-semibold
                          hover:bg-blue-600 disabled:opacity-60 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {isSaving
                          ? <><Loader2 size={13} className="animate-spin" /> Enregistrement…</>
                          : <><CheckCircle2 size={13} /> Enregistrer</>
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
