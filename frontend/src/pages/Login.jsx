import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { getGuestCart, clearGuestCart } from "../utils/cartHelper";
import { useLocation } from "react-router-dom";
import logger from "../utils/logger";

const schema = yup.object().shape({
  email: yup
    .string()
    .required("Vui lòng nhập email")
    .email("Email không hợp lệ"),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

function Login() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const syncGuestCartToBackend = async (token) => {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) return;

    try {
      // Sync each item from guest cart to backend
      for (const item of guestCart) {
        await axiosClient.post("/cart/add", {
          productId: item.product._id,
          quantity: item.quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Clear guest cart after syncing
      clearGuestCart();
      logger.success("Guest cart synced successfully");
    } catch (err) {
      logger.error("Error syncing guest cart:", err);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/login", data);
      const token = res.data.token;
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userName", res.data.user.name);
      
      // Sync guest cart to backend
      await syncGuestCartToBackend(token);
      
      toast.success("Đăng nhập thành công!");
      
      // Redirect to previous page or home
      const from = location.state?.from || "/";
      setTimeout(() => { window.location.href = from; }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    } finally { setLoading(false); }
  };

  const inputStyle = (hasError) => ({
    width: "100%", padding: "10px 14px",
    border: `2px solid ${hasError ? "#e53e3e" : "#e8ecf4"}`,
    borderRadius: "12px", fontSize: "14px", outline: "none",
    background: "#f8f9ff", transition: "all .2s"
  });

  const errorStyle = { color: "#e53e3e", fontSize: "12px", marginTop: "4px", display: "block" };

  return (
    <div style={{
      minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    }}>
      <div style={{
        width: "100%", maxWidth: "380px", padding: "32px",
        background: "#fff", borderRadius: "20px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "36px", marginBottom: "6px" }}>💄</div>
          <h4 style={{ fontWeight: 700, color: "#1a202c", margin: 0 }}>Đăng nhập</h4>
          <p style={{ color: "#718096", fontSize: "13px", margin: "4px 0 0" }}>Chào mừng bạn quay trở lại!</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#4a5568", marginBottom: "5px", display: "block" }}>Email</label>
            <input
              style={inputStyle(errors.email)}
              placeholder="you@example.com"
              {...register("email")}
              onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.background = "#fff"; }}
              onBlur={e => { if (!errors.email) { e.target.style.borderColor = "#e8ecf4"; } e.target.style.background = "#f8f9ff"; }}
            />
            {errors.email && <span style={errorStyle}>⚠ {errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#4a5568", marginBottom: "5px", display: "block" }}>Mật khẩu</label>
            <input
              type="password"
              style={inputStyle(errors.password)}
              placeholder="••••••••"
              {...register("password")}
              onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.background = "#fff"; }}
              onBlur={e => { if (!errors.password) { e.target.style.borderColor = "#e8ecf4"; } e.target.style.background = "#f8f9ff"; }}
            />
            {errors.password && <span style={errorStyle}>⚠ {errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "11px", border: "none", borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "#fff", fontWeight: 600, fontSize: "15px",
              cursor: "pointer", transition: "all .3s"
            }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(102,126,234,.4)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
          >{loading ? "Đang xử lý..." : "Đăng nhập"}</button>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#718096" }}>
          Chưa có tài khoản? <a href="/register" style={{ color: "#667eea", fontWeight: 600, textDecoration: "none" }}>Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
