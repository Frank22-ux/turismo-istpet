import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import { guiasMock, tourosMock, reservasMock } from '../../../core/mockData';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSearch, FaTrophy, FaMapMarkerAlt
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';
import GuiaNavbar from '../../../components/guia/GuiaNavbar';
import GuiaSidebar from '../../../components/guia/GuiaSidebar';
import api from '../../../core/api';

const API_URL = 'http://localhost:4000';
const GuiaEstadisticas = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ total_tours: 0, promedio_calificacion: 0, total_resenas: 0 });
    const [guideReservas, setGuideReservas] = useState([]);
    const [guideTours, setGuideTours] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/guias/${user.id_usuario}/profile`);
            setProfile(res.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
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

        const fetchData = async () => {
            setLoading(true);
            try {
                const [toursRes, reservasRes] = await Promise.all([
                    api.get('/tours/mis-tours'),
                    api.get('/reservas/guia')
                ]);
                setGuideTours(toursRes.data || []);
                const mappedReservas = (reservasRes.data || []).map(r => ({
                    id: r.id_reserva,
                    id_tour: r.id_tour,
                    personas: r.cantidad_personas,
                    estadoPago: r.estado_pago === 'COMPLETED' ? 'Pagado' : r.estado_reserva === 'Confirmada' ? 'Confirmada' : 'Pendiente',
                    turista: `${r.turista_nombre} ${r.turista_apellido}`,
                    tour: r.tour_nombre,
                    fecha: new Date(r.fecha_actividad).toLocaleDateString(),
                    total: parseFloat(r.total_pagado) || 0,
                    asignada_a_mi: r.asignada_a_mi
                }));
                setGuideReservas(mappedReservas);
            } catch (error) {
                console.error("Error fetching stats data:", error);
            } finally {
                setLoading(false);
            }
        };
        if (user.id_usuario) {
            fetchProfile();
            fetchReservas(); // Call fetchReservas here as well for the navbar notifications
            fetchData(); // Call fetchData for the main stats
        }
    }, [user.id_usuario]);

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const totalGanancias = guideReservas
        .filter(r => r.estadoPago === 'Pagado')
        .reduce((sum, r) => sum + (r.total * 0.2), 0);

    const tasaConversion = guideReservas.length > 0
        ? ((guideReservas.filter(r => r.estadoPago === 'Pagado').length / guideReservas.length) * 100).toFixed(0)
        : 0;

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
                        <h1 className="guia-title">📊 Estadísticas</h1>
                        <p className="guia-subtitle">Tu rendimiento como guía profesional</p>
                    </div>
                </div>

                {/* KPIs */}
                <section className="quick-stats-guia-section">
                    <div className="stat-card-guia primary">
                        <div className="stat-icon-guia"><FaTrophy /></div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{currentGuide.toursGuiados}</div>
                            <div className="stat-label-guia">Tours Completados</div>
                        </div>
                    </div>
                    <div className="stat-card-guia success">
                        <div className="stat-icon-guia">⭐</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{currentGuide.calificacion}</div>
                            <div className="stat-label-guia">Calificación Promedio</div>
                        </div>
                    </div>
                    <div className="stat-card-guia info">
                        <div className="stat-icon-guia">%</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{tasaConversion}%</div>
                            <div className="stat-label-guia">Tasa de Éxito</div>
                        </div>
                    </div>
                    <div className="stat-card-guia warning">
                        <div className="stat-icon-guia">💰</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">${totalGanancias.toFixed(0)}</div>
                            <div className="stat-label-guia">Ganancias Totales</div>
                        </div>
                    </div>
                </section>

                {/* Stats cards */}
                <section className="stats-section-guia">
                    <div className="section-header-guia">
                        <h2 className="section-title-guia">📈 Detalle de Rendimiento</h2>
                    </div>
                    <div className="stats-grid-guia">
                        <div className="stats-card-guia">
                            <div className="stats-card-header">
                                <h4>Años de Experiencia</h4>
                                <span className="badge-experience">{currentGuide.experiencia} años</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress" style={{ width: `${(currentGuide.experiencia / 30) * 100}%` }}></div>
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                {Math.round((currentGuide.experiencia / 30) * 100)}% hacia el máximo
                            </p>
                        </div>

                        <div className="stats-card-guia">
                            <h4>Idiomas</h4>
                            <div className="languages-list">
                                {currentGuide.idiomas.map((lang, idx) => (
                                    <span key={idx} className="lang-badge">{lang}</span>
                                ))}
                            </div>
                        </div>

                        <div className="stats-card-guia">
                            <h4>Popularidad de Tours</h4>
                            {guideTours.slice(0, 3).map((tour, idx) => (
                                <div key={tour.id_tour} style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                        <span>{tour.nombre?.substring(0, 25)}...</span>
                                        <span>${tour.precio}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress" style={{ width: `${(3 - idx) * 30}%`, background: idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#f59e0b' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="stats-card-guia">
                            <h4>Disponibilidad</h4>
                            <span className={`availability-badge ${currentGuide.disponible ? 'available' : 'unavailable'}`}>
                                {currentGuide.disponible ? '✓ Disponible' : '✗ No Disponible'}
                            </span>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>
                                Especialidad: <strong>{currentGuide.especialidad}</strong>
                            </p>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                Reseñas: <strong>{currentGuide.resenas}</strong>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default GuiaEstadisticas;
