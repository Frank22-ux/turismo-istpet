import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verifySessionRequest } from './modules/auth/services/auth.service';

// --- PÁGINA PRINCIPAL ---
import MainPage from './pages/MainPage';

import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage';
import AdminDashboard from './modules/admin/pages/AdminDashboard';

// --- IMPORTAR LAS PÁGINAS DE GESTIÓN DE TOURS ---
import GestionTours from './modules/tours/pages/GestionTours';
import CrearTour from './modules/tours/pages/CrearTour';
import EditarTour from './modules/tours/pages/EditarTour';
import DetalleTour from './modules/tours/pages/DetalleTour';

// --- IMPORTAR DASHBOARD Y PERFIL DEL TURISTA ---
import TuristaDashboard from './modules/usuarios/pages/TuristaDashboard';
import PerfilTurista from './modules/usuarios/pages/PerfilTurista';
import MisFavoritos from './modules/usuarios/pages/MisFavoritos';
import MisReservas from './modules/usuarios/pages/MisReservas';

// --- OTRAS GESTIONES ---
import GestionHoteles from './modules/hoteles/pages/GestionHoteles';
import CrearHotel from './modules/hoteles/pages/CrearHotel';
import DetalleHotel from './modules/hoteles/pages/DetalleHotel';
import GestionGuias from './modules/admin/pages/GestionGuias';
import CrearGuia from './modules/admin/pages/CrearGuia';
import GestionReservas from './modules/admin/pages/GestionReservas';
import Analytics from './modules/admin/pages/Analytics';
import Clientes from './modules/admin/pages/Clientes';
import CrearCliente from './modules/admin/pages/CrearCliente';
import Configuracion from './modules/admin/pages/Configuracion';

// --- DASHBOARD GUÍA ---
import GuiaDashboard from './modules/tours/pages/GuiaDashboard';
import GuiaMisTours from './modules/tours/pages/GuiaMisTours';
import GuiaReservas from './modules/tours/pages/GuiaReservas';
import GuiaGanancias from './modules/tours/pages/GuiaGanancias';
import GuiaEstadisticas from './modules/tours/pages/GuiaEstadisticas';
import GuiaEditarPerfil from './modules/tours/pages/GuiaEditarPerfil';
import MisResenas from './modules/resenas/pages/MisResenas';
import GuiaDisponibilidad from './modules/tours/pages/GuiaDisponibilidad';
import GuiaMisResenas from './modules/tours/pages/GuiaMisResenas';

// --- COMPONENTE PROTEGIDO ---
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './core/constants/roles';

function App() {
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    console.log('✓ App.jsx se está renderizando y montando');

    // Verificar sesión al montar la aplicación
    const verifySession = async () => {
      const token = localStorage.getItem('token');

      // Si no hay token, marcar como verificado y salir
      if (!token) {
        console.log('ℹ️ No hay token en localStorage');
        setSessionChecked(true);
        return;
      }

      try {
        console.log('🔍 Verificando sesión con el servidor...');
        const response = await verifySessionRequest();

        if (response.user) {
          // Actualizar datos del usuario (por si cambiaron en el servidor)
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('✅ Sesión válida. Usuario:', response.user);
        }

      } catch (error) {
        console.error('❌ Error al verificar sesión:', error.message);
        console.log('🗑️ Limpiando sesión inválida...');

        // Limpiar localStorage si el token es inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        // Marcar verificación como completada
        setSessionChecked(true);
      }
    };

    verifySession();
  }, []);

  // Mostrar un loader mientras se verifica la sesión
  if (!sessionChecked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Verificando sesión...</h2>
          <p>Por favor espera mientras se valida tu sesión</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <Routes>
        {/* Página Principal */}
        <Route path="/" element={<MainPage />} />

        {/* Rutas de Autenticación (SIN protección) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* --- RUTAS DE USUARIO TURISTA (Protegidas) --- */}
        <Route path="/home" element={
          <ProtectedRoute requiredRoles={[ROLES.TURISTA]}>
            <TuristaDashboard />
          </ProtectedRoute>
        } />
        <Route path="/perfil-turista" element={
          <ProtectedRoute requiredRoles={[ROLES.TURISTA]}>
            <PerfilTurista />
          </ProtectedRoute>
        } />
        <Route path="/mis-favoritos" element={
          <ProtectedRoute requiredRoles={[ROLES.TURISTA]}>
            <MisFavoritos />
          </ProtectedRoute>
        } />
        <Route path="/mis-reservas" element={
          <ProtectedRoute requiredRoles={[ROLES.TURISTA]}>
            <MisReservas />
          </ProtectedRoute>
        } />
        <Route path="/mis-resenas" element={
          <ProtectedRoute requiredRoles={[ROLES.TURISTA]}>
            <MisResenas />
          </ProtectedRoute>
        } />
        <Route path="/hotel/:id" element={
          <ProtectedRoute requiredRoles={[ROLES.TURISTA]}>
            <DetalleHotel />
          </ProtectedRoute>
        } />

        {/* --- RUTAS DE GUÍA (Protegidas) --- */}
        <Route path="/guia" element={
          <ProtectedRoute requiredRoles={[ROLES.GUIA]}>
            <GuiaDashboard />
          </ProtectedRoute>
        } />
        <Route path="/guia/mis-tours" element={
          <ProtectedRoute requiredRoles={[ROLES.GUIA]}>
            <GuiaMisTours />
          </ProtectedRoute>
        } />
        <Route path="/guia/reservas" element={
          <ProtectedRoute requiredRoles={[ROLES.GUIA]}>
            <GuiaReservas />
          </ProtectedRoute>
        } />
        <Route path="/guia/ganancias" element={
          <ProtectedRoute requiredRoles={[ROLES.GUIA]}>
            <GuiaGanancias />
          </ProtectedRoute>
        } />
        <Route path="/guia/estadisticas" element={
          <ProtectedRoute requiredRoles={[ROLES.GUIA]}>
            <GuiaEstadisticas />
          </ProtectedRoute>
        } />
        <Route path="/guia/editar-perfil" element={
          <ProtectedRoute requiredRoles={[ROLES.GUIA]}>
            <GuiaEditarPerfil />
          </ProtectedRoute>
        } />
        <Route path="/guia/disponibilidad" element={
          <ProtectedRoute requiredRoles={[ROLES.GUIA]}>
            <GuiaDisponibilidad />
          </ProtectedRoute>
        } />
        <Route path="/guia/mis-resenas" element={
          <ProtectedRoute requiredRoles={[ROLES.GUIA]}>
            <GuiaMisResenas />
          </ProtectedRoute>
        } />

        {/* --- RUTAS DE ADMINISTRADOR (Protegidas) --- */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Gestión de Tours */}
        <Route path="/admin/crear-tour" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <GestionTours />
          </ProtectedRoute>
        } />
        <Route path="/admin/crear-tour/nuevo" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <CrearTour />
          </ProtectedRoute>
        } />

        {/* Ruta para EDITAR */}
        <Route path="/admin/editar-tour/:id" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <EditarTour />
          </ProtectedRoute>
        } />

        {/* Ruta para VISUALIZAR DETALLES */}
        <Route path="/admin/detalle-tour/:id" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <DetalleTour />
          </ProtectedRoute>
        } />

        {/* Otras Gestiones del Panel Administrativo */}
        <Route path="/admin/crear-hotel" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <GestionHoteles />
          </ProtectedRoute>
        } />
        <Route path="/admin/crear-hotel/nuevo" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <CrearHotel />
          </ProtectedRoute>
        } />
        <Route path="/admin/crear-hotel/:id" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <CrearHotel />
          </ProtectedRoute>
        } />
        <Route path="/admin/crear-guia" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <GestionGuias />
          </ProtectedRoute>
        } />
        <Route path="/admin/crear-guia/nuevo" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <CrearGuia />
          </ProtectedRoute>
        } />
        <Route path="/admin/crear-guia/:id" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <CrearGuia />
          </ProtectedRoute>
        } />
        <Route path="/admin/reservas" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <GestionReservas />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/clientes" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <Clientes />
          </ProtectedRoute>
        } />
        <Route path="/admin/clientes/nuevo" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <CrearCliente />
          </ProtectedRoute>
        } />
        <Route path="/admin/clientes/:id" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <CrearCliente />
          </ProtectedRoute>
        } />
        <Route path="/admin/configuracion" element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <Configuracion />
          </ProtectedRoute>
        } />

        {/* Ruta por defecto para 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;