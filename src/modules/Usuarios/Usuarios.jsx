import { useState, useEffect, useCallback } from "react";
import { UserPlus, Pencil, Trash2, Search } from "lucide-react";
import Loading from "../../components/Loading.jsx";
import { UsuarioService } from "../../services/user.service.js";
import { RolService } from "../../services/role.service.js";
import { notify } from "../../utils/notifications.jsx";
import Swal from "sweetalert2";
import Modal from "../../components/ui/Modal.jsx";
import UsuarioForm from "../../components/forms/UsuarioForm.jsx";
import Pagination from "../../components/Pagination.jsx";
import { useAuth } from "../../context/authContext.jsx";
import { isSuperAdmin } from "../../utils/permissions.js";

const INITIAL_USER_STATE = {
  id_usuario: "",
  nombres: "",
  apellidos: "",
  dni: "",
  celular: "",
  correo: "",
  password: "",
  id_rol: "",
};

function Usuarios() {
  const { user } = useAuth();
  const puedeRestablecerPasswords = isSuperAdmin(user);
  const [listausuarios, setListausuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const rolesPermitidos = puedeRestablecerPasswords
    ? roles
    : roles.filter(rol => !isSuperAdmin(rol.nombre_rol));
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Estados para paginación dinámica
  const [pagina, setPagina] = useState(0);
  const [filasPagina, setFilasPagina] = useState(15);

  const [usuarioForm, setUsuarioForm] = useState(INITIAL_USER_STATE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const leerServicio = useCallback(async () => {
    setCargando(true);
    try {
      const [usuarios, rolesList] = await Promise.all([
        UsuarioService.getAll(),
        RolService.getAll()
      ]);
      setListausuarios(Array.isArray(usuarios) ? usuarios : (usuarios.data || []));
      setRoles(Array.isArray(rolesList) ? rolesList : (rolesList.data || []));
    } catch {
      notify.error("Error", "No se pudo cargar la información inicial");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    leerServicio();
  }, [leerServicio]);

  const manejarSubmit = async (e) => {
    e.preventDefault();

    const errores = [];
    const nombres = (usuarioForm.nombres || "").trim();
    if (!nombres) errores.push("Los Nombres son obligatorios.");

    const apellidos = (usuarioForm.apellidos || "").trim();
    if (!apellidos) errores.push("Los Apellidos son obligatorios.");

    const dni = (usuarioForm.dni || "").trim();
    if (!/^\d{8}$/.test(dni)) {
      errores.push("El DNI debe tener exactamente 8 dígitos numéricos.");
    }

    const correo = (usuarioForm.correo || "").trim();
    if (!correo) {
      errores.push("El Correo Electrónico es obligatorio.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errores.push("El formato del correo electrónico es inválido.");
    }

    if (!usuarioForm.id_rol || isNaN(parseInt(usuarioForm.id_rol))) {
      errores.push("Debe seleccionar un Rol para el usuario.");
    }

    if (!modoEdicion) {
      if (!usuarioForm.password || usuarioForm.password.length < 6) {
        errores.push("La Contraseña es obligatoria y debe tener al menos 6 caracteres.");
      }
    } else if (usuarioForm.password && usuarioForm.password.length < 6) {
      errores.push("Si desea cambiar la contraseña, debe tener al menos 6 caracteres.");
    }

    if (errores.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Verifique los campos del formulario',
        html: `<p class="mb-2 text-sm text-gray-600">Se detectaron los siguientes errores:</p><ul style="text-align: left; margin-left: 20px; list-style-type: disc; font-size: 14px; color: #b91c1c;">${errores.map(err => `<li>${err}</li>`).join('')}</ul>`,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const rolObj = roles.find(r => String(r.id_rol) === String(usuarioForm.id_rol));
    const confirmacion = await Swal.fire({
      title: modoEdicion ? '¿Actualizar usuario?' : '¿Registrar nuevo usuario?',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>Usuario:</strong> ${nombres} ${apellidos}</p>
          <p><strong>DNI:</strong> ${dni}</p>
          <p><strong>Correo:</strong> ${correo}</p>
          <p><strong>Rol:</strong> ${rolObj ? rolObj.nombre_rol : 'Asignado'}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: modoEdicion ? 'Sí, actualizar' : 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    setSubmitting(true);
    let payload = {
      nombres: nombres.toUpperCase(),
      apellidos: apellidos.toUpperCase(),
      dni,
      celular: usuarioForm.celular ? usuarioForm.celular.trim().toUpperCase() : null,
      correo: correo.toUpperCase(),
      password: usuarioForm.password,
      id_rol: parseInt(usuarioForm.id_rol)
    };

    if (modoEdicion) {
      payload.id_usuario = usuarioForm.id_usuario;
      if (!puedeRestablecerPasswords || !payload.password) delete payload.password;
    }

    try {
      if (modoEdicion) {
        await UsuarioService.update(payload.id_usuario, payload);
        notify.success("Éxito", "Usuario actualizado");
      } else {
        await UsuarioService.create(payload);
        notify.success("Éxito", "Usuario registrado");
      }
      setIsModalOpen(false);
      leerServicio();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar usuario',
        text: err?.response?.data?.message || err?.message || 'No se pudo guardar el usuario',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const eliminarUsuario = async (id) => {
    const confirmado = await notify.confirm("¿Eliminar usuario?", "Esta acción no se puede deshacer");
    if (confirmado) {
      try {
        await UsuarioService.delete(id);
        notify.success("Eliminado", "El usuario ha sido borrado.");
        leerServicio();
      } catch {
        notify.error("Error", "No se pudo eliminar el registro");
      }
    }
  };

  // Manejador del cambio de inputs que transforma el texto a MAYÚSCULAS en tiempo real
  const manejarFormChange = (e) => {
    const { name, value } = e.target;
    // La contraseña debe mantener la distinción entre mayúsculas y minúsculas por seguridad
    const nuevoValor = name === "password" ? value : value.toUpperCase();

    setUsuarioForm({
      ...usuarioForm,
      [name]: nuevoValor
    });
  };

  // Lógica de filtrado y paginación
  const usuariosFiltrados = listausuarios.filter(u =>
    (u.nombres?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
    (u.apellidos?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
    (u.correo?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
    (u.dni || "").includes(busqueda)
  );

  const totalPaginas = Math.ceil(usuariosFiltrados.length / filasPagina);
  const dataPaginada = usuariosFiltrados.slice(pagina * filasPagina, (pagina + 1) * filasPagina);

  return (
    <div className="min-h-screen bg-slate-50 p-2">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-2">
          <h1 className="text-xl font-bold text-slate-800">Panel de Usuarios</h1>
          <button
            onClick={() => { setUsuarioForm(INITIAL_USER_STATE); setModoEdicion(false); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg"
          >
            <UserPlus size={20} /> Nuevo Usuario
          </button>
        </div>

        <div className="mb-2 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o correo..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(0); }}
          />
        </div>

        <div className="bg-white shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
          {cargando ? (
            <div className="flex flex-col items-center justify-center h-[400px]"> <Loading /> </div>
          ) : (
            <>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b font-bold uppercase">
                  <tr>
                    <th className="px-2 py-2  text-slate-400 ">Colaborador</th>
                    <th className="px-2 py-2  text-slate-400  text-center">Correo</th>
                    <th className="px-2 py-2  text-slate-400  text-center">Rol</th>
                    <th className="px-2 py-2  text-slate-400  text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dataPaginada.map((u) => (
                    <tr key={u.id_usuario} className="hover:bg-slate-50">
                      <td className="px-2 py-2">
                        <div className="font-bold text-slate-700 uppercase">{u.nombres} {u.apellidos}</div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="text-xs text-slate-400 uppercase">{u.correo}</div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">{u.nombre_rol}</span>
                      </td>
                      <td className="px-2 py-2 text-right">
                        {(puedeRestablecerPasswords || !isSuperAdmin(u.nombre_rol)) && <>
                          <button onClick={() => { setUsuarioForm({ ...u, password: "" }); setModoEdicion(true); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600" aria-label={`Editar a ${u.nombres}`}><Pencil size={18} /></button>
                          <button onClick={() => eliminarUsuario(u.id_usuario)} className="p-2 text-slate-400 hover:text-red-600" aria-label={`Eliminar a ${u.nombres}`}><Trash2 size={18} /></button>
                        </>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer con Selector de Filas y Paginación */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-full">
                <Pagination
                  totalPaginas={totalPaginas}
                  paginaActual={pagina}
                  onPageChange={setPagina}
                  filasPagina={filasPagina}
                  setFilasPagina={setFilasPagina}
                />
              </div>
            </>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modoEdicion ? "Actualizar Colaborador" : "Registrar Nuevo Usuario"}
          footer={
            <div className="flex gap-3 w-full">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl">Cerrar</button>
              <button form="form-usuario" type="submit" disabled={submitting} className="flex-[2] px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? "Procesando..." : (modoEdicion ? "Guardar Cambios" : "Confirmar Registro")}
              </button>
            </div>
          }
        >
          <form id="form-usuario" onSubmit={manejarSubmit}>
            <UsuarioForm
              formData={usuarioForm}
              onChange={manejarFormChange}
              esEdicion={modoEdicion}
              puedeEditarPassword={puedeRestablecerPasswords}
              roles={rolesPermitidos}
            />
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default Usuarios;
