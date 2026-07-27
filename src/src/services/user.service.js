// src/services/usuario.service.js
import api from './api.service.js';

export const UsuarioService = {
    getProfile: async () => {
        const response = await api.get('/perfil');
        return response.data;
    },

    updateProfile: async data => {
        const response = await api.patch('/perfil', data);
        return response.data;
    },

    changeOwnPassword: async data => {
        const response = await api.patch('/perfil/password', data);
        return response.data;
    },

    /**
     * Obtener todos los usuarios
     */
    getAll: async () => {
        const response = await api.get('/usuarios');
        return response.data;
    },

    /**
     * Obtener únicamente técnicos
     */
    getTecnicos: async () => {
        const response = await api.get('/usuarios/tecnicos');
        return response.data.data;
    },

    /**
     * Obtener usuario por ID
     */
    getById: async (id) => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    /**
     * Crear usuario
     */
    create: async (data) => {
        const response = await api.post('/usuarios', data);
        return response.data;
    },

    /**
     * Actualizar usuario
     */
    update: async (id, data) => {
        const response = await api.put(`/usuarios/${id}`, data);
        return response.data;
    },

    /**
     * Eliminar usuario
     */
    delete: async (id) => {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    }
};
