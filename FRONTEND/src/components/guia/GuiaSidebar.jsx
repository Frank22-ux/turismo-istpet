import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaCoins, FaChartLine, FaStar } from 'react-icons/fa';

const GuiaSidebar = ({ currentGuide }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="guia-sidebar">
            <div className="sidebar-profile-guia">
                <div className="profile-avatar-guia">
                    <img src={currentGuide.imagen} alt={currentGuide.nombre} />
                </div>
                <h3 className="profile-name-guia">{currentGuide.nombre} {currentGuide.apellido}</h3>
                <p className="profile-specialty-guia">{currentGuide.especialidad}</p>
                <div className="profile-rating-guia">
                    <FaStar /> {currentGuide.calificacion.toFixed(1)} <small>({currentGuide.total_resenas} reseñas)</small>
                </div>
            </div>

            <nav className="sidebar-nav-guia">
                <div className="sidebar-group-label">PRINCIPAL</div>
                <button 
                    className={`nav-item-guia ${isActive('/guia') ? 'active' : ''}`} 
                    onClick={() => navigate('/guia')}
                >
                    <FaHome /> Dashboard
                </button>
                <button 
                    className={`nav-item-guia ${isActive('/guia/disponibilidad') ? 'active' : ''}`} 
                    onClick={() => navigate('/guia/disponibilidad')}
                >
                    <FaCalendarAlt /> Mi Disponibilidad
                </button>

                <div className="sidebar-group-label">MI ACTIVIDAD</div>
                <button 
                    className={`nav-item-guia ${isActive('/guia/mis-tours') ? 'active' : ''}`} 
                    onClick={() => navigate('/guia/mis-tours')}
                >
                    <FaMapMarkerAlt /> Mis Tours
                </button>
                <button 
                    className={`nav-item-guia ${isActive('/guia/reservas') ? 'active' : ''}`} 
                    onClick={() => navigate('/guia/reservas')}
                >
                    <FaUsers /> Reservas
                </button>

                <div className="sidebar-group-label">REPORTE Y VENTAS</div>
                <button 
                    className={`nav-item-guia ${isActive('/guia/ganancias') ? 'active' : ''}`} 
                    onClick={() => navigate('/guia/ganancias')}
                >
                    <FaCoins /> Ganancias
                </button>
                <button 
                    className={`nav-item-guia ${isActive('/guia/estadisticas') ? 'active' : ''}`} 
                    onClick={() => navigate('/guia/estadisticas')}
                >
                    <FaChartLine /> Estadísticas
                </button>
            </nav>
        </div>
    );
};

export default GuiaSidebar;
