
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "./AdminOrders.css";

function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => axiosClient.get("/orders").then(res => res.data.orders || []),
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, status }) => axiosClient.put(`/orders/update/${orderId}`, { status }),
    onSuccess: () => {
      toast.success("✅ Cập nhật trạng thái thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["pending-orders-count"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders-count"] });
    },
    onError: (err) => {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    },
  });

  const updateStatus = (orderId, status) => {
    updateMutation.mutate({ orderId, status });
  };

  const statusBadge = (status) => {
    const map = {
      pending: { color: "#ecc94b", label: "Chờ xử lý" },
      confirmed: { color: "#4299e1", label: "Đã xác nhận" },
      shipping: { color: "#667eea", label: "Đang giao" },
      delivered: { color: "#38a169", label: "Đã giao" },
      cancelled: { color: "#e53e3e", label: "Đã hủy" }
    };
    return map[status] || { color: "#a0aec0", label: status };
  };

  return (
    <div className="admin-orders-list">
      <h2 style={{marginBottom: 18, fontWeight: 700, color: '#4f46e5'}}>🛒 Quản lý đơn hàng</h2>
      {orders.length === 0 ? (
        <p className="text-muted">Chưa có đơn hàng nào.</p>
      ) : (
        orders.map(order => {
          const badge = statusBadge(order.status);
          return (
            <div key={order._id} className="admin-order-card">
              <div className="admin-order-header">
                <span className="admin-order-id">Đơn #{order._id.slice(-6).toUpperCase()}</span>
                <span className="admin-order-status" style={{background: badge.color + '22', color: badge.color}}>
                  {badge.label}
                </span>
                <span style={{fontSize: '0.98rem', color: '#888'}}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="admin-order-body">
                <div className="admin-order-info"><b>Khách:</b> {order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})</div>
                <div className="admin-order-info"><b>👤 Người nhận:</b> {order.customerName || 'N/A'} — <b>📞</b> {order.phone || 'N/A'}</div>
                <div className="admin-order-info"><b>📍 Địa chỉ:</b> {order.shippingAddress}</div>
                {order.note && <div className="admin-order-info" style={{color:'#888'}}><b>📝 Ghi chú:</b> {order.note}</div>}
                <table className="admin-order-products" style={{width:'100%',marginTop:8}}>
                  <thead>
                    <tr style={{background:'#f7fafc'}}>
                      <th>Sản phẩm</th><th>SL</th><th>Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.product?.name || 'Sản phẩm đã xóa'}</td>
                        <td>{item.quantity}</td>
                        <td>{Number(item.product?.price || 0).toLocaleString('vi-VN')}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="admin-order-actions">
                  <span className="admin-order-total">Tổng: {Number(order.totalPrice).toLocaleString('vi-VN')}đ</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "150px", borderRadius: 8, border: '1px solid #e2e8f0' }}
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Xác nhận</option>
                    <option value="shipping">Đang giao</option>
                    <option value="delivered">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="admin-order-history">
                    <div className="admin-order-history-label">📜 Lịch sử trạng thái:</div>
                    <div className="admin-order-history-list">
                      {order.statusHistory.map((h, idx) => {
                        const hBadge = statusBadge(h.status);
                        return (
                          <div key={idx} className="admin-order-history-item">
                            <span style={{color: hBadge.color, fontWeight: 500}}>{h.note || h.status}</span>
                            <span style={{color:'#888'}}>{new Date(h.time).toLocaleString('vi-VN')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AdminOrders;
