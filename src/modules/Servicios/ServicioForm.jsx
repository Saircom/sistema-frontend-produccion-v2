import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { serviciosService } from '../../services/service.service.js';
import { useAuth } from '../../context/authContext.jsx';
const SERVICIOS_TECNICOS = [];
// Asegúrate de importar esto:
// import { SERVICIOS_TECNICOS } from '../../constants'; 

export default function ServicioForm({ cliente, equipos, tecnicos, onClose, onOrderCreated }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        id_equipo: '',
        id_tecnico: '',
        tecnicos_adicionales: [],
        tipo_servicio: '',
        sub_servicio: '',
        fechainicio: '',
        numero_orden: '',
        numero_cotizacion: '',
        tipo_pago: ''
    });

    const [enviando, setEnviando] = useState(false);

    // Asegúrate de que SERVICIOS_TECNICOS esté disponible en el scope
    const subServicios = SERVICIOS_TECNICOS.find(s => s.id === formData.tipo_servicio)?.subservicios || [];

    const agregarTecnicoApoyo = (idTecnico) => {
        if (idTecnico && !formData.tecnicos_adicionales.includes(idTecnico)) {
            setFormData(prev => ({
                ...prev,
                tecnicos_adicionales: [...prev.tecnicos_adicionales, idTecnico]
            }));
        }
    };

    const quitarTecnicoApoyo = (idTecnico) => {
        setFormData(prev => ({
            ...prev,
            tecnicos_adicionales: prev.tecnicos_adicionales.filter(id => id !== idTecnico)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);

        try {
            const payload = {
                id_cliente: cliente.id_cliente,
                id_usuario: Number(formData.id_tecnico),
                tecnicos_adicionales: formData.tecnicos_adicionales.map(Number),
                id_equipo: Number(formData.id_equipo),
                numero_orden: formData.numero_orden || null,
                numero_cotizacion: formData.numero_cotizacion || null,
                tipoServicio: `${formData.tipo_servicio}-${formData.sub_servicio}`,
                fechainicio: formData.fechainicio ? formData.fechainicio.replace('T', ' ') + ':00' : null,
                estado: 'no revisado',
                creado_por: user?.id_usuario,
                tipo_pago: formData.tipo_pago
            };

            await serviciosService.aperturarServicio(payload);
            onOrderCreated();
            onClose();
        } catch (error) {
            console.error("Error al aperturar servicio:", error);
            // Aquí puedes manejar el error de UI (ej: mostrar toast)
        } finally {
            setEnviando(false); // <--- ERROR CORREGIDO: Ya no se llama a "error" aquí
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... resto del JSX igual ... */}

            {/* Info Cliente */}
            <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                <p className="text-[10px] text-green-700 font-bold uppercase">Cliente</p>
                <p className="text-sm font-semibold">{cliente?.razon_social} {cliente?.ruc}</p>
            </div>

            {/* Categorías */}
            <div className="grid grid-cols-2 gap-4">
                <select required className="p-2.5 border rounded-xl text-sm" value={formData.tipo_servicio} onChange={(e) => setFormData({ ...formData, tipo_servicio: e.target.value, sub_servicio: '' })}>
                    <option value="">Categoría...</option>
                    {/* Asegúrate que SERVICIOS_TECNICOS esté definido */}
                    {SERVICIOS_TECNICOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select required className="p-2.5 border rounded-xl text-sm" value={formData.sub_servicio} onChange={(e) => setFormData({ ...formData, sub_servicio: e.target.value })}>
                    <option value="">Detalle...</option>
                    {subServicios.map(sub => <option key={sub.id} value={sub.id}>{sub.label}</option>)}
                </select>
            </div>

            {/* Equipo y resto de inputs */}
            {/* ... Asegúrate de cerrar bien los bloques de comentario ... */}

            <button type="submit" disabled={enviando} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 flex justify-center items-center gap-2">
                {enviando ? <><Loader2 className="animate-spin" size={20} /> Registrando...</> : "Confirmar Apertura"}
            </button>
        </form>
    );
}
