import React, { useEffect, useMemo, useState } from "react";

const ClienteForm = ({
  id,
  formData,
  onChange,
  onRucChange,
  onSubmit,
  isEdit = false,
  loading = false
}) => {

  const [ubigeos, setUbigeos] = useState({});

  useEffect(() => {
    fetch("https://free.e-api.net.pe/ubigeos.json")
      .then(res => res.json())
      .then(data => setUbigeos(data))
      .catch(err => console.error(err));
  }, []);

  const departamentos = useMemo(
    () => Object.keys(ubigeos),
    [ubigeos]
  );

  const provincias = useMemo(() => {
    if (!formData.departamento) return [];
    return Object.keys(
      ubigeos[formData.departamento] || {}
    );
  }, [ubigeos, formData.departamento]);

  const distritos = useMemo(() => {
    if (!formData.departamento || !formData.provincia) return [];

    return Object.keys(
      ubigeos[formData.departamento]?.[formData.provincia] || {}
    );
  }, [ubigeos, formData.departamento, formData.provincia]);

  // Intercepta los cambios y convierte el valor a MAYÚSCULAS
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const upperEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: value.toUpperCase()
      }
    };

    if (name === "ruc" && onRucChange) {
      onRucChange(upperEvent);
    } else {
      onChange(upperEvent);
    }
  };

  // Todos estos inputs generados dinámicamente llevan 'required'
  const campos = [
    { name: "ruc", label: "RUC", type: "text", readOnly: isEdit },
    { name: "razon_social", label: "Razón Social", type: "text" },
    { name: "correo", label: "Correo Electrónico", type: "email" },
    { name: "direccion", label: "Dirección", type: "text", full: true },
    { name: "celular", label: "Celular", type: "text" },
    { name: "contacto", label: "Persona de Contacto", type: "text" },
  ];

  const opcionesZona = [
    { value: "NORTE", label: "NORTE" },
    { value: "SUR", label: "SUR" },
    { value: "CENTRO", label: "CENTRO" },
    { value: "TRUJILLO", label: "TRUJILLO" },
    { value: "CLIENTES KAM", label: "CLIENTES KAM" }
  ];

  return (
    <form id={id} onSubmit={onSubmit} className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Campos de texto normales (TODOS REQUERIDOS) */}
        {campos.map((campo) => (
          <div
            key={campo.name}
            className={`flex flex-col gap-1 ${campo.full ? "md:col-span-2" : ""
              }`}
          >
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">
              {campo.label} *
            </label>

            <input
              type={campo.type}
              name={campo.name}
              value={formData[campo.name] || ""}
              onChange={handleInputChange}
              readOnly={campo.readOnly}
              required={true} // <-- Validación obligatoria activa
              className={`w-full p-2.5 rounded-xl border border-gray-200 outline-none transition-all uppercase
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              ${campo.readOnly
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700"
                }`}
            />
          </div>
        ))}

        {/* Campo Zona (REQUERIDO) */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Zona *
          </label>
          <select
            name="zona"
            value={formData.zona || ""}
            onChange={handleInputChange}
            required={true} // <-- Validación obligatoria activa
            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
          >
            <option value="">Seleccione una zona</option>
            {opcionesZona.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Departamento (REQUERIDO) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Departamento *
          </label>

          <select
            name="departamento"
            value={formData.departamento || ""}
            onChange={handleInputChange}
            required={true} // <-- Validación obligatoria activa
            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
          >
            <option value="">Seleccione</option>

            {departamentos.map(dep => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        {/* Provincia (REQUERIDO) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Provincia *
          </label>

          <select
            name="provincia"
            value={formData.provincia || ""}
            onChange={handleInputChange}
            required={true} // <-- Validación obligatoria activa
            disabled={!formData.departamento}
            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 uppercase"
          >
            <option value="">Seleccione</option>

            {provincias.map(prov => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        {/* Distrito (REQUERIDO) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">
            Distrito *
          </label>

          <select
            name="distrito"
            value={formData.distrito || ""}
            onChange={handleInputChange}
            required={true} // <-- Validación obligatoria activa
            disabled={!formData.provincia}
            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100 uppercase"
          >
            <option value="">Seleccione</option>

            {distritos.map(dist => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading
            ? "Guardando..."
            : isEdit
              ? "Actualizar Cliente"
              : "Guardar Cliente"}
        </button>
      </div>

    </form>
  );
};

export default ClienteForm;