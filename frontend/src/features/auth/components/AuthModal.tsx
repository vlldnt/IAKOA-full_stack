import { useState } from 'react';
import UnifiedAuthForm from '@/features/auth/components/UnifiedAuthForm';
import iakoaLogo from '@/assets/logo-iakoa.svg';
import login from '@/assets/images/login.png';
import happy from '@/assets/images/happy.png';
import MenuLink from '@/components/Header/components/MenuLink';
import { LogIn } from 'lucide-react';

// Modal d'authentification avec formulaire login/register
// Gère la bascule entre les deux modes avec animations
export function AuthModal() {
  // État pour basculer entre login et register
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <MenuLink
        page="Se connecter"
        onClick={() =>
          (
            document.getElementById('auth_modal') as HTMLDialogElement
          )?.showModal()
        }
        icon={LogIn}
      />
      <dialog id="auth_modal" className="modal">
        <div className="modal-box max-w-4xl p-0 overflow-hidden h-150 max-h-[90vh]">
          <div className="flex h-full">
            {/* Colonne gauche - Formulaires */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              {/* Onglets de navigation avec indicateur animé */}
              <div className="relative flex bg-gray-100 rounded-lg p-1 mb-6">
                {/* Indicateur de sélection qui glisse entre les onglets */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-transform duration-300 ease-out ${
                    isLogin ? 'translate-x-0' : 'translate-x-full'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isLogin
                      ? 'text-iakoa-blue'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`relative z-10 flex-1 justify-center py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    !isLogin
                      ? 'text-iakoa-blue'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Créer un compte
                </button>
              </div>

              {/* Formulaire unifié avec animations */}
              <UnifiedAuthForm isLogin={isLogin} />
            </div>

            {/* Colonne droite - Image et titre */}
            <div className="hidden md:flex flex-1 bg-gray-50 flex-col justify-center items-center p-8">
              <img className="max-w-60 m-8" src={iakoaLogo} alt="" />
              <h2 className="text-3xl font-semibold text-gray-700 mb-2">
                {isLogin ? 'Bon retour !' : 'Bienvenue sur IAKOA'}
              </h2>
              <p className="text-gray-500 mb-6">
                {isLogin
                  ? 'Connectez-vous pour accéder à votre compte.'
                  : 'Remplissez les informations pour vous inscrire.'}
              </p>
              <div className="w-full max-w-s">
                <img
                  src={isLogin ? login : happy}
                  alt="Bienvenue"
                  className="w-full h-64 object-cover rounded-2xl shadow-lg transition-opacity duration-500 ease-in-out"
                  key={isLogin ? 'login' : 'register'}
                />
              </div>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Fermer</button>
        </form>
      </dialog>
    </>
  );
}
