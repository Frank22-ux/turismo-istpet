import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import { guiasMock, reservasMock } from '../../../core/mockData';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSearch, FaArrowUp, FaMoneyBillWave, FaMapMarkerAlt
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';

const GuiaGanancias = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [periodo, setPeriodo] = useState('mes');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const baseGuide = guiasMock[0] || {};
    const currentGuide = {
        ...baseGuide,
        nombre: user.primer_nombre || baseGuide.nombre || 'Guía',
        apellido: user.apellido_paterno || baseGuide.apellido || '',
        imagen: user.foto_url || baseGuide.imagen,
    };
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

    const totalBruto = guideReservas
        .filter(r => r.estadoPago === 'Pagado')
        .reduce((sum, r) => sum + r.total, 0);

    const pendiente = guideReservas
        .filter(r => r.estadoPago === 'Pendiente')
        .reduce((sum, r) => sum + (r.total * 0.2), 0);

    // Filtrar reservas por periodo para el historial
    const guideReservasPeriodo = guideReservas.filter(r => {
        if (periodo === 'año') return true; // Mostrar todas para año
        if (periodo === 'mes') {
            // Simulación: mostrar las últimas 5 para mes
            return guideReservas.indexOf(r) < 5;
        }
        if (periodo === 'semana') {
            // Simulación: mostrar las últimas 2 para semana
            return guideReservas.indexOf(r) < 2;
        }
        return true;
    });

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
                    <button className="nav-item-guia active" onClick={() => navigate('/guia/ganancias')}>
                        <FaCoins /> Ganancias
                    </button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/estadisticas')}>
                        <FaChartLine /> Estadísticas
                    </button>
                </nav>
            </div>

            <main className="guia-main-content">
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">💰 Ganancias</h1>
                        <p className="guia-subtitle">Resumen de tus ingresos como guía</p>
                    </div>
                    <div className="period-selector">
                        {['semana', 'mes', 'año'].map(p => (
                            <button
                                key={p}
                                className={`period-btn ${periodo === p ? 'active' : ''}`}
                                onClick={() => setPeriodo(p)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    marginLeft: '8px',
                                    cursor: 'pointer',
                                    background: periodo === p ? '#10b981' : '#f3f4f6',
                                    color: periodo === p ? '#fff' : '#374151',
                                    fontWeight: periodo === p ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats principales */}
                <section className="quick-stats-guia-section">
                    <div className="stat-card-guia primary">
                        <div className="stat-icon-guia">💰</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">${totalGanancias.toFixed(2)}</div>
                            <div className="stat-label-guia">Mis Ganancias (20%)</div>
                        </div>
                    </div>
                    <div className="stat-card-guia success">
                        <div className="stat-icon-guia"><FaArrowUp /></div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">${totalBruto.toFixed(2)}</div>
                            <div className="stat-label-guia">Ventas Totales</div>
                        </div>
                    </div>
                    <div className="stat-card-guia warning">
                        <div className="stat-icon-guia"><FaMoneyBillWave /></div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">${pendiente.toFixed(2)}</div>
                            <div className="stat-label-guia">Por Cobrar</div>
                        </div>
                    </div>
                    <div className="stat-card-guia info">
                        <div className="stat-icon-guia">📈</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.filter(r => r.estadoPago === 'Pagado').length}</div>
                            <div className="stat-label-guia">Reservas Cobradas</div>
                        </div>
                    </div>
                </section>

                {/* Historial de transacciones */}
                <section className="mis-tours-grid-section">
                    <div className="section-header-guia">
                        <h2 className="section-title-guia">📄 Historial de Transacciones</h2>
                    </div>
                    <div className="tours-table-guia">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Reserva</th>
                                    <th>Turista</th>
                                    <th>Tour</th>
                                    <th>Fecha</th>
                                    <th>Total Venta</th>
                                    <th>Mi Comisión (20%)</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guideReservasPeriodo.map(res => (
                                    <tr key={res.id}>
                                        <td className="font-bold">{res.id}</td>
                                        <td>{res.turista}</td>
                                        <td>{res.tour}</td>
                                        <td>{res.fecha}</td>
                                        <td className="price-cell">${res.total}</td>
                                        <td className="price-cell">${(res.total * 0.2).toFixed(2)}</td>
                                        <td className="badge-cell">
                                            <span className={`reserva-status ${res.estadoPago.toLowerCase()}`}>{res.estadoPago}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default GuiaGanancias;
