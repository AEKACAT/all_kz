import { useTranslation } from 'react-i18next';

export default function Loading() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center items-center h-[80vh] bg-white">
      {/* Minimal spinner */}
      <div className="w-10 h-10 border-4 border-gray-300 border-t-[#2c2c2c] rounded-full animate-spin"></div>

      {/* Text */}
      <p className="mt-6 text-gray-700 text-5xl font-medium">
        {t('loading.title')}
      </p>
      <p className="mt-7 text-gray-400 text-2xl text-center">
        {t('loading.description')}
      </p>
    </div>
  );
}
