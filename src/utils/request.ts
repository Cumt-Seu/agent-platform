// Axios 请求封装 — Token 从 Zustand 获取，401 自动刷新 + 并发排队

import axios from 'axios';
import { API_BASE_URL } from './constants';
import { useAuthStore } from '../stores/useAuthStore';

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 并发 401 排队机制
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processPendingRequests(token: string | null, error?: unknown) {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  pendingRequests = [];
}

// 请求拦截器 — 从 Zustand 获取 Token
request.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 — 401 自动刷新 Token
request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // 排队等待刷新完成
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(request(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        });

        const newToken = data.token;
        useAuthStore.getState().setToken(newToken);
        processPendingRequests(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return request(originalRequest);
      } catch (refreshError) {
        processPendingRequests(null, refreshError);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default request;
