import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api', // 你的 API 基础路径
  timeout: 10000, // 请求超时时间
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      // 如果 token 存在，则添加到请求头中
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

export default api;
