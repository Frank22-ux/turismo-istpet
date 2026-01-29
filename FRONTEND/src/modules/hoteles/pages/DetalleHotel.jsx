import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaStar, FaMapMarkerAlt, FaPhone, FaArrowLeft, 
    FaInfoCircle, FaImages, FaTimes 
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './DetalleHotel.css';

// Configuración de iconos para Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = 'http://localhost:4000';

const DetalleHotel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- ESTADO PARA EL MODAL DE IMAGEN ---
    const [selectedImg, setSelectedImg] = useState(null);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/hoteles/${id}`);
                setHotel(response.data);
            } catch (error) {
                console.error("Error al cargar el hotel:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHotel();
    }, [id]);

    if (loading) return <div className="loader">Cargando detalles del hotel...</div>;
    if (!hotel) return <div className="error-msg">Hotel no encontrado</div>;

    return (
        <div className="detalle-hotel-container">
            {/* MODAL DE IMAGEN (LIGHTBOX) */}
            {selectedImg && (
                <div className="image-modal-overlay" onClick={() => setSelectedImg(null)}>
                    <button className="close-modal-btn"><FaTimes /></button>
                    <img src={selectedImg} alt="Enfoque" className="modal-content-img" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            <button className="btn-back-detalle" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Volver
            </button>

            <div className="detalle-grid">
                <div className="detalle-media">
                    <div className="main-image-wrapper" onClick={() => setSelectedImg(`${API_URL}${hotel.foto_url}`)}>
                        <img 
                            src={hotel.foto_url ? `${API_URL}${hotel.foto_url}` : 'https://via.placeholder.com/600x400'} 
                            alt={hotel.nombre} 
                            className="hotel-main-img clickable"
                        />
                        <div className="stars-badge">
                            {[...Array(hotel.estrellas)].map((_, i) => <FaStar key={i} />)}
                        </div>
                        <div className="zoom-hint">Haga clic para ampliar</div>
                    </div>

                    {hotel.galeria && hotel.galeria.length > 0 && (
                        <div className="gallery-section">
                            <h3><FaImages /> Galería de Fotos</h3>
                            <div className="gallery-thumbs-grid">
                                {hotel.galeria.map((img, index) => (
                                    <img 
                                        key={index} 
                                        src={`${API_URL}${img}`} 
                                        alt={`Galería ${index}`} 
                                        className="thumb-img"
                                        onClick={() => setSelectedImg(`${API_URL}${img}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="detalle-info-card">
                    <h1 className="hotel-title">{hotel.nombre}</h1>
                    <p className="hotel-city"><strong>Ciudad:</strong> {hotel.ciudad}</p>
                    
                    <div className="info-item">
                        <FaMapMarkerAlt className="icon-blue" />
                        <span>{hotel.direccion}</span>
                    </div>

                    <div className="info-item">
                        <FaPhone className="icon-green" />
                        <span>{hotel.telefono || 'No registrado'}</span>
                    </div>

                    <div className="description-box">
                        <h3><FaInfoCircle /> Descripción</h3>
                        <p>{hotel.descripcion || 'Sin descripción disponible.'}</p>
                    </div>

                    {hotel.latitud && hotel.longitud && (
                        <div className="map-container-detalle">
                            <h3>Ubicación Exacta</h3>
                            <div className="map-frame">
                                <MapContainer 
                                    center={[parseFloat(hotel.latitud), parseFloat(hotel.longitud)]} 
                                    zoom={15} 
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[parseFloat(hotel.latitud), parseFloat(hotel.longitud)]}>
                                        <Popup>{hotel.nombre}</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetalleHotel;