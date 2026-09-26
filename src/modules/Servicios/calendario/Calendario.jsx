import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    format,
    addDays,
    startOfWeek,
    subWeeks,
    addWeeks,
    isSameDay,
    parseISO,
    getHours,
    isValid
} from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    Truck,
    Wrench,
    AlertCircle,
    CheckCircle2,
    CalendarClock,
    X,
    ExternalLink,
    Search,
    ListFilter,
    RotateCcw
} from 'lucide-react';

import { otService } from '../../../services/ot.service.js';
import { UsuarioService } from '../../../services/user.service.js';
import { movilidadService } from '../../../services/movilidad.service.js';
import { useAuth } from '../../../context/authContext.jsx';
import { isSuperAdmin } from '../../../utils/permissions.js';

const HORAS = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 a 22:00

// Configuración de colores y estilos por estado
const ESTADO_CONFIG = {
    'Programado': {
        bg: 'bg-blue-50/90 hover:bg-blue-100',
        border: 'border-blue-600',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        label: 'Programado'
    },
    'En curso': {
        bg: 'bg-purple-50/90 hover:bg-purple-100',
        border: 'border-purple-600',
        text: 'text-purple-900',
        badge: 'bg-purple-100 text-purple-800 border-purple-300',
        label: 'En curso'
    },
    'Cancelado': {
        bg: 'bg-rose-50/90 hover:bg-rose-100 opacity-80 line-through',
        border: 'border-rose-500',
        text: 'text-rose-900',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        label: 'Cancelado'
    },
    'Finalizado': {
        bg: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
        border: 'border-slate-400',
        text: 'text-slate-800',
        badge: 'bg-slate-200 text-slate-800 border-slate-300',
        label: 'Finalizado'
    },
    'Proyección': {
        bg: 'bg-amber-50/95 hover:bg-amber-100/90 border-dashed border-2',
        border: 'border-amber-500',
        text: 'text-amber-950',
        badge: 'bg-amber-100 text-amber-900 border-amber-400 font-bold',
        label: 'Proyección'
    }
};

const mapearEstadoOT = (estadoRaw) => {
    const estado = String(estadoRaw ?? '').trim().toLowerCase();
    if (estado === 'en proceso') return 'En curso';
    if (estado === 'cancelada') return 'Cancelado';
    if (estado === 'finalizada') return 'Finalizado';
    return 'Programado';
};

// --- MODAL DE DETALLE DEL SERVICIO O PROYECCIÓN ---
const ModalDetalle = ({ evento, onClose, onSolicitarReprogramacion, puedeGestionar }) => {
    const navigate = useNavigate();
    const [detalleCompleto, setDetalleCompleto] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);

    useEffect(() => {
        if (!evento) {
            setDetalleCompleto(null);
            return;
        }

        let isMounted = true;
        const cargarDetalles = async () => {
            setCargandoDetalle(true);
            try {
                if (evento.tipo === 'OT') {
                    const data = await otService.getOrdenById(evento.id_ot);
                    if (isMounted) setDetalleCompleto(data);
                } else if (evento.tipo === 'PROYECCION') {
                    const data = await otService.getCotizacionById(evento.id_cotizacion);
                    if (isMounted) setDetalleCompleto(data);
                }
            } catch (err) {
                console.error('Error al cargar detalle enriquecido:', err);
            } finally {
                if (isMounted) setCargandoDetalle(false);
            }
        };

        cargarDetalles();
        return () => { isMounted = false; };
    }, [evento]);

    if (!evento) return null;

    const esProyeccion = evento.tipo === 'PROYECCION';
    const equipos = detalleCompleto?.equipos || [];

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Cabecera Modal */}
                <div className={`p-4 sm:p-5 text-white flex justify-between items-center ${esProyeccion ? 'bg-amber-600' : 'bg-slate-800'}`}>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20 tracking-wider">
                                {esProyeccion ? 'Cotización Pendiente' : 'Orden de Trabajo'}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold bg-white text-slate-800`}>
                                {evento.estado}
                            </span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg mt-1">
                            {esProyeccion ? `Proyección ${evento.numero_cotizacion}` : `OT #${evento.id_ot} — ${evento.numero_cotizacion}`}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 rounded-full transition-colors text-white"
                        aria-label="Cerrar modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido con Scroll */}
                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-sm text-slate-700">
                    {/* Cliente y Cotización */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cliente</p>
                            <p className="font-bold text-slate-800">{evento.cliente || 'Sin cliente'}</p>
                            {evento.ruc && <p className="text-xs text-slate-500 font-mono">RUC: {evento.ruc}</p>}
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cotización</p>
                            <p className="font-semibold text-slate-800">{evento.numero_cotizacion}</p>
                            {evento.tipo_pago && <p className="text-xs text-slate-500 capitalize">Pago: {evento.tipo_pago}</p>}
                        </div>
                    </div>

                    {/* Personal, Movilidad y Fechas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                <User size={12} /> Técnico
                            </p>
                            <p className="text-xs font-semibold text-slate-800 mt-1">{evento.tecnico || 'Por asignar'}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                <Truck size={12} /> Movilidad
                            </p>
                            <p className="text-xs font-semibold text-slate-800 mt-1">{evento.movilidad || 'Sin movilidad'}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                <Clock size={12} /> Programación
                            </p>
                            <p className="text-xs font-semibold text-slate-800 mt-1">
                                {evento.fecha_inicio ? format(parseISO(evento.fecha_inicio), 'dd/MM/yyyy HH:mm') : '—'}
                            </p>
                        </div>
                    </div>

                    {/* SECCIÓN REQUERIDA: EQUIPOS Y SERVICIOS A REALIZAR */}
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <Wrench size={14} className="text-blue-600" />
                                Equipos y Servicios a Realizar
                            </h4>
                            {cargandoDetalle && (
                                <span className="text-[10px] text-blue-600 animate-pulse font-semibold">Cargando detalles...</span>
                            )}
                        </div>

                        {equipos.length > 0 ? (
                            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                {equipos.map((eq, idx) => (
                                    <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-900 text-xs">
                                                    {eq.tipo_equipo || 'Equipo'} {eq.marca ? `· ${eq.marca}` : ''}
                                                </p>
                                                <p className="text-[11px] text-slate-600">
                                                    Modelo: <strong className="font-semibold">{eq.modelo || '—'}</strong> ·
                                                    Serie: <strong className="font-mono text-blue-700">{eq.serie || '—'}</strong>
                                                </p>
                                            </div>
                                            {eq.sede && (
                                                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                                                    {eq.sede}
                                                </span>
                                            )}
                                        </div>

                                        {/* Servicios del equipo */}
                                        {Array.isArray(eq.servicios) && eq.servicios.length > 0 && (
                                            <div className="space-y-1 pt-1.5 border-t border-slate-200">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Servicios:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {eq.servicios.map((s, sIdx) => (
                                                        <span key={sIdx} className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-medium">
                                                            <CheckCircle2 size={11} className="text-blue-600" />
                                                            {s.nombre_subtipo || s.nombre_servicio || 'Servicio'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <p><strong>Resumen de equipos:</strong> {evento.equipos_resumen || 'No registrado'}</p>
                                <p><strong>Resumen de servicios:</strong> {evento.servicios_resumen || 'No registrado'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pie de Acciones del Modal */}
                <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    {/* Botón de anular/reprogramar si es OT activa */}
                    {!esProyeccion && puedeGestionar && evento.estado !== 'Cancelado' && evento.estado !== 'Finalizado' && (
                        <button
                            onClick={() => onSolicitarReprogramacion(evento)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors shadow-sm"
                        >
                            <AlertCircle size={14} /> Anular y Reprogramar
                        </button>
                    )}

                    {/* Botón para programar si es proyección */}
                    {esProyeccion && puedeGestionar && (
                        <button
                            onClick={() => {
                                onClose();
                                navigate(`/planner/programar/${evento.id_cotizacion}`);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                        >
                            <CalendarClock size={14} /> Programar Orden de Trabajo
                        </button>
                    )}

                    {!esProyeccion && (
                        <button
                            onClick={() => {
                                onClose();
                                navigate(`/planner/ordenes/${evento.id_ot}`);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <ExternalLink size={13} /> Ver Detalle Completo
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors ml-auto"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MODAL DE REPROGRAMACIÓN OBLIGATORIA AL ANULAR ---
const ModalReprogramacion = ({ evento, onClose, onGuardarReprogramacion, tecnicos, movilidades }) => {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [idTecnico, setIdTecnico] = useState(evento?.id_tecnico_responsable || '');
    const [idMovilidad, setIdMovilidad] = useState(evento?.id_movilidad || '');
    const [motivo, setMotivo] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (evento?.fecha_inicio) {
            try {
                const date = new Date();
                date.setDate(date.getDate() + 1);
                date.setHours(9, 0, 0, 0);
                const fin = new Date(date);
                fin.setHours(13, 0, 0, 0);
                setFechaInicio(date.toISOString().slice(0, 16));
                setFechaFin(fin.toISOString().slice(0, 16));
            } catch (err) {
                console.error(err);
            }
        }
    }, [evento]);

    if (!evento) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fechaInicio || !fechaFin) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'La nueva fecha y hora de inicio y fin son obligatorias para reprogramar.'
            });
            return;
        }

        if (new Date(fechaFin) <= new Date(fechaInicio)) {
            Swal.fire({
                icon: 'warning',
                title: 'Fechas incorrectas',
                text: 'La fecha y hora de fin debe ser posterior a la fecha de inicio.'
            });
            return;
        }

        if (!idTecnico) {
            Swal.fire({
                icon: 'warning',
                title: 'Técnico requerido',
                text: 'Debe seleccionar un técnico responsable para la nueva fecha programada.'
            });
            return;
        }

        try {
            setGuardando(true);
            await onGuardarReprogramacion({
                fechaProgramada: fechaInicio,
                fechaFinProgramada: fechaFin,
                idTecnicoResponsable: Number(idTecnico),
                idMovilidad: idMovilidad ? Number(idMovilidad) : null,
                motivo
            });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-rose-700 p-4 sm:p-5 text-white flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <AlertCircle size={18} />
                            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                                Proceso Obligatorio
                            </span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg mt-1">Anular y Reprogramar Servicio</h3>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-sm">
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 leading-relaxed">
                        <strong>Atención:</strong> Para anular la orden <strong>OT #{evento.id_ot}</strong> (Cotización <strong>{evento.numero_cotizacion}</strong>), es obligatorio fijar una nueva fecha para su reprogramación bajo el mismo número de cotización.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Nueva Fecha/Hora Inicio *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Nueva Fecha/Hora Fin *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Técnico Responsable *
                        </label>
                        <select
                            required
                            value={idTecnico}
                            onChange={(e) => setIdTecnico(e.target.value)}
                            className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white"
                        >
                            <option value="">Seleccione técnico...</option>
                            {tecnicos.map(t => (
                                <option key={t.id_usuario} value={t.id_usuario}>
                                    {t.nombres} {t.apellidos}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Movilidad Asignada (Opcional)
                        </label>
                        <select
                            value={idMovilidad}
                            onChange={(e) => setIdMovilidad(e.target.value)}
                            className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white"
                        >
                            <option value="">Sin movilidad</option>
                            {movilidades.map(m => (
                                <option key={m.id_movilidad} value={m.id_movilidad}>
                                    {m.placa} — {m.marca} {m.modelo} ({m.estado_disponibilidad || 'Disponible'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Motivo de la Anulación / Reprogramación
                        </label>
                        <textarea
                            rows={2}
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Cliente solicitó postergación por parada de planta..."
                            className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={guardando}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        >
                            {guardando ? 'Guardando...' : 'Confirmar Reprogramación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const CalendarioProfesional = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const rol = String(user?.rol ?? '').trim().toUpperCase();
    const puedeGestionar = isSuperAdmin(user) || ['ADMINISTRADOR', 'PLANNER'].includes(rol);

    const [eventos, setEventos] = useState([]);
    const [proyecciones, setProyecciones] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventoAReprogramar, setEventoAReprogramar] = useState(null);
    const [tecnicos, setTecnicos] = useState([]);
    const [movilidades, setMovilidades] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [busqueda, setBusqueda] = useState('');
    const [mostrarProyeccionesBanner, setMostrarProyeccionesBanner] = useState(true);
    const [cargando, setCargando] = useState(true);

    const semana = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [currentDate]);

    const cargarDatos = useCallback(async () => {
        try {
            setCargando(true);
            const [resOrdenes, resCotizaciones, resTecnicos, resMovilidades] = await Promise.all([
                otService.getOrdenes().catch(() => []),
                otService.getCotizacionesDisponibles().catch(() => []),
                UsuarioService.getTecnicos().catch(() => []),
                movilidadService.getAll().catch(() => ({ data: [] }))
            ]);

            const listaOrdenes = Array.isArray(resOrdenes) ? resOrdenes : [];
            const listaCotizaciones = Array.isArray(resCotizaciones) ? resCotizaciones : [];
            const listaTecnicos = Array.isArray(resTecnicos) ? resTecnicos : [];
            const listaMovilidades = Array.isArray(resMovilidades?.data)
                ? resMovilidades.data
                : Array.isArray(resMovilidades) ? resMovilidades : [];

            setTecnicos(listaTecnicos);
            setMovilidades(listaMovilidades);

            // 1. Mapear Órdenes de Trabajo programadas
            const eventosOT = listaOrdenes.map(ot => {
                const dateObj = ot.fecha_programada ? parseISO(ot.fecha_programada) : null;
                const estadoMapeado = mapearEstadoOT(ot.estado);
                return {
                    id: `ot-${ot.id_ot}`,
                    id_ot: ot.id_ot,
                    id_cotizacion: ot.id_cotizacion,
                    numero_cotizacion: ot.numero_cotizacion,
                    tipo: 'OT',
                    cliente: ot.razon_social,
                    ruc: ot.ruc,
                    tecnico: ot.tecnico_responsable,
                    id_tecnico_responsable: ot.id_tecnico_responsable,
                    movilidad: ot.movilidad,
                    id_movilidad: ot.id_movilidad,
                    fecha_inicio: ot.fecha_programada,
                    fecha_fin: ot.fecha_fin_programada,
                    estado: estadoMapeado,
                    estado_raw: ot.estado,
                    equipos_resumen: ot.equipos_resumen,
                    servicios_resumen: ot.servicios_resumen,
                    dateObj: (dateObj && isValid(dateObj)) ? dateObj : null
                };
            });

            // 2. Mapear Cotizaciones disponibles como "Proyecciones"
            const eventosProyeccion = listaCotizaciones.map(c => {
                const dateObj = c.fecha_registro ? parseISO(c.fecha_registro) : null;
                return {
                    id: `proy-${c.id_cotizacion}`,
                    id_cotizacion: c.id_cotizacion,
                    numero_cotizacion: c.numero_cotizacion,
                    tipo: 'PROYECCION',
                    cliente: c.razon_social,
                    ruc: c.ruc,
                    tecnico: 'Por programar',
                    movilidad: null,
                    fecha_inicio: c.fecha_registro,
                    tipo_pago: c.tipo_pago,
                    estado: 'Proyección',
                    estado_raw: 'aprobada',
                    equipos_resumen: c.equipos_resumen,
                    servicios_resumen: c.servicios_resumen,
                    dateObj: (dateObj && isValid(dateObj)) ? dateObj : null
                };
            });

            setProyecciones(eventosProyeccion);
            setEventos([...eventosOT, ...eventosProyeccion]);
        } catch (error) {
            console.error('Error al cargar datos del calendario:', error);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
        const interval = setInterval(cargarDatos, 45000); // Refresco cada 45s
        return () => clearInterval(interval);
    }, [cargarDatos]);

    // Filtrar eventos por estado y texto de búsqueda
    const eventosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        return eventos.filter(ev => {
            const matchEstado = filtroEstado === 'TODOS' || ev.estado === filtroEstado;
            const matchTexto = !q || (
                (ev.cliente && ev.cliente.toLowerCase().includes(q)) ||
                (ev.numero_cotizacion && ev.numero_cotizacion.toLowerCase().includes(q)) ||
                (ev.tecnico && ev.tecnico.toLowerCase().includes(q)) ||
                (ev.equipos_resumen && ev.equipos_resumen.toLowerCase().includes(q)) ||
                (ev.servicios_resumen && ev.servicios_resumen.toLowerCase().includes(q))
            );
            return matchEstado && matchTexto;
        });
    }, [eventos, filtroEstado, busqueda]);

    const handleGuardarReprogramacion = async (datosReprogramacion) => {
        if (!eventoAReprogramar) return;

        try {
            await otService.anularYReprogramar(eventoAReprogramar.id_ot, datosReprogramacion);
            setEventoAReprogramar(null);
            setSelectedEvent(null);
            await cargarDatos();

            Swal.fire({
                icon: 'success',
                title: 'Reprogramación exitosa',
                text: `La programación anterior fue anulada y se ha generado la nueva OT para la cotización ${eventoAReprogramar.numero_cotizacion}.`,
                confirmButtonColor: '#2563eb'
            });
        } catch (error) {
            console.error('Error al reprogramar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al reprogramar',
                text: error?.response?.data?.message || error.message || 'No se pudo completar la reprogramación.'
            });
        }
    };

    return (
        <div className="p-2 sm:p-4 md:p-6 bg-slate-50 min-h-screen font-sans space-y-4">
            {/* Cabecera y Controles */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="text-blue-600 h-6 w-6" />
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Calendario de Servicios
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Programaciones activas, estados de servicios y proyecciones de cotizaciones aprobadas.
                    </p>
                </div>

                {/* Navegador de Fecha */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                        <button
                            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                            className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700"
                            title="Semana anterior"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-3 py-1 text-xs font-bold hover:bg-white rounded-lg transition-colors text-slate-800"
                        >
                            Hoy
                        </button>
                        <button
                            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                            className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700"
                            title="Semana siguiente"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <span className="text-xs sm:text-sm font-black text-slate-800 uppercase px-2">
                        {format(currentDate, 'MMMM yyyy', { locale: es })}
                    </span>

                    <button
                        onClick={() => cargarDatos()}
                        disabled={cargando}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Actualizar datos"
                    >
                        <RotateCcw size={16} className={cargando ? 'animate-spin text-blue-600' : ''} />
                    </button>
                </div>
            </div>

            {/* BANNER / DOCK DE PROYECCIONES (COTIZACIONES APROBADAS SIN PROGRAMAR) */}
            {proyecciones.length > 0 && mostrarProyeccionesBanner && (
                <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                            <h3 className="font-bold text-sm text-amber-950">
                                Proyecciones Pendientes de Programación ({proyecciones.length})
                            </h3>
                            <span className="hidden sm:inline-block text-[11px] text-amber-800">
                                Cotizaciones aprobadas que aún no cuentan con Orden de Trabajo asignada.
                            </span>
                        </div>
                        <button
                            onClick={() => setMostrarProyeccionesBanner(false)}
                            className="text-amber-700 hover:text-amber-900 text-xs font-semibold"
                        >
                            Ocultar panel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                        {proyecciones.map(proy => (
                            <div
                                key={proy.id}
                                onClick={() => setSelectedEvent(proy)}
                                className="bg-white p-3 rounded-xl border-2 border-dashed border-amber-400 hover:border-amber-600 cursor-pointer shadow-sm hover:shadow transition-all space-y-1"
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                                        {proy.numero_cotizacion}
                                    </span>
                                    {puedeGestionar && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/planner/programar/${proy.id_cotizacion}`);
                                            }}
                                            className="text-[10px] font-bold text-amber-700 hover:text-amber-900 underline"
                                        >
                                            Programar →
                                        </button>
                                    )}
                                </div>
                                <p className="font-bold text-xs text-slate-800 truncate" title={proy.cliente}>
                                    {proy.cliente}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate" title={proy.equipos_resumen || proy.servicios_resumen}>
                                    {proy.equipos_resumen || proy.servicios_resumen || 'Servicio técnico'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FILTROS Y LEYENDA DE ESTADOS */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Leyenda y Filtros por Estado */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                        <ListFilter size={14} /> Estados:
                    </span>
                    {['TODOS', 'Programado', 'En curso', 'Cancelado', 'Finalizado', 'Proyección'].map(estadoKey => {
                        const isSelected = filtroEstado === estadoKey;
                        const cfg = ESTADO_CONFIG[estadoKey];
                        return (
                            <button
                                key={estadoKey}
                                onClick={() => setFiltroEstado(estadoKey)}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs border ${
                                    isSelected
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                                        : cfg
                                            ? `${cfg.badge} hover:opacity-80`
                                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                            >
                                {estadoKey === 'TODOS' ? 'Todos los Estados' : cfg.label}
                            </button>
                        );
                    })}
                </div>

                {/* Búsqueda dentro del calendario */}
                <div className="relative min-w-[220px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Filtrar por cliente, OT o equipo..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
                    />
                </div>
            </div>

            {/* GRILLA DEL CALENDARIO SEMANAL */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="grid grid-cols-[64px_repeat(7,_minmax(130px,1fr))] min-w-[840px]">
                        {/* Celda esquina superior */}
                        <div className="p-3 border-b border-r bg-slate-100/70 text-[10px] font-black text-slate-500 uppercase text-center sticky left-0 z-10">
                            Hora
                        </div>

                        {/* Encabezado de los 7 días */}
                        {semana.map(dia => {
                            const esHoy = isSameDay(dia, new Date());
                            const eventosDia = eventosFiltrados.filter(e => e.dateObj && isSameDay(e.dateObj, dia));

                            return (
                                <div
                                    key={dia.toString()}
                                    className={`p-2.5 text-center border-b border-r transition-colors ${
                                        esHoy ? 'bg-blue-50/80 border-blue-200' : 'bg-slate-50/60'
                                    }`}
                                >
                                    <p className={`text-[10px] uppercase font-bold tracking-wider ${esHoy ? 'text-blue-700' : 'text-slate-500'}`}>
                                        {format(dia, 'eee', { locale: es })}
                                    </p>
                                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                        <span className={`text-base font-black ${
                                            esHoy
                                                ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm'
                                                : 'text-slate-800'
                                        }`}>
                                            {format(dia, 'd')}
                                        </span>
                                        {eventosDia.length > 0 && (
                                            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded-full" title={`${eventosDia.length} eventos este día`}>
                                                {eventosDia.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Filas por hora (8:00 a 22:00) */}
                        {HORAS.map(hora => (
                            <React.Fragment key={hora}>
                                <div className="p-2 border-r border-b text-center text-[11px] text-slate-400 bg-slate-50 flex items-center justify-center font-bold sticky left-0 z-10">
                                    {hora}:00
                                </div>

                                {semana.map(dia => {
                                    const eventosEnHora = eventosFiltrados.filter(
                                        e => e.dateObj && isSameDay(e.dateObj, dia) && getHours(e.dateObj) === hora
                                    );

                                    return (
                                        <div
                                            key={dia.toString()}
                                            className="border-b border-r min-h-[92px] p-1 relative hover:bg-slate-50/70 transition-colors"
                                        >
                                            <div className="space-y-1">
                                                {eventosEnHora.map(ev => {
                                                    const config = ESTADO_CONFIG[ev.estado] || ESTADO_CONFIG['Programado'];
                                                    const esProy = ev.tipo === 'PROYECCION';

                                                    return (
                                                        <div
                                                            key={ev.id}
                                                            onClick={() => setSelectedEvent(ev)}
                                                            className={`p-1.5 rounded-lg cursor-pointer transition-all hover:scale-[1.02] border-l-4 shadow-sm ${config.bg} ${config.border} ${config.text}`}
                                                            title={`${ev.estado}: ${ev.cliente} — ${ev.numero_cotizacion}`}
                                                        >
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="text-[9px] font-black uppercase tracking-wider truncate">
                                                                    {esProy ? 'PROY' : `OT #${ev.id_ot}`}
                                                                </span>
                                                                <span className={`text-[8px] font-bold px-1 rounded ${config.badge}`}>
                                                                    {ev.estado}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] font-bold truncate text-slate-900 mt-0.5">
                                                                {ev.cliente}
                                                            </p>
                                                            <p className="text-[9px] text-slate-600 truncate font-mono">
                                                                {ev.numero_cotizacion}
                                                            </p>
                                                            <p className="text-[9px] truncate text-slate-700 font-medium flex items-center gap-0.5 mt-0.5">
                                                                <User size={10} className="text-slate-400" />
                                                                {ev.tecnico}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL DE DETALLE COMPLETO CON EQUIPOS Y SERVICIOS */}
            <ModalDetalle
                evento={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                puedeGestionar={puedeGestionar}
                onSolicitarReprogramacion={(ev) => {
                    setEventoAReprogramar(ev);
                }}
            />

            {/* MODAL DE REPROGRAMACIÓN OBLIGATORIA */}
            <ModalReprogramacion
                evento={eventoAReprogramar}
                onClose={() => setEventoAReprogramar(null)}
                onGuardarReprogramacion={handleGuardarReprogramacion}
                tecnicos={tecnicos}
                movilidades={movilidades}
            />
        </div>
    );
};

export default CalendarioProfesional;