import React from "react";

export default function HotDeals() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">⚡ Hot Deals</h2>
      <p className="mb-4">
        Tổng hợp các deal sốc, giảm giá cực mạnh chỉ có tại Cosmetic Shop! Săn sale
        nhanh tay, số lượng có hạn, giá tốt nhất thị trường.
      </p>
      <ul className="list-group mb-4">
        <li className="list-group-item">
          <strong>🔥 Deal sốc 50%++</strong>
          <br />
          Hàng trăm sản phẩm mỹ phẩm, skincare, makeup giảm giá lên đến 50%++ trong
          tuần lễ vàng.
        </li>
        <li className="list-group-item">
          <strong>⏳ Deal chớp nhoáng</strong>
          <br />
          Sản phẩm giá sốc chỉ mở bán trong 2 giờ/ngày, cập nhật liên tục mỗi ngày.
        </li>
        <li className="list-group-item">
          <strong>💥 Combo tiết kiệm</strong>
          <br />
          Mua combo 3 sản phẩm bất kỳ giảm thêm 15% so với giá lẻ.
        </li>
        <li className="list-group-item">
          <strong>🎫 Voucher tích lũy</strong>
          <br />
          Tích điểm đổi voucher giảm giá, áp dụng cho tất cả sản phẩm trong Hot
          Deals.
        </li>
      </ul>
      <div
        className="alert alert-warning"
        style={{ fontSize: 15 }}
      >
        <strong>Lưu ý:</strong> Số lượng deal có hạn, ưu tiên khách đặt sớm. Giá chỉ
        áp dụng online hoặc tại cửa hàng trong thời gian diễn ra chương trình.
      </div>
    </div>
  );
}