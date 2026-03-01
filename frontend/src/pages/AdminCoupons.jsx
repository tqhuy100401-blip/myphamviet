import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import './AdminCoupons.css';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderValue: 0,
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/coupons');
      setCoupons(res.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert('Lỗi khi tải danh sách mã khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        value: Number(formData.value),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
      };

      if (editingCoupon) {
        await axiosClient.put(`/coupons/${editingCoupon._id}`, data);
        alert('Cập nhật mã khuyến mãi thành công!');
      } else {
        await axiosClient.post('/coupons', data);
        alert('Tạo mã khuyến mãi thành công!');
      }

      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert(error.response?.data?.message || 'Lỗi khi lưu mã khuyến mãi');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount || '',
      startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
      endDate: new Date(coupon.endDate).toISOString().slice(0, 16),
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa mã khuyến mãi này?')) return;

    try {
      await axiosClient.delete(`/coupons/${id}`);
      alert('Xóa mã khuyến mãi thành công!');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Lỗi khi xóa mã khuyến mãi');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minOrderValue: 0,
      maxDiscount: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      isActive: true
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  return (
    <div className="admin-coupons">
      <div className="page-header">
        <h1>🎟️ Quản lý Mã khuyến mãi</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Đóng' : '+ Thêm mã mới'}
        </button>
      </div>

      {showForm && (
        <div className="coupon-form-card">
          <h2>{editingCoupon ? 'Sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Mã khuyến mãi *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  required
                  placeholder="VD: SUMMER2024"
                />
              </div>

              <div className="form-group">
                <label>Loại giảm giá *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (đ)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Giá trị *</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required
                  min="0"
                  placeholder={formData.type === 'percentage' ? '10' : '50000'}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mô tả *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                placeholder="VD: Giảm 10% cho đơn hàng từ 500k"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Đơn tối thiểu (đ)</label>
                <input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Giảm tối đa (đ)</label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                  min="0"
                  placeholder="Để trống = không giới hạn"
                />
              </div>

              <div className="form-group">
                <label>Số lần sử dụng</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  min="0"
                  placeholder="Để trống = không giới hạn"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày bắt đầu *</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày kết thúc *</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
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
              <button type="submit" className="btn-primary">
                {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="coupons-list">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : coupons.length === 0 ? (
          <div className="empty-state">Chưa có mã khuyến mãi nào</div>
        ) : (
          <div className="coupons-grid">
            {coupons.map(coupon => (
              <div key={coupon._id} className={`coupon-card ${!coupon.isActive ? 'inactive' : ''}`}>
                <div className="coupon-header">
                  <div className="coupon-code">{coupon.code}</div>
                  <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                    {coupon.isActive ? 'Hoạt động' : 'Tắt'}
                  </span>
                </div>

                <p className="coupon-description">{coupon.description}</p>

                <div className="coupon-details">
                  <div className="detail-item">
                    <span className="label">Giảm:</span>
                    <span className="value">
                      {coupon.type === 'percentage' 
                        ? `${coupon.value}%` 
                        : `${coupon.value.toLocaleString()}đ`
                      }
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Đơn tối thiểu:</span>
                    <span className="value">{coupon.minOrderValue.toLocaleString()}đ</span>
                  </div>

                  {coupon.maxDiscount && (
                    <div className="detail-item">
                      <span className="label">Giảm tối đa:</span>
                      <span className="value">{coupon.maxDiscount.toLocaleString()}đ</span>
                    </div>
                  )}

                  <div className="detail-item">
                    <span className="label">Sử dụng:</span>
                    <span className="value">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Thời gian:</span>
                    <span className="value time">
                      {new Date(coupon.startDate).toLocaleString('vi-VN')} 
                      <br />→ {new Date(coupon.endDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="coupon-actions">
                  <button className="btn-edit" onClick={() => handleEdit(coupon)}>
                    ✏️ Sửa
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(coupon._id)}>
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
