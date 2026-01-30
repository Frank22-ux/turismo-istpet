import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToursRequest } from '../../tours/services/tour.service';
import { 
    FaMapMarkerAlt, FaClock, FaCalendarAlt, FaSearch, 
    FaLocationArrow, FaTimes, FaUserCircle, FaSuitcase, 
    FaSignOutAlt, FaUserEdit, FaHotel, FaUserTie,
    FaCompass, FaInfoCircle
} from 'react-icons/fa';
import './TuristaDashboard.css';

const API_URL = 'http://localhost:4000';

const TuristaDashboard = () => {
    const [tours, setTours] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [isLocationFilterActive, setIsLocationFilterActive] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const RADIUS_KM = 40; 

    // Cargar tours al montar el componente
    useEffect(() => {
        cargarTours();
        
        // Cerrar el menú si se hace click fuera
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const cargarTours = async () => {
        try {
            setLoading(true);
            const data = await getToursRequest();
            setTours(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al cargar catálogo:", error);
            setTours([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Fórmula Haversine para calcular distancia
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; 
    };

    const handleGetLocation = () => {
        if (isLocationFilterActive) {
            setIsLocationFilterActive(false);
            setUserLocation(null);
            return;
        }

        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ 
                    lat: pos.coords.latitude, 
                    lng: pos.coords.longitude 
                });
                setIsLocationFilterActive(true);
            },
            (error) => {
                console.error("Error obteniendo ubicación:", error);
                alert("No pudimos obtener tu ubicación. Por favor, activa los permisos de ubicación en tu navegador.");
            }
        );
    };

    // Filtrado de tours
    const filteredTours = tours.filter(tour => {
        const matchesSearch = tour.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tour.ciudad_destino?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (isLocationFilterActive && userLocation) {
            if (!tour.latitud || !tour.longitud) return false;
            const distance = calculateDistance(
                userLocation.lat, 
                userLocation.lng, 
                parseFloat(tour.latitud), 
                parseFloat(tour.longitud)
            );
            return matchesSearch && distance <= RADIUS_KM;
        }
        return matchesSearch;
    });

    const handleViewDetails = (tourId) => {
        navigate(`/tour/${tourId}`);
    };

    const handleReserve = (tourId) => {
        navigate(`/reservar/${tourId}`);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <FaCompass className="spin-icon" style={{ marginRight: '0.5rem', animation: 'spin 2s linear infinite' }} />
                Cargando experiencias increíbles...
            </div>
        );
    }

    return (
        <div className="turista-dashboard">
            {/* ===== NAVBAR ===== */}
            <nav className="navbar-turista">
                <div className="nav-logo" onClick={() => navigate('/home')}>
                    <span className="logo-icon">🌍</span>
                    <span className="logo-text">TravelExplor</span>
                </div>

                <div className="nav-actions">
                    <div className="user-menu-container">
                        <button 
                            className="btn-user-menu" 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            aria-label="Abrir menú de usuario"
                        >
                            <FaUserCircle />
                            <span>Mi Cuenta</span>
                        </button>
                        
                        {showUserMenu && (
                            <div className="dropdown-menu">
                                <Link 
                                    to="/perfil-turista" 
                                    className="menu-item"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <FaUserEdit />
                                    <span>Mi Perfil</span>
                                </Link>
                                <Link 
                                    to="/mis-reservas" 
                                    className="menu-item"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <FaSuitcase />
                                    <span>Mis Reservas</span>
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="menu-item logout"
                                >
                                    <FaSignOutAlt />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <header className="hero-section">
                <div className="hero-content">
                    <h1>Descubre tu próxima aventura</h1>
                    <p>Experiencias auténticas que recordarás para siempre</p>
                    
                    <div className="search-and-filter">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar destinos, ciudades o actividades..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Buscar tours"
                            />
                        </div>
                        
                        <button 
                            className={`btn-location ${isLocationFilterActive ? 'active' : ''}`}
                            onClick={handleGetLocation}
                            aria-label={isLocationFilterActive ? "Quitar filtro de ubicación" : "Filtrar por ubicación cercana"}
                        >
                            {isLocationFilterActive ? <FaTimes /> : <FaLocationArrow />}
                            {isLocationFilterActive ? "Quitar Filtro" : "Cerca de mí"}
                        </button>
                    </div>
                    
                    {isLocationFilterActive && (
                        <div className="location-info">
                            <FaMapMarkerAlt /> Mostrando tours dentro de {RADIUS_KM}km
                        </div>
                    )}
                </div>
            </header>

            {/* ===== CATÁLOGO DE TOURS ===== */}
            <main className="catalog-container">
                {isLocationFilterActive && (
                    <div className="filter-status-bar">
                        <FaInfoCircle />
                        Filtrando tours cerca de tu ubicación ({RADIUS_KM}km de radio)
                    </div>
                )}

                <div className="section-header">
                    <h2 className="section-title">
                        {searchTerm 
                            ? `Resultados para "${searchTerm}"` 
                            : 'Todas las experiencias'
                        }
                    </h2>
                    <p className="section-subtitle">
                        {filteredTours.length} {filteredTours.length === 1 ? 'experiencia encontrada' : 'experiencias encontradas'}
                    </p>
                </div>

                {filteredTours.length > 0 ? (
                    <div className="tours-grid">
                        {filteredTours.map((tour) => (
                            <div key={tour.id_tour} className="tour-card">
                                {/* Badge de precio */}
                                <div className="tour-badge">
                                    ${Number(tour.precio).toFixed(0)}
                                </div>
                                
                                {/* Iconos de servicios */}
                                <div className="tour-services-icons">
                                    {tour.id_hotel_base && (
                                        <span className="icon-tag" title="Incluye Hotel">
                                            <FaHotel />
                                        </span>
                                    )}
                                    {tour.id_guia && (
                                        <span className="icon-tag" title="Guía Profesional">
                                            <FaUserTie />
                                        </span>
                                    )}
                                </div>

                                {/* Imagen */}
                                <div className="tour-card-image">
                                    <img 
                                        src={tour.imagen_portada 
                                            ? `${API_URL}${tour.imagen_portada}` 
                                            : 'https://via.placeholder.com/400x267?text=Tour+Image'
                                        } 
                                        alt={tour.nombre}
                                        loading="lazy"
                                    />
                                </div>
                                
                                {/* Cuerpo de la card */}
                                <div className="tour-card-body">
                                    <span className="tour-city">
                                        <FaMapMarkerAlt />
                                        {tour.ciudad_destino || 'Destino'}
                                    </span>
                                    
                                    <h3 className="tour-name">
                                        {tour.nombre || 'Tour sin nombre'}
                                    </h3>
                                    
                                    <p className="tour-description-short">
                                        {tour.descripcion 
                                            ? tour.descripcion.substring(0, 100) + (tour.descripcion.length > 100 ? '...' : '')
                                            : 'Descubre esta increíble experiencia con nosotros.'
                                        }
                                    </p>
                                    
                                    {/* Footer con botones */}
                                    <div className="tour-card-footer">
                                        <button 
                                            onClick={() => handleViewDetails(tour.id_tour)} 
                                            className="btn-details"
                                            aria-label={`Ver detalles de ${tour.nombre}`}
                                        >
                                            <FaInfoCircle />
                                            Detalles
                                        </button>
                                        <button 
                                            onClick={() => handleReserve(tour.id_tour)}
                                            className="btn-reserve"
                                            aria-label={`Reservar ${tour.nombre}`}
                                        >
                                            <FaCalendarAlt />
                                            Reservar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results-friendly">
                        <div className="no-results-icon">🔍</div>
                        <h3>No encontramos resultados</h3>
                        <p>
                            {isLocationFilterActive 
                                ? `No hay tours disponibles en un radio de ${RADIUS_KM}km de tu ubicación.`
                                : searchTerm 
                                    ? `No encontramos tours que coincidan con "${searchTerm}".`
                                    : 'No hay tours disponibles en este momento.'
                            }
                        </p>
                        {(searchTerm || isLocationFilterActive) && (
                            <button 
                                className="btn-clear-filter"
                                onClick={() => {
                                    setSearchTerm('');
                                    setIsLocationFilterActive(false);
                                    setUserLocation(null);
                                }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TuristaDashboard;
