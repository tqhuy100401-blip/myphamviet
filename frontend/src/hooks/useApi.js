import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

// Products hooks
export const useProducts = (filters = {}) => {
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return params.toString();
  }, [filters]);

  return useQuery({
    queryKey: ['products', queryString],
    queryFn: async () => {
      const response = await axiosClient.get(`/products?${queryString}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await axiosClient.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Cart hooks
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await axiosClient.get('/cart');
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const response = await axiosClient.post('/cart/add', { productId, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success('Đã thêm vào giỏ hàng!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const response = await axiosClient.put('/cart/update', { productId, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await axiosClient.delete(`/cart/remove/${productId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success('Đã xóa khỏi giỏ hàng!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    },
  });
};

// Orders hooks
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await axiosClient.get('/orders/my-orders');
      return response.data;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const response = await axiosClient.post('/orders', orderData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['cart']);
      toast.success('Đặt hàng thành công!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại!');
    },
  });
};

// Categories hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosClient.get('/categories');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Custom hook for optimistic updates
export const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();

  const updateOptimistically = useCallback(
    (queryKey, updateFn) => {
      queryClient.setQueryData(queryKey, updateFn);
    },
    [queryClient]
  );

  return { updateOptimistically };
};

// Custom hook for prefetching
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchProduct = useCallback(
    (id) => {
      queryClient.prefetchQuery({
        queryKey: ['product', id],
        queryFn: async () => {
          const response = await axiosClient.get(`/products/${id}`);
          return response.data;
        },
      });
    },
    [queryClient]
  );

  return { prefetchProduct };
};
