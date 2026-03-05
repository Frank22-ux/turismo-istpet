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
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AdminLayout from '../layouts/AdminLayout';
import './AdminDashboard.css';

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
    trend: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const topTours = stats.topTours || [];
  const visitorsByMonth = stats.trend || [];

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ stats, topTours, visitorsByMonth }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "reporte_analytics.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportExcel = () => {
    // CSV simple como alternativa rápida a Excel
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
    window.print(); // Simple print to PDF function
  };

  const content = (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Analytics & Reportes</h1>
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
              <span className="stat-change positive">
                <FaArrowUp /> +2.5% vs mes anterior
              </span>
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
              <span className="stat-change positive">
                <FaArrowUp /> +8.3% vs mes anterior
              </span>
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
              <span className="stat-change positive">
                <FaArrowUp /> +15.2% vs mes anterior
              </span>
            </div>
            <div className="stat-icon success-icon">
              <FaDollarSign />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <span className="stat-label">Hoteles & Aliados</span>
              <h2 className="stat-value">{loading ? '...' : stats.hoteles}</h2>
              <span className="stat-change positive">
                <FaArrowUp /> +1.2% vs mes anterior
              </span>
            </div>
            <div className="stat-icon warning-icon">
              <FaChartPie />
            </div>
          </div>
        </div>
      </div>

      {/* TOP TOURS */}
      <div className="analytics-section">
        <h2>🏆 Tours Más Populares</h2>
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Tour</th>
                <th>Reservas</th>
                <th>Ingresos</th>
                <th>Promedio por Reserva</th>
              </tr>
            </thead>
            <tbody>
              {topTours.map((tour, index) => (
                <tr key={index}>
                  <td><strong>{tour.nombre}</strong></td>
                  <td>{tour.reservas}</td>
                  <td>${tour.ingresos.toLocaleString()}</td>
                  <td>${tour.reservas > 0 ? (tour.ingresos / tour.reservas).toFixed(2) : '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISITORS BY MONTH */}
      <div className="analytics-section">
        <h2>📈 Tendencia de Visitantes y Reservas</h2>
        <div className="chart-container" style={{ height: '400px', padding: '20px', background: 'white', borderRadius: '12px', marginTop: '20px' }}>
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
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="visitantes"
                stroke="#1f7a8c"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVisitantes)"
                name="Visitantes"
              />
              <Area
                type="monotone"
                dataKey="reservas"
                stroke="#022b3a"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorReservas)"
                name="Reservas"
              />
            </AreaChart>
          </ResponsiveContainer>
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
