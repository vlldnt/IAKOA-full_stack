import { forwardRef, useState } from "react";
import iakoaLogo from "@/assets/logo-iakoa.svg";
import { Link } from "react-router-dom";
import MenuLink from "./components/MenuLink";
import { IakoaIcon } from "./components/IakoaIcon";
import { useAuth } from "@/features/auth/AuthContext";
import { SearchBars } from "./components/SearchBar/SearchBar";
import { LogIn, MapPin, X } from "lucide-react";
import { useFilters } from "@/features/events_page/FilterContext";
import UnifiedAuthForm from '@/features/auth/components/UnifiedAuthForm';
import ProfileDropdown from "./components/ProfileDropdown";
import login from '@/assets/images/login.png';
import happy from '@/assets/images/happy.png';

// Header principal de l'application
const Header = forwardRef<HTMLElement>(function Header(_, ref) {
  const { user, logout } = useAuth();
  const { filters, resetFilters } = useFilters();
  const [isLogin, setIsLogin] = useState(true);

  const hasActiveFilters = !!(filters.keyword || filters.city
    || filters.selectedCategories.length > 0
    || filters.dateFrom || filters.dateTo
    || filters.priceMin !== undefined || filters.priceMax !== undefined
    || filters.isFree);

  const openAuthModal = () => {
    (document.getElementById('auth_modal') as HTMLDialogElement)?.showModal();
  };

  return (
    <>
      {/* Header responsive */}
      <header
        ref={ref}
        className="fixed w-full top-0 p-3 sm:p-4 lg:p-6 shadow-md z-50 bg-white"
      >
        <div className="h-full max-w-full lg:max-w-[95%] mx-auto flex flex-col lg:flex-row gap-3 lg:gap-4 justify-center lg:justify-between items-center">
          {/* Colonne gauche - Logo (30%) + bouton X clear filters en mobile */}
          <div className="flex lg:w-[30%] items-center justify-center w-full">
            <Link to="/">
              <img src={iakoaLogo} alt="Logo IAKOA" className="w-30 lg:w-55" />
            </Link>
            {/* Bouton X clear filters - mobile/tablette uniquement */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex lg:hidden items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Supprimer les filtres</span>
              </button>
            )}
          </div>

          {/* Colonne centrale - SearchBar (flexible) */}
          <div className="w-full lg:flex-1 flex items-center justify-center">
            <SearchBars />
          </div>

          {/* Colonne droite - Menu classique (30%) */}
          <div className="hidden lg:flex lg:w-[30%] items-center justify-end gap-2 lg:gap-7">
            <ul className="flex gap-2 rounded-lg">
              <MenuLink page="Évènements" link="/" icon={IakoaIcon} />
              <MenuLink page="Carte" link="/map" icon={MapPin} />
            </ul>
            {user ? (
              <ProfileDropdown user={user} onLogout={logout} />
            ) : (
              <button
                onClick={openAuthModal}
                className="flex flex-col lg:flex-col items-center gap-2 lg:gap-2 px-3 lg:px-2 py-2 lg:py-3 rounded-lg text-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer"
              >
                <LogIn className="h-7 w-7" />
                <span className="text-xs lg:text-xs font-medium text-center">Se connecter</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Menu mobile/tablette - Barre avec icônes + dropdown profil */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-50">
        <ul className="flex justify-center items-center gap-6 py-3 px-4">
          <MenuLink page="Évènements" link="/" icon={IakoaIcon} />
          <MenuLink page="Carte" link="/map" icon={MapPin} />
          {user ? (
            <li>
              <ProfileDropdown user={user} onLogout={logout} isMobile={true} />
            </li>
          ) : (
            <MenuLink page="Se connecter" onClick={openAuthModal} icon={LogIn} />
          )}
        </ul>
      </nav>

      {/* Modal d'authentification unique partagée */}
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
});

export default Header;
