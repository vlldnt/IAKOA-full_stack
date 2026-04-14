import { useState } from 'react';
import { User, Mail, CheckCircle2, AlertTriangle, Loader2, Pencil, X } from 'lucide-react';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { updateUser } from '@/lib/services/accountService';
import type { UserType } from '@/lib/types/AuthType';

interface EditProfileSectionProps {
  user: UserType;
  onUpdated: (updated: UserType) => void;
}

export function EditProfileSection({ user, onUpdated }: EditProfileSectionProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameValid = name.trim().length > 0 && name.length <= 30;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    if (!nameValid || !emailValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateUser(user.id, { name: name.trim(), email: email.trim() });
      onUpdated(updated);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setEmail(user.email);
    setError(null);
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">Informations personnelles</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-iakoa-blue hover:underline"
          >
            <Pencil size={13} /> Modifier
          </button>
        )}
      </div>

      {!editing ? (
        <div className="space-y-3">
          <InfoRow icon={<User size={15} className="text-gray-400" />} label="Nom" value={user.name} />
          <InfoRow icon={<Mail size={15} className="text-gray-400" />} label="Email" value={user.email} />
          <div className="flex gap-2 flex-wrap mt-1">
            {user.isCreator && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-iakoa-blue">
                Créateur
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>
          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
              <CheckCircle2 size={15} /> Profil mis à jour
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
            <ValidatedInput
              type="text"
              value={name}
              onChange={setName}
              placeholder="Votre nom"
              icon={User}
              isValid={nameValid}
              showValidation={name.length > 0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <ValidatedInput
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="votre@email.fr"
              icon={Mail}
              isValid={emailValid}
              showValidation={email.length > 0}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !nameValid || !emailValid}
              className="flex-1 py-2.5 rounded-xl bg-iakoa-blue text-white text-sm font-semibold
                hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-1.5 transition-colors"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      {icon}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
