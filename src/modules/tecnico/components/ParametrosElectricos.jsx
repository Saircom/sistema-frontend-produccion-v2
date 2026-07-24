// src/modules/ServicioTecnico/detalleInforme/ParametrosElectricosComponent.jsx
import React, {
    memo,
    useMemo
} from 'react';

import {
    Zap,
    Activity,
    CalendarDays
} from 'lucide-react';

import DetailItem from './DetailItem.jsx';

const obtenerPrimerRegistro = (valor) => {
    if (Array.isArray(valor)) {
        return valor[0] ?? {};
    }

    if (
        valor &&
        typeof valor === 'object'
    ) {
        return valor;
    }

    return {};
};

const obtenerValor = (...valores) => {
    for (const valor of valores) {
        if (
            valor !== undefined &&
            valor !== null &&
            valor !== ''
        ) {
            return valor;
        }
    }

    return 'No registrado';
};

const agregarUnidad = (
    valor,
    unidad
) => {
    if (
        valor === undefined ||
        valor === null ||
        valor === '' ||
        valor === 'No registrado'
    ) {
        return 'No registrado';
    }

    const texto = String(valor).trim();

    if (
        texto
            .toLowerCase()
            .includes(
                unidad.toLowerCase()
            )
    ) {
        return texto;
    }

    return `${texto} ${unidad}`;
};

const formatearFecha = (fecha) => {
    if (!fecha) {
        return 'No registrada';
    }

    const fechaConvertida =
        new Date(fecha);

    if (
        Number.isNaN(
            fechaConvertida.getTime()
        )
    ) {
        return fecha;
    }

    return new Intl.DateTimeFormat(
        'es-PE',
        {
            timeZone: 'America/Lima',
            dateStyle: 'medium',
            timeStyle: 'short'
        }
    ).format(fechaConvertida);
};

export const ParametrosElectricosComponent = ({
    servicio = {}
}) => {
    const lecturaElectrica = useMemo(
        () =>
            obtenerPrimerRegistro(
                servicio?.voltaje_amperaje
            ),
        [servicio?.voltaje_amperaje]
    );

    const amperajes = [
        {
            label: 'Amp. plena carga L1',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica?.amp1
                ),
                'A'
            )
        },
        {
            label: 'Amp. plena carga L2',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica?.amp2
                ),
                'A'
            )
        },
        {
            label: 'Amp. plena carga L3',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica?.amp3
                ),
                'A'
            )
        },
        {
            label: 'Amp. vacío L1',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica
                        ?.amp_vacio_minimo_l1
                ),
                'A'
            )
        },
        {
            label: 'Amp. vacío L2',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica
                        ?.amp_vacio_minimo_l2
                ),
                'A'
            )
        },
        {
            label: 'Amp. vacío L3',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica
                        ?.amp_vacio_minimo_l3
                ),
                'A'
            )
        }
    ];

    const voltajes = [
        {
            label: 'Voltaje L1-L2',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica?.volt1
                ),
                'V'
            )
        },
        {
            label: 'Voltaje L2-L3',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica?.volt2
                ),
                'V'
            )
        },
        {
            label: 'Voltaje L1-L3',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica?.volt3
                ),
                'V'
            )
        },
        {
            label: 'Voltaje vacío L1',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica
                        ?.vacio_minimo_l1
                ),
                'V'
            )
        },
        {
            label: 'Voltaje vacío L2',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica
                        ?.vacio_minimo_l2
                ),
                'V'
            )
        },
        {
            label: 'Voltaje vacío L3',
            value: agregarUnidad(
                obtenerValor(
                    lecturaElectrica
                        ?.vacio_minimo_l3
                ),
                'V'
            )
        }
    ];

    const tieneLectura =
        Object.keys(
            lecturaElectrica
        ).length > 0;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-yellow-50 p-2">
                    <Zap
                        className="text-yellow-600"
                        size={22}
                    />
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Parámetros eléctricos
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Mediciones de voltaje y amperaje registradas durante el servicio.
                    </p>
                </div>
            </div>

            {!tieneLectura ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-500">
                        No existen lecturas eléctricas registradas.
                    </p>
                </div>
            ) : (
                <div className="mt-6 space-y-6">
                    {lecturaElectrica?.fecha_lectura && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailItem
                                label="Fecha de lectura"
                                value={formatearFecha(
                                    lecturaElectrica
                                        .fecha_lectura
                                )}
                                icon={CalendarDays}
                            />
                        </div>
                    )}

                    <div>
                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Amperajes de operación
                        </h4>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {amperajes.map(
                                (item) => (
                                    <DetailItem
                                        key={
                                            item.label
                                        }
                                        label={
                                            item.label
                                        }
                                        value={
                                            item.value
                                        }
                                        icon={
                                            Activity
                                        }
                                    />
                                )
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-5">
                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                            Voltajes de entrada
                        </h4>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {voltajes.map(
                                (item) => (
                                    <DetailItem
                                        key={
                                            item.label
                                        }
                                        label={
                                            item.label
                                        }
                                        value={
                                            item.value
                                        }
                                        icon={Zap}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

ParametrosElectricosComponent.displayName =
    'ParametrosElectricosComponent';

export default memo(
    ParametrosElectricosComponent
);