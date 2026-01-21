import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToursRequest } from '../../tours/services/tour.service';
import { 
    FaMapMarkerAlt, FaClock, FaCalendarAlt, FaSearch, 
    FaLocationArrow, FaTimes, FaUserCircle, FaSuitcase, FaSignOutAlt, FaUserEdit 
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

    const RADIUS_KM = 40; // Radio estricto de búsqueda

    useEffect(() => {
        cargarTours();
    }, []);

    const cargarTours = async () => {
        try {
            const data = await getToursRequest();
            setTours(data);
        } catch (error) {
            console.error("Error al cargar catálogo:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // --- FÓRMULA MATEMÁTICA HAVERSINE ---
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radio de la Tierra en KM
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; 
    };

    const handleGetLocation = () => {
        if (isLocationFilterActive) {
            setIsLocationFilterActive(false);
            setUserLocation(null);
            return;
        }

        // Solicitar ubicación en tiempo real
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setIsLocationFilterActive(true);
            },
            () => alert("⚠️ Por favor, activa los permisos de ubicación en tu navegador para usar esta función.")
        );
    };

    // --- SISTEMA DE FILTRADO DINÁMICO ---
    const filteredTours = tours.filter(tour => {
        // 1. Filtro por texto (Nombre o Ciudad)
        const matchesSearch = tour.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tour.ciudad_destino.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 2. Filtro Geográfico Estricto
        if (isLocationFilterActive && userLocation) {
            // Si las coordenadas no existen en la DB, el tour desaparece por seguridad
            if (!tour.latitud || !tour.longitud) return false;

            const distance = calculateDistance(
                userLocation.lat, 
                userLocation.lng, 
                parseFloat(tour.latitud), 
                parseFloat(tour.longitud)
            );
            
            // Retorna TRUE solo si cumple búsqueda Y está dentro del radio
            return matchesSearch && distance <= RADIUS_KM;
        }
        
        // Si el filtro no está activo, solo filtra por texto
        return matchesSearch;
    });

    if (loading) return <div className="loading-screen">Cargando experiencias...</div>;

    return (
        <div className="turista-dashboard">
            <nav className="navbar-turista">
                <div className="nav-logo">
                    <span className="logo-icon">🌍</span>
                    <span className="logo-text">TravelExplor</span>
                </div>

                <div className="nav-actions">
                    <div className="user-menu-container">
                        <button className="btn-user-menu" onClick={() => setShowUserMenu(!showUserMenu)}>
                            <FaUserCircle /> Mi Cuenta
                        </button>
                        {showUserMenu && (
                            <div className="dropdown-menu">
                                <Link to="/perfil-turista" className="menu-item"><FaUserEdit /> Mi Perfil</Link>
                                <Link to="/mis-reservas" className="menu-item"><FaSuitcase /> Mis Reservas</Link>
                                <hr />
                                <button onClick={handleLogout} className="menu-item logout"><FaSignOutAlt /> Cerrar Sesión</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <header className="hero-section">
                <div className="hero-content">
                    <h1>¡Descubre el mundo! ✈️</h1>
                    <div className="search-and-filter">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Busca por nombre o ciudad..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            className={`btn-location ${isLocationFilterActive ? 'active' : ''}`}
                            onClick={handleGetLocation}
                            title={isLocationFilterActive ? "Ver todos los tours" : "Ver tours cerca de mí"}
                        >
                            {isLocationFilterActive ? <FaTimes /> : <FaLocationArrow />}
                            {isLocationFilterActive ? " Quitar Filtro" : " Cerca de mí"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="catalog-container">
                {isLocationFilterActive && (
                    <div className="filter-status-bar">
                        📍 Mostrando solo tours en un radio de <strong>{RADIUS_KM} km</strong> a la redonda.
                    </div>
                )}

                <div className="tours-grid">
                    {filteredTours.map((tour) => (
                        <div key={tour.id_tour} className="tour-card">
                            <div className="tour-badge">${Number(tour.precio).toFixed(0)}</div>
                            <div className="tour-card-image">
                                <img src={`${API_URL}${tour.imagen_portada}`} alt={tour.nombre} />
                            </div>
                            <div className="tour-card-body">
                                <span className="tour-city"><FaMapMarkerAlt /> {tour.ciudad_destino}</span>
                                <h3 className="tour-name">{tour.nombre}</h3>
                                <div className="tour-card-footer">
                                    <button onClick={() => navigate(`/admin/detalle-tour/${tour.id_tour}`)} className="btn-details">Detalles</button>
                                    <button className="btn-reserve">Reservar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MENSAJE CUANDO NO HAY NADA EN EL RADIO */}
                {filteredTours.length === 0 && (
                    <div className="no-results-friendly">
                        <div className="no-results-icon">🕵️</div>
                        <h3>No hay tours en esta zona</h3>
                        <p>
                            {isLocationFilterActive 
                                ? `Actualmente no tenemos tours registrados en un radio de ${RADIUS_KM}km de tu ubicación actual.` 
                                : "No hay tours que coincidan con tu búsqueda."}
                        </p>
                        {isLocationFilterActive && (
                            <button onClick={handleGetLocation} className="btn-clear-filter">
                                Ver tours de todo el país
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TuristaDashboard;