import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Asegúrate de tener instalado axios
import {
    FaUser, FaPhone, FaEnvelope, FaIdCard, FaCamera,
    FaSave, FaArrowLeft, FaLock, FaKey, FaEye, FaEyeSlash,
    FaUserCircle, FaEdit
} from 'react-icons/fa';
import './PerfilTurista.css';

const API_URL = 'http://localhost:4000';

const PerfilTurista = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(null);
    const [fotoFile, setFotoFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        primer_nombre: '',
        segundo_nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        cedula: '',
        correo: '',
        codigo_pais: '+593',
        numero_celular: '',
        descripcion_perfil: '',
        foto_url: '',
        portada_url: ''
    });

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const cargarDatosUsuario = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const response = await axios.get(`${API_URL}/api/usuarios/perfil`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
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

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
            alert("Las nuevas contraseñas no coinciden");
            return;
        }
        const token = localStorage.getItem('token');
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => dataToSend.append(key, formData[key] || ''));
        if (passwords.newPassword) dataToSend.append('password', passwords.newPassword);
        if (fotoFile) dataToSend.append('foto', fotoFile);
        if (coverFile) dataToSend.append('portada', coverFile);

        try {
            setLoading(true);
            await axios.put(`${API_URL}/api/usuarios/perfil`, dataToSend, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert("¡Perfil actualizado con éxito!");
            setPasswords({ newPassword: '', confirmPassword: '' });
            setFotoFile(null);
            setCoverFile(null);
        } catch (error) {
            console.error(error);
            alert("Error al actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loader-container"><div className="loader"></div><p>Cargando tu información...</p></div>;

    return (
        <div className="perfil-premium-container">
            {/* HERO / HEADER SECTION */}
            <div className="perfil-hero">
                <img
                    src={coverPreview || (formData.portada_url ? `${API_URL}${formData.portada_url}` : 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=80')}
                    alt="Portada"
                    className="hero-cover-img"
                />
                <div className="hero-overlay" />

                <label htmlFor="cover-upload" className="btn-edit-cover">
                    <FaCamera /> Cambiar Portada
                    <input id="cover-upload" type="file" hidden onChange={handleCoverChange} />
                </label>

                <button className="btn-back-floating" onClick={() => navigate('/home')}>
                    <FaArrowLeft /> Volver al Inicio
                </button>
                <div className="hero-content">
                    <div className="avatar-preview-section">
                        <div className="avatar-circle">
                            <img
                                src={preview || (formData.foto_url ? `${API_URL}${formData.foto_url}` : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png')}
                                alt="Usuario"
                            />
                            <label htmlFor="foto-upload" className="edit-badge">
                                <FaCamera />
                                <input id="foto-upload" type="file" hidden onChange={handleFileChange} />
                            </label>
                        </div>
                        <div className="user-intro">
                            <h1>{formData.primer_nombre} {formData.apellido_paterno}</h1>
                            <p><FaEnvelope /> {formData.correo}</p>
                            <span className="role-tag">Turista Explorer</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="perfil-form-wrapper">
                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-sections-grid">

                        {/* SECTION 1: PERSONAL INFO */}
                        <div className="form-section-card">
                            <div className="section-title-wrap">
                                <FaUserCircle className="section-icon" />
                                <h3>Información Personal</h3>
                            </div>
                            <div className="fields-grid">
                                <div className="field-group">
                                    <label>Primer Nombre *</label>
                                    <div className="input-with-icon">
                                        <FaIdCard />
                                        <input type="text" name="primer_nombre" value={formData.primer_nombre} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>Segundo Nombre</label>
                                    <div className="input-with-icon">
                                        <FaIdCard />
                                        <input type="text" name="segundo_nombre" value={formData.segundo_nombre || ''} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>Apellido Paterno *</label>
                                    <div className="input-with-icon">
                                        <FaIdCard />
                                        <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>Apellido Materno</label>
                                    <div className="input-with-icon">
                                        <FaIdCard />
                                        <input type="text" name="apellido_materno" value={formData.apellido_materno || ''} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>Cédula de Identidad *</label>
                                    <div className="input-with-icon">
                                        <FaIdCard />
                                        <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>Número Celular *</label>
                                    <div className="input-with-icon phone-input-group">
                                        <input type="text" name="codigo_pais" value={formData.codigo_pais} onChange={handleChange} className="country-code" placeholder="+593" required />
                                        <input type="tel" name="numero_celular" value={formData.numero_celular} onChange={handleChange} className="phone-number" placeholder="987654321" required />
                                    </div>
                                </div>
                                <div className="field-group col-span-2">
                                    <label>Correo Electrónico</label>
                                    <div className="input-with-icon disabled-field">
                                        <FaEnvelope />
                                        <input type="email" value={formData.correo} disabled />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: SECURITY */}
                        <div className="form-section-card">
                            <div className="section-title-wrap">
                                <FaLock className="section-icon" />
                                <h3>Seguridad y Acceso</h3>
                            </div>
                            <div className="fields-grid">
                                <div className="field-group">
                                    <label>Nueva Contraseña</label>
                                    <div className="password-wrapper">
                                        <FaKey className="pass-icon" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            placeholder="Dejar vacío si no deseas cambiar"
                                            value={passwords.newPassword} onChange={handlePasswordChange}
                                        />
                                        <button type="button" className="eye-btn" onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>Confirmar Contraseña</label>
                                    <div className="password-wrapper">
                                        <FaKey className="pass-icon" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwords.confirmPassword} onChange={handlePasswordChange}
                                        />
                                        <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="security-note">Usa al menos 8 caracteres con letras y números para mayor seguridad.</p>
                        </div>

                        {/* SECTION 3: BIO */}
                        <div className="form-section-card col-span-2">
                            <div className="section-title-wrap">
                                <FaEdit className="section-icon" />
                                <h3>Acerca de mí</h3>
                            </div>
                            <div className="field-group">
                                <label>Descripción del Perfil</label>
                                <textarea
                                    name="descripcion_perfil"
                                    rows="4"
                                    placeholder="Cuéntanos un poco sobre tus gustos al viajar..."
                                    value={formData.descripcion_perfil || ''}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel-profile" onClick={() => navigate('/home')}>
                            Descartar cambios
                        </button>
                        <button type="submit" className="btn-save-premium" disabled={loading}>
                            {loading ? 'Guardando...' : <><FaSave /> Actualizar Mi Perfil</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PerfilTurista;