const pool = require('../../config/db');

const Resena = {
    // 1. CREAR RESEÑA
    create: async (data) => {
        const query = `
            INSERT INTO resenas_tours (id_tour, id_turista, calificacion, comentario)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [data.id_tour, data.id_turista, data.calificacion, data.comentario];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 1b. CREAR RESEÑA DE GUÍA
    createGuia: async (data) => {
        const query = `
            INSERT INTO resenas_guias (id_guia, id_turista, calificacion, comentario)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [data.id_guia, data.id_turista, data.calificacion, data.comentario];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 1c. CREAR RESEÑA DE HOTEL
    createHotel: async (data) => {
        const query = `
            INSERT INTO resenas_hoteles (id_hotel, id_turista, calificacion, comentario)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [data.id_hotel, data.id_turista, data.calificacion, data.comentario];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 2. OBTENER RESEÑAS DE UN TOUR
    findByTour: async (id_tour) => {
        const query = `
            SELECT r.*, u.primer_nombre, u.apellido_paterno
            FROM resenas_tours r
            JOIN usuarios u ON r.id_turista = u.id_usuario
            WHERE r.id_tour = $1
            ORDER BY r.fecha_creacion DESC
        `;
        const { rows } = await pool.query(query, [id_tour]);
        return rows;
    },

    // 2b. OBTENER RESEÑAS DE UN GUÍA
    findByGuia: async (id_guia) => {
        const query = `
            SELECT r.*, u.primer_nombre, u.apellido_paterno
            FROM resenas_guias r
            JOIN usuarios u ON r.id_turista = u.id_usuario
            WHERE r.id_guia = $1
            ORDER BY r.fecha_creacion DESC
        `;
        const { rows } = await pool.query(query, [id_guia]);
        return rows;
    },

    // 2c. OBTENER RESEÑAS DE UN HOTEL
    findByHotel: async (id_hotel) => {
        const query = `
            SELECT r.*, u.primer_nombre, u.apellido_paterno
            FROM resenas_hoteles r
            JOIN usuarios u ON r.id_turista = u.id_usuario
            WHERE r.id_hotel = $1
            ORDER BY r.fecha_creacion DESC
        `;
        const { rows } = await pool.query(query, [id_hotel]);
        return rows;
    },

    // 3. OBTENER ESTADÍSTICAS DEL TOUR (Promedio y Total)
    getStatsByTour: async (id_tour) => {
        const query = `
            SELECT 
                COALESCE(AVG(calificacion), 0) as promedio,
                COUNT(id_resena) as total_resenas
            FROM resenas_tours
            WHERE id_tour = $1
        `;
        const { rows } = await pool.query(query, [id_tour]);
        return rows[0];
    },

    // 3b. OBTENER ESTADÍSTICAS DEL GUÍA
    getStatsByGuia: async (id_guia) => {
        const query = `
            SELECT 
                COALESCE(AVG(calificacion), 0) as promedio,
                COUNT(id_resena) as total_resenas
            FROM resenas_guias
            WHERE id_guia = $1
        `;
        const { rows } = await pool.query(query, [id_guia]);
        return rows[0];
    },

    // 3c. OBTENER ESTADÍSTICAS DEL HOTEL
    getStatsByHotel: async (id_hotel) => {
        const query = `
            SELECT 
                COALESCE(AVG(calificacion), 0) as promedio,
                COUNT(id_resena) as total_resenas
            FROM resenas_hoteles
            WHERE id_hotel = $1
        `;
        const { rows } = await pool.query(query, [id_hotel]);
        return rows[0];
    },

    // 4. OBTENER RESEÑAS RECIENTES COMBINADAS (tours + hoteles)
    getRecent: async (limit = 8) => {
        const query = `
            SELECT 
                rt.id_resena,
                rt.calificacion,
                rt.comentario,
                rt.fecha_creacion,
                u.primer_nombre,
                u.apellido_paterno,
                t.nombre AS destino,
                'tour' AS tipo
            FROM resenas_tours rt
            JOIN usuarios u ON rt.id_turista = u.id_usuario
            JOIN tours t ON rt.id_tour = t.id_tour
            WHERE rt.comentario IS NOT NULL AND rt.comentario != ''
            
            UNION ALL
            
            SELECT 
                rh.id_resena,
                rh.calificacion,
                rh.comentario,
                rh.fecha_creacion,
                u.primer_nombre,
                u.apellido_paterno,
                h.nombre AS destino,
                'hotel' AS tipo
            FROM resenas_hoteles rh
            JOIN usuarios u ON rh.id_turista = u.id_usuario
            JOIN hoteles h ON rh.id_hotel = h.id_hotel
            WHERE rh.comentario IS NOT NULL AND rh.comentario != ''
            
            ORDER BY fecha_creacion DESC
            LIMIT $1
        `;
        const { rows } = await pool.query(query, [limit]);
        return rows;
    }
};

module.exports = Resena;
