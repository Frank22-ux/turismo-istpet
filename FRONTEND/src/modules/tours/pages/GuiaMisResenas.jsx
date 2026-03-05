import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import { guiasMock } from '../../../core/mockData';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSearch
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';

// Reseñas de muestra
const resenasMock = [
    { id: 1, nombre: 'María López', fecha: '15 Ene 2025', estrellas: 5, texto: 'Excelente guía, muy profesional y conocedor de cada lugar. Lo recomiendo ampliamente.', tour: 'Tour Cotopaxi Clásico', inicial: 'M' },
    { id: 2, nombre: 'Carlos Morales', fecha: '8 Feb 2025', estrellas: 4, texto: 'Muy buena experiencia, el guía fue muy atento. Los paisajes fueron increíbles.', tour: 'Tour Quilotoa', inicial: 'C' },
    { id: 3, nombre: 'Ana Fernández', fecha: '20 Feb 2025', estrellas: 5, texto: 'Increíble experiencia. El guía conoce cada detalle del lugar, muy recomendado.', tour: 'Tour Galápagos Express', inicial: 'A' },
    { id: 4, nombre: 'Roberto Silva', fecha: '5 Mar 2025', estrellas: 3, texto: 'La experiencia fue buena aunque hubiera preferido un ritmo más tranquilo.', tour: 'Tour Amazónico', inicial: 'R' },
    { id: 5, nombre: 'Sofía Castro', fecha: '12 Mar 2025', estrellas: 5, texto: 'Absolutamente maravilloso. El mejor tour que he tenido. ¡Gracias!', tour: 'Tour Cotopaxi Clásico', inicial: 'S' },
];

const GuiaMisResenas = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [filtroEstrellas, setFiltroEstrellas] = useState(0);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const baseGuide = guiasMock[0] || {};
    const currentGuide = {
        ...baseGuide,
        nombre: user.primer_nombre || baseGuide.nombre || 'Guía',
        apellido: user.apellido_paterno || baseGuide.apellido || '',
        imagen: user.foto_url || baseGuide.imagen,
    };

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const filtradas = filtroEstrellas === 0
        ? resenasMock
        : resenasMock.filter(r => r.estrellas === filtroEstrellas);

    const promedio = (resenasMock.reduce((s, r) => s + r.estrellas, 0) / resenasMock.length).toFixed(1);

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
                        <input type="text" placeholder="Buscar reseñas..." className="search-input-guia" />
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
                    <p className="profile-reviews-guia">({currentGuide.resenas} reseñas)</p>
                </div>
                <nav className="sidebar-nav-guia">
                    <button className="nav-item-guia" onClick={() => navigate('/guia')}><FaHome /> Dashboard</button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/mis-tours')}><FaCalendarAlt /> Mis Tours</button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/reservas')}><FaUsers /> Reservas</button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/ganancias')}><FaCoins /> Ganancias</button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/estadisticas')}><FaChartLine /> Estadísticas</button>
                </nav>
            </div>

            <main className="guia-main-content">
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">⭐ Mis Reseñas</h1>
                        <p className="guia-subtitle">Lo que opinan los turistas sobre ti</p>
                    </div>
                </div>

                {/* Resumen */}
                <section className="quick-stats-guia-section">
                    <div className="stat-card-guia primary">
                        <div className="stat-icon-guia">⭐</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{promedio}</div>
                            <div className="stat-label-guia">Calificación Promedio</div>
                        </div>
                    </div>
                    <div className="stat-card-guia success">
                        <div className="stat-icon-guia">💬</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{resenasMock.length}</div>
                            <div className="stat-label-guia">Total de Reseñas</div>
                        </div>
                    </div>
                    <div className="stat-card-guia info">
                        <div className="stat-icon-guia">🏆</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{resenasMock.filter(r => r.estrellas === 5).length}</div>
                            <div className="stat-label-guia">5 Estrellas</div>
                        </div>
                    </div>
                    <div className="stat-card-guia warning">
                        <div className="stat-icon-guia">👍</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{resenasMock.filter(r => r.estrellas >= 4).length}</div>
                            <div className="stat-label-guia">Positivas (4-5 ⭐)</div>
                        </div>
                    </div>
                </section>

                <section className="mis-tours-grid-section">
                    {/* Filtro por estrellas */}
                    <div className="tours-filter-bar">
                        <div className="filter-stats">
                            {[0, 5, 4, 3, 2, 1].map(n => (
                                <span
                                    key={n}
                                    className={`filter-stat ${filtroEstrellas === n ? 'active' : ''}`}
                                    onClick={() => setFiltroEstrellas(n)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {n === 0 ? 'Todas' : `${n} ⭐`}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Lista de reseñas */}
                    <div>
                        {filtradas.map(resena => (
                            <div key={resena.id} className="resena-card">
                                <div className="resena-header">
                                    <div className="resena-user">
                                        <div className="resena-avatar">{resena.inicial}</div>
                                        <div>
                                            <p className="resena-nombre">{resena.nombre}</p>
                                            <p className="resena-fecha-texto">{resena.fecha}</p>
                                        </div>
                                    </div>
                                    <div className="resena-stars">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FaStar key={i} style={{ color: i < resena.estrellas ? '#f59e0b' : '#e5e7eb' }} />
                                        ))}
                                    </div>
                                </div>
                                <p className="resena-texto">{resena.texto}</p>
                                <span className="resena-tour-tag">🗺️ {resena.tour}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default GuiaMisResenas;
