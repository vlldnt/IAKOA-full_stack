import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showValidation?: boolean;
  isValid?: boolean;
  className?: string;
}

// Champ de saisie de mot de passe avec bouton afficher/masquer
// Gère l'affichage au survol de l'icône œil
export function PasswordInput({
  value,
  onChange,
  placeholder = 'Mot de passe',
  showValidation = false,
  isValid = true,
  className = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Déterminer la couleur de bordure selon validation
  const borderColor = showValidation && value.length > 0
    ? isValid ? 'border-green-500 focus:border-green-500' : 'border-red-300 focus:border-red-500'
    : 'border-gray-200 focus:border-iakoa-blue';

  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type={showPassword || isHovered ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg pl-10 pr-10 py-3 focus:outline-none bg-gray-50 ${borderColor} ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        onMouseEnter={() => !showPassword && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        title={showPassword ? 'Cacher' : 'Afficher'}
      >
        {showPassword || isHovered ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
