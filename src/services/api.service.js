// src/services/api.js (EN TU PROYECTO FRONTEND)
import axios from 'axios';

const api = axios.create({
    // Reemplazamos 'localhost' por tu IP local como valor de respaldo (fallback)
    baseURL: import.meta.env.VITE_API_URL || 'http://192.168.1.17:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor opcional si necesitas adjuntar el token automáticamente en cada petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;