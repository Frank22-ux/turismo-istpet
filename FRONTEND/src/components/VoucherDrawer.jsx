import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { FaTimes, FaDownload, FaPrint, FaShareAlt, FaCheckCircle, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaUserCircle, FaQrcode } from 'react-icons/fa';
import './VoucherDrawer.css';

const VoucherDrawer = ({ isOpen, onClose, reservation }) => {
    const voucherRef = useRef();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!reservation) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        const element = voucherRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Voucher-${reservation.id || 'reserva'}.pdf`);
    };

    return (
        <div className={`voucher-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`voucher-drawer-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <header className="voucher-header">
                    <div className="header-main">
                        <FaDownload className="header-icon" />
                        <h2>Tu Voucher de Viaje</h2>
                    </div>
                    <button className="btn-close-voucher" onClick={onClose}>
                        <FaTimes />
                    </button>
                    <p className="voucher-subtitle">Presenta este documento al guía el día del tour</p>
                </header>

                <div className="voucher-body">
                    {/* TICKET SECTION */}
                    <div className="premium-ticket" ref={voucherRef}>
                        <div className="ticket-top">
                            <div className="ticket-logo">
                                <img src="/uploads/logo.png" alt="ECRUT" />
                                <span>ECRUT Travels</span>
                            </div>
                            <div className="ticket-status">
                                <FaCheckCircle /> Confirmado
                            </div>
                        </div>

                        <div className="ticket-main">
                            <div className="ticket-left">
                                <div className="tour-name-section">
                                    <span className="small-label">Tour Reservado</span>
                                    <h3>{reservation.tour || 'Servicio Turístico'}</h3>
                                </div>
                                <div className="ticket-grid">
                                    <div className="ticket-item">
                                        <FaMapMarkerAlt />
                                        <div>
                                            <span className="item-label">Destino</span>
                                            <span className="item-value">{reservation.ciudad || 'Por confirmar'}</span>
                                        </div>
                                    </div>
                                    <div className="ticket-item">
                                        <FaCalendarAlt />
                                        <div>
                                            <span className="item-label">Fecha</span>
                                            <span className="item-value">{reservation.fecha ? new Date(reservation.fecha).toLocaleDateString() : 'Pendiente'}</span>
                                        </div>
                                    </div>
                                    <div className="ticket-item">
                                        <FaClock />
                                        <div>
                                            <span className="item-label">Horario</span>
                                            <span className="item-value">{reservation.hora || '08:00 AM'} · {reservation.duracion || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="ticket-item">
                                        <FaUsers />
                                        <div>
                                            <span className="item-label">Pasajeros</span>
                                            <span className="item-value">{reservation.personas || 1} Persona(s)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="ticket-divider">
                                <div className="circle top" />
                                <div className="line" />
                                <div className="circle bottom" />
                            </div>

                            <div className="ticket-right">
                                <div className="qr-box">
                                    <img 
                                        src={`https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(`Reserva:${reservation.id_reserva || reservation.id}|Turista:${user.username || 'Usuario'}`)}&chs=120x120&choe=UTF-8&chld=L|2`} 
                                        alt="QR Code" 
                                        className="real-qr-code" 
                                        style={{ width: '100px', height: '100px' }}
                                    />
                                    <span className="qr-id">ID-{reservation.id_reserva || reservation.id}</span>
                                </div>
                                <div className="total-box">
                                    <span className="item-label">Total Pagado</span>
                                    <span className="item-value-total">${reservation.total_pagar || reservation.total}</span>
                                </div>
                            </div>
                        </div>

                        <div className="ticket-footer">
                            <div className="guia-mini-info">
                                {reservation.foto_guia ? (
                                    <img src={`http://localhost:4000${reservation.foto_guia}`} alt="Guía" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <FaUserCircle />
                                )}
                                <div>
                                    <span className="item-label">Guía Asignado</span>
                                    <span className="item-value">
                                        {reservation.nombre_guia 
                                            ? `${reservation.nombre_guia} ${reservation.apellido_guia || ''}` 
                                            : (reservation.guia || 'Por asignar')}
                                    </span>
                                </div>
                            </div>
                            <div className="footer-note">
                                * ID de Transacción: <span>{reservation.referencia_txn || `TXN-${String(reservation.id || '0').padStart(6, '0')}`}</span>
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="voucher-actions">
                        <button className="btn-v-action secondary" onClick={handlePrint}>
                            <FaPrint /> Imprimir PDF
                        </button>
                        <button className="btn-v-action primary" onClick={handleDownload}>
                            <FaDownload /> Descargar Voucher
                        </button>
                        <button className="btn-v-action ghost">
                            <FaShareAlt /> Compartir
                        </button>
                    </div>

                    <div className="voucher-help">
                        <h4>¿Necesitas ayuda?</h4>
                        <p>Si tienes problemas con tu reserva, contáctanos a soporte@ecrut.ec o llámanos al +593 97 879 9437</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherDrawer;
