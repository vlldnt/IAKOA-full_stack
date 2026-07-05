import { useState } from 'react';
import { ShieldCheck, Trash2, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { formatDate } from '@/lib/utils/format';
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from './hooks';

// Gestion des utilisateurs : rôle admin, suppression
function UsersPage() {
  const { user: me } = useAuth();
  const { data: users, isLoading, error } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const onApiError = (err: Error) =>
    toast('error', err instanceof ApiError ? err.message : "L'opération a échoué.");

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-md">
        <span>{error.message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <span className="text-sm text-gray-400">({users?.length ?? 0})</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="table w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase">
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Inscrit le</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map(user => {
              const isSelf = user.id === me?.id;
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td>
                    <p className="font-medium text-gray-900 flex items-center gap-1.5">
                      {user.name}
                      {user.isCreator && (
                        <span title="Organisateur">
                          <BadgeCheck className="h-3.5 w-3.5 text-iakoa-blue" />
                        </span>
                      )}
                      {isSelf && <span className="text-xs text-gray-400">(vous)</span>}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="text-gray-500 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      {!isSelf && (
                        <button
                          onClick={() =>
                            updateRole.mutate(
                              {
                                id: user.id,
                                role: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
                              },
                              {
                                onSuccess: () => toast('success', 'Rôle mis à jour.'),
                                onError: onApiError,
                              },
                            )
                          }
                          disabled={updateRole.isPending}
                          title={user.role === 'ADMIN' ? 'Rétrograder en USER' : 'Promouvoir ADMIN'}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {user.role === 'ADMIN' ? 'Rétrograder' : 'Promouvoir'}
                        </button>
                      )}
                      {!isSelf &&
                        (pendingDeleteId === user.id ? (
                          <>
                            <button
                              onClick={() =>
                                deleteUser.mutate(user.id, {
                                  onSuccess: () => {
                                    toast('success', `Compte ${user.name} supprimé.`);
                                    setPendingDeleteId(null);
                                  },
                                  onError: onApiError,
                                })
                              }
                              disabled={deleteUser.isPending}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => setPendingDeleteId(null)}
                              className="px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              Non
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setPendingDeleteId(user.id)}
                            title="Supprimer le compte"
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersPage;
