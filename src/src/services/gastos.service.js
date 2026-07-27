import api from "./api.service";

export const gastosService = {
    // --- LECTURA ---
    listar: async () => {
        const { data } = await api.get('/gastos');
        return data;
    },

    obtenerPorServicio: async (idServicio) => {
        const { data } = await api.get(`/gastos/servicio/${idServicio}`);
        return data;
    },

    obtenerOperativos: async () => {
        const { data } = await api.get('/gastos/operativos');
        return data;
    },

    // --- ESCRITURA ---
    crear: async (payload) => {
        const { data } = await api.post('/gastos', payload);
        return data;
    },

    // --- ACTUALIZACIÓN ---
    actualizarCabecera: async (idGasto, payload) => {
        const { data } = await api.put(`/gastos/cabecera/${idGasto}`, payload);
        return data;
    },

    actualizarDetalle: async (idDetalle, payload) => {
        const { data } = await api.put(`/gastos/detalle/${idDetalle}`, payload);
        return data;
    },

    // --- ELIMINACIÓN ---
    eliminarDetalle: async (idDetalle) => {
        const { data } = await api.delete(`/gastos/detalle/${idDetalle}`);
        return data;
    },

    eliminar: async (idGasto) => {
        const { data } = await api.delete(`/gastos/${idGasto}`);
        return data;
    },
    // --- PROCESAMIENTO IA ---
    procesarRecibo: async (formData) => {
        // Es importante enviar el FormData directamente. 
        // Asegúrate de que tu api.service tenga configurado el Content-Type correcto 
        // o que axios detecte automáticamente el 'multipart/form-data' al pasar el objeto.
        const { data } = await api.post('/gastos/procesar-recibo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },
};