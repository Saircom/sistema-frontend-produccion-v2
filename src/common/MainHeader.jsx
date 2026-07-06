import React, { useState, useEffect, useRef } from "react";
import { Menu, LogOut, UserCircle, MoreVertical, Download } from "lucide-react"; // 1. Añadido Download
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import logo from "../assets/logo.png";
import Notificaciones from "../services/Notificaciones"; 

const MainHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null); // 2. Estado para el instalador
  const menuRef = useRef(null);

  // 3. Lógica para capturar el evento de instalación
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const handleNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white shadow z-50 px-4 lg:px-8">
      {/* --- DISEÑO MÓVIL --- */}
      <div className="flex lg:hidden items-center justify-between h-full relative">
        <button onClick={toggleSidebar} aria-label="Abrir menú lateral">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <img src={logo} className="w-[120px] h-auto" alt="logo" />
        </div>

        <div className="flex items-center gap-2">
          <Notificaciones />
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-6 h-6 text-gray-600" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[60]">
                {deferredPrompt && (
                  <button onClick={handleInstallClick} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                    <Download size={18} /> Instalar App
                  </button>
                )}
                <button onClick={() => handleNavigate("/perfil")} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors">
                  <UserCircle size={18} /> Perfil
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors">
                  <LogOut size={18} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- DISEÑO DESKTOP --- */}
      <div className="hidden lg:flex items-center justify-between h-full">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="hover:bg-gray-100 p-2 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <img src={logo} className="w-[180px] h-auto" alt="logo" />
        </div>

        <div className="flex items-center gap-3">
          {/* 4. Botón de Instalación en Desktop */}
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download size={16} /> Instalar
            </button>
          )}

          <Notificaciones />
          <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

          <button onClick={() => navigate("/perfil")} className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <UserCircle className="w-6 h-6" />
          </button>
          <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;