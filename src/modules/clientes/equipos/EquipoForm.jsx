/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { equipmentService } from '../../../services/equipment.service';
import { useAlert } from '../../../context/AlertContext';

const VACIO = {
  tipo_equipo: '',
  id_marca: '',
  modelo: '',
  serie: '',
  encargado_equipo: '',
  sede: '',
  direccion: '',
  codigo_interno: 'NO APLICA'
};

const normalizarTipoEquipo = tipo => {
  const valor = String(tipo ?? '').trim();
  const comparable = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

  if (comparable === 'EQUIPO ESTACIONARIO') return 'COMPRESOR ESTACIONARIO';
  if (comparable === 'EQUIPO PORTATIL') return 'COMPRESOR PORTATIL';
  return valor;
};

const EquipoForm = ({ idCliente, marcas = [], onSuccess, equipoAEditar = null }) => {
  const showAlert = useAlert();
  const [formData, setFormData] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setFormData(equipoAEditar ? {
      tipo_equipo: normalizarTipoEquipo(equipoAEditar.tipo_equipo),
      id_marca: equipoAEditar.id_marca ? String(equipoAEditar.id_marca) : '',
      modelo: equipoAEditar.modelo || '',
      serie: equipoAEditar.serie || '',
      encargado_equipo: equipoAEditar.encargado_equipo || '',
      sede: equipoAEditar.sede || '',
      direccion: equipoAEditar.direccion || '',
      codigo_interno: equipoAEditar.codigo_interno || 'NO APLICA'
    } : VACIO);
  }, [equipoAEditar]);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(previous => ({
      ...previous,
      [name]: name === 'id_marca' || name === 'tipo_equipo' ? value : value.toUpperCase()
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const obligatorios = ['id_marca', 'tipo_equipo', 'modelo', 'serie', 'encargado_equipo'];
    if (obligatorios.some(campo => !String(formData[campo] || '').trim())) {
      showAlert('Atención', 'Completa marca, modelo, serie, tipo de equipo y encargado.', 'warning');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        ...formData,
        sede: formData.sede.trim() || null,
        direccion: formData.direccion.trim() || null,
        codigo_interno: formData.codigo_interno.trim() || 'NO APLICA',
        id_cliente: idCliente
      };
      const isEditing = Boolean(equipoAEditar?.id_equipo);
      if (isEditing) {
        await equipmentService.updateEquipment(equipoAEditar.id_equipo, payload);
      } else {
        await equipmentService.saveEquipment(payload);
        setFormData(VACIO);
      }
      showAlert('Éxito', isEditing ? 'Equipo actualizado correctamente' : 'Equipo registrado correctamente', 'success');
      onSuccess?.();
    } catch (error) {
      showAlert('Error', error?.error || error?.message || 'No se pudo guardar el equipo', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-500"><span className="font-bold text-red-600">*</span> Campo obligatorio</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Tipo de equipo <span className="text-red-600">*</span>
          <select name="tipo_equipo" required value={formData.tipo_equipo} onChange={handleChange} className={`${inputClass} mt-1.5 bg-white normal-case`}>
            <option value="">Seleccione el tipo</option>
            <option value="COMPRESOR ESTACIONARIO">Compresor estacionario</option>
            <option value="SECADOR REFRIGERATIVO">Secador refrigerativo</option>
            <option value="GRUPO ELECTROGENO">Grupo electrógeno</option>
            <option value="COMPRESOR PORTATIL">Compresor portátil</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">Marca <span className="text-red-600">*</span>
          <select name="id_marca" required value={formData.id_marca} onChange={handleChange} className={`${inputClass} mt-1.5 bg-white normal-case`}>
            <option value="">Seleccione una marca</option>
            {marcas.map(marca => <option key={marca.id_marca} value={marca.id_marca}>{marca.nombre}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">Modelo <span className="text-red-600">*</span>
          <input name="modelo" required maxLength={255} value={formData.modelo} onChange={handleChange} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-sm font-semibold text-slate-700">Serie <span className="text-red-600">*</span>
          <input name="serie" required maxLength={255} value={formData.serie} onChange={handleChange} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-sm font-semibold text-slate-700">Encargado del equipo <span className="text-red-600">*</span>
          <input name="encargado_equipo" required maxLength={255} value={formData.encargado_equipo} onChange={handleChange} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-sm font-semibold text-slate-700">Código interno
          <input name="codigo_interno" maxLength={100} value={formData.codigo_interno} onChange={handleChange} placeholder="NO APLICA" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-sm font-semibold text-slate-700">Sede
          <input name="sede" maxLength={255} value={formData.sede} onChange={handleChange} placeholder="Opcional" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-sm font-semibold text-slate-700">Dirección
          <input name="direccion" maxLength={255} value={formData.direccion} onChange={handleChange} placeholder="Opcional" className={`${inputClass} mt-1.5`} />
        </label>
      </div>
      <button type="submit" disabled={guardando} className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60">
        {guardando ? 'Guardando...' : equipoAEditar ? 'Actualizar equipo' : 'Guardar equipo'}
      </button>
    </form>
  );
};

export default EquipoForm;
