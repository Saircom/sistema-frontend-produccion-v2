// src/services/tiposervicio.service.js
import api from './api.service.js';

const TipoServicioService = {
    /**
     * Obtiene todos los tipos de servicio para el selector inicial
     */
    async getAll() {
        try {
            // Asegúrate de que este endpoint coincida con tu rutas.js en el backend
            const { data } = await api.get('/tiposervicio/tipos-servicio');
            return data;
        } catch (error) {
            console.error('Error al obtener los tipos de servicio:', error);
            throw error;
        }
    },

    /**
     * Obtiene subtipos filtrados por el ID de un tipo de servicio
     * @param {number|string} id 
     */
    async getByTipo(id) {
        if (!id) throw new Error("Se requiere un ID válido para consultar subtipos.");

        try {
            const { data } = await api.get(`/tiposervicio/subtipos/${id}`);
            return data;
        } catch (error) {
            console.error(`Error al obtener subtipos para el tipo ${id}:`, error);
            throw error;
        }
    }
};

export default TipoServicioService;