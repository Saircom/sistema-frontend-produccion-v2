import { useState, useEffect, useCallback } from "react";
import { MoreVertical } from "lucide-react";
import Swal from "sweetalert2";
import { createRoot } from "react-dom/client";
import { ApiWebURL } from "../../utils/index.jsx";
import Pagination from "../../components/Pagination";
import Loading from "../../components/Loading";
import { UsuarioService } from '../../services/user.service.js';
import { serviciosService } from '../../services/service.service.js';
import { AsignacionForm } from "./AsignacionForm.jsx";

export const SolicitudList = () => {
    const [listaSolicitud, setListaSolicitud] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [, setMenuAbierto] = useState(null);
    const [pagina, setPagina] = useState(0);
    const [filasPagina] = useState(15);
    const [tecnicos, setTecnicos] = useState([]);

    const leerServicio = useCallback(async () => {
        try {
            const token = localStorage.getItem("token") || "";
            const response = await fetch(`${ApiWebURL}/servicios`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setListaSolicitud((data.data || []).sort((a, b) => b.id_servicio - a.id_servicio));
        } catch (error) {
            console.error("Error al obtener servicios:", error);
        }
    }, []);

    useEffect(() => {
        setCargando(true);
        const cargarInicial = async () => {
            const data = await UsuarioService.getAll();
            setTecnicos(data.filter(u => (
                String(u?.nombre_rol ?? u?.rol ?? '').trim().toUpperCase() === 'TECNICO'
                && Number(u?.estado) === 1
            )));
            await leerServicio();
            setCargando(false);
        };
        cargarInicial();

    }, [leerServicio]);

    const handleAsignarTecnico = (item) => {
        setMenuAbierto(null);
        const container = document.createElement('div');
        const root = createRoot(container);

        Swal.fire({
            title: 'Asignar Equipo Técnico',
            html: container,
            showConfirmButton: false,
            width: '500px',
            didOpen: () => {
                root.render(
                    <AsignacionForm
                        tecnicos={tecnicos}
                        liderInicial={item.id_usuario || ""}
                        movilidadInicial={item.id_movilidad || ""}
                        onSubmit={async (formData) => {
                            try {
                                const payload = {
                                    id_usuario: formData.lider,
                                    tecnicos_adicionales: formData.apoyo.filter(id => id !== ""),
                                    id_movilidad: formData.movilidad ? Number(formData.movilidad) : null,
                                };

                                await serviciosService.updateServicioCompleto(item.id_servicio, payload);
                                
                                // FORZAR ACTUALIZACIÓN LOCAL INMEDIATA
                                await leerServicio(); 
                                
                                Swal.close();
                                Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1500, showConfirmButton: false });
                            } catch {
                                Swal.fire('Error', 'No se pudo guardar la asignación', 'error');
                            }
                        }}
                    />
                );
            },
            willClose: () => root.unmount()
        });
    };

    return (
        <div className="p-2 max-w-8xl mx-auto">
            <h2 className="text-xl px-2 font-bold text-gray-800 mb-2">Lista de Solicitudes</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {cargando ? <div className="py-10 text-center"><Loading /></div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-2 py-2">ID</th>
                                    <th className="px-2 py-2">Cliente</th>
                                    <th className="px-2 py-2">Tipo</th>
                                    <th className="px-2 py-2">Equipo</th>
                                    <th className="px-2 py-2">Solicitante</th>
                                    <th className="px-2 py-2">Técnico Líder</th>
                                    <th className="px-2 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {listaSolicitud.slice(pagina * filasPagina, (pagina + 1) * filasPagina).map((item) => (
                                    <tr key={item.id_servicio} className="hover:bg-indigo-50/30">
                                        <td className="px-2 py-2 font-bold text-indigo-600">#{item.id_servicio}</td>
                                        <td className="px-2 py-2">{item.cliente_razon_social}</td>
                                        <td className="px-2 py-2">{item.tipoServicio}</td>
                                        <td className="px-2 py-2">{item.equipo_marca} {item.equipo_modelo} {item.equipo_serie}</td>
                                        <td className="px-2 py-2">{item.creador_nombres} {item.creador_apellidos}</td>
                                        <td className="px-2 py-2">{item.tecnico_nombres || "Sin asignar"}</td>
                                        <td className="px-2 py-2 text-center">
                                            <button onClick={() => handleAsignarTecnico(item)} className="p-2 hover:bg-gray-100 rounded-full">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="p-4 bg-gray-50 border-t flex justify-center">
                    <Pagination totalPaginas={Math.ceil(listaSolicitud.length / filasPagina)} paginaActual={pagina} onPageChange={setPagina} />
                </div>
            </div>
        </div>
    );
};

export default SolicitudList;
