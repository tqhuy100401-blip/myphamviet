import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from "recharts";

const STATUS_MAP = {
  pending: { label: "Chờ xử lý", color: "#ECC94B" },
  confirmed: { label: "Xác nhận", color: "#4299E1" },
  shipping: { label: "Đang giao", color: "#667eea" },
  delivered: { label: "Đã giao", color: "#48BB78" },
  cancelled: { label: "Đã hủy", color: "#F56565" },
};

const cardStyle = (gradient) => ({
  background: gradient, borderRadius: "16px", padding: "24px",
  color: "#fff", position: "relative", overflow: "hidden",
  boxShadow: "0 8px 25px rgba(0,0,0,0.1)", transition: "all .3s ease",
});

const chartCard = {
  background: "#fff", borderRadius: "16px", padding: "24px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)", height: "100%",
};

const CustomTooltipRevenue = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "#fff", padding: "12px 16px", borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)", border: "none"
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: "#1a202c" }}>📅 {label}</p>
        <p style={{ margin: "4px 0 0", color: "#667eea", fontWeight: 600 }}>
          💰 {Number(payload[0].value).toLocaleString("vi-VN")}đ
        </p>
        {payload[1] && (
          <p style={{ margin: "2px 0 0", color: "#48BB78", fontWeight: 600 }}>
            📦 {payload[1].value} đơn
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomTooltipBar = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "#fff", padding: "10px 14px", borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)"
      }}>
        <p style={{ margin: 0, fontWeight: 700, color: "#1a202c" }}>
          {payload[0].payload.fullName}
        </p>
        <p style={{ margin: "4px 0 0", color: "#764ba2", fontWeight: 600 }}>
          Đã bán: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => axiosClient.get("/admin/stats").then(res => res.data),
  });

  if (!stats) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2 text-muted">Đang tải dashboard...</p>
    </div>
  );

  // Xử lý data cho biểu đồ tròn (đơn hàng theo trạng thái)
  const pieData = (stats.ordersByStatus || []).map(s => ({
    name: STATUS_MAP[s._id]?.label || s._id,
    value: s.count,
    color: STATUS_MAP[s._id]?.color || "#A0AEC0",
  }));

  // Xử lý data cho biểu đồ doanh thu 7 ngày
  const today = new Date();
  const revenueData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const found = (stats.revenueByDay || []).find(r => r._id === key);
    revenueData.push({
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      revenue: found?.revenue || 0,
      orders: found?.orders || 0,
    });
  }

  // Data cho top sản phẩm bán chạy
  const topProducts = (stats.topProducts || []).map(p => ({
    name: p.name?.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
    fullName: p.name,
    sold: p.totalSold,
  }));

  const formatVND = (val) => val >= 1000000
    ? `${(val / 1000000).toFixed(1)}tr`
    : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val;

  return (
    <div className="container mt-4 mb-5">
      <style>{`
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 35px rgba(0,0,0,0.15) !important; }
        .stat-card::after {
          content: ""; position: absolute; top: -20px; right: -20px;
          width: 100px; height: 100px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
        }
        .stat-card::before {
          content: ""; position: absolute; bottom: -30px; right: 30px;
          width: 60px; height: 60px; border-radius: 50%;
          background: rgba(255,255,255,0.08);
        }
        .manage-card { transition: all .3s ease; border: none; border-radius: 16px; overflow: hidden; }
        .manage-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.1) !important; }
      `}</style>

      <div className="d-flex align-items-center mb-4">
        <h2 style={{ fontWeight: 800, color: "#1a202c", margin: 0 }}>📊 Admin Dashboard</h2>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="row mb-4 g-3">
        {[
          { icon: "👥", label: "Người dùng", value: stats.totalUsers, gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
          { icon: "📦", label: "Sản phẩm", value: stats.totalProducts, gradient: "linear-gradient(135deg, #48BB78, #38A169)" },
          { icon: "🛒", label: "Đơn hàng", value: stats.totalOrders, gradient: "linear-gradient(135deg, #ECC94B, #D69E2E)" },
          { icon: "💰", label: "Doanh thu", value: `${Number(stats.totalRevenue).toLocaleString("vi-VN")}đ`, gradient: "linear-gradient(135deg, #F56565, #E53E3E)" },
        ].map((c, i) => (
          <div className="col-md-3" key={i}>
            <div className="stat-card" style={cardStyle(c.gradient)}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{c.icon}</div>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.85 }}>{c.label}</p>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: "24px" }}>{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ===== CHARTS ROW 1 ===== */}
      <div className="row mb-4 g-3">
        {/* Doanh thu 7 ngày */}
        <div className="col-md-8">
          <div style={chartCard}>
            <h5 style={{ fontWeight: 700, color: "#1a202c", marginBottom: "20px" }}>
              📈 Doanh thu 7 ngày gần nhất
            </h5>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#718096" }} />
                <YAxis tickFormatter={formatVND} tick={{ fontSize: 12, fill: "#718096" }} />
                <Tooltip content={<CustomTooltipRevenue />} />
                <Area
                  type="monotone" dataKey="revenue" stroke="#667eea"
                  strokeWidth={3} fill="url(#colorRevenue)"
                  dot={{ r: 5, fill: "#667eea", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#764ba2" }}
                />
                <Area
                  type="monotone" dataKey="orders" stroke="#48BB78"
                  strokeWidth={2} fillOpacity={0} strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Đơn hàng theo trạng thái */}
        <div className="col-md-4">
          <div style={chartCard}>
            <h5 style={{ fontWeight: 700, color: "#1a202c", marginBottom: "20px" }}>
              🔄 Trạng thái đơn hàng
            </h5>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="45%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={4} dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} đơn`, ""]} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle" iconSize={10}
                    formatter={(val) => <span style={{ color: "#4a5568", fontSize: "12px" }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center mt-5">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* ===== CHARTS ROW 2 - TOP SẢN PHẨM ===== */}
      {topProducts.length > 0 && (
        <div className="row mb-4 g-3">
          <div className="col-12">
            <div style={chartCard}>
              <h5 style={{ fontWeight: 700, color: "#1a202c", marginBottom: "20px" }}>
                🏆 Top 5 sản phẩm bán chạy
              </h5>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#718096" }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: "#4a5568" }} />
                  <Tooltip content={<CustomTooltipBar />} />
                  <Bar dataKey="sold" radius={[0, 8, 8, 0]} barSize={28}>
                    {topProducts.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={["#667eea", "#764ba2", "#48BB78", "#ECC94B", "#F56565"][idx]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ===== MENU QUẢN LÝ ===== */}
      <h4 style={{ fontWeight: 700, color: "#1a202c", marginBottom: "16px" }}>⚙️ Quản lý</h4>
      <div className="row g-3">
        {[
          { icon: "📦", title: "Quản lý sản phẩm", desc: "Thêm, sửa, xóa sản phẩm", link: "/admin/products", color: "#667eea" },
          { icon: "�", title: "Quản lý danh mục", desc: "Thêm, sửa, xóa danh mục sản phẩm", link: "/admin/categories", color: "#9F7AEA" },
          { icon: "🛒", title: "Quản lý đơn hàng", desc: "Xem, cập nhật trạng thái đơn hàng", link: "/admin/orders", color: "#ECC94B" },
          { icon: "🔄", title: "Quản lý đổi trả", desc: "Xử lý yêu cầu đổi trả hàng", link: "/admin/returns", color: "#F56565" },
          { icon: "🎫", title: "Quản lý khuyến mãi", desc: "Tạo, quản lý mã giảm giá coupon", link: "/admin/coupons", color: "#ED8936" },
          { icon: "⚡", title: "Quản lý Flash Sale", desc: "Thiết lập chương trình flash sale", link: "/admin/flashsales", color: "#FC8181" },
          { icon: "👥", title: "Quản lý người dùng", desc: "Xem, phân quyền, xóa tài khoản", link: "/admin/users", color: "#48BB78" },
        ].map((m, i) => (
          <div className="col-md-3" key={i}>
            <div className="card manage-card shadow-sm h-100">
              <div className="card-body text-center" style={{ padding: "28px" }}>
                <div style={{
                  width: "60px", height: "60px", borderRadius: "16px",
                  background: `${m.color}15`, display: "inline-flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: "28px", marginBottom: "12px"
                }}>{m.icon}</div>
                <h5 style={{ fontWeight: 700, color: "#1a202c" }}>{m.title}</h5>
                <p className="text-muted" style={{ fontSize: "13px" }}>{m.desc}</p>
                <Link to={m.link} className="btn w-100" style={{
                  background: m.color, color: "#fff", borderRadius: "12px",
                  fontWeight: 600, padding: "10px", border: "none"
                }}>Truy cập →</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
