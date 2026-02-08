import { useState } from 'react';
import { Loader2, User, Mail, Check, X } from 'lucide-react';
import {
  isValidName,
  isValidEmail,
  passwordChecks,
  isValidPassword,
  comparePasswords,
  isValidUser,
} from '@/utils/validators';
import { useAuth } from '../AuthContext';
import SocialConnectIcons from './SocialConnectIcons';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface UnifiedAuthFormProps {
  isLogin: boolean;
}

// Formulaire unifié de connexion/inscription
// Gère deux modes: login (simple) et register (avec validation)
// Utilise les composants UI réutilisables pour réduire la duplication
function UnifiedAuthForm({ isLogin }: UnifiedAuthFormProps) {
  // États séparés pour login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // États séparés pour register
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  // Valeurs actuelles selon le mode
  const name = isLogin ? '' : registerName;
  const email = isLogin ? loginEmail : registerEmail;
  const password = isLogin ? loginPassword : registerPassword;
  const confirmPassword = isLogin ? '' : registerConfirmPassword;

  // Validation
  const nameValid = name.length > 0 && isValidName(name);
  const emailValid = email.length > 0 && isValidEmail(email);
  const passwordValid = isValidPassword(password);
  const passwordsMatch =
    confirmPassword.length > 0 && comparePasswords(password, confirmPassword);
  const isFormValid = isLogin
    ? email.length > 0 && password.length > 0
    : isValidUser(name, email, password).valid && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = isLogin
      ? await login(email, password)
      : await register(name, email, password);

    if (!result.success) {
      setError(result.error || 'Erreur de connexion');
    } else {
      // Fermer le modal après une connexion réussie
      const modal = document.getElementById('auth_modal') as HTMLDialogElement;
      modal?.close();
    }
    setIsLoading(false);
  };

  // Composant local pour critères de validation (styling spécifique)
  const ValidationItem = ({
    valid,
    label,
  }: {
    valid: boolean;
    label: string;
  }) => (
    <span
      className={`flex items-center gap-1 ${valid ? 'text-green-500' : 'text-red-400'}`}
    >
      {valid ? <Check size={12} /> : <X size={12} />}
      {label}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {/* Nom (seulement pour inscription) */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          height: !isLogin ? '77px' : '0px',
          transform: !isLogin ? 'translateY(0)' : 'translateY(-100%)',
          opacity: !isLogin ? 1 : 0,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ValidatedInput
          type="text"
          value={name}
          onChange={setRegisterName}
          placeholder="Votre nom"
          icon={User}
          isValid={nameValid}
          showValidation={name.length > 0}
        />
        <div className="h-1.5 mt-1">
          {name.length > 0 && !nameValid && (
            <p className="text-red-500 text-xs">
              Entre 2 et 30 caractères (lettres, espaces, tirets, apostrophes)
            </p>
          )}
        </div>
      </div>

      {/* Adresse email */}
      <div>
        <ValidatedInput
          type="email"
          value={email}
          onChange={isLogin ? setLoginEmail : setRegisterEmail}
          placeholder="Email"
          icon={Mail}
          isValid={emailValid}
          showValidation={!isLogin && email.length > 0}
        />
        {!isLogin && (
          <div className="h-1.5 mt-1">
            {email.length > 0 && !emailValid && (
              <p className="text-red-500 text-xs">Format email invalide</p>
            )}
          </div>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <PasswordInput
          value={password}
          onChange={isLogin ? setLoginPassword : setRegisterPassword}
          placeholder="Mot de passe"
          showValidation={!isLogin && password.length > 0}
          isValid={passwordValid}
        />
        {/* Critères de validation du mot de passe (inscription) / Mot de passe oublié (connexion) */}
        <div className="h-1.5 mt-1">
          {!isLogin && password.length > 0 && !passwordValid && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <ValidationItem
                valid={passwordChecks.minLength(password)}
                label="8 caractères"
              />
              <ValidationItem
                valid={passwordChecks.hasUppercase(password)}
                label="1 majuscule"
              />
              <ValidationItem
                valid={passwordChecks.hasDigit(password)}
                label="1 chiffre"
              />
              <ValidationItem
                valid={passwordChecks.hasSpecialChar(password)}
                label="1 spécial"
              />
            </div>
          )}
          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-iakoa-blue hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation du mot de passe (inscription seulement) */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          height: !isLogin ? '77px' : '0px',
          transform: !isLogin ? 'translateY(0)' : 'translateY(100%)',
          opacity: !isLogin ? 1 : 0,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <PasswordInput
          value={confirmPassword}
          onChange={setRegisterConfirmPassword}
          placeholder="Confirmer le mot de passe"
          showValidation={confirmPassword.length > 0}
          isValid={passwordsMatch}
        />
        <div className="h-1.5 mt-1">
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-red-500 text-xs">
              Les mots de passe ne correspondent pas
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full bg-iakoa-blue text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {isLogin ? 'Connexion...' : 'Création du compte...'}
          </>
        ) : isLogin ? (
          'Se connecter'
        ) : (
          "S'inscrire"
        )}
      </button>

      <SocialConnectIcons label={isLogin ? "ou se connecter avec :" : "ou s'inscrire avec :"} />
    </form>
  );
}

export default UnifiedAuthForm;
