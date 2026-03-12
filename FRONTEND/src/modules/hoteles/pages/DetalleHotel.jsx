import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../core/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaStar, FaMapMarkerAlt, FaBed, FaArrowLeft, FaCheck, FaClock, FaPhone, FaEnvelope, FaWheelchair, FaShuttleVan, FaConciergeBell, FaChild, FaPaw, FaWifi, FaSwimmingPool, FaUtensils } from 'react-icons/fa';
import './DetalleHotel.css';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DetalleHotel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await api.get(`/hoteles/${id}`);
                setHotel(res.data);
            } catch (error) {
                console.error("Error fetching hotel:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHotel();
    }, [id]);

    if (loading) return <div className="loading-state">Cargando detalles...</div>;
    if (!hotel) return <div className="error-state">Hotel no encontrado</div>;

    const position = [hotel.latitud || -0.1807, hotel.longitud || -78.4678]; // Default a Quito si no hay coordenadas

    const getFotos = (fotos) => {
        if (!fotos) return [];
        if (Array.isArray(fotos)) return fotos;
        try {
            const parsed = JSON.parse(fotos);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            if (typeof fotos === 'string' && fotos.includes(',')) {
                return fotos.split(',').map(f => f.trim());
            }
            return [fotos];
        }
    };

    const fotos = getFotos(hotel.fotos_galeria);
    
    // Imagen principal: Prioridad 1: imagen_principal, Prioridad 2: primera de galería, Prioridad 3: Mock
    const mainImg = hotel.imagen_principal 
        ? `http://localhost:4000${hotel.imagen_principal}` 
        : (fotos.length > 0 
            ? (fotos[0].startsWith('http') ? fotos[0] : `http://localhost:4000${fotos[0]}`)
            : `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80`);

    return (
        <div className="detalle-hotel-page">
            {/* HER0 - Imagen Principal Blur + Focus */}
            <div className="detalle-hero-hotel">
                <div className="hero-bg-blur" style={{ backgroundImage: `url(${mainImg})` }}></div>
                <img src={mainImg} alt={hotel.nombre} className="hero-img-focus" />
                <button className="btn-back-hero" onClick={() => navigate(-1)}><FaArrowLeft /> Volver</button>
            </div>

            <div className="detalle-content-hotel">
                <div className="detalle-main-hotel">
                    <div className="hotel-title-section">
                        <div className="hotel-title-row">
                            <h1>{hotel.nombre}</h1>
                            <div className="hotel-stars-badge">
                                {'⭐'.repeat(hotel.estrellas || 3)}
                            </div>
                        </div>
                        <p className="hotel-city-sub"><FaMapMarkerAlt /> {hotel.direccion}, {hotel.ciudad}</p>
                    </div>

                    <div className="hotel-desc-section">
                        <h2>Acerca del hotel</h2>
                        <p>{hotel.descripcion || 'Sin descripción disponible.'}</p>
                        
                        <div className="hotel-quick-stats">
                            <div className="hq-stat"><FaBed className="hq-icon"/> <span>{hotel.habitaciones_disponibles} cuartos</span></div>
                            <div className="hq-stat"><FaClock className="hq-icon"/> <span>Entrada: {hotel.hora_entrada ? hotel.hora_entrada.substring(0, 5) : '14:00'}</span></div>
                            <div className="hq-stat"><FaClock className="hq-icon"/> <span>Salida: {hotel.hora_salida ? hotel.hora_salida.substring(0, 5) : '12:00'}</span></div>
                        </div>
                    </div>

                    <div className="hotel-amenities">
                        <h2>Amenidades Destacadas</h2>
                        <div className="amenities-grid-modern">
                            {(hotel.amenidades || '').split(',').map((am, i) => {
                                const text = am.trim().toLowerCase();
                                let Icon = FaCheck;
                                if (text.includes('wifi')) Icon = FaWifi;
                                else if (text.includes('piscina')) Icon = FaSwimmingPool;
                                else if (text.includes('comida') || text.includes('restaurante')) Icon = FaUtensils;
                                else if (text.includes('accesibilidad')) Icon = FaWheelchair;
                                else if (text.includes('lavandería')) Icon = FaShuttleVan; // Or other icon
                                else if (text.includes('habitación')) Icon = FaConciergeBell;
                                else if (text.includes('niños')) Icon = FaChild;
                                else if (text.includes('mascotas')) Icon = FaPaw;

                                return (
                                    <div key={i} className="amenity-card-modern">
                                        <Icon className="am-icon-modern"/>
                                        <span>{am.trim()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="hotel-contact-section">
                        <h2>Información de Contacto</h2>
                        <div className="contact-grid-modern">
                            <div className="contact-item-modern">
                                <FaPhone className="contact-icon"/>
                                <div>
                                    <p className="contact-label">Teléfono</p>
                                    <p className="contact-value">{hotel.telefono || 'No disponible'}</p>
                                </div>
                            </div>
                            <div className="contact-item-modern">
                                <FaEnvelope className="contact-icon"/>
                                <div>
                                    <p className="contact-label">Correo Electrónico</p>
                                    <p className="contact-value">{hotel.correo_electronico || 'No disponible'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {fotos.length > 0 && (
                        <div className="hotel-gallery-modern">
                            <h2>Galería de Fotos</h2>
                            <div className="gallery-grid-modern">
                                {fotos.map((foto, i) => (
                                    <img key={i} src={foto.startsWith('http') ? foto : `http://localhost:4000${foto}`} alt={`Foto ${i}`} className="gallery-img-modern" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="detalle-sidebar">
                    <div className="booking-card-modern">
                        <div className="booking-card-header">
                            <span className="price-label">Precio por noche</span>
                            <div className="price-big-modern">${hotel.precio_noche} <span>USD</span></div>
                        </div>
                        <hr className="booking-divider" />
                        <ul className="booking-benefits">
                            <li><FaCheck color="#10b981"/> Desayuno incluido</li>
                            <li><FaCheck color="#10b981"/> Cancelación gratuita</li>
                            <li><FaCheck color="#10b981"/> WiFi de alta velocidad</li>
                        </ul>
                        <button className="btn-reserve-now">Ver Disponibilidad</button>
                    </div>

                    <div className="map-card-modern">
                        <h3>Ubicación exacta</h3>
                        <p className="map-city-text">{hotel.ciudad}</p>
                        <div className="map-container-wrapper">
                            <MapContainer center={position} zoom={15} scrollWheelZoom={false}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <Marker position={position}>
                                    <Popup>{hotel.nombre}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleHotel;
