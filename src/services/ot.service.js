import api from './api.service.js';

export const otService = {
    async getCotizacionesDisponibles() {
        const response = await api.get(
            '/ordentrabajo/cotizaciones-disponibles'
        );

        return response.data?.data ?? [];
    },

    async getCotizacionById(idCotizacion) {
        if (!idCotizacion) {
            throw new Error(
                'No se recibió el ID de la cotización'
            );
        }

        const response = await api.get(
            `/ordentrabajo/cotizaciones/${idCotizacion}`
        );

        // Retorna directamente la cotización
        return response.data?.data ?? null;
    },

    async crearOrden(data) {
        const response = await api.post(
            '/ordentrabajo',
            data
        );

        return response.data;
    },

    async getOrdenes() {
        const response = await api.get(
            '/ordentrabajo'
        );

        return response.data?.data ?? [];
    },

    async getOrdenById(idOt) {
        const response = await api.get(
            `/ordentrabajo/${idOt}`
        );

        return response.data?.data ?? null;
    },

    async actualizarEstado(idOt, estado) {
        const response = await api.patch(
            `/ordentrabajo/${idOt}/estado`,
            { estado }
        );

        return response.data?.data ?? null;
    }
};
