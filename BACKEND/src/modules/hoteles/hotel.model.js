const pool = require('../../config/db');

const Hotel = {
    // 1. CREAR HOTEL
    create: async (data) => {
        const query = `
            INSERT INTO hoteles 
            (nombre, direccion, ciudad, latitud, longitud, estrellas, 
             habitaciones_disponibles, precio_noche, amenidades, descripcion, 
             fotos_galeria, convenio_pdf_url, estado_convenio) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING *
        `;

        const values = [
            data.nombre,
            data.direccion,
            data.ciudad,
            data.latitud || 0,
            data.longitud || 0,
            data.estrellas || 3,
            data.habitaciones_disponibles || 10,
            data.precio_noche,
            data.amenidades,
            data.descripcion,
            data.fotos_galeria,
            data.convenio_pdf_url,
            data.estado_convenio || 'Activo'
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 2. OBTENER TODOS
    findAll: async () => {
        const query = 'SELECT * FROM hoteles ORDER BY id_hotel DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    // 3. BUSCAR POR ID
    findById: async (id) => {
        const query = 'SELECT * FROM hoteles WHERE id_hotel = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // 4. ACTUALIZAR
    update: async (id, data) => {
        const query = `
            UPDATE hoteles 
            SET nombre = $1, 
                direccion = $2, 
                ciudad = $3, 
                latitud = $4, 
                longitud = $5, 
                estrellas = $6, 
                habitaciones_disponibles = $7, 
                precio_noche = $8,
                amenidades = $9,
                descripcion = $10,
                fotos_galeria = COALESCE($11, fotos_galeria),
                convenio_pdf_url = COALESCE($12, convenio_pdf_url),
                estado_convenio = $13
            WHERE id_hotel = $14
            RETURNING *
        `;

        const values = [
            data.nombre,
            data.direccion,
            data.ciudad,
            data.latitud,
            data.longitud,
            data.estrellas,
            data.habitaciones_disponibles,
            data.precio_noche,
            data.amenidades,
            data.descripcion,
            data.fotos_galeria,
            data.convenio_pdf_url,
            data.estado_convenio,
            id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 5. ELIMINAR
    delete: async (id) => {
        const query = 'DELETE FROM hoteles WHERE id_hotel = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};

module.exports = Hotel;
