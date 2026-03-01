import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="navbar navbar-default desktop-menu">
    <div className="container">
      <ul className="nav navbar-nav navbar-left hidden-sm hidden-xs">
        <li className="active">
          <Link to="/">Trang chủ</Link>
        </li>
        <li><Link to="/san-pham">Sản phẩm</Link></li>
        <li><Link to="/chinh-sach-doi-tra">Chính sách đổi trả</Link></li>
        <li><Link to="/chinh-sach-thanh-toan">Chính sách thanh toán</Link></li>
        <li><Link to="/chinh-sach-giao-hang">Chính sách giao hàng</Link></li>
        <li><Link to="/lien-he">Liên hệ</Link></li>
      </ul>
      <span className="hidden-lg hidden-md experience">Trải nghiệm cùng sản phẩm của Goda</span>
      <ul className="nav navbar-nav navbar-right">
        <li className="cart">
          <Link to="/cart" title="Giỏ Hàng">
            <i className="fa fa-shopping-cart"></i> <span className="number-total-product">6</span>
          </Link>
        </li>
      </ul>
    </div>
  </nav>
);

export default Navbar;
