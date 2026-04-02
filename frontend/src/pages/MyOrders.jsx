

import axiosClient from "../api/axiosClient";
import { getImageUrl } from "../utils/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";

// Hàm chuyển đổi trạng thái đơn hàng sang text và màu sắc
function statusLabel(status) {
  switch (status) {
    case "pending":
      return { text: "Chờ xác nhận", color: "#f59e42" };
    case "confirmed":
      return { text: "Đã xác nhận", color: "#3b82f6" };
    case "shipping":
      return { text: "Đang giao", color: "#6366f1" };
    case "delivered":
      return { text: "Đã giao hàng", color: "#22c55e" };
    case "received":
      return { text: "Đã nhận hàng", color: "#16a34a" };
    case "cancelled":
      return { text: "Đã hủy", color: "#ef4444" };
    default:
      return { text: status, color: "#888" };
  }
}

function MyOrders() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => axiosClient.get("/orders/my-orders").then(res => res.data),
  });

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setCancelling(orderId);
    try {
      await axiosClient.put(`/orders/cancel/${orderId}`);
      toast.success("Đã hủy đơn hàng thành công!");
      queryClient.invalidateQueries(["my-orders"]);
    } catch (err) {
      toast.error("Có lỗi khi hủy đơn hàng!");
    } finally {
      setCancelling(null);
    }
  };

  // Xử lý xóa đơn hàng
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
    setDeleting(orderId);
    try {
      await axiosClient.delete(`/orders/${orderId}`);
      toast.success("Đã xóa đơn hàng thành công!");
      queryClient.invalidateQueries(["my-orders"]);
    } catch (err) {
      toast.error("Có lỗi khi xóa đơn hàng!");
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) {
    return <div className="text-center" style={{padding: '120px 0'}}>Đang tải đơn hàng...</div>;
  }

  // Kiểm tra không có đơn hàng
  if (!orders || (Array.isArray(orders) && orders.length === 0)) {
    return (
      <div className="my-orders-list">
        <h2 style={{marginBottom: 18, fontWeight: 700, color: '#4f46e5'}}>📋 Lịch sử đơn hàng</h2>
        <div className="text-center" style={{paddingTop: '120px', paddingBottom: '80px', minHeight: '40vh', background: 'rgba(255,255,255,0.95)'}}>
          <div style={{fontSize: '72px', marginBottom: '18px'}}>📦</div>
          <h4 style={{fontWeight: 800, color: '#5a43e4', marginBottom: 10, fontSize: 26}}>Không có đơn hàng nào</h4>
          <p style={{color: '#888', fontSize: 17}}>Bạn chưa có đơn hàng nào. Khi bạn đặt hàng, thông tin sẽ hiển thị tại đây.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-list">
      <h2 style={{marginBottom: 18, fontWeight: 700, color: '#4f46e5'}}>📋 Lịch sử đơn hàng</h2>
      {orders.map(order => {
        const st = statusLabel(order.status);
        return (
          <div key={order._id} className="my-order-card">
            <div className="my-order-header">
              <span className="my-order-id">Đơn #{order._id.slice(-8).toUpperCase()}</span>
              <span className="my-order-status" style={{background: st.color + '22', color: st.color}}>{st.text}</span>
              <span style={{fontSize: '0.98rem', color: '#888'}}>🕐 {new Date(order.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            <div className="my-order-body">
              <div className="my-order-info"><b>👤 Người nhận:</b> {order.customerName || 'N/A'}</div>
              <div className="my-order-info"><b>📞 SĐT:</b> {order.phone || 'N/A'}</div>
              <div className="my-order-info"><b>📍 Địa chỉ:</b> {order.shippingAddress}</div>
              {order.note && <div className="my-order-info" style={{color:'#888'}}><b>📝 Ghi chú:</b> {order.note}</div>}
              <table className="my-order-products" style={{width:'100%',marginTop:8}}>
                <thead>
                  <tr style={{background:'#f7fafc'}}>
                    <th>Hình</th><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <img
                          src={item.product?.image ? getImageUrl(item.product.image) : "https://via.placeholder.com/40"}
                          width="40" height="40"
                          style={{ objectFit: "cover", borderRadius: "4px" }}
                          alt={item.product?.name}
                        />
                      </td>
                      <td style={{fontSize: '13px'}}>{item.product?.name || "Sản phẩm đã xóa"}</td>
                      <td style={{fontSize: '13px'}}>{item.quantity}</td>
                      <td style={{fontSize: '13px'}}>{Number(item.product?.price || 0).toLocaleString('vi-VN')}đ</td>
                      <td className="fw-bold" style={{fontSize: '13px'}}>
                        {((item.product?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="my-order-actions">
                <span className="my-order-total">Tổng: {Number(order.totalPrice).toLocaleString('vi-VN')}đ</span>
                {order.status === 'pending' && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={cancelling === order._id}
                    style={{ minWidth: '120px' }}
                  >
                    {cancelling === order._id ? "Đang hủy..." : "❌ Hủy đơn hàng"}
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button
                    className="btn btn-sm"
                    onClick={() => navigate(`/return-request/${order._id}`)}
                    style={{
                      background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      minWidth: '140px',
                      boxShadow: '0 2px 8px rgba(237, 137, 54, 0.3)'
                    }}
                  >
                    🔄 Đổi trả hàng
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate('/my-returns')}
                    style={{ minWidth: '120px' }}
                  >
                    📋 Xem đổi trả
                  </button>
                )}
                {(order.status === 'cancelled' || order.status === 'delivered') && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={deleting === order._id}
                    style={{ minWidth: '100px' }}
                  >
                    {deleting === order._id ? "Đang xóa..." : "🗑️ Xóa"}
                  </button>
                )}
              </div>
              <div className="my-order-timeline">
                <div className="my-order-timeline-label">📜 Lịch sử đơn hàng:</div>
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  <div className="my-order-timeline-list">
                    {order.statusHistory.map((h, idx) => {
                      const stepSt = statusLabel(h.status);
                      return (
                        <div key={idx} className="my-order-timeline-item">
                          <span style={{color: stepSt.color, fontWeight: 500}}>{stepSt.text}</span>
                          <span style={{color:'#888'}}>{new Date(h.time).toLocaleString('vi-VN')}</span>
                          {h.note && <span style={{color:'#aaa', fontSize:'0.85em'}}>{h.note}</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {order.status === "cancelled" && (
                  <p className="text-danger text-center mt-2 fw-bold" style={{fontSize: '13px'}}>❌ Đơn hàng đã bị hủy</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MyOrders;

