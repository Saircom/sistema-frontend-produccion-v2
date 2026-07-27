// src/modules/ServicioTecnico/detalleInforme/ParametrosCompresorComponent.jsx
import React, { memo, useMemo } from 'react';
import {
    Activity,
    HardDrive,
    Settings,
    Thermometer,
    Hash,
    Zap,
    Gauge,
    Droplets,
    Clock,
    ShieldAlert,
    Filter,
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

const formatearFecha = (fecha) => {
    if (!fecha) {
        return 'No registrada';
    }

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
        return fecha;
    }

    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(fechaConvertida);
};

const ParametrosCompresorComponent = ({
    servicio = {}
}) => {
    const lectura = useMemo(
        () =>
            obtenerPrimerRegistro(
                servicio?.lecturas_compresor
            ),
        [servicio?.lecturas_compresor]
    );

    const equipo =
        servicio?.equipo ?? {};

    const marca = obtenerValor(
        equipo?.marca,
        servicio?.marca,
        lectura?.marca
    );

    const modelo = obtenerValor(
        equipo?.modelo,
        servicio?.modelo,
        lectura?.modelo
    );

    const serie = obtenerValor(
        equipo?.serie,
        servicio?.serie,
        lectura?.serie
    );

    const parametros = [
        {
            label: 'Marca',
            value: marca,
            icon: HardDrive
        },
        {
            label: 'Modelo',
            value: modelo,
            icon: Settings
        },
        {
            label: 'N.° de serie',
            value: serie,
            icon: Hash
        },
        {
            label: 'Fecha de lectura',
            value: formatearFecha(
                lectura?.fecha_lectura
            ),
            icon: CalendarDays
        },
        {
            label: 'Horómetro',
            value: obtenerValor(
                lectura?.horometro
            ),
            icon: Clock,
            suffix: 'h'
        },
        {
            label: 'Temperatura de descarga',
            value: obtenerValor(
                lectura?.temp_descarga
            ),
            icon: Thermometer,
            suffix: '°C'
        },
        {
            label: 'Unidad P/N',
            value: obtenerValor(
                lectura?.unidadpn
            ),
            icon: Hash
        },
        {
            label: 'Unidad S/N',
            value: obtenerValor(
                lectura?.unidadsn
            ),
            icon: Hash
        },
        {
            label: 'Tipo de arranque',
            value: obtenerValor(
                lectura?.tipo_arranque
            ),
            icon: Zap
        },
        {
            label: 'Voltaje del equipo',
            value: obtenerValor(
                lectura?.volt_equipo
            ),
            icon: Zap
        },
        {
            label: 'Amperaje motor principal',
            value: obtenerValor(
                lectura?.amp_motor
            ),
            icon: Zap,
            suffix: 'A'
        },
        {
            label: 'Presión de carga',
            value: obtenerValor(
                lectura?.presion_carga
            ),
            icon: Gauge,
            suffix: 'bar'
        },
        {
            label: 'Presión de descarga',
            value: obtenerValor(
                lectura?.presion_descarga
            ),
            icon: Gauge,
            suffix: 'bar'
        },
        {
            label: 'Amperaje motor ventilador',
            value: obtenerValor(
                lectura?.amp_motor_ventilador
            ),
            icon: Zap,
            suffix: 'A'
        },
        {
            label: 'Tipo de aceite',
            value: obtenerValor(
                lectura?.tipo_aceite
            ),
            icon: Droplets
        },
        {
            label: 'Nivel de aceite',
            value: obtenerValor(
                lectura?.nivel_aceite
            ),
            icon: Droplets
        },
        {
            label: 'Estado de operación',
            value: obtenerValor(
                lectura?.equipo_operacion
            ),
            icon: ShieldAlert
        }
    ];

    const inspeccionFiltro =
        obtenerValor(
            lectura?.inspfiltroaceite
        );

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-50 p-2">
                    <Activity
                        className="text-emerald-600"
                        size={22}
                    />
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Parámetros del compresor
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Información registrada durante la ejecución del servicio.
                    </p>
                </div>
            </div>

            {Object.keys(lectura).length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-500">
                        No existen lecturas registradas para el compresor.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {parametros.map((parametro) => {
                            const valorFinal =
                                parametro.value !==
                                    'No registrado' &&
                                    parametro.suffix
                                    ? `${parametro.value} ${parametro.suffix}`
                                    : parametro.value;

                            return (
                                <DetailItem
                                    key={parametro.label}
                                    label={parametro.label}
                                    value={valorFinal}
                                    icon={parametro.icon}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start gap-3">
                            <Filter className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    Inspección del filtro de aceite
                                </p>

                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                    {inspeccionFiltro}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
};

export default memo(ParametrosCompresorComponent);