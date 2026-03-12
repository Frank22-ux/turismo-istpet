import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import api from '../../../core/api';
// import { guiasMock, reservasMock } from '../../../core/mockData'; // Eliminado mock data
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt, FaMinusCircle
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';
import TourDrawer from '../../../components/TourDrawer';
import GuiaNavbar from '../../../components/guia/GuiaNavbar';
import GuiaSidebar from '../../../components/guia/GuiaSidebar';

const API_URL = 'http://localhost:4000';

const GuiaReservas = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('Todas');
    const [selectedTour, setSelectedTour] = useState(null);
    const [profile, setProfile] = useState(null);
    const [guideReservas, setGuideReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/guias/${user.id_usuario}/profile`);
            setProfile(res.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reservas/guia');
            const mapped = response.data.map(r => ({
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
            setGuideReservas(mapped);
        } catch (error) {
            console.error("Error fetching reservas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
        if (user.id_usuario) fetchProfile();
    }, []);

    const handleConfirm = async (res) => {
        try {
            const tourId = res.id_tour || res.id;
            await api.post(`/tours/${tourId}/assign`);
            alert('¡Te has asignado el tour exitosamente!');
            fetchReservas(); // Recargar datos
        } catch (error) {
            console.error("Error al confirmar tour:", error);
            alert(error.response?.data?.message || 'No se pudo confirmar el tour');
        }
    };

    const handleUnassign = async (res) => {
        try {
            const tourId = res.id_tour || res.id;
            if (!window.confirm('¿Estás seguro que deseas desasignarte de este tour?')) return;
            await api.delete(`/tours/${tourId}/assign`);
            alert('Te has desasignado del tour correctamente');
            fetchReservas(); // Recargar datos
        } catch (error) {
            console.error("Error al desasignar tour:", error);
            alert(error.response?.data?.message || 'No se pudo desasignar el tour');
        }
    };

    const currentGuide = {
        nombre: profile?.primer_nombre || user.primer_nombre || 'Guía',
        apellido: profile?.apellido_paterno || user.apellido_paterno || '',
        imagen: (profile?.foto_url || user.foto_url)
            ? ((profile?.foto_url || user.foto_url).startsWith('http') ? (profile?.foto_url || user.foto_url) : `${API_URL}${profile?.foto_url || user.foto_url}`) 
            : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
        especialidad: profile?.especialidades || user.descripcion_perfil || 'Especialista Ecoturismo',
        calificacion: parseFloat(profile?.calificacion) || 4.9,
        toursGuiados: parseInt(profile?.tours) || 0,
        experiencia: profile?.experiencia_anios || 0,
        idiomas: Array.isArray(profile?.idiomas) ? profile.idiomas : ['Español'],
        disponible: profile?.disponibilidad?.trim().toLowerCase() === 'disponible',
        total_resenas: parseInt(profile?.total_resenas) || 0
    };

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const estados = ['Todas', 'Pagado', 'Pendiente', 'Cancelado', 'Disponibles'];
    
    // First apply status filter
    const filtradasPorEstado = filtroEstado === 'Todas'
        ? guideReservas
        : filtroEstado === 'Disponibles'
            ? guideReservas.filter(r => !r.asignada_a_mi)
            : guideReservas.filter(r => r.estadoPago === filtroEstado);

    // Then apply search filter
    const filtradas = filtradasPorEstado.filter(r => 
        r.tour?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.turista?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm)
    );

    const getStatusIcon = (estado) => {
        if (estado === 'Pagado') return <FaCheckCircle className="status-icon pagado" />;
        if (estado === 'Cancelado') return <FaTimesCircle className="status-icon cancelado" />;
        return <FaClock className="status-icon pendiente" />;
    };

    const handleVerDetalles = async (res) => {
        try {
            const response = await api.get(`/tours/${res.id_tour}`);
            const tourData = {
                ...response.data,
                isGuideView: true
            };
            setSelectedTour(tourData);
            setIsDrawerOpen(true);
        } catch (error) {
            console.error("Error al obtener detalles del tour:", error);
        }
    };

    return (
        <div className="guia-layout">
            <GuiaNavbar 
                currentGuide={currentGuide} 
                notificationsCount={guideReservas.length} 
                onSearch={setSearchTerm}
                reservations={guideReservas}
            />
            <GuiaSidebar currentGuide={currentGuide} />

            <main className="guia-main-content">
                <div className="guia-header">
                    <div>
                        <h1 className="guia-title">📋 Reservas</h1>
                        <p className="guia-subtitle">Gestiona las reservas de tus tours</p>
                    </div>
                </div>

                {/* Resumen */}
                <section className="quick-stats-guia-section">
                    <div className="stat-card-guia primary">
                        <div className="stat-icon-guia">📋</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.length}</div>
                            <div className="stat-label-guia">Total Reservas</div>
                        </div>
                    </div>
                    <div className="stat-card-guia success">
                        <div className="stat-icon-guia">✅</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.filter(r => r.estadoPago === 'Pagado').length}</div>
                            <div className="stat-label-guia">Pagadas</div>
                        </div>
                    </div>
                    <div className="stat-card-guia warning">
                        <div className="stat-icon-guia">⏳</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.filter(r => r.estadoPago === 'Pendiente').length}</div>
                            <div className="stat-label-guia">Pendientes</div>
                        </div>
                    </div>
                    <div className="stat-card-guia info">
                        <div className="stat-icon-guia">❌</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.filter(r => r.estadoPago === 'Cancelado').length}</div>
                            <div className="stat-label-guia">Canceladas</div>
                        </div>
                    </div>
                </section>

                <section className="mis-tours-grid-section">
                    <div className="tours-filter-bar">
                        <div className="filter-stats">
                            {estados.map(e => (
                                <span
                                    key={e}
                                    className={`filter-stat ${filtroEstado === e ? 'active' : ''}`}
                                    onClick={() => setFiltroEstado(e)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {e}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="reservas-list-guia">
                        {filtradas.length > 0 ? filtradas.map((res) => (
                            <div key={res.id} className="reserva-card-guia">
                                <div className="reserva-info-guia">
                                    <div className="reserva-header">
                                        <span className="reserva-id">{res.id} - {res.personas} persona(s)</span>
                                        <span className={`reserva-status ${res.estadoPago.toLowerCase()}`}>
                                            {getStatusIcon(res.estadoPago)} {res.estadoPago}
                                        </span>
                                    </div>
                                    <p className="reserva-turista">{res.turista}</p>
                                    <p className="reserva-tour">{res.tour}</p>
                                    <p className="reserva-fecha">📅 {res.fecha}</p>
                                </div>
                                <div className="reserva-total">
                                    <span className="total-amount">${res.total}</span>
                                    <div className="reserva-guia-actions" style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-confirm" title="Ver detalles del tour" onClick={() => handleVerDetalles(res)} style={{ background: '#64748b' }}>Detalles</button>
                                        {!res.asignada_a_mi ? (
                                            <button className="btn-confirm" onClick={() => handleConfirm(res)}>Confirmar</button>
                                        ) : (
                                            <button className="btn-confirm" onClick={() => handleUnassign(res)} style={{ background: '#ef4444' }}>
                                                <FaMinusCircle /> Desconfirmar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="no-reservas-guia"><p>No hay reservas con este estado</p></div>
                        )}
                    </div>
                </section>
            </main>

            {/* ── Drawer de Detalles del Tour ── */}
            <TourDrawer
                tour={selectedTour}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onReserve={handleConfirm}
            />
        </div>
    );
};

export default GuiaReservas;
