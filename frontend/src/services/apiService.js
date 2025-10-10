import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const apiService = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach the JWT token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401/403 errors
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.clear();
      console.error('Sessão expirada ou permissão negada. Por favor, faça login novamente.');
    }
    return Promise.reject(error);
  }
);

export default apiService;
