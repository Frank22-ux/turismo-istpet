import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, 
    FaArrowLeft, FaInfoCircle, FaClipboardList, FaHotel 
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Importar para corregir el icono por defecto
import './DetalleTourGuia.css';

// Corregir problema de iconos de Leaflet en React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = 'http://localhost:4000';

const DetalleTourGuia = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [pasajeros, setPasajeros] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetalles = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // 1. Obtener info del tour
                const resTour = await axios.get(`${API_URL}/api/tours/${id}`, config);
                setTour(resTour.data);

                // 2. Obtener lista de pasajeros
                const resPasajeros = await axios.get(`${API_URL}/api/reservas/tour/${id}`, config);
                setPasajeros(resPasajeros.data);

            } catch (error) {
                console.error("Error al cargar detalles del tour:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetalles();
    }, [id]);

    if (loading) return <div className="loading-detail">Cargando logística del tour...</div>;
    if (!tour) return <div className="error-detail">No se encontró la información del tour.</div>;

    return (
        <div className="detalle-tour-guia">
            <button className="btn-back" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Volver al Dashboard
            </button>

            <header className="tour-hero">
                <img src={tour.imagen_portada ? `${API_URL}${tour.imagen_portada}` : '/default-tour.jpg'} alt={tour.nombre} />
                <div className="hero-overlay">
                    <h1>{tour.nombre}</h1>
                    <span className="badge-categoria">{tour.categoria || 'Aventura'}</span>
                </div>
            </header>

            <div className="main-container-guia">
                {/* Columna Izquierda: Logística y Mapa */}
                <div className="col-left">
                    <section className="info-logistica">
                        <h2><FaInfoCircle /> Información General</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <FaCalendarAlt className="icon" />
                                <div><strong>Fecha:</strong><p>{new Date(tour.fecha_inicio).toLocaleDateString()}</p></div>
                            </div>
                            <div className="info-item">
                                <FaClock className="icon" />
                                <div><strong>Duración:</strong><p>{tour.duracion}</p></div>
                            </div>
                            <div className="info-item">
                                <FaHotel className="icon" />
                                <div><strong>Hotel:</strong><p>{tour.nombre_hotel || 'N/A'}</p></div>
                            </div>
                            <div className="info-item full-width">
                                <FaMapMarkerAlt className="icon" />
                                <div>
                                    <strong>Punto de Encuentro:</strong>
                                    <p>{tour.punto_encuentro || 'Dirección no especificada'}</p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN DEL MAPA */}
                        {tour.latitud && tour.longitud && (
                            <div className="mapa-logistica">
                                <h3><FaMapMarkerAlt /> Ubicación Geográfica</h3>
                                <div className="map-wrapper">
                                    <MapContainer 
                                        center={[parseFloat(tour.latitud), parseFloat(tour.longitud)]} 
                                        zoom={15} 
                                        scrollWheelZoom={false}
                                        style={{ height: '300px', width: '100%', borderRadius: '10px' }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={[parseFloat(tour.latitud), parseFloat(tour.longitud)]}>
                                            <Popup>Punto de inicio: {tour.nombre}</Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            </div>
                        )}

                        <div className="descripcion-seccion">
                            <h3>Descripción del Recorrido</h3>
                            <p>{tour.descripcion}</p>
                        </div>
                    </section>
                </div>

                {/* Columna Derecha: Lista de Pasajeros */}
                <div className="col-right">
                    <section className="lista-pasajeros">
                        <h2><FaClipboardList /> Pasajeros ({pasajeros.length})</h2>
                        <div className="tabla-scroll">
                            <table className="tabla-guia">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Cant.</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pasajeros.length > 0 ? (
                                        pasajeros.map((p, index) => (
                                            <tr key={index}>
                                                <td>{p.nombre_cliente}</td>
                                                <td>{p.cantidad_personas}</td>
                                                <td><span className={`status ${p.estado_reserva}`}>{p.estado_reserva}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="no-data">Sin reservas.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DetalleTourGuia;