import api from './api.service.js';

export const viaticosService = {
    async listarAdmin() {
        const { data } = await api.get('/viaticos-ot/admin');
        return data?.data ?? null;
    },
    async misPendientes() {
        const { data } = await api.get('/viaticos-ot/mis-pendientes');
        return data?.data ?? null;
    },
    async catalogos() {
        const { data } = await api.get('/viaticos-ot/catalogos');
        return data?.data ?? [];
    },
    async listar(idOt) {
        const { data } = await api.get(`/viaticos-ot/ot/${idOt}`);
        return data?.data ?? null;
    },
    async crear(idOt, payload) {
        const { data } = await api.post(`/viaticos-ot/ot/${idOt}`, payload);
        return data?.data;
    },
    async subirComprobante(idOt, formData) {
        const { data } = await api.post(
            `/viaticos-ot/ot/${idOt}/comprobante`,
            formData
        );
        return data?.data;
    },
    async actualizar(idViatico, payload) {
        const { data } = await api.put(`/viaticos-ot/${idViatico}`, payload);
        return data?.data;
    },
    async cambiarEstado(idViatico, estado) {
        const { data } = await api.patch(`/viaticos-ot/${idViatico}/estado`, { estado });
        return data?.data;
    },
    async eliminar(idViatico) {
        const { data } = await api.delete(`/viaticos-ot/${idViatico}`);
        return data?.data;
    }
};
