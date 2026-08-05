
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { CheckCircle2, Copy, Plus, Save, Trash2 } from 'lucide-react';
import CotizacionService from '../../services/cotizaciones.service.js';
import { clientService } from '../../services/client.service.js';
import { equipmentService } from '../../services/equipment.service.js';
import TiposervicioService from '../../services/tiposervicio.service.js';

const detalleInicial = {
    idEquipo: null,
    idTipoServicio: null,
    idServicios: [],
    subtiposDisponibles: []
};

const CotizacionForm = ({ initialData = null, onSaveSuccess }) => {
    const selectPortalProps = {
        menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
        menuPosition: 'fixed',
        styles: {
            menuPortal: base => ({ ...base, zIndex: 9999 }),
            menu: base => ({ ...base, zIndex: 9999 })
        }
    };
    const [clientes, setClientes] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [tiposBase, setTiposBase] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState('');

    const [header, setHeader] = useState({
        idCliente: null,
        tipoPago: null,
        centroCosto: null,
        movilidad: '',
        nota: '',
        estado: 'borrador'
    });

    const [detalles, setDetalles] = useState([
        { ...detalleInicial }
    ]);

    const opcionesTipoPago = [
        { value: 'facturado', label: 'Facturado' },
        { value: 'cortesia', label: 'Cortesía' },
        { value: 'garantia', label: 'Garantía' }
    ];

    const opcionesCentroCosto = [
        { value: 'ventas', label: 'Ventas' },
        { value: 'almacen', label: 'Almacén' },
        { value: 'postventa', label: 'Postventa' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resClientes, resTipos] = await Promise.all([
                    clientService.getAll(),
                    TiposervicioService.getAll()
                ]);

                const listaClientes = Array.isArray(resClientes)
                    ? resClientes
                    : resClientes?.data || [];

                const listaTipos = Array.isArray(resTipos)
                    ? resTipos
                    : resTipos?.data || [];

                setClientes(listaClientes);
                setTiposBase(listaTipos);
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!initialData) return;

        const prepararEdicion = async () => {
            setHeader({
                idCliente: { value: initialData.id_cliente, label: initialData.nombre_cliente || 'Cliente' },
                tipoPago: opcionesTipoPago.find(opcion => opcion.value === initialData.tipo_pago) || null,
                centroCosto: opcionesCentroCosto.find(opcion => opcion.value === initialData.centro_costo) || null,
                movilidad: initialData.movilidad ?? '',
                nota: initialData.nota || '',
                estado: initialData.estado || 'borrador'
            });

            try {
                const response = await equipmentService.getByClient(initialData.id_cliente);
                setEquipos(Array.isArray(response) ? response : response?.data || []);
                const filas = [];

                for (const equipo of initialData.equipos || []) {
                    const porTipo = new Map();
                    for (const servicio of equipo.servicios || []) {
                        if (!porTipo.has(servicio.id_tipo_servicio)) porTipo.set(servicio.id_tipo_servicio, []);
                        porTipo.get(servicio.id_tipo_servicio).push(servicio);
                    }
                    for (const [idTipo, servicios] of porTipo) {
                        const respuesta = await TiposervicioService.getByTipo(idTipo);
                        const subtipos = Array.isArray(respuesta) ? respuesta : respuesta?.data || [];
                        filas.push({
                            idEquipo: equipo.id_equipo ? {
                                value: equipo.id_equipo,
                                label: [equipo.marca, equipo.modelo, equipo.serie ? `Serie: ${equipo.serie}` : null].filter(Boolean).join(' - ')
                            } : null,
                            idTipoServicio: { value: idTipo, label: servicios[0]?.nombre_tipo_servicio || 'Servicio' },
                            idServicios: servicios.map(servicio => ({
                                value: servicio.id_subtipo_servicio,
                                label: servicio.nombre_subtipo,
                                precio: servicio.precio ?? ''
                            })),
                            subtiposDisponibles: subtipos.map(subtipo => ({
                                value: subtipo.id_subtipo_servicio,
                                label: subtipo.nombre_subtipo || subtipo.nombre || 'Sin nombre'
                            }))
                        });
                    }
                }
                setDetalles(filas.length ? filas : [{ ...detalleInicial }]);
            } catch (error) {
                console.error('Error al preparar la cotización para edición:', error);
            }
        };

        prepararEdicion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    useEffect(() => {
        const cargarEquipos = async () => {
            if (!header.idCliente?.value) {
                setEquipos([]);

                setDetalles([
                    { ...detalleInicial }
                ]);

                return;
            }

            if (initialData && Number(initialData.id_cliente) === Number(header.idCliente.value)) {
                return;
            }

            try {
                const response = await equipmentService.getByClient(
                    header.idCliente.value
                );

                const listaEquipos = Array.isArray(response)
                    ? response
                    : response?.data || [];

                setEquipos(listaEquipos);

                // Limpia los equipos seleccionados al cambiar de cliente.
                setDetalles([
                    { ...detalleInicial }
                ]);
            } catch (error) {
                console.error('Error al obtener equipos:', error);
                setEquipos([]);
            }
        };

        cargarEquipos();
    }, [header.idCliente, initialData]);

    const actualizarDetalle = (index, campo, valor) => {
        setDetalles((detallesActuales) =>
            detallesActuales.map((detalle, posicion) =>
                posicion === index
                    ? {
                        ...detalle,
                        [campo]: valor
                    }
                    : detalle
            )
        );
    };

    const handleTipoServicioChange = async (
        index,
        selectedOption
    ) => {
        actualizarDetalle(index, 'idTipoServicio', selectedOption);
        actualizarDetalle(index, 'idServicios', []);

        if (!selectedOption) {
            actualizarDetalle(index, 'subtiposDisponibles', []);
            return;
        }

        try {
            const response = await TiposervicioService.getByTipo(
                selectedOption.value
            );

            const subtipos = Array.isArray(response)
                ? response
                : response?.data || [];

            const opcionesSubtipos = subtipos.map((subtipo) => ({
                value: subtipo.id_subtipo_servicio,
                label:
                    subtipo.nombre_subtipo ||
                    subtipo.nombre ||
                    'Sin nombre'
            }));

            actualizarDetalle(
                index,
                'subtiposDisponibles',
                opcionesSubtipos
            );
        } catch (error) {
            console.error('Error al obtener subtipos:', error);

            actualizarDetalle(
                index,
                'subtiposDisponibles',
                []
            );
        }
    };

    const agregarDetalle = () => {
        setDetalles((detallesActuales) => [
            ...detallesActuales,
            { ...detalleInicial }
        ]);
    };

    const actualizarSubtiposSeleccionados = (index, seleccionados) => {
        setDetalles(actuales => actuales.map((detalle, posicion) => {
            if (posicion !== index) return detalle;
            const preciosActuales = new Map(
                detalle.idServicios.map(servicio => [String(servicio.value), servicio.precio ?? ''])
            );
            return {
                ...detalle,
                idServicios: (seleccionados || []).map(servicio => ({
                    ...servicio,
                    precio: preciosActuales.get(String(servicio.value)) ?? ''
                }))
            };
        }));
    };

    const actualizarPrecioServicio = (indexDetalle, idServicio, precio) => {
        setDetalles(actuales => actuales.map((detalle, posicion) => posicion === indexDetalle
            ? {
                ...detalle,
                idServicios: detalle.idServicios.map(servicio => String(servicio.value) === String(idServicio)
                    ? { ...servicio, precio }
                    : servicio)
            }
            : detalle));
    };

    const duplicarDetalle = (index) => {
        setDetalles((detallesActuales) => {
            const origen = detallesActuales[index];
            return [
                ...detallesActuales,
                {
                    ...origen,
                    idServicios: [...origen.idServicios],
                    subtiposDisponibles: [...origen.subtiposDisponibles]
                }
            ];
        });
    };

    const eliminarDetalle = (index) => {
        setDetalles((detallesActuales) => {
            if (detallesActuales.length === 1) {
                return detallesActuales;
            }

            return detallesActuales.filter(
                (_, posicion) => posicion !== index
            );
        });
    };

    const validarFormulario = () => {
        if (!header.idCliente?.value) {
            return 'Debe seleccionar un cliente';
        }

        if (!header.tipoPago?.value) {
            return 'Debe seleccionar el tipo de pago';
        }

        if (!header.centroCosto?.value) {
            return 'Debe seleccionar el centro de costo';
        }

        for (let index = 0; index < detalles.length; index++) {
            const detalle = detalles[index];

            if (!detalle.idTipoServicio?.value) {
                return `Debe seleccionar el tipo de servicio en la fila ${index + 1}`;
            }

            if (
                !Array.isArray(detalle.idServicios) ||
                detalle.idServicios.length === 0
            ) {
                return `Debe seleccionar al menos un subtipo en la fila ${index + 1}`;
            }

            if (detalle.idServicios.some(servicio => (
                servicio.precio === '' || servicio.precio === null
                || !Number.isFinite(Number(servicio.precio)) || Number(servicio.precio) < 0
            ))) {
                return `Ingrese un precio válido para cada subtipo en la fila ${index + 1}`;
            }
        }

        if (header.movilidad !== '' && (!Number.isFinite(Number(header.movilidad)) || Number(header.movilidad) < 0)) {
            return 'El costo adicional debe ser un monto válido';
        }

        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errorValidacion = validarFormulario();

        if (errorValidacion) {
            setErrorFormulario(errorValidacion);
            return;
        }

        setErrorFormulario('');

        const payload = {
            idCliente: header.idCliente.value,
            tipoPago: header.tipoPago.value,
            centroCosto: header.centroCosto.value,
            movilidad: header.movilidad === '' ? null : Number(header.movilidad),
            nota: header.nota.trim(),
            estado: header.estado,
            detalles: detalles.map((detalle) => ({
                idEquipo: detalle.idEquipo?.value || null,
                idTipoServicio: detalle.idTipoServicio.value,
                idServicios: detalle.idServicios.map(subtipo => ({
                    idSubtipoServicio: subtipo.value,
                    precio: Number(subtipo.precio)
                }))
            }))
        };

        try {
            setGuardando(true);

            const response = initialData
                ? await CotizacionService.actualizarCotizacion(initialData.id_cotizacion, payload)
                : await CotizacionService.crearCotizacion(payload);

            const numeroCotizacion =
                response?.data?.data?.numeroCotizacion ||
                response?.data?.numeroCotizacion;

            onSaveSuccess?.({ response, numeroCotizacion });

            setHeader({
                idCliente: null,
                tipoPago: null,
                centroCosto: null,
                movilidad: '',
                nota: '',
                estado: 'borrador'
            });

            setEquipos([]);
            setDetalles([
                { ...detalleInicial }
            ]);
        } catch (error) {
            console.error('Error al guardar cotización:', error);

            const mensaje =
                error.response?.data?.message ||
                error.message ||
                'No se pudo guardar la cotización';

            setErrorFormulario(mensaje);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setGuardando(false);
        }
    };

    const serviciosSeleccionados = detalles.reduce(
        (total, detalle) => total + detalle.idServicios.length,
        0
    );
    const datosGeneralesCompletos = Boolean(
        header.idCliente?.value && header.tipoPago?.value && header.centroCosto?.value
    );
    const serviciosCompletos = detalles.every(
        detalle => detalle.idTipoServicio?.value && detalle.idServicios.length > 0
    );
    const subtotalServicios = detalles.reduce((total, detalle) => total + detalle.idServicios.reduce(
        (subtotal, servicio) => subtotal + (Number(servicio.precio) || 0), 0
    ), 0);
    const costoAdicional = Number(header.movilidad) || 0;

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-7xl space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8"
        >
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {initialData ? 'Editar cotización' : 'Nueva cotización'}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    Registre el cliente y los servicios. El equipo es opcional.
                </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${datosGeneralesCompletos ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}><CheckCircle2 className="h-4 w-4" /> Datos generales</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${serviciosCompletos ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}><CheckCircle2 className="h-4 w-4" /> Servicios</span>
                </div>
            </div>

            {errorFormulario && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorFormulario}</div>}

            {initialData?.estado?.toLowerCase() === 'aprobada' && (
                <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Esta cotización ya está aprobada. Los equipos o servicios que agregue quedarán asociados sin cambiar su estado.
                </div>
            )}

            <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</span><div><h3 className="font-bold text-slate-900">Datos generales</h3><p className="text-sm text-slate-500">Cliente, pago y referencia administrativa.</p></div></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-dashed border-gray-300 bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">
                        Número de cotización
                    </p>

                    <p className="font-semibold text-gray-700">
                        {initialData?.numero_cotizacion || 'Se generará automáticamente al guardar'}
                    </p>
                </div>

                <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Cliente</span><Select
                    {...selectPortalProps}
                    placeholder="Buscar cliente..."
                    options={clientes.map((cliente) => ({
                        value: cliente.id_cliente,
                        label: cliente.razon_social
                    }))}
                    value={header.idCliente}
                    onChange={(valor) =>
                        setHeader((headerActual) => ({
                            ...headerActual,
                            idCliente: valor
                        }))
                    }
                    isClearable
                    noOptionsMessage={() => 'No se encontraron clientes'}
                /></label>

                <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Tipo de pago</span><Select
                    {...selectPortalProps}
                    placeholder="Tipo de pago"
                    options={opcionesTipoPago}
                    value={header.tipoPago}
                    onChange={(valor) =>
                        setHeader((headerActual) => ({
                            ...headerActual,
                            tipoPago: valor
                        }))
                    }
                    isClearable
                /></label>

                <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Centro de costo</span><Select
                    {...selectPortalProps}
                    placeholder="Centro de costo"
                    options={opcionesCentroCosto}
                    value={header.centroCosto}
                    onChange={(valor) =>
                        setHeader((headerActual) => ({
                            ...headerActual,
                            centroCosto: valor
                        }))
                    }
                    isClearable
                /></label>

                <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">Costo Movilidad <span className="font-normal text-slate-400">(opcional)</span></span>
                    <div className="flex rounded-lg border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                        <span className="border-r border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500">USD $</span>
                        <input type="number" min="0" step="0.01" value={header.movilidad} onChange={event => setHeader(actual => ({ ...actual, movilidad: event.target.value }))} placeholder="0.00" className="min-w-0 flex-1 rounded-r-lg px-3 py-2.5 outline-none" />
                    </div>
                </label>
            </div>

            <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Nota de la cotización <span className="font-normal text-slate-400">(opcional)</span></span>
            <textarea
                className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notas adicionales..."
                rows={3}
                value={header.nota}
                onChange={(event) =>
                    setHeader((headerActual) => ({
                        ...headerActual,
                        nota: event.target.value
                    }))
                }
            />
            </label>

            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</span><div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Servicios y equipos
                    </h3>

                    <p className="text-sm text-gray-500">
                        Seleccione el tipo y subtipo de servicio. Asocie un equipo solo cuando corresponda.
                    </p>
                    </div></div>
                    <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700"><strong>{detalles.length}</strong> bloque(s) · <strong>{serviciosSeleccionados}</strong> servicio(s)</div>
                </div>

                {detalles.map((fila, index) => (
                    <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                            <p className="font-bold text-slate-800">Bloque de servicio {index + 1}</p>
                            <div className="flex gap-1">
                                <button type="button" onClick={() => duplicarDetalle(index)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100" title="Duplicar este bloque"><Copy className="h-4 w-4" /> Duplicar</button>
                                <button type="button" onClick={() => eliminarDetalle(index)} disabled={detalles.length === 1} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300"><Trash2 className="h-4 w-4" /> Eliminar</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Equipo <span className="font-normal text-slate-400">(opcional)</span></span>
                        <Select
                            {...selectPortalProps}
                            placeholder="Equipo (opcional)"
                            options={equipos.map((equipo) => ({
                                value: equipo.id_equipo,
                                label: [
                                    equipo.marca,
                                    equipo.modelo,
                                    equipo.serie
                                        ? `Serie: ${equipo.serie}`
                                        : null
                                ]
                                    .filter(Boolean)
                                    .join(' - ')
                            }))}
                            value={fila.idEquipo}
                            onChange={(valor) =>
                                actualizarDetalle(
                                    index,
                                    'idEquipo',
                                    valor
                                )
                            }
                            isDisabled={!header.idCliente}
                            isClearable
                            noOptionsMessage={() =>
                                header.idCliente
                                    ? 'El cliente no tiene equipos'
                                    : 'Seleccione primero un cliente'
                            }
                        />
                        </label>
                        <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Tipo de servicio</span>
                        <Select
                            {...selectPortalProps}
                            placeholder="Tipo de servicio"
                            options={tiposBase.map((tipo) => ({
                                value: tipo.id_tipo_servicio,
                                label: tipo.nombre
                            }))}
                            value={fila.idTipoServicio}
                            onChange={(valor) =>
                                handleTipoServicioChange(
                                    index,
                                    valor
                                )
                            }
                            isClearable
                        />
                        </label>
                        <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Subservicios</span>
                        <Select
                            {...selectPortalProps}
                            isMulti
                            placeholder="Seleccionar subtipos..."
                            options={fila.subtiposDisponibles}
                            value={fila.idServicios}
                            isDisabled={!fila.idTipoServicio}
                            onChange={(valor) => actualizarSubtiposSeleccionados(index, valor)}
                            closeMenuOnSelect={false}
                            noOptionsMessage={() =>
                                'No hay subtipos disponibles'
                            }
                        />
                        </label>
                        </div>
                        {fila.idServicios.length > 0 && (
                            <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-4">
                                <p className="mb-3 text-sm font-bold text-slate-800">Precio independiente por subtipo</p>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {fila.idServicios.map(servicio => (
                                        <label key={servicio.value} className="block text-sm text-slate-700">
                                            <span className="mb-1 block font-medium">{servicio.label}</span>
                                            <div className="flex rounded-lg border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                                                <span className="border-r border-slate-200 px-3 py-2 text-slate-500">USD $</span>
                                                <input required type="number" min="0" step="0.01" value={servicio.precio ?? ''} onChange={event => actualizarPrecioServicio(index, servicio.value, event.target.value)} placeholder="0.00" className="min-w-0 flex-1 rounded-r-lg px-3 py-2 outline-none" />
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    onClick={agregarDetalle}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 font-semibold text-blue-700 hover:bg-blue-100"
                >
                    <Plus className="h-5 w-5" /> Agregar otro servicio
                </button>

                <div className="text-sm text-slate-600 sm:ml-auto sm:text-right">
                    <p>Servicios: <strong>USD $ {subtotalServicios.toFixed(2)}</strong></p>
                    <p>Adicional: <strong>USD $ {costoAdicional.toFixed(2)}</strong></p>
                    <p className="text-base text-slate-900">Total: <strong>USD $ {(subtotalServicios + costoAdicional).toFixed(2)}</strong></p>
                </div>

                <button
                    type="submit"
                    disabled={guardando}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                    {guardando ? null : <Save className="h-5 w-5" />}
                    {guardando
                        ? 'Guardando...'
                        : initialData ? 'Guardar cambios' : 'Guardar cotización'}
                </button>
            </div>
        </form>
    );
};

export default CotizacionForm;

