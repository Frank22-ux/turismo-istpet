import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

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
import DetalleTourGuia from './modules/guias/pages/DetalleTourGuia';

// --- GESTIÓN DE HOTELES ---
import GestionHoteles from './modules/hoteles/pages/GestionHoteles';
import CrearHotel from './modules/hoteles/pages/CrearHotel'; 
import DetalleHotel from './modules/hoteles/pages/DetalleHotel';
import EditarHotel from './modules/hoteles/pages/EditarHotel';

// --- TURISTA (CLIENTE) ---
import TuristaDashboard from './modules/usuarios/pages/TuristaDashboard';
import PerfilTurista from './modules/usuarios/pages/PerfilTurista';
import MisReservas from './modules/usuarios/pages/MisReservas';
import ReservarTour from './modules/reservas/ReservaTour';

// --- PAGOS ---
import PagoCorrecto from './modules/pagos/PagoCorrecto'; // <-- NUEVO

function App() {
  // Configuración de PayPal
  const initialOptions = {
    "client-id": "Af-nZpTyBaWsRlRDYl6vD_nPox4_J0qMpgPPKoyTn0VFL2L-v2wnS9kdaq-FKn0Hk-_ZKPUeNf1U8XOj",
    currency: "USD", // Generalmente PayPal funciona mejor con USD para pruebas
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
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
          
          {/* Gestión de Reservas y Detalles */}
          <Route path="/reservar/:id" element={<ReservarTour />} /> 
          <Route path="/tour/:id" element={<DetalleTour />} /> 
          
          {/* --- RUTAS DE PAGO (PAYPAL) --- */}
          <Route path="/pago-correcto" element={<PagoCorrecto />} /> {/* <-- NUEVO */}
          
          {/* --- MÓDULO DEL GUÍA --- */}
          <Route path="/guia" element={<GuiaDashboard />} />
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
    </PayPalScriptProvider>
  );
}

export default App;