import api from './api.service.js';

export const DashboardService = {
    /**
     * 1. Obtiene las métricas generales de todos los servicios (Admin / Supervisor)
     * @returns {Promise<Array>} Lista de todos los servicios
     */
    obtenerDatosDashboard: async (filtros = {}) => {
        try {
            const response = await api.get('/dashboard/stats', { params: filtros });
            return response.data || response; 
        } catch (error) {
            console.error("Error en DashboardService.obtenerDatosDashboard (Frontend):", error.message);
            const mensajeError = error.response?.data?.error || error.message || 'Error al conectar con el servidor';
            throw new Error(mensajeError);
        }
    },

    /**
     * 2. NUEVO: Obtiene las métricas y servicios específicos de un técnico (Postventa Individual)
     * @param {number|string} id_usuario - ID del técnico logueado
     * @returns {Promise<Array>} Lista de servicios asignados al técnico
     */
    obtenerDatosTecnico: async (id_usuario) => {
        try {
            // Hacemos la petición dinámica usando el ID del técnico
            const response = await api.get(`/dashboard/stats/tecnico/${id_usuario}`);
            return response.data || response;
        } catch (error) {
            console.error("Error en DashboardService.obtenerDatosTecnico (Frontend):", error.message);
            const mensajeError = error.response?.data?.error || error.message || 'Error al obtener los datos del técnico';
            throw new Error(mensajeError);
        }
    }
};
