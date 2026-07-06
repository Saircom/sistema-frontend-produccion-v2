import React, { useState, useEffect } from "react";
import { DashboardService } from '../../../services/dashboard.service';

const DashboardAdministrador = () => {
    const [servicios, setServicios] = useState([]);
    const [metricasTipo, setMetricasTipo] = useState({});
    const [productividadTecnicos, setProductividadTecnicos] = useState({});
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const obtenerDatosDeApi = async () => {
            try {
                setCargando(true);
                const datosApi = await DashboardService.obtenerDatosDashboard();
                setServicios(datosApi);
                procesarDatos(datosApi);
                setError(null);
            } catch (err) {
                console.error("Error al cargar el dashboard:", err);
                setError(err.message || "No se pudo conectar con el servidor.");
            } finally {
                setCargando(false);
            }
        };
        obtenerDatosDeApi();
    }, []);

    const procesarDatos = (datos) => {
        // 1. Contar por tipo de servicio
        const tipos = datos.reduce((acc, curr) => {
            const tipo = curr.tipoServicio || "No especificado";
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});
        setMetricasTipo(tipos);

        // 2. Procesar productividad usando ID como llave única para evitar duplicados
        const tecnicos = datos.reduce((acc, curr) => {
            // Creamos una lista de objetos { id, nombre }
            const lista = [];
            if (curr.id_usuario_lider) lista.push({ id: curr.id_usuario_lider, nombre: curr.tecnicoLider });
            
            if (curr.idsApoyo && curr.tecnicosApoyo) {
                const ids = String(curr.idsApoyo).split(',');
                const nombres = String(curr.tecnicosApoyo).split(',');
                ids.forEach((id, index) => {
                    if (id.trim()) lista.push({ id: id.trim(), nombre: nombres[index].trim() });
                });
            }

            // Si no hay ninguno, lo marcamos como "Sin asignar"
            const participantes = lista.length > 0 ? lista : [{ id: 'sin-asignar', nombre: 'Sin asignar' }];

            participantes.forEach(({ id, nombre }) => {
                if (!acc[id]) {
                    acc[id] = { nombre: nombre, total: 0, noRevisado: 0, revisado: 0, observado: 0, eliminado: 0 };
                }

                acc[id].total += 1;
                if (curr.estado === "no revisado") acc[id].noRevisado += 1;
                else if (curr.estado === "revisado") acc[id].revisado += 1;
                else if (curr.estado === "observado") acc[id].observado += 1;
                else if (curr.estado === "eliminado") acc[id].eliminado += 1;
            });

            return acc;
        }, {});

        setProductividadTecnicos(tecnicos);
    };

    if (cargando) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC]">
                <p className="text-slate-500 font-medium animate-pulse text-lg">Cargando métricas en tiempo real...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC] p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl max-w-md text-center shadow-sm">
                    <h3 className="font-bold text-lg mb-2">¡Oops! Algo salió mal</h3>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                        Reintentar conexión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard Operativo</h1>
                <p className="text-slate-500 text-sm">Monitoreo basado en los estados oficiales del sistema.</p>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Total Activos</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{servicios.filter(s => s.estado !== "eliminado").length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-semibold text-green-600 uppercase">Revisados</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{servicios.filter(s => s.estado === "revisado").length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-semibold text-amber-500 uppercase">No Revisados</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{servicios.filter(s => s.estado === "no revisado").length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <span className="text-xs font-semibold text-red-500 uppercase">Observados</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{servicios.filter(s => s.estado === "observado").length}</p>
                </div>
            </div>

            {/* Tabla y Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Rendimiento por Técnico</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 text-sm font-medium">
                                    <th className="pb-3">Técnico</th>
                                    <th className="pb-3 text-center">Asignados</th>
                                    <th className="pb-3 text-center text-green-600">Revisados</th>
                                    <th className="pb-3 text-center text-amber-600">No Rev.</th>
                                    <th className="pb-3 text-center text-red-500">Observ.</th>
                                    <th className="pb-3 text-right">Efectividad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {Object.entries(productividadTecnicos).map(([id, datos]) => {
                                    const totalValidos = datos.total - datos.eliminado;
                                    const efectividad = totalValidos > 0 ? ((datos.revisado / totalValidos) * 100).toFixed(0) : 0;
                                    return (
                                        <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 font-medium text-slate-900">{datos.nombre}</td>
                                            <td className="py-3 text-center text-slate-600">{datos.total}</td>
                                            <td className="py-3 text-center text-green-600 font-semibold">{datos.revisado}</td>
                                            <td className="py-3 text-center text-amber-600">{datos.noRevisado}</td>
                                            <td className="py-3 text-center text-red-500">{datos.observado}</td>
                                            <td className="py-3 text-right font-bold text-blue-600">{efectividad}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Servicios por Tipo</h2>
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
                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${porcentaje}%` }}></div>
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

export default DashboardAdministrador;