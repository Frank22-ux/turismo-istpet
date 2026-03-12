const pool = require('../../config/db');

const Tour = {
    // --- 1. CREAR TOUR ---
    create: async (data) => {
        const toJson = (val) => (Array.isArray(val) || (typeof val === 'object' && val !== null)) ? JSON.stringify(val) : (val || null);

        const galeriaJson = toJson(data.galeria);
        const idiomasJson = toJson(data.idiomas);
        const incluyeJson = toJson(data.incluye);
        const puntosJson = toJson(data.puntos_interes);

        const query = `
            INSERT INTO tours 
            (nombre, ciudad_destino, descripcion, precio, duracion, 
             fecha_inicio, fecha_fin, latitud, longitud, 
             imagen_portada, galeria, id_guia_asignado, id_hotel_base,
             dificultad, maximo_personas, idiomas, incluye, puntos_interes, categoria, en_oferta, descuento) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) 
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
            (galeriaJson && galeriaJson !== '[]') ? galeriaJson : null,
            data.id_guia_asignado || null,
            data.id_hotel_base || null,
            data.dificultad || 'Moderada',
            data.maximo_personas || 10,
            (idiomasJson && idiomasJson !== '[]') ? idiomasJson : null,
            (incluyeJson && incluyeJson !== '[]') ? incluyeJson : null,
            (puntosJson && puntosJson !== '[]') ? puntosJson : null,
            data.categoria || 'Aventura',
            data.en_oferta === true || data.en_oferta === 'true' ? true : false,
            data.descuento ? parseInt(data.descuento) : 0
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // --- 2. OBTENER TODOS (Con Guía, Hotel y Ocupación) ---
    findAll: async () => {
        const query = `
            SELECT t.*, 
                   u.primer_nombre as nombre_guia, 
                   u.apellido_paterno as apellido_guia,
                   h.nombre as nombre_hotel,
                   COALESCE((SELECT SUM(cantidad_personas) FROM reservas WHERE id_tour = t.id_tour AND estado_reserva != 'Cancelada'), 0) as cupos_ocupados
            FROM tours t
            LEFT JOIN usuarios u ON t.id_guia_asignado = u.id_usuario
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
                   u.foto_url as foto_guia,
                   h.nombre as nombre_hotel,
                   COALESCE((SELECT SUM(cantidad_personas) FROM reservas WHERE id_tour = t.id_tour AND estado_reserva != 'Cancelada'), 0) as cupos_ocupados
            FROM tours t
            LEFT JOIN usuarios u ON t.id_guia_asignado = u.id_usuario
            LEFT JOIN hoteles h ON t.id_hotel_base = h.id_hotel
            WHERE t.id_tour = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // --- 4. ACTUALIZAR TOUR ---
    update: async (id, data) => {
        const toJson = (val) => (Array.isArray(val) || (typeof val === 'object' && val !== null)) ? JSON.stringify(val) : (val || null);

        const galeriaJson = toJson(data.galeria);
        const idiomasJson = toJson(data.idiomas);
        const incluyeJson = toJson(data.incluye);
        const puntosJson = toJson(data.puntos_interes);

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
                id_guia_asignado = $12, 
                id_hotel_base = $13,
                dificultad = COALESCE($14, dificultad),
                maximo_personas = COALESCE($15, maximo_personas),
                idiomas = COALESCE($16, idiomas),
                incluye = COALESCE($17, incluye),
                puntos_interes = COALESCE($18, puntos_interes),
                categoria = COALESCE($19, categoria),
                en_oferta = COALESCE($20, en_oferta),
                descuento = COALESCE($21, descuento)
            WHERE id_tour = $22
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
            (galeriaJson && galeriaJson !== '[]') ? galeriaJson : null,
            data.id_guia_asignado || null,
            data.id_hotel_base || null,
            data.dificultad || null,
            data.maximo_personas || null,
            (idiomasJson && idiomasJson !== '[]') ? idiomasJson : null,
            (incluyeJson && incluyeJson !== '[]') ? incluyeJson : null,
            (puntosJson && puntosJson !== '[]') ? puntosJson : null,
            data.categoria || null,
            data.en_oferta !== undefined ? (data.en_oferta === true || data.en_oferta === 'true') : null,
            data.descuento !== undefined && data.descuento !== null ? parseInt(data.descuento) : null,
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
    },

    // --- 6. BUSCAR TOURS POR GUÍA ---
    findByGuia: async (id_guia) => {
        const query = `
            SELECT t.*, h.nombre as nombre_hotel
            FROM tours t
            LEFT JOIN hoteles h ON t.id_hotel_base = h.id_hotel
            WHERE t.id_guia_asignado = $1
            ORDER BY t.id_tour DESC
        `;
        const { rows } = await pool.query(query, [id_guia]);
        return rows;
    },

    // --- 7. BUSCAR TOURS DISPONIBLES (Sin guía) ---
    findAvailable: async () => {
        const query = `
            SELECT t.*, h.nombre as nombre_hotel
            FROM tours t
            LEFT JOIN hoteles h ON t.id_hotel_base = h.id_hotel
            WHERE t.id_guia_asignado IS NULL
            ORDER BY t.id_tour DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // --- 8. ASIGNAR GUÍA A TOUR ---
    assignGuia: async (id_tour, id_guia) => {
        const query = `
            UPDATE tours 
            SET id_guia_asignado = $1 
            WHERE id_tour = $2 
            RETURNING *, 
                      (SELECT primer_nombre FROM usuarios WHERE id_usuario = $1) as nombre_guia,
                      (SELECT apellido_paterno FROM usuarios WHERE id_usuario = $1) as apellido_guia,
                      (SELECT foto_url FROM usuarios WHERE id_usuario = $1) as foto_guia
        `;
        const { rows } = await pool.query(query, [id_guia, id_tour]);
        return rows[0];
    },

    // --- 9. DESASIGNAR GUÍA (Unassign) ---
    unassignGuia: async (id_tour, id_guia) => {
        const query = 'UPDATE tours SET id_guia_asignado = NULL WHERE id_tour = $1 AND id_guia_asignado = $2 RETURNING *';
        const { rows } = await pool.query(query, [id_tour, id_guia]);
        return rows[0];
    }
};

module.exports = Tour;