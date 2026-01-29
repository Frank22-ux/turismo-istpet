import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaArrowLeft, FaStar, FaEye } from 'react-icons/fa';
import './GestionHoteles.css';

const API_URL = 'http://localhost:4000';

const GestionHoteles = () => {
    const [hoteles, setHoteles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        cargarHoteles();
    }, []);

    const cargarHoteles = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/hoteles`);
            setHoteles(response.data);
        } catch (error) {
            console.error("Error al cargar hoteles:", error);
            setHoteles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este hotel? Esta acción no se puede deshacer.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/api/hoteles/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Hotel eliminado con éxito');
                cargarHoteles();
            } catch (error) {
                alert('No se pudo eliminar el hotel. Verifique si está asignado a un tour.');
            }
        }
    };

    const filteredHoteles = hoteles.filter(hotel => 
        hotel.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.direccion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (count) => {
        return [...Array(Number(count))].map((_, i) => (
            <FaStar key={i} color="#FFD700" size={14} />
        ));
    };

    if (loading) return <div className="loader">Cargando hoteles...</div>;

    return (
        <div className="hoteles-container">
            <div className="hoteles-header">
                <h1 className="hoteles-title">🏨 Convenios de Hoteles</h1>
                <button 
                    className="btn-create" 
                    onClick={() => navigate('/admin/crear-hotel')}
                >
                    <FaPlus /> Nuevo convenio
                </button>
            </div>

            <div className="search-bar">
                <FaSearch color="#666" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o dirección..." 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-wrapper">
                <table className="hoteles-table">
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Nombre del Hotel</th>
                            <th>Ciudad</th>
                            <th>Categoría</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHoteles.length > 0 ? (
                            filteredHoteles.map((hotel) => (
                                <tr key={hotel.id_hotel}>
                                    <td>
                                        <img 
                                            src={hotel.foto_url ? `${API_URL}${hotel.foto_url}` : 'https://via.placeholder.com/50'} 
                                            alt="Hotel" 
                                            className="table-img-hotel"
                                        />
                                    </td>
                                    <td><strong>{hotel.nombre}</strong></td>
                                    <td>{hotel.ciudad}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {renderStars(hotel.estrellas)}
                                        </div>
                                    </td>
                                    <td>{hotel.telefono || 'N/A'}</td>
                                    <td className="actions-cell">
                                        {/* VER DETALLES (OJO AZUL) */}
                                        <button 
                                            className="btn-action btn-view" 
                                            title="Ver Detalles"
                                            onClick={() => navigate(`/admin/hoteles/detalle/${hotel.id_hotel}`)}
                                        >
                                            <FaEye />
                                        </button>

                                        {/* EDITAR (LÁPIZ AMARILLO) */}
                                        <button 
                                            className="btn-action btn-edit" 
                                            title="Editar"
                                            onClick={() => navigate(`/admin/editar-hotel/${hotel.id_hotel}`)}
                                        >
                                            <FaEdit />
                                        </button>

                                        {/* ELIMINAR (BASURA ROJO) */}
                                        <button 
                                            className="btn-action btn-delete" 
                                            title="Eliminar"
                                            onClick={() => handleDelete(hotel.id_hotel)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                    No se encontraron hoteles registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Link to="/admin" className="back-link">
                <FaArrowLeft style={{ marginRight: '5px' }} /> Volver al Panel
            </Link>
        </div>
    );
};

export default GestionHoteles;