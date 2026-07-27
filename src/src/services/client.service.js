// src/services/client.service.js
import api from './api.service.js';

/**
 * Convierte a mayúsculas las cadenas de texto dentro del objeto de datos del cliente.
 * Evita alterar campos como el correo electrónico o el RUC que requieren conservar su formato original.
 */
const normalizeClientData = (data) => {
    if (!data) return data;
    
    const normalized = { ...data };
    const fieldsToUppercase = [
        'razon_social', 
        'direccion', 
        'contacto', 
        'distrito', 
        'provincia', 
        'departamento', 
        'zona'
    ];

    fieldsToUppercase.forEach(field => {
        if (typeof normalized[field] === 'string') {
            normalized[field] = normalized[field].trim().toUpperCase();
        }
    });

    // Asegurar que el correo se mantenga siempre en minúsculas por estandarización
    if (typeof normalized.correo === 'string') {
        normalized.correo = normalized.correo.trim().toLowerCase();
    }

    return normalized;
};

export const clientService = {
    /**
     * Obtiene la lista completa de clientes registrados.
     * Soporta opcionalmente un término de búsqueda.
     * Ideal para llenar el combobox/select principal en paneles de administración o cotizaciones.
     * @param {string} [searchTerm] - RUC o Razón social opcional para filtrar
     */
    getAll: async (searchTerm = '') => {
        try {
            const url = searchTerm ? `/clientes?search=${encodeURIComponent(searchTerm)}` : '/clientes';
            const response = await api.get(url);
            return response.data; // Retorna { success: true, data: [...] }
        } catch (error) {
            throw error.response?.data || new Error("Error fetching clients list");
        }
    },

    /**
     * Busca clientes por RUC o Razón Social mediante coincidencia parcial.
     * Diseñado específicamente para inputs de búsqueda en tiempo real (autocompletado).
     * @param {string} query - Texto o dígitos a buscar
     */
    search: async (query) => {
        try {
            if (!query) return { success: true, data: [] };
            const response = await api.get(`/clientes?search=${encodeURIComponent(query)}`);
            return response.data; // Retorna { success: true, data: [...] }
        } catch (error) {
            throw error.response?.data || new Error("Error searching clients");
        }
    },

    /**
     * Obtiene los datos detallados de un cliente específico por su ID único en la base de datos.
     * Crucial para capturar la información automáticamente sin entrada manual.
     * @param {string|number} id - ID del cliente
     */
    getByIdentifier: async (id) => {
        try {
            const response = await api.get(`/clientes/${id}`);
            return response.data; // Retorna { success: true, data: {...} }
        } catch (error) {
            throw error.response?.data || new Error("Error fetching client data");
        }
    },

    /**
     * Registra un nuevo cliente en el sistema.
     * Convierte automáticamente los textos correspondientes a MAYÚSCULAS antes del envío.
     * @param {Object} clientData - Datos de la empresa (Razón social, RUC, dirección, etc.)
     */
    create: async (clientData) => {
        try {
            const cleanData = normalizeClientData(clientData);
            const response = await api.post('/clientes', cleanData);
            return response.data; // Retorna { success: true, id_cliente: ..., message: "..." }
        } catch (error) {
            throw error.response?.data || new Error("Error creating new client");
        }
    },

    /**
     * Actualiza los datos de un cliente existente por su ID.
     * Convierte automáticamente los textos correspondientes a MAYÚSCULAS antes del envío.
     * @param {string|number} id - ID del cliente a actualizar
     * @param {Object} clientData - Nuevos datos de la empresa a modificar
     */
    update: async (id, clientData) => {
        try {
            const cleanData = normalizeClientData(clientData);
            const response = await api.put(`/clientes/${id}`, cleanData);
            return response.data; // Retorna { success: true, message: "..." } o datos actualizados
        } catch (error) {
            throw error.response?.data || new Error("Error updating client");
        }
    },

    /**
     * Elimina un cliente del sistema por su ID.
     * @param {string|number} id - ID del cliente
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/clientes/${id}`);
            return response.data; // Retorna { success: true, message: "..." }
        } catch (error) {
            throw error.response?.data || new Error("Error deleting client");
        }
    }
};