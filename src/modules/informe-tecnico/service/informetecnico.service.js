import api from '../../../services/api.service';

export const informetecnicoService = {

    /**
     * Obtener todos los informes técnicos
     */
    getAll: async () => {
        try {
            const response = await api.get('/informe-tecnico');
            return response.data;
        } catch (error) {
            console.error('Error al obtener los informes técnicos:', error);
            throw error;
        }
    },

    updateEstadoRevision: async (idInforme, estadoRevision) => {
        const response = await api.patch(
            `/informe-tecnico/${idInforme}/estado-revision`,
            { estado_revision: estadoRevision }
        );
        return response.data;
    },

};

export default informetecnicoService;
