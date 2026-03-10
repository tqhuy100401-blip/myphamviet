import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (role !== "admin") return (
    <div className="container mt-5 text-center">
      <h2 className="text-danger">⛔ Truy cập bị từ chối</h2>
      <p>Bạn không có quyền truy cập trang này. Chỉ Admin mới được phép.</p>
    </div>
  );

  return children;
}

export default AdminRoute;
