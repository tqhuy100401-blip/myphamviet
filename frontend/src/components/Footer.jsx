import { FaFacebookF, FaInstagram, FaTiktok, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaShieldAlt, FaTruck, FaUndo, FaCreditCard } from "react-icons/fa";
import { GiLipstick } from "react-icons/gi";
import { useState } from "react";

function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Cảm ơn bạn đã đăng ký! Email: ${email}`);
      setEmail("");
    }
  };

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: "#fff",
      marginTop: "80px",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      {/* Trust Badges Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '32px 0',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center'
          }}>
            {[
              { icon: FaShieldAlt, title: 'Chính hãng 100%', desc: 'Cam kết authentic' },
              { icon: FaTruck, title: 'Miễn phí vận chuyển', desc: 'Đơn hàng > 300K' },
              { icon: FaUndo, title: 'Đổi trả dễ dàng', desc: 'Trong vòng 7 ngày' },
              { icon: FaCreditCard, title: 'Thanh toán an toàn', desc: 'Bảo mật SSL' }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <item.icon size={28} />
                </div>
                <div>
                  <h6 style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{item.title}</h6>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container" style={{ padding: '60px 20px 40px', position: 'relative', zIndex: 1 }}>
        <div className="row g-4">
          {/* Cột 1: Thương hiệu & Newsletter */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <GiLipstick size={36} color="#f687b3" style={{ filter: 'drop-shadow(0 2px 8px rgba(246, 135, 179, 0.4))' }} />
              <h4 style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: '28px', letterSpacing: '-0.5px' }}>myphamViet</h4>
            </div>
            <p style={{ fontSize: "14px", lineHeight: 1.8, opacity: 0.85, marginBottom: '24px' }}>
              Cửa hàng mỹ phẩm chính hãng, uy tín hàng đầu Việt Nam. 
              Cam kết sản phẩm 100% authentic với giá tốt nhất.
            </p>

            {/* Newsletter */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: "12px", fontSize: '16px' }}>
                📬 Đăng ký nhận tin
              </h6>
              <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '12px' }}>
                Nhận thông tin ưu đãi & sản phẩm mới
              </p>
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                />
                <button type="submit" style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}>
                  Đăng ký
                </button>
              </form>
            </div>

            {/* Social Media */}
            <div style={{ marginTop: '24px' }}>
              <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: "12px", fontSize: '16px' }}>
                Kết nối với chúng tôi
              </h6>
              <div className="d-flex gap-2">
                {[
                  { Icon: FaFacebookF, color: '#1877f2', link: '#' },
                  { Icon: FaInstagram, color: '#e4405f', link: '#' },
                  { Icon: FaTiktok, color: '#000', link: '#' }
                ].map((social, i) => (
                  <a key={i} href={social.link} style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    transition: "all .3s",
                    textDecoration: "none",
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = social.color;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${social.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <social.Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div className="col-lg-2 col-md-6">
            <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: "20px", fontSize: '18px', position: 'relative', paddingBottom: '12px' }}>
              Liên kết
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '3px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '2px'
              }}></div>
            </h6>
            {[
              { text: "Trang chủ", link: "/" },
              { text: "Sản phẩm", link: "/products" },
              { text: "Flash Sale", link: "/flashsale" },
              { text: "Giỏ hàng", link: "/cart" },
              { text: "Yêu thích", link: "/wishlist" },
              { text: "Đơn hàng", link: "/my-orders" }
            ].map((item, i) => (
              <p key={i} style={{ margin: "10px 0", fontSize: "14px" }}>
                <a href={item.link} style={{
                  color: "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  transition: "all .3s",
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255,255,255,0.75)';
                  e.target.style.transform = 'translateX(0)';
                }}>
                  → {item.text}
                </a>
              </p>
            ))}
          </div>

          {/* Cột 3: Chính sách */}
          <div className="col-lg-3 col-md-6">
            <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: "20px", fontSize: '18px', position: 'relative', paddingBottom: '12px' }}>
              Chính sách
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '3px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '2px'
              }}></div>
            </h6>
            {[
              { text: "🔄 Chính sách đổi trả", link: "/return-policy" },
              { text: "📋 Yêu cầu đổi trả", link: "/my-returns" },
              { text: "🛡️ Chính sách bảo mật", link: "#" },
              { text: "📜 Điều khoản sử dụng", link: "#" },
              { text: "💳 Hướng dẫn thanh toán", link: "#" },
              { text: "📦 Chính sách vận chuyển", link: "#" }
            ].map((item, i) => (
              <p key={i} style={{ margin: "10px 0", fontSize: "14px" }}>
                <a href={item.link} style={{
                  color: "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  transition: "all .3s",
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255,255,255,0.75)';
                  e.target.style.transform = 'translateX(0)';
                }}>
                  {item.text}
                </a>
              </p>
            ))}
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="col-lg-3 col-md-6">
            <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: "20px", fontSize: '18px', position: 'relative', paddingBottom: '12px' }}>
              Liên hệ
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40px',
                height: '3px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '2px'
              }}></div>
            </h6>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {[
                { Icon: FaPhoneAlt, text: '0879079393', link: 'tel:0879079393' },
                { Icon: FaEnvelope, text: 'support@myphamviet.vn', link: 'mailto:support@myphamviet.vn' },
                { Icon: FaMapMarkerAlt, text: 'TP. Hồ Chí Minh, Việt Nam', link: '#' }
              ].map((item, i) => (
                <a key={i} href={item.link} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <item.Icon size={16} />
                  </div>
                  <span>{item.text}</span>
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div style={{ marginTop: '24px' }}>
              <h6 style={{ fontSize: '14px', marginBottom: '12px', opacity: 0.9 }}>Phương thức thanh toán</h6>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {['VISA', 'MOMO', 'VNP', 'COD'].map((method, i) => (
                  <div key={i} style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '24px 0',
        background: 'rgba(0, 0, 0, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <p style={{ fontSize: "13px", margin: 0, opacity: 0.75 }}>
              © 2026 myphamViet. All rights reserved. Made with ❤️ in Vietnam
            </p>
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', opacity: 0.75 }}>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Điều khoản</a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Bảo mật</a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
