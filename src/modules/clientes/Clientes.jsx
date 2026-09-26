import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Pencil, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import ConfirmModal from "../../components/alerts/ConfirmModal.jsx";
import ClienteForm from "../../components/forms/ClienteForm";
import { clientService } from "../../services/client.service";
import { useAlert } from "../../context/AlertContext.jsx";

const INITIAL_CLIENTE_STATE = {
  ruc: "",
  razon_social: "",
  correo: "",
  direccion: "",
  celular: "",
  contacto: "",
  zona: "",
  departamento: "",
  provincia: "",
  distrito: ""
};

export default function Clientes() {
  const navigate = useNavigate();
  const [listaclientes, setListaClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [filasPagina, setFilasPagina] = useState(15);
  const [showModal, setShowModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(INITIAL_CLIENTE_STATE);
  const [guardando, setGuardando] = useState(false);
  const showAlert = useAlert();

  const [showConfirm, setShowConfirm] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Limpiar cualquier residuo de formulario temporal al montar para evitar apertura no deseada al actualizar
  useEffect(() => {
    localStorage.removeItem('cliente_form_temp');
  }, []);

  const cerrarModal = () => {
    setShowModal(false);
    setClienteSeleccionado(INITIAL_CLIENTE_STATE);
    localStorage.removeItem('cliente_form_temp');
  };

  const leerServicio = useCallback(async () => {
    setCargando(true);
    try {
      const response = await clientService.getAll();
      if (response.success) setListaClientes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showAlert("error", "No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }, [showAlert]);

  useEffect(() => { leerServicio(); }, [leerServicio]);

  const clientesFiltrados = listaclientes.filter(c =>
    (c.ruc?.toLowerCase() ?? '').includes(busqueda.toLowerCase()) ||
    (c.razon_social?.toLowerCase() ?? '').includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / filasPagina);
  const dataPaginada = clientesFiltrados.slice(pagina * filasPagina, (pagina + 1) * filasPagina);

  const handleRucChange = (e) => {
    const ruc = e.target.value;
    setClienteSeleccionado(prev => ({ ...prev, ruc }));

    if (ruc.length === 11) {
      const encontrado = listaclientes.find(c => c.ruc === ruc);
      if (encontrado) {
        setClienteSeleccionado(encontrado);
        showAlert("info", "Datos del cliente cargados automáticamente");
      }
    }
  };

  const handleFormChange = (e) => {
    if (!e) return;
    if (e.departamento !== undefined || e.provincia !== undefined || e.distrito !== undefined) {
      setClienteSeleccionado(prev => ({
        ...prev,
        ...(e.departamento !== undefined ? { departamento: e.departamento } : {}),
        ...(e.provincia !== undefined ? { provincia: e.provincia } : {}),
        ...(e.distrito !== undefined ? { distrito: e.distrito } : {})
      }));
    } else if (e.target) {
      const { name, value } = e.target;
      setClienteSeleccionado(prev => ({ ...prev, [name]: value }));
    } else if (typeof e === 'object') {
      setClienteSeleccionado(prev => ({ ...prev, ...e }));
    }
  };

  const guardarCliente = async (e) => {
    if (e) e.preventDefault();

    const errores = [];
    const ruc = String(clienteSeleccionado.ruc || '').trim();
    if (!/^\d{11}$/.test(ruc)) {
      errores.push("El RUC debe tener exactamente 11 dígitos numéricos.");
    }
    if (!clienteSeleccionado.razon_social?.trim()) {
      errores.push("La Razón Social es obligatoria.");
    }
    const correo = String(clienteSeleccionado.correo || '').trim();
    if (!correo) {
      errores.push("El Correo Electrónico es obligatorio.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errores.push("El formato del correo electrónico es inválido.");
    }
    if (!clienteSeleccionado.direccion?.trim()) {
      errores.push("La Dirección es obligatoria.");
    }
    if (!clienteSeleccionado.celular?.trim()) {
      errores.push("El número de Celular es obligatorio.");
    }
    if (!clienteSeleccionado.contacto?.trim()) {
      errores.push("La Persona de Contacto es obligatoria.");
    }
    if (!clienteSeleccionado.zona?.trim()) {
      errores.push("Debe seleccionar una Zona.");
    }
    if (!clienteSeleccionado.departamento?.trim()) {
      errores.push("Debe seleccionar un Departamento.");
    }
    if (!clienteSeleccionado.provincia?.trim()) {
      errores.push("Debe seleccionar una Provincia.");
    }
    if (!clienteSeleccionado.distrito?.trim()) {
      errores.push("Debe seleccionar un Distrito.");
    }

    if (errores.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Complete los campos obligatorios',
        html: `<ul style="text-align: left; font-size: 13px; line-height: 1.6; margin: 8px 0 0 16px; list-style-type: disc;">${errores.map(err => `<li>${err}</li>`).join('')}</ul>`,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const esEdicion = !!clienteSeleccionado.id_cliente;

    const confirmacion = await Swal.fire({
      title: esEdicion ? '¿Actualizar cliente?' : '¿Registrar nuevo cliente?',
      text: esEdicion
        ? `¿Está seguro de guardar los cambios para "${clienteSeleccionado.razon_social}"?`
        : `¿Está seguro de registrar a "${clienteSeleccionado.razon_social}" con RUC ${clienteSeleccionado.ruc}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: esEdicion ? 'Sí, actualizar' : 'Sí, registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true
    });

    if (!confirmacion.isConfirmed) return;

    setGuardando(true);

    try {
      let response;
      if (esEdicion) {
        response = await clientService.update(clienteSeleccionado.id_cliente, clienteSeleccionado);
      } else {
        response = await clientService.create(clienteSeleccionado);
      }

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: esEdicion ? "Cliente actualizado" : "Cliente registrado",
          text: esEdicion ? "Los datos se actualizaron correctamente." : "El cliente fue registrado exitosamente.",
          confirmButtonColor: '#2563eb',
          timer: 2000
        });
        setShowModal(false);
        setClienteSeleccionado(INITIAL_CLIENTE_STATE);
        localStorage.removeItem('cliente_form_temp'); // Limpiar al guardar exitosamente
        leerServicio();
      } else {
        showAlert("error", response.message || response.error || "No se pudo guardar el cliente");
      }
    } catch (error) {
      const mensajeError = error?.message || error?.error || error?.response?.data?.message || error?.response?.data?.error || "Hubo un problema al guardar el cliente";
      showAlert("error", mensajeError);
    } finally {
      setGuardando(false);
    }
  };

  const handlePreEliminar = (id) => {
    setIdEliminar(id);
    setShowConfirm(true);
  };

  const ejecutarEliminacion = async () => {
    if (!idEliminar) return;
    setEliminando(true);
    try {
      await clientService.delete(idEliminar);
      showAlert("success", "Cliente eliminado correctamente");
      setShowConfirm(false);
      setIdEliminar(null);
      leerServicio();
    } catch (error) {
      showAlert("error", "No se pudo eliminar el cliente");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-2">
          <h1 className="text-2xl font-bold text-slate-800">Panel de Clientes</h1>
          <button
            onClick={() => { 
              setClienteSeleccionado(INITIAL_CLIENTE_STATE); 
              setShowModal(true); 
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg"
          >
            <UserPlus size={20} /> Nuevo Cliente
          </button>
        </div>

        <div className="relative group mb-4">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o RUC..."
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
          />
        </div>
      </div>

      {cargando ? <Loading /> : (
        <div className="space-y-4">
          <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Razon Social / Ruc</th>
                  <th className="px-6 py-4 text-center">Encargado / Correo / Numero</th>
                  <th className="px-6 py-4 text-center">Zona</th>
                  <th className="px-6 py-4 text-center">Equipos</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataPaginada.map((item) => (
                  <tr key={item.id_cliente} className="hover:bg-blue-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.razon_social}</div>
                      <div className="text-xs text-gray-400 font-mono tracking-wider">{item.ruc}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium truncate">{item.contacto || "N/A"}</span>
                        <span className="text-gray-400">{item.correo || "Sin correo"}</span>
                        <span className="text-indigo-600 font-semibold">{item.celular || "Sin celular"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium truncate">{item.zona || "Sin zona"}</span>
                        <span className="text-indigo-600 font-semibold">{item.departamento || "Sin departamento"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/equipos/cliente/${item.id_cliente}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        Ver Equipos
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => { setClienteSeleccionado(item); setShowModal(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handlePreEliminar(item.id_cliente)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            onPageChange={(nuevaPagina) => setPagina(nuevaPagina)}
          />
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={cerrarModal} 
        title={clienteSeleccionado.id_cliente ? "Editar Cliente" : "Nuevo Cliente"}
      >
        <ClienteForm
          formData={clienteSeleccionado}
          onChange={handleFormChange}
          onRucChange={handleRucChange}
          isEdit={!!clienteSeleccionado.id_cliente}
          onSubmit={guardarCliente}
          loading={guardando}
        />
      </Modal>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setIdEliminar(null); }}
        onConfirm={ejecutarEliminacion}
        loading={eliminando}
      />
    </div>
  );
}