import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logoutRequest } from '../../auth/services/auth.service';
import api from '../../../core/api';
import {
    FaMapMarkerAlt, FaClock, FaUsers, FaSearch,
    FaLocationArrow, FaTimes, FaUserCircle, FaSuitcase,
    FaSignOutAlt, FaUserEdit, FaStar, FaHeart, FaArrowRight,
    FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp,
    FaPhone, FaEnvelope, FaPercent, FaCompass, FaFilter, FaChevronDown,
    FaShareAlt
} from 'react-icons/fa';
import './TuristaDashboard.css';
import TourDrawer from '../../../components/TourDrawer';
import ReservationDrawer from '../../../components/ReservationDrawer';
import PaymentDrawer from '../../../components/PaymentDrawer';
import OfferDrawer from '../../../components/OfferDrawer';

// ── Datos de destinos destacados ──────────────────────────────────────────────
const destinosMock = [
    { id: 1, nombre: 'Galápagos', pais: 'Ecuador', precio: 1200, rating: 4.9, resenas: 587, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', tag: 'Fauna única' },
    { id: 2, nombre: 'Volcán Cotopaxi', pais: 'Ecuador', precio: 85, rating: 4.8, resenas: 312, img: 'https://images.unsplash.com/photo-1551854304-25049c10e254?w=600&q=80', tag: 'Aventura' },
    { id: 3, nombre: 'Amazonía', pais: 'Ecuador', precio: 450, rating: 4.85, resenas: 223, img: 'https://images.unsplash.com/photo-1518182170546-07661fd94144?w=600&q=80', tag: 'Naturaleza' },
    { id: 4, nombre: 'Quito Colonial', pais: 'Ecuador', precio: 45, rating: 4.7, resenas: 189, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', tag: 'Cultura' },
    { id: 5, nombre: 'Quilotoa', pais: 'Ecuador', precio: 120, rating: 4.95, resenas: 412, img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80', tag: 'Paisaje' },
    { id: 6, nombre: 'Baños de Agua Santa', pais: 'Ecuador', precio: 65, rating: 4.9, resenas: 256, img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', tag: 'Cascadas' },
];

// ── Datos de hoteles ──────────────────────────────────────────────────────────
const hotelesMock = [
    { id: 1, nombre: 'Hotel Galería Plaza', ciudad: 'Quito', estrellas: 5, precio: 189, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', rating: 4.8 },
    { id: 2, nombre: 'Casa Gangotena', ciudad: 'Quito', estrellas: 5, precio: 320, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80', rating: 4.9 },
    { id: 3, nombre: 'Mashpi Lodge', ciudad: 'Chocó Andino', estrellas: 5, precio: 650, img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', rating: 5.0 },
    { id: 4, nombre: 'Finch Bay Eco Hotel', ciudad: 'Galápagos', estrellas: 4, precio: 280, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', rating: 4.7 },
];

// ── Datos de testimonios ──────────────────────────────────────────────────────
const testimoniosMock = [
    { id: 1, nombre: 'María González', pais: 'España', avatar: 'M', destino: 'Galápagos', rating: 5, comentario: 'Experiencia absolutamente increíble. Los guías son expertos, los paisajes son de otro mundo. ¡Volvería mil veces!', color: '#10b981' },
    { id: 2, nombre: 'James Wilson', pais: 'UK', avatar: 'J', destino: 'Cotopaxi', rating: 5, comentario: 'Best tour I\'ve ever done in South America. The guides are professional and the views are breathtaking.', color: '#3b82f6' },
    { id: 3, nombre: 'Caroline Dubois', pais: 'Francia', avatar: 'C', destino: 'Amazonía', rating: 5, comentario: 'Une expérience unique! La forêt amazonienne est magnifique et les guides très professionnels.', color: '#f59e0b' },
    { id: 4, nombre: 'Carlos Méndez', pais: 'Colombia', avatar: 'C', destino: 'Quilotoa', rating: 5, comentario: 'La laguna del Quilotoa te deja sin palabras. El tour fue perfectamente organizado. Totalmente recomendado.', color: '#8b5cf6' },
];

// ── Datos de ofertas ──────────────────────────────────────────────────────────
const ofertasMock = [
    { id: 1, titulo: 'Escapada a Galápagos', descuento: 20, precio_original: 1500, precio_oferta: 1200, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80', hasta: '28 Feb 2026' },
    { id: 2, titulo: 'Aventura en la Amazonía', descuento: 15, precio_original: 530, precio_oferta: 450, img: 'https://images.unsplash.com/photo-1518182170546-07661fd94144?w=500&q=80', hasta: '15 Mar 2026' },
    { id: 3, titulo: 'Paquete Quito + Cotopaxi', descuento: 25, precio_original: 160, precio_oferta: 120, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80', hasta: '10 Mar 2026' },
];

// ── Categorías ────────────────────────────────────────────────────────────────
const categorias = [
    { icon: '🏔️', nombre: 'Aventura' },
    { icon: '🌿', nombre: 'Naturaleza' },
    { icon: '🏖️', nombre: 'Playa' },
    { icon: '🎭', nombre: 'Cultura' },
    { icon: '🍽️', nombre: 'Gastronomía' },
    { icon: '🏨', nombre: 'Lujo' },
    { icon: '🐾', nombre: 'Fauna' },
    { icon: '🚵', nombre: 'Deportes' },
];

const TuristaDashboard = () => {
    const [tours, setTours] = useState([]);
    const [hoteles, setHoteles] = useState([]);
    const [ofertas, setOfertas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [isLocationFilterActive, setIsLocationFilterActive] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroPrecioMax, setFiltroPrecioMax] = useState(2000);
    const [filtroRating, setFiltroRating] = useState(0);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tabBusqueda, setTabBusqueda] = useState('tours');
    const [selectedTour, setSelectedTour] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Estados para nuevos Drawers
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isOfferOpen, setIsOfferOpen] = useState(false);
    const [pendingReservation, setPendingReservation] = useState(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const RADIUS_KM = 50;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Cargar Tours
            const toursRes = await api.get('/tours');
            setTours(toursRes.data);

            // Cargar Hoteles
            const hotelesRes = await api.get('/hoteles');
            setHoteles(hotelesRes.data);

            // Cargar Favoritos
            const favsRes = await api.get('/favoritos');
            // Mapeamos a solo IDs para fácil chequeo
            setFavorites(favsRes.data.map(f => f.id_tour || f.id_hotel));

            // Ofertas (podemos usar una lógica de filtrado sobre tours o hoteles con precio bajo)
            setOfertas(ofertasMock);

        } catch (error) {
            console.error("❌ Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const handleVerDetalles = (tour) => {
        setSelectedTour(tour);
        setIsDrawerOpen(true);
    };

    const handleOpenReservation = (tour) => {
        setSelectedTour(tour);
        setIsReservationOpen(true);
    };

    const handleConfirmReservation = async (resData) => {
        try {
            const payload = {
                id_tour: resData.tour.id_tour || resData.tour.id_hotel,
                fecha_actividad: resData.fecha,
                cantidad_personas: resData.personas,
                total_pagado: resData.total,
                estado_reserva: 'Pendiente'
            };
            const response = await api.post('/reservas', payload);

            setPendingReservation({
                ...resData,
                id_reserva: response.data.reserva.id_reserva,
                total_pagar: response.data.reserva.total_pagado || resData.total
            });
            setIsReservationOpen(false);
            setIsPaymentOpen(true);
        } catch (error) {
            console.error("Error al procesar reserva:", error);
            alert('Error al crear la reserva en el sistema.');
        }
    };

    const handlePaymentSuccess = async (paymentInfo) => {
        try {
            // Confirmar en el backend (ya lo hace el simulate, pero podemos refrescar o avisar)
            console.log('Pago existoso:', paymentInfo);
            setIsPaymentOpen(false);
            alert('¡Reserva completada con éxito!');
            fetchData(); // Refrescar para ver estados actualizados si aplica
        } catch (error) {
            console.error("Error al procesar el éxito del pago:", error);
        }
    };

    const handleOpenOffer = (oferta) => {
        const tourBase = tours.find(t => t.id_tour === 1) || tours[0];
        setSelectedTour({
            ...tourBase,
            nombre: oferta.titulo,
            precio: oferta.precio_oferta
        });
        setIsOfferOpen(true);
    };

    const handleOpenDestino = (dest) => {
        // Mapeamos el destino a un objeto compatible con TourDrawer
        setSelectedTour({
            id_tour: dest.id,
            nombre: dest.nombre,
            ciudad_destino: dest.pais,
            precio: dest.precio,
            imagen_portada: dest.img,
            calificacion: dest.rating,
            resenas: dest.resenas,
            duracion: '3-5 días sugeridos',
            dificultad: 'Variable',
            maximo_personas: 10,
            descripcion: `Explora las maravillas de ${dest.nombre}. Un destino catalogado como "${dest.tag}" que ofrece experiencias inigualables en el corazón de ${dest.pais}.`,
            incluye: ['Traslados personalizados', 'Guía local bilingüe', 'Seguro de viaje'],
            no_incluye: ['Vuelos internacionales', 'Gastos personales'],
            puntos_clave: ['Naturaleza virgen', 'Cultura local viva', 'Gastronomía auténtica']
        });
        setIsDrawerOpen(true);
    };

    const handleOpenHotelReservation = (hotel) => {
        // Mapeamos el hotel a un objeto compatible con ReservationDrawer
        setSelectedTour({
            id_tour: hotel.id,
            nombre: hotel.nombre,
            ciudad_destino: hotel.ciudad,
            precio: hotel.precio,
            imagen_portada: hotel.img,
            calificacion: hotel.rating,
            maximo_personas: 4, // Límite por habitación
            es_hotel: true
        });
        setIsReservationOpen(true);
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const handleGetLocation = () => {
        if (isLocationFilterActive) { setIsLocationFilterActive(false); setUserLocation(null); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setIsLocationFilterActive(true); },
            () => alert('Por favor activa permisos de ubicación')
        );
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const params = {
                q: searchTerm,
                minPrice: 0,
                maxPrice: filtroPrecioMax,
                stars: filtroRating
            };
            const res = await api.get('/search', { params });
            setTours(res.data.tours);
            setHoteles(res.data.hoteles);
        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm || filtroPrecioMax !== 2000 || filtroRating !== 0) {
                handleSearch();
            }
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, filtroPrecioMax, filtroRating]);

    const toggleFavorite = async (itemId, type = 'tour') => {
        try {
            const isFav = favorites.includes(itemId);
            if (isFav) {
                await api.delete('/favoritos', { data: { [`id_${type}`]: itemId } });
                setFavorites(prev => prev.filter(id => id !== itemId));
            } else {
                await api.post('/favoritos', { [`id_${type}`]: itemId });
                setFavorites(prev => [...prev, itemId]);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const handleShare = (tour) => {
        const url = window.location.href + `/tour/${tour.id_tour || tour.id_hotel}`;
        navigator.clipboard.writeText(url);
        alert('¡Enlace copiado al portapapeles!');
    };

    const filteredTours = tours.filter(tour => {
        const matchesSearch = tour.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tour.ciudad_destino || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrecio = tour.precio <= filtroPrecioMax;
        // Use ?? 0 as fallback so tours without calificacion always pass the rating filter
        const matchesRating = (tour.calificacion ?? 0) >= filtroRating;

        // Nueva lógica de categorías
        const matchesCategoria = !categoriaActiva ||
            (tour.categoria && tour.categoria.toLowerCase() === categoriaActiva.toLowerCase()) ||
            (tour.descripcion && tour.descripcion.toLowerCase().includes(categoriaActiva.toLowerCase()));

        const matchesTipo = filtroTipo === 'todos' ||
            (tour.categoria && tour.categoria.toLowerCase() === filtroTipo.toLowerCase());

        if (isLocationFilterActive && userLocation) {
            if (!tour.latitud || !tour.longitud) return false;
            const dist = calculateDistance(userLocation.lat, userLocation.lng, parseFloat(tour.latitud), parseFloat(tour.longitud));
            return matchesSearch && dist <= RADIUS_KM && matchesPrecio && matchesRating && matchesCategoria && matchesTipo;
        }
        return matchesSearch && matchesPrecio && matchesRating && matchesCategoria && matchesTipo;
    });

    return (
        <div className="turista-layout">

            {/* ══════════════ 1. NAVBAR ══════════════ */}
            <nav className="navbar-turista">
                <div className="nav-inner">
                    <div className="nav-logo" onClick={() => navigate('/home')}>
                        <img src="/uploads/logo.png" alt="ECRUT" />
                        <span>ECRUT Travels</span>
                    </div>

                    <ul className="nav-links">
                        <li><a href="#inicio">Inicio</a></li>
                        <li><a href="#destinos">Destinos</a></li>
                        <li><a href="#tours">Tours</a></li>
                        <li><a href="#hoteles">Hoteles</a></li>
                        <li><a href="#ofertas">Ofertas</a></li>
                    </ul>

                    <div className="nav-right">
                        <button className="nav-fav-btn" title="Favoritos">
                            <FaHeart /> <span>{favorites.length}</span>
                        </button>
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
                                    <Link to="/mis-favoritos" className="drop-item"><FaHeart /> Mis Favoritos</Link>
                                    <hr className="drop-divider" />
                                    <button onClick={handleLogout} className="drop-item drop-logout"><FaSignOutAlt /> Cerrar Sesión</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ══════════════ 2. HERO SECTION ══════════════ */}
            <section id="inicio" className="hero-turista">
                <div className="hero-bg">
                    <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=90" alt="Ecuador" className="hero-img" />
                    <div className="hero-overlay-gradient" />
                </div>

                <div className="hero-body">
                    <p className="hero-eyebrow">🌍 Descubre Ecuador</p>
                    <h1 className="hero-heading">
                        Tu próxima aventura<br />
                        <span className="hero-highlight">comienza aquí</span>
                    </h1>
                    <p className="hero-sub">Más de 50 destinos únicos, guías expertos y experiencias que duran toda la vida</p>

                    {/* Barra de búsqueda */}
                    <div className="hero-search-card">
                        <div className="search-tabs">
                            {['tours', 'destinos', 'hoteles'].map(t => (
                                <button key={t} className={`search-tab ${tabBusqueda === t ? 'active' : ''}`} onClick={() => setTabBusqueda(t)}>
                                    {t === 'tours' ? '🗺️ Tours' : t === 'destinos' ? '📍 Destinos' : '🏨 Hoteles'}
                                </button>
                            ))}
                        </div>
                        <div className="hero-search-row">
                            <div className="hero-input-group">
                                <FaSearch className="hero-input-icon" />
                                <input
                                    type="text"
                                    placeholder={tabBusqueda === 'tours' ? 'Busca tours, actividades...' : tabBusqueda === 'destinos' ? 'Ciudad, región...' : 'Nombre del hotel...'}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="hero-search-input"
                                />
                            </div>
                            <div className="hero-input-group">
                                <FaMapMarkerAlt className="hero-input-icon" />
                                <input type="text" placeholder="¿A dónde vas?" className="hero-search-input" />
                            </div>
                            <button
                                className={`hero-geo-btn ${isLocationFilterActive ? 'active' : ''}`}
                                onClick={handleGetLocation}
                                title="Buscar cerca de mi ubicación real"
                            >
                                <FaLocationArrow />
                            </button>
                            <button className="hero-search-btn">
                                <FaSearch /> Buscar ahora
                            </button>
                        </div>
                    </div>

                    {/* Botones CTA */}
                    <div className="hero-cta-row">
                        <a href="#destinos" className="btn-hero-primary">🌿 Explorar destinos</a>
                        <a href="#tours" className="btn-hero-secondary">Ver todos los tours <FaArrowRight /></a>
                    </div>
                </div>

                {/* Stats flotantes */}
                <div className="hero-stats">
                    <div className="hero-stat"><span className="hstat-num">50+</span><span className="hstat-lbl">Destinos</span></div>
                    <div className="hero-stat-div" />
                    <div className="hero-stat"><span className="hstat-num">4.9⭐</span><span className="hstat-lbl">Calificación</span></div>
                    <div className="hero-stat-div" />
                    <div className="hero-stat"><span className="hstat-num">2,500+</span><span className="hstat-lbl">Turistas felices</span></div>
                    <div className="hero-stat-div" />
                    <div className="hero-stat"><span className="hstat-num">15+</span><span className="hstat-lbl">Años de experiencia</span></div>
                </div>
            </section>

            {/* ══════════════ 3. CATEGORÍAS ══════════════ */}
            <section className="cats-section">
                <div className="section-wrap">
                    <div className="cats-grid">
                        {categorias.map(cat => (
                            <button
                                key={cat.nombre}
                                className={`cat-pill ${categoriaActiva === cat.nombre ? 'active' : ''}`}
                                onClick={() => setCategoriaActiva(categoriaActiva === cat.nombre ? '' : cat.nombre)}
                            >
                                <span className="cat-icon">{cat.icon}</span>
                                <span>{cat.nombre}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ 4. DESTINOS DESTACADOS ══════════════ */}
            <section id="destinos" className="section-block">
                <div className="section-wrap">
                    <div className="section-head">
                        <div>
                            <p className="section-eyebrow">📍 Lugares imperdibles</p>
                            <h2 className="section-title">Destinos Destacados</h2>
                        </div>
                        <a href="#tours" className="link-ver-todos">Ver todos <FaArrowRight /></a>
                    </div>

                    <div className="destinos-grid">
                        {destinosMock.map(dest => (
                            <div key={dest.id} className="destino-card">
                                <div className="destino-img-wrap">
                                    <img src={dest.img} alt={dest.nombre} className="destino-img" />
                                    <div className="destino-overlay">
                                        <button className="btn-destino-ver" onClick={() => handleOpenDestino(dest)}>Ver experiencias <FaArrowRight /></button>
                                    </div>
                                    <span className="destino-tag">{dest.tag}</span>
                                    <div className="destino-rating">⭐ {dest.rating}</div>
                                </div>
                                <div className="destino-body">
                                    <h3 className="destino-nombre">{dest.nombre}</h3>
                                    <p className="destino-pais"><FaMapMarkerAlt /> {dest.pais} · {dest.resenas} reseñas</p>
                                    <div className="destino-footer">
                                        <span className="destino-desde">Desde <strong>${dest.precio}</strong></span>
                                        <button className="btn-destino-small" onClick={() => handleOpenDestino(dest)}>Ver más</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ 5. TOURS RECOMENDADOS + FILTROS ══════════════ */}
            <section id="tours" className="section-block section-alt">
                <div className="section-wrap">
                    <div className="section-head">
                        <div>
                            <p className="section-eyebrow">🗺️ Experiencias únicas</p>
                            <h2 className="section-title">Tours Recomendados</h2>
                        </div>
                    </div>

                    {/* ── 6. FILTROS ── */}
                    <div className="filtros-bar">
                        <button className="filtros-toggle" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                            <FaFilter /> Filtros {mostrarFiltros ? '▲' : '▼'}
                        </button>
                        <div className="filtros-pills">
                            {['todos', 'aventura', 'cultura', 'naturaleza', 'playa'].map(t => (
                                <button key={t} className={`filtro-pill ${filtroTipo === t ? 'active' : ''}`} onClick={() => setFiltroTipo(t)}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button
                            className={`filtro-location ${isLocationFilterActive ? 'active' : ''}`}
                            onClick={handleGetLocation}
                        >
                            {isLocationFilterActive ? <FaTimes /> : <FaLocationArrow />}
                            {isLocationFilterActive ? ' Quitar filtro' : ' Cerca de mí'}
                        </button>
                    </div>

                    {mostrarFiltros && (
                        <div className="filtros-panel">
                            <div className="filtro-group">
                                <label>Precio máximo: <strong>${filtroPrecioMax}</strong></label>
                                <input type="range" min={30} max={2000} value={filtroPrecioMax} onChange={e => setFiltroPrecioMax(+e.target.value)} className="range-input" />
                                <div className="range-labels"><span>$30</span><span>$2,000</span></div>
                            </div>
                            <div className="filtro-group">
                                <label>Calificación mínima</label>
                                <div className="rating-filter-row">
                                    {[0, 4, 4.5, 4.7, 4.9].map(r => (
                                        <button key={r} className={`rating-btn ${filtroRating === r ? 'active' : ''}`} onClick={() => setFiltroRating(r)}>
                                            {r === 0 ? 'Todos' : `${r}+ ⭐`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isLocationFilterActive && (
                        <div className="filter-info-bar">
                            <FaMapMarkerAlt /> Mostrando tours a menos de <strong>{RADIUS_KM} km</strong> de tu ubicación · {filteredTours.length} resultados
                        </div>
                    )}

                    {filteredTours.length === 0 ? (
                        <div className="no-results">
                            <span>🔍</span>
                            <h3>No encontramos tours</h3>
                            <p>Prueba cambiando los filtros o el texto de búsqueda</p>
                            <button onClick={() => { setSearchTerm(''); setFiltroPrecioMax(2000); setFiltroRating(0); setIsLocationFilterActive(false); }} className="btn-reset">
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <div className="tours-grid">
                            {filteredTours.map(tour => (
                                <div key={tour.id_tour} className="tour-card">
                                    <div className="tour-card-img">
                                        <img
                                            src={
                                                tour.imagen_portada
                                                    ? `http://localhost:4000${tour.imagen_portada}`
                                                    : `https://images.unsplash.com/photo-1551854304-25049c10e254?w=500&q=75&sig=${tour.id_tour}`
                                            }
                                            alt={tour.nombre}
                                            onError={e => {
                                                e.target.src = `https://images.unsplash.com/photo-1551854304-25049c10e254?w=500&q=75&sig=${tour.id_tour}`;
                                            }}
                                        />
                                        <span className="tour-dificultad">{tour.dificultad || 'Moderada'}</span>
                                        <button className={`btn-fav ${favorites.includes(tour.id_tour) ? 'fav-on' : ''}`} onClick={() => toggleFavorite(tour.id_tour)}>
                                            <FaHeart />
                                        </button>
                                        <div className="tour-precio-badge">${tour.precio}</div>
                                    </div>
                                    <div className="tour-card-body">
                                        <div className="tour-rating-row">
                                            <span className="tour-stars">{'⭐'.repeat(Math.round(tour.calificacion))}</span>
                                            <span className="tour-rating-num">{tour.calificacion} <small>({tour.resenas} reseñas)</small></span>
                                        </div>
                                        <h3 className="tour-nombre">{tour.nombre}</h3>
                                        <p className="tour-loc"><FaMapMarkerAlt /> {tour.ciudad_destino}</p>
                                        <div className="tour-meta-row">
                                            <span><FaClock /> {tour.duracion}</span>
                                            <span><FaUsers /> Máx. {tour.maximo_personas}</span>
                                        </div>
                                        <p className="tour-desc">{tour.descripcion?.substring(0, 90)}...</p>
                                        <div className="tour-card-footer">
                                            <div>
                                                <p className="tour-desde">Desde</p>
                                                <p className="tour-price-big">${tour.precio} <small>/persona</small></p>
                                            </div>
                                            <div className="tour-actions-flex">
                                                <button className="btn-ver-mas-tour" onClick={() => handleVerDetalles(tour)}>Ver detalles</button>
                                                <button className="btn-reservar" onClick={() => handleOpenReservation(tour)}>Reservar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════════ 7. OFERTAS Y PROMOCIONES ══════════════ */}
            <section id="ofertas" className="section-block ofertas-section">
                <div className="section-wrap">
                    <div className="section-head">
                        <div>
                            <p className="section-eyebrow">🔥 Tiempo limitado</p>
                            <h2 className="section-title">Ofertas Especiales</h2>
                        </div>
                    </div>
                    <div className="ofertas-grid">
                        {(tours.length > 0 ? tours.slice(0, 3) : ofertasMock).map((item, idx) => {
                            const esTour = !!item.id_tour;
                            const descuento = esTour ? 15 : item.descuento;
                            const precioOriginal = esTour ? Math.round(item.precio * 1.18) : item.precio_original;
                            const precioOferta = esTour ? item.precio : item.precio_oferta;
                            const titulo = esTour ? item.nombre : item.titulo;
                            const imgSrc = esTour
                                ? (item.imagen_portada ? `http://localhost:4000${item.imagen_portada}` : `https://images.unsplash.com/photo-1518182170546-07661fd94144?w=500&q=80&sig=${item.id_tour}`)
                                : item.img;
                            const hasta = esTour && item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) : (item.hasta || 'Tiempo limitado');
                            return (
                                <div key={esTour ? item.id_tour : item.id} className="oferta-card">
                                    <div className="oferta-img-wrap">
                                        <img src={imgSrc} alt={titulo} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1518182170546-07661fd94144?w=500&q=80'; }} />
                                        <div className="oferta-badge"><FaPercent /> {descuento}% OFF</div>
                                    </div>
                                    <div className="oferta-body">
                                        <p className="oferta-hasta">⏱️ Válido hasta {hasta}</p>
                                        <h3 className="oferta-titulo">{titulo}</h3>
                                        <div className="oferta-precios">
                                            <span className="precio-antes">${precioOriginal}</span>
                                            <span className="precio-oferta">${precioOferta}</span>
                                        </div>
                                        <button className="btn-oferta" onClick={() => esTour ? handleOpenOffer(item) : handleOpenOffer(item)}>Aprovechar oferta <FaArrowRight /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════ 5b. HOTELES ══════════════ */}
            <section id="hoteles" className="section-block">
                <div className="section-wrap">
                    <div className="section-head">
                        <div>
                            <p className="section-eyebrow">🏨 Dónde quedarse</p>
                            <h2 className="section-title">Hoteles Recomendados</h2>
                        </div>
                        <a href="#hoteles" className="link-ver-todos">Ver todos <FaArrowRight /></a>
                    </div>
                    <div className="hoteles-grid">
                        {(hoteles.length > 0 ? hoteles : []).map(hotel => (
                            <div key={hotel.id_hotel} className="hotel-card">
                                <div className="hotel-img-wrap">
                                    <img
                                        src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&sig=${hotel.id_hotel}`}
                                        alt={hotel.nombre}
                                        className="hotel-img"
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80'; }}
                                    />
                                    <div className="hotel-estrellas">
                                        {'⭐'.repeat(hotel.estrellas || 3)}
                                    </div>
                                </div>
                                <div className="hotel-body">
                                    <h3 className="hotel-nombre">{hotel.nombre}</h3>
                                    <p className="hotel-ciudad"><FaMapMarkerAlt /> {hotel.ciudad}</p>
                                    <div className="hotel-rating">
                                        <FaStar className="star-icon" /> <strong>{hotel.estrellas || 3}.0</strong> <span>Excelente</span>
                                    </div>
                                    <div className="hotel-footer">
                                        <div>
                                            <p className="hotel-desde">Hotel Asociado</p>
                                            <p className="hotel-precio">{hotel.estado_convenio || 'Disponible'}</p>
                                        </div>
                                        <div className="hotel-actions-btns">
                                            <button className="btn-hotel-ver" onClick={() => navigate(`/hotel/${hotel.id_hotel}`)}>Ver detalles</button>
                                            <button className="btn-hotel-reservar" onClick={() => handleOpenHotelReservation(hotel)}>Reservar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ 8. TESTIMONIOS ══════════════ */}
            <section className="section-block testimonios-section">
                <div className="section-wrap">
                    <div className="section-head centered">
                        <p className="section-eyebrow">💬 Voces reales</p>
                        <h2 className="section-title">Lo que dicen nuestros viajeros</h2>
                        <p className="section-desc">Más de 2,500 turistas satisfechos comparten su experiencia</p>
                    </div>
                    <div className="testimonios-grid">
                        {testimoniosMock.map(t => (
                            <div key={t.id} className="testimonio-card">
                                <div className="test-stars">{'⭐'.repeat(t.rating)}</div>
                                <p className="test-comentario">"{t.comentario}"</p>
                                <div className="test-user">
                                    <div className="test-avatar" style={{ background: t.color }}>{t.avatar}</div>
                                    <div>
                                        <p className="test-nombre">{t.nombre}</p>
                                        <p className="test-info">{t.pais} · Visitó {t.destino}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ 10. MAPA / EXPLORACIÓN POR REGIÓN ══════════════ */}
            <section className="section-block mapa-section">
                <div className="section-wrap">
                    <div className="section-head centered">
                        <p className="section-eyebrow">🗺️ Explora por región</p>
                        <h2 className="section-title">Descubre Ecuador</h2>
                    </div>
                    <div className="regiones-grid">
                        {[
                            { nombre: 'Sierra', desc: 'Volcanes, páramos y ciudades coloniales', img: 'https://images.unsplash.com/photo-1551854304-25049c10e254?w=400&q=75', tours: 28 },
                            { nombre: 'Costa', desc: 'Playas, surf y cultura costeña', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=75', tours: 18 },
                            { nombre: 'Amazonía', desc: 'Selva virgen, fauna exótica y comunidades', img: 'https://images.unsplash.com/photo-1518182170546-07661fd94144?w=400&q=75', tours: 15 },
                            { nombre: 'Galápagos', desc: 'Fauna única, buceo y naturaleza pristina', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=75', tours: 12 },
                        ].map(reg => (
                            <div key={reg.nombre} className="region-card">
                                <img src={reg.img} alt={reg.nombre} className="region-img" />
                                <div className="region-overlay">
                                    <h3 className="region-nombre">{reg.nombre}</h3>
                                    <p className="region-desc">{reg.desc}</p>
                                    <span className="region-tours">{reg.tours} tours</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ 11. FOOTER ══════════════ */}
            <footer className="footer-turista">
                <div className="footer-top">
                    <div className="footer-wrap">
                        {/* Columna 1 – Marca */}
                        <div className="footer-col brand-col">
                            <div className="footer-logo">
                                <img src="/uploads/logo.png" alt="ECRUT" className="footer-logo-img" />
                                <span>ECRUT Travels</span>
                            </div>
                            <p className="footer-desc">Tu agencia de turismo de confianza en Ecuador. Experiencias únicas, guías expertos y memorias para toda la vida.</p>
                            <div className="footer-socials">
                                <a href="#fb" className="social-btn"><FaFacebook /></a>
                                <a href="#ig" className="social-btn"><FaInstagram /></a>
                                <a href="#tw" className="social-btn"><FaTwitter /></a>
                                <a href="#yt" className="social-btn"><FaYoutube /></a>
                                <a href="#wa" className="social-btn"><FaWhatsapp /></a>
                            </div>
                        </div>

                        {/* Columna 2 – Destinos */}
                        <div className="footer-col">
                            <h4 className="footer-col-title">Destinos</h4>
                            <ul className="footer-list">
                                <li><a href="#d">Galápagos</a></li>
                                <li><a href="#d">Cotopaxi</a></li>
                                <li><a href="#d">Quilotoa</a></li>
                                <li><a href="#d">Amazonía</a></li>
                                <li><a href="#d">Quito Histórico</a></li>
                                <li><a href="#d">Baños</a></li>
                            </ul>
                        </div>

                        {/* Columna 3 – Soporte */}
                        <div className="footer-col">
                            <h4 className="footer-col-title">Soporte</h4>
                            <ul className="footer-list">
                                <li><a href="#s">Centro de ayuda</a></li>
                                <li><a href="#s">Política de cancelación</a></li>
                                <li><a href="#s">Términos y condiciones</a></li>
                                <li><a href="#s">Privacidad</a></li>
                                <li><a href="#s">Sobre nosotros</a></li>
                            </ul>
                        </div>

                        {/* Columna 4 – Newsletter */}
                        <div className="footer-col">
                            <h4 className="footer-col-title">¡No te pierdas nada!</h4>
                            <p className="footer-newsletter-desc">Recibe ofertas exclusivas y los mejores destinos directamente en tu correo.</p>
                            <div className="newsletter-form">
                                <input type="email" placeholder="tu@correo.com" className="newsletter-input" />
                                <button className="newsletter-btn">Suscribirse</button>
                            </div>
                            <div className="footer-contact-info">
                                <p><FaPhone /> +593 99 XXX XXXX</p>
                                <p><FaEnvelope /> info@ecrut.ec</p>
                                <p><FaCompass /> Quito, Ecuador</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 ECRUT Travels. Todos los derechos reservados.</p>
                    <div className="footer-bottom-links">
                        <a href="#p">Privacidad</a>
                        <a href="#t">Términos</a>
                        <a href="#c">Cookies</a>
                    </div>
                </div>
            </footer>

            {/* ── Drawer de Detalles del Tour ── */}
            <TourDrawer
                tour={selectedTour}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onReserve={(t) => {
                    setIsDrawerOpen(false);
                    handleOpenReservation(t);
                }}
            />

            {/* ── Drawer de Reservas ── */}
            <ReservationDrawer
                tour={selectedTour}
                isOpen={isReservationOpen}
                onClose={() => setIsReservationOpen(false)}
                onConfirm={handleConfirmReservation}
            />

            {/* ── Drawer de Pago (Factura y PayPal) ── */}
            <PaymentDrawer
                reservation={pendingReservation}
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />

            {/* ── Drawer de Ofertas ── */}
            <OfferDrawer
                tour={selectedTour}
                isOpen={isOfferOpen}
                onClose={() => setIsOfferOpen(false)}
                onReserveOffer={(t) => {
                    setIsOfferOpen(false);
                    handleOpenReservation(t);
                }}
            />
        </div>
    );
};

export default TuristaDashboard;
