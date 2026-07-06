import React from "react";
import { Section, Grid } from "../../../components/forms/FormLayout";
import { nivelAceites, tipoAceite, tecnicosFields, filtros_y_componentes, lecturas_combustion } from "../Data";

const PortatilForm = ({ formData = {}, handleChange }) => {
  const compressorFields = [
    { id: "marca", name: "marca", label: "Marca", placeholder: "Marca", type: "select", options: marcas },
    { id: "modelo", name: "modelo", label: "Modelo", placeholder: "Modelo", type: "text" },
    { id: "serie", name: "serie", label: "Serie", placeholder: "Serie", type: "text" },
    { id: "horometro", name: "horometro", label: "Horómetro", placeholder: "Horómetro", type: "number" },
    { id: "unidadPN", name: "unidadPN", label: "Unidad P/N", placeholder: "Unidad P/N", type: "text" },
    { id: "unidadSN", name: "unidadSN", label: "Unidad S/N", placeholder: "Unidad S/N", type: "text" },
    { id: "nivelAceite", name: "nivelAceite", label: "Nivel de Aceite", placeholder: "Nivel de Aceite", type: "select", options: nivelAceites },
    { id: "tipoAceite", name: "tipoAceite", label: "Tipo de Aceite", placeholder: "Tipo de Aceite", type: "select", options: tipoAceite },
    { id: "tempdescarga", name: "tempdescarga", label: "Temperatura Descarga", placeholder: "Temperatura Descarga", type: "number" },
    { id: "presionCarga", name: "presionCarga", label: "Presión Carga", placeholder: "Presión Carga", type: "number" },
    { id: "presionDescarga", name: "presionDescarga", label: "Presión Descarga", placeholder: "Presión Descarga", type: "number" },
  ];


  return (
    <div className="space-y-6">
      <Section title="Datos Generales del Compresor">
        <Grid fields={compressorFields} formData={formData} handleChange={handleChange} />
      </Section>

      <Section title="Motor de Combustión" bgColor="bg-slate-50/50">
        <Grid fields={lecturas_combustion} formData={formData} handleChange={handleChange} />
      </Section>

      <Section title="Actividades Realizadas">
        <Grid fields={filtros_y_componentes} formData={formData} handleChange={handleChange} />
      </Section>
      <Section title="Personal Técnico">
        <Grid
          fields={tecnicosFields}
          formData={formData}
          handleChange={handleChange}
          cols="grid-cols-1" // <-- Esto fuerza a que cada campo use el 100% del ancho
        />
      </Section>
    </div>
  );
};

export default PortatilForm;