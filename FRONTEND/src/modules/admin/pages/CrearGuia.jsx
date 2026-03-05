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
    FaEnvelope,
    FaGlobe,
    FaBriefcase,
    FaUser,
    FaTimes,
    FaImage
} from 'react-icons/fa';
import AdminLayout from '../layouts/AdminLayout';
import './CrearGuia.css';

const CrearGuia = () => {
    const { id } = useParams();
    const isEdit = !!id;

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            primer_nombre: '',
            segundo_nombre: '',
            apellido_paterno: '',
            apellido_materno: '',
            cedula: '',
            correo: '',
            password: '',
            codigo_pais: '+593',
            numero_celular: '',
            idiomas: [],
            experiencia: 1,
            especialidades: [],
            bio: '',
            disponibilidad: 'tiempo-completo',
            hotel_asignado: ''
        }
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [fotoPreview, setFotoPreview] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [cvFileName, setCvFileName] = useState('');
    const [idiomasSeleccionados, setIdiomasSeleccionados] = useState([]);
    const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState([]);

    // Cargar datos si es edición
    useEffect(() => {
        if (isEdit) {
            const fetchGuia = async () => {
                try {
                    setFetching(true);
                    // El backend getGuias devuelve un array, buscaremos el específico
                    // O si existe un GET /guias/:id, lo usamos. 
                    // Revisando guia.routes.js: no hay GET /guias/:id. 
                    // Usaremos el listado general por ahora o asumiendo que el admin tiene permiso para buscar.
                    const { data } = await api.get('/guias');
                    const guia = data.find(g => String(g.id_usuario) === String(id));

                    if (guia) {
                        setValue('primer_nombre', guia.primer_nombre || '');
                        setValue('segundo_nombre', guia.segundo_nombre || '');
                        setValue('apellido_paterno', guia.apellido_paterno || '');
                        setValue('apellido_materno', guia.apellido_materno || '');
                        setValue('cedula', guia.cedula || '');
                        setValue('correo', guia.correo || '');
                        setValue('codigo_pais', guia.codigo_pais || '+593');
                        setValue('numero_celular', guia.numero_celular || '');
                        setValue('experiencia', guia.experiencia_anios || 1);
                        setValue('bio', guia.bio || '');
                        setValue('disponibilidad', guia.disponibilidad || 'tiempo-completo');

                        // Idiomas y especialidades
                        const ids = Array.isArray(guia.idiomas) ? guia.idiomas : JSON.parse(guia.idiomas || '[]');
                        setIdiomasSeleccionados(ids);

                        const esp = Array.isArray(guia.especialidades) ? guia.especialidades : JSON.parse(guia.especialidades || '[]');
                        setEspecialidadesSeleccionadas(esp);

                        if (guia.foto_url) {
                            setFotoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${guia.foto_url}`);
                        }
                        if (guia.cv_pdf_url) {
                            setCvFileName('Archivo CV existente');
                        }
                    }
                } catch (err) {
                    setError('Error al cargar datos del guía');
                    console.error(err);
                } finally {
                    setFetching(false);
                }
            };
            fetchGuia();
        }
    }, [isEdit, id, setValue]);

    const idiomas_disponibles = [
        'Español',
        'Inglés',
        'Francés',
        'Alemán',
        'Italiano',
        'Portugués',
        'Chino',
        'Japonés',
        'Ruso'
    ];

    const especialidades_disponibles = [
        'Turismo de Aventura',
        'Ecoturismo',
        'Turismo Cultural',
        'Turismo de Montaña',
        'Turismo de Playa',
        'Turismo Gastronómico',
        'Turismo Histórico',
        'Turismo de Negocios',
        'Turismo Rural',
        'Tours Urbanos'
    ];

    // Manejo de foto de perfil
    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('❌ Solo se permiten archivos de imagen (JPG, PNG, etc.).');
                setTimeout(() => setError(''), 5000);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('❌ La foto debe ser menor a 5MB.');
                setTimeout(() => setError(''), 5000);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPerfil(file);
                setFotoPreview(reader.result);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    // Eliminar foto de perfil
    const handleRemoveFoto = () => {
        setFotoPerfil(null);
        setFotoPreview('');
    };

    // Manejo de archivo CV
    const handleCvChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('❌ Solo se permite archivos PDF para el CV. Por favor selecciona un PDF válido.');
                setTimeout(() => setError(''), 5000);
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('❌ El archivo es muy grande. Máximo 10MB permitidos.');
                setTimeout(() => setError(''), 5000);
                return;
            }
            setCvFile(file);
            setCvFileName(file.name);
            setError('');
        }
    };

    // Manejo de idiomas
    const toggleIdioma = (idioma) => {
        setIdiomasSeleccionados(prev => {
            if (prev.includes(idioma)) {
                return prev.filter(i => i !== idioma);
            } else {
                return [...prev, idioma];
            }
        });
    };

    const toggleEspecialidad = (especialidad) => {
        setEspecialidadesSeleccionadas(prev => {
            if (prev.includes(especialidad)) {
                return prev.filter(e => e !== especialidad);
            } else {
                return [...prev, especialidad];
            }
        });
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError('');

            if (!isEdit && !fotoPerfil) {
                setError('⚠️ Debes cargar una foto de perfil.');
                setLoading(false);
                return;
            }

            if (!isEdit && !cvFile) {
                setError('⚠️ Debes adjuntar el CV en PDF.');
                setLoading(false);
                return;
            }

            if (!isEdit && !data.password) {
                setError('⚠️ Debes asignar una contraseña para el nuevo guía.');
                setLoading(false);
                return;
            }

            if (idiomasSeleccionados.length === 0) {
                setError('⚠️ Debes seleccionar al menos un idioma.');
                setLoading(false);
                return;
            }

            if (especialidadesSeleccionadas.length === 0) {
                setError('⚠️ Debes seleccionar al menos una especialidad.');
                setLoading(false);
                return;
            }

            const formDataToSend = new FormData();
            // User basic info
            formDataToSend.append('primer_nombre', data.primer_nombre);
            formDataToSend.append('segundo_nombre', data.segundo_nombre || '');
            formDataToSend.append('apellido_paterno', data.apellido_paterno);
            formDataToSend.append('apellido_materno', data.apellido_materno || '');
            formDataToSend.append('cedula', data.cedula);
            formDataToSend.append('correo', data.correo);
            formDataToSend.append('codigo_pais', data.codigo_pais);
            formDataToSend.append('numero_celular', data.numero_celular);
            if (data.password) {
                formDataToSend.append('password', data.password);
            }

            // Guide specific info (will be processed by GuiaController)
            formDataToSend.append('idiomas', JSON.stringify(idiomasSeleccionados));
            formDataToSend.append('experiencia', data.experiencia);
            formDataToSend.append('especialidades', JSON.stringify(especialidadesSeleccionadas));
            formDataToSend.append('bio', data.bio || '');
            formDataToSend.append('disponibilidad', data.disponibilidad);

            // Files
            if (fotoPerfil) formDataToSend.append('foto', fotoPerfil);
            if (cvFile) formDataToSend.append('cv', cvFile);

            // Usar la instancia centralizada (incluye Authorization y maneja FormData correctamente)
            if (isEdit) {
                await api.put(`/guias/${id}`, formDataToSend);
            } else {
                await api.post('/guias', formDataToSend);
            }

            setSuccess(true);
            reset();
            setFotoPerfil(null);
            setFotoPreview('');
            setCvFile(null);
            setCvFileName('');
            setIdiomasSeleccionados([]);
            setEspecialidadesSeleccionadas([]);

            setTimeout(() => {
                navigate('/admin/crear-guia'); // Redirigir a gestión de guías
            }, 2000);

        } catch (err) {
            setError('❌ Error al crear el guía: ' + (err.response?.data?.message || err.message));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div className="crear-guia-container">
            {/* HEADER */}
            <div className="crear-guia-header">
                <Link to="/admin/crear-guia" className="btn-volver">
                    <FaArrowLeft /> Volver
                </Link>
                <h1 className="crear-guia-title">
                    <span className="emoji">🧑‍🏫</span> {isEdit ? 'Editar Guía' : 'Registrar Nuevo Guía'}
                </h1>
                <p className="crear-guia-subtitle">
                    {isEdit ? 'Actualiza los datos del guía seleccionado' : 'Completa los datos para incorporar un nuevo guía al equipo'}
                </p>
            </div>

            {fetching && (
                <div className="alert alert-info">
                    ⏳ Cargando datos del guía...
                </div>
            )}

            {/* ALERTS */}
            {success && (
                <div className="alert alert-success">
                    <FaCheckCircle /> ¡Guía registrado exitosamente!
                </div>
            )}
            {error && (
                <div className="alert alert-error">
                    <FaExclamationCircle /> {error}
                </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit(onSubmit)} className="crear-guia-form">

                {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
                <div className="form-section">
                    <h2 className="section-title">👤 Información Personal</h2>

                    <div className="form-row-3">
                        <div className="form-group">
                            <label>Primer Nombre *</label>
                            <input
                                type="text"
                                {...register('primer_nombre', { required: 'Primer nombre requerido' })}
                                placeholder="ej: Carlos"
                                className={errors.primer_nombre ? 'error' : ''}
                            />
                            {errors.primer_nombre && <span className="error-msg">{errors.primer_nombre.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>Segundo Nombre</label>
                            <input
                                type="text"
                                {...register('segundo_nombre')}
                                placeholder="ej: Andrés"
                            />
                        </div>
                        <div className="form-group">
                            <label>Apellido Paterno *</label>
                            <input
                                type="text"
                                {...register('apellido_paterno', { required: 'Apellido paterno requerido' })}
                                placeholder="ej: García"
                                className={errors.apellido_paterno ? 'error' : ''}
                            />
                            {errors.apellido_paterno && <span className="error-msg">{errors.apellido_paterno.message}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Apellido Materno</label>
                            <input
                                type="text"
                                {...register('apellido_materno')}
                                placeholder="ej: López"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <FaEnvelope /> Correo Electrónico *
                            </label>
                            <input
                                type="email"
                                {...register('correo', { required: 'Email requerido' })}
                                placeholder="guia@ejemplo.com"
                                className={errors.correo ? 'error' : ''}
                            />
                            {errors.correo && <span className="error-msg">{errors.correo.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>Contraseña {isEdit ? '(Opcional para cambiar)' : '*'}</label>
                            <input
                                type="password"
                                {...register('password', {
                                    required: !isEdit ? 'Contraseña requerida' : false,
                                    minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                                })}
                                placeholder={isEdit ? '••••••••' : 'Asigna una contraseña'}
                                className={errors.password ? 'error' : ''}
                            />
                            {errors.password && <span className="error-msg">{errors.password.message}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Cédula de Identidad *</label>
                            <input
                                type="text"
                                {...register('cedula', { required: 'Cédula requerida' })}
                                placeholder="ej: 1723456789"
                                className={errors.cedula ? 'error' : ''}
                            />
                            {errors.codigo_pais && <span className="error-msg">{errors.codigo_pais.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaPhone /> Número Celular *
                            </label>
                            <input
                                type="tel"
                                {...register('numero_celular', { required: 'Celular requerido' })}
                                placeholder="987654321"
                                className={errors.numero_celular ? 'error' : ''}
                            />
                            {errors.numero_celular && <span className="error-msg">{errors.numero_celular.message}</span>}
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 2: EXPERIENCIA Y ESPECIALIDADES */}
                <div className="form-section">
                    <h2 className="section-title">💼 Experiencia y Especialidades</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaBriefcase /> Años de Experiencia *
                            </label>
                            <input
                                type="number"
                                {...register('experiencia', {
                                    required: 'Requerido',
                                    min: { value: 0, message: 'Mínimo 0 años' }
                                })}
                                placeholder="ej: 5"
                                className={errors.experiencia ? 'error' : ''}
                            />
                            {errors.experiencia && <span className="error-msg">{errors.experiencia.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>Disponibilidad *</label>
                            <select
                                {...register('disponibilidad', { required: 'Requerido' })}
                                className={errors.disponibilidad ? 'error' : ''}
                            >
                                <option value="tiempo-completo">⏰ Tiempo Completo</option>
                                <option value="medio-tiempo">⏳ Medio Tiempo</option>
                                <option value="flexible">🔄 Flexible</option>
                            </select>
                            {errors.disponibilidad && <span className="error-msg">{errors.disponibilidad.message}</span>}
                        </div>
                    </div>

                    <div className="form-row-full">
                        <div className="form-group-full">
                            <label className="label-especialidades">Especialidades * (Selecciona al menos una)</label>
                            <div className="especialidades-grid">
                                {especialidades_disponibles.map((especialidad) => (
                                    <label key={especialidad} className="checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={especialidadesSeleccionadas.includes(especialidad)}
                                            onChange={() => toggleEspecialidad(especialidad)}
                                            className="checkbox-input"
                                        />
                                        <span className="checkbox-label">{especialidad}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Biografía / Quién Eres</label>
                            <textarea
                                {...register('bio')}
                                placeholder="Cuéntanos sobre ti, tu pasión por el turismo, logros especiales..."
                                rows="3"
                            />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 3: IDIOMAS */}
                <div className="form-section">
                    <h2 className="section-title">
                        <FaGlobe /> Idiomas *
                    </h2>

                    <div className="form-row-full">
                        <div className="form-group-full">
                            <label className="label-especiales">Selecciona los idiomas que hablas</label>
                            <div className="idiomas-grid">
                                {idiomas_disponibles.map((idioma) => (
                                    <label key={idioma} className="checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={idiomasSeleccionados.includes(idioma)}
                                            onChange={() => toggleIdioma(idioma)}
                                            className="checkbox-input"
                                        />
                                        <span className="checkbox-label">{idioma}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN 4: FOTO DE PERFIL Y CV (LADO A LADO) */}
                <div className="form-section">
                    <h2 className="section-title">📸 Documentos *</h2>

                    <div className="documents-row">
                        {/* FOTO DE PERFIL */}
                        <div className="document-column">
                            <div className="document-label">Foto de Perfil</div>
                            <div className="foto-upload-section">
                                {!fotoPreview ? (
                                    <label className="foto-upload-label">
                                        <FaImage className="upload-icon-small" />
                                        <span className="upload-text-small">Seleccionar Foto</span>
                                        <span className="upload-subtitle-small">JPG, PNG - 5MB</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFotoChange}
                                            className="foto-input"
                                        />
                                    </label>
                                ) : (
                                    <div className="foto-preview-container-small">
                                        <img src={fotoPreview} alt="Foto de perfil" className="foto-preview-small" />
                                        <div className="foto-buttons">
                                            <button
                                                type="button"
                                                className="btn-change-foto-small"
                                                onClick={() => document.querySelector('.foto-input-change').click()}
                                            >
                                                Cambiar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-remove-foto-small"
                                                onClick={handleRemoveFoto}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFotoChange}
                                            className="foto-input-change"
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CV */}
                        <div className="document-column">
                            <div className="document-label">Hoja de Vida</div>
                            <div className="cv-upload-section-compact">
                                <label className="cv-upload-label-compact">
                                    <FaCloudUploadAlt className="upload-icon-small" />
                                    <span className="upload-text-small">Cargar CV</span>
                                    <span className="upload-subtitle-small">PDF - 10MB</span>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleCvChange}
                                        className="cv-input"
                                    />
                                </label>

                                {cvFileName && (
                                    <div className="cv-file-info-compact">
                                        <FaFileAlt className="cv-icon-small" />
                                        <p className="cv-name-small">{cvFileName.substring(0, 20)}...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="form-actions">
                    <Link to="/admin/crear-guia" className="btn btn-secondary">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        <FaSave /> {loading ? 'Guardando...' : 'Registrar Guía'}
                    </button>
                </div>
            </form>
        </div>
    );

    return <AdminLayout title="Registrar Guía">{content}</AdminLayout>;
};

export default CrearGuia;
