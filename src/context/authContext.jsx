import React, { createContext, useState, useContext, useEffect } from "react";
import AuthService from "../services/auth.service"; 

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
                    setUser(formatUser(data));
                }
            } catch (error) {
                console.error("Sesión inválida, cerrando sesión:", error);
                logout();
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
                setUser(formatUser(data));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error en login:", error);
            return false;
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    if (loading) return <div className="loading">Cargando sistema...</div>;

    // Solo exportamos lo necesario. Nota: eliminamos 'setUser' del value 
    // para evitar mutaciones directas del estado desde componentes hijos.
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    return context;
};