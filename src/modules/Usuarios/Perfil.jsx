import React, { useState } from "react";
import { User, Mail, Shield, Save, Camera } from "lucide-react";
import { useAuth } from "../context/authContext";

const Perfil = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.name || "",
    email: user?.email || "",
    telefono: ""
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Datos actualizados:", formData);
    // Aquí iría tu lógica de actualización (API call)
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto mt-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Izquierda: Avatar */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="relative w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold mb-4">
              {user?.name?.charAt(0) || "U"}
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="font-semibold text-lg">{user?.name || "Usuario"}</h2>
            <p className="text-gray-500 text-sm">{user?.role || "Administrador"}</p>
          </div>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={18} /> Información Personal
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </div>
          </form>

          {/* Sección de Seguridad */}
          <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={18} /> Seguridad
            </h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">
              Cambiar contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;