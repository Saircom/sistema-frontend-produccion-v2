// src/modules/Planner/pages/OrdenesTrabajo.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    Loader2,
    ClipboardList,
    CalendarDays,
    UserRound,
    Truck,
    Search,
    Filter,
    RotateCcw,
    LayoutGrid,
    Table as TableIcon,
    Cpu,
    Wrench,
    X,
    User,
    ChevronLeft,
    ChevronRight,
    Building2,
    Calendar
} from "lucide-react";

import { otService } from "../../services/ot.service.js";
import { useAuth } from "../../context/authContext.jsx";

const estadoColor = (estado) => {
    switch (estado) {
        case "Programada":
            return "bg-blue-50 text-blue-700 border border-blue-200";
        case "En Proceso":
            return "bg-purple-50 text-purple-700 border border-purple-200";
        case "Finalizada":
            return "bg-emerald-50 text-emerald-700 border border-emerald-200";
        case "Cancelada":
            return "bg-rose-50 text-rose-700 border border-rose-200";
        default:
            return "bg-slate-50 text-slate-700 border border-slate-200";
    }
};

const OrdenesTrabajo = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const esPostventa = user?.rol?.toUpperCase() === "POSTVENTA";

    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Pestaña principal de estado
    const [tabEstado, setTabEstado] = useState("activas"); // 'activas' | 'finalizadas' | 'canceladas' | 'todas'

    // Filtros cruzados
    const [busqueda, setBusqueda] = useState("");
    const [filtroSolicitante, setFiltroSolicitante] = useState("TODOS");
    const [filtroTecnico, setFiltroTecnico] = useState("TODOS");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    // Modo de vista: 'compacto' (tarjetas densas) o 'tabla' (tabla tabular súper compacta)
    const [vistaModo, setVistaModo] = useState(esPostventa ? "compacto" : "compacto");

    // Paginación
    const [pagina, setPagina] = useState(1);
    const [porPagina, setPorPagina] = useState(25);

    const cargarOrdenes = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await otService.getOrdenes();

            const data =
                response?.data?.data ??
                response?.data ??
                response ??
                [];

            setOrdenes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "No se pudieron obtener las órdenes de trabajo."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarOrdenes();
    }, []);

    // Conteo por estados
    const ordenesActivas = useMemo(() => {
        return ordenes.filter(
            (o) => o.estado !== "Finalizada" && o.estado !== "Cancelada"
        );
    }, [ordenes]);

    const ordenesFinalizadas = useMemo(() => {
        return ordenes.filter((o) => o.estado === "Finalizada");
    }, [ordenes]);

    const ordenesCanceladas = useMemo(() => {
        return ordenes.filter((o) => o.estado === "Cancelada");
    }, [ordenes]);

    // Opciones únicas para select de solicitantes (Quién solicitó)
    const solicitantesDisponibles = useMemo(() => {
        const set = new Set();
        ordenes.forEach((o) => {
            if (o.quien_solicito && o.quien_solicito !== "No registrado") {
                set.add(o.quien_solicito.trim());
            }
        });
        return Array.from(set).sort();
    }, [ordenes]);

    // Opciones únicas para select de técnicos
    const tecnicosDisponibles = useMemo(() => {
        const set = new Set();
        ordenes.forEach((o) => {
            if (o.tecnico_responsable && o.tecnico_responsable.trim()) {
                set.add(o.tecnico_responsable.trim());
            }
        });
        return Array.from(set).sort();
    }, [ordenes]);

    // Filtrado interactivo global
    const ordenesFiltradas = useMemo(() => {
        let lista = [...ordenes];

        // 1. Filtro por pestaña de estado
        if (tabEstado === "activas") {
            lista = lista.filter(
                (o) => o.estado !== "Finalizada" && o.estado !== "Cancelada"
            );
        } else if (tabEstado === "finalizadas") {
            lista = lista.filter((o) => o.estado === "Finalizada");
        } else if (tabEstado === "canceladas") {
            lista = lista.filter((o) => o.estado === "Cancelada");
        }

        // 2. Buscador en tiempo real
        const q = busqueda.trim().toLowerCase();
        if (q) {
            lista = lista.filter((o) => {
                const matchString = [
                    o.id_ot ? `ot-${o.id_ot}` : "",
                    o.id_ot ? String(o.id_ot) : "",
                    o.numero_cotizacion,
                    o.id_cotizacion ? `cot-${o.id_cotizacion}` : "",
                    o.razon_social,
                    o.ruc,
                    o.quien_solicito,
                    o.tecnico_responsable,
                    o.equipos_resumen,
                    o.servicios_resumen,
                    o.movilidad,
                    o.estado
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return matchString.includes(q);
            });
        }

        // 3. Filtro por Quién Solicitó
        if (filtroSolicitante !== "TODOS") {
            lista = lista.filter(
                (o) => (o.quien_solicito || "").trim() === filtroSolicitante
            );
        }

        // 4. Filtro por Técnico
        if (filtroTecnico !== "TODOS") {
            lista = lista.filter(
                (o) => (o.tecnico_responsable || "").trim() === filtroTecnico
            );
        }

        // 5. Filtro por Rango de Fechas
        if (fechaDesde) {
            lista = lista.filter((o) => {
                if (!o.fecha_programada) return false;
                const f = new Date(o.fecha_programada).toISOString().slice(0, 10);
                return f >= fechaDesde;
            });
        }
        if (fechaHasta) {
            lista = lista.filter((o) => {
                if (!o.fecha_programada) return false;
                const f = new Date(o.fecha_programada).toISOString().slice(0, 10);
                return f <= fechaHasta;
            });
        }

        return lista;
    }, [
        ordenes,
        tabEstado,
        busqueda,
        filtroSolicitante,
        filtroTecnico,
        fechaDesde,
        fechaHasta
    ]);

    // Resetear a página 1 si cambian los filtros
    useEffect(() => {
        setPagina(1);
    }, [
        tabEstado,
        busqueda,
        filtroSolicitante,
        filtroTecnico,
        fechaDesde,
        fechaHasta
    ]);

    const resetFiltros = () => {
        setBusqueda("");
        setFiltroSolicitante("TODOS");
        setFiltroTecnico("TODOS");
        setFechaDesde("");
        setFechaHasta("");
        setPagina(1);
    };

    // Paginación
    const totalPaginas = Math.ceil(ordenesFiltradas.length / porPagina) || 1;
    const indiceInicio = (pagina - 1) * porPagina;
    const ordenesPaginadas = ordenesFiltradas.slice(
        indiceInicio,
        indiceInicio + porPagina
    );

    const formatFecha = (iso) => {
        if (!iso) return "—";
        try {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return "—";
            return d.toLocaleString("es-PE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });
        } catch {
            return "—";
        }
    };

    return (
        <section className="space-y-4 p-4 sm:p-6 lg:p-7 bg-slate-50/70 min-h-[calc(100dvh-3rem)]">
            
            {/* Header con Pestañas de Estado y Modos de Vista */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-blue-600 shrink-0" />
                        <span>Órdenes de Trabajo</span>
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Visualización y trazabilidad de OTs activas, finalizadas y canceladas.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Selector de Pestañas Principales */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1">
                        <button
                            type="button"
                            onClick={() => setTabEstado("activas")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                tabEstado === "activas"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Activas ({ordenesActivas.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setTabEstado("finalizadas")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                tabEstado === "finalizadas"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Finalizadas ({ordenesFinalizadas.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setTabEstado("canceladas")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                tabEstado === "canceladas"
                                    ? "bg-rose-600 text-white shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Canceladas ({ordenesCanceladas.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setTabEstado("todas")}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                tabEstado === "todas"
                                    ? "bg-slate-800 text-white shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Todas ({ordenes.length})
                        </button>
                    </div>

                    {/* Alternador de Modo de Vista: Compacto vs Tabla */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1">
                        <button
                            type="button"
                            onClick={() => setVistaModo("compacto")}
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                vistaModo === "compacto"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                            title="Vista en tarjetas compactas"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span className="hidden sm:inline">Compacto</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setVistaModo("tabla")}
                            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                vistaModo === "tabla"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            }`}
                            title="Vista en tabla densa"
                        >
                            <TableIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Tabla</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Barra de Filtros Cruzados y Búsqueda en Vivo */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                        <Filter className="h-3.5 w-3.5 text-blue-600" />
                        <span>Filtros de Búsqueda Rápida</span>
                        <span className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full font-bold">
                            {ordenesFiltradas.length} órdenes encontradas
                        </span>
                    </div>

                    {(busqueda || filtroSolicitante !== "TODOS" || filtroTecnico !== "TODOS" || fechaDesde || fechaHasta) && (
                        <button
                            type="button"
                            onClick={resetFiltros}
                            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer transition-colors"
                        >
                            <RotateCcw className="h-3 w-3" /> Limpiar filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
                    {/* Buscador Universal */}
                    <div className="relative xl:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar OT (ej. 300), cliente, RUC, solicitado por..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        {busqueda && (
                            <button
                                type="button"
                                onClick={() => setBusqueda("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filtro Quién Solicitó (Cotizador/Creador) */}
                    <div>
                        <select
                            value={filtroSolicitante}
                            onChange={(e) => setFiltroSolicitante(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all truncate"
                            title="Filtrar por persona que solicitó / creó la cotización"
                        >
                            <option value="TODOS">Solicitado por: Todos</option>
                            {solicitantesDisponibles.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Técnico Asignado */}
                    <div>
                        <select
                            value={filtroTecnico}
                            onChange={(e) => setFiltroTecnico(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all truncate"
                            title="Filtrar por técnico asignado"
                        >
                            <option value="TODOS">Técnico: Todos</option>
                            {tecnicosDisponibles.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Rango de Fechas */}
                    <div className="flex items-center gap-1 xl:col-span-2">
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                            title="Fecha programada desde"
                        />
                        <span className="text-slate-400 text-xs">-</span>
                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                            title="Fecha programada hasta"
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* Estado Vacío */}
            {!loading && !error && ordenesFiltradas.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-2">
                    <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                    <h2 className="text-sm font-bold text-slate-700">
                        No se encontraron Órdenes de Trabajo
                    </h2>
                    <p className="text-xs text-slate-400">
                        {busqueda || filtroSolicitante !== "TODOS" || filtroTecnico !== "TODOS" || fechaDesde || fechaHasta
                            ? "Ninguna OT coincide con los filtros aplicados. Intenta restablecer los filtros."
                            : "No existen órdenes de trabajo registradas en este estado."}
                    </p>
                    {(busqueda || filtroSolicitante !== "TODOS" || filtroTecnico !== "TODOS" || fechaDesde || fechaHasta) && (
                        <button
                            type="button"
                            onClick={resetFiltros}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors mt-2"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            {/* VISTA 1: TARJETAS COMPACTAS (Ahorro de espacio del 60%) */}
            {!loading && !error && ordenesFiltradas.length > 0 && vistaModo === "compacto" && (
                <div className="grid gap-2.5">
                    {ordenesPaginadas.map((orden) => (
                        <article
                            key={orden.id_ot}
                            className="rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-sm transition-all p-3 sm:p-4"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                
                                {/* Información Principal Compacta */}
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    
                                    {/* Fila 1: OT, Cotización, Estado y Fecha */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="font-extrabold text-blue-700 text-xs font-mono bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                                            OT-{orden.id_ot}
                                        </span>

                                        <span className="font-semibold text-slate-500 font-mono text-[11px]">
                                            Cotización: {orden.numero_cotizacion || `COT-${orden.id_cotizacion}`}
                                        </span>

                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${estadoColor(orden.estado)}`}>
                                            {orden.estado}
                                        </span>

                                        <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                                            <CalendarDays className="h-3 w-3 text-slate-400" />
                                            {formatFecha(orden.fecha_programada)}
                                        </span>
                                    </div>

                                    {/* Fila 2: Cliente y Solicitante */}
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <h2 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate" title={orden.razon_social}>
                                            {orden.razon_social}
                                        </h2>

                                        {orden.ruc && (
                                            <span className="text-[11px] text-slate-400 font-mono">
                                                RUC: {orden.ruc}
                                            </span>
                                        )}

                                        {orden.quien_solicito && (
                                            <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50/80 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                                                <UserRound className="h-3 w-3 text-blue-600" />
                                                Solicitado por: <strong className="text-blue-900 font-bold">{orden.quien_solicito}</strong>
                                            </span>
                                        )}
                                    </div>

                                    {/* Fila 3: Técnico, Movilidad, Equipos y Servicios en una sola línea */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                            <span className="text-slate-400">Técnico:</span>
                                            <span className="font-semibold text-slate-800">{orden.tecnico_responsable || "Sin asignar"}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                            <span className="text-slate-400">Movilidad:</span>
                                            <span className="font-medium text-slate-700">{orden.placa_movilidad || orden.movilidad || "Sin movilidad"}</span>
                                        </div>

                                        {/* Equipos */}
                                        <div className="flex items-center gap-1 text-[11px]">
                                            <Cpu className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                            <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded">
                                                {orden.total_equipos} equip.
                                            </span>
                                            <span className="text-slate-600 font-medium truncate max-w-xs" title={orden.equipos_resumen}>
                                                {orden.equipos_resumen || "—"}
                                            </span>
                                        </div>

                                        {/* Servicios */}
                                        {orden.servicios_resumen && (
                                            <div className="flex items-center gap-1 text-[11px]">
                                                <Wrench className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                <span className="text-slate-600 font-medium truncate max-w-xs" title={orden.servicios_resumen}>
                                                    {orden.servicios_resumen}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Botón Ver Detalle Compacto */}
                                <div className="shrink-0 flex items-center justify-end self-end lg:self-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/planner/ordenes/${orden.id_ot}`)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-3.5 py-1.5 text-xs shadow-sm transition-all cursor-pointer"
                                        title="Ver detalles de la Orden de Trabajo"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>Ver Detalle</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* VISTA 2: TABLA DENSA (Ideal para análisis masivo de Postventa) */}
            {!loading && !error && ordenesFiltradas.length > 0 && vistaModo === "tabla" && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                                <tr>
                                    <th className="px-3.5 py-3">OT</th>
                                    <th className="px-3.5 py-3">Cliente / Cotización</th>
                                    <th className="px-3.5 py-3">Solicitado por</th>
                                    <th className="px-3.5 py-3">Técnico Asignado</th>
                                    <th className="px-3.5 py-3">Equipos & Servicios</th>
                                    <th className="px-3.5 py-3">Fecha Prog.</th>
                                    <th className="px-3.5 py-3 text-center">Estado</th>
                                    <th className="px-3.5 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {ordenesPaginadas.map((o) => (
                                    <tr key={o.id_ot} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-3.5 py-2.5 font-bold font-mono text-blue-700 whitespace-nowrap">
                                            OT-{o.id_ot}
                                        </td>
                                        <td className="px-3.5 py-2.5 max-w-[200px]">
                                            <div className="font-bold text-slate-900 truncate" title={o.razon_social}>
                                                {o.razon_social}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-mono">
                                                Cot: {o.numero_cotizacion || `COT-${o.id_cotizacion}`} · RUC: {o.ruc}
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2.5 max-w-[170px]">
                                            <div className="font-semibold text-slate-800 text-[11px] truncate" title={o.quien_solicito}>
                                                {o.quien_solicito || "—"}
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2.5 max-w-[160px] whitespace-nowrap">
                                            <div className="font-medium text-slate-800">
                                                {o.tecnico_responsable || "Sin asignar"}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {o.movilidad || "Sin movilidad"}
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2.5 max-w-[220px]">
                                            <div className="font-medium text-slate-800 truncate" title={o.equipos_resumen}>
                                                <span className="font-bold text-blue-700">{o.total_equipos} eq:</span> {o.equipos_resumen || "—"}
                                            </div>
                                            <div className="text-[10px] text-slate-500 truncate" title={o.servicios_resumen}>
                                                {o.servicios_resumen || "—"}
                                            </div>
                                        </td>
                                        <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-600 text-[11px]">
                                            {formatFecha(o.fecha_programada)}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${estadoColor(o.estado)}`}>
                                                {o.estado}
                                            </span>
                                        </td>
                                        <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/planner/ordenes/${o.id_ot}`)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer border border-blue-200"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>Ver</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Paginador Rápido */}
            {!loading && !error && ordenesFiltradas.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm text-xs">
                    <div className="text-slate-500">
                        Mostrando <strong className="text-slate-800">{indiceInicio + 1}</strong> -{" "}
                        <strong className="text-slate-800">
                            {Math.min(indiceInicio + porPagina, ordenesFiltradas.length)}
                        </strong>{" "}
                        de <strong className="text-slate-800">{ordenesFiltradas.length}</strong> órdenes
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={porPagina}
                            onChange={(e) => {
                                setPorPagina(Number(e.target.value));
                                setPagina(1);
                            }}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 outline-none"
                        >
                            <option value={15}>15 por pág.</option>
                            <option value={25}>25 por pág.</option>
                            <option value={50}>50 por pág.</option>
                            <option value={100}>100 por pág.</option>
                        </select>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                                disabled={pagina <= 1}
                                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-2 font-bold text-slate-700">
                                {pagina} / {totalPaginas}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                                disabled={pagina >= totalPaginas}
                                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
};

export default OrdenesTrabajo;
