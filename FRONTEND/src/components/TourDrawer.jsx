import React, { useEffect, useState } from 'react';
import {
    FaTimes, FaMapMarkerAlt, FaClock, FaUsers,
    FaStar, FaCheck, FaLanguage, FaMountain,
    FaCalendarAlt, FaInfoCircle, FaHeart, FaShareAlt, FaArrowLeft, FaUserCircle
} from 'react-icons/fa';
import './TourDrawer.css';

const TourDrawer = ({ tour, isOpen, onClose, onReserve, isFavorite, onToggleFavorite }) => {
    const [activeTab, setActiveTab] = useState('info');

    // Cerrar con la tecla Esc
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!tour) return null;

    // Helper para parsear arrays que vengan como string JSON de la base de datos
    const parseArray = (data, fallback) => {
        if (!data) return fallback;
        if (Array.isArray(data)) return data;
        try {
            return JSON.parse(data);
        } catch (e) {
            return fallback;
        }
    };

    const idiomasParsed = parseArray(tour.idiomas, ['Español', 'Inglés']);
    const puntosInteresParsed = parseArray(tour.puntos_interes, []);
    const incluyeParsed = parseArray(tour.incluye, []);
    
    // Construir la URL de la imagen
    const imageUrl = tour.imagen_portada 
        ? (tour.imagen_portada.startsWith('http') ? tour.imagen_portada : `http://localhost:4000${tour.imagen_portada}`)
        : tour.imagen 
            ? (tour.imagen.startsWith('http') ? tour.imagen : `http://localhost:4000${tour.imagen}`)
            : `https://images.unsplash.com/photo-1551854304-25049c10e254?w=800&q=80&sig=${tour.id_tour || 1}`;

    return (
        <div className={`tour-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`tour-drawer-content ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>

                {/* ── Botón Cerrar ── */}
                <button className="btn-drawer-close" onClick={onClose}>
                    <FaTimes />
                </button>

                {/* ── Cabecera con Imagen ── */}
                <div className="drawer-header-img">
                    <img
                        src={imageUrl}
                        alt={tour.nombre}
                    />
                    <div className="drawer-header-overlay" />
                    <div className="drawer-header-actions">
                        <button 
                            className={`btn-drawer-action ${isFavorite ? 'fav-on' : ''}`} 
                            onClick={() => onToggleFavorite?.(tour.id_tour || tour.id)}
                            title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                        >
                            <FaHeart />
                        </button>
                        <button className="btn-drawer-action"><FaShareAlt /></button>
                    </div>
                </div>

                <div className="drawer-body">
                    {/* ── Título y Básicos ── */}
                    <div className="drawer-main-info">
                        <div className="drawer-category">Tour Destacado</div>
                        <h2 className="drawer-title">{tour.nombre}</h2>
                        <p className="drawer-location">
                            <FaMapMarkerAlt /> {tour.ciudad_destino || tour.ciudad}
                        </p>

                        <div className="drawer-rating-row">
                            <div className="drawer-stars">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < Math.floor(tour.calificacion || 4.5) ? 'star-filled' : 'star-empty'} />
                                ))}
                            </div>
                            <span className="drawer-rating-num">{tour.calificacion || '4.8'}</span>
                            <span className="drawer-resenas">({tour.resenas || '45'} reseñas)</span>
                        </div>
                    </div>

                    {/* ── Quick Specs ── */}
                    <div className="drawer-specs-grid">
                        <div className="spec-item">
                            <FaClock className="spec-icon" />
                            <div><p className="spec-label">Duración</p><p className="spec-val">{tour.duracion || '8 horas'}</p></div>
                        </div>
                        <div className="spec-item">
                            <FaMountain className="spec-icon" />
                            <div><p className="spec-label">Dificultad</p><p className="spec-val">{tour.dificultad || 'Moderada'}</p></div>
                        </div>
                        <div className="spec-item">
                            <FaUsers className="spec-icon" />
                            <div>
                                <p className="spec-label">Capacidad</p>
                                <p className="spec-val">
                                    {tour.maximo_personas ? (
                                        `${(tour.maximo_personas - (tour.cupos_ocupados || 0))} / ${tour.maximo_personas}`
                                    ) : '12'} pax
                                </p>
                            </div>
                        </div>
                        <div className="spec-item">
                            <FaLanguage className="spec-icon" />
                            <div><p className="spec-label">Idiomas</p><p className="spec-val">{idiomasParsed.join(', ')}</p></div>
                        </div>
                    </div>

                    {/* ── Guía Asignado ── */}
                    <div className="drawer-guide-info" style={{ 
                        margin: '1.5rem 0', 
                        padding: '1rem', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div className="guide-avatar-mini" style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            backgroundColor: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.2rem',
                            overflow: 'hidden'
                        }}>
                            {tour.foto_guia ? (
                                <img 
                                    src={tour.foto_guia.startsWith('http') ? tour.foto_guia : `http://localhost:4000${tour.foto_guia}`} 
                                    alt={tour.nombre_guia} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <FaUserCircle style={{ color: 'white' }} />
                            )}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Guía Especialista</p>
                            <p style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: '600' }}>
                                {tour.nombre_guia ? `${tour.nombre_guia} ${tour.apellido_guia || ''}` : 'Por asignar'}
                            </p>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="drawer-tabs">
                        <button
                            className={`drawer-tab ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <FaInfoCircle /> Descripción
                        </button>
                        <button
                            className={`drawer-tab ${activeTab === 'include' ? 'active' : ''}`}
                            onClick={() => setActiveTab('include')}
                        >
                            <FaCheck /> ¿Qué incluye?
                        </button>
                    </div>

                    <div className="drawer-tab-content">
                        {activeTab === 'info' && (
                            <div className="animate-fade-in">
                                <p className="drawer-description">
                                    {tour.descripcion || "Explora los rincones más fascinantes con nuestros guías certificados. Una experiencia diseñada para conectar con la naturaleza y la cultura local en un ambiente seguro y profesional."}
                                </p>
                                <div className="drawer-itinerary">
                                    <h4><FaCalendarAlt /> Puntos de interés</h4>
                                    <ul>
                                        {puntosInteresParsed.length > 0
                                            ? puntosInteresParsed.map((punto, i) => <li key={i}>{punto}</li>)
                                            : (
                                                <>
                                                    <li>Caminata guiada por senderos naturales</li>
                                                    <li>Sesión fotográfica en miradores clave</li>
                                                    <li>Degustación de snacks locales</li>
                                                    <li>Charla informativa sobre biodiversidad</li>
                                                </>
                                            )
                                        }
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'include' && (
                            <div className="animate-fade-in">
                                <div className="include-list">
                                    {(incluyeParsed.length > 0
                                        ? incluyeParsed
                                        : ['Transporte privado', 'Guía bilingüe', 'Almuerzo típico', 'Entradas', 'Seguro de viaje']
                                    ).map((item, idx) => (
                                        <div key={idx} className="include-item">
                                            <FaCheck className="include-check" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer / CTA ── */}
                <div className="drawer-footer">
                    <div className="drawer-price-wrap">
                        <p className="drawer-price-label">Precio por persona</p>
                        <p className="drawer-price-val">${tour.price || tour.precio || '85'}</p>
                    </div>
                    <button className="btn-drawer-reserve" onClick={() => { onReserve?.(tour); onClose(); }}>
                        {tour.isGuideView 
                            ? (tour.id_guia_asignado ? 'Desconfirmar Tour' : 'Confirmar Tour') 
                            : 'Reservar Ahora'}
                        <FaArrowLeft style={{ transform: 'rotate(180deg)', marginLeft: '8px' }} />
                    </button>
                    {tour.estado === 'Completada' && (
                        <button className="btn-drawer-rate" onClick={() => { window.location.href = '/mis-reservas'; }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: '#fcd34d', border: 'none', color: '#92400e', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}>
                            <FaStar /> Calificar Experiencia
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TourDrawer;
