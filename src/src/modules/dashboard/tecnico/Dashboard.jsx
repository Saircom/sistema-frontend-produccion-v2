import React, { useState, useEffect } from "react";
// Importamos el servicio del frontend
import { DashboardService } from '../../../services/dashboard.service.js';

// NOTA: 'idTecnicoLogueado' normalmente vendría del contexto de tu Login/Auth
const DashboardTecnico = ({ idTecnicoLogueado = 1 }) => {
    const [servicios, setServicios] = useState([]);
    const [nombreTecnico, setNombreTecnico] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("todos");

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                // Consumimos tu API filtrada por el ID del técnico
                const datos = await DashboardService.obtenerDatosTecnico(idTecnicoLogueado);
                setServicios(datos);

                if (datos.length > 0) {
                    setNombreTecnico(datos[0].tecnicoNombre);
                }
                setError(null);
            } catch (err) {
                console.error("Error en el Dashboard de Técnico:", err);
                setError(err.message || "No se pudieron cargar tus asignaciones.");
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [idTecnicoLogueado]);

    // Filtramos la lista en pantalla (ignorando siempre los que están como 'eliminado')
    const serviciosFiltrados = servicios.filter(s => {
        if (s.estado === "eliminado") return false;
        if (filtroEstado === "todos") return true;
        return s.estado === filtroEstado;
    });

    if (cargando) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC]">
                <p className="text-slate-500 font-medium animate-pulse text-sm">Cargando tus órdenes del día...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC] p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center shadow-sm w-full max-w-sm">
                    <p className="text-sm font-medium mb-2">Error al conectar con el servidor</p>
                    <p className="text-xs text-red-600 mb-3">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-[#F8FAFC] min-h-screen font-sans text-slate-800 max-w-md mx-auto border-x border-slate-200 shadow-sm">

            {/* Cabecera del Técnico */}
            <header className="mb-5 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Asignaciones de Hoy</span>
                    <h1 className="text-lg font-bold text-slate-900 mt-0.5">{nombreTecnico || `Técnico #${idTecnicoLogueado}`}</h1>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-md shadow-sm">
                    {nombreTecnico ? nombreTecnico.charAt(0).toUpperCase() : "T"}
                </div>
            </header>

            {/* Botoneras de Filtros Rápidos (Estados Reales de tu DB) */}
            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                <button
                    onClick={() => setFiltroEstado("todos")}
                    className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${filtroEstado === 'todos' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                    Todos ({servicios.filter(s => s.estado !== "eliminado").length})
                </button>
                <button
                    onClick={() => setFiltroEstado("no revisado")}
                    className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${filtroEstado === 'no revisado' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                    Pendientes ({servicios.filter(s => s.estado === "no revisado").length})
                </button>
                <button
                    onClick={() => setFiltroEstado("observado")}
                    className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${filtroEstado === 'observado' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                    Alertas ({servicios.filter(s => s.estado === "observado").length})
                </button>
            </div>

            {/* Listado de Trabajos en formato Tarjeta */}
            <main className="space-y-3">
                <div className="flex justify-between items-center px-1 mb-1">
                    <h2 className="text-sm font-bold text-slate-900">Mis Órdenes de Trabajo</h2>
                    <span className="text-xs font-medium text-slate-400">Filtrados: {serviciosFiltrados.length}</span>
                </div>

                {serviciosFiltrados.map((s) => (
                    <div key={s.id_servicio} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:border-slate-200">

                        {/* Color del borde izquierdo según el estado */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${s.estado === 'revisado' ? 'bg-green-500' :
                                s.estado === 'no revisado' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />

                        <div className="flex justify-between items-start pl-1">
                            <div>
                                <span className="text-[10px] font-mono text-slate-400">ORDEN #{s.id_servicio}</span>
                                <h3 className="font-bold text-slate-900 text-sm mt-0.5">{s.tipoServicio}</h3>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${s.estado === 'revisado' ? 'bg-green-50 text-green-700' :
                                    s.estado === 'no revisado' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {s.estado}
                            </span>
                        </div>

                        {/* Acciones para el Técnico (Si la tarea no está completada / revisada) */}
                        {s.estado !== 'revisado' && (
                            <div className="mt-4 flex gap-2 pl-1 border-t border-slate-50 pt-3">
                                <button
                                    onClick={() => alert(`Guardar cambio: Orden #${s.id_servicio} $\rightarrow$ revisado`)}
                                    className="flex-1 bg-green-600 text-white text-xs py-2 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors"
                                >
                                    Marcar Completado
                                </button>
                                {s.estado !== 'observado' && (
                                    <button
                                        onClick={() => alert(`Reportar alerta para la orden #${s.id_servicio}`)}
                                        className="px-2.5 bg-red-50 text-red-600 border border-red-100 text-xs py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                                    >
                                        Observar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {serviciosFiltrados.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-xs font-medium">No tienes órdenes en este estado.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardTecnico;