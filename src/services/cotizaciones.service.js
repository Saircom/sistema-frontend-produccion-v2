import api from './api.service.js';

const CotizacionService = {
    // GET /api/cotizacion
    getAll: async () => {
        try {
            const response = await api.get('/cotizacion');
            return response.data;
        } catch (error) {
            console.error("Error al obtener todas las cotizaciones:", error.response?.status || error.message);
            throw error;
        }
    },

    // POST /api/cotizacion
    crearCotizacion: async (data) => {
        try {
            // Aseguramos que el token exista antes de enviar (validación preventiva)
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No hay token de autenticación disponible. Por favor, inicie sesión.");
            }

            const response = await api.post('/cotizacion', data);
            return response.data;
        } catch (error) {
            console.error("Error al crear cotización:", error.response?.data || error.message);
            throw error;
        }
    },

    // GET /api/cotizacion/:id
    obtenerCotizacion: async (id) => {
        try {
            const response = await api.get(`/cotizacion/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener cotización por ID ${id}:`, error.response?.status || error.message);
            throw error;
        }
    },

    getById: async (id) => CotizacionService.obtenerCotizacion(id),

    actualizarCotizacion: async (id, data) => {
        try {
            const response = await api.put(`/cotizacion/${id}`, data);
            return response.data?.data ?? response.data;
        } catch (error) {
            console.error(`Error al editar cotización ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },

    actualizarEstado: async (idCotizacion, estado) => {
        try {
            const response = await api.patch(
                `/cotizacion/${idCotizacion}/estado`,
                { estado }
            );
            return response.data?.data ?? null;
        } catch (error) {
            console.error(
                `Error al actualizar la cotización ${idCotizacion}:`,
                error.response?.data || error.message
            );
            throw error;
        }
    }
};

export default CotizacionService;
