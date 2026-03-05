import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import { guiasMock } from '../../../core/mockData';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSave, FaSearch
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';

const GuiaEditarPerfil = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [saved, setSaved] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const baseGuide = guiasMock[0] || {};
    const currentGuide = {
        ...baseGuide,
        nombre: user.primer_nombre || baseGuide.nombre || 'Guía',
        apellido: user.apellido_paterno || baseGuide.apellido || '',
        imagen: user.foto_url || baseGuide.imagen,
        email: user.correo || baseGuide.email,
    };

    const [form, setForm] = useState({
        nombre: currentGuide.nombre || '',
        apellido: currentGuide.apellido || '',
        especialidad: currentGuide.especialidad || '',
        telefono: currentGuide.telefono || '',
        email: currentGuide.email || '',
        experiencia: currentGuide.experiencia || '',
        descripcion: currentGuide.descripcion || 'Guía experto con amplia experiencia en turismo.',
        idiomas: (currentGuide.idiomas || []).join(', '),
    });

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="guia-layout">
            <nav className="navbar-guia">
                <div className="nav-container-guia">
                    <div className="nav-logo-guia">
                        <img src="/uploads/logo.png" alt="Logo" className="logo-img-guia" style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }} />
                        <span className="logo-text-guia">ECRUT Travels</span>
                    </div>
                    <div className="nav-search-guia">
                        <FaSearch />
                        <input type="text" placeholder="Buscar..." className="search-input-guia" />
                    </div>
                    <div className="nav-actions-guia">
                        <button className="nav-badge-guia"><FaBell /> 3</button>
                        <div className="user-menu-container-guia">
                            <button className="btn-user-menu-guia" onClick={() => setShowUserMenu(!showUserMenu)}>
                                <FaUserCircle /> {currentGuide.nombre}
                            </button>
                            {showUserMenu && (
                                <div className="dropdown-menu-guia">
                                    <button className="menu-item-guia" onClick={() => { setShowUserMenu(false); navigate('/guia/editar-perfil'); }}><FaEdit /> Editar Perfil</button>
                                    <button className="menu-item-guia" onClick={() => { setShowUserMenu(false); navigate('/guia/disponibilidad'); }}><FaCalendarAlt /> Mi Disponibilidad</button>
                                    <button className="menu-item-guia" onClick={() => { setShowUserMenu(false); navigate('/guia/mis-resenas'); }}><FaStar /> Mis Reseñas</button>
                                    <hr />
                                    <button onClick={handleLogout} className="menu-item-guia logout-guia"><FaSignOutAlt /> Cerrar Sesión</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="guia-sidebar">
                <div className="sidebar-profile-guia">
                    <div className="profile-avatar-guia">
                        <img src={currentGuide.imagen} alt={currentGuide.nombre} />
                    </div>
                    <h3 className="profile-name-guia">{currentGuide.nombre} {currentGuide.apellido}</h3>
                    <p className="profile-specialty-guia">{currentGuide.especialidad}</p>
                    <div className="profile-rating-guia"><FaStar /> {currentGuide.calificacion}</div>
                    <p className="profile-reviews-guia">({currentGuide.resenas} reseñas)</p>
                </div>
                <nav className="sidebar-nav-guia">
                    <button className="nav-item-guia" onClick={() => navigate('/guia')}><FaHome /> Dashboard</button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/mis-tours')}><FaCalendarAlt /> Mis Tours</button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/reservas')}><FaUsers /> Reservas</button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/ganancias')}><FaCoins /> Ganancias</button>
                    <button className="nav-item-guia" onClick={() => navigate('/guia/estadisticas')}><FaChartLine /> Estadísticas</button>
                </nav>
            </div>

            <main className="guia-main-content">
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">✏️ Editar Perfil</h1>
                        <p className="guia-subtitle">Actualiza tu información como guía profesional</p>
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

                <form onSubmit={handleSave}>
                    {/* Avatar */}
                    <div className="avatar-upload-section">
                        <img src={currentGuide.imagen} alt="Avatar" className="avatar-preview" />
                        <div>
                            <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Foto de perfil</p>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>Sube una imagen profesional</p>
                            <button type="button" className="btn-upload">📷 Cambiar foto</button>
                        </div>
                    </div>

                    {/* Datos personales */}
                    <div className="perfil-form-section">
                        <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: '16px', fontWeight: '700' }}>
                            👤 Datos Personales
                        </h3>
                        <div className="perfil-form-grid">
                            <div className="form-group-guia">
                                <label>Nombre</label>
                                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} />
                            </div>
                            <div className="form-group-guia">
                                <label>Apellido</label>
                                <input type="text" name="apellido" value={form.apellido} onChange={handleChange} />
                            </div>
                            <div className="form-group-guia">
                                <label>Teléfono</label>
                                <input type="text" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+593..." />
                            </div>
                            <div className="form-group-guia">
                                <label>Email</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Datos profesionales */}
                    <div className="perfil-form-section">
                        <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: '16px', fontWeight: '700' }}>
                            🎯 Información Profesional
                        </h3>
                        <div className="perfil-form-grid">
                            <div className="form-group-guia">
                                <label>Especialidad</label>
                                <input type="text" name="especialidad" value={form.especialidad} onChange={handleChange} />
                            </div>
                            <div className="form-group-guia">
                                <label>Años de Experiencia</label>
                                <input type="number" name="experiencia" value={form.experiencia} onChange={handleChange} min="0" />
                            </div>
                            <div className="form-group-guia">
                                <label>Idiomas (separados por coma)</label>
                                <input type="text" name="idiomas" value={form.idiomas} onChange={handleChange} placeholder="Español, Inglés, Francés" />
                            </div>
                            <div className="form-group-guia full-width">
                                <label>Descripción / Bio</label>
                                <textarea
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    rows={4}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn-save-guia">
                            <FaSave /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default GuiaEditarPerfil;
