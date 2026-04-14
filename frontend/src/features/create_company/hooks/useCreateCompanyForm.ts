import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { createCompany } from '@/lib/services/companiesService';
import type { SocialNetworks } from '@/lib/services/companiesService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  siren: string;
  description: string;
  website: string;
  socialNetworks: SocialNetworks;
}

export type CompanyFormErrors = Partial<
  Record<keyof FormState | keyof SocialNetworks | 'submit', string>
>;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCreateCompanyForm() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState<FormState>({
    name: '',
    siren: '',
    description: '',
    website: '',
    socialNetworks: {
      facebook: '',
      instagram: '',
      x: '',
      youtube: '',
      tiktok: '',
    },
  });

  const [errors, setErrors] = useState<CompanyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }, []);

  const setSocialField = useCallback((key: keyof SocialNetworks, value: string) => {
    setForm((f) => ({
      ...f,
      socialNetworks: { ...f.socialNetworks, [key]: value },
    }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: CompanyFormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Le nom de l'entreprise est requis.";
    } else if (form.name.length > 100) {
      newErrors.name = '100 caractères maximum.';
    }

    if (!form.siren.trim()) {
      newErrors.siren = 'Le numéro SIREN est requis.';
    } else if (!/^\d{9}$/.test(form.siren.trim())) {
      newErrors.siren = 'Le SIREN doit contenir exactement 9 chiffres.';
    }

    if (form.description.length > 300) {
      newErrors.description = '300 caractères maximum.';
    }

    if (form.website.trim()) {
      try {
        new URL(form.website);
      } catch {
        newErrors.website = "L'URL du site web n'est pas valide.";
      }
    }

    // Validation des URLs réseaux sociaux (seulement si renseignées)
    const socialKeys: (keyof SocialNetworks)[] = ['facebook', 'instagram', 'x', 'youtube', 'tiktok'];
    for (const key of socialKeys) {
      const val = form.socialNetworks[key];
      if (val && val.trim()) {
        try {
          new URL(val);
        } catch {
          newErrors[key] = 'URL invalide.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Soumission ──────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors((e) => ({ ...e, submit: undefined }));

    try {
      await createCompany({
        name: form.name.trim(),
        siren: form.siren.trim(),
        description: form.description.trim() || undefined,
        website: form.website.trim() || undefined,
        socialNetworks: form.socialNetworks,
      });

      setSubmitSuccess(true);
      // Redirection vers /create pour enchaîner avec la création d'événement
      setTimeout(() => navigate('/create'), 1500);
    } catch (err: any) {
      setErrors((e) => ({
        ...e,
        submit: err?.message || "Une erreur est survenue lors de la création de l'entreprise.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    setField,
    setSocialField,
    errors,
    isSubmitting,
    submitSuccess,
    handleSubmit,
    user,
  };
}
