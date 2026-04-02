import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { FiBell, FiX, FiCheck, FiTrash2, FiPackage, FiGift, FiZap, FiInfo } from "react-icons/fi";
import "./Notifications.css";

function Notifications({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  // Lấy danh sách thông báo
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications", activeTab],
    queryFn: () => {
      const readFilter = activeTab === "unread" ? "false" : activeTab === "read" ? "true" : undefined;
      const params = readFilter ? `?read=${readFilter}` : "";
      return axiosClient.get(`/notifications${params}`).then(res => res.data);
    },
    enabled: isOpen
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  // Đánh dấu đã đọc
  const markAsReadMutation = useMutation({
    mutationFn: (id) => axiosClient.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    }
  });

  // Đánh dấu tất cả đã đọc
  const markAllReadMutation = useMutation({
    mutationFn: () => axiosClient.put("/notifications/mark-all-read"),
    onSuccess: () => {
      toast.success("Đã đánh dấu tất cả đã đọc");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    }
  });

  // Xóa thông báo
  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/notifications/${id}`),
    onSuccess: () => {
      toast.success("Đã xóa thông báo");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    }
  });

  // Xóa tất cả đã đọc
  const deleteReadMutation = useMutation({
    mutationFn: () => axiosClient.delete("/notifications/read/all"),
    onSuccess: () => {
      toast.success("Đã xóa tất cả thông báo đã đọc");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    }
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const getNotificationIcon = (type, icon) => {
    if (icon) return icon;
    const icons = {
      order: <FiPackage size={20} />,
      promotion: <FiGift size={20} />,
      flashsale: <FiZap size={20} />,
      system: <FiInfo size={20} />
    };
    return icons[type] || <FiBell size={20} />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      order: "#3b82f6",
      promotion: "#10b981",
      flashsale: "#f59e0b",
      system: "#6366f1"
    };
    return colors[type] || "#6b7280";
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return notifDate.toLocaleDateString("vi-VN");
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="notifications-header">
          <div className="d-flex align-items-center gap-2">
            <FiBell size={24} />
            <h5 className="mb-0">Thông báo</h5>
            {unreadCount > 0 && (
              <span className="badge bg-danger">{unreadCount}</span>
            )}
          </div>
          <button className="btn-close-notif" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="notifications-tabs">
          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Tất cả
          </button>
          <button
            className={`tab-btn ${activeTab === "unread" ? "active" : ""}`}
            onClick={() => setActiveTab("unread")}
          >
            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            className={`tab-btn ${activeTab === "read" ? "active" : ""}`}
            onClick={() => setActiveTab("read")}
          >
            Đã đọc
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="notifications-actions">
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                <FiCheck size={14} /> Đánh dấu tất cả đã đọc
              </button>
            )}
            {activeTab === "read" && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => deleteReadMutation.mutate()}
                disabled={deleteReadMutation.isPending}
              >
                <FiTrash2 size={14} /> Xóa tất cả
              </button>
            )}
          </div>
        )}

        {/* List */}
        <div className="notifications-list">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FiBell size={48} className="mb-3 opacity-25" />
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.read ? "unread" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div
                  className="notification-icon"
                  style={{ backgroundColor: `${getNotificationColor(notification.type)}20`, color: getNotificationColor(notification.type) }}
                >
                  {notification.icon || getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h6 className="notification-title">{notification.title}</h6>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{formatTime(notification.createdAt)}</span>
                </div>
                <button
                  className="btn-delete-notif"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotificationMutation.mutate(notification._id);
                  }}
                >
                  <FiX size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
