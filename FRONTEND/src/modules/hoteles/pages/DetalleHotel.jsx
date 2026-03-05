import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../core/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaStar, FaMapMarkerAlt, FaBed, FaArrowLeft, FaCheck } from 'react-icons/fa';
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

    return (
        <div className="detalle-hotel-page">
            <header className="detalle-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Volver
                </button>
                <h1>{hotel.nombre}</h1>
            </header>

            <div className="detalle-container">
                <div className="detalle-info">
                    <div className="hotel-gallery">
                        {fotos.length > 0 ?
                            fotos.map((foto, i) => (
                                <img key={i} src={foto.startsWith('http') ? foto : `http://localhost:4000${foto}`} alt={`Foto ${i}`} className="gallery-img" />
                            ))
                            : <div className="no-photo">No hay fotos disponibles</div>
                        }
                    </div>

                    <div className="hotel-desc-section">
                        <h2>Descripción</h2>
                        <p>{hotel.descripcion || 'Sin descripción disponible.'}</p>

                        <div className="hotel-stats">
                            <span className="stat-item"><FaStar /> {hotel.estrellas} Estrellas</span>
                            <span className="stat-item"><FaBed /> {hotel.habitaciones_disponibles} Habitaciones disp.</span>
                            <span className="stat-item"><FaCheck /> ${hotel.precio_noche} / noche</span>
                        </div>
                    </div>

                    <div className="hotel-amenities">
                        <h2>Amenidades</h2>
                        <div className="amenities-list">
                            {(hotel.amenidades || '').split(',').map((am, i) => (
                                <span key={i} className="amenity-tag">{am.trim()}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="detalle-sidebar">
                    <div className="map-card">
                        <h3>Ubicación</h3>
                        <p><FaMapMarkerAlt /> {hotel.direccion}, {hotel.ciudad}</p>
                        <div className="map-container-wrapper">
                            <MapContainer center={position} zoom={15} scrollWheelZoom={false}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={position}>
                                    <Popup>{hotel.nombre}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>

                    <div className="booking-card">
                        <h3>Reserva tu estancia</h3>
                        <p className="price-big">${hotel.precio_noche} <span>/ noche</span></p>
                        <button className="btn-reserve-now">Reservar Ahora</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleHotel;
