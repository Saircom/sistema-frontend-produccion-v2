import React from 'react';

// Definimos los estilos según el tipo de alerta
const alertStyles = {
  success: "bg-green-50 border-green-500 text-green-700",
  error: "bg-red-50 border-red-500 text-red-700",
  warning: "bg-yellow-50 border-yellow-500 text-yellow-700",
  info: "bg-blue-50 border-blue-500 text-blue-700",
};

export const Alert = ({ type = 'info', message, onClose }) => {
  return (
    <div 
      className={`flex items-center justify-between p-4 mb-4 border-l-4 rounded-r shadow-sm transition-opacity duration-300 ${alertStyles[type]}`}
      role="alert"
    >
      <div className="flex items-center">
        <span className="font-medium mr-2 capitalize">{type}:</span>
        <span>{message}</span>
      </div>
      
      {/* Botón de cierre */}
      <button 
        onClick={onClose} 
        className="ml-4 text-gray-500 hover:text-gray-800 focus:outline-none"
        aria-label="Cerrar alerta"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};