/**
 * Utility functions for common operations
 */
import logger from './logger';

// Format currency VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Format date
export const formatDate = (date, format = 'short') => {
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }
  };

  return new Intl.DateTimeFormat('vi-VN', options[format] || options.short)
    .format(new Date(date));
};

// Debounce function
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Generate slug from text
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number (Vietnam)
export const isValidPhone = (phone) => {
  const re = /^(0|\+84)[0-9]{9,10}$/;
  return re.test(phone.replace(/\s/g, ''));
};

// Get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002'}/uploads/${imagePath}`;
};

// Calculate discount price
export const calculateDiscountPrice = (price, discount) => {
  if (!discount || !discount.value) return price;
  
  const now = new Date();
  if (discount.start && now < new Date(discount.start)) return price;
  if (discount.end && now > new Date(discount.end)) return price;
  
  if (discount.type === 'percent') {
    return price * (1 - discount.value / 100);
  } else if (discount.type === 'amount') {
    return Math.max(0, price - discount.value);
  }
  
  return price;
};

// Check if product has active discount
export const hasActiveDiscount = (discount) => {
  if (!discount || !discount.value) return false;
  
  const now = new Date();
  if (discount.start && now < new Date(discount.start)) return false;
  if (discount.end && now > new Date(discount.end)) return false;
  
  return true;
};

// Get discount percentage
export const getDiscountPercentage = (originalPrice, discountedPrice) => {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      logger.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error('Error clearing localStorage:', error);
    }
  }
};

// Calculate cart total
export const calculateCartTotal = (items) => {
  return items.reduce((total, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);
};

// Get order status label
export const getOrderStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  };
  return labels[status] || status;
};

// Get order status color
export const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'info',
    shipping: 'primary',
    delivered: 'success',
    cancelled: 'danger'
  };
  return colors[status] || 'secondary';
};

// Scroll to top
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    logger.error('Failed to copy:', error);
    return false;
  }
};

// Check if mobile device
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};
