import React, { useState } from 'react';
import {
    FaTimes, FaTag, FaClock, FaFire,
    FaArrowRight, FaCalendarCheck, FaMountain, FaUsers,
    FaLanguage, FaCheck, FaInfoCircle, FaCalendarAlt
} from 'react-icons/fa';
import './OfferDrawer.css';

const OfferDrawer = ({ tour, isOpen, onClose, onReserveOffer }) => {
    const [activeTab, setActiveTab] = useState('info');
    if (!tour) return null;

    // Asegurarse de que el precio sea un número (puede venir como string desde la base de datos)
    const originalPrice = Number(tour.precio) || 100;
    const discountedPrice = originalPrice * 0.8;

    return (
        <div className={`tour-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`tour-drawer-content offer-drawer ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>

                <button className="btn-drawer-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="drawer-body">
                    <div className="offer-badge-floating">
                        <FaFire /> 20% OFF
                    </div>

                    <div className="offer-header">
                        <div className="icon-badge-offer"><FaTag /></div>
                        <h2>¡Oferta Exclusiva!</h2>
                        <p>Reserva hoy y obtén un precio especial por tiempo limitado en:</p>
                        <h3 className="offer-tour-name">{tour.nombre}</h3>
                    </div>

                    <div className="offer-card-visual">
                        <img
                            src={tour.imagen_portada || tour.imagen || 'https://images.unsplash.com/photo-1551854304-25049c10e254?w=500&q=75'}
                            alt={tour.nombre}
                        />
                        <div className="offer-visual-overlay">
                            <div className="offer-timer">
                                <FaClock /> Oferta termina en: <strong>05:42:10</strong>
                            </div>
                        </div>
                    </div>

                    <div className="offer-pricing-section">
                        <div className="pricing-labels">
                            <span className="price-old">${originalPrice.toFixed(2)}</span>
                            <span className="price-new">${discountedPrice.toFixed(2)}</span>
                        </div>
                        <p className="pricing-note">*Precio por persona. Incluye todos los beneficios del tour estándar.</p>
                    </div>

                    {/* ── Quick Specs (Added for consistency) ── */}
                    <div className="drawer-specs-grid offer-specs">
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
                            <div><p className="spec-label">Capacidad</p><p className="spec-val">{tour.maximo_personas || '12'} pax</p></div>
                        </div>
                        <div className="spec-item">
                            <FaLanguage className="spec-icon" />
                            <div><p className="spec-label">Idiomas</p><p className="spec-val">{tour.idiomas?.join(', ') || 'Español, Inglés'}</p></div>
                        </div>
                    </div>

                    {/* ── Tabs (Added for consistency) ── */}
                    <div className="drawer-tabs offer-tabs">
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
                                        {(tour.puntos_interes && tour.puntos_interes.length > 0)
                                            ? tour.puntos_interes.map((punto, i) => <li key={i}>{punto}</li>)
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
                                    {(tour.incluye && tour.incluye.length > 0
                                        ? tour.incluye
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

                    <div className="offer-features">
                        <div className="feature-chip"><FaCalendarCheck /> Flexibilidad de fechas</div>
                        <div className="feature-chip"><FaArrowRight /> Reserva inmediata</div>
                    </div>

                    <div className="offer-actions">
                        <button className="btn-claim-offer" onClick={() => onReserveOffer({ ...tour, precio: discountedPrice })}>
                            Aprovechar Oferta Ahora <FaArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferDrawer;
