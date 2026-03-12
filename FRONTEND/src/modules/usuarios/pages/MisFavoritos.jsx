import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logoutRequest } from '../../auth/services/auth.service';
import api from '../../../core/api';
// import { tourosMock } from '../../../core/mockData'; // Eliminado mock data
import {
    FaArrowLeft, FaArrowRight, FaHeart, FaMapMarkerAlt, FaClock, FaUsers, FaStar,
    FaSearch, FaFilter, FaTrash, FaEye, FaUserCircle, FaSuitcase,
    FaSignOutAlt, FaUserEdit, FaChevronDown, FaTimes, FaCalendarAlt
} from 'react-icons/fa';
import './TuristaPages.css';
import './TuristaDashboard.css';
import TourDrawer from '../../../components/TourDrawer';
import ReservationDrawer from '../../../components/ReservationDrawer';
import PaymentDrawer from '../../../components/PaymentDrawer';

const MisFavoritos = () => {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState('todos');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Estados para Drawers y Selección
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [pendingReservation, setPendingReservation] = useState(null);

    const [favTours, setFavTours] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [favIds, setFavIds] = useState(tourosMock.slice(0, 6).map(t => t.id_tour)); // Eliminado mock initialization
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchFavoritos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/favoritos');
            // Mapeamos los datos del backend al formato esperado por la vista
            const mapped = response.data.map(f => {
                let imgUrl = `https://images.unsplash.com/photo-1551854304-25049c10e254?w=500&q=70&sig=${f.id_tour || f.id_hotel}`;
                
                if (f.id_tour && f.tour_img) {
                    imgUrl = `http://localhost:4000${f.tour_img}`;
                } else if (f.id_hotel && f.hotel_fotos) {
                    try {
                        const galeria = typeof f.hotel_fotos === 'string' ? JSON.parse(f.hotel_fotos) : f.hotel_fotos;
                        if (Array.isArray(galeria) && galeria.length > 0) {
                            imgUrl = `http://localhost:4000${galeria[0]}`;
                        }
                    } catch (e) {
                        console.error("Error parsing hotel photos:", e);
                    }
                }

                return {
                    id_tour: f.id_tour,
                    id_hotel: f.id_hotel,
                    nombre: f.tour_nombre || f.hotel_nombre,
                    precio: f.tour_precio || f.hotel_precio || 0,
                    imagen: imgUrl,
                    calificacion: f.tour_calificacion || f.hotel_estrellas || 4.5,
                    resenas: f.tour_resenas || 10,
                    duracion: f.tour_duracion || '1 día',
                    maximo_personas: f.maximo_personas || 15,
                    dificultad: f.dificultad || (f.id_hotel ? 'Hotel' : 'Moderada'),
                    ciudad_destino: f.ciudad_destino || f.hotel_ciudad || 'Ecuador',
                    categoria: f.categoria || 'Hospedaje',
                    es_hotel: !!f.id_hotel
                };
            });
            setFavTours(mapped);
        } catch (error) {
            console.error("Error fetching favoritos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavoritos();
    }, []);

    const handleVerDetalles = (tour) => {
        setSelectedTour(tour);
        setIsDrawerOpen(true);
    };

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const handleOpenReservation = (tour) => {
        setSelectedTour(tour);
        setIsReservationOpen(true);
    };

    const handleConfirmReservation = (resData) => {
        setPendingReservation(resData);
        setIsReservationOpen(false);
        setIsPaymentOpen(true);
    };

    const handlePaymentSuccess = (paymentInfo) => {
        console.log('Pago desde favoritos confirmado:', paymentInfo);
        setIsPaymentOpen(false);
        alert('¡Reserva completada con éxito!');
    };

    const quitarFavorito = async (id, idHotel = null) => {
        try {
            const payload = idHotel ? { id_hotel: id } : { id_tour: id };
            await api.delete('/favoritos', { data: payload });
            setFavTours(prev => prev.filter(f => (f.id_tour !== id && f.id_hotel !== id)));
        } catch (error) {
            console.error("Error al quitar favorito:", error);
            alert("No se pudo quitar de favoritos");
        }
    };

    // const favTours = tourosMock.filter(t => favIds.includes(t.id_tour)); // Usamos el estado favTours directamente

    const filtrados = favTours.filter(t => {
        const matchBusqueda = t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            t.ciudad_destino.toLowerCase().includes(busqueda.toLowerCase());
        if (filtro === 'mejor-valorados') return matchBusqueda && t.calificacion >= 4.8;
        if (filtro === 'precio-menor') return matchBusqueda;
        return matchBusqueda;
    }).sort((a, b) => {
        if (filtro === 'precio-menor') return a.precio - b.precio;
        if (filtro === 'precio-mayor') return b.precio - a.precio;
        return b.calificacion - a.calificacion;
    });

    return (
        <div className="turista-page-layout">
            {/* ── Navbar ── */}
            <nav className="navbar-turista">
                <div className="nav-inner">
                    <div className="nav-logo" onClick={() => navigate('/home')}>
                        <img src="/uploads/logo.png" alt="ECRUT" />
                        <span>ECRUT Travels</span>
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/home">Inicio</Link></li>
                        <li><a href="#destinos">Destinos</a></li>
                        <li><a href="#tours">Tours</a></li>
                        <li><a href="#hoteles">Hoteles</a></li>
                    </ul>
                    <div className="nav-right">
                        <div className="user-menu-wrap">
                            <button className="nav-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                                <FaUserCircle />
                                <span className="nav-username">{user.username || 'Mi cuenta'}</span>
                                <FaChevronDown className="nav-chevron" />
                            </button>
                            {showUserMenu && (
                                <div className="user-dropdown" onClick={() => setShowUserMenu(false)}>
                                    <Link to="/perfil-turista" className="drop-item"><FaUserEdit /> Mi Perfil</Link>
                                    <Link to="/mis-reservas" className="drop-item"><FaSuitcase /> Mis Reservas</Link>
                                    <Link to="/mis-favoritos" className="drop-item drop-active"><FaHeart /> Mis Favoritos</Link>
                                    <hr className="drop-divider" />
                                    <button onClick={handleLogout} className="drop-item drop-logout"><FaSignOutAlt /> Cerrar Sesión</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Hero mini ── */}
            <div className="page-hero-mini favoritos-hero">
                <div className="page-hero-overlay" />
                <div className="page-hero-content">
                    <button className="btn-back-hero" onClick={() => navigate('/home')}>
                        <FaArrowLeft /> Volver al inicio
                    </button>
                    <h1 className="page-hero-title"><FaHeart /> Mis Favoritos</h1>
                    <p className="page-hero-sub">Los tours que guardaste para tu próxima aventura</p>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="page-stats-bar">
                <div className="page-stats-wrap">
                    <div className="pstat-card">
                        <span className="pstat-icon" style={{ background: '#fee2e2' }}>❤️</span>
                        <div><p className="pstat-num">{favTours.length}</p><p className="pstat-lbl">Tours guardados</p></div>
                    </div>
                    <div className="pstat-card">
                        <span className="pstat-icon" style={{ background: '#fef3c7' }}>⭐</span>
                        <div>
                            <p className="pstat-num">
                                {favTours.length > 0 ? (favTours.reduce((s, t) => s + t.calificacion, 0) / favTours.length).toFixed(1) : '—'}
                            </p>
                            <p className="pstat-lbl">Rating promedio</p>
                        </div>
                    </div>
                    <div className="pstat-card">
                        <span className="pstat-icon" style={{ background: '#d1fae5' }}>💵</span>
                        <div>
                            <p className="pstat-num">
                                ${favTours.length > 0 ? Math.min(...favTours.map(t => t.precio)) : 0}
                            </p>
                            <p className="pstat-lbl">Precio mínimo</p>
                        </div>
                    </div>
                    <div className="pstat-card">
                        <span className="pstat-icon" style={{ background: '#e0f7fa' }}>🗺️</span>
                        <div>
                            <p className="pstat-num">{new Set(favTours.map(t => t.ciudad_destino)).size}</p>
                            <p className="pstat-lbl">Ciudades distintas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Contenido ── */}
            <div className="page-content-wrap">

                {/* Barra de filtros */}
                <div className="page-filter-bar">
                    <div className="page-search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Buscar en mis favoritos..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                        {busqueda && (
                            <button className="clear-search" onClick={() => setBusqueda('')}><FaTimes /></button>
                        )}
                    </div>
                    <div className="estado-pills">
                        {[
                            { key: 'todos', label: 'Todos' },
                            { key: 'mejor-valorados', label: '⭐ Mejor valorados' },
                            { key: 'precio-menor', label: '💰 Precio ↑' },
                            { key: 'precio-mayor', label: '💰 Precio ↓' },
                        ].map(f => (
                            <button
                                key={f.key}
                                className={`estado-pill ${filtro === f.key ? 'active' : ''}`}
                                onClick={() => setFiltro(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de favoritos */}
                {filtrados.length === 0 ? (
                    <div className="empty-state">
                        {favTours.length === 0 ? (
                            <>
                                <span>💔</span>
                                <h3>No tienes favoritos aún</h3>
                                <p>Explora nuestros tours y guarda los que más te gusten con el botón ❤️</p>
                                <button onClick={() => navigate('/home')} className="btn-empty-reset">
                                    Explorar tours
                                </button>
                            </>
                        ) : (
                            <>
                                <span>🔍</span>
                                <h3>Sin resultados</h3>
                                <p>No hay favoritos que coincidan con tu búsqueda</p>
                                <button onClick={() => setBusqueda('')} className="btn-empty-reset">
                                    Limpiar búsqueda
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="tours-grid">
                        {filtrados.map(tour => (
                            <div key={tour.id_tour || tour.id_hotel} className="tour-card">
                                <div className="tour-card-img">
                                    <img
                                        src={tour.imagen}
                                        alt={tour.nombre}
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80'; }}
                                    />
                                    <span className="tour-dificultad" style={{ background: tour.es_hotel ? 'var(--ocean)' : 'rgba(0,0,0,0.55)' }}>
                                        {tour.dificultad}
                                    </span>
                                    <button className="btn-fav fav-on" onClick={() => quitarFavorito(tour.id_tour, tour.id_hotel)} title="Quitar de favoritos">
                                        <FaHeart />
                                    </button>
                                    <div className="tour-precio-badge">${tour.precio}</div>
                                </div>
                                <div className="tour-card-body">
                                    <div className="tour-rating-row">
                                        <span className="tour-stars">{'⭐'.repeat(Math.round(tour.calificacion || 0))}</span>
                                        <span className="tour-rating-num">{tour.calificacion} <small>({tour.resenas} reseñas)</small></span>
                                    </div>
                                    <h3 className="tour-nombre">{tour.nombre}</h3>
                                    <p className="tour-loc"><FaMapMarkerAlt /> {tour.ciudad_destino}</p>
                                    <div className="tour-meta-row">
                                        <span><FaClock /> {tour.duracion}</span>
                                        <span><FaUsers /> {tour.es_hotel ? 'Check-in' : `Máx. ${tour.maximo_personas}`}</span>
                                    </div>
                                    <div className="tour-card-footer">
                                        <div>
                                            <p className="tour-desde">Categoría</p>
                                            <p className="tour-price-small" style={{ color: 'var(--ocean)', fontWeight: 700, fontSize: '12px' }}>{tour.categoria}</p>
                                        </div>
                                        <div className="tour-actions-flex">
                                            <button className="btn-reservar" onClick={() => handleVerDetalles(tour)}>Ver detalles</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Footer mini ── */}
            <footer className="footer-mini">
                <p>© 2026 ECRUT Travels · <a href="#c">Contacto</a> · <a href="#p">Privacidad</a></p>
            </footer>

            {/* ── Drawers de flujo de reserva ── */}
            <TourDrawer
                tour={selectedTour}
                isOpen={isDrawerOpen}
                isFavorite={selectedTour && favTours.some(f => f.id_tour === (selectedTour.id_tour || selectedTour.id))}
                onToggleFavorite={(id) => quitarFavorito(id, selectedTour?.id_hotel)}
                onClose={() => setIsDrawerOpen(false)}
                onReserve={(t) => {
                    setIsDrawerOpen(false);
                    handleOpenReservation(t);
                }}
            />

            <ReservationDrawer
                tour={selectedTour}
                isOpen={isReservationOpen}
                onClose={() => setIsReservationOpen(false)}
                onConfirm={handleConfirmReservation}
            />

            <PaymentDrawer
                reservation={pendingReservation}
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default MisFavoritos;
