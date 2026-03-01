import { FaFacebookF, FaInstagram, FaTiktok, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { GiLipstick } from "react-icons/gi";

function Footer() {
  return (
    <footer style={{
      background: "#1c7430",
      color: "#fff", padding: "40px 0 20px", marginTop: "60px"
    }}>
      <div className="container">
        <div className="row g-4">
          {/* Cột 1: Thương hiệu */}
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <GiLipstick size={28} color="#fff" />
              <h5 style={{ margin: 0, color: "#fff", fontWeight: 700 }}>myphamViet</h5>
            </div>
            <p style={{ fontSize: "13px", lineHeight: 1.7, opacity: 0.9 }}>
              Cửa hàng mỹ phẩm chính hãng, uy tín hàng đầu Việt Nam.
              Cam kết sản phẩm 100% authentic.
            </p>
            <div className="d-flex gap-2 mt-3">
              {[FaFacebookF, FaInstagram, FaTiktok].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: "36px", height: "36px", borderRadius: "6px",
                  background: "rgba(255,255,255,0.15)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "#fff", transition: "all .2s", textDecoration: "none"
                }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Cột 2: Liên kết */}
          <div className="col-md-4">
            <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: "16px" }}>Liên kết nhanh</h6>
            {["Trang chủ", "Sản phẩm", "Giỏ hàng", "Đơn hàng của tôi"].map((item, i) => (
              <p key={i} style={{ margin: "8px 0", fontSize: "13px" }}>
                <a href={["/", "/products", "/cart", "/my-orders"][i]} style={{
                  color: "rgba(255,255,255,0.8)", textDecoration: "none", transition: "color .2s"
                }}>{item}</a>
              </p>
            ))}
          </div>

          {/* Cột 3: Liên hệ */}
          <div className="col-md-4">
            <h6 style={{ color: "#fff", fontWeight: 700, marginBottom: "16px" }}>Liên hệ</h6>
            <p className="d-flex align-items-center gap-2" style={{ fontSize: "13px", margin: "8px 0", opacity: 0.9 }}>
              <FaPhoneAlt size={13} /> 0123 456 789
            </p>
            <p className="d-flex align-items-center gap-2" style={{ fontSize: "13px", margin: "8px 0", opacity: 0.9 }}>
              <FaEnvelope size={13} /> support@myphamviet.vn
            </p>
            <p className="d-flex align-items-center gap-2" style={{ fontSize: "13px", margin: "8px 0", opacity: 0.9 }}>
              <FaMapMarkerAlt size={13} /> TP. Hồ Chí Minh, Việt Nam
            </p>
          </div>
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,0.2)", margin: "24px 0 16px" }} />
        <p className="text-center" style={{ fontSize: "12px", margin: 0, opacity: 0.8 }}>
          © 2026 myphamViet. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
