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
import PerfilTurista from './modules/usuarios/pages/PerfilTurista';
import MisReservas from './modules/usuarios/pages/MisReservas';

// --- IMPORTAR LAS PÁGINAS DE GESTIÓN DE HOTELES ---
import GestionHoteles from './modules/hoteles/pages/GestionHoteles';
import CrearHotel from './modules/hoteles/pages/CrearHotel'; 
import DetalleHotel from './modules/hoteles/pages/DetalleHotel';
import EditarHotel from './modules/hoteles/pages/EditarHotel'; // <--- IMPORTACIÓN HABILITADA

// --- OTRAS GESTIONES ---
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
        <Route path="/perfil-turista" element={<PerfilTurista />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        
        {/* Roles Secundarios */}
        <Route path="/guia" element={<GuiaDashboard />} />
        
        {/* --- RUTAS DE ADMINISTRADOR --- */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Gestión de Tours */}
        <Route path="/admin/tours" element={<GestionTours />} />
        <Route path="/admin/crear-tour" element={<CrearTour />} /> 
        <Route path="/admin/editar-tour/:id" element={<EditarTour />} />
        <Route path="/admin/detalle-tour/:id" element={<DetalleTour />} />

        {/* --- GESTIÓN DE HOTELES --- */}
        <Route path="/admin/hoteles" element={<GestionHoteles />} />
        <Route path="/admin/crear-hotel" element={<CrearHotel />} />
        <Route path="/admin/hoteles/detalle/:id" element={<DetalleHotel />} />
        <Route path="/admin/editar-hotel/:id" element={<EditarHotel />} /> {/* <--- RUTA HABILITADA */}

        {/* Otras Gestiones del Panel Administrativo */}
        <Route path="/admin/crear-guia" element={<GestionGuias />} />
        <Route path="/admin/reservas" element={<GestionReservas />} />

        {/* Ruta por defecto para 404 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;