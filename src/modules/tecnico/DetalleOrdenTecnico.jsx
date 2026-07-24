// src/modules/Tecnico/DetalleOrdenTecnico.jsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Loader2,
    MapPin,
    Play,
    RefreshCw,
    Square,
    Truck,
    UserRound,
    WalletCards,
    Wrench
} from 'lucide-react';

import { tecnicoOTService } from './service/tecnicoOT.service.js';
import { tiempoService } from './service/time.service.js';
import { useAuth } from '../../context/authContext.jsx';
import { notify } from '../../utils/notifications.jsx';

const CONFIRMACIONES_TIEMPO = {
    llegada: {
        title: '¿Registrar hora de llegada?',
        text: 'Se guardará la fecha y hora actual como llegada al servicio.',
        confirmButtonText: 'Sí, registrar llegada',
        confirmButtonColor: '#2563eb'
    },
    inicio: {
        title: '¿Iniciar el trabajo?',
        text: 'Se guardará la fecha y hora actual como inicio de la atención.',
        confirmButtonText: 'Sí, registrar inicio',
        confirmButtonColor: '#059669'
    },
    fin: {
        title: '¿Finalizar el trabajo?',
        text: 'Se guardará la fecha y hora actual como fin. Verifica que el trabajo del equipo haya terminado.',
        confirmButtonText: 'Sí, registrar fin',
        confirmButtonColor: '#dc2626'
    }
};

const obtenerClaseEstado = (estado) => {
    switch (estado) {
        case 'Programada':
            return 'bg-blue-100 text-blue-700';

        case 'En Proceso':
        case 'En proceso':
            return 'bg-amber-100 text-amber-700';

        case 'Finalizada':
        case 'Finalizado':
            return 'bg-green-100 text-green-700';

        case 'Pendiente':
            return 'bg-slate-100 text-slate-700';

        case 'Realizado':
            return 'bg-green-100 text-green-700';

        case 'No realizado':
            return 'bg-red-100 text-red-700';

        case 'Observado':
            return 'bg-orange-100 text-orange-700';

        default:
            return 'bg-slate-100 text-slate-700';
    }
};

const formatearFecha = (fecha) => {
    if (!fecha) {
        return 'No registrada';
    }

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
        return 'Fecha inválida';
    }

    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(fechaConvertida);
};

const normalizarRespuesta = (respuesta) => {
    return (
        respuesta?.data?.data ??
        respuesta?.data ??
        respuesta ??
        null
    );
};

export const DetalleOrdenTecnico = () => {
    const { idOt } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const idTecnico =
        user?.id_usuario ??
        user?.id ??
        null;

    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(null);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const cargarOrden = useCallback(async () => {
        const idOrden = Number(idOt);
        const idUsuario = Number(idTecnico);

        if (!Number.isInteger(idOrden) || idOrden <= 0) {
            setError('El ID de la Orden de Trabajo no es válido');
            setLoading(false);
            return;
        }

        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            setError('No se pudo identificar al técnico');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const respuesta =
                await tecnicoOTService.getOrdenById(
                    idUsuario,
                    idOrden
                );

            const data = normalizarRespuesta(respuesta);

            if (!data?.id_ot) {
                throw new Error(
                    'La API no devolvió una Orden de Trabajo válida'
                );
            }

            setOrden(data);
        } catch (error) {
            console.error(
                'Error al cargar la OT del técnico:',
                error
            );

            setOrden(null);

            setError(
                error.response?.data?.message ||
                error.message ||
                'No se pudo obtener la Orden de Trabajo'
            );
        } finally {
            setLoading(false);
        }
    }, [idOt, idTecnico]);

    useEffect(() => {
        cargarOrden();
    }, [cargarOrden]);

    const ejecutarAccionTiempo = async (
        idOtDetalle,
        accion
    ) => {
        const confirmacion = CONFIRMACIONES_TIEMPO[accion];
        if (!confirmacion) return;

        const confirmado = await notify.confirm(
            confirmacion.title,
            confirmacion.text,
            {
                icon: 'question',
                confirmButtonText: confirmacion.confirmButtonText,
                cancelButtonText: 'Cancelar',
                confirmButtonColor: confirmacion.confirmButtonColor
            }
        );
        if (!confirmado) return;

        const clave = `${idOtDetalle}-${accion}`;

        try {
            setProcesando(clave);
            setError('');
            setMensaje('');

            if (accion === 'llegada') {
                await tiempoService.registrarLlegada(
                    idOtDetalle
                );

                setMensaje(
                    'Hora de llegada registrada correctamente'
                );
            }

            if (accion === 'inicio') {
                await tiempoService.registrarInicio(
                    idOtDetalle
                );

                setMensaje(
                    'Hora de inicio registrada correctamente'
                );
            }

            if (accion === 'fin') {
                await tiempoService.registrarFin(
                    idOtDetalle
                );

                setMensaje(
                    'Hora de finalización registrada correctamente'
                );
            }

            await cargarOrden();
        } catch (error) {
            console.error(
                `Error al registrar ${accion}:`,
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                `No se pudo registrar ${accion}`
            );
        } finally {
            setProcesando(null);
        }
    };

    const irInforme = (idOtDetalle) => {
        navigate(
            `/tecnico/informes/${idOtDetalle}`,
            {
                state: {
                    idOtDetalle
                }
            }
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-72 items-center justify-center">
                <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!orden) {
        return (
            <section className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <h1 className="text-lg font-bold text-red-800">
                        No se pudo cargar la orden
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/tecnico/ordenes')
                        }
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a mis órdenes
                    </button>
                </div>
            </section>
        );
    }

    const equipos = Array.isArray(orden.equipos)
        ? orden.equipos
        : [];

    return (
        <section className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() =>
                        navigate('/tecnico/ordenes')
                    }
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a mis órdenes
                </button>

                <button
                    type="button"
                    onClick={() => navigate(`/ordenes/${orden.id_ot}/viaticos`)}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                    <WalletCards className="h-4 w-4" />
                    Gastos de la OT
                </button>

                <button
                    type="button"
                    onClick={cargarOrden}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                    <RefreshCw className="h-4 w-4" />
                    Actualizar
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {mensaje && (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    {mensaje}
                </div>
            )}

            <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Orden asignada
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        OT N.° {orden.id_ot}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Cotización{' '}
                        {orden.numero_cotizacion ||
                            'No registrada'}
                    </p>
                </div>

                <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${obtenerClaseEstado(
                        orden.estado
                    )}`}
                >
                    {orden.estado}
                </span>
            </header>

            <div className="grid gap-5 xl:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-blue-600" />

                        <h2 className="text-lg font-bold text-slate-900">
                            Cliente
                        </h2>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Razón social
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {orden.razon_social ||
                                    'No registrada'}
                            </p>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

                            <div>
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Dirección
                                </p>

                                <p className="mt-1 text-sm text-slate-800">
                                    {orden.direccion ||
                                        'No registrada'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <UserRound className="mt-0.5 h-5 w-5 text-slate-400" />

                            <div>
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Contacto
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {orden.contacto ||
                                        'No registrado'}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {orden.celular || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-600" />

                        <h2 className="text-lg font-bold text-slate-900">
                            Programación
                        </h2>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 h-5 w-5 text-slate-400" />

                            <div>
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Fecha programada
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {formatearFecha(
                                        orden.fecha_programada
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Truck className="mt-0.5 h-5 w-5 text-slate-400" />

                            <div>
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Movilidad
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {orden.placa_movilidad ||
                                        'No asignada'}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {orden.marca_movilidad || ''}{' '}
                                    {orden.modelo_movilidad || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>

            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Equipos asignados
                    </h2>

                    <p className="text-sm text-slate-500">
                        Registre los tiempos y complete un informe independiente por equipo.
                    </p>
                </div>

                {equipos.length === 0 ? (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                        Esta orden no tiene equipos asociados.
                    </div>
                ) : (
                    equipos.map((equipo, index) => {
                        const tiempos =
                            equipo.tiempos ?? {};

                        const servicios = Array.isArray(
                            equipo.servicios
                        )
                            ? equipo.servicios
                            : [];

                        const tieneLlegada =
                            Boolean(
                                tiempos.fecha_hora_llegada
                            );

                        const tieneInicio =
                            Boolean(
                                tiempos.fecha_hora_inicio
                            );

                        const tieneFin =
                            Boolean(
                                tiempos.fecha_hora_fin
                            );

                        return (
                            <article
                                key={equipo.id_ot_detalle}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                            Equipo {index + 1}
                                        </p>

                                        <h3 className="mt-1 text-xl font-bold text-slate-900">
                                            {equipo.tipo_equipo ||
                                                'Equipo sin tipo'}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-600">
                                            {equipo.marca ||
                                                'Sin marca'}{' '}
                                            ·{' '}
                                            {equipo.modelo ||
                                                'Sin modelo'}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            Serie:{' '}
                                            {equipo.serie ||
                                                'No registrada'}
                                        </p>
                                    </div>

                                    <span
                                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${obtenerClaseEstado(
                                            equipo.estado_equipo
                                        )}`}
                                    >
                                        {equipo.estado_equipo}
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="text-xs uppercase text-slate-500">
                                            Sede
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {equipo.sede ||
                                                'No registrada'}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="text-xs uppercase text-slate-500">
                                            Código interno
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {equipo.codigo_interno ||
                                                'No registrado'}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="text-xs uppercase text-slate-500">
                                            Encargado
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {equipo.encargado_equipo ||
                                                'No registrado'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="h-4 w-4 text-blue-600" />

                                        <h4 className="font-semibold text-slate-900">
                                            Servicios asignados
                                        </h4>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        {servicios.length === 0 ? (
                                            <p className="text-sm text-slate-500">
                                                No hay servicios registrados.
                                            </p>
                                        ) : (
                                            servicios.map(
                                                (servicio) => (
                                                    <div
                                                        key={
                                                            servicio.id_ot_detalle_servicio
                                                        }
                                                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {
                                                                    servicio.nombre_subtipo
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    servicio.nombre_tipo_servicio
                                                                }
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerClaseEstado(
                                                                servicio.estado
                                                            )}`}
                                                        >
                                                            {
                                                                servicio.estado
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2">
                                        <Clock3 className="h-5 w-5 text-blue-600" />

                                        <h4 className="font-bold text-slate-900">
                                            Control de tiempos
                                        </h4>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs uppercase text-slate-500">
                                                Llegada
                                            </p>

                                            <p className="mt-1 text-sm font-semibold">
                                                {formatearFecha(
                                                    tiempos.fecha_hora_llegada
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase text-slate-500">
                                                Inicio
                                            </p>

                                            <p className="mt-1 text-sm font-semibold">
                                                {formatearFecha(
                                                    tiempos.fecha_hora_inicio
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase text-slate-500">
                                                Fin
                                            </p>

                                            <p className="mt-1 text-sm font-semibold">
                                                {formatearFecha(
                                                    tiempos.fecha_hora_fin
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <button
                                            type="button"
                                            disabled={
                                                tieneLlegada ||
                                                Boolean(procesando)
                                            }
                                            onClick={() =>
                                                ejecutarAccionTiempo(
                                                    equipo.id_ot_detalle,
                                                    'llegada'
                                                )
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {procesando ===
                                                `${equipo.id_ot_detalle}-llegada` ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <MapPin className="h-4 w-4" />
                                            )}

                                            Registrar llegada
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                !tieneLlegada ||
                                                tieneInicio ||
                                                Boolean(procesando)
                                            }
                                            onClick={() =>
                                                ejecutarAccionTiempo(
                                                    equipo.id_ot_detalle,
                                                    'inicio'
                                                )
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {procesando ===
                                                `${equipo.id_ot_detalle}-inicio` ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}

                                            Iniciar trabajo
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                !tieneInicio ||
                                                tieneFin ||
                                                Boolean(procesando)
                                            }
                                            onClick={() =>
                                                ejecutarAccionTiempo(
                                                    equipo.id_ot_detalle,
                                                    'fin'
                                                )
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {procesando ===
                                                `${equipo.id_ot_detalle}-fin` ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Square className="h-4 w-4" />
                                            )}

                                            Finalizar trabajo
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <button
                                        type="button"
                                        disabled={!tieneInicio}
                                        onClick={() =>
                                            irInforme(equipo.id_ot_detalle)
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ClipboardList className="h-4 w-4" />
                                        Completar informe
                                    </button>
                                </div>
                            </article>
                        );
                    })
                )}
            </section>
        </section>
    );
};

export default DetalleOrdenTecnico;
