import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const iconOptions = [
  { value: "FiTag", label: "🏷️ Tag", icon: "FiTag" },
  { value: "FiHeart", label: "💖 Trái tim", icon: "FiHeart" },
  { value: "FiStar", label: "⭐ Ngôi sao", icon: "FiStar" },
  { value: "FiDroplet", label: "💧 Giọt nước", icon: "FiDroplet" },
  { value: "FiSun", label: "☀️ Mặt trời", icon: "FiSun" },
  { value: "FiFeather", label: "🪶 Lông vũ", icon: "FiFeather" },
  { value: "FiPackage", label: "📦 Hộp", icon: "FiPackage" },
  { value: "FiGift", label: "🎁 Quà tặng", icon: "FiGift" },
];

function AdminCategories() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("FiTag");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIcon, setEditIcon] = useState("FiTag");
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axiosClient.get("/categories").then(res => res.data),
  });

  const addMutation = useMutation({
    mutationFn: (data) => axiosClient.post("/categories", data),
    onSuccess: () => {
      toast.success("✅ Thêm danh mục thành công!");
      setName(""); setDescription(""); setIcon("FiTag"); setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => axiosClient.put(`/categories/${id}`, data),
    onSuccess: () => {
      toast.success("✏️ Cập nhật danh mục thành công!");
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success("🗑️ Đã xóa danh mục!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    },
  });

  const handleAdd = () => {
    if (!name.trim()) return toast.warn("Vui lòng nhập tên danh mục!");
    addMutation.mutate({ name, description, icon });
  };

  const openEdit = (category) => {
    setEditId(category._id);
    setEditName(category.name);
    setEditDescription(category.description || "");
    setEditIcon(category.icon || "FiTag");
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editName.trim()) return toast.warn("Vui lòng nhập tên danh mục!");
    updateMutation.mutate({ id: editId, data: { name: editName, description: editDescription, icon: editIcon } });
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Xóa danh mục "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📂 Quản lý danh mục</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Danh sách danh mục ({categories.length})</h4>
        <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
          ➕ Thêm danh mục
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th style={{ width: "60px" }}>Icon</th>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Mô tả</th>
              <th style={{ width: "180px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">Chưa có danh mục nào</td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat._id}>
                  <td className="text-center" style={{ fontSize: "24px" }}>
                    {iconOptions.find(opt => opt.value === cat.icon)?.label.split(' ')[0] || '🏷️'}
                  </td>
                  <td><strong>{cat.name}</strong></td>
                  <td><code className="text-muted">{cat.slug}</code></td>
                  <td>{cat.description || <span className="text-muted">—</span>}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(cat)}>
                      ✏️ Sửa
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat._id, cat.name)}>
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM */}
      {showAddModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowAddModal(false)} />
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: "16px", overflow: "hidden" }}>
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #48BB78, #38A169)", color: "#fff" }}>
                  <h5 className="modal-title">➕ Thêm danh mục mới</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên danh mục</label>
                    <input className="form-control" placeholder="VD: Son môi, Kem dưỡng..." value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Biểu tượng</label>
                    <select className="form-select" value={icon} onChange={e => setIcon(e.target.value)}>
                      {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mô tả (không bắt buộc)</label>
                    <textarea className="form-control" rows="2" placeholder="Mô tả về danh mục..." value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                  <button className="btn btn-success" onClick={handleAdd} disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Đang thêm..." : "➕ Thêm danh mục"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL SỬA */}
      {showEditModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowEditModal(false)} />
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: "16px", overflow: "hidden" }}>
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff" }}>
                  <h5 className="modal-title">✏️ Sửa danh mục</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tên danh mục</label>
                    <input className="form-control" value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Biểu tượng</label>
                    <select className="form-select" value={editIcon} onChange={e => setEditIcon(e.target.value)}>
                      {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mô tả</label>
                    <textarea className="form-control" rows="2" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
                  <button className="btn btn-primary" onClick={handleUpdate} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Đang lưu..." : "💾 Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminCategories;
