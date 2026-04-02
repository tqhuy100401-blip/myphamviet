import MegaMenu from './MegaMenu';
import MiniCart from './MiniCart';
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./HeaderModern.css";
import { FiHome, FiShoppingBag, FiShoppingCart, FiLogIn, FiUser, FiUserPlus, FiFileText, FiSettings, FiLogOut, FiPackage, FiCheckCircle, FiSearch, FiPhoneCall, FiZap, FiCreditCard, FiHeart, FiMenu } from "react-icons/fi";
import { GiLipstick } from "react-icons/gi";
import { useState, useEffect } from "react";
import { getGuestCartCount } from "../utils/cartHelper";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

function Header() {
    const [miniCartOpen, setMiniCartOpen] = useState(false);
    const [cartData, setCartData] = useState({ items: [], count: 0, total: 0 });

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userName = localStorage.getItem("userName");
    const [guestCartCount, setGuestCartCount] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

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

    // Scroll detection for sticky header
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/products?search=${searchQuery}`);
        setSearchQuery("");
      }
    };

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

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Fetch cart data khi Header mount (componentDidMount)
    useEffect(() => {
      if (token) {
        axiosClient.get('/cart').then(res => {
          const items = res.data.items || [];
          const count = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
          setCartData({
            items,
            count,
            total: res.data.total || 0
          });
        });
      }
    }, [token]);

    // Fetch cart data khi mở MiniCart
    useEffect(() => {
      if (miniCartOpen && token) {
        axiosClient.get('/cart').then(res => {
          const items = res.data.items || [];
          const count = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
          setCartData({
            items,
            count,
            total: res.data.total || 0
          });
        });
      }
    }, [miniCartOpen, token]);

    return (
      <nav className={`header-modern ${isScrolled ? 'header-scrolled' : ''}`} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'none'
      }}>
        {/* Top Bar - Info Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          padding: '8px 0',
          fontSize: '13px',
          color: '#fff',
          fontWeight: 500,
          overflow: 'hidden',
          position: 'relative',
          height: isScrolled ? '0px' : '29px',
          opacity: isScrolled ? 0 : 1,
          transition: 'height 0.3s ease, opacity 0.3s ease'
        }}>
          {!isScrolled && (
            <>
              <style>{`
                @keyframes marquee {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .marquee-text {
                  display: inline-block;
                  white-space: nowrap;
                  animation: marquee 30s linear infinite;
                }
              `}</style>
              <div className="marquee-text">
                🎉 Miễn phí vận chuyển cho đơn hàng từ 300K | 🔥 Flash Sale mỗi ngày 9h-21h | ✨ Tích điểm đổi quà hấp dẫn | 🎉 Miễn phí vận chuyển cho đơn hàng từ 300K | 🔥 Flash Sale mỗi ngày 9h-21h | ✨ Tích điểm đổi quà hấp dẫn
              </div>
            </>
          )}
        </div>

        {/* Main Header */}
        <div style={{
          background: isScrolled 
            ? 'rgba(255, 255, 255, 0.98)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          boxShadow: isScrolled 
            ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'background 0.3s ease, box-shadow 0.3s ease'
        }}>
          <div className="header-container" style={{ 
            padding: isScrolled ? '10px 2vw' : '16px 2vw',
            transition: 'padding 0.3s ease'
          }}>
            {/* Logo */}
            <div className="logo-group">
              <Link className="logo-link" to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <GiLipstick size={isScrolled ? 28 : 36} color="#f687b3" style={{ 
                  filter: 'drop-shadow(0 2px 8px rgba(246, 135, 179, 0.3))',
                  transition: 'all 0.3s'
                }} />
                <span style={{
                  fontSize: isScrolled ? '22px' : '28px',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  transition: 'all 0.3s'
                }}>myphamViet</span>
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{
              flex: 1,
              maxWidth: '600px',
              position: 'relative'
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  style={{
                    width: '100%',
                    padding: '12px 80px 12px 20px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    background: '#fff'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button type="submit" style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  height: '36px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  Tìm
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Hotline */}
              <a href="tel:0879079393" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #48bb78, #38a169)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(72, 187, 120, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(72, 187, 120, 0.3)';
              }}>
                <FiPhoneCall size={16} />
                <span>0879079393</span>
              </a>

              {/* Wishlist */}
              <Link to="/wishlist" style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#fff',
                border: '2px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e53e3e',
                textDecoration: 'none',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#e53e3e';
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(229, 62, 62, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <FiHeart size={20} />
              </Link>

              {/* Mini Cart Button */}
              <button
                onClick={() => setMiniCartOpen(v => !v)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  border: 'none',
                  outline: 'none',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  cursor: 'pointer',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                }}
                aria-label="Mở giỏ hàng mini"
              >
                <FiShoppingCart size={28} color="#fff" style={{ display: 'block', margin: '0 auto' }} />
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: (token ? cartData.count : guestCartCount) > 0 ? '#ef4444' : '#e2e8f0',
                  color: (token ? cartData.count : guestCartCount) > 0 ? '#fff' : '#888',
                  borderRadius: '50%',
                  minWidth: 18,
                  height: 18,
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 2,
                  opacity: 1,
                  transition: 'all 0.2s',
                }}>{token ? cartData.count : guestCartCount}</span>
              </button>
              {miniCartOpen && (
                <MiniCart
                  cartItems={cartData.items}
                  cartCount={cartData.count}
                  cartTotal={cartData.total}
                  onClose={() => setMiniCartOpen(false)}
                  onRemoveItem={() => {}}
                  token={token}
                />
              )}

              {/* Login/Register or User Menu */}
              {!token ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to="/login" style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: '#fff',
                    border: '2px solid #667eea',
                    color: '#667eea',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#667eea';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#667eea';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <FiLogIn size={16} /> Đăng nhập
                  </Link>
                  <Link to="/register" style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                  }}>
                    <FiUserPlus size={16} /> Đăng ký
                  </Link>
                </div>
              ) : (
                <div className="dropdown">
                  <button style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                  }} 
                  className="dropdown-toggle" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                  }}>
                    <FiUser size={16} /> {userName || 'Tài khoản'}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown" style={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    padding: '8px',
                    marginTop: '8px'
                  }}>
                    <li><Link className="dropdown-item" to="/profile" style={{
                      borderRadius: '8px',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px'
                    }}><FiUser size={16} /> Thông tin cá nhân</Link></li>
                    <li><Link className="dropdown-item" to="/my-orders" style={{
                      borderRadius: '8px',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px'
                    }}><FiFileText size={16} /> Đơn hàng</Link></li>
                    <li><Link className="dropdown-item" to="/my-returns" style={{
                      borderRadius: '8px',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px'
                    }}><FiPackage size={16} /> Đổi trả</Link></li>
                    <li><Link className="dropdown-item" to="/return-policy" style={{
                      borderRadius: '8px',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px'
                    }}><FiCheckCircle size={16} /> Chính sách</Link></li>
                    {role === "admin" && (
                      <li><Link className="dropdown-item" to="/admin" style={{
                        borderRadius: '8px',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        color: '#f59e0b',
                        fontWeight: 700
                      }}><FiSettings size={16} /> Admin</Link></li>
                    )}
                    <li><hr className="dropdown-divider" style={{ margin: '8px 0' }} /></li>
                    <li><button className="dropdown-item" onClick={logout} style={{
                      borderRadius: '8px',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      color: '#ef4444',
                      fontWeight: 700,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      width: '100%'
                    }}><FiLogOut size={16} /> Đăng xuất</button></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Responsive Navigation Menu */}
        <style>{`
          @media (max-width: 767px) {
            .main-nav-desktop { display: none !important; }
            .main-nav-mobile { display: flex !important; }
          }
          @media (min-width: 768px) {
            .main-nav-desktop { display: flex !important; }
            .main-nav-mobile { display: none !important; }
          }
        `}</style>
        {/* Desktop menu */}
        <div className="main-nav-desktop" style={{ 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="header-container" style={{ padding: '0' }}>
            <div style={{ 
              display: 'flex', 
              gap: '0', 
              alignItems: 'center',
              height: '52px',
              overflow: 'auto'
            }}>
              {[
                { to: "/", icon: FiHome, text: "Trang chủ" },
                { to: "/products", icon: FiShoppingBag, text: "Sản phẩm" },
                { to: "/flash-sale", icon: FiZap, text: "🔥 Flash Sale", gradient: true },
                ...(role === "admin" ? [{ to: "/admin/categories", icon: FiPackage, text: "Danh mục" }] : []),
                { to: "/contact", icon: FiPhoneCall, text: "Liên hệ" },
                { to: "/cart", icon: FiShoppingCart, text: "Giỏ hàng" },
                ...(token ? [{ to: "/my-orders", icon: FiFileText, text: "Đơn hàng" }] : []),
                ...(role === "admin" ? [{ to: "/admin", icon: FiSettings, text: "Dashboard", admin: true }] : [])
              ].map((item, index) => {
                const isActive = location.pathname === item.to || 
                                 (item.to === '/flash-sale' && location.pathname === '/flash-sale') ||
                                 (item.to === '/products' && location.pathname.startsWith('/products'));
                return (
                  <Link 
                    key={index}
                    to={item.to} 
                    style={{
                      padding: '0 20px',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: isActive ? 700 : 600,
                      borderRight: '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.3s ease',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))'
                        : item.gradient 
                          ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                          : item.admin 
                            ? 'rgba(251, 191, 36, 0.15)' 
                            : 'transparent',
                      whiteSpace: 'nowrap',
                      borderBottom: isActive ? '4px solid #fbbf24' : '4px solid transparent',
                      boxShadow: isActive ? '0 -2px 15px rgba(251, 191, 36, 0.3), inset 0 0 30px rgba(255,255,255,0.15)' : 'none',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)'
                    }} 
                    onMouseEnter={(e) => {
                      if (item.gradient) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)';
                      } else if (item.admin) {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.25)';
                      } else if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }
                      if (!isActive) e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      if (isActive) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      } else if (item.gradient) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
                        e.currentTarget.style.transform = 'scale(1)';
                      } else if (item.admin) {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)';
                        e.currentTarget.style.transform = 'scale(1)';
                      } else {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}>
                    <item.icon size={16} />
                    <span>{item.text}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <div className="main-nav-mobile" style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'none',
          position: 'relative'
        }}>
          <button onClick={() => setMobileMenuOpen(v => !v)} style={{
            background: 'none', border: 'none', color: '#fff', fontSize: 24, padding: 12, marginLeft: 4, cursor: 'pointer'
          }}>
            <FiMenu />
          </button>
          <div style={{ flex: 1 }} />
          <Link to="/" style={{ color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', padding: '0 12px' }}>
            <FiHome style={{ marginRight: 4 }} /> Trang chủ
          </Link>
          <div style={{ flex: 1 }} />
          {/* Overlay menu */}
          {/* Overlay menu */}
          {mobileMenuOpen && (
            <div
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', zIndex: 1999,
                pointerEvents: 'auto'
              }}
              onClick={e => {
                // Chỉ đóng menu nếu click vào overlay, không phải vào menu
                if (e.target === e.currentTarget) setMobileMenuOpen(false);
              }}
            />
          )}
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: mobileMenuOpen ? 'block' : 'none',
            animation: 'fadeInDown 0.2s',
            borderRadius: '0 0 16px 16px',
            overflow: 'hidden',
            zIndex: 2000,
            pointerEvents: 'auto'
          }}>
            {[
              { to: "/products", icon: FiShoppingBag, text: "Sản phẩm" },
              { to: "/flash-sale", icon: FiZap, text: "🔥 Flash Sale", gradient: true },
              ...(role === "admin" ? [{ to: "/admin/categories", icon: FiPackage, text: "Danh mục" }] : []),
              { to: "/contact", icon: FiPhoneCall, text: "Liên hệ" },
              { to: "/cart", icon: FiShoppingCart, text: "Giỏ hàng" },
              ...(token ? [{ to: "/my-orders", icon: FiFileText, text: "Đơn hàng" }] : []),
              ...(role === "admin" ? [{ to: "/admin", icon: FiSettings, text: "Dashboard", admin: true }] : [])
            ].map((item, index) => (
              <Link
                key={index}
                to={item.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, color: '#fff',
                  padding: '16px 20px', fontSize: 15, fontWeight: 600, textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.08)', background: item.gradient ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.text}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Mega menu dưới header */}
        <MegaMenu />
      </nav>
    );
}

export default Header;
