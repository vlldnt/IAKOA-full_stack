import './app.css';
import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header/Header';
import { AppRouter } from './router';
import { useAppDispatch } from '@/store/hooks';
import { refreshUser } from '@/store/slices/authSlice';

// Layout principal de l'application
// Gère le header fixe et l'espacement dynamique du contenu
export function Layout() {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const dispatch = useAppDispatch();

  // Vérifier l'authentification au chargement de l'application
  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

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
        className="min-h-screen flex pb-16 xl:pb-0 bg-white w-full"
        style={{ paddingTop: headerHeight }}
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
