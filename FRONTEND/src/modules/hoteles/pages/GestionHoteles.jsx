import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminLayout from '../../admin/layouts/AdminLayout';
import api from '../../../core/api';
import './GestionHoteles.css';

const GestionHoteles = () => {
  const navigate = useNavigate();
  const [hoteles, setHoteles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const { data } = await api.get('/hoteles');
        if (!mounted) return;
        const normalized = (data || []).map((h) => ({
          id: h.id_hotel,
          nombre: h.nombre,
          direccion: h.direccion,
          ciudad: h.ciudad,
          estrellas: parseInt(h.estrellas || 0, 10) || 0,
          habitaciones_disponibles: parseInt(h.habitaciones_disponibles || 0, 10) || 0,
          estado_convenio: h.estado_convenio || 'Activo',
        }));
        setHoteles(normalized);
      } catch (e) {
        console.error(e);
        setLoadError(e.response?.data?.message || e.message || 'Error al cargar hoteles');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredHoteles = useMemo(() => {
    return hoteles.filter(hotel =>
      (hotel.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [hoteles, searchTerm]);

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Eliminar Hotel?',
      text: "¡No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'modern-swal-popup' }
    }).then((result) => {
      if (result.isConfirmed) {
        (async () => {
          try {
            await api.delete(`/hoteles/${id}`);
            setHoteles((prev) => prev.filter(h => h.id !== id));
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El hotel ha sido eliminado exitosamente.',
              icon: 'success',
              confirmButtonColor: '#2ecc71'
            });
          } catch (e) {
            Swal.fire({
              title: 'Error',
              text: e.response?.data?.message || e.message || 'No se pudo eliminar el hotel',
              icon: 'error'
            });
          }
        })();
      }
    });
  };

  const handleEdit = (hotel) => {
    navigate(`/admin/crear-hotel/${hotel.id}`);
  };

  // Función auxiliar para renderizar estrellitas
  const renderStars = (count) => {
    return [...Array(count)].map((_, i) => (
      <FaStar key={i} color="#FFD700" size={14} />
    ));
  };

  const content = (
    <div className="hoteles-modern-wrapper">

      {/* 1. CABECERA */}
      <div className="hoteles-header-section">
        <div className="header-top">
          <div>
            <h1 className="page-title">🏨 Gestión de Hoteles</h1>
            <p className="page-subtitle">Administra los hoteles disponibles</p>
          </div>
          <button
            className="btn-create-primary"
            onClick={() => navigate('/admin/crear-hotel/nuevo')}
          >
            <FaPlus /> Registrar Hotel
          </button>
        </div>

        <div className="quick-stats">
          <div className="quick-stat-card">
            <span className="stat-number">{hoteles.length}</span>
            <span className="stat-label">Total Hoteles</span>
          </div>
          <div className="quick-stat-card">
            <span className="stat-number">{hoteles.filter(h => (h.estado_convenio || 'Activo') === 'Activo').length}</span>
            <span className="stat-label">Convenio Activo</span>
          </div>
        </div>
      </div>

      {loading && <div style={{ padding: 12 }}>Cargando hoteles...</div>}
      {loadError && <div style={{ padding: 12, color: '#b00020' }}>{loadError}</div>}

      {/* 2. BUSCADOR */}
      <div className="filters-bar">
        <div className="search-box-modern">
          <FaSearch color="#666" />
          <input
            type="text"
            placeholder="Buscar hotel por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. TABLA DE DATOS */}
      <div className="table-card-modern">
        <table className="modern-table-hoteles">
          <thead>
            <tr>
              <th>Nombre del Hotel</th>
              <th>Dirección</th>
              <th>Categoría</th>
              <th>Habitaciones</th>
              <th>Convenio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredHoteles.length > 0 ? (
              filteredHoteles.map((hotel) => (
                <tr key={hotel.id}>
                  <td>
                    <div className="hotel-cell">
                      <div className="icon-placeholder"><FaStar size={16} /></div>
                      <div>
                        <div className="hotel-name">{hotel.nombre}</div>
                        <div className="hotel-id">ID: #{hotel.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{hotel.direccion}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {renderStars(hotel.estrellas)}
                    </div>
                  </td>
                  <td>{hotel.habitaciones_disponibles}</td>
                  <td>
                    <span className={`status-badge ${(hotel.estado_convenio || 'Activo') === 'Activo' ? 'status-available' : 'status-full'}`}>
                      {hotel.estado_convenio || 'Activo'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon edit" title="Editar" onClick={() => handleEdit(hotel)}>
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon delete"
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  No se encontraron hoteles.
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

export default GestionHoteles;
