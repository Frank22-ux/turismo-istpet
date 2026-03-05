import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import api from '../../../core/api';
// import { guiasMock, tourosMock, reservasMock } from '../../../core/mockData'; // Eliminado mock data
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaTrophy, FaMapMarkerAlt, FaClock, FaUserCircle,
    FaEdit, FaCheckCircle, FaClock as FaClockIcon, FaEye, FaBell
} from 'react-icons/fa';
import './GuiaDashboard.css';
import TourDrawer from '../../../components/TourDrawer';

const GuiaDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const [guideTours, setGuideTours] = useState([]);
    const [guideReservas, setGuideReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTour, setSelectedTour] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleConfirm = async (res) => {
        try {
            const tourId = res.id_tour;
            await api.post(`/tours/${tourId}/assign`);
            alert('¡Tour asignado y confirmado exitosamente!');
            fetchData(); // Recargar datos
        } catch (error) {
            console.error("Error al confirmar tour:", error);
            alert(error.response?.data?.message || 'No se pudo confirmar el tour');
        }
    };

    const handleVerDetalles = (res) => {
        // En Dashboard, podemos recibir un tour o una reserva
        const isReserva = !!res.tour;
        const tourData = isReserva ? {
            id_tour: res.id_tour,
            nombre: res.tour,
            ciudad_destino: res.ciudad_destino || 'Ecuador',
            precio: res.total,
            isGuideView: true
        } : {
            ...res,
            isGuideView: true
        };
        setSelectedTour(tourData);
        setIsDrawerOpen(true);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [toursRes, reservasRes] = await Promise.all([
                api.get('/tours/mis-tours'),
                api.get('/reservas/guia')
            ]);

            setGuideTours(toursRes.data);

            // Mapeamos las reservas al formato esperado por la vista
            const mappedReservas = reservasRes.data.map(r => ({
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
            setGuideReservas(mappedReservas);
        } catch (error) {
            console.error("Error fetching guide data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutRequest();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            navigate('/login');
        }
    };

    // Cálculos basados en datos reales
    const totalGanancias = guideReservas
        .filter(r => r.estadoPago === 'Pagado' && r.asignada_a_mi)
        .reduce((sum, r) => sum + (r.total * 0.2), 0);

    const toursEstasMes = guideTours.length;
    const proximoTour = guideTours[0];

    const currentGuide = {
        nombre: user.primer_nombre || 'Guía',
        apellido: user.apellido_paterno || '',
        imagen: user.foto_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
        especialidad: user.descripcion_perfil || 'Especialista Ecoturismo',
        calificacion: 4.9,
        toursGuiados: guideTours.length,
        experiencia: 5,
        idiomas: ['Español', 'Inglés'],
        disponible: true
    };

    return (
        <div className="guia-layout">
            {/* NAVBAR */}
            <nav className="navbar-guia">
                <div className="nav-container-guia">
                    <div className="nav-logo-guia">
                        <img src="/uploads/logo.png" alt="Logo" className="logo-img-guia" style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }} />
                        <span className="logo-text-guia">ECORUT Travels</span>
                    </div>

                    <div className="nav-search-guia">
                        <FaUsers />
                        <input
                            type="text"
                            placeholder="Busca tus tours..."
                            className="search-input-guia"
                        />
                    </div>

                    <div className="nav-actions-guia">
                        <button className="nav-badge-guia">
                            <FaBell /> {guideReservas.length}
                        </button>
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

            {/* SIDEBAR */}
            <div className="guia-sidebar">
                <div className="sidebar-profile-guia">
                    <div className="profile-avatar-guia">
                        <img src={currentGuide.imagen} alt={currentGuide.nombre} />
                    </div>
                    <h3 className="profile-name-guia">{currentGuide.nombre} {currentGuide.apellido}</h3>
                    <p className="profile-specialty-guia">{currentGuide.especialidad}</p>
                    <div className="profile-rating-guia">
                        <FaStar /> {currentGuide.calificacion}
                    </div>
                </div>

                <nav className="sidebar-nav-guia">
                    <div className="sidebar-group-label">PRINCIPAL</div>
                    <button className="nav-item-guia active" onClick={() => navigate('/guia')}>
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
                    <button className="nav-item-guia" onClick={() => navigate('/guia/estadisticas')}>
                        <FaChartLine /> Estadísticas
                    </button>
                </nav>
            </div>

            {/* MAIN CONTENT */}
            <main className="guia-main-content">
                {/* HEADER */}
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">Bienvenido, {currentGuide.nombre}! 👋</h1>
                        <p className="guia-subtitle">Tu panel de control como guía profesional</p>
                    </div>
                    <button className="btn-availability" onClick={() => navigate('/guia/disponibilidad')}>
                        <FaCalendarAlt /> Establecer Disponibilidad
                    </button>
                </div>

                {/* QUICK STATS */}
                <section className="quick-stats-guia-section">
                    <div className="stat-card-guia primary">
                        <div className="stat-icon-guia">💰</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">${totalGanancias.toFixed(2)}</div>
                            <div className="stat-label-guia">Ganancias Este Mes</div>
                        </div>
                    </div>

                    <div className="stat-card-guia success">
                        <div className="stat-icon-guia">📅</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{toursEstasMes}</div>
                            <div className="stat-label-guia">Tours Este Mes</div>
                        </div>
                    </div>

                    <div className="stat-card-guia info">
                        <div className="stat-icon-guia">⭐</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{currentGuide.calificacion}</div>
                            <div className="stat-label-guia">Mi Calificación</div>
                        </div>
                    </div>

                    <div className="stat-card-guia warning">
                        <div className="stat-icon-guia">👥</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{currentGuide.toursGuiados}</div>
                            <div className="stat-label-guia">Tours Guiados</div>
                        </div>
                    </div>
                </section>

                {/* PRÓXIMO TOUR */}
                {proximoTour && (
                    <section className="next-tour-section">
                        <div className="section-header-guia">
                            <h2 className="section-title-guia">📍 Próximo Tour Programado</h2>
                        </div>
                        <div className="next-tour-card">
                            <div className="tour-info-left">
                                <h3>{proximoTour.nombre}</h3>
                                <div className="tour-detail-guia">
                                    <FaMapMarkerAlt /> {proximoTour.ciudad_destino}
                                </div>
                                <div className="tour-detail-guia">
                                    <FaClock /> {proximoTour.duracion}
                                </div>
                                <div className="tour-detail-guia">
                                    <FaUsers /> Máximo {proximoTour.maximo_personas} personas
                                </div>
                            </div>
                            <div className="tour-info-right">
                                <span className="tour-price-guia">${proximoTour.precio}</span>
                                <button className="btn-tour-action" onClick={() => handleVerDetalles(proximoTour)}>
                                    <FaEye /> Ver Detalles
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* MIS TOURS */}
                <section className="my-tours-section">
                    <div className="section-header-guia">
                        <h2 className="section-title-guia">🗺️ Mis Tours</h2>
                    </div>

                    <div className="tours-table-guia">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tour</th>
                                    <th>Ciudad</th>
                                    <th>Duración</th>
                                    <th>Precio</th>
                                    <th>Reservas</th>
                                    <th>Rating</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guideTours.map((tour) => (
                                    <tr key={tour.id_tour}>
                                        <td className="font-bold">{tour.nombre}</td>
                                        <td>{tour.ciudad_destino}</td>
                                        <td>{tour.duracion}</td>
                                        <td className="price-cell">${tour.precio}</td>
                                        <td className="badge-cell">
                                            <span className="badge">{Math.floor(Math.random() * 5) + 1}</span>
                                        </td>
                                        <td className="rating-cell">
                                            <FaStar /> {tour.calificacion}
                                        </td>
                                        <td className="actions-cell">
                                            <button className="btn-table-action btn-edit-guia" title="Editar">
                                                <FaEdit />
                                            </button>
                                            <button className="btn-table-action btn-view-guia" title="Ver" onClick={() => handleVerDetalles(tour)}>
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* RESERVAS RECIENTES */}
                <section className="recent-reservas-section">
                    <div className="section-header-guia">
                        <h2 className="section-title-guia">📋 Reservas Recientes</h2>
                    </div>

                    <div className="reservas-list-guia">
                        {guideReservas.length > 0 ? (
                            guideReservas.map((res) => (
                                <div key={res.id} className="reserva-card-guia">
                                    <div className="reserva-info-guia">
                                        <div className="reserva-header">
                                            {res.personas > 1 ? (
                                                <span className="reserva-id">{res.id} - {res.personas} personas</span>
                                            ) : (
                                                <span className="reserva-id">{res.id}</span>
                                            )}
                                            <span className={`reserva-status ${res.estadoPago.toLowerCase()}`}>
                                                {res.estadoPago} {res.asignada_a_mi ? '' : '(Disponible)'}
                                            </span>
                                        </div>
                                        <p className="reserva-turista">{res.turista}</p>
                                        <p className="reserva-tour">{res.tour}</p>
                                        <p className="reserva-fecha">📅 {res.fecha}</p>
                                    </div>
                                    <div className="reserva-total">
                                        <span className="total-amount">${res.total}</span>
                                        {!res.asignada_a_mi && (
                                            <button className="btn-confirm" onClick={() => handleConfirm(res)}>Confirmar</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-reservas-guia">
                                <p>No hay reservas por el momento</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ESTADÍSTICAS */}
                <section className="stats-section-guia">
                    <div className="section-header-guia">
                        <h2 className="section-title-guia">📊 Mis Estadísticas</h2>
                    </div>

                    <div className="stats-grid-guia">
                        <div className="stats-card-guia">
                            <div className="stats-card-header">
                                <h4>Experiencia</h4>
                                <span className="badge-experience">{currentGuide.experiencia} años</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress" style={{ width: `${(currentGuide.experiencia / 30) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="stats-card-guia">
                            <h4>Idiomas que Hablo</h4>
                            <div className="languages-list">
                                {currentGuide.idiomas.map((lang, idx) => (
                                    <span key={idx} className="lang-badge">{lang}</span>
                                ))}
                            </div>
                        </div>

                        <div className="stats-card-guia">
                            <h4>Especialidad</h4>
                            <p className="specialty-text">{currentGuide.especialidad}</p>
                        </div>

                        <div className="stats-card-guia">
                            <h4>Disponibilidad</h4>
                            <span className={`availability-badge ${currentGuide.disponible ? 'available' : 'unavailable'}`}>
                                {currentGuide.disponible ? '✓ Disponible' : '✗ No Disponible'}
                            </span>
                        </div>
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

export default GuiaDashboard;
