import { ClipboardList, RefreshCw, Settings, Trash2, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { memo, useState } from "react";

export const ServicioHeader = memo(({
  servicio,
  id_servicio,
  user, // Recibimos el objeto user completo para la validación
  onEstadoChange,
  onEdit,
  onPrint
}) => {
  const [mostrarMenuEstado, setMostrarMenuEstado] = useState(false);

  // Normalización de roles para validación segura
  const rolUser = (user?.rol || "").toLowerCase().trim();
  const esAdmin = rolUser.includes("ADMINISTRADOR");
  const esTecnico = rolUser.includes("TECNICO");
  const esPostventa = rolUser.includes("POSTVENTA");

  const handleDelete = async () => {
    const success = await onEstadoChange("Eliminado");
    if (success) {
      console.log("Reporte eliminado");
      setTimeout(() => window.location.href = "/tecnicos/reportes", 2000);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Revisado': return 'bg-green-100 text-green-700';
      case 'Observado': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
      <div>
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <ClipboardList size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Ficha Técnica Oficial</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800">Orden de Servicio #{id_servicio}</h1>
        <div className="flex items-center gap-3">
          <p className="text-slate-500 text-sm font-medium">
            {servicio?.razon_social} • {servicio?.fechainicio?.split("T")[0].split("-").reverse().join("/")}
          </p>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getEstadoColor(servicio?.estado)}`}>
            {servicio?.estado || 'Pendiente'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 w-full md:w-auto">

        {/* Botón de PDF (Admins y Postventa) */}
        {(esAdmin || esPostventa) && (
          <button
            onClick={onPrint}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            <FileText size={18} /> PDF
          </button>
        )}

        {/* Control de estados (Solo Admins) */}
        {esAdmin && (
          <div className="relative">
            <button
              onClick={() => setMostrarMenuEstado(!mostrarMenuEstado)}
              className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-4 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              <RefreshCw size={18} className={mostrarMenuEstado ? "animate-spin" : ""} />
              Estado
            </button>

            {mostrarMenuEstado && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMostrarMenuEstado(false)}></div>
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2">
                  <button onClick={() => { onEstadoChange("Revisado"); setMostrarMenuEstado(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-green-600 hover:bg-green-50"><CheckCircle size={16} /> Marcar Revisado</button>
                  <button onClick={() => { onEstadoChange("Observado"); setMostrarMenuEstado(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50"><AlertCircle size={16} /> Marcar Observado</button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"><Trash2 size={16} /> Eliminar Reporte</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Botón de Edición (Admins y Técnicos) */}
        {(esAdmin || esTecnico) && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Settings size={18} /> Editar
          </button>
        )}
      </div>
    </header>
  );
});

ServicioHeader.displayName = 'ServicioHeader';