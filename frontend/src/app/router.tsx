import { Routes, Route } from 'react-router-dom';
import { Layout } from './app';
import EventsPage from '@/features/events_page/EventsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<EventsPage showCards={true} />} />
        <Route path="/profile" element={<EventsPage text="Votre profil ici !" />} />
        <Route path="/create" element={<EventsPage text="Créer votre évènement." />} />
        <Route path="/favorites" element={<EventsPage text="Vos favoris ici, que faire ce soir ?" />} />
      </Route>
    </Routes>
  );
}
