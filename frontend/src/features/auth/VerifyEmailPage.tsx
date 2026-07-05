import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { verifyEmailAPI } from '@/lib/services/authService';

type Status = 'loading' | 'success' | 'error';

// Page de confirmation d'adresse email (lien reçu par email)
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Ce lien de vérification est incomplet.');
      return;
    }

    verifyEmailAPI(token).then(result => {
      setStatus(result.ok ? 'success' : 'error');
      setMessage(
        result.message ||
          (result.ok ? 'Email vérifié avec succès.' : 'Lien invalide ou expiré.'),
      );
    });
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="animate-spin mx-auto mb-4 text-iakoa-blue" size={32} />
            <p className="text-gray-600">Vérification en cours…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-xl font-bold text-green-600 mb-2">Email vérifié ✅</h1>
            <p className="text-gray-600 text-sm">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-red-600 mb-2">Vérification impossible</h1>
            <p className="text-gray-600 text-sm">{message}</p>
          </>
        )}
        <Link to="/" className="text-iakoa-blue hover:underline text-sm mt-4 inline-block">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
