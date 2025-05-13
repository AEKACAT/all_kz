import React, { useContext, useEffect, useState } from 'react';
import { FaUserEdit } from 'react-icons/fa';
import { AuthContext } from '../state-management/AuthContext';
import UserContext from '../state-management/UserContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export default function UserProfile() {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState({});
  const { updateProfile, loading, error, message, clearLogs } = useContext(UserContext);
  const { loading: authLoading } = useContext(AuthContext);

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
        district: userData.district || '',
        zipCode: userData.zipCode || '',
        street: userData.street || '',
        createdAt: userData.createdAt || '',
      });
    }
  }, []);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) {
      toast.success(message);
      setEditMode(false);
    }
    clearLogs();
  }, [error, message]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updateProfile(user.id, user);
  };

  if (loading || authLoading) return <Loading />;

  return (
    <div className="w-full mx-auto bg-white mt-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">{t('profile.title')}</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-2 text-sm font-medium text-[#3c3c3c] hover:underline"
        >
          <FaUserEdit className="w-5 h-5" />
          {editMode ? t('profile.cancel') : t('profile.edit')}
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 overflow-x-auto">
        {Object.keys(user).map((key) => (
          key !== 'id' && key !== 'createdAt' && (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                {t(`profile.fields.${key}`, key.replace(/([A-Z])/g, ' $1'))}
              </label>
              {editMode ? (
                <input
                  type="text"
                  name={key}
                  value={user[key] || ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              ) : (
                <div className="text-gray-800 p-3 bg-gray-50 rounded-lg">{user[key] || 'N/A'}</div>
              )}
            </div>
          )
        ))}
      </div>

      {/* Save Button */}
      {editMode && (
        <div className="mt-10">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full primary-button"
          >
            {loading ? t('profile.saving') : t('profile.save')}
          </button>
        </div>
      )}
    </div>
  );
}
