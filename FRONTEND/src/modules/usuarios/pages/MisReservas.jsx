import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaTrashAlt, FaInfoCircle } from 'react-icons/fa';
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

      const res = await fetch(`${API_URL}/reservas/mis-reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error cargando reservas');

      const data = await res.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Deseas cancelar esta reserva?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cancelar la reserva');
      // Quitar de la lista local
      setReservas(prev => prev.filter(r => r.id_reserva !== id));
    } catch (err) {
      console.error(err);
      alert('No se pudo cancelar la reserva. Intenta nuevamente.');
    }
  };

  if (loading) return (
    <div className="mis-reservas-loading">
      <FaInfoCircle className="spin-icon" /> Cargando tus reservas...
    </div>
  );

  return (
    <div className="mis-reservas-page">
      <header className="mr-header">
        <h2>Mis Reservas</h2>
        <p className="mr-sub">Aquí verás las reservas realizadas con tu cuenta</p>
      </header>

      {reservas.length === 0 ? (
        <div className="mr-empty">
          <p>No tienes reservas por el momento.</p>
          <button onClick={() => navigate('/home')} className="btn-back-home">
            Volver a explorar
          </button>
        </div>
      ) : (
        <div className="mr-list">
          {reservas.map(reserva => (
            <div key={reserva.id_reserva} className="mr-card">
              <div className="mr-left">
                <h3 className="mr-tour-name">
                  {reserva.titulo || reserva.nombre_tour || 'Tour'}
                </h3>
                <p className="mr-info">
                  <FaCalendarAlt /> 
                  {new Date(reserva.fecha_reserva).toLocaleDateString()} 
                  • {reserva.cantidad || 1} pax
                </p>
              </div>
              <div className="mr-right">
                <button 
                  className="mr-btn-details" 
                  onClick={() => navigate(`/tour/${reserva.id_tour}`)}
                  aria-label="Ver detalles del tour"
                >
                  Detalles
                </button>
                <button 
                  className="mr-btn-cancel" 
                  onClick={() => handleCancel(reserva.id_reserva)}
                  aria-label="Cancelar reserva"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisReservas;
