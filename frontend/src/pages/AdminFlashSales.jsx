import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import CountdownTimer from '../components/CountdownTimer';
import { getImageUrl } from '../utils/helpers';
import './AdminFlashSales.css';

const AdminFlashSales = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFlashSale, setEditingFlashSale] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    product: '',
    salePrice: '',
    quantity: '',
    maxPerUser: 5,
    startTime: '',
    endTime: '',
    isActive: true
  });

  useEffect(() => {
    fetchFlashSales();
    fetchProducts();
  }, [filter]);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/flashsales', {
        params: { status: filter !== 'all' ? filter : undefined }
      });
      setFlashSales(res.data.flashSales || []);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get('/products');
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[DEBUG] handleSubmit triggered', formData);
    
    // Validate form
    if (!formData.name || formData.name.trim() === "") {
      // Scroll lên đầu form để thấy trường tên chương trình
      const modal = document.querySelector('.flashsale-form-modal');
      if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' });
      alert('Vui lòng nhập tên chương trình');
      return;
    }
    if (!formData.product) {
      alert('Vui lòng chọn sản phẩm');
      return;
    }
    if (!formData.salePrice || formData.salePrice <= 0) {
      alert('Vui lòng nhập giá sale hợp lệ');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      alert('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    if (endDate <= startDate) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }
    
    try {
      const selectedProduct = products.find(p => p._id === formData.product);

      // Chuyển startTime, endTime sang ISO string chuẩn UTC
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        product: formData.product,
        salePrice: Number(formData.salePrice),
        quantity: Number(formData.quantity),
        maxPerUser: Number(formData.maxPerUser),
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : '',
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : '',
        isActive: formData.isActive
      };

      console.log('Sending flash sale data:', data);
      console.log('Selected product:', selectedProduct);

      if (editingFlashSale) {
        await axiosClient.put(`/flashsales/${editingFlashSale._id}`, data);
        alert('Cập nhật flash sale thành công!');
      } else {
        await axiosClient.post('/flashsales', data);
        alert('Tạo flash sale thành công!');
      }

      resetForm();
      fetchFlashSales();
    } catch (error) {
      console.error('Error saving flash sale:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi lưu flash sale';
      alert(errorMessage);
    }
  };

  // Chuyển đổi ISO date về local string cho input datetime-local
  function toDatetimeLocalString(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }
  const handleEdit = (flashSale) => {
    console.log('[DEBUG] handleEdit called', flashSale);
    setEditingFlashSale(flashSale);
    setFormData({
      name: flashSale.name,
      description: flashSale.description || '',
      product: flashSale.product._id,
      salePrice: flashSale.salePrice,
      quantity: flashSale.quantity,
      maxPerUser: flashSale.maxPerUser,
      startTime: toDatetimeLocalString(flashSale.startTime),
      endTime: toDatetimeLocalString(flashSale.endTime),
      isActive: flashSale.isActive
    });
    setShowForm(true);
    setTimeout(() => {
      console.log('[DEBUG] showForm:', true, 'formData:', {
        name: flashSale.name,
        description: flashSale.description || '',
        product: flashSale.product._id,
        salePrice: flashSale.salePrice,
        quantity: flashSale.quantity,
        maxPerUser: flashSale.maxPerUser,
        startTime: toDatetimeLocalString(flashSale.startTime),
        endTime: toDatetimeLocalString(flashSale.endTime),
        isActive: flashSale.isActive
      });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa flash sale này?')) return;

    try {
      await axiosClient.delete(`/flashsales/${id}`);
      alert('Xóa flash sale thành công!');
      fetchFlashSales();
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      alert('Lỗi khi xóa flash sale');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      product: '',
      salePrice: '',
      quantity: '',
      maxPerUser: 5,
      startTime: '',
      endTime: '',
      isActive: true
    });
    setEditingFlashSale(null);
    setShowForm(false);
  };

  const selectedProduct = products.find(p => p._id === formData.product);

  return (
    <div className="admin-flashsales">
      <div className="page-header">
        <h1>⚡ Quản lý Flash Sale</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Đóng' : '+ Tạo Flash Sale'}
        </button>
      </div>

      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button 
          className={filter === 'live' ? 'active' : ''}
          onClick={() => setFilter('live')}
        >
          Đang diễn ra
        </button>
        <button 
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Sắp diễn ra
        </button>
        <button 
          className={filter === 'ended' ? 'active' : ''}
          onClick={() => setFilter('ended')}
        >
          Đã kết thúc
        </button>
      </div>

      {showForm && (
        <>
          <div className="modal-overlay" onClick={resetForm}></div>
          <div className="flashsale-form-modal">
            <div className="flashsale-form-card">
              <h2>{editingFlashSale ? 'Sửa Flash Sale' : 'Tạo Flash Sale mới'}</h2>
              <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên chương trình *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="VD: Flash Sale Cuối Tuần"
                onInvalid={e => { e.preventDefault(); console.log('Tên chương trình không hợp lệ'); }}
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Mô tả ngắn về chương trình"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sản phẩm *</label>
                <select
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  required
                  onInvalid={e => { e.preventDefault(); console.log('Chưa chọn sản phẩm'); }}
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} ({product.price.toLocaleString()}đ)
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="form-group">
                  <label>Giá gốc</label>
                  <input
                    type="text"
                    value={selectedProduct.price.toLocaleString() + 'đ'}
                    disabled
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giá sale *</label>
                <input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                  required
                  min="1"
                  placeholder="Giá sale"
                  onInvalid={e => { e.preventDefault(); console.log('Giá sale không hợp lệ'); }}
                />
              </div>

              {selectedProduct && formData.salePrice && (
                <div className="discount-preview">
                  <span className="label">Giảm:</span>
                  <span className="value">
                    {Math.round(((selectedProduct.price - formData.salePrice) / selectedProduct.price) * 100)}%
                  </span>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số lượng sản phẩm *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                  min="1"
                  onInvalid={e => { e.preventDefault(); console.log('Số lượng sản phẩm không hợp lệ'); }}
                />
              </div>

              <div className="form-group">
                <label>Mỗi người mua tối đa</label>
                <input
                  type="number"
                  value={formData.maxPerUser}
                  onChange={(e) => setFormData({...formData, maxPerUser: e.target.value})}
                  min="1"
                  onInvalid={e => { e.preventDefault(); console.log('Mỗi người mua tối đa không hợp lệ'); }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thời gian bắt đầu *</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                  onInvalid={e => { e.preventDefault(); console.log('Thời gian bắt đầu không hợp lệ'); }}
                />
              </div>

              <div className="form-group">
                <label>Thời gian kết thúc *</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  required
                  onInvalid={e => { e.preventDefault(); console.log('Thời gian kết thúc không hợp lệ'); }}
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                Kích hoạt ngay
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Hủy
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {editingFlashSale ? 'Cập nhật' : 'Tạo Flash Sale'}
              </button>
            </div>
              </form>
            </div>
          </div>
        </>
      )}

      <div className="flashsales-list">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : flashSales.length === 0 ? (
          <div className="empty-state">Không có flash sale nào</div>
        ) : (
          <div className="flashsales-grid">
            {flashSales.map(flashSale => (
              <FlashSaleAdminCard
                key={flashSale._id}
                flashSale={flashSale}
                onEdit={() => handleEdit(flashSale)}
                onDelete={() => handleDelete(flashSale._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FlashSaleAdminCard = ({ flashSale, onEdit, onDelete }) => {
  // Debug click event
  const handleEditClick = (e) => {
    console.log('[DEBUG] Edit button clicked for', flashSale);
    if (onEdit) onEdit(flashSale);
  };
  const { product, name, salePrice, originalPrice, discountPercent, sold, quantity, startTime, endTime, isActive } = flashSale;
  const now = new Date();
  const isLive = isActive && now >= new Date(startTime) && now <= new Date(endTime);
  const isUpcoming = isActive && now < new Date(startTime);
  const isEnded = now > new Date(endTime);
  const soldPercent = Math.round((sold / quantity) * 100);

  return (
    <div className={`flashsale-admin-card ${isLive ? 'live' : isUpcoming ? 'upcoming' : 'ended'}`}>
      <div className="card-header">
        <div className="status-badges">
          <span className={`status-badge ${isLive ? 'live' : isUpcoming ? 'upcoming' : 'ended'}`}>
            {isLive ? '🔴 Live' : isUpcoming ? '🕐 Sắp diễn ra' : '⚫ Đã kết thúc'}
          </span>
          {!isActive && <span className="status-badge inactive">Tắt</span>}
        </div>
        <div className="discount-badge">-{discountPercent}%</div>
      </div>

      <div className="product-row">
        <img 
          src={getImageUrl(product.image) || '/placeholder.jpg'} 
          alt={product.name}
          onError={(e) => e.target.src = '/placeholder.jpg'}
        />
        <div className="product-info">
          <h3>{name}</h3>
          <p className="product-name">{product.name}</p>
        </div>
      </div>

      <div className="price-row">
        <div>
          <span className="label">Giá sale:</span>
          <span className="sale-price">{salePrice.toLocaleString()}đ</span>
        </div>
        <div>
          <span className="label">Giá gốc:</span>
          <span className="original-price">{originalPrice.toLocaleString()}đ</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${soldPercent}%` }}></div>
        </div>
        <div className="progress-stats">
          <span>Đã bán: {sold}/{quantity}</span>
          <span>{soldPercent}%</span>
        </div>
      </div>

      <div className="time-section">
        {isLive && (
          <>
            <span className="time-label">Kết thúc sau:</span>
            <CountdownTimer targetDate={endTime} />
          </>
        )}
        {isUpcoming && (
          <>
            <span className="time-label">Bắt đầu sau:</span>
            <CountdownTimer targetDate={startTime} />
          </>
        )}
        {isEnded && (
          <div className="time-info">
            <div>Bắt đầu: {new Date(startTime).toLocaleString('vi-VN')}</div>
            <div>Kết thúc: {new Date(endTime).toLocaleString('vi-VN')}</div>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button className="btn-edit" onClick={handleEditClick}>✏️ Sửa</button>
        <button className="btn-delete" onClick={onDelete}>🗑️ Xóa</button>
      </div>
    </div>
  );
};

export default AdminFlashSales;
