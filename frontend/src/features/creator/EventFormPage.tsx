import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarPlus, ChevronLeft, ChevronRight, LogIn, Sparkles } from 'lucide-react';
import type { EventType } from '@/lib/types/EventType';
import type { CompanyType } from '@/lib/services/companiesService';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { useCreateEvent, useUpdateEvent } from '@/features/events_page/hooks';
import { useBecomeCreator, useMyCompanies, useMyEvents } from './hooks';
import { EMPTY_FORM, formFromEvent, toEventPayload, validateStep } from './form-utils';
import type { EventFormData } from './form-utils';
import { CompanyStep } from './components/CompanyStep';
import { DetailsStep } from './components/DetailsStep';
import { LocationStep } from './components/LocationStep';
import { CategoriesMediaStep } from './components/CategoriesMediaStep';

const STEPS = ['Organisateur', 'Événement', 'Lieu', 'Catégories'] as const;

// Page /create et /edit/:id : formulaire multi-étapes de création
// d'événement. Tout nouvel événement part en modération (statut PENDING).
function EventFormPage() {
  const { id: editId } = useParams<{ id: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const { data: companies, isLoading: isLoadingCompanies } = useMyCompanies();
  const { data: myEvents, isLoading: isLoadingMyEvents } = useMyEvents();
  const becomeCreator = useBecomeCreator();

  const isEdit = !!editId;
  const editedEvent = isEdit ? myEvents?.find(event => event.id === editId) : undefined;

  const openAuthModal = () => {
    (document.getElementById('auth_modal') as HTMLDialogElement | null)?.showModal();
  };

  // ── Gardes d'accès ──────────────────────────────────────────────────────
  if (isAuthLoading || (user?.isCreator && (isLoadingCompanies || (isEdit && isLoadingMyEvents)))) {
    return (
      <div className="w-full min-h-screen bg-white pt-30 md:pt-4 flex items-start justify-center">
        <span className="loading loading-spinner loading-lg mt-24"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <GateMessage
        icon={<LogIn className="h-12 w-12 text-gray-200" />}
        message="Connectez-vous pour créer un événement."
      >
        <button
          onClick={openAuthModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          Se connecter
        </button>
      </GateMessage>
    );
  }

  if (!user.isCreator) {
    return (
      <GateMessage
        icon={<Sparkles className="h-12 w-12 text-iakoa-blue opacity-40" />}
        message="Passez en compte organisateur pour publier vos événements sur Iakoa. C'est gratuit — vos événements seront vérifiés par notre équipe avant publication."
      >
        <button
          onClick={() =>
            becomeCreator.mutate(undefined, {
              onSuccess: () => toast('success', 'Vous êtes maintenant organisateur !'),
              onError: () => toast('error', "L'activation du compte organisateur a échoué."),
            })
          }
          disabled={becomeCreator.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {becomeCreator.isPending ? 'Activation…' : 'Devenir organisateur'}
        </button>
      </GateMessage>
    );
  }

  if (isEdit && !editedEvent) {
    return (
      <GateMessage
        icon={<CalendarPlus className="h-12 w-12 text-gray-200" />}
        message="Événement introuvable ou vous n'en êtes pas l'organisateur."
      />
    );
  }

  // Les données sont chargées : l'état initial du wizard est complet
  // (pré-remplissage en édition, entreprise unique présélectionnée en création)
  const initialForm = editedEvent
    ? formFromEvent(editedEvent)
    : companies?.length === 1
      ? { ...EMPTY_FORM, companyId: companies[0].id }
      : EMPTY_FORM;

  return (
    <EventWizard
      key={editedEvent?.id ?? 'new'}
      initialForm={initialForm}
      editedEvent={editedEvent}
      companies={companies ?? []}
    />
  );
}

// Wizard monté une fois les données chargées : l'état du formulaire est
// initialisé au montage, sans synchronisation par effet.
function EventWizard({
  initialForm,
  editedEvent,
  companies,
}: {
  initialForm: EventFormData;
  editedEvent?: EventType;
  companies: CompanyType[];
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<EventFormData>(initialForm);
  const [stepError, setStepError] = useState<string | null>(null);

  const isEdit = !!editedEvent;
  const isSubmitting = createEvent.isPending || updateEvent.isPending;

  const patchForm = (patch: Partial<EventFormData>) => {
    setForm(current => ({ ...current, ...patch }));
    setStepError(null);
  };

  const goNext = () => {
    const error = validateStep(step, form);
    if (error) return setStepError(error);
    setStepError(null);
    setStep(current => current + 1);
  };

  const goBack = () => {
    setStepError(null);
    setStep(current => Math.max(0, current - 1));
  };

  const handleSubmit = () => {
    // Toutes les étapes doivent être valides avant l'envoi
    for (let s = 0; s < STEPS.length; s++) {
      const error = validateStep(s, form);
      if (error) {
        setStep(s);
        return setStepError(error);
      }
    }

    const payload = toEventPayload(form);
    const onError = (error: Error) =>
      toast(
        'error',
        error instanceof ApiError ? error.message : "L'enregistrement a échoué. Réessayez.",
      );

    if (isEdit && editedEvent?.id) {
      updateEvent.mutate(
        { id: editedEvent.id, data: payload },
        {
          onSuccess: () => {
            toast('success', 'Événement mis à jour. Il sera vérifié par notre équipe.');
            navigate('/my-events');
          },
          onError,
        },
      );
    } else {
      createEvent.mutate(payload, {
        onSuccess: () => {
          toast('success', 'Événement soumis ! Il sera visible après validation.');
          navigate('/my-events');
        },
        onError,
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4 pb-24 lg:pb-8">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2 pt-6 pb-4">
          <CalendarPlus className="h-6 w-6 text-iakoa-blue" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Modifier l'événement" : 'Créer un événement'}
          </h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => index < step && setStep(index)}
              className={`flex-1 flex flex-col items-center gap-1.5 ${
                index < step ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span
                className={`h-1.5 w-full rounded-full transition-colors ${
                  index <= step ? 'bg-iakoa-blue' : 'bg-gray-200'
                }`}
              />
              <span
                className={`text-[11px] font-medium ${
                  index === step ? 'text-iakoa-blue' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        {editedEvent?.status === 'REJECTED' && editedEvent.moderationNote && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            <p className="font-semibold">Événement refusé — motif :</p>
            <p>{editedEvent.moderationNote}</p>
            <p className="text-xs text-red-400 mt-1">
              Après modification, il repartira automatiquement en vérification.
            </p>
          </div>
        )}

        {step === 0 && (
          <CompanyStep
            companies={companies}
            isLoading={false}
            selectedCompanyId={form.companyId}
            onSelect={companyId => patchForm({ companyId })}
          />
        )}
        {step === 1 && <DetailsStep form={form} onChange={patchForm} />}
        {step === 2 && <LocationStep form={form} onChange={patchForm} />}
        {step === 3 && <CategoriesMediaStep form={form} onChange={patchForm} />}

        {stepError && (
          <p className="mt-4 p-3 rounded-lg bg-red-50 text-sm text-red-600">{stepError}</p>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center justify-center gap-1 flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? 'Envoi…'
                : isEdit
                  ? 'Enregistrer les modifications'
                  : 'Soumettre pour publication'}
            </button>
          )}
        </div>

        {!isEdit && step === STEPS.length - 1 && (
          <p className="text-xs text-gray-400 text-center mt-3">
            Votre événement sera vérifié par notre équipe avant d'être visible publiquement.
          </p>
        )}
      </div>
    </div>
  );
}

// Écran d'information centré (non connecté, non organisateur, introuvable)
function GateMessage({
  icon,
  message,
  children,
}: {
  icon: React.ReactNode;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4">
      <div className="flex flex-col items-center gap-4 py-24 px-6 text-center max-w-md mx-auto">
        {icon}
        <p className="text-gray-600">{message}</p>
        {children}
      </div>
    </div>
  );
}

export default EventFormPage;
