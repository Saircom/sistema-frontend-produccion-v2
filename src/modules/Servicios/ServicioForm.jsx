import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { serviciosService } from '../../services/service.service.js';
import { SERVICIOS_TECNICOS } from '../ServicioTecnico/Data.jsx';
import { useAuth } from '../../context/authContext.jsx';

export default function ServicioForm({ cliente, equipos, tecnicos, onClose, onOrderCreated }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        id_equipo: '',
        id_tecnico: '',          // Líder
        tecnicos_adicionales: [],    // Apoyo (Array de IDs)
        tipo_servicio: '',
        sub_servicio: '',
        fechainicio: '',
        numero_orden: '',
        numero_cotizacion: '',
        tipo_pago: ''
    });

    const [enviando, setEnviando] = useState(false);

    // Obtener subservicios basados en la categoría seleccionada
    const subServicios = SERVICIOS_TECNICOS.find(s => s.id === formData.tipo_servicio)?.subservicios || [];

    // Funciones para manejar técnicos de apoyo
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
                creado_por: user?.id,
                tipo_pago: formData.tipo_pago // <--- Incluido en el payload
            };

            await serviciosService.aperturarServicio(payload);
            onOrderCreated();
            onClose();
        } catch (error) {
            console.log("================================");
            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);
            console.log("HEADERS:", error.response?.headers);
            console.log("REQUEST:", error.config?.data);
            console.log(error);
        } finally {
            console.log(error);
            setEnviando(false);
        }
    };



    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info Cliente */}
            <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                <p className="text-[10px] text-green-700 font-bold uppercase">Cliente</p>
                <p className="text-sm font-semibold">{cliente?.razon_social} {cliente?.ruc}</p>
            </div>

            {/* Categorías */}
            <div className="grid grid-cols-2 gap-4">
                <select required className="p-2.5 border rounded-xl text-sm" value={formData.tipo_servicio} onChange={(e) => setFormData({ ...formData, tipo_servicio: e.target.value, sub_servicio: '' })}>
                    <option value="">Categoría...</option>
                    {SERVICIOS_TECNICOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select required className="p-2.5 border rounded-xl text-sm" value={formData.sub_servicio} onChange={(e) => setFormData({ ...formData, sub_servicio: e.target.value })}>
                    <option value="">Detalle...</option>
                    {subServicios.map(sub => <option key={sub.id} value={sub.id}>{sub.label}</option>)}
                </select>
            </div>

            {/* Técnicos 
            <div className="space-y-3">
                <select required className="w-full p-2.5 border rounded-xl text-sm" value={formData.id_tecnico} onChange={(e) => setFormData({ ...formData, id_tecnico: e.target.value })}>
                    <option value="">Seleccionar Técnico Líder...</option>
                    {tecnicos.map(t => <option key={t.id_usuario} value={t.id_usuario}>{t.nombres} {t.apellidos}</option>)}
                </select>

                <div className="border p-2 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase ml-1 mb-1">Técnicos de Apoyo</p>
                    <select
                        className="w-full p-2 text-sm border-none focus:ring-0"
                        value=""
                        onChange={(e) => {
                            agregarTecnicoApoyo(e.target.value);
                        }}
                    >
                        <option value="">+ Añadir técnico de apoyo...</option>
                        {tecnicos
                            .filter(t => t.id_usuario != formData.id_tecnico && !formData.tecnicos_adicionales.includes(String(t.id_usuario)))
                            .map(t => <option key={t.id_usuario} value={t.id_usuario}>{t.nombres} {t.apellidos}</option>)
                        }
                    </select>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tecnicos_adicionales.map(id => {
                            const tech = tecnicos.find(t => String(t.id_usuario) === id);
                            return (
                                <span key={id} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                                    {tech?.nombres}
                                    <button type="button" onClick={() => quitarTecnicoApoyo(id)}><X size={14} /></button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div> 
            /

            {/* Equipo */}
            <select required className="w-full p-2.5 border rounded-xl text-sm" value={formData.id_equipo} onChange={(e) => setFormData({ ...formData, id_equipo: e.target.value })}>
                <option value="">Seleccionar equipo...</option>
                {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.marca}-{eq.modelo}-{eq.serie}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-4">
                <input type="text" className="p-2.5 border rounded-xl text-sm" placeholder="N° Orden" value={formData.numero_orden} onChange={(e) => setFormData({ ...formData, numero_orden: e.target.value })} />
                <input type="text" className="p-2.5 border rounded-xl text-sm" placeholder="N° Cotización" value={formData.numero_cotizacion} onChange={(e) => setFormData({ ...formData, numero_cotizacion: e.target.value })} />
            </div>

            {/* ... después del campo de fecha o donde prefieras */}
            <select
                required
                className="w-full p-2.5 border rounded-xl text-sm"
                value={formData.tipo_pago}
                onChange={(e) => setFormData({ ...formData, tipo_pago: e.target.value })}
            >
                <option value="">Seleccionar tipo de pago...</option>
                <option value="facturado">Facturado</option>
                <option value="cortesia">Cortesía</option>
                <option value="garantia">Garantía</option>
            </select>
            <input type="datetime-local" required className="w-full p-2.5 border rounded-xl text-sm" value={formData.fechainicio} onChange={(e) => setFormData({ ...formData, fechainicio: e.target.value })} />

            <button type="submit" disabled={enviando} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 flex justify-center items-center gap-2">
                {enviando ? <><Loader2 className="animate-spin" size={20} /> Registrando...</> : "Confirmar Apertura"}
            </button>
        </form>
    );
}