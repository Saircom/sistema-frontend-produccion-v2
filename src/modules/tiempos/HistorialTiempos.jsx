import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { serviciosService } from '../../services/service.service';
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";

export const HistorialTiempos = () => {
    const navigate = useNavigate();
    const [listaTiempos, setListaTiempos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [pagina, setPagina] = useState(0);
    const [filasPagina, setFilasPagina] = useState(15);

    // 🕒 Función para formatear solo la FECHA (Ejemplo: 24/05/2026)
    const formatearFecha = (stringFecha) => {
        if (!stringFecha) return "-";
        const fecha = new Date(stringFecha);
        if (isNaN(fecha.getTime())) return stringFecha; // Si no es fecha válida, devuelve el texto original
        
        return fecha.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // ⏰ Función para formatear solo la HORA (Ejemplo: 02:30 PM)
    const formatearHora = (stringFechaHora) => {
        if (!stringFechaHora) return "-";
        const fecha = new Date(stringFechaHora);
        if (isNaN(fecha.getTime())) return stringFechaHora;

        return fecha.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // Cambiar a false si prefieres formato 24 horas (ej: 14:30)
        });
    };

    const leerServicio = useCallback(async () => {
        setCargando(true);
        try {
            const respuesta = await serviciosService.getAll();
            const datosTiempos = Array.isArray(respuesta) ? respuesta : (respuesta?.data || []);
            setListaTiempos(datosTiempos);
        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        leerServicio();
    }, [leerServicio]);

    const totalPaginas = Math.max(1, Math.ceil(listaTiempos.length / filasPagina));
    const datosPaginados = listaTiempos.slice(pagina * filasPagina, (pagina + 1) * filasPagina);

    useEffect(() => {
        if (pagina >= totalPaginas) {
            setPagina(0);
        }
    }, [pagina, totalPaginas]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* Encabezado */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Módulo de Control de Tiempos
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Historial y seguimiento de horas de llegada, inicio y fin de servicios.
                    </p>
                </div>
                <button 
                    onClick={leerServicio}
                    className="self-start md:self-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                >
                    Refrescar
                </button>
            </div>

            {/* Contenedor Principal */}
            {cargando ? (
                <div className="flex justify-center items-center h-64">
                    <Loading />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Servicio</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente / Razón Social</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">RUC</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Técnico</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Creado por</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">H. Llegada</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">H. Inicio</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">H. Fin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                                {datosPaginados.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-400 font-medium">
                                            No se encontraron registros de tiempos.
                                        </td>
                                    </tr>
                                ) : (
                                    datosPaginados.map((tiempo, index) => (
                                        <tr
                                            key={tiempo.id || index}
                                            className="hover:bg-gray-50/70 transition-colors odd:bg-white even:bg-gray-50/40"
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">{tiempo.id_servicio || tiempo.id}</td>
                                            <td className="px-6 py-4 max-w-xs truncate">{tiempo.cliente_razon_social || tiempo.cliente}</td>
                                            <td className="px-6 py-4 text-gray-500 font-mono">{tiempo.ruc}</td>
                                            <td className="px-6 py-4">{tiempo.tecnico_nombres || tiempo.tecnico}</td>
                                            <td className="px-6 py-4 text-gray-500">{tiempo.creador_nombres || tiempo.creador}</td>
                                            
                                            {/* Aplicación de los formateadores nativos de JS */}
                                            <td className="px-6 py-4 font-medium text-gray-600">
                                                {formatearFecha(tiempo.fechainicio)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {formatearHora(tiempo.fecha_hora_llegada)}
                                            </td>
                                            <td className="px-6 py-4 text-emerald-600 font-semibold">
                                                {formatearHora(tiempo.fecha_hora_inicio)}
                                            </td>
                                            <td className="px-6 py-4 text-rose-600 font-semibold">
                                                {formatearHora(tiempo.fecha_hora_fin)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
                        <Pagination
                            totalPaginas={totalPaginas}
                            paginaActual={pagina}
                            onPageChange={setPagina}
                            filasPagina={filasPagina}
                            setFilasPagina={setFilasPagina}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialTiempos;