import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Plus, Filter, Cpu } from 'lucide-react';
import Loading from '../../components/Loading';
import Modal from "../../components/ui/Modal";
import { equipmentService } from '../../services/equipment.service';
import { clientService } from '../../services/client.service';
import EquipoForm from './equipos/EquipoForm';
import { EquipoLista } from './equipos/EquipoLista';
import { useAlert } from "../../context/AlertContext";

export const ClienteEquiposDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [equipos, setEquipos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [listaMarcas, setListaMarcas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clienteData, setClienteData] = useState(null);
    const [equipoAEditar, setEquipoAEditar] = useState(null); 
    const showAlert = useAlert();

    // Estados de búsqueda y filtrado por marca, modelo o serie
    const [busqueda, setBusqueda] = useState('');
    const [filtroMarca, setFiltroMarca] = useState('');
    const [filtroModelo, setFiltroModelo] = useState('');
    const [filtroSerie, setFiltroSerie] = useState('');

    const cargarDatos = async () => {
        if (!id) return;
        setCargando(true);
        try {
            const [equiposRes, marcasRes, clienteRes] = await Promise.all([
                equipmentService.getByClient(id),
                equipmentService.getMarcas(),
                clientService.getByIdentifier(id) 
            ]);

            setEquipos(Array.isArray(equiposRes) ? equiposRes : (equiposRes?.data || []));
            setListaMarcas(Array.isArray(marcasRes) ? marcasRes : (marcasRes?.data || []));
            setClienteData(clienteRes?.data || clienteRes);

        } catch (error) {
            console.error("Error al cargar datos:", error.message || error);
            showAlert?.({ type: "error", message: "No se pudieron cargar los datos del cliente." });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const handleEditarClick = (equipo) => {
        setEquipoAEditar(equipo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEquipoAEditar(null);
    };

    // Marcas únicas presentes en los equipos de este cliente
    const marcasDelCliente = useMemo(() => {
        const set = new Set();
        equipos.forEach(e => {
            if (e.marca && typeof e.marca === 'string' && e.marca.trim()) {
                set.add(e.marca.trim());
            }
        });
        return Array.from(set).sort();
    }, [equipos]);

    // Filtrado dinámico por Marca, Modelo o Serie
    const equiposFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        const fMarca = filtroMarca.trim().toLowerCase();
        const fModelo = filtroModelo.trim().toLowerCase();
        const fSerie = filtroSerie.trim().toLowerCase();

        return equipos.filter(e => {
            const marca = (e.marca || '').toLowerCase();
            const modelo = (e.modelo || '').toLowerCase();
            const serie = (e.serie || '').toLowerCase();
            const tipo = (e.tipo_equipo || '').toLowerCase();
            const codigo = (e.codigo_interno || '').toLowerCase();

            // Búsqueda general (marca, modelo o serie)
            if (q) {
                const coincideGeneral = marca.includes(q) || modelo.includes(q) || serie.includes(q) || tipo.includes(q) || codigo.includes(q);
                if (!coincideGeneral) return false;
            }

            // Filtro específico por Marca
            if (fMarca && !marca.includes(fMarca)) {
                return false;
            }

            // Filtro específico por Modelo
            if (fModelo && !modelo.includes(fModelo)) {
                return false;
            }

            // Filtro específico por Serie
            if (fSerie && !serie.includes(fSerie)) {
                return false;
            }

            return true;
        });
    }, [equipos, busqueda, filtroMarca, filtroModelo, filtroSerie]);

    const hayFiltroActivo = Boolean(busqueda || filtroMarca || filtroModelo || filtroSerie);

    const limpiarFiltros = () => {
        setBusqueda('');
        setFiltroMarca('');
        setFiltroModelo('');
        setFiltroSerie('');
    };

    return (
        <div className="space-y-5 animate-fade-in p-1">
            {/* Cabecera del Cliente */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors cursor-pointer"
                        title="Volver atrás"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Razón Social</span>
                        <h2 className="text-xl font-black text-gray-900">
                            {clienteData?.razon_social || 'Cargando cliente...'}
                        </h2>
                        {clienteData?.ruc && (
                            <p className="text-xs text-gray-400 font-mono">RUC: {clienteData.ruc}</p>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                        Total: {equipos.length} {equipos.length === 1 ? 'equipo' : 'equipos'}
                    </span>
                    <button
                        onClick={() => { setEquipoAEditar(null); setIsModalOpen(true); }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Registrar Equipo
                    </button>
                </div>
            </div>

            {/* Barra de Búsqueda y Filtros por Marca, Modelo o Serie */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex flex-col lg:flex-row items-stretch gap-2.5">
                    {/* Buscador Universal */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por marca, modelo o serie..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                        {busqueda && (
                            <button
                                onClick={() => setBusqueda('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
                                title="Limpiar texto"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Selector de Marca */}
                    <div className="w-full lg:w-48">
                        <select
                            value={filtroMarca}
                            onChange={(e) => setFiltroMarca(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                        >
                            <option value="">Todas las marcas</option>
                            {marcasDelCliente.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    {/* Input de Modelo */}
                    <div className="w-full lg:w-44">
                        <input
                            type="text"
                            placeholder="Modelo..."
                            value={filtroModelo}
                            onChange={(e) => setFiltroModelo(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                    </div>

                    {/* Input de Serie */}
                    <div className="w-full lg:w-44">
                        <input
                            type="text"
                            placeholder="N° de serie..."
                            value={filtroSerie}
                            onChange={(e) => setFiltroSerie(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                        />
                    </div>

                    {/* Botón Reset */}
                    {hayFiltroActivo && (
                        <button
                            onClick={limpiarFiltros}
                            className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Limpiar todos los filtros"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Sub-barra de conteo de resultados */}
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                    <span>
                        Mostrando <strong className="text-gray-800 font-bold">{equiposFiltrados.length}</strong> de <strong className="text-gray-800 font-bold">{equipos.length}</strong> equipos
                    </span>
                    {hayFiltroActivo && (
                        <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                            Filtros activos
                        </span>
                    )}
                </div>
            </div>

            {cargando ? (
                <Loading />
            ) : (
                <EquipoLista
                    equipos={equiposFiltrados}
                    esBusqueda={hayFiltroActivo}
                    onLimpiarBusqueda={limpiarFiltros}
                    onEliminar={cargarDatos}
                    onEditar={handleEditarClick}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={equipoAEditar ? "Editar Equipo" : "Registrar Nuevo Equipo"}
            >
                <EquipoForm
                    idCliente={id}
                    marcas={listaMarcas}
                    equipoAEditar={equipoAEditar}
                    onSuccess={() => {
                        handleCloseModal(); 
                        cargarDatos();      
                    }}
                />
            </Modal>
        </div>
    );
};

export default ClienteEquiposDetalle;