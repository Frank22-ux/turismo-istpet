import { Navigate } from 'react-router-dom';
import { ROLES } from '../core/constants/roles';

/**
 * Componente que protege rutas según autenticación y rol
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si está autorizado
 * @param {Array<string>} props.requiredRoles - Roles permitidos (ej: [ROLES.ADMIN, ROLES.GUIA])
 * @param {boolean} props.requireAuth - Requiere autenticación (default: true)
 */
const ProtectedRoute = ({ children, requiredRoles = null, requireAuth = true }) => {
  // Obtener token y usuario desde localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Si requiere autenticación y no hay token, redirigir a login
  if (requireAuth && !token) {
    console.warn('⚠️ Acceso denegado: No hay token. Redirigiendo a login.');
    return <Navigate to="/login" replace />;
  }

  // Si hay roles requeridos, verificar que el usuario tenga uno de ellos
  if (requiredRoles && requiredRoles.length > 0) {
    const userRol = user?.rol || user?.id_rol;
    
    if (!userRol || !requiredRoles.includes(userRol)) {
      console.warn(`⚠️ Acceso denegado: Rol requerido: ${requiredRoles.join(', ')}, usuario tiene: ${userRol}`);
      // Redirigir al dashboard del rol que tiene
      if (userRol === ROLES.ADMIN) return <Navigate to="/admin" replace />;
      if (userRol === ROLES.GUIA) return <Navigate to="/guia" replace />;
      if (userRol === ROLES.TURISTA) return <Navigate to="/home" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  // Si todo está bien, renderizar el componente
  return children;
};

export default ProtectedRoute;
