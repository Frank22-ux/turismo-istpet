import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaImage, FaEye } from 'react-icons/fa';
import { getToursRequest, deleteTourRequest } from '../services/tour.service';
import Swal from 'sweetalert2';
import AdminLayout from '../../admin/layouts/AdminLayout';
import './GestionTours.css';

const API_URL = 'http://localhost:4000';

const GestionTours = () => {
    const [tours, setTours] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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
        Swal.fire({
            title: '¿Eliminar Tour?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: { popup: 'modern-swal-popup' }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteTourRequest(id);
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'El tour ha sido eliminado correctamente.',
                        icon: 'success',
                        confirmButtonColor: '#2ecc71'
                    });
                    cargarTours();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'Hubo un error al eliminar el tour.', 'error');
                }
            }
        });
    };

    const content = (
        <div className="tours-modern-wrapper">
            <div className="tours-header-section">
                <div className="header-top">
                    <div>
                        <h1 className="page-title">🏔️ Gestión de Tours</h1>
                        <p className="page-subtitle">Administra tu catálogo de tours</p>
                    </div>
                    <Link to="/admin/crear-tour/nuevo" className="btn-create-primary">
                        <FaPlus /> Nuevo Tour
                    </Link>
                </div>

                <div className="quick-stats">
                    <div className="quick-stat-card">
                        <span className="stat-number">{tours.length}</span>
                        <span className="stat-label">Total Tours</span>
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box-modern">
                    <FaSearch color="#666" />
                    <input
                        type="text"
                        placeholder="Buscar tour por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card-modern">
                <table className="modern-table-tours">
                    <thead>
                        <tr>
                            <th>Tour / Portada</th>
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
                                        <div className="tour-cell">
                                            {tour.imagen_portada ? (
                                                <img
                                                    src={`${API_URL}${tour.imagen_portada}`}
                                                    alt="Tour"
                                                    className="tour-thumbnail"
                                                />
                                            ) : (
                                                <div className="no-image-placeholder"><FaImage /></div>
                                            )}
                                            <div className="tour-info">
                                                <span className="tour-name">{tour.nombre}</span>
                                                <span className="tour-subtitle">ID: #{tour.id_tour}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${Number(tour.precio).toFixed(2)}</td>
                                    <td>{tour.duracion}</td>
                                    <td>{tour.ciudad_destino}</td>
                                    <td className="actions-cell">
                                        <Link
                                            to={`/admin/detalle-tour/${tour.id_tour}`}
                                            className="btn-icon view"
                                            title="Ver Detalles"
                                        >
                                            <FaEye />
                                        </Link>
                                        <Link
                                            to={`/admin/editar-tour/${tour.id_tour}`}
                                            className="btn-icon edit"
                                            title="Editar"
                                        >
                                            <FaEdit />
                                        </Link>
                                        <button
                                            className="btn-icon delete"
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
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                    No hay tours registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return <AdminLayout>{content}</AdminLayout>;
};

export default GestionTours;
