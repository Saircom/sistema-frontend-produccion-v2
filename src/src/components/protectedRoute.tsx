import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../context/authContext";
import { canAccess } from "../utils/permissions.js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user } = useAuth();
  const location = useLocation(); // Para obtener la ruta actual

  // Si no hay usuario autenticado, redirige a login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el rol del usuario no está permitido, redirige a una página de acceso denegado o login
  if (!canAccess(user, allowedRoles)) {
    return <Navigate to="/acceso-denegado" state={{ from: location }} replace />;
  }

  // Si el usuario tiene el rol adecuado, renderiza el contenido
  return <>{children}</>;
};

export default ProtectedRoute;
