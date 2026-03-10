import { useState, useEffect } from 'react';
import {
  FaCog,
  FaSave,
  FaUndo,
  FaToggleOn,
  FaToggleOff,
  FaShieldAlt,
  FaDatabase,
  FaDownload,
  FaCheckCircle,
  FaExclamationCircle,
  FaGlobe,
  FaUsers,
  FaSpinner,
  FaKey
} from 'react-icons/fa';
import AdminLayout from '../layouts/AdminLayout';
import api from '../../../core/api';
import './Configuracion.css';

const DEFAULTS = {
  nombre_plataforma: 'ECORUT Travels',
  descripcion: 'Plataforma de reserva de tours y experiencias en Ecuador',
  telefono_contacto: '+593 2 1234567',
  idioma: 'es',
  permitir_registro: true,
  modo_mantenimiento: false,
  session_timeout: 30,
  max_login_attempts: 5,
};

const Configuracion = () => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [original, setOriginal] = useState(DEFAULTS);
  const [cambios, setCambios] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('general');

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load config from backend
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingConfig(true);
        const { data } = await api.get('/admin/config');
        const merged = { ...DEFAULTS, ...data };
        setSettings(merged);
        setOriginal(merged);
      } catch (e) {
        console.error('Error cargando configuración:', e);
        // Fall back to defaults silently
      } finally {
        setLoadingConfig(false);
      }
    };
    load();
  }, []);

  const handleChange = (campo, valor) => {
    setSettings(prev => ({ ...prev, [campo]: valor }));
    setCambios(true);
  };

  const handleGuardar = async () => {
    setSavingConfig(true);
    try {
      await api.post('/admin/config', settings);
      setOriginal(settings);
      setCambios(false);
      setToast({ type: 'success', msg: 'Configuración guardada correctamente' });
    } catch (e) {
      setToast({ type: 'error', msg: e.response?.data?.message || 'Error al guardar la configuración' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCancelar = () => {
    setSettings(original);
    setCambios(false);
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/admin/backup`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al conectar con el servidor');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fecha = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `backup-ecorut-${fecha}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ type: 'success', msg: 'Backup descargado correctamente' });
    } catch (e) {
      setToast({ type: 'error', msg: 'No se pudo generar el backup. Intenta nuevamente.' });
    } finally {
      setBackupLoading(false);
    }
  };

  // ─── Toggle component ─────────────────────────────────────────────────────
  const Toggle = ({ value, onChange }) => (
    <button
      type="button"
      className={`toggle-switch ${value ? 'on' : 'off'}`}
      onClick={() => onChange(!value)}
      aria-checked={value}
      role="switch"
    >
      <span className="toggle-thumb" />
    </button>
  );

  // ─── Sections ─────────────────────────────────────────────────────────────
  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'general':
        return (
          <div className="config-section">
            <div className="section-header">
              <FaGlobe />
              <div>
                <h3>Configuración General</h3>
                <p>Datos básicos de la plataforma que se muestran a los usuarios.</p>
              </div>
            </div>

            <div className="config-field">
              <label>Nombre de la Plataforma</label>
              <input
                type="text"
                value={settings.nombre_plataforma}
                onChange={(e) => handleChange('nombre_plataforma', e.target.value)}
                className="config-input"
                placeholder="Ej: ECORUT Travels"
              />
            </div>

            <div className="config-field">
              <label>Descripción</label>
              <textarea
                value={settings.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className="config-input"
                rows="3"
                placeholder="Breve descripción de la plataforma…"
              />
            </div>

            <div className="config-row-2">
              <div className="config-field">
                <label>Teléfono de Contacto</label>
                <input
                  type="tel"
                  value={settings.telefono_contacto}
                  onChange={(e) => handleChange('telefono_contacto', e.target.value)}
                  className="config-input"
                  placeholder="+593 2 1234567"
                />
              </div>
              <div className="config-field">
                <label>Idioma por defecto</label>
                <select
                  value={settings.idioma}
                  onChange={(e) => handleChange('idioma', e.target.value)}
                  className="config-input"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'seguridad':
        return (
          <div className="config-section">
            <div className="section-header">
              <FaShieldAlt />
              <div>
                <h3>Seguridad</h3>
                <p>Controla cómo se gestionan las sesiones y los accesos al sistema.</p>
              </div>
            </div>

            <div className="config-row-2">
              <div className="config-field">
                <label>Tiempo de sesión (minutos)</label>
                <input
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => handleChange('session_timeout', parseInt(e.target.value, 10))}
                  className="config-input"
                  min="5"
                  max="480"
                />
                <small>Tiempo máximo de inactividad antes de cerrar la sesión automáticamente.</small>
              </div>
              <div className="config-field">
                <label>Máximo de intentos de login</label>
                <input
                  type="number"
                  value={settings.max_login_attempts}
                  onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value, 10))}
                  className="config-input"
                  min="1"
                  max="10"
                />
                <small>La cuenta se bloqueará temporalmente después de este número de intentos fallidos.</small>
              </div>
            </div>
          </div>
        );

      case 'plataforma':
        return (
          <div className="config-section">
            <div className="section-header">
              <FaUsers />
              <div>
                <h3>Funciones de la Plataforma</h3>
                <p>Activa o desactiva funciones clave según el estado del sistema.</p>
              </div>
            </div>

            <div className="toggle-list">
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-title">Permitir registro de nuevos usuarios</span>
                  <span className="toggle-desc">Si está desactivado, solo el admin puede crear cuentas.</span>
                </div>
                <Toggle value={settings.permitir_registro} onChange={(v) => handleChange('permitir_registro', v)} />
              </div>

              <div className="toggle-row danger-toggle">
                <div className="toggle-info">
                  <span className="toggle-title">Modo Mantenimiento</span>
                  <span className="toggle-desc">⚠️ Los usuarios no podrán acceder a la plataforma mientras esté activo.</span>
                </div>
                <Toggle value={settings.modo_mantenimiento} onChange={(v) => handleChange('modo_mantenimiento', v)} />
              </div>
            </div>
          </div>
        );

      case 'basedatos':
        return (
          <div className="config-section">
            <div className="section-header">
              <FaDatabase />
              <div>
                <h3>Base de Datos y Backup</h3>
                <p>Descarga un respaldo completo de los datos del sistema en formato JSON.</p>
              </div>
            </div>

            <div className="backup-card">
              <div className="backup-icon">
                <FaDatabase />
              </div>
              <div className="backup-info">
                <h4>Respaldo de datos</h4>
                <p>El archivo incluirá: <strong>usuarios, tours, hoteles, reservas, guías</strong> y tipos de habitación.</p>
                <p className="backup-date">Último backup: hoy a las {new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button
                className="btn-backup"
                onClick={handleBackup}
                disabled={backupLoading}
              >
                {backupLoading ? (
                  <><FaSpinner className="spin-icon" /> Generando...</>
                ) : (
                  <><FaDownload /> Descargar Backup</>
                )}
              </button>
            </div>

            <div className="backup-note">
              <FaKey />
              <span>
                El backup contiene datos sensibles. Guárdalo en un lugar seguro y no lo compartas.
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const MENU_ITEMS = [
    { key: 'general',    icon: <FaGlobe />,      label: 'General' },
    { key: 'seguridad',  icon: <FaShieldAlt />,  label: 'Seguridad' },
    { key: 'plataforma', icon: <FaUsers />,       label: 'Plataforma' },
    { key: 'basedatos',  icon: <FaDatabase />,    label: 'Base de Datos' },
  ];

  const content = (
    <div className="configuracion-container">
      {/* TOAST */}
      {toast && (
        <div className={`config-toast ${toast.type}`}>
          {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {toast.msg}
        </div>
      )}

      <div className="configuracion-header">
        <div>
          <h1 className="page-title">⚙️ Configuración del Sistema</h1>
          <p className="page-subtitle">Gestiona las opciones globales de la plataforma ECORUT Travels</p>
        </div>
        {cambios && (
          <div className="unsaved-badge">
            <span>● Cambios sin guardar</span>
          </div>
        )}
      </div>

      {loadingConfig ? (
        <div className="config-loading">
          <FaSpinner className="spin-icon" /> Cargando configuración...
        </div>
      ) : (
        <div className="configuracion-content">
          {/* SIDEBAR */}
          <aside className="config-sidebar">
            <nav className="config-menu">
              {MENU_ITEMS.map(item => (
                <button
                  key={item.key}
                  className={`config-menu-item ${seccionActiva === item.key ? 'active' : ''}`}
                  onClick={() => setSeccionActiva(item.key)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* MAIN */}
          <div className="config-main">
            {renderSeccion()}

            {/* Actions — hide for basedatos tab (no settings to save) */}
            {seccionActiva !== 'basedatos' && (
              <div className="config-actions">
                <button
                  className="btn-primary"
                  onClick={handleGuardar}
                  disabled={!cambios || savingConfig}
                >
                  {savingConfig
                    ? <><FaSpinner className="spin-icon" /> Guardando...</>
                    : <><FaSave /> Guardar Cambios</>
                  }
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleCancelar}
                  disabled={!cambios}
                >
                  <FaUndo /> Restablecer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
};

export default Configuracion;
