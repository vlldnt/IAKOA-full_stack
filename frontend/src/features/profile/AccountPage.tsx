import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAuthUser } from '@/store/slices/authSlice';
import { EditProfileSection } from './components/EditProfileSection';
import { ChangePasswordSection } from './components/ChangePasswordSection';
import { CompaniesSection } from './components/CompaniesSection';
import { MyEventsSection } from './components/MyEventsSection';
import type { UserType } from '@/lib/types/AuthType';

export default function AccountPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleUserUpdated = (updated: UserType) => {
    dispatch(updateAuthUser(updated));
  };

  return (
    <div id="account-page" className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos informations personnelles et vos entreprises</p>
        </div>

        <EditProfileSection user={user} onUpdated={handleUserUpdated} />
        <ChangePasswordSection userId={user.id} />
        {user.isCreator && <MyEventsSection />}
        {user.isCreator && <CompaniesSection />}
      </div>
    </div>
  );
}
