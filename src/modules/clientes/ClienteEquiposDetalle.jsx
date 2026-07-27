import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    return (
        <div className="space-y-6 animate-fade-in p-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl border border-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Razon Social</span>
                        <h2 className="text-xl font-black text-gray-900">
                            {clienteData?.razon_social || 'Cargando cliente...'}
                        </h2>
                    </div>
                </div>
                
                <button
                    onClick={() => { setEquipoAEditar(null); setIsModalOpen(true); }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all"
                >
                    Registrar Equipo
                </button>
            </div>

            {cargando ? (
                <Loading />
            ) : (
                <EquipoLista
                    equipos={equipos}
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