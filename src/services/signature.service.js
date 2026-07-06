// signature.service.js

import api from "./api.service";

const SignatureService = {

    save: async ({ id_servicio, firma, encargado }) => {

        try {

            const response = await api.post("/firma", {
                id_servicio,
                firma,
                encargado
            });

            return response.data;

        } catch (error) {

            throw error.response?.data || error;

        }

    },

    getByServicio: async (id_servicio) => {

        try {

            const response = await api.get(
                `/firma/${id_servicio}`
            );

            return response.data;

        } catch (error) {

            throw error.response?.data || error;

        }

    }

};

export default SignatureService;