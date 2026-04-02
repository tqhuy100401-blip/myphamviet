import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { FiShoppingCart, FiPackage, FiSearch, FiFilter, FiX, FiStar, FiHeart, FiEye } from "react-icons/fi";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { addToGuestCart } from "../utils/cartHelper";
import { getImageUrl } from "../utils/helpers";
import CountdownTimer from "../components/CountdownTimer";
import SkeletonCard from "../components/SkeletonCard";
import "../components/ProductCardButtons.css";

const ITEMS_PER_PAGE = 12;

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Khi vào trang, nếu có ?search=... trên URL thì setSearchTerm
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearchTerm(urlSearch);
  }, [searchParams]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  // Build query params for API
  const buildQueryParams = () => {
    const params = {
      sortBy,
      order: sortOrder,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (inStockOnly) params.inStock = "true";
    
    // Price range
    if (selectedPriceRange !== "all") {
      switch(selectedPriceRange) {
        case "under-100k":
          params.maxPrice = 100000;
          break;
        case "100k-300k":
          params.minPrice = 100000;
          params.maxPrice = 300000;
          break;
        case "300k-500k":
          params.minPrice = 300000;
          params.maxPrice = 500000;
          break;
        case "500k-1m":
          params.minPrice = 500000;
          params.maxPrice = 1000000;
          break;
        case "over-1m":
          params.minPrice = 1000000;
          break;
      }
    }
    
    return params;
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", searchTerm, selectedCategory, selectedPriceRange, sortBy, sortOrder, inStockOnly, currentPage],
    queryFn: () => {
      const params = buildQueryParams();
      return axiosClient.get("/products", { params }).then(res => res.data);
    },
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axiosClient.get("/categories").then(res => res.data),
  });

  // Fetch live flash sales
  const { data: flashSales = [] } = useQuery({
    queryKey: ["flashsales-live"],
    queryFn: () => axiosClient.get("/flashsales/live").then(res => res.data.flashSales || []),
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

  const handleWishlistToggle = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Helper function to get flash sale price for a product
  const getFlashSalePrice = (productId) => {
    const flashSale = flashSales.find(fs => fs.product._id === productId || fs.product === productId);
    return flashSale ? flashSale.salePrice : null;
  };

  // Helper function to get flash sale info for a product
  const getFlashSaleInfo = (productId) => {
    return flashSales.find(fs => fs.product._id === productId || fs.product === productId);
  };

  const { data: allProducts = [] } = useQuery({
    queryKey: ["all-products"],
    queryFn: () => axiosClient.get("/products").then(res => res.data.products || res.data),
  });

  // Xử lý URL query parameter
  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (categorySlug) {
      const cat = categories.find(c => c.slug === categorySlug);
      if (cat) {
        setSelectedCategory(cat.name);
      }
    }
  }, [searchParams, categories]);

  // Calculate page count from total products
  const pageCount = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const buyNow = async (e, productId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    
    // Find product details
    const product = products.find(p => p._id === productId);
    if (!product) {
      toast.error("Không tìm thấy sản phẩm!");
      return;
    }

    if (token) {
      // User logged in - add to backend cart
      try {
        await axiosClient.post("/cart/add", { productId, quantity: 1 });
        toast.success("✅ Đã thêm vào giỏ hàng!");
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["cart-count"] });
        navigate("/cart");
      } catch (err) {
        toast.error("Lỗi: " + (err.response?.data?.message || err.message));
      }
    } else {
      // Guest user - add to localStorage
      addToGuestCart(product, 1);
      toast.success("✅ Đã thêm vào giỏ hàng!");
      // Trigger cart count update
      window.dispatchEvent(new Event("storage"));
      navigate("/cart");
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected + 1);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handlePriceChange = (range) => {
    setSelectedPriceRange(range);
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Khi người dùng nhập tìm kiếm mới (ở filter modal)
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (e.target.value) {
        params.set("search", e.target.value);
      } else {
        params.delete("search");
      }
      return params;
    });
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setCurrentPage(1);
    setShowFilters(false);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setInStockOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedPriceRange !== "all" || inStockOnly || sortBy !== "createdAt";

  if (isLoading) {
    return (
      <div className="container mt-4 mb-5">
        <style>{`
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
        `}</style>
        
        {/* Header skeleton */}
        <div style={{
          height: '120px',
          background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
          backgroundSize: '1000px 100%',
          animation: 'shimmer 2s infinite',
          borderRadius: '20px',
          marginBottom: '30px'
        }} />
        
        {/* Filter button skeleton */}
        <div style={{
          width: '150px',
          height: '48px',
          background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
          backgroundSize: '1000px 100%',
          animation: 'shimmer 2s infinite',
          borderRadius: '12px',
          marginBottom: '24px'
        }} />
        
        {/* Results bar skeleton */}
        <div style={{
          height: '60px',
          background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
          backgroundSize: '1000px 100%',
          animation: 'shimmer 2s infinite',
          borderRadius: '16px',
          marginBottom: '24px'
        }} />
        
        {/* Products skeleton grid */}
        <div className="row justify-content-center">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-30px) scale(0.95);
            max-height: 0;
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
            max-height: 2000px;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { 
            opacity: 0; 
            transform: scale(0.9) translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .filter-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        .filter-modal {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: scaleUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .page-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 30px;
          color: #fff;
          box-shadow: 0 10px 40px rgba(102,126,234,0.25);
          position: relative;
          overflow: hidden;
        }
        .page-header::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255,255,255,0.15), transparent);
          border-radius: 50%;
        }
        .page-header h1 {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px 0;
          position: relative;
          z-index: 1;
        }
        .page-header p {
          margin: 0;
          opacity: 0.95;
          font-size: 15px;
          position: relative;
          z-index: 1;
        }
        .filter-section {
          background: #fff;
          padding: 32px;
          position: relative;
          overflow-y: auto;
          max-height: calc(90vh - 64px);
        }
        .filter-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2, #48bb78);
        }
        .filter-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2, #48bb78);
        }
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 3px solid #f0f0ff;
        }
        .filter-title {
          font-size: 20px;
          font-weight: 800;
          color: #1a202c;
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .search-box {
          position: relative;
          margin-bottom: 24px;
        }
        .search-box input {
          padding: 14px 20px 14px 48px;
          border-radius: 14px;
          border: 2px solid #e8ecf4;
          transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 15px;
          background: #fff;
          width: 100%;
          font-weight: 500;
        }
        .search-box input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102,126,234,.12);
          outline: none;
          transform: translateY(-1px);
        }
        .search-box input::placeholder {
          color: #a0aec0;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #667eea;
          font-size: 18px;
        }
        .filter-group {
          margin-bottom: 28px;
        }
        .filter-group:last-child {
          margin-bottom: 0;
        }
        .filter-label {
          font-size: 13px;
          font-weight: 700;
          color: #4a5568;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .filter-buttons::-webkit-scrollbar {
          height: 6px;
        }
        .filter-buttons::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .filter-buttons::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
        }
        .filter-buttons::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2, #667eea);
        }
        .filter-btn {
          padding: 12px 20px;
          border-radius: 14px;
          border: 2px solid #e8ecf4;
          background: #fafbff;
          color: #2d3748;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        .filter-btn::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(102,126,234,0.1);
          transform: translate(-50%, -50%);
          transition: width 0.4s, height 0.4s;
        }
        .filter-btn:hover::before {
          width: 300px;
          height: 300px;
        }
        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102,126,234,.15);
        }
        .filter-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(102,126,234,.3);
        }
        .filter-btn.success {
          border-color: #d6f5e3;
          background: #f0fdf4;
        }
        .filter-btn.success:hover {
          border-color: #48bb78;
          color: #38a169;
          background: #e6f9f0;
        }
        .filter-btn.success.active {
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: #fff;
          border-color: transparent;
        }
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #f8f9ff;
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all .2s ease;
          cursor: pointer;
        }
        .checkbox-container:hover {
          background: #eff1ff;
          border-color: #667eea;
        }
        .checkbox-container input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #667eea;
        }
        .checkbox-container label {
          margin: 0;
          cursor: pointer;
          font-weight: 600;
          color: #2d3748;
          font-size: 14px;
        }
        .clear-filters-btn {
          background: linear-gradient(135deg, #fc8181, #f56565);
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all .3s ease;
          box-shadow: 0 4px 15px rgba(245,101,101,.25);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .clear-filters-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245,101,101,.35);
        }
        .results-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #fff, #f8f9ff);
          border-radius: 16px;
          margin-bottom: 24px;
          border: 2px solid #e8ecf4;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .results-count {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(102,126,234,.25);
        }
        .toggle-filter-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 16px rgba(102,126,234,.3);
        }
        .toggle-filter-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(102,126,234,.4);
        }
        .product-card {
          border-radius: 18px;
          overflow: hidden;
          transition: all .4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid #cbd5e0;
          height: 100%;
          background: #fff;
          display: flex;
          flex-direction: column;
        }
        .product-card .card-body {
          min-height: 180px;
          max-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
        }
        .product-card .card-actions {
          margin-top: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        }
        .product-card .card-body .d-flex {
          justify-content: center;
          gap: 8px;
        }
        }
        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(102,126,234,0.15);
          border-color: #667eea;
        }
        .product-image-wrapper {
          position: relative;
          overflow: hidden;
        }
        .product-card img {
          transition: transform .5s ease;
        }
        .product-card:hover img {
          transform: scale(1.08);
        }
        .product-card:hover .quick-view-btn {
          opacity: 1 !important;
          transform: translate(-50%, -50%) scale(1) !important;
        }
        .quick-view-btn:hover {
          transform: translate(-50%, -50%) scale(1.15) !important;
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6) !important;
          border-width: 4px !important;
        }
        .badge-stock {
          position: absolute;
          top: 14px;
          right: 14px;
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: #fff;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(72,187,120,.3);
        }
        .badge-out-of-stock {
          background: linear-gradient(135deg, #fc8181, #f56565);
          box-shadow: 0 4px 12px rgba(245,101,101,.3);
        }
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          animation: fadeInUp 0.6s ease;
        }
        .empty-icon {
          font-size: 80px;
          margin-bottom: 24px;
          opacity: 0.8;
        }
        .empty-title {
          font-size: 26px;
          font-weight: 800;
          color: #2d3748;
          margin-bottom: 12px;
        }
        .empty-desc {
          color: #718096;
          font-size: 16px;
          margin-bottom: 24px;
        }
        .pagination-container {
          display: flex;
          justify-content: center;
          margin-top: 40px;
          gap: 8px;
        }
        .pagination-container li {
          list-style: none;
        }
        .pagination-container li a {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          height: 44px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          border: 2px solid #e8ecf4;
          color: #4a5568;
          background: #fff;
          transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        .pagination-container li a:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(102,126,234,.2);
        }
        .pagination-container li.selected a {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 6px 20px rgba(102,126,234,.4);
        }
        .pagination-container li.disabled a {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .pagination-container li.previous a,
        .pagination-container li.next a {
          padding: 0 18px;
          font-size: 14px;
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <h1>
          <FiPackage size={32} style={{ verticalAlign: "middle", marginRight: "12px" }} />
          Khám phá sản phẩm
        </h1>
        <p>Tìm kiếm và lọc sản phẩm theo ý muốn của bạn</p>
      </div>

      {/* Toggle Filter Button (when hidden) */}
      {!showFilters && (
        <div style={{ marginBottom: "24px" }}>
          <button 
            className="toggle-filter-btn"
            onClick={() => setShowFilters(true)}
            style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(102,126,234,.3)",
              transition: "all .3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(102,126,234,.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(102,126,234,.3)";
            }}
          >
            <FiFilter size={18} />
            Hiện bộ lọc
          </button>
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <div className="filter-modal-overlay" onClick={() => setShowFilters(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="filter-section">
          <div className="filter-header">
            <div className="filter-title">
              <FiFilter size={20} />
              Bộ lọc & tìm kiếm
            </div>
            <button 
              className="toggle-filter-btn"
              onClick={() => setShowFilters(false)}
            >
              <FiX size={16} />
              Đóng
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {/* Sort Options */}
          <div className="filter-group">
            <div className="filter-label">
              📊 Sắp xếp
            </div>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${sortBy === "createdAt" ? "active" : ""}`}
                onClick={() => handleSortChange("createdAt")}
              >
                🆕 Mới nhất
                {sortBy === "createdAt" && (sortOrder === "asc" ? " ↑" : " ↓")}
              </button>
              <button
                className={`filter-btn ${sortBy === "price" ? "active" : ""}`}
                onClick={() => handleSortChange("price")}
              >
                💰 Giá
                {sortBy === "price" && (sortOrder === "asc" ? " ↑" : " ↓")}
              </button>
              <button
                className={`filter-btn ${sortBy === "name" ? "active" : ""}`}
                onClick={() => handleSortChange("name")}
              >
                🔤 Tên
                {sortBy === "name" && (sortOrder === "asc" ? " ↑" : " ↓")}
              </button>
              <button
                className={`filter-btn ${sortBy === "stock" ? "active" : ""}`}
                onClick={() => handleSortChange("stock")}
              >
                📦 Tồn kho
                {sortBy === "stock" && (sortOrder === "asc" ? " ↑" : " ↓")}
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <div className="filter-label">
              📋 Danh mục
            </div>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => handleCategoryChange("all")}
              >
                📋 Tất cả ({allProducts.length})
              </button>
              {categories.map(cat => {
                const count = allProducts.filter(p => p.category === cat.name).length;
                const iconLabel = {
                  "FiTag": "🏷️",
                  "FiHeart": "💖",
                  "FiStar": "⭐",
                  "FiDroplet": "💧",
                  "FiSun": "☀️",
                  "FiFeather": "🪶",
                  "FiPackage": "📦",
                  "FiGift": "🎁",
                }[cat.icon] || "🏷️";
                return (
                  <button
                    key={cat._id}
                    className={`filter-btn ${selectedCategory === cat.name ? "active" : ""}`}
                    onClick={() => handleCategoryChange(cat.name)}
                  >
                    {iconLabel} {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <div className="filter-label">
              💰 Khoảng giá
            </div>
            <div className="filter-buttons">
              <button
                className={`filter-btn success ${selectedPriceRange === "all" ? "active" : ""}`}
                onClick={() => handlePriceChange("all")}
              >
                Tất cả
              </button>
              <button
                className={`filter-btn success ${selectedPriceRange === "under-100k" ? "active" : ""}`}
                onClick={() => handlePriceChange("under-100k")}
              >
                Dưới 100k
              </button>
              <button
                className={`filter-btn success ${selectedPriceRange === "100k-300k" ? "active" : ""}`}
                onClick={() => handlePriceChange("100k-300k")}
              >
                100k - 300k
              </button>
              <button
                className={`filter-btn success ${selectedPriceRange === "300k-500k" ? "active" : ""}`}
                onClick={() => handlePriceChange("300k-500k")}
              >
                300k - 500k
              </button>
              <button
                className={`filter-btn success ${selectedPriceRange === "500k-1m" ? "active" : ""}`}
                onClick={() => handlePriceChange("500k-1m")}
              >
                500k - 1tr
              </button>
              <button
                className={`filter-btn success ${selectedPriceRange === "over-1m" ? "active" : ""}`}
                onClick={() => handlePriceChange("over-1m")}
              >
                Trên 1tr
              </button>
            </div>
          </div>

          {/* Stock Status Filter */}
          <div className="filter-group">
            <div className="filter-label">
              📦 Tình trạng
            </div>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="inStockCheck"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setCurrentPage(1);
                  setShowFilters(false);
                }}
              />
              <label htmlFor="inStockCheck">
                Chỉ hiển thị sản phẩm còn hàng
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div style={{ textAlign: "center", paddingTop: "16px", borderTop: "2px solid #e8ecf4" }}>
              <button
                className="clear-filters-btn"
                onClick={clearAllFilters}
              >
                <FiX size={16} />
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
            </div>
          </div>
        </div>
      )}

      {/* Results Bar */}
      <div className="results-bar">
        <div>
          <span className="results-count">
            Tìm thấy {totalProducts} sản phẩm
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {totalProducts === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">Không tìm thấy sản phẩm</h3>
          <p className="empty-desc">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          {hasActiveFilters && (
            <button
              className="clear-filters-btn"
              onClick={clearAllFilters}
            >
              <FiX size={16} />
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="row justify-content-center">
          {products.map(p => (
            <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={p._id}>
              <div className="card product-card" style={{ cursor: "pointer", height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Link bao quanh hình và thông tin */}
                <Link to={`/products/${p._id}`} style={{ textDecoration: "none", color: "inherit", flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                  <div className="product-image-wrapper" style={{ position: "relative" }}>
                      {/* Nút xem nhanh */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuickViewProduct(p);
                        }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: '#fff',
                          border: '3px solid #667eea',
                          borderRadius: '50%',
                          width: '64px',
                          height: '64px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'all 0.3s ease',
                          zIndex: 10,
                          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.5)'
                        }}
                        className="quick-view-btn"
                      >
                        <FiEye size={28} color="#667eea" strokeWidth={3} />
                      </button>
                      <img
                        src={getImageUrl(p.image) || "https://via.placeholder.com/300x220?text=No+Image"}
                        className="card-img-top"
                        height="220"
                        style={{ objectFit: "cover" }}
                        alt={p.name}
                      />
                      {/* Badge giảm giá */}
                      {p.discount && p.discount.value > 0 && (
                        <span style={{position:'absolute',top:8,left:8,background:'#fc8181',color:'#fff',borderRadius:'8px',padding:'4px 10px',fontWeight:700,fontSize:14,boxShadow:'0 2px 8px #fbbf24'}}> -{p.discount.type==='percent'?p.discount.value+'%' : Number(p.discount.value).toLocaleString('vi-VN')+'đ'} </span>
                      )}
                      {p.stock > 0 ? (
                        <span className="badge-stock">
                          Còn {p.stock} sp
                        </span>
                      ) : (
                        <span className="badge-stock badge-out-of-stock">
                          Hết hàng
                        </span>
                      )}
                    </div>
                    <div className="card-body text-start" style={{flex:'1 1 auto',display:'flex',flexDirection:'column',justifyContent:'flex-start'}}>
                      <div style={{display:'flex',flexDirection:'column',flex:'1 1 auto'}}>
                        {/* Giá và giá gạch */}
                        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                          {(() => {
                            const flashSalePrice = getFlashSalePrice(p._id);
                            if (flashSalePrice) {
                              return (
                                <>
                                  <span style={{color:'#fc8181',fontWeight:700,fontSize:18}}>{Number(flashSalePrice).toLocaleString('vi-VN')}đ</span>
                                  <span style={{textDecoration:'line-through',color:'#718096',fontSize:14}}>{Number(p.price).toLocaleString('vi-VN')}đ</span>
                                  <span style={{background:'#ff4757',color:'#fff',borderRadius:'4px',padding:'2px 6px',fontSize:12,fontWeight:700}}>⚡ FLASH SALE</span>
                                </>
                              );
                            } else if (p.discount && p.discount.value > 0) {
                              return (
                                <>
                                  <span style={{color:'#fc8181',fontWeight:700,fontSize:18}}>{Number(p.price).toLocaleString('vi-VN')}đ</span>
                                  <span style={{textDecoration:'line-through',color:'#718096',fontSize:14}}>{Number(p.price + (p.discount.type==='percent'? p.price*p.discount.value/100 : p.discount.value)).toLocaleString('vi-VN')}đ</span>
                                </>
                              );
                            } else {
                              return <span style={{color:'#fc8181',fontWeight:700,fontSize:18}}>{Number(p.price).toLocaleString('vi-VN')}đ</span>;
                            }
                          })()}
                        </div>
                        {/* Tên thương hiệu */}
                        <div style={{color:'#38a169',fontWeight:700,fontSize:16,margin:'4px 0'}}>{p.brand || p.category}</div>
                        {/* Tên sản phẩm */}
                        <h5 className="card-title" style={{ 
                          fontSize: "16px", 
                          fontWeight: 700,
                          minHeight: "72px",
                          maxHeight: "72px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#1a202c",
                          marginBottom: "6px"
                        }}>
                          {p.name}
                        </h5>
                        {/* Mô tả ngắn */}
                        <div style={{fontSize:14,color:'#4a5568',minHeight:'44px',maxHeight:'44px',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',textOverflow:'ellipsis',marginBottom:'6px'}}>{p.description}</div>
                        {/* Rating Display - luôn hiển thị để card đều nhau */}
                        <div className="d-flex align-items-center gap-1 mb-2" style={{ minHeight: '18px' }}>
                          {p.reviewCount > 0 ? (
                            <>
                              <FiStar size={14} fill="#fbbf24" stroke="#fbbf24" />
                              <span className="text-warning fw-bold" style={{ fontSize: "14px" }}>
                                {p.averageRating.toFixed(1)}
                              </span>
                              <span className="text-muted" style={{ fontSize: "12px" }}>
                                ({p.reviewCount})
                              </span>
                            </>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>Chưa có đánh giá</span>
                          )}
                        </div>
                        {/* Số lượng bán/tháng */}
                        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#718096',marginBottom:'4px'}}>
                          <span><FiShoppingCart size={13}/> {p.sold || 0} bán/tháng</span>
                          <span>{Math.min(Math.round((p.sold || 0) / 200 * 100), 100)}%</span>
                        </div>
                        {/* Progress bar */}
                        <div style={{height:5,background:'#e2e8f0',borderRadius:4,overflow:'hidden',marginBottom:6}}>
                          <div style={{height:'100%',width:`${Math.min(Math.round((p.sold || 0) / 200 * 100), 100)}%`,background:'linear-gradient(90deg,#fc8181,#fbbf24)'}}></div>
                        </div>
                      </div>
                    </div>
                </Link>
                
                {/* Nút hành động - nằm ngoài Link */}
                <div className="card-body pt-2" style={{ marginTop: 'auto', paddingBottom: '12px' }}>
                  <div className="card-actions" style={{display:'flex',gap:'8px',justifyContent:'center'}}>
                    <Link 
                      to={`/products/${p._id}`} 
                      className="product-btn detail-btn" 
                      style={{ 
                        flex: 1, 
                        textAlign: 'center', 
                        padding: '8px 10px', 
                        fontSize: '13px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      🔍 Chi tiết
                    </Link>
                    <button 
                      onClick={(e) => buyNow(e, p._id)}
                      disabled={p.stock === 0}
                      className="product-btn buy-btn"
                      style={{ 
                        flex: 1, 
                        padding: '8px 10px', 
                        fontSize: '13px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px'
                      }}
                    >
                      <FiShoppingCart size={14} /> Mua ngay
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleWishlistToggle(e, p._id);
                      }}
                      style={{
                        background: isInWishlist(p._id) ? '#fff5f5' : '#fff',
                        border: `2px solid ${isInWishlist(p._id) ? '#e53e3e' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        width: '40px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.target.style.borderColor = isInWishlist(p._id) ? '#c53030' : '#cbd5e0';
                      }}
                      onMouseLeave={e => {
                        e.target.style.borderColor = isInWishlist(p._id) ? '#e53e3e' : '#e2e8f0';
                      }}
                    >
                      <span style={{
                        fontSize: '18px',
                        lineHeight: 1
                      }}>
                        {isInWishlist(p._id) ? '❤️' : '🤍'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <ReactPaginate
          previousLabel="← Trước"
          nextLabel="Sau →"
          breakLabel="..."
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          forcePage={currentPage - 1}
          containerClassName="pagination-container"
          activeClassName="selected"
          disabledClassName="disabled"
          previousClassName="previous"
          nextClassName="next"
        />
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'scaleUp 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '20px 30px',
              borderBottom: '2px solid #f0f0ff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px 20px 0 0',
              color: '#fff'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                <FiEye size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Xem nhanh sản phẩm
              </h3>
              <button
                onClick={() => setQuickViewProduct(null)}
                style={{
                  background: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#667eea',
                  lineHeight: 1
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f56565';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#667eea';
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Image */}
                <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
                  <img
                    src={getImageUrl(quickViewProduct.image)}
                    alt={quickViewProduct.name}
                    style={{
                      width: '100%',
                      borderRadius: '16px',
                      objectFit: 'cover',
                      maxHeight: '400px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  {quickViewProduct.stock > 0 ? (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #48bb78, #38a169)',
                      borderRadius: '10px',
                      color: '#fff',
                      textAlign: 'center',
                      fontWeight: 600
                    }}>
                      📦 Còn {quickViewProduct.stock} sản phẩm
                    </div>
                  ) : (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #fc8181, #f56565)',
                      borderRadius: '10px',
                      color: '#fff',
                      textAlign: 'center',
                      fontWeight: 600
                    }}>
                      ❌ Hết hàng
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: '1 1 400px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '12px'
                  }}>
                    {quickViewProduct.category}
                  </div>

                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1a202c',
                    marginBottom: '12px',
                    lineHeight: 1.3
                  }}>
                    {quickViewProduct.name}
                  </h2>

                  {quickViewProduct.brand && (
                    <div style={{
                      color: '#38a169',
                      fontWeight: 700,
                      fontSize: '16px',
                      marginBottom: '12px'
                    }}>
                      🏷️ {quickViewProduct.brand}
                    </div>
                  )}

                  {/* Rating */}
                  {quickViewProduct.reviewCount > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <FiStar size={16} fill="#fbbf24" stroke="#fbbf24" />
                      <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                        {quickViewProduct.averageRating.toFixed(1)}
                      </span>
                      <span style={{ color: '#718096' }}>
                        ({quickViewProduct.reviewCount} đánh giá)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #fff5f5, #fff)',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '2px solid #fc8181'
                  }}>
                    {(() => {
                      const flashSalePrice = getFlashSalePrice(quickViewProduct._id);
                      const flashSaleInfo = getFlashSaleInfo(quickViewProduct._id);
                      if (flashSalePrice && flashSaleInfo) {
                        return (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '28px', fontWeight: 700, color: '#fc8181' }}>
                                {Number(flashSalePrice).toLocaleString('vi-VN')}đ
                              </span>
                              <span style={{
                                background: '#ff4757',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 700
                              }}>
                                ⚡ FLASH SALE
                              </span>
                            </div>
                            <div style={{
                              textDecoration: 'line-through',
                              color: '#a0aec0',
                              fontSize: '16px',
                              marginBottom: '12px'
                            }}>
                              {Number(quickViewProduct.price).toLocaleString('vi-VN')}đ
                            </div>
                            {/* Countdown Timer */}
                            <div style={{
                              background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                              padding: '12px',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              justifyContent: 'space-between'
                            }}>
                              <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                                ⏰ Kết thúc sau:
                              </div>
                              <div style={{ color: '#fff' }}>
                                <CountdownTimer targetDate={flashSaleInfo.endTime} />
                              </div>
                            </div>
                          </div>
                        );
                      } else if (quickViewProduct.discount && quickViewProduct.discount.value > 0) {
                        const originalPrice = quickViewProduct.price + 
                          (quickViewProduct.discount.type === 'percent' 
                            ? quickViewProduct.price * quickViewProduct.discount.value / 100 
                            : quickViewProduct.discount.value);
                        return (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '28px', fontWeight: 700, color: '#fc8181' }}>
                                {Number(quickViewProduct.price).toLocaleString('vi-VN')}đ
                              </span>
                              <span style={{
                                background: '#fc8181',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 700
                              }}>
                                -{quickViewProduct.discount.type === 'percent' 
                                  ? quickViewProduct.discount.value + '%' 
                                  : Number(quickViewProduct.discount.value).toLocaleString('vi-VN') + 'đ'}
                              </span>
                            </div>
                            <span style={{
                              textDecoration: 'line-through',
                              color: '#a0aec0',
                              fontSize: '16px'
                            }}>
                              {Number(originalPrice).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        );
                      } else {
                        return (
                          <span style={{ fontSize: '28px', fontWeight: 700, color: '#fc8181' }}>
                            {Number(quickViewProduct.price).toLocaleString('vi-VN')}đ
                          </span>
                        );
                      }
                    })()}
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#2d3748' }}>
                      📝 Mô tả sản phẩm
                    </h4>
                    <p style={{ color: '#4a5568', lineHeight: 1.6, fontSize: '14px' }}>
                      {quickViewProduct.description || 'Chưa có mô tả'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      padding: '12px',
                      background: '#f7fafc',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#667eea' }}>
                        {quickViewProduct.sold || 0}
                      </div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>Đã bán</div>
                    </div>
                    <div style={{
                      padding: '12px',
                      background: '#f7fafc',
                      borderRadius: '10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#48bb78' }}>
                        {quickViewProduct.stock}
                      </div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>Còn lại</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        navigate(`/products/${quickViewProduct._id}`);
                        setQuickViewProduct(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                      }}
                      onMouseEnter={e => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={e => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                      }}
                    >
                      🔍 Xem chi tiết
                    </button>
                    <button
                      onClick={(e) => {
                        buyNow(e, quickViewProduct._id);
                        setQuickViewProduct(null);
                      }}
                      disabled={quickViewProduct.stock === 0}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: quickViewProduct.stock === 0 
                          ? '#e2e8f0' 
                          : 'linear-gradient(135deg, #48bb78, #38a169)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '15px',
                        cursor: quickViewProduct.stock === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: quickViewProduct.stock === 0 
                          ? 'none' 
                          : '0 4px 15px rgba(72, 187, 120, 0.3)',
                        opacity: quickViewProduct.stock === 0 ? 0.6 : 1
                      }}
                      onMouseEnter={e => {
                        if (quickViewProduct.stock > 0) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.4)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (quickViewProduct.stock > 0) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.3)';
                        }
                      }}
                    >
                      <FiShoppingCart size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                      {quickViewProduct.stock === 0 ? 'Hết hàng' : 'Mua ngay'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ProductList;
