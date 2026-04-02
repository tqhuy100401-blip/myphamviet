const chartCard = {
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  height: "100%",
  border: '1px solid rgba(255,255,255,0.1)'
};
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
  boxShadow: "0 8px 25px rgba(0,0,0,0.1)", transition: "all .3s ease"
});

const ADMIN_SIDEBAR_MENUS = [
  { icon: "📦", title: "Sản phẩm", link: "/admin/products", color: "#667eea" },
  { icon: "📂", title: "Danh mục", link: "/admin/categories", color: "#9F7AEA" },
  { icon: "🛒", title: "Đơn hàng", link: "/admin/orders", color: "#ECC94B" },
  { icon: "🔄", title: "Đổi trả", link: "/admin/returns", color: "#F56565" },
  { icon: "🎫", title: "Khuyến mãi", link: "/admin/coupons", color: "#ED8936" },
  { icon: "⚡", title: "Flash Sale", link: "/admin/flashsales", color: "#FC8181" },
  { icon: "⭐", title: "Đánh giá", link: "/admin/reviews", color: "#f59e42" },
  { icon: "👥", title: "Người dùng", link: "/admin/users", color: "#48BB78" },
];

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
    <div className="container-fluid mt-4 mb-5" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0a0a0a 100%)',
      padding: '32px 24px',
      marginTop: '0 !important'
    }}>
      <style>{`
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 35px rgba(102, 126, 234, 0.3) !important; }
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
        .sidebar-menu { 
          position: sticky; 
          top: 20px; 
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 16px; 
          padding: 24px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          height: fit-content;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .manage-card { 
          transition: all .3s ease; 
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 12px; 
          overflow: hidden;
          margin-bottom: 12px;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
        }
        .manage-card:hover { 
          transform: translateX(8px); 
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3) !important;
          background: rgba(255,255,255,0.08);
          border-color: rgba(102, 126, 234, 0.4);
        }
      `}</style>

      <div className="row">
        {/* SIDEBAR - MENU QUẢN LÝ */}
        <div className="col-md-3">
          <div className="sidebar-menu">
            <h4 style={{ fontWeight: 700, color: "#fff", marginBottom: "20px", fontSize: "18px" }}>
              ⚙️ Quản lý
            </h4>
            {ADMIN_SIDEBAR_MENUS.map((m, i) => (
              <Link 
                to={m.link} 
                key={i} 
                style={{ textDecoration: "none" }}
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  window.location.href = m.link;
                }}
              >
                <div className="card manage-card shadow-sm">
                  <div className="card-body" style={{ padding: "14px 16px" }}>
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "10px",
                        background: `${m.color}30`, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "20px", marginRight: "12px", flexShrink: 0
                      }}>{m.icon}</div>
                      <div style={{ flex: 1 }}>
                        <h6 style={{ 
                          fontWeight: 600, 
                          color: "#fff", 
                          margin: 0, 
                          fontSize: "14px" 
                        }}>{m.title}</h6>
                      </div>
                      <div style={{ color: m.color, fontSize: "16px" }}>→</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="col-md-9">
          <div className="d-flex align-items-center mb-4">
            <h2 style={{ fontWeight: 800, color: "#fff", margin: 0 }}>📊 Admin Dashboard</h2>
          </div>

      {/* ===== STAT CARDS ===== */}
      <div className="row mb-4 g-3">
        {[
          { icon: "👥", label: "Người dùng", value: stats.totalUsers, gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
          { icon: "📦", label: "Sản phẩm", value: stats.totalProducts, gradient: "linear-gradient(135deg, #48BB78, #38A169)" },
          { icon: "🛒", label: "Đơn hàng", value: stats.totalOrders, gradient: "linear-gradient(135deg, #ECC94B, #D69E2E)" },
          { icon: "💰", label: "Doanh thu", value: `${Number(stats.totalRevenue).toLocaleString("vi-VN")}đ`, gradient: "linear-gradient(135deg, #F56565, #E53E3E)" },
        ].map((c, i) => (
          <div className="col-md-6 col-lg-3" key={i}>
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
        <div className="col-lg-8">
          <div style={chartCard}>
            <h5 style={{ fontWeight: 700, color: "#fff", marginBottom: "20px" }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} />
                <YAxis tickFormatter={formatVND} tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} />
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
        <div className="col-lg-4">
          <div style={chartCard}>
            <h5 style={{ fontWeight: 700, color: "#fff", marginBottom: "20px" }}>
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
                    formatter={(val) => <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "80px" }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* ===== CHARTS ROW 2 - TOP SẢN PHẨM ===== */}
      {topProducts.length > 0 && (
        <div className="row mb-4 g-3">
          <div className="col-12">
            <div style={chartCard}>
              <h5 style={{ fontWeight: 700, color: "#fff", marginBottom: "20px" }}>
                🏆 Top 5 sản phẩm bán chạy
              </h5>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: "rgba(255,255,255,0.8)" }} />
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
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
