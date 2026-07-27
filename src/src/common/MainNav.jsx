/* eslint-disable react/prop-types */
import { useEffect, useCallback, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/authContext";
import { jwtDecode } from 'jwt-decode';
import { isSuperAdmin } from '../utils/permissions.js';
import { useRealtime } from '../context/RealtimeContext.jsx';
import { socket } from '../services/socket.js';
import { otService } from '../services/ot.service.js';
import informetecnicoService from '../modules/informe-tecnico/service/informetecnico.service.js';
import {
  LayoutDashboard, UserCog, ClipboardList, WalletCards,
  Users, Laptop
} from "lucide-react";

const MainNav = ({ isOpen, sidebarRef, onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { revision } = useRealtime();
  const userRole = user?.rol;
  const unrestricted = isSuperAdmin(user);
  const puedeVerPlanner = unrestricted || ['ADMINISTRADOR', 'PLANNER'].includes(userRole);
  const [cotizacionesPendientes, setCotizacionesPendientes] = useState(0);
  const [ordenesPendientes, setOrdenesPendientes] = useState(0);
  const [informesNoRevisados, setInformesNoRevisados] = useState(0);

  const cargarContadoresPlanner = useCallback(async () => {
    if (!puedeVerPlanner) {
      setCotizacionesPendientes(0);
      setOrdenesPendientes(0);
      setInformesNoRevisados(0);
      return;
    }
    try {
      const [cotizaciones, ordenes, informesResponse] = await Promise.all([
        otService.getCotizacionesDisponibles(),
        otService.getOrdenes(),
        informetecnicoService.getAll()
      ]);
      const informes = Array.isArray(informesResponse?.data)
        ? informesResponse.data
        : Array.isArray(informesResponse) ? informesResponse : [];
      setCotizacionesPendientes(Array.isArray(cotizaciones) ? cotizaciones.length : 0);
      setOrdenesPendientes(Array.isArray(ordenes) ? ordenes.filter(orden => (
        String(orden?.estado || '').trim().toLowerCase() !== 'finalizada'
      )).length : 0);
      setInformesNoRevisados(informes.filter(informe => (
        String(informe?.estado_revision || 'No revisado').trim().toLowerCase() === 'no revisado'
      )).length);
    } catch (error) {
      console.error('No se pudieron actualizar los contadores de Planner:', error);
    }
  }, [puedeVerPlanner]);

  useEffect(() => {
    cargarContadoresPlanner();
    socket.on('planner:pendientes-actualizados', cargarContadoresPlanner);
    socket.on('planner:ordenes-actualizadas', cargarContadoresPlanner);
    socket.on('informes:pendientes-actualizados', cargarContadoresPlanner);
    return () => {
      socket.off('planner:pendientes-actualizados', cargarContadoresPlanner);
      socket.off('planner:ordenes-actualizadas', cargarContadoresPlanner);
      socket.off('informes:pendientes-actualizados', cargarContadoresPlanner);
    };
  }, [cargarContadoresPlanner, revision]);

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
        { label: "Reporte de viáticos", to: "/administrador/viaticos", icon: WalletCards, roles: ["ADMINISTRADOR"] },
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
      title: "Tecnico",
      key: "tecnico",
      roles: ["ADMINISTRADOR", "TECNICO"],
      items: [
        { label: "Mis Órdenes", to: "/tecnico/ordenes", icon: ClipboardList, roles: ["ADMINISTRADOR", "TECNICO"] },
        { label: "Mis viáticos", to: "/tecnico/mis-viaticos", icon: WalletCards, roles: ["TECNICO"] },
      ],
    },
    {
      title: "Planner",
      key: "planner",
      roles: ["ADMINISTRADOR", "PLANNER"],
      items: [
        { label: "Cotizaciones Aprobadas", to: "/planner/cotizaciones", icon: Users, roles: ["ADMINISTRADOR", "PLANNER"], badge: cotizacionesPendientes },
        { label: "Programación OT", to: "/planner/ordenes", icon: Users, roles: ["ADMINISTRADOR", "PLANNER"], badge: ordenesPendientes },
        { label: "Movilidades", to: "/planner/movilidades", icon: Users, roles: ["ADMINISTRADOR", "PLANNER"], }
      ],
    },
    {
      title: "Postventa",
      key: "postventa ",
      roles: ["ADMINISTRADOR", "POSTVENTA"],
      items: [
        { label: "Cotizacion", to: "/postventa/cotizacion", icon: UserCog, roles: ["ADMINISTRADOR", "POSTVENTA"] },
      ],
    },
    {
      title: "Servicios Técnicos",
      key: "servicios",
      roles: ["ADMINISTRADOR", "TECNICO", "POSTVENTA", "PLANNER"],
      items: [
        { label: "Calendario", to: "/servicio/calendario", icon: ClipboardList, roles: ["ADMINISTRADOR", "POSTVENTA", "PLANNER"] },
        { label: "Lista de Informes", to: "/informe-tecnico", icon: ClipboardList, roles: ["ADMINISTRADOR", "POSTVENTA", "PLANNER"], badge: puedeVerPlanner ? informesNoRevisados : 0 },
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

  const checkToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) { logout(); navigate("/login"); }
    } catch { logout(); navigate("/login"); }
  }, [logout, navigate]);

  useEffect(() => {
    checkToken();
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [checkToken]);

  // CORRECCIÓN: Quitamos el .toLowerCase() para que coincida con los valores del objeto UserRole
  return (
    <aside
      ref={sidebarRef}
      id="main-navigation"
      aria-label="Navegación principal"
      className={`fixed bottom-0 left-0 top-12 z-40 w-[min(18rem,86vw)] border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-out lg:w-50 lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="h-full flex flex-col border-r border-gray-100">
        <nav className="custom-scrollbar flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 pb-6 lg:p-2">
          {menuData.map((section) => {
            // Verificamos si el rol del usuario está en la lista permitida de la sección
            if (!userRole || (!unrestricted && !section.roles.includes(userRole))) return null;

            return (
              <div key={section.key} className="space-y-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1">
                  {section.title}
                </div>

                <ul className="space-y-1">
                  {section.items.map((item, index) => {
                    // Verificamos si el rol del usuario está en la lista permitida del item
                    if (!unrestricted && !item.roles.includes(userRole)) return null;
                    const Icon = item.icon;
                    return (
                      <li key={index}>
                        <NavLink
                          to={item.to}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 lg:min-h-0 lg:gap-2 lg:py-2 lg:text-xs ${isActive
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon size={18} className={isActive ? "text-white" : "text-gray-400"} />
                              <span>{item.label}</span>
                              {item.badge > 0 && (
                                <span className={`ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${isActive ? 'bg-white text-blue-700' : 'bg-red-600 text-white'}`}>
                                  {item.badge > 99 ? '99+' : item.badge}
                                </span>
                              )}
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
