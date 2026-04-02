import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { 
  getGuestCart, 
  removeFromGuestCart, 
  updateGuestCartQuantity, 
  clearGuestCart 
} from "../utils/cartHelper";
import { getImageUrl } from "../utils/helpers";

const modalOverlay = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1050, animation: "fadeIn .25s ease"
};

const modalBox = {
  background: "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)",
  borderRadius: "18px", width: "92%", maxWidth: "420px",
  boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden",
  animation: "slideUp .35s cubic-bezier(.16,1,.3,1)",
  maxHeight: "90vh", overflowY: "auto"
};

const inputStyle = {
  border: "2px solid #e8ecf4", borderRadius: "10px", padding: "9px 12px",
  fontSize: "14px", transition: "all .2s ease", outline: "none", width: "100%",
  background: "#f8f9ff"
};

const labelStyle = {
  fontSize: "12px", fontWeight: 600, color: "#4a5568",
  marginBottom: "4px", display: "block", letterSpacing: "0.3px"
};

function Cart() {
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false); // Modal chọn phương thức thanh toán
  const [showQRCode, setShowQRCode] = useState(false); // Modal hiển thị QR code
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // URL QR code
  const [currentOrderId, setCurrentOrderId] = useState(null); // OrderId hiện tại
  const [currentOrderTotal, setCurrentOrderTotal] = useState(0); // Tổng tiền hiện tại
  const [bankInfo, setBankInfo] = useState(null); // Thông tin ngân hàng
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [ordering, setOrdering] = useState(false);
  const [guestCart, setGuestCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // Danh sách sản phẩm được chọn
  const [saveShippingInfo, setSaveShippingInfo] = useState(false); // Checkbox lưu thông tin
  
  // Voucher states
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Load thông tin giao hàng đã lưu khi mở form
  useEffect(() => {
    if (showForm && token) {
      axiosClient.get("/users/shipping-info")
        .then(res => {
          if (res.data?.success && res.data.shippingInfo) {
            const info = res.data.shippingInfo;
            if (info.customerName) setCustomerName(info.customerName);
            if (info.phone) setPhone(info.phone);
            if (info.address) setShippingAddress(info.address);
          }
        })
        .catch(err => console.log("Không load được thông tin đã lưu:", err));
    }
  }, [showForm, token]);

  // Load guest cart from localStorage
  useEffect(() => {
    if (!token) {
      setGuestCart(getGuestCart());
    }
  }, [token]);

  // Listen for storage changes (when items are added)
  useEffect(() => {
    const handleStorageChange = () => {
      if (!token) {
        setGuestCart(getGuestCart());
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [token]);

  const { data: cart, isLoading: loading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => {
      if (!token) return null;
      return axiosClient.get("/cart").then(res => {
        if (res.data && res.data.items) return res.data;
        return null;
      }).catch(() => null);
    },
    enabled: !!token,
  });

  // Fetch wishlist
  const { data: wishlistData = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => axiosClient.get("/wishlist").then(res => res.data.products || []),
    enabled: !!token,
  });

  // Helper function to check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistData.some(p => p._id === productId);
  };

  // Wishlist mutations
  const addToWishlistMutation = useMutation({
    mutationFn: (productId) => axiosClient.post("/wishlist/add", { productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("❤️ Đã thêm vào danh sách yêu thích!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi khi thêm vào yêu thích");
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId) => axiosClient.delete(`/wishlist/remove/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Đã xóa khỏi danh sách yêu thích!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi khi xóa khỏi yêu thích");
    },
  });

  const handleWishlistToggle = (productId) => {
    if (!token) {
      toast.warn("Vui lòng đăng nhập để thêm vào yêu thích!");
      return;
    }
    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  // Auto select all items when cart loads (separate effect after cart is defined)
  useEffect(() => {
    const cartItems = token ? (cart?.items || []) : guestCart;
    if (cartItems.length > 0) {
      const itemIds = cartItems.map(i => i.product?._id).filter(Boolean);
      // Only update if selectedItems is empty or different
      setSelectedItems(prev => {
        if (prev.length === 0) return itemIds;
        const prevSorted = [...prev].sort().join(',');
        const newSorted = [...itemIds].sort().join(',');
        return prevSorted !== newSorted ? itemIds : prev;
      });
    } else if (cartItems.length === 0) {
      setSelectedItems([]);
    }
  }, [cart?.items, guestCart, token]);

  const removeMutation = useMutation({
    mutationFn: (productId) => axiosClient.delete(`/cart/remove/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
  });

  const updateQtyMutation = useMutation({
    mutationFn: ({ productId, quantity }) => axiosClient.put("/cart/update", { productId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
    onError: (err) => toast.error("Lỗi cập nhật: " + (err.response?.data?.message || err.message)),
  });

  const clearMutation = useMutation({
    mutationFn: () => axiosClient.delete("/cart/clear"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
  });

  const removeItem = (productId) => {
    if (token) {
      removeMutation.mutate(productId);
    } else {
      removeFromGuestCart(productId);
      setGuestCart(getGuestCart());
      toast.success("Đã xóa khỏi giỏ hàng");
    }
  };

  const updateQty = (productId, newQty) => {
    if (newQty < 1) return;
    if (token) {
      updateQtyMutation.mutate({ productId, quantity: newQty });
    } else {
      updateGuestCartQuantity(productId, newQty);
      setGuestCart(getGuestCart());
    }
  };

  const clearCart = () => {
    if (token) {
      clearMutation.mutate();
    } else {
      clearGuestCart();
      setGuestCart([]);
      toast.success("Đã xóa tất cả sản phẩm");
    }
  };

  // Toggle chọn sản phẩm
  const toggleSelectItem = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Chọn tất cả / Bỏ chọn tất cả
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(i => i.product?._id));
    }
  };

  const validate = () => {
    const errs = {};
    if (!customerName.trim()) errs.customerName = "Vui lòng nhập họ tên";
    if (!phone.trim()) errs.phone = "Vui lòng nhập SĐT";
    else if (!/^[0-9]{10,11}$/.test(phone.trim())) errs.phone = "SĐT không hợp lệ (10-11 số)";
    if (!shippingAddress.trim()) errs.shippingAddress = "Vui lòng nhập địa chỉ";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Kiểm tra voucher từ localStorage khi component mount
  useEffect(() => {
    const selectedVoucher = localStorage.getItem("selectedVoucher");
    if (selectedVoucher) {
      setVoucherCode(selectedVoucher);
      localStorage.removeItem("selectedVoucher");
      // Tự động áp dụng sau 500ms
      setTimeout(() => {
        applyVoucherWithCode(selectedVoucher);
      }, 500);
    }
  }, []);

  // Áp dụng mã voucher với code cụ thể
  const applyVoucherWithCode = async (code) => {
    if (!token) {
      toast.warn("⚠️ Vui lòng đăng nhập để sử dụng voucher");
      return;
    }

    // Kiểm tra và tự động chọn tất cả nếu chưa có sản phẩm nào được chọn
    let itemsToCalculate = selectedItems;
    if (selectedItems.length === 0 && cartItems.length > 0) {
      itemsToCalculate = cartItems.map(i => i.product?._id);
      setSelectedItems(itemsToCalculate);
      toast.info("📦 Đã tự động chọn tất cả sản phẩm để áp dụng voucher");
    }

    setVoucherLoading(true);
    try {
      const orderTotal = cartItems
        .filter(i => itemsToCalculate.includes(i.product?._id))
        .reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

      if (orderTotal === 0) {
        toast.warn("⚠️ Vui lòng chọn ít nhất 1 sản phẩm để áp dụng voucher");
        setVoucherLoading(false);
        return;
      }

      console.log("💰 Tổng đơn hàng:", orderTotal, "- Mã:", code);

      const res = await axiosClient.post("/coupons/validate", {
        code,
        orderTotal
      });

      if (res.data?.success) {
        setAppliedVoucher({
          code: res.data.coupon.code,
          discount: res.data.coupon.discount || 0,
          description: res.data.coupon.description
        });
        toast.success(`✅ Áp dụng voucher thành công! Giảm ${(res.data.coupon.discount || 0).toLocaleString("vi-VN")}đ`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã voucher không hợp lệ");
      setAppliedVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  // Áp dụng mã voucher
  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.warn("⚠️ Vui lòng nhập mã voucher");
      return;
    }

    await applyVoucherWithCode(voucherCode.trim());
  };

  // Xóa voucher
  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    toast.info("Đã xóa mã voucher");
  };

  const handleCheckout = () => {
    // Check if user is logged in
    if (!token) {
      toast.warn("⚠️ Vui lòng đăng nhập để tiếp tục thanh toán!");
      setTimeout(() => {
        navigate("/login", { state: { from: "/cart" } });
      }, 1000);
      return;
    }
    
    // Check if any items are selected
    if (selectedItems.length === 0) {
      toast.warn("⚠️ Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }
    
    if (validate()) { 
      setShowForm(false); 
      setShowConfirm(true); 
    }
  };

  // Chuyển từ màn xác nhận sang chọn phương thức thanh toán
  const proceedToPayment = () => {
    setShowConfirm(false);
    setShowPaymentMethod(true);
  };

  // Xử lý xác nhận đã chuyển khoản
  const handlePaymentConfirm = async () => {
    setOrdering(true);
    try {
      await axiosClient.post('/payment/bank-transfer/confirm', { orderId: currentOrderId });
      
      // Clear cache và reset form sau khi confirm thanh toán
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders-count"] });
      queryClient.invalidateQueries({ queryKey: ["pending-orders-count"] });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Reload stock
      queryClient.invalidateQueries({ queryKey: ["product"] }); // Reload product detail
      
      setCustomerName(""); 
      setPhone(""); 
      setShippingAddress(""); 
      setNote("");
      setSaveShippingInfo(false);
      setAppliedVoucher(null);
      setVoucherCode("");
      
      setShowQRCode(false);
      toast.success("✅ Đã xác nhận! Đơn hàng đang chờ admin kiểm tra thanh toán.", { autoClose: 3000 });
      setTimeout(() => {
        navigate('/my-orders');
      }, 2000);
    } catch (error) {
      toast.error("Lỗi xác nhận thanh toán: " + (error.response?.data?.message || error.message));
    } finally {
      setOrdering(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("📋 Đã copy!", { autoClose: 1000 });
  };

  // Xử lý đặt hàng với phương thức thanh toán đã chọn
  const confirmOrder = async (paymentMethod) => {
    setOrdering(true);
    try {
      // Lưu thông tin giao hàng nếu người dùng chọn
      if (saveShippingInfo && token) {
        try {
          await axiosClient.put("/users/shipping-info", {
            customerName,
            phone,
            address: shippingAddress
          });
        } catch (err) {
          console.log("Không lưu được thông tin:", err);
        }
      }

      // Tạo đơn hàng
      const orderData = { 
        customerName, 
        phone, 
        shippingAddress, 
        note,
        selectedProductIds: selectedItems,
        paymentMethod: paymentMethod // Thêm phương thức thanh toán
      };

      // Thêm coupon nếu có
      if (appliedVoucher) {
        orderData.couponCode = appliedVoucher.code;
      }

      const response = await axiosClient.post("/orders/create", orderData);
      
      console.log("Order response:", response.data);
      
      setShowPaymentMethod(false);
      
      // Lấy thông tin đơn hàng vừa tạo
      const orderId = response.data?.data?.order?._id;
      const orderTotal = response.data?.data?.order?.totalPrice || total;
      
      console.log("OrderId:", orderId, "OrderTotal:", orderTotal);
      
      if (paymentMethod === 'bank_transfer') {
        // Chuyển khoản → Hiển thị QR code ngay
        setCurrentOrderId(orderId);
        setCurrentOrderTotal(orderTotal);
        
        // Gọi API lấy thông tin ngân hàng và QR code
        try {
          const paymentResponse = await axiosClient.post('/payment/bank-transfer/create', {
            orderId,
            amount: parseInt(orderTotal)
          });
          
          setBankInfo(paymentResponse.data.bankInfo);
          setQrCodeUrl(paymentResponse.data.qrCodeUrl);
          setShowQRCode(true); // Hiển thị modal QR code
          
        } catch (error) {
          toast.error("Lỗi tải thông tin thanh toán: " + (error.response?.data?.message || error.message));
        }
      } else {
        // COD → Chuyển sang trang đơn hàng
        // Clear cache và reset form cho COD
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cart-count"] });
        queryClient.invalidateQueries({ queryKey: ["my-orders-count"] });
        queryClient.invalidateQueries({ queryKey: ["pending-orders-count"] });
        queryClient.invalidateQueries({ queryKey: ["products"] }); // Reload stock
        queryClient.invalidateQueries({ queryKey: ["product"] }); // Reload product detail
        
        setCustomerName(""); 
        setPhone(""); 
        setShippingAddress(""); 
        setNote("");
        setSaveShippingInfo(false);
        setAppliedVoucher(null);
        setVoucherCode("");
        
        toast.success("🎉 Đặt hàng thành công! Đơn hàng sẽ được giao sớm nhất!", { autoClose: 3000 });
        setTimeout(() => {
          navigate('/my-orders');
        }, 2000);
      }
      
    } catch (err) {
      toast.error("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setOrdering(false);
    }
  };

  if (loading && token) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2 text-muted">Đang tải giỏ hàng...</p>
    </div>
  );

  // Determine which cart to use and filter out invalid items
  const cartItems = (token ? (cart?.items || []) : guestCart).filter(i => i.product && i.product._id);
  
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mt-5 text-center" style={{ padding: "60px 0" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛒</div>
        <h3 style={{ color: "#2d3748", fontWeight: 700 }}>Giỏ hàng trống</h3>
        <p className="text-muted">Hãy thêm sản phẩm vào giỏ hàng nhé!</p>
        <a href="/products" className="btn mt-2" style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "#fff", borderRadius: "12px", padding: "10px 28px", fontWeight: 600
        }}>Khám phá sản phẩm</a>
      </div>
    );
  }

  // Tính tổng tiền chỉ cho các sản phẩm được chọn
  const subtotal = cartItems
    .filter(i => selectedItems.includes(i.product?._id))
    .reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  // Tính giảm giá từ voucher
  const discount = appliedVoucher?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="container mt-4 mb-5">
      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px) scale(.96) } to { opacity:1; transform:translateY(0) scale(1) } }
        .cart-input:focus { border-color: #667eea !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(102,126,234,.15) !important; }
        .cart-row:hover { background: #f8f9ff; }
        .btn-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border:none; color:#fff; font-weight:600; border-radius:14px; transition: all .3s ease; }
        .btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102,126,234,.4); color:#fff; }
        .btn-gradient-danger { background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); border:none; color:#fff; font-weight:600; border-radius:14px; transition: all .3s ease; }
        .btn-gradient-danger:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(229,62,62,.4); color:#fff; }
        .error-shake { animation: shake .4s ease; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
      `}</style>

      <div className="d-flex align-items-center mb-4">
        <h2 style={{ fontWeight: 800, color: "#1a202c", margin: 0 }}>
          🛒 Giỏ hàng
        </h2>
        <span className="ms-2 badge" style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          fontSize: "14px", borderRadius: "20px", padding: "6px 14px"
        }}>{cartItems.length} sản phẩm</span>
      </div>

      {/* Cart items */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
              <tr>
                <th className="text-white border-0 py-3 px-3" style={{ fontWeight: 600, fontSize: "14px", width: "50px" }}>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                    onChange={toggleSelectAll}
                    style={{ 
                      width: "18px", 
                      height: "18px", 
                      cursor: "pointer",
                      accentColor: "#764ba2"
                    }}
                  />
                </th>
                {["Sản phẩm", "", "Số lượng", "Đơn giá", "Thành tiền", ""].map((h, i) => (
                  <th key={i} className="text-white border-0 py-3 px-3" style={{ fontWeight: 600, fontSize: "14px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cartItems.map(i => (
                <tr key={i.product?._id} className="cart-row" style={{ transition: "all .2s ease" }}>
                  <td className="py-3 px-3">
                    <input 
                      type="checkbox"
                      checked={selectedItems.includes(i.product?._id)}
                      onChange={() => toggleSelectItem(i.product?._id)}
                      style={{ 
                        width: "18px", 
                        height: "18px", 
                        cursor: "pointer",
                        accentColor: "#667eea"
                      }}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <img
                      src={getImageUrl(i.product?.image) || 'https://via.placeholder.com/60x60?text=No+Image'}
                      alt={i.product?.name}
                      style={{
                        width: "56px", height: "56px", objectFit: "cover",
                        borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,.1)"
                      }}
                    />
                  </td>
                  <td className="fw-semibold" style={{ color: "#2d3748" }}>{i.product?.name}</td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <button
                        onClick={() => updateQty(i.product?._id, i.quantity - 1)}
                        disabled={i.quantity <= 1}
                        style={{
                          width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2e8f0",
                          background: i.quantity <= 1 ? "#f7fafc" : "#fff", color: i.quantity <= 1 ? "#cbd5e0" : "#4a5568",
                          fontWeight: 700, fontSize: "14px", cursor: i.quantity <= 1 ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s"
                        }}
                      >−</button>
                      <span style={{
                        minWidth: "32px", textAlign: "center", fontWeight: 700,
                        fontSize: "14px", color: "#2d3748"
                      }}>{i.quantity}</span>
                      <button
                        onClick={() => updateQty(i.product?._id, i.quantity + 1)}
                        style={{
                          width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2e8f0",
                          background: "#fff", color: "#4a5568", fontWeight: 700, fontSize: "14px",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all .2s"
                        }}
                      >+</button>
                    </div>
                  </td>
                  <td style={{ color: "#718096" }}>{(i.product?.price || 0).toLocaleString("vi-VN")}đ</td>
                  <td>
                    <span className="fw-bold" style={{ color: "#e53e3e", fontSize: "15px" }}>
                      {((i.product?.price || 0) * i.quantity).toLocaleString("vi-VN")}đ
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleWishlistToggle(i.product?._id)}
                        style={{
                          background: isInWishlist(i.product?._id) ? "#fff5f5" : "#f7fafc",
                          color: isInWishlist(i.product?._id) ? "#e53e3e" : "#a0aec0",
                          border: `1px solid ${isInWishlist(i.product?._id) ? "#fed7d7" : "#e2e8f0"}`,
                          borderRadius: "10px",
                          fontWeight: 600,
                          padding: "5px 14px",
                          transition: "all .2s",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                        onMouseEnter={e => {
                          e.target.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={e => {
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <FiHeart 
                          size={14} 
                          fill={isInWishlist(i.product?._id) ? "#e53e3e" : "none"}
                        />
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => removeItem(i.product?._id)}
                        style={{
                          background: "#fff5f5", color: "#e53e3e", border: "1px solid #fed7d7",
                          borderRadius: "10px", fontWeight: 600, padding: "5px 14px", transition: "all .2s"
                        }}
                        onMouseEnter={e => { e.target.style.background = "#e53e3e"; e.target.style.color = "#fff"; }}
                        onMouseLeave={e => { e.target.style.background = "#fff5f5"; e.target.style.color = "#e53e3e"; }}
                      >✕ Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher Section */}
      <div className="card border-0 shadow-sm mt-3" style={{ borderRadius: "16px", overflow: "hidden" }}>
        <div className="card-body p-4">
          <h6 style={{ fontWeight: 700, color: "#1a202c", marginBottom: "16px" }}>
            🎫 Mã giảm giá
          </h6>
          
          {appliedVoucher ? (
            // Voucher đã áp dụng
            <div style={{
              background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              borderRadius: "12px",
              padding: "14px 18px",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>
                  ✅ {appliedVoucher.code}
                </div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>
                  Giảm {(appliedVoucher.discount || 0).toLocaleString("vi-VN")}đ
                </div>
              </div>
              <button
                onClick={removeVoucher}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px"
                }}
              >✕ Xóa</button>
            </div>
          ) : (
            // Form nhập voucher
            <div>
              <div className="d-flex gap-2 mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập mã voucher..."
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                  onKeyPress={e => e.key === 'Enter' && applyVoucher()}
                  style={{
                    border: "2px solid #e8ecf4",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <button
                  onClick={applyVoucher}
                  disabled={voucherLoading || !token}
                  className="btn btn-gradient"
                  style={{
                    padding: "10px 24px",
                    minWidth: "120px",
                    opacity: voucherLoading || !token ? 0.6 : 1
                  }}
                >
                  {voucherLoading ? "⏳" : "Áp dụng"}
                </button>
              </div>
              
              {/* Nút chọn từ danh sách */}
              <Link
                to="/vouchers"
                className="btn w-100"
                style={{
                  background: "linear-gradient(135deg, #f0f4ff 0%, #e5e7ff 100%)",
                  border: "2px dashed #667eea",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#667eea",
                  textDecoration: "none",
                  display: "block",
                  textAlign: "center",
                  transition: "all .2s"
                }}
                onMouseEnter={e => {
                  e.target.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                  e.target.style.color = "#fff";
                  e.target.style.borderColor = "#667eea";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "linear-gradient(135deg, #f0f4ff 0%, #e5e7ff 100%)";
                  e.target.style.color = "#667eea";
                  e.target.style.borderColor = "#667eea";
                }}
              >
                🎁 Xem tất cả voucher có sẵn
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Total & actions */}
      <div className="d-flex justify-content-between align-items-center mt-4 p-4"
        style={{ background: "linear-gradient(145deg, #f8f9ff, #eef1ff)", borderRadius: "16px" }}>
        <div>
          <span style={{ fontSize: "14px", color: "#718096" }}>
            Tổng thanh toán ({selectedItems.length} sản phẩm được chọn)
          </span>
          {appliedVoucher && (
            <div style={{ fontSize: "13px", color: "#48bb78", fontWeight: 600, marginTop: "4px" }}>
              🎉 Đã giảm {discount.toLocaleString("vi-VN")}đ
            </div>
          )}
          <h3 style={{ color: "#e53e3e", fontWeight: 800, margin: 0 }}>
            {total.toLocaleString("vi-VN")}đ
          </h3>
        </div>
        <div className="d-flex gap-2">
          <button className="btn" onClick={clearCart} style={{
            background: "#fff", border: "2px solid #e2e8f0", borderRadius: "12px",
            fontWeight: 600, padding: "10px 20px", color: "#718096", transition: "all .2s"
          }}>🗑️ Xóa tất cả</button>
          <button 
            className="btn btn-gradient btn-lg px-4" 
            onClick={() => setShowForm(true)}
            disabled={selectedItems.length === 0}
            style={{
              opacity: selectedItems.length === 0 ? 0.6 : 1,
              cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            🛍️ Đặt hàng ngay
          </button>
        </div>
      </div>

      {/* ========== MODAL FORM THÔNG TIN ========== */}
      {showForm && (
        <div style={modalOverlay} onClick={() => setShowForm(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "16px 22px", color: "#fff"
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>📦 Thông tin giao hàng</h5>
                  <p style={{ margin: "2px 0 0", opacity: 0.85, fontSize: "12px" }}>
                    Điền đầy đủ thông tin bên dưới
                  </p>
                </div>
                <button onClick={() => setShowForm(false)} style={{
                  background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
                  width: "30px", height: "30px", borderRadius: "8px", fontSize: "16px",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                }}>✕</button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "18px 22px" }}>
              {/* Họ tên + SĐT trên cùng 1 hàng */}
              <div className="d-flex gap-2" style={{ marginBottom: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>👤 Người nhận <span style={{ color: "#e53e3e" }}>*</span></label>
                  <input
                    className={`cart-input ${errors.customerName ? "error-shake" : ""}`}
                    style={{ ...inputStyle, borderColor: errors.customerName ? "#e53e3e" : "#e8ecf4" }}
                    placeholder="Họ tên..."
                    value={customerName}
                    onChange={e => { setCustomerName(e.target.value); setErrors(p => ({ ...p, customerName: "" })); }}
                  />
                  {errors.customerName && <small style={{ color: "#e53e3e", fontSize: "11px" }}>⚠ {errors.customerName}</small>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>📞 SĐT <span style={{ color: "#e53e3e" }}>*</span></label>
                  <input
                    className={`cart-input ${errors.phone ? "error-shake" : ""}`}
                    style={{ ...inputStyle, borderColor: errors.phone ? "#e53e3e" : "#e8ecf4" }}
                    placeholder="0912345678"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: "" })); }}
                  />
                  {errors.phone && <small style={{ color: "#e53e3e", fontSize: "11px" }}>⚠ {errors.phone}</small>}
                </div>
              </div>

              {/* Địa chỉ */}
              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>📍 Địa chỉ giao hàng <span style={{ color: "#e53e3e" }}>*</span></label>
                <input
                  className={`cart-input ${errors.shippingAddress ? "error-shake" : ""}`}
                  style={{ ...inputStyle, borderColor: errors.shippingAddress ? "#e53e3e" : "#e8ecf4" }}
                  placeholder="Số nhà, đường, phường, quận, tỉnh/thành..."
                  value={shippingAddress}
                  onChange={e => { setShippingAddress(e.target.value); setErrors(p => ({ ...p, shippingAddress: "" })); }}
                />
                {errors.shippingAddress && <small style={{ color: "#e53e3e", fontSize: "11px" }}>⚠ {errors.shippingAddress}</small>}
              </div>

              {/* Ghi chú */}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>📝 Ghi chú</label>
                <textarea
                  className="cart-input"
                  style={{ ...inputStyle, resize: "none", minHeight: "48px" }}
                  placeholder="Không bắt buộc..."
                  rows="2"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              {/* Checkbox lưu thông tin */}
              {token && (
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "13px", color: "#4a5568" }}>
                    <input
                      type="checkbox"
                      checked={saveShippingInfo}
                      onChange={e => setSaveShippingInfo(e.target.checked)}
                      style={{ marginRight: "8px", cursor: "pointer", width: "16px", height: "16px" }}
                    />
                    💾 Lưu thông tin này cho lần mua hàng sau
                  </label>
                </div>
              )}

              {/* Tóm tắt */}
              <div style={{
                background: "linear-gradient(145deg, #f0f4ff, #eef1ff)",
                borderRadius: "10px", padding: "10px 14px", marginBottom: "14px"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ color: "#4a5568", fontSize: "13px" }}>
                    🛒 {selectedItems.length} sản phẩm được chọn
                  </span>
                  <span style={{ fontWeight: 800, color: "#e53e3e", fontSize: "16px" }}>
                    {total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Button */}
              <button className="btn btn-gradient w-100 py-2" style={{ fontSize: "15px" }} onClick={handleCheckout}>
                Tiếp tục xác nhận →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL XÁC NHẬN ĐƠN HÀNG ========== */}
      {showConfirm && (
        <div style={modalOverlay} onClick={() => setShowConfirm(false)}>
          <div style={{ ...modalBox, maxWidth: "440px" }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              padding: "16px 22px", color: "#fff", textAlign: "center"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "2px" }}>✅</div>
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>Xác nhận đơn hàng</h5>
              <p style={{ margin: "2px 0 0", opacity: 0.9, fontSize: "12px" }}>Kiểm tra lại trước khi đặt</p>
            </div>

            <div style={{ padding: "16px 22px" }}>
              {/* Thông tin KH */}
              <div style={{
                background: "#f7fafc", borderRadius: "10px", padding: "12px 14px",
                marginBottom: "12px", border: "1px solid #e2e8f0"
              }}>
                <div className="d-flex flex-column gap-1" style={{ fontSize: "13px", color: "#4a5568" }}>
                  <div>👤 <strong>{customerName}</strong> &nbsp;·&nbsp; 📞 {phone}</div>
                  <div>📍 {shippingAddress}</div>
                  {note && <div>📝 <em>{note}</em></div>}
                </div>
              </div>

              {/* Sản phẩm */}
              <div style={{
                background: "#f7fafc", borderRadius: "10px", padding: "12px 14px",
                marginBottom: "12px", border: "1px solid #e2e8f0"
              }}>
                {cartItems.filter(i => selectedItems.includes(i.product?._id)).map(i => (
                  <div key={i.product?._id} className="d-flex justify-content-between align-items-center mb-1"
                    style={{ fontSize: "13px", color: "#4a5568" }}>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={getImageUrl(i.product?.image) || "https://via.placeholder.com/30x30?text=No+Image"}
                        width="30" height="30"
                        style={{ objectFit: "cover", borderRadius: "6px" }}
                        alt={i.product?.name}
                      />
                      <span>{i.product?.name} <span className="text-muted">x{i.quantity}</span></span>
                    </div>
                    <strong style={{ color: "#2d3748" }}>{((i.product?.price || 0) * i.quantity).toLocaleString("vi-VN")}đ</strong>
                  </div>
                ))}
              </div>

              {/* Voucher (nếu có) */}
              {appliedVoucher && (
                <div style={{
                  background: "linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)",
                  borderRadius: "10px", padding: "10px 14px",
                  marginBottom: "12px", border: "1px solid #81e6d9"
                }}>
                  <div style={{ fontSize: "13px", color: "#234e52", fontWeight: 600 }}>
                    🎫 Mã giảm giá: <strong>{appliedVoucher.code}</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "#2c7a7b" }}>
                    Giảm {discount.toLocaleString("vi-VN")}đ
                  </div>
                </div>
              )}

              {/* Tổng */}
              <div className="d-flex flex-column gap-1 p-2 px-3"
                style={{
                  background: "linear-gradient(145deg, #fff5f5, #ffe0e0)",
                  borderRadius: "10px", marginBottom: "14px"
                }}>
                {appliedVoucher && (
                  <>
                    <div className="d-flex justify-content-between" style={{ fontSize: "13px", color: "#4a5568" }}>
                      <span>Tạm tính:</span>
                      <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{ fontSize: "13px", color: "#48bb78", fontWeight: 600 }}>
                      <span>Giảm giá:</span>
                      <span>-{discount.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div style={{ borderTop: "1px dashed #fed7d7", margin: "4px 0" }}></div>
                  </>
                )}
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontWeight: 600, color: "#4a5568", fontSize: "13px" }}>Tổng thanh toán</span>
                  <span style={{ fontWeight: 800, fontSize: "17px", color: "#e53e3e" }}>
                    {total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex gap-2">
                <button
                  className="btn flex-fill py-2"
                  onClick={() => { setShowConfirm(false); setShowForm(true); }}
                  style={{
                    background: "#edf2f7", border: "none", borderRadius: "10px",
                    fontWeight: 600, color: "#4a5568", fontSize: "14px"
                  }}
                >← Quay lại</button>
                <button
                  className="btn flex-fill py-2"
                  style={{
                    background: "linear-gradient(135deg, #48bb78, #38a169)",
                    border: "none", borderRadius: "10px", color: "#fff",
                    fontWeight: 600, fontSize: "14px"
                  }}
                  onClick={proceedToPayment}
                >
                  Tiếp tục →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL CHỌN PHƯƠNG THỨC THANH TOÁN ========== */}
      {showPaymentMethod && (
        <div style={modalOverlay} onClick={() => setShowPaymentMethod(false)}>
          <div style={{ ...modalBox, maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "16px 22px", color: "#fff", textAlign: "center"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "2px" }}>💳</div>
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>Chọn phương thức thanh toán</h5>
              <p style={{ margin: "2px 0 0", opacity: 0.9, fontSize: "12px" }}>Chọn cách bạn muốn thanh toán</p>
            </div>

            <div style={{ padding: "20px 22px" }}>
              {/* Tổng tiền cần thanh toán */}
              <div style={{
                background: "linear-gradient(145deg, #fff5f5, #ffe0e0)",
                borderRadius: "12px", padding: "14px", marginBottom: "20px",
                textAlign: "center", border: "2px dashed #feb2b2"
              }}>
                <div style={{ fontSize: "13px", color: "#718096", marginBottom: "4px" }}>
                  Tổng tiền cần thanh toán
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#e53e3e" }}>
                  {total.toLocaleString("vi-VN")}đ
                </div>
              </div>

              {/* Option 1: Chuyển khoản */}
              <button
                onClick={() => confirmOrder('bank_transfer')}
                disabled={ordering}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  marginBottom: "14px",
                  cursor: ordering ? "not-allowed" : "pointer",
                  transition: "all .3s ease",
                  opacity: ordering ? 0.6 : 1,
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
                }}
                onMouseEnter={e => {
                  if (!ordering) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
                  }
                }}
                onMouseLeave={e => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "50px", height: "50px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                  }}>🏦</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "2px" }}>
                      Chuyển khoản ngân hàng
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px" }}>
                      Quét mã QR để chuyển khoản nhanh
                    </div>
                  </div>
                  <div style={{ fontSize: "20px", color: "#fff" }}>→</div>
                </div>
              </button>

              {/* Option 2: Thanh toán khi nhận hàng */}
              <button
                onClick={() => confirmOrder('cod')}
                disabled={ordering}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                  border: "none",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  marginBottom: "16px",
                  cursor: ordering ? "not-allowed" : "pointer",
                  transition: "all .3s ease",
                  opacity: ordering ? 0.6 : 1,
                  boxShadow: "0 4px 15px rgba(72, 187, 120, 0.3)"
                }}
                onMouseEnter={e => {
                  if (!ordering) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(72, 187, 120, 0.4)";
                  }
                }}
                onMouseLeave={e => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(72, 187, 120, 0.3)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "50px", height: "50px",
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                  }}>💵</div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "2px" }}>
                      Thanh toán khi nhận hàng
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px" }}>
                      Trả tiền mặt khi nhận được hàng (COD)
                    </div>
                  </div>
                  <div style={{ fontSize: "20px", color: "#fff" }}>→</div>
                </div>
              </button>

              {/* Nút quay lại */}
              <button
                onClick={() => { setShowPaymentMethod(false); setShowConfirm(true); }}
                style={{
                  width: "100%",
                  background: "#edf2f7",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#4a5568"
                }}
              >
                ← Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL HIỂN THỊ QR CODE ========== */}
      {showQRCode && bankInfo && (
        <div style={modalOverlay} onClick={() => setShowQRCode(false)}>
          <div style={{ ...modalBox, maxWidth: "480px" }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "16px 22px", color: "#fff", textAlign: "center"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "2px" }}>🏦</div>
              <h5 style={{ margin: 0, fontWeight: 700, fontSize: "16px" }}>Quét mã QR để thanh toán</h5>
              <p style={{ margin: "2px 0 0", opacity: 0.9, fontSize: "12px" }}>Sử dụng app ngân hàng để quét mã</p>
            </div>

            <div style={{ padding: "24px" }}>
              {/* QR Code */}
              <div style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "center",
                marginBottom: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  style={{ 
                    width: "280px", 
                    height: "280px", 
                    borderRadius: "12px",
                    border: "4px solid #f7fafc"
                  }} 
                />
                <div style={{
                  marginTop: "12px",
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#e53e3e"
                }}>
                  {currentOrderTotal?.toLocaleString("vi-VN")}đ
                </div>
              </div>

              {/* Thông tin ngân hàng */}
              <div style={{
                background: "linear-gradient(145deg, #f7fafc, #edf2f7)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{ fontSize: "13px", color: "#4a5568", marginBottom: "12px", fontWeight: 600 }}>
                  📋 Thông tin chuyển khoản:
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#718096" }}>Ngân hàng:</span>
                    <span style={{ fontWeight: 600, color: "#2d3748" }}>{bankInfo.bankName}</span>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#718096" }}>Số tài khoản:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 600, color: "#2d3748" }}>{bankInfo.accountNumber}</span>
                      <button
                        onClick={() => copyToClipboard(bankInfo.accountNumber)}
                        style={{
                          background: "#667eea",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "11px",
                          cursor: "pointer",
                          fontWeight: 600
                        }}
                      >Copy</button>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#718096" }}>Chủ tài khoản:</span>
                    <span style={{ fontWeight: 600, color: "#2d3748" }}>{bankInfo.accountName}</span>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#718096" }}>Nội dung:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 600, color: "#e53e3e" }}>{bankInfo.transferContent}</span>
                      <button
                        onClick={() => copyToClipboard(bankInfo.transferContent)}
                        style={{
                          background: "#667eea",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "11px",
                          cursor: "pointer",
                          fontWeight: 600
                        }}
                      >Copy</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cảnh báo */}
              <div style={{
                background: "linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "16px",
                fontSize: "12px",
                color: "#742a2a",
                border: "1px solid #fc8181"
              }}>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>⚠️ Lưu ý quan trọng:</div>
                <ul style={{ margin: "4px 0 0 16px", paddingLeft: 0 }}>
                  <li>Nhập đúng nội dung chuyển khoản để được duyệt nhanh</li>
                  <li>Sau khi chuyển khoản, bấm nút "Tôi đã chuyển khoản"</li>
                  <li>Admin sẽ kiểm tra và xác nhận trong vòng 5-10 phút</li>
                </ul>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    setShowQRCode(false);
                    navigate('/my-orders');
                  }}
                  style={{
                    flex: 1,
                    background: "#edf2f7",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#4a5568"
                  }}
                >
                  Để sau
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={ordering}
                  style={{
                    flex: 2,
                    background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    cursor: ordering ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#fff",
                    opacity: ordering ? 0.6 : 1
                  }}
                >
                  {ordering ? "Đang xử lý..." : "✅ Tôi đã chuyển khoản"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Cart;
