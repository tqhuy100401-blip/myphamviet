import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { FiShoppingBag, FiTruck, FiShield, FiGift, FiArrowRight } from "react-icons/fi";

function HomeSimple() {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => axiosClient.get("/products").then(res => res.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axiosClient.get("/categories").then(res => res.data),
  });

  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];

  // Fetch live flash sales
  const { data: flashSales = [] } = useQuery({
    queryKey: ["flashsales-live"],
    queryFn: () => axiosClient.get("/flashsales/live").then(res => res.data.flashSales || []),
  });

  // Helper function to get flash sale price for a product
  const getFlashSalePrice = (productId) => {
    const flashSale = flashSales.find(fs => fs.product._id === productId || fs.product === productId);
    return flashSale ? flashSale.salePrice : null;
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
      {/* Hero Banner with Gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 20px'
      }}>
        {/* Animated background circles */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: '350px',
          height: '350px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }}></div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hover-lift {
            transition: all 0.3s ease;
          }
          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          }
        `}</style>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', color: '#fff', animation: 'slideIn 1s ease' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💄✨</div>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              marginBottom: '16px',
              textShadow: '0 4px 20px rgba(0,0,0,0.2)',
              letterSpacing: '-0.5px'
            }}>
              Mỹ Phẩm Việt
            </h1>
            <p style={{ 
              fontSize: '20px', 
              marginBottom: '32px',
              opacity: 0.95,
              fontWeight: 400,
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Làm đẹp tự nhiên, tỏa sáng phong cách<br/>
              Mỹ phẩm chính hãng - Ưu đãi hấp dẫn
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/products" style={{
                background: '#fff',
                color: '#667eea',
                padding: '14px 36px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              }}>
                <FiShoppingBag /> Khám phá ngay
              </Link>
              {flashSales.length > 0 && (
                <Link to="/flashsale" style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  padding: '14px 36px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}>
                  ⚡ Flash Sale HOT
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ 
        background: '#fff', 
        padding: '40px 20px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '30px',
            textAlign: 'center'
          }}>
            {[
              { icon: <FiShield size={36} />, title: 'Chính hãng 100%', desc: 'Cam kết nguồn gốc rõ ràng' },
              { icon: <FiTruck size={36} />, title: 'Giao hàng nhanh', desc: 'Miễn phí cho đơn > 300k' },
              { icon: <FiGift size={36} />, title: 'Ưu đãi độc quyền', desc: 'Giảm giá lên đến 50%' },
              { icon: <FiShoppingBag size={36} />, title: 'Đổi trả dễ dàng', desc: 'Trong vòng 7 ngày' }
            ].map((feature, idx) => (
              <div key={idx} style={{ padding: '20px' }}>
                <div style={{ color: '#667eea', marginBottom: '12px' }}>
                  {feature.icon}
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#2d3748' }}>
                  {feature.title}
                </h4>
                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div style={{ padding: '60px 20px', background: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#2d3748', marginBottom: '8px' }}>
                Danh mục sản phẩm
              </h2>
              <p style={{ color: '#718096', fontSize: '16px' }}>
                Tìm kiếm theo danh mục yêu thích của bạn
              </p>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '20px' 
            }}>
              {categories.slice(0, 8).map(category => (
                <Link 
                  key={category._id}
                  to={`/products/category/${category._id}`}
                  className="hover-lift"
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '2px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                    {category.icon || '📦'}
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#2d3748', margin: 0 }}>
                    {category.name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Flash Sale Section */}
      {flashSales.length > 0 && (
        <div style={{ padding: '60px 20px', background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '30px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: '#c53030', 
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  ⚡ Flash Sale
                </h2>
                <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>
                  Giảm giá sốc - Số lượng có hạn
                </p>
              </div>
              <Link to="/flashsale" style={{
                background: '#c53030',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.target.style.background = '#9b2c2c'}
              onMouseLeave={e => e.target.style.background = '#c53030'}>
                Xem tất cả <FiArrowRight />
              </Link>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '20px' 
            }}>
              {flashSales.slice(0, 8).map(fs => (
                <Link 
                  key={fs._id}
                  to={`/product/${fs.product._id}`}
                  className="hover-lift"
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '16px',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '2px solid #feb2b2',
                    boxShadow: '0 4px 12px rgba(197,48,48,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#c53030',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    zIndex: 1
                  }}>
                    -{fs.discountPercent}%
                  </div>
                  <div style={{ 
                    paddingBottom: '100%', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    borderRadius: '12px',
                    marginBottom: '12px'
                  }}>
                    <img
                      src={fs.product.image ? `http://localhost:5002/uploads/${fs.product.image}` : 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={fs.product.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#2d3748'
                  }}>
                    {fs.product.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#c53030' }}>
                      {Number(fs.salePrice).toLocaleString('vi-VN')}đ
                    </span>
                    <span style={{ fontSize: '13px', textDecoration: 'line-through', color: '#a0aec0' }}>
                      {Number(fs.originalPrice).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div style={{
                    background: '#fef5e7',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: '#d97706',
                    fontWeight: '600'
                  }}>
                    🔥 Đã bán {fs.sold}/{fs.quantity}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div style={{ padding: '60px 20px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#2d3748', marginBottom: '8px' }}>
              Sản phẩm nổi bật
            </h2>
            <p style={{ color: '#718096', fontSize: '16px' }}>
              Được khách hàng yêu thích nhất
            </p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '24px' 
          }}>
            {products.slice(0, 12).map(product => {
              const flashSalePrice = getFlashSalePrice(product._id);
              return (
                <Link 
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="hover-lift"
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '16px',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative'
                  }}
                >
                  {flashSalePrice && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: '#ff4757',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      zIndex: 1
                    }}>
                      ⚡ SALE
                    </div>
                  )}
                  <div style={{ 
                    paddingBottom: '100%', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    borderRadius: '12px',
                    marginBottom: '12px',
                    background: '#f7fafc'
                  }}>
                    <img
                      src={product.image ? `http://localhost:5002/uploads/${product.image}` : 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={product.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {product.brand || 'BRAND'}
                  </div>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    color: '#2d3748',
                    minHeight: '40px'
                  }}>
                    {product.name}
                  </h4>
                  {flashSalePrice ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#fc8181' }}>
                          {Number(flashSalePrice).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', textDecoration: 'line-through', color: '#a0aec0' }}>
                        {Number(product.price || 0).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748' }}>
                      {Number(product.price || 0).toLocaleString('vi-VN')}đ
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
          {products.length > 12 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/products" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)';
              }}>
                Xem tất cả sản phẩm <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 20px',
        color: '#fff'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
            Đăng ký nhận tin
          </h3>
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
            Nhận thông tin về sản phẩm mới và ưu đãi độc quyền
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            maxWidth: '500px', 
            margin: '0 auto',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <input 
              type="email" 
              placeholder="Nhập email của bạn..."
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '14px 20px',
                borderRadius: '50px',
                border: 'none',
                fontSize: '15px',
                outline: 'none'
              }}
            />
            <button style={{
              background: '#fff',
              color: '#667eea',
              padding: '14px 32px',
              borderRadius: '50px',
              border: 'none',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#718096' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            Chưa có sản phẩm nào
          </h3>
          <p style={{ fontSize: '16px' }}>Hãy quay lại sau nhé!</p>
        </div>
      )}
    </div>
  );
}

export default HomeSimple;
