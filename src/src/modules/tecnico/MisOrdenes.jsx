// src/modules/Tecnico/pages/MisOrdenes.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays,
    ClipboardList,
    Loader2,
    MapPin,
    RefreshCw,
    Search,
    Truck,
    UserRound
} from 'lucide-react';

import { tecnicoOTService } from './service/tecnicoOT.service.js';
import { useAuth } from '../../context/authContext.jsx';

const obtenerClaseEstado = (estado) => {
    switch (estado) {
        case 'Programada':
            return 'bg-blue-100 text-blue-700';

        case 'En Proceso':
            return 'bg-amber-100 text-amber-700';

        case 'Finalizada':
            return 'bg-green-100 text-green-700';

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

export const MisOrdenes = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODAS');

    /*
     * Mientras estás probando sin token, puedes usar:
     *
     * const idTecnico = 18;
     *
     * Cuando la sesión ya esté activa, usa el ID del usuario autenticado.
     */
    const idTecnico =
        user?.id_usuario ??
        user?.id ??
        18;

    const cargarOrdenes = async () => {
        // Log inicial para verificar cuándo se dispara la función
        console.log('Iniciando carga de órdenes para el técnico:', idTecnico);

        if (!idTecnico) {
            console.warn('Falta el ID del técnico');
            setError(
                'No se pudo identificar al técnico autenticado'
            );
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const data = await tecnicoOTService.getMisOrdenes(idTecnico);

            // Log para ver la estructura de los datos recibidos
            console.log('Datos recibidos del servicio:', data);

            setOrdenes(
                Array.isArray(data)
                    ? data.filter(orden => orden.estado !== 'Finalizada')
                    : []
            );
        } catch (error) {
            // Log detallado del error
            console.error('Error al obtener órdenes del técnico:', error);

            setError(
                error.response?.data?.message ||
                error.message ||
                'No se pudieron obtener las órdenes asignadas'
            );
        } finally {
            // Log de finalización
            console.log('Finalizado el proceso de carga de órdenes');
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarOrdenes();
    }, [idTecnico]);

    const ordenesFiltradas = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();

        return ordenes.filter((orden) => {
            const coincideEstado =
                filtroEstado === 'TODAS' ||
                orden.estado === filtroEstado;

            const coincideBusqueda =
                !texto ||
                String(orden.id_ot)
                    .toLowerCase()
                    .includes(texto) ||
                String(
                    orden.numero_cotizacion ?? ''
                )
                    .toLowerCase()
                    .includes(texto) ||
                String(
                    orden.razon_social ?? ''
                )
                    .toLowerCase()
                    .includes(texto) ||
                String(orden.ruc ?? '')
                    .toLowerCase()
                    .includes(texto);

            return coincideEstado && coincideBusqueda;
        });
    }, [ordenes, busqueda, filtroEstado]);

    if (loading) {
        return (
            <div className="flex min-h-72 items-center justify-center">
                <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <section className="space-y-6 p-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        Técnico
                    </p>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Mis Órdenes de Trabajo
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Órdenes asignadas para su ejecución.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={cargarOrdenes}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Actualizar
                </button>
            </header>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
                <label className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                        type="text"
                        value={busqueda}
                        onChange={(event) =>
                            setBusqueda(event.target.value)
                        }
                        placeholder="Buscar por OT, cotización, cliente o RUC"
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </label>

                <select
                    value={filtroEstado}
                    onChange={(event) =>
                        setFiltroEstado(event.target.value)
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                    <option value="TODAS">
                        Todos los estados
                    </option>
                    <option value="Programada">
                        Programadas
                    </option>
                    <option value="En Proceso">
                        En proceso
                    </option>
                </select>
            </div>

            {!error && ordenesFiltradas.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />

                    <h2 className="mt-4 text-lg font-semibold text-slate-700">
                        No hay órdenes asignadas
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        No se encontraron órdenes con los filtros seleccionados.
                    </p>
                </div>
            )}

            <div className="grid gap-5">
                {ordenesFiltradas.map((orden) => {
                    const totalEquipos =
                        Number(orden.total_equipos) || 0;

                    const equiposFinalizados =
                        Number(
                            orden.equipos_finalizados
                        ) || 0;

                    const progreso =
                        totalEquipos > 0
                            ? Math.round(
                                (equiposFinalizados /
                                    totalEquipos) *
                                100
                            )
                            : 0;

                    return (
                        <article
                            key={orden.id_ot}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                        Orden de Trabajo
                                    </p>

                                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                        OT N.° {orden.id_ot}
                                    </h2>

                                    <p className="mt-2 font-semibold text-slate-800">
                                        {orden.razon_social ||
                                            'Cliente no registrado'}
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        Cotización{' '}
                                        {orden.numero_cotizacion ||
                                            'No registrada'}
                                    </p>
                                </div>

                                <span
                                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${obtenerClaseEstado(
                                        orden.estado
                                    )}`}
                                >
                                    {orden.estado}
                                </span>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="flex items-start gap-3">
                                    <CalendarDays className="mt-0.5 h-5 w-5 text-slate-400" />

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Programación
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                            {formatearFecha(
                                                orden.fecha_programada
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 text-slate-400" />

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Dirección
                                        </p>

                                        <p className="mt-1 line-clamp-2 text-sm text-slate-800">
                                            {orden.direccion ||
                                                'No registrada'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Truck className="mt-0.5 h-5 w-5 text-slate-400" />

                                    <div>
                                        <p className="text-xs font-medium uppercase text-slate-500">
                                            Movilidad
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                            {orden.placa_movilidad ||
                                                'No asignada'}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {orden.marca_movilidad ||
                                                ''}{' '}
                                            {orden.modelo_movilidad ||
                                                ''}
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

                            <div className="mt-5 rounded-lg bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Avance de equipos
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {equiposFinalizados} de{' '}
                                            {totalEquipos} finalizados
                                        </p>
                                    </div>

                                    <span className="text-sm font-bold text-blue-600">
                                        {progreso}%
                                    </span>
                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-blue-600 transition-all"
                                        style={{
                                            width: `${progreso}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(`/tecnico/ordenes/${orden.id_ot}`)
                                    }
                                >
                                    Abrir orden
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default MisOrdenes;
