import React, { useContext, useEffect, useState } from 'react';
import { FaBoxOpen, FaEyeSlash, FaEye } from 'react-icons/fa';
import UserContext from '../state-management/UserContext';
import { AuthContext } from '../state-management/AuthContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function UserUpdatePassword() {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const { updatePassword, loading, error, message, clearLogs } = useContext(UserContext);
  const userData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (error) {
      toast.error(error);
    } else if (message) {
      toast.success(message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordStrength({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
    }
    clearLogs();
  }, [error, message]);

  const handleUpdatePassword = async () => {
    await updatePassword(userData.id, currentPassword, newPassword);
  };

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8 && password.length <= 16,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[@#$%^&+=!]/.test(password),
    });
  };

  const PasswordRequirements = () => (
    <div className="mt-2 space-y-1">
      <p className="text-sm text-gray-600">{t('updatePassword.requirements.title')}</p>
      <ul className="text-sm space-y-1">
        <li className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasMinLength ? '✓' : '•'}</span>
          {t('updatePassword.requirements.minLength')}
        </li>
        <li className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasUpperCase ? '✓' : '•'}</span>
          {t('updatePassword.requirements.upperCase')}
        </li>
        <li className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasLowerCase ? '✓' : '•'}</span>
          {t('updatePassword.requirements.lowerCase')}
        </li>
        <li className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasNumber ? '✓' : '•'}</span>
          {t('updatePassword.requirements.number')}
        </li>
        <li className={`flex items-center ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-2">{passwordStrength.hasSpecialChar ? '✓' : '•'}</span>
          {t('updatePassword.requirements.specialChar')}
        </li>
      </ul>
    </div>
  );

  const isFormValid =
    Object.values(passwordStrength).every(requirement => requirement) &&
    newPassword === confirmPassword &&
    currentPassword &&
    newPassword &&
    confirmPassword;

  if (loading) return <Loading />;

  return (
    <div className="w-full mx-auto bg-white mt-12">
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaBoxOpen /> {t('updatePassword.title')}
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }}>
          <div className="space-y-4">
            {/* Current Password */}
            <div className="relative">
              <label className="block text-gray-600">{t('updatePassword.currentPassword')}</label>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded pr-10"
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* New Password */}
            <div className="relative">
              <label className="block text-gray-600">{t('updatePassword.newPassword')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  checkPasswordStrength(e.target.value);
                }}
                maxLength={16}
                minLength={8}
                className="w-full mt-1 p-2 border border-gray-300 rounded pr-10"
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Password Requirements */}
            <PasswordRequirements />

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-gray-600">{t('updatePassword.confirmPassword')}</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError(e.target.value !== newPassword ? t('updatePassword.passwordMismatch') : '');
                }}
                className="w-full mt-1 p-2 border border-gray-300 rounded pr-10"
              />
              {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`${!isFormValid || loading ? 'disable-button' : 'primary-button'}`}
            >
              {loading ? t('updatePassword.updating') : t('updatePassword.updateButton')}
            </button>

            {/* Success / Error Messages */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserUpdatePassword;
