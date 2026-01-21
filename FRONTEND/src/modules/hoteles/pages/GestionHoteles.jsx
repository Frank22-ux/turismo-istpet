import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaArrowLeft, FaStar } from 'react-icons/fa';
import './GestionHoteles.css';

const GestionHoteles = () => {
  // DATOS MOCK
  const [hoteles, setHoteles] = useState([
    { id: 1, nombre: 'Hotel Paraíso', direccion: 'Av. Amazonas N24', estrellas: 5, habitaciones: 50, estado: 'Disponible' },
    { id: 2, nombre: 'Hostal El Viajero', direccion: 'Calle La Ronda 102', estrellas: 3, habitaciones: 12, estado: 'Lleno' },
    { id: 3, nombre: 'Cotopaxi Lodge', direccion: 'Km 15 Vía Volcán', estrellas: 4, habitaciones: 20, estado: 'Disponible' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredHoteles = hoteles.filter(hotel => 
    hotel.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if(window.confirm('¿Estás seguro de eliminar este hotel?')) {
        setHoteles(hoteles.filter(h => h.id !== id));
    }
  };

  // Función auxiliar para renderizar estrellitas
  const renderStars = (count) => {
    return [...Array(count)].map((_, i) => (
        <FaStar key={i} color="#FFD700" size={14} />
    ));
  };

  return (
    <div className="hoteles-container">
      
      {/* 1. CABECERA */}
      <div className="hoteles-header">
        <h1 className="hoteles-title">🏨 Gestión de Hoteles</h1>
        <button className="btn-create">
          <FaPlus /> Registrar Hotel
        </button>
      </div>

      {/* 2. BUSCADOR */}
      <div className="search-bar">
        <FaSearch color="#666" />
        <input 
            type="text" 
            placeholder="Buscar hotel por nombre..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 3. TABLA DE DATOS */}
      <div className="table-wrapper">
        <table className="hoteles-table">
            <thead>
                <tr>
                    <th>Nombre del Hotel</th>
                    <th>Dirección</th>
                    <th>Categoría</th>
                    <th>Habitaciones</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {filteredHoteles.length > 0 ? (
                    filteredHoteles.map((hotel) => (
                        <tr key={hotel.id}>
                            <td><strong>{hotel.nombre}</strong></td>
                            <td>{hotel.direccion}</td>
                            <td>
                                <div style={{display:'flex', gap:'2px'}}>
                                    {renderStars(hotel.estrellas)}
                                </div>
                            </td>
                            <td>{hotel.habitaciones}</td>
                            <td>
                                <span className={`status-badge ${hotel.estado === 'Disponible' ? 'status-available' : 'status-full'}`}>
                                    {hotel.estado}
                                </span>
                            </td>
                            <td className="actions-cell">
                                <button className="btn-action btn-edit" title="Editar">
                                    <FaEdit />
                                </button>
                                <button 
                                    className="btn-action btn-delete" 
                                    title="Eliminar"
                                    onClick={() => handleDelete(hotel.id)}
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                            No se encontraron hoteles.
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

export default GestionHoteles;