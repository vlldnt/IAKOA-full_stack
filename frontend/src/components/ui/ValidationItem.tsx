import { Check, X } from 'lucide-react';

interface ValidationItemProps {
  valid: boolean;
  label: string;
}

// Affiche un critère de validation avec icône ✓ ou ✗
export function ValidationItem({ valid, label }: ValidationItemProps) {
  return (
    <li className={`flex items-center gap-2 text-sm ${valid ? 'text-green-600' : 'text-gray-400'}`}>
      {valid ? <Check size={14} /> : <X size={14} />}
      {label}
    </li>
  );
}
