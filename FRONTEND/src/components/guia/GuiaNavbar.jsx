import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaCalendarAlt, FaStar, FaSignOutAlt, FaBell, FaSearch } from 'react-icons/fa';
import { logoutRequest } from '../../modules/auth/services/auth.service';

const API_URL = 'http://localhost:4000';

const GuiaNavbar = ({ currentGuide, notificationsCount = 0, onSearch, reservations = [] }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (onSearch) onSearch(val);
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

    return (
        <nav className="navbar-guia">
            <div className="nav-container-guia">
                <div className="nav-logo-guia" onClick={() => navigate('/guia')} style={{ cursor: 'pointer' }}>
                    <img src="/uploads/logo.png" alt="Logo" className="logo-img-guia" style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }} />
                    <span className="logo-text-guia">ECRUT Travels</span>
                </div>

                <div className="nav-search-guia">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Busca tus tours..."
                        className="search-input-guia"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="nav-actions-guia">
                    <div className="notifications-container-guia">
                        <button 
                            className="nav-badge-guia"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <FaBell /> {reservations.length > 0 && <span>{reservations.length}</span>}
                        </button>
                        
                        {showNotifications && (
                            <div className="notifications-dropdown-guia">
                                <div className="notifications-header">
                                    <h4>Notificaciones</h4>
                                </div>
                                <div className="notifications-body">
                                    {reservations.length > 0 ? (
                                        reservations.slice(0, 5).map((res, idx) => (
                                            <div key={idx} className="notification-item">
                                                <p>Nuevo tour reservado: <strong>{res.tour || 'Tour'}</strong> por <strong>{res.turista || 'Turista'}</strong></p>
                                                <span>{res.fecha}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="notification-empty">No hay nuevas reservas</div>
                                    )}
                                </div>
                                <div className="notifications-footer" onClick={() => navigate('/guia/reservas')}>
                                    Ver todas las reservas
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="user-menu-container-guia">
                        <button
                            className="btn-user-menu-guia"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <FaUserCircle /> {currentGuide.nombre}
                        </button>
                        {showUserMenu && (
                            <div className="dropdown-menu-guia">
                                <button className="menu-item-guia" onClick={() => { setShowUserMenu(false); navigate('/guia/editar-perfil'); }}>
                                    <FaEdit /> Editar Perfil
                                </button>
                                <button className="menu-item-guia" onClick={() => { setShowUserMenu(false); navigate('/guia/disponibilidad'); }}>
                                    <FaCalendarAlt /> Mi Disponibilidad
                                </button>
                                <button className="menu-item-guia" onClick={() => { setShowUserMenu(false); navigate('/guia/mis-resenas'); }}>
                                    <FaStar /> Mis Reseñas
                                </button>
                                <hr />
                                <button onClick={handleLogout} className="menu-item-guia logout-guia">
                                    <FaSignOutAlt /> Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default GuiaNavbar;
