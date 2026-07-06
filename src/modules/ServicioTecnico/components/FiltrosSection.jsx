import React from 'react';
import { Settings, Droplets, Zap, Activity } from 'lucide-react'; // Asegúrate de importar tus iconos
import DetailItem from './DetailItem'; // Ajusta la ruta según tu estructura

export const FiltrosSection = ({ servicio }) => {
    // Extraemos de forma segura el primer objeto del array de filtros
    const filtros = servicio?.filtros_y_componentes?.[0] || {};

    return (
        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Settings className="text-slate-500" size={20} /> Estado de Filtros y Componentes
            </h3>

            <div className="space-y-8">

                {/* 1. SISTEMA DE FILTRACIÓN Y LUBRICACIÓN */}
                <div>
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Droplets size={14} /> Filtración y Lubricación
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <DetailItem label="Filtro Aire Primario" value={filtros.filtroAirePrim} />
                        <DetailItem label="Filtro Aire Secundario" value={filtros.filtroAireSec} />
                        <DetailItem label="Filtro Aceite" value={filtros.filtroAceite} />
                        <DetailItem label="Filtro Separador Primario" value={filtros.filtroSepPrim} />
                        <DetailItem label="Filtro Separador Secundario" value={filtros.filtroSepSec} />
                        <DetailItem label="Lubricante" value={filtros.lubricante} />
                        <DetailItem label="Sistema Lubricación" value={filtros.sistemaLubricacion} />
                        <DetailItem label="Filtro Retorno" value={filtros.filtRet} />
                        <DetailItem label="Orificio Retorno" value={filtros.orifRet} />
                        <DetailItem label="Mangueras Lubricación" value={filtros.mangLub} />
                        <DetailItem label="Filtro Línea Control" value={filtros.filtLineCtrl} />
                    </div>
                </div>

                {/* 2. KITS Y VÁLVULAS */}
                <div className="pt-4 border-t border-slate-50">
                    <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap size={14} /> Kits y Válvulas
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <DetailItem label="Kit Presión Mínima" value={filtros.kitPresMin} />
                        <DetailItem label="Kit Parada Aceite" value={filtros.kitParAceite} />
                        <DetailItem label="Kit Regulador Admisión" value={filtros.kitRegAdm} />
                        <DetailItem label="Kit Regulador Espiral" value={filtros.kitRegEsp} />
                        <DetailItem label="Kit Reparación Espiral" value={filtros.kitRepEsp} />
                        <DetailItem label="Kit Válvula Admisión" value={filtros.kitValvAdm} />
                        <DetailItem label="Kit Válvula Termostática" value={filtros.kitValvTerm} />
                        <DetailItem label="Kit Sullicon" value={filtros.kitSullicon} />
                        <DetailItem label="Solenoide 2 Vías" value={filtros.kitSol2Vias} />
                        <DetailItem label="Solenoide 3 Vías" value={filtros.kitSol3Vias} />

                        <DetailItem label="Válvula Shuttle 1/4" value={filtros.valvShut1} />
                        <DetailItem label="Válvula Alivio" value={filtros.valvAlivio} />
                        <DetailItem label="Check Descarga" value={filtros.valvChkDesc} />
                        <DetailItem label="Check Control 1/4" value={filtros.valvChkCtrl} />
                        <DetailItem label="Check 1/2" value={filtros.valvChk1} />
                    </div>
                </div>

                {/* 3. DRENAJES Y TRATAMIENTO */}
                <div className="pt-4 border-t border-slate-50">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity size={14} /> Drenajes y Tratamiento
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <DetailItem label="Drenaje Tanque" value={filtros.drenAutoTanque} />
                        <DetailItem label="Drenaje Pre Filtro" value={filtros.drenAutoPref} />
                        <DetailItem label="Drenaje Secador" value={filtros.drenAutoSeca} />
                        <DetailItem label="Trampas de Agua" value={filtros.trampAgua} />

                        <DetailItem label="Pre Filtro Coalescente" value={filtros.preFiltCoal} />
                        <DetailItem label="Post Filtro Coalescente" value={filtros.postFiltCoal} />
                        <DetailItem label="Carbón Activo" value={filtros.carbonActAir} />
                        <DetailItem label="Anillo Tapa Tanque" value={filtros.anilloTanque} />
                    </div>
                </div>

                {/* 4. MECÁNICA Y SECADOR */}
                <div className="pt-4 border-t border-slate-50">
                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Settings size={14} /> Mecánica y Secador
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <DetailItem label="Enfriador Aceite/Aire" value={filtros.enfrAceite} />

                        <DetailItem label="Acople Flexible" value={filtros.acopFlex} />
                        <DetailItem label="Elemento Acople" value={filtros.Elementoacople} />
                        <DetailItem label="Faja Acoplamiento" value={filtros.fajaAccionamiento} />

                        <DetailItem label="Conexiones Motor Principal" value={filtros.conexMotor} />
                        <DetailItem label="Conexiones Motor Secundario" value={filtros.conexMotorSec} />

                        <DetailItem label="Ventilador Principal" value={filtros.ventMotorPrin} />
                        <DetailItem label="Ventilador Secundario" value={filtros.ventMotorSec} />

                        <DetailItem label="Tablero Eléctrico" value={filtros.tableroEquip} />

                        <DetailItem label="Condensador Secador" value={filtros.Condensador} />
                        <DetailItem label="Evaporador Secador" value={filtros.Evaporador} />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FiltrosSection;