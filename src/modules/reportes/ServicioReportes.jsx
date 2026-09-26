import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    Tooltip
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Download,
    Search,
    RefreshCw,
    Wrench,
    CheckCircle2,
    Clock,
    Building2,
    Users,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Cpu,
    RotateCcw,
    Layers,
    MapPin,
    ArrowUpRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ApiWebURL } from '../../utils/index';
import { descargarReporteServiciosCSV } from '../../services/reporteExport.service';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, Tooltip);

const KpiCard = ({ icon: Icon, title, value, detail, tone = 'blue' }) => {
    const tones = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        rose: 'bg-rose-50 text-rose-700 border-rose-200'
    };

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
                </div>
                <div className={`rounded-xl border p-2.5 sm:p-3 ${tones[tone]}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
            </div>
            {detail && <p className="mt-3 text-xs leading-relaxed text-slate-500">{detail}</p>}
        </div>
    );
};

export const ServicioReportes = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [descargando, setDescargando] = useState(false);
    const [error, setError] = useState('');

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipoLugar, setFiltroTipoLugar] = useState('TODOS'); // TODOS, TALLER, CAMPO
    const [filtroCentroCosto, setFiltroCentroCosto] = useState('TODOS');
    const [filtroEstado, setFiltroEstado] = useState('TODOS'); // TODOS, COMPLETADO, EN_CURSO
    const [filtroTecnico, setFiltroTecnico] = useState('TODOS');
    const [filtroEncargado, setFiltroEncargado] = useState('TODOS');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    // Paginación
    const [pagina, setPagina] = useState(1);
    const [porPagina, setPorPagina] = useState(15);

    // Cargar datos
    const cargarDatos = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token') || '';
            const response = await fetch(`${ApiWebURL}/informe-tecnico/reporte-servicios-export`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`Error en el servidor (${response.status})`);
            }
            const data = await response.json();
            setServicios(data.data || []);
        } catch (err) {
            console.error('Error cargando servicios:', err);
            setError(err.message || 'No se pudieron obtener los datos de servicios.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Opciones únicas para selects
    const centrosCostoDisponibles = useMemo(() => {
        const set = new Set();
        servicios.forEach(s => {
            if (s.centro_costo && s.centro_costo !== '—' && s.centro_costo !== 'No registrado') {
                set.add(s.centro_costo.trim().toUpperCase());
            }
        });
        return Array.from(set).sort();
    }, [servicios]);

    const tecnicosDisponibles = useMemo(() => {
        const set = new Set();
        servicios.forEach(s => {
            if (s.tecnico_asignado && s.tecnico_asignado !== 'Sin asignar' && s.tecnico_asignado !== '—') {
                set.add(s.tecnico_asignado.trim());
            }
        });
        return Array.from(set).sort();
    }, [servicios]);

    const encargadosDisponibles = useMemo(() => {
        const set = new Set();
        servicios.forEach(s => {
            if (s.encargado && s.encargado !== 'No registrado' && s.encargado !== '—') {
                set.add(s.encargado.trim());
            }
        });
        return Array.from(set).sort();
    }, [servicios]);

    // Filtrado de servicios
    const serviciosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();

        return servicios.filter(item => {
            // Buscador universal
            if (q) {
                const matchString = [
                    item.ot,
                    item.cliente,
                    item.equipo,
                    item.marca,
                    item.modelo,
                    item.potencia,
                    item.servicio,
                    item.tipo_de_servicio,
                    item.tecnico_asignado,
                    item.zona,
                    item.encargado,
                    item.centro_costo
                ].filter(Boolean).join(' ').toLowerCase();

                if (!matchString.includes(q)) return false;
            }

            // Filtro Taller / Campo
            if (filtroTipoLugar !== 'TODOS') {
                if (String(item.taller_campo).toUpperCase() !== filtroTipoLugar) return false;
            }

            // Filtro Centro de Costo
            if (filtroCentroCosto !== 'TODOS') {
                if (String(item.centro_costo).trim().toUpperCase() !== filtroCentroCosto) return false;
            }

            // Filtro Estado (Completado vs En Curso)
            if (filtroEstado !== 'TODOS') {
                const completado = item.hora_servicio_completado && item.hora_servicio_completado !== '—';
                if (filtroEstado === 'COMPLETADO' && !completado) return false;
                if (filtroEstado === 'EN_CURSO' && completado) return false;
            }

            // Filtro Técnico
            if (filtroTecnico !== 'TODOS') {
                if (String(item.tecnico_asignado).trim() !== filtroTecnico) return false;
            }

            // Filtro Encargado / Creador de Cotización
            if (filtroEncargado !== 'TODOS') {
                if (String(item.encargado).trim().toUpperCase() !== filtroEncargado.toUpperCase()) return false;
            }

            // Filtro Rango de Fechas
            if (fechaDesde && item.fecha_programada && item.fecha_programada !== '—') {
                if (item.fecha_programada < fechaDesde) return false;
            }
            if (fechaHasta && item.fecha_programada && item.fecha_programada !== '—') {
                if (item.fecha_programada > fechaHasta) return false;
            }

            return true;
        });
    }, [servicios, busqueda, filtroTipoLugar, filtroCentroCosto, filtroEstado, filtroTecnico, filtroEncargado, fechaDesde, fechaHasta]);

    // Resetear a página 1 si cambian filtros
    useEffect(() => {
        setPagina(1);
    }, [busqueda, filtroTipoLugar, filtroCentroCosto, filtroEstado, filtroTecnico, filtroEncargado, fechaDesde, fechaHasta]);

    const resetFiltros = () => {
        setBusqueda('');
        setFiltroTipoLugar('TODOS');
        setFiltroCentroCosto('TODOS');
        setFiltroEstado('TODOS');
        setFiltroTecnico('TODOS');
        setFiltroEncargado('TODOS');
        setFechaDesde('');
        setFechaHasta('');
        setPagina(1);
    };

    // KPIs calculados sobre el conjunto total o filtrado
    const stats = useMemo(() => {
        const total = servicios.length;
        const totalOts = new Set(servicios.map(s => s.ot)).size;
        let campo = 0;
        let taller = 0;
        let completados = 0;
        let conTiempos = 0;
        let conApoyo = 0;

        servicios.forEach(s => {
            if (String(s.taller_campo).toUpperCase() === 'TALLER') {
                taller++;
            } else {
                campo++;
            }
            if (s.hora_servicio_completado && s.hora_servicio_completado !== '—') {
                completados++;
            }
            if (s.hora_inicio_servicio && s.hora_inicio_servicio !== '—') {
                conTiempos++;
            }
            if (s.tecnicos_apoyo) {
                conApoyo++;
            }
        });

        const tasaCompletado = total > 0 ? Math.round((completados / total) * 100) : 0;
        const pendientes = total - completados;
        const promedioServiciosOt = totalOts > 0 ? (total / totalOts).toFixed(1) : '1.0';

        return {
            total,
            totalOts,
            promedioServiciosOt,
            campo,
            taller,
            completados,
            pendientes,
            tasaCompletado,
            conTiempos,
            conApoyo
        };
    }, [servicios]);

    // Datos para gráficos
    const chartLugar = useMemo(() => ({
        labels: ['Campo (Cliente)', 'Taller Saircom'],
        datasets: [{
            data: [stats.campo, stats.taller],
            backgroundColor: ['#2563eb', '#10b981'],
            hoverBackgroundColor: ['#1d4ed8', '#059669'],
            borderWidth: 0
        }]
    }), [stats]);

    const chartCentroCosto = useMemo(() => {
        const conteo = {};
        servicios.forEach(s => {
            const cc = (s.centro_costo || 'Otros').trim().toUpperCase();
            conteo[cc] = (conteo[cc] || 0) + 1;
        });
        const labels = Object.keys(conteo);
        const data = Object.values(conteo);
        return {
            labels: labels.length ? labels : ['Sin datos'],
            datasets: [{
                data: data.length ? data : [1],
                backgroundColor: ['#6366f1', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6', '#94a3b8'],
                borderWidth: 0
            }]
        };
    }, [servicios]);

    const chartTecnicos = useMemo(() => {
        const conteo = {};
        servicios.forEach(s => {
            const tec = (s.tecnico_asignado || 'Sin asignar').trim();
            if (tec && tec !== '—') {
                conteo[tec] = (conteo[tec] || 0) + 1;
            }
        });
        const sorted = Object.entries(conteo)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        return {
            labels: sorted.map(x => x[0].split(' ').slice(0, 2).join(' ')),
            datasets: [{
                label: 'Servicios Asignados',
                data: sorted.map(x => x[1]),
                backgroundColor: '#3b82f6',
                borderRadius: 8
            }]
        };
    }, [servicios]);

    const chartTiposServicio = useMemo(() => {
        const conteo = {};
        servicios.forEach(s => {
            const tipo = (s.tipo_de_servicio || 'Mantenimiento').split(',')[0].trim();
            if (tipo && tipo !== '—') {
                conteo[tipo] = (conteo[tipo] || 0) + 1;
            }
        });
        const sorted = Object.entries(conteo)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Cantidad',
                data: sorted.map(x => x[1]),
                backgroundColor: '#10b981',
                borderRadius: 8
            }]
        };
    }, [servicios]);

    // Paginación
    const totalPaginas = Math.ceil(serviciosFiltrados.length / porPagina) || 1;
    const serviciosPaginados = useMemo(() => {
        const inicio = (pagina - 1) * porPagina;
        return serviciosFiltrados.slice(inicio, inicio + porPagina);
    }, [serviciosFiltrados, pagina, porPagina]);

    // Descarga de reporte
    const handleDescargar = async () => {
        setDescargando(true);
        try {
            await descargarReporteServiciosCSV({ fechaDesde, fechaHasta });
        } finally {
            setDescargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6 space-y-6 w-full max-w-full overflow-x-hidden">
            {/* Header del Dashboard */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider mb-3">
                            <Layers className="h-3.5 w-3.5" /> Inteligencia Operativa
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                            Dashboard de Reportes de Servicios
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-blue-100/80 max-w-2xl">
                            Consolidado general de operaciones, trazabilidad de tiempos, distribución en campo/taller y exportación con técnicos líder/apoyo y desglose de servicios.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={cargarDatos}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur border border-white/10 transition-all cursor-pointer disabled:opacity-50"
                            title="Recargar datos actualizados"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Actualizar</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDescargar}
                            disabled={descargando}
                            className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                            title={fechaDesde || fechaHasta
                                ? `Descargar reporte del ${fechaDesde || 'inicio'} al ${fechaHasta || 'hoy'} (con técnico líder y apoyo)`
                                : 'Descargar reporte completo consolidado con técnico líder y apoyo'}
                        >
                            <Download className="h-4 w-4" />
                            <span>
                                {descargando
                                    ? 'Descargando...'
                                    : (fechaDesde || fechaHasta ? 'Descargar Rango Seleccionado' : 'Descargar Reporte (Consolidado)')}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Error banner si falla */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between">
                    <p className="text-sm font-semibold">{error}</p>
                    <button onClick={cargarDatos} className="text-xs font-bold underline cursor-pointer">
                        Reintentar
                    </button>
                </div>
            )}

            {/* Tarjetas de KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard
                    icon={Wrench}
                    title="Total Servicios"
                    value={stats.total}
                    detail={`${stats.totalOts} OTs distintas (${stats.promedioServiciosOt} serv/OT)`}
                    tone="blue"
                />
                <KpiCard
                    icon={MapPin}
                    title="En Campo"
                    value={stats.campo}
                    detail={`${stats.total ? Math.round((stats.campo / stats.total) * 100) : 0}% en planta de cliente`}
                    tone="indigo"
                />
                <KpiCard
                    icon={Building2}
                    title="En Taller"
                    value={stats.taller}
                    detail={`${stats.total ? Math.round((stats.taller / stats.total) * 100) : 0}% en sede central Saircom`}
                    tone="emerald"
                />
                <KpiCard
                    icon={CheckCircle2}
                    title="Completados"
                    value={stats.completados}
                    detail={`${stats.tasaCompletado}% tasa de culminación`}
                    tone="emerald"
                />
                <KpiCard
                    icon={Clock}
                    title="En Curso / Pendiente"
                    value={stats.pendientes}
                    detail="Por culminar o en ejecución"
                    tone="amber"
                />
                <KpiCard
                    icon={Users}
                    title="Tiempos Controlados"
                    value={stats.conTiempos}
                    detail="Con marcas de hora inicio/fin"
                    tone="purple"
                />
            </div>

            {/* Gráficos Analíticos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Gráfico 1: Taller vs Campo */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-sm">Distribución por Ubicación</h3>
                        <span className="text-xs font-semibold text-slate-400">Taller / Campo</span>
                    </div>
                    <div className="relative h-48 w-full flex items-center justify-center">
                        <Doughnut
                            data={chartLugar}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }
                            }}
                        />
                    </div>
                </div>

                {/* Gráfico 2: Centro de Costo */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-sm">Centro de Costo</h3>
                        <span className="text-xs font-semibold text-slate-400">Postventa / Ventas</span>
                    </div>
                    <div className="relative h-48 w-full flex items-center justify-center">
                        <Doughnut
                            data={chartCentroCosto}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }
                            }}
                        />
                    </div>
                </div>

                {/* Gráfico 3: Top Tipos de Servicio */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-sm">Principales Tipos de Servicio</h3>
                        <span className="text-xs font-semibold text-slate-400">Volumen</span>
                    </div>
                    <div className="relative h-48 w-full">
                        <Bar
                            data={chartTiposServicio}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                                    y: { beginAtZero: true, ticks: { precision: 0 } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Gráfico 4: Carga por Técnico */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 text-sm">Carga por Técnico</h3>
                        <span className="text-xs font-semibold text-slate-400">Top Asignados</span>
                    </div>
                    <div className="relative h-48 w-full">
                        <Bar
                            data={chartTecnicos}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                                    y: { beginAtZero: true, ticks: { precision: 0 } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                        <Filter className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>Filtros y Búsqueda de Servicios</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                            {serviciosFiltrados.length} encontrados
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={resetFiltros}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                    >
                        <RotateCcw className="h-3.5 w-3.5" /> Limpiar filtros
                    </button>
                </div>

                {/* Fila 1: Buscador y Rango de Fechas */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
                    {/* Buscador de texto */}
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar OT, cliente, equipo, marca, cotizador, servicio..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        {busqueda && (
                            <button
                                type="button"
                                onClick={() => setBusqueda('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                                title="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filtro Fechas */}
                    <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200 p-1 rounded-xl shrink-0">
                        <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold px-1.5 shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            <span className="hidden sm:inline">Rango:</span>
                        </div>
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={e => setFechaDesde(e.target.value)}
                            className="w-28 sm:w-32 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                            title="Fecha Desde"
                        />
                        <span className="text-slate-400 text-xs font-bold">-</span>
                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={e => setFechaHasta(e.target.value)}
                            className="w-28 sm:w-32 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                            title="Fecha Hasta"
                        />
                        {(fechaDesde || fechaHasta) && (
                            <button
                                type="button"
                                onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                                className="p-1 text-slate-400 hover:text-red-500 text-xs rounded transition-colors"
                                title="Borrar fechas"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Fila 2: Selects de Filtros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {/* Filtro Taller / Campo */}
                    <div className="min-w-0">
                        <select
                            value={filtroTipoLugar}
                            onChange={e => setFiltroTipoLugar(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white truncate"
                        >
                            <option value="TODOS">Ubicación: Todas</option>
                            <option value="CAMPO">Solo Campo</option>
                            <option value="TALLER">Solo Taller</option>
                        </select>
                    </div>

                    {/* Filtro Centro Costo */}
                    <div className="min-w-0">
                        <select
                            value={filtroCentroCosto}
                            onChange={e => setFiltroCentroCosto(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white truncate"
                        >
                            <option value="TODOS">Centro Costo: Todos</option>
                            {centrosCostoDisponibles.map(cc => (
                                <option key={cc} value={cc}>{cc}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Estado */}
                    <div className="min-w-0">
                        <select
                            value={filtroEstado}
                            onChange={e => setFiltroEstado(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white truncate"
                        >
                            <option value="TODOS">Estado: Todos</option>
                            <option value="COMPLETADO">Completados</option>
                            <option value="EN_CURSO">En Curso / Pendientes</option>
                        </select>
                    </div>

                    {/* Filtro Técnico */}
                    <div className="min-w-0">
                        <select
                            value={filtroTecnico}
                            onChange={e => setFiltroTecnico(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white truncate"
                        >
                            <option value="TODOS">Técnico: Todos</option>
                            {tecnicosDisponibles.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Encargado/a (Creador/a de Cotización) */}
                    <div className="min-w-0">
                        <select
                            value={filtroEncargado}
                            onChange={e => setFiltroEncargado(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white truncate"
                            title="Filtrar por Encargado/a (Persona que creó la cotización)"
                        >
                            <option value="TODOS">Encargado/a: Todos</option>
                            {encargadosDisponibles.map(enc => (
                                <option key={enc} value={enc}>{enc}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla Principal con los 19 Campos */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Detalle Consolidado de Servicios</h3>
                        <p className="text-xs text-slate-500">Registros con los 19 campos listos para visualización y descarga</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Filas:</span>
                        <select
                            value={porPagina}
                            onChange={e => setPorPagina(Number(e.target.value))}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                            <tr>
                                <th className="px-3 py-3">OT</th>
                                <th className="px-3 py-3">F. Programada</th>
                                <th className="px-3 py-3">Lugar</th>
                                <th className="px-3 py-3">Cliente</th>
                                <th className="px-3 py-3">C. Costo</th>
                                <th className="px-3 py-3">Equipo & Marca</th>
                                <th className="px-3 py-3">Modelo / Potencia</th>
                                <th className="px-3 py-3">Servicio</th>
                                <th className="px-3 py-3">Técnico</th>
                                <th className="px-3 py-3 text-center">Tiempos</th>
                                <th className="px-3 py-3 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {serviciosPaginados.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="py-12 text-center text-slate-400">
                                        <Layers className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                        No se encontraron servicios con los filtros seleccionados.
                                    </td>
                                </tr>
                            ) : (
                                serviciosPaginados.map((item, idx) => {
                                    const completado = item.hora_servicio_completado && item.hora_servicio_completado !== '—';

                                    return (
                                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                                            <td className="px-3 py-2.5 font-extrabold text-blue-600 whitespace-nowrap">
                                                {item.ot}
                                            </td>
                                            <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                                                <div>{item.fecha_programada}</div>
                                                <div className="text-[10px] text-slate-400">{item.hora_programada}</div>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    String(item.taller_campo).toUpperCase() === 'TALLER'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {item.taller_campo}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 max-w-[180px]">
                                                <div className="font-bold text-slate-800 truncate" title={item.cliente}>
                                                    {item.cliente}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate" title={`Zona: ${item.zona} · Cotizado por: ${item.encargado}`}>
                                                    Zona: {item.zona} · <span className="text-slate-600 font-medium">Cot: {item.encargado}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                                                    {item.centro_costo}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 max-w-[160px]">
                                                <div className="font-semibold text-slate-800 truncate" title={item.equipo}>
                                                    {item.equipo}
                                                </div>
                                                <div className="text-[10px] text-slate-500 truncate">
                                                    {item.marca}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 whitespace-nowrap">
                                                <div className="font-medium text-slate-800">{item.modelo}</div>
                                                <div className="text-[10px] font-bold text-indigo-600">{item.potencia}</div>
                                            </td>
                                            <td className="px-3 py-2.5 max-w-[200px]">
                                                <div className="flex items-center gap-1 font-semibold text-slate-800 truncate" title={item.servicio}>
                                                    {item.total_servicios_equipo > 1 && (
                                                        <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                                                            {item.total_servicios_equipo} servs
                                                        </span>
                                                    )}
                                                    <span className="truncate">{item.servicio}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 truncate" title={item.tipo_de_servicio}>
                                                    {item.tipo_de_servicio}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 max-w-[170px]">
                                                {item.tecnicos_apoyo ? (
                                                    <div className="space-y-0.5">
                                                        <div className="font-bold text-slate-800 text-[11px] truncate flex items-center gap-1" title={`Técnico Líder: ${item.tecnico_lider || item.tecnico_asignado}`}>
                                                            <span className="shrink-0 text-[9px] font-bold text-blue-700 bg-blue-100 px-1 py-0.5 rounded">Líder</span>
                                                            <span className="truncate">{item.tecnico_lider || item.tecnico_asignado}</span>
                                                        </div>
                                                        <div className="text-[10px] text-amber-800 font-medium truncate flex items-center gap-1" title={`Técnicos de Apoyo: ${item.tecnicos_apoyo}`}>
                                                            <span className="shrink-0 text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.5 rounded">Apoyo</span>
                                                            <span className="truncate">{item.tecnicos_apoyo}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="font-medium text-slate-700 truncate" title={item.tecnico_asignado}>
                                                        {item.tecnico_asignado}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                {item.hora_inicio_servicio && item.hora_inicio_servicio !== '—' ? (
                                                    <div className="text-[10px] leading-tight text-slate-600">
                                                        <div><span className="text-slate-400">In:</span> {item.hora_inicio_servicio}</div>
                                                        <div><span className="text-slate-400">Fin:</span> {item.hora_culminacion_servicio || '—'}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[10px]">Sin marcas</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    completado
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${completado ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                                                    {completado ? 'Completado' : 'Pendiente'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginador */}
                <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                    <div>
                        Mostrando página <span className="font-bold text-slate-900">{pagina}</span> de{' '}
                        <span className="font-bold text-slate-900">{totalPaginas}</span> ({serviciosFiltrados.length} servicios en total)
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPagina(p => Math.max(p - 1, 1))}
                            disabled={pagina === 1}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 font-bold text-slate-800 bg-white border border-slate-200 rounded-lg">
                            {pagina}
                        </span>
                        <button
                            onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
                            disabled={pagina === totalPaginas}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicioReportes;