import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText, Search } from 'lucide-react';
import Swal from 'sweetalert2';

import informetecnicoService from './service/informetecnico.service';
import { useAuth } from '../../context/authContext.jsx';

const InformeTecnicoList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [informes, setInformes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [informeActualizando, setInformeActualizando] = useState(null);

    const rol = String(user?.rol ?? '').trim().toUpperCase();
    const puedeRevisar = ['ADMINISTRADOR', 'PLANNER', 'SUPERADMINISTRADOR'].includes(rol);

    const cargarInformes = useCallback(async (signal) => {
        try {
            setLoading(true);
            setError('');

            const response = await informetecnicoService.getAll({ signal });
            const lista = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response)
                    ? response
                    : [];

            if (!signal?.aborted) setInformes(lista);
        } catch (error) {
            if (signal?.aborted || error?.name === 'CanceledError' || error?.name === 'AbortError') return;

            console.error('Error al cargar los informes técnicos:', error);
            setInformes([]);
            setError(
                error?.response?.data?.message
                || 'No se pudieron cargar los informes técnicos.'
            );
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        cargarInformes(controller.signal);
        return () => controller.abort();
    }, [cargarInformes]);

    const verDetalleInforme = (idInforme) => {
        if (idInforme == null) return;

        window.open(
            `/tecnico/informes/${encodeURIComponent(idInforme)}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const generarPdf = (item) => {
        if (item?.id_informe == null) return;
        navigate(`/informes/${item.id_informe}`);
    };

    const cambiarEstadoRevision = async (item, nuevoEstado) => {
        if (!puedeRevisar || nuevoEstado === item.estado_revision) return;

        const confirmacion = await Swal.fire({
            title: '¿Cambiar estado del informe?',
            text: `El informe #${item.id_informe} cambiará a “${nuevoEstado}”.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#2563eb'
        });
        if (!confirmacion.isConfirmed) return;

        try {
            setInformeActualizando(item.id_informe);
            await informetecnicoService.updateEstadoRevision(item.id_informe, nuevoEstado);
            setInformes(actuales => actuales.map(informe =>
                informe.id_informe === item.id_informe
                    ? { ...informe, estado_revision: nuevoEstado }
                    : informe
            ));
            await Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1400, showConfirmButton: false });
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'No se pudo actualizar',
                text: error?.response?.data?.message || error.message
            });
        } finally {
            setInformeActualizando(null);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'SIN FECHA';
        const fechaConvertida = new Date(fecha);
        if (Number.isNaN(fechaConvertida.getTime())) return 'FECHA INVÁLIDA';

        return fechaConvertida.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const obtenerClaseEstado = (estado) => {
        const estadoNormalizado = String(estado ?? '').trim().toLowerCase();
        switch (estadoNormalizado) {
            case 'finalizado': return 'bg-green-100 text-green-700 border-green-200';
            case 'en proceso': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pendiente': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'observado': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const informesFiltrados = useMemo(() => {
        const texto = search.trim().toLocaleLowerCase('es');
        if (!texto) return informes;

        return informes.filter((item) => [
            item.id_informe, item.id_ot, item.razon_social, item.equipo,
            item.marca, item.modelo, item.serie, item.tipo_equipo,
            item.codigo_interno, item.servicios, item.estado_equipo,
            item.estado_revision
        ].some((valor) => String(valor ?? '').toLocaleLowerCase('es').includes(texto)));
    }, [informes, search]);

    return (
        <div className="min-h-screen bg-slate-50 p-2 sm:p-2">
            <div className="mx-auto max-w-8xl">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Informes Técnicos</h1>
                        <p className="mt-1 text-sm text-slate-500">Lista completa de informes generados por equipo.</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
                        <span className="text-sm text-slate-500">Total de informes:</span>
                        <span className="ml-2 font-bold text-slate-800">{informesFiltrados.length}</span>
                    </div>
                </div>

                <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="relative">
                        <Search size={19} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <label htmlFor="buscar-informe" className="sr-only">Buscar informes</label>
                        <input
                            id="buscar-informe"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar por informe, OT, cliente, equipo, serie o servicio..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {error && (
                    <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <span>{error}</span>
                            <button type="button" onClick={() => cargarInformes()} className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700">Reintentar</button>
                        </div>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className=" ">
                                <tr>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-left text-xs">N°</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-left text-xs">OT</th>
                                    <th scope="col" className="min-w-[200px] px-2 py-2 text-left text-xs">Cliente</th>
                                    <th scope="col" className="min-w-[260px] px-2 py-2 text-left text-xs">Equipo</th>
                                    <th scope="col" className="min-w-[280px] px-2 py-2 text-left text-xs">Servicios</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-left text-xs">Estado</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-left text-xs">Revisión</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-left text-xs">Programado</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-center text-xs">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading ? (
                                    <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-500">Cargando informes técnicos...</td></tr>
                                ) : informesFiltrados.length === 0 ? (
                                    <tr><td colSpan={9} className="px-4 py-12 text-center"><p>No se encontraron informes.</p></td></tr>
                                ) : informesFiltrados.map((item) => (
                                    <tr key={item.id_informe} className="transition hover:bg-slate-50">
                                        <td className="px-2 py-2 text-slate-800">#{item.id_informe}</td>
                                        <td className="px-2 py-2"><span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium">OT-{item.id_ot}</span></td>
                                        <td className="px-2 py-2">{item.razon_social || 'SIN CLIENTE'}</td>
                                        <td className="px-2 py-2">{item.equipo || 'SIN EQUIPO'}</td>
                                        <td className="px-2 py-2">{item.servicios || 'SIN SERVICIOS'}</td>
                                        <td className="px-2 py-2"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${obtenerClaseEstado(item.estado_equipo)}`}>{item.estado_equipo || 'SIN ESTADO'}</span></td>
                                        <td className="px-2 py-2">
                                            {puedeRevisar ? (
                                                <select
                                                    value={item.estado_revision || 'No revisado'}
                                                    onChange={(event) => cambiarEstadoRevision(item, event.target.value)}
                                                    disabled={informeActualizando === item.id_informe}
                                                    aria-label={`Estado de revisión del informe ${item.id_informe}`}
                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium disabled:cursor-wait disabled:opacity-60"
                                                >
                                                    <option value="No revisado">No revisado</option>
                                                    <option value="Revisado">Revisado</option>
                                                    <option value="Observado">Observado</option>
                                                    <option value="Eliminado">Eliminado</option>
                                                </select>
                                            ) : (
                                                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                    {item.estado_revision}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">{formatearFecha(item.fecha_programada)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => verDetalleInforme(item.id_informe)}
                                                    aria-label={`Ver detalle del informe ${item.id_informe}`}
                                                    title="Ver detalle en otra pestaña"
                                                    className="rounded-lg bg-blue-600 p-2.5 text-white hover:bg-blue-700"
                                                ><Eye size={18} aria-hidden="true" /></button>
                                                <button
                                                    type="button"
                                                    onClick={() => generarPdf(item)}
                                                    aria-label={`Generar PDF del informe ${item.id_informe}`}
                                                    title="Generar PDF"
                                                    className="rounded-lg bg-red-600 p-2.5 text-white hover:bg-red-700"
                                                ><FileText size={18} aria-hidden="true" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InformeTecnicoList;
