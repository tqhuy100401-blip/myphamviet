import React from "react";

export default function ContactPage() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">📞 Liên hệ</h2>
      <div className="row g-4">
        <div className="col-md-6">
          <h5 className="mb-3">Địa chỉ cửa hàng</h5>
          <ul className="list-unstyled mb-3">
            <li>
              <strong>Cosmetic Shop - Chi nhánh 1:</strong> 123 Nguyễn Trãi, Quận 1,
              TP.HCM
            </li>
            <li>
              <strong>Cosmetic Shop - Chi nhánh 2:</strong> 456 Lê Văn Sỹ, Quận 3,
              TP.HCM
            </li>
            <li>
              <strong>Cosmetic Shop - Chi nhánh 3:</strong> 789 Cách Mạng Tháng 8,
              Quận 10, TP.HCM
            </li>
          </ul>
          <div className="mb-3">
            <strong>Hotline:</strong>{" "}
            <a href="tel:0123456789">0123 456 789</a>
            <br />
            <strong>Email:</strong>{" "}
            <a href="mailto:support@cosmeticshop.vn">
              support@cosmeticshop.vn
            </a>
          </div>
        </div>
        <div className="col-md-6">
          <h5 className="mb-3">Bản đồ</h5>
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(33,140,84,0.08)",
            }}
          >
            <iframe
              title="Bản đồ Cosmetic Shop"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.502964964479!2d106.6799833153342!3d10.77637369232247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c1b1b1b1b%3A0x123456789abcdef!2zMTIzIE5ndXnhu4VuIFRyw6FpLCBRdeG6rW4gMSwgUFAuIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
              width="100%"
              height="320"
              style={{ border: 0 }}
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