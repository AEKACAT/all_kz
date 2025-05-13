import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import Loading from "./Loading";
import { Link } from "react-router-dom";
import ProductContext from "../state-management/ProductContext";
import CategoryContext from "../state-management/CategoryContext";
import fb from '../assets/images/fb.svg';
import tw from '../assets/images/tw.svg';
import yt from '../assets/images/yt.svg';
import ln from '../assets/images/ln.svg';
import logo from '../assets/images/logo.svg';

const Footer = () => {
  const { t } = useTranslation();

  const [latestProducts, setLatestProducts] = useState([]);
  const {
    loading,
    products,
    fetchShowcaseProducts,
  } = useContext(ProductContext);

  const {
    categories,
    fetchCategories,
    loading: categoriesLoading,
  } = useContext(CategoryContext);

  useEffect(() => {

    // Fetch categories when the component mounts
    fetchCategories();
    // fetchProducts();
  }, []);

  return (
    <footer className=" bg-[#F0F0F0] text-[#000000] py-6 mt-auto">
      {loading || categoriesLoading && <Loading />}
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Social Media */}
        <div>
          <img src={logo} alt="" className="" />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">{t('footer.shopByCategory')}</h3>
          <ul className="space-y-2">
            {categories.slice(0, 5).map((category) => ( // Only display the first 4 categories
              <li key={category.id}><a href={`/category/${category.name}`} className="text-[#000000]/60 hover:underline">{category.name}</a></li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        {latestProducts?.length > 0 && <div>
          <h3 className="text-lg font-semibold mb-3">{t('footer.latestProducts')}</h3>
          <ul className="space-y-2">
            {latestProducts?.slice(0, 4)?.map((product) => ( // Only display the first 4 products
              <li key={product.id}>
                <Link to={`/user/shop/${product.categoryName}/${product.id}`} className="text-[#000000]/60 hover:underline">
                  {product.name}
                </Link></li>
            ))}
          </ul>
        </div>
        }
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{t('footer.aboutUs')}</h3>
          <ul className="space-y-2">
            <li><Link to='/'
              onClick={() => window.scrollTo(0, 0)}
              className="text-[#000000]/60 hover:underline">SHOP.CO</Link></li>
            <li><a href="" className="text-[#000000]/60 hover:underline">shop.co@gmail.com</a></li>
            <li className="text-[#000000]/60">+77 777 77777</li>
          </ul>
        </div>

        <div className="">
          <h3 className="text-lg font-semibold mb-5">{t('footer.followUs')}</h3>
          <div className="flex space-x-4">
            <img src={fb} alt="" />
            <img src={ln} alt="" />
            <img src={yt} alt="" />
            <img src={tw} alt="" />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-gray-400 text-sm mt-6">
        SHOP.CO © {new Date().getFullYear()}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
