import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, User, ChevronRight, Plus, CheckCircle, Play, MapPin, Flag } from 'lucide-react';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { serviciosService } from '../../services/service.service.js';
import AperturaServicioModal from './AperturaServicioModal.jsx';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import route from '../../helpers/route.jsx';
import { tiempoService } from '../../services/time.service.js';

export default function GenerarServicio() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [modalModo, setModalModo] = useState('CREAR');

    const cargarServicios = async () => {
        if (!user) return;
        setCargando(true);
        try {
            const res = user.rol === 'TECNICO'
                ? await serviciosService.getPendientesTecnico(user.id_usuario)
                : await serviciosService.getAll();

            if (res?.success) {
                const serviciosFiltrados = (res.data || []).filter(
                    srv => srv.estado?.toLowerCase() !== 'revisado'
                );
                setServicios(serviciosFiltrados);
            } else {
                setServicios([]);
            }
        } catch (err) {
            console.error("Error al cargar servicios:", err);
            setServicios([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarServicios();
    }, [user]);

    const handleEjecutar = (srv) => {
        const path = route.detalleServicio.replace(':id_servicio', srv.id_servicio);
        navigate(path, { state: { servicio: srv } });
    };

    const viewAntecedentes = async (serie) => {
        if (!serie || serie === 'S/N') {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Este equipo no tiene un número de serie válido.' });
            return;
        }

        try {
            const respuesta = await serviciosService.getHistorialPorSerie(serie);
            if (respuesta && respuesta.length > 0) {
                navigate(`/servicio/historial-cliente/${serie}`, { state: { historial: respuesta } });
            } else {
                Swal.fire({ icon: 'info', title: 'Sin historial', text: 'No se encontraron antecedentes para este equipo.' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar el historial.' });
        }
    };

    const actualizarEstadoLocalTiempo = (idServicio, campoFecha, nuevoEstado) => {
        const ahoraIso = new Date().toISOString();
        setServicios(prevServicios =>
            prevServicios.map(srv =>
                srv.id_servicio === idServicio
                    ? { ...srv, [campoFecha]: ahoraIso, estado_actual: nuevoEstado }
                    : srv
            )
        );
    };

    // Funciones con SweetAlert2
    const registrarAccion = async (idServicio, titulo, confirmText, serviceFn, campoFecha, nuevoEstado) => {
        const result = await Swal.fire({
            title: titulo,
            text: "¿Estás seguro?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#d1d5db',
            confirmButtonText: 'Sí, confirmar'
        });

        if (result.isConfirmed) {
            try {
                actualizarEstadoLocalTiempo(idServicio, campoFecha, nuevoEstado);
                const res = await serviceFn(idServicio);
                if (res?.success || res?.message?.toLowerCase().includes('ya fue')) {
                    Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Registro actualizado correctamente', timer: 1500, showConfirmButton: false });
                    await cargarServicios();
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo completar la acción.' });
                await cargarServicios();
            }
        }
    };

    // Uso de las funciones optimizadas
    const registrarLlegada = (id) => registrarAccion(id, "Registrar Llegada", "", tiempoService.registrarLlegada, 'fecha_hora_llegada', 'Cliente');
    const registrarInicio = (id) => registrarAccion(id, "Iniciar Trabajo", "", tiempoService.registrarInicio, 'fecha_hora_inicio', 'En proceso');
    const registrarFin = (id) => registrarAccion(id, "Finalizar Servicio", "", tiempoService.registrarFin, 'fecha_hora_fin', 'Finalizado');
    return (
        <div className="min-h-screen bg-slate-50 p-4">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        {user?.rol === 'TECNICO' ? 'Mis Servicios' : 'Panel de Servicios'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Gestiona las órdenes y el seguimiento de tus servicios.
                    </p>
                </div>
                {['ADMINISTRADOR', 'POSTVENTA'].includes(user?.rol) && (
                    <button
                        onClick={() => {
                            setModalModo('CREAR');
                            setServicioSeleccionado(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Nuevo Servicio
                    </button>
                )}
            </div>

            {/* Grid de servicios */}
            {cargando ? (
                <Loading />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicios.length > 0 ? (
                        servicios.map((srv) => {
                            // 💡 SOLUCIÓN: Al mapear desde 'servicio_tiempos' mediante el LEFT JOIN, controlamos el null inicial
                            const estadoActualProceso = srv.estado_actual ? srv.estado_actual.toLowerCase() : 'programado';

                            // Control de flujo secuencial estricto
                            const esProgramado = estadoActualProceso === 'programado';
                            const esCliente = estadoActualProceso === 'cliente';
                            const esEnProceso = estadoActualProceso === 'en proceso';
                            const esFinalizado = estadoActualProceso === 'finalizado';

                            // Respaldo de fechas provenientes de las columnas de la BD
                            const horaLlegada = srv.fecha_hora_llegada || srv.fechaHoraLlegada;
                            const horaInicio = srv.fecha_hora_inicio || srv.fechaHoraInicio;

                            return (
                                <div
                                    key={srv.id_servicio}
                                    className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                                <Briefcase size={22} />
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${srv.estado?.toLowerCase() === 'pendiente' || srv.estado?.toLowerCase() === 'no revisado'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                                        }`}
                                                >
                                                    {srv.estado}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 italic capitalize">
                                                    Progreso: {estadoActualProceso}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Información del Cliente */}
                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg text-gray-900 leading-tight">
                                                {srv.tipoServicio}
                                            </h3>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {srv.razon_social || srv.cliente_razon_social}
                                            </p>
                                            <p className="text-xs text-indigo-500 font-bold tracking-wide mt-1">
                                                RUC: {srv.ruc}
                                            </p>
                                        </div>

                                        {/* Información Técnica */}
                                        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl mb-4 text-xs">
                                            <div>
                                                <p className="text-gray-400 text-[10px] uppercase font-bold">Marca</p>
                                                <p className="font-semibold text-gray-700">{srv.marca || srv.equipo_marca}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-[10px] uppercase font-bold">Modelo</p>
                                                <p className="font-semibold text-gray-700"> {srv.modelo || srv.equipo_modelo}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-[10px] uppercase font-bold">Serie</p>
                                                <p className="font-mono text-gray-700">{srv.serie || srv.equipo_serie || 'S/N'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-[10px] uppercase font-bold">Sede</p>
                                                <p className="font-mono text-gray-700">{srv.sede || 'S/N'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            {['ADMINISTRADOR', 'POSTVENTA'].includes(user?.rol) && (
                                                <div className="text-xs">
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold">Técnico a cargo:</p>
                                                    <p className="text-gray-700 font-medium">
                                                        {srv.tecnico_nombres} {srv.tecnico_apellidos || ''}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <User size={14} className="text-gray-400" />
                                                <span>Contacto: {srv.encargado_equipo || 'Sin contacto'}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock size={14} className="text-indigo-400" />
                                                <span>
                                                    Asignado: {srv.fechainicio ? new Date(srv.fechainicio).toLocaleString() : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {['TECNICO', 'ADMINISTRADOR'].includes(user?.rol) && (
                                        <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">

                                            <button
                                                onClick={() => handleEjecutar(srv)}
                                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all duration-300 shadow-sm"
                                            >
                                                Ver Detalle / Reporte
                                                <ChevronRight size={16} />
                                            </button>

                                            {/* BOTONES SECUENCIALES CONTROLADOS */}
                                            <div className="flex flex-col gap-2">

                                                {/* 1. REGISTRAR LLEGADA */}
                                                {esProgramado ? (
                                                    <button
                                                        onClick={() => registrarLlegada(srv.id_servicio)}
                                                        className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white text-xs rounded-xl font-bold hover:bg-green-700 transition-all active:scale-[0.98]"
                                                    >
                                                        <MapPin size={14} />
                                                        Registrar Llegada
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                                                        <CheckCircle size={16} />
                                                        <span>Llegada registrada {horaLlegada ? `(${new Date(horaLlegada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}</span>
                                                    </div>
                                                )}

                                                {/* 2. INICIAR TRABAJO (Aparece únicamente si ya se registró la llegada) */}
                                                {(esCliente || esEnProceso || esFinalizado) && (
                                                    esCliente ? (
                                                        <button
                                                            onClick={() => registrarInicio(srv.id_servicio)}
                                                            className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500 text-white text-xs rounded-xl font-bold hover:bg-amber-600 transition-all active:scale-[0.98]"
                                                        >
                                                            <Play size={14} />
                                                            Iniciar Trabajo
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200">
                                                            <CheckCircle size={16} />
                                                            <span>Servicio Iniciado {horaInicio ? `(${new Date(horaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}</span>
                                                        </div>
                                                    )
                                                )}

                                                {/* 3. FINALIZAR TRABAJO (Aparece únicamente si ya fue iniciado) */}
                                                {(esEnProceso || esFinalizado) && (
                                                    esFinalizado ? (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 justify-center">
                                                            <Flag size={14} />
                                                            <span>✓ Servicio Finalizado Completamente</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => registrarFin(srv.id_servicio)}
                                                            className="w-full flex items-center justify-center gap-2 py-2 bg-red-600 text-white text-xs rounded-xl font-bold hover:bg-red-700 transition-all active:scale-[0.98]"
                                                        >
                                                            <Flag size={14} />
                                                            Finalizar Trabajo
                                                        </button>
                                                    )
                                                )}

                                            </div>
                                            <div>
                                                {/* Reemplaza tu botón actual por este */}
                                                <button
                                                    onClick={() => viewAntecedentes(srv.serie || srv.equipo_serie)}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all duration-300 shadow-sm"
                                                >
                                                    Ver antecedentes
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No tienes órdenes de servicio pendientes por procesar.</p>
                        </div>
                    )}
                </div>
            )}

            <AperturaServicioModal
                isOpen={isModalOpen}
                servicio={servicioSeleccionado}
                modo={modalModo}
                onClose={() => setIsModalOpen(false)}
                onOrderCreated={cargarServicios}
            />
        </div>
    );
}