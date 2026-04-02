import { Link } from "react-router-dom";
import { FiShoppingCart, FiHeart, FiStar } from "react-icons/fi";
import { getImageUrl } from "../utils/helpers";

function ProductCard({ 
  product, 
  flashSalePrice = null,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  showRating = true,
  showActions = true
}) {
  const displayPrice = flashSalePrice || product.price;
  const hasDiscount = flashSalePrice || (product.discount && product.discount.value > 0);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        border: '2px solid #e2e8f0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      className="product-card-standard"
    >
      {/* Badge giảm giá */}
      {hasDiscount && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: flashSalePrice ? '#ff4757' : '#fc8181',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '700',
          zIndex: 2,
          boxShadow: '0 2px 8px rgba(252, 129, 129, 0.4)'
        }}>
          {flashSalePrice ? '⚡ FLASH SALE' : 
            product.discount.type === 'percent' 
              ? `-${product.discount.value}%` 
              : `-${Number(product.discount.value).toLocaleString('vi-VN')}đ`
          }
        </div>
      )}

      {/* Badge tình trạng kho */}
      {product.stock > 0 ? (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'linear-gradient(135deg, #48bb78, #38a169)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '700',
          zIndex: 3,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
        }}>
          Còn {product.stock} sp
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'linear-gradient(135deg, #fc8181, #f56565)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '700',
          zIndex: 3,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
        }}>
          Hết hàng
        </div>
      )}

      <Link 
        to={`/product/${product._id}`}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Image */}
        <div style={{ 
          paddingBottom: '100%', 
          position: 'relative', 
          overflow: 'hidden',
          background: '#f7fafc'
        }}>
          <img
            src={getImageUrl(product.image) || 'https://via.placeholder.com/300x300?text=No+Image'}
            alt={product.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              opacity: product.stock === 0 ? 0.5 : 1
            }}
            className="product-card-img"
          />
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '700',
              fontSize: '16px',
              zIndex: 1
            }}>
              HẾT HÀNG
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '10px', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
          {/* Category/Brand */}
          <div style={{ 
            fontSize: '10px', 
            color: '#38a169', 
            fontWeight: '700',
            marginBottom: '3px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {product.brand || product.category || 'BRAND'}
          </div>

          {/* Product Name */}
          <h4 style={{ 
            fontSize: '13px', 
            fontWeight: '700', 
            marginBottom: '5px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: '#1a202c',
            minHeight: '36px',
            lineHeight: '1.35'
          }}>
            {product.name}
          </h4>

          {/* Rating */}
          {showRating && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '3px', 
              marginBottom: '5px',
              minHeight: '16px'
            }}>
              {product.reviewCount > 0 ? (
                <>
                  <FiStar size={12} fill="#fbbf24" stroke="#fbbf24" />
                  <span style={{ fontWeight: '700', color: '#fbbf24', fontSize: '12px' }}>
                    {product.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <span style={{ color: '#a0aec0', fontSize: '10px' }}>
                    ({product.reviewCount})
                  </span>
                </>
              ) : (
                <span style={{ color: '#a0aec0', fontSize: '10px' }}>Chưa có đánh giá</span>
              )}
            </div>
          )}

          {/* Price */}
          <div style={{ marginTop: 'auto', marginBottom: '6px' }}>
            {hasDiscount ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#fc8181' }}>
                    {Number(displayPrice).toLocaleString('vi-VN')}đ
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    textDecoration: 'line-through', 
                    color: '#a0aec0' 
                  }}>
                    {Number(product.price).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </>
            ) : (
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#2d3748' }}>
                {Number(product.price || 0).toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            color: '#718096',
            marginBottom: '5px'
          }}>
            <span><FiShoppingCart size={10} /> {product.sold || 0} đã bán</span>
          </div>
        </div>
      </Link>

      {/* Actions */}
      {showActions && (
        <div style={{ 
          padding: '0 10px 10px', 
          display: 'flex', 
          gap: '5px',
          marginTop: 'auto'
        }}>
          <button
            onClick={onAddToCart}
            disabled={product.stock === 0}
            style={{
              flex: 1,
              background: product.stock === 0 
                ? '#e2e8f0' 
                : 'linear-gradient(135deg, #48bb78, #38a169)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 10px',
              height: '38px',
              fontWeight: '600',
              fontSize: '12px',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              opacity: product.stock === 0 ? 0.6 : 1
            }}
            onMouseEnter={e => {
              if (product.stock > 0) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.3)';
              }
            }}
            onMouseLeave={e => {
              if (product.stock > 0) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            <FiShoppingCart size={15} />
            {product.stock === 0 ? 'Hết hàng' : 'Mua ngay'}
          </button>
          
          {onToggleWishlist && (
            <button
              onClick={onToggleWishlist}
              style={{
                background: isInWishlist ? '#fff5f5' : '#fff',
                border: `2px solid ${isInWishlist ? '#e53e3e' : '#e2e8f0'}`,
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = isInWishlist ? '#c53030' : '#cbd5e0';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = isInWishlist ? '#e53e3e' : '#e2e8f0';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '18px' }}>
                {isInWishlist ? '❤️' : '🤍'}
              </span>
            </button>
          )}
        </div>
      )}

      <style>{`
        .product-card-standard:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }
        .product-card-standard:hover .product-card-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

export default ProductCard;
