import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaCalendarAlt, FaTicketAlt, FaArrowRight } from 'react-icons/fa';
import './PagoCorrecto.css';

const PagoCorrecto = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Capturamos datos de la URL (PayPal suele enviar estos o tú los defines en el retorno)
    const paymentId = searchParams.get('paymentId');
    const token = searchParams.get('token');
    const payerId = searchParams.get('PayerID');

    useEffect(() => {
        // Aquí podrías hacer una llamada a tu backend para confirmar que el pago
        // realmente se completó antes de mostrar el éxito total.
        const confirmarPago = async () => {
            try {
                // Simulación de verificación o delay de carga
                setTimeout(() => setLoading(false), 1500);
            } catch (error) {
                console.error("Error confirmando pago:", error);
                setLoading(false);
            }
        };

        confirmarPago();
    }, [paymentId]);

    if (loading) {
        return (
            <div className="pago-status-container">
                <div className="spinner"></div>
                <p>Verificando transacción con PayPal...</p>
            </div>
        );
    }

    return (
        <div className="pago-exito-wrapper">
            <div className="pago-card">
                <div className="icon-header">
                    <FaCheckCircle className="check-icon" />
                </div>
                
                <h1>¡Pago Confirmado!</h1>
                <p className="subtitle">Tu reserva se ha procesado con éxito.</p>

                <div className="pago-detalles">
                    <div className="detalle-fila">
                        <span>ID de Transacción:</span>
                        <strong>{paymentId || 'N/A'}</strong>
                    </div>
                    <div className="detalle-fila">
                        <span>Método de Pago:</span>
                        <strong>PayPal</strong>
                    </div>
                    <div className="detalle-fila">
                        <span>Estado:</span>
                        <span className="badge-success">Completado</span>
                    </div>
                </div>

                <div className="pago-acciones">
                    <button 
                        className="btn-primario" 
                        onClick={() => navigate('/mis-reservas')}
                    >
                        Ver mis reservas <FaTicketAlt />
                    </button>
                    
                    <Link to="/tours" className="link-volver">
                        Seguir explorando tours <FaArrowRight />
                    </Link>
                </div>

                <div className="pago-footer">
                    <p>Se ha enviado un comprobante a tu correo electrónico.</p>
                </div>
            </div>
        </div>
    );
};

export default PagoCorrecto;