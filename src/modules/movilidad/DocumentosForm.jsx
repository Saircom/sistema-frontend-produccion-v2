import React, { useEffect, useState } from 'react';
import { movilidadService } from '../../services/movilidad.service';

export const DocumentosForm = ({ movilidadId, documento, onSuccess }) => {

    const [formData, setFormData] = useState({
        tipo_documento: '',
        fecha_emision: '',
        fecha_vencimiento: ''
    });

    const [archivo, setArchivo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fecha = valor => valor ? String(valor).split('T')[0] : '';
        setFormData({
            tipo_documento: documento?.tipo_documento || '',
            fecha_emision: fecha(documento?.fecha_emision),
            fecha_vencimiento: fecha(documento?.fecha_vencimiento)
        });
        setArchivo(null);
    }, [documento]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e) => {
        setArchivo(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!movilidadId) {
            alert("No se recibió el ID de la movilidad.");
            return;
        }

        if (!archivo) {
            alert("Seleccione un archivo.");
            return;
        }

        setIsSubmitting(true);

        try {

            const form = new FormData();

            form.append("tipo_documento", formData.tipo_documento);
            form.append("fecha_emision", formData.fecha_emision);
            form.append("fecha_vencimiento", formData.fecha_vencimiento);
            form.append("archivo", archivo);

            console.log("Movilidad ID:", movilidadId);

            await movilidadService.addDocumento(
                movilidadId,
                form
            );

            alert("Documento registrado correctamente.");

            setFormData({
                tipo_documento: '',
                fecha_emision: '',
                fecha_vencimiento: ''
            });

            setArchivo(null);

            // Limpia el input file
            const input = document.getElementById("archivo");
            if (input) input.value = "";

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Error al registrar documento."
            );

        } finally {

            setIsSubmitting(false);

        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 bg-white rounded-lg shadow space-y-4"
        >

            <h2 className="text-xl font-bold">
                Registrar Documento
            </h2>

            <div>
                <label className="block mb-1">
                    Tipo de Documento
                </label>

                <input
                    type="text"
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleChange}
                    readOnly={Boolean(documento)}
                    className={`w-full rounded border p-2 ${documento ? 'border-blue-200 bg-blue-50 font-semibold text-blue-800' : ''}`}
                    placeholder="SOAT, Revisión Técnica..."
                    required
                />
            </div>

            <div>
                <label className="block mb-1">
                    Fecha de Emisión
                </label>

                <input
                    type="date"
                    name="fecha_emision"
                    value={formData.fecha_emision}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                />
            </div>

            <div>
                <label className="block mb-1">
                    Fecha de Vencimiento
                </label>

                <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    required
                />
            </div>

            <div>
                <label className="block mb-1">
                    Documento
                </label>

                <input
                    id="archivo"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="w-full"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
                {isSubmitting ? "Guardando..." : "Guardar Documento"}
            </button>

        </form>
    );
};

export default DocumentosForm;
