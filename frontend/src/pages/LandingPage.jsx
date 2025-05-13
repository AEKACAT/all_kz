import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaStar } from "react-icons/fa";
import ProductContext from '../state-management/ProductContext';
import CategoryContext from '../state-management/CategoryContext';
import Loading from '../components/Loading';
import fridgeImg from '../assets/images/fridge.png';
import iphoneImg from '../assets/images/iphone.png';
import macbookImg from '../assets/images/macbook.png';
import starImg from '../assets/images/star.svg';
import { Rating } from '../components/Rating';

const LandingPage = () => {
    const { t } = useTranslation();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [sampleProducts, setSampleProducts] = useState([]);

    const { loading, error } = useContext(CategoryContext);
    const { products, loading: productsLoading, error: productsError,
        carousels,
        fetchCarousels,
        fetchShowcaseProducts
    } = useContext(ProductContext);


    const handleNextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % carousels.length);
    };

    const handlePrevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide === 0 ? carousels.length - 1 : prevSlide - 1));
    };
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % carousels.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [carousels.length])

    useEffect(() => {
        const handlefetch = async () => {
            const res = await fetchShowcaseProducts();
            console.log(res);
            setSampleProducts(res);
        }
        handlefetch()
        fetchCarousels();
        // setSampleProducts(fetchShowcaseProducts());
    }, []);

    if (loading || productsLoading) {
        return <Loading />;
    }

    const renderShowcaseProducts = () => {
        // console.log(sampleProducts)
        const filtered = {
            topTenProducts: sampleProducts?.topTenProducts,
            ...Object.fromEntries(Object.entries(sampleProducts).filter(([key]) => key !== 'topTenProducts'))

        }
        return (
            <>
                {sampleProducts && Object.entries(filtered).map(([category, products]) => {
                    // if (category === "topTenProducts") return null
                    if (products?.length === 0 || products?.length <= 4) return null

                    return <div className="p-4 mb-7 mt-5" key={category}>
                        <h2 className="text-2xl font-semibold mb-4 mx-5">
                            {category === "topTenProducts" ? t('new') : category}
                            <Link to={`/category/${category}`} className='text-sm text-gray-500 ml-4 hover:text-indigo-500'>{category === "topTenProducts" ? '' : t('viewAll')}</Link>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-stretch">
                            {products?.slice(0, 4).map((product, index) => (
                                <Link to={`/product/${product.id}`} key={index} className='h-full hover:scale-105 transition-all duration-300'>
                                    <div
                                        className="h-full bg-white p-3 rounded-lg shadow hover:shadow-lg transition duration-300"
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
                })}
            </>
        );
    };



    return (
        <>
            {/* slider */}
            <section className="bg-white min-h-[85vh] mt-10 flex flex-col justify-center px-4 md:px-12 relative overflow-hidden">
                <div className="w-full md:w-[75%] mx-auto flex flex-col gap-8">

                    {/* Top content */}
                    <div className="flex flex-col items-start relative z-10">
                        <h1 className="text-3xl md:text-6xl font-extrabold max-w-5xl leading-tight text-black xs:mt-10 sm:mt-[80px]">
                            {t('hero.title')}
                        </h1>

                        <p className="text-gray-500 text-base md:text-lg mt-4 max-w-md">
                            {t('hero.subtitle')}
                        </p>

                        <button className="mt-6 bg-black text-white px-8 py-3 rounded-full text-base font-medium hover:bg-gray-800 transition w-full sm:w-auto">
                            {t('hero.shopNow')}
                        </button>
                    </div>

                    {/* Bottom stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center border-t pt-10 relative z-10">
                        <div>
                            <h3 className="text-3xl font-bold text-black">{t('hero.stat1.number')}</h3>
                            <p className="text-gray-500 text-sm mt-2">{t('hero.stat1.label')}</p>
                        </div>

                        <div className="md:border-l border-gray-200 md:pl-8">
                            <h3 className="text-3xl font-bold text-black">{t('hero.stat2.number')}</h3>
                            <p className="text-gray-500 text-sm mt-2">{t('hero.stat2.label')}</p>
                        </div>

                        <div className="md:border-l border-gray-200 md:pl-8">
                            <h3 className="text-3xl font-bold text-black">{t('hero.stat3.number')}</h3>
                            <p className="text-gray-500 text-sm mt-2">{t('hero.stat3.label')}</p>
                        </div>
                    </div>
                </div>
                <img
                    src={iphoneImg}
                    alt="iPhone"
                    className="hidden md:block absolute top-25 right-16 w-[500px] h-[500px] object-contains scale-x-[-1] "
                />
                <img
                    src={macbookImg}
                    alt="Macbook"
                    className="hidden md:block absolute -top-1 left-0 rotate-340 w-[300px] h-auto object-contain"
                />
                <div className="hidden md:block absolute top-10 right-20">
                    <img src={starImg} className="" />
                </div>
                <div className="hidden md:block absolute right-[45%]">
                    <img src={starImg} className="" />
                </div>
                <div className="absolute bottom-35 left-[7%]">
                    <img src={starImg} className="" />
                </div>
            </section>

            {/* Products by category */}
            <div className='space-y-4'>
                {/* {categories.slice(0, 3).map((category, index) => (
                    <div key={index}>
                        {renderProductsByCategory(category)}
                    </div>
                ))} */}
                {renderShowcaseProducts()}
            </div>
        </>
    );
};

export default LandingPage; 