import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../../../modules/auth/services/auth.service';
import api from '../../../core/api';
import {
    FaHome, FaCalendarAlt, FaCoins, FaUsers, FaStar, FaSignOutAlt,
    FaChartLine, FaEdit, FaUserCircle, FaBell, FaSearch, FaArrowUp, FaMoneyBillWave, FaMapMarkerAlt
} from 'react-icons/fa';
import './GuiaDashboard.css';
import './GuiaMisTours.css';
import GuiaNavbar from '../../../components/guia/GuiaNavbar';
import GuiaSidebar from '../../../components/guia/GuiaSidebar';

const API_URL = 'http://localhost:4000';

const GuiaGanancias = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [periodo, setPeriodo] = useState('mes');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [loading, setLoading] = useState(true);
    const [guideReservasGanancias, setGuideReservasGanancias] = useState([]); // Renamed to avoid conflict
    const [profile, setProfile] = useState(null);
    const [guideReservas, setGuideReservas] = useState([]); // This is for notifications
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/guias/${user.id_usuario}/profile`);
            setProfile(res.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchReservasGanancias = async () => { // Renamed function
        setLoading(true);
        try {
            const response = await api.get('/reservas/guia');
            // Filtramos las que están asignadas al guía logueado
            const mapped = response.data
                .filter(r => r.asignada_a_mi)
                .map(r => ({
                    id: r.id_reserva,
                    turista: `${r.turista_nombre} ${r.turista_apellido}`,
                    tour: r.tour_nombre,
                    fecha: new Date(r.fecha_actividad).toLocaleDateString(),
                    total: parseFloat(r.total_pagado) || 0,
                    estadoPago: r.estado_pago === 'COMPLETED' ? 'Pagado' : r.estado_reserva === 'Confirmada' ? 'Confirmada' : 'Pendiente'
                }));
            setGuideReservasGanancias(mapped); // Set to the specific state
        } catch (error) {
            console.error("Error fetching ganancias:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservasGanancias(); // Call the renamed function
    }, []);

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
                const profileRes = await api.get(`/guias/${user.id_usuario}/profile`);
                setProfile(profileRes.data);
            } catch (error) { console.error(error); }
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
        calificacion: parseFloat(profile?.calificacion) || 4.9,
        total_resenas: parseInt(profile?.total_resenas) || 0,
        toursGuiados: parseInt(profile?.tours) || 0,
        experiencia: profile?.experiencia_anios || 0,
        idiomas: Array.isArray(profile?.idiomas) ? profile.idiomas : ['Español'],
        disponible: profile?.disponibilidad?.trim().toLowerCase() === 'disponible',
    };

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const totalGanancias = guideReservasGanancias // Use the specific state
        .filter(r => r.estadoPago === 'Pagado')
        .reduce((sum, r) => sum + (r.total * 0.2), 0);

    const totalBruto = guideReservasGanancias // Use the specific state
        .filter(r => r.estadoPago === 'Pagado')
        .reduce((sum, r) => sum + r.total, 0);

    const pendiente = guideReservasGanancias // Use the specific state
        .filter(r => r.estadoPago === 'Pendiente')
        .reduce((sum, r) => sum + (r.total * 0.2), 0);

    // Filtrar reservas por periodo para el historial
    const guideReservasPeriodo = guideReservasGanancias.filter(r => { // Use the specific state
        if (periodo === 'año') return true; // Mostrar todas para año
        if (periodo === 'mes') {
            // Simulación: mostrar las últimas 5 para mes
            return guideReservasGanancias.indexOf(r) < 5; // Use the specific state
        }
        if (periodo === 'semana') {
            // Simulación: mostrar las últimas 2 para semana
            return guideReservasGanancias.indexOf(r) < 2; // Use the specific state
        }
        return true;
    });

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
                        <h1 className="guia-title">💰 Ganancias</h1>
                        <p className="guia-subtitle">Resumen de tus ingresos como guía</p>
                    </div>
                    <div className="period-selector">
                        {['semana', 'mes', 'año'].map(p => (
                            <button
                                key={p}
                                className={`period-btn ${periodo === p ? 'active' : ''}`}
                                onClick={() => setPeriodo(p)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    marginLeft: '8px',
                                    cursor: 'pointer',
                                    background: periodo === p ? '#10b981' : '#f3f4f6',
                                    color: periodo === p ? '#fff' : '#374151',
                                    fontWeight: periodo === p ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats principales */}
                <section className="quick-stats-guia-section">
                    <div className="stat-card-guia primary">
                        <div className="stat-icon-guia">💰</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">${totalGanancias.toFixed(2)}</div>
                            <div className="stat-label-guia">Mis Ganancias (20%)</div>
                        </div>
                    </div>
                    <div className="stat-card-guia success">
                        <div className="stat-icon-guia"><FaArrowUp /></div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">${totalBruto.toFixed(2)}</div>
                            <div className="stat-label-guia">Ventas Totales</div>
                        </div>
                    </div>
                    <div className="stat-card-guia warning">
                        <div className="stat-icon-guia"><FaMoneyBillWave /></div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">${pendiente.toFixed(2)}</div>
                            <div className="stat-label-guia">Por Cobrar</div>
                        </div>
                    </div>
                    <div className="stat-card-guia info">
                        <div className="stat-icon-guia">📈</div>
                        <div className="stat-info-guia">
                            <div className="stat-number-guia">{guideReservas.filter(r => r.estadoPago === 'Pagado').length}</div>
                            <div className="stat-label-guia">Reservas Cobradas</div>
                        </div>
                    </div>
                </section>

                {/* Historial de transacciones */}
                <section className="mis-tours-grid-section">
                    <div className="section-header-guia">
                        <h2 className="section-title-guia">📄 Historial de Transacciones</h2>
                    </div>
                    <div className="tours-table-guia">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Reserva</th>
                                    <th>Turista</th>
                                    <th>Tour</th>
                                    <th>Fecha</th>
                                    <th>Total Venta</th>
                                    <th>Mi Comisión (20%)</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Cargando transacciones...</td></tr>
                                ) : guideReservasPeriodo.length > 0 ? (
                                    guideReservasPeriodo.map(res => (
                                        <tr key={res.id}>
                                            <td className="font-bold">{res.id}</td>
                                            <td>{res.turista}</td>
                                            <td>{res.tour}</td>
                                            <td>{res.fecha}</td>
                                            <td className="price-cell">${res.total}</td>
                                            <td className="price-cell">${(res.total * 0.2).toFixed(2)}</td>
                                            <td className="badge-cell">
                                                <span className={`reserva-status ${res.estadoPago.toLowerCase()}`}>{res.estadoPago}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron transacciones en este periodo.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default GuiaGanancias;
