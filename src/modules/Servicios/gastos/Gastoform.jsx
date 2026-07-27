import { useState, useEffect } from 'react';
import { Receipt, Camera, Loader2, Trash2, Save, Plus } from 'lucide-react';
import { gastosService } from '../../../services/gastos.service.js';
import { serviciosService } from '../../../services/service.service.js';

export const ViaticoForm = ({ data, onVolver }) => {
    const [gastos, setGastos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState(data?.id_servicio || '');
    const [cargando, setCargando] = useState(false);
    const [nuevo, setNuevo] = useState({ fecha: '', cat: 'Alimento', desc: '', monto: '' });

    // Cargar servicios al montar el componente
    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const lista = await serviciosService.obtenerTodos();
                setServicios(lista);
            } catch (error) {
                console.error("Error cargando servicios:", error);
            }
        };
        fetchServicios();
    }, []);

    const handleEscanear = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCargando(true);
        const formData = new FormData();
        formData.append('imagen', file);

        try {
            const dataIA = await gastosService.procesarRecibo(formData);
            setNuevo({
                fecha: dataIA.fecha || new Date().toISOString().split('T')[0],
                cat: dataIA.categoria || 'Alimento',
                desc: dataIA.descripcion || '',
                monto: dataIA.monto || ''
            });
        } catch (error) {
            console.error("Error en procesamiento IA:", error);
            alert("No se pudo procesar la imagen.");
        } finally {
            setCargando(false);
        }
    };

    const agregarFila = () => {
        if (!nuevo.fecha || !nuevo.desc || !nuevo.monto) return alert("Completa los campos del gasto");
        setGastos([...gastos, nuevo]);
        setNuevo({ fecha: '', cat: 'Alimento', desc: '', monto: '' });
    };

    const eliminarFila = (index) => {
        setGastos(gastos.filter((_, i) => i !== index));
    };

    const total = gastos.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);

    const guardarTodo = async () => {
        if (!selectedServicio) return alert("Por favor selecciona un servicio");

        try {
            setCargando(true);
            const payload = {
                tipo_origen: 'SERVICIO',
                id_servicio: parseInt(selectedServicio),
                cantidad_recibida: total,
                fecha_cierre: new Date().toISOString().split('T')[0],
                detalles: gastos.map(g => ({
                    fecha_gasto: g.fecha,
                    categoria: g.cat,
                    descripcion: g.desc,
                    monto: parseFloat(g.monto)
                }))
            };

            await gastosService.crear(payload);
            alert("¡Viáticos registrados exitosamente!");
            onVolver();
        } catch (error) {
            console.error(error);
            alert("Error al guardar en el servidor.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <button onClick={onVolver} className="mb-4 text-slate-500 hover:text-slate-800">← Volver</button>
                <h1 className="text-2xl font-bold mb-6 text-slate-800">Registrar Gastos</h1>

                <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Seleccionar Servicio</label>
                    <select
                        value={selectedServicio}
                        onChange={(e) => setSelectedServicio(e.target.value)}
                        className="w-full border p-3 rounded-xl mb-6"
                    >
                        <option value="">-- Seleccione un servicio --</option>
                        {servicios.map(s => (
                            <option key={s.id_servicio} value={s.id_servicio}>
                                {s.id_servicio} - {s.cliente || 'Sin Cliente'} ({s.tipoServicio})
                            </option>
                        ))}
                    </select>

                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Receipt className="text-blue-600" /> Cargar Comprobante</h2>
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition ${cargando ? 'bg-slate-400' : 'bg-slate-800 hover:bg-slate-900'} text-white w-max`}>
                        {cargando ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                        {cargando ? 'Analizando...' : 'Cargar Foto'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleEscanear} />
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                        <input type="date" value={nuevo.fecha} onChange={e => setNuevo({ ...nuevo, fecha: e.target.value })} className="border p-2 rounded-lg" />
                        <select value={nuevo.cat} onChange={e => setNuevo({ ...nuevo, cat: e.target.value })} className="border p-2 rounded-lg">
                            <option>Alimento</option><option>Pasaje</option><option>Hospedaje</option><option>Otros</option>
                        </select>
                        <input type="text" placeholder="Descripción" value={nuevo.desc} onChange={e => setNuevo({ ...nuevo, desc: e.target.value })} className="border p-2 rounded-lg" />
                        <input type="number" placeholder="Monto" value={nuevo.monto} onChange={e => setNuevo({ ...nuevo, monto: e.target.value })} className="border p-2 rounded-lg" />
                    </div>
                    <button onClick={agregarFila} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700">
                        <Plus size={18} /> Agregar a la lista
                    </button>
                </div>

                {gastos.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr><th className="p-4">Fecha</th><th className="p-4">Categoría</th><th className="p-4">Desc</th><th className="p-4">Monto</th><th className="p-4"></th></tr>
                            </thead>
                            <tbody>
                                {gastos.map((g, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-4">{g.fecha}</td><td className="p-4">{g.cat}</td><td className="p-4">{g.desc}</td>
                                        <td className="p-4 font-bold">S/. {parseFloat(g.monto).toFixed(2)}</td>
                                        <td className="p-4 text-right"><button onClick={() => eliminarFila(i)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
                            <span className="text-xl font-bold">Total: S/. {total.toFixed(2)}</span>
                            <button onClick={guardarTodo} disabled={cargando} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition">
                                Finalizar y Guardar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViaticoForm;