import React, { memo } from 'react';
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
    ShieldAlert
} from 'lucide-react';
import DetailItem from './DetailItem';

const ParametrosCompresorComponent = ({ servicio = {} }) => {

    // Obtener primera lectura si existe
    const lectura = servicio?.lecturas_compresor?.[0] ?? {};

    // Función para mostrar valores válidos
    const getValue = (...values) => {
        for (const value of values) {
            if (
                value !== undefined &&
                value !== null &&
                value !== ''
            ) {
                return value;
            }
        }
        return '-';
    };

    // Datos principales
    const marca = getValue(
        servicio?.marca,
        lectura?.marca
    );

    const modelo = getValue(
        servicio?.modelo,
        lectura?.modelo
    );

    const serie = getValue(
        servicio?.serie,
        lectura?.serie
    );

    console.log('=== PARAMETROS COMPRESOR ===');
    console.log('Servicio:', servicio);
    console.log('Lectura:', lectura);
    console.log('Marca:', marca);

    return (
        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity
                    className="text-emerald-500"
                    size={20}
                />
                Parámetros del Compresor
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Identificación */}
                <DetailItem
                    label="Marca"
                    value={marca}
                    icon={HardDrive}
                />

                <DetailItem
                    label="Modelo"
                    value={modelo}
                    icon={Settings}
                />

                <DetailItem
                    label="N° Serie"
                    value={serie}
                    icon={Hash}
                />

                <DetailItem
                    label="Horómetro"
                    value={getValue(lectura?.horometro)}
                    icon={Clock}
                />

                {/* Parámetros técnicos */}
                <DetailItem
                    label="Temp. Descarga"
                    value={getValue(lectura?.temp_descarga)}
                    icon={Thermometer}
                />

                <DetailItem
                    label="Unidad P/N"
                    value={getValue(lectura?.unidadpn)}
                    icon={Hash}
                />

                <DetailItem
                    label="Unidad S/N"
                    value={getValue(lectura?.unidadsn)}
                    icon={Hash}
                />

                <DetailItem
                    label="Tipo Arranque"
                    value={getValue(lectura?.tipo_arranque)}
                    icon={Zap}
                />

                {/* Eléctricos y presión */}
                <DetailItem
                    label="Voltaje Equipo"
                    value={getValue(lectura?.volt_equipo)}
                    icon={Zap}
                />

                <DetailItem
                    label="Amp. Motor Pral."
                    value={getValue(lectura?.amp_motor)}
                    icon={Zap}
                />

                <DetailItem
                    label="Presión Carga"
                    value={getValue(lectura?.presion_carga)}
                    icon={Gauge}
                />

                <DetailItem
                    label="Presión Descarga"
                    value={getValue(lectura?.presion_descarga)}
                    icon={Gauge}
                />

                {/* Lubricación y operación */}
                <DetailItem
                    label="Amp. Ventilador"
                    value={getValue(
                        lectura?.amp_motor_ventilador
                    )}
                    icon={Zap}
                />

                <DetailItem
                    label="Tipo Aceite"
                    value={getValue(lectura?.tipo_aceite)}
                    icon={Droplets}
                />

                <DetailItem
                    label="Nivel Aceite"
                    value={getValue(lectura?.nivel_aceite)}
                    icon={Droplets}
                />

                <DetailItem
                    label="Estado Operación"
                    value={getValue(
                        lectura?.equipo_operacion
                    )}
                    icon={ShieldAlert}
                />
                <DetailItem
                    label="Estado Operación"
                    value={getValue(
                        lectura?.inspfiltroaceite || "No se registró inspección de filtro."
                    )}
                    icon={ShieldAlert}
                />
            </div>
        </section>
    );
};

export default memo(ParametrosCompresorComponent);