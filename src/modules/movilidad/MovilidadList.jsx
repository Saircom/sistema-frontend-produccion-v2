import React, { useEffect, useState } from 'react';
import { movilidadService } from '../../services/movilidad.service';
import { Plus, CheckCircle, Clock, XCircle, Edit2, Wrench } from 'lucide-react';
import MovilidadForm from './MovilidadForm';
import MantenimientoForm from './MantenimientoForm';
import Modal from '../../components/ui/Modal';

export const MovilidadList = () => {
    const [movilidades, setMovilidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para Movilidad (Editar/Nuevo)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovilidad, setEditingMovilidad] = useState(null);

    // Estados para Mantenimiento
    const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
    const [maintMovilidad, setMaintMovilidad] = useState(null);

    const fetchMovilidades = async () => {
        try {
            setLoading(true);
            const data = await movilidadService.getAll();
            setMovilidades(data);
        } catch (err) {
            setError("Error al cargar la lista de movilidades");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovilidades();
    }, []);

    const formatDateValue = (value) => {
        if (!value) return '-';

        const text = String(value).trim();
        if (!text) return '-';

        const dateOnly = text.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
            const [year, month, day] = dateOnly.split('-');
            return `${day}/${month}/${year}`;
        }

        const parsedDate = new Date(text);
        if (!Number.isNaN(parsedDate.getTime())) {
            return new Intl.DateTimeFormat('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(parsedDate);
        }

        return text;
    };

    const handleOpenModal = (movilidad = null) => {
        setEditingMovilidad(movilidad);
        setIsModalOpen(true);
    };

    const handleOpenMaintModal = (movilidad) => {
        setMaintMovilidad(movilidad);
        setIsMaintModalOpen(true);
    };

    const getStatusConfig = (status) => {
        if (status === 'OK') return { icon: <CheckCircle className="w-4 h-4" />, style: 'bg-green-100 text-green-800' };
        if (status?.includes('VENCIDO')) return { icon: <XCircle className="w-4 h-4 animate-pulse" />, style: 'bg-red-600 text-white' };
        return { icon: <Clock className="w-4 h-4" />, style: 'bg-yellow-100 text-yellow-800' };
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

    return (
        <div className="container mx-auto p-2">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-800">Lista de Movilidades</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
                >
                    <Plus className="w-5 h-5" /> Nueva Movilidad
                </button>
            </div>

            {/* Modal para Editar/Crear Movilidad */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMovilidad ? "Actualizar Vehículo" : "Registrar Vehículo"}>
                <MovilidadForm movilidadData={editingMovilidad} onSuccess={() => { setIsModalOpen(false); fetchMovilidades(); }} />
            </Modal>

            {/* Modal para Registrar Mantenimiento */}
            <Modal isOpen={isMaintModalOpen} onClose={() => setIsMaintModalOpen(false)} title={`Registrar Mantenimiento: ${maintMovilidad?.placa || ''}`}>
                <MantenimientoForm id_movilidad={maintMovilidad?.id_movilidad} onSuccess={() => { setIsMaintModalOpen(false); fetchMovilidades(); }} />
            </Modal>

            <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Tipo', 'Placa', 'Marca', 'Km', 'Estado', 'Soat', 'Mant.', 'Acciones'].map((h) => (
                                <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-xs">
                        {movilidades.map((m) => (
                            <tr key={m.id_movilidad} className="hover:bg-gray-50">
                                <td className="px-3 py-2">{m.tipo_vehiculo}</td>
                                <td className="px-3 py-2 font-medium">{m.placa}</td>
                                <td className="px-3 py-2">{m.marca}</td>
                                <td className="px-3 py-2">{m.kilometraje_actual}</td>
                                <td className="px-3 py-2"><span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">{m.estado_disponibilidad}</span></td>
                                <td className="px-3 py-2"><span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">{formatDateValue(m.soat_vencimiento)}</span></td>
                                <td className="px-3 py-2"><span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">{formatDateValue(m.revision_tecnica_vencimiento)}</span></td>
                                <td className="px-3 py-2 flex gap-2">
                                    <button onClick={() => handleOpenModal(m)} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleOpenMaintModal(m)} className="text-green-600 hover:text-green-900"><Wrench className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MovilidadList;