const pool = require('../../config/db');

const Reserva = {
    // 1. CREAR RESERVA
    create: async (data) => {
        const query = `
            INSERT INTO reservas 
            (id_turista, id_tour, fecha_actividad, cantidad_personas, total_pagado, estado_reserva) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;

        const values = [
            data.id_turista,
            data.id_tour || null,
            data.fecha_actividad,
            data.cantidad_personas || 1,
            data.total_pagado || null,
            data.estado_reserva || 'Pendiente'
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 2. OBTENER RESERVAS DE UN USUARIO
    findByUser: async (id_turista) => {
        const query = `
            SELECT r.*, t.nombre as tour_nombre, h.nombre as hotel_nombre
            FROM reservas r
            LEFT JOIN tours t ON r.id_tour = t.id_tour
            LEFT JOIN hoteles h ON t.id_hotel_base = h.id_hotel
            WHERE r.id_turista = $1
            ORDER BY r.fecha_reserva DESC
        `;
        const { rows } = await pool.query(query, [id_turista]);
        return rows;
    },

    // 3. OBTENER TODAS (PARA ADMIN)
    findAll: async () => {
        const query = `
            SELECT r.*, u.primer_nombre, u.apellido_paterno, t.nombre as tour_nombre
            FROM reservas r
            JOIN usuarios u ON r.id_turista = u.id_usuario
            LEFT JOIN tours t ON r.id_tour = t.id_tour
            ORDER BY r.id_reserva DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // 4. ACTUALIZAR ESTADO
    updateStatus: async (id, estado) => {
        const query = 'UPDATE reservas SET estado_reserva = $1 WHERE id_reserva = $2 RETURNING *';
        const { rows } = await pool.query(query, [estado, id]);
        return rows[0];
    },

    // 5. OBTENER RESERVAS PARA UN GUÍA ESPECÍFICO (Tours que ya tiene asignados)
    findByGuia: async (id_guia) => {
        const query = `
            SELECT r.*, t.nombre as tour_nombre, u.primer_nombre as turista_nombre, u.apellido_paterno as turista_apellido,
                   p.estado_pago
            FROM reservas r
            JOIN tours t ON r.id_tour = t.id_tour
            JOIN usuarios u ON r.id_turista = u.id_usuario
            LEFT JOIN pagos p ON r.id_reserva = p.id_reserva
            WHERE t.id_guia_asignado = $1
            ORDER BY r.fecha_actividad ASC
        `;
        const { rows } = await pool.query(query, [id_guia]);
        return rows;
    },

    // 6. OBTENER RESERVAS DE TOURS QUE NO TIENEN GUÍA ASIGNADO
    findAvailableForGuides: async () => {
        const query = `
            SELECT r.*, t.nombre as tour_nombre, u.primer_nombre as turista_nombre, u.apellido_paterno as turista_apellido,
                   p.estado_pago
            FROM reservas r
            JOIN tours t ON r.id_tour = t.id_tour
            JOIN usuarios u ON r.id_turista = u.id_usuario
            LEFT JOIN pagos p ON r.id_reserva = p.id_reserva
            WHERE t.id_guia_asignado IS NULL
            ORDER BY r.fecha_actividad ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
};

module.exports = Reserva;
