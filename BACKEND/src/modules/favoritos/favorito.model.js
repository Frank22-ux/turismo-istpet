const pool = require('../../config/db');

const Favorito = {
    // 1. AGREGAR A FAVORITOS
    add: async (id_usuario, id_tour, id_hotel) => {
        const query = `
            INSERT INTO favoritos (id_usuario, id_tour, id_hotel)
            VALUES ($1, $2, $3)
            ON CONFLICT (id_usuario, id_tour) DO NOTHING
            ON CONFLICT (id_usuario, id_hotel) DO NOTHING
            RETURNING *
        `;
        // Nota: El SQL de arriba tiene un pequeño bug de lógica con los ON CONFLICT si se pasan ambos IDs a la vez, 
        // pero en el uso normal se pasará uno u otro.

        // Mejoramos la query para manejar casos específicos
        let finalQuery = '';
        let values = [id_usuario];

        if (id_tour) {
            finalQuery = `
                INSERT INTO favoritos (id_usuario, id_tour)
                VALUES ($1, $2)
                ON CONFLICT (id_usuario, id_tour) DO NOTHING
                RETURNING *
            `;
            values.push(id_tour);
        } else if (id_hotel) {
            finalQuery = `
                INSERT INTO favoritos (id_usuario, id_hotel)
                VALUES ($1, $2)
                ON CONFLICT (id_usuario, id_hotel) DO NOTHING
                RETURNING *
            `;
            values.push(id_hotel);
        }

        const { rows } = await pool.query(finalQuery, values);
        return rows[0];
    },

    // 2. ELIMINAR DE FAVORITOS
    remove: async (id_usuario, id_tour, id_hotel) => {
        let query = '';
        let values = [id_usuario];

        if (id_tour) {
            query = 'DELETE FROM favoritos WHERE id_usuario = $1 AND id_tour = $2 RETURNING *';
            values.push(id_tour);
        } else if (id_hotel) {
            query = 'DELETE FROM favoritos WHERE id_usuario = $1 AND id_hotel = $2 RETURNING *';
            values.push(id_hotel);
        }

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 3. OBTENER FAVORITOS DEL USUARIO
    findByUser: async (id_usuario) => {
        const query = `
            SELECT f.*, 
                   t.nombre as tour_nombre, t.precio as tour_precio, t.imagen_portada as tour_img, t.ciudad_destino, t.categoria,
                   h.nombre as hotel_nombre, h.precio_noche as hotel_precio, h.fotos_galeria as hotel_fotos, h.ciudad as hotel_ciudad
            FROM favoritos f
            LEFT JOIN tours t ON f.id_tour = t.id_tour
            LEFT JOIN hoteles h ON f.id_hotel = h.id_hotel
            WHERE f.id_usuario = $1
            ORDER BY f.fecha_agregado DESC
        `;
        const { rows } = await pool.query(query, [id_usuario]);
        return rows;
    }
};

module.exports = Favorito;
