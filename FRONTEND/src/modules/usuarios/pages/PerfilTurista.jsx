import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaUser, FaPhone, FaEnvelope, FaIdCard, FaCamera, 
    FaSave, FaArrowLeft, FaLock, FaKey, FaEye, FaEyeSlash,
    FaMapMarkedAlt, FaPlane, FaStar, FaTrophy, FaHiking,
    FaUmbrellaBeach, FaCamera as FaCameraAlt, FaUtensils,
    FaHeart, FaMountain, FaWater, FaCity, FaGlobeAmericas,
    FaMedal, FaAward, FaCrown, FaFire, FaCheckCircle, FaClock
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
        foto_url: '',
        pais: '',
        ciudad: '',
        idiomas: '',
        nivel_experiencia: 'principiante'
    });

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // Preferencias de viaje (simuladas, puedes guardarlas en el backend)
    const [travelPreferences, setTravelPreferences] = useState({
        aventura: false,
        playa: false,
        fotografia: false,
        gastronomia: false,
        cultura: false,
        naturaleza: false,
        mar: false,
        ciudad: false
    });

    // Estadísticas del usuario (desde backend)
    const [userStats, setUserStats] = useState({
        viajes_completados: 0,
        paises_visitados: 0,
        reseñas: 0,
        insignias: 0
    });

    // Insignias cargadas desde la API
    const [badges, setBadges] = useState([]);

    // Historial de viajes (se cargará desde el backend; inicial vacío)
    const [tripHistory, setTripHistory] = useState([]);

    // CARGAR DATOS REALES DEL BACKEND
    useEffect(() => {
        const cargarDatosUsuario = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${API_URL}/api/usuarios/perfil`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Esperamos { user: {...}, reservas: [...] }
                const payload = response.data || {};
                const user = payload.user || payload; // compatibilidad

                // Rellenar formData con datos de usuario
                setFormData(prev => ({ ...prev, ...user }));

                // Preferencias (pueden ser JSON)
                if (user.preferencias) {
                    setTravelPreferences(typeof user.preferencias === 'string' ? JSON.parse(user.preferencias) : user.preferencias);
                }

                // Estadísticas
                setUserStats({
                    viajes_completados: user.viajes_completados || 0,
                    paises_visitados: user.paises_visitados || 0,
                    reseñas: user.resenas || 0,
                    insignias: user.insignias || 0
                });

                // Historial de viajes desde reservas (si no hay, queda vacío)
                if (payload.reservas && Array.isArray(payload.reservas) && payload.reservas.length > 0) {
                    const mapped = payload.reservas.map(r => ({
                        id: r.id_reserva,
                        destination: r.tour_nombre || r.nombre || r.ciudad_destino || 'Destino',
                        date: r.fecha_actividad ? new Date(r.fecha_actividad).toLocaleDateString() : '',
                        image: r.imagen_portada ? `${API_URL}${r.imagen_portada}` : 'https://via.placeholder.com/150',
                        status: (r.estado_reserva && r.estado_reserva.toLowerCase().includes('complet')) ? 'completed' : 'upcoming'
                    }));
                    setTripHistory(mapped);
                } else {
                    setTripHistory([]);
                }

                // Insignias desde payload (si existen)
                if (payload.badges && Array.isArray(payload.badges)) {
                    setBadges(payload.badges);
                } else {
                    setBadges([]);
                }
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

    const togglePreference = (key) => {
        setTravelPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // ENVIAR CAMBIOS AL BACKEND
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
            alert("Las nuevas contraseñas no coinciden");
            return;
        }

        const token = localStorage.getItem('token');
        const dataToSend = new FormData();
        
        Object.keys(formData).forEach(key => {
            dataToSend.append(key, formData[key] || '');
        });
        
        if (passwords.newPassword) {
            dataToSend.append('password', passwords.newPassword);
        }
        
        if (fotoFile) {
            dataToSend.append('foto', fotoFile); 
        }

        // Agregar preferencias como JSON
        dataToSend.append('preferencias', JSON.stringify(travelPreferences));

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
            setFotoFile(null);
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
                    <h2>Mi Perfil de Viajero</h2>
                </header>

                <form onSubmit={handleSubmit} className="perfil-form">
                    {/* ============================================
                        SECCIÓN: FOTO Y ESTADÍSTICAS
                        ============================================ */}
                    <div className="foto-stats-section">
                        <div className="avatar-wrapper">
                            <img 
                                src={preview || (formData.foto_url ? `${API_URL}${formData.foto_url}` : 'https://via.placeholder.com/150')} 
                                alt="Avatar" 
                                className="profile-avatar"
                            />
                            <label htmlFor="foto-upload" className="btn-upload-photo">
                                <FaCamera />
                                <input 
                                    type="file" 
                                    id="foto-upload" 
                                    hidden 
                                    accept="image/*"
                                    onChange={handleFileChange} 
                                />
                            </label>
                        </div>
                        <span className="user-role-badge">
                            <FaUser /> Turista Explorador
                        </span>

                        {/* Estadísticas del usuario */}
                        <div className="user-stats">
                            <div className="stat-item">
                                <span className="stat-number">{userStats.viajes_completados}</span>
                                <span className="stat-label">Viajes</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{userStats.paises_visitados}</span>
                                <span className="stat-label">Países</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{userStats.reseñas}</span>
                                <span className="stat-label">Reseñas</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{userStats.insignias}</span>
                                <span className="stat-label">Insignias</span>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                        SECCIÓN: INFORMACIÓN PERSONAL
                        ============================================ */}
                    <h3 className="section-subtitle">
                        <FaUser /> Información Personal
                    </h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label><FaIdCard /> Primer Nombre</label>
                            <input 
                                type="text" 
                                name="primer_nombre" 
                                value={formData.primer_nombre} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaIdCard /> Segundo Nombre</label>
                            <input 
                                type="text" 
                                name="segundo_nombre" 
                                value={formData.segundo_nombre || ''} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaIdCard /> Apellido Paterno</label>
                            <input 
                                type="text" 
                                name="apellido_paterno" 
                                value={formData.apellido_paterno} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaIdCard /> Apellido Materno</label>
                            <input 
                                type="text" 
                                name="apellido_materno" 
                                value={formData.apellido_materno || ''} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaPhone /> Teléfono</label>
                            <input 
                                type="text" 
                                name="telefono" 
                                value={formData.telefono} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaEnvelope /> Correo Electrónico</label>
                            <input 
                                type="email" 
                                name="correo" 
                                value={formData.correo} 
                                disabled 
                                className="disabled-input" 
                            />
                        </div>
                    </div>

                    {/* ============================================
                        SECCIÓN: UBICACIÓN Y EXPERIENCIA
                        ============================================ */}
                    <h3 className="section-subtitle">
                        <FaMapMarkedAlt /> Ubicación y Experiencia
                    </h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label><FaGlobeAmericas /> País</label>
                            <input 
                                type="text" 
                                name="pais" 
                                value={formData.pais || ''} 
                                onChange={handleChange}
                                placeholder="Ecuador" 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaCity /> Ciudad</label>
                            <input 
                                type="text" 
                                name="ciudad" 
                                value={formData.ciudad || ''} 
                                onChange={handleChange}
                                placeholder="Quito" 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaUser /> Idiomas</label>
                            <input 
                                type="text" 
                                name="idiomas" 
                                value={formData.idiomas || ''} 
                                onChange={handleChange}
                                placeholder="Español, Inglés" 
                            />
                        </div>
                        <div className="form-group">
                            <label><FaStar /> Nivel de Experiencia</label>
                            <select 
                                name="nivel_experiencia" 
                                value={formData.nivel_experiencia || 'principiante'} 
                                onChange={handleChange}
                            >
                                <option value="principiante">Principiante</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                                <option value="experto">Experto</option>
                            </select>
                        </div>
                    </div>

                    {/* ============================================
                        SECCIÓN: PREFERENCIAS DE VIAJE
                        ============================================ */}
                    <h3 className="section-subtitle">
                        <FaHeart /> Preferencias de Viaje
                    </h3>
                    <div className="preferences-grid">
                        <div 
                            className={`preference-card ${travelPreferences.aventura ? 'active' : ''}`}
                            onClick={() => togglePreference('aventura')}
                        >
                            <span className="preference-icon"><FaHiking /></span>
                            <span className="preference-label">Aventura</span>
                        </div>
                        <div 
                            className={`preference-card ${travelPreferences.playa ? 'active' : ''}`}
                            onClick={() => togglePreference('playa')}
                        >
                            <span className="preference-icon"><FaUmbrellaBeach /></span>
                            <span className="preference-label">Playa</span>
                        </div>
                        <div 
                            className={`preference-card ${travelPreferences.fotografia ? 'active' : ''}`}
                            onClick={() => togglePreference('fotografia')}
                        >
                            <span className="preference-icon"><FaCameraAlt /></span>
                            <span className="preference-label">Fotografía</span>
                        </div>
                        <div 
                            className={`preference-card ${travelPreferences.gastronomia ? 'active' : ''}`}
                            onClick={() => togglePreference('gastronomia')}
                        >
                            <span className="preference-icon"><FaUtensils /></span>
                            <span className="preference-label">Gastronomía</span>
                        </div>
                        <div 
                            className={`preference-card ${travelPreferences.naturaleza ? 'active' : ''}`}
                            onClick={() => togglePreference('naturaleza')}
                        >
                            <span className="preference-icon"><FaMountain /></span>
                            <span className="preference-label">Naturaleza</span>
                        </div>
                        <div 
                            className={`preference-card ${travelPreferences.mar ? 'active' : ''}`}
                            onClick={() => togglePreference('mar')}
                        >
                            <span className="preference-icon"><FaWater /></span>
                            <span className="preference-label">Buceo</span>
                        </div>
                        <div 
                            className={`preference-card ${travelPreferences.ciudad ? 'active' : ''}`}
                            onClick={() => togglePreference('ciudad')}
                        >
                            <span className="preference-icon"><FaCity /></span>
                            <span className="preference-label">Ciudades</span>
                        </div>
                        <div 
                            className={`preference-card ${travelPreferences.cultura ? 'active' : ''}`}
                            onClick={() => togglePreference('cultura')}
                        >
                            <span className="preference-icon"><FaGlobeAmericas /></span>
                            <span className="preference-label">Cultura</span>
                        </div>
                    </div>

                    {/* ============================================
                        SECCIÓN: INSIGNIAS Y LOGROS
                        ============================================ */}
                    <h3 className="section-subtitle">
                        <FaTrophy /> Mis Insignias y Logros
                    </h3>
                    <div className="badges-container">
                        {badges.length === 0 && (
                            <p className="no-badges">Aún no tienes insignias. Se otorgarán cuando participes y completes tours.</p>
                        )}
                        {badges.map(badge => (
                            <div 
                                key={badge.id || badge.id_insignia} 
                                className={`badge-item`}
                                title={badge.nombre}
                            >
                                <span className="badge-icon">
                                    {/* Si el icono viene como URL, mostrar imagen; si no, un icono por defecto */}
                                    {badge.icono_url ? <img src={`${API_URL}${badge.icono_url}`} alt={badge.nombre} /> : <FaAward />}
                                </span>
                                <span className="badge-name">{badge.nombre}</span>
                            </div>
                        ))}
                    </div>

                    {/* ============================================
                        SECCIÓN: HISTORIAL DE VIAJES
                        ============================================ */}
                    {tripHistory.length > 0 && (
                        <>
                            <h3 className="section-subtitle">
                                <FaPlane /> Historial de Viajes
                            </h3>
                            <div className="trips-list">
                                {tripHistory.map(trip => (
                                    <div key={trip.id} className="trip-card">
                                        <img src={trip.image} alt={trip.destination} className="trip-image" />
                                        <div className="trip-info">
                                            <h4 className="trip-destination">{trip.destination}</h4>
                                            <p className="trip-date">{trip.date}</p>
                                            <span className={`trip-status ${trip.status}`}>
                                                {trip.status === 'completed' ? (
                                                    <><FaCheckCircle /> Completado</>
                                                ) : (
                                                    <><FaClock /> Próximamente</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ============================================
                        SECCIÓN: SEGURIDAD
                        ============================================ */}
                    <h3 className="section-subtitle">
                        <FaLock /> Seguridad
                    </h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label><FaKey /> Nueva Contraseña</label>
                            <div className="password-input-container">
                                <input 
                                    type={showNewPassword ? "text" : "password"} 
                                    name="newPassword" 
                                    placeholder="Dejar en blanco para no cambiar"
                                    value={passwords.newPassword} 
                                    onChange={handlePasswordChange} 
                                />
                                <button 
                                    type="button" 
                                    className="btn-toggle-password" 
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
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
                                    value={passwords.confirmPassword} 
                                    onChange={handlePasswordChange} 
                                />
                                <button 
                                    type="button" 
                                    className="btn-toggle-password" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                        DESCRIPCIÓN DEL PERFIL
                        ============================================ */}
                    <div className="form-group full-width">
                        <label><FaUser /> Sobre mí</label>
                        <textarea 
                            name="descripcion_perfil" 
                            rows="4" 
                            value={formData.descripcion_perfil || ''} 
                            onChange={handleChange}
                            placeholder="Cuéntanos sobre ti, tus pasiones viajeras y qué te motiva a explorar..."
                        ></textarea>
                    </div>

                    {/* ============================================
                        BOTÓN GUARDAR
                        ============================================ */}
                    <button type="submit" className="btn-save-profile">
                        <FaSave /> Guardar Todos los Cambios
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PerfilTurista;
