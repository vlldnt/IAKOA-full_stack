import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Building2,
  Tags,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useAdminStats } from './hooks';

const NAV_ITEMS = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/moderation', label: 'Modération', icon: ShieldCheck, end: false },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users, end: false },
  { to: '/admin/companies', label: 'Entreprises', icon: Building2, end: false },
  { to: '/admin/categories', label: 'Catégories', icon: Tags, end: false },
  { to: '/admin/places', label: 'Lieux', icon: MapPin, end: false },
];

// Layout du back-office : réservé au rôle ADMIN, navigation latérale
// (desktop) ou en onglets horizontaux (mobile).
function AdminLayout() {
  const { user, isLoading } = useAuth();
  const { data: stats } = useAdminStats();

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white pt-30 md:pt-4 flex items-start justify-center">
        <span className="loading loading-spinner loading-lg mt-24"></span>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="w-full min-h-screen bg-white pt-30 md:pt-4">
        <div className="flex flex-col items-center gap-4 py-24 px-6 text-center max-w-md mx-auto">
          <ShieldAlert className="h-12 w-12 text-gray-200" />
          <p className="text-gray-600">
            Cette section est réservée aux administrateurs.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = stats?.events.pendingModeration ?? 0;

  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4 pb-24 lg:pb-8">
      <div className="w-full max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-6">
        {/* Navigation admin */}
        <nav className="md:w-56 shrink-0 pt-6">
          <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-iakoa-blue'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                  {label === 'Modération' && pendingCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                      {pendingCount}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contenu */}
        <div className="flex-1 min-w-0 md:pt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
