import { useForm } from 'react-hook-form';
import { createTourRequest } from '../services/tour.service';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaSave, FaCloudUploadAlt, FaUserTie, FaImages, FaMapMarkerAlt, FaHotel, FaCalendarAlt } from 'react-icons/fa';
import './CrearTour.css';

// --- CONFIGURACIÓN DEL MAPA ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CrearTour = () => {
    const { register, handleSubmit, setValue, watch } = useForm();
    const navigate = useNavigate();
    
    // --- ESTADOS PARA ARCHIVOS ---
    const [coverPreview, setCoverPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null); 
    const [galleryFiles, setGalleryFiles] = useState([]); 
    const [galleryPreviews, setGalleryPreviews] = useState([]); 
    
    const [listaGuias, setListaGuias] = useState([]);
    const [listaHoteles, setListaHoteles] = useState([]);
    const [position, setPosition] = useState(null); 

    const defaultCenter = [-0.1807, -78.4678]; 

    // Watch para coordenadas manuales
    const latitudManual = watch('latitud');
    const longitudManual = watch('longitud');

    useEffect(() => {
        setListaGuias([
            { id: 1, nombre: 'Carlos Andrés Turista' },
            { id: 2, nombre: 'Maria Fernanda Gomez' },
            { id: 3, nombre: 'Juan Pablo Velasco' }
        ]);

        setListaHoteles([
            { id: 1, nombre: 'Hotel Paraíso Real' },
            { id: 2, nombre: 'Hostal La Montaña' },
            { id: 3, nombre: 'Resort Blue Ocean' }
        ]);
    }, []);

    // Sincronizar inputs manuales con el mapa
    useEffect(() => {
        if (latitudManual && longitudManual) {
            const lat = parseFloat(latitudManual);
            const lng = parseFloat(longitudManual);
            if (!isNaN(lat) && !isNaN(lng)) {
                setPosition({ lat, lng });
            }
        }
    }, [latitudManual, longitudManual]);

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

    // Calcular duración automáticamente
    const calcularDuracion = (fechaInicio, fechaFin) => {
        if (!fechaInicio) return '1 día';
        if (!fechaFin) return '1 día';
        
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diferencia = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
        
        if (diferencia <= 1) return '1 día';
        return `${diferencia} días`;
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            
            // Calcular duración basada en las fechas
            const duracion = calcularDuracion(data.fecha_inicio, data.fecha_fin);
            
            // 1. Datos de texto
            formData.append('nombre', data.nombre);
            formData.append('ciudad_destino', data.ciudad_destino);
            formData.append('precio', parseFloat(data.precio) || 0);
            formData.append('duracion', duracion);
            formData.append('fecha_inicio', data.fecha_inicio || '');
            formData.append('fecha_fin', data.fecha_fin || '');
            formData.append('descripcion', data.descripcion || '');
            formData.append('latitud', parseFloat(data.latitud) || 0);
            formData.append('longitud', parseFloat(data.longitud) || 0);

            if (data.id_guia && data.id_guia !== "") {
                formData.append('id_guia', data.id_guia);
            }
            if (data.id_hotel_base && data.id_hotel_base !== "") {
                formData.append('id_hotel_base', data.id_hotel_base);
            }

            // 2. Imagen de Portada
            if (imagenFile) {
                formData.append('imagen_portada', imagenFile);
            }

            // 3. Galería
            if (galleryFiles.length > 0) {
                galleryFiles.forEach((file) => {
                    formData.append('galeria', file); 
                });
            }

            console.log("Enviando tour con fechas:", {
                fecha_inicio: data.fecha_inicio,
                fecha_fin: data.fecha_fin,
                duracion
            });

            await createTourRequest(formData);
            
            alert('¡Tour creado exitosamente!');
            navigate('/admin/crear-tour');
        } catch (error) {
            console.error("Error en la petición:", error);
            const mensaje = error.response?.data?.message || 'Error al crear el tour.';
            alert(mensaje);
        }
    };

    return (
        <div className="crear-tour-container">
            <div className="crear-tour-card">
                <div className="card-header">
                    <h2 className="card-title">Nuevo Paquete Turístico</h2>
                    <Link to="/admin/crear-tour" className="close-btn">×</Link>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="media-section">
                        <div className="media-col-main">
                            <label className="form-label">Imagen de Portada *</label>
                            <div className="image-upload-wrapper cover-wrapper">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    id="portadaInput" 
                                    className="hidden-file-input"
                                    onChange={handleCoverChange} 
                                />
                                <label htmlFor="portadaInput" className="image-upload-label">
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="Portada" className="image-preview" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <FaCloudUploadAlt size={40} color="#022b3a" />
                                            <span>Subir Portada</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="media-col-gallery">
                            <label className="form-label">Galería</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                id="galeriaInput" 
                                className="hidden-file-input"
                                onChange={handleGalleryChange} 
                            />
                            <label htmlFor="galeriaInput" className="gallery-upload-btn">
                                <FaImages /> Fotos Extra
                            </label>
                            
                            {galleryPreviews.length > 0 && (
                                <div className="gallery-grid">
                                    {galleryPreviews.map((src, i) => (
                                        <div key={i} className="gallery-thumb">
                                            <img src={src} alt={`Galería ${i}`} />
                                        </div>
                                    ))}
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
                            <label className="form-label">
                                <FaCalendarAlt style={{marginRight: '5px'}} />
                                Fecha de Inicio *
                            </label>
                            <input 
                                type="date" 
                                className="form-input" 
                                {...register("fecha_inicio", { required: true })} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">
                                <FaCalendarAlt style={{marginRight: '5px'}} />
                                Fecha de Fin (Opcional)
                            </label>
                            <input 
                                type="date" 
                                className="form-input" 
                                {...register("fecha_fin")} 
                            />
                            <small style={{color: '#666', fontSize: '12px'}}>
                                Déjalo vacío para tours de un solo día
                            </small>
                        </div>
                        <div className="form-col">
                            <label className="form-label">Duración Calculada</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={calcularDuracion(watch('fecha_inicio'), watch('fecha_fin'))}
                                readOnly
                                style={{backgroundColor: '#f0f0f0'}}
                            />
                        </div>
                    </div>

                    <div className="form-group map-section">
                        <label className="form-label">
                            <FaMapMarkerAlt style={{marginRight: '5px', color: '#e74c3c'}} />
                            Ubicación del Tour
                        </label>
                        
                        {/* Inputs para coordenadas manuales */}
                        <div className="form-row" style={{marginBottom: '10px'}}>
                            <div className="form-col">
                                <label className="form-label" style={{fontSize: '14px'}}>Latitud</label>
                                <input 
                                    type="number" 
                                    step="0.000001"
                                    className="form-input" 
                                    placeholder="-0.180700"
                                    {...register("latitud")} 
                                />
                            </div>
                            <div className="form-col">
                                <label className="form-label" style={{fontSize: '14px'}}>Longitud</label>
                                <input 
                                    type="number" 
                                    step="0.000001"
                                    className="form-input" 
                                    placeholder="-78.467800"
                                    {...register("longitud")} 
                                />
                            </div>
                        </div>

                        <p style={{fontSize: '13px', color: '#666', marginBottom: '10px'}}>
                            💡 Puedes escribir las coordenadas arriba o hacer click en el mapa
                        </p>

                        <div className="map-wrapper">
                            <MapContainer 
                                center={position || defaultCenter} 
                                zoom={13} 
                                scrollWheelZoom={false} 
                                className="leaflet-container"
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        
                        {position && (
                            <p className="coords-text" style={{marginTop: '10px', color: '#2ecc71'}}>
                                ✅ Ubicación seleccionada: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                            </p>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">
                                <FaHotel style={{marginRight:'5px'}}/> Hotel Base (Opcional)
                            </label>
                            <select className="form-input" {...register("id_hotel_base")}>
                                <option value="">-- Sin Hotel / Solo Tour de día --</option>
                                {listaHoteles.map(h => (
                                    <option key={h.id} value={h.id}>{h.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-col">
                            <label className="form-label">
                                <FaUserTie style={{marginRight:'5px'}}/> Asignar Guía
                            </label>
                            <select className="form-input" {...register("id_guia")}>
                                <option value="">-- Sin asignar --</option>
                                {listaGuias.map(g => (
                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción</label>
                        <textarea 
                            className="form-textarea" 
                            rows="4" 
                            placeholder="Describe las actividades, incluye qué se incluye, recomendaciones..."
                            {...register("descripcion")}
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <Link to="/admin/crear-tour" className="btn-cancel">Cancelar</Link>
                        <button type="submit" className="btn-save">
                            <FaSave style={{marginRight: '5px'}}/> Guardar Tour
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearTour;