import React, { useState, useEffect } from 'react';
import { equipmentService } from '../../../services/equipment.service';
import { useAlert } from "../../../context/AlertContext";

const EquipoForm = ({ idCliente, marcas = [], onSuccess, equipoAEditar = null }) => {

  const showAlert = useAlert();

  const [formData, setFormData] = useState({
    tipo_equipo: "",
    id_marca: "",
    serie: "",
    modelo: "",
    sede: "",
    encargado_equipo: ""
  });

  useEffect(() => {
    if (equipoAEditar) {
      setFormData({
        tipo_equipo: equipoAEditar.tipo_equipo || "",
        id_marca: equipoAEditar.id_marca ? String(equipoAEditar.id_marca) : "",
        serie: equipoAEditar.serie || "",
        modelo: equipoAEditar.modelo || "",
        sede: equipoAEditar.sede || "",
        encargado_equipo: equipoAEditar.encargado_equipo || ""
      });
    } else {
      setFormData({
        tipo_equipo: "",
        id_marca: "",
        serie: "",
        modelo: "",
        sede: "",
        encargado_equipo: ""
      });
    }
  }, [equipoAEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldsToUpper = ["modelo", "serie", "sede", "encargado_equipo"];

    setFormData(prev => ({
      ...prev,
      [name]: fieldsToUpper.includes(name) ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_marca || !formData.tipo_equipo) {
      showAlert("Atención", "Por favor, completa todos los campos obligatorios.", "warning");
      return;
    }

    try {
      const isEditing = equipoAEditar && equipoAEditar.id_equipo;

      if (isEditing) {
        await equipmentService.updateEquipment(equipoAEditar.id_equipo, {
          ...formData,
          id_cliente: idCliente
        });
        showAlert("Éxito", "Equipo actualizado correctamente", "success");
      } else {
        await equipmentService.saveEquipment({
          ...formData,
          id_cliente: idCliente
        });
        showAlert("Éxito", "Equipo registrado correctamente", "success");
      }

      if (!isEditing) {
        setFormData({ tipo_equipo: "", id_marca: "", serie: "", modelo: "", sede: "", encargado_equipo: "" });
      }

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      showAlert("Error", error.message || "No se pudo procesar la solicitud del equipo", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <select
          name="tipo_equipo"
          required
          value={formData.tipo_equipo}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white"
        >
          <option value="">Seleccione el tipo de equipo</option>
          <option value="Equipo estacionario">EQUIPO ESTACIONARIO</option>
          <option value="Equipo portatil">EQUIPO PORTATIL</option>
        </select>

        <select
          name="id_marca"
          required
          value={formData.id_marca}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white"
        >
          <option value="">Seleccione una marca</option>
          {marcas.map((m) => (
            <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          name="modelo"
          required
          placeholder="Modelo"
          value={formData.modelo}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl outline-none uppercase"
        />
        <input
          name="serie"
          required
          placeholder="N° de Serie"
          value={formData.serie}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl outline-none uppercase"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          name="sede"
          required
          placeholder="Sede / Ubicación"
          value={formData.sede}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl outline-none uppercase"
        />
        <input
          name="encargado_equipo"
          required
          placeholder="Encargado"
          value={formData.encargado_equipo}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl outline-none uppercase"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors"
      >
        {equipoAEditar ? "Actualizar Cambios" : "Guardar Equipo"}
      </button>
    </form>
  );
};

export default EquipoForm;