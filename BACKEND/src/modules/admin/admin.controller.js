const pool = require('../../config/db');

const AdminController = {
    getStats: async (req, res) => {
        try {
            const [tours, hoteles, guias, usuarios, reservas, topTours, trend, usersDist, revenueByCategory, destDist] = await Promise.all([
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
                `),
                // 1. Distribución de usuarios
                pool.query(`
                    SELECT 
                        CASE WHEN id_rol = 2 THEN 'Guías' ELSE 'Turistas' END as name,
                        COUNT(*)::int as value
                    FROM usuarios
                    WHERE id_rol IN (2, 3)
                    GROUP BY id_rol
                `),
                // 2. Ingresos por Categoría (Reemplaza Estado de Reservas)
                pool.query(`
                    SELECT 
                        t.categoria as name,
                        SUM(r.total_pagado)::float as value
                    FROM reservas r
                    JOIN tours t ON r.id_tour = t.id_tour
                    WHERE t.categoria IS NOT NULL
                    GROUP BY t.categoria
                    ORDER BY value DESC
                `),
                // 3. Destinos más populares
                pool.query(`
                    SELECT 
                        t.ciudad_destino as name,
                        COUNT(r.id_reserva)::int as value
                    FROM reservas r
                    JOIN tours t ON r.id_tour = t.id_tour
                    WHERE t.ciudad_destino IS NOT NULL
                    GROUP BY t.ciudad_destino
                    ORDER BY value DESC
                    LIMIT 5
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
                usersDistribution: usersDist.rows,
                revenueByCategory: revenueByCategory.rows,
                destinations: destDist.rows,
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

    // Obtener un cliente por ID
    getClienteById: async (req, res) => {
        try {
            const { id } = req.params;
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
                    u.activo
                FROM usuarios u
                WHERE u.id_usuario = $1 AND u.id_rol = 3
            `;
            const { rows } = await pool.query(query, [id]);
            if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
            res.json(rows[0]);
        } catch (error) {
            console.error('Error al obtener cliente:', error);
            res.status(500).json({ message: 'Error al obtener cliente' });
        }
    },

    // Actualizar datos de un cliente
    updateCliente: async (req, res) => {
        try {
            const { id } = req.params;
            const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, codigo_pais, numero_celular, activo } = req.body;
            const query = `
                UPDATE usuarios
                SET 
                    primer_nombre = $1,
                    segundo_nombre = $2,
                    apellido_paterno = $3,
                    apellido_materno = $4,
                    codigo_pais = $5,
                    numero_celular = $6,
                    activo = $7
                WHERE id_usuario = $8 AND id_rol = 3
                RETURNING *
            `;
            const { rows } = await pool.query(query, [primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, codigo_pais, numero_celular, activo, id]);
            if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
            res.json({ message: 'Cliente actualizado exitosamente', cliente: rows[0] });
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            res.status(500).json({ message: 'Error al actualizar cliente' });
        }
    },

    // Eliminar un cliente
    deleteCliente: async (req, res) => {
        try {
            const { id } = req.params;
            const { rows } = await pool.query('DELETE FROM usuarios WHERE id_usuario = $1 AND id_rol = 3 RETURNING id_usuario', [id]);
            if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
            res.json({ message: 'Cliente eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            res.status(500).json({ message: 'Error al eliminar cliente' });
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
    },

    // ================================
    // CONFIGURACIÓN DEL SISTEMA
    // ================================
    getConfig: async (req, res) => {
        try {
            // Read from a simple JSON config table if it exists, or return defaults
            const { rows } = await pool.query(`
                SELECT clave, valor FROM configuracion ORDER BY clave
            `).catch(() => ({ rows: [] }));

            const config = {};
            rows.forEach(r => {
                try { config[r.clave] = JSON.parse(r.valor); }
                catch { config[r.clave] = r.valor; }
            });

            // Merge with defaults
            const defaults = {
                nombre_plataforma: 'ECORUT Travels',
                descripcion: 'Plataforma de reserva de tours y experiencias en Ecuador',
                telefono_contacto: '+593 2 1234567',
                permitir_registro: true,
                modo_mantenimiento: false,
                session_timeout: 30,
                max_login_attempts: 5,
                idioma: 'es'
            };

            res.json({ ...defaults, ...config });
        } catch (error) {
            console.error('Error al obtener configuración:', error);
            res.status(500).json({ message: 'Error al obtener configuración' });
        }
    },

    saveConfig: async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Ensure table exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS configuracion (
                    clave VARCHAR(100) PRIMARY KEY,
                    valor TEXT NOT NULL,
                    actualizado_en TIMESTAMPTZ DEFAULT NOW()
                )
            `);

            const entries = Object.entries(req.body);
            for (const [clave, valor] of entries) {
                await client.query(`
                    INSERT INTO configuracion (clave, valor, actualizado_en)
                    VALUES ($1, $2, NOW())
                    ON CONFLICT (clave) DO UPDATE 
                    SET valor = $2, actualizado_en = NOW()
                `, [clave, JSON.stringify(valor)]);
            }

            await client.query('COMMIT');
            res.json({ message: 'Configuración guardada correctamente' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al guardar configuración:', error);
            res.status(500).json({ message: 'Error al guardar configuración' });
        } finally {
            client.release();
        }
    },

    // ================================
    // BACKUP DE BASE DE DATOS
    // ================================
    downloadBackup: async (req, res) => {
        try {
            const [usuarios, tours, hoteles, reservas, guias, habitaciones] = await Promise.all([
                pool.query('SELECT * FROM usuarios ORDER BY id_usuario'),
                pool.query('SELECT * FROM tours ORDER BY id_tour'),
                pool.query('SELECT * FROM hoteles ORDER BY id_hotel'),
                pool.query('SELECT * FROM reservas ORDER BY id_reserva'),
                pool.query('SELECT * FROM guias_detalles ORDER BY id_usuario'),
                pool.query('SELECT * FROM hotel_habitaciones ORDER BY id_hotel').catch(() => ({ rows: [] }))
            ]);

            const backup = {
                metadata: {
                    version: '1.0',
                    plataforma: 'ECORUT Travels',
                    fecha: new Date().toISOString(),
                    tablas: ['usuarios', 'tours', 'hoteles', 'reservas', 'guias_detalles', 'hotel_habitaciones']
                },
                data: {
                    usuarios: usuarios.rows,
                    tours: tours.rows,
                    hoteles: hoteles.rows,
                    reservas: reservas.rows,
                    guias_detalles: guias.rows,
                    hotel_habitaciones: habitaciones.rows
                }
            };

            const fecha = new Date().toISOString().slice(0, 10);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="backup-ecorut-${fecha}.json"`);
            res.send(JSON.stringify(backup, null, 2));
        } catch (error) {
            console.error('Error al generar backup:', error);
            res.status(500).json({ message: 'Error al generar el backup' });
        }
    }
};

module.exports = AdminController;

