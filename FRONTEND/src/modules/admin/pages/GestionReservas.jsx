import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaSearch, FaArrowLeft, FaCheck, FaTimes, FaEye, FaFileInvoiceDollar } from 'react-icons/fa';
import './GestionReservas.css';

const GestionReservas = () => {
  // DATOS MOCK
  const [reservas, setReservas] = useState([
    { 
        id: 'RES-001', 
        turista: 'Carlos Andrés', 
        tour: 'Aventura en el Volcán', 
        fecha: '2025-12-10', 
        pax: 2, 
        total: 300.00, 
        estadoPago: 'Pagado' 
    },
    { 
        id: 'RES-002', 
        turista: 'Maria Gomez', 
        tour: 'Ruta de las Cascadas', 
        fecha: '2025-12-15', 
        pax: 1, 
        total: 80.50, 
        estadoPago: 'Pendiente' // Esta se puede aprobar
    },
    { 
        id: 'RES-003', 
        turista: 'Juan Perez', 
        tour: 'Centro Histórico', 
        fecha: '2025-12-20', 
        pax: 4, 
        total: 180.00, 
        estadoPago: 'Cancelado' 
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar por ID o nombre del turista
  const filteredReservas = reservas.filter(res => 
    res.turista.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para aprobar un pago manual (Simulación)
  const handleApprovePayment = (id) => {
    if(window.confirm('¿Confirmar que se recibió el pago para esta reserva?')) {
        setReservas(reservas.map(res => 
            res.id === id ? { ...res, estadoPago: 'Pagado' } : res
        ));
    }
  };

  // Función para cancelar reserva
  const handleCancelReservation = (id) => {
    if(window.confirm('¿Estás seguro de cancelar esta reserva?')) {
        setReservas(reservas.map(res => 
            res.id === id ? { ...res, estadoPago: 'Cancelado' } : res
        ));
    }
  };

  return (
    <div className="reservas-container">
      
      {/* 1. CABECERA */}
      <div className="reservas-header">
        <div>
            <h1 className="reservas-title">📋 Reservas y Pagos</h1>
            <p style={{color:'#666', marginTop:'5px'}}>Gestiona las transacciones y valida pagos pendientes.</p>
        </div>
        
        {/* Pequeño resumen estadístico */}
        <div className="stats-summary">
            <div className="stat-card">
                💰 Ingresos del Mes: <span style={{color:'green'}}>$380.50</span>
            </div>
            <div className="stat-card">
                ⚠️ Pendientes: <span style={{color:'#856404'}}>1</span>
            </div>
        </div>
      </div>

      {/* 2. BUSCADOR */}
      <div className="search-bar">
        <FaSearch color="#666" />
        <input 
            type="text" 
            placeholder="Buscar por Turista o ID de Reserva..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 3. TABLA DE DATOS */}
      <div className="table-wrapper">
        <table className="reservas-table">
            <thead>
                <tr>
                    <th>ID Reserva</th>
                    <th>Turista</th>
                    <th>Tour / Servicio</th>
                    <th>Fecha Viaje</th>
                    <th>Pax</th>
                    <th>Total ($)</th>
                    <th>Estado Pago</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {filteredReservas.length > 0 ? (
                    filteredReservas.map((res) => (
                        <tr key={res.id}>
                            <td className="text-bold">{res.id}</td>
                            <td>{res.turista}</td>
                            <td>{res.tour}</td>
                            <td>{res.fecha}</td>
                            <td style={{textAlign:'center'}}>{res.pax}</td>
                            <td className="price-cell">${res.total.toFixed(2)}</td>
                            <td>
                                <span className={`payment-badge ${
                                    res.estadoPago === 'Pagado' ? 'pay-success' : 
                                    res.estadoPago === 'Pendiente' ? 'pay-pending' : 'pay-cancelled'
                                }`}>
                                    {res.estadoPago}
                                </span>
                            </td>
                            <td className="actions-cell">
                                {/* Botón Aprobar (Solo si está pendiente) */}
                                {res.estadoPago === 'Pendiente' && (
                                    <button 
                                        className="btn-icon btn-approve" 
                                        title="Confirmar Pago"
                                        onClick={() => handleApprovePayment(res.id)}
                                    >
                                        <FaCheck />
                                    </button>
                                )}

                                {/* Botón Cancelar (Solo si no está cancelado) */}
                                {res.estadoPago !== 'Cancelado' && (
                                    <button 
                                        className="btn-icon btn-reject" 
                                        title="Cancelar Reserva"
                                        onClick={() => handleCancelReservation(res.id)}
                                    >
                                        <FaTimes />
                                    </button>
                                )}

                                {/* Botón Ver Detalles (Siempre visible) */}
                                <button className="btn-icon btn-details" title="Ver Comprobante">
                                    <FaFileInvoiceDollar />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>
                            No se encontraron reservas.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      <Link to="/admin" className="back-link">
        <FaArrowLeft style={{ marginRight: '5px' }}/> Volver al Panel
      </Link>
    </div>
  );
};

export default GestionReservas;