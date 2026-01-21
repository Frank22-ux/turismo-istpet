// src/tours/tour.model.js
const pool = require('../../config/database'); 

const Tour = {
    // 1. CREAR TOUR
    create: async (data) => {
        const galeriaFormateada = data.galeria && data.galeria.length > 0 ? data.galeria : null;

        const query = `
            INSERT INTO tours 
            (nombre, ciudad_destino, descripcion, precio, duracion, 
             fecha_inicio, fecha_fin, latitud, longitud, 
             imagen_portada, id_guia, id_hotel_base, galeria)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        
        const values = [
            data.nombre, 
            data.ciudad_destino, 
            data.descripcion || '', 
            data.precio,
            data.duracion, 
            data.fecha_inicio || null, 
            data.fecha_fin || null,
            data.latitud || 0, 
            data.longitud || 0, 
            data.imagen_portada,
            data.id_guia || null, 
            data.id_hotel_base || null, 
            galeriaFormateada
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },
    
    // 2. OBTENER TODOS LOS TOURS
    findAll: async () => {
        const { rows } = await pool.query('SELECT * FROM tours ORDER BY id_tour DESC');
        return rows;
    },

    // 3. OBTENER UN TOUR POR ID
    findById: async (id) => {
        const query = 'SELECT * FROM tours WHERE id_tour = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // 4. ACTUALIZAR TOUR
    update: async (id, data) => {
        // Aseguramos que la galería sea un array válido o null para COALESCE
        const galeriaFormateada = data.galeria && data.galeria.length > 0 ? data.galeria : null;

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
                id_guia = $11, 
                id_hotel_base = $12, 
                galeria = COALESCE($13, galeria)
            WHERE id_tour = $14
            RETURNING *
        `;
        
        const values = [
            data.nombre,            // $1
            data.ciudad_destino,    // $2
            data.descripcion,       // $3
            data.precio,            // $4
            data.duracion,          // $5
            data.fecha_inicio,      // $6
            data.fecha_fin,         // $7
            data.latitud,           // $8
            data.longitud,          // $9
            data.imagen_portada,    // $10 (Si es null, COALESCE mantiene la actual)
            data.id_guia,           // $11
            data.id_hotel_base,     // $12
            galeriaFormateada,      // $13 (Si es null, COALESCE mantiene la actual)
            id                      // $14
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 5. ELIMINAR TOUR
    delete: async (id) => {
        const query = 'DELETE FROM tours WHERE id_tour = $1';
        await pool.query(query, [id]);
        return { message: 'Tour eliminado' };
    }
};

module.exports = Tour;