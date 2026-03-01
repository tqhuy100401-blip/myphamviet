import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";

function Order() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    note: ""
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      toast.warning("Vui lòng đăng nhập để đặt hàng!");
      navigate("/login");
    }
  }, [token, navigate]);

  // Lấy giỏ hàng
  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => axiosClient.get("/cart").then(res => res.data),
    enabled: !!token,
  });

  const cart = Array.isArray(cartData) ? cartData : (cartData?.cart || []);
  const totalPrice = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => axiosClient.post("/orders/create", orderData),
    onSuccess: () => {
      toast.success("✅ Đặt hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setTimeout(() => navigate("/my-orders"), 1500);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Đặt hàng thất bại!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast.warning("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (cart.length === 0) {
      toast.warning("Giỏ hàng trống!");
      return;
    }

    createOrderMutation.mutate({
      customerName: formData.fullName,
      phone: formData.phone,
      shippingAddress: `${formData.address}, ${formData.city}`,
      note: formData.note
    });
  };

  if (!token) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">📦 Đặt hàng</h2>
      
      <div className="row">
        <div className="col-md-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Thông tin giao hàng</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Họ tên *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Số điện thoại *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0123456789"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Địa chỉ *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Nguyễn Trãi"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Thành phố *</label>
                  <select
                    className="form-select"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  >
                    <option value="">-- Chọn thành phố --</option>
                    <option value="TP.HCM">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    placeholder="Ghi chú thêm về đơn hàng..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-success w-100"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "Đang xử lý..." : "Đặt hàng"}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Đơn hàng của bạn</h5>
              
              {cart.length === 0 ? (
                <p className="text-muted">Giỏ hàng trống</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item._id} className="d-flex mb-3 pb-3 border-bottom">
                      <img 
                        src={item.product?.image ? `http://localhost:5002/uploads/${item.product.image}` : '/placeholder.jpg'} 
                        alt={item.product?.name}
                        style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}}
                      />
                      <div className="ms-3 flex-grow-1">
                        <h6 className="mb-1">{item.product?.name}</h6>
                        <small className="text-muted">x{item.quantity}</small>
                        <div className="text-success fw-bold">
                          {((item.product?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <h5 className="mb-0">Tổng cộng:</h5>
                    <h5 className="mb-0 text-success">
                      {totalPrice.toLocaleString('vi-VN')}đ
                    </h5>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;