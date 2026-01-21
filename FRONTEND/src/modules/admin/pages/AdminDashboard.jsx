import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkedAlt, FaHotel, FaUserTie, FaClipboardList } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // Recuperar nombre del admin del localStorage para saludar
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="admin-container">
            {/* Header del Dashboard */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Panel de Administración</h1>
                    <span className="user-info">Hola, {user.nombre || 'Administrador'}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                    Cerrar Sesión
                </button>
            </div>

            {/* Grid de Opciones */}
            <div className="dashboard-grid">
                
                {/* 1. CREAR TOURS */}
                <Link to="/admin/crear-tour" className="dashboard-card">
                    <FaMapMarkedAlt className="card-icon" />
                    <h3 className="card-title">Gestionar Tours</h3>
                    <p className="card-desc">Crear, editar o eliminar paquetes turísticos.</p>
                </Link>

                {/* 2. CREAR HOTELES */}
                <Link to="/admin/crear-hotel" className="dashboard-card">
                    <FaHotel className="card-icon" />
                    <h3 className="card-title">Gestionar Hoteles</h3>
                    <p className="card-desc">Administrar alojamientos y habitaciones.</p>
                </Link>

                {/* 3. CREAR GUÍAS */}
                <Link to="/admin/crear-guia" className="dashboard-card">
                    <FaUserTie className="card-icon" />
                    <h3 className="card-title">Gestionar Guías</h3>
                    <p className="card-desc">Registrar personal y asignar tours.</p>
                </Link>

                {/* 4. VER RESERVAS (La opción nueva) */}
                <Link to="/admin/reservas" className="dashboard-card">
                    <FaClipboardList className="card-icon" />
                    <h3 className="card-title">Reservas y Pagos</h3>
                    <p className="card-desc">Ver quién ha reservado y validar pagos.</p>
                </Link>

            </div>
        </div>
    );
};

export default AdminDashboard;