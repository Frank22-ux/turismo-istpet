import { useState, useEffect } from 'react';
import api from '../../../core/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import { guiasMock } from '../../../core/mockData';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSave, FaSearch,
    FaCheckCircle, FaClock
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';
import GuiaNavbar from '../../../components/guia/GuiaNavbar';
import GuiaSidebar from '../../../components/guia/GuiaSidebar';

const API_URL = 'http://localhost:4000';

const GuiaEditarPerfil = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [guideReservas, setGuideReservas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState({
        primer_nombre: '',
        apellido_paterno: '',
        segundo_nombre: '',
        apellido_materno: '',
        especialidades: '',
        numero_celular: '',
        correo: '',
        experiencia: 0,
        bio: '',
        idiomas: '',
        disponibilidad: 'Disponible'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/guias/${user.id_usuario}/profile`);
                setProfile(res.data);
                setForm({
                    primer_nombre: res.data.primer_nombre || '',
                    apellido_paterno: res.data.apellido_paterno || '',
                    segundo_nombre: res.data.segundo_nombre || '',
                    apellido_materno: res.data.apellido_materno || '',
                    especialidades: Array.isArray(res.data.especialidades) ? res.data.especialidades.join(', ') : (res.data.especialidades || ''),
                    numero_celular: res.data.numero_celular || '',
                    correo: res.data.correo || '',
                    experiencia: res.data.experiencia_anios || 0,
                    bio: res.data.bio || '',
                    idiomas: Array.isArray(res.data.idiomas) ? res.data.idiomas.join(', ') : (res.data.idiomas || ''),
                    disponibilidad: res.data.disponibilidad || 'Disponible'
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchReservas = async () => {
            try {
                const response = await api.get('/reservas/guia');
                const mapped = response.data.map(r => ({
                    id: r.id_reserva,
                    tour: r.tour_nombre,
                    turista: `${r.turista_nombre} ${r.turista_apellido}`,
                    fecha: new Date(r.fecha_actividad).toLocaleDateString()
                }));
                setGuideReservas(mapped);
            } catch (error) {
                console.error("Error fetching reservas for notifications:", error);
            }
        };
        fetchProfile();
        fetchReservas();
    }, [user.id_usuario]);

    const currentGuide = {
        nombre: profile?.primer_nombre || user.primer_nombre || 'Guía',
        apellido: profile?.apellido_paterno || user.apellido_paterno || '',
        imagen: (profile?.foto_url || user.foto_url)
            ? ((profile?.foto_url || user.foto_url).startsWith('http') ? (profile?.foto_url || user.foto_url) : `${API_URL}${profile?.foto_url || user.foto_url}`) 
            : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
        especialidad: profile?.especialidades || 'Guía General',
        calificacion: parseFloat(profile?.calificacion) || 0,
        resenas: profile?.total_resenas || 0
    };

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const cleanEspecialidades = typeof form.especialidades === 'string' 
                ? form.especialidades.split(',').map(s => s.trim()).filter(s => s !== '')
                : (Array.isArray(form.especialidades) ? form.especialidades : []);

            const cleanIdiomas = typeof form.idiomas === 'string'
                ? form.idiomas.split(',').map(s => s.trim()).filter(s => s !== '')
                : (Array.isArray(form.idiomas) ? form.idiomas : []);

            await api.put(`/guias/${user.id_usuario}`, {
                ...form,
                especialidades: cleanEspecialidades,
                idiomas: cleanIdiomas
            });
            setSaved(true);
            Swal.fire('¡Éxito!', 'Perfil actualizado correctamente', 'success');
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
        }
    };

    return (
        <div className="guia-layout">
            <GuiaNavbar 
                currentGuide={currentGuide} 
                onSearch={setSearchTerm}
                reservations={guideReservas}
            />
            <GuiaSidebar currentGuide={currentGuide} />

            <main className="guia-main-content">
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">✏️ Perfil Profesional</h1>
                        <p className="guia-subtitle">Gestiona tu información pública y profesional</p>
                    </div>
                    {saved && (
                        <div style={{
                            background: '#d1fae5',
                            color: '#065f46',
                            border: '1px solid #6ee7b7',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            ✅ ¡Perfil guardado exitosamente!
                        </div>
                    )}
                </div>

                <form onSubmit={handleSave} className="perfil-form-container">
                    <div className="perfil-card main-info-card">
                        {/* Avatar Section */}
                        <div className="avatar-upload-section">
                            <div className="avatar-wrapper">
                                <img src={currentGuide.imagen} alt="Avatar" className="avatar-preview" />
                                <button type="button" className="btn-change-avatar" title="Cambiar foto">
                                    <FaEdit />
                                </button>
                            </div>
                            <div className="avatar-text">
                                <h3>Información de Perfil</h3>
                                <p>Esta información será visible para los turistas que reserven tus tours. Asegúrate de que tu foto sea profesional.</p>
                                <div className="profile-badges-row">
                                    <span className="badge-item"><FaStar /> {currentGuide.calificacion.toFixed(1)} Rating</span>
                                    <span className="badge-item"><FaUsers /> {currentGuide.resenas} Reseñas</span>
                                </div>
                            </div>
                        </div>

                        <div className="perfil-grid-2col">
                            <div className="form-group-guia">
                                <label><FaEdit /> Primer Nombre</label>
                                <input type="text" name="primer_nombre" value={form.primer_nombre} onChange={handleChange} placeholder="Ej. Juan" />
                            </div>
                            <div className="form-group-guia">
                                <label><FaEdit /> Apellido Paterno</label>
                                <input type="text" name="apellido_paterno" value={form.apellido_paterno} onChange={handleChange} placeholder="Ej. Pérez" />
                            </div>
                            <div className="form-group-guia">
                                <label><FaBell /> Teléfono de Contacto</label>
                                <input type="text" name="numero_celular" value={form.numero_celular} onChange={handleChange} placeholder="+593..." />
                            </div>
                            <div className="form-group-guia">
                                <label><FaSignOutAlt /> Correo Electrónico</label>
                                <input type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="nombre@ejemplo.com" />
                            </div>
                        </div>
                    </div>

                    <div className="perfil-card-row">
                        <div className="perfil-card secondary-card flex-1">
                            <h3 className="card-title-guia">🎯 Especialización</h3>
                            <div className="form-group-guia">
                                <label>Áreas de Especialidad</label>
                                <input 
                                    type="text" 
                                    name="especialidades" 
                                    value={form.especialidades} 
                                    onChange={handleChange} 
                                    placeholder="Ej. Trekking, Historia, Alta Montaña" 
                                />
                                <small className="input-tip">Separa tus especialidades por comas</small>
                            </div>
                            <div className="form-group-guia">
                                <label>Idiomas</label>
                                <input 
                                    type="text" 
                                    name="idiomas" 
                                    value={form.idiomas} 
                                    onChange={handleChange} 
                                    placeholder="Ej. Español, Inglés, Francés" 
                                />
                                <small className="input-tip">Los idiomas que dominas para los tours</small>
                            </div>
                            <div className="form-group-guia">
                                <label>Años de Experiencia</label>
                                <div className="range-container">
                                    <input 
                                        type="number" 
                                        name="experiencia" 
                                        value={form.experiencia} 
                                        onChange={handleChange} 
                                        min="0" 
                                        className="number-input-modern"
                                    />
                                    <span className="unit-label">años</span>
                                </div>
                            </div>
                        </div>

                        <div className="perfil-card secondary-card flex-1">
                            <h3 className="card-title-guia">📅 Estado y Disponibilidad</h3>
                            <div className="form-group-guia">
                                <label>Tu estado actual</label>
                                <div className="availability-selector">
                                    <button 
                                        type="button" 
                                        className={`btn-select ${form.disponibilidad === 'Disponible' ? 'active available' : ''}`}
                                        onClick={() => setForm({...form, disponibilidad: 'Disponible'})}
                                    >
                                        <FaCheckCircle /> Disponible
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn-select ${form.disponibilidad === 'No Disponible' ? 'active unavailable' : ''}`}
                                        onClick={() => setForm({...form, disponibilidad: 'No Disponible'})}
                                    >
                                        <FaClock /> Ocupado
                                    </button>
                                </div>
                            </div>
                            <div className="form-group-guia full-width">
                                <label>Biografía Profesional</label>
                                <textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Cuéntales a los turistas sobre tu trayectoria, tus pasiones y por qué deberían elegirte como su guía..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-sticky">
                        <button type="button" className="btn-cancel-guia" onClick={() => navigate('/guia')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save-guia premium">
                            <FaSave /> Guardar Perfil Profesional
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default GuiaEditarPerfil;
