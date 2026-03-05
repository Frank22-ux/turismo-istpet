import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { FaTimes, FaDownload, FaPrint, FaShareAlt, FaCheckCircle, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaUserCircle, FaQrcode } from 'react-icons/fa';
import './VoucherDrawer.css';

const VoucherDrawer = ({ isOpen, onClose, reservation }) => {
    const voucherRef = useRef();

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
                                    <FaQrcode className="qr-icon" />
                                    <span className="qr-id">{reservation.id_reserva || 'ID-RESERVA'}</span>
                                </div>
                                <div className="total-box">
                                    <span className="item-label">Total Pagado</span>
                                    <span className="item-value-total">${reservation.total_pagar || reservation.total}</span>
                                </div>
                            </div>
                        </div>

                        <div className="ticket-footer">
                            <div className="guia-mini-info">
                                <FaUserCircle />
                                <div>
                                    <span className="item-label">Guía Asignado</span>
                                    <span className="item-value">{reservation.guia || 'Daniel Mendoza'}</span>
                                </div>
                            </div>
                            <div className="footer-note">
                                * ID de Transacción: <span>{reservation.referencia_txn || `TXN-${Math.floor(Math.random() * 1000000)}`}</span>
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
                        <p>Si tienes problemas con tu reserva, contáctanos a soporte@ecrut.ec o llámanos al +593 99 XXX XXXX</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherDrawer;
