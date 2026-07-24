// src/services/tiempo.service.js
import api from '../../../services/api.service.js';

export const tiempoService = {
    async obtener(idOtDetalle) {
        const response = await api.get(
            `/tiempos/${idOtDetalle}`
        );

        return response.data?.data ?? null;
    },

    async registrarLlegada(idOtDetalle) {
        const response = await api.patch(
            `/tiempos/${idOtDetalle}/llegada`
        );

        return response.data;
    },

    async registrarInicio(idOtDetalle) {
        const response = await api.patch(
            `/tiempos/${idOtDetalle}/inicio`
        );

        return response.data;
    },

    async registrarFin(idOtDetalle) {
        const response = await api.patch(
            `/tiempos/${idOtDetalle}/fin`
        );

        return response.data;
    }
};