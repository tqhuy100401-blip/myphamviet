
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";


const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", avatar: "", phone: "" });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ...bỏ toàn bộ state liên quan đến địa chỉ...


  useEffect(() => {
    fetchProfile();
  }, []);


  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/users/profile");
      setUser(res.data.user);
      setForm({
        name: res.data.user.name || "",
        email: res.data.user.email || "",
        avatar: res.data.user.avatar || "",
        phone: res.data.user.phone || ""
      });
    } catch (err) {
      setMessage("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  // ...bỏ toàn bộ logic fetch, xử lý, lưu địa chỉ...

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files && files[0]) {
      // Xử lý upload file ảnh, chuyển thành base64
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({ ...prev, avatar: ev.target.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Nếu avatar rỗng, giữ nguyên avatar cũ
      const submitData = { ...form };
      if (!form.avatar && user && user.avatar) {
        submitData.avatar = user.avatar;
      }
      const res = await axiosClient.put("/users/profile", submitData);
      setUser(res.data.user);
      setForm({
        name: res.data.user.name || "",
        email: res.data.user.email || "",
        avatar: res.data.user.avatar || "",
        phone: res.data.user.phone || ""
      });
      setEditMode(false);
      setMessage("Cập nhật thành công!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };


  if (loading && !user) return <div>Đang tải...</div>;


  return (
    <div className="user-profile-card" style={{
      maxWidth: 480,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 18,
      boxShadow: "0 4px 32px #0002",
      padding: 36,
      textAlign: "center"
    }}>
      <h2 style={{fontWeight: 800, fontSize: 28, marginBottom: 24, color: '#222'}}>Thông tin cá nhân</h2>
      {/* Thông tin cá nhân */}
      {user && !editMode && (
        <>
          <div style={{marginBottom: 20}}>
            <img src={user.avatar || "/avatar-default.png"} alt="avatar" style={{width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: '4px solid #e2e8f0', background: '#f7fafc'}} />
          </div>
          <div style={{textAlign: 'left', margin: '0 auto', maxWidth: 320}}>
            <div style={{marginBottom: 10}}><b>Họ tên:</b> <span style={{color:'#333'}}>{user.name}</span></div>
            <div style={{marginBottom: 10}}><b>Email:</b> <span style={{color:'#333'}}>{user.email}</span></div>
            <div style={{marginBottom: 10}}><b>Số điện thoại:</b> <span style={{color:'#333'}}>{user.phone}</span></div>
          </div>
          <button onClick={() => setEditMode(true)} style={{marginTop: 28, padding: '10px 32px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #667eea22'}}>Chỉnh sửa</button>
        </>
      )}
      {user && editMode && (
        <form onSubmit={handleSubmit} style={{textAlign: 'left', maxWidth: 320, margin: '0 auto'}}>
          <div style={{textAlign: "center", marginBottom: 20}}>
            <img src={form.avatar || "/avatar-default.png"} alt="avatar" style={{width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: '4px solid #e2e8f0', background: '#f7fafc'}} />
          </div>
          <div style={{marginBottom: 16}}>
            <label style={{fontWeight: 600}}>Họ tên</label>
            <input name="name" value={form.name} onChange={handleChange} required style={{width: "100%", borderRadius: 8, border: '1px solid #e2e8f0', padding: 10, marginTop: 4}} />
          </div>
          <div style={{marginBottom: 16}}>
            <label style={{fontWeight: 600}}>Email</label>
            <input name="email" value={form.email} onChange={handleChange} required style={{width: "100%", borderRadius: 8, border: '1px solid #e2e8f0', padding: 10, marginTop: 4}} />
          </div>
          <div style={{marginBottom: 16}}>
            <label style={{fontWeight: 600}}>Avatar (URL hoặc upload)</label>
            <input name="avatar" value={form.avatar} onChange={handleChange} style={{width: "100%", borderRadius: 8, border: '1px solid #e2e8f0', padding: 10, marginTop: 4, marginBottom: 8}} placeholder="Dán link ảnh hoặc upload" />
            <input type="file" accept="image/*" name="avatar" onChange={handleChange} style={{width: "100%"}} />
          </div>
          <div style={{marginBottom: 24}}>
            <label style={{fontWeight: 600}}>Số điện thoại</label>
            <input name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{10,11}" style={{width: "100%", borderRadius: 8, border: '1px solid #e2e8f0', padding: 10, marginTop: 4}} />
          </div>
          <div style={{display: "flex", gap: 16, justifyContent: 'center'}}>
            <button type="button" onClick={() => setEditMode(false)} style={{padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#333', fontWeight: 600, cursor: 'pointer'}}>Hủy</button>
            <button type="submit" style={{padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer'}}>Lưu</button>
          </div>
        </form>
      )}

      {/* Địa chỉ cá nhân đã bị ẩn theo yêu cầu */}

      {message && <div style={{marginTop: 20, color: message.includes('thành công') ? '#059669' : '#d00', fontWeight: 600}}>{message}</div>}
    </div>
  );
};

export default UserProfile;
