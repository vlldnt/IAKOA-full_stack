import { Heart } from 'lucide-react';
import type { EventType } from '@/lib/types/EventType';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/toast';
import { useFavoriteIds, useToggleFavorite } from './hooks';

interface FavoriteButtonProps {
  event: EventType;
  /** 'overlay' : rond flottant sur l'image (EventCard) — 'wide' : gros bouton (EventModal) */
  variant?: 'overlay' | 'wide';
}

// Bouton cœur ajouter/retirer des favoris.
// Non connecté : ouvre la modal d'authentification globale.
export function FavoriteButton({ event, variant = 'overlay' }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const favoriteIds = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const isFavorite = !!event.id && favoriteIds.has(event.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!event.id) return;

    if (!user) {
      toast('info', 'Connectez-vous pour gérer vos favoris.');
      (document.getElementById('auth_modal') as HTMLDialogElement | null)?.showModal();
      return;
    }

    toggleFavorite.mutate(
      { event, isFavorite },
      {
        onError: () =>
          toast('error', "Impossible de mettre à jour les favoris. Réessayez."),
      },
    );
  };

  const label = isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';

  if (variant === 'wide') {
    return (
      <button
        onClick={handleClick}
        title={label}
        aria-label={label}
        aria-pressed={isFavorite}
        className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
          isFavorite
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
        {isFavorite ? 'Favori' : 'Favoris'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      title={label}
      aria-label={label}
      aria-pressed={isFavorite}
      className={`flex items-center justify-center w-8 h-8 bg-white/80 rounded-full cursor-pointer transition-colors hover:bg-white ${
        isFavorite ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
      }`}
    >
      <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
  );
}
