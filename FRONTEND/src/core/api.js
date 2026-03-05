import axios from 'axios';

// Usamos la variable de entorno que definimos en docker-compose
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
});

// Interceptor: token + Content-Type correcto
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // ⚠️ CLAVE: solo JSON si NO es FormData
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }

    return config;
});

// Interceptor de respuesta: 401 (sin token) o 403 (token expirado/inválido) → cerrar sesión
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            console.warn('🔐 Sesión inválida o expirada. Limpiando sesión...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

