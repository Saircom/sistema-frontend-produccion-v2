import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movilidadService } from '../../services/movilidad.service';
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { Plus, Edit2, Eye } from 'lucide-react'; // Eliminamos Wrench de aquí
import MovilidadForm from './MovilidadForm';
import Modal from '../../components/ui/Modal';

export const MovilidadList = () => {
    const navigate = useNavigate();
    const [movilidades, setMovilidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovilidad, setEditingMovilidad] = useState(null);

    const fetchMovilidades = async () => {
        try {
            setLoading(true);
            const data = await movilidadService.getAll();
            setMovilidades(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Error al cargar la lista de movilidades");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovilidades();
    }, []);

    const formatDateValue = (value) => {
        if (!value) return '-';
        const text = String(value).trim();
        const dateOnly = text.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
            const [year, month, day] = dateOnly.split('-');
            return `${day}/${month}/${year}`;
        }
        return text;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const totalPorEstado = estado => movilidades.filter(m => m.alerta_mantenimiento?.estado === estado).length;

    return (
        <div className="container mx-auto p-2">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-800">Lista de Movilidades</h1>
                <button
                    onClick={() => { setEditingMovilidad(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
                >
                    <Plus className="w-5 h-5" /> Nueva Movilidad
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMovilidad ? "Actualizar Vehículo" : "Registrar Vehículo"}>
                <MovilidadForm movilidadData={editingMovilidad} onSuccess={() => { setIsModalOpen(false); fetchMovilidades(); }} />
            </Modal>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <ResumenAlerta icon={AlertTriangle} titulo="Mantenimientos vencidos" cantidad={totalPorEstado('Vencido')} color="red" />
                <ResumenAlerta icon={CalendarClock} titulo="Próximos a vencer" cantidad={totalPorEstado('Proximo')} color="amber" />
                <ResumenAlerta icon={CheckCircle2} titulo="Mantenimientos al día" cantidad={totalPorEstado('Al dia')} color="emerald" />
            </div>

            <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Tipo', 'Placa', 'Marca', 'Km', 'Estado', 'Próximo mantenimiento', 'Alerta', 'Acciones'].map((h, i) => (
                                <th key={i} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-xs">
                        {movilidades.map((m) => (
                            <tr key={m.id_movilidad} className="hover:bg-gray-50">
                                <td className="px-3 py-2">{m.tipo_vehiculo}</td>
                                <td className="px-3 py-2 font-medium">{m.placa}</td>
                                <td className="px-3 py-2">{m.marca}</td>
                                <td className="px-3 py-2">{m.kilometraje_actual}</td>
                                <td className="px-3 py-2"><span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">{m.estado_disponibilidad}</span></td>
                                <td className="px-3 py-2">
                                    <div>{formatDateValue(m.proxima_fecha_mantenimiento)}</div>
                                    <div className="text-gray-400">{m.proximo_kilometraje ? `${Number(m.proximo_kilometraje).toLocaleString()} km` : 'Sin km programado'}</div>
                                </td>
                                <td className="px-3 py-2"><EstadoMantenimiento alerta={m.alerta_mantenimiento} /></td>
                                <td className="px-3 py-2 flex gap-2">
                                    <button onClick={() => navigate(`/movilidad/${m.id_movilidad}`)} className="text-gray-600 hover:text-black" title="Ver detalles"><Eye className="w-4 h-4" /></button>
                                    <button onClick={() => { setEditingMovilidad(m); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const coloresResumen = {
    red: 'border-red-200 bg-red-50 text-red-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800'
};

const ResumenAlerta = ({ icon: Icon, titulo, cantidad, color }) => (
    <div className={`flex items-center gap-3 rounded-xl border p-4 ${coloresResumen[color]}`}>
        <Icon className="h-6 w-6" />
        <div><p className="text-2xl font-bold">{cantidad}</p><p className="text-xs font-semibold">{titulo}</p></div>
    </div>
);

const EstadoMantenimiento = ({ alerta }) => {
    const estado = alerta?.estado || 'Sin programar';
    const colores = estado === 'Vencido' ? 'bg-red-100 text-red-800'
        : estado === 'Proximo' ? 'bg-amber-100 text-amber-800'
            : estado === 'Al dia' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600';
    const detalle = alerta?.kilometros_restantes != null
        ? `${Math.max(0, alerta.kilometros_restantes).toLocaleString()} km restantes`
        : alerta?.dias_restantes != null ? `${Math.max(0, alerta.dias_restantes)} días restantes` : '';
    return <div><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${colores}`}>{estado}</span>{detalle && <p className="mt-1 text-[10px] text-gray-500">{detalle}</p>}</div>;
};

export default MovilidadList;
