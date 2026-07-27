import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock3, RefreshCw, Search } from 'lucide-react';
import { serviciosService } from '../../services/service.service';
import Loading from '../../components/Loading';
import Pagination from '../../components/Pagination';

const formatearFechaHora = (valor) => {
    if (!valor) return 'No registrada';
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return 'Fecha inválida';
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }).format(fecha);
};

const formatearDuracion = (minutos) => {
    if (minutos === null || minutos === undefined) return 'En curso';
    const total = Number(minutos);
    const horas = Math.floor(total / 60);
    const restante = total % 60;
    return horas > 0 ? `${horas} h ${restante} min` : `${restante} min`;
};

export const HistorialTiempos = () => {
    const [lista, setLista] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(0);
    const [filasPagina, setFilasPagina] = useState(15);

    const cargar = useCallback(async () => {
        try {
            setCargando(true);
            setError('');
            const respuesta = await serviciosService.getHistorialTiempos();
            setLista(Array.isArray(respuesta) ? respuesta : []);
        } catch (err) {
            console.error('Error al cargar el historial de tiempos:', err);
            setError(err?.response?.data?.message || 'No se pudo cargar el historial de tiempos.');
            setLista([]);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const filtrados = useMemo(() => {
        const texto = busqueda.trim().toLocaleLowerCase('es');
        if (!texto) return lista;
        return lista.filter(item => [
            item.id_ot, item.numero_cotizacion, item.razon_social, item.ruc,
            item.tecnico, item.marca, item.modelo, item.serie,
            item.codigo_interno, item.tipo_equipo, item.servicios
        ].some(valor => String(valor ?? '').toLocaleLowerCase('es').includes(texto)));
    }, [busqueda, lista]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / filasPagina));
    const paginados = filtrados.slice(pagina * filasPagina, (pagina + 1) * filasPagina);

    useEffect(() => {
        if (pagina >= totalPaginas) setPagina(0);
    }, [pagina, totalPaginas]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Control de tiempos por servicio</h1>
                    <p className="mt-1 text-sm text-slate-500">Cada fila representa un equipo y sus servicios dentro de una Orden de Trabajo.</p>
                </div>
                <button type="button" onClick={cargar} disabled={cargando} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                    <RefreshCw size={17} className={cargando ? 'animate-spin' : ''} /> Actualizar
                </button>
            </div>

            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative">
                    <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="search" value={busqueda} onChange={event => { setBusqueda(event.target.value); setPagina(0); }} placeholder="Buscar por OT, cotización, cliente, técnico, equipo o servicio..." className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
            </div>

            {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {cargando ? <div className="flex min-h-64 items-center justify-center"><Loading /></div> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-[1450px] w-full text-left text-sm">
                            <thead className="bg-slate-800 text-xs uppercase text-white">
                                <tr>
                                    <th className="px-4 py-3">OT / Cotización</th><th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3">Equipo</th><th className="min-w-72 px-4 py-3">Servicios</th>
                                    <th className="px-4 py-3">Técnico</th><th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3">Llegada</th><th className="px-4 py-3">Inicio</th>
                                    <th className="px-4 py-3">Fin</th><th className="px-4 py-3">Duración</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginados.length === 0 ? <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-500">No se encontraron registros de tiempos.</td></tr> : paginados.map(item => (
                                    <tr key={item.id_ot_detalle} className="align-top hover:bg-slate-50">
                                        <td className="px-4 py-4"><p className="font-bold text-blue-700">OT-{item.id_ot}</p><p className="mt-1 text-xs text-slate-500">{item.numero_cotizacion}</p></td>
                                        <td className="px-4 py-4"><p className="font-semibold text-slate-800">{item.razon_social}</p><p className="mt-1 text-xs text-slate-500">RUC {item.ruc}</p></td>
                                        <td className="px-4 py-4"><p className="font-semibold text-slate-800">{[item.marca, item.modelo].filter(Boolean).join(' ')}</p><p className="mt-1 text-xs text-slate-500">Serie: {item.serie || 'No registrada'}</p><p className="text-xs text-slate-500">Detalle #{item.id_ot_detalle}</p></td>
                                        <td className="whitespace-normal px-4 py-4 leading-6 text-slate-700">{item.servicios || 'Sin servicios registrados'}</td>
                                        <td className="px-4 py-4 text-slate-700">{item.tecnico || 'No asignado'}</td>
                                        <td className="px-4 py-4"><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{item.estado_equipo}</span></td>
                                        <td className="px-4 py-4 whitespace-nowrap">{formatearFechaHora(item.fecha_hora_llegada)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-emerald-700">{formatearFechaHora(item.fecha_hora_inicio)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-rose-700">{formatearFechaHora(item.fecha_hora_fin)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap font-semibold"><span className="inline-flex items-center gap-1"><Clock3 size={15} />{formatearDuracion(item.minutos_trabajados)}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
                    <Pagination totalPaginas={totalPaginas} paginaActual={pagina} onPageChange={setPagina} filasPagina={filasPagina} setFilasPagina={setFilasPagina} />
                </div>
            </div>
        </div>
    );
};

export default HistorialTiempos;
