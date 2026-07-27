// src/modules/Planner/pages/OrdenesTrabajo.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye,
    Loader2,
    ClipboardList,
    CalendarDays,
    UserRound,
    Truck
} from "lucide-react";

import { otService } from "../../services/ot.service.js";

const estadoColor = (estado) => {
    switch (estado) {
        case "Programada":
            return "bg-blue-100 text-blue-700";

        case "En Proceso":
            return "bg-yellow-100 text-yellow-700";

        case "Finalizada":
            return "bg-green-100 text-green-700";

        default:
            return "bg-slate-100 text-slate-700";
    }
};

const OrdenesTrabajo = () => {
    const navigate = useNavigate();

    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const cargarOrdenes = async () => {
        try {
            setLoading(true);

            const response = await otService.getOrdenes();

            const data =
                response?.data?.data ??
                response?.data ??
                response ??
                [];

            setOrdenes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "No se pudieron obtener las órdenes."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarOrdenes();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <section className="space-y-6 p-6">

            <header className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Órdenes de Trabajo
                    </h1>

                    <p className="text-slate-500">
                        Órdenes creadas desde las cotizaciones aprobadas.
                    </p>

                </div>

            </header>

            {error && (

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>

            )}

            {!loading && ordenes.length === 0 && (

                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">

                    <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />

                    <h2 className="mt-4 text-lg font-semibold text-slate-700">
                        No existen Órdenes de Trabajo
                    </h2>

                </div>

            )}

            <div className="grid gap-5">

                {ordenes.map((orden) => (

                    <article
                        key={orden.id_ot}
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                    >

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-xs uppercase text-blue-600 font-semibold">
                                    Orden de Trabajo
                                </p>

                                <h2 className="text-2xl font-bold">
                                    OT-{orden.id_ot}
                                </h2>

                                <p className="mt-1 text-slate-700 font-medium">
                                    {orden.razon_social}
                                </p>

                                <p className="text-sm text-slate-500">
                                    Cotización {orden.numero_cotizacion}
                                </p>

                            </div>

                            <span
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${estadoColor(
                                    orden.estado
                                )}`}
                            >
                                {orden.estado}
                            </span>

                        </div>

                        <div className="mt-6 grid md:grid-cols-4 gap-5">

                            <div className="flex items-center gap-3">

                                <UserRound className="text-slate-400 h-5 w-5" />

                                <div>

                                    <p className="text-xs uppercase text-slate-500">
                                        Técnico
                                    </p>

                                    <p className="font-medium">
                                        {orden.tecnico_responsable}
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-3">

                                <Truck className="text-slate-400 h-5 w-5" />

                                <div>

                                    <p className="text-xs uppercase text-slate-500">
                                        Movilidad
                                    </p>

                                    <p className="font-medium">
                                        {orden.placa_movilidad}
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-3">

                                <CalendarDays className="text-slate-400 h-5 w-5" />

                                <div>

                                    <p className="text-xs uppercase text-slate-500">
                                        Fecha
                                    </p>

                                    <p className="font-medium">
                                        {new Date(
                                            orden.fecha_programada
                                        ).toLocaleString("es-PE")}
                                    </p>

                                </div>

                            </div>

                            <div>

                                <p className="text-xs uppercase text-slate-500">
                                    Equipos
                                </p>

                                <p className="text-2xl font-bold text-blue-600">
                                    {orden.total_equipos}
                                </p>

                            </div>

                        </div>

                        <div className="mt-6 flex justify-end">

                            <button
                                onClick={() =>
                                    navigate(
                                        `/planner/ordenes/${orden.id_ot}`
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
                            >
                                <Eye className="h-4 w-4" />
                                Ver Detalle
                            </button>

                        </div>

                    </article>

                ))}

            </div>

        </section>
    );
};

export default OrdenesTrabajo;