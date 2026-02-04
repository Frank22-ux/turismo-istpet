import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PayPalButtons } from "@paypal/react-paypal-js"; 
import { 
    FaUsers, FaCreditCard, FaArrowLeft, 
    FaInfoCircle, FaPlus, FaMinus, FaBaby, FaStar, FaExclamationTriangle
} from 'react-icons/fa';
import './ReservaTour.css';

const API_URL = 'http://localhost:4000';

const ReservarTour = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [adultos, setAdultos] = useState(1);
    const [ninos, setNinos] = useState(0);
    const [especiales, setEspeciales] = useState(0);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/tours/${id}`);
                setTour(res.data);
            } catch (error) {
                console.error("Error al cargar el tour:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [id]);

    const precioTotal = useMemo(() => {
        if (!tour) return 0;
        const pAdulto = parseFloat(tour.precio) || 0;
        const pNino = parseFloat(tour.precio_nino) || 0;
        const pEspecial = parseFloat(tour.precio_especial) || 0;

        return (adultos * pAdulto) + (ninos * pNino) + (especiales * pEspecial);
    }, [tour, adultos, ninos, especiales]);

    const totalPersonas = adultos + ninos + especiales;

    // --- FUNCIÓN CORREGIDA ---
    const finalizarReserva = async (detallesPayPal) => {
        setEnviando(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Sesión expirada. Por favor, inicia sesión de nuevo.");
                navigate('/login');
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // 1. Validar fecha (Evita el error NOT NULL en SQL)
            // Si el tour no tiene fecha_inicio, usamos la fecha de hoy como fallback
            const fechaValida = tour.fecha_inicio || new Date().toISOString().split('T')[0];

            // 2. Mapeo exacto para el Backend (SQL espera estos nombres)
            const datosReserva = {
                id_tour: parseInt(id),
                fecha_actividad: fechaValida, 
                cant_adultos: parseInt(adultos),
                cant_ninos: parseInt(ninos),
                cant_especial: parseInt(especiales),
                total: parseFloat(precioTotal.toFixed(2)),
                referencia_transaccion: detallesPayPal.id,
                estado_paypal: detallesPayPal.status || 'COMPLETED'
            };

            const response = await axios.post(`${API_URL}/api/reservas`, datosReserva, config);
            
            if (response.status === 201 || response.status === 200) {
                navigate(`/pago-correcto?paymentId=${detallesPayPal.id}`);
            }
        } catch (error) {
            console.error("Error detallado:", error.response?.data || error.message);
            
            // Extraer el mensaje de error del backend si existe
            const serverMsg = error.response?.data?.error || error.response?.data?.message || "Error de conexión";
            
            alert(`¡AVISO IMPORTANTE!
            PayPal procesó el pago (ID: ${detallesPayPal.id}), pero el sistema no pudo guardar la reserva.
            Error: ${serverMsg}.
            Por favor, contacta a soporte con tu ID de transacción.`);
        } finally {
            setEnviando(false);
        }
    };

    if (loading) return <div className="loading-screen">Preparando tu aventura...</div>;
    if (!tour) return <div className="error-screen">El tour no está disponible.</div>;

    return (
        <div className="reserva-container">
            <button className="btn-back" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Volver
            </button>

            <div className="reserva-card">
                <div className="reserva-header">
                    <img 
                        src={tour.imagen_portada ? `${API_URL}${tour.imagen_portada}` : '/default-tour.jpg'} 
                        alt={tour.nombre} 
                    />
                    <div className="reserva-title">
                        <h2>{tour.nombre}</h2>
                        <span><FaInfoCircle /> {tour.ciudad_destino || 'Destino por confirmar'}</span>
                    </div>
                </div>

                <div className="reserva-body">
                    <h3 className="section-title">¿Quiénes viajan?</h3>
                    
                    <div className="passenger-selector">
                        <div className="selector-info">
                            <span className="label"><FaUsers /> Adultos</span>
                            <span className="price-hint">${Number(tour.precio).toFixed(2)} c/u</span>
                        </div>
                        <div className="counter-controls">
                            <button onClick={() => setAdultos(Math.max(1, adultos - 1))}><FaMinus /></button>
                            <span>{adultos}</span>
                            <button onClick={() => setAdultos(adultos + 1)}><FaPlus /></button>
                        </div>
                    </div>

                    <div className="passenger-selector">
                        <div className="selector-info">
                            <span className="label"><FaBaby /> Niños</span>
                            <span className="price-hint">${Number(tour.precio_nino).toFixed(2)} c/u</span>
                        </div>
                        <div className="counter-controls">
                            <button onClick={() => setNinos(Math.max(0, ninos - 1))}><FaMinus /></button>
                            <span>{ninos}</span>
                            <button onClick={() => setNinos(ninos + 1)}><FaPlus /></button>
                        </div>
                    </div>

                    <div className="passenger-selector special-row">
                        <div className="selector-info">
                            <span className="label"><FaStar /> Tarifa Especial</span>
                            <span className="price-hint">${Number(tour.precio_especial).toFixed(2)} c/u</span>
                        </div>
                        <div className="counter-controls">
                            <button onClick={() => setEspeciales(Math.max(0, especiales - 1))}><FaMinus /></button>
                            <span>{especiales}</span>
                            <button onClick={() => setEspeciales(especiales + 1)}><FaPlus /></button>
                        </div>
                    </div>

                    {especiales > 0 && (
                        <div className="alerta-documento">
                            <FaExclamationTriangle className="icon-warning" />
                            <div>
                                <strong>Atención:</strong> Se requiere presentar cédula o documento original.
                            </div>
                        </div>
                    )}

                    <div className="resumen-pago">
                        <div className="fila-resumen">
                            <span>Total Pasajeros:</span>
                            <span>{totalPersonas}</span>
                        </div>
                        <div className="fila-resumen total">
                            <span>Total a pagar:</span>
                            <span>${precioTotal.toFixed(2)} MXN</span>
                        </div>
                    </div>

                    <div className="paypal-section">
                        {enviando ? (
                            <div className="procesando-pago">
                                <div className="spinner"></div>
                                Finalizando tu reserva...
                            </div>
                        ) : (
                            <PayPalButtons 
                                key={precioTotal.toFixed(2)} 
                                fundingSource="paypal" 
                                style={{ layout: "vertical", color: "gold", shape: "rect" }}
                                createOrder={(data, actions) => {
                                    return actions.order.create({
                                        purchase_units: [{
                                            description: `Reserva Tour: ${tour.nombre}`,
                                            amount: { 
                                                currency_code: "USD", 
                                                value: precioTotal.toFixed(2) 
                                            }
                                        }]
                                    });
                                }}
                                onApprove={async (data, actions) => {
                                    const order = await actions.order.capture();
                                    await finalizarReserva(order);
                                }}
                                onError={(err) => {
                                    console.error("PayPal Error:", err);
                                    alert("Hubo un problema con la plataforma de pago.");
                                }}
                            />
                        )}
                    </div>
                    
                    <p className="pago-nota">
                        <FaCreditCard /> Transacción encriptada y segura.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReservarTour;