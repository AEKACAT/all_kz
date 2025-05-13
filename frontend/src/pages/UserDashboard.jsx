import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function UserDashboard() {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname;
  const lastSegment = path.split("/").filter(Boolean).pop(); // пример: "update-password"

  const [activeTab, setActiveTab] = useState(lastSegment);

  useEffect(() => {
    setActiveTab(lastSegment);
  }, [lastSegment]);

  const tabs = [
    { label: t('dashboard.profile'), path: '/user/profile', key: 'profile' },
    { label: t('dashboard.orders'), path: '/user/orders', key: 'orders' },
    { label: t('dashboard.updatePassword'), path: '/user/update-password', key: 'update-password' },
    { label: t('dashboard.more'), path: '/user/account-information', key: 'account-information' },
  ];

  return (
    <div className="max-w-5xl min-h-[80vh] mx-auto my-12 p-8 bg-white rounded-2xl border border-gray-200">
      {/* Tabs */}
      <nav className="flex space-x-8 border-b border-gray-200 mb-8">
        {tabs.map(tab => (
          <Link
            key={tab.key}
            to={tab.path}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-lg font-semibold transition-colors ${activeTab === tab.key
              ? 'border-b-2 border-[#2c2c2c] text-[#2c2c2c]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Tab Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
