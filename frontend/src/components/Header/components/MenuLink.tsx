import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type MenuLinkProps = {
  page: string;
  link?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  icon: LucideIcon
};

// Lien de menu avec icône et label
// Peut être un lien (navigation) ou un bouton (action)
function MenuLink({ page, link, onClick, variant = 'default', icon: Icon }: MenuLinkProps) {
  
  const baseClass = 'flex flex-col items-center gap-1 px-3 py-2 rounded-lg cursor-pointer transition-colors';
  const variantClass = variant === 'danger'
    ? 'text-red-500 font-bold hover:bg-red-100'
    : 'hover:bg-gray-100';

  const content = (
    <>
      <Icon className="h-4 w-4 md:h-5 mg:w-5" />
      <span className="text-xs">{page}</span>
    </>
  );

  return (
    <li>
      {/* Si onClick fourni, afficher un bouton, sinon un Link */}
      {onClick ? (
        <button onClick={onClick} className={`text-blue-iakoa ${baseClass} ${variantClass}`}>
          {content}
        </button>
      ) : (
        <Link to={link || '/'} className={`${baseClass} ${variantClass}`}>
          {content}
        </Link>
      )}
    </li>
  );
}

export default MenuLink;