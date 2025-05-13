import React, { useContext, useEffect, useState } from 'react';
import { FaEdit, FaBoxOpen, FaEyeSlash, FaEye } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import UserContext from '../state-management/UserContext';
import { AuthContext } from '../state-management/AuthContext';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';
import { getColor } from './getColor';
import { Link } from 'react-router-dom';

function UserOrders() {
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [user, setUser] = useState({
  });

  const { updateProfile,
    updatePassword,
    loading, error, message,
    orders,
    fetchOrdersByUser,
    updateOrder,

  } = useContext(UserContext);

  const { loading: authLoading, logout, deleteAccount } = useContext(AuthContext);

  const userData = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const handlerFunction = async () => {
      await fetchOrdersByUser(userData.id);
    }
    console.log("fetching orders in useEffect in order users commponent");
    // fetchOrdersByUser(userData.id);
    handlerFunction();
  }, []);
  useEffect(() => {
    if (orders) {
      const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFilteredOrders(sorted);
    }
  }, [orders]);




  function formatDateTime(isoString) {
    const date = new Date(isoString);

    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // Month is 0-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12

    return `${day}-${month}-${year} at ${pad(hours)}:${minutes}:${seconds} ${ampm}`;
  }

  //   const handleCancelOrder = async (orderId) => {

  //     // logic to cancel the order, update status to CANCELLED;
  //     updateOrder(orderId, 'CANCELLED');
  //   };
  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this order?');
    if (confirmed) {
      await updateOrder(orderId, 'CANCELLED');
      // toast.success("Order cancelled successfully!");
    }
  };







  if (loading || authLoading) return <Loading />
  return (
    <div className="w-full mx-auto bg-white mt-12">


      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaBoxOpen /> Your Orders
        </h2>
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4 border border-gray-200 rounded flex flex-col md:flex-row gap-4 items-start">

                {/* Left: Product Image */}
                <div className="w-[40%] flex-shrink-0 hover:scale-105 transition-all duration-300">
                  <Link to={`/product/${order.productId}`}

                  >
                    <img
                      src={`data:image/png;base64,${order.imageData}`} // replace with your image field or placeholder
                      alt={order?.productName}
                      className="w-full h-full object-cover rounded"
                    />
                  </Link>
                </div>

                {/* Right: Order Details */}
                <div className="flex-1">
                  <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Order ID:</span> {order.id}</p>
                  <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Product:</span> {order.productName}</p>
                  <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Quantity:</span> {order.quantity}</p>
                  <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Total Amount:</span> ₸{order.totalAmount}</p>

                  <p className='flex flex-row w-full justify-between my-3'>
                    <span className="font-medium text-[#000000]/60">Status:</span>
                    <span className={'ml-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ' + getColor(order.status)}>
                      {order.status}
                    </span>
                  </p>

                  <p className='flex flex-row w-full justify-between my-3'>
                    <span className="font-medium text-[#000000]/60">Payment:</span> {order.paymentMethod || 'Cash on Delivery'}
                  </p>

                  <p className='flex flex-row w-full justify-between my-3'>
                    <span className="font-medium text-[#000000]/60">Payment Status:</span>
                    <span className={'ml-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ' + getColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </span>
                  </p>

                  {order?.paymentId && (
                    <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Payment ID:</span> {order.paymentId}</p>
                  )}

                  <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Delivery Address:</span> {order.shippingAddress || 'N/A'}</p>
                  <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Order Date:</span> {formatDateTime(order.createdAt || '')}</p>


                  {order?.status !== 'CANCELLED' &&
                    order?.status !== 'REFUND_ISSUED' &&
                    order?.status !== 'DELIVERED' && (
                      <button
                        className="mt-3 cursor-pointer text-white rounded-full bg-red-500 px-4 py-2 text-sm hover:bg-red-600"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                </div>
              </div>

              // <div key={order.id} className="p-4 border border-gray-200 rounded">
              //   <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Order ID:</span> {order.id}</p>
              //   <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Product:</span> {order.productName}</p>
              //   <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Quantity:</span> {order.quantity}</p>
              //   <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Total Amount:</span> ₸{order.totalAmount}</p>
              //   <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Order Date:</span> {formatDateTime(order.createdAt || '')}</p>
              //   <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Status:</span> 
              //   <span className={'ml-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm' + getColor(order.status)}>
              //     {order.status}</span>
              //   </p>
              //   <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Payment:</span> {order.paymentMethod || 'Cash on Delivery'}</p>

              //   <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Payment Status:</span> 
              //   <span className={'ml-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm' + getColor(order.paymentStatus)}>
              //   {order.paymentStatus}</span>
              //   </p>
              //   {order?.paymentId && <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Payment ID:</span> {order?.paymentId}</p>}

              //   <p className='flex flex-row w-full justify-between my-3'><span className="font-medium text-[#000000]/60">Delivery Address:</span> {order.shippingAddress || 'N/A'}</p>
              //   <p className='flex flex-row w-full justify-between my-3'>{order?.status !== 'CANCELLED' && 
              //   order?.status !== 'DELIVERED' 
              //   && <button className="mt-2 cursor-pointer  text-white rounded-full bg-red-500 px-4 py-2 text-sm hover:bg-red-600 " 
              //   onClick={() => handleCancelOrder(order.id)}
              //   >Cancel Order</button>}

              //    </p>

              // </div>
            ))}
          </div>
        )}
      </div>



    </div>
  );
}

export default UserOrders;
