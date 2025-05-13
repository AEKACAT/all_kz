import React from "react";
import { useTranslation } from "react-i18next";

const ErrorPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-red-300 text-center">
        <h2 className="text-2xl font-bold text-red-600">⚠️ {t('error.title')}</h2>
        <p className="text-gray-700 mt-2">
          {t('error.description')}
        </p>
        <button
          onClick={() => window.location.href = "/"}
          className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none cursor-pointer"
        >
          {t('error.retry')}
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
