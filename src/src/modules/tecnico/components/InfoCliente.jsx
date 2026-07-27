import { FileText, User, ClipboardList, Pencil } from "lucide-react";
import { memo } from "react";

// Componente InfoCliente optimizado para la estructura de tu API JSON
export const InfoCliente = memo(({ servicio, onAddSignature }) => {
  // Extraemos el primer objeto del arreglo servicio_responsable
  const infoFirma = servicio?.servicio_responsable?.[0];
  
  // Extraemos la firma en Base64
  const firmaBase64 = infoFirma?.firma;

  // Mantenemos tu lógica exacta de prioridades para el encargado
  const nombreEncargado = infoFirma?.encargado || servicio?.encargado_equipo || "Nombre del Encargado";

  return (
    <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-500" size={20} />
            Información del Cliente y Validación
          </h3>
        </div>

        {/* El botón cambia dinámicamente si detecta el Base64 */}
        <button
          onClick={onAddSignature}
          className="
            flex items-center gap-2
            px-4 py-2.5
            bg-blue-600 hover:bg-blue-700
            text-white text-sm font-bold
            rounded-xl transition-all active:scale-95
            self-start sm:self-auto
            sm:ml-auto
          "
        >
          {firmaBase64 ? (
            <>
              <Pencil size={14} />
              Cambiar Firma
            </>
          ) : (
            "Añadir Firma"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Columna Izquierda - Datos del Cliente */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-lg uppercase flex-shrink-0">
              {servicio?.razon_social?.[0] || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">
                {servicio?.razon_social || "Cliente no registrado"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                RUC: {servicio?.ruc || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <User size={12} /> Contacto / Técnico
              </label>
              <p className="text-sm text-slate-600 mt-1 font-medium truncate">
                {servicio?.encargado_equipo || "No registrado"}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <ClipboardList size={12} /> Sede
              </label>
              <p className="text-sm text-slate-600 mt-1 font-medium truncate">
                {servicio?.sede || "Principal"}
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Renderizado de la Firma */}
        <div className="flex flex-col items-center justify-center p-4 border-t lg:border-t-0 lg:border-l border-slate-100 min-h-[150px]">
          <div className="w-full max-w-[250px] space-y-4">
            {/* Contenedor aislado para la firma */}
            <div className="h-28 w-full border border-slate-200 flex items-center justify-center bg-white rounded-xl overflow-hidden p-2 shadow-inner">
              {firmaBase64 ? (
                <img
                  src={firmaBase64}
                  alt={`Firma de ${nombreEncargado}`}
                  className="h-full w-full object-contain pointer-events-none select-none block"
                  onError={(e) => {
                    console.error("Error al cargar el string Base64 de la firma");
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-slate-300 text-xs italic tracking-wide">
                  Espacio para firma
                </span>
              )}
            </div>
            <div className="text-center min-w-0">
              <p className="text-sm font-black text-slate-700 uppercase break-words px-2">
                {nombreEncargado}
              </p>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                Firma Autorizada
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

InfoCliente.displayName = 'InfoCliente';
export default InfoCliente;