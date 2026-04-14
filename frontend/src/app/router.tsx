import { Routes, Route } from 'react-router-dom';
import { Layout } from './app';
import EventsPage from '@/features/events_page/EventsPage';
import MapPage from '@/features/map_page/MapPage';
import { OAuthCallback } from '@/features/auth/components/OAuthCallback';
import CreateEventPage from '@/features/create_event/CreateEventPage';
import CreateCompanyPage from '@/features/create_company/CreateCompanyPage';
import FavoritesPage from '@/features/favorites/FavoritesPage';
import AccountPage from '@/features/profile/AccountPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<EventsPage showCards={true} />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<AccountPage />} />
        <Route path="/create" element={<CreateEventPage />} />
        <Route path="/company/new" element={<CreateCompanyPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Route>
      {/* Route OAuth callback sans le Layout (page standalone) */}
      <Route path="/auth/callback" element={<OAuthCallback />} />
    </Routes>
  );
}
