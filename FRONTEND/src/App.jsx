import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import AdminDashboard from './modules/admin/pages/AdminDashboard';

// --- IMPORTAR LAS PÁGINAS DE GESTIÓN DE TOURS ---
import GestionTours from './modules/tours/pages/GestionTours';
import CrearTour from './modules/tours/pages/CrearTour'; 
import EditarTour from './modules/tours/pages/EditarTour';
import DetalleTour from './modules/tours/pages/DetalleTour';

// --- IMPORTAR DASHBOARD Y PERFIL DEL TURISTA ---
import TuristaDashboard from './modules/usuarios/pages/TuristaDashboard';
import PerfilTurista from './modules/usuarios/pages/PerfilTurista'; // <--- NUEVA IMPORTACIÓN

// --- OTRAS GESTIONES ---
import GestionHoteles from './modules/hoteles/pages/GestionHoteles';
import GestionGuias from './modules/admin/pages/GestionGuias';
import GestionReservas from './modules/admin/pages/GestionReservas';

const GuiaDashboard = () => <h1>Panel Guía</h1>; // Placeholder

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Rutas de Autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* --- RUTAS DE USUARIO TURISTA --- */}
        <Route path="/home" element={<TuristaDashboard />} />
        <Route path="/perfil-turista" element={<PerfilTurista />} /> {/* <--- NUEVA RUTA */}
        
        {/* Roles Secundarios */}
        <Route path="/guia" element={<GuiaDashboard />} />
        
        {/* --- RUTAS DE ADMINISTRADOR --- */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Gestión de Tours */}
        <Route path="/admin/crear-tour" element={<GestionTours />} />
        <Route path="/admin/crear-tour/nuevo" element={<CrearTour />} /> 
        
        {/* Ruta para EDITAR (Carga el formulario con datos) */}
        <Route path="/admin/editar-tour/:id" element={<EditarTour />} />
        
        {/* Ruta para VISUALIZAR DETALLES (Común para todos) */}
        <Route path="/admin/detalle-tour/:id" element={<DetalleTour />} />

        {/* Otras Gestiones del Panel Administrativo */}
        <Route path="/admin/crear-hotel" element={<GestionHoteles />} />
        <Route path="/admin/crear-guia" element={<GestionGuias />} />
        <Route path="/admin/reservas" element={<GestionReservas />} />

        {/* Ruta por defecto para 404 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;