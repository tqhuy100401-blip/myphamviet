import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Vui lòng nhập họ tên")
    .min(2, "Họ tên tối thiểu 2 ký tự")
    .max(50, "Họ tên tối đa 50 ký tự"),
  email: yup
    .string()
    .required("Vui lòng nhập email")
    .email("Email không hợp lệ"),
  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .max(30, "Mật khẩu tối đa 30 ký tự"),
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp"),
});

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosClient.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined
      });
      
      // Chuyển sang trang xác thực OTP ngay lập tức
      const userId = response.data.user.id || response.data.user._id;
      const userEmail = response.data.user.email;
      
      if (userId && userEmail) {
        navigate('/verify-otp', {
          state: {
            userId: userId,
            email: userEmail
          }
        });
        toast.info("📧 Vui lòng kiểm tra email và nhập mã OTP để hoàn tất đăng ký!", {
          autoClose: 4000
        });
      } else {
        toast.error("Lỗi: Không nhận được thông tin user. Vui lòng thử lại.");
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        toast.error(errors.map(e => e.message).join(" · "));
      } else {
        toast.error(err.response?.data?.message || "Đăng ký thất bại");
      }
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
          <div style={{ fontSize: "36px", marginBottom: "6px" }}>✨</div>
          <h4 style={{ fontWeight: 700, color: "#1a202c", margin: 0 }}>Tạo tài khoản</h4>
          <p style={{ color: "#718096", fontSize: "13px", margin: "4px 0 0" }}>Đăng ký để bắt đầu mua sắm</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#4a5568", marginBottom: "5px", display: "block" }}>Họ tên</label>
            <input
              style={inputStyle(errors.name)}
              placeholder="Nguyễn Văn A"
              {...register("name")}
              onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.background = "#fff"; }}
              onBlur={e => { if (!errors.name) { e.target.style.borderColor = "#e8ecf4"; } e.target.style.background = "#f8f9ff"; }}
            />
            {errors.name && <span style={errorStyle}>⚠ {errors.name.message}</span>}
          </div>

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

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#4a5568", marginBottom: "5px", display: "block" }}>
              Số điện thoại <span style={{ color: '#a0aec0', fontWeight: 400 }}>(không bắt buộc)</span>
            </label>
            <input
              style={inputStyle(errors.phone)}
              placeholder="0912345678"
              {...register("phone")}
              onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.background = "#fff"; }}
              onBlur={e => { if (!errors.phone) { e.target.style.borderColor = "#e8ecf4"; } e.target.style.background = "#f8f9ff"; }}
            />
            {errors.phone && <span style={errorStyle}>⚠ {errors.phone.message}</span>}
          </div>

          <div style={{ marginBottom: "14px" }}>
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

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#4a5568", marginBottom: "5px", display: "block" }}>Xác nhận mật khẩu</label>
            <input
              type="password"
              style={inputStyle(errors.confirmPassword)}
              placeholder="••••••••"
              {...register("confirmPassword")}
              onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.background = "#fff"; }}
              onBlur={e => { if (!errors.confirmPassword) { e.target.style.borderColor = "#e8ecf4"; } e.target.style.background = "#f8f9ff"; }}
            />
            {errors.confirmPassword && <span style={errorStyle}>⚠ {errors.confirmPassword.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "11px", border: "none", borderRadius: "12px",
              background: "linear-gradient(135deg, #48bb78, #38a169)",
              color: "#fff", fontWeight: 600, fontSize: "15px",
              cursor: "pointer", transition: "all .3s"
            }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(72,187,120,.4)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}
          >{loading ? "Đang xử lý..." : "Đăng ký"}</button>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#718096" }}>
          Đã có tài khoản? <a href="/login" style={{ color: "#667eea", fontWeight: 600, textDecoration: "none" }}>Đăng nhập</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
