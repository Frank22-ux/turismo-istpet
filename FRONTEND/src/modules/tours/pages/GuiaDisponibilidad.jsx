import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import { guiasMock } from '../../../core/mockData';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSave, FaSearch, FaCheck, FaMapMarkerAlt
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const GuiaDisponibilidad = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [saved, setSaved] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const baseGuide = guiasMock[0] || {};
    const currentGuide = {
        ...baseGuide,
        nombre: user.primer_nombre || baseGuide.nombre || 'Guía',
        apellido: user.apellido_paterno || baseGuide.apellido || '',
        imagen: user.foto_url || baseGuide.imagen,
    };

    const [diasActivos, setDiasActivos] = useState(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
    const [horaInicio, setHoraInicio] = useState('08:00');
    const [horaFin, setHoraFin] = useState('18:00');
    const [disponible, setDisponible] = useState(currentGuide.disponible !== false);

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const toggleDia = (dia) => {
        setDiasActivos(prev =>
            prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
        );
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

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
                        <button className="nav-badge-guia"><FaBell /> 3</button>
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
                    <button className="nav-item-guia active" onClick={() => navigate('/guia/disponibilidad')}>
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
                    <button className="nav-item-guia" onClick={() => navigate('/guia/estadisticas')}>
                        <FaChartLine /> Estadísticas
                    </button>
                </nav>
            </div>

            <main className="guia-main-content">
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">📅 Mi Disponibilidad</h1>
                        <p className="guia-subtitle">Configura tus días y horarios de trabajo</p>
                    </div>
                    {saved && (
                        <div style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '10px 20px', fontWeight: '600' }}>
                            ✅ ¡Disponibilidad guardada!
                        </div>
                    )}
                </div>

                {/* Estado general */}
                <div className="perfil-form-section">
                    <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: '16px', fontWeight: '700' }}>
                        🟢 Estado de Disponibilidad
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: '600', color: '#374151', fontSize: '15px' }}>
                            Estás actualmente:
                        </span>
                        <button
                            onClick={() => setDisponible(!disponible)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '24px',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                background: disponible ? '#10b981' : '#ef4444',
                                color: '#fff',
                                transition: 'all 0.2s'
                            }}
                        >
                            {disponible ? '✓ Disponible' : '✗ No Disponible'}
                        </button>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                            Haz clic para cambiar tu estado
                        </span>
                    </div>
                </div>

                {/* Días de disponibilidad */}
                <div className="perfil-form-section">
                    <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: '16px', fontWeight: '700' }}>
                        📆 Días Disponibles
                    </h3>
                    <div className="dias-grid">
                        {DIAS.map(dia => (
                            <div
                                key={dia}
                                className={`dia-card ${diasActivos.includes(dia) ? 'activo' : ''}`}
                                onClick={() => toggleDia(dia)}
                            >
                                <span className="dia-nombre">{dia.substring(0, 3)}</span>
                                <div className="dia-check">
                                    {diasActivos.includes(dia) ? <FaCheck size={10} /> : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
                        Días seleccionados: {diasActivos.join(', ')}
                    </p>
                </div>

                {/* Horario */}
                <div className="perfil-form-section">
                    <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: '16px', fontWeight: '700' }}>
                        🕐 Horario de Trabajo
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '400px' }}>
                        <div className="form-group-guia">
                            <label>Hora de Inicio</label>
                            <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
                        </div>
                        <div className="form-group-guia">
                            <label>Hora de Fin</label>
                            <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-save-guia" onClick={handleSave}>
                        <FaSave /> Guardar Disponibilidad
                    </button>
                </div>
            </main>
        </div>
    );
};

export default GuiaDisponibilidad;
