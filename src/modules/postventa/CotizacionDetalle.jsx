import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    CalendarPlus,
    ClipboardList,
    Loader2,
    MapPin,
    Phone,
    UserRound,
    Wrench
} from 'lucide-react';

import { otService } from '../../services/ot.service.js';
import { cotizacionService } from '../../services/cotizacion.service.js';
import { useAuth } from '../../context/authContext.jsx';
import { isSuperAdmin } from '../../utils/permissions.js';

const ESTADOS_COTIZACION = ['borrador', 'enviada', 'aprobada', 'rechazada'];
const TRANSICIONES_COTIZACION = {
    borrador: ['enviada'],
    enviada: ['aprobada', 'rechazada'],
    aprobada: [],
    rechazada: []
};

const puedeTransicionar = (estadoActual, nuevoEstado, accesoTotal = false) => {
    const actual = String(estadoActual || 'borrador').toLowerCase();
    return accesoTotal || nuevoEstado === actual
        || (TRANSICIONES_COTIZACION[actual] ?? []).includes(nuevoEstado);
};

const estadoClase = (estado) => {
    switch (estado?.toLowerCase()) {
        case 'aprobada':
            return 'bg-green-100 text-green-700';

        case 'enviada':
            return 'bg-blue-100 text-blue-700';

        case 'rechazada':
            return 'bg-red-100 text-red-700';

        case 'borrador':
            return 'bg-slate-100 text-slate-700';

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

export const CotizacionDetalle = () => {
    const { idCotizacion } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [cotizacion, setCotizacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('borrador');
    const [actualizandoEstado, setActualizandoEstado] = useState(false);

    const puedeActualizarEstado = ['POSTVENTA', 'ADMINISTRADOR', 'SUPERADMINISTRADOR'].includes(
        String(user?.rol ?? '').trim().toUpperCase()
    );

    useEffect(() => {
        const cargarCotizacion = async () => {
            const id = Number(idCotizacion);

            if (!Number.isInteger(id) || id <= 0) {
                setError(
                    'No se recibió un ID válido de la cotización'
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                const respuesta =
                    await otService.getCotizacionById(id);

                const cotizacionNormalizada =
                    respuesta?.data?.data ??
                    respuesta?.data ??
                    respuesta ??
                    null;

                if (!cotizacionNormalizada?.id_cotizacion) {
                    throw new Error(
                        'La API no devolvió una cotización válida'
                    );
                }

                setCotizacion(cotizacionNormalizada);
                setNuevoEstado(
                    String(cotizacionNormalizada.estado || 'borrador').toLowerCase()
                );
            } catch (error) {
                console.error(
                    'Error al cargar la cotización:',
                    error
                );

                setCotizacion(null);

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'No se pudo obtener la cotización'
                );
            } finally {
                setLoading(false);
            }
        };

        cargarCotizacion();
    }, [idCotizacion]);

    const actualizarEstado = async () => {
        if (!puedeActualizarEstado || !cotizacion?.id_cotizacion) return;

        try {
            setActualizandoEstado(true);
            setError('');
            setMensaje('');

            const resultado = await cotizacionService.updateEstado(
                cotizacion.id_cotizacion,
                nuevoEstado
            );
            const estadoActualizado = resultado?.estado || nuevoEstado;

            setCotizacion(anterior => ({ ...anterior, estado: estadoActualizado }));
            setNuevoEstado(estadoActualizado);
            setMensaje('Estado de la cotización actualizado correctamente.');
        } catch (error) {
            setError(
                error?.response?.data?.message
                || error?.message
                || 'No se pudo actualizar el estado de la cotización'
            );
        } finally {
            setActualizandoEstado(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-72 items-center justify-center">
                <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!cotizacion) {
        return (
            <section className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <h1 className="text-lg font-bold text-red-800">
                        No se pudo cargar la cotización
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/planner/cotizaciones')
                        }
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </button>
                </div>
            </section>
        );
    }

    const equipos = Array.isArray(cotizacion.equipos)
        ? cotizacion.equipos
        : [];

    return (
        <section className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() =>
                        navigate('/planner/cotizaciones')
                    }
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a cotizaciones
                </button>

                {cotizacion.estado?.toLowerCase() ===
                    'aprobada' && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/planner/programar/${cotizacion.id_cotizacion}`
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <CalendarPlus className="h-4 w-4" />
                        Programar OT
                    </button>
                )}
            </div>

            <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        Cotización
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        N.° {cotizacion.numero_cotizacion}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Registrada el{' '}
                        {formatearFecha(
                            cotizacion.fecha_registro
                        )}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${estadoClase(
                            cotizacion.estado
                        )}`}
                    >
                        {cotizacion.estado}
                    </span>

                    {puedeActualizarEstado && (
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <label htmlFor="estado-cotizacion" className="sr-only">
                                Nuevo estado de la cotización
                            </label>
                            <select
                                id="estado-cotizacion"
                                value={nuevoEstado}
                                onChange={(event) => setNuevoEstado(event.target.value)}
                                disabled={actualizandoEstado}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm capitalize text-slate-800 disabled:opacity-60"
                            >
                                {ESTADOS_COTIZACION.map(estado => (
                                    <option
                                        key={estado}
                                        value={estado}
                                        disabled={!puedeTransicionar(cotizacion.estado, estado, isSuperAdmin(user))}
                                    >
                                        {estado}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={actualizarEstado}
                                disabled={
                                    actualizandoEstado
                                    || nuevoEstado === String(cotizacion.estado).toLowerCase()
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {actualizandoEstado && <Loader2 className="h-4 w-4 animate-spin" />}
                                {actualizandoEstado ? 'Actualizando...' : 'Actualizar estado'}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {mensaje && (
                <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {mensaje}
                </div>
            )}

            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />

                        <h2 className="text-lg font-bold text-slate-900">
                            Datos del cliente
                        </h2>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Razón social
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {cotizacion.razon_social ||
                                    cotizacion.nombre_cliente ||
                                    'No registrada'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                RUC
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {cotizacion.ruc || 'No registrado'}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                                <div>
                                    <p className="text-xs font-medium uppercase text-slate-500">
                                        Dirección
                                    </p>

                                    <p className="mt-1 text-sm text-slate-800">
                                        {cotizacion.direccion ||
                                            'No registrada'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <UserRound className="mt-0.5 h-4 w-4 text-slate-400" />

                            <div>
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Contacto
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {cotizacion.contacto ||
                                        'No registrado'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Phone className="mt-0.5 h-4 w-4 text-slate-400" />

                            <div>
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Celular
                                </p>

                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {cotizacion.celular ||
                                        'No registrado'}
                                </p>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-blue-600" />

                        <h2 className="text-lg font-bold text-slate-900">
                            Información comercial
                        </h2>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Tipo de pago
                            </p>

                            <p className="mt-1 capitalize text-slate-800">
                                {cotizacion.tipo_pago ||
                                    'No registrado'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Centro de costo
                            </p>

                            <p className="mt-1 capitalize text-slate-800">
                                {cotizacion.centro_costo ||
                                    'No registrado'}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Nota
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-slate-800">
                                {cotizacion.nota || 'Sin nota'}
                            </p>
                        </div>
                    </div>
                </article>
            </div>

            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Equipos y servicios
                    </h2>

                    <p className="text-sm text-slate-500">
                        Cada equipo generará un detalle independiente dentro de la Orden de Trabajo.
                    </p>
                </div>

                {equipos.length === 0 ? (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                        La cotización no tiene equipos asociados.
                    </div>
                ) : (
                    equipos.map((equipo, index) => {
                        const servicios = Array.isArray(
                            equipo.servicios
                        )
                            ? equipo.servicios
                            : [];

                        return (
                            <article
                                key={equipo.id_equipo}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                            Equipo {index + 1}
                                        </p>

                                        <h3 className="mt-1 text-lg font-bold text-slate-900">
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

                                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                        {servicios.length}{' '}
                                        {servicios.length === 1
                                            ? 'servicio'
                                            : 'servicios'}
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Sede
                                        </p>

                                        <p className="mt-1 text-sm text-slate-800">
                                            {equipo.sede ||
                                                'No registrada'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Código interno
                                        </p>

                                        <p className="mt-1 text-sm text-slate-800">
                                            {equipo.codigo_interno ||
                                                'No registrado'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Encargado
                                        </p>

                                        <p className="mt-1 text-sm text-slate-800">
                                            {equipo.encargado_equipo ||
                                                'No registrado'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="h-4 w-4 text-blue-600" />

                                        <h4 className="font-semibold text-slate-900">
                                            Servicios cotizados
                                        </h4>
                                    </div>

                                    {servicios.length === 0 ? (
                                        <p className="mt-3 text-sm text-slate-500">
                                            No existen servicios registrados.
                                        </p>
                                    ) : (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {servicios.map(
                                                (servicio) => (
                                                    <span
                                                        key={
                                                            servicio.id_detalle ??
                                                            servicio.id_subtipo_servicio
                                                        }
                                                        className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                                                    >
                                                        {servicio.nombre_subtipo ||
                                                            'Servicio sin nombre'}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })
                )}
            </section>
        </section>
    );
};

export default CotizacionDetalle;
