import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
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
    const [listaHoteles, setListaHoteles] = useState([]); 
    const [position, setPosition] = useState(null);

    const defaultCenter = [-0.1807, -78.4678];

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // 1. Cargar Hoteles
            try {
                const resH = await axios.get(`${API_URL}/api/hoteles`);
                setListaHoteles(resH.data || []);
            } catch (e) { console.error("Error hoteles:", e); }

            // 2. Cargar Guías
            try {
                const resG = await axios.get(`${API_URL}/api/usuarios/guias-lista`, config);
                setListaGuias(resG.data || []);
            } catch (e) { console.error("Error guías:", e); }

            // 3. Cargar el Tour para editar
            try {
                const tour = await getTourRequest(id);
                if (tour) {
                    reset({
                        nombre: tour.nombre || '',
                        ciudad_destino: tour.ciudad_destino || '',
                        precio: tour.precio || 0,
                        descripcion: tour.descripcion || '',
                        duracion: tour.duracion || '',
                        fecha_inicio: tour.fecha_inicio ? tour.fecha_inicio.split('T')[0] : '',
                        fecha_fin: tour.fecha_fin ? tour.fecha_fin.split('T')[0] : '',
                        latitud: tour.latitud,
                        longitud: tour.longitud,
                        id_guia: tour.id_guia || '',
                        id_hotel_base: tour.id_hotel_base || ''
                    });

                    if (tour.imagen_portada) setCoverPreview(`${API_URL}${tour.imagen_portada}`);
                    if (tour.galeria) setGalleryPreviews(tour.galeria.map(img => `${API_URL}${img}`));
                    if (tour.latitud && tour.longitud) {
                        setPosition({ lat: parseFloat(tour.latitud), lng: parseFloat(tour.longitud) });
                    }
                }
            } catch (error) {
                console.error("Error cargando el tour:", error);
            }
        };

        cargarDatosIniciales();
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
            
            // LIMPIEZA DE DATOS PARA POSTGRESQL
            for (const key in data) {
                // Solo omitimos si es estrictamente vacío, null o undefined. 
                // Los números (como el 0) deben pasar.
                if (data[key] === null || data[key] === undefined || data[key] === "") {
                    continue; 
                }
                formData.append(key, data[key]);
            }

            if (imagenFile) formData.append('imagen_portada', imagenFile);
            if (galleryFiles.length > 0) {
                galleryFiles.forEach(file => formData.append('galeria', file));
            }

            await updateTourRequest(id, formData);
            alert('¡Tour actualizado con éxito!');
            navigate('/admin/tours');
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert('Error al guardar: ' + (error.response?.data?.message || 'Error en el servidor'));
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
                    {/* Multimedia */}
                    <div className="media-section">
                        <div className="media-col-main">
                            <label className="form-label">Portada</label>
                            <div className="image-upload-wrapper">
                                <input type="file" id="pInput" className="hidden-file-input" onChange={e => {
                                    const file = e.target.files[0];
                                    if(file) { setImagenFile(file); setCoverPreview(URL.createObjectURL(file)); }
                                }} />
                                <label htmlFor="pInput" className="image-upload-label">
                                    {coverPreview ? <img src={coverPreview} className="image-preview" alt="Portada"/> : <span>Cambiar Portada</span>}
                                </label>
                            </div>
                        </div>
                        <div className="media-col-gallery">
                            <label className="form-label">Galería</label>
                            <input type="file" multiple id="gInput" className="hidden-file-input" onChange={e => {
                                const files = Array.from(e.target.files);
                                setGalleryFiles(files);
                                setGalleryPreviews(files.map(f => URL.createObjectURL(f)));
                            }} />
                            <label htmlFor="gInput" className="gallery-upload-btn"><FaImages /> Actualizar Galería</label>
                            <div className="gallery-grid">
                                {galleryPreviews.map((src, i) => <img key={i} src={src} className="gallery-thumb" alt="Mini"/>)}
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Nombre *</label>
                            <input type="text" className="form-input" {...register("nombre", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Ciudad *</label>
                            <input type="text" className="form-input" {...register("ciudad_destino", { required: true })} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Precio</label>
                            <input type="number" step="0.01" className="form-input" {...register("precio")} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Duración</label>
                            <input type="text" className="form-input" {...register("duracion")} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaCalendarAlt /> Inicio</label>
                            <input type="date" className="form-input" {...register("fecha_inicio")} />
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaCalendarAlt /> Fin</label>
                            <input type="date" className="form-input" {...register("fecha_fin")} />
                        </div>
                    </div>

                    {/* Mapa */}
                    <div className="map-section">
                        <label className="form-label"><FaMapMarkerAlt /> Ubicación Geográfica</label>
                        <div className="map-wrapper" style={{ height: '250px', marginBottom: '15px' }}>
                            <MapContainer center={position || defaultCenter} zoom={13} style={{ height: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        <input type="hidden" {...register("latitud")} />
                        <input type="hidden" {...register("longitud")} />
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaHotel /> Hotel Base</label>
                            <select 
                                className="form-input" 
                                {...register("id_hotel_base", { setValueAs: v => v === "" ? null : parseInt(v) })}
                            >
                                <option value="">-- Sin Hotel --</option>
                                {listaHoteles.map(h => (
                                    <option key={h.id_hotel} value={h.id_hotel}>{h.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaUserTie /> Guía Asignado</label>
                            <select 
                                className="form-input" 
                                {...register("id_guia", { setValueAs: v => v === "" ? null : parseInt(v) })}
                            >
                                <option value="">-- Sin Asignar --</option>
                                {listaGuias.map(g => (
                                    /* CORRECCIÓN: Usar g.id_guia en lugar de g.id_usuario */
                                    <option key={g.id_guia} value={g.id_guia}>
                                        {g.primer_nombre} {g.apellido_paterno}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción</label>
                        <textarea className="form-textarea" rows="3" {...register("descripcion")}></textarea>
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