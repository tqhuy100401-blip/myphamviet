import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
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
const Order = lazy(() => import("./pages/Order"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const ProductsByCategory = lazy(() => import("./pages/ProductsByCategory"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProduct = lazy(() => import("./pages/AdminProduct"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminReturns = lazy(() => import("./pages/AdminReturns"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminFlashSales = lazy(() => import("./pages/AdminFlashSales"));

// Promotion pages
const FlashSale = lazy(() => import("./pages/FlashSale"));

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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={<HomeSimple />} />
          
          {/* Sản phẩm */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<ProductsByCategory />} />
          
          {/* Giỏ hàng */}
          <Route path="/cart" element={<Cart />} />
          
          {/* Flash Sale */}
          <Route path="/flash-sale" element={<FlashSale />} />
          
          {/* Đơn hàng */}
          <Route path="/order" element={
            <ProtectedRoute>
              <Order />
            </ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          
          {/* Liên hệ */}
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Xác thực */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* Admin */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <AdminProduct />
            </AdminRoute>
          } />
          <Route path="/admin/categories" element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="/admin/returns" element={
            <AdminRoute>
              <AdminReturns />
            </AdminRoute>
          } />
          <Route path="/admin/coupons" element={
            <AdminRoute>
              <AdminCoupons />
            </AdminRoute>
          } />
          <Route path="/admin/flashsales" element={
            <AdminRoute>
              <AdminFlashSales />
            </AdminRoute>
          } />
        </Routes>
      </Suspense>
      <Chat />
      <Footer />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
