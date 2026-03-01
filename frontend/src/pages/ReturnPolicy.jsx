import React from "react";
import { FiPackage, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

function ReturnPolicy() {
  return (
    <div className="container mt-5 mb-5">
      <div style={{
        background: "linear-gradient(135deg, #f687b3 0%, #667eea 100%)",
        color: "#fff",
        borderRadius: 16,
        padding: "16px 24px",
        marginBottom: 24,
        fontWeight: 700,
        fontSize: 18,
        boxShadow: "0 2px 16px rgba(102,126,234,0.10)",
        display: "flex",
        alignItems: "center",
        gap: 12
      }}>
        <FiCheckCircle size={22} style={{marginRight: 8}} />
        Đổi trả dễ dàng trong 7 ngày – Hoàn tiền nhanh chóng nếu sản phẩm lỗi hoặc không đúng mô tả!
      </div>
      <style>{`
        .policy-header {
          background: linear-gradient(135deg, #667eea 0%, #f687b3 100%);
          color: #fff;
          border-radius: 20px;
          padding: 36px 28px 28px 28px;
          margin-bottom: 36px;
          box-shadow: 0 6px 32px rgba(102,126,234,0.13);
          animation: fadeInUp 0.7s cubic-bezier(.4,0,.2,1);
        }
        .policy-header h2 {
          font-weight: 900;
          font-size: 2.1rem;
          margin-bottom: 8px;
        }
        .policy-header p {
          font-size: 1.1rem;
          opacity: 0.96;
        }
        .policy-section {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 16px rgba(102,126,234,0.07);
          padding: 32px 28px;
          margin-bottom: 28px;
          border: 1.5px solid #f7e8f7;
          animation: fadeInUp 0.8s cubic-bezier(.4,0,.2,1) 0.1s both;
        }
        .policy-section h4 {
          color: #667eea;
          font-weight: 800;
          margin-bottom: 18px;
        }
        .policy-list li {
          margin-bottom: 14px;
          font-size: 1.08rem;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .policy-list li strong {
          color: #f687b3;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="policy-header mb-5">
        <div className="d-flex align-items-center gap-3 mb-2">
          <FiPackage size={36} />
          <h2 className="mb-0">Chính sách đổi trả</h2>
        </div>
        <p>Cosmetic Shop cam kết bảo vệ quyền lợi khách hàng với chính sách đổi trả minh bạch, nhanh chóng và thuận tiện.</p>
      </div>
      <div className="policy-section">
        <h4><FiCheckCircle color="#48bb78" /> Điều kiện đổi trả</h4>
        <ul className="policy-list">
          <li><strong>Thời gian đổi trả:</strong> Trong vòng <b>7 ngày</b> kể từ ngày nhận hàng.</li>
          <li>Sản phẩm còn nguyên tem, nhãn mác, chưa qua sử dụng.</li>
          <li>Hóa đơn mua hàng còn đầy đủ.</li>
          <li>Sản phẩm bị lỗi do nhà sản xuất, hư hỏng trong quá trình vận chuyển hoặc giao nhầm.</li>
        </ul>
      </div>
      <div className="policy-section">
        <h4><FiXCircle color="#f56565" /> Trường hợp không áp dụng đổi trả</h4>
        <ul className="policy-list">
          <li>Sản phẩm đã qua sử dụng, không còn nguyên vẹn ban đầu.</li>
          <li>Sản phẩm không phải do Cosmetic Shop cung cấp.</li>
          <li>Khách hàng đổi trả sau 7 ngày kể từ ngày nhận hàng.</li>
          <li>Lỗi phát sinh do người sử dụng không đúng hướng dẫn.</li>
        </ul>
      </div>
      <div className="policy-section">
        <h4><FiClock color="#667eea" /> Quy trình đổi trả</h4>
        <ul className="policy-list">
          <li>Liên hệ hotline <strong>0901 234 567</strong> hoặc email <strong>contact@cosmeticshop.vn</strong> để thông báo yêu cầu đổi trả.</li>
          <li>Gửi sản phẩm về địa chỉ shop: <strong>123 Đường Mỹ Phẩm, Quận 1, TP. Hồ Chí Minh</strong>.</li>
          <li>Shop kiểm tra sản phẩm và tiến hành đổi/trả hoặc hoàn tiền theo quy định.</li>
        </ul>
      </div>
    </div>
  );
}

export default ReturnPolicy;
