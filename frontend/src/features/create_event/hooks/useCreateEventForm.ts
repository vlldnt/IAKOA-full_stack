import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createEvent, updateEvent } from '@/store/slices/eventsSlice';
import { fetchMyCompanies, type CompanyType } from '@/lib/services/companiesService';
import { fetchEventById } from '@/lib/services/eventsServices';
import { searchAddresses, type AddressSuggestion } from '../services/geocodingService';
import { uploadImage } from '../services/uploadService';
import type { Media } from '@/lib/types/EventType';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  description: string;
  date: string;
  time: string;
  pricingEuros: string;
  isFree: boolean;
  website: string;
  categories: string[];
  selectedCompanyId: string;
}

export type FormErrors = Partial<Record<keyof FormState | 'address' | 'submit', string>>;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCreateEventForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const editEventId = searchParams.get('edit');
  const isEditMode = !!editEventId;

  // État du formulaire
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    date: '',
    time: '',
    pricingEuros: '',
    isFree: false,
    website: '',
    categories: [],
    selectedCompanyId: '',
  });

  // Adresse sélectionnée (objet complet avec coordonnées)
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  // Texte brut dans le champ adresse
  const [addressQuery, setAddressQuery] = useState('');
  // Suggestions de l'API BAN
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);

  // Entreprises de l'utilisateur
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  // Image de couverture
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [existingMedia, setExistingMedia] = useState<Media[]>([]);

  // Chargement du mode édition
  const [isPrefilling, setIsPrefilling] = useState(false);

  // État soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Modal aperçu avant publication
  const [showPreview, setShowPreview] = useState(false);

  // Ref pour le debounce de l'autocomplétion adresse
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Chargement des entreprises ──────────────────────────────────────────────

  useEffect(() => {
    if (!user?.isCreator) return;

    setCompaniesLoading(true);
    fetchMyCompanies()
      .then((data) => {
        setCompanies(data);
        // Auto-sélectionner si une seule entreprise
        if (data.length === 1) {
          setForm((f) => ({ ...f, selectedCompanyId: data[0].id }));
        }
      })
      .catch(() => setCompaniesError('Impossible de charger vos entreprises.'))
      .finally(() => setCompaniesLoading(false));
  }, [user]);

  useEffect(() => {
    if (!isEditMode || !editEventId || !user?.isCreator) return;

    let cancelled = false;

    const loadEventForEdit = async () => {
      setIsPrefilling(true);
      setErrors((e) => ({ ...e, submit: undefined }));

      try {
        const event = await fetchEventById(editEventId);
        if (cancelled) return;

        const eventDate = new Date(event.date);
        const date = Number.isNaN(eventDate.getTime())
          ? ''
          : eventDate.toISOString().slice(0, 10);
        const time = Number.isNaN(eventDate.getTime())
          ? ''
          : `${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')}`;

        setForm({
          name: event.name || '',
          description: event.description || '',
          date,
          time,
          pricingEuros: event.pricing ? (event.pricing / 100).toFixed(2) : '',
          isFree: event.pricing === 0,
          website: event.website || '',
          categories: event.categories || [],
          selectedCompanyId: event.companyId || '',
        });

        const address: AddressSuggestion = {
          label: event.location?.address || '',
          city: event.location?.city || '',
          postalCode: event.location?.postalCode || '',
          country: event.location?.country || '',
          coordinates: event.location?.coordinates || { lat: 0, lng: 0 },
        };

        setSelectedAddress(address);
        setAddressQuery(address.label);
        setAddressSuggestions([]);

        const firstMedia = event.media?.[0]?.url || null;
        setImageFile(null);
        setImagePreviewUrl(firstMedia);
        setExistingMedia(event.media || []);
      } catch (err: any) {
        if (cancelled) return;
        setErrors((e) => ({
          ...e,
          submit: err?.message || "Impossible de charger l'événement à éditer.",
        }));
      } finally {
        if (!cancelled) setIsPrefilling(false);
      }
    };

    loadEventForEdit();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, editEventId, user]);

  // ── Handlers formulaire ─────────────────────────────────────────────────────

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Effacer l'erreur du champ modifié
    setErrors((e) => ({ ...e, [key]: undefined }));
  }, []);

  // ── Autocomplétion adresse avec debounce ────────────────────────────────────

  const handleAddressInput = useCallback((query: string) => {
    setAddressQuery(query);
    // Si l'utilisateur modifie le texte, invalider l'adresse sélectionnée
    setSelectedAddress(null);
    setErrors((e) => ({ ...e, address: undefined }));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const results = await searchAddresses(query);
      setAddressSuggestions(results);
    }, 300);
  }, []);

  const handleSelectAddress = useCallback((suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion);
    setAddressQuery(suggestion.label);
    setAddressSuggestions([]);
    setErrors((e) => ({ ...e, address: undefined }));
  }, []);

  const clearAddress = useCallback(() => {
    setSelectedAddress(null);
    setAddressQuery('');
    setAddressSuggestions([]);
  }, []);

  // ── Image de couverture ─────────────────────────────────────────────────────

  const handleImageChange = useCallback((file: File, previewUrl: string) => {
    if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
  }, [imagePreviewUrl]);

  const handleImageClear = useCallback(() => {
    if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setExistingMedia([]);
  }, [imagePreviewUrl]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  // ── Catégories ──────────────────────────────────────────────────────────────

  const toggleCategory = useCallback((categoryId: string) => {
    setForm((f) => {
      const already = f.categories.includes(categoryId);
      return {
        ...f,
        categories: already
          ? f.categories.filter((c) => c !== categoryId)
          : [...f.categories, categoryId],
      };
    });
    setErrors((e) => ({ ...e, categories: undefined }));
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Le titre est requis.';
    } else if (form.name.trim().length > 100) {
      newErrors.name = '100 caractères maximum.';
    }

    if (!form.description.trim()) {
      newErrors.description = 'La description est requise.';
    } else if (form.description.trim().length > 5000) {
      newErrors.description = '5000 caractères maximum.';
    }

    if (!form.date) {
      newErrors.date = 'La date est requise.';
    }

    if (!selectedAddress) {
      newErrors.address = "L'adresse est requise.";
    }

    if (form.categories.length === 0) {
      newErrors.categories = 'Choisissez au moins une catégorie.';
    }

    if (!form.isFree) {
      const price = parseFloat(form.pricingEuros);
      if (isNaN(price) || price < 0) {
        newErrors.pricingEuros = 'Entrez un prix valide (ex: 12.50).';
      }
    }

    if (!form.selectedCompanyId) {
      newErrors.selectedCompanyId = 'Sélectionnez une entreprise.';
    }

    if (form.website && form.website.trim()) {
      try {
        new URL(form.website);
      } catch {
        newErrors.website = "L'URL du site web n'est pas valide.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Aperçu ──────────────────────────────────────────────────────────────────

  // Valide le formulaire puis ouvre la modale d'aperçu
  const openPreview = () => {
    if (validate()) setShowPreview(true);
  };

  const closePreview = () => setShowPreview(false);

  // ── Soumission (appelée depuis la modale de confirmation) ────────────────────

  const handleSubmit = async () => {
    setShowPreview(false);

    setIsSubmitting(true);
    setErrors((e) => ({ ...e, submit: undefined }));

    try {
      // Upload de l'image si présente
      let media: { url: string; type: string }[] = existingMedia;
      if (imageFile) {
        const url = await uploadImage(imageFile);
        media = [{ url, type: imageFile.type }];
      } else if (!imagePreviewUrl) {
        media = [];
      }

      // Construction de la date ISO — combine date + heure (ou minuit par défaut)
      const isoDate = new Date(`${form.date}T${form.time || '00:00'}`).toISOString();

      // Conversion du prix : euros → centimes (entier requis par le backend)
      const pricing = form.isFree ? 0 : Math.round(parseFloat(form.pricingEuros) * 100);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        date: isoDate,
        pricing,
        location: {
          address: selectedAddress!.label,
          city: selectedAddress!.city,
          postalCode: selectedAddress!.postalCode,
          country: selectedAddress!.country,
          coordinates: selectedAddress!.coordinates,
        },
        companyId: form.selectedCompanyId,
        website: form.website.trim() || '',
        categories: form.categories,
        media,
      };

      if (isEditMode && editEventId) {
        await dispatch(updateEvent({ id: editEventId, eventData: payload })).unwrap();
      } else {
        await dispatch(createEvent(payload)).unwrap();
      }
      setSubmitSuccess(true);

      // Redirection vers la liste des événements après un court délai (feedback visuel)
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err: any) {
      setErrors((e) => ({
        ...e,
        submit: err?.message || `Une erreur est survenue lors de la ${isEditMode ? 'mise à jour' : 'création'} de l'événement.`,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Retour du hook ──────────────────────────────────────────────────────────

  return {
    // Formulaire
    form,
    setField,
    errors,
    isSubmitting,
    isPrefilling,
    submitSuccess,
    isEditMode,
    handleSubmit,
    // Aperçu
    showPreview,
    openPreview,
    closePreview,
    // Adresse
    addressQuery,
    addressSuggestions,
    selectedAddress,
    handleAddressInput,
    handleSelectAddress,
    clearAddress,
    // Catégories
    toggleCategory,
    // Image
    imageFile,
    imagePreviewUrl,
    handleImageChange,
    handleImageClear,
    // Entreprises
    companies,
    companiesLoading,
    companiesError,
    // Utilisateur
    user,
  };
}
