import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { FiPackage, FiCheckCircle, FiX, FiClock, FiEdit2 } from "react-icons/fi";

function AdminReturns() {
  const [filter, setFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const queryClient = useQueryClient();

  // Lấy danh sách yêu cầu đổi trả
  const { data, isLoading } = useQuery({
    queryKey: ["admin-returns", filter],
    queryFn: () => {
      const params = filter !== "all" ? { status: filter } : {};
      return axiosClient.get("/returns/all", { params }).then(res => res.data);
    }
  });

  // Xử lý yêu cầu
  const processReturnMutation = useMutation({
    mutationFn: ({ returnId, status, adminNote }) => 
      axiosClient.put(`/returns/process/${returnId}`, { status, adminNote }),
    onSuccess: () => {
      toast.success("✅ Xử lý yêu cầu thành công!");
      setShowModal(false);
      setSelectedReturn(null);
      setAdminNote("");
      setNewStatus("");
      queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi khi xử lý yêu cầu");
    }
  });

  const returns = data?.returns || [];
  const total = data?.total || 0;

  const handleProcess = (e) => {
    e.preventDefault();
    if (!newStatus) {
      toast.error("Vui lòng chọn trạng thái");
      return;
    }

    processReturnMutation.mutate({
      returnId: selectedReturn._id,
      status: newStatus,
      adminNote
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

  const filterOptions = [
    { value: "all", label: "Tất cả", count: total },
    { value: "pending", label: "Chờ xử lý" },
    { value: "approved", label: "Đã duyệt" },
    { value: "processing", label: "Đang xử lý" },
    { value: "completed", label: "Hoàn thành" },
    { value: "rejected", label: "Từ chối" },
    { value: "cancelled", label: "Đã hủy" }
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
          Quản lý đổi trả
        </h2>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Xử lý các yêu cầu đổi trả từ khách hàng
        </p>
      </div>

      {/* Filter */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                className={`btn btn-sm ${filter === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter(option.value)}
              >
                {option.label} {option.count !== undefined && `(${option.count})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Returns List */}
      {returns.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <FiPackage size={48} color="#a0aec0" className="mb-3" />
            <p className="text-muted">Không có yêu cầu đổi trả nào</p>
          </div>
        </div>
      ) : (
        <div className="row">
          {returns.map((returnItem) => (
            <div key={returnItem._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
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
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setSelectedReturn(returnItem);
                        setShowModal(true);
                        setAdminNote(returnItem.adminNote || "");
                        setNewStatus(returnItem.status);
                      }}
                    >
                      <FiEdit2 size={14} />
                    </button>
                  </div>

                  <div className="d-flex gap-3 mb-3">
                    <img
                      src={returnItem.product.image 
                        ? (returnItem.product.image.startsWith('http') 
                          ? returnItem.product.image 
                          : `http://localhost:5002${returnItem.product.image}`)
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
                        SL: {returnItem.quantity}
                      </small>
                      <div className="mt-1">
                        <span className={`badge bg-${returnItem.type === "return" ? "success" : "info"}`}>
                          {returnItem.type === "return" ? "Trả hàng" : "Đổi hàng"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <strong className="small">Khách hàng:</strong>
                    <div className="small text-muted">
                      {returnItem.user.name} ({returnItem.user.email})
                    </div>
                  </div>

                  <div className="mb-2">
                    <strong className="small">Lý do:</strong>
                    <div className="small text-muted">{returnItem.reason}</div>
                  </div>

                  <div className="mb-2">
                    <strong className="small">Mô tả:</strong>
                    <div className="small text-muted" style={{
                      maxHeight: "60px",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {returnItem.description}
                    </div>
                  </div>

                  {returnItem.images && returnItem.images.length > 0 && (
                    <div className="mb-2">
                      <strong className="small">Hình ảnh:</strong>
                      <div className="d-flex gap-2 mt-1 flex-wrap">
                        {returnItem.images.slice(0, 3).map((img, idx) => (
                          <img
                            key={idx}
                            src={img.startsWith('http') ? img : `http://localhost:5002${img}`}
                            alt={`return-${idx}`}
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #e2e8f0"
                            }}
                          />
                        ))}
                        {returnItem.images.length > 3 && (
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "4px",
                            background: "#e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            color: "#64748b"
                          }}>
                            +{returnItem.images.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {returnItem.type === "return" && (
                    <div className="mb-2">
                      <strong className="small">Số tiền hoàn:</strong>
                      <div className="small text-success fw-bold">
                        {returnItem.refundAmount.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  )}

                  <div className="small text-muted">
                    Tạo lúc: {new Date(returnItem.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal xử lý */}
      {showModal && selectedReturn && (
        <div 
          className="modal show d-block" 
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Xử lý yêu cầu đổi trả - Đơn #{selectedReturn.order.orderNumber}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                {/* Thông tin chi tiết */}
                <div className="row mb-4">
                  <div className="col-md-4">
                    <img
                      src={selectedReturn.product.image 
                        ? (selectedReturn.product.image.startsWith('http') 
                          ? selectedReturn.product.image 
                          : `http://localhost:5002${selectedReturn.product.image}`)
                        : "https://via.placeholder.com/200"}
                      alt={selectedReturn.product.name}
                      className="img-fluid rounded"
                    />
                  </div>
                  <div className="col-md-8">
                    <h6>{selectedReturn.product.name}</h6>
                    <p className="mb-2">
                      <strong>Số lượng:</strong> {selectedReturn.quantity}
                    </p>
                    <p className="mb-2">
                      <strong>Loại:</strong>{" "}
                      <span className={`badge bg-${selectedReturn.type === "return" ? "success" : "info"}`}>
                        {selectedReturn.type === "return" ? "Trả hàng" : "Đổi hàng"}
                      </span>
                    </p>
                    <p className="mb-2">
                      <strong>Khách hàng:</strong> {selectedReturn.user.name}
                    </p>
                    <p className="mb-2">
                      <strong>Email:</strong> {selectedReturn.user.email}
                    </p>
                    {selectedReturn.type === "return" && (
                      <p className="mb-2">
                        <strong>Số tiền hoàn:</strong>{" "}
                        <span className="text-success fw-bold">
                          {selectedReturn.refundAmount.toLocaleString("vi-VN")}đ
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Lý do:</strong>
                  <p className="text-muted">{selectedReturn.reason}</p>
                </div>

                <div className="mb-3">
                  <strong>Mô tả chi tiết:</strong>
                  <p className="text-muted">{selectedReturn.description}</p>
                </div>

                {selectedReturn.images && selectedReturn.images.length > 0 && (
                  <div className="mb-3">
                    <strong>Hình ảnh đính kèm:</strong>
                    <div className="d-flex gap-2 mt-2 flex-wrap">
                      {selectedReturn.images.map((img, idx) => (
                        <a 
                          key={idx}
                          href={img.startsWith('http') ? img : `http://localhost:5002${img}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={img.startsWith('http') ? img : `http://localhost:5002${img}`}
                            alt={`return-img-${idx}`}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "2px solid #e2e8f0",
                              cursor: "pointer"
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <hr />

                {/* Form xử lý */}
                <form onSubmit={handleProcess}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Trạng thái *</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="approved">Duyệt</option>
                      <option value="rejected">Từ chối</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Ghi chú cho khách hàng</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Nhập ghi chú (nếu có)..."
                      maxLength="500"
                    />
                    <small className="text-muted">{adminNote.length}/500 ký tự</small>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={processReturnMutation.isPending}
                    >
                      {processReturnMutation.isPending ? "Đang xử lý..." : "Lưu"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReturns;
