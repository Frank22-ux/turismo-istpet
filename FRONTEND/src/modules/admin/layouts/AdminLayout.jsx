import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import * as NotificacionService from '../services/notificacion.service';
import {
    FaMapMarkedAlt,
    FaHotel,
    FaUserTie,
    FaClipboardList,
    FaHome,
    FaChartLine,
    FaUsers,
    FaCog,
    FaSignOutAlt,
    FaBell,
    FaSearch,
    FaCheck,
    FaTrash
} from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = ({ children, title = "Panel de Administración" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        cargarNotificaciones();
        // Polling para nuevas notificaciones cada 10 segundos
        const interval = setInterval(cargarNotificaciones, 10000);
        return () => clearInterval(interval);
    }, []);

    const cargarNotificaciones = async () => {
        try {
            const data = await NotificacionService.getNotificaciones();
            setNotificaciones(data);
            setUnreadCount(data.filter(n => !n.leida).length);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await NotificacionService.marcarComoLeida(id);
            cargarNotificaciones();
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await NotificacionService.marcarTodasComoLeidas();
            cargarNotificaciones();
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await NotificacionService.eliminarTodas();
            cargarNotificaciones();
        } catch (error) {
            console.error('Error al eliminar notificaciones:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutRequest();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            navigate('/login');
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="layout-wrapper">
            {/* SIDEBAR */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="company-logo">
                        <img src="/uploads/logo.png" alt="Logo" className="logo-img" />
                        {sidebarOpen && <span className="company-name">ECORUT Travels</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {/* SECCIÓN: PRINCIPAL */}
                    <div className="nav-section">
                        {sidebarOpen && <span className="nav-label">Principal</span>}
                        <Link
                            to="/admin"
                            className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                        >
                            <FaHome className="nav-icon" />
                            {sidebarOpen && <span className="nav-text">Dashboard</span>}
                        </Link>
                    </div>

                    {/* SECCIÓN: GESTIÓN */}
                    <div className="nav-section">
                        {sidebarOpen && <span className="nav-label">Gestión</span>}
                        <Link
                            to="/admin/crear-tour"
                            className={`nav-item ${isActive('/admin/crear-tour') ? 'active' : ''}`}
                        >
                            <FaMapMarkedAlt className="nav-icon" />
                            {sidebarOpen && <span className="nav-text">Tours</span>}
                        </Link>
                        <Link
                            to="/admin/crear-hotel"
                            className={`nav-item ${isActive('/admin/crear-hotel') ? 'active' : ''}`}
                        >
                            <FaHotel className="nav-icon" />
                            {sidebarOpen && <span className="nav-text">Hoteles</span>}
                        </Link>
                        <Link
                            to="/admin/crear-guia"
                            className={`nav-item ${isActive('/admin/crear-guia') ? 'active' : ''}`}
                        >
                            <FaUserTie className="nav-icon" />
                            {sidebarOpen && <span className="nav-text">Guías</span>}
                        </Link>
                        <Link
                            to="/admin/reservas"
                            className={`nav-item ${isActive('/admin/reservas') ? 'active' : ''}`}
                        >
                            <FaClipboardList className="nav-icon" />
                            {sidebarOpen && <span className="nav-text">Reservas</span>}
                        </Link>
                    </div>

                    {/* SECCIÓN: ESTADÍSTICAS */}
                    <div className="nav-section">
                        {sidebarOpen && <span className="nav-label">Estadísticas</span>}
                        <Link
                            to="/admin/analytics"
                            className={`nav-item ${isActive('/admin/analytics') ? 'active' : ''}`}
                        >
                            <FaChartLine className="nav-icon" />
                            {sidebarOpen && <span className="nav-text">Analytics</span>}
                        </Link>
                        <Link
                            to="/admin/clientes"
                            className={`nav-item ${isActive('/admin/clientes') ? 'active' : ''}`}
                        >
                            <FaUsers className="nav-icon" />
                            {sidebarOpen && <span className="nav-text">Clientes</span>}
                        </Link>
                    </div>

                    {/* SECCIÓN: CUENTA */}
                    <div className="nav-section">
                        {sidebarOpen && <span className="nav-label">Cuenta</span>}
                        <Link
                            to="/admin/configuracion"
                            className={`nav-item ${isActive('/admin/configuracion') ? 'active' : ''}`}
                        >
                            <FaCog className="nav-icon" />
                            {sidebarOpen && <span className="nav-text">Configuración</span>}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="nav-item nav-item--logout"
                        >
                            <FaSignOutAlt className="nav-icon" />
                            {sidebarOpen && <span className="nav-text">Cerrar Sesión</span>}
                        </button>
                    </div>
                </nav>

                <div className="sidebar-user">
                    <img
                        src={`https://ui-avatars.com/api/?name=${user.nombre || 'Admin'}&background=1bffe4&color=022b3a`}
                        alt="Avatar"
                        className="sidebar-avatar"
                    />
                    {sidebarOpen && (
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{user.nombre || 'Administrador'}</span>
                            <span className="sidebar-user-role">Product Manager</span>
                        </div>
                    )}
                </div>
            </aside>

            {/* MAIN */}
            <main className="main-content">
                {/* TOP BAR */}
                <header className="top-bar">
                    <div className="top-bar-left">
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            title={sidebarOpen ? "Contraer sidebar" : "Expandir sidebar"}
                        >
                            ☰
                        </button>
                        <div className="search-container">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar reservas, tours, clientes..."
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="top-bar-right">
                        {/* NOTIFICACIONES DROP-DOWN */}
                        <div className="notifications-container">
                            <button
                                className={`icon-btn ${isNotificationsOpen ? 'active' : ''}`}
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            >
                                <FaBell />
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            </button>

                            {isNotificationsOpen && (
                                <div className="notifications-dropdown">
                                    <div className="notifications-header">
                                        <h4>Notificaciones ({unreadCount})</h4>
                                        <div className="notif-header-actions">
                                            <button className="text-btn" onClick={handleMarkAllRead}>Leídas</button>
                                            <button className="mark-read-btn" onClick={handleClearAll}>Limpiar</button>
                                        </div>
                                    </div>
                                    <div className="notifications-list">
                                        {notificaciones.length > 0 ? (
                                            notificaciones.map((notif) => (
                                                <div key={notif.id_notificacion} className={`notification-item ${notif.leida ? 'read' : 'unread'}`}>
                                                    <div className="notif-content">
                                                        <p className="notif-title">{notif.titulo}</p>
                                                        <p className="notif-message" dangerouslySetInnerHTML={{ __html: notif.mensaje }}></p>
                                                        <span className="notif-time">{new Date(notif.fecha_creacion).toLocaleString()}</span>
                                                    </div>
                                                    {!notif.leida && (
                                                        <button 
                                                            className="mark-as-read-btn" 
                                                            onClick={() => handleMarkAsRead(notif.id_notificacion)}
                                                            title="Marcar como leída"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-notifications">
                                                <p>No tienes notificaciones pendientes</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="notifications-footer">
                                        <Link to="/admin" onClick={() => setIsNotificationsOpen(false)}>Ver historial</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="user-menu">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user.nombre || 'Admin'}&background=022b3a&color=fff`}
                                alt="User Avatar"
                                className="user-avatar"
                            />
                            <div className="user-info-header">
                                <span className="user-name">{user.nombre || 'Administrador'}</span>
                                <span className="user-role">Product Manager</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;