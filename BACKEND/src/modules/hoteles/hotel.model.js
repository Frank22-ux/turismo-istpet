const pool = require('../../config/db');

const Hotel = {
    // 1. Obtener todos los hoteles (Para la tabla principal)
    findAll: async () => {
        const query = 'SELECT * FROM hoteles ORDER BY id_hotel DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    // 2. Obtener por ID (Necesario para Detalles y cargar datos en Edición)
    findById: async (id) => {
        const query = 'SELECT * FROM hoteles WHERE id_hotel = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0]; 
    },

    // 3. Crear un nuevo hotel
    create: async (data) => {
        const query = `
            INSERT INTO hoteles 
            (nombre, direccion, ciudad, latitud, longitud, estrellas, habitaciones, estado_convenio, descripcion, foto_url, galeria, telefono) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING *
        `;
        
        const values = [
            data.nombre,
            data.direccion,
            data.ciudad || 'No especificada', 
            data.latitud || 0,
            data.longitud || 0,
            data.estrellas || 3,
            data.habitaciones || 0,
            data.estado_convenio || 'Disponible',
            data.descripcion || null,
            data.foto_url || null,
            data.galeria || null, 
            data.telefono || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 4. ACTUALIZAR hotel (NUEVO - Para que funcione EditarHotel)
    update: async (id, data) => {
        const query = `
            UPDATE hoteles 
            SET nombre = $1, 
                direccion = $2, 
                ciudad = $3, 
                latitud = $4, 
                longitud = $5, 
                estrellas = $6, 
                descripcion = $7, 
                foto_url = $8, 
                galeria = $9, 
                telefono = $10
            WHERE id_hotel = $11
            RETURNING *
        `;
        
        const values = [
            data.nombre,
            data.direccion,
            data.ciudad,
            data.latitud,
            data.longitud,
            data.estrellas,
            data.descripcion,
            data.foto_url,
            data.galeria, // Array de strings TEXT[]
            data.telefono,
            id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 5. Eliminar hotel
    delete: async (id) => {
        const query = 'DELETE FROM hoteles WHERE id_hotel = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};

module.exports = Hotel;