import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTourRequest } from '../services/tour.service';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaClock, FaHotel, FaUserTie } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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

    if (loading) return <div className="loading">Cargando detalles del tour...</div>;
    if (!tour) return <div className="error">Tour no encontrado.</div>;

    return (
        <div className="detalle-container">
            <button className="btn-back" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Volver
            </button>

            <div className="detalle-header">
                <div className="header-info">
                    <h1>{tour.nombre}</h1>
                    <p className="destino"><FaMapMarkerAlt /> {tour.ciudad_destino}</p>
                </div>
                <div className="header-price">
                    <span className="price-tag">${Number(tour.precio).toFixed(2)}</span>
                </div>
            </div>

            <div className="detalle-grid">
                {/* Columna Izquierda: Imagen y Galería */}
                <div className="detalle-media">
                    <div className="main-image">
                        <img src={`${API_URL}${tour.imagen_portada}`} alt={tour.nombre} />
                    </div>
                    {tour.galeria && tour.galeria.length > 0 && (
                        <div className="galeria-section">
                            <h3>Galería de Fotos</h3>
                            <div className="galeria-grid">
                                {tour.galeria.map((img, index) => (
                                    <img key={index} src={`${API_URL}${img}`} alt={`Galería ${index}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Información y Mapa */}
                <div className="detalle-info">
                    <div className="info-card">
                        <h3>Información General</h3>
                        <div className="info-item">
                            <FaClock /> <strong>Duración:</strong> {tour.duracion}
                        </div>
                        <div className="info-item">
                            <FaCalendarAlt /> <strong>Fecha Inicio:</strong> {tour.fecha_inicio?.split('T')[0]}
                        </div>
                        {tour.fecha_fin && (
                            <div className="info-item">
                                <FaCalendarAlt /> <strong>Fecha Fin:</strong> {tour.fecha_fin?.split('T')[0]}
                            </div>
                        )}
                        
                        {/* --- HOTEL: AHORA MUESTRA EL NOMBRE REAL --- */}
                        <div className="info-item">
                            <FaHotel /> <strong>Hotel Base:</strong> {tour.nombre_hotel || 'No incluido / No asignado'}
                        </div>
                        
                        {/* --- GUÍA: AHORA MUESTRA EL NOMBRE Y APELLIDO PATERNO --- */}
                        <div className="info-item">
                            <FaUserTie /> <strong>Guía Asignado:</strong> {
                                tour.nombre_guia 
                                ? `${tour.nombre_guia} ${tour.apellido_guia || ''}` 
                                : 'No asignado'
                            }
                        </div>
                    </div>

                    <div className="descripcion-section">
                        <h3>Descripción del Tour</h3>
                        <p>{tour.descripcion || "Sin descripción disponible."}</p>
                    </div>

                    {tour.latitud && tour.longitud && (
                        <div className="mapa-section">
                            <h3>Ubicación Exacta</h3>
                            <div className="mapa-wrapper">
                                <MapContainer 
                                    center={[parseFloat(tour.latitud), parseFloat(tour.longitud)]} 
                                    zoom={14} 
                                    style={{ height: '250px', width: '100%' }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[parseFloat(tour.latitud), parseFloat(tour.longitud)]}>
                                        <Popup>{tour.nombre}</Popup>
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

export default DetalleTour;