/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movilidadService } from '../../services/movilidad.service';
import { ArrowLeft, Wrench, FileText, AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import MantenimientoForm from './MantenimientoForm';
import DocumentosForm from './DocumentosForm';

export const MovilidadDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movilidad, setMovilidad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const tiposDocumentos = ['SOAT', 'Revision Tecnica', 'Tarjeta Propiedad', 'Lunas Polarizadas'];

    const cargarMovilidad = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await movilidadService.getById(id);
            setMovilidad(data);
        } catch (error) {
            console.error("Error cargando movilidad:", error);
            setMovilidad(null);
            setError(error?.response?.data?.message || 'No se pudo cargar la movilidad');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        cargarMovilidad();
    }, [cargarMovilidad]);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando movilidad...</div>;
    if (error || !movilidad) return (
        <div className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                <p className="font-semibold">No se pudo cargar la movilidad</p>
                <p className="mt-1 text-sm">{error || 'Movilidad no encontrada'}</p>
                <button type="button" onClick={() => navigate(-1)} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Volver</button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 max-w-8xl">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
                    <ArrowLeft className="w-5 h-5" /> Volver
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setSelectedDoc(null); setIsDocModalOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" /> Nuevo Documento
                    </button>
                    <button
                        onClick={() => setIsMaintModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Wrench className="w-4 h-4" /> Nuevo Mantenimiento
                    </button>
                </div>
            </div>

            {/* INFORMACION VEHICULO */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border">
                <h2 className="text-xl font-bold mb-4">Vehículo: {movilidad?.placa || "Cargando..."}</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <InfoItem label="Marca" value={movilidad?.marca} />
                    <InfoItem label="Modelo" value={movilidad?.modelo} />
                    <InfoItem label="Tipo" value={movilidad?.tipo_vehiculo} />
                    <InfoItem label="Kilometraje" value={`${movilidad?.kilometraje_actual || 0} km`} />
                    <InfoItem label="Estado" value={movilidad?.estado_disponibilidad} />
                </div>
            </div>

            <AlertaMantenimiento movilidad={movilidad} />

            {/* DOCUMENTOS */}
            {/* DOCUMENTOS */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Documentos del Vehículo</h3>
                </div>

                <div className="bg-white shadow rounded border overflow-x-auto">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Documento</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Vencimiento</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Archivo</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y">
                            {tiposDocumentos.map((doc) => {
                                const documento = movilidad?.documentos?.find(item => item.tipo_documento === doc);
                                const estado = getEstadoDocumento(documento?.fecha_vencimiento);

                                return (
                                    <tr key={doc}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{doc}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {documento?.fecha_vencimiento ? new Date(documento.fecha_vencimiento).toLocaleDateString() : "---"}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estado.color}`}>
                                                {estado.texto}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {documento?.url_archivo ? (
                                                <a
                                                    // Esto convierte la URL para forzar la descarga sin importar cómo se subió
                                                    href={documento.url_archivo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Ver / descargar documento
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Sin archivo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            <button
                                                onClick={() => {
                                                    setSelectedDoc(documento || { tipo_documento: doc });
                                                    setIsDocModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Actualizar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MANTENIMIENTOS */}
            <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Historial de Mantenimientos</h3>
                <div className="bg-white shadow rounded border overflow-x-auto">
                    {movilidad?.historial_mantenimientos?.length > 0 ? (
                        <table className="min-w-full divide-y">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Km</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Trabajo</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y">
                                {movilidad.historial_mantenimientos.map((m) => (
                                    <tr key={m.id}>
                                        <td className="px-6 py-4 text-sm">{new Date(m.fecha_mantenimiento).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm font-semibold">{m.tipo}</td>
                                        <td className="px-6 py-4 text-sm">{m.kilometraje_al_momento} km</td>
                                        <td className="px-6 py-4 text-sm">{m.descripcion_trabajo}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 italic">{m.observaciones || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-6 text-center text-gray-500">No hay registros de mantenimiento.</p>
                    )}
                </div>
            </div>

            {/* MODALES */}
            <Modal isOpen={isMaintModalOpen} onClose={() => setIsMaintModalOpen(false)} title="Registrar Mantenimiento">
                <MantenimientoForm movilidad_id={id} kilometraje_actual={movilidad?.kilometraje_actual} onSuccess={() => { setIsMaintModalOpen(false); cargarMovilidad(); }} />
            </Modal>

            <Modal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} title={selectedDoc ? `Actualizar ${selectedDoc.tipo_documento}` : "Nuevo Documento"}>
                <DocumentosForm movilidadId={id} documento={selectedDoc} onSuccess={() => { setIsDocModalOpen(false); cargarMovilidad(); }} />
            </Modal>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-400 uppercase">{label}</p>
        <p className="font-semibold">{value || "N/A"}</p>
    </div>
);

const AlertaMantenimiento = ({ movilidad }) => {
    const estado = movilidad.alerta_mantenimiento?.estado || 'Sin programar';
    const configuracion = estado === 'Vencido'
        ? { icono: AlertTriangle, clase: 'border-red-300 bg-red-50 text-red-900', titulo: 'Mantenimiento vencido' }
        : estado === 'Proximo'
            ? { icono: CalendarClock, clase: 'border-amber-300 bg-amber-50 text-amber-900', titulo: 'Mantenimiento próximo' }
            : estado === 'Al dia'
                ? { icono: CheckCircle2, clase: 'border-emerald-300 bg-emerald-50 text-emerald-900', titulo: 'Mantenimiento al día' }
                : { icono: CalendarClock, clase: 'border-gray-300 bg-gray-50 text-gray-700', titulo: 'Próximo mantenimiento sin programar' };
    const Icono = configuracion.icono;
    const fecha = movilidad.proxima_fecha_mantenimiento
        ? new Date(`${String(movilidad.proxima_fecha_mantenimiento).slice(0, 10)}T00:00:00`).toLocaleDateString()
        : 'Sin fecha';
    return (
        <div className={`mb-6 flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center ${configuracion.clase}`}>
            <Icono className="h-8 w-8 shrink-0" />
            <div className="flex-1">
                <h3 className="font-bold">{configuracion.titulo}</h3>
                <p className="text-sm">Fecha: {fecha} · Meta: {movilidad.proximo_kilometraje ? `${Number(movilidad.proximo_kilometraje).toLocaleString()} km` : 'sin kilometraje'}</p>
                {movilidad.alerta_mantenimiento?.dias_restantes != null && <p className="text-xs">{movilidad.alerta_mantenimiento.dias_restantes >= 0 ? `Faltan ${movilidad.alerta_mantenimiento.dias_restantes} días` : `Venció hace ${Math.abs(movilidad.alerta_mantenimiento.dias_restantes)} días`}</p>}
            </div>
        </div>
    );
};

const getEstadoDocumento = (fecha) => {
    if (!fecha) return { texto: "No definido", color: "bg-gray-100 text-gray-600" };
    const vencimiento = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const dias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    if (dias < 0) return { texto: "Vencido", color: "bg-red-100 text-red-800" };
    if (dias <= 30) return { texto: `Por vencer (${dias} días)`, color: "bg-yellow-100 text-yellow-800" };
    return { texto: "Vigente", color: "bg-green-100 text-green-800" };
};

export default MovilidadDetalle;
