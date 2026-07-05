import { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, CheckCircle2 } from 'lucide-react';
import type { PlaceType } from '@/lib/services/adminService';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { useCitySearch, formatCityLabel } from '@/lib/hooks/useCitySearch';
import { useAdminPlaces, useCreatePlace, useUpdatePlace, useDeletePlace } from './hooks';

// Gestion des lieux réutilisables (salles, parcs, places de village…)
function PlacesPage() {
  const { data: places, isLoading, error } = useAdminPlaces();
  const createPlace = useCreatePlace();
  const updatePlace = useUpdatePlace();
  const deletePlace = useDeletePlace();
  const { toast } = useToast();
  const { suggestions, showSuggestions, searchCitiesDebounced, hideSuggestions } = useCitySearch();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setAddress('');
    setCityInput('');
    setCity('');
    setPostalCode('');
    setCoords(null);
    setFormError(null);
  };

  const startEdit = (place: PlaceType) => {
    setEditingId(place.id);
    setShowForm(true);
    setName(place.name);
    setAddress(place.address ?? '');
    setCityInput(place.city ?? '');
    setCity(place.city ?? '');
    setPostalCode(place.postalCode ?? '');
    setCoords({ lat: place.latitude, lng: place.longitude });
    setFormError(null);
  };

  const handleSubmit = () => {
    setFormError(null);
    if (!name.trim()) return setFormError('Le nom du lieu est obligatoire.');
    if (!coords) return setFormError('Sélectionnez une ville dans les suggestions (GPS requis).');

    const payload = {
      name: name.trim(),
      address: address.trim() || undefined,
      city: city || undefined,
      postalCode: postalCode || undefined,
      country: 'France',
      latitude: coords.lat,
      longitude: coords.lng,
    };

    const onError = (err: Error) =>
      setFormError(err instanceof ApiError ? err.message : "L'enregistrement a échoué.");

    if (editingId) {
      updatePlace.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            toast('success', 'Lieu mis à jour.');
            resetForm();
          },
          onError,
        },
      );
    } else {
      createPlace.mutate(payload, {
        onSuccess: () => {
          toast('success', `Lieu « ${name.trim()} » créé.`);
          resetForm();
        },
        onError,
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
          <h1 className="text-2xl font-bold text-gray-900">Lieux</h1>
          <span className="text-sm text-gray-400">({places?.length ?? 0})</span>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </button>
        )}
      </div>

      {/* Formulaire création / édition */}
      {showForm && (
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">
            {editingId ? 'Modifier le lieu' : 'Nouveau lieu'}
          </p>
          <input
            type="text"
            placeholder="Nom du lieu (ex : Salle des fêtes) *"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={150}
            className="input input-bordered w-full bg-white"
          />
          <input
            type="text"
            placeholder="Adresse (optionnel)"
            value={address}
            onChange={e => setAddress(e.target.value)}
            maxLength={255}
            className="input input-bordered w-full bg-white"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Ville (sélectionnez dans la liste) *"
                value={cityInput}
                onChange={e => {
                  setCityInput(e.target.value);
                  searchCitiesDebounced(e.target.value);
                  if (e.target.value !== city) {
                    setCity('');
                    setCoords(null);
                  }
                }}
                className="input input-bordered w-full bg-white"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {suggestions.map(suggestion => (
                    <li key={`${suggestion.name}-${suggestion.postcode}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setCityInput(suggestion.name);
                          setCity(suggestion.name);
                          setPostalCode(suggestion.postcode ?? '');
                          setCoords({ lat: suggestion.lat, lng: suggestion.lon });
                          hideSuggestions();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {formatCityLabel(suggestion)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {coords && city && (
                <p className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Position GPS enregistrée
                </p>
              )}
            </div>
            <input
              type="text"
              placeholder="Code postal"
              value={postalCode}
              onChange={e => setPostalCode(e.target.value.slice(0, 20))}
              className="input input-bordered w-full bg-white"
            />
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
              disabled={createPlace.isPending || updatePlace.isPending}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {editingId ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      )}

      {(places ?? []).length === 0 && !showForm && (
        <p className="text-center py-12 text-gray-400">
          Aucun lieu référencé. Créez des lieux réutilisables pour vos événements.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {(places ?? []).map(place => (
          <li
            key={place.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200"
          >
            <MapPin className="h-5 w-5 text-gray-300 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{place.name}</p>
              <p className="text-xs text-gray-400 truncate">
                {[place.address, place.postalCode, place.city].filter(Boolean).join(', ')}
              </p>
            </div>
            <button
              onClick={() => startEdit(place)}
              title="Modifier"
              className="p-1.5 rounded-lg text-gray-400 hover:text-iakoa-blue hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
            </button>
            {pendingDeleteId === place.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    deletePlace.mutate(place.id, {
                      onSuccess: () => {
                        toast('success', `« ${place.name} » supprimé.`);
                        setPendingDeleteId(null);
                      },
                      onError: err =>
                        toast(
                          'error',
                          err instanceof ApiError ? err.message : 'La suppression a échoué.',
                        ),
                    })
                  }
                  disabled={deletePlace.isPending}
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
                onClick={() => setPendingDeleteId(place.id)}
                title="Supprimer"
                className="p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlacesPage;
