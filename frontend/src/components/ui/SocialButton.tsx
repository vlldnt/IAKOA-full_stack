interface SocialButtonProps {
  icon: string;
  alt: string;
  name: string;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick?: () => void;
}

// Bouton de connexion sociale avec animation au survol
// Affiche le nom du service au survol
export function SocialButton({
  icon,
  alt,
  name,
  isHovered,
  onHover,
  onClick,
}: SocialButtonProps) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      className="flex items-center gap-2 p-4 rounded-full hover:bg-gray-50 transition-all hover:scale-110"
    >
      <img src={icon} alt={alt} className="w-10 h-10" />
      <span
        className={`text-sm font-medium text-gray-700 whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isHovered ? 'max-w-25 opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        {name}
      </span>
    </button>
  );
}
