// src/components/forms/UsuarioForm.jsx
import { User, Mail, Shield, Save } from "lucide-react";
import { InputField } from "../ui/InputField"; // El componente que creamos antes

export const UsuarioForm = ({ data, onChange, onSubmit, esEdicion }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Nombres" name="nombres" value={data.nombres} onChange={onChange} icon={User} required />
        <InputField label="Apellidos" name="apellidos" value={data.apellidos} onChange={onChange} icon={User} required />
      </div>

      <InputField label="Correo" name="correo" type="email" value={data.correo} onChange={onChange} icon={Mail} required />

      {/* Condicional: Si es edición, quizás no quieres cambiar la contraseña aquí */}
      {!esEdicion && (
        <InputField label="Contraseña" name="contrasena" type="password" value={data.contrasena} onChange={onChange} required />
      )}

      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-indigo-100">
        <Save size={20} />
        {esEdicion ? "Actualizar Usuario" : "Crear Usuario"}
      </button>
    </form>
  );
};