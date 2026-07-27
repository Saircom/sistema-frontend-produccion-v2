import React, { useMemo, useEffect } from "react";
import { Section, Grid } from "../../../components/forms/FormLayout";
import {
    lecturas_compresor,
    lecturas_secador,
    voltyampFields,
    tecnicosFields,
    filtros_y_componentes // Se mantiene la importación
} from "../Data";

const InfoDisplay = React.memo(({ label, value }) => (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {label}
        </label>
        <p className="text-xs font-semibold text-slate-700 truncate">
            {value || "---"}
        </p>
    </div>
));
InfoDisplay.displayName = "InfoDisplay";

function EstacionarioForm({ formData = {}, handleChange, handleSubmit, isSaving = false, title = "Editar Equipo Estacionario" }) {

    useEffect(() => {
        console.log("DEBUG - Datos recibidos en formulario:", formData);
    }, [formData]);

    const flatFormData = useMemo(() => {
        if (!formData) return {};

        const extraerDatos = (campo) => {
            if (!formData[campo]) return {};
            return Array.isArray(formData[campo]) ? (formData[campo][0] || {}) : formData[campo];
        };

        return {
            ...formData,
            ...extraerDatos("lecturas_compresor"),
            ...extraerDatos("lecturas_secador"),
            ...extraerDatos("voltaje_amperaje"),
            ...extraerDatos("filtros_y_componentes"),
            ...extraerDatos("informe_tecnico"),
        };
    }, [formData]);

    // Se eliminó la lógica de marca/tipoMantenimiento y la dependencia de obtenerComponentesPorServicio

    const secciones = useMemo(() => [
        { id: "compresor", title: "Lecturas del Compresor", fields: lecturas_compresor, cols: "grid-cols-1 md:grid-cols-4" },
        { id: "secador", title: "Parámetros del Secador", fields: lecturas_secador, cols: "grid-cols-1 md:grid-cols-2" },
        { id: "electricos", title: "Voltaje y Amperaje", fields: voltyampFields, cols: "grid-cols-1 sm:grid-cols-3" },
        { id: "checklist", title: "Actividades Realizadas", fields: filtros_y_componentes, cols: "grid-cols-1 md:grid-cols-2" }, // Se usa la constante directamente
        { id: "informe", title: "Informe Técnico", fields: tecnicosFields, cols: "grid-cols-1" }
    ], []); // Lista de dependencias vacía ya que ahora es estático

    return (
        <div className="">
            <form onSubmit={handleSubmit} className="">
                {secciones.map((seccion) => (
                    <div key={seccion.id} className="">
                        <Section title={seccion.title}>
                            <Grid
                                fields={seccion.fields} // Ya no es necesario el condicional ternario
                                formData={flatFormData}
                                handleChange={handleChange}
                                cols={seccion.cols}
                                sectionId={seccion.id}
                            />
                        </Section>
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg disabled:bg-slate-400"
                >
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
            </form>
        </div>
    );
}

export default EstacionarioForm;