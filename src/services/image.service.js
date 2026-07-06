import api from './api.service.js';

export const imageService = {
    /**
     * Subir imagen
     * Recibe directamente el formData que ya trae la imagen y el título inyectados desde React.
     */
    uploadImage: async (idServicio, formData) => {
        const response = await api.post(
            `/imagenes/servicio/${idServicio}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },

    // Obtener imágenes por servicio
    getImagesByService: async (idServicio) => {
        const response = await api.get(
            `/imagenes/servicio/${idServicio}`
        );

        return response.data;
    },

    /**
     * Reemplazar imagen
     * Recibe el formData completo construido en el componente.
     */
    replaceImage: async (idImagen, formData) => {
        const response = await api.put(
            `/imagenes/${idImagen}/reemplazar`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },

    /**
     * 🔄 NUEVO: Rotar imagen de forma manual
     * Dispara una petición de tipo PATCH al servidor para aplicar un giro de 90° 
     * a la derecha sobre el archivo guardado utilizando la potencia de Sharp.
     */
    rotarImage: async (idImagen) => {
        const response = await api.patch(
            `/imagenes/${idImagen}/rotar`
        );

        return response.data;
    },

    // Eliminar imagen
    deleteImage: async (idImagen) => {
        const response = await api.delete(
            `/imagenes/${idImagen}`
        );

        return response.data;
    },

    // Actualizar título
    updateTitulo: async (idImagen, titulo) => {
        const response = await api.patch(
            `/imagenes/${idImagen}/titulo`,
            { titulo }
        );

        return response.data;
    },
};