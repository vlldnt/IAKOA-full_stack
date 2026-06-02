import { useState } from 'react';
import { Lock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { updateUser } from '@/lib/services/accountService';

interface ChangePasswordSectionProps {
  userId: string;
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

export function ChangePasswordSection({ userId }: ChangePasswordSectionProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid = PASSWORD_REGEX.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSave = async () => {
    if (!passwordValid || !passwordsMatch) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateUser(userId, { password: newPassword });
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="change-password-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Lock size={16} className="text-gray-400" />
        <h2 className="text-base font-semibold text-gray-900">Changer le mot de passe</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nouveau mot de passe
          </label>
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Min 8 car., 1 majuscule, 1 chiffre, 1 spécial"
            isValid={passwordValid}
            showValidation={newPassword.length > 0}
          />
          {newPassword.length > 0 && !passwordValid && (
            <p className="text-xs text-red-500 mt-1">
              Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirmer le mot de passe
          </label>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Répétez le mot de passe"
            isValid={passwordsMatch}
            showValidation={confirmPassword.length > 0}
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle size={14} /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle2 size={15} /> Mot de passe mis à jour
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSubmitting || !passwordValid || !passwordsMatch}
          className="w-full py-3 rounded-xl bg-iakoa-blue text-white text-sm font-semibold
            hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 transition-colors"
        >
          {isSubmitting ? (
            <><Loader2 size={15} className="animate-spin" /> Enregistrement…</>
          ) : (
            'Mettre à jour le mot de passe'
          )}
        </button>
      </div>
    </div>
  );
}
