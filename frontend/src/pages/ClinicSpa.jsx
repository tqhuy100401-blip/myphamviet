import React from "react";

export default function ClinicSpa() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">🧖‍♀️ Clinic & Spa</h2>
      <p className="mb-4">
        Dịch vụ Clinic & Spa tại Cosmetic Shop mang đến trải nghiệm làm đẹp
        chuyên nghiệp, an toàn và hiệu quả. Đội ngũ chuyên viên giàu kinh nghiệm,
        trang thiết bị hiện đại, liệu trình đa dạng phù hợp từng loại da.
      </p>
      <ul className="list-group mb-4">
        <li className="list-group-item">
          <strong>🌸 Chăm sóc da chuyên sâu</strong>
          <br />
          Làm sạch, tẩy tế bào chết, cấp ẩm, phục hồi da bằng công nghệ tiên tiến.
        </li>
        <li className="list-group-item">
          <strong>💆 Trị liệu thư giãn</strong>
          <br />
          Massage mặt, cổ, vai gáy giúp giảm stress, tăng tuần hoàn máu, trẻ hóa
          làn da.
        </li>
        <li className="list-group-item">
          <strong>🧴 Điều trị mụn, nám, tàn nhang</strong>
          <br />
          Sử dụng sản phẩm dược mỹ phẩm chính hãng, phác đồ cá nhân hóa cho từng
          khách hàng.
        </li>
        <li className="list-group-item">
          <strong>🩺 Tư vấn da miễn phí</strong>
          <br />
          Được chuyên gia soi da, tư vấn liệu trình và sản phẩm phù hợp hoàn toàn
          miễn phí.
        </li>
      </ul>
      <div
        className="alert alert-primary"
        style={{ fontSize: 15 }}
      >
        <strong>Đặt lịch ngay:</strong> Gọi hotline{" "}
        <a href="tel:0123456789">0123 456 789</a> hoặc đến trực tiếp các chi
        nhánh để được phục vụ tốt nhất!
      </div>
    </div>
  );
}