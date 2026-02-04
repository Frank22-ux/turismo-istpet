import { useForm } from 'react-hook-form';
import { createTourRequest } from '../services/tour.service';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'; 
import { 
    FaSave, FaCloudUploadAlt, FaUserTie, FaImages, 
    FaMapMarkerAlt, FaHotel, FaCalendarAlt, FaUsers, 
    FaCompass 
} from 'react-icons/fa';
import './CrearTour.css';

// --- CONFIGURACIÓN DEL MAPA ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const API_URL = 'http://localhost:4000';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CrearTour = () => {
    // Simplificamos defaultValues: solo necesitamos el precio base
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            precio: 0
        }
    });
    const navigate = useNavigate();
    
    const [coverPreview, setCoverPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null); 
    const [galleryFiles, setGalleryFiles] = useState([]); 
    const [galleryPreviews, setGalleryPreviews] = useState([]); 
    
    const [listaGuias, setListaGuias] = useState([]);
    const [listaHoteles, setListaHoteles] = useState([]); 
    const [position, setPosition] = useState(null); 
    const [isSearching, setIsSearching] = useState(false);

    const defaultCenter = [-0.1807, -78.4678]; 

    const latitudManual = watch('latitud');
    const longitudManual = watch('longitud');

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const resHoteles = await axios.get(`${API_URL}/api/hoteles`, config);
                setListaHoteles(resHoteles.data);
                const resGuias = await axios.get(`${API_URL}/api/usuarios/guias-lista`, config);
                setListaGuias(resGuias.data);
            } catch (error) {
                console.error("Error al cargar catálogos:", error);
            }
        };
        cargarCatalogos();
    }, []);

    useEffect(() => {
        if (latitudManual && longitudManual) {
            const lat = parseFloat(latitudManual);
            const lng = parseFloat(longitudManual);
            if (!isNaN(lat) && !isNaN(lng)) setPosition({ lat, lng });
        }
    }, [latitudManual, longitudManual]);

    const fetchLocationDetails = async (lat, lng) => {
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.municipality || "Desconocido";
            setValue('ciudad_destino', city);
            const street = data.address.road || "";
            const houseNumber = data.address.house_number || "";
            const neighborhood = data.address.neighbourhood || data.address.suburb || "";
            const fullAddress = `${street} ${houseNumber} ${neighborhood}`.trim() || data.display_name;
            setValue('direccion', fullAddress);
        } catch (error) {
            console.error("Error al obtener detalles de ubicación:", error);
        } finally {
            setIsSearching(false);
        }
    };

    function LocationMarker() {
        useMapEvents({
            async click(e) {
                const { lat, lng } = e.latlng;
                setPosition(e.latlng); 
                setValue('latitud', lat.toFixed(6));
                setValue('longitud', lng.toFixed(6));
                await fetchLocationDetails(lat, lng);
            },
        });
        return position ? <Marker position={position} /> : null;
    }

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagenFile(file); 
            setCoverPreview(URL.createObjectURL(file)); 
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setGalleryFiles(files); 
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews(newPreviews);
        }
    };

    const calcularDuracion = (fechaInicio, fechaFin) => {
        if (!fechaInicio || !fechaFin) return '1 día';
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diferencia = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
        return diferencia <= 1 ? '1 día' : `${diferencia} días`;
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append('nombre', data.nombre);
            formData.append('ciudad_destino', data.ciudad_destino);
            formData.append('direccion', data.direccion);
            formData.append('precio', parseFloat(data.precio) || 0);
            
            // Ya no enviamos precio_nino ni precio_especial manuales
            // El backend los generará automáticamente basándose en 'precio'

            formData.append('duracion', calcularDuracion(data.fecha_inicio, data.fecha_fin));
            formData.append('fecha_inicio', data.fecha_inicio || '');
            formData.append('fecha_fin', data.fecha_fin || '');
            formData.append('descripcion', data.descripcion || '');
            formData.append('latitud', parseFloat(data.latitud) || 0);
            formData.append('longitud', parseFloat(data.longitud) || 0);

            if (data.id_guia) formData.append('id_guia', data.id_guia);
            if (data.id_hotel_base) formData.append('id_hotel_base', data.id_hotel_base);
            if (imagenFile) formData.append('imagen_portada', imagenFile);
            if (galleryFiles.length > 0) {
                galleryFiles.forEach((file) => formData.append('galeria', file));
            }

            await createTourRequest(formData);
            alert('¡Tour creado exitosamente!');
            navigate('/admin/tours');
        } catch (error) {
            console.error(error);
            alert('Error al crear el tour.');
        }
    };

    return (
        <div className="crear-tour-container">
            <div className="crear-tour-card">
                <div className="card-header">
                    <h2 className="card-title">Nuevo Paquete Turístico</h2>
                    <Link to="/admin/tours" className="close-btn">×</Link>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="media-section">
                        <div className="media-col-main">
                            <label className="form-label">Imagen de Portada *</label>
                            <div className="image-upload-wrapper cover-wrapper">
                                <input type="file" accept="image/*" id="portadaInput" className="hidden-file-input" onChange={handleCoverChange} />
                                <label htmlFor="portadaInput" className="image-upload-label">
                                    {coverPreview ? <img src={coverPreview} alt="Portada" className="image-preview" /> : 
                                    <div className="upload-placeholder"><FaCloudUploadAlt size={40} color="#022b3a" /><span>Subir Portada</span></div>}
                                </label>
                            </div>
                        </div>
                        <div className="media-col-gallery">
                            <label className="form-label">Galería</label>
                            <input type="file" accept="image/*" multiple id="galeriaInput" className="hidden-file-input" onChange={handleGalleryChange} />
                            <label htmlFor="galeriaInput" className="gallery-upload-btn"><FaImages /> Fotos Extra</label>
                            {galleryPreviews.length > 0 && (
                                <div className="gallery-grid">
                                    {galleryPreviews.map((src, i) => <div key={i} className="gallery-thumb"><img src={src} alt={`G${i}`} /></div>)}
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Nombre del Tour *</label>
                            <input type="text" className="form-input" {...register("nombre", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Ciudad Destino * {isSearching && <span className="loading-text">(Detectando...)</span>}</label>
                            <input type="text" className="form-input" {...register("ciudad_destino", { required: true })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label"><FaCompass /> Dirección Exacta (Punto de encuentro)</label>
                        <input 
                            type="text" 
                            className={`form-input ${isSearching ? 'input-loading' : ''}`} 
                            placeholder="Se llenará al hacer clic en el mapa"
                            {...register("direccion")} 
                        />
                    </div>

                    {/* SECCIÓN DE PRECIO SIMPLIFICADA */}
                    <h3 className="sub-section-title">Costo del Tour</h3>
                    <div className="form-row">
                        <div className="form-col" style={{maxWidth: '300px'}}>
                            <label className="form-label"><FaUsers /> Precio Normal (Adultos) *</label>
                            <div className="price-input-container">
                                <span className="currency-prefix">$</span>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="form-input highlight-input" 
                                    placeholder="0.00"
                                    {...register("precio", { required: true })} 
                                />
                                <span className="currency-suffix">USD</span>
                            </div>
                            <small className="form-help">
                                Los precios de Niños (30% desc) y Especial (50% desc) se calcularán automáticamente.
                            </small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col"><label className="form-label"><FaCalendarAlt /> Fecha de Inicio *</label><input type="date" className="form-input" {...register("fecha_inicio", { required: true })} /></div>
                        <div className="form-col"><label className="form-label"><FaCalendarAlt /> Fecha de Fin</label><input type="date" className="form-input" {...register("fecha_fin")} /></div>
                    </div>

                    <div className="form-group map-section">
                        <label className="form-label"><FaMapMarkerAlt /> Ubicación (Clic en mapa para Ciudad y Dirección)</label>
                        <div className="map-wrapper">
                            <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false} className="leaflet-container">
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        <div className="form-row" style={{marginTop:'10px'}}>
                            <div className="form-col"><label className="form-label">Latitud</label><input type="number" step="any" className="form-input" {...register("latitud")} /></div>
                            <div className="form-col"><label className="form-label">Longitud</label><input type="number" step="any" className="form-input" {...register("longitud")} /></div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaHotel /> Hotel Base</label>
                            <select className="form-input" {...register("id_hotel_base")}>
                                <option value="">-- Sin Hotel --</option>
                                {listaHoteles.map(h => (
                                    <option key={h.id_hotel} value={h.id_hotel}>{h.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaUserTie /> Asignar Guía</label>
                            <select className="form-input" {...register("id_guia")}>
                                <option value="">-- Sin asignar --</option>
                                {listaGuias.map(g => (
                                    <option key={g.id_guia} value={g.id_guia}>{g.primer_nombre} {g.apellido_paterno}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción</label>
                        <textarea className="form-textarea" rows="4" {...register("descripcion")}></textarea>
                    </div>

                    <div className="form-actions">
                        <Link to="/admin/tours" className="btn-cancel">Cancelar</Link>
                        <button type="submit" className="btn-save" disabled={isSearching}>
                            <FaSave /> {isSearching ? 'Buscando...' : 'Guardar Tour'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearTour;