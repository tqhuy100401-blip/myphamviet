import axios from "axios";
import { toast } from "react-toastify";
import logger from "../utils/logger";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request
    logger.api(config.method, config.url);
    
    return config;
  },
  (error) => {
    logger.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // Log response
    logger.apiResponse(response.config.method, response.config.url, response.data);
    return response;
  },
  (error) => {
    // Handle different error types
    if (!error.response) {
      // Network error
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối!');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Unauthorized - Token invalid or expired
        const token = localStorage.getItem("token");
        if (token) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userName");
          toast.error(data?.message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }
        break;

      case 403:
        // Forbidden
        toast.error(data?.message || "Bạn không có quyền truy cập!");
        break;

      case 404:
        // Not found
        toast.error(data?.message || "Không tìm thấy dữ liệu!");
        break;

      case 422:
        // Validation error
        if (data?.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(data?.message || "Dữ liệu không hợp lệ!");
        }
        break;

      case 429:
        // Too many requests
        toast.error("Quá nhiều request. Vui lòng thử lại sau!");
        break;

      case 500:
        // Server error
        toast.error(data?.message || "Lỗi server. Vui lòng thử lại sau!");
        break;

      default:
        toast.error(data?.message || "Đã có lỗi xảy ra!");
    }

    // Log error
    logger.apiError(error.config?.method, error.config?.url, error.response);

    return Promise.reject(error);
  }
);

export default axiosClient;
