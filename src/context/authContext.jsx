/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import AuthService from "../services/auth.service"; 
import { cacheKeys, isNetworkError, offlineStore } from "../services/offline.service.js";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función privada para normalizar los datos del usuario
    const formatUser = (data) => {
        const u = data.usuario || data;
        return {
            id_usuario: u.id_usuario || u.id,
            name: u.nombres || u.name || "",
            apellidos: u.apellidos || "",
            dni: u.dni || "",
            rol: u.rol || u.nombre_rol || "",
        };
    };

    useEffect(() => {
        const initSession = async () => {
            const token = AuthService.getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await AuthService.validateToken();
                if (data?.usuario) {
                    const formatted = formatUser(data);
                    setUser(formatted);
                    await offlineStore.set(cacheKeys.user, formatted);
                }
            } catch (error) {
                if (isNetworkError(error)) {
                    const cachedUser = await offlineStore.get(cacheKeys.user);
                    if (cachedUser) setUser(cachedUser);
                } else {
                    console.error("Sesión inválida, cerrando sesión:", error);
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        initSession();
    }, []);

    const login = async (dni, password) => {
        if (!dni || !password) return false;
        try {
            const data = await AuthService.login(dni, password);
            if (data?.usuario) {
                const formatted = formatUser(data);
                setUser(formatted);
                await offlineStore.set(cacheKeys.user, formatted);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
        offlineStore.remove(cacheKeys.user);
        setUser(null);
    };

    const refreshUser = async () => {
        const data = await AuthService.validateToken();
        if (data?.usuario) {
            const formatted = formatUser(data);
            setUser(formatted);
            await offlineStore.set(cacheKeys.user, formatted);
        }
        return data?.usuario;
    };

    if (loading) return <div className="loading">Cargando sistema...</div>;

    // Solo exportamos lo necesario. Nota: eliminamos 'setUser' del value 
    // para evitar mutaciones directas del estado desde componentes hijos.
    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    return context;
};
