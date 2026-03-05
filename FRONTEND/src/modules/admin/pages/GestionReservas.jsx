import { useState, useEffect } from 'react';
import api from '../../../core/api';
import {
  FaSearch,
  FaCheck,
  FaTimes,
  FaFileInvoiceDollar,
  FaFilter,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminLayout from '../layouts/AdminLayout';
import './GestionReservas.css';

const GestionReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/reservas');
        // Traducir campos si es necesario (ej: estado_pago -> estadoPago)
        const mappedData = data.map(r => ({
          ...r,
          estadoPago: r.estado_pago || 'Pendiente'
        }));
        setReservas(mappedData);
      } catch (error) {
        console.error("Error al cargar reservas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservas();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');

  const filteredReservas = reservas.filter(res => {
    const matchesSearch = res.turista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === 'Todos' || res.estadoPago === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const handleApprovePayment = (id) => {
    Swal.fire({
      title: '¿Confirmar Pago?',
      text: "Se registrará el pago para esta reserva de forma permanente.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'modern-swal-popup' }
    }).then((result) => {
      if (result.isConfirmed) {
        setReservas(reservas.map(res =>
          res.id === id ? { ...res, estadoPago: 'Pagado' } : res
        ));
        Swal.fire({
          title: '¡Pago Confirmado!',
          text: 'El estado de la reserva ha sido actualizado a Pagado.',
          icon: 'success',
          confirmButtonColor: '#2ecc71'
        });
      }
    });
  };

  const handleCancelReservation = (id) => {
    Swal.fire({
      title: '¿Cancelar Reserva?',
      text: "¡Esta acción cambiará el estado de la reserva a Cancelado!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
      customClass: { popup: 'modern-swal-popup' }
    }).then((result) => {
      if (result.isConfirmed) {
        setReservas(reservas.map(res =>
          res.id === id ? { ...res, estadoPago: 'Cancelado' } : res
        ));
        Swal.fire({
          title: '¡Cancelada!',
          text: 'La reserva ha sido cancelada exitosamente.',
          icon: 'success',
          confirmButtonColor: '#2ecc71'
        });
      }
    });
  };

  const totalIngresos = reservas
    .filter(r => r.estadoPago === 'Pagado')
    .reduce((acc, r) => acc + r.total, 0);
  const pendientes = reservas.filter(r => r.estadoPago === 'Pendiente').length;
  const totalReservas = reservas.length;

  const content = (
    <div className="reservas-modern-wrapper">
      <div className="reservas-header-section">
        <div className="header-top">
          <div>
            <h1 className="page-title">📋 Reservas y Pagos</h1>
            <p className="page-subtitle">Gestiona las transacciones y valida pagos</p>
          </div>
        </div>

        <div className="quick-stats">
          <div className="quick-stat-card primary">
            <span className="stat-number">${Number(totalIngresos || 0).toFixed(2)}</span>
            <span className="stat-label">Ingresos Confirmados</span>
          </div>
          <div className="quick-stat-card warning">
            <span className="stat-number">{pendientes}</span>
            <span className="stat-label">Pagos Pendientes</span>
          </div>
          <div className="quick-stat-card info">
            <span className="stat-number">{totalReservas}</span>
            <span className="stat-label">Total Reservas</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box-modern">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por ID o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
          <option value="Todos">Todos los estados</option>
          <option value="Pagado">Pagados</option>
          <option value="Pendiente">Pendientes</option>
          <option value="Cancelado">Cancelados</option>
        </select>
        <button className="btn-secondary">
          <FaDownload /> Exportar
        </button>
      </div>

      <div className="table-card-modern">
        <table className="modern-table-reservas">
          <thead>
            <tr>
              <th>ID</th>
              <th>Turista</th>
              <th>Tour</th>
              <th>Fecha</th>
              <th>Pax</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>⏳ Cargando reservas...</td></tr>
            ) : filteredReservas.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No se encontraron reservas.</td></tr>
            ) : (
              filteredReservas.map((res) => (
                <tr key={res.id}>
                  <td className="font-bold">{res.id}</td>
                  <td>
                    <div className="customer-cell">
                      <img
                        src={`https://ui-avatars.com/api/?name=${res.turista}&background=random`}
                        alt={res.turista}
                      />
                      <span>{res.turista}</span>
                    </div>
                  </td>
                  <td>{res.tour}</td>
                  <td>{res.fecha}</td>
                  <td className="text-center">{res.pax}</td>
                  <td className="font-bold price">${Number(res.total || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge badge-${res.estadoPago.toLowerCase()}`}>
                      {res.estadoPago}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell-solid">
                      {res.estadoPago === 'Pendiente' && (
                        <button
                          className="btn-action-solid btn-approve"
                          onClick={() => handleApprovePayment(res.id)}
                        >
                          <FaCheck /> Aprobar
                        </button>
                      )}
                      {res.estadoPago !== 'Cancelado' && (
                        <button
                          className="btn-action-solid btn-cancel"
                          onClick={() => handleCancelReservation(res.id)}
                        >
                          <FaTimes /> Cancelar
                        </button>
                      )}
                      <button className="btn-action-solid btn-details">
                        <FaEye /> Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
};

export default GestionReservas;
