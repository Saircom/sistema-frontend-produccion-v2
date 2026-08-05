// src/services/api.service.js
import axios from 'axios';
import { socket } from './socket.js';

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        'http://192.168.0.160:3000/api'
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (socket.connected && socket.id) {
            config.headers['X-Socket-Id'] = socket.id;
        }

        if (config.data instanceof FormData) {
            /*
             * No establecer Content-Type manualmente.
             * Axios y el navegador agregarán:
             *
             * multipart/form-data; boundary=...
             */
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];

            console.log('Enviando FormData multipart');
        } else {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') window.location.replace('/login');
        }
        return Promise.reject(error);
    }
);

export default api;
