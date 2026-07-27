// src/services/movilidad.service.js
import api from './api.service.js';

export const movilidadService = {
    // Obtener todas las movilidades
    async getAll() {
        const { data } = await api.get('/movilidades');
        return data;
    },

    // Obtener una movilidad por ID (incluye historial y documentos)
    async getById(id) {
        const { data } = await api.get(`/movilidades/${id}`);
        return data;
    },

    // Registrar una nueva movilidad
    async create(payload) {
        const { data } = await api.post('/movilidades', payload);
        return data;
    },

    // Actualizar datos de la movilidad
    async update(id, payload) {
        const { data } = await api.put(`/movilidades/${id}`, payload);
        return data;
    },

    // Eliminar movilidad
    async delete(id) {
        const { data } = await api.delete(`/movilidades/${id}`);
        return data;
    },

    // Registrar mantenimiento
    async addMantenimiento(id, payload) {
        const { data } = await api.post(
            `/movilidades/${id}/mantenimiento`,
            payload
        );
        return data;
    },

    // Registrar documento (SOAT, Revisión Técnica, Seguro, etc.)
    async addDocumento(id, formData) {
        const { data } = await api.post(
            `/movilidades/${id}/documento`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return data;
    }
};

export default movilidadService; 