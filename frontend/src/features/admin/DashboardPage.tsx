import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  CalendarDays,
  Heart,
  Tags,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAdminStats } from './hooks';

// Tableau de bord admin : vue d'ensemble chiffrée
function DashboardPage() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="alert alert-error max-w-md">
        <span>{error?.message ?? 'Impossible de charger les statistiques.'}</span>
      </div>
    );
  }

  const cards = [
    {
      label: 'Utilisateurs',
      value: stats.users.total,
      detail: `+${stats.users.last30Days} sur 30 jours`,
      icon: Users,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      label: 'Entreprises',
      value: stats.companies.total,
      detail: `${stats.companies.pendingValidation} à valider`,
      icon: Building2,
      color: 'text-violet-500 bg-violet-50',
    },
    {
      label: 'Événements à venir',
      value: stats.events.upcomingPublished,
      detail: `${stats.events.byStatus.PUBLISHED} publiés au total`,
      icon: CalendarDays,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Favoris',
      value: stats.favorites.total,
      detail: 'tous utilisateurs',
      icon: Heart,
      color: 'text-red-500 bg-red-50',
    },
    {
      label: 'Catégories actives',
      value: stats.categories.active,
      detail: 'visibles dans les filtres',
      icon: Tags,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Lieux',
      value: stats.places.total,
      detail: 'référencés',
      icon: MapPin,
      color: 'text-cyan-600 bg-cyan-50',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      {stats.events.pendingModeration > 0 && (
        <Link
          to="/admin/moderation"
          className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
          <span className="text-sm font-medium text-amber-800">
            {stats.events.pendingModeration}{' '}
            {stats.events.pendingModeration === 1
              ? 'événement attend une modération'
              : 'événements attendent une modération'}
          </span>
          <span className="ml-auto text-xs font-semibold text-amber-600">Voir →</span>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, detail, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-2xl border border-gray-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <span className="text-xs text-gray-400">{detail}</span>
          </div>
        ))}
      </div>

      {/* Répartition des événements par statut */}
      <div className="p-5 rounded-2xl border border-gray-200">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          Événements par statut
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(
            [
              ['DRAFT', 'Brouillons', 'text-gray-600'],
              ['PENDING', 'En vérification', 'text-amber-600'],
              ['PUBLISHED', 'Publiés', 'text-green-600'],
              ['REJECTED', 'Refusés', 'text-red-500'],
              ['CANCELLED', 'Annulés', 'text-gray-400'],
            ] as const
          ).map(([status, label, color]) => (
            <div key={status} className="text-center p-3 rounded-xl bg-gray-50">
              <p className={`text-2xl font-bold ${color}`}>{stats.events.byStatus[status]}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
