import React from "react";

export default function Promotions() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">🔥 Khuyến mãi</h2>
      <p className="mb-4">
        Khám phá các chương trình khuyến mãi hấp dẫn tại Cosmetic Shop! Chúng tôi
        thường xuyên cập nhật các ưu đãi đặc biệt, giảm giá sốc, tặng quà và voucher
        cho khách hàng thân thiết.
      </p>
      <ul className="list-group mb-4">
        <li className="list-group-item">
          <strong>🎁 Tặng quà cho đơn hàng từ 500.000đ</strong>
          <br />
          Khi mua sắm với hóa đơn từ 500.000đ, bạn sẽ nhận ngay một phần quà mỹ phẩm
          mini cao cấp.
        </li>
        <li className="list-group-item">
          <strong>💸 Giảm giá 10% cho khách hàng mới</strong>
          <br />
          Đăng ký tài khoản mới và nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên.
        </li>
        <li className="list-group-item">
          <strong>🛒 Mua 2 tặng 1</strong>
          <br />
          Áp dụng cho các sản phẩm mặt nạ, son môi, sữa rửa mặt thuộc thương hiệu
          Innisfree, Maybelline, L'Oreal.
        </li>
        <li className="list-group-item">
          <strong>⏰ Flash Sale mỗi ngày</strong>
          <br />
          Nhiều sản phẩm giảm giá sâu chỉ trong khung giờ vàng 12h-14h và 20h-22h
          mỗi ngày.
        </li>
      </ul>
      <div
        className="alert alert-success"
        style={{ fontSize: 15 }}
      >
        <strong>Lưu ý:</strong> Các chương trình khuyến mãi có thể thay đổi theo
        từng thời điểm. Hãy theo dõi website và fanpage để không bỏ lỡ ưu đãi mới
        nhất!
      </div>
    </div>
  );
}