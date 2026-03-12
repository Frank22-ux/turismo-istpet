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

const API_URL = 'http://localhost:4000';

// ── Datos de hoteles (Se mantiene como fallback visual si no hay hoteles, pero se prioriza API) ──────────────────────────────────────────────────────────
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
    const [resenas, setResenas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
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

            // Ofertas (filtramos los tours que tienen en_oferta verdadero)
            const realOffers = toursRes.data.filter(t => t.en_oferta === true);
            setOfertas(realOffers);

            // Cargar Reseñas recientes para "Voces Reales"
            try {
                const resenasRes = await api.get('/resenas/recientes?limit=6');
                setResenas(resenasRes.data.resenas || []);
            } catch {
                setResenas([]); // Si falla, la sección simplemente no se muestra
            }

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
        const processedTour = tour.en_oferta 
            ? { ...tour, precio: tour.precio * (1 - (tour.descuento || 0) / 100) } 
            : tour;
        setSelectedTour(processedTour);
        setIsDrawerOpen(true);
    };

    const handleOpenReservation = (tour) => {
        const processedTour = tour.en_oferta 
            ? { ...tour, precio: tour.precio * (1 - (tour.descuento || 0) / 100) } 
            : tour;
        // Si el tour viene de una lista que incluye estado (como en búsquedas o mocks), lo respetamos
        setSelectedTour(processedTour);
        setIsReservationOpen(true);
    };

    const handleConfirmReservation = async (resData) => {
        try {
            const payload = {
                id_tour: resData.tour.es_hotel ? undefined : resData.tour.id_tour,
                id_hotel: resData.tour.es_hotel ? resData.tour.id_tour : undefined, // En handleOpenHotelReservation guardamos el hotel en el campo genérico
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
        // Ahora `dest` es un objeto tour real
        handleVerDetalles(dest);
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
                city: locationQuery,
                minPrice: 0,
                maxPrice: filtroPrecioMax,
                stars: filtroRating,
                type: tabBusqueda // 'tours', 'destinos', 'hoteles'
            };
            const res = await api.get('/search', { params });
            if (tabBusqueda === 'hoteles') {
                setHoteles(res.data.hoteles);
                // Opcionalmente blanquear tours si solo busco hoteles
                // setTours([]); 
            } else {
                setTours(res.data.tours);
                // Si type es todos o destinos, también trae hoteles, 
                // pero si tabBusqueda es tours, asumimos que solo queremos ver tours
            }
            
            // Si la vista es destinos, podemos bajar suavemente al grid
            if (tabBusqueda === 'destinos' || tabBusqueda === 'tours') {
                document.getElementById('tours').scrollIntoView({ behavior: 'smooth' });
            } else if (tabBusqueda === 'hoteles') {
                document.getElementById('hoteles').scrollIntoView({ behavior: 'smooth' });
            }

        } catch (error) {
            console.error("Error searching:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm || locationQuery || filtroPrecioMax !== 2000 || filtroRating !== 0) {
                handleSearch();
            }
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, locationQuery, filtroPrecioMax, filtroRating]);

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
        const term = searchTerm.toLowerCase();
        const loc = locationQuery.toLowerCase();
        
        const matchesSearch = tour.nombre.toLowerCase().includes(term) ||
            (tour.ciudad_destino || '').toLowerCase().includes(term) ||
            (tour.descripcion || '').toLowerCase().includes(term);
            
        const matchesLocation = (tour.ciudad_destino || '').toLowerCase().includes(loc);
        
        const matchesPrecio = tour.precio <= filtroPrecioMax;
        const matchesRating = (tour.calificacion ?? 0) >= filtroRating;

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

    // Destinos destacados: top 6 tours ordenados por popularidad básica (o id para simular si no hay ratings)
    const destinosDestacados = [...tours].slice(0, 6);

    // Recomendados: Filtrar aquellos que tienen calificación y ordenar por mayor a menor
    const toursRecomendados = [...filteredTours].filter(t => t.calificacion && t.calificacion > 0).sort((a, b) => b.calificacion - a.calificacion);

    const filteredHoteles = hoteles.filter(hotel => {
        const term = searchTerm.toLowerCase();
        const loc = locationQuery.toLowerCase();
        
        const matchesSearch = hotel.nombre.toLowerCase().includes(term) ||
            (hotel.ciudad || '').toLowerCase().includes(term) ||
            (hotel.descripcion || '').toLowerCase().includes(term);
            
        const matchesLocation = (hotel.ciudad || '').toLowerCase().includes(loc);
        
        // El backend devuelve precio_noche, el mock devuelve precio. Manejamos ambos.
        const precio = hotel.precio_noche || hotel.precio || 0;
        const estrellas = hotel.estrellas || hotel.rating || 0;

        const matchesPrecio = precio <= filtroPrecioMax;
        const matchesRating = estrellas >= filtroRating;

        return matchesSearch && matchesLocation && matchesPrecio && matchesRating;
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
                        <button className="nav-fav-btn" title="Favoritos" onClick={() => navigate('/mis-favoritos')}>
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
                    <p className="hero-eyebrow">🌍 Descubre el mundo</p>
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
                                <input 
                                    type="text" 
                                    placeholder="¿A dónde vas?" 
                                    className="hero-search-input" 
                                    value={locationQuery}
                                    onChange={e => setLocationQuery(e.target.value)}
                                />
                            </div>
                             <button
                                className={`hero-geo-btn-modern ${isLocationFilterActive ? 'active' : ''}`}
                                onClick={handleGetLocation}
                                title={isLocationFilterActive ? 'Limpiar cercanía' : 'Buscar cerca de mí'}
                            >
                                <FaLocationArrow className="geo-icon" />
                            </button>
                            <button className="hero-search-btn" onClick={handleSearch}>
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
                        {destinosDestacados.map(dest => (
                            <div key={dest.id_tour} className="destino-card">
                                <div className="destino-img-wrap">
                                    <img 
                                        src={dest.imagen_portada ? `http://localhost:4000${dest.imagen_portada}` : `https://images.unsplash.com/photo-1551854304-25049c10e254?w=500&q=75&sig=${dest.id_tour}`} 
                                        alt={dest.nombre} 
                                        className="destino-img" 
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80'; }}
                                    />
                                    <div className="destino-overlay">
                                        <button className="btn-destino-ver" onClick={() => handleOpenDestino(dest)}>Ver experiencia <FaArrowRight /></button>
                                    </div>
                                    <span className="destino-tag">{dest.categoria || 'Aventura'}</span>
                                    <div className="destino-rating">⭐ {dest.calificacion || 'Nuevo'}</div>
                                </div>
                                <div className="destino-body">
                                    <h3 className="destino-nombre">{dest.nombre}</h3>
                                    <p className="destino-pais"><FaMapMarkerAlt /> {dest.ciudad_destino} · {dest.resenas || 0} reseñas</p>
                                    <div className="destino-footer">
                                        <span className="destino-desde">Desde <strong>${dest.precio}</strong></span>
                                        <button className="btn-destino-small" onClick={() => handleOpenDestino(dest)}>Ver más</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {destinosDestacados.length === 0 && !loading && (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>No hay destinos disponibles en este momento.</p>
                        )}
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
                        toursRecomendados.length > 0 ? (
                            <div className="tours-grid">
                            {toursRecomendados.map(tour => (
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
                                            <span className="tour-stars">{'⭐'.repeat(Math.round(tour.calificacion || 0))}</span>
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
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e2e8f0', border: '1px solid #ddd' }}>
                                                    {tour.foto_guia ? (
                                                        <img 
                                                            src={tour.foto_guia.startsWith('http') ? tour.foto_guia : `${API_URL}${tour.foto_guia}`} 
                                                            alt="" 
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}><FaUserCircle /></div>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '500' }}>
                                                    {tour.nombre_guia ? `${tour.nombre_guia} ${tour.apellido_guia || ''}` : <i style={{ color: '#94a3b8' }}>Por asignar</i>}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="tour-desde">Desde</p>
                                                {tour.en_oferta ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem' }}>${Number(tour.precio).toFixed(2)}</span>
                                                        <p className="tour-price-big" style={{ color: '#ef4444' }}>
                                                            ${(Number(tour.precio) * (1 - (tour.descuento || 0) / 100)).toFixed(2)} 
                                                            <small style={{ color: '#ef4444' }}>/persona</small>
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="tour-price-big">${Number(tour.precio).toFixed(2)} <small>/persona</small></p>
                                                )}
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
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                <FaStar style={{ fontSize: '3rem', color: '#fcd34d', marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '8px' }}>Aún no hay tours con calificaciones</h3>
                                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Reserva un tour, disfrútalo y sé el primero en dejar una reseña para que aparezca aquí.</p>
                            </div>
                        )
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
                        {ofertas.length > 0 ? (
                            ofertas.map(tour => {
                                                                const precioOriginal = Number(tour.precio);
                                                                const precioOferta = tour.descuento ? (precioOriginal * (1 - (tour.descuento / 100))) : precioOriginal;
                                                                const hasta = tour.fecha_fin ? new Date(tour.fecha_fin).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Tiempo limitado';
                                                                return (
                                                                    <div key={tour.id_tour} className="oferta-card">
                                                                        <div className="oferta-img-wrap">
                                                                            <img src={tour.imagen_portada ? `http://localhost:4000${tour.imagen_portada}` : `https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&q=80&sig=${tour.id_tour}`} alt={tour.nombre} />
                                                                            <div className="oferta-badge"><FaPercent /> {tour.descuento || 0}% OFF</div>
                                                                        </div>
                                                                        <div className="oferta-body">
                                                                            <p className="oferta-hasta">⏱️ Válido hasta {hasta}</p>
                                                                            <h3 className="oferta-titulo">{tour.nombre}</h3>
                                                                            <div className="oferta-precios">
                                                                                <span className="precio-antes">${precioOriginal.toFixed(2)}</span>
                                                                                <span className="precio-oferta">${precioOferta.toFixed(2)}</span>
                                                                            </div>
                                                                            <button className="btn-oferta" onClick={() => handleOpenReservation(tour)}>Aprovechar oferta <FaArrowRight /></button>
                                                                        </div>
                                                                    </div>
                                                                );
                            })
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                <FaCompass style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '12px' }} />
                                <p style={{ color: '#475569', fontSize: '1.1rem' }}>No hay ofertas especiales activas en este momento.</p>
                            </div>
                        )}
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
                        {filteredHoteles.map(hotel => (
                            <div key={hotel.id_hotel} className="hotel-card">
                                <div className="hotel-img-wrap">
                                    <img
                                        src={(() => {
                                            if (hotel.imagen_principal) return `http://localhost:4000${hotel.imagen_principal}`;
                                            try {
                                                const galeria = typeof hotel.fotos_galeria === 'string' ? JSON.parse(hotel.fotos_galeria) : hotel.fotos_galeria;
                                                if (Array.isArray(galeria) && galeria.length > 0) return `http://localhost:4000${galeria[0]}`;
                                            } catch (e) {}
                                            return `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80`;
                                        })()}
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
                                            <p className="hotel-precio" style={{ color: '#0ea5e9', fontWeight: 600 }}>{hotel.estado_convenio || 'Disponible'}</p>
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

            {/* ══════════════ 8. TESTIMONIOS (VOCES REALES) ══════════════ */}
            {resenas.length > 0 && (
                <section className="section-block testimonios-section">
                    <div className="section-wrap">
                        <div className="section-head centered">
                            <p className="section-eyebrow">💬 Voces reales</p>
                            <h2 className="section-title">Lo que dicen nuestros viajeros</h2>
                            <p className="section-desc">{resenas.length} reseñas verificadas de nuestros turistas</p>
                        </div>
                        <div className="testimonios-grid">
                            {resenas.map(r => {
                                const iniciales = `${(r.primer_nombre || 'U')[0]}${(r.apellido_paterno || '?')[0]}`.toUpperCase();
                                const colores = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
                                const color = colores[r.id_resena % colores.length];
                                const emojiTipo = r.tipo === 'hotel' ? '🏨' : '🗺e️';
                                return (
                                    <div key={`${r.tipo}-${r.id_resena}`} className="testimonio-card">
                                        <div className="test-stars">{'⭐'.repeat(Math.min(r.calificacion, 5))}</div>
                                        <p className="test-comentario">"{r.comentario}"</p>
                                        <div className="test-user">
                                            <div className="test-avatar" style={{ background: color }}>{iniciales}</div>
                                            <div>
                                                <p className="test-nombre">{r.primer_nombre} {r.apellido_paterno}</p>
                                                <p className="test-info">{emojiTipo} Visió {r.destino}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}


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
                            <p className="footer-desc">Tu agencia de turismo de confianza en el mundo. Experiencias únicas, guías expertos y memorias para toda la vida.</p>
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
                                <p><FaPhone /> +593 97 879 9437</p>
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
                isFavorite={selectedTour && favorites.includes(selectedTour.id_tour || selectedTour.id)}
                onToggleFavorite={(id) => toggleFavorite(id, selectedTour?.es_hotel ? 'hotel' : 'tour')}
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
