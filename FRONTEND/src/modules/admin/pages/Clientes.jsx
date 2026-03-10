import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaFilter,
  FaUsers,
  FaUserCheck,
  FaDollarSign
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../../core/api';
import './Clientes.css';

const Clientes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const { data } = await api.get('/admin/clientes');
        if (!mounted) return;
        const normalized = (data || []).map((u) => ({
          id: u.id_usuario,
          primer_nombre: u.primer_nombre || '',
          apellido_paterno: u.apellido_paterno || '',
          nombre: `${u.primer_nombre || ''} ${u.segundo_nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.replace(/\s+/g, ' ').trim(),
          email: u.correo,
          telefono: `${u.codigo_pais || ''} ${u.numero_celular || ''}`.trim(),
          reservas: parseInt(u.reservas || 0, 10) || 0,
          gasto_total: parseFloat(u.gasto_total || 0) || 0,
          fecha_registro: u.fecha_registro,
          estado: u.activo ? 'Activo' : 'Inactivo',
        }));
        setClientes(normalized);
      } catch (e) {
        console.error(e);
        setLoadError(e.response?.data?.message || e.message || 'Error al cargar clientes');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchesSearch =
        (cliente.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || cliente.estado === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [clientes, searchTerm, filterType]);

  const handleEdit = (cliente) => {
    navigate(`/admin/clientes/${cliente.id}`);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Eliminar cliente?',
      text: '¡Esta acción no se puede revertir!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/admin/clientes/${id}`)
          .then(() => {
            setClientes((prev) => prev.filter(c => c.id !== id));
            Swal.fire({ title: '¡Eliminado!', text: 'El cliente fue eliminado.', icon: 'success', confirmButtonColor: '#10b981' });
          })
          .catch((e) => {
            Swal.fire({ title: 'Error', text: e.response?.data?.message || 'No se pudo eliminar el cliente.', icon: 'error' });
          });
      }
    });
  };

  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c.estado === 'Activo').length;
  const gastoTotal = clientes.reduce((sum, c) => sum + (c.gasto_total || 0), 0);

  const content = (
    <div className="clientes-modern-wrapper">
      {/* HEADER */}
      <div className="clientes-header-section">
        <div className="header-top">
          <div>
            <h1 className="page-title">👥 Gestión de Clientes</h1>
            <p className="page-subtitle">Administra la base de clientes registrados</p>
          </div>
          <button
            className="btn-create-primary"
            onClick={() => navigate('/admin/clientes/nuevo')}
          >
            <FaPlus /> Nuevo Cliente
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="quick-stats">
          <div className="quick-stat-card">
            <div className="stat-icon-wrapper stat-icon-blue">
              <FaUsers />
            </div>
            <div>
              <span className="stat-number">{totalClientes}</span>
              <span className="stat-label">Total Clientes</span>
            </div>
          </div>
          <div className="quick-stat-card">
            <div className="stat-icon-wrapper stat-icon-green">
              <FaUserCheck />
            </div>
            <div>
              <span className="stat-number">{clientesActivos}</span>
              <span className="stat-label">Clientes Activos</span>
            </div>
          </div>
          <div className="quick-stat-card">
            <div className="stat-icon-wrapper stat-icon-amber">
              <FaDollarSign />
            </div>
            <div>
              <span className="stat-number">${gastoTotal.toLocaleString()}</span>
              <span className="stat-label">Gasto Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-bar">
        <div className="search-box-modern">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>

      {/* FEEDBACK */}
      {loading && <div className="table-feedback">Cargando clientes...</div>}
      {loadError && <div className="table-feedback error">{loadError}</div>}

      {/* TABLE */}
      {!loading && !loadError && (
        <div className="table-card-modern">
          <table className="modern-table-clientes">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Reservas</th>
                <th>Gasto Total</th>
                <th>Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <div className="guide-cell">
                        <img
                          src={`https://ui-avatars.com/api/?name=${cliente.primer_nombre}+${cliente.apellido_paterno}&background=022b3a&color=fff&size=80`}
                          alt={cliente.nombre}
                        />
                        <div>
                          <div className="guide-name">{cliente.nombre}</div>
                          <div className="guide-id">ID: #{cliente.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div><FaEnvelope /> {cliente.email}</div>
                        {cliente.telefono && <div><FaPhone /> {cliente.telefono}</div>}
                      </div>
                    </td>
                    <td>
                      <span className="reservas-count">{cliente.reservas}</span>
                    </td>
                    <td className="gasto-cell">
                      ${cliente.gasto_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <small className="date-label">
                        {new Date(cliente.fecha_registro).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </small>
                    </td>
                    <td>
                      <span className={`badge ${cliente.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`}>
                        {cliente.estado}
                      </span>
                    </td>
                    <td>
                      <div className="actions-row">
                        <button className="btn-icon edit" title="Editar cliente" onClick={() => handleEdit(cliente)}>
                          <FaEdit />
                        </button>
                        <button className="btn-icon delete" title="Eliminar cliente" onClick={() => handleDelete(cliente.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-row">
                    <div className="empty-state">
                      <FaUsers />
                      <p>No se encontraron clientes</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
};

export default Clientes;
