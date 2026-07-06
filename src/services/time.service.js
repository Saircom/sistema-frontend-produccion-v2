import api from './api.service'; // o la instancia axios que uses

export const tiempoService = {

    obtener: async (idServicio) => {
        const { data } = await api.get(
            `/tiempos/${idServicio}`
        );

        return data;
    },

    registrarLlegada: async (idServicio) => {
        const { data } = await api.put(
            `/tiempos/${idServicio}/llegada`
        );

        return data;
    },

    registrarInicio: async (idServicio) => {
        const { data } = await api.put(
            `/tiempos/${idServicio}/inicio`
        );

        return data;
    },

    registrarFin: async (idServicio) => {
        const { data } = await api.put(
            `/tiempos/${idServicio}/fin`
        );

        return data;
    }

};