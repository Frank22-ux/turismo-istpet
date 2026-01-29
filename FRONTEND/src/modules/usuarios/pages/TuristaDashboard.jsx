import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToursRequest } from '../../tours/services/tour.service';
import { 
    FaMapMarkerAlt, FaClock, FaCalendarAlt, FaSearch, 
    FaLocationArrow, FaTimes, FaUserCircle, FaSuitcase, FaSignOutAlt, FaUserEdit,
    FaHotel, FaUserTie 
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

    // Usamos un efecto para cargar tours al montar y cada vez que el componente gane foco
    useEffect(() => {
        cargarTours();
    }, []);

    const cargarTours = async () => {
        try {
            setLoading(true);
            // Forzamos la obtención de datos frescos del backend
            const data = await getToursRequest();
            setTours(Array.isArray(data) ? data : []);
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

    // --- FÓRMULA HAVERSINE ---
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; 
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

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setIsLocationFilterActive(true);
            },
            () => alert("⚠️ Por favor, activa los permisos de ubicación para filtrar tours cercanos.")
        );
    };

    const filteredTours = tours.filter(tour => {
        const matchesSearch = tour.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tour.ciudad_destino.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (isLocationFilterActive && userLocation) {
            if (!tour.latitud || !tour.longitud) return false;
            const distance = calculateDistance(
                userLocation.lat, userLocation.lng, 
                parseFloat(tour.latitud), parseFloat(tour.longitud)
            );
            return matchesSearch && distance <= RADIUS_KM;
        }
        return matchesSearch;
    });

    if (loading) return <div className="loading-screen">Cargando experiencias reales...</div>;

    return (
        <div className="turista-dashboard">
            <nav className="navbar-turista">
                <div className="nav-logo" onClick={() => navigate('/home')} style={{cursor:'pointer'}}>
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
                    <h1>Explora nuevas aventuras 🏔️</h1>
                    <div className="search-and-filter">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Ciudad, hotel o actividad..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            className={`btn-location ${isLocationFilterActive ? 'active' : ''}`}
                            onClick={handleGetLocation}
                        >
                            {isLocationFilterActive ? <FaTimes /> : <FaLocationArrow />}
                            {isLocationFilterActive ? " Quitar Filtro" : " Cerca de mí"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="catalog-container">
                <div className="tours-grid">
                    {filteredTours.map((tour) => (
                        <div key={tour.id_tour} className="tour-card">
                            {/* BADGE DE PRECIO */}
                            <div className="tour-badge">${Number(tour.precio).toFixed(0)}</div>
                            
                            {/* ICONOS DE SERVICIOS INCLUIDOS */}
                            <div className="tour-services-icons">
                                {tour.id_hotel_base && <span className="icon-tag" title="Incluye Hotel"><FaHotel /></span>}
                                {tour.id_guia && <span className="icon-tag" title="Guía Profesional"><FaUserTie /></span>}
                            </div>

                            <div className="tour-card-image">
                                <img src={tour.imagen_portada ? `${API_URL}${tour.imagen_portada}` : 'https://via.placeholder.com/300x200'} alt={tour.nombre} />
                            </div>
                            
                            <div className="tour-card-body">
                                <span className="tour-city"><FaMapMarkerAlt /> {tour.ciudad_destino}</span>
                                <h3 className="tour-name">{tour.nombre}</h3>
                                <p className="tour-description-short">
                                    {tour.descripcion ? tour.descripcion.substring(0, 80) + '...' : 'Explora esta increíble actividad con nosotros.'}
                                </p>
                                
                                <div className="tour-card-footer">
                                    <button 
                                        onClick={() => navigate(`/admin/detalle-tour/${tour.id_tour}`)} 
                                        className="btn-details"
                                    >
                                        Ver Detalles
                                    </button>
                                    <button className="btn-reserve">Reservar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {filteredTours.length === 0 && (
                    <div className="no-results">
                        <h3>No encontramos lo que buscas, intenta con otra ciudad o nombre.</h3>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TuristaDashboard;