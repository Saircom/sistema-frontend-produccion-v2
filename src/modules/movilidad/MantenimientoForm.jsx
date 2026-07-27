import React, { useState } from 'react';
import { movilidadService } from '../../services/movilidad.service';

export const MantenimientoForm = ({ movilidad_id, kilometraje_actual, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inicializamos el estado asegurando que los valores numéricos sean correctos
    const [formData, setFormData] = useState({
        fecha_mantenimiento: new Date().toISOString().split('T')[0],
        kilometraje_al_momento: kilometraje_actual || 0,
        tipo: 'Preventivo',
        descripcion_trabajo: '',
        observaciones: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validación preventiva antes de enviar
        if (!movilidad_id) {
            alert('Error: No se ha detectado el ID del vehículo.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 2. Construimos el objeto final incluyendo explícitamente el movilidad_id
            // Esto asegura que el backend reciba el valor y no un 'undefined'
            const dataToSubmit = {
                ...formData,
                movilidad_id: Number(movilidad_id),
                kilometraje_al_momento: Number(formData.kilometraje_al_momento)
            };

            await movilidadService.addMantenimiento(movilidad_id, dataToSubmit);

            alert('Registro exitoso');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Detalle del error:", error.response?.data || error.message);
            alert('Error al guardar: ' + (error.response?.data?.error || 'Ocurrió un error inesperado'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-sm bg-white">
            <h2 className="text-lg font-bold">Registrar Mantenimiento</h2>

            <input
                type="date"
                name="fecha_mantenimiento"
                value={formData.fecha_mantenimiento}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
            />

            <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white"
            >
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
            </select>

            <input
                type="number"
                name="kilometraje_al_momento"
                value={formData.kilometraje_al_momento}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Kilometraje actual"
                required
            />

            <textarea
                name="descripcion_trabajo"
                value={formData.descripcion_trabajo}
                onChange={handleChange}
                placeholder="Trabajo realizado"
                className="w-full p-2 border rounded"
                required
            />

            <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Observaciones"
                className="w-full p-2 border rounded"
            />

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
                {isSubmitting ? 'Procesando...' : 'Guardar'}
            </button>
        </form>
    );
};

export default MantenimientoForm;