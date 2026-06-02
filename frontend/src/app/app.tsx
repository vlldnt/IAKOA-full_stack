import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header/Header';
import { FontSizeControl } from '@/components/ui/FontSizeControl';
import { AppRouter } from './router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshUser } from '@/store/slices/authSlice';
import { fetchFavorites, clearFavorites } from '@/store/slices/favoritesSlice';

export function Layout() {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFavorites(user.id));
    } else {
      dispatch(clearFavorites());
    }
  }, [user?.id, dispatch]);

  // Suit la hauteur réelle du header en continu (ResizeObserver) pour que le
  // contenu se décale exactement, y compris quand le header change de taille :
  // chargement de la police du logo, apparition/disparition de boutons, resize.
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const updateHeaderHeight = () => {
      // En mobile (< 768px) le header laisse la place à la barre du bas : pas de décalage haut.
      setHeaderHeight(window.innerWidth >= 768 ? headerEl.offsetHeight : 0);
    };

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(headerEl);
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  return (
    <>
      <Header ref={headerRef} />
      <main
        className="flex flex-1 flex-col pb-16 lg:pb-0 bg-white w-full"
        style={{ paddingTop: headerHeight, minHeight: '100vh' }}
      >
        <Outlet />
      </main>
      {/* Curseur d'accessibilité (taille du texte), fixé en bas à gauche. */}
      <FontSizeControl />
    </>
  );
}

function App() {
  return <AppRouter />;
}

export default App;
