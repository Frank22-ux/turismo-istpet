import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Asegúrate de tener instalado axios
import { 
    FaUser, FaPhone, FaEnvelope, FaIdCard, FaCamera, 
    FaSave, FaArrowLeft, FaLock, FaKey, FaEye, FaEyeSlash 
} from 'react-icons/fa';
import './PerfilTurista.css';

const API_URL = 'http://localhost:4000';

const PerfilTurista = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(null);
    const [fotoFile, setFotoFile] = useState(null); 
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        primer_nombre: '',
        segundo_nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        telefono: '',
        correo: '',
        descripcion_perfil: '',
        foto_url: ''
    });

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // 1. CARGAR DATOS REALES DEL BACKEND
    useEffect(() => {
        const cargarDatosUsuario = async () => {
            try {
                const token = localStorage.getItem('token'); // Recuperamos el token de sesión
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${API_URL}/api/usuarios/perfil`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Llenamos el formulario con los datos de PostgreSQL
                setFormData(response.data);
            } catch (error) {
                console.error("Error al cargar perfil:", error);
                alert("Sesión expirada o error al cargar datos");
            } finally {
                setLoading(false);
            }
        };
        cargarDatosUsuario();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoFile(file); 
            setPreview(URL.createObjectURL(file)); 
        }
    };

    // 2. ENVIAR CAMBIOS AL BACKEND
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
            alert("Las nuevas contraseñas no coinciden");
            return;
        }

        const token = localStorage.getItem('token');
        const dataToSend = new FormData();
        
        // Adjuntamos todos los campos de texto
        Object.keys(formData).forEach(key => {
            dataToSend.append(key, formData[key] || '');
        });
        
        // Adjuntamos la nueva contraseña si existe
        if (passwords.newPassword) {
            dataToSend.append('password', passwords.newPassword);
        }
        
        // Adjuntamos el archivo binario de la foto
        if (fotoFile) {
            dataToSend.append('foto', fotoFile); 
        }

        try {
            setLoading(true);
            await axios.put(`${API_URL}/api/usuarios/perfil`, dataToSend, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            alert("¡Perfil actualizado con éxito!");
            setPasswords({ newPassword: '', confirmPassword: '' });
            setFotoFile(null); // Limpiar archivo seleccionado
        } catch (error) {
            console.error(error);
            alert("Error al actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loader">Cargando tu información...</div>;

    return (
        <div className="perfil-container">
            <div className="perfil-card">
                <header className="perfil-header">
                    <button className="btn-back-perfil" onClick={() => navigate('/home')}>
                        <FaArrowLeft /> Volver
                    </button>
                    <h2>Configuración de Cuenta</h2>
                </header>

                <form onSubmit={handleSubmit} className="perfil-form">
                    {/* FOTO SECCIÓN */}
                    <div className="foto-section">
                        <div className="avatar-wrapper">
                            <img 
                                src={preview || (formData.foto_url ? `${API_URL}${formData.foto_url}` : 'https://via.placeholder.com/150')} 
                                alt="Avatar" 
                                className="profile-avatar"
                            />
                            <label htmlFor="foto-upload" className="btn-upload-photo">
                                <FaCamera />
                                <input 
                                    type="file" id="foto-upload" hidden accept="image/*"
                                    onChange={handleFileChange} 
                                />
                            </label>
                        </div>
                    </div>

                    <h3 className="section-subtitle">Información Personal</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label><FaIdCard /> Primer Nombre</label>
                            <input type="text" name="primer_nombre" value={formData.primer_nombre} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label><FaIdCard /> Apellido Paterno</label>
                            <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label><FaPhone /> Teléfono</label>
                            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label><FaEnvelope /> Correo Electrónico (Lectura)</label>
                            <input type="email" name="correo" value={formData.correo} disabled className="disabled-input" />
                        </div>
                    </div>

                    <h3 className="section-subtitle"><FaLock /> Seguridad</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label><FaKey /> Nueva Contraseña</label>
                            <div className="password-input-container">
                                <input 
                                    type={showNewPassword ? "text" : "password"} 
                                    name="newPassword" 
                                    placeholder="Dejar en blanco para no cambiar"
                                    value={passwords.newPassword} onChange={handlePasswordChange} 
                                />
                                <button type="button" className="btn-toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label><FaKey /> Confirmar Nueva Contraseña</label>
                            <div className="password-input-container">
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    name="confirmPassword" 
                                    value={passwords.confirmPassword} onChange={handlePasswordChange} 
                                />
                                <button type="button" className="btn-toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Descripción del Perfil</label>
                        <textarea name="descripcion_perfil" rows="3" value={formData.descripcion_perfil || ''} onChange={handleChange}></textarea>
                    </div>

                    <button type="submit" className="btn-save-profile">
                        <FaSave /> Guardar Todos los Cambios
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PerfilTurista;