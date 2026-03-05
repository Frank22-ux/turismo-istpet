import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import { guiasMock, tourosMock, reservasMock } from '../../../core/mockData';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSearch, FaTrophy, FaMapMarkerAlt
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';

const GuiaEstadisticas = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const baseGuide = guiasMock[0] || {};
    const currentGuide = {
        ...baseGuide,
        nombre: user.primer_nombre || baseGuide.nombre || 'Guía',
        apellido: user.apellido_paterno || baseGuide.apellido || '',
        imagen: user.foto_url || baseGuide.imagen,
    };
    const guideTours = tourosMock.slice(0, 5);
    const guideReservas = reservasMock.filter(r =>
        r.guia === currentGuide.nombre + ' ' + currentGuide.apellido
    );

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const totalGanancias = guideReservas
        .filter(r => r.estadoPago === 'Pagado')
        .reduce((sum, r) => sum + (r.total * 0.2), 0);

    const tasaConversion = guideReservas.length > 0
        ? ((guideReservas.filter(r => r.estadoPago === 'Pagado').length / guideReservas.length) * 100).toFixed(0)
        : 0;

    return (
        <div className="guia-layout">
            <nav className="navbar-guia">
                <div className="nav-container-guia">
                    <div className="nav-logo-guia">
                        <img src="/uploads/logo.png" alt="Logo" className="logo-img-guia" style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }} />
                        <span className="logo-text-guia">ECRUT Travels</span>
                    </div>
                    <div className="nav-search-guia">
                        <FaSearch />
                        <input type="text" placeholder="Buscar..." className="search-input-guia" />
                    </div>
                    <div className="nav-actions-guia">
                        <button className="nav-badge-guia"><FaBell /> {guideReservas.length}</button>
                        <div className="user-menu-container-guia">
                            <button className="btn-user-menu-guia" onClick={() => setShowUserMenu(!showUserMenu)}>
                                <FaUserCircle /> {currentGuide.nombre}
                            </button>
                            {showUserMenu && (
                                <div className="dropdown-menu-guia">
                                    <button className="menu-item-guia" onClick={() => { setShowUserMenu(false); navigate('/guia/editar-perfil'); }}><FaEdit /> Editar Perfil</button>
                                    <button className="menu-item-guia" onClick={() => { setShowUserMenu(false); navigate('/guia/disponibilidad'); }}><FaCalendarAlt /> Mi Disponibilidad</button>
                                    <button className="menu-item-guia" onClick={() => { setShowUserMenu(false); navigate('/guia/mis-resenas'); }}><FaStar /> Mis Reseñas</button>
                                    <hr />
                                    <button onClick={handleLogout} className="menu-item-guia logout-guia"><FaSignOutAlt /> Cerrar Sesión</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="guia-sidebar">
                <div className="sidebar-profile-guia">
                    <div className="profile-avatar-guia">
                        <img src={currentGuide.imagen} alt={currentGuide.nombre} />
                    </div>
                    <h3 className="profile-name-guia">{currentGuide.nombre} {currentGuide.apellido}</h3>
                    <p className="profile-specialty-guia">{currentGuide.especialidad}</p>
                    <div className="profile-rating-guia"><FaStar /> {currentGuide.calificacion}</div>
                </div>
                <nav className="sidebar-nav-guia">
                    <div className="sidebar-group-label">PRINCIPAL</div>
                    <button className="nav-item-guia" onClick={() => navigate('/guia')}>
                        <FaHome /> Dashboard
                    </button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/disponibilidad')}>
                        <FaCalendarAlt /> Mi Disponibilidad
                    </button>

                    <div className="sidebar-group-label">MI ACTIVIDAD</div>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/mis-tours')}>
                        <FaMapMarkerAlt /> Mis Tours
                    </button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/reservas')}>
                        <FaUsers /> Reservas
                    </button>

                    <div className="sidebar-group-label">REPORTE Y VENTAS</div>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/ganancias')}>
                        <FaCoins /> Ganancias
                    </button>
                    <button className="nav-item-guia active" onClick={() => navigate('/guia/estadisticas')}>
                        <FaChartLine /> Estadísticas
                    </button>
                </nav>
            </div>

            <main className="guia-main-content">
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">📊 Estadísticas</h1>
                        <p className="guia-subtitle">Tu rendimiento como guía profesional</p>
                    </div>
                </div>

                {/* KPIs */}
                <section className="quick-stats-guia-section">
                    <div className="stat-card-guia primary">
                        <div className="stat-icon-guia"><FaTrophy /></div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{currentGuide.toursGuiados}</div>
                            <div className="stat-label-guia">Tours Completados</div>
                        </div>
                    </div>
                    <div className="stat-card-guia success">
                        <div className="stat-icon-guia">⭐</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{currentGuide.calificacion}</div>
                            <div className="stat-label-guia">Calificación Promedio</div>
                        </div>
                    </div>
                    <div className="stat-card-guia info">
                        <div className="stat-icon-guia">%</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{tasaConversion}%</div>
                            <div className="stat-label-guia">Tasa de Éxito</div>
                        </div>
                    </div>
                    <div className="stat-card-guia warning">
                        <div className="stat-icon-guia">💰</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">${totalGanancias.toFixed(0)}</div>
                            <div className="stat-label-guia">Ganancias Totales</div>
                        </div>
                    </div>
                </section>

                {/* Stats cards */}
                <section className="stats-section-guia">
                    <div className="section-header-guia">
                        <h2 className="section-title-guia">📈 Detalle de Rendimiento</h2>
                    </div>
                    <div className="stats-grid-guia">
                        <div className="stats-card-guia">
                            <div className="stats-card-header">
                                <h4>Años de Experiencia</h4>
                                <span className="badge-experience">{currentGuide.experiencia} años</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress" style={{ width: `${(currentGuide.experiencia / 30) * 100}%` }}></div>
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                {Math.round((currentGuide.experiencia / 30) * 100)}% hacia el máximo
                            </p>
                        </div>

                        <div className="stats-card-guia">
                            <h4>Idiomas</h4>
                            <div className="languages-list">
                                {currentGuide.idiomas.map((lang, idx) => (
                                    <span key={idx} className="lang-badge">{lang}</span>
                                ))}
                            </div>
                        </div>

                        <div className="stats-card-guia">
                            <h4>Popularidad de Tours</h4>
                            {guideTours.slice(0, 3).map((tour, idx) => (
                                <div key={tour.id_tour} style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                        <span>{tour.nombre?.substring(0, 25)}...</span>
                                        <span>${tour.precio}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress" style={{ width: `${(3 - idx) * 30}%`, background: idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#f59e0b' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="stats-card-guia">
                            <h4>Disponibilidad</h4>
                            <span className={`availability-badge ${currentGuide.disponible ? 'available' : 'unavailable'}`}>
                                {currentGuide.disponible ? '✓ Disponible' : '✗ No Disponible'}
                            </span>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>
                                Especialidad: <strong>{currentGuide.especialidad}</strong>
                            </p>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                Reseñas: <strong>{currentGuide.resenas}</strong>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default GuiaEstadisticas;
