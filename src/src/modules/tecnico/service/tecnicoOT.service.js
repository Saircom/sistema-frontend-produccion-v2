// src/services/tecnicoOT.service.js
import api from '../../../services/api.service.js';
// src/services/tecnicoOT.service.js

export const tecnicoOTService = {
    async getMisOrdenes(idTecnico) {
        const response = await api.get(
            `/tecnico-ot/${idTecnico}`
        );

        return response.data?.data ?? [];
    },

    async getOrdenById(idTecnico, idOt) {
        const response = await api.get(
            `/tecnico-ot/${idTecnico}/ordenes/${idOt}`
        );

        return response.data?.data ?? null;
    },

    async verificarDetalle(idTecnico, idOtDetalle) {
        const response = await api.get(
            `/tecnico-ot/${idTecnico}/detalles/${idOtDetalle}`
        );

        return response.data?.data ?? null;
    },

    async actualizarEstadoServicio(
        idTecnico,
        idOtDetalleServicio,
        data
    ) {
        const response = await api.patch(
            `/tecnico-ot/${idTecnico}/servicios/${idOtDetalleServicio}`,
            data
        );

        return response.data;
    }
};

export default tecnicoOTService;