import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Download, Eye, FileText, Search, Send } from 'lucide-react';
import Swal from 'sweetalert2';

import informetecnicoService from './service/informetecnico.service';
import { descargarReporteServiciosCSV } from '../../services/reporteExport.service';
import { useAuth } from '../../context/authContext.jsx';

const InformeTecnicoList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [informes, setInformes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filtroEnvio, setFiltroEnvio] = useState('todos');
    const [informeActualizando, setInformeActualizando] = useState(null);
    const [informeActualizandoEnvio, setInformeActualizandoEnvio] = useState(null);
    const [descargando, setDescargando] = useState(false);

    const handleDescargarReporte = async () => {
        setDescargando(true);
        try {
            await descargarReporteServiciosCSV();
        } finally {
            setDescargando(false);
        }
    };

    const rol = String(user?.rol ?? '').trim().toUpperCase();
    const puedeRevisar = ['ADMINISTRADOR', 'PLANNER', 'SUPERADMINISTRADOR'].includes(rol);
    const puedeCambiarEnvio = ['POSTVENTA', 'ADMINISTRADOR', 'SUPERADMINISTRADOR'].includes(rol);

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

    const cambiarEstadoEnvio = async (item, nuevoEstado) => {
        if (!puedeCambiarEnvio || nuevoEstado === item.estado_envio) return;

        const esParaEnviar = nuevoEstado === 'enviado';
        const confirmacion = await Swal.fire({
            title: esParaEnviar ? '¿Marcar como enviado al cliente?' : '¿Marcar como sin enviar?',
            text: esParaEnviar
                ? `El informe #${item.id_informe} (OT-${item.id_ot}) se marcará como enviado al cliente y se registrará la fecha/hora actual.`
                : `El informe #${item.id_informe} se restablecerá a "Sin enviar" y se eliminará la fecha de envío.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: esParaEnviar ? 'Sí, marcar enviado' : 'Sí, marcar sin enviar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: esParaEnviar ? '#059669' : '#64748b'
        });
        if (!confirmacion.isConfirmed) return;

        try {
            setInformeActualizandoEnvio(item.id_informe);
            const res = await informetecnicoService.updateEstadoEnvio(item.id_informe, nuevoEstado);
            const fechaEnvioActualizada = res?.data?.fecha_envio || (esParaEnviar ? new Date().toISOString() : null);

            setInformes(actuales => actuales.map(informe =>
                informe.id_informe === item.id_informe
                    ? { ...informe, estado_envio: nuevoEstado, fecha_envio: fechaEnvioActualizada }
                    : informe
            ));
            await Swal.fire({
                icon: 'success',
                title: esParaEnviar ? 'Informe marcado como enviado' : 'Estado cambiado a sin enviar',
                timer: 1400,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error al actualizar estado de envío:', error);
            await Swal.fire({
                icon: 'error',
                title: 'No se pudo actualizar el envío',
                text: error?.response?.data?.message || error.message
            });
        } finally {
            setInformeActualizandoEnvio(null);
        }
    };

    const formatearFechaHora = (fecha) => {
        if (!fecha) return null;
        const d = new Date(fecha);
        if (Number.isNaN(d.getTime())) return null;

        return d.toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
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

    const obtenerClaseRevision = (estado) => {
        const estadoNormalizado = String(estado ?? 'no revisado').trim().toLowerCase();
        switch (estadoNormalizado) {
            case 'revisado':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'observado':
                return 'bg-rose-100 text-rose-800 border-rose-300';
            case 'eliminado':
                return 'bg-slate-100 text-slate-700 border-slate-300';
            case 'no revisado':
            default:
                return 'bg-amber-100 text-amber-800 border-amber-300';
        }
    };

    const resumenRevision = useMemo(() => {
        const noRevisados = informes.filter(i => String(i.estado_revision ?? 'No revisado').trim().toLowerCase() === 'no revisado').length;
        const revisados = informes.filter(i => String(i.estado_revision ?? '').trim().toLowerCase() === 'revisado').length;
        const observados = informes.filter(i => String(i.estado_revision ?? '').trim().toLowerCase() === 'observado').length;
        return { noRevisados, revisados, observados };
    }, [informes]);

    const resumenEnvio = useMemo(() => {
        const sinEnviar = informes.filter(i => String(i.estado_envio ?? 'sin_enviar').trim().toLowerCase() === 'sin_enviar').length;
        const enviados = informes.filter(i => String(i.estado_envio ?? '').trim().toLowerCase() === 'enviado').length;
        return { sinEnviar, enviados };
    }, [informes]);

    const informesFiltrados = useMemo(() => {
        let resultado = informes;

        if (filtroEnvio !== 'todos') {
            resultado = resultado.filter(item => {
                const estado = String(item.estado_envio ?? 'sin_enviar').trim().toLowerCase();
                return estado === filtroEnvio;
            });
        }

        const texto = search.trim().toLocaleLowerCase('es');
        if (!texto) return resultado;

        return resultado.filter((item) => [
            item.id_informe, item.id_ot, item.razon_social, item.equipo,
            item.marca, item.modelo, item.serie, item.tipo_equipo,
            item.codigo_interno, item.servicios, item.estado_equipo,
            item.estado_revision,
            String(item.estado_envio ?? '').toLowerCase() === 'enviado' ? 'enviado' : 'sin enviar'
        ].some((valor) => String(valor ?? '').toLocaleLowerCase('es').includes(texto)));
    }, [informes, filtroEnvio, search]);

    return (
        <div className="min-h-screen bg-slate-50 p-2 sm:p-4">
            <div className="mx-auto max-w-8xl space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Informes Técnicos</h1>
                        <p className="mt-0.5 text-xs sm:text-sm text-slate-500">Lista completa y seguimiento por estado de revisión de informes.</p>
                    </div>

                    {/* BADGES RESUMEN DE ESTADOS CON COLORES */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                            <span className="text-slate-500">Total:</span>
                            <span className="ml-1.5 font-bold text-slate-800">{informes.length}</span>
                        </div>
                        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-amber-800 font-semibold shadow-sm">
                            <span>No revisados:</span>
                            <span className="ml-1.5 font-bold">{resumenRevision.noRevisados}</span>
                        </div>
                        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-emerald-800 font-semibold shadow-sm">
                            <span>Revisados:</span>
                            <span className="ml-1.5 font-bold">{resumenRevision.revisados}</span>
                        </div>
                        <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-rose-800 font-semibold shadow-sm">
                            <span>Observados:</span>
                            <span className="ml-1.5 font-bold">{resumenRevision.observados}</span>
                        </div>

                        <div className="h-4 w-px bg-slate-300 hidden sm:block mx-1" />

                        <div className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-slate-700 font-semibold shadow-sm">
                            <span>Sin enviar:</span>
                            <span className="ml-1.5 font-bold">{resumenEnvio.sinEnviar}</span>
                        </div>
                        <div className="rounded-lg border border-teal-300 bg-teal-50 px-3 py-1.5 text-teal-800 font-semibold shadow-sm">
                            <span>Enviados cliente:</span>
                            <span className="ml-1.5 font-bold">{resumenEnvio.enviados}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleDescargarReporte}
                            disabled={descargando}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                            title="Descargar Reporte de Servicios con los 19 campos en Excel/CSV"
                        >
                            <Download size={15} />
                            <span>{descargando ? 'Descargando...' : 'Descargar Reporte'}</span>
                        </button>
                    </div>
                </div>

                <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search size={19} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <label htmlFor="buscar-informe" className="sr-only">Buscar informes</label>
                        <input
                            id="buscar-informe"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar por informe, OT, cliente, equipo, serie, servicio o envío..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Filtro rápido por Estado de Envío */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium self-start sm:self-auto">
                        <span className="text-slate-500 px-2 flex items-center gap-1">
                            <Send size={12} /> Envío:
                        </span>
                        <button
                            type="button"
                            onClick={() => setFiltroEnvio('todos')}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                filtroEnvio === 'todos'
                                    ? 'bg-white text-slate-800 font-bold shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltroEnvio('sin_enviar')}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                filtroEnvio === 'sin_enviar'
                                    ? 'bg-white text-amber-800 font-bold shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Sin enviar ({resumenEnvio.sinEnviar})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFiltroEnvio('enviado')}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                filtroEnvio === 'enviado'
                                    ? 'bg-white text-emerald-800 font-bold shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Enviados ({resumenEnvio.enviados})
                        </button>
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
                                    <th scope="col" className="min-w-[240px] px-2 py-2 text-left text-xs">Equipo</th>
                                    <th scope="col" className="min-w-[240px] px-2 py-2 text-left text-xs">Servicios</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-left text-xs">Estado</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-left text-xs">Revisión</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-left text-xs">Envío al Cliente</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-left text-xs">Programado</th>
                                    <th scope="col" className="whitespace-nowrap px-2 py-2 text-center text-xs">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading ? (
                                    <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-500">Cargando informes técnicos...</td></tr>
                                ) : informesFiltrados.length === 0 ? (
                                    <tr><td colSpan={10} className="px-4 py-12 text-center"><p>No se encontraron informes.</p></td></tr>
                                ) : informesFiltrados.map((item) => (
                                    <tr key={item.id_informe} className="transition hover:bg-slate-50">
                                        <td className="px-2 py-2 text-slate-800">#{item.id_informe}</td>
                                        <td className="px-2 py-2"><span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium">OT-{item.id_ot}</span></td>
                                        <td className="px-2 py-2">{item.razon_social || 'SIN CLIENTE'}</td>
                                        <td className="px-2 py-2">{item.equipo || 'SIN EQUIPO'}</td>
                                        <td className="px-2 py-2">{item.servicios || 'SIN SERVICIOS'}</td>
                                        <td className="px-2 py-2"><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${obtenerClaseEstado(item.estado_equipo)}`}>{item.estado_equipo || 'SIN ESTADO'}</span></td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            {puedeRevisar ? (
                                                <select
                                                    value={item.estado_revision || 'No revisado'}
                                                    onChange={(event) => cambiarEstadoRevision(item, event.target.value)}
                                                    disabled={informeActualizando === item.id_informe}
                                                    aria-label={`Estado de revisión del informe ${item.id_informe}`}
                                                    className={`rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all disabled:cursor-wait disabled:opacity-60 shadow-sm cursor-pointer ${obtenerClaseRevision(item.estado_revision)}`}
                                                >
                                                    <option value="No revisado" className="bg-white text-amber-800 font-semibold">No revisado</option>
                                                    <option value="Revisado" className="bg-white text-emerald-800 font-semibold">Revisado</option>
                                                    <option value="Observado" className="bg-white text-rose-800 font-semibold">Observado</option>
                                                    <option value="Eliminado" className="bg-white text-slate-700 font-semibold">Eliminado</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${obtenerClaseRevision(item.estado_revision)}`}>
                                                    {item.estado_revision || 'No revisado'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            {puedeCambiarEnvio ? (
                                                <div className="flex flex-col gap-1">
                                                    <select
                                                        value={item.estado_envio || 'sin_enviar'}
                                                        onChange={(event) => cambiarEstadoEnvio(item, event.target.value)}
                                                        disabled={informeActualizandoEnvio === item.id_informe}
                                                        aria-label={`Estado de envío del informe ${item.id_informe}`}
                                                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all disabled:cursor-wait disabled:opacity-60 shadow-sm cursor-pointer ${
                                                            item.estado_envio === 'enviado'
                                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <option value="sin_enviar" className="bg-white text-slate-700 font-medium">
                                                            Sin enviar
                                                        </option>
                                                        <option value="enviado" className="bg-white text-emerald-800 font-bold">
                                                            ✓ Enviado al cliente
                                                        </option>
                                                    </select>
                                                    {item.estado_envio === 'enviado' && item.fecha_envio && (
                                                        <span
                                                            className="text-[11px] text-emerald-700 font-medium flex items-center gap-1"
                                                            title={`Fecha y hora de envío: ${formatearFechaHora(item.fecha_envio)}`}
                                                        >
                                                            <Clock size={11} /> {formatearFechaHora(item.fecha_envio)}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    {item.estado_envio === 'enviado' ? (
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                                                            title={item.fecha_envio ? `Enviado el: ${formatearFechaHora(item.fecha_envio)}` : 'Enviado al cliente'}
                                                        >
                                                            <CheckCircle2 size={12} className="text-emerald-600" /> Enviado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                            <Clock size={12} className="text-slate-400" /> Sin enviar
                                                        </span>
                                                    )}
                                                    {item.estado_envio === 'enviado' && item.fecha_envio && (
                                                        <span className="text-[10px] text-slate-500 font-normal">
                                                            {formatearFechaHora(item.fecha_envio)}
                                                        </span>
                                                    )}
                                                </div>
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
