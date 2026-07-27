import api from './api.service'; // Asegúrate de importar tu instancia de axios configurada

export const RolService = {
  // Obtener todos los roles disponibles
  getAll: async () => {
    try {
      const response = await api.get('/usuarios/roles');
      return response.data;
    } catch (error) {
      console.error("Error al obtener roles:", error);
      throw error;
    }
  }
};