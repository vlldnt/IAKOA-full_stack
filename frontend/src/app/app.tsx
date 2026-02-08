import './app.css';
import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header/Header';
import { AppRouter } from './router';

export function Layout() {
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

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
        className="min-h-screen flex pb-16 xl:pb-0"
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
