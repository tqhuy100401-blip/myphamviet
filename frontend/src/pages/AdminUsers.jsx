import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function AdminUsers() {
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => axiosClient.get("/admin/users").then(res => res.data),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => axiosClient.put(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      toast.success("✅ Cập nhật role thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => axiosClient.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      toast.success("🗑️ Đã xóa user!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    },
  });

  const changeRole = (userId, newRole) => {
    roleMutation.mutate({ userId, role: newRole });
  };

  const deleteUser = (userId, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa user "${name}"?`)) return;
    deleteMutation.mutate(userId);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">👥 Quản lý người dùng</h2>

      {users.length === 0 ? (
        <p className="text-muted">Chưa có người dùng nào.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user._id}>
                <td>{idx + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === "admin" ? "bg-danger" : "bg-secondary"}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  <select
                    className="form-select form-select-sm d-inline-block me-2"
                    style={{ width: "110px" }}
                    value={user.role}
                    onChange={(e) => changeRole(user._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteUser(user._id, user.name)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUsers;
