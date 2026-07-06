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
  updateEstado: async (id_servicio, nuevoEstado) => {
    try {
      const response = await api.put(`/cotizacion/estado/${id_servicio}`, { 
        estado: nuevoEstado 
      });
      return response.data;
    } catch (error) {
      console.error(`Error en cotizacionService.updateEstado para ID ${id_servicio}:`, error);
      throw error;
    }
  }
};