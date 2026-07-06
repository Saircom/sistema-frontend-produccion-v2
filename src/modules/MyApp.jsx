import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/authContext';
import route from '../helpers/route';
import { UserRole } from '../helpers/roles';

// Layouts y Protecciones
import MainLayout from '../common/MainLayout';
import ProtectedRoute from '../components/protectedRoute';
import NotFound from './NotFound';
import Loading from '../components/Loading';

// Vistas
import Login from '../home/Login';
import Inicio from '../home/Inicio';
import Clientes from './clientes/Clientes';
import EquipoClientes from './Clientes/Equipos';
import { ClienteEquiposDetalle } from './Clientes/ClienteEquiposDetalle';
import Notificaciones from '../services/Notificaciones';
import Usuarios from './Usuarios/Usuarios';
import DashboardAdministrador from './dashboard/administrador/Dashboard';
import DashboardPostventa from './dashboard/postventa/Dashboard';
import DashboardTecnico from './dashboard/tecnico/Dashboard';
import Calendario from './Servicios/calendario/Calendario';
import NuevoServicio from './Servicios/GenerarServicio';
import DetalleServicio from './ServicioTecnico/DetalleServicio';
import ListaInformes from './ServicioTecnico/ListaInformes';
import SubirFotos from './ServicioTecnico/SubirFotos';
import GestionarFirma from './ServicioTecnico/GestionarFirma';
import ReportEstacionario from '../modules/Servicios/ReportEstacionario';
import ReportSecador from './ReportPortatil';
import Gastos from './Servicios/gastos/Gasto';
import ServicioTiempos from './tiempos/HistorialTiempos';
import HistorialInformes from './ServicioTecnico/tecnico/HistorialInformes';
import Manual from './manuales/Manual';

//Postventa 
import ListCotizacion from './postventa/ListCotizacion';
import SolicitudList from './planner/SolicitudList';

//Movilidades
import MovilidadList from './movilidad/MovilidadList';



function MyApp() {
  const [isReady, setIsReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Esto asegura que la App espere a que el motor de React/Capacitor esté listo
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <Loading />;
  }

  const isLoginPage = location.pathname.includes('/login');

  return (
    <AuthProvider>
      {isLoginPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      ) : (
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={
              <ProtectedRoute allowedRoles={[UserRole.admin, UserRole.planner, UserRole.tecnico, UserRole.postventa]}>
                <Inicio />
              </ProtectedRoute>
            } />
            <Route path={route.listmovilidades} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><MovilidadList /></ProtectedRoute>} />
            <Route path={route.listsolicitud} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><SolicitudList /></ProtectedRoute>} />
            <Route path={route.listcotizacion} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><ListCotizacion /></ProtectedRoute>} />
            <Route path={route.historialinforme} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><HistorialInformes /></ProtectedRoute>} />
            <Route path={route.listaServicio} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.almacen, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><NuevoServicio /></ProtectedRoute>} />
            <Route path={route.clientes} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><Clientes /></ProtectedRoute>} />
            <Route path="/cliente/equipos" element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><EquipoClientes /></ProtectedRoute>} />
            <Route path={route.calendario} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><Calendario /></ProtectedRoute>} />
            <Route path={route.gastosServicio} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><Gastos /></ProtectedRoute>} />
            <Route path={route.equiposCliente} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><ClienteEquiposDetalle /></ProtectedRoute>} />
            <Route path={route.manuales} element={<ProtectedRoute allowedRoles={[UserRole.tecnico, UserRole.admin, UserRole.postventa, UserRole.planner]}><Manual /></ProtectedRoute>} />
            <Route path={route.reportes} element={<ProtectedRoute allowedRoles={[UserRole.tecnico, UserRole.admin, UserRole.postventa, UserRole.planner]}><ListaInformes /></ProtectedRoute>} />
            <Route path={route.detalleServicio} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><DetalleServicio /></ProtectedRoute>} />
            <Route path={route.detalles} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><DetalleServicio /></ProtectedRoute>} />
            <Route path="/tecnicos/reportes/:id_servicio/fotos" element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><SubirFotos /></ProtectedRoute>} />
            <Route path="/tecnicos/reportes/:id_servicio/firma" element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><GestionarFirma /></ProtectedRoute>} />
            <Route path={route.equipoestacionario} element={<ProtectedRoute allowedRoles={[UserRole.tecnico, UserRole.admin, UserRole.planner]}><ReportEstacionario /></ProtectedRoute>} />
            <Route path={route.equipoportatil} element={<ProtectedRoute allowedRoles={[UserRole.tecnico, UserRole.admin, UserRole.planner]}><ReportSecador /></ProtectedRoute>} />
            <Route path={route.historialtiempos} element={<ProtectedRoute allowedRoles={[UserRole.postventa, UserRole.admin, UserRole.planner]}><ServicioTiempos /></ProtectedRoute>} />
            <Route path={route.usuarios} element={<ProtectedRoute allowedRoles={[UserRole.admin]}><Usuarios /></ProtectedRoute>} />
            <Route path="/notificacion" element={<ProtectedRoute allowedRoles={[UserRole.admin]}><Notificaciones /></ProtectedRoute>} />
            <Route path={route.dashboardadministrador} element={<ProtectedRoute allowedRoles={[UserRole.admin]}><DashboardAdministrador /></ProtectedRoute>} />
            <Route path={route.dashboardpostventa} element={<ProtectedRoute allowedRoles={[UserRole.postventa]}><DashboardPostventa /></ProtectedRoute>} />
            <Route path={route.dashboardtecnico} element={<ProtectedRoute allowedRoles={[UserRole.tecnico]}><DashboardTecnico /></ProtectedRoute>} />
            <Route path="/loading" element={<Loading />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      )}
    </AuthProvider>
  );
}

export default MyApp;