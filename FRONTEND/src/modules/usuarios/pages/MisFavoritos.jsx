import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logoutRequest } from '../../auth/services/auth.service';
import api from '../../../core/api';
// import { tourosMock } from '../../../core/mockData'; // Eliminado mock data
import {
    FaArrowLeft, FaHeart, FaMapMarkerAlt, FaClock, FaUsers, FaStar,
    FaSearch, FaFilter, FaTrash, FaEye, FaUserCircle, FaSuitcase,
    FaSignOutAlt, FaUserEdit, FaChevronDown, FaTimes
} from 'react-icons/fa';
import './TuristaPages.css';
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
            const mapped = response.data.map(f => ({
                id_tour: f.id_tour || f.id_hotel,
                id_hotel: f.id_hotel,
                nombre: f.tour_nombre || f.hotel_nombre,
                precio: parseFloat(f.tour_precio || f.hotel_precio) || 0,
                ciudad_destino: 'Ecuador', // Podríamos traerlo en el JOIN
                imagen: f.tour_img
                    ? `http://localhost:4000${f.tour_img}`
                    : `https://images.unsplash.com/photo-1551854304-25049c10e254?w=500&q=70&sig=${f.id_tour || f.id_hotel}`,
                calificacion: 5.0,
                duracion: 'Todo el día',
                maximo_personas: 10,
                resenas: 0
            }));
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
            setFavTours(prev => prev.filter(f => f.id_tour !== id));
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
                    <div className="favoritos-grid">
                        {filtrados.map(tour => (
                            <div key={tour.id_tour} className="fav-card">
                                <div className="fav-card-img">
                                    <img
                                        src={`https://images.unsplash.com/photo-1551854304-25049c10e254?w=500&q=70&sig=${tour.id_tour}`}
                                        alt={tour.nombre}
                                    />
                                    {/* Badge rating */}
                                    <div className="fav-rating-badge">
                                        <FaStar /> {tour.calificacion}
                                    </div>
                                    {/* Botón quitar */}
                                    <button className="btn-quitar-fav" onClick={() => quitarFavorito(tour.id_tour, tour.id_hotel)} title="Quitar de favoritos">
                                        <FaHeart />
                                    </button>
                                    {/* Badge precio */}
                                    <div className="fav-precio-badge">${tour.precio}</div>
                                </div>
                                <div className="fav-card-body">
                                    <h3 className="fav-nombre">{tour.nombre}</h3>
                                    <p className="fav-ciudad"><FaMapMarkerAlt /> {tour.ciudad_destino}</p>
                                    <div className="fav-meta">
                                        <span><FaClock /> {tour.duracion}</span>
                                        <span><FaUsers /> Máx. {tour.maximo_personas}</span>
                                    </div>
                                    <div className="fav-resenas">
                                        {'⭐'.repeat(Math.round(tour.calificacion))}
                                        <span>{tour.calificacion} · {tour.resenas} reseñas</span>
                                    </div>
                                    <div className="fav-acciones">
                                        <button className="btn-reservar-fav" onClick={() => handleOpenReservation(tour)}>Reservar ahora</button>
                                        <button className="btn-ver-fav" onClick={() => handleVerDetalles(tour)} title="Ver detalles"><FaEye /></button>
                                        <button className="btn-eliminar-fav" onClick={() => quitarFavorito(tour.id_tour, tour.id_hotel)} title="Eliminar"><FaTrash /></button>
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
