import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getImageUrl } from "../utils/helpers";

function AdminProduct() {
  // State form thêm
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // State form sửa (modal)
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCurrentImage, setEditCurrentImage] = useState("");

  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => axiosClient.get("/products").then(res => res.data),
  });
  const products = Array.isArray(data) ? data : (data?.products || []);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axiosClient.get("/categories").then(res => res.data),
  });

  const addMutation = useMutation({
    mutationFn: (formData) => axiosClient.post("/products", formData),
    onSuccess: () => {
      toast.success("✅ Thêm sản phẩm thành công!");
      setName(""); setPrice(""); setDescription(""); setCategory(""); setStock(""); setImage(null); setImageUrl("");
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => axiosClient.put(`/products/${id}`, formData),
    onSuccess: () => {
      toast.success("✏️ Cập nhật sản phẩm thành công!");
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosClient.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success("🗑️ Đã xóa sản phẩm!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleAdd = () => {
    if (!name || !price) return toast.warn("Vui lòng nhập tên và giá!");
    if (!stock || isNaN(stock) || Number(stock) < 1) return toast.warn("Vui lòng nhập số lượng tồn kho hợp lệ!");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("stock", stock);
    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    } else if (image) {
      formData.append("image", image);
    }
    addMutation.mutate(formData);
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setEditName(p.name || "");
    setEditPrice(p.price || "");
    setEditDescription(p.description || "");
    setEditCategory(p.category || "");
    setEditStock(p.stock || "");
    setEditImage(null);
    setEditImageUrl("");
    setEditCurrentImage(p.image || "");
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (!editName || !editPrice) return toast.warn("Vui lòng nhập tên và giá!");
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    formData.append("description", editDescription);
    formData.append("category", editCategory);
    formData.append("stock", editStock);
    if (editImageUrl) {
      formData.append("imageUrl", editImageUrl);
    } else if (editImage) {
      formData.append("image", editImage);
    }
    updateMutation.mutate({ id: editId, formData });
  };

  const deleteProduct = (id, productName) => {
    if (!window.confirm(`Xóa sản phẩm "${productName}"?`)) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📦 Quản lý sản phẩm</h2>

      {/* Nút thêm sản phẩm */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Danh sách sản phẩm ({products.filter(p => p.stock > 0).length})</h4>
        <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
          ➕ Thêm sản phẩm
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Hình</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Danh mục</th>
            <th>Tồn kho</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.filter(p => p.stock > 0).map(p => (
            <tr key={p._id}>
              <td>
                <img
                  src={getImageUrl(p.image) || "https://via.placeholder.com/50"}
                  width="50" height="50"
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                  alt={p.name}
                />
              </td>
              <td>{p.name}</td>
              <td>{Number(p.price).toLocaleString("vi-VN")}đ</td>
              <td>{p.category || "-"}</td>
              <td>{p.stock}</td>
              <td>
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(p)}>
                  ✏️ Sửa
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(p._id, p.name)}>
                  🗑️ Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== MODAL THÊM SẢN PHẨM ===== */}
      {showAddModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowAddModal(false)} />
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: "16px", overflow: "hidden" }}>
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #48BB78, #38A169)", color: "#fff" }}>
                  <h5 className="modal-title">➕ Thêm sản phẩm mới</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Tên sản phẩm</label>
                      <input className="form-control" placeholder="Nhập tên sản phẩm" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Giá (VNĐ)</label>
                      <input className="form-control" type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Danh mục</label>
                      <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">Chọn danh mục...</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Tồn kho</label>
                      <input className="form-control" type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Mô tả</label>
                      <textarea className="form-control" rows="3" placeholder="Mô tả chi tiết sản phẩm..." value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Hình ảnh sản phẩm</label>
                      <div className="mb-2">
                        <input 
                          className="form-control mb-2" 
                          type="text" 
                          placeholder="Nhập URL ảnh (ví dụ: https://example.com/image.jpg)"
                          value={imageUrl}
                          onChange={e => {
                            setImageUrl(e.target.value);
                            setImage(null); // Clear file nếu nhập URL
                          }}
                        />
                        <div className="text-center text-muted my-1" style={{fontSize: "0.85rem"}}>- HOẶC -</div>
                        <input 
                          className="form-control" 
                          type="file" 
                          accept="image/*" 
                          onChange={e => {
                            setImage(e.target.files[0]);
                            setImageUrl(""); // Clear URL nếu chọn file
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                  <button className="btn btn-success" onClick={handleAdd} disabled={addMutation.isPending}>
                    {addMutation.isPending ? "Đang thêm..." : "➕ Thêm sản phẩm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== MODAL SỬA SẢN PHẨM ===== */}
      {showEditModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowEditModal(false)} />
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: "16px", overflow: "hidden" }}>
                <div className="modal-header" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "#fff" }}>
                  <h5 className="modal-title">✏️ Sửa sản phẩm</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)} />
                </div>
                <div className="modal-body">
                  {/* Ảnh hiện tại */}
                  {editCurrentImage && (
                    <div className="text-center mb-3">
                      <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>Ảnh hiện tại:</p>
                      <img
                        src={getImageUrl(editCurrentImage)}
                        alt="current"
                        style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "12px", border: "2px solid #e2e8f0" }}
                      />
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Tên sản phẩm</label>
                      <input className="form-control" value={editName} onChange={e => setEditName(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Giá (VNĐ)</label>
                      <input className="form-control" type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Danh mục</label>
                      <select className="form-select" value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                        <option value="">Chọn danh mục...</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Tồn kho</label>
                      <input className="form-control" type="number" value={editStock} onChange={e => setEditStock(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Mô tả</label>
                      <textarea className="form-control" rows="3" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Đổi ảnh mới (không bắt buộc)</label>
                      <div className="mb-2">
                        <input 
                          className="form-control mb-2" 
                          type="text" 
                          placeholder="Nhập URL ảnh (ví dụ: https://example.com/image.jpg)"
                          value={editImageUrl}
                          onChange={e => {
                            setEditImageUrl(e.target.value);
                            setEditImage(null); // Clear file nếu nhập URL
                          }}
                        />
                        <div className="text-center text-muted my-1" style={{fontSize: "0.85rem"}}>- HOẶC -</div>
                        <input 
                          className="form-control" 
                          type="file" 
                          accept="image/*" 
                          onChange={e => {
                            setEditImage(e.target.files[0]);
                            setEditImageUrl(""); // Clear URL nếu chọn file
                          }}
                        />
                      </div>
                    </div>
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
export default AdminProduct;
