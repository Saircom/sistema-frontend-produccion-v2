import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Pencil, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

  // --- LÓGICA DE PERSISTENCIA (AUTO-GUARDADO) ---
  
  // 1. Recuperar al montar el componente
  useEffect(() => {
    const datosGuardados = localStorage.getItem('cliente_form_temp');
    if (datosGuardados) {
      setClienteSeleccionado(JSON.parse(datosGuardados));
      setShowModal(true);
    }
  }, []);

  // 2. Guardar automáticamente al escribir (mientras el modal esté abierto)
  useEffect(() => {
    if (showModal) {
      localStorage.setItem('cliente_form_temp', JSON.stringify(clienteSeleccionado));
    }
  }, [clienteSeleccionado, showModal]);

  // --- FIN LÓGICA DE PERSISTENCIA ---

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

  const guardarCliente = async (e) => {
    if (e) e.preventDefault();
    setGuardando(true);

    const esEdicion = !!clienteSeleccionado.id_cliente;

    try {
      let response;
      if (esEdicion) {
        response = await clientService.update(clienteSeleccionado.id_cliente, clienteSeleccionado);
      } else {
        response = await clientService.create(clienteSeleccionado);
      }

      if (response.success) {
        showAlert("success", esEdicion ? "Cliente actualizado exitosamente" : "Cliente registrado exitosamente");
        setShowModal(false);
        setClienteSeleccionado(INITIAL_CLIENTE_STATE);
        localStorage.removeItem('cliente_form_temp'); // Limpiar al guardar exitosamente
        leerServicio();
      } else {
        showAlert("error", response.message || "No se pudo guardar el cliente");
      }
    } catch (error) {
      showAlert("error", "Hubo un problema en el servidor");
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
        onClose={() => setShowModal(false)} 
        title={clienteSeleccionado.id_cliente ? "Editar Cliente" : "Nuevo Cliente"}
      >
        <ClienteForm
          formData={clienteSeleccionado}
          onChange={(e) => setClienteSeleccionado({ ...clienteSeleccionado, [e.target.name]: e.target.value })}
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