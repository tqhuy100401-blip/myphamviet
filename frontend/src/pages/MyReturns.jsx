import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { FiPackage, FiAlertCircle, FiCheckCircle, FiClock, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

function MyReturns() {
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    quantity: 1,
    reason: "Sản phẩm bị lỗi",
    description: "",
    type: "return"
  });
  const queryClient = useQueryClient();

  // Lấy đơn hàng đã giao
  const { data: ordersData } = useQuery({
    queryKey: ["delivered-orders"],
    queryFn: () => axiosClient.get("/orders/my-orders").then(res => {
      const orders = res.data.orders || res.data;
      return orders.filter(order => order.status === "delivered");
    })
  });

  // Lấy danh sách yêu cầu đổi trả
  const { data: returnsData, isLoading } = useQuery({
    queryKey: ["my-returns"],
    queryFn: () => axiosClient.get("/returns/my-returns").then(res => res.data)
  });

  // Kiểm tra đủ điều kiện đổi trả
  const checkEligibilityMutation = useMutation({
    mutationFn: (orderId) => axiosClient.get(`/returns/check-eligibility/${orderId}`).then(res => res.data),
    onSuccess: (data, orderId) => {
      if (data.canReturn) {
        const order = deliveredOrders.find(o => o._id === orderId);
        setSelectedOrder(order);
        setShowForm(true);
      } else {
        toast.error(data.message);
      }
    }
  });

  // Tạo yêu cầu đổi trả
  const createReturnMutation = useMutation({
    mutationFn: (data) => axiosClient.post("/returns", data),
    onSuccess: () => {
      toast.success("✅ Tạo yêu cầu đổi trả thành công!");
      setShowForm(false);
      setSelectedOrder(null);
      setSelectedProduct(null);
      setFormData({
        quantity: 1,
        reason: "Sản phẩm bị lỗi",
        description: "",
        type: "return"
      });
      queryClient.invalidateQueries({ queryKey: ["my-returns"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi khi tạo yêu cầu");
    }
  });

  // Hủy yêu cầu
  const cancelReturnMutation = useMutation({
    mutationFn: (returnId) => axiosClient.put(`/returns/cancel/${returnId}`),
    onSuccess: () => {
      toast.success("✅ Đã hủy yêu cầu đổi trả");
      queryClient.invalidateQueries({ queryKey: ["my-returns"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi khi hủy yêu cầu");
    }
  });

  const deliveredOrders = ordersData || [];
  const returns = returnsData?.returns || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả chi tiết");
      return;
    }

    createReturnMutation.mutate({
      orderId: selectedOrder._id,
      productId: selectedProduct._id,
      ...formData
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#fbbf24", icon: FiClock, text: "Chờ xử lý" },
      approved: { color: "#10b981", icon: FiCheckCircle, text: "Đã duyệt" },
      rejected: { color: "#ef4444", icon: FiX, text: "Từ chối" },
      processing: { color: "#3b82f6", icon: FiPackage, text: "Đang xử lý" },
      completed: { color: "#10b981", icon: FiCheckCircle, text: "Hoàn thành" },
      cancelled: { color: "#6b7280", icon: FiX, text: "Đã hủy" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span style={{
        background: config.color,
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px"
      }}>
        <Icon size={12} /> {config.text}
      </span>
    );
  };

  const reasons = [
    "Sản phẩm bị lỗi",
    "Sản phẩm không đúng mô tả",
    "Giao sai sản phẩm",
    "Sản phẩm hư hỏng khi nhận",
    "Không còn nhu cầu",
    "Khác"
  ];

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "20px",
        padding: "32px",
        marginBottom: "30px",
        color: "#fff"
      }}>
        <h2 style={{ fontWeight: 800, marginBottom: "8px" }}>
          <FiPackage size={32} style={{ verticalAlign: "middle", marginRight: "12px" }} />
          Đổi trả hàng
        </h2>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Yêu cầu đổi trả trong vòng 7 ngày kể từ khi nhận hàng
        </p>
      </div>

      {/* Form tạo yêu cầu */}
      {!showForm ? (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Tạo yêu cầu đổi trả mới</h5>
            {deliveredOrders.length === 0 ? (
              <div className="text-center py-4">
                <FiAlertCircle size={48} color="#a0aec0" className="mb-3" />
                <p className="text-muted">Bạn chưa có đơn hàng đã giao nào</p>
                <Link to="/products" className="btn btn-primary mt-2">
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <>
                <p className="text-muted mb-3">Chọn đơn hàng bạn muốn đổi trả:</p>
                {deliveredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded p-3 mb-3"
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#f7fafc"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#fff"}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong>Đơn hàng #{order.orderNumber}</strong>
                        <div className="text-muted small">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => checkEligibilityMutation.mutate(order._id)}
                        disabled={checkEligibilityMutation.isPending}
                      >
                        Đổi trả
                      </button>
                    </div>
                    <div className="small">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-muted">
                          • {item.product?.name || "Sản phẩm"} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Thông tin đổi trả</h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setShowForm(false);
                  setSelectedOrder(null);
                  setSelectedProduct(null);
                }}
              >
                <FiX size={16} /> Hủy
              </button>
            </div>

            <div className="mb-3 p-3" style={{ background: "#f7fafc", borderRadius: "12px" }}>
              <strong>Đơn hàng #{selectedOrder.orderNumber}</strong>
              <div className="text-muted small">
                {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Chọn sản phẩm *</label>
                <select
                  className="form-select"
                  value={selectedProduct?._id || ""}
                  onChange={(e) => {
                    const product = selectedOrder.items.find(
                      item => item.product._id === e.target.value
                    );
                    setSelectedProduct(product.product);
                    setFormData({ ...formData, quantity: 1 });
                  }}
                  required
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {selectedOrder.items.map((item, idx) => (
                    <option key={idx} value={item.product._id}>
                      {item.product.name} (Số lượng: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Số lượng đổi trả *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max={selectedOrder.items.find(i => i.product._id === selectedProduct._id)?.quantity || 1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-bold">Loại yêu cầu *</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="type"
                      value="return"
                      checked={formData.type === "return"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <label className="form-check-label">Trả hàng hoàn tiền</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="type"
                      value="exchange"
                      checked={formData.type === "exchange"}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <label className="form-check-label">Đổi sản phẩm</label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Lý do *</label>
                <select
                  className="form-select"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                >
                  {reasons.map((reason, idx) => (
                    <option key={idx} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Mô tả chi tiết *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Mô tả chi tiết vấn đề của sản phẩm..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength="1000"
                  required
                />
                <small className="text-muted">{formData.description.length}/1000 ký tự</small>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={createReturnMutation.isPending}
              >
                {createReturnMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách yêu cầu đã tạo */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-4">Yêu cầu đổi trả của bạn</h5>
          
          {returns.length === 0 ? (
            <div className="text-center py-5">
              <FiPackage size={48} color="#a0aec0" className="mb-3" />
              <p className="text-muted">Bạn chưa có yêu cầu đổi trả nào</p>
            </div>
          ) : (
            <div className="row">
              {returns.map((returnItem) => (
                <div key={returnItem._id} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <small className="text-muted">
                            Đơn #{returnItem.order.orderNumber}
                          </small>
                          <div className="mt-1">
                            {getStatusBadge(returnItem.status)}
                          </div>
                        </div>
                        <div className="text-end">
                          <small className="text-muted">
                            {new Date(returnItem.createdAt).toLocaleDateString("vi-VN")}
                          </small>
                        </div>
                      </div>

                      <div className="d-flex gap-3 mb-3">
                        <img
                          src={returnItem.product.image 
                            ? `http://localhost:5000/uploads/${returnItem.product.image}`
                            : "https://via.placeholder.com/80"}
                          alt={returnItem.product.name}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px"
                          }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{returnItem.product.name}</h6>
                          <small className="text-muted">
                            Số lượng: {returnItem.quantity}
                          </small>
                          <div className="mt-1">
                            <span className={`badge bg-${returnItem.type === "return" ? "success" : "info"}`}>
                              {returnItem.type === "return" ? "Trả hàng" : "Đổi hàng"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-2">
                        <strong className="small">Lý do:</strong>
                        <div className="small text-muted">{returnItem.reason}</div>
                      </div>

                      <div className="mb-3">
                        <strong className="small">Mô tả:</strong>
                        <div className="small text-muted">{returnItem.description}</div>
                      </div>

                      {returnItem.adminNote && (
                        <div className="alert alert-info py-2 mb-2">
                          <strong className="small">Phản hồi từ admin:</strong>
                          <div className="small">{returnItem.adminNote}</div>
                        </div>
                      )}

                      {returnItem.status === "pending" && (
                        <button
                          className="btn btn-sm btn-outline-danger w-100"
                          onClick={() => {
                            if (window.confirm("Bạn có chắc muốn hủy yêu cầu này?")) {
                              cancelReturnMutation.mutate(returnItem._id);
                            }
                          }}
                          disabled={cancelReturnMutation.isPending}
                        >
                          Hủy yêu cầu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyReturns;
