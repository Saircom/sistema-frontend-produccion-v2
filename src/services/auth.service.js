import api from "./api.service";

const TOKEN_KEY = "token";

const AuthService = {
    // Login: Guarda el token automáticamente tras el éxito
    login: async (dni, password) => {
        const { data } = await api.post("/auth/login", { dni, password });
        
        if (data?.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
        }
        return data; 
    },

    // Validar token: Se asume que el interceptor de axios ya envía el header
    validateToken: async () => {
        const { data } = await api.get("/auth/validate");
        return data;
    },

    // Restablecer contraseña
    restablecerContrasena: async (datos) => {
        const { data } = await api.post("/auth/restablecer-contrasena", datos);
        return data;
    },

    // Métodos utilitarios que el AuthProvider debe usar
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    getToken: () => localStorage.getItem(TOKEN_KEY)
};

export default AuthService;