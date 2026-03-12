import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../core/api';
import { FaStar, FaUserCircle, FaArrowLeft, FaSuitcase, FaCalendarAlt } from 'react-icons/fa';
import './MisResenas.css';

const API_URL = 'http://localhost:4000';

const MisResenas = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [resenasTours, setResenasTours] = useState([]);
    const [resenasGuias, setResenasGuias] = useState([]);
    const [loading, setLoading] = useState(true);

    const isGuia = user.id_rol === 2;

    useEffect(() => {
        const fetchResenas = async () => {
            try {
                if (isGuia) {
                    // Si es guía, ve las reseñas que LE HAN DEJADO
                    const res = await api.get(`/resenas/guia/${user.id_usuario}`);
                    setResenasGuias(res.data.resenas || []);
                } else {
                    // Si es turista, tal vez quiera ver las que ÉL ha dejado? 
                    // El requerimiento dice "cada turista debe tener su apartado para colocar sus reseñas"
                    // MisReservas ya tiene el botón. Pero ver un historial es bueno.
                    // Por ahora, si es turista, mostramos un mensaje o las reseñas de tours que ha hecho.
                }
            } catch (error) {
                console.error("Error fetching resenas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResenas();
    }, [isGuia, user.id_usuario]);

    return (
        <div className="resenas-container">
            <header className="resenas-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Volver
                </button>
                <h1>{isGuia ? 'Mis Calificaciones y Reseñas' : 'Mis Reseñas Enviadas'}</h1>
                <p>{isGuia ? 'Lo que los turistas opinan de tu trabajo' : 'Historial de tus comentarios'}</p>
            </header>

            {loading ? (
                <div className="loading-state">Cargando reseñas...</div>
            ) : (
                <div className="resenas-list-page">
                    {isGuia ? (
                        resenasGuias.length > 0 ? (
                            resenasGuias.map(r => (
                                <div key={r.id_resena} className="resena-item-card">
                                    <div className="resena-user-info">
                                        <div className="user-avatar-mini">
                                            <FaUserCircle />
                                        </div>
                                        <div>
                                            <h4>{r.primer_nombre} {r.apellido_paterno}</h4>
                                            <span className="resena-date">{new Date(r.fecha_creacion).toLocaleDateString()}</span>
                                        </div>
                                        <div className="resena-rating-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={i < r.calificacion ? 'star-on' : 'star-off'} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="resena-comment">"{r.comentario || 'Sin comentario written'}"</p>
                                </div>
                            ))
                        ) : (
                            <div className="empty-resenas">Aún no tienes reseñas. ¡Tus próximos tours serán geniales!</div>
                        )
                    ) : (
                        <div className="empty-resenas">Sección en desarrollo. Puedes calificar tus tours completados desde "Mis Reservas".</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MisResenas;
