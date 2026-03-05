import { useState } from 'react';
import {
  FaCog,
  FaSave,
  FaUndo,
  FaToggleOn,
  FaToggleOff,
  FaLock,
  FaBell,
  FaPalette,
  FaDatabase,
  FaShieldAlt,
  FaEnvelope,
  FaKey
} from 'react-icons/fa';
import AdminLayout from '../layouts/AdminLayout';
import './Configuracion.css';

const Configuracion = () => {
  const [settings, setSettings] = useState({
    // General Settings
    nombre_plataforma: 'ECURUT Travel',
    descripcion: 'Plataforma de reserva de tours y experiencias en Ecuador',
    email_contacto: 'info@ecurutravel.com',
    telefono_contacto: '+593 2 1234567',

    // Notificaciones
    notificaciones_email: true,
    notificaciones_sms: true,
    notificaciones_push: true,

    // Seguridad
    two_factor: false,
    session_timeout: 30,
    max_login_attempts: 5,

    // Apariencia
    tema: 'light',
    idioma: 'es',

    // Características
    permitir_registro: true,
    validacion_email: true,
    modo_mantenimiento: false,

    // Base de datos
    backup_automatico: true,
    frecuencia_backup: 'daily',

    // Correo
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_usuario: 'tu_email@gmail.com'
  });

  const [cambios, setCambios] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('general');

  const handleChange = (campo, valor) => {
    setSettings({
      ...settings,
      [campo]: valor
    });
    setCambios(true);
  };

  const handleGuardar = () => {
    console.log('Guardando configuración:', settings);
    alert('✅ Configuración guardada correctamente');
    setCambios(false);
  };

  const handleCancelar = () => {
    window.location.reload();
  };

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'general':
        return (
          <div className="config-section">
            <h3>⚙️ Configuración General</h3>
            <div className="config-row">
              <div className="config-group">
                <label>Nombre de la Plataforma</label>
                <input
                  type="text"
                  value={settings.nombre_plataforma}
                  onChange={(e) => handleChange('nombre_plataforma', e.target.value)}
                  className="config-input"
                />
              </div>
              <div className="config-group">
                <label>Email de Contacto</label>
                <input
                  type="email"
                  value={settings.email_contacto}
                  onChange={(e) => handleChange('email_contacto', e.target.value)}
                  className="config-input"
                />
              </div>
            </div>
            <div className="config-group">
              <label>Teléfono de Contacto</label>
              <input
                type="tel"
                value={settings.telefono_contacto}
                onChange={(e) => handleChange('telefono_contacto', e.target.value)}
                className="config-input"
                style={{ maxWidth: '300px' }}
              />
            </div>
            <div className="config-group">
              <label>Descripción</label>
              <textarea
                value={settings.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className="config-input"
                rows="4"
              />
            </div>
          </div>
        );

      case 'notificaciones':
        return (
          <div className="config-section">
            <h3>🔔 Configuración de Notificaciones</h3>
            <div className="config-group">
              <label>
                <span className="toggle-label">Notificaciones por Email</span>
                <button
                  className="toggle-btn"
                  onClick={() => handleChange('notificaciones_email', !settings.notificaciones_email)}
                >
                  {settings.notificaciones_email ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </label>
            </div>
            <div className="config-group">
              <label>
                <span className="toggle-label">Notificaciones por SMS</span>
                <button
                  className="toggle-btn"
                  onClick={() => handleChange('notificaciones_sms', !settings.notificaciones_sms)}
                >
                  {settings.notificaciones_sms ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </label>
            </div>
            <div className="config-group">
              <label>
                <span className="toggle-label">Notificaciones Push</span>
                <button
                  className="toggle-btn"
                  onClick={() => handleChange('notificaciones_push', !settings.notificaciones_push)}
                >
                  {settings.notificaciones_push ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </label>
            </div>
          </div>
        );

      case 'seguridad':
        return (
          <div className="config-section">
            <h3>🔒 Configuración de Seguridad</h3>
            <div className="config-group">
              <label>
                <span className="toggle-label">Autenticación de Dos Factores</span>
                <button
                  className="toggle-btn"
                  onClick={() => handleChange('two_factor', !settings.two_factor)}
                >
                  {settings.two_factor ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </label>
            </div>
            <div className="config-row">
              <div className="config-group">
                <label>Tiempo de Sesión (minutos)</label>
                <input
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
                  className="config-input"
                  min="5"
                  max="480"
                />
              </div>
              <div className="config-group">
                <label>Máximo de Intentos de Login</label>
                <input
                  type="number"
                  value={settings.max_login_attempts}
                  onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
                  className="config-input"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>
        );

      case 'apariencia':
        return (
          <div className="config-section">
            <h3>🎨 Apariencia</h3>
            <div className="config-row">
              <div className="config-group">
                <label>Tema</label>
                <select
                  value={settings.tema}
                  onChange={(e) => handleChange('tema', e.target.value)}
                  className="config-input"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
              <div className="config-group">
                <label>Idioma</label>
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

      case 'caracteristicas':
        return (
          <div className="config-section">
            <h3>✨ Características</h3>
            <div className="config-group">
              <label>
                <span className="toggle-label">Permitir Registro de Nuevos Usuarios</span>
                <button
                  className="toggle-btn"
                  onClick={() => handleChange('permitir_registro', !settings.permitir_registro)}
                >
                  {settings.permitir_registro ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </label>
            </div>
            <div className="config-group">
              <label>
                <span className="toggle-label">Validación de Email Requerida</span>
                <button
                  className="toggle-btn"
                  onClick={() => handleChange('validacion_email', !settings.validacion_email)}
                >
                  {settings.validacion_email ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </label>
            </div>
            <div className="config-group">
              <label>
                <span className="toggle-label">Modo de Mantenimiento</span>
                <button
                  className="toggle-btn"
                  onClick={() => handleChange('modo_mantenimiento', !settings.modo_mantenimiento)}
                >
                  {settings.modo_mantenimiento ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </label>
            </div>
          </div>
        );

      case 'basedatos':
        return (
          <div className="config-section">
            <h3>💾 Base de Datos</h3>
            <div className="config-group">
              <label>
                <span className="toggle-label">Backup Automático</span>
                <button
                  className="toggle-btn"
                  onClick={() => handleChange('backup_automatico', !settings.backup_automatico)}
                >
                  {settings.backup_automatico ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </label>
            </div>
            <div className="config-group">
              <label>Frecuencia de Backup</label>
              <select
                value={settings.frecuencia_backup}
                onChange={(e) => handleChange('frecuencia_backup', e.target.value)}
                className="config-input"
              >
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensualmente</option>
              </select>
            </div>
            <div className="config-group">
              <button className="btn-secondary" style={{ marginTop: '20px' }}>
                <FaDatabase /> Hacer Backup Ahora
              </button>
            </div>
          </div>
        );

      case 'correo':
        return (
          <div className="config-section">
            <h3>📧 Configuración de Correo</h3>
            <div className="config-row-3">
              <div className="config-group">
                <label>Host SMTP</label>
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  className="config-input"
                />
              </div>
              <div className="config-group">
                <label>Puerto SMTP</label>
                <input
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                  className="config-input"
                />
              </div>
              <div className="config-group">
                <label>Usuario SMTP</label>
                <input
                  type="email"
                  value={settings.smtp_usuario}
                  onChange={(e) => handleChange('smtp_usuario', e.target.value)}
                  className="config-input"
                />
              </div>
            </div>
            <div className="config-group">
              <button className="btn-secondary" style={{ marginTop: '20px' }}>
                <FaEnvelope /> Probar Conexión
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className="configuracion-container">
      <div className="configuracion-header">
        <h1>⚙️ Configuración del Sistema</h1>
      </div>

      <div className="configuracion-content">
        {/* SIDEBAR */}
        <aside className="config-sidebar">
          <nav className="config-menu">
            <button
              className={`config-menu-item ${seccionActiva === 'general' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('general')}
            >
              <FaCog /> General
            </button>
            <button
              className={`config-menu-item ${seccionActiva === 'notificaciones' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('notificaciones')}
            >
              <FaBell /> Notificaciones
            </button>
            <button
              className={`config-menu-item ${seccionActiva === 'seguridad' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('seguridad')}
            >
              <FaShieldAlt /> Seguridad
            </button>
            <button
              className={`config-menu-item ${seccionActiva === 'apariencia' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('apariencia')}
            >
              <FaPalette /> Apariencia
            </button>
            <button
              className={`config-menu-item ${seccionActiva === 'caracteristicas' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('caracteristicas')}
            >
              <FaKey /> Características
            </button>
            <button
              className={`config-menu-item ${seccionActiva === 'basedatos' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('basedatos')}
            >
              <FaDatabase /> Base de Datos
            </button>
            <button
              className={`config-menu-item ${seccionActiva === 'correo' ? 'active' : ''}`}
              onClick={() => setSeccionActiva('correo')}
            >
              <FaEnvelope /> Correo
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <div className="config-main">
          {renderSeccion()}

          {/* SAVE BUTTONS */}
          <div className="config-actions">
            <button
              className="btn-primary"
              onClick={handleGuardar}
              disabled={!cambios}
            >
              <FaSave /> Guardar Cambios
            </button>
            <button
              className="btn-secondary"
              onClick={handleCancelar}
            >
              <FaUndo /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
};

export default Configuracion;
