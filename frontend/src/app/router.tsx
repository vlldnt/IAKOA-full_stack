import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './app';
import EventsPage from '@/features/events_page/EventsPage';
import FavoritesPage from '@/features/favorites/FavoritesPage';
import EventFormPage from '@/features/creator/EventFormPage';
import MyEventsPage from '@/features/creator/MyEventsPage';
import ProfilePage from '@/features/profile/ProfilePage';
import { OAuthCallback } from '@/features/auth/components/OAuthCallback';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage';

// Chargées à la demande : la carte (leaflet) et le back-office restent
// hors du bundle principal.
const MapPage = lazy(() => import('@/features/map_page/MapPage'));
const AdminLayout = lazy(() => import('@/features/admin/AdminLayout'));
const DashboardPage = lazy(() => import('@/features/admin/DashboardPage'));
const ModerationPage = lazy(() => import('@/features/admin/ModerationPage'));
const UsersPage = lazy(() => import('@/features/admin/UsersPage'));
const CompaniesPage = lazy(() => import('@/features/admin/CompaniesPage'));
const CategoriesPage = lazy(() => import('@/features/admin/CategoriesPage'));
const PlacesPage = lazy(() => import('@/features/admin/PlacesPage'));

function PageLoader() {
  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4 flex items-start justify-center">
      <span className="loading loading-spinner loading-lg mt-24"></span>
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<EventsPage showCards={true} />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create" element={<EventFormPage />} />
          <Route path="/edit/:id" element={<EventFormPage />} />
          <Route path="/my-events" element={<MyEventsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          {/* Back-office (réservé ADMIN, gardé dans AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="places" element={<PlacesPage />} />
          </Route>
        </Route>
        {/* Routes standalone (sans le Layout) */}
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </Suspense>
  );
}
