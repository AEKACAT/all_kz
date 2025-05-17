import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import image1 from '../assets/images/2.jpg'
import ProductContext from '../state-management/ProductContext';
import { FaStar } from 'react-icons/fa';
import UserContext from '../state-management/UserContext';
import { toast } from 'react-toastify';
import { Rating } from '../components/Rating';

function ProductPage() {
    const { t } = useTranslation();
    const { productId } = useParams();
    const navigate = useNavigate();

    const [rating, setRating] = useState("5");
    const [review, setReview] = useState("");
    const [localReviews, setLocalReviews] = useState([]);
    const [activeTab, setActiveTab] = useState("reviews");

    const isAdmin = localStorage.getItem("isAdmin");
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const user = JSON.parse(localStorage.getItem('user')); //localStorage.getItem("user")

    const { product,
        loading,
        fetchProductById,
        fetchProductReviews,
        fetchProductsByCategory,
        addReview,
        deleteReview,
        reviews,
        products,
        message,
        error,
        clearLogs,
    } = useContext(ProductContext);

    const { loading: loading2, message: message2,
        addToCart,

    } = useContext(UserContext);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        if (message) {
            toast.success(message);
            fetchProductById(productId);
            fetchProductReviews(productId);
        }

        clearLogs();
    }, [error, message])
    useEffect(() => {
        // fetchProductReviews(productId)
        console.log(reviews);
        if (reviews) {
            setLocalReviews(reviews)
            console.log("local", reviews)
        }
    }, [reviews])
    useEffect(() => {
        const handleFunction = async () => {
            await fetchProductById(productId)
            await fetchProductReviews(productId)
        }

        handleFunction();
    }, [productId])

    useEffect(() => {
        const handleFunction = async () => {
            console.log(product.category, 'category')
            await fetchProductsByCategory(product?.category, 10, 1)
            await fetchProductReviews(productId)
        }

        if (product) {
            handleFunction();
        }
        // console.log("reviews in productpage", reviews)
    }, [product])
    const handleAddToCart = () => {
        console.log('Adding to cart:', product);
        if (isAuthenticated) {
            addToCart(user.id, productId);
        } else {
            toast.error(t('errors.loginToAddCart'));
            navigate('/login');
        }

    };

    const handleOrderNow = () => {
        console.log('Ordering now:', product);
        if (!isAuthenticated) {
            toast.error(t('errors.loginToOrder'));
            navigate('/login');
        }
        navigate(`/checkout/${product.id}`);
    };

    const handleDeleteReview = async (reviewId) => {
        // console.log('Deleting review:', reviewId, userId);
        if (window.confirm(t('errors.confirmDeleteReview'))) {
            await deleteReview(reviewId, user.id);
        }

    };

    const handleAddReview = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error(t('errors.loginToReview'));
            navigate('/login');
        } else {
            const formData = {
                productId,
                rating: Number(rating),
                comment: review,
                userId: user.id
            };

            addReview(formData);
        }

        setRating("5");
        setReview("");

        // console.log('Adding review:', { rating, review });
    };


    const renderProductsByCategory = () => {
        return (
            <div className="p-4">
                <h1 className="text-5xl font-bold text-center mb-6">{t("relatedProducts")}</h1>
                
                <div
                    // className='flex gap-4'
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-stretch"
                >
                    {products.slice(0, 4).map((product, index) => (
                        // product card
                        <Link to={`/product/${product.id}`} key={index} className='hover:scale-105 transition-all duration-300 h-full'>
                            <div
                                className="bg-white p-3 rounded-lg shadow hover:shadow-lg transition duration-300"
                            >
                                <div className="w-full items-center mb-2">
                                    <img
                                        src={`data:image/png;base64,${product.imageData}`}
                                        alt={product.name}
                                        className="max-h-full object-contain"
                                    />
                                </div>

                                <h3 className="text-lg font-medium text-gray-800">
                                    {product.name}
                                </h3>

                                {/* Rating and reviews */}
                                <div className="flex flex-col justify-start text-md mt-3">
                                    <span className='flex items-center gap-x-1'>
                                        <span className="text-md font-semibold text-gray-900">₸</span>
                                        {product.price}
                                    </span>
                                    <span className="w-max flex items-center gap-1  py-0.5 rounded text-xs">
                                        <Rating value={product.rating} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };
    return (
        <>
            <div className="container mx-auto py-4 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className=''>
                        <img
                            src={`data:image/png;base64,${product?.imageData}`}
                            alt="Raven Hoodie"
                            className="w-full h-150 object-contain sticky top-28 rounded-lg"
                        />

                    </div>

                    <div>
                        <h1 className="text-5xl font-bold mb-3">{product?.name}</h1>
                        {/* display brand */}
                        <p className="text-3xl font-thin text-gray-500 mb-3">{product?.brand}</p>

                        <Rating value={product?.value} />

                        <p className="text-3xl font-semibold my-4">₸ {product?.price}</p>

                        <p className='text-2xl my-4 font-thin border-b-1 pb-2 border-b-gray-100'>{product?.description}</p>
                        <span
                            className={`inline-block px-3 py-1 text-sm font-medium rounded-full 
                                ${product?.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                            {product?.stock > 0 ? (product?.stock < 5 ? t('product.onlyXAvailable', { count: product?.stock }) : t('product.inStock')) : t('product.outOfStock')}
                        </span>
                        {product?.colors &&
                            <div className="mt-5 border-b-1 pb-2 border-b-gray-100">
                                <h2 className="text-xl my-4 font-thin">{t('product.coloursAvailable')}</h2>
                                <div className="flex space-x-2 mb-4 ">
                                    {product.colors.split(",").map(s => s.trim()).filter(s => s).map((color, index) => (
                                        <span
                                            key={index}
                                            className="inline-block border border-slate-200 p-2 w-10 h-10 rounded-full cursor-pointer"
                                            style={{ backgroundColor: color.toLowerCase() }}
                                            title={color}
                                        ></span>
                                    ))}
                                </div>
                            </div>
                        }
                        {product?.sizes &&
                            <div className="mt-5 border-b-1 pb-2 border-b-gray-100">
                                <h2 className="text-xl my-4 font-thin">{t('product.sizesAvailable')}</h2>

                                <div className="flex space-x-2 mb-4">
                                    {product?.sizes.split(",").map(s => s.trim()).filter(s => s).map((size, index) => (
                                        <button
                                            key={index}
                                            className="secondary-button cursor-pointer"
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        }
                        

                        <div className='flex gap-4 mt-4 max-w-md justify-center'>
                            <button
                                // className="
                                onClick={() => handleAddToCart()}
                                className={`${loading2 ? 'disable-button' : 'w-full cursor-pointer secondary-button transition-all duration-300 '}`}
                                disabled={loading2}
                            >
                                {loading2 ? t('product.adding') : t('product.addToCart')}
                            </button>

                            <button
                                className="primary-button w-full"
                                onClick={() => handleOrderNow()}
                            >
                                {t('product.buyNow')}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Ratings and Reviews Section */}
                <div className="my-10 min-h-[300px]">
                    {/* Вкладки */}
                    <div className="flex gap-6 border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`py-2 text-xl font-thin transition duration-200 ${activeTab === "reviews"
                                ? "border-b-2 border-gray-900 text-gray-900"
                                : "text-gray-400 hover:text-gray-700"
                                }`}
                        >
                            {t('product.reviewsTitle')}
                        </button>
                        <button
                            onClick={() => setActiveTab("create")}
                            className={`py-2 text-xl font-thin transition duration-200 ${activeTab === "create"
                                ? "border-b-2 border-gray-900 text-gray-900"
                                : "text-gray-400 hover:text-gray-700"
                                }`}
                        >
                            {t('product.leaveReview')}
                        </button>
                    </div>

                    {/* Вкладка Отзывы */}
                    {activeTab === "reviews" && (
                        <div className="space-y-6">
                            {localReviews?.length ? (
                                localReviews.map((review, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-100 p-5 rounded-lg shadow-sm"
                                    >
                                        <div className="text-lg font-medium text-gray-800">
                                            {review.userName}
                                            <span className="ml-4 text-sm font-thin text-gray-500">
                                                {new Date(review.createdAt).toLocaleString()}
                                            </span>
                                            {isAuthenticated && review.userId === user.id && (
                                                <button
                                                    className="ml-3 text-sm text-red-500 hover:underline"
                                                    onClick={() => handleDeleteReview(review.id, review.userId)}
                                                >
                                                    {t('product.deleteReview')}
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            {[1, 2, 3, 4, 5].map((star, i) => (
                                                <FaStar
                                                    key={i}
                                                    className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}
                                                />
                                            ))}
                                            <span className="text-sm text-gray-500 font-thin">
                                                ({review.rating}/5)
                                            </span>
                                        </div>

                                        <p className="mt-2 text-gray-700 text-base font-thin">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 font-thin">{t('product.noReviews')}</p>
                            )}
                        </div>
                    )}

                    {/* Вкладка Оставить отзыв */}
                    {activeTab === "create" && (
                        <div className="bg-white p-6 rounded-lg border-1 border-gray-200">
                            <h3 className="text-xl font-thin mb-4">{t('product.leaveReview')}</h3>
                            <form onSubmit={handleAddReview}>
                                <label className="block font-thin text-gray-700">{t('product.ratingLabel')}</label>
                                <select
                                    className="w-full mt-2 p-2 border border-gray-200 rounded-md text-sm font-thin"
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    <option value="5">⭐⭐⭐⭐⭐</option>
                                    <option value="4">⭐⭐⭐⭐</option>
                                    <option value="3">⭐⭐⭐</option>
                                    <option value="2">⭐⭐</option>
                                    <option value="1">⭐</option>
                                </select>

                                <label className="block mt-4 font-thin text-gray-700">{t('product.reviewLabel')}</label>
                                <textarea
                                    className="w-full mt-2 p-2 border border-gray-200 rounded-md resize-none h-24 text-sm font-thin"
                                    placeholder="..."
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                />

                                <button
                                    type="submit"
                                    className={`${!review || loading
                                        ? 'disable-button'
                                        : 'primary-button text-sm mt-4'
                                        }`}
                                    disabled={!review || loading}
                                >
                                    {loading ? t('product.addingReview') : t('product.submitReview')}
                                </button>
                            </form>
                        </div>
                    )}
                </div>


                {/* related products */}
                {product && renderProductsByCategory(product?.category)}
            </div>


        </>
    )
}

export default ProductPage