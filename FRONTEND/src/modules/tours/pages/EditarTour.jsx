import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Importamos axios para los hoteles
import { FaSave, FaImages, FaMapMarkerAlt, FaCalendarAlt, FaHotel, FaUserTie } from 'react-icons/fa';
import { getTourRequest, updateTourRequest } from '../services/tour.service';
import './EditarTour.css';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corregir iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = 'http://localhost:4000';

const EditarTour = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, watch, reset } = useForm();
    
    const [coverPreview, setCoverPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null); 
    const [galleryFiles, setGalleryFiles] = useState([]); 
    const [galleryPreviews, setGalleryPreviews] = useState([]); 
    const [listaGuias, setListaGuias] = useState([]);
    const [listaHoteles, setListaHoteles] = useState([]); // <--- Lista dinámica
    const [position, setPosition] = useState(null);

    const defaultCenter = [-0.1807, -78.4678];

    useEffect(() => {
        const cargarTodo = async () => {
            try {
                // 1. CARGAR HOTELES REALES DE LA DB
                const resHoteles = await axios.get(`${API_URL}/api/hoteles`);
                setListaHoteles(resHoteles.data);

                // 2. CARGAR GUÍAS (Puedes dinamizarlo igual cuando tengas el backend de guías)
                setListaGuias([
                    { id: 1, nombre: 'Carlos Andrés Turista' },
                    { id: 2, nombre: 'Maria Fernanda Gomez' }
                ]);

                // 3. CARGAR DATOS DEL TOUR
                const tour = await getTourRequest(id);
                if (!tour) return;

                reset({
                    nombre: tour.nombre,
                    ciudad_destino: tour.ciudad_destino,
                    precio: tour.precio,
                    descripcion: tour.descripcion,
                    duracion: tour.duracion,
                    fecha_inicio: tour.fecha_inicio ? tour.fecha_inicio.split('T')[0] : '',
                    fecha_fin: tour.fecha_fin ? tour.fecha_fin.split('T')[0] : '',
                    latitud: tour.latitud,
                    longitud: tour.longitud,
                    id_guia: tour.id_guia || '',
                    id_hotel_base: tour.id_hotel_base || '' // Vincula con el id_hotel de la DB
                });

                if (tour.imagen_portada) setCoverPreview(`${API_URL}${tour.imagen_portada}`);
                if (tour.galeria) setGalleryPreviews(tour.galeria.map(img => `${API_URL}${img}`));
                if (tour.latitud && tour.longitud) {
                    setPosition({ lat: parseFloat(tour.latitud), lng: parseFloat(tour.longitud) });
                }

            } catch (error) {
                console.error("Error al cargar datos en Editar Tour:", error);
            }
        };
        cargarTodo();
    }, [id, reset]);

    function LocationMarker() {
        useMapEvents({
            click(e) {
                setPosition(e.latlng); 
                setValue('latitud', e.latlng.lat.toFixed(6));
                setValue('longitud', e.latlng.lng.toFixed(6));
            },
        });
        return position ? <Marker position={position} /> : null;
    }

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            const token = localStorage.getItem('token');
            
            formData.append('nombre', data.nombre);
            formData.append('ciudad_destino', data.ciudad_destino);
            formData.append('precio', data.precio);
            formData.append('duracion', data.duracion);
            formData.append('descripcion', data.descripcion || '');
            formData.append('fecha_inicio', data.fecha_inicio || '');
            formData.append('fecha_fin', data.fecha_fin || '');
            formData.append('latitud', data.latitud);
            formData.append('longitud', data.longitud);
            formData.append('id_guia', data.id_guia);
            formData.append('id_hotel_base', data.id_hotel_base);

            if (imagenFile) formData.append('imagen_portada', imagenFile);
            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => formData.append('galeria', file));
            }

            await updateTourRequest(id, formData);
            alert('¡Tour actualizado con éxito!');
            navigate('/admin/tours');
        } catch (error) {
            console.error("Error en submit:", error);
            alert('Error al guardar cambios.');
        }
    };

    return (
        <div className="editar-tour-container">
            <div className="editar-tour-card">
                <div className="card-header">
                    <h2>Editar Tour: {watch('nombre')}</h2>
                    <Link to="/admin/tours" className="close-btn">×</Link>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* SECCIÓN MULTIMEDIA */}
                    <div className="media-section">
                        <div className="media-col-main">
                            <label className="form-label">Imagen de Portada</label>
                            <div className="image-upload-wrapper">
                                <input type="file" id="pInput" className="hidden-file-input" onChange={e => {
                                    const file = e.target.files[0];
                                    if(file) { setImagenFile(file); setCoverPreview(URL.createObjectURL(file)); }
                                }} />
                                <label htmlFor="pInput" className="image-upload-label">
                                    {coverPreview ? <img src={coverPreview} className="image-preview" alt="Portada"/> : <span>Cambiar Foto</span>}
                                </label>
                            </div>
                        </div>
                        <div className="media-col-gallery">
                            <label className="form-label">Galería de Fotos</label>
                            <input type="file" multiple id="gInput" className="hidden-file-input" onChange={e => {
                                const files = Array.from(e.target.files);
                                setGalleryFiles(files);
                                setGalleryPreviews(files.map(f => URL.createObjectURL(f)));
                            }} />
                            <label htmlFor="gInput" className="gallery-upload-btn"><FaImages /> Actualizar Galería</label>
                            <div className="gallery-grid">
                                {galleryPreviews.map((src, i) => <img key={i} src={src} className="gallery-thumb" alt="Miniatura"/>)}
                            </div>
                        </div>
                    </div>

                    {/* DATOS BÁSICOS */}
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Nombre del Tour *</label>
                            <input type="text" className="form-input" {...register("nombre", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Ciudad Destino *</label>
                            <input type="text" className="form-input" {...register("ciudad_destino", { required: true })} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Precio ($) *</label>
                            <input type="number" step="0.01" className="form-input" {...register("precio", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Duración *</label>
                            <input type="text" className="form-input" {...register("duracion", { required: true })} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaCalendarAlt /> Fecha Inicio</label>
                            <input type="date" className="form-input" {...register("fecha_inicio")} />
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaCalendarAlt /> Fecha Fin</label>
                            <input type="date" className="form-input" {...register("fecha_fin")} />
                        </div>
                    </div>

                    {/* MAPA */}
                    <div className="map-section">
                        <label className="form-label"><FaMapMarkerAlt /> Ubicación (Haz clic para mover el pin)</label>
                        <div className="map-wrapper" style={{ height: '300px', marginBottom: '15px' }}>
                            <MapContainer center={position || defaultCenter} zoom={13} style={{ height: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        <input type="hidden" {...register("latitud")} />
                        <input type="hidden" {...register("longitud")} />
                    </div>

                    {/* RELACIONES */}
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaHotel /> Hotel Base</label>
                            <select className="form-input" {...register("id_hotel_base")}>
                                <option value="">-- Ninguno / Sin Hotel --</option>
                                {listaHoteles.map(h => (
                                    <option key={h.id_hotel} value={h.id_hotel}>
                                        {h.nombre} ({h.estrellas}⭐)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaUserTie /> Guía Asignado</label>
                            <select className="form-input" {...register("id_guia")}>
                                <option value="">-- Sin Asignar --</option>
                                {listaGuias.map(g => (
                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción Detallada</label>
                        <textarea className="form-textarea" rows="4" {...register("descripcion")}></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/admin/tours')} className="btn-cancel">Descartar</button>
                        <button type="submit" className="btn-save"><FaSave /> Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarTour;