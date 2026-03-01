import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import CountdownTimer from '../components/CountdownTimer';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import './FlashSale.css';

const FlashSale = () => {
  const [liveFlashSales, setLiveFlashSales] = useState([]);
  const [upcomingFlashSales, setUpcomingFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const [liveRes, upcomingRes] = await Promise.all([
        axiosClient.get('/flashsales/live'),
        axiosClient.get('/flashsales/upcoming')
      ]);

      setLiveFlashSales(liveRes.data.flashSales || []);
      setUpcomingFlashSales(upcomingRes.data.flashSales || []);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlashSaleExpire = (flashSaleId) => {
    setLiveFlashSales(prev => prev.filter(fs => fs._id !== flashSaleId));
    fetchFlashSales(); // Refresh to get updated data
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="flash-sale-page">
      {/* Live Flash Sales */}
      {liveFlashSales.length > 0 && (
        <section className="flash-sale-section live-section">
          <div className="section-header">
            <h2>⚡ FLASH SALE - ĐANG DIỄN RA</h2>
            <p>Số lượng có hạn - Đừng bỏ lỡ!</p>
          </div>

          <div className="flash-sale-grid">
            {liveFlashSales.map(flashSale => (
              <FlashSaleCard
                key={flashSale._id}
                flashSale={flashSale}
                onExpire={() => handleFlashSaleExpire(flashSale._id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Flash Sales */}
      {upcomingFlashSales.length > 0 && (
        <section className="flash-sale-section upcoming-section">
          <div className="section-header">
            <h2>🔜 SẮP DIỄN RA</h2>
            <p>Đặt lịnh hẹn để không bỏ lỡ</p>
          </div>

          <div className="flash-sale-grid">
            {upcomingFlashSales.map(flashSale => (
              <FlashSaleCard
                key={flashSale._id}
                flashSale={flashSale}
                isUpcoming={true}
              />
            ))}
          </div>
        </section>
      )}

      {liveFlashSales.length === 0 && upcomingFlashSales.length === 0 && (
        <div className="no-flash-sales">
          <h3>Hiện tại chưa có Flash Sale nào</h3>
          <p>Hãy quay lại sau để không bỏ lỡ các chương trình khuyến mãi hấp dẫn!</p>
        </div>
      )}
    </div>
  );
};

const FlashSaleCard = ({ flashSale, isUpcoming, onExpire }) => {
  const { product, salePrice, originalPrice, discountPercent, remaining, sold, quantity, endTime, startTime } = flashSale;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const soldPercent = Math.round((sold / quantity) * 100);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warn('⚠️ Vui lòng đăng nhập để thêm vào giỏ hàng!');
      return;
    }

    try {
      await axiosClient.post('/cart/add', {
        productId: product._id,
        quantity: 1
      });
      toast.success('✅ Đã thêm vào giỏ hàng!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate('/cart');
    } catch (error) {
      toast.error('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className={`flash-sale-card ${isUpcoming ? 'upcoming' : 'live'}`}>
      <div className="flash-sale-badge">
        <span className="discount-badge">-{discountPercent}%</span>
      </div>

      <div className="product-image">
        <img 
          src={product.image ? `http://localhost:5002/uploads/${product.image}` : 'https://via.placeholder.com/150x150?text=No+Image'} 
          alt={product.name}
        />
        {!isUpcoming && remaining <= 10 && (
          <div className="low-stock-badge">Chỉ còn {remaining}</div>
        )}
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        
        <div className="price-row">
          <span className="sale-price">{salePrice.toLocaleString()}đ</span>
          <span className="original-price">{originalPrice.toLocaleString()}đ</span>
        </div>

        {!isUpcoming && (
          <>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${soldPercent}%` }}></div>
              <span className="progress-text">Đã bán {sold}/{quantity}</span>
            </div>

            <div className="countdown-section">
              <span className="countdown-label">Kết thúc sau:</span>
              <CountdownTimer targetDate={endTime} onExpire={onExpire} />
            </div>

            <button 
              className="buy-now-btn" 
              onClick={handleAddToCart}
              disabled={remaining === 0}
            >
              {remaining === 0 ? 'Đã hết hàng' : 'Mua ngay'}
            </button>
          </>
        )}

        {isUpcoming && (
          <>
            <div className="countdown-section">
              <span className="countdown-label">Bắt đầu sau:</span>
              <CountdownTimer targetDate={startTime} />
            </div>
            <button className="notify-btn">
              🔔 Nhận thông báo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FlashSale;
