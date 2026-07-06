import React, { useState } from 'react';
import { movilidadService } from '../../services/movilidad.service';

export const MantenimientoForm = ({ id_movilidad, kilometraje_actual, onSuccess }) => {
    const [formData, setFormData] = useState({
        fecha_mantenimiento: new Date().toISOString().split('T')[0],
        kilometraje_mantenimiento: kilometraje_actual || 0,
        proximo_mantenimiento_km: 0,
        proximo_mantenimiento_fecha: '',
        tipo: 'Preventivo',
        observacion: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: (name.includes('km')) ? parseInt(value) || 0 : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.kilometraje_mantenimiento < kilometraje_actual) {
            return alert(`El kilometraje no puede ser menor al actual (${kilometraje_actual})`);
        }
        
        setIsSubmitting(true);
        try {
            await movilidadService.registrarMantenimiento({ ...formData, id_movilidad });
            alert('Mantenimiento registrado con éxito');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            alert('Error al guardar el mantenimiento');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            {/* Fecha y Kilometraje */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <input type="date" name="fecha_mantenimiento" value={formData.fecha_mantenimiento} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">KM Actual</label>
                    <input type="number" name="kilometraje_mantenimiento" value={formData.kilometraje_mantenimiento} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
            </div>

            {/* Próximo Mantenimiento */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Próximo KM</label>
                    <input type="number" name="proximo_mantenimiento_km" value={formData.proximo_mantenimiento_km} onChange={handleChange} className="w-full p-2 border rounded" placeholder="ej. 50000" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Próxima Fecha</label>
                    <input type="date" name="proximo_mantenimiento_fecha" value={formData.proximo_mantenimiento_fecha} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
            </div>

            {/* Tipo y Observación */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Mantenimiento</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="Preventivo">Preventivo</option>
                    <option value="Correctivo">Correctivo</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea name="observacion" value={formData.observacion} onChange={handleChange} className="w-full p-2 border rounded" rows="2" />
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold transition"
            >
                {isSubmitting ? 'Procesando...' : 'Registrar Mantenimiento'}
            </button>
        </form>
    );
};

export default MantenimientoForm;