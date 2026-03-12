import { useState, useEffect } from 'react';
import api from '../../../core/api';
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaDollarSign,
  FaMapMarkedAlt,
  FaEllipsisV
} from 'react-icons/fa';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import AdminLayout from '../layouts/AdminLayout';
import './AdminDashboard.css';

const COLORS = ['#1f7a8c', '#022b3a', '#e1e5f2', '#bfdbf7', '#64748b'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tours: 0,
    hoteles: 0,
    guias: 0,
    turistas: 0,
    reservas: 0,
    ingresos: 0,
    topTours: [],
    trend: [],
    usersDistribution: [],
    revenueByCategory: [],
    destinations: []
  });

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Real-time polling every 10 seconds
    const intervalId = setInterval(fetchStats, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const topTours = stats.topTours || [];
  const visitorsByMonth = stats.trend || [];
  const usersDist = stats.usersDistribution || [];
  const revenueCat = stats.revenueByCategory || [];
  const destDist = stats.destinations || [];

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ stats, topTours, visitorsByMonth, usersDist, statusDist, destDist }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "reporte_analytics.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metrica,Valor\n";
    csvContent += `Tours,${stats.tours}\n`;
    csvContent += `Hoteles,${stats.hoteles}\n`;
    csvContent += `Guias,${stats.guias}\n`;
    csvContent += `Turistas,${stats.turistas}\n`;
    csvContent += `Reservas,${stats.reservas}\n`;
    csvContent += `Ingresos,${stats.ingresos}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_analytics.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p className="label">{`${label || payload[0].name}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: 0 }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const content = (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Analytics & Reportes (Tiempo Real)</h1>
        <div className="analytics-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Año</option>
          </select>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <span className="stat-label">Tours Activos</span>
              <h2 className="stat-value">{loading ? '...' : stats.tours}</h2>
            </div>
            <div className="stat-icon info-icon">
              <FaMapMarkedAlt />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <span className="stat-label">Reservas Totales</span>
              <h2 className="stat-value">{loading ? '...' : stats.reservas}</h2>
            </div>
            <div className="stat-icon success-icon">
              <FaChartLine />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <span className="stat-label">Ingresos Totales</span>
              <h2 className="stat-value">${loading ? '...' : stats.ingresos.toLocaleString()}</h2>
            </div>
            <div className="stat-icon success-icon">
              <FaDollarSign />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <span className="stat-label">Usuarios Totales</span>
              <h2 className="stat-value">{loading ? '...' : (stats.turistas + stats.guias)}</h2>
            </div>
            <div className="stat-icon warning-icon">
              <FaUsers />
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 CHARTS GRID */}
      <div className="charts-grid">
        
        {/* CHART 1: Tendencia de Visitantes y Reservas (Área) */}
        <div className="chart-wrapper">
          <h3>📈 Evolución Mensual</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorsByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitantes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1f7a8c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1f7a8c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#022b3a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#022b3a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E5F2" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36}/>
                <Area type="monotone" dataKey="visitantes" stroke="#1f7a8c" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitantes)" name="Visitantes" />
                <Area type="monotone" dataKey="reservas" stroke="#022b3a" strokeWidth={3} fillOpacity={1} fill="url(#colorReservas)" name="Reservas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Ingresos por Categoría (Barras) */}
        <div className="chart-wrapper">
          <h3>💰 Ingresos por Categoría</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueCat} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E5F2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  content={<CustomTooltip />} 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']}
                />
                <Bar dataKey="value" name="Ingresos ($)" radius={[4, 4, 0, 0]}>
                  {revenueCat.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Distribución de Usuarios (Pastel) */}
        <div className="chart-wrapper">
          <h3>👥 Tipos de Usuario</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersDist}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {usersDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Destinos Populares (Barras Horizontales) */}
        <div className="chart-wrapper">
          <h3>📍 Destinos Populares</h3>
          <div className="chart-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destDist} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E1E5F2" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Reservas" radius={[0, 4, 4, 0]}>
                  {destDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* TOP TOURS TABLE */}
      <div className="analytics-section" style={{ marginTop: '20px' }}>
        <h2>🏆 Top Tours por Ingresos</h2>
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Tour</th>
                <th>Reservas</th>
                <th>Ingresos Generados</th>
                <th>Promedio por Reserva</th>
              </tr>
            </thead>
            <tbody>
              {topTours.map((tour, index) => (
                <tr key={index}>
                  <td><strong>{tour.nombre}</strong></td>
                  <td>{tour.reservas}</td>
                  <td className="success-text">${tour.ingresos.toLocaleString()}</td>
                  <td>${tour.reservas > 0 ? (tour.ingresos / tour.reservas).toFixed(2) : '0.00'}</td>
                </tr>
              ))}
              {topTours.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay datos suficientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPORT OPTIONS */}
      <div className="analytics-section">
        <h2>📥 Descargar Reportes</h2>
        <div className="export-buttons">
          <button className="btn-export" onClick={handleExportPDF}>
            <FaChartLine /> Exportar as PDF
          </button>
          <button className="btn-export" onClick={handleExportExcel}>
            <FaChartLine /> Exportar como Excel
          </button>
          <button className="btn-export" onClick={handleExportJSON}>
            <FaChartLine /> Exportar Datos JSON
          </button>
        </div>
      </div>
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
};

export default Analytics;
