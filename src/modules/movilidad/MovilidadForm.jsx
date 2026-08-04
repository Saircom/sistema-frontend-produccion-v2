import React, { useState, useEffect } from 'react';
import { movilidadService } from '../../services/movilidad.service';

export const MovilidadForm = ({ movilidadData, onSuccess }) => {
    const [formData, setFormData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        tipo_vehiculo: '',
        kilometraje_actual: 0,
        estado_disponibilidad: 'Disponible'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (movilidadData) {
            setFormData({
                id_movilidad: movilidadData.id_movilidad,
                placa: movilidadData.placa || '',
                marca: movilidadData.marca || '',
                modelo: movilidadData.modelo || '',
                tipo_vehiculo: movilidadData.tipo_vehiculo || '',
                kilometraje_actual: movilidadData.kilometraje_actual || 0,
                estado_disponibilidad: movilidadData.estado_disponibilidad || 'Disponible'
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
        
        // Log para ver qué datos se están enviando al servidor
        console.log("Enviando formulario:", formData);

        try {
            if (formData.id_movilidad) {
                await movilidadService.update(formData.id_movilidad, formData);
                alert('Vehículo actualizado con éxito');
            } else {
                await movilidadService.create(formData);
                alert('Vehículo registrado con éxito');
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            // Log detallado del error para la consola
            console.error("Error en MovilidadForm:", error);
            // Log adicional si el servidor responde con detalles específicos
            if (error.response) {
                console.error("Datos del error del servidor:", error.response.data);
            }
            alert(`Error: ${error.response?.data?.error || error.response?.data?.message || error.message || 'Ocurrió un error inesperado'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded shadow-sm border">
            {/* ... resto del JSX igual que antes ... */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Placa</label>
                <input name="placa" value={formData.placa} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Marca</label>
                <input name="marca" value={formData.marca} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Modelo</label>
                <input name="modelo" value={formData.modelo} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Vehículo</label>
                <input name="tipo_vehiculo" value={formData.tipo_vehiculo} onChange={handleChange} className="w-full p-2 border rounded mt-1" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Kilometraje Actual</label>
                <input type="number" name="kilometraje_actual" value={formData.kilometraje_actual} onChange={handleChange} className="w-full p-2 border rounded mt-1" min="0" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select name="estado_disponibilidad" value={formData.estado_disponibilidad} onChange={handleChange} className="w-full p-2 border rounded mt-1">
                    <option value="Disponible">Disponible</option>
                    <option value="En mantenimiento">En mantenimiento</option>
                    <option value="En uso">En uso</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="md:col-span-2 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
                {isSubmitting ? 'Guardando...' : formData.id_movilidad ? 'Actualizar Vehículo' : 'Registrar Vehículo'}
            </button>
        </form>
    );
};

export default MovilidadForm;
