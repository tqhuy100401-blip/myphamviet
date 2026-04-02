import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import { FiShoppingCart } from "react-icons/fi";
import MiniCart from "./components/MiniCart";
import axiosClient from "./api/axiosClient";
import Footer from "./components/Footer";
import Chat from "./components/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";

// Lazy load pages for better performance
const HomeSimple = lazy(() => import("./pages/HomeSimple"));
const ProductList = lazy(() => import("./pages/ProductList"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const ProductsByCategory = lazy(() => import("./pages/ProductsByCategory"));
const VoucherPage = lazy(() => import("./pages/VoucherPage"));
const BankTransfer = lazy(() => import("./pages/BankTransfer"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const ReturnRequest = lazy(() => import("./pages/ReturnRequest"));
const MyReturns = lazy(() => import("./pages/MyReturns"));
const Wishlist = lazy(() => import("./pages/Wishlist"));


// Admin pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProduct = lazy(() => import("./pages/AdminProduct"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminReturns = lazy(() => import("./pages/AdminReturns"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminFlashSales = lazy(() => import("./pages/AdminFlashSales"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));

// Promotion pages
const FlashSale = lazy(() => import("./pages/FlashSale"));

// User profile page
const UserProfile = lazy(() => import("./pages/UserProfile"));

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh'
  }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Đang tải...</span>
    </div>
  </div>
);


// Scroll position restore logic
function ScrollRestoration() {
  const location = useLocation();
  useEffect(() => {
    const key = 'scroll-pos:' + location.pathname + location.search;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const { x, y } = JSON.parse(saved);
      setTimeout(() => window.scrollTo(x, y), 0);
    }
    const onScroll = () => {
      sessionStorage.setItem(key, JSON.stringify({ x: window.scrollX, y: window.scrollY }));
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line
  }, [location.pathname, location.search]);
  return null;
}

function App() {
  // MiniCart state
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [cartData, setCartData] = useState({ items: [], count: 0, total: 0 });

  useEffect(() => {
    if (miniCartOpen) {
      axiosClient.get('/cart').then(res => {
        setCartData({
          items: res.data.items || [],
          count: (res.data.items || []).length,
          total: res.data.total || 0
        });
      });
    }
  }, [miniCartOpen]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      {/* ...không còn mini cart popup và nút mini cart... */}
      <div style={{ paddingTop: '145px' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
                                    {/* Thông tin cá nhân */}
                                    <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                        {/* Đơn hàng của tôi */}
                        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            {/* Trang chủ */}
            <Route path="/" element={<HomeSimple />} />
            {/* Sản phẩm */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:slug" element={<ProductsByCategory />} />
            <Route path="/products/category/:id" element={<ProductsByCategory />} />
            {/* Giỏ hàng */}
            <Route path="/cart" element={<Cart />} />
            {/* Voucher */}
            <Route path="/vouchers" element={<VoucherPage />} />
            {/* Wishlist */}
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            {/* Thanh toán */}
            <Route path="/payment/bank-transfer" element={<ProtectedRoute><BankTransfer /></ProtectedRoute>} />
            {/* Liên hệ */}
            <Route path="/contact" element={<ContactPage />} />
            {/* Chính sách đổi trả */}
            <Route path="/return-policy" element={<ReturnPolicy />} />
            {/* Yêu cầu đổi trả */}
            <Route path="/return-request/:orderId" element={<ProtectedRoute><ReturnRequest /></ProtectedRoute>} />
            {/* Danh sách yêu cầu đổi trả của tôi */}
            <Route path="/my-returns" element={<ProtectedRoute><MyReturns /></ProtectedRoute>} />
            {/* Xác thực */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProduct /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/returns" element={<AdminRoute><AdminReturns /></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
            <Route path="/admin/flashsales" element={<AdminRoute><AdminFlashSales /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
          </Routes>
        </Suspense>
      </div>
      <Chat />
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
