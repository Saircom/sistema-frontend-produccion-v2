/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { equipmentService } from '../../../services/equipment.service';
import { useAlert } from '../../../context/AlertContext';
import Swal from 'sweetalert2';

const VACIO = {
  tipo_equipo: '',
  id_marca: '',
  modelo: '',
  unidadpn: '',
  serie: '',
  unidadsn: '',
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
      unidadpn: equipoAEditar.unidadpn || '',
      serie: equipoAEditar.serie || '',
      unidadsn: equipoAEditar.unidadsn || '',
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

    const errores = [];
    if (!String(formData.tipo_equipo || '').trim()) {
      errores.push('El Tipo de equipo es obligatorio.');
    }
    if (!String(formData.id_marca || '').trim()) {
      errores.push('Debe seleccionar una Marca.');
    }
    if (!String(formData.modelo || '').trim()) {
      errores.push('El Modelo es obligatorio.');
    }
    if (!String(formData.serie || '').trim()) {
      errores.push('El Número de Serie es obligatorio.');
    }
    if (!String(formData.encargado_equipo || '').trim()) {
      errores.push('El Encargado del equipo es obligatorio.');
    }

    if (errores.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Complete los campos obligatorios',
        html: `<p class="mb-2 text-sm text-gray-600">Se encontraron los siguientes problemas:</p><ul style="text-align: left; margin-left: 20px; list-style-type: disc; font-size: 14px; color: #b91c1c;">${errores.map(e => `<li>${e}</li>`).join('')}</ul>`,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const isEditing = Boolean(equipoAEditar?.id_equipo);

    const result = await Swal.fire({
      title: isEditing ? '¿Actualizar equipo?' : '¿Registrar equipo?',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>Tipo:</strong> ${formData.tipo_equipo}</p>
          <p><strong>Modelo:</strong> ${formData.modelo}</p>
          <p><strong>Serie:</strong> ${formData.serie}</p>
          <p><strong>Encargado:</strong> ${formData.encargado_equipo}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: isEditing ? 'Sí, actualizar' : 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setGuardando(true);
    try {
      const payload = {
        ...formData,
        sede: formData.sede.trim() || null,
        direccion: formData.direccion.trim() || null,
        codigo_interno: formData.codigo_interno.trim() || 'NO APLICA',
        id_cliente: idCliente
      };
      if (isEditing) {
        await equipmentService.updateEquipment(equipoAEditar.id_equipo, payload);
      } else {
        await equipmentService.saveEquipment(payload);
        setFormData(VACIO);
      }
      await Swal.fire({
        icon: 'success',
        title: isEditing ? '¡Equipo actualizado!' : '¡Equipo registrado!',
        text: isEditing ? 'El equipo ha sido actualizado con éxito.' : 'El equipo ha sido registrado con éxito.',
        timer: 2000,
        showConfirmButton: false
      });
      onSuccess?.();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar el equipo',
        text: error?.error || error?.message || 'No se pudo procesar la solicitud',
        confirmButtonColor: '#2563eb'
      });
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
        <label className="text-sm font-semibold text-slate-700">Unidad P/N
          <input name="unidadpn" maxLength={100} value={formData.unidadpn} onChange={handleChange} placeholder="Opcional" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-sm font-semibold text-slate-700">Unidad S/N
          <input name="unidadsn" maxLength={100} value={formData.unidadsn} onChange={handleChange} placeholder="Opcional" className={`${inputClass} mt-1.5`} />
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
