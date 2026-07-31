// src/services/tecnicoOT.service.js
import api from '../../../services/api.service.js';
import { cacheKeys, isNetworkError, offlineStore } from '../../../services/offline.service.js';
// src/services/tecnicoOT.service.js

const cacheFullOrder = async (idTecnico, idOt) => {
    const response = await api.get(`/tecnico-ot/${idTecnico}/ordenes/${idOt}`);
    const order = response.data?.data ?? null;
    if (!order) return null;

    await offlineStore.set(cacheKeys.technicianOrder(idTecnico, idOt), order);

    const equipments = Array.isArray(order.equipos) ? order.equipos : [];
    await Promise.allSettled(equipments.map(async equipment => {
        const detailId = Number(equipment.id_ot_detalle);
        if (!detailId) return;
        const services = Array.isArray(equipment.servicios)
            ? equipment.servicios
            : [];
        const requiresReport = services.some(service =>
            String(service.codigo_tipo_servicio || '')
                .trim()
                .toUpperCase() !== 'ACTIVIDAD_DE_APOYO'
        );
        if (!requiresReport) return;
        const reportResponse = await api.get(
            `/informes/tecnico/${idTecnico}/detalles/${detailId}`
        );
        const report = reportResponse?.data?.data ?? reportResponse?.data;
        if (report) {
            await offlineStore.set(
                cacheKeys.technicianReport(idTecnico, detailId),
                report
            );
        }
    }));

    return order;
};

export const tecnicoOTService = {
    async getMisOrdenes(idTecnico) {
        const cacheKey = cacheKeys.technicianOrders(idTecnico);
        try {
            const response = await api.get(`/tecnico-ot/${idTecnico}`);
            const orders = response.data?.data ?? [];
            await offlineStore.set(cacheKey, orders);

            // Descarga el detalle y los informes para que toda la jornada quede disponible offline.
            await Promise.allSettled(
                orders.map(order => cacheFullOrder(idTecnico, order.id_ot))
            );
            return orders;
        } catch (error) {
            if (isNetworkError(error)) {
                const cached = await offlineStore.get(cacheKey);
                if (cached) return cached;
            }
            throw error;
        }
    },

    async getOrdenById(idTecnico, idOt) {
        const cacheKey = cacheKeys.technicianOrder(idTecnico, idOt);
        try {
            return await cacheFullOrder(idTecnico, idOt);
        } catch (error) {
            if (isNetworkError(error)) {
                const cached = await offlineStore.get(cacheKey);
                if (cached) return cached;
            }
            throw error;
        }
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
