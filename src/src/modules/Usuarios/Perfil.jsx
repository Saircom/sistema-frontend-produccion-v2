import { useEffect, useState } from 'react';
import { KeyRound, Save, ShieldCheck, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/authContext.jsx';
import { UsuarioService } from '../../services/user.service.js';
import { notify } from '../../utils/notifications.jsx';

export const Perfil = () => {
  const { user, refreshUser } = useAuth();
  const [perfil, setPerfil] = useState({ nombres: '', apellidos: '', correo: '', dni: '', nombre_rol: '' });
  const [passwords, setPasswords] = useState({ password_actual: '', password_nueva: '', confirmar: '' });
  const [guardando, setGuardando] = useState(false);
  const [cambiando, setCambiando] = useState(false);

  useEffect(() => {
    UsuarioService.getProfile()
      .then(setPerfil)
      .catch(error => notify.error('Error', error.response?.data?.message || 'No se pudo cargar el perfil'));
  }, []);

  const guardarPerfil = async event => {
    event.preventDefault();
    setGuardando(true);
    try {
      const response = await UsuarioService.updateProfile({ nombres: perfil.nombres, apellidos: perfil.apellidos });
      setPerfil(response.usuario);
      await refreshUser();
      notify.success('Perfil actualizado', 'Tus nombres se guardaron correctamente');
    } catch (error) {
      notify.error('No se pudo actualizar', error.response?.data?.message || 'Verifica los datos ingresados');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPassword = async event => {
    event.preventDefault();
    if (passwords.password_nueva !== passwords.confirmar) {
      notify.error('Contraseñas diferentes', 'La confirmación no coincide con la contraseña nueva');
      return;
    }
    setCambiando(true);
    try {
      await UsuarioService.changeOwnPassword({
        password_actual: passwords.password_actual,
        password_nueva: passwords.password_nueva
      });
      setPasswords({ password_actual: '', password_nueva: '', confirmar: '' });
      notify.success('Contraseña actualizada', 'Tu nueva contraseña ya está activa');
    } catch (error) {
      notify.error('No se pudo cambiar', error.response?.data?.message || 'Verifica tu contraseña actual');
    } finally {
      setCambiando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
          <p className="mt-1 text-sm text-slate-500">Actualiza tus datos personales y protege tu cuenta.</p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <UserCircle size={64} />
            </div>
            <h2 className="mt-4 font-bold text-slate-800">{perfil.nombres || user?.name} {perfil.apellidos}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-600">{perfil.nombre_rol || user?.rol}</p>
            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-left text-sm text-slate-600">
              <p><span className="font-semibold">DNI:</span> {perfil.dni || '—'}</p>
              <p className="break-all"><span className="font-semibold">Correo:</span> {perfil.correo || '—'}</p>
            </div>
          </aside>

          <div className="space-y-5">
            <form onSubmit={guardarPerfil} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 flex items-center gap-2 font-bold text-slate-800"><Save size={19} /> Información personal</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Nombres
                  <input required maxLength={80} value={perfil.nombres} onChange={e => setPerfil({ ...perfil, nombres: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Apellidos
                  <input required maxLength={80} value={perfil.apellidos} onChange={e => setPerfil({ ...perfil, apellidos: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
              </div>
              <button disabled={guardando} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
                {guardando ? 'Guardando...' : 'Guardar nombres'}
              </button>
            </form>

            <form onSubmit={cambiarPassword} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 font-bold text-slate-800"><ShieldCheck size={19} /> Cambiar contraseña</h2>
              <p className="mt-1 text-sm text-slate-500">Debes confirmar tu contraseña actual. La nueva requiere mínimo 10 caracteres, letras y números.</p>
              <div className="mt-5 grid gap-4">
                <label className="text-sm font-semibold text-slate-700">Contraseña actual
                  <input type="password" required autoComplete="current-password" value={passwords.password_actual} onChange={e => setPasswords({ ...passwords, password_actual: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">Contraseña nueva
                    <input type="password" required minLength={10} maxLength={128} autoComplete="new-password" value={passwords.password_nueva} onChange={e => setPasswords({ ...passwords, password_nueva: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">Confirmar contraseña
                    <input type="password" required minLength={10} maxLength={128} autoComplete="new-password" value={passwords.confirmar} onChange={e => setPasswords({ ...passwords, confirmar: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </label>
                </div>
              </div>
              <button disabled={cambiando} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
                <KeyRound size={17} /> {cambiando ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Perfil;
