import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { FiHeart, FiShoppingCart, FiPackage } from "react-icons/fi";
import { toast } from "react-toastify";
import { getImageUrl } from "../utils/helpers";

function Wishlist() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  // Fetch wishlist
  const { data: wishlistData = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => axiosClient.get("/wishlist").then(res => res.data.products || []),
    enabled: !!token,
  });

  // Fetch flash sales
  const { data: flashSales = [] } = useQuery({
    queryKey: ["flashsales-live"],
    queryFn: () => axiosClient.get("/flashsales/live").then(res => res.data.flashSales || []),
  });

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: (productId) => axiosClient.delete(`/wishlist/remove/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Đã xóa khỏi danh sách yêu thích!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi khi xóa sản phẩm");
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (productId) => axiosClient.post("/cart/add", { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      toast.success("✅ Đã thêm vào giỏ hàng!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
    },
  });

  const getFlashSalePrice = (productId) => {
    const flashSale = flashSales.find(fs => 
      fs.product?._id === productId || fs.product === productId
    );
    return flashSale ? flashSale.salePrice : null;
  };

  const handleRemove = (productId) => {
    removeMutation.mutate(productId);
  };

  const handleAddToCart = (productId) => {
    if (!token) {
      toast.warn("Vui lòng đăng nhập!");
      return;
    }
    addToCartMutation.mutate(productId);
  };

  if (!token) {
    return (
      <div className="container py-5 text-center">
        <FiPackage size={80} className="text-muted mb-3" />
        <h3>Vui lòng đăng nhập để xem danh sách yêu thích</h3>
        <Link to="/login" className="btn btn-primary mt-3">Đăng nhập</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '60px' }}>
      <div className="container py-4">
        <div className="d-flex align-items-center mb-4">
          <FiPackage size={32} className="me-3" style={{ color: '#667eea' }} />
          <h2 className="mb-0">Sản phẩm yêu thích</h2>
          <span className="ms-3 badge bg-primary" style={{ fontSize: '1rem' }}>
            {wishlistData.length}
          </span>
        </div>

        {wishlistData.length === 0 ? (
          <div className="text-center py-5">
            <FiPackage size={80} className="text-muted mb-3" />
            <h4 className="text-muted">Chưa có sản phẩm yêu thích</h4>
            <p className="text-muted">Hãy thêm sản phẩm vào danh sách yêu thích của bạn!</p>
            <Link to="/products" className="btn btn-primary mt-3">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {wishlistData.map((product) => {
              const salePrice = getFlashSalePrice(product._id);
              const displayPrice = salePrice || product.price;
              const hasDiscount = !!salePrice;

              return (
                <div key={product._id} className="col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm" style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    
                    {/* Badge Flash Sale */}
                    {hasDiscount && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        zIndex: 1
                      }}>
                        🔥 FLASH SALE
                      </div>
                    )}

                    {/* Nút xóa */}
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 32,
                      height: 32,
                      zIndex: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FiHeart style={{ color: 'red', fontSize: 24, pointerEvents: 'none' }} />
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
                            handleRemove(product._id);
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          zIndex: 5,
                          padding: 0,
                        }}
                        aria-label="Xóa khỏi yêu thích"
                      />
                    </div>

                    <Link to={`/products/${product._id}`} style={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      flex: '1 1 auto',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '250px',
                          objectFit: 'cover'
                        }}
                      />
                      <div className="card-body" style={{ flex: '1 1 auto' }}>
                        <h6 className="card-title" style={{ 
                          fontSize: '0.95rem',
                          minHeight: '40px',
                          marginBottom: '8px'
                        }}>
                          {product.name}
                        </h6>
                        
                        <div className="mb-3">
                          {hasDiscount ? (
                            <>
                              <div className="d-flex align-items-center gap-2">
                                <span style={{ 
                                  color: '#e53e3e',
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold'
                                }}>
                                  {displayPrice.toLocaleString()}đ
                                </span>
                                <span style={{
                                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                                  color: '#fff',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }}>
                                  -{Math.round((1 - salePrice / product.price) * 100)}%
                                </span>
                              </div>
                              <div>
                                <span style={{
                                  textDecoration: 'line-through',
                                  color: '#999',
                                  fontSize: '0.85rem'
                                }}>
                                  {product.price.toLocaleString()}đ
                                </span>
                              </div>
                            </>
                          ) : (
                            <span style={{ 
                              color: '#2d3748',
                              fontSize: '1.1rem',
                              fontWeight: 'bold'
                            }}>
                              {product.price.toLocaleString()}đ
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="card-footer bg-white border-0 pt-0 pb-3">
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="btn btn-primary w-100"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '0.95rem'
                        }}
                      >
                        <FiShoppingCart size={18} />
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
