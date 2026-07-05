import { useState } from 'react';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { isValidEmail } from '@/utils/validators';
import { forgotPasswordAPI } from '@/lib/services/authService';
import { ValidatedInput } from '@/components/ui/ValidatedInput';

interface ForgotPasswordFormProps {
  initialEmail?: string;
  onBack: () => void;
}

// Mini-formulaire "mot de passe oublié" affiché à la place du login.
// La réponse est toujours identique, que l'email existe ou non.
function ForgotPasswordForm({ initialEmail = '', onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const emailValid = email.length > 0 && isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await forgotPasswordAPI(email);
    setIsLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-4 w-full text-center">
        <p className="text-sm text-gray-600">
          Si un compte existe avec <strong>{email}</strong>, un lien de réinitialisation vient
          d&apos;être envoyé. Pensez à vérifier vos spams.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-iakoa-blue hover:underline flex items-center justify-center gap-1"
        >
          <ArrowLeft size={14} /> Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <p className="text-sm text-gray-600">
        Entrez votre email : nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>
      <ValidatedInput
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="Email"
        icon={Mail}
        isValid={emailValid}
        showValidation={email.length > 0}
      />
      <button
        type="submit"
        disabled={isLoading || !emailValid}
        className="w-full bg-iakoa-blue text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Envoyer le lien'}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-iakoa-blue hover:underline flex items-center justify-center gap-1"
      >
        <ArrowLeft size={14} /> Retour à la connexion
      </button>
    </form>
  );
}

export default ForgotPasswordForm;
