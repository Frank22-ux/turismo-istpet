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
    FaPhone,
    FaMapMarkerAlt,
    FaDollarSign,
    FaStar,
    FaImage,
    FaTimes
} from 'react-icons/fa';
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

    // Cargar datos si es edición
    useEffect(() => {
        if (isEdit) {
            const fetchHotel = async () => {
                try {
                    setFetching(true);
                    const { data } = await api.get('/hoteles');
                    const hotel = data.find(h => String(h.id) === String(id));

                    if (hotel) {
                        setValue('nombre', hotel.nombre || '');
                        setValue('direccion', hotel.direccion || '');
                        setValue('ciudad', hotel.ciudad || '');
                        setValue('estrellas', hotel.estrellas || 3);
                        setValue('habitaciones', hotel.habitaciones_disponibles || 10);
                        setValue('precioNoche', hotel.precio_noche || 50);
                        setValue('descripcion', hotel.descripcion || '');
                        setValue('amenidades', hotel.amenidades || '');

                        // Si hay fotos existentes, podríamos mostrarlas como previews
                        // Nota: El backend actual no devuelve URLs de fotos en el listado general /hoteles
                        // Asumimos que el admin solo puede editar campos de texto por ahora o que las fotos son reemplazadas
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

            const formDataToSend = new FormData();
            formDataToSend.append('nombre', data.nombre);
            formDataToSend.append('direccion', data.direccion);
            formDataToSend.append('ciudad', data.ciudad);
            formDataToSend.append('estrellas', data.estrellas);
            formDataToSend.append('habitaciones_disponibles', data.habitaciones);
            formDataToSend.append('precio_noche', data.precioNoche);
            formDataToSend.append('descripcion', data.descripcion);
            formDataToSend.append('amenidades', data.amenidades);
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
                                <FaStar /> Estrellas *
                            </label>
                            <select
                                {...register('estrellas', { required: 'Estrellas requeridas' })}
                                className={errors.estrellas ? 'error' : ''}
                            >
                                <option value="">Selecciona estrellas...</option>
                                <option value="1">⭐ 1 Estrella</option>
                                <option value="2">⭐ 2 Estrellas</option>
                                <option value="3">⭐ 3 Estrellas</option>
                                <option value="4">⭐ 4 Estrellas</option>
                                <option value="5">⭐ 5 Estrellas</option>
                            </select>
                            {errors.estrellas && <span className="error-msg">{errors.estrellas.message}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaMapMarkerAlt /> Dirección *
                            </label>
                            <textarea
                                {...register('direccion', { required: 'Dirección requerida' })}
                                placeholder="Av. Principal 123, Ciudad"
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
                            <label>Número de Habitaciones *</label>
                            <input
                                type="number"
                                {...register('habitaciones', {
                                    required: 'Requerido',
                                    min: { value: 1, message: 'Mínimo 1 habitación' }
                                })}
                                placeholder="ej: 50"
                                className={errors.habitaciones ? 'error' : ''}
                            />
                            {errors.habitaciones && <span className="error-msg">{errors.habitaciones.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaDollarSign /> Precio por Noche (USD) *
                            </label>
                            <input
                                type="number"
                                {...register('precioNoche', {
                                    required: 'Requerido',
                                    min: { value: 1, message: 'Precio válido requerido' }
                                })}
                                placeholder="ej: 85"
                                className={errors.precioNoche ? 'error' : ''}
                            />
                            {errors.precioNoche && <span className="error-msg">{errors.precioNoche.message}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                {...register('descripcion')}
                                placeholder="Describe el hotel y sus características principales..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Amenidades (separadas por comas)</label>
                            <textarea
                                {...register('amenidades')}
                                placeholder="ej: WiFi, Piscina, Restaurante, Spa"
                                rows="2"
                            />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 3: IMÁGENES DEL HOTEL */}
                <div className="form-section">
                    <h2 className="section-title">🖼️ Fotos del Hotel (Máximo 4)</h2>

                    <div className="images-upload-section">
                        <label className="images-upload-label">
                            <FaImage className="upload-icon" />
                            <span className="upload-text">
                                Seleccionar Imágenes
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
