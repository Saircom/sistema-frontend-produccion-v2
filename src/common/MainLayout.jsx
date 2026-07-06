import { useEffect, useRef, useState, useCallback } from "react";
import MainHeader from "./MainHeader";
import MainNav from "./MainNav";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Cerrar sidebar al hacer click afuera (Solo en móvil)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 1024
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Header Fijo (Mantiene h-16) */}
      <MainHeader toggleSidebar={toggleSidebar} />

      {/* Contenedor intermedio con padding superior para compensar el header */}
      <div className="flex flex-1 pt-16 relative">

        {/* 2. Sidebar (Ancho w-52 fijo en desktop) */}
        {/* Limpiado: se removió toggleSidebar ya que MainNav no lo declara en sus props */}
        <MainNav
          isOpen={sidebarOpen}
          sidebarRef={sidebarRef}
        />

        {/* 3. Overlay para móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 4. Contenido Principal */}
        {/* Distribución exacta: ocupará todo el ancho restante sin invadir el menú */}
        <main className="flex-1 w-full lg:pl-50 py-0 transition-all duration-300 min-w-0 relative">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;