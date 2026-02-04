import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- AUTENTICACIÓN ---
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';

// --- PANEL ADMINISTRATIVO ---
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import GestionGuias from './modules/admin/pages/GestionGuias'; 
import GestionReservas from './modules/admin/pages/GestionReservas';

// --- GESTIÓN DE TOURS (PAQUETES) ---
import GestionTours from './modules/tours/pages/GestionTours';
import CrearTour from './modules/tours/pages/CrearTour'; 
import EditarTour from './modules/tours/pages/EditarTour';
import DetalleTour from './modules/tours/pages/DetalleTour';

// --- GESTIÓN DE GUÍAS (VISTA ADMIN) ---
import CrearGuia from './modules/guias/pages/CrearGuia'; 
import EditarGuia from './modules/guias/pages/EditarGuia';
import DetalleGuia from './modules/guias/pages/DetalleGuia';

// --- MÓDULO ESPECÍFICO DEL GUÍA (SU PANEL) ---
import GuiaDashboard from './modules/guias/pages/GuiaDashboard'; 
import DetalleTourGuia from './modules/guias/pages/DetalleTourGuia'; // <--- NUEVA IMPORTACIÓN

// --- GESTIÓN DE HOTELES ---
import GestionHoteles from './modules/hoteles/pages/GestionHoteles';
import CrearHotel from './modules/hoteles/pages/CrearHotel'; 
import DetalleHotel from './modules/hoteles/pages/DetalleHotel';
import EditarHotel from './modules/hoteles/pages/EditarHotel';

// --- TURISTA (CLIENTE) ---
import TuristaDashboard from './modules/usuarios/pages/TuristaDashboard';
import PerfilTurista from './modules/usuarios/pages/PerfilTurista';
import MisReservas from './modules/usuarios/pages/MisReservas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* --- MÓDULO TURISTA --- */}
        <Route path="/home" element={<TuristaDashboard />} />
        <Route path="/perfil-turista" element={<PerfilTurista />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        
        {/* --- MÓDULO DEL GUÍA --- */}
        <Route path="/guia" element={<GuiaDashboard />} />
        {/* Nueva ruta para el detalle que verá el guía */}
        <Route path="/guia/tour/:id" element={<DetalleTourGuia />} /> 
        
        {/* --- MÓDULO ADMINISTRACIÓN --- */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Gestión de Tours (Admin) */}
        <Route path="/admin/tours" element={<GestionTours />} />
        <Route path="/admin/crear-tour" element={<CrearTour />} /> 
        <Route path="/admin/editar-tour/:id" element={<EditarTour />} />
        <Route path="/admin/detalle-tour/:id" element={<DetalleTour />} />

        {/* Gestión de Hoteles (Admin) */}
        <Route path="/admin/hoteles" element={<GestionHoteles />} />
        <Route path="/admin/crear-hotel" element={<CrearHotel />} />
        <Route path="/admin/hoteles/detalle/:id" element={<DetalleHotel />} />
        <Route path="/admin/editar-hotel/:id" element={<EditarHotel />} />

        {/* Gestión de Guías (Admin) */}
        <Route path="/admin/guias" element={<GestionGuias />} />
        <Route path="/admin/crear-guia" element={<CrearGuia />} />
        <Route path="/admin/editar-guia/:id" element={<EditarGuia />} />
        <Route path="/admin/detalle-guia/:id" element={<DetalleGuia />} />

        {/* Gestión de Reservas (Admin) */}
        <Route path="/admin/reservas" element={<GestionReservas />} />

        {/* 404 - Wildcard */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;