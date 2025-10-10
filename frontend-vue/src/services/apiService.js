import axios from 'axios';

const apiService = axios.create({
  baseURL: 'http://localhost:3001/api',
});

apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiService;
