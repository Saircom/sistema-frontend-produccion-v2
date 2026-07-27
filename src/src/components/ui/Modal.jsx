import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
      {/* Fondo clickeable para cerrar */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Contenedor principal */}
      <div className="relative bg-white w-full max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Cabecera (Fija) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-700 bg-red-600 flex-shrink-0">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-red-100 hover:bg-red-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cuerpo (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
          {children}
        </div>

        {/* Footer (Fijo) */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;