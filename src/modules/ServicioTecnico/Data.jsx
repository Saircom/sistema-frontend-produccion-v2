import { useState } from 'react'; // Mantener si se usa en este archivo

export const tiposArranque = ["ESTRELLA TRIANGULO", "PLENO VOLTAJE", "DOBLE ESTRELLA", "SOFT STARTER", "VSD"];
export const nivelAceites = ["BAJO", "MEDIO", "CORRECTO"];
export const tipoAceite = ["KTL-8000", "KTL-4000", "CORENA-46", "HYDRAULIC-10W", "OTROS"];
export const voltajesEquipo = ["220V", "380V", "440V", "460V"];
export const estadoOperacion = ["EN OPERACIÓN", "STAND BY", "FUERA DE SERVICIO", "EN OBSERVACIÓN"];
export const inspeccionFiltros = [
  {
    label: "Existe presencia",
    value: "Se procedió a aperturar el filtro de aceite, verificando que existe presencia de partículas metálicas en el papel filtrante, por lo que se concluye que la unidad compresora no estaría trabajando correctamente."
  },
  {
    label: "No existe presencia",
    value: "Se procedió a aperturar el filtro de aceite, verificando que no existe presencia de partículas metálicas en el papel filtrante, por lo que se concluye que la unidad compresora estaría trabajando correctamente."
  }
];

export const estadoCuadro = [
  { value: "LIMPIEZA", label: "Limpieza" },
  { value: "CAMBIO", label: "Cambio" },
  { value: "INSPECCION", label: "Inspección" },
  { value: "AJUSTE", label: "Ajuste" }
];

export const tecnicosFields = [
  { id: "descripcionTrabajo", name: "descripcionTrabajo", placeholder: "Descripción del Trabajo Realizado", type: "textarea", rows: 6 },
  { id: "recomendaciones", name: "recomendaciones", placeholder: "Recomendaciones Técnicas", type: "textarea", rows: 4 },
  { id: "conclusiones", name: "conclusiones", placeholder: "Conclusiones Finales", type: "textarea", rows: 3 },
];

export const marcas = [
  { value: "KAISHAN", label: "KAISHAN" },
  { value: "SULLAIR", label: "SULLAIR" },
  { value: "OTROS", label: "OTROS" },
  { value: "ATLAS COPCO", label: "ATLAS COPCO" },
  { value: "KAESER", label: "KAESER" },
  { value: "INGERSOLL RAND", label: "INGERSOLL RAND" },
  { value: "QUINCY COMPRESSOR", label: "QUINCY COMPRESSOR" },
  { value: "SCHULZ", label: "SCHULZ" },
  { value: "BOGE", label: "BOGE" },
  { value: "MIKROPOR", label: "MIKROPOR" },
  { value: "CA SCREW AIR COMPRESSOR", label: "CA SCREW AIR COMPRESSOR" },
  { value: "SAIRCOM", label: "SAIRCOM" },
  { value: "CIPAIR", label: "CIPAIR" },
  { value: "CECCATO", label: "CECCATO" },
  { value: "BEKO", label: "BEKO" },
  { value: "SULLIVAN PALATEK", label: "SULLIVAN PALATEK" },
  { value: "SUCCESS ENGINE", label: "SUCCESS ENGINE" }
];

export const lecturas_compresor = [
  { id: "marca", name: "marca", placeholder: "Marca del Equipo", type: "select", options: marcas, disabled: true },
  { id: "modelo", name: "modelo", placeholder: "Modelo del Equipo", type: "text", readOnly: true },
  { id: "serie", name: "serie", placeholder: "Número de Serie", type: "text", readOnly: true },
  { id: "horometro", name: "horometro", placeholder: "Horómetro", type: "number" },
  { id: "temp_descarga", name: "temp_descarga", placeholder: "Temperatura de Descarga", type: "number" },
  { id: "unidadpn", name: "unidadpn", placeholder: "Unidad P/N", type: "text" },
  { id: "unidadsn", name: "unidadsn", placeholder: "Unidad S/N", type: "text" },
  { id: "tipo_arranque", name: "tipo_arranque", placeholder: "Tipo de Arranque", type: "select", options: tiposArranque },
  { id: "volt_equipo", name: "volt_equipo", placeholder: "Voltaje del Equipo", type: "select", options: voltajesEquipo },
  { id: "amp_motor", name: "amp_motor", placeholder: "Amperaje del Motor", type: "number" },
  { id: "presion_carga", name: "presion_carga", placeholder: "Presión de Carga", type: "number" },
  { id: "presion_descarga", name: "presion_descarga", placeholder: "Presión de Descarga", type: "number" },
  { id: "amp_motor_ventilador", name: "amp_motor_ventilador", placeholder: "Amperaje Motor Ventilador", type: "number" },
  { id: "tipo_aceite", name: "tipo_aceite", placeholder: "Tipo de Aceite", type: "select", options: tipoAceite },
  { id: "nivel_aceite", name: "nivel_aceite", placeholder: "Nivel de Aceite", type: "select", options: nivelAceites },
  { id: "equipo_operacion", name: "equipo_operacion", placeholder: "Equipo en Operación", type: "select", options: estadoOperacion },
  { id: "inspfiltroaceite", name: "inspfiltroaceite", placeholder: "Inspección Filtro Aceite", type: "select", options: inspeccionFiltros },
];

export const lecturas_secador = [
  { id: "marca_secador", name: "marca_secador", placeholder: "Marca de Secador", type: "select", options: marcas },
  { id: "modelo_secador", name: "modelo_secador", placeholder: "Modelo de Secador", type: "text" },
  { id: "serie_secador", name: "serie_secador", placeholder: "Serie Secador", type: "text" },
  { id: "voltaje_secador", name: "voltaje_secador", placeholder: "Voltaje Secador", type: "select", options: voltajesEquipo },
  { id: "amperaje_secador", name: "amperaje_secador", placeholder: "Amperaje Secador", type: "number" },
  { id: "punto_rocio", name: "punto_rocio", placeholder: "Punto de Rocío", type: "text" },
  { id: "tipo_refrigeracion", name: "tipo_refrigeracion", placeholder: "Tipo de Refrigeración", type: "text" },
];

export const lecturas_combustion = [
  { id: "marcaCombu", name: "marcaCombu", label: "Marca", placeholder: "Marca", type: "select", options: ["PEKINS", "CUMMINS", "KUBOTA", "YANMAR", "CATERPILLAR"] },
  { id: "modeloCombu", name: "modeloCombu", label: "Modelo", placeholder: "Modelo", type: "text" },
  { id: "serieCombu", name: "serieCombu", label: "Serie", placeholder: "Serie", type: "text" },
  { id: "voltajeCombu", name: "voltajeCombu", label: "Voltaje", placeholder: "Voltaje", type: "select", options: ["12", "24"] },
  { id: "presionAceiteCombu", name: "presionAceiteCombu", label: "Presión de Aceite", placeholder: "Presión de Aceite", type: "number" },
  { id: "rpmMaximoCombu", name: "rpmMaximoCombu", label: "RPM Máximo", placeholder: "RPM Máximo", type: "number" },
  { id: "rpmMinimoCombu", name: "rpmMinimoCombu", label: "RPM Mínimo", placeholder: "RPM Mínimo", type: "number" },
  { id: "tipoAceiteCombu", name: "tipoAceiteCombu", label: "Tipo de Aceite", placeholder: "Tipo de Aceite", type: "select", options: ["15W-40"] },
  { id: "nivelAceiteCombu", name: "nivelAceiteCombu", label: "Nivel de Aceite", placeholder: "Nivel de Aceite", type: "select", options: ["BAJO", "MEDIO", "CORRECTO"] },
  { id: "nivelRefrigeranteCombu", name: "nivelRefrigeranteCombu", label: "Nivel de Refrigerante", placeholder: "Nivel de Refrigerante", type: "select", options: ["BAJO", "MEDIO", "CORRECTO"] },
];

export const voltyampFields = [
  { id: "amp1", name: "amp1", placeholder: "Amperaje Plena Carga L1", type: "number" },
  { id: "amp2", name: "amp2", placeholder: "Amperaje Plena Carga L2", type: "number" },
  { id: "amp3", name: "amp3", placeholder: "Amperaje Plena Carga L3", type: "number" },
  { id: "amp_vacio_minimo_l1", name: "amp_vacio_minimo_l1", placeholder: "Amperaje Vacío L1", type: "number" },
  { id: "amp_vacio_minimo_l2", name: "amp_vacio_minimo_l2", placeholder: "Amperaje Vacío L2", type: "number" },
  { id: "amp_vacio_minimo_l3", name: "amp_vacio_minimo_l3", placeholder: "Amperaje Vacío L3", type: "number" },
  { id: "volt1", name: "volt1", placeholder: "Voltaje L1-L2", type: "number" },
  { id: "volt2", name: "volt2", placeholder: "Voltaje L2-L3", type: "number" },
  { id: "volt3", name: "volt3", placeholder: "Voltaje L1-L3", type: "number" },
  { id: "vacio_minimo_l1", name: "vacio_minimo_l1", placeholder: "Voltaje Vacío L1", type: "number" },
  { id: "vacio_minimo_l2", name: "vacio_minimo_l2", placeholder: "Voltaje Vacío L2", type: "number" },
  { id: "vacio_minimo_l3", name: "vacio_minimo_l3", placeholder: "Voltaje Vacío L3", type: "number" }
];


export const filtros_y_componentes = [
  { id: "filtroAirePrim", placeholder: "Filtro de aire primario" },
  { id: "filtroAireSec", placeholder: "Filtro de aire secundario" },
  { id: "filtroAceite", placeholder: "Filtro de aceite" },
  { id: "filtroSepPrim", placeholder: "Filtro separador primario" },
  { id: "filtroSepSec", placeholder: "Filtro separador secundario" },
  { id: "lubricante", placeholder: "Lubricante" },
  { id: "orifRet", placeholder: "Orificio línea de retorno" },
  { id: "filtRet", placeholder: "Filtros de línea de retorno" },
  { id: "enfrAceite", placeholder: "Enfriador aceite/aire" },
  { id: "conexMotor", placeholder: "Conexiones motor principal" },
  { id: "kitPresMin", placeholder: "Kit válvula presión mínima" },
  { id: "kitParAceite", placeholder: "Kit válvula parada de aceite" },
  { id: "kitRegAdm", placeholder: "Kit regulador de admisión" },
  { id: "kitRegEsp", placeholder: "Kit regulador de espiral" },
  { id: "kitValvAdm", placeholder: "Kit válvula admisión" },
  { id: "kitSullicon", placeholder: "Kit válvula sullicon" },
  { id: "kitSol2Vias", placeholder: "Kit válvula solenoide 2 vías" },
  { id: "kitSol3Vias", placeholder: "Kit válvula solenoide 3 vías" }, // <--- Agregado
  { id: "preFiltCoal", placeholder: "Pre filtro coalescentes" },
  { id: "ventMotorPrin", placeholder: "Ventilador motor principal" },
  { id: "kitValvTerm", placeholder: "Kit válvula termostática" },
  { id: "kitRepEsp", placeholder: "Kit reparación de válvula espiral" },
  { id: "valvShut1", placeholder: "Válvula tres vías shuttle 1/4" },
  { id: "valvAlivio", placeholder: "Válvula de alivio" },
  { id: "valvChkDesc", placeholder: "Válvula check descarga" },
  { id: "valvChkCtrl", placeholder: "Válvula check 1/4 control" },
  { id: "valvChk1", placeholder: "Válvula check 1/2" },
  { id: "acopFlex", placeholder: "Acople flexible" },
  { id: "postFiltCoal", placeholder: "Post filtro coalescentes" },
  { id: "conexMotorSec", placeholder: "Conexiones motor secundario" },
  { id: "mangLub", placeholder: "Mangueras de lubricación" },
  { id: "drenAutoTanque", placeholder: "Drenaje automático tanque" },
  { id: "drenAutoPref", placeholder: "Drenaje automático pre filtro" },
  { id: "drenAutoSeca", placeholder: "Drenaje automático secador" },
  { id: "anilloTanque", placeholder: "Anillo tapa de tanque" },
  { id: "filtLineCtrl", placeholder: "Filtro de línea de control" },
  { id: "trampAgua", placeholder: "Trampas de agua" },
  { id: "carbonActAir", placeholder: "Carbón activo línea de aire" },
  { id: "tableroEquip", placeholder: "Tablero eléctrico" },
  { id: "ventMotorSec", placeholder: "Ventilador motor secundario" },
  { id: "Condensador", placeholder: "Condensador Secador" },
  { id: "Elementoacople", placeholder: "Elemento acople" },
  { id: "Evaporador", placeholder: "Evaporador Secador" },
  { id: "fajaAccionamiento", placeholder: "Faja de acoplamiento" },
  { id: "sistemaLubricacion", placeholder: "Sistema de lubricación" }
].map(f => ({ ...f, name: f.id, type: 'select', options: estadoCuadro })); // Inyección automática de name, type y options

