import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FaSave, FaImages, FaMapMarkerAlt, FaCalendarAlt,
    FaHotel, FaUserTie, FaArrowLeft, FaCheckCircle,
    FaExclamationCircle, FaMountain, FaUsers, FaLanguage,
    FaCheck, FaListUl, FaPlus, FaTimes, FaClock
} from 'react-icons/fa';
import { getTourRequest, updateTourRequest } from '../services/tour.service';
import api from '../../../core/api';
import './EditarTour.css';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const CATEGORIAS = [
    { icon: '🏔️', nombre: 'Aventura' },
    { icon: '🌿', nombre: 'Naturaleza' },
    { icon: '🏖️', nombre: 'Playa' },
    { icon: '🎭', nombre: 'Cultura' },
    { icon: '🍽️', nombre: 'Gastronomía' },
    { icon: '🏨', nombre: 'Lujo' },
    { icon: '🐾', nombre: 'Fauna' },
    { icon: '🚵', nombre: 'Deportes' },
];

const EditarTour = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, watch, reset } = useForm();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Archivos
    const [coverPreview, setCoverPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Catálogos
    const [listaGuias, setListaGuias] = useState([]);
    const [listaHoteles, setListaHoteles] = useState([]);

    // Mapa
    const [position, setPosition] = useState(null);
    const defaultCenter = [-0.1807, -78.4678];

    // Geocoding
    const [searchInput, setSearchInput] = useState('');
    const [geocodeMsg, setGeocodeMsg] = useState('');
    const geocodeTimerRef = useRef(null);

    // Campos detalle
    const [idiomas, setIdiomas] = useState([]);
    const [idiomaInput, setIdiomaInput] = useState('');
    const [incluye, setIncluye] = useState([]);
    const [incluyeInput, setIncluyeInput] = useState('');
    const [puntosInteres, setPuntosInteres] = useState([]);
    const [puntoInput, setPuntoInput] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Aventura');

    const fechaInicioWatch = watch('fecha_inicio');
    const fechaFinWatch = watch('fecha_fin');
    const ciudadDestinoWatch = watch('ciudad_destino');
    const today = new Date().toISOString().split('T')[0];

    // Normalizar texto (sin tildes, minúsculas) para comparación flexible
    const normalize = (str) => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Hoteles filtrados por ciudad del tour
    // Si no hay ciudad escrita, la lista queda vacía
    const hotelesFiltrados = ciudadDestinoWatch
        ? listaHoteles.filter(h =>
            normalize(h.ciudad).includes(normalize(ciudadDestinoWatch)) ||
            normalize(ciudadDestinoWatch).includes(normalize(h.ciudad))
          )
        : [];

    // Calcular duración
    const calcularDuracion = (fechaInicio, fechaFin) => {
        if (!fechaInicio || !fechaFin) return '1 día';
        const dif = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24)) + 1;
        return dif <= 1 ? '1 día' : `${dif} días`;
    };

    // Cargar todo al montar
    useEffect(() => {
        const cargarTodo = async () => {
            try {
                setFetching(true);

                // Catálogos reales desde la API
                const [guiasRes, hotelesRes] = await Promise.all([
                    api.get('/guias'),
                    api.get('/hoteles')
                ]);
                setListaGuias(guiasRes.data.map(g => ({ id: g.id_usuario, nombre: `${g.primer_nombre} ${g.apellido_paterno}` })));
                setListaHoteles(hotelesRes.data.map(h => ({ id: h.id_hotel, nombre: h.nombre, ciudad: h.ciudad })));

                // Datos del tour
                const tour = await getTourRequest(id);
                if (!tour) return;

                // Parsear galería (puede venir como string JSON o array)
                let galeriaArr = [];
                if (tour.galeria) {
                    try {
                        galeriaArr = typeof tour.galeria === 'string' ? JSON.parse(tour.galeria) : tour.galeria;
                    } catch { galeriaArr = []; }
                }

                // Parsear arrays de detalle
                const parseArr = (val) => {
                    if (!val) return [];
                    try { return typeof val === 'string' ? JSON.parse(val) : val; } catch { return []; }
                };

                // Cargar datos al formulario
                reset({
                    nombre: tour.nombre || '',
                    ciudad_destino: tour.ciudad_destino || '',
                    precio: tour.precio || '',
                    descripcion: tour.descripcion || '',
                    duracion: tour.duracion || '',
                    fecha_inicio: tour.fecha_inicio ? tour.fecha_inicio.split('T')[0] : '',
                    fecha_fin: tour.fecha_fin ? tour.fecha_fin.split('T')[0] : '',
                    latitud: tour.latitud || '',
                    longitud: tour.longitud || '',
                    dificultad: tour.dificultad || 'Moderada',
                    maximo_personas: tour.maximo_personas || 10,
                    id_guia: tour.id_guia_asignado || '',
                    id_hotel_base: tour.id_hotel_base || '',
                    en_oferta: tour.en_oferta ? true : false,
                    descuento: tour.descuento || 0
                });

                // Campos de estado extra
                setIdiomas(parseArr(tour.idiomas));
                setIncluye(parseArr(tour.incluye));
                setPuntosInteres(parseArr(tour.puntos_interes));
                setCategoriaSeleccionada(tour.categoria || 'Aventura');

                // Imágenes
                if (tour.imagen_portada) setCoverPreview(`http://localhost:4000${tour.imagen_portada}`);
                if (galeriaArr.length > 0) setGalleryPreviews(galeriaArr.map(img => `http://localhost:4000${img}`));

                // Mapa
                if (tour.latitud && tour.longitud) {
                    setPosition({ lat: parseFloat(tour.latitud), lng: parseFloat(tour.longitud) });
                }

            } catch (err) {
                setError('Error al cargar los datos del tour.');
                console.error('Error al cargar:', err);
            } finally {
                setFetching(false);
            }
        };
        cargarTodo();
    }, [id, reset]);

    // LocationMarker con flyTo
    function LocationMarker() {
        const map = useMap();
        useEffect(() => {
            if (position) map.flyTo([position.lat, position.lng], 14, { duration: 1 });
        }, [position, map]);
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                setValue('latitud', e.latlng.lat.toFixed(6));
                setValue('longitud', e.latlng.lng.toFixed(6));
            },
        });
        return position ? <Marker position={position} /> : null;
    }

    // Geocoding directo
    const geocodeAddress = useCallback(async (address) => {
        if (!address || address.length < 4) return;
        setGeocodeMsg('🔍 Buscando...');
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const results = await resp.json();
            if (results.length > 0) {
                const { lat, lon } = results[0];
                setPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
                setValue('latitud', parseFloat(lat).toFixed(6));
                setValue('longitud', parseFloat(lon).toFixed(6));
                setGeocodeMsg('✅ Ubicación encontrada');
                const rev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const revData = await rev.json();
                const city = revData?.address?.city || revData?.address?.town || revData?.address?.village;
                if (city) setValue('ciudad_destino', city);
            } else {
                setGeocodeMsg('⚠️ No encontrado');
            }
        } catch { setGeocodeMsg('❌ Error al buscar'); }
        finally { setTimeout(() => setGeocodeMsg(''), 4000); }
    }, [setValue]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');
            const formData = new FormData();

            formData.append('nombre', data.nombre);
            formData.append('ciudad_destino', data.ciudad_destino);
            formData.append('precio', data.precio);
            formData.append('duracion', calcularDuracion(data.fecha_inicio, data.fecha_fin));
            formData.append('descripcion', data.descripcion || '');
            formData.append('fecha_inicio', data.fecha_inicio || '');
            formData.append('fecha_fin', data.fecha_fin || '');
            formData.append('latitud', data.latitud);
            formData.append('longitud', data.longitud);
            formData.append('dificultad', data.dificultad || 'Moderada');
            formData.append('maximo_personas', data.maximo_personas || 10);
            formData.append('categoria', categoriaSeleccionada);
            if (idiomas.length > 0) formData.append('idiomas', JSON.stringify(idiomas));
            if (incluye.length > 0) formData.append('incluye', JSON.stringify(incluye));
            if (puntosInteres.length > 0) formData.append('puntos_interes', JSON.stringify(puntosInteres));
            formData.append('en_oferta', data.en_oferta ? 'true' : 'false');
            formData.append('descuento', data.descuento || 0);
            formData.append('id_guia', data.id_guia !== '' ? data.id_guia : '');
            formData.append('id_hotel_base', data.id_hotel_base !== '' ? data.id_hotel_base : '');

            if (imagenFile) formData.append('imagen_portada', imagenFile);
            if (galleryFiles.length > 0) galleryFiles.forEach(f => formData.append('galeria', f));

            await updateTourRequest(id, formData);
            setSuccess(true);
            setTimeout(() => navigate('/admin/crear-tour'), 2000);
        } catch (err) {
            setError('❌ Error al guardar: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="editar-tour-container">
            <div className="editar-tour-card">
                <div className="card-header">
                    <Link to="/admin/crear-tour" className="btn-volver-edit"><FaArrowLeft /> Volver</Link>
                    <h2>✏️ Editar Tour: <em>{watch('nombre')}</em></h2>
                </div>

                {fetching && <div className="alert alert-info">⏳ Cargando datos del tour...</div>}
                {success && <div className="alert alert-success"><FaCheckCircle /> ¡Tour actualizado exitosamente! Redirigiendo...</div>}
                {error && <div className="alert alert-error"><FaExclamationCircle /> {error}</div>}

                <form onSubmit={handleSubmit(onSubmit)}>

                    {/* ── SECCIÓN: MULTIMEDIA ── */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">📸 Portada y Galería</h3>
                        <div className="media-section">
                            <div className="media-col-main">
                                <label className="form-label">Imagen de Portada</label>
                                <div className="image-upload-wrapper">
                                    <input type="file" id="pInput" className="hidden-file-input" accept="image/*" onChange={e => {
                                        const file = e.target.files[0];
                                        if (file) { setImagenFile(file); setCoverPreview(URL.createObjectURL(file)); }
                                    }} />
                                    <label htmlFor="pInput" className="image-upload-label">
                                        {coverPreview
                                            ? <><img src={coverPreview} className="image-preview" alt="Portada" /><span className="overlay-change">Cambiar</span></>
                                            : <span>Seleccionar Foto</span>}
                                    </label>
                                </div>
                            </div>
                            <div className="media-col-gallery">
                                <label className="form-label">Galería de Fotos</label>
                                <input type="file" multiple id="gInput" className="hidden-file-input" accept="image/*" onChange={e => {
                                    const files = Array.from(e.target.files);
                                    setGalleryFiles(files);
                                    setGalleryPreviews(files.map(f => URL.createObjectURL(f)));
                                }} />
                                <label htmlFor="gInput" className="gallery-upload-btn"><FaImages /> Actualizar Galería</label>
                                <div className="gallery-grid">
                                    {galleryPreviews.map((src, i) => (
                                        <div key={i} className="gallery-thumb-wrap">
                                            <img src={src} className="gallery-thumb" alt={`Foto ${i + 1}`} />
                                            <span className="thumb-num">{i + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── SECCIÓN: INFO BÁSICA ── */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">📋 Información General</h3>
                        <div className="form-row">
                            <div className="form-col">
                                <label className="form-label">Nombre del Tour *</label>
                                <input type="text" className="form-input" {...register('nombre', { required: true })} placeholder="Nombre del tour" />
                            </div>
                            <div className="form-col">
                                <label className="form-label"><FaMapMarkerAlt /> Ciudad Destino *</label>
                                <input type="text" className="form-input" {...register('ciudad_destino', { required: true })} placeholder="Ciudad" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-col">
                                <label className="form-label">Precio ($) *</label>
                                <input type="number" step="0.01" className="form-input" {...register('precio', { required: true })} />
                            </div>
                            <div className="form-col">
                                <label className="form-label">Duración (calculada)</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input type="text" className="form-input" value={calcularDuracion(fechaInicioWatch, fechaFinWatch)} readOnly style={{ background: '#e2e8f0', paddingRight: '40px' }} />
                                    <FaClock style={{ position: 'absolute', right: '12px', color: '#64748b' }} />
                                </div>
                            </div>
                        </div>

                        <div className="form-row" style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a', marginTop: '4px' }}>
                            <div className="form-col" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="form-label" style={{ color: '#b45309' }}>🔥 Oferta Especial</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" id="en_oferta" {...register('en_oferta')} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#b45309' }} />
                                    <label htmlFor="en_oferta" style={{ cursor: 'pointer', fontSize: '14px', color: '#b45309', fontWeight: 500 }}>Activar descuento para este tour</label>
                                </div>
                            </div>
                            {watch('en_oferta') && (
                                <div className="form-col">
                                    <label className="form-label" style={{ color: '#b45309' }}>Porcentaje Descuento (%) *</label>
                                    <input type="number" step="1" min="1" max="99" className="form-input" {...register('descuento', { required: watch('en_oferta') })} placeholder="Ej: 15" style={{ borderColor: '#fcd34d' }} />
                                </div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-col">
                                <label className="form-label"><FaCalendarAlt /> Fecha Inicio</label>
                                <input type="date" className="form-input" min={today} {...register('fecha_inicio')} />
                            </div>
                            <div className="form-col">
                                <label className="form-label"><FaCalendarAlt /> Fecha Fin</label>
                                <input type="date" className="form-input" min={fechaInicioWatch || today} {...register('fecha_fin')} />
                            </div>
                        </div>

                        <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="form-col">
                                <label className="form-label">Descripción</label>
                                <textarea className="form-textarea" rows="4" {...register('descripcion')} placeholder="Describe el tour..." />
                            </div>
                        </div>
                    </div>

                    {/* ── SECCIÓN: DETALLES ── */}
                    <div className="edit-section">
                        <h3 className="edit-section-title"><FaMountain /> Detalles del Tour</h3>

                        <div className="form-row">
                            <div className="form-col">
                                <label className="form-label"><FaMountain /> Dificultad</label>
                                <select className="form-input" {...register('dificultad')}>
                                    <option value="Fácil">Fácil</option>
                                    <option value="Moderada">Moderada</option>
                                    <option value="Difícil">Difícil</option>
                                    <option value="Extrema">Extrema</option>
                                </select>
                            </div>
                            <div className="form-col">
                                <label className="form-label"><FaUsers /> Máximo Personas</label>
                                <input type="number" className="form-input" min="1" max="200"
                                    {...register('maximo_personas')} placeholder="Ej: 15" />
                            </div>
                        </div>

                        {/* Categoría */}
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">🏷️ Categoría <small style={{ color: '#64748b', fontWeight: 400 }}>(para el filtro del turista)</small></label>
                            <div className="categoria-pills-edit">
                                {CATEGORIAS.map(cat => (
                                    <button key={cat.nombre} type="button"
                                        className={`cat-pill-edit ${categoriaSeleccionada === cat.nombre ? 'active' : ''}`}
                                        onClick={() => setCategoriaSeleccionada(cat.nombre)}>
                                        {cat.icon} {cat.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Idiomas */}
                        <div className="form-group">
                            <label className="form-label"><FaLanguage /> Idiomas</label>
                            <div className="tags-input-row">
                                <input type="text" className="form-input" value={idiomaInput}
                                    onChange={e => setIdiomaInput(e.target.value)}
                                    onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && idiomaInput.trim()) { e.preventDefault(); if (!idiomas.includes(idiomaInput.trim())) setIdiomas(prev => [...prev, idiomaInput.trim()]); setIdiomaInput(''); } }}
                                    placeholder="Idioma (Enter para agregar)" />
                                <button type="button" className="btn-tag-add-edit" onClick={() => { if (idiomaInput.trim()) { setIdiomas(prev => [...prev, idiomaInput.trim()]); setIdiomaInput(''); } }}><FaPlus /></button>
                            </div>
                            <div className="tags-list-edit">{idiomas.map((idioma, i) => <span key={i} className="tag-chip-edit"><FaLanguage /> {idioma}<button type="button" onClick={() => setIdiomas(prev => prev.filter((_, idx) => idx !== i))}><FaTimes /></button></span>)}</div>
                        </div>

                        {/* Incluye */}
                        <div className="form-group">
                            <label className="form-label"><FaCheck /> ¿Qué incluye?</label>
                            <div className="tags-input-row">
                                <input type="text" className="form-input" value={incluyeInput}
                                    onChange={e => setIncluyeInput(e.target.value)}
                                    onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && incluyeInput.trim()) { e.preventDefault(); if (!incluye.includes(incluyeInput.trim())) setIncluye(prev => [...prev, incluyeInput.trim()]); setIncluyeInput(''); } }}
                                    placeholder="Ej: Transporte, Almuerzo..." />
                                <button type="button" className="btn-tag-add-edit" onClick={() => { if (incluyeInput.trim()) { setIncluye(prev => [...prev, incluyeInput.trim()]); setIncluyeInput(''); } }}><FaPlus /></button>
                            </div>
                            <div className="tags-list-edit">{incluye.map((item, i) => <span key={i} className="tag-chip-edit tag-green"><FaCheck /> {item}<button type="button" onClick={() => setIncluye(prev => prev.filter((_, idx) => idx !== i))}><FaTimes /></button></span>)}</div>
                        </div>

                        {/* Puntos de interés */}
                        <div className="form-group">
                            <label className="form-label"><FaListUl /> Puntos de Interés</label>
                            <div className="tags-input-row">
                                <input type="text" className="form-input" value={puntoInput}
                                    onChange={e => setPuntoInput(e.target.value)}
                                    onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && puntoInput.trim()) { e.preventDefault(); if (!puntosInteres.includes(puntoInput.trim())) setPuntosInteres(prev => [...prev, puntoInput.trim()]); setPuntoInput(''); } }}
                                    placeholder="Ej: Laguna Quilotoa..." />
                                <button type="button" className="btn-tag-add-edit" onClick={() => { if (puntoInput.trim()) { setPuntosInteres(prev => [...prev, puntoInput.trim()]); setPuntoInput(''); } }}><FaPlus /></button>
                            </div>
                            <div className="tags-list-edit">{puntosInteres.map((punto, i) => <span key={i} className="tag-chip-edit tag-blue"><FaMapMarkerAlt /> {punto}<button type="button" onClick={() => setPuntosInteres(prev => prev.filter((_, idx) => idx !== i))}><FaTimes /></button></span>)}</div>
                        </div>
                    </div>

                    {/* ── SECCIÓN: UBICACIÓN ── */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">📍 Ubicación</h3>
                        <div className="form-group" style={{ marginBottom: '14px' }}>
                            <label className="form-label"><FaMapMarkerAlt /> Buscar dirección</label>
                            <div className="address-search-edit">
                                <FaMapMarkerAlt style={{ color: '#1f7a8c', flexShrink: 0 }} />
                                <input type="text" value={searchInput}
                                    onChange={e => { setSearchInput(e.target.value); if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current); geocodeTimerRef.current = setTimeout(() => geocodeAddress(e.target.value), 1000); }}
                                    placeholder="Escribe para buscar en el mapa..."
                                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.95rem' }} />
                                {geocodeMsg && <span style={{ fontSize: '0.82rem', color: geocodeMsg.startsWith('✅') ? '#16a34a' : '#0369a1' }}>{geocodeMsg}</span>}
                            </div>
                        </div>
                        <div className="map-wrapper-edit">
                            <MapContainer center={position ? [position.lat, position.lng] : defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        {position && (
                            <div className="coords-badges">
                                <span className="badge-edit">Lat: {position.lat.toFixed(6)}</span>
                                <span className="badge-edit">Lng: {position.lng.toFixed(6)}</span>
                            </div>
                        )}
                        <input type="hidden" {...register('latitud')} />
                        <input type="hidden" {...register('longitud')} />
                    </div>

                    {/* ── SECCIÓN: ASIGNACIONES ── */}
                    <div className="edit-section">
                        <h3 className="edit-section-title">👥 Asignaciones</h3>
                        <div className="form-row">
                            <div className="form-col">
                                <label className="form-label"><FaUserTie /> Guía Turístico</label>
                                <select className="form-input" {...register('id_guia')}>
                                    <option value="">-- Sin Asignar --</option>
                                    {listaGuias.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-col">
                                <label className="form-label"><FaHotel /> Hotel Base</label>
                                <select className="form-input" {...register('id_hotel_base')}>
                                    <option value="">-- Ninguno --</option>
                                    {ciudadDestinoWatch && hotelesFiltrados.map(h => (
                                        <option key={h.id} value={h.id}>🏨 {h.nombre} — {h.ciudad}</option>
                                    ))}
                                    {ciudadDestinoWatch && hotelesFiltrados.length === 0 && (
                                        <option disabled value="">⚠️ Sin hoteles en "{ciudadDestinoWatch}"</option>
                                    )}
                                </select>
                                {!ciudadDestinoWatch && (
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                                        Escribe la ciudad destino para ver los hoteles disponibles.
                                    </span>
                                )}
                                {ciudadDestinoWatch && hotelesFiltrados.length === 0 && (
                                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '4px', display: 'block' }}>
                                        ⚠️ No hay hoteles en "{ciudadDestinoWatch}". Puedes dejar este campo vacío.
                                    </span>
                                )}
                                {ciudadDestinoWatch && hotelesFiltrados.length > 0 && (
                                    <span style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '4px', display: 'block' }}>
                                        ✅ {hotelesFiltrados.length} hotel(es) cerca de "{ciudadDestinoWatch}"
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="form-actions-edit">
                        <button type="button" onClick={() => navigate('/admin/crear-tour')} className="btn-cancel-edit">Descartar</button>
                        <button type="submit" className="btn-save-edit" disabled={loading || fetching}>
                            <FaSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditarTour;