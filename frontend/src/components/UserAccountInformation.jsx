import React, { useContext, useEffect, useState } from 'react';
import { FaBoxOpen } from 'react-icons/fa';
import { AuthContext } from '../state-management/AuthContext';
import UserContext from '../state-management/UserContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export default function UserAccountInformation() {
  const { t } = useTranslation();
  const [user, setUser] = useState({});
  const { loading, orders, fetchOrdersByUser } = useContext(UserContext);
  const { loading: authLoading, logout, deleteAccount } = useContext(AuthContext);

  const userData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (userData) {
      setUser({
        id: userData.id || '',
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        city: userData.city || '',
        state: userData.state || '',
        country: userData.country || '',
        zipCode: userData.zipCode || '',
        street: userData.street || '',
      });
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = () => {
    const password = prompt(t('account.confirmPassword'));
    if (password) {
      deleteAccount(password);
    }
  };

  if (loading || authLoading) return <Loading />;

  return (
    <div className="w-full mx-auto bg-white mt-12">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <FaBoxOpen className="text-2xl text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">{t('account.title')}</h1>
      </div>

      {/* User Info */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-800">{t('account.userInfo')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(user).map(([key, value]) => (
            <div key={key}>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t(`account.fields.${key}`, key)}:</span> {value || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={handleDeleteAccount}
          className="w-full text-center py-2 rounded-lg border border-red-500 text-red-600 font-semibold hover:bg-red-50 transition"
        >
          {t('account.deleteAccount')}
        </button>

        <button
          onClick={handleLogout}
          className="w-full primary-button"
        >
          {t('account.logout')}
        </button>
      </div>

    </div>
  );
}
