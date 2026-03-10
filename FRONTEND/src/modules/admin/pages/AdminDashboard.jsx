import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import api from '../../../core/api';
import {
    FaClipboardList,
    FaDollarSign,
    FaUsers,
    FaChartLine,
    FaArrowUp,
    FaCalendarAlt,
    FaEllipsisV
} from 'react-icons/fa';
import AdminLayout from '../layouts/AdminLayout';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalReservas: 0,
        ingresoTotal: 0,
        totalGuias: 0,
        totalTuristas: 0
    });

    const [reservasRecientes, setReservasRecientes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, recentRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/recent-reservations')
            ]);
            setStats({
                totalReservas: statsRes.data.reservas ?? 0,
                ingresoTotal: statsRes.data.ingresos ?? 0,
                totalGuias: statsRes.data.guias ?? 0,
                totalTuristas: statsRes.data.turistas ?? 0
            });
            setReservasRecientes(recentRes.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const content = (
        <>
            {/* STATS CARDS */}
            <div className="stats-grid">
                <div className="stat-card primary-card">
                    <div className="stat-header">
                        <div className="stat-info">
                            <span className="stat-label">Total Reservas</span>
                            <h2 className="stat-value">{(stats.totalReservas ?? 0).toLocaleString()}</h2>
                        </div>
                        <div className="stat-icon primary-icon">
                            <FaClipboardList />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-info">
                            <span className="stat-label">Ingresos Totales</span>
                            <h2 className="stat-value">${(stats.ingresoTotal ?? 0).toLocaleString()}</h2>
                        </div>
                        <div className="stat-icon success-icon">
                            <FaDollarSign />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-info">
                            <span className="stat-label">Total Guías</span>
                            <h2 className="stat-value">{stats.totalGuias}</h2>
                        </div>
                        <div className="stat-icon info-icon">
                            <FaUsers />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-info">
                            <span className="stat-label">Total Turistas</span>
                            <h2 className="stat-value">{stats.totalTuristas}</h2>
                        </div>
                        <div className="stat-icon warning-icon">
                            <FaUsers />
                        </div>
                    </div>
                </div>
            </div>

            {/* RECENT RESERVATIONS TABLE */}
            <div className="table-card">
                <div className="card-header">
                    <h3 className="card-title">Reservas Recientes</h3>
                    <div className="header-actions">
                        <Link to="/admin/reservas" className="view-all-btn">
                            Ver todas →
                        </Link>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Turista</th>
                                <th>Tour</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservasRecientes.map((reserva) => (
                                <tr key={reserva.id_reserva}>
                                    <td className="font-medium">RES-{reserva.id_reserva}</td>
                                    <td>
                                        <div className="customer-cell">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${reserva.primer_nombre}+${reserva.apellido_paterno}&background=random`}
                                                alt={reserva.primer_nombre}
                                                className="customer-avatar"
                                            />
                                            <span>{reserva.primer_nombre} {reserva.apellido_paterno}</span>
                                        </div>
                                    </td>
                                    <td>{reserva.tour || 'N/A'}</td>
                                    <td>
                                        <span className="date-cell">
                                            <FaCalendarAlt /> {new Date(reserva.fecha_reserva).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="font-medium">${parseFloat(reserva.total_pagado ?? 0).toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${reserva.estado === 'Confirmado' ? 'badge-success' : 'badge-warning'}`}>
                                            {reserva.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-menu-btn">
                                            <FaEllipsisV />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {reservasRecientes.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No hay reservas recientes.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    return <AdminLayout>{content}</AdminLayout>;
};

export default AdminDashboard;
