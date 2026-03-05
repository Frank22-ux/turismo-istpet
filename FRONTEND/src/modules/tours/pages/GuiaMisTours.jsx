import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import api from '../../../core/api';
// import { guiasMock, tourosMock } from '../../../core/mockData'; // Eliminado mock data
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaEye, FaUserCircle, FaBell, FaPlus, FaSearch, FaMapMarkerAlt, FaClock
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';
import TourDrawer from '../../../components/TourDrawer';

const GuiaMisTours = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTour, setSelectedTour] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [filterStatus, setFilterStatus] = useState('Todos');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [guideTours, setGuideTours] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMisTours = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tours/mis-tours');
            setGuideTours(response.data);
        } catch (error) {
            console.error("Error fetching guide tours:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMisTours();
    }, []);

    const currentGuide = {
        nombre: user.primer_nombre || 'Guía',
        apellido: user.apellido_paterno || '',
        imagen: user.foto_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
        especialidad: user.descripcion_perfil || 'Especialista Ecoturismo',
        calificacion: 4.9,
    };

    const handleLogout = async () => {
        try {
            await logoutRequest();
            navigate('/login');
        } catch (error) {
            navigate('/login');
        }
    };

    const handleVerDetalles = (tour) => {
        setSelectedTour({ ...tour, isGuideView: true });
        setIsDrawerOpen(true);
    };

    const filteredTours = guideTours.filter(tour => {
        const matchesSearch = tour.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tour.ciudad_destino?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'Todos') return matchesSearch;
        const isActive = tour.id_tour % 2 === 0; // Simulated active status
        if (filterStatus === 'Activos') return matchesSearch && isActive;
        if (filterStatus === 'Inactivos') return matchesSearch && !isActive;
        return matchesSearch;
    });

    return (
        <div className="guia-layout">
            {/* NAVBAR */}
            <nav className="navbar-guia">
                <div className="nav-container-guia">
                    <div className="nav-logo-guia">
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
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="nav-actions-guia">
                        <button className="nav-badge-guia"><FaBell /> 3</button>
                        <div className="user-menu-container-guia">
                            <button className="btn-user-menu-guia" onClick={() => setShowUserMenu(!showUserMenu)}>
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

            {/* SIDEBAR */}
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
                    <button className="nav-item-guia active" onClick={() => navigate('/guia/mis-tours')}>
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

            {/* MAIN */}
            <main className="guia-main-content">
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">🗺️ Mis Tours</h1>
                        <p className="guia-subtitle">Gestiona todos tus tours disponibles</p>
                    </div>
                </div>

                <section className="mis-tours-grid-section">
                    <div className="tours-filter-bar">
                        <div className="filter-stats">
                            <span className={`filter-stat ${filterStatus === 'Todos' ? 'active' : ''}`} onClick={() => setFilterStatus('Todos')}>Todos ({guideTours.length})</span>
                            <span className={`filter-stat ${filterStatus === 'Activos' ? 'active' : ''}`} onClick={() => setFilterStatus('Activos')}>Activos</span>
                            <span className={`filter-stat ${filterStatus === 'Inactivos' ? 'active' : ''}`} onClick={() => setFilterStatus('Inactivos')}>Inactivos</span>
                        </div>
                    </div>

                    <div className="tours-cards-grid">
                        {filteredTours.map((tour) => (
                            <div key={tour.id_tour} className="tour-card-guia">
                                <div className="tour-card-img">
                                    {tour.imagen_portada ? (
                                        <img src={`http://localhost:4000${tour.imagen_portada}`} alt={tour.nombre} />
                                    ) : (
                                        <div className="tour-card-placeholder">🗺️</div>
                                    )}
                                    <span className="tour-card-badge activo">
                                        Activo
                                    </span>
                                </div>
                                <div className="tour-card-body">
                                    <h3 className="tour-card-title">{tour.nombre}</h3>
                                    <div className="tour-card-info">
                                        <span><FaMapMarkerAlt /> {tour.ciudad_destino}</span>
                                        <span><FaClock /> {tour.duracion}</span>
                                        <span><FaUsers /> Máx. {tour.maximo_personas}</span>
                                    </div>
                                    <div className="tour-card-footer">
                                        <span className="tour-card-price">${tour.precio}</span>
                                        <div className="tour-card-actions">
                                            <button className="btn-table-action btn-edit-guia" title="Editar"><FaEdit /></button>
                                            <button className="btn-table-action btn-view-guia" title="Ver detalles" onClick={() => handleVerDetalles(tour)}><FaEye /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* ── Drawer de Detalles del Tour ── */}
            <TourDrawer
                tour={selectedTour}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onReserve={(t) => console.log('Editando desde Drawer (puedes añadir esta lógica si gustas):', t)}
            />
        </div>
    );
};

export default GuiaMisTours;
