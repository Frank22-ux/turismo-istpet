import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FaCalendarAlt, FaMapMarkerAlt, FaUsers, 
    FaSuitcase, FaUserCircle, FaSignOutAlt 
} from 'react-icons/fa';
import './GuiaDashboard.css';

const API_URL = 'http://localhost:4000';

const GuiaDashboard = () => {
    const navigate = useNavigate();
    const [misTours, setMisTours] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('token'); // Elimina el token de seguridad
        localStorage.removeItem('userRole'); // Si guardas el rol, elimínalo también
        navigate('/login', { replace: true }); // Redirige y bloquea el botón "atrás"
    };

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const resUser = await axios.get(`${API_URL}/api/usuarios/perfil`, config);
                const infoUsuario = resUser.data;
                setUsuario(infoUsuario);

                const resTours = await axios.get(`${API_URL}/api/tours`, config);
                
                const asignados = resTours.data.filter(t => 
                    Number(t.id_guia) === Number(infoUsuario.id_guia)
                );

                asignados.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
                setMisTours(asignados);
                
            } catch (error) {
                console.error("Error cargando dashboard:", error);
                if (error.response?.status === 401) handleLogout();
            } finally {
                setLoading(false);
            }
        };

        fetchDatos();
    }, [navigate]);

    if (loading) return <div className="loading-state">Cargando tu panel de control...</div>;

    return (
        <div className="guia-dashboard">
            <header className="dashboard-header">
                <div className="welcome-section">
                    {usuario?.foto_url ? (
                        <img src={`${API_URL}${usuario.foto_url}`} className="user-avatar-img" alt="Perfil" />
                    ) : (
                        <FaUserCircle className="user-icon" />
                    )}
                    <div>
                        <h1>¡Hola, {usuario?.primer_nombre || 'Guía'}!</h1>
                        <p>Estado: <span className="status-badge">{usuario?.activo ? 'Disponible' : 'Inactivo'}</span></p>
                    </div>
                </div>

                {/* BOTÓN DE CIERRE DE SESIÓN */}
                <button className="btn-logout" onClick={handleLogout} title="Cerrar Sesión">
                    <FaSignOutAlt /> <span>Cerrar Sesión</span>
                </button>
            </header>

            <section className="stats-grid">
                <div className="stat-card">
                    <FaSuitcase className="stat-icon tour-icon" />
                    <div className="stat-info">
                        <span>Total Tours</span>
                        <h3>{misTours.length}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <FaCalendarAlt className="stat-icon date-icon" />
                    <div className="stat-info">
                        <span>Próximo Tour</span>
                        <h3>
                            {misTours.length > 0 
                                ? new Date(misTours[0].fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) 
                                : 'Sin tours'}
                        </h3>
                    </div>
                </div>
            </section>

            <h2 className="section-title">Mi Agenda de Trabajo</h2>
            
            <div className="tours-grid-guia">
                {misTours.length > 0 ? (
                    misTours.map(tour => (
                        <div key={tour.id_tour} className="tour-card-guia">
                            <div className="tour-image-container">
                                <img 
                                    src={tour.imagen_portada ? `${API_URL}${tour.imagen_portada}` : '/default-tour.jpg'} 
                                    alt={tour.nombre} 
                                />
                                <div className={`tour-status-tag ${new Date(tour.fecha_inicio) < new Date() ? 'past' : 'upcoming'}`}>
                                    {new Date(tour.fecha_inicio) < new Date() ? 'Finalizado' : 'Próximamente'}
                                </div>
                            </div>
                            <div className="tour-content">
                                <h3>{tour.nombre}</h3>
                                <p className="tour-location"><FaMapMarkerAlt /> {tour.ciudad_destino}</p>
                                <div className="tour-details">
                                    <span><FaCalendarAlt /> {new Date(tour.fecha_inicio).toLocaleDateString()}</span>
                                    <span><FaUsers /> {tour.precio}$ / persona</span>
                                </div>
                                <button 
                                    className="btn-manage" 
                                    onClick={() => navigate(`/guia/tour/${tour.id_tour}`)}
                                >
                                    Ver Lista de Pasajeros
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-tours-container">
                        <img src="/no-tours.svg" alt="No hay tours" className="no-tours-img" />
                        <p>No tienes tours asignados por el momento.</p>
                        <span>Cuando el administrador te asigne un recorrido, aparecerá aquí.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuiaDashboard;