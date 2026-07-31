/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Building2, CalendarDays, CheckCircle2, ClipboardList, Clock3, Edit3, History, Loader2, MapPin, RefreshCw, Save, Wrench, X } from 'lucide-react';

import { useAuth } from '../../context/authContext.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { notify } from '../../utils/notifications.jsx';
import { informeService } from './service/informe.service.js';
import ImageService from './service/image.service.js';

import LecturasCompresorForm from './form/estacionario/LecturasCompresorForm.jsx';
import LecturasSecadorForm from './form/estacionario/LecturasSecadorForm.jsx';
import CombustionForm from './form/estacionario/CombustionForm.jsx';
import VoltajeAmperajeForm from './form/estacionario/VoltajeAmperaje.jsx';
import FiltrosComponentesForm from './form/estacionario/FiltrosComponentesForm.jsx';
import EvidenciasFotoForm from './form/estacionario/EvidenciasFotoForm.jsx';
import HallazgosTrabajoForm from './form/estacionario/HallazgosTrabajoForm.jsx';
import ResponsableCierreForm from './form/estacionario/ResponsableCierreForm.jsx';

import ParametrosCompresor from './components/ParametrosCompresor.jsx';
import ParametrosSecador from './components/ParametrosSecador.jsx';
import ParametrosElectricos from './components/ParametrosElectricos.jsx';
import FiltrosSection from './components/FiltrosSection.jsx';
import HallazgosTrabajo from './components/HallazgosTrabajo.jsx';
import EvidenciasGaleria from './components/EvidenciasGaleria.jsx';

import EstacionarioPDF from './pdf/EstacionarioPDF.jsx';

const SECCIONES = { COMPRESOR: 'compresor', SECADOR: 'secador', COMBUSTION: 'combustion', ELECTRICOS: 'electricos', FILTROS: 'filtros', HALLAZGOS: 'hallazgos', RESPONSABLE: 'responsable' };
const SECCION_PAYLOAD = {
    [SECCIONES.COMPRESOR]: 'lecturas_compresor',
    [SECCIONES.SECADOR]: 'lecturas_secador',
    [SECCIONES.COMBUSTION]: 'lecturas_combustion',
    [SECCIONES.ELECTRICOS]: 'voltaje_amperaje',
    [SECCIONES.FILTROS]: 'filtros_y_componentes',
    [SECCIONES.HALLAZGOS]: 'detalle_informe',
    [SECCIONES.RESPONSABLE]: 'cierre_responsable'
};

const formatearFecha = fecha => {
    if (!fecha) return 'No registrada';
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return 'Fecha inválida';
    return new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', dateStyle: 'medium', timeStyle: 'short' }).format(valor);
};

const obtenerClaseEstado = estado => {
    switch (String(estado ?? '').trim().toLowerCase()) {
        case 'finalizado':
        case 'finalizada': return 'bg-green-100 text-green-700';
        case 'en proceso': return 'bg-amber-100 text-amber-700';
        case 'observado':
        case 'observada': return 'bg-red-100 text-red-700';
        case 'pendiente':
        case 'programada': return 'bg-blue-100 text-blue-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const obtenerMensajeError = (error, alternativo) =>
    error?.response?.data?.sqlMessage || error?.response?.data?.message || error?.message || alternativo;

const obtenerPrimerRegistro = valor => Array.isArray(valor) ? (valor[0] ?? {}) : valor && typeof valor === 'object' ? valor : {};
const normalizarArreglo = valor => Array.isArray(valor) ? valor : valor && typeof valor === 'object' ? [valor] : [];
const mostrarValor = (valor, alternativo = 'No registrado') => valor === null || valor === undefined || valor === '' ? alternativo : valor;

const limpiarRegistroParaEdicion = (seccion, registro = {}) => {
    const datos = { ...registro };
    ['id', 'id_informe', 'created_at', 'updated_at', 'fecha_registro', 'fecha_lectura', 'id_lectura'].forEach(campo => delete datos[campo]);

    if (seccion === SECCIONES.COMPRESOR) {
        ['id_lectura_compresor', 'marca', 'modelo', 'serie'].forEach(campo => delete datos[campo]);
    }
    if (seccion === SECCIONES.SECADOR) delete datos.id_lectura_secador;
    if (seccion === SECCIONES.COMBUSTION) {
        ['id_lectura_combustion', 'id_servicio'].forEach(campo => delete datos[campo]);
    }
    if (seccion === SECCIONES.ELECTRICOS) delete datos.id_voltaje_amperaje;
    if (seccion === SECCIONES.FILTROS) {
        ['id_detalle', 'id_filtro_componente', 'id_filtros_componentes'].forEach(campo => delete datos[campo]);
    }
    if (seccion === SECCIONES.HALLAZGOS) delete datos.id_detalle_informe;
    if (seccion === SECCIONES.RESPONSABLE) {
        return {
            encargado: String(datos.encargado ?? '').trim() || null,
            firma: datos.firma || null
        };
    }
    return datos;
};

const CampoLectura = ({ label, value, className = '' }) => (
    <div className={className}>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-800">{mostrarValor(value)}</p>
    </div>
);

const ParametrosCombustion = ({ servicio = {} }) => {
    const lectura = obtenerPrimerRegistro(servicio.lecturas_combustion);
    const campos = [
        ['Marca', lectura.marca_combu],
        ['Modelo', lectura.modelo_combu],
        ['Serie', lectura.serie_combu],
        ['Voltaje', lectura.voltaje_combu],
        ['Presión de aceite', lectura.presion_aceite_combu],
        ['RPM máximo', lectura.rpm_maximo_combu],
        ['RPM mínimo', lectura.rpm_minimo_combu],
        ['Tipo de aceite', lectura.tipo_aceite_combu],
        ['Nivel de aceite', lectura.nivel_aceite_combu],
        ['Nivel de refrigerante', lectura.nivel_refrigerante_combu]
    ];

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900">Lecturas de combustión</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {campos.map(([label, value]) => (
                    <CampoLectura key={label} label={label} value={value} />
                ))}
            </div>
        </article>
    );
};

const BotonEditarSeccion = ({ label, onClick, disabled = false }) => (
    <button type="button" onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">
        <Edit3 className="h-4 w-4" />{label}
    </button>
);

const ContenedorEdicion = ({ titulo, descripcion, guardando = false, onGuardar, onCancelar, children }) => (
    <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-200 bg-amber-50 px-5 py-4">
            <div>
                <h3 className="font-bold text-slate-900">{titulo}</h3>
                <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
            </div>
            <button type="button" onClick={onCancelar} disabled={guardando} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                <X className="h-4 w-4" />Cancelar
            </button>
        </header>
        <div className="space-y-5 p-5">
            {children}
            <div className="flex justify-end border-t border-slate-200 pt-5">
                <button type="button" onClick={onGuardar} disabled={guardando} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                    {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {guardando ? 'Guardando...' : 'Guardar sección'}
                </button>
            </div>
        </div>
    </section>
);

export const DetalleInforme = () => {
    const { idInforme: idInformeParam } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const idTecnico =
        user?.id_usuario ??
        user?.id ??
        null;

    const idOtDetalleNavegacion = Number(location.state?.idOtDetalle);
    const esDetalleOt =
        Number.isInteger(idOtDetalleNavegacion)
        && idOtDetalleNavegacion > 0;
    const esTecnico = String(user?.rol ?? '').trim().toUpperCase() === 'TECNICO';

    const [detalle, setDetalle] = useState(null);
    const [seccionEditando, setSeccionEditando] = useState(null);
    const [datosEdicion, setDatosEdicion] = useState({});
    const [loading, setLoading] = useState(true);
    const [recargando, setRecargando] = useState(false);
    const [guardandoSeccion, setGuardandoSeccion] = useState(null);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [modalEvidenciasAbierto, setModalEvidenciasAbierto] = useState(false);
    const [subiendoImagenes, setSubiendoImagenes] = useState(false);
    const [eliminandoImagenId, setEliminandoImagenId] = useState(null);
    const [actualizandoImagenId, setActualizandoImagenId] = useState(null);
    const [finalizandoInforme, setFinalizandoInforme] = useState(false);


    const cargarDetalle = useCallback(
        async (mostrarCargaCompleta = true) => {
            const referenciaId = Number(idInformeParam);

            if (
                !Number.isInteger(referenciaId) ||
                referenciaId <= 0
            ) {
                setError(
                    'El ID del informe técnico no es válido'
                );
                setLoading(false);
                return;
            }

            try {
                if (mostrarCargaCompleta) {
                    setLoading(true);
                } else {
                    setRecargando(true);
                }

                setError('');

                let response;

                if (esDetalleOt) {
                    response = esTecnico
                        ? await informeService.getDetalleInforme(
                            idTecnico,
                            idOtDetalleNavegacion
                        )
                        : await informeService.getDetalleInformeAdmin(
                            idOtDetalleNavegacion
                        );
                } else {
                    response = await informeService.getDetalleHistorial(
                        referenciaId
                    );
                }

                /*
                 * El servicio puede devolver directamente
                 * el objeto o una respuesta con data.
                 */
                const data =
                    response?.data ??
                    response;

                if (
                    !data ||
                    !data?.informe?.id_informe
                ) {
                    throw new Error(
                        'La API no devolvió un informe válido'
                    );
                }

                setDetalle(data);
            } catch (err) {
                console.error(
                    'Error al cargar el informe por ID:',
                    err
                );

                if (mostrarCargaCompleta) {
                    setDetalle(null);
                }

                setError(
                    obtenerMensajeError(
                        err,
                        'No se pudo cargar la información del informe'
                    )
                );
            } finally {
                setLoading(false);
                setRecargando(false);
            }
        },
        [esDetalleOt, esTecnico, idInformeParam, idOtDetalleNavegacion, idTecnico]
    );

    useEffect(() => {
        cargarDetalle();
    }, [cargarDetalle]);

    const abrirEdicion = async (seccion, datos) => {
        const confirmado = await notify.confirm(
            '¿Editar esta sección?',
            'Podrá modificar los datos y guardarlos cuando termine.',
            {
                confirmButtonText: 'Sí, editar',
                confirmButtonColor: '#2563eb',
                icon: 'question'
            }
        );

        if (!confirmado) return;

        setDatosEdicion({ ...obtenerPrimerRegistro(datos) });
        setSeccionEditando(seccion);
        setError('');
        setMensaje('');
    };

    const cancelarEdicion = () => {
        setSeccionEditando(null);
        setDatosEdicion({});
    };

    const actualizarDatoEdicion = (campo, valor) => {
        setDatosEdicion(anterior => ({ ...anterior, [campo]: valor }));
    };

    const guardarSeccion = async seccion => {
        const tecnico = Number(idTecnico);

        const detalleId = Number(
            detalle?.id_ot_detalle ??
            detalle?.informe?.id_ot_detalle
        );

        const nombrePayload =
            SECCION_PAYLOAD[seccion];

        if (!Number.isInteger(tecnico) || tecnico <= 0) return setError('No se pudo identificar al técnico');
        if (!Number.isInteger(detalleId) || detalleId <= 0) return setError('No se pudo identificar el detalle de la OT');
        if (!nombrePayload) return setError('La sección seleccionada no es válida');

        const orden = detalle?.orden ?? {};
        const equipo = detalle?.equipo ?? {};
        const informe = detalle?.informe ?? {};
        const payload = {
            id_informe: informe.id_informe,
            id_ot_detalle: detalleId,
            id_ot: detalle.id_ot ?? orden.id_ot,
            id_equipo: detalle.id_equipo ?? equipo.id_equipo,
            [nombrePayload]: limpiarRegistroParaEdicion(seccion, datosEdicion)
        };

        try {
            setGuardandoSeccion(seccion);
            setError('');
            setMensaje('');
            const respuesta = esTecnico
                ? await informeService.guardarInforme(tecnico, detalleId, payload)
                : await informeService.guardarInformeAdmin(detalleId, payload);
            setMensaje(respuesta?.message || 'La sección se guardó correctamente');
            await cargarDetalle(false);
            cancelarEdicion();
        } catch (err) {
            console.error(`Error al guardar ${nombrePayload}:`, err);
            setError(obtenerMensajeError(err, 'No se pudo guardar la sección'));
        } finally {
            setGuardandoSeccion(null);
        }
    };

    const finalizarInforme = async () => {
        const detalleId = Number(
            detalle?.id_ot_detalle ?? detalle?.informe?.id_ot_detalle
        );

        if (!Number.isInteger(detalleId) || detalleId <= 0) {
            setError('No se pudo identificar el detalle de la OT');
            return;
        }

        const confirmado = await notify.confirm(
            '¿Marcar el informe como completo?',
            'Se registrará la fecha de finalización del informe.',
            {
                confirmButtonText: 'Sí, finalizar informe',
                confirmButtonColor: '#16a34a',
                icon: 'question'
            }
        );

        if (!confirmado) return;

        try {
            setFinalizandoInforme(true);
            setError('');
            setMensaje('');

            const resultado = await informeService.finalizarInforme(
                idTecnico,
                detalleId
            );

            setMensaje(
                resultado?.message || 'Informe finalizado correctamente.'
            );
            cancelarEdicion();
            await cargarDetalle(false);
        } catch (error) {
            setError(
                error?.response?.data?.message
                || error?.message
                || 'No se pudo finalizar el informe'
            );
        } finally {
            setFinalizandoInforme(false);
        }
    };

    const abrirModalEvidencias = () => {
        if (!idInformeParam) {
            return setError(
                'Primero debe existir un informe.'
            );
        }

        setError('');
        setMensaje('');
        setModalEvidenciasAbierto(true);
    };

    const cerrarModalEvidencias = () => {
        if (!subiendoImagenes) setModalEvidenciasAbierto(false);
    };

    const subirEvidencias = async (formData) => {
        try {
            const idInformeActual = Number(detalle?.informe?.id_informe);

            if (!Number.isInteger(idInformeActual) || idInformeActual <= 0) {
                throw new Error('No se encontró el informe');
            }

            console.log(
                '¿DetalleInforme recibe FormData?',
                formData instanceof FormData
            );

            setSubiendoImagenes(true);
            setError('');
            setMensaje('');

            const respuesta = await ImageService.uploadImages(
                idInformeActual,
                formData
            );

            console.log('Imágenes subidas:', respuesta);

            // Recarga todo el detalle del informe
            await cargarDetalle(false);

            setMensaje(
                respuesta?.message || 'Evidencias registradas correctamente.'
            );

            setModalEvidenciasAbierto(false);

            return respuesta;
        } catch (error) {
            console.error(
                'Error al subir evidencias:',
                error?.response?.data || error
            );

            setError(
                error?.response?.data?.message ||
                error?.message ||
                'No se pudieron subir las evidencias.'
            );

            throw error;
        } finally {
            setSubiendoImagenes(false);
        }
    };

    const actualizarTituloEvidencia = async (
        idImagen,
        titulo
    ) => {
        const id = Number(idImagen);
        const tituloLimpio =
            String(titulo ?? '').trim();

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            throw new Error(
                'No se pudo identificar la imagen'
            );
        }

        if (!tituloLimpio) {
            throw new Error(
                'El título es obligatorio'
            );
        }

        try {
            setActualizandoImagenId(id);
            setError('');
            setMensaje('');

            const respuesta =
                await ImageService.updateTitulo(
                    id,
                    tituloLimpio
                );

            await cargarDetalle(false);

            setMensaje(
                respuesta?.message ||
                'Título actualizado correctamente'
            );

            return respuesta;
        } catch (error) {
            console.error(
                'Error al actualizar título:',
                error?.response?.data || error
            );

            setError(
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'No se pudo actualizar el título'
            );

            throw error;
        } finally {
            setActualizandoImagenId(null);
        }
    };

    const rotarEvidencia = async (
        idImagen,
        grados = 90
    ) => {
        const id = Number(idImagen);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            throw new Error(
                'No se pudo identificar la imagen'
            );
        }

        try {
            setActualizandoImagenId(id);
            setError('');
            setMensaje('');

            const respuesta =
                await ImageService.rotarImage(
                    id,
                    grados
                );

            await cargarDetalle(false);

            setMensaje(
                respuesta?.message ||
                'Imagen girada correctamente'
            );

            return respuesta;
        } catch (error) {
            console.error(
                'Error al girar imagen:',
                error?.response?.data || error
            );

            setError(
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'No se pudo girar la imagen'
            );

            throw error;
        } finally {
            setActualizandoImagenId(null);
        }
    };

    const reemplazarEvidencia = async (idImagen, archivo) => {
        const id = Number(idImagen);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('No se pudo identificar la imagen');
        }

        if (!(archivo instanceof File)) {
            throw new Error('Debe seleccionar una nueva imagen');
        }

        if (!archivo.type.startsWith('image/')) {
            throw new Error('El archivo seleccionado no es una imagen');
        }

        const formData = new FormData();

        /*
         * Verifica el nombre configurado en Multer.
         * Si tu ruta usa upload.single('imagen'), debe ser "imagen".
         */
        formData.append('imagen', archivo);

        try {
            setActualizandoImagenId(id);
            setError('');
            setMensaje('');

            const respuesta = await ImageService.replaceImage(
                id,
                formData
            );

            await cargarDetalle(false);

            setMensaje(
                respuesta?.message ||
                'Imagen reemplazada correctamente'
            );

            return respuesta;
        } catch (error) {
            console.error(
                'Error al reemplazar imagen:',
                error?.response?.data || error
            );

            const mensajeError =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'No se pudo reemplazar la imagen';

            setError(mensajeError);
            throw error;
        } finally {
            setActualizandoImagenId(null);
        }
    };

    const eliminarEvidencia = async (idImagen) => {
        const id = Number(idImagen);

        if (!Number.isInteger(id) || id <= 0) {
            setError('No se pudo identificar la imagen');
            return;
        }

        const confirmado = await notify.confirm(
            '¿Eliminar esta evidencia?',
            'La imagen será eliminada definitivamente.',
            {
                confirmButtonText: 'Sí, eliminar',
                confirmButtonColor: '#dc2626'
            }
        );

        if (!confirmado) return;

        try {
            setEliminandoImagenId(id);
            setError('');
            setMensaje('');

            console.log('Eliminando imagen con ID:', id);

            const respuesta = await ImageService.deleteImage(id);

            console.log('Respuesta al eliminar:', respuesta);

            setMensaje(
                respuesta?.message ||
                'Evidencia eliminada correctamente'
            );

            await cargarDetalle(false);
        } catch (error) {
            console.error(
                'Error al eliminar evidencia:',
                error?.response?.data || error
            );

            setError(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'No se pudo eliminar la evidencia'
            );
        } finally {
            setEliminandoImagenId(null);
        }
    };

    const verInformeHistorico = idInforme => {
        const id = Number(idInforme);
        if (Number.isInteger(id) && id > 0) navigate(`/tecnico/informes/historial/${id}`);
    };

    if (loading) {
        return <div className="flex min-h-72 items-center justify-center"><div className="text-center"><Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" /><p className="mt-3 text-sm text-slate-500">Cargando datos del informe...</p></div></div>;
    }

    if (!detalle) {
        return (
            <section className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <div>
                            <h1 className="font-bold text-red-800">No se pudo cargar el informe</h1>
                            <p className="mt-2 text-sm text-red-700">{error || 'No se encontró el detalle de la Orden de Trabajo.'}</p>
                            <p className="mt-2 text-xs text-red-600">
                                ID del informe recibido: {idInformeParam || 'ninguno'}
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"><ArrowLeft className="h-4 w-4" />Volver</button>
                </div>
            </section>
        );
    }


    const orden = detalle.orden ?? {};
    const cliente = detalle.cliente ?? {};
    const equipo = detalle.equipo ?? {};
    const informe = detalle.informe ?? {};
    const informeFinalizado = Boolean(informe.fecha_finalizacion);
    const tiempos = detalle.tiempos ?? {};
    const servicios = normalizarArreglo(detalle.servicios);
    const historial = normalizarArreglo(detalle.historial);
    const tecnicosAdicionales = normalizarArreglo(detalle.tecnicos_adicionales);
    const lecturasCompresor = normalizarArreglo(detalle.lecturas_compresor);
    const lecturasSecador = normalizarArreglo(detalle.lecturas_secador);
    const lecturasCombustion = normalizarArreglo(detalle.lecturas_combustion);
    const voltajeAmperaje = normalizarArreglo(detalle.voltaje_amperaje);
    const filtrosComponentes = normalizarArreglo(detalle.filtros_y_componentes);
    const evidencias = normalizarArreglo(detalle.evidencias ?? detalle.imagenes ?? detalle.imagenes_informe ?? detalle.imagenes_servicio);
    const detalleInforme = obtenerPrimerRegistro(detalle.detalle_informe ?? informe.detalle_informe ?? {});
    const responsableCierre = obtenerPrimerRegistro(detalle.cierre_responsable ?? detalle.servicio_responsable ?? {});
    const idInforme = Number(informe?.id_informe || 0);

    const servicioVisual = {
        ...detalle,
        id_servicio: informe.id_informe ?? detalle.id_servicio,
        id_ot: detalle.id_ot ?? orden.id_ot,
        fechainicio: tiempos.fecha_hora_inicio ?? orden.fecha_programada ?? informe.fecha_registro,
        razon_social: cliente.razon_social,
        ruc: cliente.ruc,
        direccion_cliente: cliente.direccion,
        contacto: cliente.contacto,
        celular: cliente.celular,
        marca: equipo.marca,
        modelo: equipo.modelo,
        serie: equipo.serie,
        encargado_equipo: equipo.encargado_equipo,
        tecnico: orden.tecnico_responsable,
        tecnico_responsable: orden.tecnico_responsable,
        tipoServicio: servicios.map(s => [s.nombre_tipo_servicio, s.nombre_subtipo].filter(Boolean).join(' - ')).filter(Boolean).join(', '),
        orden, cliente, equipo, servicios,
        tecnicos_adicionales: tecnicosAdicionales,
        lecturas_compresor: lecturasCompresor,
        lecturas_secador: lecturasSecador,
        lecturas_combustion: lecturasCombustion,
        voltaje_amperaje: voltajeAmperaje,
        filtros_y_componentes: filtrosComponentes,
        detalle_informe: detalleInforme,
        imagenes_servicio: evidencias,
        servicio_responsable: normalizarArreglo(detalle.cierre_responsable ?? detalle.servicio_responsable)
    };

    const hayEdicionActiva = Boolean(seccionEditando) || informeFinalizado;
    const tipoEquipoNormalizado = String(equipo.tipo_equipo ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
    const esEquipoPortatil = tipoEquipoNormalizado.includes('portatil');
    const esSecadorRefrigerativo = tipoEquipoNormalizado.includes('secador');
    const esCompresorEstacionario =
        tipoEquipoNormalizado.includes('estacionario');
    const esGrupoElectrogeno =
        tipoEquipoNormalizado.includes('grupo')
        || tipoEquipoNormalizado.includes('electrogeno');
    const muestraCompresor =
        !esSecadorRefrigerativo
        && !esGrupoElectrogeno;
    const muestraCombustion =
        esEquipoPortatil
        || esGrupoElectrogeno;

    const renderSeccion = ({ seccion, titulo, descripcion, boton, datos, Formulario, Visual, extraProps = {} }) =>
        seccionEditando === seccion ? (
            <ContenedorEdicion titulo={titulo} descripcion={descripcion} guardando={guardandoSeccion === seccion} onCancelar={cancelarEdicion} onGuardar={() => guardarSeccion(seccion)}>
                <Formulario data={datosEdicion} onChange={actualizarDatoEdicion} {...extraProps} />
            </ContenedorEdicion>
        ) : (
            <div className="space-y-3">
                <div className="flex justify-end"><BotonEditarSeccion label={boton} disabled={hayEdicionActiva} onClick={() => abrirEdicion(seccion, datos)} /></div>
                <Visual servicio={servicioVisual} />
            </div>
        );


    return (
        <section className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Volver a la orden</button>
                <div className="flex flex-wrap items-center gap-3">
                    {esTecnico && !informeFinalizado && (
                        <button
                            type="button"
                            onClick={finalizarInforme}
                            disabled={
                                finalizandoInforme
                                || Boolean(guardandoSeccion)
                                || Boolean(seccionEditando)
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {finalizandoInforme
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <CheckCircle2 className="h-4 w-4" />}
                            {finalizandoInforme ? 'Finalizando...' : 'Informe completo'}
                        </button>
                    )}

                    {informeFinalizado && (
                        <span className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                            Finalizado: {formatearFecha(informe.fecha_finalizacion)}
                        </span>
                    )}

                    {/* Usamos user?.rol en lugar de la variable no definida 'usuario' */}
                    {user?.rol !== 'TECNICO' && (
                        <EstacionarioPDF servicio={servicioVisual} />
                    )}

                    <button
                        type="button"
                        onClick={() => cargarDetalle(false)}
                        disabled={
                            recargando ||
                            Boolean(guardandoSeccion)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                        {recargando ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Actualizar
                    </button>
                </div>
            </div>

            <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex items-center gap-2"><ClipboardList className="h-6 w-6 text-blue-600" /><h1 className="text-2xl font-bold text-slate-900">Informe técnico</h1></div>
                        <p className="mt-2 text-sm text-slate-500">OT N.° {detalle.id_ot ?? orden.id_ot} · Detalle N.° {detalle.id_ot_detalle}</p>
                        <p className="mt-1 text-sm text-slate-500">Cotización {orden.numero_cotizacion || 'No registrada'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${obtenerClaseEstado(detalle.estado_equipo)}`}>{detalle.estado_equipo || 'Pendiente'}</span>
                        <span className="w-fit rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">Informe N.° {informe.id_informe || 'Sin crear'}</span>
                    </div>
                </div>
            </header>

            {error && <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span></div>}
            {mensaje && <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><span>{mensaje}</span></div>}

            <div className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">Datos del cliente</h2></div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <CampoLectura label="Razón social" value={cliente.razon_social} /><CampoLectura label="RUC" value={cliente.ruc} />
                        <CampoLectura label="Contacto" value={cliente.contacto} /><CampoLectura label="Celular" value={cliente.celular} />
                        <div className="sm:col-span-2"><div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><CampoLectura label="Dirección" value={cliente.direccion} /></div></div>
                    </div>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">Datos de la orden</h2></div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <CampoLectura label="Fecha programada" value={formatearFecha(orden.fecha_programada)} /><CampoLectura label="Técnico responsable" value={orden.tecnico_responsable} />
                        <CampoLectura label="Tipo de pago" value={orden.tipo_pago} /><CampoLectura label="Centro de costo" value={orden.centro_costo} />
                        {orden.nota && <CampoLectura label="Nota" value={orden.nota} className="sm:col-span-2" />}
                    </div>
                </article>
            </div>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">Datos del equipo</h2></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <CampoLectura label="Tipo de equipo" value={equipo.tipo_equipo} /><CampoLectura label="Marca" value={equipo.marca} />
                    <CampoLectura label="Modelo" value={equipo.modelo} /><CampoLectura label="Serie" value={equipo.serie} />
                    <CampoLectura label="Código interno" value={equipo.codigo_interno} /><CampoLectura label="Encargado" value={equipo.encargado_equipo} />
                    <CampoLectura label="Sede" value={equipo.sede} /><CampoLectura label="Dirección" value={equipo.direccion ?? cliente.direccion} />
                </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">Tiempos registrados</h2></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-4"><CampoLectura label="Llegada" value={formatearFecha(tiempos.fecha_hora_llegada)} /></div>
                    <div className="rounded-lg bg-slate-50 p-4"><CampoLectura label="Inicio" value={formatearFecha(tiempos.fecha_hora_inicio)} /></div>
                    <div className="rounded-lg bg-slate-50 p-4"><CampoLectura label="Fin" value={formatearFecha(tiempos.fecha_hora_fin)} /></div>
                </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">Servicios asignados</h2></div>
                {servicios.length === 0 ? <p className="mt-4 text-sm text-slate-500">No existen servicios asignados.</p> : (
                    <div className="mt-4 flex flex-wrap gap-2">{servicios.map((s, i) => <span key={s.id_ot_detalle_servicio ?? s.id_subtipo_servicio ?? i} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">{s.nombre_tipo_servicio ? `${s.nombre_tipo_servicio} - ` : ''}{s.nombre_subtipo || 'Servicio sin nombre'}</span>)}</div>
                )}
            </article>

            <section className="space-y-6">
                <div><h2 className="text-xl font-bold text-slate-900">Información técnica registrada</h2><p className="mt-1 text-sm text-slate-500">Cada apartado puede editarse y guardarse de manera independiente.</p></div>

                {muestraCompresor && renderSeccion({ seccion: SECCIONES.COMPRESOR, titulo: 'Editar parámetros del compresor', descripcion: 'Los cambios afectan únicamente las lecturas del compresor.', boton: 'Editar compresor', datos: lecturasCompresor, Formulario: LecturasCompresorForm, Visual: ParametrosCompresor, extraProps: { equipo } })}
                {(esCompresorEstacionario || esSecadorRefrigerativo) && renderSeccion({
                    seccion: SECCIONES.SECADOR,
                    titulo: esSecadorRefrigerativo
                        ? 'Formulario básico del secador refrigerativo'
                        : 'Editar parámetros del secador',
                    descripcion: esSecadorRefrigerativo
                        ? 'Registre los parámetros principales del secador refrigerativo.'
                        : 'Los cambios afectan únicamente las lecturas del secador.',
                    boton: esSecadorRefrigerativo
                        ? 'Editar secador refrigerativo'
                        : 'Editar secador',
                    datos: lecturasSecador,
                    Formulario: LecturasSecadorForm,
                    Visual: ParametrosSecador
                })}
                {muestraCombustion && renderSeccion({
                    seccion: SECCIONES.COMBUSTION,
                    titulo: esGrupoElectrogeno ? 'Formulario básico del grupo electrógeno' : 'Editar lecturas de combustión',
                    descripcion: esGrupoElectrogeno
                        ? 'Registre los datos básicos del motor del grupo electrógeno.'
                        : 'Los cambios afectan únicamente las lecturas del motor de combustión.',
                    boton: esGrupoElectrogeno ? 'Editar grupo electrógeno' : 'Editar combustión',
                    datos: lecturasCombustion,
                    Formulario: CombustionForm,
                    Visual: ParametrosCombustion
                })}
                {renderSeccion({ seccion: SECCIONES.ELECTRICOS, titulo: 'Editar parámetros eléctricos', descripcion: 'Los cambios afectan únicamente voltajes y amperajes.', boton: 'Editar parámetros eléctricos', datos: voltajeAmperaje, Formulario: VoltajeAmperajeForm, Visual: ParametrosElectricos })}
                {renderSeccion({ seccion: SECCIONES.FILTROS, titulo: 'Editar filtros y componentes', descripcion: 'Los cambios afectan únicamente filtros y componentes.', boton: 'Editar filtros y componentes', datos: filtrosComponentes, Formulario: FiltrosComponentesForm, Visual: FiltrosSection })}
                {renderSeccion({ seccion: SECCIONES.HALLAZGOS, titulo: 'Editar hallazgos del trabajo', descripcion: 'Los cambios afectan la descripción del trabajo, recomendaciones y conclusiones.', boton: 'Editar hallazgos', datos: [detalleInforme], Formulario: HallazgosTrabajoForm, Visual: HallazgosTrabajo })}
                {seccionEditando === SECCIONES.RESPONSABLE ? (
                    <ContenedorEdicion titulo="Responsable de cierre" descripcion="El nombre y la firma son opcionales y se guardan únicamente en este informe." guardando={guardandoSeccion === SECCIONES.RESPONSABLE} onCancelar={cancelarEdicion} onGuardar={() => guardarSeccion(SECCIONES.RESPONSABLE)}>
                        <ResponsableCierreForm data={datosEdicion} onChange={actualizarDatoEdicion} />
                    </ContenedorEdicion>
                ) : (
                    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-slate-900">Responsable de cierre <span className="font-normal text-slate-500">(opcional)</span></h3>
                                <p className="mt-1 text-sm text-slate-500">Asignación independiente para el informe N.° {idInforme}.</p>
                            </div>
                            <BotonEditarSeccion label={responsableCierre.encargado || responsableCierre.firma ? 'Editar responsable' : 'Asignar responsable'} disabled={hayEdicionActiva} onClick={() => abrirEdicion(SECCIONES.RESPONSABLE, responsableCierre)} />
                        </div>
                        {responsableCierre.encargado || responsableCierre.firma ? (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <CampoLectura label="Encargado" value={responsableCierre.encargado} />
                                {responsableCierre.firma && <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Firma</p><img src={responsableCierre.firma} alt="Firma del responsable de cierre" className="mt-2 max-h-28 rounded-lg border border-slate-200 bg-white p-2" /></div>}
                            </div>
                        ) : <p className="mt-4 text-sm text-slate-500">Este informe no tiene responsable de cierre asignado.</p>}
                    </article>
                )}
                <EvidenciasGaleria
                    imagenes={evidencias}
                    eliminandoId={eliminandoImagenId}
                    actualizandoId={actualizandoImagenId}
                    onAgregar={abrirModalEvidencias}
                    onEliminar={eliminarEvidencia}
                    onActualizarTitulo={
                        actualizarTituloEvidencia
                    }
                    onReemplazar={
                        reemplazarEvidencia
                    }
                    onRotar={
                        rotarEvidencia
                    }
                />


            </section>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2"><History className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">Historial del equipo</h2></div>
                {historial.length === 0 ? <p className="mt-4 text-sm text-slate-500">Este equipo todavía no tiene informes anteriores.</p> : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">OT</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Fecha</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Cotización</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Servicios</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Estado</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Acción</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {historial.map((r, i) => (
                                    <tr key={r.id_ot_detalle ?? r.id_informe ?? i} className="hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900">OT-{r.id_ot}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatearFecha(r.fecha_programada)}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{r.numero_cotizacion || 'No registrada'}</td>
                                        <td className="max-w-sm px-4 py-3 text-sm text-slate-700">{r.servicios_realizados || 'No registrados'}</td>
                                        <td className="whitespace-nowrap px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerClaseEstado(r.estado_equipo)}`}>{r.estado_equipo || 'Pendiente'}</span></td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">{r.id_informe ? <button type="button" onClick={() => verInformeHistorico(r.id_informe)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Ver informe</button> : <span className="text-xs text-slate-400">Sin informe</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </article>
            <Modal
                isOpen={modalEvidenciasAbierto}
                onClose={cerrarModalEvidencias}
                title="Agregar evidencias fotográficas"
                size="xl"
            >
                <EvidenciasFotoForm
                    idInforme={idInforme}
                    cantidadRegistrada={evidencias.length}
                    subiendo={subiendoImagenes}
                    onSubir={subirEvidencias}
                    onCancelar={cerrarModalEvidencias}
                />
            </Modal>
        </section>
    );
};

export default DetalleInforme;
