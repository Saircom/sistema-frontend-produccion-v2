
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import Select from 'react-select';
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
    const [clientes, setClientes] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [tiposBase, setTiposBase] = useState([]);
    const [guardando, setGuardando] = useState(false);

    const [header, setHeader] = useState({
        idCliente: null,
        tipoPago: null,
        centroCosto: null,
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
                            idServicios: servicios.map(servicio => ({ value: servicio.id_subtipo_servicio, label: servicio.nombre_subtipo })),
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
        }

        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errorValidacion = validarFormulario();

        if (errorValidacion) {
            alert(errorValidacion);
            return;
        }

        const payload = {
            idCliente: header.idCliente.value,
            tipoPago: header.tipoPago.value,
            centroCosto: header.centroCosto.value,
            nota: header.nota.trim(),
            estado: header.estado,
            detalles: detalles.map((detalle) => ({
                idEquipo: detalle.idEquipo?.value || null,
                idTipoServicio: detalle.idTipoServicio.value,
                idServicios: detalle.idServicios.map(
                    (subtipo) => subtipo.value
                )
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

            alert(
                numeroCotizacion
                    ? `Cotización N.° ${numeroCotizacion} guardada exitosamente`
                    : 'Cotización guardada exitosamente'
            );

            onSaveSuccess?.(response);

            setHeader({
                idCliente: null,
                tipoPago: null,
                centroCosto: null,
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

            alert(`Error: ${mensaje}`);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6"
        >
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {initialData ? 'Editar cotización' : 'Nueva cotización'}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    Registre el cliente y los servicios. El equipo es opcional.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-dashed border-gray-300 bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">
                        Número de cotización
                    </p>

                    <p className="font-semibold text-gray-700">
                        {initialData?.numero_cotizacion || 'Se generará automáticamente al guardar'}
                    </p>
                </div>

                <Select
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
                />

                <Select
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
                />

                <Select
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
                />
            </div>

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

            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Servicios y equipos
                    </h3>

                    <p className="text-sm text-gray-500">
                        Seleccione el tipo y subtipo de servicio. Asocie un equipo solo cuando corresponda.
                    </p>
                </div>

                {detalles.map((fila, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-gray-50 border border-gray-200 p-4 rounded-lg"
                    >
                        <Select
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

                        <Select
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

                        <Select
                            isMulti
                            placeholder="Seleccionar subtipos..."
                            options={fila.subtiposDisponibles}
                            value={fila.idServicios}
                            isDisabled={!fila.idTipoServicio}
                            onChange={(valor) =>
                                actualizarDetalle(
                                    index,
                                    'idServicios',
                                    valor || []
                                )
                            }
                            closeMenuOnSelect={false}
                            noOptionsMessage={() =>
                                'No hay subtipos disponibles'
                            }
                        />

                        <button
                            type="button"
                            onClick={() => eliminarDetalle(index)}
                            disabled={detalles.length === 1}
                            className="text-red-600 font-semibold px-3 py-2 rounded-lg hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            Eliminar
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    type="button"
                    onClick={agregarDetalle}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                    + Agregar servicio
                </button>

                <button
                    type="submit"
                    disabled={guardando}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {guardando
                        ? 'Guardando...'
                        : initialData ? 'Guardar cambios' : 'Guardar cotización'}
                </button>
            </div>
        </form>
    );
};

export default CotizacionForm;

