import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, CalendarPlus, LogOut } from 'lucide-react';
import type { UserType } from '@/lib/types/AuthType';

interface ProfileDropdownProps {
  user: UserType;
  onLogout: () => void;
  isMobile?: boolean;
}

function ProfileDropdown({ user, onLogout, isMobile = false }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-iakoa-blue text-white font-semibold text-sm cursor-pointer hover:opacity-90 transition-opacity"
      >
        {initials}
      </button>

      {open && (
        <div className={`absolute ${isMobile ? 'bottom-full mb-2' : 'right-0 top-12'} w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User className="h-4 w-4" />
            Mon compte
          </Link>
          <Link
            to="/favorites"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Heart className="h-4 w-4" />
            Favoris
          </Link>
          {user.isCreator && (
            <Link
              to="/create"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CalendarPlus className="h-4 w-4" />
              Créer
            </Link>
          )}
          <div className="border-t border-gray-100 my-1" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
