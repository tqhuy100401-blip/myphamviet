
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingCart, FiPhoneCall, FiClipboard, FiLogIn, FiLogOut } from "react-icons/fi";
import "./MenuBarHasaki.css";
import { getGuestCartCount } from "../utils/cartHelper";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

const menuItems = [
  { name: "Trang chủ", slug: "", path: "/" },
  { name: "Danh mục", slug: "", path: "/products" },
  { name: "Thương hiệu", slug: "", path: "/brands" },
  { name: "Khuyến mãi", slug: "", path: "/promotions" },
  { name: "Hot Deals", slug: "", path: "/hot-deals" },
  { name: "Bán chạy", slug: "", path: "/best-sellers" },
  { name: "Clinic & Spa", slug: "", path: "/clinic-spa" },
  { name: "Cửa hàng", slug: "", path: "/stores" },
  { name: "Liên hệ", slug: "", path: "/contact-page" },
];

const MenuBarHasaki = () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("role");
  const [guestCartCount, setGuestCartCount] = useState(0);
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const { data: myOrdersCount = 0 } = useQuery({
    queryKey: ["my-orders-count"],
    queryFn: () => axiosClient.get("/orders/my-orders/count").then(res => res.data.count),
    enabled: !!token,
    refetchInterval: 15000
  });

  useEffect(() => {
    if (!token) {
      const updateCartCount = () => setGuestCartCount(getGuestCartCount());
      updateCartCount();
      window.addEventListener("storage", updateCartCount);
      return () => window.removeEventListener("storage", updateCartCount);
    }
  }, [token]);

  function handleSearch(e) {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue)}`);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  }

  return (
    <div className="menu-bar-hasaki">
      <div className="menu-bar-container">
        <div className="menu-bar-left">
          <Link to="/" className="menu-logo-link">
            <img src="/logo192.png" alt="logo" className="menu-logo" />
            <span className="logo-text">myphamViet</span>
          </Link>
        </div>
        <ul className="menu-bar-list">
          {menuItems.map(item => (
            <li key={item.name} className="menu-bar-item">
              <Link to={item.path}>{item.name}</Link>
            </li>
          ))}
        </ul>
        <form className="menu-bar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm sản phẩm, thương hiệu..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            style={{ fontWeight: 500, fontSize: '1.08rem' }}
          />
          <button type="submit"><FiClipboard size={20} /></button>
        </form>
        <div className="menu-bar-icons">
          {!token ? (
            <Link to="/login" className="menu-bar-icon"><FiLogIn size={22} /></Link>
          ) : (
            <div className="menu-bar-icon user-dropdown">
              <span style={{ color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1.08rem', padding: '6px 0' }}>
                <FiUser size={20} style={{ marginRight: 6 }} /> {userName || "Tài khoản"}
              </span>
              <div className="user-dropdown-menu">
                <Link to="/my-orders" className="dropdown-item"><FiClipboard size={16} /> Đơn hàng</Link>
                <Link to="/my-returns" className="dropdown-item"><FiClipboard size={16} /> Đổi trả</Link>
                <Link to="/return-policy" className="dropdown-item"><FiClipboard size={16} /> Chính sách đổi trả</Link>
                {role === "admin" && <Link to="/admin" className="dropdown-item"><FiClipboard size={16} /> Admin</Link>}
                <button className="dropdown-item" onClick={logout}><FiLogOut size={16} /> Đăng xuất</button>
              </div>
            </div>
          )}
          <a href="tel:0123456789" className="menu-bar-icon"><FiPhoneCall size={22} /></a>
          <Link to="/cart" className="menu-bar-icon cart-icon">
            <FiShoppingCart size={22} />
            {!token && guestCartCount > 0 && <span className="cart-badge">{guestCartCount}</span>}
            {token && myOrdersCount > 0 && <span className="cart-badge order-badge">{myOrdersCount}</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MenuBarHasaki;
// Đã xóa file này để khôi phục giao diện ban đầu
