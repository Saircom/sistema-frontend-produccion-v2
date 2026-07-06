import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreVertical, Eye, Camera, CheckCircle, Clock, Trash2, UserCircle, Cpu, AlertCircle, Edit3, PenTool } from "lucide-react";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../context/authContext";
import { ApiWebURL } from "../../utils/index";
import usePersistedPage from "../../hooks/usePersistedPage";
import Swal from "sweetalert2";
import DetalleServicio from './DetalleServicio';
import { serviciosService } from '../../services/service.service';

function ListaReportes() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [listaReportes, setListaReportes] = useState([]);
    const [cargando, setCargando] = useState(false);
    // ESTADOS DE FILTROS
    const [filtroRazon, setFiltroRazon] = useState("");
    const [filtroSerie, setFiltroSerie] = useState("");
    const [filtroModelo, setFiltroModelo] = useState("");
    const [filtroTecnico, setFiltroTecnico] = useState("");
    const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
    const [filtroFechaFin, setFiltroFechaFin] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [menuAbierto, setMenuAbierto] = useState(null);
    const [pagina, setPagina] = usePersistedPage("paginaReportes", 0);
    const [filasPagina, setFilasPagina] = useState(50);

    useEffect(() => {
        const leerServicio = async () => {
            setCargando(true);
            try {
                const token = localStorage.getItem("token") || "";
                const response = await fetch(`${ApiWebURL}/servicios`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                setListaReportes((data.data || []).sort((a, b) => b.id_servicio - a.id_servicio));
            } catch (error) {
                console.error("Error al obtener reportes:", error.message);
            } finally {
                setCargando(false);
            }
        };
        leerServicio();
    }, []);

    // LÓGICA DE FILTRADO RESTRICTIVA
    const reportesFiltrados = listaReportes.filter((report) => {
        const estadoReporte = report.estado?.trim().toLowerCase() || "";

        // Ocultar eliminados
        if (estadoReporte === "eliminado") return false;

        // Restricción por rol
        if (
            user?.rol?.toLowerCase() === "tecnico" &&
            estadoReporte === "revisado"
        ) {
            return false;
        }

        if (
            user?.rol?.toLowerCase() === "postventa" &&
            estadoReporte !== "revisado"
        ) {
            return false;
        }

        let fechaValida = true;

        if (filtroFechaInicio || filtroFechaFin) {
            const fechaServicio = new Date(report.fechainicio);

            if (filtroFechaInicio) {
                const fechaInicio = new Date(filtroFechaInicio);
                fechaInicio.setHours(0, 0, 0, 0);

                if (fechaServicio < fechaInicio) {
                    fechaValida = false;
                }
            }

            if (filtroFechaFin) {
                const fechaFin = new Date(filtroFechaFin);
                fechaFin.setHours(23, 59, 59, 999);

                if (fechaServicio > fechaFin) {
                    fechaValida = false;
                }
            }
        }

        return (
            fechaValida &&
            (!filtroRazon ||
                report.cliente_razon_social
                    ?.toLowerCase()
                    .includes(filtroRazon.toLowerCase())) &&
            (!filtroSerie ||
                report.equipo_serie
                    ?.toLowerCase()
                    .includes(filtroSerie.toLowerCase())) &&
            (!filtroModelo ||
                report.equipo_modelo
                    ?.toLowerCase()
                    .includes(filtroModelo.toLowerCase())) &&
            (!filtroTecnico ||
                `${report.tecnico_nombres || ""} ${report.tecnico_apellidos || ""}`
                    .toLowerCase()
                    .includes(filtroTecnico.toLowerCase())) &&
            (!filtroEstado ||
                estadoReporte === filtroEstado.toLowerCase())
        );
    });

    const cambiarEstado = async (idServicio, estado) => {
        try {
            await serviciosService.actualizarEstado(
                idServicio,
                estado.toLowerCase()
            );

            // Actualizar la lista localmente
            setListaReportes(prev =>
                prev.map(item =>
                    item.id_servicio === idServicio
                        ? { ...item, estado: estado.toLowerCase() }
                        : item
                )
            );

            Swal.fire({
                icon: "success",
                title: "Estado actualizado",
                text: `El reporte fue marcado como "${estado}".`,
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.error ||
                    error.message ||
                    "No se pudo actualizar el estado."
            });

        }
    };

    const totalPaginas = Math.ceil(reportesFiltrados.length / filasPagina);

    useEffect(() => {
        if (pagina >= totalPaginas && totalPaginas > 0) {
            setPagina(0);
        }
    }, [pagina, totalPaginas]);

    return (
        /* Contenedor fluido principal que remueve cualquier tope de ancho de 1126px */
        <div className="w-full flex flex-col space-y-4">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                <div className="p-2 border-b border-gray-100 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <h3 className="text-2xl font-bold text-gray-800">Lista de Informes</h3>
                        <span className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-sm font-medium">
                            {reportesFiltrados.length} Resultados
                        </span>
                    </div>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-stretch">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" placeholder="Razón Social..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500"
                                value={filtroRazon} onChange={e => setFiltroRazon(e.target.value)} />
                        </div>
                        <div className="relative">
                            <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" placeholder="N° de Serie..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500"
                                value={filtroSerie} onChange={e => setFiltroSerie(e.target.value)} />
                        </div>
                        <input type="text" placeholder="Modelo..." className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500"
                            value={filtroModelo} onChange={e => setFiltroModelo(e.target.value)} />

                        {user?.rol !== "tecnico" && (
                            <input type="text" placeholder="Técnico..." className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500"
                                value={filtroTecnico} onChange={e => setFiltroTecnico(e.target.value)} />
                        )}

                        <input type="date" className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm" value={filtroFechaInicio} onChange={e => setFiltroFechaInicio(e.target.value)} />
                        <input type="date" className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm" value={filtroFechaFin} onChange={e => setFiltroFechaFin(e.target.value)} />

                        <select className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                            <option value="">Todos los Estados</option>
                            <option value="No revisado">No revisado</option>
                            {user?.rol !== "tecnico" && <option value="Revisado">Revisado</option>}
                            <option value="Observado">Observado</option>
                        </select>

                        <button onClick={() => { setFiltroRazon(""); setFiltroSerie(""); setFiltroModelo(""); setFiltroTecnico(""); setFiltroFechaInicio(""); setFiltroFechaFin(""); setFiltroEstado(""); setPagina(0); }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold">
                            <Trash2 size={16} /> Resetear
                        </button>
                    </div>
                </div>

                {cargando ? <div className="flex justify-center py-10"><Loading /></div> : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-xs text-left">

                            <thead className="bg-gray-50 text-gray-500 uppercase border-b">
                                <tr>
                                    <th className="px-2 py-2">ID</th>
                                    <th className="px-2 py-2">N° Or.</th>
                                    <th className="px-2 py-2">N° Cot.</th>
                                    <th className="px-2 py-2">Razón Social</th>
                                    <th className="px-2 py-2">Tipo de Servicio</th>
                                    <th className="px-2 py-2">Equipo</th>
                                    {user?.rol !== "tecnico" && <th className="px-2 py-2">Técnico</th>}
                                    <th className="px-2 py-2">Fecha</th>
                                    <th className="px-2 py-2 text-center">Estado Servicio</th>
                                    <th className="px-2 py-2 text-center">Estado Informe</th>
                                    <th className="px-2 py-2 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {reportesFiltrados.slice(pagina * filasPagina, (pagina + 1) * filasPagina).map((item) => {
                                    // Función reutilizable para abrir los detalles del servicio
                                    const manejarAbrirDetalles = () => {
                                        const ruta = `/servicio/detalles-servicio/${item.id_servicio}`;
                                        window.open(ruta, '_blank', 'noopener,noreferrer');
                                    };

                                    return (
                                        <tr key={item.id_servicio} className="hover:bg-indigo-50/50 transition-colors">
                                            {/* Celdas clickeables que abren los detalles (Desde ID hasta Fecha) */}
                                            <td onClick={manejarAbrirDetalles} className="px-4 py-3 font-bold text-indigo-600 cursor-pointer">#{item.id_servicio}</td>
                                            <td onClick={manejarAbrirDetalles} className="px-4 py-3 font-bold text-indigo-600 cursor-pointer">#{item.numero_orden}</td>
                                            <td onClick={manejarAbrirDetalles} className="px-4 py-3 font-bold text-indigo-600 cursor-pointer">#{item.numero_cotizacion}</td>
                                            <td onClick={manejarAbrirDetalles} className="px-4 py-3 font-medium text-gray-800 cursor-pointer">{item.cliente_razon_social}</td>
                                            <td onClick={manejarAbrirDetalles} className="px-4 py-3 font-semibold text-gray-800 cursor-pointer">{item.tipoServicio}</td>
                                            <td onClick={manejarAbrirDetalles} className="px-4 py-3 text-gray-600 cursor-pointer">{item.equipo_marca} / {item.equipo_modelo} / {item.equipo_serie}</td>
                                            {user?.rol !== "TECNICO" && (
                                                <td onClick={manejarAbrirDetalles} className="px-4 py-3 text-gray-500 cursor-pointer">{item.tecnico_nombres}</td>
                                            )}
                                            <td onClick={manejarAbrirDetalles} className="px-4 py-3 text-gray-500 cursor-pointer">{new Date(item.fechainicio).toLocaleDateString("es-PE")}</td>
                                            <td onClick={manejarAbrirDetalles} className="px-4 py-3 cursor-pointer alignment-baseline">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${!item.estado_actual || item.estado_actual.toLowerCase() === 'Sin Programar'
                                                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                                        : item.estado_actual.toLowerCase() === 'cliente'
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : item.estado_actual.toLowerCase() === 'en proceso'
                                                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                                : item.estado_actual.toLowerCase() === 'finalizado'
                                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                                    : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {item.estado_actual || 'Programado'}
                                                </span>
                                            </td>
                                            {/* Celda de Estado (NO abre la página de detalles) */}
                                            <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${item.estado?.toLowerCase() === "revisado"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : item.estado?.toLowerCase() === "observado"
                                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                    }`}>
                                                    {item.estado}
                                                </span>
                                            </td>
                                            {/* Celda de Acciones/Menú (NO abre la página de detalles) */}
                                            <td className="px-4 py-3 text-right relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuAbierto(menuAbierto === item.id_servicio ? null : item.id_servicio);
                                                    }}
                                                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {menuAbierto === item.id_servicio && (
                                                    <>
                                                        {/* Overlay para cerrar el menú al hacer clic fuera */}
                                                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuAbierto(null); }}></div>

                                                        <div className="absolute right-0 top-10 w-52 bg-white border rounded-xl shadow-xl z-20 py-1 text-left">
                                                            <button onClick={() => { setMenuAbierto(null); window.open(`${window.location.origin}/servicio/detalles-servicio/${item.id_servicio}`, '_blank', 'noopener,noreferrer'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"><Eye size={14} /> Ver Detalles</button>
                                                            <button onClick={() => { setMenuAbierto(null); navigate(`/tecnicos/reportes/${item.id_servicio}/fotos`); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"><Camera size={14} /> Fotos</button>
                                                            <button onClick={() => { setMenuAbierto(null); navigate(`/tecnicos/reportes/${item.id_servicio}/firma`); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"><PenTool size={14} /> Firma</button>

                                                            {user?.rol === "ADMINISTRADOR" && (
                                                                <>
                                                                    <div className="border-t mt-1 pt-1 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cambiar Estado</div>
                                                                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                                                                        onClick={() => {
                                                                            setMenuAbierto(null);
                                                                            cambiarEstado(item.id_servicio, "revisado");
                                                                        }}
                                                                    >
                                                                        Revisado
                                                                    </button>

                                                                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                                                                        onClick={() => {
                                                                            setMenuAbierto(null);
                                                                            cambiarEstado(item.id_servicio, "observado");
                                                                        }}
                                                                    >
                                                                        Observado
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-red-600 font-medium border-t mt-1"
                                                                onClick={() => {
                                                                    setMenuAbierto(null);

                                                                    Swal.fire({
                                                                        title: '¿Eliminar reporte?',
                                                                        text: 'El reporte ya no aparecerá en las listas.',
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonColor: '#d33',
                                                                        confirmButtonText: 'Sí, eliminar'
                                                                    }).then((result) => {
                                                                        if (result.isConfirmed) {
                                                                            cambiarEstado(item.id_servicio, "eliminado");
                                                                        }
                                                                    });
                                                                }}
                                                            >
                                                                Eliminar Reporte
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <Pagination
                        totalPaginas={totalPaginas}
                        paginaActual={pagina}
                        onPageChange={setPagina}
                        filasPagina={filasPagina}
                        setFilasPagina={setFilasPagina}
                    />
                </div>
            </div>
        </div>
    );
}

export default ListaReportes;