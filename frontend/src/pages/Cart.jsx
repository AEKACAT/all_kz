import React, { useContext, useEffect, useState } from 'react';
import emptyCartImage from '../assets/images/empty-cart.webp'
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { toast } from 'react-toastify';
import UserContext from '../state-management/UserContext';
import Loading from '../components/Loading';
import { CiCircleMinus } from 'react-icons/ci';
import api from '../api-services/apiConfig';
import trashIcon from '../assets/images/delete_red.svg';
import clsx from 'clsx';
import { FiShoppingCart } from 'react-icons/fi';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;

function Cart() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [paymentMode, setPaymentMode] = useState('Cash on Delivery');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const [grandTotal, setGrandTotal] = React.useState(0);
  // console.log(user)
  const [shippingAddress, setShippingAddress] = useState(
    [user.street, user.city, user.district, user.state, user.zipCode]
      .filter((item) => item) // filters out null, undefined, and empty strings
      .join(', ')
  );

  // console.log(shippingAddress, user.street , user.city, user.district, user.state, user.zipCode, user.country) 



  const { fetchUserCart, cart, loading, message, error,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    checkOut,
  } = useContext(UserContext);

  useEffect(() => {
    // console.log(user)  
    fetchUserCart(user.id);
    // console.log(user)
    // console.log(cart, "cart");


  }, []);

  useEffect(() => {
    let total = 0;
    cart?.forEach((item) => {
      total += item.price * item.quantity;
    });
    setGrandTotal(total);
  }, [cart]);

  //  useEffect(() => {
  //    if (product) {
  //      setTotalPrice(product.price * quantity);
  //    }
  //  }, [product, quantity]);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const sendFailureDetailsToBackend = async (razorpay_order_id) => {
    setPaymentLoading(true);
    try {
      const res = await api.post(`/user/order/payment-failure?razorpay_order_id=${razorpay_order_id}`);
      toast.error(res.data.message);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed or verification failed');
      console.error('Error sending failure details to backend:', error);
    } finally {
      setPaymentLoading(false);
    }
  };
  const verifyPamentDetails = async (details) => {
    setPaymentLoading(true);
    console.log("payment details ", details)
    try {
      const res = await api.post('/user/order/verify', details,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success(res.data.message);
      await fetchUserCart(user.id);
      // navigate to user profile after 1 sec
      setTimeout(() => {
        navigate('/user/orders');
      }, 1000);

    } catch (error) {
      console.log("error while verifying data", error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const openRazorpay = (order) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: "SHOP.CO Stores",
      description: "Payment for order #123",
      order_id: order.id,
      handler: function (response) {
        // ✅ Payment Successful
        setErrorDetails(null);
        setPaymentDetails({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });

        // send payment details to backend
        verifyPamentDetails({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });

        // ✅ Send verification request to backend
        // fetch("http://localhost:8080/verify", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     razorpay_payment_id: response.razorpay_payment_id,
        //     razorpay_order_id: response.razorpay_order_id,
        //     razorpay_signature: response.razorpay_signature,
        //   }),
        // })
        //   .then((res) => res.text())
        //   .then((message) => alert("Server Response: " + message))
        //   .catch((error) => console.error("Verification Error:", error));
      },
      modal: {
        ondismiss: function () {
          // User closed the popup
          const failInfo = {
            reason: "User closed the payment popup before completing payment.",
          };
          setErrorDetails(failInfo);


          sendFailureDetailsToBackend(order.id);

          // ❌ Log failure to backend
          // fetch("http://localhost:8080/payment/failure", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify(failInfo),
          // }).catch((err) => console.error("Failure logging error:", err));
        },
      },
      theme: { color: "#F37254" },
    };

    const rzp = new window.Razorpay(options);

    // ❌ Handle Razorpay’s payment.failed event
    rzp.on("payment.failed", function (response) {
      const errorData = {
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
        order_id: order.id,
      };

      console.log(errorData);

      setPaymentDetails(null);
      setErrorDetails(errorData);

      sendFailureDetailsToBackend(order.id);

      // ❌ Send to backend failure endpoint
      // fetch("http://localhost:8080/payment/failure", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(errorData),
      // }).catch((err) => console.error("Backend failure log error:", err));
    });

    rzp.open();
  };
  const checkOutWithRazorPay = async () => {
    setPaymentLoading(true);
    try {
      const orderRquest = {
        userId: user.id,
        shippingAddress: shippingAddress,
        paymentMode: paymentMode
      }
      const response = await api.post(`/user/order/checkout`, orderRquest);

      const orderDataFromServer = response.data?.razorpayOrder;
      console.log(orderDataFromServer, "response from server whith razorpay");
      if (orderDataFromServer) {
        openRazorpay(orderDataFromServer);
      } else {
        fetchUserCart(user.id);
        toast.success("Order placed successfully");
        navigate('/user/orders');
      }
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setPaymentLoading(false);
    }
  };
  const handleCheckOut = async () => {
    if (!paymentMode) {
      toast.error('Please select payment mode');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    // checkOut(user.id);

    await checkOutWithRazorPay();

  }

  if (loading || paymentLoading) return <Loading />


  return (
    <div className='max-w-6xl mx-auto'>

      <h1 className="mx-auto text-3xl md:text-6xl font-extrabold leading-tight text-black mt-7">
        {t('cart.title')}
      </h1>
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Product Details */}
        <div className="md:col-span-2 border border-gray-200 rounded-2xl">
          {/* {console.log(cart)} */}
          {cart?.length === 0 ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="flex flex-col items-center text-center space-y-6">

                {/* Icon */}
                <div className="bg-gray-100 p-6 rounded-full">
                  <FiShoppingCart className="text-5xl text-gray-500" />
                </div>

                {/* Message */}
                <p className="text-2xl md:text-3xl font-semibold text-gray-800">{t('cart.empty')}</p>

                {/* Button */}
                <Link
                  to="/"
                  onClick={() => window.scrollTo({ top: 100, behavior: 'smooth' })}
                  className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-900 transition"
                >
                  {t('cart.browse')}
                </Link>
              </div>
            </div>
          ) : (
            cart?.map((cartItem, index) => (
              <div
                key={index}
                className={clsx("max-w-4xl md:flex items-center justify-between bg-white p-4 md:mx-3 md:my-4",
                  index === cart.length - 1 ? 'border-b border-b-gray-200' : ''
                )}
              >
                {/* Image */}
                <div className="flex items-center gap-5">
                  <div className="w-40 h-40 rounded-xl overflow-hidden">
                    <img
                      src={`data:image/png;base64,${cartItem.imageData}`}
                      alt={cartItem.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className='flex flex-col justify-between h-30'>
                    <h2 className="text-lg font-semibold text-gray-900">{cartItem.productName}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('brand')}: <span className="text-gray-800">{cartItem.brand}</span>
                    </p>
                    <p className="text-xl font-bold mt-2">₸{cartItem.price}</p>
                  </div>
                </div>

                {/* Quantity & Remove */}
                <div className="flex md:flex-col flex-row-reverse justify-between md:items-end md:h-30">
                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(user.id, cartItem.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <img src={trashIcon} alt="20" />
                  </button>

                  {/* Quantity Control */}
                  <div className="bg-gray-100 rounded-full px-6 py-2 flex items-center space-x-6">
                    <button
                      onClick={() => decrementQuantity(user.id, cartItem.id)}
                      disabled={cartItem.quantity === 1}
                      className="text-xl text-black disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium">{cartItem.quantity}</span>
                    <button
                      onClick={() => incrementQuantity(user.id, cartItem.id)}
                      className="text-xl text-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>


            ))
          )}
        </div>

        {/* Right Column: Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm w-full max-w-md mx-auto">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('cart.summary.title')}</h2>

          {/* Totals */}
          <div className="space-y-3 text-sm text-gray-700 mb-4">
            <div className="flex justify-between">
              <span className='font-thin'>{t('cart.summary.totalItems')}</span>
              <span className="font-bold">{cart?.map(item => item.quantity).reduce((a, b) => a + b, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className='font-thin'>{t('cart.summary.total')}</span>
              <span className="font-bold">₸{grandTotal}</span>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="mb-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">{t('cart.payment.title')}</p>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                className='accent-black'
                value={t('cart.payment.cod')}
                checked={paymentMode === t('cart.payment.cod')}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
              {t('cart.payment.cod')}
            </label>
          </div>

          {/* Shipping Address */}
          <div className="mb-6 text-sm text-gray-700">
            <p className="font-semibold mb-3">{t('cart.address.title')}</p>
            <textarea
              name="shippingAddress"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Міндетті"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
              rows={2}
              required
            />
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckOut}
            disabled={cart?.length === 0}
            className={`w-full text-center text-white font-semibold rounded-full py-3 text-sm transition 
            ${cart?.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
          >
            Сатып алу
          </button>
        </div>

      </div>
    </div>
  );
}

export default Cart;