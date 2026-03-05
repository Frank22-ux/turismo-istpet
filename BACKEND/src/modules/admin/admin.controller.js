const pool = require('../../config/db');

const AdminController = {
    getStats: async (req, res) => {
        try {
            const [tours, hoteles, guias, usuarios, reservas, topTours, trend] = await Promise.all([
                pool.query('SELECT COUNT(*) FROM tours'),
                pool.query('SELECT COUNT(*) FROM hoteles'),
                pool.query('SELECT COUNT(*) FROM guias_detalles'),
                pool.query('SELECT COUNT(*) FROM usuarios WHERE id_rol = 3'),
                pool.query('SELECT COUNT(*), SUM(total_pagado) FROM reservas'),
                pool.query(`
                    SELECT t.nombre, COUNT(r.id_reserva)::int as reservas, SUM(r.total_pagado)::float as ingresos
                    FROM reservas r
                    JOIN tours t ON r.id_tour = t.id_tour
                    GROUP BY t.id_tour, t.nombre
                    ORDER BY reservas DESC
                    LIMIT 5
                `),
                pool.query(`
                    SELECT 
                        TO_CHAR(fecha_actividad, 'Mon') as mes,
                        COUNT(id_reserva)::int as reservas,
                        SUM(cantidad_personas)::int as visitantes
                    FROM reservas
                    WHERE fecha_actividad >= NOW() - INTERVAL '6 months'
                    GROUP BY mes, DATE_TRUNC('month', fecha_actividad)
                    ORDER BY DATE_TRUNC('month', fecha_actividad)
                `)
            ]);

            res.json({
                tours: parseInt(tours.rows[0].count),
                hoteles: parseInt(hoteles.rows[0].count),
                guias: parseInt(guias.rows[0].count),
                turistas: parseInt(usuarios.rows[0].count),
                reservas: parseInt(reservas.rows[0].count),
                ingresos: parseFloat(reservas.rows[0].sum || 0),
                topTours: topTours.rows,
                trend: trend.rows,
                fechaActualizacion: new Date()
            });
        } catch (error) {
            console.error("Error al obtener estadísticas admin:", error);
            res.status(500).json({ message: 'Error al obtener estadísticas' });
        }
    },

    getRecentReservations: async (req, res) => {
        try {
            const query = `
                SELECT r.id_reserva, u.primer_nombre, u.apellido_paterno, t.nombre as tour, r.fecha_reserva, r.total_pagado, r.estado_reserva as estado
                FROM reservas r
                JOIN usuarios u ON r.id_turista = u.id_usuario
                LEFT JOIN tours t ON r.id_tour = t.id_tour
                ORDER BY r.fecha_reserva DESC
                LIMIT 10
            `;
            const { rows } = await pool.query(query);
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener reservas recientes:", error);
            res.status(500).json({ message: 'Error al obtener reservas' });
        }
    },

    // Listado de clientes (Turistas) con métricas
    getClientes: async (req, res) => {
        try {
            const query = `
                SELECT 
                    u.id_usuario,
                    u.primer_nombre,
                    u.segundo_nombre,
                    u.apellido_paterno,
                    u.apellido_materno,
                    u.correo,
                    u.codigo_pais,
                    u.numero_celular,
                    u.fecha_registro,
                    u.activo,
                    COALESCE(r.reservas_count, 0) as reservas,
                    COALESCE(r.gasto_total, 0) as gasto_total
                FROM usuarios u
                LEFT JOIN (
                    SELECT id_turista, COUNT(*) as reservas_count, COALESCE(SUM(total_pagado), 0) as gasto_total
                    FROM reservas
                    GROUP BY id_turista
                ) r ON r.id_turista = u.id_usuario
                WHERE u.id_rol = 3
                ORDER BY u.id_usuario DESC
            `;
            const { rows } = await pool.query(query);
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            res.status(500).json({ message: 'Error al obtener clientes' });
        }
    },

    // Obtener todas las reservas para gestión administrativa
    getReservations: async (req, res) => {
        try {
            const query = `
                SELECT 
                    r.id_reserva as id,
                    CONCAT(u.primer_nombre, ' ', u.apellido_paterno) as turista,
                    COALESCE(t.nombre, 'Sin tour asignado') as tour,
                    r.fecha_actividad as fecha,
                    r.cantidad_personas as pax,
                    CAST(r.total_pagado AS FLOAT) as total,
                    r.estado_reserva as estado_pago
                FROM reservas r
                JOIN usuarios u ON r.id_turista = u.id_usuario
                LEFT JOIN tours t ON r.id_tour = t.id_tour
                ORDER BY r.id_reserva DESC
            `;
            const { rows } = await pool.query(query);
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener todas las reservas:", error);
            res.status(500).json({ message: 'Error al obtener reservas' });
        }
    }
};

module.exports = AdminController;
