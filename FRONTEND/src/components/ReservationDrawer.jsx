import React, { useState } from 'react';
import {
    FaTimes, FaCalendarAlt, FaUsers, FaArrowRight,
    FaCheckCircle, FaMoneyCheckAlt, FaInfoCircle
} from 'react-icons/fa';
import './ReservationDrawer.css';

const ReservationDrawer = ({ tour, isOpen, onClose, onConfirm }) => {
    const [fecha, setFecha] = useState('');
    const [personas, setPersonas] = useState(1);
    const [comentarios, setComentarios] = useState('');

    if (!tour) return null;

    const total = (Number(tour.precio) || 0) * personas;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            tour,
            fecha,
            personas,
            comentarios,
            total
        });
    };

    return (
        <div className={`tour-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`tour-drawer-content reservation-drawer ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>

                <button className="btn-drawer-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="drawer-body">
                    <div className="reservation-header">
                        <div className="icon-badge">{tour.es_hotel ? <FaInfoCircle /> : <FaCalendarAlt />}</div>
                        <h2>{tour.es_hotel ? 'Reservar Estancia' : 'Reservar Experiencia'}</h2>
                        <p>{tour.es_hotel ? 'Reserva tu habitación en' : 'Estás a un paso de comenzar tu aventura en'} <strong>{tour.nombre}</strong></p>
                    </div>

                    <form className="reservation-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><FaCalendarAlt /> {tour.es_hotel ? 'Fecha de Check-in' : 'Selecciona la fecha'}</label>
                            <input
                                type="date"
                                required
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label><FaUsers /> {tour.es_hotel ? 'Número de huéspedes' : 'Número de aventureros'}</label>
                            <div className="pax-selector">
                                <button type="button" onClick={() => setPersonas(Math.max(1, personas - 1))}>-</button>
                                <span>{personas}</span>
                                <button type="button" onClick={() => setPersonas(Math.min(tour.maximo_personas || 20, personas + 1))}>+</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FaInfoCircle /> ¿Algún requerimiento especial?</label>
                            <textarea
                                placeholder="Ej: alergias, equipo extra, etc."
                                value={comentarios}
                                onChange={(e) => setComentarios(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="reservation-summary">
                            <div className="summary-row">
                                <span>{tour.es_hotel ? 'Precio por noche' : 'Precio por persona'}</span>
                                <span>${tour.precio}</span>
                            </div>
                            <div className="summary-row">
                                <span>{tour.es_hotel ? 'Huéspedes' : 'Visitantes'}</span>
                                <span>x {personas}</span>
                            </div>
                            <div className="summary-total">
                                <span>Total a pagar</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="reservation-notice">
                            <FaCheckCircle /> Cancelación gratuita hasta 24h antes.
                        </div>

                        <button type="submit" className="btn-drawer-next">
                            Continuar al Pago <FaArrowRight />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReservationDrawer;
