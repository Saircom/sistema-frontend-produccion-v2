/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import MainHeader from "./MainHeader";
import MainNav from "./MainNav";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((current) => !current);
  }, []);

  useEffect(() => {
    if (!sidebarOpen || window.matchMedia("(min-width: 1024px)").matches) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-gray-50">
      <MainHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="min-h-dvh pt-12">
        <MainNav
          isOpen={sidebarOpen}
          sidebarRef={sidebarRef}
          onNavigate={() => setSidebarOpen(false)}
        />

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-12 z-30 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú lateral"
          />
        )}

        <main className="min-w-0 w-full transition-[padding] duration-300 lg:pl-50">
          <div className="min-h-[calc(100dvh-3rem)] w-full min-w-0 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
