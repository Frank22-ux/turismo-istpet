import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logoutRequest } from '../../auth/services/auth.service';
import api from '../../../core/api';
import {
    FaArrowLeft, FaSuitcase, FaMapMarkerAlt, FaClock, FaCalendarAlt,
    FaUsers, FaStar, FaDownload, FaSearch, FaFilter, FaEye,
    FaTimesCircle, FaCheckCircle, FaHourglassHalf, FaUserCircle,
    FaHeart, FaSignOutAlt, FaUserEdit, FaChevronDown, FaPhone, FaEnvelope
} from 'react-icons/fa';
import './TuristaPages.css';
import TourDrawer from '../../../components/TourDrawer';
import ReservationDrawer from '../../../components/ReservationDrawer';
import PaymentDrawer from '../../../components/PaymentDrawer';
import ReviewModal from '../../../components/ReviewModal';
import VoucherDrawer from '../../../components/VoucherDrawer';

const API_URL = 'http://localhost:4000';

// Reservas Mock eliminadas para usar datos reales del backend

const estadoConfig = {
    Confirmada: { icon: <FaCheckCircle />, color: '#10b981', bg: '#d1fae5', label: 'Confirmada' },
    Pendiente: { icon: <FaHourglassHalf />, color: '#f59e0b', bg: '#fef3c7', label: 'Pendiente' },
    Completada: { icon: <FaStar />, color: '#3b82f6', bg: '#dbeafe', label: 'Completada' },
    Cancelada: { icon: <FaTimesCircle />, color: '#ef4444', bg: '#fee2e2', label: 'Cancelada' },
};

const MisReservas = () => {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Estados para Drawers y Selección
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isVoucherOpen, setIsVoucherOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [pendingReservation, setPendingReservation] = useState(null);

    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reservas/mis-reservas');
            // Mapeamos los datos del backend al formato esperado por la vista
            const dataMapped = response.data.map(r => {
                let imgUrl = 'https://images.unsplash.com/photo-1551854304-25049c10e254?w=500&q=75';
                if (r.tour_imagen) {
                    imgUrl = r.tour_imagen.startsWith('http') ? r.tour_imagen : `http://localhost:4000${r.tour_imagen}`;
                } else if (r.id_tour) {
                    imgUrl = `https://images.unsplash.com/photo-1551854304-25049c10e254?w=500&q=75&sig=${r.id_tour}`;
                }

                return {
                    id: r.id_reserva,
                    tour: r.tour_nombre || r.hotel_nombre || 'Mi Experiencia',
                    guia: 'Guía Asignado', // Podríamos traerlo en el JOIN si fuera necesario
                    imagen: imgUrl,
                    ciudad: r.tour_ciudad || 'Ecuador',
                    fecha: r.fecha_actividad,
                    hora: '08:00', // Hardcoded por ahora, asumiendo inicio estándar
                    personas: r.cantidad_personas,
                    total: parseFloat(r.total_pagado) || 0,
                    estado: r.estado_reserva,
                    duracion: r.tour_duracion || 'Día completo',
                    calificacion: r.tour_calificacion || 4.5,
                    id_guia: r.id_guia,
                    foto_guia: r.guia_foto,
                    nombre_guia: r.guia_nombre,
                    apellido_guia: r.guia_apellido,
                    id_hotel: r.id_hotel || r.hotel_asociado_id,
                    hotel_nombre: r.hotel_nombre,
                    pagado: r.estado_reserva !== 'Pendiente',
                    id_reserva: r.id_reserva, // Aseguramos que pase como id_reserva también
                };
            });
            setReservas(dataMapped);
        } catch (error) {
            console.error("Error fetching reservas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
    }, []);

    const handleVerDetalles = (res) => {
        const tourData = {
            id_tour: res.id,
            nombre: res.tour,
            ciudad_destino: res.ciudad,
            precio: res.total / res.personas,
            imagen_portada: res.imagen,
            calificacion: res.calificacion,
            duracion: res.duracion,
            nombre_guia: res.nombre_guia,
            apellido_guia: res.apellido_guia,
            foto_guia: res.foto_guia,
            maximo_personas: 20
        };
        setSelectedTour(tourData);
        setIsDrawerOpen(true);
    };

    const handleOpenVoucher = (res) => {
        setSelectedReservation(res);
        setIsVoucherOpen(true);
    };

    const handleCancelar = (resId) => {
        if (window.confirm(`¿Estás seguro de que deseas cancelar la reserva ${resId}?`)) {
            alert(`Reserva ${resId} cancelada exitosamente. Se procesará el reembolso si corresponde.`);
        }
    };

    const handleCalificar = (res) => {
        setSelectedReservation(res);
        setIsReviewOpen(true);
    };

    const handleReviewSuccess = () => {
        setIsReviewOpen(false);
        alert("¡Gracias por tu reseña! Tu calificación ha sido registrada.");
        fetchReservas(); // Opcional, para actualizar algún estado si lo tuviéramos
    };

    const handleConfirmReservation = (resData) => {
        setPendingReservation(resData);
        setIsReservationOpen(false);
        setIsPaymentOpen(true);
    };

    const handlePaymentSuccess = (paymentInfo) => {
        console.log('Re-agendando:', paymentInfo);
        setIsPaymentOpen(false);
        alert('¡Tu tour ha sido re-agendado con éxito!');
    };

    const handleLogout = async () => {
        try { await logoutRequest(); } catch { }
        navigate('/login');
    };

    const reservasFiltradas = reservas.filter(r => {
        const matchBusqueda = r.tour.toLowerCase().includes(busqueda.toLowerCase()) ||
            r.ciudad.toLowerCase().includes(busqueda.toLowerCase());
        const matchEstado = filtroEstado === 'todos' || r.estado === filtroEstado;
        return matchBusqueda && matchEstado;
    });

    const stats = {
        total: reservas.length,
        confirmadas: reservas.filter(r => r.estado === 'Confirmada').length,
        completadas: reservas.filter(r => r.estado === 'Completada').length,
        gastado: reservas.filter(r => r.pagado).reduce((s, r) => s + r.total, 0),
    };

    return (
        <div className="turista-page-layout">
            {/* ── Navbar ── */}
            <nav className="navbar-turista">
                <div className="nav-inner">
                    <div className="nav-logo" onClick={() => navigate('/home')}>
                        <img src="/uploads/logo.png" alt="ECRUT" />
                        <span>ECRUT Travels</span>
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/home">Inicio</Link></li>
                        <li><a href="#destinos">Destinos</a></li>
                        <li><a href="#tours">Tours</a></li>
                        <li><a href="#hoteles">Hoteles</a></li>
                    </ul>
                    <div className="nav-right">
                        <div className="user-menu-wrap">
                            <button className="nav-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                                <FaUserCircle />
                                <span className="nav-username">{user.username || 'Mi cuenta'}</span>
                                <FaChevronDown className="nav-chevron" />
                            </button>
                            {showUserMenu && (
                                <div className="user-dropdown" onClick={() => setShowUserMenu(false)}>
                                    <Link to="/perfil-turista" className="drop-item"><FaUserEdit /> Mi Perfil</Link>
                                    <Link to="/mis-reservas" className="drop-item drop-active"><FaSuitcase /> Mis Reservas</Link>
                                    <Link to="/mis-favoritos" className="drop-item"><FaHeart /> Mis Favoritos</Link>
                                    <hr className="drop-divider" />
                                    <button onClick={handleLogout} className="drop-item drop-logout"><FaSignOutAlt /> Cerrar Sesión</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Hero mini ── */}
            <div className="page-hero-mini reservas-hero">
                <div className="page-hero-overlay" />
                <div className="page-hero-content">
                    <button className="btn-back-hero" onClick={() => navigate('/home')}>
                        <FaArrowLeft /> Volver al inicio
                    </button>
                    <h1 className="page-hero-title"><FaSuitcase /> Mis Reservas</h1>
                    <p className="page-hero-sub">Gestiona y revisa todos tus viajes reservados</p>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="page-stats-bar">
                <div className="page-stats-wrap">
                    <div className="pstat-card">
                        <span className="pstat-icon" style={{ background: '#e0f7fa' }}>🎯</span>
                        <div><p className="pstat-num">{stats.total}</p><p className="pstat-lbl">Total reservas</p></div>
                    </div>
                    <div className="pstat-card">
                        <span className="pstat-icon" style={{ background: '#d1fae5' }}>✅</span>
                        <div><p className="pstat-num">{stats.confirmadas}</p><p className="pstat-lbl">Confirmadas</p></div>
                    </div>
                    <div className="pstat-card">
                        <span className="pstat-icon" style={{ background: '#dbeafe' }}>⭐</span>
                        <div><p className="pstat-num">{stats.completadas}</p><p className="pstat-lbl">Completadas</p></div>
                    </div>
                    <div className="pstat-card">
                        <span className="pstat-icon" style={{ background: '#fef3c7' }}>💰</span>
                        <div><p className="pstat-num">${stats.gastado.toLocaleString()}</p><p className="pstat-lbl">Total invertido</p></div>
                    </div>
                </div>
            </div>

            {/* ── Contenido ── */}
            <div className="page-content-wrap">
                
                {/* Banner Informativo de Reseñas */}
                <div className="review-notice-banner" style={{ 
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', 
                    color: 'white', 
                    padding: '20px', 
                    borderRadius: '16px', 
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
                }}>
                    <div style={{ fontSize: '2.5rem' }}>✍️</div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>¡Tu opinión nos importa!</h4>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
                            Las opciones de calificación aparecerán automáticamente en tus tours una vez que el estado cambie a <strong>"Completada"</strong>. 
                            ¡Ayuda a otros viajeros compartiendo tu experiencia sobre el tour, el guía y el hotel!
                        </p>
                    </div>
                </div>

                {/* Barra de filtros */}
                <div className="page-filter-bar">
                    <div className="page-search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Buscar por tour o ciudad..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="estado-pills">
                        {['todos', 'Confirmada', 'Pendiente', 'Completada', 'Cancelada'].map(e => (
                            <button
                                key={e}
                                className={`estado-pill ${filtroEstado === e ? 'active' : ''}`}
                                onClick={() => setFiltroEstado(e)}
                            >
                                {e === 'todos' ? 'Todas' : e}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de reservas */}
                {reservasFiltradas.length === 0 ? (
                    <div className="empty-state">
                        <span>🔍</span>
                        <h3>Sin reservas</h3>
                        <p>No encontramos reservas con esos filtros</p>
                        <button onClick={() => { setBusqueda(''); setFiltroEstado('todos'); }} className="btn-empty-reset">
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <div className="reservas-list">
                        {reservasFiltradas.map(res => {
                            const cfg = estadoConfig[res.estado];
                            return (
                                <div key={res.id} className="reserva-card">
                                    {/* Imagen */}
                                    <div className="reserva-img-wrap">
                                        <img src={res.imagen} alt={res.tour} className="reserva-img" />
                                        <div className="reserva-estado-badge" style={{ background: cfg.bg, color: cfg.color }}>
                                            {cfg.icon} {cfg.label}
                                        </div>
                                    </div>

                                    {/* Info principal */}
                                    <div className="reserva-info">
                                        <div className="reserva-id">{res.id}</div>
                                        <h3 className="reserva-nombre">{res.tour}</h3>
                                        <div className="reserva-meta-grid">
                                            <span><FaMapMarkerAlt /> {res.ciudad}</span>
                                            <span><FaCalendarAlt /> {new Date(res.fecha).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            <span><FaClock /> {res.hora} · {res.duracion}</span>
                                            <span><FaUsers /> {res.personas} persona{res.personas > 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="reserva-guia">
                                            <div className="guia-photo-mini" style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#e2e8f0', marginRight: '8px' }}>
                                                {res.foto_guia ? (
                                                    <img 
                                                        src={res.foto_guia.startsWith('http') ? res.foto_guia : `${API_URL}${res.foto_guia}`} 
                                                        alt={res.nombre_guia}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><FaUserCircle /></div>
                                                )}
                                            </div>
                                            <span>Guía: <strong>{res.nombre_guia ? `${res.nombre_guia} ${res.apellido_guia || ''}` : 'Por asignar'}</strong></span>
                                            <span className="guia-rating"><FaStar /> {res.calificacion}</span>
                                        </div>
                                    </div>

                                    {/* Panel derecho */}
                                    <div className="reserva-right">
                                        <div className="reserva-precio">
                                            <p className="precio-label">Total pagado</p>
                                            <p className="precio-valor">${res.total.toLocaleString()}</p>
                                            <span className={`pago-badge ${res.pagado ? 'pagado' : 'pendiente-pago'}`}>
                                                {res.pagado ? '✓ Pagado' : '⏳ Pendiente'}
                                            </span>
                                        </div>
                                        <div className="reserva-acciones">
                                            <button className="btn-accion primary" onClick={() => handleVerDetalles(res)}><FaEye /> Ver detalles</button>
                                            {res.estado === 'Completada' && (
                                                <button className="btn-accion primary-highlight" onClick={() => handleCalificar(res)} style={{ backgroundColor: '#2563eb', color: 'white', fontWeight: '600' }}>
                                                    <FaStar /> Calificar ahora
                                                </button>
                                            )}
                                            {(res.estado === 'Confirmada' || res.estado === 'Pendiente') && (
                                                <button className="btn-accion danger" onClick={() => handleCancelar(res.id)}><FaTimesCircle /> Cancelar</button>
                                            )}
                                            <button className="btn-accion ghost" onClick={() => handleOpenVoucher(res)}><FaDownload /> Voucher</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Footer mini ── */}
            <footer className="footer-mini">
                <p>© 2026 ECRUT Travels · <a href="#c">Contacto</a> · <a href="#p">Privacidad</a></p>
            </footer>

            {/* ── Drawers de flujo de reserva ── */}
            <TourDrawer
                tour={selectedTour}
                isOpen={isDrawerOpen}
                isFavorite={false} // Se podría implementar carga de favoritos aquí también si se desea
                onToggleFavorite={() => alert("Función disponible desde la página principal")}
                onClose={() => setIsDrawerOpen(false)}
                onReserve={(t) => {
                    setIsDrawerOpen(false);
                    //handleOpenReservation(t);
                }}
            />

            <VoucherDrawer
                isOpen={isVoucherOpen}
                onClose={() => setIsVoucherOpen(false)}
                reservation={selectedReservation}
            />

            <PaymentDrawer
                reservation={pendingReservation}
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                reservation={selectedReservation}
                onSuccess={handleReviewSuccess}
            />
        </div>
    );
};

export default MisReservas;
