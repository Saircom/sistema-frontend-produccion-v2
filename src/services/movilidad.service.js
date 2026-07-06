// src/modules/equipos/movilidad.service.js
import api from './api.service.js';

export const movilidadService = {
    // Obtener todas las movilidades
    async getAll() {
        const response = await api.get('/movilidades');
        return response.data;
    },

    // Obtener una movilidad por ID
    async getById(id) {
        const response = await api.get(`/movilidades/${id}`);
        return response.data;
    },

    // Crear una nueva movilidad
    async create(data) {
        const response = await api.post('/movilidades', data);
        return response.data;
    },

    // Actualizar información general
    async update(id, data) {
        const response = await api.put(`/movilidades/${id}`, data);
        return response.data;
    },

    // Actualizar kilometraje
    async updateKilometraje(id, kilometraje) {
        const response = await api.patch(`/movilidades/${id}/kilometraje`, { kilometraje_actual: kilometraje });
        return response.data;
    },

    // Obtener historial de servicios de una movilidad
    async getHistorialServicios(id) {
        const response = await api.get(`/movilidades/${id}/historial`);
        return response.data;
    },

    // Eliminar movilidad
    async delete(id) {
        const response = await api.delete(`/movilidades/${id}`);
        return response.data;
    }
};