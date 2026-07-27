// src/services/servicios.service.js
import api from './api.service.js';

export const serviciosService = {
    // --- CONSULTAS ---
    getAll: async () => {
        const response = await api.get('/servicios');
        return response.data;
    },

    getById: async (idServicio) => {
        const response = await api.get(`/servicios/${idServicio}`);
        return response.data;
    },

    getByCliente: async (idCliente) => {
        const response = await api.get(`/servicios/cliente/${idCliente}`);
        return response.data;
    },

    getPendientesTecnico: async (idUsuario) => {
        const response = await api.get(`/servicios/tecnico/${idUsuario}`);
        return response.data;
    },

    getHistorialTiempos: async () => {
        const response = await api.get('/tiempos');
        return response.data?.data ?? [];
    },

    // --- OPERACIONES ---
    aperturarServicio: async (datosApertura) => {
        const response = await api.post('/servicios/apertura', datosApertura);
        return response.data;
    },

    // Actualización completa: Líder, estado y técnicos de apoyo
    updateServicioCompleto: async (idServicio, datos) => {
        const response = await api.put(`/servicios/${idServicio}`, datos);
        return response.data;
    },

    actualizarEstado: async (idServicio, estado) => {
        const response = await api.put(`/servicios/${idServicio}/estado`, { estado });
        return response.data;
    },

    actualizarLecturas: async (idServicio, lecturas) => {
        const response = await api.put(`/lecturas/servicios/${idServicio}`, lecturas);
        return response.data;
    },

    guardarAvancesCampo: async (idServicio, avances) => {
        const response = await api.put(`/servicios/${idServicio}/campo`, avances);
        return response.data;
    },

    // Eliminación lógica
    eliminarServicio: async (idServicio) => {
        return await serviciosService.actualizarEstado(idServicio, 'eliminado');
    },

    // --- HISTORIAL TÉCNICO ---
    getHistorialPorSerie: async (serie) => {
        const response = await api.get(`/servicios/antecedentes/${serie}`);
        return response.data;
    },
};

export default serviciosService;
