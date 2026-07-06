import React, { memo } from 'react';
import {
  Activity,
  HardDrive,
  Settings,
  Hash,
  Zap,
  Thermometer,
  Droplets
} from 'lucide-react';
import DetailItem from './DetailItem'; // Asegúrate de que la ruta relativa apunte correctamente a tu DetailItem

const ParametrosSecadorComponent = memo(({ servicio }) => {
  // Si tu backend maneja una tabla relacional para lecturas del secador (ej: lecturas_secador),
  // extraemos el primer índice. Si viene en la raíz, usamos 'servicio' directamente.
  const lecturaSecador = servicio?.lecturas_secador?.[0] || servicio || {};

  return (
    <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="text-blue-500" size={20} /> Parámetros del Secador
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Fila 1: Identificación y Energía (Mapeado a nomenclatura típica de tu BD) */}
        <DetailItem label="Marca Secador" value={lecturaSecador?.marca_secador} icon={HardDrive} />
        <DetailItem label="Modelo Secador" value={lecturaSecador?.modelo_secador || servicio?.modelo_secador} icon={Settings} />
        <DetailItem label="N° Serie Secador" value={lecturaSecador?.serie_secador || servicio?.serie_secador} icon={Hash} />
        <DetailItem label="Voltaje Secador" value={lecturaSecador?.voltaje_secador || lecturaSecador?.volt_equipo} icon={Zap} />

        {/* Fila 2: Operación Crítica */}
        <DetailItem label="Amperaje Secador" value={lecturaSecador?.amperaje_secador} icon={Zap} />
        <DetailItem label="Punto de Rocío" value={lecturaSecador?.punto_rocio} icon={Thermometer} />
        <DetailItem label="Tipo Refrigeración" value={lecturaSecador?.tipo_refrigeracion || servicio?.tipo_refrigeracion} icon={Droplets} />

        {/* Bloque vacío estilizado para rellenar la rejilla en pantallas grandes y mantener simetría */}
        <div className="hidden md:block bg-slate-50/50 rounded-xl border border-dashed border-slate-100"></div>
      </div>
    </section>
  );
});

ParametrosSecadorComponent.displayName = 'ParametrosSecador';

export default ParametrosSecadorComponent;