import React, { useState, useEffect, useMemo } from 'react';
import { serviciosService } from '../../../services/service.service';
import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay, parseISO, getHours } from 'date-fns';
import { es } from 'date-fns/locale';

const HORAS = Array.from({ length: 15 }, (_, i) => i + 8);

// Configuración de colores según estado
const ESTADO_CONFIG = {
    'Programado': { bg: 'bg-blue-50', border: 'border-blue-600', text: 'text-blue-900' },
    'Cliente': { bg: 'bg-amber-50', border: 'border-amber-600', text: 'text-amber-900' },
    'En proceso': { bg: 'bg-purple-50', border: 'border-purple-600', text: 'text-purple-900' },
    'Finalizado': { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-600' },
    'SinAsignar': { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-900' },
};

// --- COMPONENTE MODAL PROFESIONAL ---
const ModalDetalle = ({ evento, onClose }) => {
    if (!evento) return null;

    const tieneTecnico = evento.tecnico_nombres && evento.tecnico_nombres.trim() !== "";
    const config = !tieneTecnico
        ? ESTADO_CONFIG['SinAsignar']
        : (ESTADO_CONFIG[evento.estado_actual] || ESTADO_CONFIG['Programado']);

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-teal-800 p-5 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">Detalle del Servicio</h3>
                    <button onClick={onClose} className="hover:bg-teal-700 p-1 rounded-full transition-colors">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Servicio</p>
                        <p className="font-semibold text-gray-800"> N° {evento.id_servicio}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cliente</p>
                        <p className="font-semibold text-gray-800">{evento.cliente_razon_social}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Encargada</p>
                            <p className="text-sm font-medium">{evento.creador_nombres} {evento.creador_apellidos}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Técnico</p>
                            <p className="text-sm font-medium">{tieneTecnico ? `${evento.tecnico_nombres} ${evento.tecnico_apellidos}` : "No asignado"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Estado</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.bg} ${config.text} border ${config.border}`}>
                                {!tieneTecnico ? "Sin Técnico" : evento.estado_actual}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="text-sm font-bold text-teal-800 hover:text-teal-900 transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export const CalendarioProfesional = () => {
    const [eventos, setEventos] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    const semana = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [currentDate]);

    const cargarServicios = async () => {
        try {
            const response = await serviciosService.getAll();
            setEventos(response.data.map(item => ({ ...item, dateObj: item.fechainicio ? parseISO(item.fechainicio) : null })));
        } catch (error) { console.error("Error:", error); }
    };

    useEffect(() => {
        // 1. Carga inicial
        cargarServicios();

        // 2. Configurar intervalo (ejemplo: cada 30 segundos)
        const interval = setInterval(() => {
            cargarServicios();
        }, 2000);

        // 3. Limpieza: Importante para evitar fugas de memoria 
        // cuando el componente se desmonte
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Calendario de Servicios</h2>
                <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                    <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="px-3 py-1 hover:bg-gray-100 rounded">Anterior</button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 font-bold">Hoy</button>
                    <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="px-3 py-1 hover:bg-gray-100 rounded">Siguiente</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-[60px_repeat(7,_1fr)] min-w-[800px]">
                    <div className="p-3 border-b border-r bg-gray-50 text-[10px] font-bold text-gray-400 uppercase text-center">Hora</div>
                    {semana.map(dia => (
                        <div key={dia.toString()} className="p-3 text-center border-b border-r bg-gray-50">
                            <p className="text-[10px] uppercase text-gray-500 font-medium">{format(dia, 'eee', { locale: es })}</p>
                            <p className="font-bold text-sm text-gray-900">{format(dia, 'd')}</p>
                        </div>
                    ))}

                    {HORAS.map(hora => (
                        <React.Fragment key={hora}>
                            <div className="p-2 border-r border-b text-center text-[10px] text-gray-400 bg-gray-50 flex items-center justify-center font-bold">
                                {hora}:00
                            </div>
                            {semana.map(dia => (
                                <div key={dia.toString()} className="border-b border-r h-24 p-1 relative hover:bg-gray-50 transition-colors">
                                    {eventos
                                        .filter(e => e.dateObj && isSameDay(e.dateObj, dia) && getHours(e.dateObj) === hora)
                                        .map(ev => {
                                            const tieneTecnico = ev.tecnico_nombres && ev.tecnico_nombres.trim() !== "";
                                            const config = !tieneTecnico
                                                ? ESTADO_CONFIG['SinAsignar']
                                                : (ESTADO_CONFIG[ev.estado_actual] || ESTADO_CONFIG['Programado']);

                                            return (
                                                <div key={ev.id_servicio} onClick={() => setSelectedEvent(ev)}
                                                    className={`absolute inset-1 p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02] border-l-4 shadow-sm ${config.bg} ${config.border} ${config.text}`}>
                                                    <p className="text-[10px] font-bold uppercase truncate">#{ev.id_servicio}</p>
                                                    <p className="text-[10px] font-bold uppercase truncate">{ev.tipoServicio}</p>
                                                    <p className="text-[10px] truncate">{ev.cliente_razon_social}</p>
                                                    <p className="text-[10px] truncate font-medium">
                                                        {tieneTecnico ? ev.tecnico_nombres : "Sin técnico"}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <ModalDetalle evento={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>
    );
};

export default CalendarioProfesional;