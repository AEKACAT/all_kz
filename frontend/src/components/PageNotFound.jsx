import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const PageNotFound = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center bg-white px-6">
            <div className="text-center">

                {/* Error Code */}
                <h1 className="text-7xl font-extrabold text-gray-900 mb-4">
                    404
                </h1>

                {/* Error Title */}
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    {t('pagenotfound.title')}
                </h2>

                {/* Error Description */}
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {t('pagenotfound.description')}
                </p>

                {/* Back to Home Button */}
                <Link
                    to="/"
                    className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition"
                >
                    <FaHome className="h-4 w-4 mr-2" />
                    {t('pagenotfound.backToHome')}
                </Link>

                {/* Additional Links */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        {t('pagenotfound.needHelp')} {' '}
                        <Link to="/contact" className="text-[#2c2c2c] hover:underline font-medium">
                            {t('pagenotfound.contactSupport')}
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default PageNotFound;
