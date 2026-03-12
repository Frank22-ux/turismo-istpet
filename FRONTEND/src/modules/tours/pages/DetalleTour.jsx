import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTourRequest } from '../services/tour.service';
import { 
    FaArrowLeft, 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaDollarSign, 
    FaClock, 
    FaHotel, 
    FaUserTie, 
    FaUsers, 
    FaStar, 
    FaListUl, 
    FaGlobe, 
    FaMountain, 
    FaInfoCircle,
    FaCheckCircle,
    FaMapMarkedAlt
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AdminLayout from '../../admin/layouts/AdminLayout';
import './DetalleTour.css';

const API_URL = 'http://localhost:4000';

const DetalleTour = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarTour = async () => {
            try {
                const data = await getTourRequest(id);
                setTour(data);
            } catch (error) {
                console.error("Error al cargar detalle:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarTour();
    }, [id]);

    if (loading) return (
        <AdminLayout>
            <div className="loading-container">
                <div className="loader"></div>
                <p>Cargando detalles del tour...</p>
            </div>
        </AdminLayout>
    );

    if (!tour) return (
        <AdminLayout>
            <div className="error-container">
                <h2>Tour no encontrado</h2>
                <button className="btn-back-modern" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Regresar
                </button>
            </div>
        </AdminLayout>
    );

    // Helpers para campos JSON
    const parseJson = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
            return JSON.parse(val);
        } catch (e) {
            return [];
        }
    };

    const galeria = parseJson(tour.galeria);
    const idiomas = parseJson(tour.idiomas);
    const incluye = parseJson(tour.incluye);
    const puntos = parseJson(tour.puntos_interes);

    const mainImage = tour.imagen_portada 
        ? (tour.imagen_portada.startsWith('http') ? tour.imagen_portada : `${API_URL}${tour.imagen_portada}`)
        : `https://images.unsplash.com/photo-1551854304-25049c10e254?w=800&q=80`;

    const cuposDisponibles = tour.maximo_personas - (tour.cupos_ocupados || 0);

    const content = (
        <div className="tour-detail-modern">
            {/* Header / Breadcrumbs Style */}
            <div className="detail-top-bar">
                <button className="btn-back-link" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Volver a Gestión
                </button>
                <div className="badges-header">
                    <span className={`badge-category ${tour.categoria?.toLowerCase() || 'aventura'}`}>
                        {tour.categoria || 'Aventura'}
                    </span>
                    <span className={`badge-difficulty ${tour.dificultad?.toLowerCase() || 'moderada'}`}>
                        <FaMountain /> {tour.dificultad || 'Moderada'}
                    </span>
                </div>
            </div>

            <div className="detail-main-layout">
                {/* SECCIÓN IZQUIERDA: Imágenes y Mapa */}
                <div className="detail-visuals">
                    <div className="main-image-card">
                        <img src={mainImage} alt={tour.nombre} />
                        <div className="price-overlay">
                            <span className="price-value">${Number(tour.precio).toFixed(2)}</span>
                            <span className="price-label">por persona</span>
                        </div>
                    </div>

                    {galeria.length > 0 && (
                        <div className="galeria-modern">
                            <h3>Galería de Imágenes</h3>
                            <div className="galeria-scroll">
                                {galeria.map((img, idx) => (
                                    <img 
                                        key={idx} 
                                        src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                                        alt={`Vista ${idx}`} 
                                        onClick={() => window.open(img.startsWith('http') ? img : `${API_URL}${img}`, '_blank')}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {tour.latitud && tour.longitud && (
                        <div className="map-card">
                            <h3><FaMapMarkedAlt /> Ubicación del Tour</h3>
                            <div className="map-container-wrapper">
                                <MapContainer 
                                    center={[parseFloat(tour.latitud), parseFloat(tour.longitud)]} 
                                    zoom={14} 
                                    scrollWheelZoom={false}
                                    style={{ height: '300px', width: '100%', borderRadius: '12px' }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[parseFloat(tour.latitud), parseFloat(tour.longitud)]}>
                                        <Popup>{tour.nombre}</Popup>
                                    </Marker>
                                </MapContainer>
                                <div className="map-coords">
                                    <span>Lat: {tour.latitud}</span>
                                    <span>Long: {tour.longitud}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECCIÓN DERECHA: Información Detallada */}
                <div className="detail-content">
                    <div className="info-main-card">
                        <h1 className="tour-title">{tour.nombre}</h1>
                        <p className="tour-location"><FaMapMarkerAlt /> {tour.ciudad_destino}, Ecuador</p>
                        
                        <div className="stats-grid">
                            <div className="stat-box">
                                <FaClock className="icon-blue" />
                                <div className="stat-text">
                                    <span className="stat-label">Duración</span>
                                    <span className="stat-val">{tour.duracion}</span>
                                </div>
                            </div>
                            <div className="stat-box">
                                <FaUsers className="icon-green" />
                                <div className="stat-text">
                                    <span className="stat-label">Capacidad</span>
                                    <span className="stat-val">{tour.maximo_personas} personas</span>
                                </div>
                            </div>
                            <div className="stat-box">
                                <FaStar className="icon-orange" />
                                <div className="stat-text">
                                    <span className="stat-label">Disponibilidad</span>
                                    <span className="stat-val">{cuposDisponibles} cupos libres</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="info-group-grid">
                        <div className="info-block">
                            <h3><FaInfoCircle /> Descripción</h3>
                            <p className="description-text">{tour.descripcion || "No hay una descripción detallada para este tour."}</p>
                        </div>

                        <div className="info-block">
                            <h3><FaCalendarAlt /> Fechas del Tour</h3>
                            <div className="dates-display">
                                <div className="date-item">
                                    <span className="date-label">Inicia</span>
                                    <span className="date-val">{tour.fecha_inicio ? new Date(tour.fecha_inicio).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="date-divider"></div>
                                <div className="date-item">
                                    <span className="date-label">Finaliza</span>
                                    <span className="date-val">{tour.fecha_fin ? new Date(tour.fecha_fin).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="details-cards-grid">
                        {/* Hotel y Guía */}
                        <div className="side-card">
                            <h3>Servicios Base</h3>
                            <div className="service-item">
                                <FaHotel className="svc-icon" />
                                <div>
                                    <span className="svc-label">Hotel de Alojamiento</span>
                                    <span className="svc-val">{tour.nombre_hotel || 'No especificado'}</span>
                                </div>
                            </div>
                            <div className="service-item">
                                <div className="guide-avatar-detail">
                                    {tour.foto_guia ? (
                                        <img src={tour.foto_guia.startsWith('http') ? tour.foto_guia : `${API_URL}${tour.foto_guia}`} alt="Guía" />
                                    ) : (
                                        <FaUserTie />
                                    )}
                                </div>
                                <div>
                                    <span className="svc-label">Guía a Cargo</span>
                                    <span className="svc-val">{tour.nombre_guia ? `${tour.nombre_guia} ${tour.apellido_guia || ''}` : 'Sin guía asignado'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Otros detalles */}
                        <div className="side-card">
                            <h3>Logística</h3>
                            <div className="logistic-item">
                                <FaGlobe />
                                <div>
                                    <span className="svc-label">Idiomas</span>
                                    <div className="tag-container">
                                        {idiomas.length > 0 ? idiomas.map((l, i) => <span key={i} className="tag-mini">{l}</span>) : 'Español'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="list-sections-grid">
                        <div className="list-block">
                            <h3><FaCheckCircle /> ¿Qué incluye?</h3>
                            <ul className="modern-list">
                                {incluye.length > 0 ? incluye.map((item, i) => (
                                    <li key={i}>{item}</li>
                                )) : <li>Información no disponible</li>}
                            </ul>
                        </div>
                        <div className="list-block">
                            <h3><FaMapMarkerAlt /> Puntos de Interés</h3>
                            <ul className="modern-list dots">
                                {puntos.length > 0 ? puntos.map((item, i) => (
                                    <li key={i}>{item}</li>
                                )) : <li>Por definir</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return <AdminLayout>{content}</AdminLayout>;
};

export default DetalleTour;