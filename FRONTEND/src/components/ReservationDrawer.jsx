import React, { useState, useEffect } from 'react';
import {
    FaTimes, FaCalendarAlt, FaUsers, FaArrowRight,
    FaCheckCircle, FaMoneyCheckAlt, FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';
import api from '../core/api';
import './ReservationDrawer.css';

const CURRENCY_MAP = {
    'Chile': 'CLP',
    'Inglaterra': 'GBP',
    'Reino Unido': 'GBP',
    'España': 'EUR',
    'Francia': 'EUR',
    'Alemania': 'EUR',
    'Italia': 'EUR',
    'Ecuador': 'USD',
    'Estados Unidos': 'USD',
    'Colombia': 'COP',
    'México': 'MXN',
    'Perú': 'PEN',
    'Argentina': 'ARS',
    'Brasil': 'BRL',
    'Japón': 'JPY',
    'Canadá': 'CAD',
    'Rusia': 'RUB'
};

const CURRENCY_NAMES = {
    'CLP': 'Pesos Chilenos',
    'GBP': 'Libras Esterlinas',
    'EUR': 'Euros',
    'USD': 'Dólares',
    'COP': 'Pesos Colombianos',
    'MXN': 'Pesos Mexicanos',
    'PEN': 'Soles Peruanos',
    'ARS': 'Pesos Argentinos',
    'BRL': 'Reales',
    'JPY': 'Yenes',
    'CAD': 'Dólares Canadienses',
    'RUB': 'Rublos'
};

const ReservationDrawer = ({ tour, isOpen, onClose, onConfirm }) => {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [personas, setPersonas] = useState(1);
    const [comentarios, setComentarios] = useState('');
    const [reservacionesPrevias, setReservacionesPrevias] = useState([]);
    const [yaReservado, setYaReservado] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [loadingCurrency, setLoadingCurrency] = useState(false);

    useEffect(() => {
        if (isOpen && tour) {
            // Cargar reservas previas del usuario para validación
            api.get('/reservas/mis-reservas')
                .then(res => setReservacionesPrevias(res.data))
                .catch(err => console.error("Error cargando reservas previas para validación:", err));
            
            // Lógica de conversión de moneda
            if (tour.pais && CURRENCY_MAP[tour.pais] && CURRENCY_MAP[tour.pais] !== 'USD') {
                const targetCurrency = CURRENCY_MAP[tour.pais];
                setLoadingCurrency(true);
                fetch(`https://open.er-api.com/v6/latest/USD`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.rates && data.rates[targetCurrency]) {
                            setExchangeRate({
                                rate: data.rates[targetCurrency],
                                code: targetCurrency
                            });
                        }
                    })
                    .catch(err => console.error("Error obteniendo tipo de cambio:", err))
                    .finally(() => setLoadingCurrency(false));
            } else {
                setExchangeRate(null);
            }

            // Pre-fill fixed dates if the tour has them
            setFechaInicio(tour.fecha_inicio ? tour.fecha_inicio.split('T')[0] : '');
            setFechaFin(tour.fecha_fin ? tour.fecha_fin.split('T')[0] : '');
            setPersonas(1);
            setComentarios('');
        }
    }, [isOpen, tour]);

    // Validar si el usuario ya reservó este tour en la misma fecha
    useEffect(() => {
        if (tour && reservacionesPrevias.length > 0 && fechaInicio) {
            const dateToCompare = fechaInicio;
            const hasDuplicate = reservacionesPrevias.some(reserva => {
                // Verificar si es el mismo tour o hotel
                const isSameItem = tour.es_hotel ? reserva.id_hotel === tour.id_hotel : reserva.id_tour === tour.id_tour;
                const isSameDate = reserva.fecha_actividad?.split('T')[0] === dateToCompare;
                // Excluir canceladas si manejas ese estado (aquí asumiremos que revisamos activas/pendientes)
                return isSameItem && isSameDate;
            });
            setYaReservado(hasDuplicate);
        } else {
            setYaReservado(false);
        }
    }, [fechaInicio, tour, reservacionesPrevias]);

    if (!tour) return null;

    const total = (Number(tour.precio) || 0) * personas;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            tour,
            fecha: fechaInicio,
            fecha_fin: fechaFin,
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
                        {tour.fecha_inicio && tour.fecha_fin ? (
                            <div className="prefilled-dates-notice">
                                <FaCalendarAlt /> Este tour tiene fechas fijas programadas:
                                <div className="fixed-dates-range">
                                    <strong>{tour.fecha_inicio.split('T')[0]}</strong> al <strong>{tour.fecha_fin.split('T')[0]}</strong>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label><FaCalendarAlt /> {tour.es_hotel ? 'Fecha de Check-in' : 'Fecha de inicio'}</label>
                                    <input
                                        type="date"
                                        required
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><FaCalendarAlt /> {tour.es_hotel ? 'Fecha de Check-out' : 'Fecha de fin (opcional)'}</label>
                                    <input
                                        type="date"
                                        required={tour.es_hotel}
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        min={fechaInicio || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label><FaUsers /> {tour.es_hotel ? 'Número de huéspedes' : 'Número de aventureros'}</label>
                            
                            {!tour.es_hotel && (
                                <div className="capacity-info" style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                                    Capacidad disponible: <strong>{tour.maximo_personas - (tour.cupos_ocupados || 0)} personas</strong>
                                </div>
                            )}

                            <div className="pax-selector">
                                <button type="button" onClick={() => setPersonas(Math.max(1, personas - 1))}>-</button>
                                <span>{personas}</span>
                                <button type="button" onClick={() => {
                                    const available = tour.maximo_personas - (tour.cupos_ocupados || 0);
                                    if (personas < available) {
                                        setPersonas(personas + 1);
                                    }
                                }}>+</button>
                            </div>
                            
                            {!tour.es_hotel && (personas >= (tour.maximo_personas - (tour.cupos_ocupados || 0))) && (
                                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>Límite de capacidad alcanzado</p>
                            )}
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
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span>${total.toFixed(2)}</span>
                                    {exchangeRate && !loadingCurrency && (
                                        <span style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: '500' }}>
                                            ≈ {(total * exchangeRate.rate).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {CURRENCY_NAMES[exchangeRate.code]}
                                        </span>
                                    )}
                                    {loadingCurrency && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Calculando conversión...</span>}
                                </div>
                            </div>
                        </div>

                        <div className="reservation-notice">
                            <FaCheckCircle /> Cancelación gratuita hasta 24h antes.
                        </div>

                        {yaReservado && (
                            <div className="reservation-notice duplicate-notice" style={{ backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' }}>
                                <FaExclamationTriangle /> Ya tienes una reserva activa para esta experiencia en la misma fecha seleccionada. Por favor elige otra fecha o verifica tus reservas.
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn-drawer-next" 
                            disabled={yaReservado || (!tour.es_hotel && (tour.maximo_personas - (tour.cupos_ocupados || 0)) === 0)} 
                            style={{ 
                                opacity: (yaReservado || (!tour.es_hotel && (tour.maximo_personas - (tour.cupos_ocupados || 0)) === 0)) ? 0.5 : 1, 
                                cursor: (yaReservado || (!tour.es_hotel && (tour.maximo_personas - (tour.cupos_ocupados || 0)) === 0)) ? 'not-allowed' : 'pointer' 
                            }}
                        >
                            {(!tour.es_hotel && (tour.maximo_personas - (tour.cupos_ocupados || 0)) === 0) ? 'Tour Lleno' : 'Continuar al Pago'} <FaArrowRight />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReservationDrawer;
