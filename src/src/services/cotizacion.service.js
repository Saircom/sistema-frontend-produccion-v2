// src/services/cotizacion.service.js
import api from './api.service.js';

export const cotizacionService = {
  // Obtener todas las cotizaciones
  getAll: async () => {
    try {
      const response = await api.get('/cotizacion'); // Ajusta la ruta según tu API
      return response.data;
    } catch (error) {
      console.error('Error en cotizacionService.getAll:', error);
      throw error;
    }
  },

  // Actualizar el estado de una cotización
  updateEstado: async (idCotizacion, nuevoEstado) => {
    try {
      const response = await api.patch(`/cotizacion/${idCotizacion}/estado`, {
        estado: nuevoEstado 
      });
      return response.data?.data ?? null;
    } catch (error) {
      console.error(`Error al actualizar la cotización ${idCotizacion}:`, error);
      throw error;
    }
  }
};
