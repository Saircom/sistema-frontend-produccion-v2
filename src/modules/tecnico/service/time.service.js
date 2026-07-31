// src/services/tiempo.service.js
import api from '../../../services/api.service.js';
import { isNetworkError, offlineStore } from '../../../services/offline.service.js';

const registerOrQueue = async (idOtDetalle, action) => {
    const url = `/tiempos/${idOtDetalle}/${action}`;
    try {
        const response = await api.patch(url);
        return response.data;
    } catch (error) {
        if (!isNetworkError(error)) throw error;
        const registeredAt = new Date().toISOString();
        await offlineStore.enqueue({
            method: 'patch',
            url
        });
        return {
            success: true,
            pendingSync: true,
            registeredAt,
            message: 'Registro guardado sin internet. Se sincronizará automáticamente.'
        };
    }
};

export const tiempoService = {
    async obtener(idOtDetalle) {
        const response = await api.get(
            `/tiempos/${idOtDetalle}`
        );

        return response.data?.data ?? null;
    },

    async registrarLlegada(idOtDetalle) {
        return registerOrQueue(idOtDetalle, 'llegada');
    },

    async registrarInicio(idOtDetalle) {
        return registerOrQueue(idOtDetalle, 'inicio');
    },

    async registrarFin(idOtDetalle) {
        return registerOrQueue(idOtDetalle, 'fin');
    }
};
