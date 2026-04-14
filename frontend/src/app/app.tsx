import './app.css';
import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header/Header';
import { AppRouter } from './router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshUser } from '@/store/slices/authSlice';
import { fetchFavorites, clearFavorites } from '@/store/slices/favoritesSlice';

// Layout principal de l'application
// Gère le header fixe et l'espacement dynamique du contenu
export function Layout() {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Vérifier l'authentification au chargement de l'application
  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  // Charger / vider les favoris selon l'état de connexion
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFavorites(user.id));
    } else {
      dispatch(clearFavorites());
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current && window.innerWidth >= 768) {
        setHeaderHeight(headerRef.current.offsetHeight);
      } else {
        setHeaderHeight(0);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
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
    </>
  );
}

function App() {
  return <AppRouter />;
}

export default App;
