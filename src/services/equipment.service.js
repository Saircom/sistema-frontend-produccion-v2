// src/services/equipmentService.js
import api from './api.service';

export const equipmentService = {
  /**
   * Obtiene la lista de marcas activas para los selectores del formulario
   * @returns {Promise<Array>}
   */
  getMarcas: async () => {
    try {
      const response = await api.get('/equipos/marcas');
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Error al obtener el catálogo de marcas');
    }
  },

  /**
   * Obtiene el listado completo de equipos
   */
  getAllEquipment: async () => {
    try {
      const response = await api.get('/equipos');
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Error al conectar con el servidor');
    }
  },

  /**
   * Obtiene equipos vinculados a un cliente específico
   */
  getByClient: async (idCliente) => {
    try {
      const response = await api.get(`/equipos/cliente/${idCliente}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Error al obtener los equipos del cliente');
    }
  },

  /**
   * Obtiene la ficha técnica detallada de un equipo
   */
  getEquipmentDetails: async (id) => {
    try {
      const response = await api.get(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Error al recuperar el historial del equipo');
    }
  },

  /**
   * Registra un nuevo equipo (Asegúrate de enviar id_cliente y id_marca)
   */
  saveEquipment: async (equipmentData) => {
    try {
      const response = await api.post('/equipos', equipmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Error al registrar la infraestructura del equipo');
    }
  },

  /**
   * Actualiza la ficha técnica
   */
  updateEquipment: async (id, equipmentData) => {
    try {
      const response = await api.put(`/equipos/${id}`, equipmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Error al actualizar la ficha técnica');
    }
  },

  /**
   * Elimina un equipo
   */
  deleteEquipment: async (id) => {
    try {
      const response = await api.delete(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Error al intentar eliminar el equipo');
    }
  }
};