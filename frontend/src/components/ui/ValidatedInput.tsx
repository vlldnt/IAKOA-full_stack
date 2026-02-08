import type { LucideIcon } from 'lucide-react';

interface ValidatedInputProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: LucideIcon;
  isValid: boolean;
  showValidation?: boolean;
  className?: string;
}

// Champ de saisie avec validation visuelle
// Bordure verte si valide, rouge si invalide
export function ValidatedInput({
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  isValid,
  showValidation = false,
  className = '',
}: ValidatedInputProps) {
  const borderColor = showValidation && value.length > 0
    ? isValid ? 'border-green-500 focus:border-green-500' : 'border-red-300 focus:border-red-500'
    : 'border-gray-200 focus:border-iakoa-blue';

  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:outline-none bg-gray-50 ${borderColor} ${className}`}
      />
    </div>
  );
}
