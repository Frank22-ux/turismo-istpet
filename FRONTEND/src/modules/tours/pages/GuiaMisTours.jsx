import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import api from '../../../core/api';
// import { guiasMock, tourosMock } from '../../../core/mockData'; // Eliminado mock data
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaEye, FaUserCircle, FaBell, FaPlus, FaSearch, FaMapMarkerAlt, FaClock
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';
import TourDrawer from '../../../components/TourDrawer';
import GuiaNavbar from '../../../components/guia/GuiaNavbar';
import GuiaSidebar from '../../../components/guia/GuiaSidebar';

const API_URL = 'http://localhost:4000';

const GuiaMisTours = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTour, setSelectedTour] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [guideTours, setGuideTours] = useState([]);
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [guideReservas, setGuideReservas] = useState([]);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [profile, setProfile] = useState(null);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/guias/${user.id_usuario}/profile`);
            setProfile(res.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchMisTours = async () => {
        setLoading(true);
        try {
            const response = await api.get('/tours/mis-tours');
            setGuideTours(response.data);
        } catch (error) {
            console.error("Error fetching guide tours:", error);
        } finally {
            setLoading(false);
        }
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
        fetchMisTours();
        fetchReservas();
        if (user.id_usuario) fetchProfile();
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

    const handleLogout = async () => {
        try {
            await logoutRequest();
            navigate('/login');
        } catch (error) {
            navigate('/login');
        }
    };

    const handleVerDetalles = (tour) => {
        setSelectedTour({ ...tour, isGuideView: true });
        setIsDrawerOpen(true);
    };

    const filteredTours = guideTours.filter(tour => {
        const matchesSearch = tour.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tour.ciudad_destino?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'Todos') return matchesSearch;
        const isActive = tour.id_tour % 2 === 0; // Simulated active status
        if (filterStatus === 'Activos') return matchesSearch && isActive;
        if (filterStatus === 'Inactivos') return matchesSearch && !isActive;
        return matchesSearch;
    });

    return (
        <div className="guia-layout">
            <GuiaNavbar 
                currentGuide={currentGuide} 
                onSearch={setSearchTerm}
                reservations={guideReservas}
            />
            <GuiaSidebar currentGuide={currentGuide} />

            {/* MAIN */}
            <main className="guia-main-content">
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">🗺️ Mis Tours</h1>
                        <p className="guia-subtitle">Gestiona todos tus tours disponibles</p>
                    </div>
                </div>

                <section className="mis-tours-grid-section">
                    <div className="tours-filter-bar">
                        <div className="filter-stats">
                            <span className={`filter-stat ${filterStatus === 'Todos' ? 'active' : ''}`} onClick={() => setFilterStatus('Todos')}>Todos ({guideTours.length})</span>
                            <span className={`filter-stat ${filterStatus === 'Activos' ? 'active' : ''}`} onClick={() => setFilterStatus('Activos')}>Activos</span>
                            <span className={`filter-stat ${filterStatus === 'Inactivos' ? 'active' : ''}`} onClick={() => setFilterStatus('Inactivos')}>Inactivos</span>
                        </div>
                    </div>

                    <div className="tours-cards-grid">
                        {filteredTours.map((tour) => (
                            <div key={tour.id_tour} className="tour-card-guia">
                                <div className="tour-card-img">
                                    {tour.imagen_portada ? (
                                        <img src={`http://localhost:4000${tour.imagen_portada}`} alt={tour.nombre} />
                                    ) : (
                                        <div className="tour-card-placeholder">🗺️</div>
                                    )}
                                    <span className="tour-card-badge activo">
                                        Activo
                                    </span>
                                </div>
                                <div className="tour-card-body">
                                    <h3 className="tour-card-title">{tour.nombre}</h3>
                                    <div className="tour-card-info">
                                        <span><FaMapMarkerAlt /> {tour.ciudad_destino}</span>
                                        <span><FaClock /> {tour.duracion}</span>
                                        <span><FaUsers /> Máx. {tour.maximo_personas}</span>
                                    </div>
                                    <div className="tour-card-footer">
                                        <span className="tour-card-price">${tour.precio}</span>
                                        <div className="tour-card-actions">
                                            <button className="btn-table-action btn-edit-guia" title="Editar"><FaEdit /></button>
                                            <button className="btn-table-action btn-view-guia" title="Ver detalles" onClick={() => handleVerDetalles(tour)}><FaEye /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* ── Drawer de Detalles del Tour ── */}
            <TourDrawer
                tour={selectedTour}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onReserve={(t) => console.log('Editando desde Drawer (puedes añadir esta lógica si gustas):', t)}
            />
        </div>
    );
};

export default GuiaMisTours;
