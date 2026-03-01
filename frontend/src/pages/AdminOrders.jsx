import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => axiosClient.get("/orders").then(res => res.data),
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
      "pending": "bg-warning",
      "confirmed": "bg-info",
      "shipping": "bg-primary",
      "delivered": "bg-success",
      "cancelled": "bg-danger"
    };
    return map[status] || "bg-secondary";
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🛒 Quản lý đơn hàng</h2>

      {orders.length === 0 ? (
        <p className="text-muted">Chưa có đơn hàng nào.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <strong>Đơn #{order._id.slice(-6).toUpperCase()}</strong>
                <span className={`badge ${statusBadge(order.status)} ms-2`}>
                  {order.status}
                </span>
              </div>
              <small className="text-muted">
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </small>
            </div>
            <div className="card-body">
              <p><strong>Khách hàng:</strong> {order.user?.name || "N/A"} ({order.user?.email || "N/A"})</p>
              <p><strong>👤 Người nhận:</strong> {order.customerName || "N/A"} — <strong>📞</strong> {order.phone || "N/A"}</p>
              <p><strong>📍 Địa chỉ:</strong> {order.shippingAddress}</p>
              {order.note && <p className="text-muted"><strong>📝 Ghi chú:</strong> {order.note}</p>}

              <table className="table table-sm">
                <thead>
                  <tr><th>Sản phẩm</th><th>SL</th><th>Giá</th></tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product?.name || "Sản phẩm đã xóa"}</td>
                      <td>{item.quantity}</td>
                      <td>{Number(item.product?.price || 0).toLocaleString("vi-VN")}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="d-flex justify-content-between align-items-center">
                <h5 className="text-danger mb-0">Tổng: {Number(order.totalPrice).toLocaleString("vi-VN")}đ</h5>
                <div>
                  <select
                    className="form-select form-select-sm d-inline-block"
                    style={{ width: "160px" }}
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
              </div>

              {/* Lịch sử trạng thái */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-3 pt-3 border-top">
                  <p className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>📜 Lịch sử trạng thái:</p>
                  <div className="d-flex flex-wrap gap-2">
                    {order.statusHistory.map((h, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                        style={{ background: "#f7fafc", border: "1px solid #e2e8f0", fontSize: "0.78rem" }}>
                        <span className={`badge ${statusBadge(h.status)}`} style={{ fontSize: "0.7rem" }}>
                          {h.note || h.status}
                        </span>
                        <span className="text-muted">
                          {new Date(h.time).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminOrders;
