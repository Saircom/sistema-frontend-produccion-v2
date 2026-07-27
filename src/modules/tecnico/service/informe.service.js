// src/modules/Tecnico/service/informe.service.js
import api from '../../../services/api.service.js';

const BASE_URL = '/informes';

const validarId = (valor, nombre) => {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error(`El ID de ${nombre} no es válido`);
    }

    return id;
};

const validarPayload = (payload) => {
    if (
        !payload ||
        typeof payload !== 'object' ||
        Array.isArray(payload)
    ) {
        throw new Error(
            'Los datos del informe no son válidos'
        );
    }

    return payload;
};

const obtenerData = (
    response,
    valorPorDefecto = null
) => {
    return (
        response?.data?.data ??
        response?.data ??
        valorPorDefecto
    );
};

export const informeService = {
    /**
     * Carga el informe completo validando al técnico.
     *
     * GET:
     * /api/informes/tecnico/:idTecnico/detalles/:idOtDetalle
     */
    async getDetalleInforme(
        idTecnico,
        idOtDetalle
    ) {
        const tecnico = validarId(
            idTecnico,
            'técnico'
        );

        const detalle = validarId(
            idOtDetalle,
            'detalle de la OT'
        );

        const response = await api.get(
            `${BASE_URL}/tecnico/${tecnico}/detalles/${detalle}`
        );

        return obtenerData(response);
    },

    /**
     * Guarda o actualiza el informe validando al técnico.
     *
     * PUT:
     * /api/informes/tecnico/:idTecnico/detalles/:idOtDetalle
     */
    async guardarInforme(
        idTecnico,
        idOtDetalle,
        payload
    ) {
        const tecnico = validarId(
            idTecnico,
            'técnico'
        );

        const detalle = validarId(
            idOtDetalle,
            'detalle de la OT'
        );

        const datos = validarPayload(payload);

        const response = await api.put(
            `${BASE_URL}/tecnico/${tecnico}/detalles/${detalle}`,
            datos
        );

        return obtenerData(response, {});
    },

    /**
     * Finaliza el informe validando al técnico.
     *
     * PATCH:
     * /api/informes/tecnico/:idTecnico/detalles/:idOtDetalle/finalizar
     */
    async finalizarInforme(
        idTecnico,
        idOtDetalle
    ) {
        const tecnico = validarId(
            idTecnico,
            'técnico'
        );

        const detalle = validarId(
            idOtDetalle,
            'detalle de la OT'
        );

        const response = await api.patch(
            `${BASE_URL}/tecnico/${tecnico}/detalles/${detalle}/finalizar`
        );

        return obtenerData(response, {});
    },

    /**
     * Carga el informe sin validar técnico.
     *
     * GET:
     * /api/informes/detalles/:idOtDetalle
     */
    async getDetalleInformeAdmin(idOtDetalle) {
        const detalle = validarId(
            idOtDetalle,
            'detalle de la OT'
        );

        const response = await api.get(
            `${BASE_URL}/detalles/${detalle}`
        );

        return obtenerData(response);
    },

    /**
     * Guarda el informe como administrador o Planner.
     *
     * PUT:
     * /api/informes/detalles/:idOtDetalle
     */
    async guardarInformeAdmin(
        idOtDetalle,
        payload
    ) {
        const detalle = validarId(
            idOtDetalle,
            'detalle de la OT'
        );

        const datos = validarPayload(payload);

        const response = await api.put(
            `${BASE_URL}/detalles/${detalle}`,
            datos
        );

        return obtenerData(response, {});
    },

    /**
     * Finaliza el informe sin validar técnico.
     *
     * PATCH:
     * /api/informes/detalles/:idOtDetalle/finalizar
     */
    async finalizarInformeAdmin(idOtDetalle) {
        const detalle = validarId(
            idOtDetalle,
            'detalle de la OT'
        );

        const response = await api.patch(
            `${BASE_URL}/detalles/${detalle}/finalizar`
        );

        return obtenerData(response, {});
    },

    /**
     * Obtiene un informe por id_informe.
     *
     * GET:
     * /api/informes/:idInforme
     */
    async getById(idInforme) {
        const informe = validarId(
            idInforme,
            'informe'
        );

        const response = await api.get(
            `${BASE_URL}/${informe}`
        );

        return obtenerData(response);
    },

    /**
     * Obtiene el historial del equipo.
     *
     * GET:
     * /api/informes/equipos/:idEquipo/historial
     */
    async getHistorialEquipo(
        idEquipo,
        idOtDetalleActual = null
    ) {
        const equipo = validarId(
            idEquipo,
            'equipo'
        );

        const params = {};

        if (
            idOtDetalleActual !== null &&
            idOtDetalleActual !== undefined &&
            idOtDetalleActual !== ''
        ) {
            params.idOtDetalleActual =
                validarId(
                    idOtDetalleActual,
                    'detalle actual'
                );
        }

        const response = await api.get(
            `${BASE_URL}/equipos/${equipo}/historial`,
            { params }
        );

        const data = obtenerData(response, []);

        return Array.isArray(data)
            ? data
            : [];
    },

    /**
     * Obtiene el detalle de un informe histórico.
     *
     * GET:
     * /api/informes/historial/:idInforme
     */
    async getDetalleHistorial(idInforme) {
        const informe = validarId(
            idInforme,
            'informe'
        );

        const response = await api.get(
            `${BASE_URL}/historial/${informe}`
        );

        return obtenerData(response);
    }
};

export default informeService;