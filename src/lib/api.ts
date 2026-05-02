import axios, { AxiosRequestConfig } from 'axios';

// Nếu NEXT_PUBLIC_API_URL không có thì mặc định dùng rỗng để browser tự resolve path relative
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Khởi tạo instance axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Required to send Supabase auth cookies
});

// Interceptor cho Request
axiosInstance.interceptors.request.use(
  (config) => {
    // TODO: Thêm token (nếu có) vào header ở đây
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response
axiosInstance.interceptors.response.use(
  (response) => {
    // Tuỳ vào backend trả data thẳng list hay trả về { data: ... }
    // Ở đây ta cứ trả nguyên data của response để code gọi sử dụng
    return response.data;
  },
  (error) => {
    // Log lỗi tập trung
    console.error('API Error:', error?.response?.data || error.message);

    // Xử lý token hết hạn (401)
    if (error.response?.status === 401) {
      // dispatch logout event, hoặc redirect to login
    }

    return Promise.reject(error);
  }
);

// Wrapper API để tương thích ngược với code cũ
export const api = {
  get: <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get<T, T>(endpoint, config),

  post: <T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post<T, T>(endpoint, body, config),

  put: <T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put<T, T>(endpoint, body, config),

  patch: <T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.patch<T, T>(endpoint, body, config),

  delete: <T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete<T, T>(endpoint, config),
};
