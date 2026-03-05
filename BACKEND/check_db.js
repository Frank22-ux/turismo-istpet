const pool = require('./src/config/db');

async function checkDatabase() {
    try {
        const toursQuery = `
            SELECT t.id_tour, t.nombre, t.id_guia_asignado, count(r.id_reserva) as num_reservas
            FROM tours t
            LEFT JOIN reservas r ON t.id_tour = r.id_tour
            GROUP BY t.id_tour, t.nombre, t.id_guia_asignado;
        `;
        const { rows } = await pool.query(toursQuery);
        console.log("--- Tours and Reservations ---");
        console.table(rows);

        const reservasQuery = `
            SELECT r.id_reserva, r.id_tour, r.id_turista, r.estado_reserva, p.estado_pago
            FROM reservas r
            LEFT JOIN pagos p ON r.id_reserva = p.id_reserva;
        `;
        const { rows: reservas } = await pool.query(reservasQuery);
        console.log("--- All Reservations and Payments ---");
        console.table(reservas);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkDatabase();
