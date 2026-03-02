import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { toast } from "react-toastify";
import { getImageUrl } from "../utils/helpers";
import "../components/ProductCard.css";

function ProductsByCategory() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axiosClient.get("/categories").then(res => res.data),
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => axiosClient.get("/products").then(res => res.data),
  });

  const products = productsData?.products || [];

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
  
  // Find selected category
  const selectedCategory = categories.find(c => c.slug === categorySlug);
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory.name)
    : products;

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("token");
    
    // Find product details
    const product = products.find(p => p._id === productId);
    if (!product) {
      toast.error("Không tìm thấy sản phẩm!");
      return;
    }

    if (token) {
      // User logged in - add to backend cart
      try {
        await axiosClient.post("/cart/add", { productId, quantity: 1 });
        toast.success("✅ Đã thêm vào giỏ hàng!");
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      } catch (err) {
        toast.error("Lỗi: " + (err.response?.data?.message || err.message));
      }
    } else {
      // Guest user - add to localStorage
      toast.warn("Vui lòng đăng nhập để thêm vào giỏ hàng!");
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Breadcrumb */}
      <div className="container py-3">
        <nav style={{ fontSize: '0.9rem', color: '#666' }}>
          <Link to="/" style={{ color: '#1c7430', textDecoration: 'none' }}>Trang chủ</Link>
          <span> / </span>
          <span>{selectedCategory ? selectedCategory.name : 'Tất cả sản phẩm'}</span>
        </nav>
      </div>

      {/* Category Header */}
      <div className="container">
        <div style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#333', marginBottom: '8px' }}>
            {selectedCategory ? selectedCategory.name : 'Tất cả sản phẩm'}
          </h1>
          <p style={{ color: '#666', marginBottom: 0 }}>
            {filteredProducts.length} sản phẩm
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '60px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '1.2rem', color: '#999' }}>Không có sản phẩm nào trong danh mục này</p>
            <Link to="/products" style={{
              display: 'inline-block',
              marginTop: '16px',
              padding: '10px 24px',
              background: '#1c7430',
              color: '#fff',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 600
            }}>
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <div className="products-grid-hasaki" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            {filteredProducts.map(product => (
              <div className="product-card-hasaki" key={product._id}>
                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="product-image-wrapper">
                    {product.discount && product.discount.value && (
                      <div className="product-badge">-{product.discount.value}%</div>
                    )}
                    <img
                      src={getImageUrl(product.image) || 'https://via.placeholder.com/300x300?text=No+Image'}
                      className="product-image"
                      alt={product.name}
                    />
                  </div>
                  <div className="product-body">
                    <div className="product-brand">{product.brand || selectedCategory?.name || 'Thương hiệu'}</div>
                    <div className="product-name">{product.name}</div>
                    <div className="product-rating">
                      <span className="stars">★★★★★</span>
                      <span className="count">(999+)</span>
                    </div>
                    <div className="product-price-wrapper">
                      {(() => {
                        const flashSalePrice = getFlashSalePrice(product._id);
                        if (flashSalePrice) {
                          return (
                            <>
                              <div className="product-price" style={{display:'flex',alignItems:'center',gap:4}}>
                                {Number(flashSalePrice).toLocaleString('vi-VN')}đ
                                <span style={{background:'#ff4757',color:'#fff',borderRadius:'4px',padding:'0 4px',fontSize:10,fontWeight:700}}>⚡</span>
                              </div>
                              <div>
                                <span className="product-old-price">
                                  {Number(product.price).toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                            </>
                          );
                        } else if (product.discount && product.discount.value) {
                          return (
                            <>
                              <div className="product-price">
                                {Number(product.price * (1 - product.discount.value / 100)).toLocaleString('vi-VN')}đ
                              </div>
                              <div>
                                <span className="product-old-price">
                                  {Number(product.price).toLocaleString('vi-VN')}đ
                                </span>
                                <span className="product-discount">-{product.discount.value}%</span>
                              </div>
                            </>
                          );
                        } else {
                          return (
                            <div className="product-price">
                              {Number(product.price).toLocaleString('vi-VN')}đ
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </Link>
                <div className="product-actions">
                  <button className="btn-add-cart" onClick={() => handleAddToCart(product._id)}>
                    <FiShoppingCart size={16} /> Thêm
                  </button>
                  <button className="btn-wishlist">
                    <FiHeart size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsByCategory;
