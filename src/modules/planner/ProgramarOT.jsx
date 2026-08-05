// src/modules/Planner/pages/ProgramarOT.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    ArrowLeft,
    CalendarClock,
    Loader2,
    Save,
    Truck,
    UserRound
} from 'lucide-react';

import { otService } from '../../services/ot.service.js';
import { UsuarioService } from '../../services/user.service.js';
import { movilidadService } from '../../services/movilidad.service.js';

const obtenerArray = (respuesta) => {
    if (Array.isArray(respuesta)) {
        return respuesta;
    }

    if (Array.isArray(respuesta?.data)) {
        return respuesta.data;
    }

    if (Array.isArray(respuesta?.data?.data)) {
        return respuesta.data.data;
    }

    return [];
};

const obtenerObjeto = (respuesta) => {
    return (
        respuesta?.data?.data ??
        respuesta?.data ??
        respuesta ??
        null
    );
};

const esTecnicoActivo = usuario => (
    String(usuario?.nombre_rol ?? usuario?.rol ?? '').trim().toUpperCase() === 'TECNICO'
    && Number(usuario?.estado) === 1
);

const ProgramarOT = () => {
    const { idCotizacion } = useParams();
    const navigate = useNavigate();

    const [cotizacion, setCotizacion] = useState(null);
    const [tecnicos, setTecnicos] = useState([]);
    const [movilidades, setMovilidades] = useState([]);

    const [form, setForm] = useState({
        idTecnicoResponsable: '',
        idsTecnicosApoyo: [],
        idMovilidad: '',
        fechaProgramada: '',
        fechaFinProgramada: ''
    });

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
            if (!idCotizacion) {
                setError('No se recibió el ID de la cotización');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                const [
                    cotizacionRespuesta,
                    tecnicosRespuesta,
                    movilidadesRespuesta
                ] = await Promise.all([
                    otService.getCotizacionById(idCotizacion),
                    UsuarioService.getTecnicos(),
                    movilidadService.getAll()
                ]);

                console.log('ID recibido:', idCotizacion);
                console.log('Cotización:', cotizacionRespuesta);
                console.log('Técnicos:', tecnicosRespuesta);
                console.log('Movilidades:', movilidadesRespuesta);

                const cotizacionNormalizada =
                    obtenerObjeto(cotizacionRespuesta);

                if (!cotizacionNormalizada?.id_cotizacion) {
                    throw new Error(
                        'La API no devolvió una cotización válida'
                    );
                }

                const listaTecnicos =
                    obtenerArray(tecnicosRespuesta);

                const listaMovilidades =
                    obtenerArray(movilidadesRespuesta);

                setCotizacion(cotizacionNormalizada);
                setTecnicos(listaTecnicos.filter(esTecnicoActivo));

                setMovilidades(
                    listaMovilidades.filter(
                        (movilidad) =>
                            movilidad.estado_disponibilidad !==
                            'En mantenimiento'
                    )
                );
            } catch (error) {
                console.error(
                    'Error al cargar ProgramarOT:',
                    error
                );

                setCotizacion(null);

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    'No se pudieron cargar los datos'
                );
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [idCotizacion]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'idTecnicoResponsable'
                ? { idsTecnicosApoyo: prev.idsTecnicosApoyo.filter(id => String(id) !== String(value)) }
                : {})
        }));
    };

    const alternarTecnicoApoyo = (idUsuario) => {
        setForm(prev => ({
            ...prev,
            idsTecnicosApoyo: prev.idsTecnicosApoyo.includes(idUsuario)
                ? prev.idsTecnicosApoyo.filter(id => id !== idUsuario)
                : [...prev.idsTecnicosApoyo, idUsuario]
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !form.idTecnicoResponsable ||
            !form.fechaProgramada ||
            !form.fechaFinProgramada
        ) {
            setError(
                'Seleccione el técnico y las fechas programadas'
            );
            return;
        }

        try {
            setGuardando(true);
            setError('');

            const respuesta = await otService.crearOrden({
                idCotizacion: Number(idCotizacion),
                idTecnicoResponsable: Number(
                    form.idTecnicoResponsable
                ),
                idsTecnicosApoyo: form.idsTecnicosApoyo.map(Number),
                idMovilidad: form.idMovilidad ? Number(form.idMovilidad) : null,
                fechaProgramada: form.fechaProgramada,
                fechaFinProgramada: form.fechaFinProgramada
            });

            const idOt =
                respuesta?.data?.id_ot ??
                respuesta?.id_ot;

            if (!idOt) {
                throw new Error(
                    'La orden se creó, pero no se recibió el ID'
                );
            }

            await Swal.fire({
                icon: 'success',
                title: 'Orden de trabajo creada correctamente',
                text: `Se generó la OT N.° ${idOt}.`,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2563eb',
                allowOutsideClick: false
            });

            navigate('/planner/ordenes');

        } catch (error) {
            const mensajeError =
                error.response?.data?.message ||
                error.message ||
                'No se pudo crear la Orden de Trabajo';

            console.error('Error al crear Orden de Trabajo:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            setError(mensajeError);

            await Swal.fire({
                icon: 'error',
                title: 'No se pudo crear la OT',
                text: mensajeError,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!cotizacion) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <h2 className="font-semibold text-red-800">
                        No se pudo cargar la cotización
                    </h2>

                    <p className="mt-1 text-sm text-red-700">
                        {error ||
                            'No se encontró la cotización solicitada.'}
                    </p>

                    <p className="mt-2 text-xs text-red-600">
                        ID recibido: {idCotizacion || 'ninguno'}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/planner/cotizaciones')
                        }
                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    const equipos = Array.isArray(cotizacion.equipos)
        ? cotizacion.equipos
        : [];

    return (
        <section className="space-y-6 p-6">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="h-4 w-4" />
                Regresar
            </button>

            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Programar Orden de Trabajo
                </h1>

                <p className="text-sm text-slate-500">
                    Cotización {cotizacion.numero_cotizacion}
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <div className="space-y-4">
                    <article className="rounded-xl border border-slate-200 bg-white p-5">
                        <h2 className="font-semibold text-slate-900">
                            Datos del cliente
                        </h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Razón social
                                </p>
                                <p className="font-medium">
                                    {cotizacion.razon_social ||
                                        'No registrado'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    RUC
                                </p>
                                <p className="font-medium">
                                    {cotizacion.ruc || 'No registrado'}
                                </p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-xs text-slate-500">
                                    Dirección
                                </p>
                                <p className="font-medium">
                                    {cotizacion.direccion ||
                                        'No registrada'}
                                </p>
                            </div>
                        </div>
                    </article>

                    {equipos.length === 0 ? (
                        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800">
                            La cotización no tiene equipos registrados.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {equipos.map((equipo) => {
                                const servicios =
                                    Array.isArray(equipo.servicios)
                                        ? equipo.servicios
                                        : [];

                                return (
                                    <article
                                        key={equipo.id_equipo ?? 'sin-equipo'}
                                        className="rounded-xl border border-slate-200 bg-white p-5"
                                    >
                                        <div className="flex flex-wrap justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase text-blue-600">
                                                    {equipo.sin_equipo ? 'Servicio' : 'Equipo'}
                                                </p>

                                                <h3 className="font-bold text-slate-900">
                                                    {equipo.sin_equipo ? 'Sin equipo asociado' : equipo.tipo_equipo}
                                                </h3>

                                                <p className="text-sm text-slate-500">
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

                                            <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                {servicios.length}{' '}
                                                {servicios.length === 1
                                                    ? 'servicio'
                                                    : 'servicios'}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {servicios.map(
                                                (servicio) => (
                                                    <span
                                                        key={
                                                            servicio.id_detalle ??
                                                            servicio.id_subtipo_servicio
                                                        }
                                                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                                    >
                                                        {servicio.nombre_subtipo}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <h2 className="text-lg font-bold text-slate-900">
                        Programación
                    </h2>

                    <div className="mt-5 space-y-5">
                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <UserRound className="h-4 w-4" />
                                Técnico responsable
                            </span>

                            <select
                                name="idTecnicoResponsable"
                                value={form.idTecnicoResponsable}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                required
                            >
                                <option value="">
                                    Seleccione un técnico
                                </option>

                                {tecnicos.map((tecnico) => (
                                    <option
                                        key={tecnico.id_usuario}
                                        value={tecnico.id_usuario}
                                    >
                                        {tecnico.nombres}{' '}
                                        {tecnico.apellidos}
                                    </option>
                                ))}
                            </select>

                            {tecnicos.length === 0 && (
                                <p className="mt-1 text-xs text-red-600">
                                    No se encontraron técnicos disponibles.
                                </p>
                            )}
                        </label>

                        <fieldset className="rounded-xl border border-slate-200 p-4">
                            <legend className="px-2 text-sm font-semibold text-slate-700">
                                Técnicos de apoyo (opcional)
                            </legend>
                            <p className="mb-3 text-xs text-slate-500">
                                Acompañan la OT, pero el informe lo realiza únicamente el técnico líder.
                            </p>
                            <div className="max-h-48 space-y-2 overflow-y-auto">
                                {tecnicos
                                    .filter(tecnico => String(tecnico.id_usuario) !== String(form.idTecnicoResponsable))
                                    .map(tecnico => (
                                        <label key={tecnico.id_usuario} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50">
                                            <input
                                                type="checkbox"
                                                checked={form.idsTecnicosApoyo.includes(tecnico.id_usuario)}
                                                onChange={() => alternarTecnicoApoyo(tecnico.id_usuario)}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-700">{tecnico.nombres} {tecnico.apellidos}</span>
                                        </label>
                                    ))}
                            </div>
                        </fieldset>

                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Truck className="h-4 w-4" />
                                Movilidad
                            </span>

                            <select
                                name="idMovilidad"
                                value={form.idMovilidad}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    Sin movilidad
                                </option>

                                {movilidades.map((movilidad) => (
                                    <option
                                        key={movilidad.id_movilidad}
                                        value={movilidad.id_movilidad}
                                    >
                                        {movilidad.placa} ·{' '}
                                        {movilidad.marca}{' '}
                                        {movilidad.modelo}
                                        {movilidad.estado_disponibilidad === 'En uso'
                                            ? ' · Con otras OT programadas'
                                            : ''}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-1 text-xs text-slate-500">
                                Seleccione “Sin movilidad” cuando el servicio no requiera un vehículo.
                            </p>
                        </label>

                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <CalendarClock className="h-4 w-4" />
                                Fecha y hora programada
                            </span>

                            <input
                                type="datetime-local"
                                name="fechaProgramada"
                                value={form.fechaProgramada}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <CalendarClock className="h-4 w-4" />
                                Fecha y hora de finalizaciÃ³n
                            </span>

                            <input
                                type="datetime-local"
                                name="fechaFinProgramada"
                                value={form.fechaFinProgramada}
                                min={form.fechaProgramada || undefined}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={
                                guardando ||
                                tecnicos.length === 0 ||
                                movilidades.length === 0
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {guardando ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Generar Orden de Trabajo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default ProgramarOT;
