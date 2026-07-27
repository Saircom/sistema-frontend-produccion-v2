import React, { useState, useEffect } from "react";
// CORRECCIÓN: Importamos la función específica del técnico
import { DashboardService } from '../../../services/dashboard.service';

// NOTA: 'idTecnicoLogueado' normalmente vendría del estado global de tu Auth/Login (p. ej., JWT o un contexto)
const DashboardPostventa = ({ idTecnicoLogueado = 1 }) => {
    const [servicios, setServicios] = useState([]);
    const [metricasTipo, setMetricasTipo] = useState({});
    const [nombreTecnico, setNombreTecnico] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                // Llamamos al nuevo método del servicio pasándole el ID del técnico
                const datos = await DashboardService.obtenerDatosTecnico(idTecnicoLogueado);

                setServicios(datos);

                // Extraemos el nombre del técnico del primer registro del JOIN si existe
                if (datos.length > 0) {
                    setNombreTecnico(datos[0].tecnicoNombre);
                }

                // Agrupamos y contamos por tipo de servicio asignado a este técnico específico
                const tipos = datos.reduce((acc, curr) => {
                    const tipo = curr.tipoServicio || "No especificado";
                    acc[tipo] = (acc[tipo] || 0) + 1;
                    return acc;
                }, {});
                setMetricasTipo(tipos);

                setError(null);
            } catch (err) {
                console.error("Error al cargar el dashboard de postventa:", err);
                setError(err.message || "No se pudieron cargar tus datos de postventa.");
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [idTecnicoLogueado]);

    // Pantalla de Carga
    if (cargando) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC]">
                <p className="text-slate-500 font-medium animate-pulse text-lg">Cargando tu agenda de postventa...</p>
            </div>
        );
    }

    // Pantalla de Error
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC] p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl max-w-md text-center shadow-sm">
                    <h3 className="font-bold text-lg mb-2">Error de Sincronización</h3>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">

            {/* Encabezado con Bienvenida Personalizada */}
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Panel Postventa: <span className="text-blue-600">{nombreTecnico || `Técnico #${idTecnicoLogueado}`}</span>
                </h1>
                <p className="text-slate-500 text-sm">Resumen de tus órdenes asignadas y estados en tiempo real.</p>
            </header>

            {/* Resumen de KPIs Individuales (Usando tus 4 estados reales) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Órdenes Totales</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                        {servicios.filter(s => s.estado !== "eliminado").length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-semibold text-green-600 uppercase">Revisados</span>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {servicios.filter(s => s.estado === "revisado").length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-semibold text-amber-500 uppercase">No Revisados</span>
                    <p className="text-2xl font-bold text-amber-500 mt-1">
                        {servicios.filter(s => s.estado === "no revisado").length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-semibold text-red-500 uppercase">Observados</span>
                    <p className="text-2xl font-bold text-red-500 mt-1">
                        {servicios.filter(s => s.estado === "observed" || s.estado === "observado").length}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Listado de Servicios asignados únicamente a este Técnico */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Mis Servicios Asignados</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 text-sm font-medium">
                                    <th className="pb-3">ID Servicio</th>
                                    <th className="pb-3">Tipo de Trabajo</th>
                                    <th className="pb-3 text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {servicios.map((s) => (
                                    <tr key={s.id_servicio} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 text-slate-500 font-mono">#{s.id_servicio}</td>
                                        <td className="py-3 font-medium text-slate-900">{s.tipoServicio}</td>
                                        <td className="py-3 text-right">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${s.estado === 'revisado' ? 'bg-green-50 text-green-700' :
                                                    s.estado === 'no revisado' ? 'bg-amber-50 text-amber-700' :
                                                        s.estado === 'observado' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {s.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {servicios.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-6 text-center text-slate-400">
                                            No tienes servicios pendientes asignados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Distribución de tipos de trabajo de este técnico */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Mis Especialidades</h2>
                    <div className="space-y-4">
                        {Object.entries(metricasTipo).map(([tipo, cantidad]) => {
                            const porcentaje = servicios.length > 0 ? ((cantidad / servicios.length) * 100).toFixed(0) : 0;
                            return (
                                <div key={tipo} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">{tipo}</span>
                                        <span className="text-slate-500 font-semibold">{cantidad} ({porcentaje}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${porcentaje}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DashboardPostventa;