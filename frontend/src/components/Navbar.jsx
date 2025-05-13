import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingCart, FaSignOutAlt, FaBars, FaTimes, FaMicrophone, FaStop } from 'react-icons/fa';
import { AuthContext } from '../state-management/AuthContext';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import logo from '../assets/images/logo.svg'
import UserContext from '../state-management/UserContext';
import { ImCross } from "react-icons/im";
import ProductContext from '../state-management/ProductContext';
import { LangSelect } from './LangSelect';
import api from '../api-services/apiConfig';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const { language } = i18n;
    // const [searchQuery, setSearchQuery] = useState('');
    const { searchQuery, setSearchQuery } = useContext(ProductContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();
    const [result, setResult] = useState("");
    const [isRecording, setIsRecording] = useState(false);

    // храним и Recorder, и сам Stream
    const mediaRecorder = useRef(null);
    const mediaStreamRef = useRef(null);

    const handleToggle = async () => {
        if (!isRecording) {
            // 1) Запустить новую запись
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            mediaRecorder.current = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorder.current.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.current.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const arrayBuffer = await blob.arrayBuffer();
                const resp = await api.post('/api/speech/stt', arrayBuffer, {
                    headers: { 'Content-Type': 'application/octet-stream' }
                });
                setResult(resp.data);
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } else {
            // 2) Остановить запись и закрыть микрофон
            mediaRecorder.current.stop();

            // для каждого трека вызвать stop(), чтобы значок записи исчез
            mediaStreamRef.current.getTracks().forEach(track => track.stop());

            setIsRecording(false);
            mediaStreamRef.current = null;
        }
    };



    // state values
    const { loading, logout } = useContext(AuthContext);
    const { fetchUserCart, loading: cartLoading, cart } = useContext(UserContext);
    const user = JSON.parse(localStorage.getItem('user'));
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const handleChangeLanguage = (currentLanguage) => {
        if (i18n.changeLanguage) {
            i18n.changeLanguage(currentLanguage);
        } else if (i18n.languages) {
            i18n.languages = [currentLanguage];
        }
    };

    useEffect(() => {
        // Clear the search query when navigating away from /search
        if (location.pathname !== "/search") {
            setSearchQuery("");
        }
    }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {

            // setSearchQuery('');
            setShowMobileSearch(false);
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };


    const handleLogout = () => {

        if (window.confirm("Are you sure you want to logout?")) {
            logout();

            toast.success('Logged out successfully');
            navigate('/login');
        }

    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setShowMobileSearch(false);
    };

    const toggleMobileSearch = () => {
        setShowMobileSearch(!showMobileSearch);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        if (isAuthenticated && !isAdmin) {
            fetchUserCart(user.id);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (cart) {
            // setCartCount(cart?.length || 0);
            // iterate through the cart and count the number of items
            let count = 0;
            cart.forEach((item) => {
                count += item.quantity;
            });
            setCartCount(count);
        }
    }, [cart]);

    return (
        <nav className="bg-white shadow-md sticky w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Firm Name */}
                    <div className="flex-shrink-0">
                        <Link
                            to="/"
                            className="text-2xl font-bold scroll-smooth cursor-pointer"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            {/* SHOP.CO <span className="text-indigo-600">Stores</span> */}
                            <img src={logo} alt="logo" className="w-32" />
                        </Link>
                    </div>


                    {/* Search Bar - Desktop & Tablet */}
                    <div className="bg-[#F0F0F0] rounded-3xl outline-none hidden md:block lg:block flex-1 max-w-2xl mx-4">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="flex flex-row items-center justify-between">
                                <div className="">
                                    <button
                                        type="submit"
                                        onClick={() => handleSearch}
                                        className="absolute inset-y-0 left-0 pl-3 flex items-center cursor-pointer">
                                        <FaSearch className="text-gray-400 hover:text-gray-500" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder={t('searchProducts')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 pl-10"
                                        required
                                    />
                                    {/* remove button */}
                                    {searchQuery && (

                                        <button
                                            type='button'
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-5 pr-5 flex items-center cursor-pointer">
                                            <ImCross className="text-gray-400 text-sm hover:text-gray-500" />
                                        </button>

                                    )}
                                </div>
                                <button onClick={handleToggle} className='mr-3'>
                                    {!isRecording ? <FaMicrophone className="text-gray-400 hover:text-gray-500" /> : <FaStop className="text-gray-400 hover:text-gray-500" />}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Mobile Icons (Search & Menu) */}
                    <div className="flex items-center gap-2 md:hidden">
                        {searchQuery && (

                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 top-16 right-5 pr-7 flex items-center cursor-pointer">
                                <ImCross className="text-gray-400 text-sm hover:text-gray-500" />
                            </button>

                        )}
                        {/* Mobile Search Icon */}
                        <LangSelect
                            defaultValue={language}
                            onChange={handleChangeLanguage}
                        />
                        <button
                            onClick={toggleMobileSearch}
                            className="p-2 rounded-md text-gray-700 hover:text-indigo-600"
                        >
                            <FaSearch className="h-5 w-5" />
                        </button>

                        {/* Menu Button */}
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-gray-700 hover:text-indigo-600"
                        >
                            {isMenuOpen ? (
                                <FaTimes className="h-6 w-6" />
                            ) : (
                                <FaBars className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <LangSelect
                            defaultValue={language}
                            onChange={handleChangeLanguage}
                        />
                        {!isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-[#303030] px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    {t('login2')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="primary-button text-sm"
                                >
                                    {t('register2')}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                {user?.role === "USER" && (
                                    <>
                                        {/* User profile */}
                                        {/* <Link to="/user/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-full">
                                            <FaUser className="h-4 w-4" color='gray-700' />
                                            <span className="text-gray-700 font-medium">
                                                {user?.name}
                                            </span>
                                        </Link> */}
                                        {/* Shopping Cart */}
                                        <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full group">
                                            <FaShoppingCart className="h-5 w-5 text-gray-700 " />

                                            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {cartCount}
                                            </span>

                                        </Link>
                                    </>
                                )}

                                {/* Admin Dashboard Link */}
                                {user?.role === 'ADMIN' && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                    >
                                        {t('adminDashboard')}
                                    </Link>
                                )}

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-700 hover:text-red-600 cursor-pointer px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                                >
                                    {t('logout')}
                                    <FaSignOutAlt className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {showMobileSearch && (
                    <div className="md:hidden py-2 relative">
                        <form onSubmit={handleSearch} className="relative">
                            {/* Сам инпут */}
                            <input
                                type="text"
                                placeholder={t('searchProducts')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input w-full px-4 py-2 pr-12"
                                autoFocus
                            />

                            {/* Иконка поиска (не кликабельная) */}
                            <FaSearch
                                className="absolute inset-y-0 right-12 pr-3 flex items-center pointer-events-none text-gray-400"
                            />

                            {/* Кнопка записи/остановки */}
                            <button
                                type="button"
                                onClick={handleToggle}
                                className="absolute inset-y-0 right-3 pr-3 flex items-center"
                            >
                                {isRecording
                                    ? <FaStop className="text-gray-400 hover:text-gray-500" />
                                    : <FaMicrophone className="text-gray-400 hover:text-gray-500" />
                                }
                            </button>
                        </form>
                    </div>
                )}


                {/* Mobile & Tablet Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                    >
                                        {t('login2')}
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                    >
                                        {t('register2')}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {user?.role === "USER" && (
                                        <>
                                            {/* <div className="px-3 py-2 rounded-md text-base font-medium text-gray-700">
                                                <FaUser className="inline h-4 w-4 mr-2" color='gray-700'/>
                                                {user?.name}
                                            </div> */}
                                            <Link
                                                to="/cart"
                                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                <FaShoppingCart className="h-5 w-5 mr-2" />
                                                {t('cart2')}
                                                {cartCount > 0 && (
                                                    <span className="ml-2  text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                        {cartCount
                                                        }
                                                    </span>
                                                )}
                                            </Link>
                                        </>
                                    )}
                                    {user?.role === 'ADMIN' && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                        >
                                            {t('adminDashboard')}
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 flex items-center"
                                    >
                                        {t('logout')}
                                        <FaSignOutAlt className="h-4 w-4 ml-2" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;