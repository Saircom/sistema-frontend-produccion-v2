// src/modules/Planner/pages/DetalleOrdenTrabajo.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    CalendarDays,
    ClipboardList,
    Eye,
    Loader2,
    MapPin,
    Pencil,
    Phone,
    Save,
    Truck,
    UserRound,
    WalletCards,
    Wrench,
    X
} from 'lucide-react';

import { otService } from '../../services/ot.service.js';
import { useAuth } from '../../context/authContext.jsx';
import { UsuarioService } from '../../services/user.service.js';
import { movilidadService } from '../../services/movilidad.service.js';
import { isSuperAdmin } from '../../utils/permissions.js';

const ESTADOS_OT = ['Programada', 'En Proceso', 'Finalizada'];

const obtenerEstadoClase = (estado) => {
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

        default:
            return 'bg-slate-100 text-slate-700';
    }
};

const formatearFecha = (fecha) => {
    if (!fecha) {
        return 'No registrada';
    }

    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(fecha));
};

const fechaParaInput = fecha => {
    if (!fecha) return '';
    const valor = new Date(fecha);
    const local = new Date(valor.getTime() - valor.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const obtenerArray = respuesta => Array.isArray(respuesta)
    ? respuesta
    : (respuesta?.data?.data ?? respuesta?.data ?? []);

export const DetalleOrdenTrabajo = () => {
    const { idOt } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('Programada');
    const [actualizandoEstado, setActualizandoEstado] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [editandoProgramacion, setEditandoProgramacion] = useState(false);
    const [guardandoProgramacion, setGuardandoProgramacion] = useState(false);
    const [tecnicos, setTecnicos] = useState([]);
    const [movilidades, setMovilidades] = useState([]);
    const [programacion, setProgramacion] = useState({
        idTecnicoResponsable: '', idsTecnicosApoyo: [], idMovilidad: '',
        fechaProgramada: '', fechaFinProgramada: ''
    });

    const puedeActualizarEstado = ['ADMINISTRADOR', 'PLANNER', 'SUPERADMINISTRADOR'].includes(
        String(user?.rol ?? '').trim().toUpperCase()
    );
    const puedeEditarProgramacion = isSuperAdmin(user) && orden?.estado === 'Programada';

    const abrirEdicionProgramacion = async () => {
        try {
            setError('');
            const [respuestaTecnicos, respuestaMovilidades] = await Promise.all([
                UsuarioService.getTecnicos(),
                movilidadService.getAll()
            ]);
            setTecnicos(obtenerArray(respuestaTecnicos).filter(item => Number(item.estado) === 1));
            setMovilidades(obtenerArray(respuestaMovilidades).filter(item => item.estado_disponibilidad !== 'En mantenimiento'));
            setProgramacion({
                idTecnicoResponsable: String(orden.id_tecnico_responsable),
                idsTecnicosApoyo: (orden.tecnicos_adicionales || []).map(item => Number(item.id_usuario)),
                idMovilidad: orden.id_movilidad ? String(orden.id_movilidad) : '',
                fechaProgramada: fechaParaInput(orden.fecha_programada),
                fechaFinProgramada: fechaParaInput(orden.fecha_fin_programada)
            });
            setEditandoProgramacion(true);
        } catch (err) {
            setError(err?.response?.data?.message || 'No se pudieron cargar los datos para editar la OT');
        }
    };

    const guardarProgramacion = async event => {
        event.preventDefault();
        try {
            setGuardandoProgramacion(true);
            setError('');
            const actualizada = await otService.actualizarProgramacion(orden.id_ot, {
                idTecnicoResponsable: Number(programacion.idTecnicoResponsable),
                idsTecnicosApoyo: programacion.idsTecnicosApoyo.map(Number),
                idMovilidad: programacion.idMovilidad ? Number(programacion.idMovilidad) : null,
                fechaProgramada: programacion.fechaProgramada,
                fechaFinProgramada: programacion.fechaFinProgramada
            });
            setOrden(actualizada);
            setEditandoProgramacion(false);
            setMensaje('Programación de la OT corregida correctamente.');
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'No se pudo actualizar la programación');
        } finally {
            setGuardandoProgramacion(false);
        }
    };

    useEffect(() => {
        const cargarOrden = async () => {
            console.log('Iniciando carga de orden para ID:', idOt); // Log de inicio

            if (!idOt) {
                console.warn('ID de orden no proporcionado'); // Log de advertencia
                setError(
                    'No se recibió el ID de la Orden de Trabajo'
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                const respuesta = await otService.getOrdenById(idOt);
                console.log('Respuesta cruda de la API:', respuesta); // Log de inspección de datos

                const ordenNormalizada =
                    respuesta?.data?.data ??
                    respuesta?.data ??
                    respuesta ??
                    null;

                console.log('Orden normalizada:', ordenNormalizada); // Log tras normalización

                if (!ordenNormalizada?.id_ot) {
                    throw new Error(
                        'La API no devolvió una Orden de Trabajo válida'
                    );
                }

                setOrden(ordenNormalizada);
                setNuevoEstado(ordenNormalizada.estado || 'Programada');
            } catch (error) {
                console.error('Error capturado en cargarOrden:', error); // Log de error detallado

                setOrden(null);

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'No se pudo obtener la Orden de Trabajo'
                );
            } finally {
                console.log('Finalizado intento de carga.'); // Log de fin
                setLoading(false);
            }
        };

        cargarOrden();
    }, [idOt]);

    const actualizarEstado = async () => {
        if (!puedeActualizarEstado || !orden?.id_ot) return;

        try {
            setActualizandoEstado(true);
            setError('');
            setMensaje('');

            const resultado = await otService.actualizarEstado(
                orden.id_ot,
                nuevoEstado
            );

            const estadoActualizado = resultado?.estado || nuevoEstado;
            setOrden(anterior => ({ ...anterior, estado: estadoActualizado }));
            setNuevoEstado(estadoActualizado);
            setMensaje('Estado de la Orden de Trabajo actualizado correctamente.');
        } catch (error) {
            setError(
                error?.response?.data?.message
                || error?.message
                || 'No se pudo actualizar el estado de la Orden de Trabajo'
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

    if (!orden) {
        return (
            <section className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <h1 className="text-lg font-bold text-red-800">
                        No se pudo cargar la Orden de Trabajo
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/planner/ordenes')
                        }
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a órdenes
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
            <button
                type="button"
                onClick={() => navigate('/planner/ordenes')}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver a órdenes
            </button>

            <button
                type="button"
                onClick={() => navigate(`/ordenes/${orden.id_ot}/viaticos`)}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
                <WalletCards className="h-4 w-4" />
                Ver gastos de la OT
            </button>

            <header className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        Orden de Trabajo
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                        OT N.° {orden.id_ot}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Cotización {orden.numero_cotizacion}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${obtenerEstadoClase(
                            orden.estado
                        )}`}
                    >
                        {orden.estado}
                    </span>

                    {puedeActualizarEstado && (
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <label htmlFor="estado-ot" className="sr-only">
                                Nuevo estado de la Orden de Trabajo
                            </label>
                            <select
                                id="estado-ot"
                                value={nuevoEstado}
                                onChange={(event) => setNuevoEstado(event.target.value)}
                                disabled={actualizandoEstado}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:opacity-60"
                            >
                                {ESTADOS_OT.map(estado => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={actualizarEstado}
                                disabled={actualizandoEstado || nuevoEstado === orden.estado}
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

            {puedeEditarProgramacion && !editandoProgramacion && (
                <div className="flex justify-end">
                    <button type="button" onClick={abrirEdicionProgramacion} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
                        <Pencil className="h-4 w-4" /> Corregir programación
                    </button>
                </div>
            )}

            {editandoProgramacion && (
                <form onSubmit={guardarProgramacion} className="rounded-xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div><h2 className="font-bold text-violet-950">Corregir OT programada</h2><p className="text-sm text-violet-700">Solo el Superadministrador puede cambiar responsables, movilidad y fechas.</p></div>
                        <button type="button" onClick={() => setEditandoProgramacion(false)} className="rounded-lg p-2 text-violet-700 hover:bg-violet-100"><X className="h-5 w-5" /></button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-semibold text-slate-700">Técnico responsable
                            <select required value={programacion.idTecnicoResponsable} onChange={e => setProgramacion(p => ({ ...p, idTecnicoResponsable: e.target.value, idsTecnicosApoyo: p.idsTecnicosApoyo.filter(id => String(id) !== e.target.value) }))} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5">
                                <option value="">Seleccione</option>{tecnicos.map(t => <option key={t.id_usuario} value={t.id_usuario}>{t.nombres} {t.apellidos}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-semibold text-slate-700">Movilidad
                            <select value={programacion.idMovilidad} onChange={e => setProgramacion(p => ({ ...p, idMovilidad: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5">
                                <option value="">Sin movilidad</option>{movilidades.map(m => <option key={m.id_movilidad} value={m.id_movilidad}>{m.placa} - {m.marca} {m.modelo}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-semibold text-slate-700">Inicio programado<input required type="datetime-local" value={programacion.fechaProgramada} onChange={e => setProgramacion(p => ({ ...p, fechaProgramada: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5" /></label>
                        <label className="text-sm font-semibold text-slate-700">Fin programado<input required type="datetime-local" min={programacion.fechaProgramada || undefined} value={programacion.fechaFinProgramada} onChange={e => setProgramacion(p => ({ ...p, fechaFinProgramada: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5" /></label>
                    </div>
                    <fieldset className="mt-4"><legend className="text-sm font-semibold text-slate-700">Técnicos de apoyo</legend><div className="mt-2 flex flex-wrap gap-2">{tecnicos.filter(t => String(t.id_usuario) !== String(programacion.idTecnicoResponsable)).map(t => { const activo = programacion.idsTecnicosApoyo.includes(Number(t.id_usuario)); return <button key={t.id_usuario} type="button" onClick={() => setProgramacion(p => ({ ...p, idsTecnicosApoyo: activo ? p.idsTecnicosApoyo.filter(id => id !== Number(t.id_usuario)) : [...p.idsTecnicosApoyo, Number(t.id_usuario)] }))} className={`rounded-full border px-3 py-1.5 text-sm ${activo ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{t.nombres} {t.apellidos}</button>; })}</div></fieldset>
                    <div className="mt-5 flex justify-end"><button disabled={guardandoProgramacion} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />{guardandoProgramacion ? 'Guardando...' : 'Guardar corrección'}</button></div>
                </form>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-blue-600" />

                        <h2 className="text-lg font-bold text-slate-900">
                            Información general
                        </h2>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Cliente
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {orden.razon_social ||
                                    'No registrado'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                RUC
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {orden.ruc || 'No registrado'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Tipo de pago
                            </p>

                            <p className="mt-1 capitalize text-slate-800">
                                {orden.tipo_pago ||
                                    'No registrado'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Centro de costo
                            </p>

                            <p className="mt-1 capitalize text-slate-800">
                                {orden.centro_costo ||
                                    'No registrado'}
                            </p>
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Nota
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-slate-800">
                                {orden.nota || 'Sin nota'}
                            </p>
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
                                    Fecha y hora programada
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {formatearFecha(
                                        orden.fecha_programada
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <UserRound className="mt-0.5 h-5 w-5 text-slate-400" />

                            <div>
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Técnico responsable
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {orden.tecnico_responsable ||
                                        'No asignado'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <UserRound className="mt-0.5 h-5 w-5 text-slate-400" />
                            <div>
                                <p className="text-xs font-medium uppercase text-slate-500">Técnicos de apoyo</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(orden.tecnicos_adicionales || []).length > 0 ? orden.tecnicos_adicionales.map(tecnico => (
                                        <span key={tecnico.id_asignacion || tecnico.id_usuario} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                            {tecnico.nombres} {tecnico.apellidos}
                                        </span>
                                    )) : <span className="text-sm text-slate-500">Sin técnicos de apoyo</span>}
                                </div>
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

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                    Datos del cliente
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-slate-400" />

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

                            <p className="mt-1 text-sm font-medium text-slate-800">
                                {orden.contacto ||
                                    'No registrado'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Phone className="mt-0.5 h-5 w-5 text-slate-400" />

                        <div>
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Celular
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-800">
                                {orden.celular ||
                                    'No registrado'}
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Equipos incluidos
                    </h2>

                    <p className="text-sm text-slate-500">
                        Cada equipo tendrá su propio informe técnico.
                    </p>
                </div>

                {equipos.length === 0 ? (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                        Esta Orden de Trabajo no tiene equipos asociados.
                    </div>
                ) : (
                    equipos.map((equipo, index) => {
                        const servicios = Array.isArray(
                            equipo.servicios
                        )
                            ? equipo.servicios
                            : [];

                        const requiereInforme = servicios.some(
                            (servicio) =>
                                String(servicio.codigo_tipo_servicio || '')
                                    .trim()
                                    .toUpperCase() !== 'ACTIVIDAD_DE_APOYO'
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

                                    <div className="flex flex-col items-end gap-2">
                                        <span
                                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${obtenerEstadoClase(
                                                equipo.estado_equipo
                                            )}`}
                                        >
                                            {equipo.estado_equipo}
                                        </span>

                                        {puedeActualizarEstado && !requiereInforme ? (
                                            <span className="text-xs font-medium text-emerald-600">
                                                No requiere informe técnico
                                            </span>
                                        ) : puedeActualizarEstado && equipo.id_informe ? (
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/tecnico/informes/${equipo.id_informe}`)}
                                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Ver informe
                                            </button>
                                        ) : puedeActualizarEstado ? (
                                            <span className="text-xs font-medium text-slate-400">
                                                Informe aún no disponible
                                            </span>
                                        ) : null}
                                    </div>
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
                                            Servicios asignados
                                        </h4>
                                    </div>

                                    {servicios.length === 0 ? (
                                        <p className="mt-3 text-sm text-slate-500">
                                            No hay servicios registrados.
                                        </p>
                                    ) : (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {servicios.map(
                                                (servicio) => (
                                                    <span
                                                        key={
                                                            servicio.id_ot_detalle_servicio
                                                        }
                                                        className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                                                    >
                                                        {servicio.nombre_subtipo}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                                    <h4 className="font-semibold text-slate-900">
                                        Tiempos del técnico
                                    </h4>

                                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs uppercase text-slate-500">
                                                Llegada
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                {formatearFecha(
                                                    equipo.tiempos
                                                        ?.fecha_hora_llegada
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase text-slate-500">
                                                Inicio
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                {formatearFecha(
                                                    equipo.tiempos
                                                        ?.fecha_hora_inicio
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase text-slate-500">
                                                Fin
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                {formatearFecha(
                                                    equipo.tiempos
                                                        ?.fecha_hora_fin
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
            </section>
        </section>
    );
};

export default DetalleOrdenTrabajo;
