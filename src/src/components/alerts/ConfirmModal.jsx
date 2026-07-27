// src/components/ui/ConfirmModal.jsx
import React from "react";
import { AlertCircle, X } from "lucide-react";

export default function ConfirmModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo Oscuro con Desenfoque Premium */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={loading ? null : onClose} 
      />

      {/* Tarjeta del Modal con Animación de Entrada */}
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100/80 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 z-10 overflow-hidden">
        
        {/* Adorno de fondo abstracto para toque premium */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full blur-2xl opacity-70 pointer-events-none" />

        {/* Botón Cerrar (X) arriba a la derecha */}
        <button 
          disabled={loading}
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-30"
        >
          <X size={18} />
        </button>

        {/* Contenido Principal */}
        <div className="flex flex-col items-center text-center mt-2">
          {/* Contenedor del Icono con Doble Anillo */}
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl ring-8 ring-red-50/50 mb-5 animate-bounce-short">
            <AlertCircle size={32} className="stroke-[2.5]" />
          </div>

          {/* Textos */}
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight px-2">
            ¿Estás seguro de que deseas eliminar este cliente?
          </h3>
          
          <p className="text-sm text-slate-500 mt-2.5 leading-relaxed max-w-[320px]">
            Esta acción <span className="text-red-600 font-semibold underline decoration-2 decoration-red-200">no se puede deshacer</span> de ninguna manera.
          </p>
        </div>

        {/* Botones Estilizados en Bloque o Fila según espacio */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-full order-2 sm:order-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-2xl transition-all tracking-wide"
          >
            No, cancelar
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="w-full order-1 sm:order-2 px-5 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-2xl shadow-lg shadow-red-500/20 transition-all tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Eliminando...
              </>
            ) : (
              "Sí, eliminar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}