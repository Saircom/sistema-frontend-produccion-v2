import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/client.service.js';
import { equipmentService } from '../../services/equipment.service.js';
import { UsuarioService } from '../../services/user.service.js';
import { X, Loader2 } from 'lucide-react';
import ServicioForm from './ServicioForm.jsx';

export default function AperturaServicioModal({ isOpen, onClose, onOrderCreated }) {
    if (!isOpen) return null;

    const [busqueda, setBusqueda] = useState('');
    const [cliente, setCliente] = useState(null);
    const [equipos, setEquipos] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    // Cargar técnicos al montar el modal
    useEffect(() => {
        UsuarioService.getAll().then(res => {
            const data = res.data || res || [];
            setTecnicos(data.filter(u => u.rol === 'TECNICO' || u.nombre_rol === 'TECNICO'));
        });
    }, []);

    // Lógica de búsqueda (debounced)
    useEffect(() => {
        if (busqueda.length < 3) {
            if (cliente) {
                setCliente(null);
                setEquipos([]);
            }
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            handleBuscar();
        }, 500); // Espera 500ms después de que el usuario deja de escribir

        return () => clearTimeout(delayDebounceFn);
    }, [busqueda]);

    const handleBuscar = async () => {
        if (!busqueda.trim()) return;
        
        setCargando(true);
        setError(null);
        try {
            const res = await clientService.search(busqueda);
            
            if (res.success && res.data && res.data.length > 0) {
                const clienteEncontrado = res.data[0];
                setCliente(clienteEncontrado);
                
                // Cargar equipos del cliente encontrado
                const resEquipos = await equipmentService.getByClient(clienteEncontrado.id_cliente);
                setEquipos(Array.isArray(resEquipos) ? resEquipos : (resEquipos.data || []));
            } else {
                setError("No se encontró ningún cliente.");
                setCliente(null);
                setEquipos([]);
            }
        } catch (err) {
            setError("Error al realizar la búsqueda.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">Buscar Cliente (RUC / Razón Social)</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Buscador */}
                <div className="flex gap-2 mb-6">
                    <input 
                        className="flex-1 p-2 border rounded-xl"
                        placeholder="Escribe RUC o Razón Social..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <div className="flex items-center justify-center w-10">
                        {cargando && <Loader2 className="animate-spin text-blue-600" size={24}/>}
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

                {/* Formulario que recibe los datos */}
                <ServicioForm 
                    cliente={cliente}
                    equipos={equipos}
                    tecnicos={tecnicos}
                    onClose={onClose}
                    onOrderCreated={onOrderCreated}
                />
            </div>
        </div>
    );
}