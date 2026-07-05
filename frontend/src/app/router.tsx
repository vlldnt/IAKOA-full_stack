import { Routes, Route } from 'react-router-dom';
import { Layout } from './app';
import EventsPage from '@/features/events_page/EventsPage';
import MapPage from '@/features/map_page/MapPage';
import FavoritesPage from '@/features/favorites/FavoritesPage';
import EventFormPage from '@/features/creator/EventFormPage';
import MyEventsPage from '@/features/creator/MyEventsPage';
import ProfilePage from '@/features/profile/ProfilePage';
import { OAuthCallback } from '@/features/auth/components/OAuthCallback';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<EventsPage showCards={true} />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/create" element={<EventFormPage />} />
        <Route path="/edit/:id" element={<EventFormPage />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Route>
      {/* Routes standalone (sans le Layout) */}
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
    </Routes>
  );
}
