import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import { guiasMock } from '../../../core/mockData';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSave, FaSearch, FaCheck, FaMapMarkerAlt
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';
import GuiaNavbar from '../../../components/guia/GuiaNavbar';
import GuiaSidebar from '../../../components/guia/GuiaSidebar';
import api from '../../../core/api';

const API_URL = 'http://localhost:4000';
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const GuiaDisponibilidad = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [saved, setSaved] = useState(false);

    const [profile, setProfile] = useState(null);
    const [guideReservas, setGuideReservas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/guias/${user.id_usuario}/profile`);
                setProfile(res.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
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
        if (user.id_usuario) {
            fetchProfile();
            fetchReservas();
        }
    }, []);

    const currentGuide = {
        nombre: profile?.primer_nombre || user.primer_nombre || 'Guía',
        apellido: profile?.apellido_paterno || user.apellido_paterno || '',
        imagen: (profile?.foto_url || user.foto_url)
            ? ((profile?.foto_url || user.foto_url).startsWith('http') ? (profile?.foto_url || user.foto_url) : `${API_URL}${profile?.foto_url || user.foto_url}`) 
            : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
        especialidad: profile?.especialidades || user.descripcion_perfil || 'Especialista Ecoturismo',
        calificacion: parseFloat(profile?.calificacion) || 4.9,
        total_resenas: parseInt(profile?.total_resenas) || 0,
        toursGuiados: parseInt(profile?.tours) || 0,
        experiencia: profile?.experiencia_anios || 0,
        idiomas: Array.isArray(profile?.idiomas) ? profile.idiomas : ['Español'],
        disponible: profile?.disponibilidad?.trim().toLowerCase() === 'disponible',
    };

    const [diasActivos, setDiasActivos] = useState([]);
    const [horaInicio, setHoraInicio] = useState('08:00');
    const [horaFin, setHoraFin] = useState('18:00');
    const [disponible, setDisponible] = useState(true);

    useEffect(() => {
        if (profile) {
            setDisponible(profile.disponibilidad?.trim().toLowerCase() === 'disponible');
            setDiasActivos(Array.isArray(profile.dias_activos) ? profile.dias_activos : []);
            if (profile.hora_inicio) setHoraInicio(profile.hora_inicio.substring(0, 5));
            if (profile.hora_fin) setHoraFin(profile.hora_fin.substring(0, 5));
        }
    }, [profile]);

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const toggleDia = (dia) => {
        setDiasActivos(prev =>
            prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
        );
    };

    const handleSave = async () => {
        try {
            await api.put(`/guias/${user.id_usuario}`, {
                ...profile,
                disponibilidad: disponible ? 'Disponible' : 'No Disponible',
                dias_activos: diasActivos,
                hora_inicio: horaInicio,
                hora_fin: horaFin
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving availability:", error);
            alert("No se pudo guardar la disponibilidad");
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
                        <h1 className="guia-title">📅 Mi Disponibilidad</h1>
                        <p className="guia-subtitle">Configura tus días y horarios de trabajo</p>
                    </div>
                    {saved && (
                        <div style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '10px', padding: '10px 20px', fontWeight: '600' }}>
                            ✅ ¡Disponibilidad guardada!
                        </div>
                    )}
                </div>

                {/* Estado general */}
                <div className="perfil-form-section">
                    <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: '16px', fontWeight: '700' }}>
                        🟢 Estado de Disponibilidad
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: '600', color: '#374151', fontSize: '15px' }}>
                            Estás actualmente:
                        </span>
                        <button
                            onClick={() => setDisponible(!disponible)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '24px',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                background: disponible ? '#10b981' : '#ef4444',
                                color: '#fff',
                                transition: 'all 0.2s'
                            }}
                        >
                            {disponible ? '✓ Disponible' : '✗ No Disponible'}
                        </button>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                            Haz clic para cambiar tu estado
                        </span>
                    </div>
                </div>

                {/* Días de disponibilidad */}
                <div className="perfil-form-section">
                    <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: '16px', fontWeight: '700' }}>
                        📆 Días Disponibles
                    </h3>
                    <div className="dias-grid">
                        {DIAS.map(dia => (
                            <div
                                key={dia}
                                className={`dia-card ${diasActivos.includes(dia) ? 'activo' : ''}`}
                                onClick={() => toggleDia(dia)}
                            >
                                <span className="dia-nombre">{dia.substring(0, 3)}</span>
                                <div className="dia-check">
                                    {diasActivos.includes(dia) ? <FaCheck size={10} /> : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
                        Días seleccionados: {diasActivos.join(', ')}
                    </p>
                </div>

                {/* Horario */}
                <div className="perfil-form-section">
                    <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontSize: '16px', fontWeight: '700' }}>
                        🕐 Horario de Trabajo
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '400px' }}>
                        <div className="form-group-guia">
                            <label>Hora de Inicio</label>
                            <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
                        </div>
                        <div className="form-group-guia">
                            <label>Hora de Fin</label>
                            <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-save-guia" onClick={handleSave}>
                        <FaSave /> Guardar Disponibilidad
                    </button>
                </div>
            </main>
        </div>
    );
};

export default GuiaDisponibilidad;
