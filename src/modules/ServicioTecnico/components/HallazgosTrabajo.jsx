import { FileText, ClipboardList, Users } from "lucide-react";
import { memo } from "react";

export const HallazgosTrabajo = memo(({ servicio }) => {
  // Extraemos el informe técnico (tomamos el primero si es un arreglo)
  const informe_tecnico = servicio?.informe_tecnico?.[0] || {};

  // Obtenemos el arreglo completo de técnicos, inicializando como array vacío si no existe
  const equipo_tecnico = servicio?.tecnicos_adicionales || [];

  return (
    <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <FileText className="text-blue-500" size={20} /> Hallazgos y Trabajo Realizado
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Users size={12} /> Técnico Lider
          </label>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {servicio?.tecnico || "No especificado"}
          </p>
        </div>

        {/* Equipo Técnico */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Users size={12} /> Equipo Técnico
          </label>
          <div className="mt-1">
            {equipo_tecnico.length > 0 ? (
              <ul className="text-sm text-slate-600 font-medium space-y-0.5">
                {equipo_tecnico.map((tecnico, index) => (
                  <li key={index}>• {tecnico?.nombres || "Sin nombre"}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600 mt-1 font-medium italic">No especificado</p>
            )}
          </div>
        </div>

        {/* Tipo de Servicio */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <ClipboardList size={12} /> Tipo de Servicio
          </label>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {servicio?.tipoServicio || "No especificado"}
          </p>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción del Servicio</label>
          <p className="text-sm text-slate-600 leading-relaxed mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
            "{informe_tecnico?.descripcionTrabajo || "No se registró descripción."}"
          </p>
        </div>

        {/* Recomendaciones y Conclusiones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Recomendaciones Técnicas</label>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              {informe_tecnico?.recomendaciones || "Sin observaciones."}
            </p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Conclusiones</label>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              {informe_tecnico?.conclusiones || "Sin conclusiones."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

HallazgosTrabajo.displayName = 'HallazgosTrabajo';