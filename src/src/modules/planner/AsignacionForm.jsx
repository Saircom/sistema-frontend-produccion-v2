/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo } from 'react';
import { Trash2, UserPlus, Save } from 'lucide-react';
import { movilidadService } from '../../services/movilidad.service';

export const AsignacionForm = ({ tecnicos, liderInicial = "", movilidadInicial = "", apoyoInicial = [], onSubmit }) => {
    const [lider, setLider] = useState(String(liderInicial || ""));
    const [movilidad, setMovilidad] = useState(String(movilidadInicial ?? ""));
    const [apoyo, setApoyo] = useState(apoyoInicial.map(String));
    const [movilidades, setMovilidades] = useState([]);
    const tecnicosValidos = useMemo(() => tecnicos.filter(t => (
        String(t?.nombre_rol ?? t?.rol ?? '').trim().toUpperCase() === 'TECNICO'
        && Number(t?.estado) === 1
    )), [tecnicos]);

    // Filtra técnicos que ya fueron seleccionados para evitar duplicados
    const agregarApoyo = () => setApoyo([...apoyo, ""]);

    const actualizarApoyo = (index, value) => {
        const nuevosApoyos = [...apoyo];
        nuevosApoyos[index] = value;
        setApoyo(nuevosApoyos);
    };

    const eliminarApoyo = (index) => setApoyo(apoyo.filter((_, i) => i !== index));

    useEffect(() => {
        const cargarMovilidades = async () => {
            try {
                const data = await movilidadService.getAll();
                // Asumiendo que data es directamente el array
                setMovilidades(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error al cargar movilidades:', error);
            }
        };
        cargarMovilidades();
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Asignar Equipo Técnico</h2>

            <div className="space-y-6">
                {/* Selección de Líder */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Técnico Líder</label>
                    <select
                        value={lider}
                        onChange={(e) => setLider(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">Seleccione un líder...</option>
                        {tecnicosValidos.map(t => (
                            <option key={t.id_usuario} value={t.id_usuario}>{t.nombres} {t.apellidos}</option>
                        ))}
                    </select>
                </div>

                {/* Selección de Apoyos */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Técnicos de Apoyo</label>
                        <button type="button" onClick={agregarApoyo} className="text-indigo-600 flex items-center gap-1 text-xs font-bold hover:underline">
                            <UserPlus size={14} /> Añadir
                        </button>
                    </div>

                    <div className="space-y-2">
                        {apoyo.map((val, index) => (
                            <div key={index} className="flex gap-2">
                                <select
                                    value={val}
                                    onChange={(e) => actualizarApoyo(index, e.target.value)}
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seleccione técnico...</option>
                                    {tecnicosValidos.map(t => (
                                        <option key={t.id_usuario} value={t.id_usuario} disabled={
                                            String(t.id_usuario) === String(lider)
                                            || apoyo.some((id, i) => i !== index && String(id) === String(t.id_usuario))
                                        }>
                                            {t.nombres} {t.apellidos}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={() => eliminarApoyo(index)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selección de Movilidad */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Movilidad</label>
                    <select
                        value={movilidad}
                        onChange={(e) => setMovilidad(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">Seleccione una movilidad...</option>
                        {movilidades.map((m) => (
                            <option 
                                key={m.id_movilidad} 
                                value={m.id_movilidad}
                                disabled={m.estado_disponibilidad === 'Ocupado' && String(m.id_movilidad) !== String(movilidadInicial)}
                            >
                                {m.placa} - {m.marca} ({m.estado_disponibilidad})
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => onSubmit({ lider, apoyo, movilidad })}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                    <Save size={18} /> Guardar Asignación
                </button>
            </div>
        </div>
    );
};
