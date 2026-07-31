/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import CotizacionService from '../../services/cotizaciones.service.js';
import CotizacionForm from './CotizacionForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useAuth } from '../../context/authContext.jsx';

// --- Helpers de presentación ---

const ESTADO_STYLES = {
    'borrador': 'bg-gray-100 text-gray-700 ring-gray-300',
    'pendiente': 'bg-yellow-100 text-yellow-700 ring-yellow-300',
    'enviada': 'bg-blue-100 text-blue-700 ring-blue-300',
    'aprobada': 'bg-green-100 text-green-700 ring-green-300',
    'rechazada': 'bg-red-100 text-red-700 ring-red-300',
};

const ESTADOS_COTIZACION = ['borrador', 'enviada', 'aprobada', 'rechazada'];
const TRANSICIONES_COTIZACION = {
    borrador: ['enviada'],
    enviada: ['aprobada', 'rechazada'],
    aprobada: [],
    rechazada: []
};

const puedeTransicionar = (estadoActual, nuevoEstado) => {
    const actual = String(estadoActual || 'borrador').toLowerCase();
    return nuevoEstado === actual
        || (TRANSICIONES_COTIZACION[actual] ?? []).includes(nuevoEstado);
};

const EstadoBadge = ({ estado }) => {
    const key = (estado || '').toLowerCase();
    const style = ESTADO_STYLES[key] || 'bg-gray-100 text-gray-700 ring-gray-300';
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset capitalize ${style}`}>
            {estado || 'Sin estado'}
        </span>
    );
};

const formatFecha = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- Modal de detalle de cotización ---

const CotizacionDetalleModal = ({ isOpen, onClose, cotizacion, loading, canEdit, onEdit }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Cotización N° ${cotizacion?.numero_cotizacion ?? ''}`}>
            {!cotizacion ? (
                <div className="py-10 text-center text-gray-500 text-sm">No se encontró información.</div>
            ) : (
                <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">

                    {loading && (
                        <div className="text-xs text-blue-500 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                            Cargando detalle completo...
                        </div>
                    )}

                    {/* Cabecera de datos generales */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Cliente</p>
                            <p className="text-sm font-semibold text-gray-800">{cotizacion.nombre_cliente || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Tipo de pago</p>
                            <p className="text-sm font-semibold text-gray-800 capitalize">{cotizacion.tipo_pago || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Centro de costo</p>
                            <p className="text-sm font-semibold text-gray-800 capitalize">{cotizacion.centro_costo || '—'}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Fecha de registro</p>
                            <p className="text-sm font-semibold text-gray-800">{formatFecha(cotizacion.fecha_registro)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Estado</p>
                            <EstadoBadge estado={cotizacion.estado} />
                        </div>
                        <div><p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">RUC</p><p className="text-sm font-semibold text-gray-800">{cotizacion.ruc || '—'}</p></div>
                        <div><p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Contacto</p><p className="text-sm font-semibold text-gray-800">{cotizacion.contacto || '—'}</p></div>
                        <div><p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Celular</p><p className="text-sm font-semibold text-gray-800">{cotizacion.celular || '—'}</p></div>
                        <div><p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Correo</p><p className="break-all text-sm font-semibold text-gray-800">{cotizacion.correo || '—'}</p></div>
                        <div className="col-span-2"><p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Dirección</p><p className="text-sm font-semibold text-gray-800">{cotizacion.direccion || '—'}</p></div>
                        <div><p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Ubicación</p><p className="text-sm font-semibold text-gray-800">{[cotizacion.distrito, cotizacion.provincia, cotizacion.departamento].filter(Boolean).join(', ') || '—'}</p></div>
                        {cotizacion.nota && (
                            <div className="col-span-2 sm:col-span-3">
                                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Nota</p>
                                <p className="text-sm text-gray-700">{cotizacion.nota}</p>
                            </div>
                        )}
                    </div>

                    {/* Equipos */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-2">
                            Servicios cotizados
                        </h3>

                        {!cotizacion.equipos || cotizacion.equipos.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">
                                Esta cotización no tiene equipos registrados.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {cotizacion.equipos.map((eq, index) => (
                                    <div key={eq.id_equipo ?? `sin-equipo-${index}`} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                 <p className="text-sm font-semibold text-gray-800">{eq.sin_equipo ? 'Servicio sin equipo asociado' : eq.tipo_equipo}</p>
                                                <p className="text-xs text-gray-500">{eq.marca} · {eq.modelo}</p>
                                            </div>
                                            <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                                                {eq.sede}
                                            </span>
                                        </div>

                                         {!eq.sin_equipo && <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                                            <p><span className="text-gray-400">Serie:</span> {eq.serie}</p>
                                            <p><span className="text-gray-400">Cód. interno:</span> {eq.codigo_interno}</p>
                                            <p className="col-span-2"><span className="text-gray-400">Encargado:</span> {eq.encargado_equipo}</p>
                                         </div>}

                                        {eq.servicios?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                                                {eq.servicios.map((s) => (
                                                    <span
                                                        key={s.id_detalle}
                                                        title={s.nombre_tipo_servicio}
                                                        className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium"
                                                    >
                                                        {s.nombre_subtipo}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {canEdit && cotizacion.estado === 'borrador' && (
                        <div className="sticky bottom-0 flex justify-end border-t border-gray-200 bg-white pt-4">
                            <button type="button" onClick={onEdit} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Editar cotización</button>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

// --- Componente principal ---

const CotizacionList = () => {
    const { user } = useAuth();
    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDetalleOpen, setIsDetalleOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [detalleCotizacion, setDetalleCotizacion] = useState(null);
    const [detalleLoading, setDetalleLoading] = useState(false);
    const [actualizandoId, setActualizandoId] = useState(null);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const puedeActualizarEstado = ['POSTVENTA', 'ADMINISTRADOR', 'SUPERADMINISTRADOR'].includes(
        String(user?.rol ?? '').trim().toUpperCase()
    );

    const load = async () => {
        setLoading(true);
        const data = await CotizacionService.getAll();
        setCotizaciones(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleSaveSuccess = () => {
        setIsModalOpen(false);
        load();
    };

    const handleRowClick = async (cotizacionResumen) => {
        setIsDetalleOpen(true);

        // El backend (getAll) ya trae "equipos" con sus "servicios" incluidos,
        // así que usamos directamente ese objeto, sin llamadas extra.
        if (Array.isArray(cotizacionResumen.equipos)) {
            setDetalleCotizacion(cotizacionResumen);
            return;
        }

        // Fallback: por si en algún caso el listado NO trajera los equipos,
        // intentamos pedir el detalle completo al backend.
        setDetalleCotizacion(cotizacionResumen);

        if (typeof CotizacionService.getById !== 'function') {
            console.warn('CotizacionService.getById no existe; se muestran solo los datos básicos.');
            return;
        }

        setDetalleLoading(true);
        try {
            const data = await CotizacionService.getById(cotizacionResumen.id_cotizacion);
            if (data) setDetalleCotizacion(data);
        } catch (error) {
            console.error('Error al cargar el detalle de la cotización:', error);
        } finally {
            setDetalleLoading(false);
        }
    };

    const handleEstadoChange = async (cotizacion, estado) => {
        if (!puedeActualizarEstado || estado === cotizacion.estado) return;

        try {
            setActualizandoId(cotizacion.id_cotizacion);
            setError('');
            setMensaje('');

            const resultado = await CotizacionService.actualizarEstado(
                cotizacion.id_cotizacion,
                estado
            );
            const estadoActualizado = resultado?.estado || estado;

            setCotizaciones(anterior => anterior.map(item => (
                item.id_cotizacion === cotizacion.id_cotizacion
                    ? { ...item, estado: estadoActualizado }
                    : item
            )));
            setDetalleCotizacion(anterior => (
                anterior?.id_cotizacion === cotizacion.id_cotizacion
                    ? { ...anterior, estado: estadoActualizado }
                    : anterior
            ));
            setMensaje(`Cotización N.° ${cotizacion.numero_cotizacion} actualizada a ${estadoActualizado}.`);
        } catch (error) {
            setError(
                error?.response?.data?.message
                || error?.message
                || 'No se pudo actualizar el estado de la cotización'
            );
        } finally {
            setActualizandoId(null);
        }
    };

    return (
        <div className="p-4 max-w-8xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Cotizaciones</h1>
                    <p className="text-sm text-gray-400">{cotizaciones.length} registro(s)</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm text-sm"
                >
                    + Nueva Cotización
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nueva Cotización"
            >
                <CotizacionForm onSaveSuccess={handleSaveSuccess} />
            </Modal>

            <CotizacionDetalleModal
                isOpen={isDetalleOpen}
                onClose={() => setIsDetalleOpen(false)}
                cotizacion={detalleCotizacion}
                loading={detalleLoading}
                canEdit={puedeActualizarEstado}
                onEdit={() => {
                    setIsDetalleOpen(false);
                    setIsEditOpen(true);
                }}
            />

            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title={`Editar cotización N.° ${detalleCotizacion?.numero_cotizacion || ''}`}
            >
                <CotizacionForm
                    initialData={detalleCotizacion}
                    onSaveSuccess={() => {
                        setIsEditOpen(false);
                        setMensaje('Cotización actualizada correctamente.');
                        load();
                    }}
                />
            </Modal>

            {mensaje && (
                <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {mensaje}
                </div>
            )}

            {error && (
                <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-gray-400 text-sm">Cargando datos...</div>
            ) : cotizaciones.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                    No hay cotizaciones registradas.
                </div>
            ) : (
                <div className="overflow-hidden shadow-sm border border-gray-200 rounded-xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[11px] text-gray-400 uppercase bg-gray-50 border-b border-gray-200 tracking-wide">
                            <tr>
                                <th className="px-4 py-3">N° Cotización</th>
                                <th className="px-4 py-3">Cliente</th>
                                <th className="px-4 py-3">Tipo Pago</th>
                                <th className="px-4 py-3">C. de Costo</th>
                                <th className="px-4 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cotizaciones.map((c) => (
                                <tr
                                    key={c.id_cotizacion}
                                    onClick={() => handleRowClick(c)}
                                    className="hover:bg-blue-50/60 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium text-gray-800">{c.numero_cotizacion}</td>
                                    <td className="px-4 py-3 text-gray-700">{c.nombre_cliente}</td>
                                    <td className="px-4 py-3 text-gray-500 capitalize">{c.tipo_pago || '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 capitalize">{c.centro_costo || '—'}</td>
                                    <td className="px-4 py-3">
                                        {puedeActualizarEstado ? (
                                            <select
                                                value={String(c.estado || 'borrador').toLowerCase()}
                                                onClick={(event) => event.stopPropagation()}
                                                onChange={(event) => {
                                                    event.stopPropagation();
                                                    handleEstadoChange(c, event.target.value);
                                                }}
                                                disabled={actualizandoId === c.id_cotizacion}
                                                aria-label={`Estado de la cotización ${c.numero_cotizacion}`}
                                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm capitalize text-gray-700 disabled:cursor-wait disabled:opacity-60"
                                            >
                                                {ESTADOS_COTIZACION.map(estado => (
                                                    <option
                                                        key={estado}
                                                        value={estado}
                                                        disabled={!puedeTransicionar(c.estado, estado)}
                                                    >
                                                        {estado}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <EstadoBadge estado={c.estado} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CotizacionList;
