interface SocialButtonProps {
  icon: string;
  alt: string;
  name: string;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick?: () => void;
  disabled?: boolean;
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
  disabled = false,
}: SocialButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={!disabled ? onClick : undefined}
      className={`flex items-center gap-2 p-4 rounded-full transition-all ${
        disabled
          ? 'opacity-40 cursor-not-allowed grayscale'
          : 'hover:bg-gray-50 hover:scale-110'
      }`}
    >
      <img src={icon} alt={alt} className="w-10 h-10" />
      <span
        className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isHovered
            ? 'max-w-40 opacity-100'
            : 'max-w-0 opacity-0'
        } ${disabled ? 'text-gray-400 italic' : 'text-gray-700'}`}
      >
        {disabled ? 'Bientôt disponible' : name}
      </span>
    </button>
  );
}
