import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import route from '../helpers/route';
import { UserRole } from '../helpers/roles';

// Layouts y Protecciones
import MainLayout from '../common/MainLayout';
import ProtectedRoute from '../components/protectedRoute';
import NotFound from './NotFound';
import Loading from '../components/Loading';
import Accessdenied from '../components/Accessdenied';
import Perfil from './Usuarios/Perfil.jsx';

// Vistas
import Login from '../home/Login';
import Inicio from '../home/Inicio';
import Clientes from './clientes/Clientes';
import EquipoClientes from './clientes/Equipos';
import { ClienteEquiposDetalle } from './clientes/ClienteEquiposDetalle';
import Notificaciones from '../services/Notificaciones';
import Usuarios from './Usuarios/Usuarios';
import DashboardAdministrador from './dashboard/administrador/Dashboard';
import DashboardPostventa from './dashboard/postventa/Dashboard';
import DashboardTecnico from './dashboard/tecnico/Dashboard';
import Calendario from './Servicios/calendario/Calendario';
import NuevoServicio from './Servicios/GenerarServicio';
import ListaInformes from './ServicioTecnico/ListaInformes';
import GestionarFirma from './ServicioTecnico/GestionarFirma';
import ReportEstacionario from '../modules/Servicios/ReportEstacionario';
import ReportSecador from './ReportPortatil';
import Gastos from './Servicios/gastos/Gasto';
import ServicioTiempos from './tiempos/HistorialTiempos';
import HistorialInformes from './ServicioTecnico/tecnico/HistorialInformes';
import Manual from './manuales/Manual';
//PLANNER

import CotizacionesDisponibles from './planner/CotizacionesDisponibles.jsx';
import ProgramarOT from './planner/ProgramarOT.jsx';
import OrdenesTrabajo from './planner/OrdenesTrabajo.jsx';
import DetalleOrdenTrabajo from './planner/DetalleOrdenTrabajo.jsx';
import CotizacionDetalle from './postventa/CotizacionDetalle.jsx';

//TECNICO
import MisOrdenes from './tecnico/MisOrdenes.jsx';
import DetalleOrdenTecnico from './tecnico/DetalleOrdenTecnico.jsx';
import DetalleInforme from './tecnico/DetalleInforme.jsx';
import ViaticosOT from './viaticos/ViaticosOT.jsx';
import MisViaticos from './viaticos/MisViaticos.jsx';
import ViaticosAdmin from './viaticos/ViaticosAdmin.jsx';


//INFORME TECNICO
import InformeTecnicoList from './informe-tecnico/InformeTecnicoList.jsx';

import Cotizacion from './cotizacion/CotizacionList';


//Movilidades
import MovilidadList from './movilidad/MovilidadList';
import MovilidadDetalle from './movilidad/MovilidadDetalle';



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
    <>
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
              <ProtectedRoute allowedRoles={[UserRole.admin, UserRole.planner, UserRole.tecnico, UserRole.postventa, UserRole.almacen]}>
                <Inicio />
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute allowedRoles={[UserRole.admin, UserRole.planner, UserRole.tecnico, UserRole.postventa, UserRole.almacen]}>
                <Perfil />
              </ProtectedRoute>
            } />


            <Route
              path="/tecnico/ordenes"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.tecnico,
                    UserRole.admin
                  ]}
                >
                  <MisOrdenes />
                </ProtectedRoute>
              }
            />
            <Route path="/tecnico/mis-viaticos" element={<ProtectedRoute allowedRoles={[UserRole.tecnico]}><MisViaticos /></ProtectedRoute>} />
            <Route path="/administrador/viaticos" element={<ProtectedRoute allowedRoles={[UserRole.admin]}><ViaticosAdmin /></ProtectedRoute>} />
            <Route
              path="/tecnico/ordenes/:idOt"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.tecnico,
                    UserRole.admin
                  ]}
                >
                  <DetalleOrdenTecnico />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tecnico/informes/:idInforme"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.tecnico,
                    UserRole.admin,
                    UserRole.planner,
                    UserRole.postventa
                  ]}
                >
                  <DetalleInforme />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ordenes/:idOt/viaticos"
              element={
                <ProtectedRoute allowedRoles={[UserRole.tecnico, UserRole.admin, UserRole.planner]}>
                  <ViaticosOT />
                </ProtectedRoute>
              }
            />


















            <Route
              path="/planner/cotizaciones/:idCotizacion"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.admin,
                    UserRole.postventa,
                    UserRole.planner
                  ]}
                >
                  <CotizacionDetalle />
                </ProtectedRoute>
              }
            />

            {/* LISTADO DE COTIZACIONES APROBADAS */}
            <Route
              path="/planner/cotizaciones"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.admin,
                    UserRole.postventa,
                    UserRole.planner
                  ]}
                >
                  <CotizacionesDisponibles />
                </ProtectedRoute>
              }
            />

            {/* PROGRAMAR UNA OT DESDE UNA COTIZACIÓN */}
            <Route
              path="/planner/programar/:idCotizacion"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.admin,
                    UserRole.postventa,
                    UserRole.planner
                  ]}
                >
                  <ProgramarOT />
                </ProtectedRoute>
              }
            />

            {/* LISTADO DE ÓRDENES DE TRABAJO */}
            <Route
              path="/planner/ordenes"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.admin,
                    UserRole.postventa,
                    UserRole.planner
                  ]}
                >
                  <OrdenesTrabajo />
                </ProtectedRoute>
              }
            />

            {/* DETALLE DE UNA ORDEN DE TRABAJO */}
            <Route
              path="/planner/ordenes/:idOt"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.admin,
                    UserRole.postventa,
                    UserRole.planner
                  ]}
                >
                  <DetalleOrdenTrabajo />
                </ProtectedRoute>
              }
            />





            <Route path={route.informetecnicolist} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><InformeTecnicoList /></ProtectedRoute>} />




            <Route path={route.cotizacion} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><Cotizacion /></ProtectedRoute>} />
            <Route path={route.listmovilidades} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><MovilidadList /></ProtectedRoute>} />
            <Route path={route.movilidaddetalle} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><MovilidadDetalle /></ProtectedRoute>} />
            <Route path={route.historialinforme} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><HistorialInformes /></ProtectedRoute>} />
            <Route path={route.listaServicio} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.almacen, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><NuevoServicio /></ProtectedRoute>} />
            <Route path={route.clientes} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><Clientes /></ProtectedRoute>} />
            <Route path="/cliente/equipos" element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><EquipoClientes /></ProtectedRoute>} />
            <Route path={route.calendario} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><Calendario /></ProtectedRoute>} />
            <Route path={route.gastosServicio} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.tecnico, UserRole.postventa, UserRole.planner]}><Gastos /></ProtectedRoute>} />
            <Route path={route.equiposCliente} element={<ProtectedRoute allowedRoles={[UserRole.admin, UserRole.postventa, UserRole.planner]}><ClienteEquiposDetalle /></ProtectedRoute>} />
            <Route path={route.manuales} element={<ProtectedRoute allowedRoles={[UserRole.tecnico, UserRole.admin, UserRole.postventa, UserRole.planner]}><Manual /></ProtectedRoute>} />
            <Route path={route.reportes} element={<ProtectedRoute allowedRoles={[UserRole.tecnico, UserRole.admin, UserRole.postventa, UserRole.planner]}><ListaInformes /></ProtectedRoute>} />
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
            <Route path="/acceso-denegado" element={<Accessdenied />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      )}
    </>
  );
}

export default MyApp;
