import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import api from '../../../core/api';
// import { guiasMock, reservasMock } from '../../../core/mockData'; // Eliminado mock data
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';
import TourDrawer from '../../../components/TourDrawer';
import { tourosMock } from '../../../core/mockData';

const GuiaReservas = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('Todas');
    const [selectedTour, setSelectedTour] = useState(null);
    const [guideReservas, setGuideReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reservas/guia');
            const mapped = response.data.map(r => ({
                id: r.id_reserva,
                id_tour: r.id_tour,
                personas: r.cantidad_personas,
                estadoPago: r.estado_pago === 'COMPLETED' ? 'Pagado' : r.estado_reserva === 'Confirmada' ? 'Confirmada' : 'Pendiente',
                turista: `${r.turista_nombre} ${r.turista_apellido}`,
                tour: r.tour_nombre,
                fecha: new Date(r.fecha_actividad).toLocaleDateString(),
                total: parseFloat(r.total_pagado) || 0,
                asignada_a_mi: r.asignada_a_mi
            }));
            setGuideReservas(mapped);
        } catch (error) {
            console.error("Error fetching reservas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
    }, []);

    const handleConfirm = async (res) => {
        try {
            await api.post(`/tours/${res.id_tour}/assign`);
            alert('¡Tour asignado y confirmado exitosamente!');
            fetchReservas(); // Recargar datos
        } catch (error) {
            console.error("Error al confirmar tour:", error);
            alert(error.response?.data?.message || 'No se pudo confirmar el tour');
        }
    };

    const currentGuide = {
        nombre: user.primer_nombre || 'Guía',
        apellido: user.apellido_paterno || '',
        imagen: user.foto_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
        especialidad: user.descripcion_perfil || 'Especialista Ecoturismo',
        calificacion: 4.9,
    };

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const estados = ['Todas', 'Pagado', 'Pendiente', 'Cancelado', 'Disponibles'];
    const filtradas = filtroEstado === 'Todas'
        ? guideReservas
        : filtroEstado === 'Disponibles'
            ? guideReservas.filter(r => !r.asignada_a_mi)
            : guideReservas.filter(r => r.estadoPago === filtroEstado);

    const getStatusIcon = (estado) => {
        if (estado === 'Pagado') return <FaCheckCircle className="status-icon pagado" />;
        if (estado === 'Cancelado') return <FaTimesCircle className="status-icon cancelado" />;
        return <FaClock className="status-icon pendiente" />;
    };

    const handleVerDetalles = (res) => {
        const tourBase = tourosMock.find(t => t.nombre === res.tour) || {};
        const tourData = {
            ...tourBase,
            id_tour: res.id_tour,
            nombre: res.tour,
            ciudad_destino: tourBase.ciudad_destino || 'Ecuador',
            precio: res.total,
            calificacion: tourBase.calificacion || 4.8,
            resenas: tourBase.resenas || 12,
            duracion: tourBase.duracion || 'Full Day',
            isGuideView: true
        };
        setSelectedTour(tourData);
        setIsDrawerOpen(true);
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
                        <input type="text" placeholder="Buscar reservas..." className="search-input-guia" />
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
                    <button className="nav-item-guia active" onClick={() => navigate('/guia/reservas')}>
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
                        <h1 className="guia-title">📋 Reservas</h1>
                        <p className="guia-subtitle">Gestiona las reservas de tus tours</p>
                    </div>
                </div>

                {/* Resumen */}
                <section className="quick-stats-guia-section">
                    <div className="stat-card-guia primary">
                        <div className="stat-icon-guia">📋</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.length}</div>
                            <div className="stat-label-guia">Total Reservas</div>
                        </div>
                    </div>
                    <div className="stat-card-guia success">
                        <div className="stat-icon-guia">✅</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.filter(r => r.estadoPago === 'Pagado').length}</div>
                            <div className="stat-label-guia">Pagadas</div>
                        </div>
                    </div>
                    <div className="stat-card-guia warning">
                        <div className="stat-icon-guia">⏳</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.filter(r => r.estadoPago === 'Pendiente').length}</div>
                            <div className="stat-label-guia">Pendientes</div>
                        </div>
                    </div>
                    <div className="stat-card-guia info">
                        <div className="stat-icon-guia">❌</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.filter(r => r.estadoPago === 'Cancelado').length}</div>
                            <div className="stat-label-guia">Canceladas</div>
                        </div>
                    </div>
                </section>

                <section className="mis-tours-grid-section">
                    <div className="tours-filter-bar">
                        <div className="filter-stats">
                            {estados.map(e => (
                                <span
                                    key={e}
                                    className={`filter-stat ${filtroEstado === e ? 'active' : ''}`}
                                    onClick={() => setFiltroEstado(e)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {e}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="reservas-list-guia">
                        {filtradas.length > 0 ? filtradas.map((res) => (
                            <div key={res.id} className="reserva-card-guia">
                                <div className="reserva-info-guia">
                                    <div className="reserva-header">
                                        <span className="reserva-id">{res.id} - {res.personas} persona(s)</span>
                                        <span className={`reserva-status ${res.estadoPago.toLowerCase()}`}>
                                            {getStatusIcon(res.estadoPago)} {res.estadoPago}
                                        </span>
                                    </div>
                                    <p className="reserva-turista">{res.turista}</p>
                                    <p className="reserva-tour">{res.tour}</p>
                                    <p className="reserva-fecha">📅 {res.fecha}</p>
                                </div>
                                <div className="reserva-total">
                                    <span className="total-amount">${res.total}</span>
                                    <div className="reserva-guia-actions" style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-confirm" title="Ver detalles del tour" onClick={() => handleVerDetalles(res)} style={{ background: '#64748b' }}>Detalles</button>
                                        {!res.asignada_a_mi && (
                                            <button className="btn-confirm" onClick={() => handleConfirm(res)}>Confirmar</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="no-reservas-guia"><p>No hay reservas con este estado</p></div>
                        )}
                    </div>
                </section>
            </main>

            {/* ── Drawer de Detalles del Tour ── */}
            <TourDrawer
                tour={selectedTour}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onReserve={handleConfirm}
            />
        </div>
    );
};

export default GuiaReservas;
