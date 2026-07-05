import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { isValidPassword, comparePasswords } from '@/utils/validators';
import { resetPasswordAPI } from '@/lib/services/authService';
import { PasswordInput } from '@/components/ui/PasswordInput';

// Page de réinitialisation de mot de passe (lien reçu par email)
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordValid = isValidPassword(password);
  const passwordsMatch = confirmPassword.length > 0 && comparePasswords(password, confirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await resetPasswordAPI(token, password);
    setIsLoading(false);

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 4000);
    } else {
      setError(result.message || 'Lien invalide ou expiré. Refaites une demande.');
    }
  };

  if (!token) {
    return (
      <CenteredCard>
        <h1 className="text-xl font-bold text-red-600 mb-2">Lien invalide</h1>
        <p className="text-gray-600 text-sm">
          Ce lien de réinitialisation est incomplet. Refaites une demande depuis la page de
          connexion.
        </p>
        <Link to="/" className="text-iakoa-blue hover:underline text-sm mt-4 inline-block">
          Retour à l&apos;accueil
        </Link>
      </CenteredCard>
    );
  }

  if (success) {
    return (
      <CenteredCard>
        <h1 className="text-xl font-bold text-green-600 mb-2">Mot de passe réinitialisé ✅</h1>
        <p className="text-gray-600 text-sm">
          Vous pouvez maintenant vous connecter avec votre nouveau mot de passe. Redirection en
          cours…
        </p>
      </CenteredCard>
    );
  }

  return (
    <CenteredCard>
      <h1 className="text-xl font-bold mb-4">Nouveau mot de passe</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Nouveau mot de passe"
          showValidation={password.length > 0}
          isValid={passwordValid}
        />
        {password.length > 0 && !passwordValid && (
          <p className="text-red-500 text-xs">
            Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial.
          </p>
        )}
        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirmer le mot de passe"
          showValidation={confirmPassword.length > 0}
          isValid={passwordsMatch}
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-red-500 text-xs">Les mots de passe ne correspondent pas.</p>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || !passwordValid || !passwordsMatch}
          className="w-full bg-iakoa-blue text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Réinitialiser'}
        </button>
      </form>
    </CenteredCard>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        {children}
      </div>
    </div>
  );
}
