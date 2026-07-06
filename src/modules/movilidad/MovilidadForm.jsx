import React, { useState, useEffect } from 'react';
import { movilidadService } from '../../services/movilidad.service';

const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    return isoString.split('T')[0];
};

export const MovilidadForm = ({ movilidadData, onSuccess }) => {
    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        tipo_vehiculo: '',
        kilometraje_actual: 0,
        estado_disponibilidad: 'Disponible',
        soat_vencimiento: '',
        revision_tecnica_vencimiento: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (movilidadData) {
            setFormData({
                ...movilidadData,
                soat_vencimiento: formatDateForInput(movilidadData.soat_vencimiento),
                revision_tecnica_vencimiento: formatDateForInput(movilidadData.revision_tecnica_vencimiento)
            });
        }
    }, [movilidadData]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (formData.id_movilidad) {
                // CORRECCIÓN: Cambiar de 'actualizarMovilidad' a 'update'
                await movilidadService.update(formData.id_movilidad, formData);
                alert('Información actualizada con éxito');
            } else {
                // CORRECCIÓN: Cambiar de 'crearMovilidad' a 'create'
                await movilidadService.create(formData);
                alert('Movilidad registrada con éxito');
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert(`Error al guardar: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded shadow-sm">
            {/* Campos de texto */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Placa</label>
                <input name="placa" value={formData.placa} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Marca</label>
                <input name="marca" value={formData.marca} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Modelo</label>
                <input name="modelo" value={formData.modelo} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Vehículo</label>
                <input name="tipo_vehiculo" value={formData.tipo_vehiculo} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Kilometraje Actual</label>
                <input type="number" name="kilometraje_actual" value={formData.kilometraje_actual} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" min="0" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Estado de Disponibilidad</label>
                <select name="estado_disponibilidad" value={formData.estado_disponibilidad} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1">
                    <option value="Disponible">Disponible</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                    <option value="Ocupado">Ocupado</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Vencimiento SOAT</label>
                <input type="date" name="soat_vencimiento" value={formData.soat_vencimiento} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Vencimiento Rev. Técnica</label>
                <input type="date" name="revision_tecnica_vencimiento" value={formData.revision_tecnica_vencimiento} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded mt-1" />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="md:col-span-2 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
                {isSubmitting ? 'Guardando...' : formData.id_movilidad ? 'Actualizar Información' : 'Registrar Movilidad'}
            </button>
        </form>
    );
};
export default MovilidadForm;