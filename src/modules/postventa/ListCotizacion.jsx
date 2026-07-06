import { useState, useEffect } from 'react';
import { cotizacionService } from '../../services/cotizacion.service';

export const ListCotizacion = () => {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    // Estado para saber qué fila está abierta
    const [expandedRow, setExpandedRow] = useState(null);

    const MAPA_VALORES = { 1: 'Pendiente', 2: 'Enviado', 3: 'Aprobado' };
    const MAPA_INVERSO = { 'Pendiente': 1, 'Enviado': 2, 'Aprobado': 3 };

    const getEstadoStyle = (estado) => {
        const styles = {
            'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Enviado': 'bg-blue-100 text-blue-800 border-blue-200',
            'Aprobado': 'bg-green-100 text-green-800 border-green-200'
        };
        return styles[estado] || 'bg-gray-100 text-gray-800';
    };

    const fetchCotizaciones = async () => {
        try {
            const data = await cotizacionService.getAll();
            setCotizaciones(data);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    useEffect(() => { fetchCotizaciones(); }, []);

    const handleEstadoChange = async (id_servicio, nuevoEstadoLabel) => {
        setUpdating(true);
        try {
            await cotizacionService.updateEstado(id_servicio, {
                estado_cotizacion: MAPA_INVERSO[nuevoEstadoLabel]
            });
            setCotizaciones(prev => prev.map(c =>
                c.id_servicio === id_servicio ? { ...c, estado_cotizacion: MAPA_INVERSO[nuevoEstadoLabel] } : c
            ));
        } catch (err) { alert('Error al actualizar'); } finally { setUpdating(false); }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="p-2 max-w-8xl mx-auto">
            <h1 className="text-xl font-bold mb-2">Panel de Cotizaciones</h1>

            <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 py-2 text-left font-bold text-gray-500 uppercase">ID</th>
                            <th className="px-2 py-2 text-left  font-bold text-gray-500 uppercase">Cliente</th>
                            <th className="px-2 py-2 text-left  font-bold text-gray-500 uppercase">Servicio</th>
                            <th className="px-2 py-2 text-left  font-bold text-gray-500 uppercase">Zona</th>
                            <th className="px-2 py-2 text-left  font-bold text-gray-500 uppercase">Acción</th>
                            <th className="px-2 py-2 text-left  font-bold text-gray-500 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cotizaciones.map((item) => (
                            <>
                                {/* Fila principal */}
                                <tr key={item.id_servicio} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-2 py-2 text-gray-500">{item.id_servicio}</td>
                                    <td className="px-2 py-2 font-semibold text-gray-900">{item.razon_social}</td>
                                    <td className="px-2 py-2 text-gray-600">{item.tipoServicio}</td>
                                    <td className="px-2 py-2 text-gray-600">{item.zona}</td>
                                    <td className="px-2 py-2">
                                        <button
                                            onClick={() => setExpandedRow(expandedRow === item.id_servicio ? null : item.id_servicio)}
                                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                        >
                                            {expandedRow === item.id_servicio ? 'Ocultar' : 'Ver detalle'}
                                        </button>
                                    </td>
                                    <td className="px-2 py-2">
                                        <select
                                            value={MAPA_VALORES[item.estado_cotizacion]}
                                            onChange={(e) => handleEstadoChange(item.id_servicio, e.target.value)}
                                            className={`text-xs px-2 py-1 rounded-full border ${getEstadoStyle(MAPA_VALORES[item.estado_cotizacion])}`}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Enviado">Enviado</option>
                                            <option value="Aprobado">Aprobado</option>
                                        </select>
                                    </td>
                                </tr>

                                {/* Fila de expansión (Desplegable) */}
                                {expandedRow === item.id_servicio && (
                                    <tr className="bg-blue-50/50">
                                        <td colSpan="5" className="px-6 py-4 text-sm text-gray-700 animate-in fade-in duration-300">
                                            <div className="flex flex-col gap-2">
                                                <span className="font-bold text-xs uppercase text-gray-500">Recomendaciones:</span>
                                                <p className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                                                    {item.recomendaciones || 'No hay información adicional.'}
                                                </p>
                                                <div className="text-xs text-gray-400 mt-1">Zona: {item.zona}</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default ListCotizacion;
