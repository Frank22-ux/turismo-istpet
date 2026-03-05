import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaWhatsapp,
  FaEnvelope,
  FaFilter,
  FaSortAmountDown
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../../core/api';
import './GestionGuias.css';

const GestionGuias = () => {
  const navigate = useNavigate();
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const { data } = await api.get('/guias');
        if (!mounted) return;
        const normalized = (data || []).map((g) => {
          const idiomas = Array.isArray(g.idiomas)
            ? g.idiomas
            : (typeof g.idiomas === 'string'
              ? (JSON.parse(g.idiomas || '[]') || [])
              : []);

          return {
            // Campos base
            id: g.id_usuario,
            primer_nombre: g.primer_nombre,
            segundo_nombre: g.segundo_nombre,
            apellido_paterno: g.apellido_paterno,
            apellido_materno: g.apellido_materno,
            correo: g.correo,
            codigo_pais: g.codigo_pais,
            numero_celular: g.numero_celular,
            foto_url: g.foto_url,
            activo: g.activo,

            // Campos guía
            idiomas,
            especialidades: g.especialidades,
            bio: g.bio,
            disponibilidad: g.disponibilidad,
            tours: parseInt(g.tours || 0, 10) || 0,
          };
        });
        setGuias(normalized);
      } catch (e) {
        console.error(e);
        setLoadError(e.response?.data?.message || e.message || 'Error al cargar guías');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredGuias = useMemo(() => {
    return guias.filter(guia => {
      const nombre = `${guia.primer_nombre || ''} ${guia.segundo_nombre || ''}`.trim().toLowerCase();
      const apellido = `${guia.apellido_paterno || ''} ${guia.apellido_materno || ''}`.trim().toLowerCase();
      const matchesSearch = nombre.includes(searchTerm.toLowerCase()) || apellido.includes(searchTerm.toLowerCase());
      const estado = guia.activo ? 'Activo' : 'Inactivo';
      const matchesFilter = filterEstado === 'Todos' || estado === filterEstado;
      return matchesSearch && matchesFilter;
    });
  }, [guias, searchTerm, filterEstado]);

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Desvincular Guía?',
      text: "¡Esta acción removerá al guía del sistema!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, desvincular',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'modern-swal-popup' }
    }).then((result) => {
      if (!result.isConfirmed) return;
      (async () => {
        try {
          await api.delete(`/guias/${id}`);
          setGuias((prev) => prev.filter(g => g.id !== id));
          Swal.fire({
            title: '¡Desvinculado!',
            text: 'El guía ha sido removido exitosamente.',
            icon: 'success',
            confirmButtonColor: '#2ecc71'
          });
        } catch (e) {
          Swal.fire({
            title: 'Error',
            text: e.response?.data?.message || e.message || 'No se pudo eliminar el guía',
            icon: 'error'
          });
        }
      })();
    });
  };

  const handleEdit = (guia) => {
    navigate(`/admin/crear-guia/${guia.id}`);
  };

  const totalGuias = guias.length;
  const guiasActivos = guias.filter(g => g.activo).length;

  const content = (
    <div className="guias-modern-wrapper">
      <div className="guias-header-section">
        <div className="header-top">
          <div>
            <h1 className="page-title">🧑‍🏫 Gestión de Guías</h1>
            <p className="page-subtitle">Administra tu equipo de guías</p>
          </div>
          <button
            className="btn-create-primary"
            onClick={() => navigate('/admin/crear-guia/nuevo')}
          >
            <FaPlus /> Registrar Nuevo Guía
          </button>
        </div>

        <div className="quick-stats">
          <div className="quick-stat-card">
            <span className="stat-number">{totalGuias}</span>
            <span className="stat-label">Total Guías</span>
          </div>
          <div className="quick-stat-card">
            <span className="stat-number">{guiasActivos}</span>
            <span className="stat-label">Activos</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box-modern">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>

      {loading && <div style={{ padding: 12 }}>Cargando guías...</div>}
      {loadError && <div style={{ padding: 12, color: '#b00020' }}>{loadError}</div>}

      <div className="table-card-modern">
        <table className="modern-table-guias">
          <thead>
            <tr>
              <th>Guía</th>
              <th>Contacto</th>
              <th>Idiomas</th>
              <th>Tours</th>
              <th>Rating</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuias.map((guia) => (
              <tr key={guia.id}>
                <td>
                  <div className="guide-cell">
                    <img
                      src={guia.foto_url ? `${(import.meta.env.VITE_API_URL || 'http://localhost:4000')}${guia.foto_url}` : `https://ui-avatars.com/api/?name=${guia.primer_nombre}+${guia.apellido_paterno}&background=022b3a&color=fff`}
                      alt="Avatar"
                    />
                    <div>
                      <div className="guide-name">{guia.primer_nombre} {guia.apellido_paterno}</div>
                      <div className="guide-id">ID: #{guia.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-cell">
                    <div><FaEnvelope /> {guia.correo}</div>
                    <div><FaWhatsapp /> {`${guia.codigo_pais || ''} ${guia.numero_celular || ''}`.trim()}</div>
                  </div>
                </td>
                <td>
                  {(guia.idiomas || []).map((idioma, i) => (
                    <span key={i} className="lang-badge">{idioma}</span>
                  ))}
                </td>
                <td>{guia.tours}</td>
                <td>—</td>
                <td>
                  <span className={`badge ${guia.activo ? 'badge-active' : 'badge-inactive'}`}>
                    {guia.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => handleEdit(guia)}><FaEdit /></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(guia.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
};

export default GestionGuias;
