import React from "react";
import { useAuth } from "../context/AuthContext";

const InicioUsuario = () => {
  const { user } = useAuth();

  // Si no hay usuario, no renderizamos nada
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6 md:p-10 font-sans">
      {/* Contenedor principal centrado */}
      <div className="max-w-4xl mx-auto">
        
        {/* Tarjeta de Bienvenida Principal */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8">
          
          {/* Sección del Icono/Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-inner">
              <svg 
                className="w-12 h-12 md:w-16 md:h-16 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Sección del Texto */}
          <div className="flex-grow text-center md:text-left">
            {/* Saludo Personalizado */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              ¡Hola, <span className="text-blue-600">{user.name} {user.apellidos}</span>!
            </h1>
            
            {/* Mensaje de bienvenida */}
            <p className="text-xl text-slate-600 font-medium mb-6">
              Bienvenido al sistema de <span className="font-semibold text-slate-800">SARICOM</span>.
              <br />
              <span className="text-blue-500 font-semibold italic">¡Que tengas un buen inicio!</span>
            </p>

            {/* Badge del Rol */}
            <div className="inline-flex items-center bg-slate-100 border border-slate-200 px-5 py-3 rounded-full shadow-sm">
              <span className="relative flex h-3 w-3 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-slate-600 uppercase tracking-wider mr-2">
                Conectado como:
              </span>
              <span className="text-lg font-bold text-slate-950">
                {user.rol}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} SARICOM - Sistema de Gestión. Todos los derechos reservados.</p>
        </footer>

      </div>
    </div>
  );
};

export default InicioUsuario;