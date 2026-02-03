import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaSave, FaUserTie, FaHotel, FaEnvelope, FaLock, 
    FaGlobeAmericas, FaStar, FaUser, FaEye, FaEyeSlash, FaCamera, FaArrowLeft, FaPhone, FaIdCard 
} from 'react-icons/fa';
import './EditarGuia.css';

const API_URL = 'http://localhost:4000';

const EditarGuia = () => {
    const { id } = useParams(); 
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const token = localStorage.getItem('token'); 
    
    const [listaHoteles, setListaHoteles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                // 1. Cargar lista de Hoteles
                const resHoteles = await axios.get(`${API_URL}/api/hoteles`, config);
                setListaHoteles(resHoteles.data);

                // 2. Cargar datos del Guía
                const resGuia = await axios.get(`${API_URL}/api/usuarios/guia/${id}`, config);
                const guia = resGuia.data;

                // Rellenar todos los campos de nombre y apellidos
                setValue("primer_nombre", guia.primer_nombre);
                setValue("segundo_nombre", guia.segundo_nombre || "");
                setValue("apellido_paterno", guia.apellido_paterno);
                setValue("apellido_materno", guia.apellido_materno || "");
                
                // Contacto y Profesión
                setValue("correo", guia.correo);
                setValue("telefono", guia.telefono || "");
                setValue("especialidad", guia.especialidad);
                setValue("idiomas", guia.idiomas);
                setValue("nivel_experiencia", guia.nivel_experiencia);
                setValue("bio", guia.bio || "");
                setValue("id_hotel_asignado", guia.id_hotel_asignado || "");
                
                if (guia.foto_url) {
                    setPreviewImage(`${API_URL}${guia.foto_url}`);
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Error al cargar datos:", error);
                alert("No se pudieron cargar los datos del guía.");
                navigate('/admin/guias');
            }
        };
        cargarDatos();
    }, [id, setValue, navigate, token]);

    const handleImagePreview = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            
            if (data.foto && data.foto[0]) {
                formData.append('foto', data.foto[0]);
            }
            
            // Adjuntar los 4 campos de identidad
            formData.append('primer_nombre', data.primer_nombre);
            formData.append('segundo_nombre', data.segundo_nombre || '');
            formData.append('apellido_paterno', data.apellido_paterno);
            formData.append('apellido_materno', data.apellido_materno || '');
            
            formData.append('correo', data.correo);
            formData.append('telefono', data.telefono || '');
            if (data.password) formData.append('password', data.password);
            
            formData.append('idiomas', data.idiomas || '');
            formData.append('nivel_experiencia', data.nivel_experiencia);
            formData.append('especialidad', data.especialidad);
            formData.append('bio', data.bio || '');
            formData.append('id_hotel_asignado', data.id_hotel_asignado || '');

            await axios.put(`${API_URL}/api/usuarios/guia/${id}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            alert('¡Información actualizada correctamente!');
            navigate('/admin/guias');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al actualizar el guía.');
        }
    };

    if (loading) return <div className="loading">Cargando datos del guía...</div>;

    return (
        <div className="editar-guia-container">
            <div className="editar-guia-card">
                <div className="card-header">
                    <h2 className="card-title">Editar Perfil del Guía</h2>
                    <Link to="/admin/guias" className="close-btn">×</Link>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="photo-section">
                        <div className="photo-preview-container">
                            {previewImage ? (
                                <img src={previewImage} alt="Avatar" className="photo-preview-img" />
                            ) : (
                                <FaUser className="photo-placeholder-icon" />
                            )}
                            <label htmlFor="foto-upload" className="photo-upload-label">
                                <FaCamera />
                                <input 
                                    id="foto-upload"
                                    type="file" 
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    {...register("foto")}
                                    onChange={(e) => {
                                        register("foto").onChange(e);
                                        handleImagePreview(e);
                                    }}
                                />
                            </label>
                        </div>
                        <p className="photo-text">Cambiar foto de perfil</p>
                    </div>

                    <div className="form-section-title"><FaUser /> Datos de Identidad</div>
                    
                    {/* FILA 1: Nombres */}
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Primer Nombre *</label>
                            <input type="text" className="form-input" {...register("primer_nombre", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Segundo Nombre</label>
                            <input type="text" className="form-input" {...register("segundo_nombre")} />
                        </div>
                    </div>

                    {/* FILA 2: Apellidos */}
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Apellido Paterno *</label>
                            <input type="text" className="form-input" {...register("apellido_paterno", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Apellido Materno</label>
                            <input type="text" className="form-input" {...register("apellido_materno")} />
                        </div>
                    </div>

                    <div className="form-section-title"><FaEnvelope /> Contacto y Seguridad</div>
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Correo Electrónico</label>
                            <input type="email" className="form-input" {...register("correo", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Teléfono</label>
                            <input type="text" className="form-input" {...register("telefono")} placeholder="Ej: +51 987..." />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col full-width">
                            <label className="form-label">Nueva Contraseña (opcional)</label>
                            <div className="password-input-container">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-input password-field" 
                                    {...register("password")} 
                                    placeholder="Dejar en blanco para no cambiar"
                                />
                                <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="form-section-title"><FaUserTie /> Información Profesional</div>
                    
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaStar /> Especialidad</label>
                            <input type="text" className="form-input" {...register("especialidad", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label">Nivel de Experiencia</label>
                            <select className="form-input" {...register("nivel_experiencia")}>
                                <option value="principiante">Principiante</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="experto">Experto / Senior</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaGlobeAmericas /> Idiomas</label>
                            <input type="text" className="form-input" {...register("idiomas")} placeholder="Ej: Español, Inglés" />
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaHotel /> Hotel Sede Asignado</label>
                            <select className="form-input" {...register("id_hotel_asignado")}>
                                <option value="">-- Sin hotel asignado --</option>
                                {listaHoteles.map(h => (
                                    <option key={h.id_hotel} value={h.id_hotel}>{h.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col full-width">
                            <label className="form-label"><FaIdCard /> Biografía Profesional</label>
                            <textarea 
                                className="form-input text-area" 
                                {...register("bio")} 
                                placeholder="Escribe una breve descripción de la trayectoria del guía..."
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Link to="/admin/guias" className="btn-cancel">
                            <FaArrowLeft /> Volver
                        </Link>
                        <button type="submit" className="btn-update">
                            <FaSave /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarGuia;