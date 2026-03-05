import { useForm } from 'react-hook-form';
import { createTourRequest } from '../services/tour.service';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../../core/api';
import {
    FaSave,
    FaCloudUploadAlt,
    FaUserTie,
    FaImages,
    FaMapMarkerAlt,
    FaHotel,
    FaCalendarAlt,
    FaArrowLeft,
    FaDollarSign,
    FaCheckCircle,
    FaExclamationCircle,
    FaTimes,
    FaClock,
    FaMountain,
    FaUsers,
    FaLanguage,
    FaCheck,
    FaPlus,
    FaListUl
} from 'react-icons/fa';
import AdminLayout from '../../admin/layouts/AdminLayout';
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
    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
        defaultValues: {
            nombre: '',
            ciudad_destino: '',
            precio: '',
            fecha_inicio: '',
            fecha_fin: '',
            descripcion: '',
            latitud: '',
            longitud: '',
            id_guia: '',
            id_hotel_base: ''
        }
    });

    const navigate = useNavigate();

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // --- ESTADOS PARA ARCHIVOS ---
    const [coverPreview, setCoverPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const [listaGuias, setListaGuias] = useState([]);
    const [listaHoteles, setListaHoteles] = useState([]);
    const [position, setPosition] = useState(null);
    const [direccion, setDireccion] = useState(null);
    const [loadingDireccion, setLoadingDireccion] = useState(false);

    // --- ESTADOS PARA CAMPOS DE DETALLE ---
    const [idiomas, setIdiomas] = useState([]);
    const [idiomaInput, setIdiomaInput] = useState('');
    const [incluye, setIncluye] = useState([]);
    const [incluyeInput, setIncluyeInput] = useState('');
    const [puntosInteres, setPuntosInteres] = useState([]);
    const [puntoInput, setPuntoInput] = useState('');

    const defaultCenter = [-0.1807, -78.4678];

    // Watch para coordenadas manuales
    const latitudManual = watch('latitud');
    const longitudManual = watch('longitud');
    const fechaInicioWatch = watch('fecha_inicio');
    const fechaFinWatch = watch('fecha_fin');

    useEffect(() => {
        const fetchAsignaciones = async () => {
            try {
                const [guiasRes, hotelesRes] = await Promise.all([
                    api.get('/guias'),
                    api.get('/hoteles')
                ]);

                // Mapear guías
                setListaGuias(guiasRes.data.map(g => ({
                    id: g.id_usuario,
                    nombre: `${g.primer_nombre} ${g.apellido_paterno}`
                })));

                // Mapear hoteles
                setListaHoteles(hotelesRes.data.map(h => ({
                    id: h.id_hotel,
                    nombre: h.nombre
                })));
            } catch (err) {
                console.error('Error cargando asignaciones:', err);
            }
        };

        fetchAsignaciones();
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

    // Obtener dirección a partir de coordenadas (Reverse Geocoding)
    useEffect(() => {
        if (position && position.lat && position.lng) {
            setLoadingDireccion(true);
            const obtenerDireccion = async () => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`,
                        {
                            headers: {
                                'Accept-Language': 'es'
                            }
                        }
                    );
                    const data = await response.json();

                    const address = data.address || {};
                    setDireccion({
                        calle: address.road || address.street || address.path || 'Sin información',
                        ciudad: address.city || address.town || address.village || 'Sin información',
                        provincia: address.state || address.province || 'Sin información',
                        pais: address.country || 'Sin información'
                    });
                } catch (error) {
                    console.error('Error obteniendo dirección:', error);
                    setDireccion(null);
                } finally {
                    setLoadingDireccion(false);
                }
            };

            obtenerDireccion();
        }
    }, [position]);

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
            // Validaciones básicas
            if (!file.type.startsWith('image/')) {
                setError('❌ El archivo de portada debe ser una imagen.');
                setTimeout(() => setError(''), 4000);
                return;
            }
            setImagenFile(file);
            setCoverPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Validar límite (ejemplo: máximo 6 fotos nuevas)
            if (galleryFiles.length + files.length > 10) {
                setError('❌ Máximo 10 fotos en la galería.');
                setTimeout(() => setError(''), 4000);
                return;
            }

            const newFiles = [...galleryFiles, ...files];
            setGalleryFiles(newFiles);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveGalleryImage = (index) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
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
            setLoading(true);
            setError('');

            // Validaciones manuales
            if (!imagenFile) {
                setError('⚠️ Debes subir una imagen de portada.');
                setLoading(false);
                return;
            }
            if (!position) {
                setError('⚠️ Debes seleccionar una ubicación en el mapa.');
                setLoading(false);
                return;
            }

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

            // Nuevos campos de detalle
            formData.append('dificultad', data.dificultad || 'Moderada');
            formData.append('maximo_personas', data.maximo_personas || 10);
            if (idiomas.length > 0) formData.append('idiomas', JSON.stringify(idiomas));
            if (incluye.length > 0) formData.append('incluye', JSON.stringify(incluye));
            if (puntosInteres.length > 0) formData.append('puntos_interes', JSON.stringify(puntosInteres));

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

            console.log("Enviando tour...");
            await createTourRequest(formData);

            setSuccess(true);
            reset();
            setImagenFile(null);
            setCoverPreview(null);
            setGalleryFiles([]);
            setGalleryPreviews([]);
            setPosition(null);
            setDireccion(null);
            setIdiomas([]);
            setIncluye([]);
            setPuntosInteres([]);

            setTimeout(() => {
                navigate('/admin/crear-tour');
                setSuccess(false); // Reset success state
            }, 3000);

        } catch (err) {
            console.error("Error al crear tour:", err);
            const mensaje = err.response?.data?.message || 'Error al crear el tour. Verifique la conexión.';
            setError(`❌ ${mensaje}`);
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div className="crear-tour-container">
            {/* HEADER */}
            <div className="crear-tour-header">
                <Link to="/admin/crear-tour" className="btn-volver">
                    <FaArrowLeft /> Volver
                </Link>
                <h1 className="crear-tour-title">
                    <span className="emoji">🗺️</span> Registrar Nuevo Tour
                </h1>
                <p className="crear-tour-subtitle">Completa los datos para publicar un nuevo paquete turístico</p>
            </div>

            {/* ALERTS */}
            {success && (
                <div className="alert alert-success">
                    <FaCheckCircle /> ¡Tour creado exitosamente!
                </div>
            )}
            {error && (
                <div className="alert alert-error">
                    <FaExclamationCircle /> {error}
                </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit(onSubmit)} className="crear-tour-form">

                {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
                <div className="form-section">
                    <h2 className="section-title">📋 Información General</h2>

                    <div className="form-group">
                        <label>Nombre del Tour *</label>
                        <input
                            type="text"
                            {...register('nombre', { required: 'Nombre requerido' })}
                            placeholder="Ej: Aventura en la Amazonía"
                            className={errors.nombre ? 'error' : ''}
                        />
                        {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaMapMarkerAlt /> Ciudad Destino *
                            </label>
                            <input
                                type="text"
                                {...register('ciudad_destino', { required: 'Ciudad requerida' })}
                                placeholder="Ej: Baños de Agua Santa"
                                className={errors.ciudad_destino ? 'error' : ''}
                            />
                            {errors.ciudad_destino && <span className="error-msg">{errors.ciudad_destino.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaDollarSign /> Precio por Persona ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('precio', {
                                    required: 'Precio requerido',
                                    min: { value: 0, message: 'El precio debe ser positivo' }
                                })}
                                placeholder="0.00"
                                className={errors.precio ? 'error' : ''}
                            />
                            {errors.precio && <span className="error-msg">{errors.precio.message}</span>}
                        </div>
                    </div>

                    <div className="form-row-3">
                        <div className="form-group">
                            <label>
                                <FaCalendarAlt /> Fecha Inicio *
                            </label>
                            <input
                                type="date"
                                {...register('fecha_inicio', { required: 'Fecha de inicio requerida' })}
                                className={errors.fecha_inicio ? 'error' : ''}
                            />
                            {errors.fecha_inicio && <span className="error-msg">{errors.fecha_inicio.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaCalendarAlt /> Fecha Fin
                            </label>
                            <input
                                type="date"
                                {...register('fecha_fin')}
                            />
                        </div>
                        <div className="form-group">
                            <label>Duración Estimada</label>
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    value={calcularDuracion(fechaInicioWatch, fechaFinWatch)}
                                    readOnly
                                    className="input-readonly"
                                />
                                <FaClock className="input-icon" />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Descripción Detallada</label>
                            <textarea
                                {...register('descripcion')}
                                rows="4"
                                placeholder="Describe el itinerario, qué incluye, recomendaciones..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: UBICACIÓN Y MAPA */}
                <div className="form-section">
                    <h2 className="section-title">📍 Ubicación del Tour</h2>

                    <div className="map-container-wrapper">
                        <p className="map-instructions">Haz clic en el mapa para marcar el punto de encuentro o ubicación principal.</p>

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
                            <div className="location-details">
                                <div className="location-coords">
                                    <span className="badge">Lat: {position.lat.toFixed(6)}</span>
                                    <span className="badge">Lng: {position.lng.toFixed(6)}</span>
                                </div>

                                {loadingDireccion ? (
                                    <p className="loading-text">Cargando dirección...</p>
                                ) : direccion ? (
                                    <div className="address-card">
                                        <p><strong>Calle:</strong> {direccion.calle}</p>
                                        <p><strong>Ciudad:</strong> {direccion.ciudad}, {direccion.provincia}</p>
                                        <p><strong>País:</strong> {direccion.pais}</p>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Hidden inputs for form data */}
                        <input type="hidden" {...register('latitud', { required: 'Ubicación requerida' })} />
                        <input type="hidden" {...register('longitud', { required: 'Ubicación requerida' })} />
                        {errors.latitud && <span className="error-msg">⚠️ Debes seleccionar una ubicación en el mapa</span>}
                    </div>
                </div>

                {/* SECCIÓN 3: MULTIMEDIA */}
                <div className="form-section">
                    <h2 className="section-title">📸 Galería y Portada</h2>

                    <div className="multimedia-grid">
                        {/* Portada */}
                        <div className="media-column">
                            <label className="sub-label">Imagen de Portada *</label>
                            <div className="image-upload-area">
                                <label className="upload-box">
                                    {coverPreview ? (
                                        <div className="preview-container">
                                            <img src={coverPreview} alt="Portada Preview" className="preview-img-cover" />
                                            <div className="preview-overlay">
                                                <span>Cambiar Imagen</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <FaCloudUploadAlt className="upload-icon-large" />
                                            <span>Subir Portada</span>
                                            <small>JPG/PNG - Max 5MB</small>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverChange}
                                        className="hidden-input"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Galería */}
                        <div className="media-column">
                            <label className="sub-label">Galería de Fotos</label>
                            <div className="gallery-upload-area">
                                <label className="btn-add-photos">
                                    <FaImages /> Agregar Fotos
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryChange}
                                        className="hidden-input"
                                    />
                                </label>

                                {galleryPreviews.length > 0 ? (
                                    <div className="gallery-grid-preview">
                                        {galleryPreviews.map((src, index) => (
                                            <div key={index} className="gallery-item-status">
                                                <img src={src} alt={`Galeria ${index}`} />
                                                <button
                                                    type="button"
                                                    className="btn-remove-mini"
                                                    onClick={() => handleRemoveGalleryImage(index)}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-gallery-msg">
                                        <small>No hay fotos adicionales seleccionadas</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 4: DETALLES DEL TOUR */}
                <div className="form-section">
                    <h2 className="section-title"><FaMountain /> Detalles del Tour</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label><FaMountain /> Dificultad *</label>
                            <select {...register('dificultad')} defaultValue="Moderada">
                                <option value="Fácil">Fácil</option>
                                <option value="Moderada">Moderada</option>
                                <option value="Difícil">Difícil</option>
                                <option value="Extrema">Extrema</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label><FaUsers /> Máximo de Personas *</label>
                            <input
                                type="number"
                                min="1"
                                max="200"
                                {...register('maximo_personas', { required: 'Campo requerido', min: { value: 1, message: 'Mínimo 1 persona' } })}
                                placeholder="Ej: 15"
                                className={errors.maximo_personas ? 'error' : ''}
                            />
                            {errors.maximo_personas && <span className="error-msg">{errors.maximo_personas.message}</span>}
                        </div>
                    </div>

                    {/* Idiomas */}
                    <div className="form-group">
                        <label><FaLanguage /> Idiomas Disponibles</label>
                        <div className="tags-input-row">
                            <input
                                type="text"
                                value={idiomaInput}
                                onChange={e => setIdiomaInput(e.target.value)}
                                onKeyDown={e => {
                                    if ((e.key === 'Enter' || e.key === ',') && idiomaInput.trim()) {
                                        e.preventDefault();
                                        if (!idiomas.includes(idiomaInput.trim())) setIdiomas(prev => [...prev, idiomaInput.trim()]);
                                        setIdiomaInput('');
                                    }
                                }}
                                placeholder="Escribe un idioma y presiona Enter"
                            />
                            <button type="button" className="btn-tag-add" onClick={() => {
                                if (idiomaInput.trim() && !idiomas.includes(idiomaInput.trim())) {
                                    setIdiomas(prev => [...prev, idiomaInput.trim()]);
                                    setIdiomaInput('');
                                }
                            }}><FaPlus /></button>
                        </div>
                        <div className="tags-list">
                            {idiomas.map((idioma, i) => (
                                <span key={i} className="tag-chip">
                                    <FaLanguage /> {idioma}
                                    <button type="button" onClick={() => setIdiomas(prev => prev.filter((_, idx) => idx !== i))}><FaTimes /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ¿Qué incluye? */}
                    <div className="form-group">
                        <label><FaCheck /> ¿Qué incluye?</label>
                        <div className="tags-input-row">
                            <input
                                type="text"
                                value={incluyeInput}
                                onChange={e => setIncluyeInput(e.target.value)}
                                onKeyDown={e => {
                                    if ((e.key === 'Enter' || e.key === ',') && incluyeInput.trim()) {
                                        e.preventDefault();
                                        if (!incluye.includes(incluyeInput.trim())) setIncluye(prev => [...prev, incluyeInput.trim()]);
                                        setIncluyeInput('');
                                    }
                                }}
                                placeholder="Ej: Transporte, Almuerzo... (Enter para agregar)"
                            />
                            <button type="button" className="btn-tag-add" onClick={() => {
                                if (incluyeInput.trim() && !incluye.includes(incluyeInput.trim())) {
                                    setIncluye(prev => [...prev, incluyeInput.trim()]);
                                    setIncluyeInput('');
                                }
                            }}><FaPlus /></button>
                        </div>
                        <div className="tags-list">
                            {incluye.map((item, i) => (
                                <span key={i} className="tag-chip tag-chip--green">
                                    <FaCheck /> {item}
                                    <button type="button" onClick={() => setIncluye(prev => prev.filter((_, idx) => idx !== i))}><FaTimes /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Puntos de interés */}
                    <div className="form-group">
                        <label><FaListUl /> Puntos de Interés</label>
                        <div className="tags-input-row">
                            <input
                                type="text"
                                value={puntoInput}
                                onChange={e => setPuntoInput(e.target.value)}
                                onKeyDown={e => {
                                    if ((e.key === 'Enter' || e.key === ',') && puntoInput.trim()) {
                                        e.preventDefault();
                                        if (!puntosInteres.includes(puntoInput.trim())) setPuntosInteres(prev => [...prev, puntoInput.trim()]);
                                        setPuntoInput('');
                                    }
                                }}
                                placeholder="Ej: Laguna Quilotoa, Mirador... (Enter para agregar)"
                            />
                            <button type="button" className="btn-tag-add" onClick={() => {
                                if (puntoInput.trim() && !puntosInteres.includes(puntoInput.trim())) {
                                    setPuntosInteres(prev => [...prev, puntoInput.trim()]);
                                    setPuntoInput('');
                                }
                            }}><FaPlus /></button>
                        </div>
                        <div className="tags-list">
                            {puntosInteres.map((punto, i) => (
                                <span key={i} className="tag-chip tag-chip--blue">
                                    <FaMapMarkerAlt /> {punto}
                                    <button type="button" onClick={() => setPuntosInteres(prev => prev.filter((_, idx) => idx !== i))}><FaTimes /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 5: ASIGNACIONES */}
                <div className="form-section">
                    <h2 className="section-title">👥 Asignaciones</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaUserTie /> Guía Turístico
                            </label>
                            <select
                                {...register('id_guia')}
                            >
                                <option value="">-- Seleccionar Guía (Opcional) --</option>
                                {listaGuias.map(guia => (
                                    <option key={guia.id} value={guia.id}>{guia.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>
                                <FaHotel /> Hotel Base
                            </label>
                            <select
                                {...register('id_hotel_base')}
                            >
                                <option value="">-- Seleccionar Hotel (Opcional) --</option>
                                {listaHoteles.map(hotel => (
                                    <option key={hotel.id} value={hotel.id}>{hotel.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* BOTONES */}
                <div className="form-actions">
                    <Link to="/admin/crear-tour" className="btn btn-secondary">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        <FaSave /> {loading ? 'Guardando...' : 'Publicar Tour'}
                    </button>
                </div>

            </form>
        </div>
    );

    return <AdminLayout title="Registrar Tour">{content}</AdminLayout>;
};

export default CrearTour;