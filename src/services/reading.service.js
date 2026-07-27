import api from './api.service';

export const lecturasService = {
    // Método para registrar lecturas (upsert - actualiza o crea)
    registrarLecturas: async (idServicio, formData) => {
        try {
            const response = await api.put(`lecturas/servicios/${idServicio}`, formData);
            return response.data;
        } catch (error) {
            console.error('Error al registrar lecturas:', error);
            throw error;
        }
    },

    // Método para crear una nueva lectura (POST)
    crearLectura: async (idServicio, formData) => {
        try {
            const response = await api.post(`lecturas/servicios/${idServicio}`, formData);
            return response.data;
        } catch (error) {
            console.error('Error al crear lectura:', error);
            throw error;
        }
    },

    // Método para actualizar una lectura existente (PUT)
    actualizarLectura: async (idServicio, formData) => {
        try {
            const response = await api.put(`lecturas/servicios/${idServicio}`, formData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar lectura:', error);
            throw error;
        }
    }
};

export default lecturasService;