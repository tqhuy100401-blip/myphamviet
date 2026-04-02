import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { useState } from "react";
import { toast } from "react-toastify";
import "./AdminReviews.css";

function AdminReviews() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [product, setProduct] = useState("");
  const [user, setUser] = useState("");
  const [rating, setRating] = useState("");
  const [limit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", page, product, user, rating],
    queryFn: () =>
      axiosClient
        .get("/admin/reviews", {
          params: { page, limit, product, user, rating },
        })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  const mutation = useMutation({
    mutationFn: (reviewId) => axiosClient.delete(`/admin/reviews/${reviewId}`),
    onSuccess: () => {
      toast.success("Đã xóa đánh giá!");
      queryClient.invalidateQueries(["admin-reviews"]);
    },
    onError: () => toast.error("Lỗi khi xóa đánh giá!"),
  });

  return (
    <div className="admin-reviews-page">
      <h2>Quản lý đánh giá sản phẩm</h2>
      <div className="admin-reviews-filters">
        <input
          placeholder="ID sản phẩm"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />
        <input
          placeholder="ID user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">Tất cả sao</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r} sao</option>
          ))}
        </select>
        <button onClick={() => setPage(1)}>Lọc</button>
      </div>
      {isLoading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <table className="admin-reviews-table">
            <thead>
              <tr>
                <th>Tên người đánh giá</th>
                <th>Sản phẩm</th>
                <th>User ID</th>
                <th>Số sao</th>
                <th>Bình luận</th>
                <th>Ngày</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.reviews?.map((r) => (
                <tr key={r._id}>
                  <td>{r.user?.name || r.user?.email || r.user}</td>
                  <td>{r.product?.name || r.product}</td>
                  <td>{typeof r.user === 'object' ? r.user?._id : r.user}</td>
                  <td>{r.rating} ⭐</td>
                  <td>{r.comment}</td>
                  <td>{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => mutation.mutate(r._id)}
                      disabled={mutation.isLoading}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-reviews-pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trang trước
            </button>
            <span>
              Trang {page} / {Math.ceil((data?.total || 1) / limit)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil((data?.total || 1) / limit)}
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminReviews;
