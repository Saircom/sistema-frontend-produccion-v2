import React, { useState, useEffect } from 'react';
import { movilidadService } from '../../services/movilidad.service';
import Swal from 'sweetalert2';

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
            [name]: type === 'number' ? parseFloat(value) : (name === 'placa' ? value.toUpperCase() : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errores = [];
        const placa = String(formData.placa || '').trim().toUpperCase();
        if (!placa) errores.push('La Placa es obligatoria.');
        if (!String(formData.marca || '').trim()) errores.push('La Marca es obligatoria.');
        if (!String(formData.modelo || '').trim()) errores.push('El Modelo es obligatorio.');
        if (!String(formData.tipo_vehiculo || '').trim()) errores.push('El Tipo de Vehículo es obligatorio.');
        if (formData.kilometraje_actual === '' || isNaN(Number(formData.kilometraje_actual)) || Number(formData.kilometraje_actual) < 0) {
            errores.push('El Kilometraje actual debe ser un número mayor o igual a 0.');
        }

        if (errores.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos pendientes',
                html: `<p class="mb-2 text-sm text-gray-600">Por favor verifique los siguientes puntos:</p><ul style="text-align: left; margin-left: 20px; list-style-type: disc; font-size: 14px; color: #b91c1c;">${errores.map(err => `<li>${err}</li>`).join('')}</ul>`,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const isEditing = Boolean(formData.id_movilidad);
        const confirmacion = await Swal.fire({
            title: isEditing ? '¿Actualizar vehículo?' : '¿Registrar vehículo?',
            html: `
                <div style="text-align: left; font-size: 14px;">
                    <p><strong>Placa:</strong> ${placa}</p>
                    <p><strong>Marca:</strong> ${formData.marca}</p>
                    <p><strong>Modelo:</strong> ${formData.modelo}</p>
                    <p><strong>Tipo:</strong> ${formData.tipo_vehiculo}</p>
                    <p><strong>Kilometraje:</strong> ${formData.kilometraje_actual} km</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: isEditing ? 'Sí, actualizar' : 'Sí, registrar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) return;

        setIsSubmitting(true);
        try {
            const payload = { ...formData, placa };
            if (isEditing) {
                await movilidadService.update(formData.id_movilidad, payload);
            } else {
                await movilidadService.create(payload);
            }
            await Swal.fire({
                icon: 'success',
                title: isEditing ? '¡Vehículo actualizado!' : '¡Vehículo registrado!',
                text: isEditing ? 'Los cambios se guardaron con éxito.' : 'El vehículo fue registrado exitosamente.',
                timer: 2000,
                showConfirmButton: false
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error en MovilidadForm:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al procesar el vehículo',
                text: error.response?.data?.error || error.response?.data?.message || error.message || 'Ocurrió un error inesperado',
                confirmButtonColor: '#2563eb'
            });
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
