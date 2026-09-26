// src/modules/planner/CotizacionesDisponibles.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    CalendarPlus,
    Eye,
    Loader2,
    Building2,
    MapPin,
    User,
    Cpu,
    Wrench,
    Search,
    RefreshCw,
    FileText,
    CheckCircle2,
    Calendar,
    Sparkles,
    AlertCircle,
    X,
    Filter,
    LayoutGrid,
    Table as TableIcon,
    ArrowRight,
    Phone,
    PhoneCall,
    FileCheck,
    ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { otService } from '../../services/ot.service.js';

export const CotizacionesDisponibles = () => {
    const navigate = useNavigate();

    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtroCentroCosto, setFiltroCentroCosto] = useState('TODOS');
    const [vistaModo, setVistaModo] = useState('tarjetas'); // 'tarjetas' | 'tabla'

    const cargarCotizaciones = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await otService.getCotizacionesDisponibles();
            setCotizaciones(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error cargando cotizaciones disponibles:', err);
            setError(
                err.response?.data?.message ||
                err.message ||
                'No se pudieron obtener las cotizaciones disponibles.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCotizaciones();
    }, []);

    // Centros de costo disponibles
    const centrosCosto = useMemo(() => {
        const set = new Set();
        cotizaciones.forEach(c => {
            if (c.centro_costo && c.centro_costo !== '—') {
                set.add(c.centro_costo.trim().toUpperCase());
            }
        });
        return Array.from(set).sort();
    }, [cotizaciones]);

    // Filtrado interactivo
    const cotizacionesFiltradas = useMemo(() => {
        let lista = [...cotizaciones];

        // Filtro por centro de costo
        if (filtroCentroCosto !== 'TODOS') {
            lista = lista.filter(c => String(c.centro_costo || '').trim().toUpperCase() === filtroCentroCosto);
        }

        // Buscador reactivo
        const q = busqueda.trim().toLowerCase();
        if (q) {
            lista = lista.filter(c => {
                const matchStr = [
                    c.numero_cotizacion,
                    c.razon_social,
                    c.ruc,
                    c.creado_por,
                    c.direccion,
                    c.centro_costo,
                    c.equipos_resumen,
                    c.servicios_resumen,
                    c.contacto,
                    c.celular,
                    c.nota
                ].filter(Boolean).join(' ').toLowerCase();

                return matchStr.includes(q);
            });
        }

        return lista;
    }, [cotizaciones, filtroCentroCosto, busqueda]);

    // Métricas para los KPIs superiores
    const stats = useMemo(() => {
        const total = cotizaciones.length;
        const totalEquipos = cotizaciones.reduce((acc, c) => acc + (Number(c.total_equipos) || 0), 0);
        const totalServicios = cotizaciones.reduce((acc, c) => acc + (Number(c.total_servicios) || 0), 0);

        return {
            total,
            totalEquipos,
            totalServicios
        };
    }, [cotizaciones]);

    const formatFecha = (isoString) => {
        if (!isoString) return '—';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-[calc(100dvh-3rem)] bg-slate-50/80 p-2 sm:p-2 lg:p-8 space-y-3">
            
            {/* Header Limpio e Intuitivo */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                            <ClipboardCheck className="h-3.5 w-3.5" /> Planificación de Servicios
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                            • Paso previo a la Orden de Trabajo
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                        Cotizaciones disponibles
                    </h1>

                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                    {/* Selector de Vista: Tarjetas o Tabla */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/70 p-1">
                        <button
                            type="button"
                            onClick={() => setVistaModo('tarjetas')}
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                vistaModo === 'tarjetas'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                            title="Vista en tarjetas detalladas"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span className="hidden sm:inline">Tarjetas</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setVistaModo('tabla')}
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                vistaModo === 'tabla'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                            title="Vista en tabla compacta"
                        >
                            <TableIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Tabla</span>
                        </button>
                    </div>

                    {/* Botón Actualizar */}
                    <button
                        type="button"
                        onClick={cargarCotizaciones}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50"
                        title="Actualizar listado"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                        <span>Actualizar</span>
                    </button>
                </div>
            </header>

            {/* Barra de Filtros y Búsqueda */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Buscador Universal */}
                <div className="relative flex-1 min-w-[260px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, RUC, cotización (ej. COT-199), cotizador o equipo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    {busqueda && (
                        <button
                            type="button"
                            onClick={() => setBusqueda('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filtro Centro de Costo */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400 hidden sm:inline" />
                    <select
                        value={filtroCentroCosto}
                        onChange={(e) => setFiltroCentroCosto(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                        <option value="TODOS">Centro de Costo: Todos</option>
                        {centrosCosto.map(cc => (
                            <option key={cc} value={cc}>{cc}</option>
                        ))}
                    </select>

                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-2 rounded-xl font-bold whitespace-nowrap">
                        {cotizacionesFiltradas.length} encontradas
                    </span>
                </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Spinner de Carga */}
            {loading && (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-xs text-slate-500 font-medium">
                        Cargando cotizaciones aprobadas disponibles...
                    </p>
                </div>
            )}

            {/* Estado Vacío */}
            {!loading && !error && cotizacionesFiltradas.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                        {busqueda ? 'No se encontraron coincidencias' : '¡Todo al día! No hay cotizaciones pendientes'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                        {busqueda
                            ? `No hay cotizaciones que coincidan con "${busqueda}". Intenta con otro término de búsqueda.`
                            : 'Todas las cotizaciones aprobadas ya cuentan con su respectiva Orden de Trabajo (OT) programada.'}
                    </p>
                    {busqueda && (
                        <button
                            type="button"
                            onClick={() => {
                                setBusqueda('');
                                setFiltroCentroCosto('TODOS');
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                            Limpiar filtros de búsqueda
                        </button>
                    )}
                </div>
            )}

            {/* Vista en Tarjetas Detalladas */}
            {!loading && !error && cotizacionesFiltradas.length > 0 && vistaModo === 'tarjetas' && (
                <div className="grid gap-4 sm:gap-5">
                    {cotizacionesFiltradas.map((cotizacion) => {
                        const equiposLista = cotizacion.equipos_resumen
                            ? cotizacion.equipos_resumen.split(',').map(e => e.trim()).filter(Boolean)
                            : [];
                        const serviciosLista = cotizacion.servicios_resumen
                            ? cotizacion.servicios_resumen.split(',').map(s => s.trim()).filter(Boolean)
                            : [];

                        return (
                            <article
                                key={cotizacion.id_cotizacion}
                                className="group rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300/80 hover:shadow-md transition-all duration-200 p-5 sm:p-6 shadow-sm relative overflow-hidden"
                            >
                                {/* Barra lateral indicadora de estado aprobado */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />

                                <div className="space-y-4 pl-1">
                                    
                                    {/* Fila Superior: Códigos, Estado y Fecha */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-extrabold tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80">
                                                <FileText className="h-3.5 w-3.5 text-blue-600" />
                                                {cotizacion.numero_cotizacion}
                                            </span>

                                            {cotizacion.centro_costo && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                                    Centro de Costo: {cotizacion.centro_costo}
                                                </span>
                                            )}

                                            {cotizacion.fecha_registro && (
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Aprobada el {formatFecha(cotizacion.fecha_registro)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Aprobada por cliente
                                            </span>
                                        </div>
                                    </div>

                                    {/* Datos del Cliente y Resumen */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                        
                                        {/* Información del Cliente */}
                                        <div className="lg:col-span-7 space-y-2.5">
                                            <div>
                                                <div className="flex flex-wrap items-baseline gap-2">
                                                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                                        <Building2 className="h-5 w-5 text-slate-400 shrink-0" />
                                                        {cotizacion.razon_social}
                                                    </h2>
                                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                                        RUC: {cotizacion.ruc || 'Sin RUC'}
                                                    </span>
                                                </div>

                                                {cotizacion.direccion && (
                                                    <p className="mt-1.5 text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                                                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                        <span>{cotizacion.direccion}</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Contacto y Creador de Cotización */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                                                {cotizacion.contacto && (
                                                    <span>
                                                        <strong className="text-slate-700">Contacto:</strong> {cotizacion.contacto}
                                                    </span>
                                                )}
                                                {cotizacion.celular && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        {cotizacion.celular}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1 text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                                                    <User className="h-3.5 w-3.5 text-slate-500" />
                                                    <span>Cotizado por: <strong className="font-semibold text-slate-900">{cotizacion.creado_por?.trim() || 'No registrado'}</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bloque Visual: Equipos y Servicios */}
                                        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                                                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                                                    <span>Equipos</span>
                                                    <Cpu className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <p className="mt-1 text-2xl font-black text-slate-900">
                                                    {cotizacion.total_equipos}
                                                </p>
                                                {equiposLista.length > 0 && (
                                                    <p className="mt-1 text-[11px] font-medium text-slate-600 truncate" title={cotizacion.equipos_resumen}>
                                                        {equiposLista[0]}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                                                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                                                    <span>Servicios</span>
                                                    <Wrench className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <p className="mt-1 text-2xl font-black text-slate-900">
                                                    {cotizacion.total_servicios}
                                                </p>
                                                {serviciosLista.length > 0 && (
                                                    <p className="mt-1 text-[11px] font-medium text-slate-600 truncate" title={cotizacion.servicios_resumen}>
                                                        {serviciosLista[0]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nota Técnica si existe */}
                                    {cotizacion.nota && (
                                        <div className="rounded-xl bg-amber-50/60 border border-amber-200/70 p-3 text-xs text-amber-900 leading-relaxed">
                                            <strong className="font-bold text-amber-950">Observación / Nota: </strong>
                                            {cotizacion.nota}
                                        </div>
                                    )}

                                    {/* Barra de Acciones */}
                                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                            <span>Paso siguiente:</span>
                                            <span className="text-blue-700 font-bold flex items-center gap-1">
                                                Asignar técnico y generar OT <ArrowRight className="h-3 w-3" />
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2.5 ml-auto">
                                            {/* Botón Ver Cotización */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(`/planner/cotizaciones/${cotizacion.id_cotizacion}`)
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 transition-all cursor-pointer shadow-sm"
                                            >
                                                <Eye className="h-4 w-4 text-slate-400" />
                                                <span>Ver Detalle</span>
                                            </button>

                                            {/* Botón Principal: Programar OT */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(`/planner/programar/${cotizacion.id_cotizacion}`)
                                                }
                                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-5 py-2 text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                <CalendarPlus className="h-4 w-4" />
                                                <span>Programar OT</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Vista en Tabla Compacta */}
            {!loading && !error && cotizacionesFiltradas.length > 0 && vistaModo === 'tabla' && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3.5">Cotización</th>
                                    <th className="px-4 py-3.5">Cliente</th>
                                    <th className="px-4 py-3.5">Equipos</th>
                                    <th className="px-4 py-3.5">Servicios</th>
                                    <th className="px-4 py-3.5">Cotizado por</th>
                                    <th className="px-4 py-3.5">Estado</th>
                                    <th className="px-4 py-3.5 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {cotizacionesFiltradas.map((c) => (
                                    <tr key={c.id_cotizacion} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-4 py-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                                            {c.numero_cotizacion}
                                        </td>
                                        <td className="px-4 py-3 max-w-[220px]">
                                            <div className="font-bold text-slate-900 truncate" title={c.razon_social}>
                                                {c.razon_social}
                                            </div>
                                            <div className="text-[11px] text-slate-500">
                                                RUC: {c.ruc}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                                <Cpu className="h-3.5 w-3.5 text-blue-600" />
                                                {c.total_equipos} equip.
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                                <Wrench className="h-3.5 w-3.5 text-emerald-600" />
                                                {c.total_servicios} serv.
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 max-w-[180px]">
                                            <div className="text-slate-800 font-medium truncate" title={c.creado_por}>
                                                {c.creado_por?.trim() || 'No registrado'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 capitalize">
                                                {c.centro_costo || 'Sin centro'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                Aprobada
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/planner/cotizaciones/${c.id_cotizacion}`)}
                                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                                                    title="Ver detalle de cotización"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/planner/programar/${c.id_cotizacion}`)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                                                >
                                                    <CalendarPlus className="h-3.5 w-3.5" />
                                                    Programar OT
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CotizacionesDisponibles;
