import { BadgeCheck, Ban, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { ApiError } from '@/lib/api-client';
import { formatDate } from '@/lib/utils/format';
import { useAdminCompanies, useValidateCompany } from './hooks';

// Gestion des entreprises : validation / invalidation
function CompaniesPage() {
  const { data: companies, isLoading, error } = useAdminCompanies();
  const validate = useValidateCompany();
  const { toast } = useToast();

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

  const pending = (companies ?? []).filter(c => !c.isValidated).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
        <span className="text-sm text-gray-400">
          ({companies?.length ?? 0}{pending > 0 ? ` — ${pending} à valider` : ''})
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="table w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase">
              <th>Entreprise</th>
              <th>SIREN</th>
              <th>Créée le</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(companies ?? []).map(company => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td>
                  <p className="font-medium text-gray-900">{company.name}</p>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-iakoa-blue hover:underline"
                    >
                      <Globe className="h-3 w-3" />
                      {company.website}
                    </a>
                  )}
                </td>
                <td className="text-gray-500 font-mono text-xs">{company.siren}</td>
                <td className="text-gray-500 whitespace-nowrap">
                  {formatDate(company.createdAt)}
                </td>
                <td>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                      company.isValidated
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {company.isValidated ? 'Validée' : 'En attente'}
                  </span>
                </td>
                <td>
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        validate.mutate(
                          { id: company.id, isValidated: !company.isValidated },
                          {
                            onSuccess: () =>
                              toast(
                                'success',
                                company.isValidated
                                  ? `« ${company.name} » invalidée.`
                                  : `« ${company.name} » validée.`,
                              ),
                            onError: err =>
                              toast(
                                'error',
                                err instanceof ApiError ? err.message : "L'opération a échoué.",
                              ),
                          },
                        )
                      }
                      disabled={validate.isPending}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                        company.isValidated
                          ? 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                          : 'text-white bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {company.isValidated ? (
                        <>
                          <Ban className="h-3.5 w-3.5" />
                          Invalider
                        </>
                      ) : (
                        <>
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Valider
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompaniesPage;
