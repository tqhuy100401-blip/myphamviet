import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { FiShoppingCart, FiArrowLeft, FiTag, FiBox, FiStar, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { addToGuestCart } from "../utils/cartHelper";
import { getImageUrl } from "../utils/helpers";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => axiosClient.get(`/products/${id}`).then(res => res.data),
  });

  // Fetch flash sale for this product
  const { data: flashSaleData } = useQuery({
    queryKey: ["flashsale-product", id],
    queryFn: () => axiosClient.get(`/flashsales/product/${id}`).then(res => res.data).catch(() => null),
  });

  const flashSale = flashSaleData?.flashSale || null;

  // Lấy reviews của sản phẩm
  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => axiosClient.get(`/reviews/product/${id}`).then(res => res.data),
  });

  // Kiểm tra có thể review không
  const { data: canReviewData } = useQuery({
    queryKey: ["can-review", id],
    queryFn: () => axiosClient.get(`/reviews/can-review/${id}`).then(res => res.data),
    enabled: !!token,
  });

  const reviews = reviewsData?.reviews || [];
  const canReview = canReviewData?.canReview || false;

  // Lấy sản phẩm liên quan (cùng danh mục)
  const categoryId = product?.category?._id || product?.category;
  
  const { data: relatedProductsData } = useQuery({
    queryKey: ["related-products", categoryId, id],
    queryFn: async () => {
      if (!categoryId) return { products: [] };
      const response = await axiosClient.get(`/products`, {
        params: { category: categoryId, limit: 8 }
      });
      console.log('Related products response:', response.data);
      return response.data;
    },
    enabled: !!categoryId,
  });

  const relatedProducts = (relatedProductsData?.products || []).filter(p => p._id !== id);
  console.log('Product category:', product?.category);
  console.log('Category ID:', categoryId);
  console.log('Related products:', relatedProducts);

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // User logged in - add to backend cart
      try {
        await axiosClient.post("/cart/add", { productId: id, quantity: Number(quantity) });
        toast.success("✅ Đã thêm vào giỏ hàng!");
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cart-count"] });
        navigate("/cart");
      } catch (err) {
        toast.error("Lỗi: " + (err.response?.data?.message || err.message));
      }
    } else {
      // Guest user - add to localStorage
      addToGuestCart(product, Number(quantity));
      toast.success("✅ Đã thêm vào giỏ hàng!");
      // Trigger cart count update
      window.dispatchEvent(new Event("storage"));
      navigate("/cart");
    }
  };

  // Thêm review
  const addReviewMutation = useMutation({
    mutationFn: (data) => axiosClient.post("/reviews", data),
    onSuccess: () => {
      toast.success("✅ Đánh giá thành công!");
      setRating(5);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["can-review", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi khi đánh giá");
    }
  });

  // Sửa review
  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, data }) => axiosClient.put(`/reviews/${reviewId}`, data),
    onSuccess: () => {
      toast.success("✅ Cập nhật đánh giá thành công!");
      setEditingReview(null);
      setRating(5);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật đánh giá");
    }
  });

  // Xóa review
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => axiosClient.delete(`/reviews/${reviewId}`),
    onSuccess: () => {
      toast.success("✅ Xóa đánh giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["can-review", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa đánh giá");
    }
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nhận xét");
      return;
    }

    if (editingReview) {
      updateReviewMutation.mutate({
        reviewId: editingReview._id,
        data: { rating, comment }
      });
    } else {
      addReviewMutation.mutate({
        productId: id,
        rating,
        comment
      });
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    // Scroll to form
    document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setRating(5);
    setComment("");
  };

  const renderStars = (count, interactive = false, onRatingChange = null) => {
    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={interactive ? 24 : 16}
            fill={star <= count ? "#fbbf24" : "none"}
            stroke={star <= count ? "#fbbf24" : "#cbd5e0"}
            style={{ cursor: interactive ? "pointer" : "default" }}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  if (isLoading || !product) return <p className="container mt-4">Đang tải...</p>;

  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  return (
    <div className="container mt-4 mb-5">
      <div className="row">
        <div className="col-md-5">
          <img
            src={getImageUrl(product.image) || "https://via.placeholder.com/400x400?text=No+Image"}
            className="img-fluid rounded shadow"
            style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
            alt={product.name}
          />
        </div>
        <div className="col-md-7">
          <h2>{product.name}</h2>
          
          {/* Rating Display */}
          {product.reviewCount > 0 && (
            <div className="d-flex align-items-center gap-2 mt-2">
              {renderStars(Math.round(product.averageRating))}
              <span className="text-warning fw-bold">{product.averageRating.toFixed(1)}</span>
              <span className="text-muted">({product.reviewCount} đánh giá)</span>
            </div>
          )}

          {/* Price Display with Flash Sale */}
          <div className="mt-3">
            {flashSale ? (
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-3">
                  <h4 className="text-danger fw-bold mb-0">
                    {Number(flashSale.salePrice).toLocaleString("vi-VN")}đ
                  </h4>
                  <span style={{
                    background: 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⚡ FLASH SALE -{flashSale.discountPercent}%
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span style={{
                    fontSize: '18px',
                    textDecoration: 'line-through',
                    color: '#999'
                  }}>
                    {Number(product.price).toLocaleString("vi-VN")}đ
                  </span>
                  <span style={{
                    color: '#38a169',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Tiết kiệm {Number(product.price - flashSale.salePrice).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {flashSale.quantity > 0 && (
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    color: '#856404'
                  }}>
                    ⚠️ Chỉ còn {flashSale.quantity - flashSale.sold} sản phẩm trong flash sale!
                  </div>
                )}
              </div>
            ) : (
              <h4 className="text-danger fw-bold">
                {Number(product.price).toLocaleString("vi-VN")}đ
              </h4>
            )}
          </div>

          {product.category && (
            <p className="mt-3 d-flex align-items-center gap-2">
              <FiTag size={16} color="#667eea" /> <strong>Danh mục:</strong> {product.category}
            </p>
          )}

          {product.stock !== undefined && (
            <p className="d-flex align-items-center gap-2">
              <FiBox size={16} color="#667eea" /> <strong>Tồn kho:</strong>{" "}
              <span className={product.stock > 0 ? "text-success" : "text-danger"}>
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
              </span>
            </p>
          )}

          <hr />

          <h5>Mô tả sản phẩm</h5>
          <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </p>

          <hr />

          <div className="d-flex align-items-center mt-3 gap-3">
            <label className="fw-bold mb-0">Số lượng:</label>
            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn btn-outline-secondary" 
                style={{ width: "40px", height: "40px", padding: 0, fontSize: "18px", fontWeight: "bold" }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <input
                type="number"
                className="form-control text-center fw-bold"
                style={{ width: "70px", height: "40px" }}
                min="1"
                max={product.stock || 999}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button 
                className="btn btn-outline-secondary" 
                style={{ width: "40px", height: "40px", padding: 0, fontSize: "18px", fontWeight: "bold" }}
                onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
              >
                +
              </button>
            </div>
            <button className="btn btn-success d-flex align-items-center gap-2 px-4" style={{ height: "40px" }} onClick={addToCart} disabled={product.stock === 0}>
              <FiShoppingCart size={16} /> Mua hàng
            </button>
          </div>

          <button className="btn btn-outline-secondary mt-3 d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="mb-4">
            <FiStar size={24} className="text-warning me-2" />
            Đánh giá sản phẩm ({reviews.length})
          </h3>

          {/* Review Form */}
          {token && (canReview || editingReview) && (
            <div id="review-form" className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">
                  {editingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá của bạn"}
                </h5>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Đánh giá sao:</label>
                    {renderStars(rating, true, setRating)}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nhận xét:</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      maxLength="500"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      required
                    />
                    <small className="text-muted">{comment.length}/500 ký tự</small>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={addReviewMutation.isPending || updateReviewMutation.isPending}
                    >
                      {editingReview ? "Cập nhật" : "Gửi đánh giá"}
                    </button>
                    {editingReview && (
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Message when can't review */}
          {token && !canReview && canReviewData && (
            <div className="alert alert-info">
              {canReviewData.hasReviewed 
                ? "Bạn đã đánh giá sản phẩm này rồi" 
                : "Bạn cần mua sản phẩm này và đơn hàng đã được giao mới có thể đánh giá"}
            </div>
          )}

          {!token && (
            <div className="alert alert-warning">
              Bạn cần <a href="/login">đăng nhập</a> và mua sản phẩm để đánh giá
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="text-center text-muted py-5">
                <FiStar size={48} className="mb-3 opacity-50" />
                <p>Chưa có đánh giá nào cho sản phẩm này</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <strong>{review.user?.name || "Khách hàng"}</strong>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-muted small mb-2">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                        <p className="mb-0">{review.comment}</p>
                      </div>
                      {currentUserId === review.user?._id && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditReview(review)}
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
                                deleteReviewMutation.mutate(review._id);
                              }
                            }}
                            title="Xóa"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sản phẩm liên quan */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <h4 className="mb-4" style={{ fontWeight: 700, color: "#2d3748" }}>
                <FiTag style={{ marginRight: "8px", color: "#667eea" }} />
                Sản phẩm liên quan
              </h4>
              <div className="row">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                  <div key={relatedProduct._id} className="col-md-6 col-lg-3 mb-4">
                    <div 
                      className="card h-100 shadow-sm" 
                      style={{ 
                        cursor: "pointer",
                        transition: "all 0.3s",
                        border: "1px solid #e2e8f0"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                      onClick={() => navigate(`/product/${relatedProduct._id}`)}
                    >
                      <div style={{ position: "relative", paddingTop: "100%", overflow: "hidden" }}>
                        <img
                          src={getImageUrl(relatedProduct.image)}
                          alt={relatedProduct.name}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                          }}
                        />
                        {relatedProduct.stock === 0 && (
                          <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0,0,0,0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "18px"
                          }}>
                            HẾT HÀNG
                          </div>
                        )}
                      </div>
                      <div className="card-body">
                        <h6 className="mb-2" style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          minHeight: "48px",
                          lineHeight: "24px"
                        }}>
                          {relatedProduct.name}
                        </h6>
                        <div className="d-flex align-items-center gap-1 mb-2">
                          <FiStar size={14} color="#fbbf24" fill="#fbbf24" />
                          <span className="small text-muted">
                            {relatedProduct.averageRating?.toFixed(1) || "5.0"} ({relatedProduct.reviewCount || 0})
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold text-danger" style={{ fontSize: "18px" }}>
                              {relatedProduct.price?.toLocaleString("vi-VN")}đ
                            </div>
                            <small className="text-success">
                              <FiBox size={12} /> Còn {relatedProduct.stock}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ProductDetail;
