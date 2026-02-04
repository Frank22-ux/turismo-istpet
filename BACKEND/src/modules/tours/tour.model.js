const pool = require('../../config/db');

const Tour = {
    // --- 1. CREAR TOUR ---
    create: async (data) => {
        const query = `
            INSERT INTO tours 
            (nombre, ciudad_destino, direccion, descripcion, precio, precio_nino, precio_especial, 
             duracion, fecha_inicio, fecha_fin, latitud, longitud, 
             imagen_portada, galeria, id_guia, id_hotel_base) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
            RETURNING *
        `;
        
        const values = [
            data.nombre,
            data.ciudad_destino,
            data.direccion,      // $3
            data.descripcion,
            data.precio,         // $5
            data.precio_nino,    // $6
            data.precio_especial,// $7
            data.duracion,
            data.fecha_inicio || null,
            data.fecha_fin || null,
            data.latitud,
            data.longitud,
            data.imagen_portada,
            data.galeria && data.galeria.length > 0 ? data.galeria : null,
            data.id_guia,
            data.id_hotel_base
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // --- 2. OBTENER TODOS ---
    findAll: async () => {
        const query = `
            SELECT t.*, 
                   u.primer_nombre as nombre_guia, 
                   u.apellido_paterno as apellido_guia,
                   h.nombre as nombre_hotel
            FROM tours t
            LEFT JOIN guias g ON t.id_guia = g.id_guia
            LEFT JOIN usuarios u ON g.id_usuario = u.id_usuario
            LEFT JOIN hoteles h ON t.id_hotel_base = h.id_hotel
            ORDER BY t.id_tour DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // --- 3. BUSCAR POR ID ---
    findById: async (id) => {
        const query = `
            SELECT t.*, 
                   u.primer_nombre as nombre_guia, 
                   u.apellido_paterno as apellido_guia,
                   h.nombre as nombre_hotel
            FROM tours t
            LEFT JOIN guias g ON t.id_guia = g.id_guia
            LEFT JOIN usuarios u ON g.id_usuario = u.id_usuario
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
                direccion = $3, 
                descripcion = $4, 
                precio = $5, 
                precio_nino = $6, 
                precio_especial = $7, 
                duracion = $8, 
                fecha_inicio = $9, 
                fecha_fin = $10, 
                latitud = $11, 
                longitud = $12,
                imagen_portada = COALESCE($13, imagen_portada),
                galeria = COALESCE($14, galeria),
                id_guia = $15, 
                id_hotel_base = $16
            WHERE id_tour = $17
            RETURNING *
        `;
        
        const values = [
            data.nombre,
            data.ciudad_destino,
            data.direccion,      // $3
            data.descripcion,
            data.precio,         // $5
            data.precio_nino,    // $6
            data.precio_especial,// $7
            data.duracion,
            data.fecha_inicio || null,
            data.fecha_fin || null,
            data.latitud,
            data.longitud,
            data.imagen_portada, 
            data.galeria,        
            data.id_guia,
            data.id_hotel_base,
            id                   // $17
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