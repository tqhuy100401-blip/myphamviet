import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { FiShoppingBag, FiTruck, FiShield, FiGift, FiArrowRight, FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";
import { getImageUrl } from "../utils/helpers";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import CountdownTimer from "../components/CountdownTimer";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";

function HomeSimple() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  // Luôn cuộn về đầu trang khi reload
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const bannerSlides = [
    {
      title: "Mỹ Phẩm Việt",
      subtitle: "Làm đẹp tự nhiên - Tỏa sáng phong cách",
      desc: "Mỹ phẩm chính hãng 100% - Ưu đãi đến 50%",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&h=600&fit=crop",
      emoji: "💄✨"
    },
    {
      title: "Flash Sale Hôm Nay",
      subtitle: "Giảm giá sốc - Số lượng có hạn",
      desc: "Săn deal ngay kẻo lỡ - Miễn phí vận chuyển",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&h=600&fit=crop",
      emoji: "⚡🔥"
    },
    {
      title: "Skin Care Chất Lượng",
      subtitle: "Chăm sóc da chuyên nghiệp",
      desc: "Sản phẩm được tin dùng nhất 2024",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&h=600&fit=crop",
      emoji: "🌟💎"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => axiosClient.get("/products").then(res => res.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => axiosClient.get("/categories").then(res => res.data),
  });

  const products = productsData?.products || [];
  const categories = categoriesData || [];

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

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Hero skeleton */}
          <div style={{
            height: '500px',
            background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
            backgroundSize: '1000px 100%',
            animation: 'shimmer 2s infinite',
            borderRadius: '16px',
            marginBottom: '40px'
          }} />
          
          {/* Products skeleton */}
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '30px', color: '#2d3748' }}>
            Sản phẩm nổi bật
          </h2>
          <div className="row g-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                <SkeletonCard />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
      {/* Hero Banner Carousel */}
      <div style={{ 
        position: 'relative',
        overflow: 'hidden',
        height: '500px'
      }}>
        {bannerSlides.map((slide, index) => (
          <div 
            key={index}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.3)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Animated background circles */}
            <div style={{
              position: 'absolute',
              top: '-10%',
              right: '-5%',
              width: '400px',
              height: '400px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite',
              zIndex: 0
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-15%',
              left: '-5%',
              width: '350px',
              height: '350px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite',
              zIndex: 0
            }}></div>

            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
              @keyframes slideIn {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
              .hover-lift {
                transition: all 0.3s ease;
              }
              .hover-lift:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
              }
              .category-card {
                transition: all 0.3s ease;
              }
              .category-card:hover {
                transform: translateY(-8px);
                border-color: #667eea !important;
                box-shadow: 0 12px 24px rgba(102,126,234,0.2) !important;
              }
              .category-card:hover .category-icon {
                transform: scale(1.2);
              }
              .category-icon {
                transition: transform 0.3s ease;
              }
            `}</style>
            
            <div style={{ 
              maxWidth: '1200px', 
              margin: '0 auto', 
              position: 'relative', 
              zIndex: 10,
              textAlign: 'center',
              color: '#fff',
              padding: '0 20px',
              animation: currentSlide === index ? 'slideIn 1s ease' : 'none'
            }}>
              <div style={{ 
                fontSize: '80px', 
                marginBottom: '20px',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                {slide.emoji}
              </div>
              <h1 style={{ 
                fontSize: '56px', 
                fontWeight: '800', 
                marginBottom: '16px',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                letterSpacing: '-0.5px'
              }}>
                {slide.title}
              </h1>
              <p style={{ 
                fontSize: '24px', 
                marginBottom: '12px',
                opacity: 0.95,
                fontWeight: 600,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                {slide.subtitle}
              </p>
              <p style={{ 
                fontSize: '16px', 
                marginBottom: '32px',
                opacity: 0.9
              }}>
                {slide.desc}
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 100 }}>
                <Link to="/products" style={{
                  background: '#fff',
                  color: '#667eea',
                  padding: '16px 40px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 100
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-3px) scale(1.05)';
                  e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.6)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                }}>
                  <FiShoppingBag size={20} /> Mua sắm ngay
                </Link>
                {flashSales.length > 0 && index === 1 && (
                  <Link to="/flashsale" style={{
                    background: '#fff',
                    color: '#f5576c',
                    padding: '16px 40px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '2px solid #fff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 100
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = '#f5576c';
                    e.target.style.color = '#fff';
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.6)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#f5576c';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                  }}>
                    ⚡ Xem Flash Sale
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#fff',
            border: 'none',
            borderRadius: '8px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#2d3748',
            fontSize: '28px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            zIndex: 100
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-50%) translateX(-4px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(-50%) translateX(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          ◀
        </button>
        <button
          onClick={nextSlide}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#fff',
            border: 'none',
            borderRadius: '8px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#2d3748',
            fontSize: '28px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            zIndex: 100
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-50%) translateX(4px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(-50%) translateX(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          ▶
        </button>

        {/* Dots Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex: 100,
          background: 'rgba(0,0,0,0.3)',
          padding: '12px 20px',
          borderRadius: '25px',
          backdropFilter: 'blur(10px)'
        }}>
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '40px' : '12px',
                height: '12px',
                borderRadius: '6px',
                border: 'none',
                background: currentSlide === index ? '#fff' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentSlide === index ? '0 2px 8px rgba(255,255,255,0.5)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div style={{ padding: '60px 20px', background: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#2d3748', 
                marginBottom: '8px',
                position: 'relative',
                display: 'inline-block'
              }}>
                Danh mục sản phẩm
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  borderRadius: '2px'
                }}></div>
              </h2>
              <p style={{ color: '#718096', fontSize: '16px', marginTop: '16px' }}>
                Khám phá bộ sưu tập đa dạng của chúng tôi
              </p>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '24px' 
            }}>
              {categories.filter(cat => !['Chăm sóc da mặt', 'Trang điểm', 'Chăm sóc tóc', 'Chăm sóc cơ thể'].includes(cat.name)).slice(0, 8).map(category => (
                <Link 
                  key={category._id}
                  to={`/products/category/${category._id}`}
                  className="category-card"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '20px',
                    padding: '36px 24px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }} className="category-overlay"></div>
                  <div className="category-icon" style={{ 
                    fontSize: '56px', 
                    marginBottom: '16px',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}>
                    {category.icon || '📦'}
                  </div>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#2d3748', 
                    margin: 0,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {category.name}
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginTop: '8px',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    Khám phá ngay
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '50px 20px',
        borderTop: '1px solid #e0e0e0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '30px',
            textAlign: 'center'
          }}>
            {[
              { icon: <FiShield size={36} />, title: 'Chính hãng 100%', desc: 'Cam kết nguồn gốc rõ ràng' },
              { icon: <FiTruck size={36} />, title: 'Giao hàng nhanh', desc: 'Miễn phí cho đơn > 300k' },
              { icon: <FiGift size={36} />, title: 'Ưu đãi độc quyền', desc: 'Giảm giá lên đến 50%' },
              { icon: <FiShoppingBag size={36} />, title: 'Đổi trả dễ dàng', desc: 'Trong vòng 7 ngày' }
            ].map((feature, idx) => (
              <div key={idx} style={{ padding: '20px' }}>
                <div style={{ color: '#667eea', marginBottom: '12px' }}>
                  {feature.icon}
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#2d3748' }}>
                  {feature.title}
                </h4>
                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flash Sale Section */}
      {flashSales.length > 0 && (
        <div style={{ 
          padding: '60px 20px', 
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(197, 48, 48, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(197, 48, 48, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}></div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '40px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '40px', 
                  fontWeight: '800', 
                  color: '#c53030', 
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}>⚡</span>
                  {t('home.flashSaleTitle').replace('⚡ ', '')}
                </h2>
                <p style={{ 
                  color: '#2d3748', 
                  fontSize: '15px', 
                  margin: 0,
                  fontWeight: 600
                }}>
                  🔥 Giảm giá SỐC - Số lượng CÓ HẠN - Nhanh tay kẻo lỡ!
                </p>
              </div>
              <Link to="/flashsale" style={{
                background: 'linear-gradient(135deg, #c53030 0%, #9b2c2c 100%)',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(197, 48, 48, 0.3)'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(197, 48, 48, 0.4)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(197, 48, 48, 0.3)';
              }}>
                Xem tất cả <FiArrowRight />
              </Link>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
              gap: '24px' 
            }}>
              {flashSales.slice(0, 8).map(fs => (
                <Link 
                  key={fs._id}
                  to={`/product/${fs.product._id}`}
                  className="hover-lift"
                  style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '20px',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '3px solid #feb2b2',
                    boxShadow: '0 6px 16px rgba(197,48,48,0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Animated corner ribbon */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #ff4757 0%, #c53030 100%)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800',
                    zIndex: 1,
                    boxShadow: '0 4px 8px rgba(197, 48, 48, 0.3)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>
                    -{fs.discountPercent}%
                  </div>
                  <div style={{ 
                    paddingBottom: '100%', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    borderRadius: '16px',
                    marginBottom: '16px',
                    background: '#f7fafc'
                  }}>
                    <img
                      src={getImageUrl(fs.product.image) || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={fs.product.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <h4 style={{ 
                    fontSize: '15px', 
                    fontWeight: '700',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#2d3748'
                  }}>
                    {fs.product.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#c53030' }}>
                      {Number(fs.salePrice).toLocaleString('vi-VN')}đ
                    </span>
                    <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#a0aec0' }}>
                      {Number(fs.originalPrice).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div style={{
                    background: 'linear-gradient(90deg, #fef5e7 0%, #fff5f5 100%)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#c53030',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>🔥 Đã bán {fs.sold}</span>
                    <span style={{ 
                      background: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      Còn {fs.quantity - fs.sold}
                    </span>
                  </div>
                  {/* Countdown Timer */}
                  <div style={{
                    marginTop: '12px',
                    background: 'linear-gradient(135deg, #ff4757 0%, #c53030 100%)',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignItems: 'center'
                  }}>
                    <div style={{ color: '#fff', fontSize: '11px', fontWeight: 700, opacity: 0.9 }}>
                      ⏰ Kết thúc sau
                    </div>
                    <div style={{ 
                      color: '#fff',
                      transform: 'scale(0.85)',
                      transformOrigin: 'center'
                    }}>
                      <CountdownTimer targetDate={fs.endTime} />
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{
                    marginTop: '12px',
                    background: '#fee',
                    height: '6px',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: 'linear-gradient(90deg, #ff4757 0%, #c53030 100%)',
                      height: '100%',
                      width: `${(fs.sold / fs.quantity) * 100}%`,
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div style={{ padding: '60px 20px', background: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '800', 
              color: '#2d3748', 
              marginBottom: '8px',
              position: 'relative',
              display: 'inline-block'
            }}>
              Sản phẩm nổi bật
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '2px'
              }}></div>
            </h2>
            <p style={{ color: '#718096', fontSize: '16px', marginTop: '16px' }}>
              ⭐ Được khách hàng tin dùng và yêu thích nhất
            </p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
            gap: '24px' 
          }}>
            {products.slice(0, 12).map(product => {
              const flashSalePrice = getFlashSalePrice(product._id);
              return (
                <ProductCard
                  key={product._id}
                  product={product}
                  flashSalePrice={flashSalePrice}
                  onAddToCart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (product.stock > 0) {
                      handleAddToCart(product._id);
                    }
                  }}
                  onToggleWishlist={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleWishlistToggle(e, product._id);
                  }}
                  isInWishlist={isInWishlist(product._id)}
                  showRating={true}
                  showActions={true}
                />
              );
            })}
          </div>
          {products.length > 12 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/products" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)';
              }}>
                {t('home.viewAll')} <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Services Section */}
      <div style={{ background: '#f7fafc', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '700', marginBottom: '50px' }}>
            Dịch vụ của chúng tôi
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div style={{ 
              background: '#fff', 
              padding: '40px 30px', 
              borderRadius: '16px', 
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(102,126,234,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>💅</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Tư vấn làm đẹp</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>Đội ngũ chuyên gia tư vấn miễn phí chế độ chăm sóc da phù hợp</p>
            </div>
            <div style={{ 
              background: '#fff', 
              padding: '40px 30px', 
              borderRadius: '16px', 
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(102,126,234,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Sản phẩm chính hãng</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>100% hàng chính hãng, cam kết hoàn tiền nếu phát hiện hàng giả</p>
            </div>
            <div style={{ 
              background: '#fff', 
              padding: '40px 30px', 
              borderRadius: '16px', 
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(102,126,234,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎁</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Quà tặng hấp dẫn</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>Tích điểm đổi quà, voucher giảm giá và nhiều ưu đãi khác</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
            Khách hàng nói gì về chúng tôi
          </h2>
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '18px', marginBottom: '50px' }}>
            Hơn 10,000+ khách hàng hài lòng
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            <div style={{ 
              background: '#fff', 
              padding: '30px', 
              borderRadius: '16px',
              border: '2px solid #e2e8f0',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102,126,234,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#f59e0b', fontSize: '20px' }}>⭐</span>
                ))}
              </div>
              <p style={{ color: '#2d3748', lineHeight: '1.8', marginBottom: '20px', fontStyle: 'italic' }}>
                "Sản phẩm rất tốt, đóng gói cẩn thận. Giao hàng nhanh, giá cả hợp lý. Sẽ ủng hộ shop lâu dài!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '20px'
                }}>H</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#2d3748' }}>Hương Trần</div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Khách hàng thân thiết</div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: '#fff', 
              padding: '30px', 
              borderRadius: '16px',
              border: '2px solid #e2e8f0',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102,126,234,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#f59e0b', fontSize: '20px' }}>⭐</span>
                ))}
              </div>
              <p style={{ color: '#2d3748', lineHeight: '1.8', marginBottom: '20px', fontStyle: 'italic' }}>
                "Shop tư vấn rất nhiệt tình, sản phẩm chất lượng. Da mình đã cải thiện rất nhiều sau 2 tuần sử dụng!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '20px'
                }}>L</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#2d3748' }}>Linh Nguyễn</div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Khách hàng mới</div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: '#fff', 
              padding: '30px', 
              borderRadius: '16px',
              border: '2px solid #e2e8f0',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102,126,234,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#f59e0b', fontSize: '20px' }}>⭐</span>
                ))}
              </div>
              <p style={{ color: '#2d3748', lineHeight: '1.8', marginBottom: '20px', fontStyle: 'italic' }}>
                "Mình rất hài lòng với chất lượng sản phẩm và dịch vụ. Sẽ tiếp tục ủng hộ shop!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '20px'
                }}>M</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#2d3748' }}>Mai Phương</div>
                  <div style={{ fontSize: '14px', color: '#718096' }}>Khách hàng VIP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section - Brand Logos 1 hàng ngang */}
      <div style={{ background: '#f7fafc', padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
            Đối tác của chúng tôi
          </h2>
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '18px', marginBottom: '50px' }}>
            Hợp tác với các thương hiệu hàng đầu
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '36px',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            padding: '10px 0'
          }}>
            {[
              { name: 'Chanel', img: '/brands/chanel.png' },
              { name: 'Dior', img: '/brands/dior.png' },
              { name: 'Lancôme', img: '/brands/lancome.png' },
              { name: 'MAC', img: '/brands/mac.png' },
              { name: 'Estée Lauder', img: '/brands/estee.png' },
              { name: '3CE', img: '/brands/3ce.png' }
            ].map((brand, idx) => (
              <div key={idx} style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                padding: '32px 36px',
                minWidth: '180px',
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                cursor: 'pointer',
                aspectRatio: '3/2'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)';
              }}>
                <img src={brand.img} alt={brand.name} style={{ maxHeight: '60px', maxWidth: '120px', objectFit: 'contain', filter: 'grayscale(0.2)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
            Câu hỏi thường gặp
          </h2>
          <p style={{ textAlign: 'center', color: '#718096', fontSize: '18px', marginBottom: '50px' }}>
            Những thắc mắc phổ biến của khách hàng
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                q: 'Sản phẩm có chính hãng không?',
                a: 'Chúng tôi cam kết 100% sản phẩm chính hãng, nhập khẩu trực tiếp từ các đại lý ủy quyền. Nếu phát hiện hàng giả, chúng tôi hoàn lại 200% giá trị đơn hàng.'
              },
              {
                q: 'Thời gian giao hàng là bao lâu?',
                a: 'Đơn hàng nội thành sẽ được giao trong 1-2 ngày. Đơn hàng ngoại thành từ 2-5 ngày tùy khu vực. Miễn phí vận chuyển cho đơn hàng từ 300.000đ.'
              },
              {
                q: 'Tôi có thể đổi trả sản phẩm không?',
                a: 'Bạn có thể đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên seal, chưa qua sử dụng. Chi phí vận chuyển đổi trả sẽ do shop hỗ trợ.'
              },
              {
                q: 'Làm sao để được tư vấn sản phẩm?',
                a: 'Bạn có thể liên hệ hotline 0879079393, chat trực tiếp trên website hoặc nhắn tin qua Fanpage Facebook của chúng tôi. Đội ngũ tư vấn sẵn sàng hỗ trợ 24/7.'
              }
            ].map((faq, idx) => (
              <div key={idx} style={{ 
                background: '#fff', 
                padding: '30px', 
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#2d3748',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#667eea' }}>❓</span>
                  {faq.q}
                </h3>
                <p style={{ color: '#718096', lineHeight: '1.7' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 20px',
        color: '#fff'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
            Đăng ký nhận tin
          </h3>
          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
            Nhận thông tin về sản phẩm mới và ưu đãi độc quyền
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            maxWidth: '500px', 
            margin: '0 auto',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <input 
              type="email" 
              placeholder="Nhập email của bạn..."
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '14px 20px',
                borderRadius: '50px',
                border: 'none',
                fontSize: '15px',
                outline: 'none'
              }}
            />
            <button style={{
              background: '#fff',
              color: '#667eea',
              padding: '14px 32px',
              borderRadius: '50px',
              border: 'none',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#718096' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            Chưa có sản phẩm nào
          </h3>
          <p style={{ fontSize: '16px' }}>Hãy quay lại sau nhé!</p>
        </div>
      )}
    </div>
  );
}

export default HomeSimple;
