import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { serviciosService } from '../../../services/service.service';

export const HistorialInformes = () => {
    const { serie } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [historial, setHistorial] = useState(location.state?.historial || []);
    const [loading, setLoading] = useState(!location.state?.historial);
    const [error, setError] = useState(null);
    
    const [busqueda, setBusqueda] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('Todos');

    useEffect(() => {
        if (location.state?.historial) return;
        const fetchHistorial = async () => {
            try {
                setLoading(true);
                const data = await serviciosService.getHistorialPorSerie(serie);
                setHistorial(data);
            } catch (err) {
                setError("Error al cargar los informes.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistorial();
    }, [serie, location.state]);

    const informesFiltrados = useMemo(() => {
        return historial.filter(item => {
            const coincideBusqueda = item.descripcionTrabajo?.toLowerCase().includes(busqueda.toLowerCase());
            const coincideTipo = tipoFiltro === 'Todos' || item.tipoServicio === tipoFiltro;
            return coincideBusqueda && coincideTipo;
        });
    }, [historial, busqueda, tipoFiltro]);

    const tiposUnicos = ['Todos', ...new Set(historial.map(item => item.tipoServicio))];

    if (loading) return <div className="flex justify-center p-10 text-lg">Cargando informes...</div>;
    if (error) return <div className="text-center p-10 text-red-600">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
            <button 
                onClick={() => navigate(-1)} 
                className="mb-6 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
            >
                &larr; Volver
            </button>

            <header className="mb-8">
                {/* Se eliminó inf.marca/modelo del h1 porque no están disponibles en este scope */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 truncate">
                    Historial de Serie: {serie}
                </h1>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="text" 
                        placeholder="Buscar por descripción..." 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <select 
                        className="w-full sm:w-auto p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setTipoFiltro(e.target.value)}
                    >
                        {tiposUnicos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                    </select>
                </div>
            </header>

            <div className="space-y-4">
                {informesFiltrados.length > 0 ? (
                    informesFiltrados.map((inf) => (
                        <div key={inf.id || inf.id_servicio} className="bg-white p-5 md:p-6 rounded-xl shadow-sm border-l-4 border-blue-600 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                                    Servicio #{inf.id_servicio}
                                </h3>
                                <span className="text-xs md:text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-max">
                                    {inf.fechainicio}
                                </span>
                            </div>
                            <p className="text-blue-700 font-medium mb-2">{inf.tipoServicio}</p>
                            <p className="text-gray-700 mb-4 break-words">{inf.descripcionTrabajo}</p>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Recomendaciones:</p>
                                <p className="text-sm text-blue-800 break-words">{inf.recomendaciones}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No se encontraron informes que coincidan con los filtros.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialInformes;