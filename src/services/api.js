import axios from 'axios';

const api = axios.create({
  // You should point this to your backend's base URL.
  // You can use an environment variable for this.
  // Example: http://localhost:8000/api
  baseURL: import.meta.env.VITE_API_URL || 'https://smart-farmer-cyyz.onrender.com/api',
});

/**
 * Interceptor to add the auth token to every request.
 * This is more robust than setting the header manually every time.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;