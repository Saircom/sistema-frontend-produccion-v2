// src/modules/ServicioTecnico/detalleInforme/FiltrosSection.jsx
import React, {
    memo,
    useMemo
} from 'react';

import {
    Settings,
    Droplets,
    Zap,
    Activity,
    Wrench,
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

const obtenerValor = (valor) => {
    if (
        valor === undefined ||
        valor === null ||
        valor === ''
    ) {
        return 'No registrado';
    }

    return valor;
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

const gruposFiltros = [
    {
        id: 'filtracion',
        titulo: 'Filtración y lubricación',
        icon: Droplets,
        campos: [
            {
                label: 'Filtro de aire primario',
                name: 'filtroAirePrim'
            },
            {
                label: 'Filtro de aire secundario',
                name: 'filtroAireSec'
            },
            {
                label: 'Filtro de aceite',
                name: 'filtroAceite'
            },
            {
                label: 'Filtro separador primario',
                name: 'filtroSepPrim'
            },
            {
                label: 'Filtro separador secundario',
                name: 'filtroSepSec'
            },
            {
                label: 'Lubricante',
                name: 'lubricante'
            },
            {
                label: 'Sistema de lubricación',
                name: 'sistemaLubricacion'
            },
            {
                label: 'Filtro de retorno',
                name: 'filtRet'
            },
            {
                label: 'Orificio de retorno',
                name: 'orifRet'
            },
            {
                label: 'Mangueras de lubricación',
                name: 'mangLub'
            },
            {
                label: 'Filtro de línea de control',
                name: 'filtLineCtrl'
            }
        ]
    },
    {
        id: 'valvulas',
        titulo: 'Kits y válvulas',
        icon: Zap,
        campos: [
            {
                label: 'Kit de presión mínima',
                name: 'kitPresMin'
            },
            {
                label: 'Kit parada de aceite',
                name: 'kitParAceite'
            },
            {
                label: 'Kit regulador de admisión',
                name: 'kitRegAdm'
            },
            {
                label: 'Kit regulador espiral',
                name: 'kitRegEsp'
            },
            {
                label: 'Kit reparación espiral',
                name: 'kitRepEsp'
            },
            {
                label: 'Kit válvula de admisión',
                name: 'kitValvAdm'
            },
            {
                label: 'Kit válvula termostática',
                name: 'kitValvTerm'
            },
            {
                label: 'Kit Sullicon',
                name: 'kitSullicon'
            },
            {
                label: 'Solenoide de 2 vías',
                name: 'kitSol2Vias'
            },
            {
                label: 'Solenoide de 3 vías',
                name: 'kitSol3Vias'
            },
            {
                label: 'Válvula shuttle 1/4',
                name: 'valvShut1'
            },
            {
                label: 'Válvula de alivio',
                name: 'valvAlivio'
            },
            {
                label: 'Check de descarga',
                name: 'valvChkDesc'
            },
            {
                label: 'Check de control 1/4',
                name: 'valvChkCtrl'
            },
            {
                label: 'Check 1/2',
                name: 'valvChk1'
            }
        ]
    },
    {
        id: 'drenajes',
        titulo: 'Drenajes y tratamiento',
        icon: Activity,
        campos: [
            {
                label: 'Drenaje automático de tanque',
                name: 'drenAutoTanque'
            },
            {
                label: 'Drenaje automático de prefiltro',
                name: 'drenAutoPref'
            },
            {
                label: 'Drenaje automático de secador',
                name: 'drenAutoSeca'
            },
            {
                label: 'Trampas de agua',
                name: 'trampAgua'
            },
            {
                label: 'Prefiltro coalescente',
                name: 'preFiltCoal'
            },
            {
                label: 'Postfiltro coalescente',
                name: 'postFiltCoal'
            },
            {
                label: 'Carbón activo',
                name: 'carbonActAir'
            },
            {
                label: 'Anillo tapa de tanque',
                name: 'anilloTanque'
            }
        ]
    },
    {
        id: 'mecanica',
        titulo: 'Mecánica y secador',
        icon: Wrench,
        campos: [
            {
                label: 'Enfriador aceite/aire',
                name: 'enfrAceite'
            },
            {
                label: 'Acople flexible',
                name: 'acopFlex'
            },
            {
                label: 'Elemento de acople',
                name: 'Elementoacople'
            },
            {
                label: 'Faja de acoplamiento',
                name: 'fajaAccionamiento'
            },
            {
                label: 'Conexiones motor principal',
                name: 'conexMotor'
            },
            {
                label: 'Conexiones motor secundario',
                name: 'conexMotorSec'
            },
            {
                label: 'Ventilador motor principal',
                name: 'ventMotorPrin'
            },
            {
                label: 'Ventilador motor secundario',
                name: 'ventMotorSec'
            },
            {
                label: 'Tablero eléctrico',
                name: 'tableroEquip'
            },
            {
                label: 'Condensador del secador',
                name: 'Condensador'
            },
            {
                label: 'Evaporador del secador',
                name: 'Evaporador'
            }
        ]
    }
];

const GrupoFiltros = ({
    titulo,
    icon: Icon,
    campos,
    filtros
}) => {
    return (
        <div className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
            <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-indigo-600" />

                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {titulo}
                </h4>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {campos.map((campo) => (
                    <DetailItem
                        key={campo.name}
                        label={campo.label}
                        value={obtenerValor(
                            filtros?.[campo.name]
                        )}
                        icon={Settings}
                    />
                ))}
            </div>
        </div>
    );
};

export const FiltrosSection = ({
    servicio = {}
}) => {
    const filtros = useMemo(
        () =>
            obtenerPrimerRegistro(
                servicio?.filtros_y_componentes
            ),
        [servicio?.filtros_y_componentes]
    );

    const tieneFiltros =
        Object.keys(filtros).length > 0;

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 p-2">
                    <Settings
                        className="text-slate-600"
                        size={22}
                    />
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Estado de filtros y componentes
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Actividades registradas durante la inspección y mantenimiento.
                    </p>
                </div>
            </div>

            {!tieneFiltros ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-500">
                        No existen filtros o componentes registrados.
                    </p>
                </div>
            ) : (
                <div className="mt-6 space-y-6">
                    {filtros?.fecha_registro && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailItem
                                label="Fecha de registro"
                                value={formatearFecha(
                                    filtros.fecha_registro
                                )}
                                icon={CalendarDays}
                            />
                        </div>
                    )}

                    {gruposFiltros.map(
                        (grupo) => (
                            <GrupoFiltros
                                key={grupo.id}
                                titulo={grupo.titulo}
                                icon={grupo.icon}
                                campos={grupo.campos}
                                filtros={filtros}
                            />
                        )
                    )}
                </div>
            )}
        </section>
    );
};

FiltrosSection.displayName =
    'FiltrosSection';

export default memo(FiltrosSection);