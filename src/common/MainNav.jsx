import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/authContext";
import { jwtDecode } from 'jwt-decode';
import {
  LayoutDashboard, UserCog, ClipboardList,
  Users, Monitor, Laptop
} from "lucide-react";

const MainNav = ({ isOpen, sidebarRef }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Definimos roles en mayúsculas para coincidir con la DB y AuthContext
  const menuData = [
    {
      title: "Panel Principal",
      key: "panel",
      roles: ["ADMINISTRADOR", "TECNICO", "POSTVENTA", "PLANNER"],
      items: [
        { label: "Inicio", to: "/inicio", icon: LayoutDashboard, roles: ["ADMINISTRADOR", "TECNICO", "POSTVENTA", "PLANNER"] },
        { label: "Panel de Control", to: "/dashboard-administrador", icon: LayoutDashboard, roles: ["ADMINISTRADOR"] },
        // { label: "Panel de Control", to: "/dashboard-postventa", icon: LayoutDashboard, roles: ["POSTVENTA"] },
        // { label: "Panel de Control", to: "/dashboard-tecnico", icon: LayoutDashboard, roles: ["TECNICO"] },
        { label: "Usuarios y Roles", to: "/usuarios", icon: UserCog, roles: ["ADMINISTRADOR"] },

      ],
    },
    {
      title: "Clientes",
      key: "ventas",
      roles: ["ADMINISTRADOR", "POSTVENTA"],
      items: [
        { label: "Clientes", to: "/clientes", icon: Users, roles: ["ADMINISTRADOR", "POSTVENTA"] },
        { label: "Equipos", to: "/cliente/equipos", icon: Users, roles: ["ADMINISTRADOR", "POSTVENTA"] },
      ],
    },
    {
      title: "Planner",
      key: "planner ",
      roles: ["ADMINISTRADOR", "PLANNER"],
      items: [
        { label: "Movilidades", to: "/planner/movilidades", icon: Users, roles: ["ADMINISTRADOR", "POSTVENTA", "PLANNER"] },
        { label: "Solicitudes", to: "/planner/solicitud", icon: Users, roles: ["ADMINISTRADOR", "POSTVENTA", "PLANNER"] }
      ],
    },
    {
      title: "Postventa",
      key: "postventa ",
      roles: ["ADMINISTRADOR", "POSTVENTA"],
      items: [
        { label: "Lista de Cotizacion", to: "/postventa/lista", icon: Users, roles: ["ADMINISTRADOR", "POSTVENTA"] },
      ],
    },
    {
      title: "Servicios Técnicos",
      key: "servicios",
      roles: ["ADMINISTRADOR", "TECNICO", "POSTVENTA", "PLANNER"],
      items: [
        { label: "Calendario", to: "/servicio/calendario", icon: ClipboardList, roles: ["ADMINISTRADOR", "POSTVENTA", "PLANNER"] },
        { label: "Mis Servicio", to: "/servicio/lista", icon: ClipboardList, roles: ["ADMINISTRADOR", "TECNICO", "POSTVENTA", "PLANNER"] },
        { label: "Lista de Informes", to: "/tecnicos/reportes", icon: ClipboardList, roles: ["ADMINISTRADOR", "POSTVENTA", "PLANNER"] },
        { label: "Historial Informes", to: "/servicio/historial-cliente", icon: ClipboardList, roles: ["ADMINISTRADOR", "POSTVENTA", "PLANNER"] },
        { label: "Gastos", to: "/servicio/gastos", icon: Laptop, roles: ["ADMINISTRADOR", "TECNICO", "PLANNER"] },
        { label: "Tiempos", to: "/servicio/tiempos", icon: Laptop, roles: ["ADMINISTRADOR", "PLANNER", "PLANNER"] }
      ],
    },
    {
      title: "Reportes",
      key: "reportes",
      roles: ["ADMINISTRADOR"],
      items: [
        { label: "Reporte Servicios", to: "/servicio/reportes", icon: ClipboardList, roles: ["ADMINISTRADOR"] },
      ],
    },
    {
      title: "Manuales",
      key: "manuales",
      roles: ["ADMINISTRADOR"],
      items: [
        { label: "Manuales", to: "/manuales", icon: ClipboardList, roles: ["ADMINISTRADOR"] }
      ],
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const checkToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) { logout(); navigate("/login"); }
    } catch (e) { logout(); navigate("/login"); }
  }, [logout, navigate]);

  useEffect(() => {
    checkToken();
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [checkToken]);

  // CORRECCIÓN: Quitamos el .toLowerCase() para que coincida con los valores del objeto UserRole
  const userRole = user?.rol;

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-50 bg-white border-r border-gray-200 z-40 transition-transform duration-300
      ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"} 
      lg:translate-x-0`}
    >
      <div className="h-full flex flex-col border-r border-gray-100">
        <nav className="flex-1 overflow-y-auto p-1 space-y-2 custom-scrollbar">
          {menuData.map((section) => {
            // Verificamos si el rol del usuario está en la lista permitida de la sección
            if (!userRole || !section.roles.includes(userRole)) return null;

            return (
              <div key={section.key} className="space-y-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1">
                  {section.title}
                </div>

                <ul className="space-y-1">
                  {section.items.map((item, index) => {
                    // Verificamos si el rol del usuario está en la lista permitida del item
                    if (!item.roles.includes(userRole)) return null;
                    const Icon = item.icon;
                    return (
                      <li key={index}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isActive
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                              <span>{item.label}</span>
                            </>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default MainNav;