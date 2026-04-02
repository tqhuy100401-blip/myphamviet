import { Link } from "react-router-dom";
import { FiShoppingCart, FiX } from "react-icons/fi";
import { getImageUrl } from "../utils/helpers";

function MiniCart({ cartItems, cartCount, cartTotal, onClose, onRemoveItem }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "100px",
          right: "20px",
          width: "380px",
          maxHeight: "500px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "2px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            borderRadius: "14px 14px 0 0",
            position: "relative",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FiShoppingCart size={18} /> Giỏ hàng của bạn ({cartCount})
          </h3>
        </div>

        {/* Close Button Overlay tuyệt đối ngoài header */}
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 90,
            right: 10,
            width: 44,
            height: 44,
            background: "#e53e3e",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 99999,
            boxShadow: "0 2px 8px rgba(229,62,62,0.18)",
            border: "2px solid #f0f0f0", // đổi border đỏ thành xám nhạt
          }}
          aria-label="Đóng giỏ hàng"
        >
          <FiX size={28} color="#fff" style={{ pointerEvents: 'none' }} />
        </div>

        {/* Cart Items */}
        {cartItems && cartItems.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "#888",
              fontSize: "16px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛒</div>
            <div>Giỏ hàng của bạn đang trống.</div>
          </div>
        ) : (
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              padding: "16px",
            }}
          >
            {cartItems && cartItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px",
                  marginBottom: "12px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  transition: "all 0.2s",
                  border: "1px solid #e2e8f0",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#f0f1ff";
                  e.currentTarget.style.borderColor = "#667eea";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#f8f9fa";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <img
                  src={getImageUrl(item.product?.image || item.image) || "https://via.placeholder.com/80"}
                  alt={item.product?.name || item.name}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#2d3748",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.product?.name || item.name}
                  </h4>
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "12px",
                      color: "#667eea",
                      fontWeight: 700,
                    }}
                  >
                    {Number(item.price || item.product?.price || 0).toLocaleString("vi-VN")}đ × {item.quantity}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#e53e3e",
                      fontWeight: 700,
                    }}
                  >
                    {Number((item.price || item.product?.price || 0) * item.quantity).toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: "20px",
            borderTop: "2px solid #f0f0f0",
            background: "#fafbff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{ fontSize: "15px", fontWeight: 600, color: "#4a5568" }}
            >
              Tổng cộng:
            </span>
            <span
              style={{ fontSize: "20px", fontWeight: 800, color: "#667eea" }}
            >
              {Number(cartItems && cartItems.reduce((sum, item) => sum + ((item.price || item.product?.price || 0) * item.quantity), 0)).toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              to="/cart"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                background: "#fff",
                border: "2px solid #667eea",
                color: "#667eea",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 700,
                textAlign: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#f0f1ff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#fff";
              }}
            >
              Xem giỏ hàng
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 700,
                textAlign: "center",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(102,126,234,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(102,126,234,0.3)";
              }}
            >
              Thanh toán
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default MiniCart;
