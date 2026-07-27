// src/modules/Planner/pages/CotizacionesDisponibles.jsx
import { useEffect, useState } from 'react';
import { CalendarPlus, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { otService } from '../../services/ot.service.js';

const CotizacionesDisponibles = () => {
    const navigate = useNavigate();

    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const cargarCotizaciones = async () => {
        try {
            setLoading(true);
            setError('');

            const data =
                await otService.getCotizacionesDisponibles();

            setCotizaciones(data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'No se pudieron obtener las cotizaciones'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCotizaciones();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <section className="space-y-6 p-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">
                    Cotizaciones disponibles
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Cotizaciones aprobadas pendientes de programación.
                </p>
            </header>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {!error && cotizaciones.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <p className="text-slate-500">
                        No existen cotizaciones aprobadas pendientes.
                    </p>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
                {cotizaciones.map((cotizacion) => (
                    <article
                        key={cotizacion.id_cotizacion}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                    Cotización
                                </p>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {cotizacion.numero_cotizacion}
                                </h2>

                                <p className="mt-1 font-medium text-slate-700">
                                    {cotizacion.razon_social}
                                </p>

                                <p className="text-sm text-slate-500">
                                    RUC: {cotizacion.ruc}
                                </p>

                                <p className="mt-2 text-sm text-slate-600">
                                    <span className="font-semibold text-slate-700">
                                        Creado por:
                                    </span>{' '}
                                    {cotizacion.creado_por?.trim() ||
                                        'Usuario no disponible'}
                                </p>
                            </div>

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                Aprobada
                            </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">
                                    Equipos
                                </p>
                                <p className="text-lg font-bold">
                                    {cotizacion.total_equipos}
                                </p>
                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">
                                    Servicios
                                </p>
                                <p className="text-lg font-bold">
                                    {cotizacion.total_servicios}
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 line-clamp-2 text-sm text-slate-600">
                            {cotizacion.direccion}
                        </p>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/planner/cotizaciones/${cotizacion.id_cotizacion}`
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <Eye className="h-4 w-4" />
                                Ver
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/planner/programar/${cotizacion.id_cotizacion}`
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                <CalendarPlus className="h-4 w-4" />
                                Programar OT
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default CotizacionesDisponibles;
