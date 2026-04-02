import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { FiUpload, FiX } from "react-icons/fi";

function ReturnRequest() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("return"); // return hoặc exchange
  const [selectedItems, setSelectedItems] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Kiểm tra đơn hàng có đủ điều kiện đổi trả không
  const { data: eligibility, isLoading } = useQuery({
    queryKey: ["return-eligibility", orderId],
    queryFn: () => axiosClient.get(`/returns/check-eligibility/${orderId}`).then(res => res.data),
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi kiểm tra điều kiện");
      navigate("/my-orders");
    }
  });

  // Tạo yêu cầu đổi trả
  const createReturnMutation = useMutation({
    mutationFn: (data) => axiosClient.post("/returns", data),
    onSuccess: () => {
      toast.success("✅ Yêu cầu đổi trả đã được gửi thành công!");
      navigate("/my-orders");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi tạo yêu cầu đổi trả");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }
    
    if (!reason) {
      toast.error("Vui lòng chọn lý do đổi trả");
      return;
    }

    if (!description || description.trim().length < 10) {
      toast.error("Vui lòng mô tả chi tiết vấn đề (ít nhất 10 ký tự)");
      return;
    }

    try {
      // Gửi từng sản phẩm (backend chỉ nhận 1 product mỗi request)
      const item = order.items.find(i => i.product._id === selectedItems[0]);
      
      const payload = {
        orderId,
        productId: item.product._id,
        quantity: item.quantity,
        reason,
        description,
        type
      };

      // Upload ảnh nếu có
      if (images.length > 0) {
        toast.info('Đang tải ảnh lên...');
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });

        const uploadResponse = await axiosClient.post('/returns/upload-images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log('Upload response:', uploadResponse.data);
        console.log('URLs type:', typeof uploadResponse.data.urls, Array.isArray(uploadResponse.data.urls));
        console.log('URLs:', uploadResponse.data.urls);
        
        // Đảm bảo URLs là array và filter các giá trị hợp lệ
        const urls = Array.isArray(uploadResponse.data.urls) 
          ? uploadResponse.data.urls.filter(url => typeof url === 'string' && url.length > 0)
          : [];
        
        payload.images = urls;
        console.log('Processed images:', payload.images);
      }
      
      console.log('Final payload:', JSON.stringify(payload, null, 2));
      createReturnMutation.mutate(payload);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi upload ảnh");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    // Kiểm tra kích thước file (max 5MB mỗi file trước khi upload)
    const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Mỗi ảnh tối đa 5MB");
      return;
    }

    // Tạo previews để hiển thị
    const previewPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    // Đợi tất cả preview đọc xong
    Promise.all(previewPromises).then(results => {
      setImages(prev => [...prev, ...files]); // Lưu file gốc
      setPreviews(prev => [...prev, ...results]); // Lưu preview
      toast.success(`Đã thêm ${files.length} ảnh`);
    }).catch(err => {
      toast.error("Lỗi xử lý ảnh: " + err.message);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSelectItem = (productId) => {
    // Chỉ cho chọn 1 sản phẩm
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? []
        : [productId]
    );
  };

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Đang kiểm tra điều kiện...</p>
      </div>
    );
  }

  if (!eligibility?.eligible) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <h4>⚠️ Không thể tạo yêu cầu đổi trả</h4>
          <p>{eligibility?.message || "Đơn hàng không đủ điều kiện đổi trả"}</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate("/my-orders")}>
            Quay lại đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const order = eligibility.order;

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">📦 Yêu cầu đổi trả</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5>Thông tin đơn hàng</h5>
          <p className="mb-1"><strong>Mã đơn:</strong> #{order._id.slice(-8).toUpperCase()}</p>
          <p className="mb-1"><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
          <p className="mb-0"><strong>Tổng tiền:</strong> {order.totalPrice?.toLocaleString("vi-VN")}đ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Chọn sản phẩm */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5>Chọn sản phẩm muốn đổi trả</h5>
            {order.items?.map((item) => (
              <div key={item.product._id} className="form-check mb-3 p-3 border rounded">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selectedItems.includes(item.product._id)}
                  onChange={() => toggleSelectItem(item.product._id)}
                  id={`item-${item.product._id}`}
                />
                <label className="form-check-label d-flex align-items-center gap-3" htmlFor={`item-${item.product._id}`}>
                  <img
                    src={
                      item.product.image
                        ? (item.product.image.startsWith('data:image')
                            ? item.product.image
                            : (item.product.image.startsWith('http')
                                ? item.product.image
                                : `http://localhost:5000/uploads/${item.product.image}`))
                        : "https://via.placeholder.com/80"
                    }
                    width="60"
                    height="60"
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                    alt={item.product.name}
                  />
                  <div>
                    <div className="fw-bold">{item.product.name}</div>
                    <div className="text-muted">Số lượng: {item.quantity} | Giá: {item.product.price?.toLocaleString("vi-VN")}đ</div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Lý do đổi trả */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">Loại yêu cầu</h5>
            <div className="mb-4">
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="type-return"
                  value="return"
                  checked={type === "return"}
                  onChange={(e) => setType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="type-return">
                  <strong>Trả hàng hoàn tiền</strong>
                  <div className="text-muted small">Bạn sẽ nhận lại tiền sau khi sản phẩm được trả về</div>
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="type"
                  id="type-exchange"
                  value="exchange"
                  checked={type === "exchange"}
                  onChange={(e) => setType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="type-exchange">
                  <strong>Đổi sản phẩm</strong>
                  <div className="text-muted small">Bạn sẽ nhận sản phẩm mới thay thế</div>
                </label>
              </div>
            </div>

            <h5 className="mb-3">Lý do đổi trả</h5>
            <select
              className="form-select mb-3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">-- Chọn lý do --</option>
              <option value="defective">Sản phẩm bị lỗi/hư hỏng</option>
              <option value="wrong_item">Giao sai sản phẩm</option>
              <option value="not_as_described">Không đúng mô tả</option>
              <option value="quality_issue">Chất lượng không tốt</option>
              <option value="other">Lý do khác</option>
            </select>

            <label className="form-label">Mô tả chi tiết <span className="text-danger">*</span></label>
            <textarea
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vui lòng mô tả chi tiết vấn đề của sản phẩm (tối thiểu 10 ký tự)..."
              required
            />
            <small className="text-muted">{description.length} ký tự</small>

            {/* Upload ảnh/video */}
            <div className="mt-3">
              <label className="form-label">📷 Tải ảnh sản phẩm lỗi (tối đa 5 ảnh)</label>
              <div className="d-flex flex-wrap gap-2">
                {previews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={preview} 
                      alt={`preview-${index}`}
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '2px solid #e2e8f0'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#e53e3e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label 
                    style={{
                      width: '100px',
                      height: '100px',
                      border: '2px dashed #cbd5e0',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: '#f7fafc',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.borderColor = '#667eea'}
                    onMouseLeave={e => e.target.style.borderColor = '#cbd5e0'}
                  >
                    <FiUpload size={24} color="#718096" />
                    <span style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
                      Tải ảnh
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
              <small className="text-muted d-block mt-1">
                Hình ảnh giúp chúng tôi xử lý yêu cầu nhanh hơn
              </small>
            </div>
          </div>
        </div>

        {/* Lưu ý */}
        <div className="alert alert-info">
          <h6>📋 Lưu ý:</h6>
          <ul className="mb-0">
            <li>Sản phẩm phải còn nguyên tem, nhãn, chưa qua sử dụng</li>
            <li>Thời gian đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</li>
            <li>Admin sẽ xem xét và phản hồi trong vòng 24-48h</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/my-orders")}
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createReturnMutation.isLoading}
          >
            {createReturnMutation.isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReturnRequest;
