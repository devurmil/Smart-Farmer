import axios from 'axios';

const api = axios.create({
  // You should point this to your backend's base URL.
  baseURL: import.meta.env.VITE_API_URL || 'https://smart-farmer-cyyz.onrender.com/api',
  // This is the crucial setting that allows cookies to be sent with requests.
  withCredentials: true,
});

export default api;