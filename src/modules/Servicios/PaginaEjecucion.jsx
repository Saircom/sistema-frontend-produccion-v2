import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import EstacionarioForm from '../ServicioTecnico/EstacionarioForm'; // Tu componente de formulario

export default function PaginaEjecucion() {
    const { id_servicio } = useParams();
    const location = useLocation();
    const [formData, setFormData] = useState(location.state?.servicio || {});

    // Si refrescan la página, el state se pierde, por eso cargamos el servicio por ID
    useEffect(() => {
        if (!location.state?.servicio && id_servicio) {
            // Aquí llamarías a tu servicio para obtener los datos si el state es null
            serviciosService.getById(id_servicio).then(res => {
                if (res?.success) setFormData(res.data);
            });
        }
    }, [id_servicio, location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (data) => {
        console.log("Guardando datos:", data);
        // Aquí tu lógica para llamar a serviciosService.update(id_servicio, data)
    };

    return (
        <div className="p-8">
            <EstacionarioForm
                formData={formData}
                handleChange={handleChange}
                onSaveFullForm={handleSave}
            />
        </div>
    );
}