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
      <dialog id="auth_modal" className="modal flex justify-center items-center">
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
            <div className="hidden md:flex flex-1 bg-linear-to-br from-gray-50 to-gray-100 flex-col justify-center items-center p-8">
              <img className="max-w-60 m-8" src={iakoaLogo} alt="" />

              {/* Titre avec transition fluide */}
              <div className="relative h-16 flex items-center justify-center overflow-hidden mb-2">
                <div
                  className="absolute transition-all duration-500 ease-in-out"
                  style={{
                    opacity: isLogin ? 1 : 0,
                    transform: isLogin ? 'translateY(0)' : 'translateY(20px)',
                  }}
                >
                  <h2 className="text-3xl font-semibold text-gray-700 whitespace-nowrap">
                    Bon retour !
                  </h2>
                </div>
                <div
                  className="absolute transition-all duration-500 ease-in-out"
                  style={{
                    opacity: !isLogin ? 1 : 0,
                    transform: !isLogin ? 'translateY(0)' : 'translateY(-20px)',
                  }}
                >
                  <h2 className="text-3xl font-semibold text-gray-700 whitespace-nowrap">
                    Bienvenue sur IAKOA
                  </h2>
                </div>
              </div>

              {/* Texte descriptif avec transition fluide */}
              <div className="relative h-12 flex items-center justify-center overflow-hidden mb-6">
                <div
                  className="absolute transition-all duration-500 ease-in-out"
                  style={{
                    opacity: isLogin ? 1 : 0,
                    transform: isLogin ? 'translateY(0)' : 'translateY(20px)',
                  }}
                >
                  <p className="text-gray-500 text-center">
                    Connectez-vous pour accéder à votre compte.
                  </p>
                </div>
                <div
                  className="absolute transition-all duration-500 ease-in-out"
                  style={{
                    opacity: !isLogin ? 1 : 0,
                    transform: !isLogin ? 'translateY(0)' : 'translateY(-20px)',
                  }}
                >
                  <p className="text-gray-500 text-center">
                    Remplissez les informations pour vous inscrire.
                  </p>
                </div>
              </div>

              {/* Image avec transition fluide */}
              <div className="w-full max-w-sm relative h-64 overflow-hidden rounded-2xl">
                <img
                  src={login}
                  alt="Connexion"
                  className="absolute w-full h-full object-cover rounded-2xl shadow-lg transition-all duration-500 ease-in-out"
                  style={{
                    opacity: isLogin ? 1 : 0,
                    transform: isLogin ? 'scale(1)' : 'scale(1.05)',
                  }}
                />
                <img
                  src={happy}
                  alt="Inscription"
                  className="absolute w-full h-full object-cover rounded-2xl shadow-lg transition-all duration-500 ease-in-out"
                  style={{
                    opacity: !isLogin ? 1 : 0,
                    transform: !isLogin ? 'scale(1)' : 'scale(1.05)',
                  }}
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
