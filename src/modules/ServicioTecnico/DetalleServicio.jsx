import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { ClipboardList, RefreshCw, Settings, X } from "lucide-react";

// Importación de componentes de PDF y Formularios existentes
import GenerarPDF from "./Pdf/EstacionarioPDF";
import GenerarPDFportatil from "./Pdf/PortatilPDF";
import EstacionarioForm from "./forms/EstacionarioForm";
import FormPortatil from "./forms/PortatilForm";
import Modal from "../../components/ui/Modal";
import { ApiWebURL } from "../../utils/index";
import { useAuth } from "../../context/authContext";
import SubirFotos from "./SubirFotos";
import Swal from "sweetalert2";

// Importación de submódulos de parámetros extraídos
import { ServicioHeader } from "./components/ServicioHeader";
import { InfoCliente } from "./components/InfoCliente";
import { HallazgosTrabajo } from "./components/HallazgosTrabajo";
import ParametrosCompresor from "./components/ParametrosCompresor";
import ParametrosSecador from "./components/ParametrosSecador";
import ParametrosElectricos from "./components/ParametrosElectricos";
import FiltrosSection from "./components/FiltrosSection";
import EvidenciasGaleria from "./components/EvidenciasGaleria";
import { filtros_y_componentes } from "./Data";

// IMPORTACIÓN DE FIRMA DIGITAL
import { FirmaDigital } from "./firma/Firma";

import { serviciosService } from '../../services/service.service';

function DetalleServicio() {
    const { user } = useAuth();
    const rol = user?.rol?.toLowerCase();
    const { id_servicio } = useParams();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

    // Control del Modal de Firma
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    const [mostrarMenuEstado, setMostrarMenuEstado] = useState(false);
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mostrarPDF, setMostrarPDF] = useState(false);

    // 🌟 ESTADO CONTROLADOR DE CACHÉ DE IMÁGENES
    const [versionCache, setVersionCache] = useState(Date.now());

    // Instancia de Axios
    const token = localStorage.getItem("token");
    const api = axios.create({
        baseURL: `${ApiWebURL}/`,
        headers: { Authorization: `Bearer ${token}` }
    });

    const leerServicio = useCallback(async () => {
        setLoading(true);
        try {
            const response = await serviciosService.getById(id_servicio);

            if (response && response.success) {
                const servicioData = response.data;

                if (
                    servicioData.firma &&
                    servicioData.firma.startsWith("/uploads/")
                ) {
                    servicioData.firma = `${ApiWebURL}${servicioData.firma}`;
                }

                setServicio(servicioData);
            } else {
                throw new Error("La respuesta del servidor no fue exitosa");
            }

        } catch (error) {
            console.error("Error al leer servicio:", error);
            Swal.fire(
                "Error",
                error.response?.data?.message ||
                error.message ||
                "No se pudo cargar la información del reporte",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, [id_servicio]);

    useEffect(() => {
        leerServicio();
    }, [leerServicio]);

    // 🌟 FUNCIÓN MANEJADORA DE ÉXITO EN GALERÍA
    const handleActualizarFotosExito = async () => {
        // Al mutar este número, la galería entenderá que debe ignorar la caché anterior
        setVersionCache(Date.now());
        await leerServicio();
    };

    const handleFirmaGuardadaConExito = async (responseBackend) => {
        setIsSignatureModalOpen(false);

        Swal.fire({
            icon: 'success',
            title: '¡Firma registrada!',
            text: 'La firma del encargado ha sido guardada correctamente.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });

        await leerServicio();
    };

    const cambiarEstadoDetalle = async (id, nuevoEstado) => {
        try {
            await serviciosService.actualizarEstado(id, nuevoEstado.toLowerCase());

            setServicio(prev => ({ ...prev, estado: nuevoEstado.toLowerCase() }));
            setMostrarMenuEstado(false);

            Swal.fire({
                icon: 'success',
                title: nuevoEstado === "Eliminado" ? 'Reporte eliminado' : 'Estado actualizado',
                text: `El reporte fue marcado como "${nuevoEstado}".`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });

            if (nuevoEstado === "Eliminado") {
                setTimeout(() => navigate("/tecnicos/reportes"), 2000);
            }
        } catch (error) {
            Swal.fire(
                "Error",
                error.response?.data?.message || error.message || "No se pudo actualizar el estado",
                "error"
            );
        }
    };

    const handleChange = (e, seccionProcedencia) => {
        const { name, value } = e.target;

        setServicio(prev => {
            if (!prev) return prev;

            const mapaSecciones = {
                "compresor": "lecturas_compresor",
                "secador": "lecturas_secador",
                "electricos": "voltaje_amperaje",
                "checklist": "filtros_y_componentes",
                "informe": "informe_tecnico"
            };

            const propiedadBackend = mapaSecciones[seccionProcedencia];

            if (propiedadBackend) {
                const actual = Array.isArray(prev[propiedadBackend])
                    ? (prev[propiedadBackend][0] || {})
                    : (prev[propiedadBackend] || {});

                return {
                    ...prev,
                    [propiedadBackend]: [
                        {
                            ...actual,
                            [name]: value
                        }
                    ]
                };
            }

            return {
                ...prev,
                [name]: value
            };
        });
    };

    const normalizarDatos = (datos) => {
        if (!datos || typeof datos !== 'object') return {};
        const copia = { ...datos };

        delete copia.id_lectura;
        delete copia.id_servicio;
        delete copia.fecha_lectura;
        delete copia.temp_escape;

        const limpio = {};
        Object.keys(copia).forEach(key => {
            if (copia[key] !== null && copia[key] !== undefined && copia[key] !== "") {
                limpio[key] = String(copia[key]);
            }
        });
        return limpio;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const datosBase = servicio;
        if (!datosBase) return;

        const obtenerSubDatos = (campo) => {
            if (!datosBase[campo]) return {};
            return Array.isArray(datosBase[campo]) ? (datosBase[campo][0] || {}) : datosBase[campo];
        };

        const compresorData = obtenerSubDatos("lecturas_compresor");
        const secadorData = obtenerSubDatos("lecturas_secador");
        const voltajeData = obtenerSubDatos("voltaje_amperaje");
        const combustionData = obtenerSubDatos("lecturas_combustion") || obtenerSubDatos("combustion");
        const filtrosData = obtenerSubDatos("filtros_y_componentes") || obtenerSubDatos("filtros");
        const informeData = obtenerSubDatos("informe_tecnico") || obtenerSubDatos("informe");

        const lecturasParaEnviar = [
            { tipo: 'compresor', datos: normalizarDatos(compresorData) },
            { tipo: 'secador', datos: normalizarDatos(secadorData) },
            { tipo: 'voltaje_amperaje', datos: normalizarDatos(voltajeData) },
            { tipo: 'combustion', datos: normalizarDatos(combustionData) },
            { tipo: 'filtros_y_componentes', datos: normalizarDatos(filtrosData) },
            { tipo: 'informe', datos: normalizarDatos(informeData) }
        ];

        try {
            setLoading(true);
            await api.put(`lecturas/servicios/${id_servicio}`, lecturasParaEnviar);
            Swal.fire("¡Éxito!", "Reporte actualizado correctamente", "success");
            setIsModalOpen(false);
            await leerServicio();
        } catch (error) {
            if (error.response?.status === 404) {
                try {
                    await api.post(`lecturas/servicios/${id_servicio}`, lecturasParaEnviar);
                    Swal.fire("¡Éxito!", "Reporte creado exitosamente", "success");
                    setIsModalOpen(false);
                    await leerServicio();
                } catch (postError) {
                    Swal.fire("Error", "No se pudo guardar la información", "error");
                }
            } else {
                Swal.fire("Error", error.response?.data?.message || "Ocurrió un error inesperado", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-slate-500 font-medium animate-pulse">Cargando reporte #{id_servicio}...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F1F5F9] p-2 lg:p-8">
            <div className="mx-auto max-w-8xl space-y-6">

                {/* --- HEADER ACCIONES --- */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <ClipboardList size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Ficha Técnica Oficial</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">Orden de Servicio #{id_servicio}</h1>
                        <p className="text-slate-500 text-sm font-medium">
                            {servicio?.razon_social} • {
                                servicio?.fechainicio &&
                                new Date(servicio.fechainicio).toLocaleString("es-PE", {
                                    timeZone: "America/Lima",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })
                            }
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto relative">
                        {(() => {
                            const rolUser = (user?.rol || "").toLowerCase().trim();
                            const esAdmin = rolUser.includes("admin");
                            const esTecnico = rolUser.includes("tecnico");
                            const esPostventa = rolUser.includes("postventa");
                             const esPlanner = rolUser.includes("planner");

                            return (
                                <>
                                    {esAdmin && (
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={() => setMostrarMenuEstado(!mostrarMenuEstado)}
                                                className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-4 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                                            >
                                                <RefreshCw
                                                    size={18}
                                                    className={mostrarMenuEstado ? "animate-spin text-indigo-600" : ""}
                                                />
                                                Estado
                                            </button>

                                            {mostrarMenuEstado && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2">
                                                    <button
                                                        onClick={() => cambiarEstadoDetalle(id_servicio, "No revisado")}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors block"
                                                    >
                                                        No revisado
                                                    </button>

                                                    {user?.rol !== "tecnico" && (
                                                        <button
                                                            onClick={() => cambiarEstadoDetalle(id_servicio, "Revisado")}
                                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors block"
                                                        >
                                                            Revisado
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => cambiarEstadoDetalle(id_servicio, "Observado")}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors block"
                                                    >
                                                        Observado
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {(esAdmin || esTecnico || esPostventa) && (
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                        >
                                            <Settings size={18} /> Editar
                                        </button>
                                    )}

                                    {(esAdmin || esPostventa || esPlanner) && (
                                        <div className="flex gap-2">
                                            {servicio?.tipo_equipo === "Equipo Portatil" ? (
                                                <GenerarPDFportatil servicio={servicio} />
                                            ) : (
                                                <GenerarPDF servicio={servicio} />
                                            )}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </header>

                {/* --- SECCIÓN PRINCIPAL DE CONTENIDO --- */}
                <div className="w-full space-y-6">
                    <InfoCliente
                        servicio={servicio}
                        onAddSignature={() => setIsSignatureModalOpen(true)}
                    />
                    <HallazgosTrabajo servicio={servicio} />
                    <ParametrosCompresor servicio={servicio} />
                    <ParametrosSecador servicio={servicio} />
                    <ParametrosElectricos servicio={servicio} />
                    <FiltrosSection servicio={servicio} />

                    {/* 🌟 ENLAZAMOS LA NUEVA PROP DE VERSIÓN DE CACHÉ A LA GALERÍA */}
                    <EvidenciasGaleria
                        imagenes={servicio?.imagenes_servicio}
                        versionCache={versionCache}
                        onOpenGallery={() => setIsGalleryModalOpen(true)}
                    />
                </div>
            </div>

            {/* MODAL DE EDICIÓN */}
            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={servicio?.tipo_equipo === 'Equipo Portatil' ? 'Editar Equipo Portátil' : 'Editar Equipo Estacionario'}
                >
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {servicio?.tipo_equipo === 'Equipo Portatil' ? (
                            <FormPortatil
                                formData={servicio}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                title="Editar Equipo Portátil"
                            />
                        ) : (
                            <EstacionarioForm
                                formData={servicio}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                title="Editar Equipo Estacionario"
                            />
                        )}
                    </div>
                </Modal>
            )}

            {/* MODAL PARA GESTIÓN DE GALERÍA */}
            {isGalleryModalOpen && (
                <Modal isOpen={isGalleryModalOpen} onClose={() => setIsGalleryModalOpen(false)}>
                    {/* 🌟 CORREGIDO: Sincronización de propiedad a 'imagenes_servicio' y callback personalizado */}
                    <SubirFotos
                        id_servicio={id_servicio}
                        imagenesActuales={servicio?.imagenes_servicio || []}
                        onUploadSuccess={handleActualizarFotosExito}
                    />
                </Modal>
            )}

            {/* --- MODAL PARA CAPTURA DE FIRMA DIGITAL --- */}
            {isSignatureModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden p-2">
                        <button
                            onClick={() => setIsSignatureModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
                        >
                            <X size={18} />
                        </button>

                        <FirmaDigital
                            id_servicio={id_servicio}
                            onSaveSuccess={handleFirmaGuardadaConExito}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DetalleServicio;