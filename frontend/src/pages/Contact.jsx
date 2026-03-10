
import { FiPhone, FiMail, FiMapPin, FiClock, FiInstagram, FiFacebook, FiSend } from "react-icons/fi";
import { GiLipstick } from "react-icons/gi";

function Contact() {
  return (
    <div className="container mt-5 mb-5">
      <style>{`
        .contact-hero {
          background: linear-gradient(135deg, #f687b3 0%, #667eea 100%);
          border-radius: 24px;
          color: #fff;
          padding: 40px 32px 32px 32px;
          margin-bottom: 40px;
          box-shadow: 0 8px 32px rgba(102,126,234,0.15);
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.7s cubic-bezier(.4,0,.2,1);
        }
        .contact-hero::before {
          content: "";
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%);
          border-radius: 50%;
        }
        .contact-hero h2 {
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }
        .contact-hero p {
          font-size: 1.1rem;
          opacity: 0.95;
        }
        .contact-info-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(102,126,234,0.10);
          padding: 32px 28px;
          margin-bottom: 32px;
          border: 1.5px solid #f7e8f7;
          animation: fadeInUp 0.8s cubic-bezier(.4,0,.2,1) 0.1s both;
        }
        .contact-info-list li {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 1.08rem;
          margin-bottom: 18px;
          color: #4a5568;
        }
        .contact-info-list li strong {
          min-width: 90px;
          color: #1a202c;
        }
        .contact-action-btns {
          display: flex;
          gap: 16px;
          margin-top: 18px;
        }
        .contact-action-btns a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #667eea, #f687b3);
          color: #fff;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          padding: 12px 22px;
          font-size: 1rem;
          box-shadow: 0 2px 10px rgba(102,126,234,0.13);
          text-decoration: none;
          transition: all .2s;
        }
        .contact-action-btns a:hover {
          background: linear-gradient(135deg, #f687b3, #667eea);
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 24px rgba(246,135,179,0.18);
        }
        .contact-socials {
          margin-top: 18px;
          display: flex;
          gap: 18px;
        }
        .contact-socials a {
          color: #f687b3;
          font-size: 1.5rem;
          transition: color .2s;
        }
        .contact-socials a:hover {
          color: #667eea;
        }
        .contact-map-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(102,126,234,0.10);
          padding: 0;
          overflow: hidden;
          border: 1.5px solid #f7e8f7;
          animation: fadeInUp 0.8s cubic-bezier(.4,0,.2,1) 0.2s both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="contact-hero mb-5">
        <div className="d-flex align-items-center gap-3 mb-2">
          <GiLipstick size={38} style={{ filter: "drop-shadow(0 2px 8px #fff6)" }} />
          <h2 className="mb-0">Liên hệ với chúng tôi</h2>
        </div>
        <p>Đội ngũ <b>Cosmetic Shop</b> luôn sẵn sàng hỗ trợ bạn! Hãy liên hệ với chúng tôi qua các kênh bên dưới hoặc ghé thăm cửa hàng để được tư vấn trực tiếp.</p>
      </div>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="contact-info-card">
            <h4 className="mb-4" style={{ fontWeight: 800, color: "#f687b3" }}>Thông tin cửa hàng</h4>
            <ul className="list-unstyled contact-info-list mb-0">
              <li><FiMapPin color="#667eea" size={20} /><strong>Địa chỉ:</strong> 123 Đường Mỹ Phẩm, Quận 1, TP. Hồ Chí Minh</li>
              <li><FiPhone color="#667eea" size={20} /><strong>Điện thoại:</strong> <a href="tel:0901234567" style={{ color: "#f687b3", textDecoration: "none" }}>0901 234 567</a></li>
              <li><FiMail color="#667eea" size={20} /><strong>Email:</strong> <a href="mailto:contact@cosmeticshop.vn" style={{ color: "#f687b3", textDecoration: "none" }}>contact@cosmeticshop.vn</a></li>
              <li><FiClock color="#667eea" size={20} /><strong>Giờ mở cửa:</strong> 8:00 - 21:00 (T2 - CN)</li>
            </ul>
            <div className="contact-action-btns">
              <a href="tel:0901234567"><FiPhone /> Gọi ngay</a>
              <a href="mailto:contact@cosmeticshop.vn"><FiSend /> Gửi email</a>
            </div>
            <div className="contact-socials">
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer"><FiFacebook /></a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer"><FiInstagram /></a>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="contact-map-card">
            <iframe
              title="Bản đồ Cosmetic Shop"
              src="https://www.google.com/maps?q=10.7769,106.7009&z=15&output=embed"
              width="100%"
              height="400"
              style={{ border: 0, minHeight: 300 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
