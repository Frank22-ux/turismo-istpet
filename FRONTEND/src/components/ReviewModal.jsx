import React, { useState } from 'react';
import { FaTimes, FaStar } from 'react-icons/fa';
import api from '../core/api';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, reservation, onSuccess }) => {
    // Tour Stats
    const [tourRating, setTourRating] = useState(0);
    const [tourHover, setTourHover] = useState(0);
    const [tourComment, setTourComment] = useState('');

    // Guide Stats
    const [guideRating, setGuideRating] = useState(0);
    const [guideHover, setGuideHover] = useState(0);
    const [guideComment, setGuideComment] = useState('');

    // Hotel Stats
    const [hotelRating, setHotelRating] = useState(0);
    const [hotelHover, setHotelHover] = useState(0);
    const [hotelComment, setHotelComment] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !reservation) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (tourRating === 0) {
            setError("Por favor, selecciona una calificación para el tour.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const id_tour = reservation.id_tour || reservation.id;
            const id_guia = reservation.id_guia;

            const promises = [
                api.post('/resenas', {
                    id_tour,
                    calificacion: tourRating,
                    comentario: tourComment,
                    tipo: 'tour'
                })
            ];

            if (id_guia && guideRating > 0) {
                promises.push(
                    api.post('/resenas', {
                        id_guia,
                        calificacion: guideRating,
                        comentario: guideComment,
                        tipo: 'guia'
                    })
                );
            }

            if (reservation.id_hotel && hotelRating > 0) {
                promises.push(
                    api.post('/resenas', {
                        id_hotel: reservation.id_hotel,
                        calificacion: hotelRating,
                        comentario: hotelComment,
                        tipo: 'hotel'
                    })
                );
            }

            await Promise.all(promises);

            setTourRating(0);
            setTourComment('');
            setGuideRating(0);
            setGuideComment('');
            setHotelRating(0);
            setHotelComment('');
            onSuccess();
        } catch (err) {
            console.error("Error al publicar reseña:", err);
            setError(err.response?.data?.message || "Ocurrió un error al enviar tu reseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="review-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
                <h2>Califica tu Experiencia</h2>
                
                {error && <div className="review-error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* SECTION 1: TOUR */}
                    <div className="review-section">
                        <h3>¿Qué tal te pareció el Tour?</h3>
                        <p className="review-target-name">{reservation.tour}</p>
                        <div className="star-rating-selector">
                            {[...Array(5)].map((_, index) => {
                                const val = index + 1;
                                return (
                                    <button
                                        type="button"
                                        key={val}
                                        className={val <= (tourHover || tourRating) ? "star-btn on" : "star-btn off"}
                                        onClick={() => setTourRating(val)}
                                        onMouseEnter={() => setTourHover(val)}
                                        onMouseLeave={() => setTourHover(tourRating)}
                                    >
                                        <FaStar />
                                    </button>
                                );
                            })}
                        </div>
                        <textarea
                            placeholder="Comentario sobre el tour (opcional)"
                            value={tourComment}
                            onChange={(e) => setTourComment(e.target.value)}
                            rows={3}
                        ></textarea>
                    </div>

                    {/* SECTION 2: GUIDE (Only if assigned) */}
                    {reservation.id_guia && (
                        <div className="review-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <h3>¿Qué tal fue tu Guía?</h3>
                            <p className="review-target-name">{reservation.nombre_guia} {reservation.apellido_guia}</p>
                            <div className="star-rating-selector">
                                {[...Array(5)].map((_, index) => {
                                    const val = index + 1;
                                    return (
                                        <button
                                            type="button"
                                            key={val}
                                            className={val <= (guideHover || guideRating) ? "star-btn on" : "star-btn off"}
                                            onClick={() => setGuideRating(val)}
                                            onMouseEnter={() => setGuideHover(val)}
                                            onMouseLeave={() => setGuideHover(guideRating)}
                                        >
                                            <FaStar />
                                        </button>
                                    );
                                })}
                            </div>
                            <textarea
                                placeholder="Comentario sobre el guía (opcional)"
                                value={guideComment}
                                onChange={(e) => setGuideComment(e.target.value)}
                                rows={3}
                            ></textarea>
                        </div>
                    )}
                    {/* SECTION 3: HOTEL (Only if associated) */}
                    {reservation.id_hotel && (
                        <div className="review-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <h3>¿Qué tal estuvo tu Hotel?</h3>
                            <p className="review-target-name">{reservation.hotel_nombre || 'Hotel Asociado'}</p>
                            <div className="star-rating-selector">
                                {[...Array(5)].map((_, index) => {
                                    const val = index + 1;
                                    return (
                                        <button
                                            type="button"
                                            key={val}
                                            className={val <= (hotelHover || hotelRating) ? "star-btn on" : "star-btn off"}
                                            onClick={() => setHotelRating(val)}
                                            onMouseEnter={() => setHotelHover(val)}
                                            onMouseLeave={() => setHotelHover(hotelRating)}
                                        >
                                            <FaStar />
                                        </button>
                                    );
                                })}
                            </div>
                            <textarea
                                placeholder="Comentario sobre el hotel (opcional)"
                                value={hotelComment}
                                onChange={(e) => setHotelComment(e.target.value)}
                                rows={3}
                            ></textarea>
                        </div>
                    )}
                    <button type="submit" className="review-submit-btn" disabled={loading} style={{ marginTop: '20px' }}>
                        {loading ? 'Enviando...' : 'Publicar Reseñas'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
