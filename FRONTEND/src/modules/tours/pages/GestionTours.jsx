import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaArrowLeft, FaImage, FaEye } from 'react-icons/fa';
import { getToursRequest, deleteTourRequest } from '../services/tour.service';
import './GestionTours.css';

const API_URL = 'http://localhost:4000';

const GestionTours = () => {
  const [tours, setTours] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    cargarTours();
  }, []);

  const cargarTours = async () => {
    try {
        const data = await getToursRequest();
        setTours(Array.isArray(data) ? data : []); 
    } catch (error) {
        console.error("Error cargando tours:", error);
    }
  };

  const filteredTours = tours.filter(tour => 
    tour.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if(window.confirm('¿Estás seguro de eliminar este tour?')) {
        try {
            await deleteTourRequest(id);
            alert('Tour eliminado correctamente');
            cargarTours();
        } catch (error) {
            console.error(error);
            alert('Error al eliminar el tour');
        }
    }
  };

  return (
    <div className="tours-container">
      <div className="tours-header">
        <h1 className="tours-title">🏔️ Gestión de Tours</h1>
        <Link to="/admin/crear-tour/nuevo" className="btn-create" style={{textDecoration:'none'}}>
          <FaPlus /> Nuevo Tour
        </Link>
      </div>

      <div className="search-bar">
        <FaSearch color="#666" />
        <input 
            type="text" 
            placeholder="Buscar tour por nombre..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="tours-table">
            <thead>
                <tr>
                    <th style={{width: '80px'}}>Portada</th>
                    <th>Nombre del Tour</th>
                    <th>Precio</th>
                    <th>Duración</th>
                    <th>Ciudad</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {filteredTours.length > 0 ? (
                    filteredTours.map((tour) => (
                        <tr key={tour.id_tour}>
                            <td>
                                {tour.imagen_portada ? (
                                    <img 
                                        src={`${API_URL}${tour.imagen_portada}`} 
                                        alt="Tour" 
                                        className="tour-thumbnail"
                                    />
                                ) : (
                                    <div className="no-image-placeholder"><FaImage /></div>
                                )}
                            </td>
                            <td><strong>{tour.nombre}</strong></td>
                            <td>${Number(tour.precio).toFixed(2)}</td>
                            <td>{tour.duracion}</td>
                            <td>{tour.ciudad_destino}</td>
                            <td className="actions-cell">
                                
                                {/* AZUL */}
                                <Link 
                                    to={`/admin/detalle-tour/${tour.id_tour}`} 
                                    className="btn-action btn-view" 
                                    title="Ver Detalles"
                                >
                                    <FaEye />
                                </Link>

                                {/* AMARILLO */}
                                <Link 
                                    to={`/admin/editar-tour/${tour.id_tour}`} 
                                    className="btn-action btn-edit" 
                                    title="Editar"
                                >
                                    <FaEdit />
                                </Link>

                                {/* ROJO */}
                                <button 
                                    className="btn-action btn-delete" 
                                    title="Eliminar"
                                    onClick={() => handleDelete(tour.id_tour)}
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                            No hay tours registrados.
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

export default GestionTours;