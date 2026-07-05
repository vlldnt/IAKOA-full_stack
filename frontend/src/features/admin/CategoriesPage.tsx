import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import type { AdminCategory } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import {
  useAdminCategories,
  useCategoryGroups,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './hooks';

// Gestion du catalogue de catégories : création, édition, activation, suppression
function CategoriesPage() {
  const { data: categories, isLoading, error } = useAdminCategories();
  const { data: groups } = useCategoryGroups();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#2397FF');
  const [groupId, setGroupId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const onApiError = (err: Error) =>
    setFormError(err instanceof ApiError ? err.message : "L'opération a échoué.");

  // Catégories groupées pour l'affichage
  const grouped = useMemo(() => {
    const byGroup = new Map<string, { label: string; items: AdminCategory[] }>();
    for (const category of categories ?? []) {
      const key = category.group?.id ?? 'none';
      if (!byGroup.has(key)) {
        byGroup.set(key, { label: category.group?.label ?? 'Sans groupe', items: [] });
      }
      byGroup.get(key)!.items.push(category);
    }
    return [...byGroup.values()];
  }, [categories]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSlug('');
    setLabel('');
    setColor('#2397FF');
    setGroupId('');
    setFormError(null);
  };

  const startEdit = (category: AdminCategory) => {
    setEditingId(category.id);
    setShowForm(true);
    setSlug(category.slug);
    setLabel(category.label);
    setColor(category.color ?? '#2397FF');
    setGroupId(category.groupId ?? '');
    setFormError(null);
  };

  const handleSubmit = () => {
    setFormError(null);
    if (!/^[A-Z0-9_]{2,50}$/.test(slug))
      return setFormError('Slug : 2 à 50 caractères en majuscules (A-Z, 0-9, _).');
    if (!label.trim()) return setFormError('Le libellé est obligatoire.');

    const payload = {
      slug,
      label: label.trim(),
      color,
      groupId: groupId || undefined,
    };

    if (editingId) {
      updateCategory.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            toast('success', 'Catégorie mise à jour.');
            resetForm();
          },
          onError: onApiError,
        },
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => {
          toast('success', `Catégorie « ${label.trim()} » créée.`);
          resetForm();
        },
        onError: onApiError,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-md">
        <span>{error.message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <span className="text-sm text-gray-400">({categories?.length ?? 0})</span>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nouvelle
          </button>
        )}
      </div>

      {/* Formulaire création / édition */}
      {showForm && (
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">
            {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Slug (ex : FOOD_TRUCK) *"
              value={slug}
              onChange={e => setSlug(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              disabled={!!editingId}
              className="input input-bordered w-full bg-white disabled:bg-gray-100"
            />
            <input
              type="text"
              placeholder="Libellé affiché *"
              value={label}
              onChange={e => setLabel(e.target.value)}
              maxLength={100}
              className="input input-bordered w-full bg-white"
            />
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="select select-bordered w-full bg-white"
            >
              <option value="">Sans groupe</option>
              {(groups ?? []).map(group => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
              />
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${color}15`, color }}
              >
                {label || 'Aperçu'}
              </span>
            </div>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex gap-2 self-end">
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={createCategory.isPending || updateCategory.isPending}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {editingId ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      )}

      {/* Liste groupée */}
      {grouped.map(group => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {group.label}
          </p>
          <ul className="flex flex-col gap-1.5">
            {group.items.map(category => (
              <li
                key={category.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 ${
                  category.isActive ? '' : 'opacity-50'
                }`}
              >
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                  style={{
                    backgroundColor: `${category.color ?? '#6B7280'}15`,
                    color: category.color ?? '#6B7280',
                  }}
                >
                  {category.label}
                </span>
                <span className="text-xs text-gray-400 font-mono truncate">{category.slug}</span>
                <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
                  {category._count.events} évén.
                </span>
                <button
                  onClick={() =>
                    updateCategory.mutate(
                      { id: category.id, payload: { isActive: !category.isActive } },
                      {
                        onSuccess: () =>
                          toast(
                            'success',
                            category.isActive ? 'Catégorie masquée.' : 'Catégorie activée.',
                          ),
                        onError: err =>
                          toast(
                            'error',
                            err instanceof ApiError ? err.message : "L'opération a échoué.",
                          ),
                      },
                    )
                  }
                  title={category.isActive ? 'Masquer des filtres' : 'Rendre visible'}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {category.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => startEdit(category)}
                  title="Modifier"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-iakoa-blue hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {pendingDeleteId === category.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        deleteCategory.mutate(category.id, {
                          onSuccess: () => {
                            toast('success', `« ${category.label} » supprimée.`);
                            setPendingDeleteId(null);
                          },
                          onError: err =>
                            toast(
                              'error',
                              err instanceof ApiError ? err.message : 'La suppression a échoué.',
                            ),
                        })
                      }
                      disabled={deleteCategory.isPending}
                      className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setPendingDeleteId(null)}
                      className="px-2 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Non
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPendingDeleteId(category.id)}
                    title={
                      category._count.events > 0
                        ? `Supprimer (détachera ${category._count.events} événement(s))`
                        : 'Supprimer'
                    }
                    className="p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default CategoriesPage;
