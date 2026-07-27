import React from "react";
import FormField from "./FormField "; // Importamos el componente FormField
import { marcas, nivelAceites, tipoAceite, estadoCuadro, tecnicosFields } from "../pages/Data.jsx"; // Importamos los datos de las opciones

const ReporteFormulario = ({ formData = {}, handleChange }) => {
  // Opciones para los campos tipo select
  // Definición de campos


  const tiposArranque = [
    "ESTRELLA TRIANGULO",
    "PLENO VOLTAJE",
    "DOBLE ESTRELLA",
    "SOFT STARTER",
    "VSD",
  ];

  const voltajesEquipo = [
    "220",
    "380",
    "440",
  ];

  const estadoOperacion = [
    "SI",
    "NO",
  ];

  const datosGeneralesFields = [
    { id: "marca", name: "marca", placeholder: "Marca del Equipo", type: "select", options: marcas },
    { id: "modelo", name: "modelo", placeholder: "Modelo del Equipo", type: "text" },
    { id: "serie", name: "serie", placeholder: "Número de Serie", type: "text" },
    { id: "horometro", name: "horometro", placeholder: "Horómetro", type: "number" },
    { id: "tempdescarga", name: "tempdescarga", placeholder: "Temperatura de Descarga", type: "number" },
    { id: "unidadPN", name: "unidadPN", placeholder: "Unidad P/N", type: "text" },
    { id: "unidadSN", name: "unidadSN", placeholder: "Unidad S/N", type: "text" },
    { id: "tipoArranque", name: "tipoArranque", placeholder: "Tipo de Arranque", type: "select", options: tiposArranque },
    { id: "voltajeEquipo", name: "voltajeEquipo", placeholder: "Voltaje del Equipo", type: "select", options: voltajesEquipo },
    { id: "ampMotorPrincipal", name: "ampMotorPrincipal", placeholder: "Amperaje del Motor", type: "number" },
    { id: "presionCarga", name: "presionCarga", placeholder: "Presión de Carga", type: "number" },
    { id: "presionDescarga", name: "presionDescarga", placeholder: "Presión de Descarga", type: "number" },
    { id: "ampMotorVentilado", name: "ampMotorVentilado", placeholder: "Amperaje Motor Ventilador", type: "number" },
    { id: "tipoAceite", name: "tipoAceite", placeholder: "Tipo de Aceite", type: "select", options: tipoAceite },
    { id: "nivelAceite", name: "nivelAceite", placeholder: "Nivel de Aceite", type: "select", options: nivelAceites },
    { id: "equipoOperacion", name: "equipoOperacion", placeholder: "Equipo en Operación", type: "select", options: estadoOperacion },
  ];

  const parametrosOperacionFields = [
    { id: "marcaSecador", name: "marcaSecador", placeholder: "Marca de Secador", type: "select", options: marcas },
    { id: "modeloSecador", name: "modeloSecador", placeholder: "Modelo de Secador" },
    { id: "serieSecador", name: "serieSecador", placeholder: "Seire Secador" },
    { id: "voltajeSecador", name: "voltajeSecador", placeholder: "Voltaje Secador", type: "select", options: voltajesEquipo },
    { id: "amperajeSecador", name: "amperajeSecador", placeholder: "Amperaje Secador" },
    { id: "puntoRocio", name: "puntoRocio", placeholder: "Punto de Rocio" },
    { id: "tipoRefrigeracion", name: "tipoRefrigeracion", placeholder: "Tipo de Refrigeracion" },
  ];



  const cuadrofields = [
    { id: "filtroAirePrim", name: "filtroAirePrim", placeholder: "Filtro de aire primario", type: "select", options: estadoCuadro },
    { id: "kitPresMin", name: "kitPresMin", placeholder: "Kit válvula de presión mínima", type: "select", options: estadoCuadro },
    { id: "kitValvTerm", name: "kitValvTerm", placeholder: "Kit válvula termostática", type: "select", options: estadoCuadro },
    { id: "mangLub", name: "mangLub", placeholder: "Mangueras de lubricación", type: "select", options: estadoCuadro },

    { id: "filtroAireSec", name: "filtroAireSec", placeholder: "Filtro de aire secundario", type: "select", options: estadoCuadro },
    { id: "kitParAceite", name: "kitParAceite", placeholder: "Kit válvula parada de aceite", type: "select", options: estadoCuadro },
    { id: "kitRepEsp", name: "kitRepEsp", placeholder: "Kit reparación de válvula espiral", type: "select", options: estadoCuadro },
    { id: "drenAutoTanque", name: "drenAutoTanque", placeholder: "Drenaje automático tanque", type: "select", options: estadoCuadro },

    { id: "filtroAceite", name: "filtroAceite", placeholder: "Filtro de aceite", type: "select", options: estadoCuadro },
    { id: "kitRegAdm", name: "kitRegAdm", placeholder: "Kit regulador de admisión", type: "select", options: estadoCuadro },
    { id: "valvShut1", name: "valvShut1", placeholder: "Válvula tres vías shuttle 1/4", type: "select", options: estadoCuadro },
    { id: "drenAutoPref", name: "drenAutoPref", placeholder: "Drenaje automático pre filtro", type: "select", options: estadoCuadro },

    { id: "filtroSepPrim", name: "filtroSepPrim", placeholder: "Filtro separador primario", type: "select", options: estadoCuadro },
    { id: "kitRegEsp", name: "kitRegEsp", placeholder: "Kit regulador de espiral", type: "select", options: estadoCuadro },
    { id: "valvAlivio", name: "valvAlivio", placeholder: "Válvula de alivio", type: "select", options: estadoCuadro },
    { id: "drenAutoSeca", name: "drenAutoSeca", placeholder: "Drenaje automático secador", type: "select", options: estadoCuadro },

    { id: "filtroSepSec", name: "filtroSepSec", placeholder: "Filtro separador secundario", type: "select", options: estadoCuadro },
    { id: "kitValvAdm", name: "kitValvAdm", placeholder: "Kit válvula admisión", type: "select", options: estadoCuadro },
    { id: "valvChkDesc", name: "valvChkDesc", placeholder: "Válvula check descarga", type: "select", options: estadoCuadro },
    { id: "anilloTanque", name: "anilloTanque", placeholder: "Anillo tapa de tanque", type: "select", options: estadoCuadro },

    { id: "lubricante", name: "lubricante", placeholder: "Lubricante", type: "select", options: estadoCuadro },
    { id: "kitSullicon", name: "kitSullicon", placeholder: "Kit válvula sullicon", type: "select", options: estadoCuadro },
    { id: "valvChkCtrl", name: "valvChkCtrl", placeholder: "Válvula check 1/4 control", type: "select", options: estadoCuadro },
    { id: "filtLineCtrl", name: "filtLineCtrl", placeholder: "Filtro de línea de control", type: "select", options: estadoCuadro },

    { id: "orifRet", name: "orifRet", placeholder: "Orificio línea de retorno", type: "select", options: estadoCuadro },
    { id: "kitSol2Vias", name: "kitSol2Vias", placeholder: "Kit válvula solenoide 2 vías", type: "select", options: estadoCuadro },
    { id: "valvChk1", name: "valvChk1", placeholder: "Válvula check 1/2", type: "select", options: estadoCuadro },
    { id: "trampAgua", name: "trampAgua", placeholder: "Trampas de agua", type: "select", options: estadoCuadro },

    { id: "filtRet", name: "filtRet", placeholder: "Filtros de línea de retorno", type: "select", options: estadoCuadro },
    { id: "kitSol3Vias", name: "kitSol3Vias", placeholder: "Kit válvula solenoide 3 vías", type: "select", options: estadoCuadro },
    { id: "acopFlex", name: "acopFlex", placeholder: "Acople flexible", type: "select", options: estadoCuadro },
    { id: "carbonActAir", name: "carbonActAir", placeholder: "Carbón activo línea de aire", type: "select", options: estadoCuadro },

    { id: "enfrAceite", name: "enfrAceite", placeholder: "Enfriador aceite/aire de lubricación", type: "select", options: estadoCuadro },
    { id: "preFiltCoal", name: "preFiltCoal", placeholder: "Pre filtro coalescentes", type: "select", options: estadoCuadro },
    { id: "postFiltCoal", name: "postFiltCoal", placeholder: "Post filtro coalescentes", type: "select", options: estadoCuadro },
    { id: "tableroEquip", name: "tableroEquip", placeholder: "Tablero eléctrico del equipo", type: "select", options: estadoCuadro },

    { id: "conexMotor", name: "conexMotor", placeholder: "Conexiones motor principal", type: "select", options: estadoCuadro },
    { id: "ventMotorPrin", name: "ventMotorPrin", placeholder: "Ventilador motor principal", type: "select", options: estadoCuadro },
    { id: "conexMotorSec", name: "conexMotorSec", placeholder: "Conexiones motor secundario", type: "select", options: estadoCuadro },
    { id: "ventMotorSec", name: "ventMotorSec", placeholder: "Ventilador motor secundario", type: "select", options: estadoCuadro },
  ];

  const voltyampFields = [
    { id: "amp1", name: "amp1", placeholder: "Amperaje mínimo L1" },
    { id: "amp2", name: "amp2", placeholder: "Amperaje mínimo L2" },
    { id: "amp3", name: "amp3", placeholder: "Amperaje mínimo L3" },
    { id: "amp_vacio_minimo_l1", name: "amp_vacio_minimo_l1", placeholder: "Amperaje plena carga L1" },
    { id: "amp_vacio_minimo_l2", name: "amp_vacio_minimo_l2", placeholder: "Amperaje plena carga L2" },
    { id: "amp_vacio_minimo_l3", name: "amp_vacio_minimo_l3", placeholder: "Amperaje plena carga L3" },
    { id: "volt1", name: "volt1", placeholder: "Voltaje vacío mínimo L1" },
    { id: "volt2", name: "volt2", placeholder: "Voltaje vacío mínimo L2" },
    { id: "volt3", name: "volt3", placeholder: "Voltaje vacío mínimo L3" },
    { id: "vacio_minimo_l1", name: "vacio_minimo_l1", placeholder: "Voltaje plena carga L1" },
    { id: "vacio_minimo_l2", name: "vacio_minimo_l2", placeholder: "Voltaje plena carga L2" },
    { id: "vacio_minimo_l3", name: "vacio_minimo_l3", placeholder: "Voltaje plena carga L3" }
  ];
  // Componente para renderizar campos
  const renderFields = (fields) => (
    fields.map((field) => <FormField key={field.id} field={field} formData={formData} handleChange={handleChange} />)
  );


  const rows = [
    [voltyampFields[0], voltyampFields[3], voltyampFields[6], voltyampFields[9]],  // Fila 1
    [voltyampFields[1], voltyampFields[4], voltyampFields[7], voltyampFields[10]],  // Fila 2
    [voltyampFields[2], voltyampFields[5], voltyampFields[8], voltyampFields[11]],  // Fila 3

  ];

  return (
    <>
      <div>
        <h3>Datos General Compresor2</h3>
        <div className="row">{renderFields(datosGeneralesFields)}</div>
      </div>
      <div>
        <h3>Secador de Refrigeracion</h3>
        <div className="row">{renderFields(parametrosOperacionFields)}</div>
      </div>
      <div>
      <h3>Lectura de voltaje y amperaje</h3>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            {row.map((field, colIndex) =>
              field ? (
                <input
                  key={field.id}
                  type="text"
                  name={field.name}
                  placeholder={field.placeholder}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <div key={colIndex} /> // Espacio vacío si no hay campo en esa celda
              )
            )}
          </div>
        ))}
      </div>
      <div>
      <h3>Actividades realizadas durante el servicio</h3>
        <div className="row">{renderFields(cuadrofields)}</div>
      </div>
      <div>
        <h3>Tecnicos</h3>
        <div className="row">{renderFields(tecnicosFields)}</div>
      </div>
    </>
  );
};

export default ReporteFormulario;
