import React from "react";

const ClienteForm = ({ id, formData, onChange, onRucChange, isEdit = false }) => {
  const campos = [
    { name: "ruc", label: "RUC (11 dígitos)", type: "text", maxLength: 11, pattern: "\\d{11}" },
    { name: "razon_social", label: "Razón Social", type: "text" },
    { name: "correo", label: "Correo Electrónico", type: "email" },
    { name: "direccion", label: "Dirección", type: "text" },
    { name: "celular", label: "Celular", type: "text" },
    { name: "contacto", label: "Persona de Contacto", type: "text" },
  ];

  // Función para manejar solo números en el RUC
  const handleRucChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Elimina todo lo que no sea número
    
    // Si estás pasando un evento completo al padre, creamos un evento sintético
    const newEvent = {
      ...e,
      target: { ...e.target, name: "ruc", value: value }
    };
    
    // Llamamos a la función original que recibe el padre
    if (!isEdit && onRucChange) {
      onRucChange(newEvent);
    }
  };

  return (
    <form id={id} className="space-y-4">
      {campos.map((campo) => (
        <div key={campo.name} className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">{campo.label}</label>
          <input
            type={campo.type}
            name={campo.name}
            value={formData[campo.name] || ""}
            // Aplicamos la lógica de solo números al RUC
            onChange={campo.name === "ruc" && !isEdit ? handleRucChange : onChange}
            readOnly={campo.name === "ruc" && isEdit}
            maxLength={campo.maxLength || undefined}
            pattern={campo.pattern || undefined}
            title={campo.name === "ruc" ? "El RUC debe tener exactamente 11 números" : undefined}
            required
            className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      ))}
    </form>
  );
};
export default ClienteForm;