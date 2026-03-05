import React, { useState } from 'react';
import {
    FaTimes,
    FaCheckCircle,
    FaFileInvoiceDollar,
    FaPaypal,
    FaPrint,
    FaEnvelope,
    FaLock
} from 'react-icons/fa';
import api from '../core/api';
import './PaymentDrawer.css';

const PaymentDrawer = ({ reservation, isOpen, onClose, onPaymentSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!reservation) return null;

    const { tour, fecha, personas, total } = reservation;

    const handlePayPalClick = async () => {
        setIsProcessing(true);
        try {
            // Simulación real llamando al backend
            const response = await api.post('/pagos/simulate', {
                id_reserva: reservation.id_reserva,
                monto: reservation.total_pagar,
                metodo_pago: 'PayPal'
            });

            setTimeout(() => {
                setIsProcessing(false);
                setIsSuccess(true);
                setTimeout(() => {
                    onPaymentSuccess(response.data.payment);
                }, 2000);
            }, 1000);
        } catch (error) {
            console.error("Error en pago simulado:", error);
            setIsProcessing(false);
            alert('Error al procesar el pago.');
        }
    };

    return (
        <div className={`tour-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`tour-drawer-content payment-drawer ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>

                {!isSuccess && (
                    <button className="btn-drawer-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                )}

                <div className="drawer-body">
                    {isSuccess ? (
                        <div className="payment-success-view animate-fade-in">
                            <div className="success-icon-wrap">
                                <FaCheckCircle />
                            </div>
                            <p>Tu reserva para <strong>{tour.nombre}</strong> ha sido procesada con éxito.</p>
                            <p className="success-sub">{tour.es_hotel ? 'Tu habitación está lista. ¡Te esperamos!' : 'Prepárate para vivir una experiencia inolvidable.'}</p>
                            <div className="success-actions">
                                <button className="btn-success-action"><FaPrint /> Imprimir Comprobante</button>
                                <button className="btn-success-action"><FaEnvelope /> Enviar al Correo</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="payment-header">
                                <div className="icon-badge-payment"><FaFileInvoiceDollar /></div>
                                <h2>Resumen del Pago</h2>
                                <p>Revisa los detalles antes de proceder con PayPal</p>
                            </div>

                            <div className="invoice-box">
                                <div className="invoice-header">
                                    <span className="invoice-brand">ECRUT Travels</span>
                                    <span className="invoice-date">{new Date().toLocaleDateString()}</span>
                                </div>

                                <div className="invoice-item">
                                    <div className="item-info">
                                        <span className="item-name">{tour.nombre}</span>
                                        <span className="item-sub">{tour.es_hotel ? 'Estancia en Hotel' : 'Tour Destino'} - {fecha}</span>
                                    </div>
                                    <span className="item-price">${Number(tour.precio).toFixed(2)}</span>
                                </div>

                                <div className="invoice-item">
                                    <span className="item-name">{tour.es_hotel ? 'Huéspedes adicionales' : 'Acompañantes'} (x{personas - 1})</span>
                                    <span className="item-price">${(Number(tour.precio) * (personas - 1)).toFixed(2)}</span>
                                </div>

                                <div className="invoice-divider"></div>

                                <div className="invoice-total">
                                    <span>Total a Pagar</span>
                                    <span>${Number(total).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="payment-methods">
                                <p className="method-label">Pagar de forma segura con:</p>

                                <button
                                    className={`btn-paypal ${isProcessing ? 'processing' : ''}`}
                                    onClick={handlePayPalClick}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <>
                                            <FaPaypal /> PayPal
                                        </>
                                    )}
                                </button>

                                <div className="secure-info">
                                    <FaLock /> Pago encriptado y seguro por SSL
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentDrawer;
