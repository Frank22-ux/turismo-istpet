import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaSave, FaUserTie, FaHotel, FaEnvelope, FaLock, 
    FaGlobeAmericas, FaStar, FaUser, FaEye, FaEyeSlash, FaCamera, FaPhone, FaIdCard 
} from 'react-icons/fa';
import './CrearGuia.css';

const API_URL = 'http://localhost:4000';

const CrearGuia = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    
    const [listaHoteles, setListaHoteles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        const cargarHoteles = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const res = await axios.get(`${API_URL}/api/hoteles`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setListaHoteles(res.data);
            } catch (error) {
                console.error("Error al cargar hoteles:", error);
            }
        };
        cargarHoteles();
    }, []);

    const handleImagePreview = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            if (data.foto && data.foto[0]) {
                formData.append('foto', data.foto[0]);
            }
            
            formData.append('primer_nombre', data.primer_nombre);
            formData.append('segundo_nombre', data.segundo_nombre || '');
            formData.append('apellido_paterno', data.apellido_paterno);
            formData.append('apellido_materno', data.apellido_materno || '');
            formData.append('correo', data.correo);
            formData.append('password', data.password);
            formData.append('id_rol', 2);
            formData.append('idiomas', data.idiomas || '');
            formData.append('nivel_experiencia', data.nivel_experiencia);
            formData.append('especialidad', data.especialidad);
            formData.append('id_hotel_asignado', data.id_hotel_asignado || '');
            formData.append('telefono', data.telefono || '');
            formData.append('bio', data.bio || '');

            await axios.post(`${API_URL}/api/usuarios/registrar-guia`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            alert('¡Cuenta de Guía creada exitosamente!');
            navigate('/admin/guias');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error al crear el guía.');
        }
    };

    return (
        <div className="crear-guia-container">
            <div className="crear-guia-card">
                <div className="card-header">
                    <h2 className="card-title">Registrar Nuevo Personal de Guía</h2>
                    <Link to="/admin/guias" className="close-btn">×</Link>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    
                    <div className="photo-section">
                        <div className="photo-preview-container">
                            {previewImage ? (
                                <img src={previewImage} alt="Avatar Preview" className="photo-preview-img" />
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
                        <p className="photo-text">Subir foto de perfil</p>
                    </div>

                    <div className="form-section-title"><FaUser /> Información Personal</div>
                    
                    {/* FILA 1: NOMBRES */}
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

                    {/* FILA 2: APELLIDOS */}
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

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaEnvelope /> Correo Electrónico *</label>
                            <input type="email" className="form-input" {...register("correo", { required: true })} />
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaPhone /> Teléfono</label>
                            <input type="text" className="form-input" {...register("telefono")} placeholder="Ej: +51 987..." />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaLock /> Contraseña Temporal *</label>
                            <div className="password-input-container">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="form-input password-field" 
                                    {...register("password", { required: true })} 
                                />
                                <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="form-section-title"><FaUserTie /> Perfil Profesional</div>
                    
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label"><FaStar /> Especialidad *</label>
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
                            <input type="text" className="form-input" placeholder="Español, Inglés..." {...register("idiomas")} />
                        </div>
                        <div className="form-col">
                            <label className="form-label"><FaHotel /> Asignar Hotel Sede</label>
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
                            <label className="form-label"><FaIdCard /> Biografía / Sobre el Guía</label>
                            <textarea 
                                className="form-input text-area" 
                                {...register("bio")} 
                                placeholder="Describe brevemente la experiencia del guía..."
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Link to="/admin/guias" className="btn-cancel">Cancelar</Link>
                        <button type="submit" className="btn-save">
                            <FaSave /> Crear Cuenta de Guía
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearGuia;