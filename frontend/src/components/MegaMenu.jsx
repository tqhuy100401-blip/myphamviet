import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MegaMenu.css";

const categories = [
  {
    name: "Chăm sóc da mặt",
    sub: ["Tẩy trang", "Sữa rửa mặt", "Tẩy tế bào chết", "Toner", "Serum", "Kem dưỡng", "Chống nắng", "Mặt nạ"]
  },
  {
    name: "Trang điểm",
    sub: ["Kem nền", "Phấn phủ", "Son môi", "Má hồng", "Kẻ mắt", "Mascara", "Cọ trang điểm"]
  },
  {
    name: "Chăm sóc tóc",
    sub: ["Dầu gội", "Dầu xả", "Serum tóc", "Xịt dưỡng tóc", "Thuốc nhuộm"]
  },
  {
    name: "Chăm sóc cơ thể",
    sub: ["Sữa tắm", "Tẩy tế bào chết body", "Dưỡng thể", "Chống nắng body"]
  },
  {
    name: "Nước hoa",
    sub: ["Nước hoa nữ", "Nước hoa nam", "Xịt thơm toàn thân"]
  }
];

const MegaMenu = () => {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <nav className="mega-menu" style={{ display: 'none' }}>
      <div className="mega-menu-container">
        <ul className="menu-list">
          {categories.map((cat, idx) => (
            <li key={cat.name} className="menu-item">
              <span
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                style={{cursor:'pointer'}}
              >{cat.name}</span>
              {openIdx === idx && (
                <div className="submenu submenu-fixed">
                  <ul>
                    {cat.sub.map(sub => (
                      <li key={sub}><Link to={`/products?category=${encodeURIComponent(sub)}`}>{sub}</Link></li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default MegaMenu;
