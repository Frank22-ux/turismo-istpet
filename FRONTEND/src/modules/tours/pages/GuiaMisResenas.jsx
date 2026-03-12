import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import api from '../../../core/api';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSearch
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';
import GuiaNavbar from '../../../components/guia/GuiaNavbar';
import GuiaSidebar from '../../../components/guia/GuiaSidebar';

// Reseñas de muestra
const resenasMock = [
    { id: 1, nombre: 'María López', fecha: '15 Ene 2025', estrellas: 5, texto: 'Excelente guía, muy profesional y conocedor de cada lugar. Lo recomiendo ampliamente.', tour: 'Tour Cotopaxi Clásico', inicial: 'M' },
    { id: 2, nombre: 'Carlos Morales', fecha: '8 Feb 2025', estrellas: 4, texto: 'Muy buena experiencia, el guía fue muy atento. Los paisajes fueron increíbles.', tour: 'Tour Quilotoa', inicial: 'C' },
    { id: 3, nombre: 'Ana Fernández', fecha: '20 Feb 2025', estrellas: 5, texto: 'Increíble experiencia. El guía conoce cada detalle del lugar, muy recomendado.', tour: 'Tour Galápagos Express', inicial: 'A' },
    { id: 4, nombre: 'Roberto Silva', fecha: '5 Mar 2025', estrellas: 3, texto: 'La experiencia fue buena aunque hubiera preferido un ritmo más tranquilo.', tour: 'Tour Amazónico', inicial: 'R' },
    { id: 5, nombre: 'Sofía Castro', fecha: '12 Mar 2025', estrellas: 5, texto: 'Absolutamente maravilloso. El mejor tour que he tenido. ¡Gracias!', tour: 'Tour Cotopaxi Clásico', inicial: 'S' },
];

const API_URL = 'http://localhost:4000';
const GuiaMisResenas = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [filtroEstrellas, setFiltroEstrellas] = useState(0);
    const [resenas, setResenas] = useState([]);
    const [stats, setStats] = useState({ promedio: 0, total_resenas: 0 });
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guideReservas, setGuideReservas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

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
            try {
                const [profileRes, resenasRes] = await Promise.all([
                    api.get(`/guias/${user.id_usuario}/profile`),
                    api.get(`/resenas/guia/${user.id_usuario}`)
                ]);
                setProfile(profileRes.data);
                
                const reviews = resenasRes.data.resenas || [];
                const avg = reviews.reduce((acc, curr) => acc + curr.calificacion, 0) / (reviews.length || 1);
                setStats({ promedio: avg.toFixed(1), total_resenas: reviews.length });
                setResenas(reviews); // Changed setReviews to setResenas
            } catch (error) { console.error(error); } finally {
                setLoading(false);
            }
        };
        if (user.id_usuario) {
            fetchData();
            fetchReservas();
        }
    }, [user.id_usuario]);
    const currentGuide = {
        nombre: profile?.primer_nombre || user.primer_nombre || 'Guía',
        apellido: profile?.apellido_paterno || user.apellido_paterno || '',
        imagen: (profile?.foto_url || user.foto_url)
            ? ((profile?.foto_url || user.foto_url).startsWith('http') ? (profile?.foto_url || user.foto_url) : `${API_URL}${profile?.foto_url || user.foto_url}`) 
            : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
        especialidad: profile?.especialidades || user.descripcion_perfil || 'Especialista Ecoturismo',
        calificacion: parseFloat(stats.promedio) || 4.9,
        total_resenas: parseInt(stats.total_resenas) || 0,
        toursGuiados: parseInt(profile?.tours) || 0,
        experiencia: profile?.experiencia_anios || 0,
        idiomas: Array.isArray(profile?.idiomas) ? profile.idiomas : ['Español'],
        disponible: profile?.disponibilidad?.trim().toLowerCase() === 'disponible',
    };

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const filtradas = filtroEstrellas === 0
        ? resenas
        : resenas.filter(r => r.calificacion === filtroEstrellas);

    const promedio = parseFloat(stats.promedio).toFixed(1);

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
                        <h1 className="guia-title">⭐ Mis Reseñas</h1>
                        <p className="guia-subtitle">Lo que opinan los turistas sobre ti</p>
                    </div>
                </div>

                {/* Resumen */}
                <section className="quick-stats-guia-section">
                    <div className="stat-card-guia primary">
                        <div className="stat-icon-guia">⭐</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{promedio}</div>
                            <div className="stat-label-guia">Calificación Promedio</div>
                        </div>
                    </div>
                    <div className="stat-card-guia success">
                        <div className="stat-icon-guia">💬</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{stats.total_resenas}</div>
                            <div className="stat-label-guia">Total de Reseñas</div>
                        </div>
                    </div>
                    <div className="stat-card-guia info">
                        <div className="stat-icon-guia">🏆</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{resenas.filter(r => r.calificacion === 5).length}</div>
                            <div className="stat-label-guia">5 Estrellas</div>
                        </div>
                    </div>
                    <div className="stat-card-guia warning">
                        <div className="stat-icon-guia">👍</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{resenas.filter(r => r.calificacion >= 4).length}</div>
                            <div className="stat-label-guia">Positivas (4-5 ⭐)</div>
                        </div>
                    </div>
                </section>

                <section className="mis-tours-grid-section">
                    {/* Filtro por estrellas */}
                    <div className="tours-filter-bar">
                        <div className="filter-stats">
                            {[0, 5, 4, 3, 2, 1].map(n => (
                                <span
                                    key={n}
                                    className={`filter-stat ${filtroEstrellas === n ? 'active' : ''}`}
                                    onClick={() => setFiltroEstrellas(n)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {n === 0 ? 'Todas' : `${n} ⭐`}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Lista de reseñas */}
                    <div>
                        {filtradas.length > 0 ? filtradas.map(resena => (
                            <div key={resena.id_resena} className="resena-card">
                                <div className="resena-header">
                                    <div className="resena-user">
                                        <div className="resena-avatar">{resena.primer_nombre ? resena.primer_nombre[0] : 'U'}</div>
                                        <div>
                                            <p className="resena-nombre">{resena.primer_nombre} {resena.apellido_paterno}</p>
                                            <p className="resena-fecha-texto">{new Date(resena.fecha_creacion).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="resena-stars">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FaStar key={i} style={{ color: i < resena.calificacion ? '#f59e0b' : '#e5e7eb' }} />
                                        ))}
                                    </div>
                                </div>
                                <p className="resena-texto">{resena.comentario || 'Sin comentario written'}</p>
                            </div>
                        )) : (
                            <div className="empty-state">No hay reseñas que coincidan con el filtro.</div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default GuiaMisResenas;
