import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LogIn,
  Lock,
  MonitorSmartphone,
  Smartphone,
  Monitor,
  Trash2,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { isValidEmail, isValidName, isValidPassword } from '@/utils/validators';
import { useDeleteAccount, useRevokeSession, useSessions, useUpdateProfile } from './hooks';

// Libellé lisible d'un user-agent ("Chrome — Windows", "Safari — iPhone"…)
function describeUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Appareil inconnu';
  const ua = userAgent.toLowerCase();
  const device = ua.includes('iphone')
    ? 'iPhone'
    : ua.includes('ipad')
      ? 'iPad'
      : ua.includes('android')
        ? 'Android'
        : ua.includes('windows')
          ? 'Windows'
          : ua.includes('mac os')
            ? 'Mac'
            : ua.includes('linux')
              ? 'Linux'
              : 'Appareil';
  const browser = ua.includes('edg/')
    ? 'Edge'
    : ua.includes('firefox')
      ? 'Firefox'
      : ua.includes('chrome')
        ? 'Chrome'
        : ua.includes('safari')
          ? 'Safari'
          : 'Navigateur';
  return `${browser} — ${device}`;
}

function isMobileUserAgent(userAgent: string | null): boolean {
  return /iphone|ipad|android|mobile/i.test(userAgent ?? '');
}

// Page /profile : informations, mot de passe, appareils connectés,
// suppression de compte.
function ProfilePage() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: sessions, isLoading: isLoadingSessions } = useSessions();
  const revokeSession = useRevokeSession();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [infoInitialized, setInfoInitialized] = useState(!!user);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // L'utilisateur peut arriver avant la fin du chargement auth :
  // initialiser les champs à la première disponibilité
  if (user && !infoInitialized) {
    setName(user.name);
    setEmail(user.email);
    setInfoInitialized(true);
  }

  const openAuthModal = () => {
    (document.getElementById('auth_modal') as HTMLDialogElement | null)?.showModal();
  };

  if (isAuthLoading) {
    return (
      <div className="w-full min-h-screen bg-white pt-30 md:pt-4 flex items-start justify-center">
        <span className="loading loading-spinner loading-lg mt-24"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-white pt-30 md:pt-4">
        <div className="flex flex-col items-center gap-4 py-24 px-6 text-center max-w-md mx-auto">
          <LogIn className="h-12 w-12 text-gray-200" />
          <p className="text-gray-600">Connectez-vous pour accéder à votre profil.</p>
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const infoChanged = name.trim() !== user.name || email.trim() !== user.email;
  const infoValid = isValidName(name) && isValidEmail(email.trim());

  const handleSaveInfo = () => {
    updateProfile.mutate(
      { name: name.trim(), email: email.trim() },
      {
        onSuccess: () => toast('success', 'Profil mis à jour.'),
        onError: error =>
          toast(
            'error',
            error instanceof ApiError ? error.message : 'La mise à jour a échoué.',
          ),
      },
    );
  };

  const passwordValid = isValidPassword(newPassword) && newPassword === confirmPassword;

  const handleChangePassword = () => {
    updateProfile.mutate(
      { password: newPassword },
      {
        onSuccess: () => {
          setNewPassword('');
          setConfirmPassword('');
          toast('success', 'Mot de passe modifié.');
        },
        onError: error =>
          toast(
            'error',
            error instanceof ApiError ? error.message : 'Le changement de mot de passe a échoué.',
          ),
      },
    );
  };

  const handleDeleteAccount = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: async () => {
        await logout();
        toast('info', 'Votre compte a été supprimé.');
        navigate('/');
      },
      onError: () => toast('error', 'La suppression du compte a échoué.'),
    });
  };

  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4 pb-24 lg:pb-8">
      <div className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-6">
        <div className="flex items-center gap-2 pt-6">
          <User className="h-6 w-6 text-iakoa-blue" />
          <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
          {user.isCreator && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-iakoa-blue">
              <BadgeCheck className="h-3 w-3" />
              Organisateur
            </span>
          )}
        </div>

        {/* ── Informations ── */}
        <section className="p-5 rounded-2xl border border-gray-200 flex flex-col gap-3">
          <h2 className="font-semibold text-gray-900">Mes informations</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <button
            onClick={handleSaveInfo}
            disabled={!infoChanged || !infoValid || updateProfile.isPending}
            className="self-end px-5 py-2 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </section>

        {/* ── Mot de passe ── */}
        <section className="p-5 rounded-2xl border border-gray-200 flex flex-col gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <Lock className="h-4 w-4 text-gray-400" />
            Changer le mot de passe
          </h2>
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Nouveau mot de passe"
            showValidation
            isValid={isValidPassword(newPassword)}
          />
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirmer le nouveau mot de passe"
            showValidation
            isValid={confirmPassword.length > 0 && newPassword === confirmPassword}
          />
          <p className="text-xs text-gray-400">
            8 caractères minimum, une majuscule, un chiffre et un caractère spécial. Vous resterez
            connecté sur cet appareil.
          </p>
          <button
            onClick={handleChangePassword}
            disabled={!passwordValid || updateProfile.isPending}
            className="self-end px-5 py-2 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Modifier le mot de passe
          </button>
        </section>

        {/* ── Appareils connectés ── */}
        <section className="p-5 rounded-2xl border border-gray-200 flex flex-col gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <MonitorSmartphone className="h-4 w-4 text-gray-400" />
            Appareils connectés
          </h2>
          {isLoadingSessions && (
            <div className="text-center py-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
          <ul className="flex flex-col gap-2">
            {(sessions ?? []).map(session => (
              <li
                key={session.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
              >
                {isMobileUserAgent(session.userAgent) ? (
                  <Smartphone className="h-5 w-5 text-gray-400 shrink-0" />
                ) : (
                  <Monitor className="h-5 w-5 text-gray-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {describeUserAgent(session.userAgent)}
                    {session.isCurrent && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                        Cet appareil
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    Connecté le{' '}
                    {new Date(session.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() =>
                      revokeSession.mutate(session.id, {
                        onSuccess: () => toast('success', 'Appareil déconnecté.'),
                        onError: () => toast('error', 'La déconnexion a échoué.'),
                      })
                    }
                    disabled={revokeSession.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Déconnecter
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Zone dangereuse ── */}
        <section className="p-5 rounded-2xl border border-red-100 bg-red-50/40 flex flex-col gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-red-600">
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </h2>
          <p className="text-sm text-gray-500">
            Cette action est définitive : votre compte, vos favoris et vos événements seront
            supprimés.
          </p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="self-start px-4 py-2 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleteAccount.isPending ? 'Suppression…' : 'Oui, supprimer définitivement'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
