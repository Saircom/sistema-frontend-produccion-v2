import React from 'react';
import { Zap, Activity } from "lucide-react";
import { DetailItem } from "./DetailItem";

// 1. Definimos el componente base memorizado asignándolo a una constante limpia
export const ParametrosElectricosComponent = ({ servicio }) => {

  const voltaje_amperaje = servicio?.voltaje_amperaje?.[0] || {};
  return (

    <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Zap className="text-yellow-500" size={20} /> Parámetros Eléctricos (Voltaje y Amperaje)
      </h3>

      <div className="space-y-6">
        {/* Sección de Amperajes */}
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
            Amperajes de Operación (A)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <DetailItem label="Amp. Plena Carga L1" value={voltaje_amperaje?.amp1} icon={Activity} />
            <DetailItem label="Amp. Plena Carga L2" value={voltaje_amperaje?.amp2} icon={Activity} />
            <DetailItem label="Amp. Plena Carga L3" value={voltaje_amperaje?.amp3} icon={Activity} />
            <DetailItem label="Amp. Vacío L1" value={voltaje_amperaje?.amp_vacio_minimo_l1} icon={Activity} />
            <DetailItem label="Amp. Vacío L2" value={voltaje_amperaje?.amp_vacio_minimo_l2} icon={Activity} />
            <DetailItem label="Amp. Vacío L3" value={voltaje_amperaje?.amp_vacio_minimo_l3} icon={Activity} />
          </div>
        </div>

        {/* Sección de Voltajes */}
        <div className="pt-4 border-t border-slate-50">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
            Voltajes de Entrada (V)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <DetailItem label="Voltaje L1-L2" value={voltaje_amperaje?.volt1} icon={Zap} />
            <DetailItem label="Voltaje L2-L3" value={voltaje_amperaje?.volt2} icon={Zap} />
            <DetailItem label="Voltaje L1-L3" value={voltaje_amperaje?.volt3} icon={Zap} />
            <DetailItem label="Volt. Vacío L1" value={voltaje_amperaje?.vacio_minimo_l1} icon={Zap} />
            <DetailItem label="Volt. Vacío L2" value={voltaje_amperaje?.vacio_minimo_l2} icon={Zap} />
            <DetailItem label="Volt. Vacío L3" value={voltaje_amperaje?.vacio_minimo_l3} icon={Zap} />
          </div>
        </div>
      </div>
    </section>
  );
};


export default ParametrosElectricosComponent;