import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Loader2, ShieldCheck, Fingerprint } from "lucide-react";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [dni, setDni] = useState(localStorage.getItem("dni") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/inicio", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (dni.length < 8) {
      setError("El DNI debe tener al menos 8 dígitos");
      setLoading(false);
      return;
    }

    try {
      const success = await login(dni, password);
      if (success) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("dni", dni);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("dni");
        }
        navigate("/inicio");
      } else {
        setError("DNI o contraseña incorrectos");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* COLUMNA IZQUIERDA: Branding Mejorado */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0a0f1c] via-[#0a1529] to-[#0b1a3a] p-12 flex-col justify-center text-white relative overflow-hidden">
        {/* Elementos decorativos mejorados */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#1e3a8a_0%,_transparent_70%)] opacity-30" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        {/* Líneas decorativas */}
        <div className="absolute top-20 left-10 w-px h-32 bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0" />
        <div className="absolute bottom-20 right-10 w-px h-32 bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0" />
        
        <div className="relative z-10 max-w-lg animate-in slide-in-from-left-5 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-lg">
            <ShieldCheck size={14} /> 
            <span className="relative">
              Sistema de Gestión SAIRCOM
              <span className="absolute inset-x-0 bottom-0 h-px bg-blue-500/50" />
            </span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Acceso
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Corporativo
            </span>
          </h1>
          
          <p className="text-gray-300 leading-relaxed text-lg mb-12 border-l-2 border-blue-500/50 pl-4">
            Plataforma oficial para la administración de operaciones y servicios. 
            Accede de forma segura para gestionar tus actividades desde un entorno centralizado.
          </p>

          {/* Características */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="w-1 h-1 bg-blue-500 rounded-full" />
              <span>Cifrado de extremo a extremo</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="w-1 h-1 bg-blue-500 rounded-full" />
              <span>Autenticación de doble factor</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="w-1 h-1 bg-blue-500 rounded-full" />
              <span>Auditoría en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: Formulario Mejorado */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md">
          {/* Logo y título con animación */}
          <div className="mb-10 text-center lg:text-left animate-in slide-in-from-right-5 duration-700">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm">
                <img
                  src="https://saircomperu.com.pe/wp-content/uploads/2020/08/logo-saircom-peru.svg"
                  alt="Logo SAIRCOM"
                  className="h-10 w-auto"
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido!</h2>
              <p className="text-gray-500 text-sm">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>
          </div>

          {/* Mensaje de error mejorado */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo DNI */}
            <div className="group">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Documento de Identidad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-blue-600 transition-all duration-200">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  maxLength={8}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="Ingrese su DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 ml-1">8 dígitos sin puntos ni guiones</p>
            </div>

            {/* Campo Contraseña */}
            <div className="group">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-blue-600 transition-all duration-200">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Checkbox y recuperar contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all duration-200"></div>
                  <svg className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Confiar en este equipo
                </span>
              </label>
              
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                onClick={() => {/* Recuperar contraseña */}}
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            {/* Botón de acceso mejorado */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-[#0a1529] to-[#0f1d3a] hover:from-[#0f1d3a] hover:to-[#142545] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden shadow-lg shadow-blue-900/20"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/0 via-white/10 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <Fingerprint size={18} />
                  <span>Acceder al sistema</span>
                </>
              )}
            </button>

            {/* Acceso demo informativo */}
            <div className="pt-4 text-center">
              <p className="text-xs text-gray-400">
                ¿Problemas para acceder? Contacte al área de TI
              </p>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center mt-12 text-[10px] text-gray-400 uppercase tracking-wider">
            © {new Date().getFullYear()} SAIRCOM SAC. Todos los derechos reservados
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
