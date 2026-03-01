import React from "react";

export default function BestSellers() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">⭐ Sản phẩm bán chạy</h2>
      <p className="mb-4">
        Khám phá top các sản phẩm bán chạy nhất tại Cosmetic Shop! Được khách hàng
        tin dùng, đánh giá cao về chất lượng và hiệu quả.
      </p>
      <ul className="list-group mb-4">
        <li className="list-group-item">
          <strong>💄 Son môi Maybelline SuperStay</strong>
          <br />
          Lên màu chuẩn, bền màu suốt 16h, không lem trôi, bảng màu đa dạng.
        </li>
        <li className="list-group-item">
          <strong>🧴 Kem chống nắng La Roche-Posay</strong>
          <br />
          Bảo vệ da tối ưu, không gây bết dính, phù hợp mọi loại da, được bác sĩ da
          liễu khuyên dùng.
        </li>
        <li className="list-group-item">
          <strong>🌿 Sữa rửa mặt Innisfree Green Tea</strong>
          <br />
          Làm sạch sâu, dịu nhẹ, chiết xuất trà xanh tự nhiên, phù hợp da nhạy cảm.
        </li>
        <li className="list-group-item">
          <strong>💧 Serum dưỡng ẩm Vichy Mineral 89</strong>
          <br />
          Cấp nước tức thì, phục hồi da, tăng sức đề kháng cho da yếu.
        </li>
      </ul>
      <div
        className="alert alert-info"
        style={{ fontSize: 15 }}
      >
        <strong>Lưu ý:</strong> Danh sách sản phẩm bán chạy được cập nhật liên tục
        theo doanh số và đánh giá thực tế từ khách hàng.
      </div>
    </div>
  );
}