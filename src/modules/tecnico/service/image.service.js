import api from '../../../services/api.service.js';

const ImageService = {
    uploadImages: async (idInforme, formData) => {
        try {
            console.log('¿Es FormData?', formData instanceof FormData);

            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}:`, {
                        nombre: value.name,
                        tipo: value.type,
                        tamaño: value.size
                    });
                } else {
                    console.log(`${key}:`, value);
                }
            }

            const response = await api.post(
                `/imagenes/informe/${idInforme}/imagenes`,
                formData
            );

            return response.data;
        } catch (error) {
            console.error(
                'Error en uploadImages:',
                error.response?.data || error
            );

            throw error;
        }
    },

    getImagesByInforme: async idInforme => {
        const response = await api.get(
            `/imagenes/informe/${idInforme}/imagenes`
        );

        return response.data;
    },

    replaceImage: async (idImagen, formData) => {
        const response = await api.put(
            `/imagenes/${idImagen}/reemplazar`,
            formData
        );

        return response.data;
    },

    rotarImage: async (idImagen, grados = 90) => {
        const response = await api.patch(
            `/imagenes/${idImagen}/rotar`,
            { grados }
        );

        return response.data;
    },

    deleteImage: async idImagen => {
        const response = await api.delete(
            `/imagenes/${idImagen}`
        );

        return response.data;
    },

    updateTitulo: async (idImagen, titulo) => {
        const response = await api.patch(
            `/imagenes/${idImagen}/titulo`,
            { titulo }
        );

        return response.data;
    }
};

export default ImageService;