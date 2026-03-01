import React from "react";

const STORES = [
  {
    name: "Cosmetic Shop - Chi nhánh 1",
    address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
    phone: "0123 456 789",
    desc: "Cửa hàng flagship với đầy đủ các dòng mỹ phẩm cao cấp, không gian trải nghiệm hiện đại, đội ngũ tư vấn chuyên nghiệp.",
    products: [
      "Trang điểm", "Chăm sóc da", "Nước hoa", "Dụng cụ làm đẹp"
    ]
  },
  {
    name: "Cosmetic Shop - Chi nhánh 2",
    address: "456 Lê Văn Sỹ, Quận 3, TP.HCM",
    phone: "0123 456 888",
    desc: "Chuyên các sản phẩm dưỡng da, makeup Hàn Quốc, nhiều chương trình ưu đãi hấp dẫn mỗi tuần.",
    products: [
      "Chăm sóc da", "Trang điểm", "Mặt nạ", "Sản phẩm organic"
    ]
  },
  {
    name: "Cosmetic Shop - Chi nhánh 3",
    address: "789 Cách Mạng Tháng 8, Quận 10, TP.HCM",
    phone: "0123 456 999",
    desc: "Không gian rộng rãi, nhiều thương hiệu quốc tế, dịch vụ tư vấn da miễn phí, nhận đặt hàng online.",
    products: [
      "Nước hoa", "Chăm sóc tóc", "Dụng cụ làm đẹp", "Sản phẩm spa"
    ]
  }
];

export default function Stores() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">🏬 Hệ thống cửa hàng Cosmetic Shop</h2>
      <p className="mb-4">Chúng tôi có nhiều chi nhánh trên toàn quốc, cung cấp đa dạng sản phẩm mỹ phẩm chính hãng, dịch vụ tư vấn tận tâm và nhiều ưu đãi hấp dẫn.</p>
      <div className="row g-4">
        {STORES.map((store, idx) => (
          <div className="col-md-4" key={idx}>
            <div className="card shadow-sm h-100" style={{borderRadius:16}}>
              <div className="card-body">
                <h5 className="card-title mb-2" style={{fontWeight:800}}>{store.name}</h5>
                <div className="mb-2"><strong>Địa chỉ:</strong> {store.address}</div>
                <div className="mb-2"><strong>Hotline:</strong> <a href={`tel:${store.phone}`}>{store.phone}</a></div>
                <div className="mb-2" style={{fontSize:14}}>{store.desc}</div>
                <div className="mb-2"><strong>Sản phẩm nổi bật:</strong>
                  <ul className="mb-0 ps-3">
                    {store.products.map((prod, i) => <li key={i}>{prod}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 text-center text-muted" style={{fontSize:15}}>
        <em>Hãy ghé thăm cửa hàng gần nhất để trải nghiệm sản phẩm chính hãng, nhận tư vấn miễn phí và nhiều ưu đãi hấp dẫn!</em>
      </div>
    </div>
  );
}