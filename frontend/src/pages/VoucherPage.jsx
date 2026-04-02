import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { FiCopy, FiCheck, FiClock, FiPercent, FiDollarSign, FiTag } from "react-icons/fi";

const VoucherPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await axiosClient.get("/coupons/available");
      setVouchers(res.data?.coupons || res.data || []);
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      toast.error("Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã copy mã ${code}!`);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const selectVoucher = (code) => {
    // Lưu mã vào localStorage để Cart có thể lấy
    localStorage.setItem("selectedVoucher", code);
    toast.success(`Đã chọn mã ${code}! Quay lại giỏ hàng để áp dụng.`);
    setTimeout(() => {
      navigate("/cart");
    }, 1000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Đang tải voucher...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.05) } }
        .voucher-card { 
          transition: all .3s ease; 
          animation: slideUp .5s ease;
          cursor: pointer;
        }
        .voucher-card:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 12px 40px rgba(102,126,234,.3) !important; 
        }
        .voucher-badge {
          animation: pulse 2s infinite;
        }
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .gradient-green {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        }
        .gradient-orange {
          background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
        }
        .gradient-pink {
          background: linear-gradient(135deg, #ed64a6 0%, #d53f8c 100%);
        }
        .copy-btn {
          transition: all .2s ease;
        }
        .copy-btn:hover {
          transform: scale(1.1);
        }
      `}</style>

      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h2 style={{ fontWeight: 800, color: "#1a202c", margin: 0 }}>
              🎫 Kho Voucher
            </h2>
            <p className="text-muted mb-0">Chọn mã giảm giá phù hợp với đơn hàng của bạn</p>
          </div>
          <button 
            className="btn"
            onClick={() => navigate("/cart")}
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "#fff",
              borderRadius: "12px",
              padding: "10px 24px",
              fontWeight: 600,
              border: "none"
            }}
          >
            ← Quay lại giỏ hàng
          </button>
        </div>
      </div>

      {/* Vouchers Grid */}
      {vouchers.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎫</div>
          <h4 style={{ color: "#2d3748", fontWeight: 700 }}>Chưa có voucher nào</h4>
          <p className="text-muted">Hãy quay lại sau để nhận ưu đãi!</p>
        </div>
      ) : (
        <div className="row g-4">
          {vouchers.map((voucher, index) => {
            const gradients = ['gradient-bg', 'gradient-green', 'gradient-orange', 'gradient-pink'];
            const gradient = gradients[index % gradients.length];
            const isExpired = new Date(voucher.endDate) < new Date();
            const isNotStarted = new Date(voucher.startDate) > new Date();
            const isLimitReached = voucher.usageLimit && voucher.usedCount >= voucher.usageLimit;
            const isActive = !isExpired && !isNotStarted && !isLimitReached && voucher.isActive;

            return (
              <div key={voucher._id} className="col-md-6 col-lg-4">
                <div 
                  className="voucher-card card border-0 shadow-sm h-100"
                  style={{ 
                    borderRadius: "16px",
                    overflow: "hidden",
                    opacity: isActive ? 1 : 0.7
                  }}
                >
                  {/* Header */}
                  <div className={`${gradient} p-3 text-white position-relative`}>
                    {!isActive && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-danger">Hết hạn</span>
                      </div>
                    )}
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "1px" }}>
                          {voucher.code}
                        </div>
                        <div style={{ fontSize: "13px", opacity: 0.9 }}>
                          {voucher.type === "percentage" ? (
                            <><FiPercent size={12} /> Giảm {voucher.value}%</>
                          ) : (
                            <><FiDollarSign size={12} /> Giảm {voucher.value.toLocaleString("vi-VN")}đ</>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCode(voucher.code);
                        }}
                        className="copy-btn btn btn-light btn-sm"
                        style={{ borderRadius: "8px", padding: "6px 12px" }}
                      >
                        {copiedCode === voucher.code ? (
                          <FiCheck size={16} />
                        ) : (
                          <FiCopy size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="card-body p-3 d-flex flex-column">
                    <p className="mb-2" style={{ 
                      fontSize: "14px", 
                      color: "#4a5568", 
                      minHeight: "42px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {voucher.description}
                    </p>

                    {/* Điều kiện */}
                    <div className="mb-3" style={{ minHeight: "72px" }}>
                      <div style={{ fontSize: "13px", color: "#718096" }}>
                        {voucher.minOrderValue > 0 && (
                          <div className="mb-1">
                            📦 Đơn tối thiểu: <strong>{voucher.minOrderValue.toLocaleString("vi-VN")}đ</strong>
                          </div>
                        )}
                        {voucher.maxDiscount && (
                          <div className="mb-1">
                            🎯 Giảm tối đa: <strong>{voucher.maxDiscount.toLocaleString("vi-VN")}đ</strong>
                          </div>
                        )}
                        {voucher.usageLimit && (
                          <div className="mb-1">
                            👥 Còn lại: <strong>{voucher.usageLimit - voucher.usedCount} lượt</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thời gian */}
                    <div className="mb-3 p-2" style={{ 
                      background: "#f7fafc", 
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#718096"
                    }}>
                      <FiClock size={12} className="me-1" />
                      HSD: {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => isActive && selectVoucher(voucher.code)}
                      disabled={!isActive}
                      className="btn w-100 mt-auto"
                      style={{
                        background: isActive ? "linear-gradient(135deg, #667eea, #764ba2)" : "#e2e8f0",
                        color: isActive ? "#fff" : "#a0aec0",
                        border: "none",
                        borderRadius: "10px",
                        padding: "10px",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: isActive ? "pointer" : "not-allowed"
                      }}
                    >
                      {isActive ? "🎁 Chọn voucher này" : "Không khả dụng"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lưu ý */}
      <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: "16px" }}>
        <div className="card-body p-4">
          <h6 style={{ fontWeight: 700, color: "#1a202c", marginBottom: "12px" }}>
            📌 Lưu ý khi sử dụng voucher:
          </h6>
          <ul style={{ fontSize: "14px", color: "#4a5568", marginBottom: 0 }}>
            <li>Mỗi đơn hàng chỉ áp dụng được 1 mã voucher</li>
            <li>Voucher có giá trị trong thời gian quy định</li>
            <li>Kiểm tra điều kiện tối thiểu trước khi sử dụng</li>
            <li>Một số voucher có giới hạn số lượt sử dụng</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoucherPage;
