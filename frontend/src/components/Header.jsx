import MegaMenu from './MegaMenu';
import { Link, useNavigate } from "react-router-dom";
import "./HeaderModern.css";
import { FiHome, FiShoppingBag, FiShoppingCart, FiLogIn, FiUser, FiUserPlus, FiFileText, FiSettings, FiLogOut, FiPackage, FiCheckCircle, FiSearch, FiPhoneCall, FiZap, FiCreditCard } from "react-icons/fi";
import { GiLipstick } from "react-icons/gi";
import { useState, useEffect } from "react";
import { getGuestCartCount } from "../utils/cartHelper";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

function Header() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");
  const [guestCartCount, setGuestCartCount] = useState(0);
  const navigate = useNavigate();

  const { data: myOrdersCount = 0 } = useQuery({
    queryKey: ["my-orders-count"],
    queryFn: () => axiosClient.get("/orders/my-orders/count").then(res => res.data.count),
    enabled: !!token,
    refetchInterval: 15000
  });

  // Update guest cart count
  useEffect(() => {
    if (!token) {
      // Đảm bảo chỉ cập nhật khi component mount hoặc storage thay đổi
      const updateCartCount = () => setGuestCartCount(getGuestCartCount());
      updateCartCount();
      window.addEventListener("storage", updateCartCount);
      return () => window.removeEventListener("storage", updateCartCount);
    }
  }, [token]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  }

  // Danh mục mẫu, bạn có thể lấy từ API hoặc file tĩnh
  const categories = [
    { name: "Trang điểm", slug: "trang-diem" },
    { name: "Chăm sóc da", slug: "cham-soc-da" },
    { name: "Chăm sóc tóc", slug: "cham-soc-toc" },
    { name: "Nước hoa", slug: "nuoc-hoa" },
    { name: "Dụng cụ làm đẹp", slug: "dung-cu" },
  ];

  return (
    <nav className="header-modern position-relative">
      <div className="header-container">
        {/* Logo & slogan */}
        <div className="logo-group">
          <Link className="logo-link" to="/">
            <GiLipstick size={32} color="#f687b3" className="logo-icon" />
            <span className="logo-text">myphamViet</span>
          </Link>
        </div>
        {/* Giỏ hàng */}
        <Link to="/cart" className="cart-link">
          <span className="cart-icon"><FiShoppingCart size={28} /></span>
          {!token && guestCartCount > 0 && (
            <span className="cart-badge">{guestCartCount}</span>
          )}
          {token && myOrdersCount > 0 && (
            <span className="cart-badge order-badge">{myOrdersCount}</span>
          )}
        </Link>

        {/* Thanh tìm kiếm lớn */}
        <form className="search-form" onSubmit={e => { e.preventDefault(); navigate(`/products?search=${e.target.search.value}`); }}>
          <input
            type="text"
            name="search"
            className="search-input"
            placeholder="Tìm sản phẩm, thương hiệu..."
          />
          <button type="submit" className="search-btn">
            <FiSearch size={18} />
          </button>
        </form>

        {/* Hotline & tài khoản */}
        <div className="account-group">
          <a href="tel:0123456789" className="hotline-link">
            <FiPhoneCall size={18} /> 0123 456 789
          </a>
          {!token ? (
            <>
              <Link className="login-btn" to="/login">
                <FiLogIn size={16} /> Đăng nhập
              </Link>
              <Link className="register-btn" to="/register">
                <FiUserPlus size={16} /> Đăng ký
              </Link>
            </>
          ) : (
            <div className="dropdown">
              <span className="user-btn dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <FiUser size={16} /> {userName || 'Tài khoản'}
              </span>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><Link className="dropdown-item" to="/my-orders"><FiFileText size={13} /> Đơn hàng</Link></li>
                <li><Link className="dropdown-item" to="/my-returns"><FiPackage size={13} /> Đổi trả</Link></li>
                <li><Link className="dropdown-item" to="/return-policy"><FiCheckCircle size={13} /> Chính sách đổi trả</Link></li>
                {role === "admin" && <li><Link className="dropdown-item text-warning fw-bold" to="/admin"><FiSettings size={13} /> Admin</Link></li>}
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item" onClick={logout} style={{ color: "#F56565", fontWeight: 600 }}><FiLogOut size={13} /> Đăng xuất</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Menu điều hướng chính */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1c7430 0%, #26a641 100%)', 
        borderTop: '1px solid rgba(255,255,255,0.1)' 
      }}>
        <div className="header-container" style={{ padding: '0' }}>
          <div style={{ 
            display: 'flex', 
            gap: '0', 
            alignItems: 'center',
            height: '48px'
          }}>
            <Link to="/" style={{
              padding: '0 24px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              borderRight: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
               onMouseLeave={e => e.target.style.background = 'transparent'}>
              <FiHome size={16} style={{ marginRight: '6px' }} /> Trang chủ
            </Link>
            <Link to="/products" style={{
              padding: '0 24px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              borderRight: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
               onMouseLeave={e => e.target.style.background = 'transparent'}>
              <FiShoppingBag size={16} style={{ marginRight: '6px' }} /> Sản phẩm
            </Link>
            <Link to="/flash-sale" style={{
              padding: '0 24px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              borderRight: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(90deg, #ff6b6b 0%, #ff8e53 100%)'
            }} onMouseEnter={e => e.target.style.background = 'linear-gradient(90deg, #ff5252 0%, #ff7043 100%)'}
               onMouseLeave={e => e.target.style.background = 'linear-gradient(90deg, #ff6b6b 0%, #ff8e53 100%)'}>
              <FiZap size={16} style={{ marginRight: '6px' }} /> 🔥 Flash Sale
            </Link>
            {role === "admin" && (
              <Link to="/admin/categories" style={{
                padding: '0 24px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                borderRight: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                 onMouseLeave={e => e.target.style.background = 'transparent'}>
                <FiPackage size={16} style={{ marginRight: '6px' }} /> Danh mục
              </Link>
            )}
            <Link to="/contact" style={{
              padding: '0 24px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              borderRight: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
               onMouseLeave={e => e.target.style.background = 'transparent'}>
              <FiPhoneCall size={16} style={{ marginRight: '6px' }} /> Liên hệ
            </Link>
            <Link to="/cart" style={{
              padding: '0 24px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              borderRight: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
               onMouseLeave={e => e.target.style.background = 'transparent'}>
              <FiShoppingCart size={16} style={{ marginRight: '6px' }} /> Giỏ hàng
            </Link>
            <Link to="/order" style={{
              padding: '0 24px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              borderRight: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
               onMouseLeave={e => e.target.style.background = 'transparent'}>
              <FiCreditCard size={16} style={{ marginRight: '6px' }} /> Thanh toán
            </Link>
            {token && (
              <Link to="/my-orders" style={{
                padding: '0 24px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                borderRight: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                 onMouseLeave={e => e.target.style.background = 'transparent'}>
                <FiFileText size={16} style={{ marginRight: '6px' }} /> Lịch sử mua hàng
              </Link>
            )}
            {role === "admin" && (
              <Link to="/admin" style={{
                padding: '0 24px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                background: 'rgba(255,204,0,0.2)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={e => e.target.style.background = 'rgba(255,204,0,0.3)'}
                 onMouseLeave={e => e.target.style.background = 'rgba(255,204,0,0.2)'}>
                <FiSettings size={16} style={{ marginRight: '6px' }} /> Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Mega menu dưới header */}
      <MegaMenu />
    </nav>
  );
}

// ...existing code...
export default Header;
