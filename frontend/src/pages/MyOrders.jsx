import axiosClient from "../api/axiosClient";
import { useQuery } from "@tanstack/react-query";

function MyOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => axiosClient.get("/orders/my-orders").then(res => res.data),
  });

  const statusLabel = (status) => {
    const map = {
      "pending": { text: "Chờ xử lý", color: "bg-warning text-dark" },
      "confirmed": { text: "Đã xác nhận", color: "bg-info" },
      "shipping": { text: "Đang giao hàng", color: "bg-primary" },
      "delivered": { text: "Đã giao thành công", color: "bg-success" },
      "cancelled": { text: "Đã hủy", color: "bg-danger" }
    };
    return map[status] || { text: status, color: "bg-secondary" };
  };

  if (isLoading) return <p className="container mt-4">Đang tải...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📋 Lịch sử đơn hàng</h2>

      {orders.length === 0 ? (
        <div className="text-center">
          <p className="text-muted">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        orders.map(order => {
          const st = statusLabel(order.status);
          return (
            <div key={order._id} className="card mb-4 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>Đơn hàng #{order._id.slice(-8).toUpperCase()}</strong>
                  <span className={`badge ${st.color} ms-2`}>{st.text}</span>
                </div>
                <small className="text-muted">
                  🕐 {new Date(order.createdAt).toLocaleString("vi-VN")}
                </small>
              </div>

              <div className="card-body">
                {/* Thông tin giao hàng */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <p className="mb-1"><strong>👤 Người nhận:</strong></p>
                    <p>{order.customerName || "N/A"}</p>
                  </div>
                  <div className="col-md-4">
                    <p className="mb-1"><strong>📞 SĐT:</strong></p>
                    <p>{order.phone || "N/A"}</p>
                  </div>
                  <div className="col-md-4">
                    <p className="mb-1"><strong>📍 Địa chỉ:</strong></p>
                    <p>{order.shippingAddress}</p>
                  </div>
                </div>

                {order.note && (
                  <p className="text-muted"><strong>📝 Ghi chú:</strong> {order.note}</p>
                )}

                {/* Chi tiết sản phẩm */}
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Hình</th>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <img
                            src={item.product?.image ? `http://localhost:5000/uploads/${item.product.image}` : "https://via.placeholder.com/40"}
                            width="40" height="40"
                            style={{ objectFit: "cover", borderRadius: "4px" }}
                            alt={item.product?.name}
                          />
                        </td>
                        <td>{item.product?.name || "Sản phẩm đã xóa"}</td>
                        <td>{item.quantity}</td>
                        <td>{Number(item.product?.price || 0).toLocaleString("vi-VN")}đ</td>
                        <td className="fw-bold">
                          {((item.product?.price || 0) * item.quantity).toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-end">
                  <h5>
                    Tổng thanh toán: <span className="text-danger">{Number(order.totalPrice).toLocaleString("vi-VN")}đ</span>
                  </h5>
                </div>

                {/* Timeline trạng thái - lịch sử thực tế */}
                <div className="mt-3">
                  <p className="fw-bold mb-2">📜 Lịch sử đơn hàng:</p>
                  {order.statusHistory && order.statusHistory.length > 0 ? (
                    <div style={{ position: "relative", paddingLeft: "28px" }}>
                      {/* Đường kẻ dọc */}
                      <div style={{
                        position: "absolute", left: "10px", top: "6px", bottom: "6px",
                        width: "2px", background: "#e2e8f0", borderRadius: "2px"
                      }} />
                      {order.statusHistory.map((h, idx) => {
                        const isLast = idx === order.statusHistory.length - 1;
                        const stepSt = statusLabel(h.status);
                        return (
                          <div key={idx} className="d-flex align-items-start mb-3" style={{ position: "relative" }}>
                            {/* Chấm tròn */}
                            <div style={{
                              position: "absolute", left: "-22px", top: "4px",
                              width: "14px", height: "14px", borderRadius: "50%",
                              background: isLast ? (h.status === "cancelled" ? "#e53e3e" : "#48BB78") : "#cbd5e0",
                              border: isLast ? "3px solid " + (h.status === "cancelled" ? "#feb2b2" : "#c6f6d5") : "2px solid #e2e8f0",
                              zIndex: 1
                            }} />
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <span className={`badge ${stepSt.color}`} style={{ fontSize: "0.75rem" }}>{stepSt.text}</span>
                                {isLast && <span className="badge bg-dark" style={{ fontSize: "0.65rem" }}>Hiện tại</span>}
                              </div>
                              <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>
                                🕐 {new Date(h.time).toLocaleString("vi-VN")}
                              </small>
                              {h.note && <small className="text-muted">{h.note}</small>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fallback timeline tĩnh nếu đơn cũ chưa có statusHistory */
                    <div className="d-flex gap-2 flex-wrap">
                      {["pending", "confirmed", "shipping", "delivered"].map((step, idx) => {
                        const steps = ["pending", "confirmed", "shipping", "delivered"];
                        const currentIdx = steps.indexOf(order.status);
                        const isActive = idx <= currentIdx && order.status !== "cancelled";
                        const labels = ["Chờ xử lý", "Xác nhận", "Đang giao", "Đã giao"];
                        return (
                          <div key={step} className="text-center" style={{ flex: 1 }}>
                            <div
                              className={`rounded-circle d-inline-flex align-items-center justify-content-center ${isActive ? "bg-success text-white" : "bg-light text-muted border"}`}
                              style={{ width: "36px", height: "36px", fontSize: "14px" }}
                            >
                              {isActive ? "✓" : idx + 1}
                            </div>
                            <small className="d-block mt-1" style={{ fontSize: "11px" }}>{labels[idx]}</small>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {order.status === "cancelled" && (
                    <p className="text-danger text-center mt-2 fw-bold">❌ Đơn hàng đã bị hủy</p>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default MyOrders;
