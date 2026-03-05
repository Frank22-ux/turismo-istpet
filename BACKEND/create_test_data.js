const pool = require('./src/config/db');

async function createTestTour() {
    try {
        const { rows: cats } = await pool.query('SELECT id_categoria FROM categorias LIMIT 1');
        const { rows: hotels } = await pool.query('SELECT id_hotel FROM hoteles LIMIT 1');

        if (cats.length === 0 || hotels.length === 0) {
            console.error("Faltan categorías u hoteles");
            return;
        }

        const id_cat = cats[0].id_categoria;
        const id_hotel = hotels[0].id_hotel;

        // 1. Crear un tour sin guía
        const tourQuery = `
            INSERT INTO tours (nombre, descripcion, precio, ciudad_destino, duracion, maximo_personas, id_guia_asignado, id_categoria, id_hotel_base)
            VALUES ('Tour Volcan Chimborazo', 'Aventura en el volcan mas alto', 150.00, 'Riobamba', '8 horas', 15, NULL, $1, $2)
            RETURNING id_tour;
        `;
        const { rows: tourRows } = await pool.query(tourQuery, [id_cat, id_hotel]);
        const tourId = tourRows[0].id_tour;
        console.log(`Tour creado con ID: ${tourId}`);

        // 2. Crear una reserva para ese tour (turista 5)
        const reservaQuery = `
            INSERT INTO reservas (id_turista, id_tour, fecha_actividad, cantidad_personas, total_pagado, estado_reserva)
            VALUES (5, $1, NOW() + INTERVAL '3 days', 2, 300.00, 'Pendiente')
            RETURNING id_reserva;
        `;
        const { rows: reservaRows } = await pool.query(reservaQuery, [tourId]);
        console.log(`Reserva creada con ID: ${reservaRows[0].id_reserva}`);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

createTestTour();
