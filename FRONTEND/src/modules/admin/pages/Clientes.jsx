import { useEffect, useMemo, useState } from 'react';
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../../core/api';
import './AdminDashboard.css';

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
          nombre: `${u.primer_nombre || ''} ${u.segundo_nombre || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.replace(/\s+/g, ' ').trim(),
          email: u.correo,
          telefono: `${u.codigo_pais || ''} ${u.numero_celular || ''}`.trim(),
          ciudad: '-', // No existe en el esquema actual
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
      const matchesSearch = (cliente.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || cliente.estado === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [clientes, searchTerm, filterType]);

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir la eliminación de este cliente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'modern-swal-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Eliminando cliente:', id);
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El cliente ha sido eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#2ecc71'
        });
      }
    });
  };

  const handleEdit = (cliente) => {
    Swal.fire({
      title: 'Editar Cliente',
      html: `
        <div style="text-align: left; margin-top: 15px;">
          <label style="font-weight: 500; color: #2c3e50; font-size: 0.9rem;">Nombre Completo:</label>
          <input type="text" id="edit-nombre" class="swal2-input" value="${cliente.nombre}" style="margin: 5px 0 15px 0; width: 100%; box-sizing: border-box;">
          
          <label style="font-weight: 500; color: #2c3e50; font-size: 0.9rem;">Email:</label>
          <input type="email" id="edit-email" class="swal2-input" value="${cliente.email}" style="margin: 5px 0 15px 0; width: 100%; box-sizing: border-box;">
          
          <label style="font-weight: 500; color: #2c3e50; font-size: 0.9rem;">Teléfono:</label>
          <input type="tel" id="edit-telefono" class="swal2-input" value="${cliente.telefono}" style="margin: 5px 0 15px 0; width: 100%; box-sizing: border-box;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#022b3a',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'modern-swal-popup'
      },
      preConfirm: () => {
        const nombre = document.getElementById('edit-nombre').value;
        const email = document.getElementById('edit-email').value;
        const telefono = document.getElementById('edit-telefono').value;
        if (!nombre || !email || !telefono) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
        }
        return { nombre, email, telefono };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Guardado',
          text: 'Los datos del cliente han sido actualizados.',
          icon: 'success',
          confirmButtonColor: '#2ecc71'
        });
      }
    });
  };

  const content = (
    <div className="clientes-container">
      <div className="clientes-header">
        <h1>👥 Gestión de Clientes</h1>
        <button
          className="btn-create"
          onClick={() => navigate('/admin/clientes/nuevo')}
        >
          <FaPlus /> Nuevo Cliente
        </button>
      </div>

      {loading && <div style={{ padding: 12 }}>Cargando clientes...</div>}
      {loadError && <div style={{ padding: 12, color: '#b00020' }}>{loadError}</div>}

      {/* SEARCH AND FILTER */}
      <div className="search-and-filter">
        <div className="search-bar">
          <FaSearch color="#666" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-bar">
          <FaFilter color="#666" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los Estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="stats-mini">
        <div className="mini-stat-card">
          <span className="mini-stat-label">Total de Clientes</span>
          <span className="mini-stat-value">{clientes.length}</span>
        </div>
        <div className="mini-stat-card">
          <span className="mini-stat-label">Clientes Activos</span>
          <span className="mini-stat-value">{clientes.filter(c => c.estado === 'Activo').length}</span>
        </div>
        <div className="mini-stat-card">
          <span className="mini-stat-label">Gasto Total</span>
          <span className="mini-stat-value">${clientes.reduce((sum, c) => sum + (c.gasto_total || 0), 0).toLocaleString()}</span>
        </div>
      </div>

      {/* CLIENTS TABLE */}
      <div className="table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Ciudad</th>
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
                    <div className="cliente-info">
                      <div className="cliente-avatar">
                        <FaUser />
                      </div>
                      <strong>{cliente.nombre}</strong>
                    </div>
                  </td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <div className="ciudad-badge">
                      <FaMapMarkerAlt /> {cliente.ciudad}
                    </div>
                  </td>
                  <td className="text-bold">{cliente.reservas}</td>
                  <td className="text-success">${cliente.gasto_total.toLocaleString()}</td>
                  <td>
                    <small>{new Date(cliente.fecha_registro).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <span className={`estado-badge ${cliente.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-action btn-edit" title="Editar" onClick={() => handleEdit(cliente)}>
                      <FaEdit />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      title="Eliminar"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                  No se encontraron clientes.
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

export default Clientes;
