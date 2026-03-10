import { useForm } from 'react-hook-form';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../../core/api';
import {
    FaSave,
    FaCloudUploadAlt,
    FaArrowLeft,
    FaFileAlt,
    FaCheckCircle,
    FaExclamationCircle,
    FaMapMarkerAlt,
    FaDollarSign,
    FaStar,
    FaImage,
    FaTimes,
    FaPlus,
    FaTrash
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

import AdminLayout from '../../admin/layouts/AdminLayout';
import './CrearHotel.css';

const CrearHotel = () => {
    const { id } = useParams();
    const isEdit = !!id;

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            nombre: '',
            direccion: '',
            ciudad: '',
            estrellas: 3,
            habitaciones: 10,
            precioNoche: 50,
            descripcion: '',
            amenidades: '',
            convenio: null
        }
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfFileName, setPdfFileName] = useState('');
    const [imagenes, setImagenes] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [position, setPosition] = useState([-0.1807, -78.4678]); // Quito default
    const [rating, setRating] = useState(3);
    const [rooms, setRooms] = useState([
        { tipo: 'Sencilla', cantidad: 1, precio: 50 }
    ]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const amenitiesOptions = [
        'WiFi Gratis', 'Piscina', 'Gimnasio', 'Restaurante',
        'Parqueadero', 'Aire Acondicionado', 'Spa', 'Bar'
    ];

    const handleAmenityChange = (amenity) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(prev => prev.filter(item => item !== amenity));
        } else {
            setSelectedAmenities(prev => [...prev, amenity]);
        }
    };

    const addRoom = () => {
        setRooms([...rooms, { tipo: '', cantidad: 1, precio: 0 }]);
    };

    const removeRoom = (index) => {
        setRooms(rooms.filter((_, i) => i !== index));
    };

    const updateRoom = (index, field, value) => {
        const newRooms = [...rooms];
        newRooms[index][field] = value;
        setRooms(newRooms);
    };

    // Componente para manejar clicks en el mapa
    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                reverseGeocode(lat, lng);
            },
        });

        return <Marker position={position} draggable={true} eventHandlers={{
            dragend: (e) => {
                const marker = e.target;
                const { lat, lng } = marker.getLatLng();
                setPosition([lat, lng]);
                reverseGeocode(lat, lng);
            }
        }} />;
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data.display_name) {
                setValue('direccion', data.display_name);
                // Intentar extraer la ciudad si Nominatim la provee
                const city = data.address.city || data.address.town || data.address.village || data.address.county;
                if (city) setValue('ciudad', city);
            }
        } catch (error) {
            console.error("Error in reverse geocoding:", error);
        }
    };

    // Cargar datos si es edición
    useEffect(() => {
        if (isEdit) {
            const fetchHotel = async () => {
                try {
                    setFetching(true);
                    const { data: hotel } = await api.get(`/hoteles/${id}`);

                    if (hotel) {
                        setValue('nombre', hotel.nombre || '');
                        setValue('direccion', hotel.direccion || '');
                        setValue('ciudad', hotel.ciudad || '');
                        setValue('estrellas', hotel.estrellas || 3);
                        setRating(hotel.estrellas || 3);
                        setValue('descripcion', hotel.descripcion || '');
                        
                        // Cargar Coordenadas
                        if (hotel.latitud && hotel.longitud) {
                            setPosition([parseFloat(hotel.latitud), parseFloat(hotel.longitud)]);
                        }

                        // Cargar Habitaciones
                        if (hotel.habitaciones_lista && hotel.habitaciones_lista.length > 0) {
                            setRooms(hotel.habitaciones_lista.map(h => ({
                                tipo: h.tipo,
                                cantidad: h.cantidad,
                                precio: h.precio
                            })));
                        } else {
                            // Si no hay lista detallada, usar el resumen para una sola fila
                            setRooms([{ 
                                tipo: 'Estándar', 
                                cantidad: hotel.habitaciones_disponibles || 1, 
                                precio: hotel.precio_noche || 0 
                            }]);
                        }

                        // Cargar Amenidades
                        if (hotel.amenidades) {
                            const ams = hotel.amenidades.split(',').map(a => a.trim());
                            setSelectedAmenities(ams.filter(a => amenitiesOptions.includes(a)));
                        }
                    }
                } catch (err) {
                    setError('Error al cargar datos del hotel');
                    console.error(err);
                } finally {
                    setFetching(false);
                }
            };
            fetchHotel();
        }
    }, [isEdit, id, setValue]);

    // Manejo de archivo PDF
    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar que sea PDF
            if (file.type !== 'application/pdf') {
                setError('❌ Solo se permite archivos PDF. Por favor selecciona un PDF válido.');
                setTimeout(() => setError(''), 5000);
                return;
            }
            // Validar tamaño (máximo 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('❌ El archivo es muy grande. Máximo 10MB permitidos.');
                setTimeout(() => setError(''), 5000);
                return;
            }
            setPdfFile(file);
            setPdfFileName(file.name);
            setError('');
        }
    };

    // Manejo de imágenes del hotel (máximo 4)
    const handleImagenChange = (e) => {
        const files = Array.from(e.target.files);

        if (imagenes.length + files.length > 4) {
            setError(`❌ Máximo 4 imágenes permitidas. Ya tienes ${imagenes.length}.`);
            setTimeout(() => setError(''), 5000);
            return;
        }

        files.forEach((file) => {
            // Validar que sea imagen
            if (!file.type.startsWith('image/')) {
                setError('❌ Solo se permiten archivos de imagen (JPG, PNG, etc.).');
                setTimeout(() => setError(''), 5000);
                return;
            }
            // Validar tamaño (máximo 5MB por imagen)
            if (file.size > 5 * 1024 * 1024) {
                setError('❌ Cada imagen debe ser menor a 5MB.');
                setTimeout(() => setError(''), 5000);
                return;
            }

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenes(prev => [...prev, file]);
                setPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
            setError('');
        });
    };

    // Eliminar imagen
    const handleRemoveImage = (index) => {
        setImagenes(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');

            if (!isEdit && !pdfFile) {
                setError('⚠️ Debes adjuntar el convenio en PDF.');
                setLoading(false);
                return;
            }

            if (!isEdit && imagenes.length === 0) {
                setError('⚠️ Debes cargar al menos una imagen del hotel.');
                setLoading(false);
                return;
            }

            // Calcular campos de resumen para la tabla hoteles principal
            const totalHabitaciones = rooms.reduce((sum, r) => sum + (parseInt(r.cantidad) || 0), 0);
            const precioMinimo = rooms.length > 0 
                ? Math.min(...rooms.map(r => parseFloat(r.precio) || 0)) 
                : 0;

            const formDataToSend = new FormData();
            formDataToSend.append('nombre', data.nombre);
            formDataToSend.append('direccion', data.direccion);
            formDataToSend.append('ciudad', data.ciudad);
            formDataToSend.append('estrellas', rating);
            formDataToSend.append('latitud', position[0]);
            formDataToSend.append('longitud', position[1]);
            formDataToSend.append('habitaciones_disponibles', totalHabitaciones);
            formDataToSend.append('precio_noche', precioMinimo);
            formDataToSend.append('habitaciones', JSON.stringify(rooms)); // Detalle para tabla relacionada
            formDataToSend.append('amenidades', selectedAmenities.join(', '));
            formDataToSend.append('descripcion', data.descripcion);
            formDataToSend.append('convenio', pdfFile);

            imagenes.forEach((img) => {
                formDataToSend.append('fotos', img);
            });

            if (isEdit) {
                await api.put(`/hoteles/${id}`, formDataToSend);
            } else {
                await api.post('/hoteles', formDataToSend);
            }

            setSuccess(true);
            reset();
            setPdfFile(null);
            setPdfFileName('');
            setImagenes([]);
            setPreviews([]);

            setTimeout(() => {
                // La vista de gestión de hoteles vive en /admin/crear-hotel (ruta del sidebar)
                navigate('/admin/crear-hotel');
            }, 2000);

        } catch (err) {
            setError('❌ Error al crear el hotel: ' + (err.response?.data?.message || err.message));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div className="crear-hotel-container">
            {/* HEADER */}
            <div className="crear-hotel-header">
                <Link to="/admin/crear-hotel" className="btn-volver">
                    <FaArrowLeft /> Volver
                </Link>
                <h1 className="crear-hotel-title">
                    <span className="emoji">🏨</span> {isEdit ? 'Editar Hotel' : 'Registrar Nuevo Hotel'}
                </h1>
                <p className="crear-hotel-subtitle">
                    {isEdit ? 'Actualiza los datos del hotel seleccionado' : 'Completa los datos para registrar un nuevo hotel en el sistema'}
                </p>
            </div>

            {fetching && (
                <div className="alert alert-info">
                    ⏳ Cargando datos del hotel...
                </div>
            )}

            {/* ALERTS */}
            {success && (
                <div className="alert alert-success">
                    <FaCheckCircle /> ¡Hotel registrado exitosamente!
                </div>
            )}
            {error && (
                <div className="alert alert-error">
                    <FaExclamationCircle /> {error}
                </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit(onSubmit)} className="crear-hotel-form">

                {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
                <div className="form-section">
                    <h2 className="section-title">📋 Información Básica</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre del Hotel *</label>
                            <input
                                type="text"
                                {...register('nombre', { required: 'Nombre requerido' })}
                                placeholder="ej: Hotel Paraíso"
                                className={errors.nombre ? 'error' : ''}
                            />
                            {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
                        </div>
                    </div>

                    <div className="form-row-3">
                        <div className="form-group">
                            <label>
                                <FaMapMarkerAlt /> Ciudad *
                            </label>
                            <input
                                type="text"
                                {...register('ciudad', { required: 'Ciudad requerida' })}
                                placeholder="ej: Quito"
                                className={errors.ciudad ? 'error' : ''}
                            />
                            {errors.ciudad && <span className="error-msg">{errors.ciudad.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaStar /> Categoría *
                            </label>
                            <div className="star-rating-selector">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        className={`star-icon ${star <= rating ? 'active' : ''}`}
                                        onClick={() => {
                                            setRating(star);
                                            setValue('estrellas', star);
                                        }}
                                    />
                                ))}
                            </div>
                            <input type="hidden" {...register('estrellas')} value={rating} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaMapMarkerAlt /> Ubicación Geográfica *
                            </label>
                            <p className="map-instruction">
                                <FaMapMarkerAlt /> Haz clic en el mapa o arrastra el marcador para fijar la ubicación exacta.
                            </p>
                            <div className="map-container-wrapper">
                                <MapContainer
                                    center={position}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker />
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaMapMarkerAlt /> Dirección Exacta (Autocompletada) *
                            </label>
                            <textarea
                                {...register('direccion', { required: 'Dirección requerida' })}
                                placeholder="La dirección se completará al marcar el punto en el mapa..."
                                rows="2"
                                className={errors.direccion ? 'error' : ''}
                            />
                            {errors.direccion && <span className="error-msg">{errors.direccion.message}</span>}
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: DETALLES */}
                <div className="form-section">
                    <h2 className="section-title">🏠 Detalles del Hotel</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Gestión de Habitaciones *</label>
                            <div className="rooms-management">
                                <div className="room-header">
                                    <span>Tipos de Habitaciones</span>
                                    <button type="button" className="btn-add-room" onClick={addRoom}>
                                        <FaPlus /> Agregar
                                    </button>
                                </div>
                                <div className="rooms-list">
                                    {rooms.map((room, index) => (
                                        <div key={index} className="room-row">
                                            <div className="form-group">
                                                <label>Tipo (ej. Suite)</label>
                                                <input
                                                    type="text"
                                                    value={room.tipo}
                                                    onChange={(e) => updateRoom(index, 'tipo', e.target.value)}
                                                    placeholder="Tipo de habitación"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Cantidad</label>
                                                <input
                                                    type="number"
                                                    value={room.cantidad}
                                                    onChange={(e) => updateRoom(index, 'cantidad', e.target.value)}
                                                    min="1"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Precio/Noche</label>
                                                <input
                                                    type="number"
                                                    value={room.precio}
                                                    onChange={(e) => updateRoom(index, 'precio', e.target.value)}
                                                    min="1"
                                                />
                                            </div>
                                            <button 
                                                type="button" 
                                                className="btn-remove-room" 
                                                onClick={() => removeRoom(index)}
                                                disabled={rooms.length === 1}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Descripción General (Texto Enriquecido)</label>
                            <textarea
                                {...register('descripcion')}
                                placeholder="Describe el hotel y sus características principales..."
                                rows="5"
                                style={{ border: '2px solid #1f7a8c' }}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Amenidades</label>
                            <div className="amenities-grid">
                                {amenitiesOptions.map((amenity) => (
                                    <label key={amenity} className="amenity-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.includes(amenity)}
                                            onChange={() => handleAmenityChange(amenity)}
                                        />
                                        <span>{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 3: IMÁGENES DEL HOTEL */}
                <div className="form-section">
                    <h2 className="section-title">🖼️ Fotos del Hotel (Máximo 4)</h2>

                    <div 
                        className="images-upload-section"
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('drag-over');
                            const files = Array.from(e.dataTransfer.files);
                            handleImagenChange({ target: { files } });
                        }}
                    >
                        <label className="images-upload-label">
                            <FaImage className="upload-icon" />
                            <span className="upload-text">
                                Arrastra y suelta tus fotos aquí o haz clic para seleccionar
                            </span>
                            <span className="upload-subtitle">
                                JPG, PNG, hasta 5MB cada una ({imagenes.length}/4)
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImagenChange}
                                multiple
                                disabled={imagenes.length >= 4}
                                className="images-input"
                            />
                        </label>

                        {previews.length > 0 && (
                            <div className="gallery-preview">
                                {previews.map((preview, index) => (
                                    <div key={index} className="gallery-item">
                                        <img src={preview} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="btn-remove-image"
                                            onClick={() => handleRemoveImage(index)}
                                            title="Eliminar imagen"
                                        >
                                            <FaTimes />
                                        </button>
                                        <span className="image-number">{index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* SECCIÓN 4: DOCUMENTO PDF DEL CONVENIO */}
                <div className="form-section">
                    <h2 className="section-title">📄 Convenio y Documentación</h2>

                    <div className="pdf-upload-section">
                        <label className="pdf-upload-label">
                            <FaCloudUploadAlt className="upload-icon" />
                            <span className="upload-text">
                                Cargar Convenio (PDF) *
                            </span>
                            <span className="upload-subtitle">
                                Solo archivos PDF, máximo 10MB
                            </span>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handlePdfChange}
                                className="pdf-input"
                            />
                        </label>

                        {pdfFileName && (
                            <div className="pdf-file-info">
                                <FaFileAlt className="pdf-icon" />
                                <div className="pdf-details">
                                    <p className="pdf-name">{pdfFileName}</p>
                                    <p className="pdf-status">✓ Archivo válido</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="form-actions">
                    <Link to="/admin/crear-hotel" className="btn btn-secondary">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || fetching}
                    >
                        <FaSave /> {loading ? 'Guardando...' : (isEdit ? 'Actualizar Hotel' : 'Registrar Hotel')}
                    </button>
                </div>
            </form>
        </div>
    );

    return <AdminLayout title="Registrar Hotel">{content}</AdminLayout>;
};

export default CrearHotel;
