import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaTrashAlt, FaMapMarkerAlt, FaTicketAlt, FaFilePdf, FaEye } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './MisReservas.css';

const API_URL = 'http://localhost:4000';

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_URL}/api/reservas/mis-reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error cargando reservas');

      const data = await res.json();
      setReservas(data.ok ? data.reservas : []);
    } catch (err) {
      console.error("Error en cargarReservas:", err);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN PARA GENERAR Y DESCARGAR EL PDF ---
  const descargarComprobante = (reserva) => {
    try {
      const doc = new jsPDF();
      
      // Encabezado Azul
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("COMPROBANTE DE PAGO", 105, 25, { align: 'center' });
      
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.text(`Fecha de emisión: ${new Date().toLocaleString()}`, 140, 50);

      // Datos de la Reserva
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Detalles de la Experiencia", 20, 65);
      
      doc.autoTable({
        startY: 70,
        head: [['Descripción', 'Información']],
        body: [
          ['ID Reserva', `#${reserva.id_reserva}`],
          ['Tour Reservado', reserva.nombre_tour],
          ['Destino', reserva.ciudad_destino || 'Varios'],
          ['Fecha de Actividad', new Date(reserva.fecha_actividad).toLocaleDateString()],
          ['Pasajeros', `Adultos: ${reserva.cant_adultos} | Niños: ${reserva.cant_ninos}`],
          ['Método de Pago', 'PayPal (Verificado)'],
          // CAMBIO A USD AQUÍ
          ['Total Pagado', `$${reserva.total} USD`] 
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        styles: { fontSize: 11, cellPadding: 5 }
      });

      // Pie de página
      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`Total: $${reserva.total} USD`, 150, finalY + 15);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text("¡Gracias por elegir TravelExplor!", 105, finalY + 30, { align: 'center' });

      // Ejecuta la descarga
      doc.save(`Ticket_Reserva_${reserva.id_reserva}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("No se pudo generar el ticket en este momento.");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Deseas cancelar esta reserva?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cancelar');
      setReservas(prev => prev.filter(r => r.id_reserva !== id));
    } catch (err) {
      alert('Error al intentar cancelar la reserva.');
    }
  };

  if (loading) return (
    <div className="mr-loading-container">
      <div className="mr-spinner"></div>
      <p>Cargando tus aventuras...</p>
    </div>
  );

  return (
    <div className="mr-container">
      <div className="mr-header-section">
        <h1>Mis Aventuras Reservadas</h1>
        <div className="mr-divider"></div>
      </div>

      {reservas.length === 0 ? (
        <div className="mr-empty-state">
          <FaTicketAlt size={80} />
          <h3>Aún no tienes viajes</h3>
          <p>Tus tours reservados aparecerán aquí.</p>
          <button onClick={() => navigate('/home')} className="mr-btn-primary">
            Explorar Tours
          </button>
        </div>
      ) : (
        <div className="mr-grid">
          {reservas.map(reserva => (
            <div key={reserva.id_reserva} className="mr-card-new">
              <div className="mr-card-header">
                <img 
                  src={reserva.imagen_portada ? `${API_URL}${reserva.imagen_portada}` : '/default-tour.jpg'} 
                  alt={reserva.nombre_tour} 
                />
                <div className="mr-badge-status">{reserva.estado_reserva || 'Confirmada'}</div>
              </div>

              <div className="mr-card-body">
                <h3 className="mr-card-title">{reserva.nombre_tour}</h3>
                
                <div className="mr-card-info">
                  <p><FaMapMarkerAlt /> {reserva.ciudad_destino || 'Destino por confirmar'}</p>
                  <p><FaCalendarAlt /> {new Date(reserva.fecha_actividad).toLocaleDateString()}</p>
                </div>

                <div className="mr-card-price">
                  <span>Total Pagado:</span>
                  {/* CAMBIO A USD AQUÍ */}
                  <strong>${reserva.total} USD</strong> 
                </div>

                <div className="mr-card-footer">
                  <button 
                    className="mr-btn-pdf-action" 
                    onClick={() => descargarComprobante(reserva)}
                    type="button"
                  >
                    <FaFilePdf /> Ticket
                  </button>
                  
                  <button 
                    className="mr-btn-view" 
                    onClick={() => navigate(`/tour/${reserva.id_tour}`)}
                  >
                    <FaEye />
                  </button>

                  <button 
                    className="mr-btn-delete" 
                    onClick={() => handleCancel(reserva.id_reserva)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisReservas;