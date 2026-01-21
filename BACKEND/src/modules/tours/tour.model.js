const pool = require('../../config/db');

const Tour = {
    // --- 1. CREAR TOUR ---
    create: async (data) => {
        const query = `
            INSERT INTO tours 
            (nombre, ciudad_destino, descripcion, precio, duracion, 
             fecha_inicio, fecha_fin, latitud, longitud, 
             imagen_portada, galeria, id_guia, id_hotel_base) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING *
        `;
        
        const values = [
            data.nombre,
            data.ciudad_destino,
            data.descripcion,
            data.precio,
            data.duracion,
            data.fecha_inicio || null,
            data.fecha_fin || null,
            data.latitud,
            data.longitud,
            data.imagen_portada,
            data.galeria && data.galeria.length > 0 ? data.galeria : null,
            data.id_guia || null,
            data.id_hotel_base || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // --- 2. OBTENER TODOS (Con Guía y Hotel) ---
    findAll: async () => {
        const query = `
            SELECT t.*, 
                   u.primer_nombre as nombre_guia, 
                   u.apellido_paterno as apellido_guia,
                   h.nombre as nombre_hotel
            FROM tours t
            LEFT JOIN usuarios u ON t.id_guia = u.id_usuario
            LEFT JOIN hoteles h ON t.id_hotel_base = h.id_hotel
            ORDER BY t.id_tour DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // --- 3. BUSCAR POR ID (Para DetalleTour con información completa) ---
    findById: async (id) => {
        const query = `
            SELECT t.*, 
                   u.primer_nombre as nombre_guia, 
                   u.apellido_paterno as apellido_guia,
                   h.nombre as nombre_hotel
            FROM tours t
            LEFT JOIN usuarios u ON t.id_guia = u.id_usuario
            LEFT JOIN hoteles h ON t.id_hotel_base = h.id_hotel
            WHERE t.id_tour = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // --- 4. ACTUALIZAR TOUR ---
    update: async (id, data) => {
        const query = `
            UPDATE tours 
            SET nombre = $1, 
                ciudad_destino = $2, 
                descripcion = $3, 
                precio = $4, 
                duracion = $5, 
                fecha_inicio = $6, 
                fecha_fin = $7, 
                latitud = $8, 
                longitud = $9,
                imagen_portada = COALESCE($10, imagen_portada),
                galeria = COALESCE($11, galeria),
                id_guia = $12, 
                id_hotel_base = $13
            WHERE id_tour = $14
            RETURNING *
        `;
        
        const values = [
            data.nombre,
            data.ciudad_destino,
            data.descripcion,
            data.precio,
            data.duracion,
            data.fecha_inicio || null,
            data.fecha_fin || null,
            data.latitud,
            data.longitud,
            data.imagen_portada, 
            data.galeria,        
            data.id_guia || null,
            data.id_hotel_base || null,
            id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // --- 5. ELIMINAR TOUR ---
    delete: async (id) => {
        const query = 'DELETE FROM tours WHERE id_tour = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};

module.exports = Tour;