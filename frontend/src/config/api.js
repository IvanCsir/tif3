import axios from 'axios';

// Configuración de API para desarrollo y producción
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Instancia de axios configurada
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Interceptor para agregar token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('usuario_id');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default API_BASE_URL;
